# Onlayn xonalar: WebSocket orqali presence ("odamlar") va xabar tarqatish. Xonalar shu jarayon xotirasida
# (uvicorn 1 worker). Server xabarni tekshiradi va "from" ni o'zi qo'yadi — boshqa odam nomidan yozib bo'lmaydi.
import json
import logging
import time

from fastapi import APIRouter, WebSocket
from sqlalchemy import text

from . import sessiya
from . import xona_qoidalari as Q
from .xona_natija import natija_ol

log = logging.getLogger("kelajagim.xonalar")

router = APIRouter()


class Xona:
    def __init__(self, juft: bool, ochilgan: float):
        self.juft = juft
        self.ochilgan = ochilgan
        self.ochilgan_ms = int(ochilgan * 1000)
        self.odamlar: dict = {}
        self.sinf_id = None  # o'qituvchi sinf uchun ochgan bo'lsa — natija saqlanadi
        self.kimlar: dict = {}  # o'yinchi kaliti → {user_id, ism} (faqat shu sinf a'zolari)
        self.tugadi = False  # oxirgi "holat" paketida o'yin tugaganmi (natija bir marta yoziladi)


class Boshqaruvchi:
    def __init__(self, soat=time.time):
        self.soat = soat
        self.xonalar: dict = {}

    def kir(self, kind, code, key, role, ws):
        """(sabab, xona, eski_ws): sabab None bo'lsa — qabul qilindi."""
        juft = role in Q.SIDES
        egasi = role in ("left", "host")
        x = self.xonalar.get((kind, code))
        eski = None
        if egasi:
            if x is None:
                if len(self.xonalar) >= Q.MAX_XONA:
                    return "xato", None, None
                x = Xona(juft, self.soat())
                self.xonalar[(kind, code)] = x
            elif x.juft != juft or key in x.odamlar:
                return "band", None, None
        else:
            ega = "left" if juft else Q.HOST
            if x is None or x.juft != juft or ega not in x.odamlar:
                return "missing", None, None
            if juft:
                if "right" in x.odamlar:
                    return "full", None, None
                if (self.soat() - x.ochilgan) * 1000 > Q.CODE_TTL_MS:
                    return "expired", None, None
            else:
                oyinchilar = [k for k in x.odamlar if k != Q.HOST]
                if key not in x.odamlar and len(oyinchilar) >= Q.MAX_ODAM - 1:
                    return "full", None, None
                eski = x.odamlar.get(key)  # o'sha bola qayta ulandi — eski ulanish yopiladi
        x.odamlar[key] = ws
        return None, x, eski

    def chiq(self, kind, code, key, ws):
        x = self.xonalar.get((kind, code))
        if x is None:
            return None
        if x.odamlar.get(key) is ws:
            del x.odamlar[key]
        if not x.odamlar:
            del self.xonalar[(kind, code)]
            return None
        return x


async def _yubor(ws, d) -> None:
    try:
        await ws.send_text(json.dumps(d))
    except Exception:
        pass  # uzilgan ulanish — o'zining finally bloki xonadan chiqaradi


async def _odamlar(x: Xona) -> None:
    d = {"t": "odamlar", "keys": sorted(x.odamlar), "at": x.ochilgan_ms}
    for ws in list(x.odamlar.values()):
        await _yubor(ws, d)


@router.websocket("/api/ws/ping")
async def ping(ws: WebSocket):
    await ws.accept()
    await ws.send_text(json.dumps({"t": "pong"}))
    await ws.close()


async def _kim(ws: WebSocket):
    """WebSocket cookie'sidagi sessiya egasi (yoki None). Baza ishlamasa ham xona ishlayveradi."""
    token = ws.cookies.get(sessiya.COOKIE)
    if not token:
        return None
    try:
        async with ws.app.state.engine.connect() as conn:
            return await sessiya.kim(conn, token)
    except Exception:
        return None


async def _sinf_egasi(ws: WebSocket, u, sinf: str):
    """O'qituvchi o'z sinfi uchun xona ochyaptimi — sinf id yoki None."""
    if u is None or not sinf.isdigit() or u["rol"] not in ("teacher", "admin") or u["parol_almashtirsin"]:
        return None
    try:
        async with ws.app.state.engine.connect() as conn:
            r = (await conn.execute(text("select oqituvchi_id from sinflar where id = :s"), {"s": int(sinf)})).first()
    except Exception:
        return None
    if r is None or (u["rol"] != "admin" and r.oqituvchi_id != u["id"]):
        return None
    return int(sinf)


async def _azomi(ws: WebSocket, sinf_id: int, user_id: int) -> bool:
    try:
        async with ws.app.state.engine.connect() as conn:
            return (await conn.execute(text("select 1 from sinf_azolari where sinf_id = :s and user_id = :u and holat = 'qabul'"),
                                       {"s": sinf_id, "u": user_id})).first() is not None
    except Exception:
        return False


async def _saqla(ws: WebSocket, kind: str, x: Xona, data: dict) -> None:
    n = natija_ol(kind, data, x.kimlar)
    if n is None:
        return
    meta, rows = n
    try:
        async with ws.app.state.engine.connect() as conn:
            await conn.execute(text("insert into xona_natijalari(sinf_id, tur, meta, oyinchilar) "
                                    "values (:s, :t, cast(:m as jsonb), cast(:o as jsonb))"),
                               {"s": x.sinf_id, "t": kind, "m": json.dumps(meta), "o": json.dumps(rows)})
            await conn.commit()
    except Exception:
        log.exception("xona natijasi saqlanmadi")


@router.websocket("/api/ws/xona/{kind}/{code}")
async def xona(ws: WebSocket, kind: str, code: str, key: str = "", role: str = "", sinf: str = ""):
    await ws.accept()
    b: Boshqaruvchi = ws.app.state.xonalar
    sabab = Q.ulanish_xatosi(kind, code, key, role)
    x = eski = None
    if sabab is None:
        sabab, x, eski = b.kir(kind, code, key, role, ws)
    if sabab is not None:
        await _yubor(ws, {"t": "rad", "sabab": sabab})
        await ws.close()
        return
    try:
        # Sinfga bog'lash (faqat natijasi bor ko'p kishilik o'yinlar) va kirgan bolani tanish
        if kind in ("tog", "poyga"):
            if key == Q.HOST and sinf:
                sid = await _sinf_egasi(ws, await _kim(ws), sinf)
                if sid is not None:
                    x.sinf_id = sid
            elif key != Q.HOST and x.sinf_id is not None:
                u = await _kim(ws)
                if u is not None and await _azomi(ws, x.sinf_id, u["id"]):
                    x.kimlar[key] = {"user_id": u["id"], "ism": u["ism"]}
        kirdi = {"t": "kirdi", "at": x.ochilgan_ms}
        if key == Q.HOST:
            kirdi["sinf"] = x.sinf_id is not None
        await _yubor(ws, kirdi)
        if eski is not None:
            try:
                await eski.close(code=4000)
            except Exception:
                pass
        await _odamlar(x)
        soniya, soni = 0, 0
        while True:
            m = await ws.receive()
            if m["type"] == "websocket.disconnect":
                break
            matn = m.get("text")
            if not matn or len(matn.encode()) > Q.MAX_KADR:
                continue
            hozir = int(time.monotonic())
            soniya, soni = (soniya, soni + 1) if hozir == soniya else (hozir, 1)
            if soni > Q.TEZLIK:
                continue
            try:
                d = json.loads(matn)
            except ValueError:
                continue
            p = d.get("payload") if isinstance(d, dict) and d.get("t") == "msg" else None
            if not Q.valid_payload(p):
                continue
            data = p.get("data") or {}
            # O'yin tugadi (0 → 1) — sinf xonasida natija bir marta yoziladi
            if key == Q.HOST and x.sinf_id is not None and p["type"] == "holat":
                tugadi = bool(data.get("tugadi"))
                if tugadi and not x.tugadi:
                    await _saqla(ws, kind, x, data)
                x.tugadi = tugadi
            chiq = {"t": "msg", "payload": {"type": p["type"], "data": data, "t": p["t"], "from": key}}
            for k, o in list(x.odamlar.items()):
                if o is not ws:
                    await _yubor(o, chiq)
    finally:
        qolgan = b.chiq(kind, code, key, ws)
        if qolgan is not None:
            await _odamlar(qolgan)

# Onlayn xonalar: WebSocket orqali presence ("odamlar") va xabar tarqatish. Xonalar shu jarayon xotirasida
# (uvicorn 1 worker). Server xabarni tekshiradi va "from" ni o'zi qo'yadi — boshqa odam nomidan yozib bo'lmaydi.
import json
import time

from fastapi import APIRouter, WebSocket

from . import xona_qoidalari as Q

router = APIRouter()


class Xona:
    def __init__(self, juft: bool, ochilgan: float):
        self.juft = juft
        self.ochilgan = ochilgan
        self.ochilgan_ms = int(ochilgan * 1000)
        self.odamlar: dict = {}


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


@router.websocket("/api/ws/xona/{kind}/{code}")
async def xona(ws: WebSocket, kind: str, code: str, key: str = "", role: str = ""):
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
        await _yubor(ws, {"t": "kirdi", "at": x.ochilgan_ms})
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
            chiq = {"t": "msg", "payload": {"type": p["type"], "data": p.get("data") or {}, "t": p["t"], "from": key}}
            for k, o in list(x.odamlar.items()):
                if o is not ws:
                    await _yubor(o, chiq)
    finally:
        qolgan = b.chiq(kind, code, key, ws)
        if qolgan is not None:
            await _odamlar(qolgan)

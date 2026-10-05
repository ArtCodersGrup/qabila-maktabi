# 2-bo'lak: onlayn xonalarni FastAPI WebSocket'ga ko'chirish — amalga oshirish rejasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Onlayn xonalar (Aloqa sinovi, Tog'ga chiqish, Yozuv poygasi) Supabase Realtime o'rniga o'z serverimizdagi WebSocket orqali ishlaydi. O'yin fayllari o'zgarmaydi.

**Architecture:**
- Server: `/api/ws/xona/{kind}/{code}?key=&role=`. Xonalar bitta uvicorn worker xotirasida turadi.
  - Server kim ulanganini ("odamlar") hammaga yuboradi va xabarni qolganlarga tarqatadi.
  - Limitlar (2 kishi / 12+1, kod muddati 10 daqiqa) va xabar tekshiruvi serverda.
  - `from` maydonini server o'zi qo'yadi.
- `/api/ws/ping` — aloqa sinovi.
- Mijoz: `oyinlar/umumiy/js/onlayn.js` ichi native `WebSocket` bilan qayta yoziladi. Tashqi API (`join`, `xona`, `ping`, `available`, `makeCode`, `validCode`, `validMessage`, `roomInfo`, `SIDES`, `KINDS`, `HOST`, `MAX_ODAM`, `CODE_TTL`) va status nomlari o'zgarmaydi.

**Tech Stack:** FastAPI WebSocket (starlette), pytest + `TestClient.websocket_connect`, Node `node --test`, Playwright (lokal uvicorn + statik fayllar).

**Spec:** `docs/superpowers/specs/2026-10-04-akkaunt-server-design.md` (2-bo'lak bo'limi)

## Global Constraints

- Xabar qoidalari JS bilan **bir xil**:
  - kimlik `^[a-z0-9:_-]{1,32}$` (katta-kichik harf farqsiz);
  - oddiy qiymat: chekli son |x| ≤ 1e13, mantiq, yoki `^[a-z0-9:_-]{0,32}$` qatori;
  - ro'yxat ≤ 32 ta oddiy qiymat; `data` obyektida ≤ 32 kalit; ichma-ich obyekt yo'q.
- `KINDS = ["sinov", "poyga", "savol", "tog"]` — Python va JS da bir xil (test tekshiradi).
- `CODE_TTL = 600000` ms (faqat ikki kishilik xonaga mehmon kirishida), `MAX_ODAM = 13` (12 o'yinchi + `host`).
- Server himoyasi:
  - kadr ≤ 4096 bayt;
  - ulanish boshiga ≤ 30 xabar/soniya (ortig'i tashlanadi);
  - bir vaqtda ≤ 300 xona.
- Ism, chat, erkin matn yo'q (QOIDALAR §8). Bu bo'lakda cookie va akkaunt ishlatilmaydi.
- Supabase "qabila-maktabi" loyihasi **to'xtatilmaydi**: yangi xonalar jonli darsda sinalgandan keyin muallif bilan to'xtatiladi. "kelajagim" Supabase loyihasiga tegilmaydi.

## Protokol (server ↔ mijoz, JSON matn kadrlar)

| Kim | Xabar | Ma'nosi |
|---|---|---|
| server→ | `{"t":"kirdi","at":<ms>}` | xonaga qabul qilindi; `at` — xona ochilgan vaqt |
| server→ | `{"t":"rad","sabab":"missing"\|"full"\|"expired"\|"band"\|"xato"}` | qabul qilinmadi, keyin ulanish yopiladi |
| server→ | `{"t":"odamlar","keys":[...],"at":<ms>}` | xonadagi hozirgi kalitlar (har kirish/chiqishda) |
| server→ | `{"t":"msg","payload":{"type","data","t","from"}}` | boshqa odamning xabari (`from` = server biladigan kalit) |
| →server | `{"t":"msg","payload":{"type","data","t"}}` | xabar yuborish (o'ziga qaytmaydi) |
| server→ | `{"t":"pong"}` | faqat `/api/ws/ping` da, keyin yopiladi |

Rollar:
- Ikki kishilik xona: `role=left&key=left` (ochgan) / `role=right&key=right` (kod bilan kirgan).
- Ko'p kishilik xona: `role=host&key=host` / `role=player&key=<yashirin raqam>`.
- Egasi bor xonaga ikkinchi ega kelsa — `band`. O'yinchi qayta ulansa, eski ulanish yopiladi va yangisi qoladi. Xona bo'shab qolsa, o'chiriladi.

---

### Task 1: Xabar qoidalari (Python, sof)

**Files:**
- Create: `server/app/xona_qoidalari.py`
- Test: `server/tests/test_xona_qoidalari.py`

**Interfaces:**
- Produces:
  - `KINDS: tuple[str, ...]`, `CODE_TTL_MS = 600_000`, `MAX_ODAM = 13`, `HOST = "host"`, `SIDES = ("left", "right")`, `MAX_KADR = 4096`, `MAX_XONA = 300`, `TEZLIK = 30`;
  - `kimlik(v) -> bool`, `valid_payload(p) -> bool` (type, t, data; `from` ga qaramaydi);
  - `ulanish_xatosi(kind, code, key, role) -> str | None` (`None` = to'g'ri, aks holda `"xato"`).

- [ ] **Step 1: Failing test**

`server/tests/test_xona_qoidalari.py`:
```python
import re
from pathlib import Path

from app import xona_qoidalari as Q

ok = {"type": "salom", "data": {"t0": 123}, "t": 1}


def test_kinds_js_bilan_bir_xil():
    js = (Path(__file__).resolve().parents[2] / "oyinlar/umumiy/js/onlayn.js").read_text(encoding="utf-8")
    m = re.search(r"const KINDS = \[([^\]]*)\]", js)
    assert tuple(re.findall(r'"([a-z]+)"', m.group(1))) == Q.KINDS


def test_payload_toʻgʻri():
    assert Q.valid_payload(ok)
    assert Q.valid_payload({"type": "javob", "t": 2})  # ma'lumotsiz
    assert Q.valid_payload({**ok, "data": {"pog": [0, 3, 7], "qah": ["tulki", "ayiq"]}})
    assert Q.valid_payload({**ok, "data": {"level": "proverb", "done": True, "pos": 12}})


def test_payload_notoʻgʻri():
    assert not Q.valid_payload(None)
    assert not Q.valid_payload([1])
    assert not Q.valid_payload({**ok, "type": "Salom, men Alisher"})
    assert not Q.valid_payload({**ok, "type": ""})
    assert not Q.valid_payload({**ok, "t": "1"})
    assert not Q.valid_payload({**ok, "t": True}), "mantiq son emas"
    assert not Q.valid_payload({**ok, "t": float("inf")})
    assert not Q.valid_payload({**ok, "t": 1e14})
    assert not Q.valid_payload({**ok, "data": {"text": "Salom, qalaysan?"}})
    assert not Q.valid_payload({**ok, "data": [1, 2]})
    assert not Q.valid_payload({**ok, "data": {"nom": ["Alisher Navoiy"]}})
    assert not Q.valid_payload({**ok, "data": {"pog": [1] * 33}})
    assert not Q.valid_payload({**ok, "data": {"deep": {"a": 1}}})
    assert not Q.valid_payload({**ok, "data": {f"k{i}": 1 for i in range(33)}})


def test_ulanish_xatosi():
    assert Q.ulanish_xatosi("sinov", "4827", "left", "left") is None
    assert Q.ulanish_xatosi("sinov", "4827", "right", "right") is None
    assert Q.ulanish_xatosi("tog", "1000", "host", "host") is None
    assert Q.ulanish_xatosi("tog", "9999", "k7f3a9", "player") is None
    for bad in [("chat", "4827", "left", "left"), ("sinov", "0123", "left", "left"), ("sinov", "12345", "left", "left"),
                ("sinov", "4827", "right", "left"), ("tog", "4827", "k7f3a9", "host"), ("tog", "4827", "host", "player"),
                ("tog", "4827", "Ali Valiyev", "player"), ("tog", "4827", "", "player"), ("tog", "4827", "x", "admin")]:
        assert Q.ulanish_xatosi(*bad) == "xato", bad
```

- [ ] **Step 2: Run — fail.** `cd server && .venv/bin/pytest -q tests/test_xona_qoidalari.py` → `ImportError`

- [ ] **Step 3: Implementation**

`server/app/xona_qoidalari.py`:
```python
# Onlayn xona qoidalari — oyinlar/umumiy/js/onlayn.js dagi tekshiruv bilan bir xil (sof funksiyalar).
# Ism, chat va erkin matn o'tmaydi: faqat sonlar, mantiq, qisqa kalit so'zlar va ularning ro'yxatlari.
import math
import re

KINDS = ("sinov", "poyga", "savol", "tog")
CODE_TTL_MS = 600_000  # ikki kishilik xona kodi 10 daqiqa amal qiladi
HOST = "host"
SIDES = ("left", "right")
MAX_ODAM = 13  # 12 o'yinchi + boshlovchi
MAX_KADR = 4096  # bitta xabar (bayt)
MAX_XONA = 300  # bir vaqtda ochiq xonalar
TEZLIK = 30  # bitta ulanishdan soniyasiga ko'pi bilan shuncha xabar

_KIMLIK = re.compile(r"[a-z0-9:_-]{1,32}", re.I)
_KALIT = re.compile(r"[a-z0-9:_-]{0,32}", re.I)
_KOD = re.compile(r"[1-9][0-9]{3}")


def kimlik(v) -> bool:
    return isinstance(v, str) and _KIMLIK.fullmatch(v) is not None


def _son(v) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v) and abs(v) <= 1e13


def _oddiy(v) -> bool:
    return _son(v) or isinstance(v, bool) or (isinstance(v, str) and _KALIT.fullmatch(v) is not None)


def _qiymat(v) -> bool:
    return _oddiy(v) or (isinstance(v, list) and len(v) <= 32 and all(_oddiy(x) for x in v))


def valid_payload(p) -> bool:
    if not isinstance(p, dict) or not kimlik(p.get("type")) or not _son(p.get("t")):
        return False
    data = p.get("data")
    if data is None:
        return True
    if not isinstance(data, dict) or len(data) > 32:
        return False
    return all(kimlik(k) and _qiymat(v) for k, v in data.items())


def ulanish_xatosi(kind, code, key, role):
    """None — ulanish so'rovi to'g'ri; aks holda "xato"."""
    if kind not in KINDS or not isinstance(code, str) or _KOD.fullmatch(code) is None or not kimlik(key):
        return "xato"
    if role in SIDES:
        return None if key == role else "xato"
    if role == "host":
        return None if key == HOST else "xato"
    if role == "player":
        return None if key != HOST else "xato"
    return "xato"
```

- [ ] **Step 4: Run — pass.** `cd server && .venv/bin/pytest -q` → hammasi o'tadi (10 + 4).

- [ ] **Step 5: Commit** — `git add server/app/xona_qoidalari.py server/tests/test_xona_qoidalari.py && git commit -m "server: onlayn xona qoidalari (JS bilan bir xil)"`

---

### Task 2: Xonalar boshqaruvchisi va WebSocket yo'llari

**Files:**
- Create: `server/app/xonalar.py`
- Modify: `server/app/main.py` (router ulanadi, `app.state.xonalar`, dev uchun statik fayllar)
- Test: `server/tests/test_xonalar.py`

**Interfaces:**
- Consumes: Task 1 dagi `xona_qoidalari`.
- Produces:
  - `Boshqaruvchi(soat=time.time)`:
    - `.kir(kind, code, key, role, ws) -> (sabab | None, Xona | None, eski_ws | None)`;
    - `.chiq(kind, code, key, ws) -> Xona | None` (xona hali bor bo'lsa uni qaytaradi);
    - `.xonalar: dict[(kind, code), Xona]`.
  - `Xona.juft: bool`, `Xona.ochilgan_ms: int`, `Xona.odamlar: dict[str, ws]`.
  - `router` (`/api/ws/ping`, `/api/ws/xona/{kind}/{code}`).
  - Env `KELAJAGIM_STATIK=<papka>` bo'lsa, `/` ga statik fayllar ulanadi (faqat lokal sinov uchun).

- [ ] **Step 1: Failing test**

`server/tests/test_xonalar.py`:
```python
import json

import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect

from app.main import create_app
from app.xonalar import Boshqaruvchi
from tests.conftest import TEST_DB


@pytest.fixture
def c():
    with TestClient(create_app(TEST_DB)) as client:
        yield client


def url(kind, code, key, role):
    return f"/api/ws/xona/{kind}/{code}?key={key}&role={role}"


def kut(ws, t):
    # Shu turdagi xabar kelguncha o'qiymiz (oraliqdagi "odamlar" yangilanishlari o'tkazib yuboriladi)
    while True:
        d = ws.receive_json()
        if d["t"] == t:
            return d


def msg(type_, data=None, **extra):
    return json.dumps({"t": "msg", "payload": {"type": type_, "data": data or {}, "t": 1, **extra}})


def test_ping(c):
    with c.websocket_connect("/api/ws/ping") as ws:
        assert ws.receive_json() == {"t": "pong"}


def test_juft_xona_kirish_va_xabar(c):
    with c.websocket_connect(url("sinov", "4827", "left", "left")) as a:
        assert kut(a, "kirdi")["at"] > 0
        assert kut(a, "odamlar")["keys"] == ["left"]
        with c.websocket_connect(url("sinov", "4827", "right", "right")) as b:
            kut(b, "kirdi")
            assert kut(b, "odamlar")["keys"] == ["left", "right"]
            assert kut(a, "odamlar")["keys"] == ["left", "right"]
            # from ni server qo'yadi — "left" deb yozib, boshqa nomidan yuborib bo'lmaydi
            b.send_text(msg("salom", {"t0": 5}, **{"from": "left"}))
            assert kut(a, "msg")["payload"] == {"type": "salom", "data": {"t0": 5}, "t": 1, "from": "right"}
        assert kut(a, "odamlar")["keys"] == ["left"]  # mehmon chiqdi


def test_xona_yoq(c):
    with c.websocket_connect(url("sinov", "5555", "right", "right")) as b:
        assert b.receive_json() == {"t": "rad", "sabab": "missing"}


def test_juft_xona_toʻla_va_ega_band(c):
    with c.websocket_connect(url("sinov", "4000", "left", "left")) as a, \
         c.websocket_connect(url("sinov", "4000", "right", "right")) as b:
        kut(a, "kirdi"), kut(b, "kirdi")
        with c.websocket_connect(url("sinov", "4000", "right", "right")) as d:
            assert d.receive_json() == {"t": "rad", "sabab": "full"}
        with c.websocket_connect(url("sinov", "4000", "left", "left")) as e:
            assert e.receive_json() == {"t": "rad", "sabab": "band"}


def test_notoʻgʻri_soʻrov(c):
    with c.websocket_connect(url("chat", "4827", "left", "left")) as ws:
        assert ws.receive_json() == {"t": "rad", "sabab": "xato"}


def test_kop_kishilik_xona(c):
    with c.websocket_connect(url("tog", "7777", "host", "host")) as h:
        kut(h, "kirdi")
        with c.websocket_connect(url("tog", "7777", "k1", "player")) as p1, \
             c.websocket_connect(url("tog", "7777", "k2", "player")) as p2:
            kut(p1, "kirdi"), kut(p2, "kirdi")
            p1.send_text(msg("javob", {"ok": True}))
            assert kut(h, "msg")["payload"]["from"] == "k1"
            assert kut(p2, "msg")["payload"]["from"] == "k1"
            h.send_text(msg("holat", {"pog": [1, 2]}))
            assert kut(p1, "msg")["payload"]["from"] == "host"
            # erkin matn tarqalmaydi: keyingi to'g'ri xabar birinchi bo'lib keladi
            p1.send_text(msg("javob", {"text": "Salom, qalaysan?"}))
            p1.send_text(msg("javob", {"ok": False}))
            assert kut(h, "msg")["payload"]["data"] == {"ok": False}


def test_toʻla_kop_kishilik_xona(c):
    with c.websocket_connect(url("tog", "8888", "host", "host")) as h:
        kut(h, "kirdi")
        ochiq = [c.websocket_connect(url("tog", "8888", f"p{i}", "player")) for i in range(12)]
        try:
            for ws in ochiq:
                kut(ws.__enter__(), "kirdi")
            with c.websocket_connect(url("tog", "8888", "p99", "player")) as ortiq:
                assert ortiq.receive_json() == {"t": "rad", "sabab": "full"}
        finally:
            for ws in ochiq:
                ws.__exit__(None, None, None)


def test_oyinchi_qayta_ulanadi(c):
    with c.websocket_connect(url("tog", "6666", "host", "host")) as h:
        kut(h, "kirdi")
        with c.websocket_connect(url("tog", "6666", "k1", "player")) as eski:
            kut(eski, "kirdi")
            with c.websocket_connect(url("tog", "6666", "k1", "player")) as yangi:
                kut(yangi, "kirdi")
                with pytest.raises(WebSocketDisconnect):
                    while True:
                        eski.receive_json()
                yangi.send_text(msg("javob", {"ok": True}))
                assert kut(h, "msg")["payload"]["from"] == "k1"


class Soxta:
    pass


def test_kod_muddati_va_xona_oʻchishi():
    vaqt = [1000.0]
    b = Boshqaruvchi(soat=lambda: vaqt[0])
    a = Soxta()
    assert b.kir("sinov", "4827", "left", "left", a)[0] is None
    vaqt[0] += 601
    assert b.kir("sinov", "4827", "right", "right", Soxta())[0] == "expired"
    assert b.chiq("sinov", "4827", "left", a) is None
    assert ("sinov", "4827") not in b.xonalar  # bo'sh xona o'chirildi


def test_xona_soni_cheklangan():
    b = Boshqaruvchi()
    for i in range(300):
        assert b.kir("sinov", str(1000 + i), "left", "left", Soxta())[0] is None
    assert b.kir("sinov", "9999", "left", "left", Soxta())[0] == "xato"
```

- [ ] **Step 2: Run — fail.** `.venv/bin/pytest -q tests/test_xonalar.py` → `ModuleNotFoundError: app.xonalar`

- [ ] **Step 3: Implementation**

`server/app/xonalar.py`:
```python
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
```

`server/app/main.py` — to'liq yangi ko'rinishi:
```python
# kelajagim.uz API. Hamma yo'llar /api ostida (nginx /api/ ni shu yerga uzatadi).
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response
from fastapi.staticfiles import StaticFiles

from . import config
from .db import baza_tirikmi, make_engine
from .xonalar import Boshqaruvchi, router as xonalar_router


def create_app(db_url: str | None = None) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.engine = make_engine(db_url or config.database_url())
        yield
        await app.state.engine.dispose()

    # Avtomatik hujjat sahifalari yopiq — ochiq saytda API tuzilishi ko'rinmasin
    app = FastAPI(title="kelajagim", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)
    app.state.xonalar = Boshqaruvchi()
    app.include_router(xonalar_router)

    @app.get("/api/salomat")
    async def salomat(response: Response):
        ok = await baza_tirikmi(app.state.engine)
        if not ok:
            response.status_code = 503
        return {"ok": ok, "baza": ok}

    # Faqat lokal sinov: sayt fayllari ham shu serverdan (serverda statikni nginx beradi)
    statik = os.environ.get("KELAJAGIM_STATIK")
    if statik:
        app.mount("/", StaticFiles(directory=statik, html=True), name="sayt")

    return app


app = create_app()
```

- [ ] **Step 4: Run — pass.** `.venv/bin/pytest -q` → hammasi o'tadi.

- [ ] **Step 5: Commit** — `git add server/app server/tests/test_xonalar.py && git commit -m "server: onlayn xonalar WebSocket orqali (presence, tarqatish, limitlar)"`

---

### Task 3: Mijoz — `onlayn.js` WebSocket bilan, Supabase olib tashlanadi

**Files:**
- Modify: `oyinlar/umumiy/js/onlayn.js` (to'liq qayta yoziladi, tashqi API saqlanadi)
- Delete: `oyinlar/umumiy/js/supabase.min.js`
- Modify: `oyinlar/onlayn/index.html`, `oyinlar/tog/index.html`, `oyinlar/yozuv-poygasi/index.html` (supabase `<script>` qatori o'chiriladi)
- Modify tests: `oyinlar/umumiy/tests/onlayn.test.js`, `oyinlar/onlayn/tests/sahifa.test.js`, `oyinlar/tog/tests/sahifa.test.js`, `oyinlar/yozuv-poygasi/tests/sahifa.test.js`
- Modify: `sw.js` (`python3 bosh/sw-royxat.py --bump` orqali), `QOIDALAR.md` §8

**Interfaces:**
- Consumes: protokol jadvali (yuqorida).
- Produces (yangi eksportlar): `SERVER = "wss://kelajagim.uz"`, `serverUrl(location) -> string`, `xonaUrl(base, kind, code, key, role) -> string`, `juftHolat(keys, at) -> roomInfo shakli`. `CONFIG` olib tashlanadi.

- [ ] **Step 1: Testlarni yangilash (failing)**

`oyinlar/umumiy/tests/onlayn.test.js` — "sozlama" testi o'rniga:
```js
test("server manzili: o'z domenimiz va lokal sinovda — o'sha server, fayldan/LAN dan — kelajagim.uz", () => {
  assert.equal(O.serverUrl({ protocol: "https:", hostname: "kelajagim.uz", host: "kelajagim.uz" }), "wss://kelajagim.uz");
  assert.equal(O.serverUrl({ protocol: "https:", hostname: "www.kelajagim.uz", host: "www.kelajagim.uz" }), "wss://www.kelajagim.uz");
  assert.equal(O.serverUrl({ protocol: "http:", hostname: "localhost", host: "localhost:8199" }), "ws://localhost:8199");
  assert.equal(O.serverUrl({ protocol: "file:", hostname: "", host: "" }), "wss://kelajagim.uz");
  assert.equal(O.serverUrl({ protocol: "http:", hostname: "192.168.1.5", host: "192.168.1.5:8000" }), "wss://kelajagim.uz");
  assert.equal(O.serverUrl(undefined), "wss://kelajagim.uz");
  assert.equal(O.xonaUrl("wss://kelajagim.uz", "tog", "4827", "k7f3a9", "player"), "wss://kelajagim.uz/api/ws/xona/tog/4827?key=k7f3a9&role=player");
  const src = require("node:fs").readFileSync(require("node:path").join(__dirname, "../js/onlayn.js"), "utf8");
  assert.ok(!/supabase|sb_publishable_|service_role|sb_secret_/.test(src), "Supabase qoldig'i yo'q");
});

test("ikki kishilik xona holati server ro'yxatidan", () => {
  assert.deepEqual(O.juftHolat(["left"], 5), { sides: ["left"], full: false, hostAt: 5, extra: false });
  assert.deepEqual(O.juftHolat(["left", "right"], 5), { sides: ["left", "right"], full: true, hostAt: 5, extra: false });
  assert.deepEqual(O.juftHolat(["right"], 5), { sides: ["right"], full: false, hostAt: null, extra: false });
  assert.deepEqual(O.juftHolat(["left", "begona"], 5).sides, ["left"]);
});
```
Shu faylda: `assert.ok(O.HOST_WAIT >= 3000, ...)` qatori izohi `"sekin tarmoqda server javobi kech keladi"` bo'ladi; `// Bazadagi xonalar.turi check ro'yxati bilan bir xil bo'lishi shart` izohi `// server/app/xona_qoidalari.py dagi KINDS bilan bir xil (pytest tekshiradi)` bo'ladi.

`oyinlar/onlayn/tests/sahifa.test.js`:
- birinchi testdagi supabase qatori `assert.ok(!scripts.some((f) => /supabase/.test(f)), "Supabase kutubxonasi yo'q");` + `assert.ok(at("../umumiy/js/onlayn.js") >= 0);` bo'ladi;
- ikkinchi test (`ommaviy kalit`) o'rniga:
```js
test("onlayn.js: o'z serverimizga ulanadi", () => {
  const O = require("../../umumiy/js/onlayn.js");
  assert.equal(O.SERVER, "wss://kelajagim.uz");
});
```
- fayl boshidagi izoh: `// Aloqa sinovi sahifasi: skriptlar mavjud, onlayn qatlam sahifa skriptidan oldin, Supabase yo'q.`

`oyinlar/tog/tests/sahifa.test.js`: `at("../umumiy/js/supabase.min.js") < at(...)` qatori → `assert.ok(at("../umumiy/js/onlayn.js") >= 0 && !scripts.some((f) => /supabase/.test(f)), "onlayn qatlam bor, Supabase yo'q");`

`oyinlar/yozuv-poygasi/tests/sahifa.test.js`:
- ro'yxatdan `"../umumiy/js/supabase.min.js", ` olib tashlanadi;
- test nomi `"tartib: mantiq ekrandan oldin, onlayn qatlam sahifadan oldin"`;
- `oldin("../umumiy/js/supabase.min.js", "../umumiy/js/onlayn.js");` qatori o'chiriladi.

Run: `node --test oyinlar/umumiy/tests/onlayn.test.js oyinlar/onlayn/tests oyinlar/tog/tests oyinlar/yozuv-poygasi/tests` → FAIL (`O.serverUrl is not a function`, supabase script hali bor).

- [ ] **Step 2: Implementation — `oyinlar/umumiy/js/onlayn.js`**

```js
// Onlayn xonalar: qurilmalar o'z serverimiz (kelajagim.uz, FastAPI WebSocket) orqali xabar almashadi.
// Ism, chat va erkin matn yo'q: faqat xona kodi, tomon (Oy/Quyosh) yoki yashirin raqam va ro'yxatdagi xabar turlari.
// Server xabarni yana tekshiradi va "from" ni o'zi qo'yadi. Sof qismlar (kod, manzil, xabar tekshiruvi) Node'da test qilinadi.
(function (root) {
  "use strict";

  const SERVER = "wss://kelajagim.uz"; // sahifa fayldan yoki boshqa manzildan ochilganda
  const CODE_TTL = 10 * 60 * 1000; // xona kodi 10 daqiqa amal qiladi
  const HOST_WAIT = 8000; // serverdan "kirdi"/"rad" javobini shuncha kutamiz (sekin maktab tarmog'i)
  const SIDES = ["left", "right"]; // chap — Oy (xonani ochgan), o'ng — Quyosh (kod bilan kirgan)
  const KINDS = ["sinov", "poyga", "savol", "tog"]; // server/app/xona_qoidalari.py bilan bir xil
  const HOST = "host";
  const MAX_ODAM = 13; // 12 o'yinchi + boshlovchi

  // ---------- Sof qismlar ----------
  // 4 xonali kod: 1000–9999 (boshida 0 bo'lmaydi — aytish va yozish oson)
  const makeCode = (rng) => String(1000 + Math.floor((rng || Math.random)() * 9000));
  const validCode = (s) => /^[1-9][0-9]{3}$/.test(String(s));
  const channelName = (kind, code) => `xona:${kind}:${code}`;

  // Oddiy qiymat: son, mantiq yoki qisqa kalit so'z. Erkin matn (gap, ism, chat) hech qachon o'tmaydi.
  // Son — chekli va aqlga sig'adigan (vaqt ms, pog'ona, foiz); Infinity/NaN/1e308 o'tmaydi
  const son = (v) => typeof v === "number" && Number.isFinite(v) && Math.abs(v) <= 1e13;
  const oddiy = (v) => son(v) || typeof v === "boolean" || (typeof v === "string" && /^[a-z0-9:_-]{0,32}$/i.test(v));
  // Ro'yxat ham bo'ladi: 12 o'yinchining pog'onasi kabi (har qiymati baribir oddiy)
  const qiymat = (v) => oddiy(v) || (Array.isArray(v) && v.length <= 32 && v.every(oddiy));
  const kimlik = (v) => typeof v === "string" && /^[a-z0-9:_-]{1,32}$/i.test(v);
  const MAX_KALIT = 32; // data obyektida ko'pi bilan shuncha maydon (ulkan payload o'tmasin)

  // O'yin xabari: { type, data, t, from }. types — shu o'yinda ruxsat etilgan turlar; boshqasi tashlab yuboriladi
  function validMessage(msg, types) {
    if (!msg || typeof msg !== "object") return false;
    if (!types.includes(msg.type)) return false;
    if (!kimlik(msg.from) || !son(msg.t)) return false;
    // Ma'lumot — kichik obyekt: sonlar, mantiq, qisqa kalit so'zlar va ularning ro'yxatlari
    const data = msg.data == null ? {} : msg.data;
    if (typeof data !== "object" || Array.isArray(data)) return false;
    const keys = Object.keys(data);
    if (keys.length > MAX_KALIT || !keys.every(kimlik)) return false;
    return Object.values(data).every(qiymat);
  }

  // Presence holatidan: kim ulangan va xona qachon ochilgan
  function roomInfo(state) {
    const sides = SIDES.filter((s) => state[s] && state[s].length);
    const host = state.left && state.left[0];
    return { sides, full: sides.length === 2, hostAt: host ? host.at : null, extra: SIDES.some((s) => state[s] && state[s].length > 1) };
  }

  // Server "odamlar" ro'yxatidan ikki kishilik xona holati (roomInfo bilan bir xil shakl)
  function juftHolat(keys, at) {
    const state = {};
    for (const k of keys) if (SIDES.includes(k)) state[k] = [{ at: k === "left" ? at : null }];
    return roomInfo(state);
  }

  // Qaysi serverga ulanamiz: sayt o'z domenida yoki lokal sinov serverida bo'lsa — o'sha server,
  // fayldan (file://) yoki LAN dan ochilganda — kelajagim.uz
  const OZIMIZ = ["kelajagim.uz", "www.kelajagim.uz", "localhost", "127.0.0.1"];
  function serverUrl(loc) {
    if (loc && /^https?:$/.test(loc.protocol) && OZIMIZ.includes(loc.hostname)) {
      return (loc.protocol === "https:" ? "wss://" : "ws://") + loc.host;
    }
    return SERVER;
  }
  const xonaUrl = (base, kind, code, key, role) =>
    `${base}/api/ws/xona/${kind}/${code}?key=${encodeURIComponent(key)}&role=${role}`;

  // ---------- Server bilan aloqa ----------
  const available = () => typeof root.WebSocket === "function";
  const baza = () => serverUrl(root.location);

  // Server bilan aloqa sinovi: /api/ws/ping "pong" qaytaradi. Natija: { ok, ms } yoki { ok: false, reason }
  function ping(timeout = 8000) {
    if (!available()) return Promise.resolve({ ok: false, reason: "lib" });
    if (root.navigator && root.navigator.onLine === false) return Promise.resolve({ ok: false, reason: "offline" });
    const t0 = Date.now();
    return new Promise((resolve) => {
      let ws = null;
      let done = false;
      const fin = (r) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        try { if (ws) ws.close(); } catch (e) { /* e'tiborsiz */ }
        resolve(r);
      };
      const timer = setTimeout(() => fin({ ok: false, reason: "timeout" }), timeout);
      try {
        ws = new root.WebSocket(baza() + "/api/ws/ping");
      } catch (e) {
        fin({ ok: false, reason: "error" });
        return;
      }
      ws.onmessage = () => fin({ ok: true, ms: Date.now() - t0 });
      ws.onerror = () => fin({ ok: false, reason: "error" });
      ws.onclose = () => fin({ ok: false, reason: "error" });
    });
  }

  // Bitta ulanish: serverdan keladigan kirdi / rad / odamlar / msg xabarlarini h ga uzatadi.
  // h: { kirdi(), rad(sabab), odamlar(keys, at), xabar(payload), uzildi() }
  function ulan(url, h) {
    let ws;
    let yopildi = false;
    let kirdi = false;
    let timer = null;
    function yop() {
      if (yopildi) return;
      yopildi = true;
      clearTimeout(timer);
      try { ws.close(); } catch (e) { /* e'tiborsiz */ }
    }
    try {
      ws = new root.WebSocket(url);
    } catch (e) {
      yopildi = true;
      setTimeout(() => h.uzildi(), 0);
      return { send() {}, close() {} };
    }
    timer = setTimeout(() => { if (!kirdi) { yop(); h.uzildi(); } }, HOST_WAIT);
    ws.onmessage = (ev) => {
      if (yopildi) return;
      let d;
      try { d = JSON.parse(ev.data); } catch (e) { return; }
      if (!d || typeof d !== "object") return;
      if (d.t === "kirdi") { kirdi = true; clearTimeout(timer); h.kirdi(); }
      else if (d.t === "rad") { yop(); h.rad(String(d.sabab)); }
      else if (d.t === "odamlar" && Array.isArray(d.keys)) h.odamlar(d.keys.filter(kimlik), son(d.at) ? d.at : null);
      else if (d.t === "msg") h.xabar(d.payload);
    };
    ws.onclose = () => {
      if (yopildi) return;
      yopildi = true;
      clearTimeout(timer);
      h.uzildi();
    };
    return {
      send(payload) {
        if (!yopildi && ws.readyState === 1) ws.send(JSON.stringify({ t: "msg", payload }));
      },
      close: yop,
    };
  }

  // Xonaga ulanish. side "left" — ochgan (Oy), "right" — kod bilan kirgan (Quyosh).
  // on: { status(s), peers(info), message(msg) }; types — ruxsat etilgan xabar turlari.
  // status: "connecting" | "waiting" | "ready" | "peer-left" | "full" | "missing" | "expired" | "error"
  function join({ kind, code, side, types, on }) {
    let closed = false;
    let wasFull = false;
    const emit = (s) => { if (!closed && on.status) on.status(s); };
    emit("connecting");
    const c = ulan(xonaUrl(baza(), kind, code, side, side), {
      kirdi() {},
      rad(sabab) { emit(["missing", "full", "expired"].includes(sabab) ? sabab : "error"); closed = true; },
      odamlar(keys, at) {
        if (closed) return;
        const info = juftHolat(keys, at);
        if (on.peers) on.peers(info);
        if (info.full) {
          wasFull = true;
          emit("ready");
        } else if (wasFull) {
          emit("peer-left");
        } else {
          emit("waiting");
        }
      },
      xabar(p) {
        // Ikki kishilik xona: faqat qarshi tomondan kelgan xabar
        if (!closed && validMessage(p, types) && SIDES.includes(p.from) && p.from !== side && on.message) on.message(p);
      },
      uzildi() { emit("error"); closed = true; },
    });
    function close() {
      if (closed) return;
      closed = true;
      c.close();
    }
    return {
      code,
      side,
      send(type, data) {
        if (closed || !types.includes(type)) return;
        c.send({ type, data: data || {}, t: Date.now() });
      },
      leave: close,
    };
  }

  // ---------- Ko'p kishilik xona (tog' o'yini, yozuv poygasi) ----------
  // Bitta boshlovchi ("host" — o'qituvchi qurilmasi) va 12 tagacha o'yinchi.
  // Boshlovchi o'yin holatini o'zi hisoblaydi va tarqatadi; o'yinchilar faqat javobini yuboradi.
  // me — o'yinchining yashirin raqami (ism emas!), role — "host" yoki "player".
  // on: { status(s), peers(ids, hostBor), message(msg) }
  // status: "connecting" | "ready" | "missing" | "full" | "error"
  function xona({ kind, code, me, role, types, on }) {
    const key = role === "host" ? HOST : me;
    let closed = false;
    const emit = (s) => { if (!closed && on.status) on.status(s); };
    emit("connecting");
    const c = ulan(xonaUrl(baza(), kind, code, key, role === "host" ? "host" : "player"), {
      kirdi() { emit("ready"); },
      rad(sabab) { emit(["missing", "full"].includes(sabab) ? sabab : "error"); closed = true; },
      odamlar(keys) {
        if (!closed && on.peers) on.peers(keys.filter((k) => k !== HOST), keys.includes(HOST));
      },
      xabar(p) {
        if (!closed && validMessage(p, types) && p.from !== key && on.message) on.message(p);
      },
      uzildi() { emit("error"); closed = true; },
    });
    function close() {
      if (closed) return;
      closed = true;
      c.close();
    }
    return {
      code,
      me: key,
      send(type, data) {
        if (closed || !types.includes(type)) return;
        c.send({ type, data: data || {}, t: Date.now() });
      },
      leave: close,
    };
  }

  const api = { SERVER, CODE_TTL, HOST_WAIT, HOST, MAX_ODAM, SIDES, KINDS, xona, makeCode, validCode, channelName, validMessage, roomInfo, juftHolat, serverUrl, xonaUrl, available, ping, join };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.onlayn = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
```

- [ ] **Step 3: Supabase'ni olib tashlash**

```bash
git rm -q oyinlar/umumiy/js/supabase.min.js
sed -i '' '/umumiy\/js\/supabase.min.js/d' oyinlar/onlayn/index.html oyinlar/tog/index.html oyinlar/yozuv-poygasi/index.html
python3 bosh/sw-royxat.py --bump
grep -rn supabase oyinlar bosh sw.js index.html   # natija bo'sh bo'lishi kerak
```

`QOIDALAR.md` §8:
- **Istisno** qatori → `**Onlayn qism** (2026-10-05): kutubxona yo'q — brauzerning o'z \`WebSocket\`i va o'z serverimiz (\`server/\`, FastAPI, kelajagim.uz/api). O'yinlar va bitta ekrandagi musobaqalar serversiz, internetsiz ishlaydi.`
- "internet bilan ishlaydi: Supabase Realtime, ..." jumlasi → `internet bilan ishlaydi: o'z serverimiz (WebSocket), ism va chat yo'q, faqat 4 xonali xona kodi; xabarlarni server ham tekshiradi.`

- [ ] **Step 4: Run — pass.** `node --test 2>&1 | grep -E "^ℹ (pass|fail)"` → `fail 0`; `cd server && .venv/bin/pytest -q` → hammasi o'tadi.

- [ ] **Step 5: Commit** — `git add -A oyinlar QOIDALAR.md sw.js && git commit -m "onlayn: xonalar oʻz serverimiz orqali (WebSocket), Supabase olib tashlandi"`

---

### Task 4: Brauzerda ikki va ko'p kishilik xona (lokal), deploy, jonli tekshiruv

**Files:** scratchpad'da Playwright skripti (repoga kirmaydi).

- [ ] **Step 1: Lokal server (statik + API)**

Run (fon): `cd server && KELAJAGIM_DB=postgresql+psycopg://localhost/kelajagim_test KELAJAGIM_STATIK=.. .venv/bin/uvicorn app.main:app --port 8199`

- [ ] **Step 2: Playwright — Aloqa sinovi (2 kontekst)**

`http://localhost:8199/oyinlar/onlayn/`:
1. A: ping ok → "Xona ochish" → kod (`QK.probe.code`).
2. B: "Kod bilan kirish" → kodni kiritadi.
3. Ikkalasida `QK.probe.status === "ready"`.
4. A "Salom" yuboradi → A da `QK.probe.rtt` son.
5. B sahifani yopadi → A da `peer-left`.
6. Uchinchi kontekst o'sha kod bilan kirsa: B yopilgandan oldin `full`; mavjud bo'lmagan kodda `missing`.

- [ ] **Step 3: Playwright — ko'p kishilik xona (`onlayn.xona` to'g'ridan-to'g'ri, `oyinlar/tog/` sahifasida)**

Host + 3 o'yinchi konteksti:
1. Hammasi `ready`.
2. Host `peers` da 3 id ko'radi.
3. O'yinchi `javob` yuboradi → host `msg.from === me`.
4. Host `holat` yuboradi → hamma oladi.

Keyin Tog'ga chiqish o'yinining o'zini oxirigacha o'ynash: host + 2 o'yinchi, `QK.probe` bilan.

- [ ] **Step 4: Deploy va jonli tekshiruv**

```bash
git push && bash server/deploy/deploy.sh
```
Keyin `https://kelajagim.uz/oyinlar/onlayn/` da Step 2 ni Playwright bilan takrorlash (ikki kontekst, haqiqiy server). Boshqa saytlar `curl` tekshiruvi (1-bo'lakdagidek).

- [ ] **Step 5: Muallifga** — jonli darsda sinab ko'rish so'raladi; shundan keyin Supabase "qabila-maktabi" loyihasi to'xtatiladi (alohida qaror).

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

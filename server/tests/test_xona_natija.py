import json

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.xona_natija import natija_ol
from tests.conftest import TEST_DB, sql, user_yarat

ORIGIN = {"Origin": "https://kelajagim.uz"}


def kut(ws, t):
    while True:
        d = ws.receive_json()
        if d["t"] == t:
            return d


def msg(type_, data):
    return json.dumps({"t": "msg", "payload": {"type": type_, "data": data, "t": 1}})


def tog_holat(tugadi, ids=("k1", "k2")):
    n = len(ids)
    return {"tog": "chimyon", "ids": list(ids), "qah": ["tulki"] * n, "pog": [9, 4][:n], "chiq": [0] * n, "pauza": [0] * n,
            "tgr": [10, 5][:n], "xat": [1, 3][:n], "qoldi": 0, "tugadi": tugadi, "golib": ids[0] if tugadi else "", "sabab": ""}


def test_natija_ol_tog_va_poyga():
    kimlar = {"k1": {"user_id": 7, "ism": "Ali K."}}
    meta, rows = natija_ol("tog", tog_holat(1), kimlar)
    assert meta == {"tog": "chimyon"}
    assert rows == [{"user_id": 7, "ism": "Ali K.", "orin": 1, "pogona": 9, "togri": 10, "xato": 1, "chiqdi": False},
                    {"user_id": None, "ism": None, "orin": 2, "pogona": 4, "togri": 5, "xato": 3, "chiqdi": False}]
    poyga = {"tur": "maqol", "ids": ["k2", "k1"], "orin": [1, 2], "cpm": [180, 150], "aniq": [97, 90], "ms": [60000, 71000], "tugadi": 1}
    meta, rows = natija_ol("poyga", poyga, kimlar)
    assert meta == {"tur": "maqol"}
    assert [(r["ism"], r["orin"], r["cpm"]) for r in rows] == [(None, 1, 180), ("Ali K.", 2, 150)]
    assert natija_ol("sinov", {"ids": ["k1"]}, {}) is None
    assert natija_ol("tog", {"ids": ["k1"], "pog": [1, 2]}, {}) is None  # uzunliklar mos emas
    assert natija_ol("tog", {"ids": []}, {}) is None


@pytest.fixture
def c(toza):
    with TestClient(create_app(TEST_DB), base_url="https://testserver", headers=ORIGIN) as client:
        yield client


def token(c, login, parol):
    c.cookies.clear()
    assert c.post("/api/hisob/kirish", json={"login": login, "parol": parol}).status_code == 200
    return c.cookies.get("kj_sessiya")


def test_sinf_xonasi_natijasi_saqlanadi(c):
    user_yarat(login="ustoz01", parol="qovun123", rol="teacher", ism="Dilnoza R.")
    user_yarat(login="ustoz02", parol="qovun123", rol="teacher", ism="Boshqa U.")
    t1 = token(c, "ustoz01", "qovun123")
    s = c.post("/api/sinflar", json={"nom": "5-A"}).json()["sinf"]
    y = c.post(f"/api/sinflar/{s['id']}/oquvchilar", json={"ismlar": ["Ali K."]}).json()["yangi"][0]
    sql("update users set parol_almashtirsin = false where id = :i", i=y["id"])
    begona = user_yarat(login="begona01", parol="qovun123", ism="Begona B.")  # sinfda emas
    t_ali = token(c, y["login"], y["parol"])
    t_beg = token(c, "begona01", "qovun123")

    url = "/api/ws/xona/tog/4321?key={k}&role={r}"
    with c.websocket_connect(url.format(k="host", r="host") + f"&sinf={s['id']}", headers={"cookie": f"kj_sessiya={t1}"}) as h:
        assert kut(h, "kirdi")["sinf"] is True
        with c.websocket_connect(url.format(k="k1", r="player"), headers={"cookie": f"kj_sessiya={t_ali}"}) as p1, \
             c.websocket_connect(url.format(k="k2", r="player"), headers={"cookie": f"kj_sessiya={t_beg}"}) as p2:
            kut(p1, "kirdi"), kut(p2, "kirdi")
            for td in (0, 1, 1, 1):  # tugadi bir necha marta takrorlanadi — bitta natija
                h.send_text(msg("holat", tog_holat(td)))
                kut(p1, "msg")
            # yangi o'yin: yana 0 → 1 — ikkinchi natija
            h.send_text(msg("holat", tog_holat(0)))
            h.send_text(msg("holat", tog_holat(1)))
            kut(p1, "msg"), kut(p1, "msg")
    assert begona
    token(c, "ustoz01", "qovun123")
    royxat = c.get("/api/sinflar/natijalar").json()["natijalar"]
    assert len(royxat) == 2 and royxat[0]["tur"] == "tog" and royxat[0]["sinf_nom"] == "5-A" and royxat[0]["soni"] == 2
    assert royxat[0]["golib"] == "Ali K."
    d = c.get(f"/api/sinflar/natija/{royxat[0]['id']}").json()["natija"]
    assert [(o["ism"], o["orin"]) for o in d["oyinchilar"]] == [("Ali K.", 1), (None, 2)]  # sinfda bo'lmagan — mehmon
    assert c.get("/api/sinflar/natijalar", params={"sinf": s["id"]}).json()["natijalar"][0]["id"] == royxat[0]["id"]
    # boshqa o'qituvchi ko'rmaydi
    token(c, "ustoz02", "qovun123")
    assert c.get("/api/sinflar/natijalar").json() == {"natijalar": []}
    assert c.get(f"/api/sinflar/natija/{royxat[0]['id']}").json() == {"detail": "topilmadi"}


def test_begona_sinfga_boglab_bolmaydi(c):
    user_yarat(login="ustoz01", parol="qovun123", rol="teacher")
    t1 = token(c, "ustoz01", "qovun123")
    s = c.post("/api/sinflar", json={"nom": "5-A"}).json()["sinf"]
    user_yarat(login="ali4821", parol="qovun123")
    t_ali = token(c, "ali4821", "qovun123")
    url = f"/api/ws/xona/tog/5555?key=host&role=host&sinf={s['id']}"
    # o'quvchi o'qituvchi sinfiga xona bog'lay olmaydi — xona ochiladi, lekin natija saqlanmaydi
    with c.websocket_connect(url, headers={"cookie": f"kj_sessiya={t_ali}"}) as h:
        assert kut(h, "kirdi")["sinf"] is False
        with c.websocket_connect("/api/ws/xona/tog/5555?key=k1&role=player") as p:
            kut(p, "kirdi")
            h.send_text(msg("holat", tog_holat(1, ids=("k1",))))
            kut(p, "msg")
    with c.websocket_connect("/api/ws/xona/tog/5556?key=host&role=host&sinf=abc") as h:  # noto'g'ri qiymat — oddiy xona
        assert kut(h, "kirdi")["sinf"] is False
    assert sql("select count(*) as n from xona_natijalari")[0]["n"] == 0
    assert t1

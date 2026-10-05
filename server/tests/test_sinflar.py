import re

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.sinflar import login_asos, yangi_kod
from tests.conftest import TEST_DB, sql, user_yarat

ORIGIN = {"Origin": "https://kelajagim.uz"}


def mijoz():
    return TestClient(create_app(TEST_DB), base_url="https://testserver", headers=ORIGIN)


def kir(c, login, parol):
    assert c.post("/api/hisob/kirish", json={"login": login, "parol": parol}).status_code == 200


@pytest.fixture
def ustoz(toza):
    user_yarat(login="ustoz01", parol="qovun123", rol="teacher", ism="Dilnoza R.")
    with mijoz() as c:
        kir(c, "ustoz01", "qovun123")
        yield c


def test_login_va_kod():
    assert re.fullmatch(r"ali\d{4}", login_asos("Ali K.") + "0000")
    assert login_asos("Oʻgʻiloy T.") == "ogiloy"
    assert login_asos("Шахзод") == "oquvchi"
    assert login_asos("Abdurahmonbek V.") == "abdurahm"
    for _ in range(200):
        assert re.fullmatch(r"[A-HJKMNP-Z2-9]{6}", yangi_kod())


def test_sinf_va_oquvchilar(ustoz):
    c = ustoz
    assert c.post("/api/sinflar", json={"nom": ""}).json() == {"detail": "nom-notogri"}
    s = c.post("/api/sinflar", json={"nom": "5-A sinf"}).json()["sinf"]
    assert s["nom"] == "5-A sinf" and re.fullmatch(r"[A-HJKMNP-Z2-9]{6}", s["kod"])
    r = c.post(f"/api/sinflar/{s['id']}/oquvchilar", json={"ismlar": ["Ali K.", "  Oʻgʻiloy T. ", ""]}).json()
    assert r == {"detail": "ismlar-notogri"}
    yangi = c.post(f"/api/sinflar/{s['id']}/oquvchilar", json={"ismlar": ["Ali K.", "Oʻgʻiloy T."]}).json()["yangi"]
    assert [y["ism"] for y in yangi] == ["Ali K.", "Oʻgʻiloy T."]
    assert re.fullmatch(r"ali\d{4}", yangi[0]["login"]) and re.fullmatch(r"\d{6}", yangi[0]["parol"])
    db = sql("select login, parol_xesh, parol_almashtirsin, kim_yaratgan from users where login = :l", l=yangi[0]["login"])[0]
    assert db["parol_almashtirsin"] is True and yangi[0]["parol"] not in db["parol_xesh"]
    sinf = c.get(f"/api/sinflar/{s['id']}").json()
    assert [o["ism"] for o in sinf["oquvchilar"]] == ["Ali K.", "Oʻgʻiloy T."] and sinf["oquvchilar"][0]["meniki"] is True
    assert c.get("/api/sinflar").json()["sinflar"][0]["soni"] == 2
    # o'quvchi kiradi — bir martalik parol bilan, keyin o'zinikini qo'yadi
    with mijoz() as b:
        kir(b, yangi[0]["login"], yangi[0]["parol"])
        assert b.post("/api/hisob/parol", json={"yangi": "olma-anor-7"}).status_code == 200
    # parolni tiklash — yangi bir martalik parol, eski sessiyalar yopiladi
    t = c.post(f"/api/sinflar/{s['id']}/oquvchilar/{yangi[0]['id']}/parol").json()
    assert t["login"] == yangi[0]["login"] and re.fullmatch(r"\d{6}", t["parol"])
    with mijoz() as b:
        kir(b, t["login"], t["parol"])
        assert b.get("/api/hisob/men").json()["user"]["parol_almashtirsin"] is True


def test_begona_sinf_va_rollar(ustoz):
    s = ustoz.post("/api/sinflar", json={"nom": "5-A"}).json()["sinf"]
    user_yarat(login="ustoz02", parol="qovun123", rol="teacher")
    user_yarat(login="ali4821", parol="qovun123")
    with mijoz() as b:
        kir(b, "ustoz02", "qovun123")
        assert b.get(f"/api/sinflar/{s['id']}").json() == {"detail": "topilmadi"}
        assert b.post(f"/api/sinflar/{s['id']}/oquvchilar", json={"ismlar": ["X Y."]}).json() == {"detail": "topilmadi"}
        assert b.get("/api/sinflar").json() == {"sinflar": []}
    with mijoz() as b:
        kir(b, "ali4821", "qovun123")
        assert b.post("/api/sinflar", json={"nom": "Mening sinfim"}).json() == {"detail": "ruxsat-yoq"}


def test_kod_bilan_qoshilish(ustoz):
    s = ustoz.post("/api/sinflar", json={"nom": "5-A"}).json()["sinf"]
    gid = user_yarat(google_sub="g-1", email="bola@gmail.com", ism="Sardor M.")
    user_yarat(login="bola0001", parol="qovun123")  # ismi yo'q
    with mijoz() as b:
        kir(b, "bola0001", "qovun123")
        assert b.post("/api/sinflar/qoshil", json={"kod": s["kod"]}).json() == {"detail": "ism-kerak"}
    sql("update users set login = 'sardor01', parol_xesh = (select parol_xesh from users where login = 'bola0001') where id = :i", i=gid)
    with mijoz() as b:
        kir(b, "sardor01", "qovun123")
        assert b.post("/api/sinflar/qoshil", json={"kod": "XXXXXX"}).json() == {"detail": "kod-notogri"}
        assert b.post("/api/sinflar/qoshil", json={"kod": s["kod"].lower()}).json() == {"sinf": {"nom": "5-A"}}
        assert b.post("/api/sinflar/qoshil", json={"kod": s["kod"]}).json() == {"detail": "allaqachon"}
        assert b.get("/api/sinflar/meniki").json() == {"sinflar": [{"nom": "5-A", "oqituvchi": "Dilnoza R.", "holat": "sorov"}]}
        for _ in range(10):
            b.post("/api/sinflar/qoshil", json={"kod": "YYYYYY"})
        assert b.post("/api/sinflar/qoshil", json={"kod": s["kod"]}).json() == {"detail": "kop-urinish"}
    d = ustoz.get(f"/api/sinflar/{s['id']}").json()
    assert d["sorovlar"] == [{"id": gid, "ism": "Sardor M.", "email": "bola@gmail.com"}] and d["oquvchilar"] == []
    assert ustoz.post(f"/api/sinflar/{s['id']}/sorovlar/{gid}", json={"qaror": "qabul"}).json() == {"ok": True}
    d = ustoz.get(f"/api/sinflar/{s['id']}").json()
    assert [o["ism"] for o in d["oquvchilar"]] == ["Sardor M."] and d["oquvchilar"][0]["meniki"] is False
    # o'zi yaratmagan o'quvchining parolini tiklab bo'lmaydi
    assert ustoz.post(f"/api/sinflar/{s['id']}/oquvchilar/{gid}/parol").json() == {"detail": "ruxsat-yoq"}
    assert ustoz.post(f"/api/sinflar/{s['id']}/chiqar/{gid}").json() == {"ok": True}
    assert ustoz.get(f"/api/sinflar/{s['id']}").json()["oquvchilar"] == []


def test_sinf_progressi(ustoz):
    s = ustoz.post("/api/sinflar", json={"nom": "5-A"}).json()["sinf"]
    y = ustoz.post(f"/api/sinflar/{s['id']}/oquvchilar", json={"ismlar": ["Ali K."]}).json()["yangi"][0]
    with mijoz() as b:
        kir(b, y["login"], y["parol"])
        b.post("/api/hisob/parol", json={"yangi": "olma-anor-7"})
        b.post("/api/progress", json={"kalitlar": {"rim-toshi:v1": {"done": [True, False], "stars": [3, 0], "hard": [False, False]}}})
    p = ustoz.get(f"/api/sinflar/{s['id']}/progress").json()
    assert p == {"oquvchilar": {str(y["id"]): {"rim-toshi:v1": {"done": [True, False], "stars": [3, 0], "hard": [False, False]}}}}

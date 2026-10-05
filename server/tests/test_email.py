import re
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from tests.conftest import TEST_DB, sql, user_yarat

ORIGIN = {"Origin": "https://kelajagim.uz"}


@pytest.fixture
def pochta_env(monkeypatch):
    monkeypatch.setenv("SMTP_USER", "qabila.maktabi@gmail.com")
    monkeypatch.setenv("SMTP_PAROL", "abcd efgh ijkl mnop")


@pytest.fixture
def c(toza, pochta_env):
    app = create_app(TEST_DB)
    xatlar = []

    async def soxta(kimga, mavzu, matn):
        xatlar.append({"kimga": kimga, "mavzu": mavzu, "matn": matn})

    app.state.pochta = soxta
    with TestClient(app, base_url="https://testserver", headers=ORIGIN, follow_redirects=False) as client:
        client.xatlar = xatlar
        yield client


def havola(xat):
    return re.search(r"https://kelajagim\.uz/\S+", xat["matn"]).group(0)


def token(url, nom):
    return parse_qs(urlparse(url).query)[nom][0]


def test_sozlama_pochta(c, monkeypatch):
    assert c.get("/api/hisob/sozlama").json()["email"] is True
    monkeypatch.delenv("SMTP_PAROL")
    assert c.get("/api/hisob/sozlama").json()["email"] is False
    assert c.post("/api/hisob/royxat", json={"email": "a@gmail.com", "parol": "qovun123", "ism": "Ali K."}).json() == {"detail": "pochta-yoq"}


def test_royxat_tasdiq_kirish(c):
    r = c.post("/api/hisob/royxat", json={"email": "  Ustoz@Gmail.com ", "parol": "qovun123", "ism": "Dilnoza R."})
    assert r.json() == {"ok": True, "email": "ustoz@gmail.com"}
    assert len(c.xatlar) == 1 and c.xatlar[0]["kimga"] == "ustoz@gmail.com" and "Dilnoza R." in c.xatlar[0]["matn"]
    # tasdiqlanmaguncha kira olmaydi
    assert c.post("/api/hisob/kirish", json={"login": "ustoz@gmail.com", "parol": "qovun123"}).json() == {"detail": "tasdiqlanmagan"}
    url = havola(c.xatlar[0])
    assert "/api/hisob/tasdiq?t=" in url
    r = c.get("/api/hisob/tasdiq", params={"t": token(url, "t")})
    assert r.status_code == 302 and r.headers["location"] == "/kirish/?tasdiq=1"
    u = c.get("/api/hisob/men").json()["user"]
    assert u["email"] == "ustoz@gmail.com" and u["ism"] == "Dilnoza R." and u["parol_bor"] is True and u["login"] is None
    # havola ikkinchi marta ishlamaydi
    assert c.get("/api/hisob/tasdiq", params={"t": token(url, "t")}).headers["location"] == "/kirish/?xato=havola"
    c.post("/api/hisob/chiqish")
    assert c.post("/api/hisob/kirish", json={"login": "USTOZ@gmail.com", "parol": "qovun123"}).status_code == 200


def test_royxat_xatolari(c):
    assert c.post("/api/hisob/royxat", json={"email": "yaroqsiz", "parol": "qovun123", "ism": "Ali K."}).json() == {"detail": "email-notogri"}
    assert c.post("/api/hisob/royxat", json={"email": "a@gmail.com", "parol": "123", "ism": "Ali K."}).json() == {"detail": "parol-qisqa"}
    assert c.post("/api/hisob/royxat", json={"email": "a@gmail.com", "parol": "qovun123", "ism": "<b>"}).json() == {"detail": "ism-notogri"}
    user_yarat(google_sub="g-1", email="band@gmail.com", ism="Band B.")
    assert c.post("/api/hisob/royxat", json={"email": "Band@gmail.com", "parol": "qovun123", "ism": "Ali K."}).json() == {"detail": "email-band"}
    # tasdiqlanmagan qayta ro'yxat — yangi xat, ikkinchi akkaunt ochilmaydi
    c.post("/api/hisob/royxat", json={"email": "yangi@gmail.com", "parol": "qovun123", "ism": "Ali K."})
    c.post("/api/hisob/royxat", json={"email": "yangi@gmail.com", "parol": "boshqa-parol", "ism": "Ali K."})
    assert sql("select count(*) as n from users where email = 'yangi@gmail.com'")[0]["n"] == 1
    assert len(c.xatlar) == 2


def test_tasdiq_xatini_qayta_yuborish(c):
    c.post("/api/hisob/royxat", json={"email": "a@gmail.com", "parol": "qovun123", "ism": "Ali K."})
    assert c.post("/api/hisob/tasdiq-qayta", json={"email": "a@gmail.com"}).json() == {"ok": True}
    assert c.post("/api/hisob/tasdiq-qayta", json={"email": "yoq@gmail.com"}).json() == {"ok": True}  # bor-yo'qligi bilinmaydi
    assert len(c.xatlar) == 2


def test_parolni_unutdim(c):
    c.post("/api/hisob/royxat", json={"email": "a@gmail.com", "parol": "qovun123", "ism": "Ali K."})
    c.get("/api/hisob/tasdiq", params={"t": token(havola(c.xatlar[0]), "t")})
    c.post("/api/hisob/chiqish")
    # boshqa qurilmadagi sessiya
    with TestClient(c.app, base_url="https://testserver", headers=ORIGIN) as boshqa:
        boshqa.post("/api/hisob/kirish", json={"login": "a@gmail.com", "parol": "qovun123"})
        assert c.post("/api/hisob/unutdim", json={"email": "A@gmail.com"}).json() == {"ok": True}
        assert c.post("/api/hisob/unutdim", json={"email": "yoq@gmail.com"}).json() == {"ok": True}
        assert len(c.xatlar) == 2
        url = havola(c.xatlar[1])
        assert "/kirish/?tiklash=" in url
        t = token(url, "tiklash")
        assert c.post("/api/hisob/tiklash", json={"token": t, "yangi": "123"}).json() == {"detail": "parol-qisqa"}
        r = c.post("/api/hisob/tiklash", json={"token": t, "yangi": "yangi-parol-1"})
        assert r.status_code == 200 and r.json()["user"]["email"] == "a@gmail.com"
        assert boshqa.get("/api/hisob/men").status_code == 401  # eski sessiyalar yopildi
    assert c.post("/api/hisob/tiklash", json={"token": t, "yangi": "yana-boshqa"}).json() == {"detail": "havola"}
    c.post("/api/hisob/chiqish")
    assert c.post("/api/hisob/kirish", json={"login": "a@gmail.com", "parol": "yangi-parol-1"}).status_code == 200


def test_eskirgan_havola(c):
    c.post("/api/hisob/royxat", json={"email": "a@gmail.com", "parol": "qovun123", "ism": "Ali K."})
    sql("update email_tokenlar set tugaydi = now() - interval '1 minute'")
    assert c.get("/api/hisob/tasdiq", params={"t": token(havola(c.xatlar[0]), "t")}).headers["location"] == "/kirish/?xato=havola"


def test_xat_cheklovi(c):
    for _ in range(3):
        c.post("/api/hisob/unutdim", json={"email": "a@gmail.com"})
    c.post("/api/hisob/royxat", json={"email": "b@gmail.com", "parol": "qovun123", "ism": "Ali K."})
    for _ in range(5):
        c.post("/api/hisob/tasdiq-qayta", json={"email": "b@gmail.com"})
    assert len(c.xatlar) <= 4  # bitta emailga 15 daqiqada ko'pi bilan 3 ta xat
    assert c.post("/api/hisob/tasdiq-qayta", json={"email": "b@gmail.com"}).json() == {"ok": True}


def test_google_email_akkauntga_qoshiladi(c, monkeypatch):
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "cid")
    monkeypatch.setenv("GOOGLE_CLIENT_SECRET", "sir")
    c.post("/api/hisob/royxat", json={"email": "a@gmail.com", "parol": "qovun123", "ism": "Ali K."})  # tasdiqlanmagan

    async def google(code):
        return {"sub": "g-9", "email": "a@gmail.com", "email_verified": True}

    c.app.state.google = google
    r = c.get("/api/hisob/google")
    state = parse_qs(urlparse(r.headers["location"]).query)["state"][0]
    c.get("/api/hisob/google/qaytish", params={"code": "x", "state": state})
    u = c.get("/api/hisob/men").json()["user"]
    assert u["ism"] == "Ali K." and u["parol_bor"] is True
    assert sql("select email_tasdiq from users where email = 'a@gmail.com'")[0]["email_tasdiq"] is True

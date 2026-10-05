import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from tests.conftest import TEST_DB, sql, user_yarat

ORIGIN = {"Origin": "https://kelajagim.uz"}


@pytest.fixture
def c(toza):
    with TestClient(create_app(TEST_DB), base_url="https://testserver", headers=ORIGIN) as client:
        yield client


def kir(c, login, parol):
    return c.post("/api/hisob/kirish", json={"login": login, "parol": parol})


def test_kirish_va_men(c):
    user_yarat(login="ali4821", parol="qovun123", ism="Ali K.")
    assert c.get("/api/hisob/men").status_code == 401
    r = kir(c, "  ALI4821 ", "qovun123")
    assert r.status_code == 200
    u = r.json()["user"]
    assert u["login"] == "ali4821" and u["ism"] == "Ali K." and u["rol"] == "student" and u["parol_bor"] is True
    assert "parol_xesh" not in u
    cookie = r.headers["set-cookie"].lower()
    assert "kj_sessiya=" in cookie and "httponly" in cookie and "secure" in cookie and "samesite=lax" in cookie
    assert c.get("/api/hisob/men").json()["user"]["id"] == u["id"]
    # bazada token emas, faqat xeshi
    token = c.cookies.get("kj_sessiya")
    assert all(bytes(r["token_xesh"]) != token.encode() for r in sql("select token_xesh from sessiyalar"))


def test_notogri_parol_va_cheklov(c):
    user_yarat(login="ali4821", parol="qovun123")
    assert kir(c, "ali4821", "xato-parol").json() == {"detail": "notogri"}
    assert kir(c, "yoq0000", "qovun123").status_code == 401
    for _ in range(9):
        kir(c, "ali4821", "xato-parol")
    r = kir(c, "ali4821", "qovun123")  # to'g'ri parol ham — 10 ta xatodan keyin band
    assert r.status_code == 429 and r.json() == {"detail": "kop-urinish"}


def test_origin(c):
    user_yarat(login="ali4821", parol="qovun123")
    r = c.post("/api/hisob/kirish", json={"login": "ali4821", "parol": "qovun123"}, headers={"Origin": "https://yomon.uz"})
    assert r.status_code == 403 and r.json() == {"detail": "origin"}
    with TestClient(create_app(TEST_DB), base_url="https://testserver") as bosh:
        assert bosh.post("/api/hisob/chiqish").status_code == 403  # Origin umuman yo'q


def test_majburiy_parol_almashtirish(c):
    user_yarat(login="vali1234", parol="123456", ism="Vali S.", almashtirsin=True)
    assert kir(c, "vali1234", "123456").json()["user"]["parol_almashtirsin"] is True
    assert c.post("/api/hisob/profil", json={"ism": "Vali S."}).json() == {"detail": "parol-almashtir"}
    assert c.post("/api/hisob/parol", json={"yangi": "123"}).json() == {"detail": "parol-qisqa"}
    r = c.post("/api/hisob/parol", json={"yangi": "olma-anor-7"})  # eski parol so'ralmaydi
    assert r.status_code == 200 and r.json()["user"]["parol_almashtirsin"] is False
    c.post("/api/hisob/chiqish")
    assert kir(c, "vali1234", "123456").status_code == 401
    assert kir(c, "vali1234", "olma-anor-7").status_code == 200


def test_oddiy_parol_almashtirish_va_boshqa_sessiyalar(c):
    user_yarat(login="ali4821", parol="qovun123")
    with TestClient(create_app(TEST_DB), base_url="https://testserver", headers=ORIGIN) as boshqa:
        kir(boshqa, "ali4821", "qovun123")
        kir(c, "ali4821", "qovun123")
        assert c.post("/api/hisob/parol", json={"eski": "noto'g'ri", "yangi": "yangi-parol"}).json() == {"detail": "eski-notogri"}
        assert c.post("/api/hisob/parol", json={"eski": "qovun123", "yangi": "yangi-parol"}).status_code == 200
        assert c.get("/api/hisob/men").status_code == 200
        assert boshqa.get("/api/hisob/men").status_code == 401  # boshqa qurilmadagi sessiya yopildi


def test_profil_ism(c):
    user_yarat(login="ali4821", parol="qovun123")
    kir(c, "ali4821", "qovun123")
    for yaxshi, kutilgan in [("Ali K.", "Ali K."), ("  Oʻgʻiloy   T. ", "Oʻgʻiloy T."), ("Jasur-bek", "Jasur-bek")]:
        r = c.post("/api/hisob/profil", json={"ism": yaxshi})
        assert r.status_code == 200 and r.json()["user"]["ism"] == kutilgan
    for yomon in ["", "A", "<script>", "1Ali", "x" * 41, "Ali\nK."]:
        assert c.post("/api/hisob/profil", json={"ism": yomon}).json() == {"detail": "ism-notogri"}, yomon


def test_oqituvchi_sorovi(c):
    gid = user_yarat(google_sub="g-1", email="ustoz@gmail.com")
    # Google foydalanuvchisi sessiyasini to'g'ridan-to'g'ri ochamiz (Google oqimi Task 3 da)
    import asyncio
    from app import sessiya
    from app.db import make_engine

    async def och():
        e = make_engine(TEST_DB)
        async with e.connect() as conn:
            tok = await sessiya.och(conn, gid)
            await conn.commit()
        await e.dispose()
        return tok

    c.cookies.set("kj_sessiya", asyncio.run(och()))
    assert c.post("/api/hisob/oqituvchi-sorov").json() == {"detail": "ism-kerak"}
    c.post("/api/hisob/profil", json={"ism": "Dilnoza R."})
    r = c.post("/api/hisob/oqituvchi-sorov")
    assert r.status_code == 200 and r.json()["user"]["oqituvchi_sorov"] == "kutilmoqda"
    # o'qituvchi yaratgan o'quvchi (login bilan) so'rov yubora olmaydi
    c.post("/api/hisob/chiqish")
    user_yarat(login="ali4821", parol="qovun123", ism="Ali K.")
    kir(c, "ali4821", "qovun123")
    assert c.post("/api/hisob/oqituvchi-sorov").json() == {"detail": "mumkin-emas"}


def test_chiqish_va_eskirgan_sessiya(c):
    user_yarat(login="ali4821", parol="qovun123")
    kir(c, "ali4821", "qovun123")
    sql("update sessiyalar set tugaydi = now() - interval '1 minute'")
    assert c.get("/api/hisob/men").status_code == 401
    kir(c, "ali4821", "qovun123")
    assert c.post("/api/hisob/chiqish").json() == {"ok": True}
    assert c.get("/api/hisob/men").status_code == 401

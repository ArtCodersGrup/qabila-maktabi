import asyncio

import pytest
from fastapi.testclient import TestClient

from app import cli
from app.main import create_app
from tests.conftest import TEST_DB, sql, user_yarat

ORIGIN = {"Origin": "https://kelajagim.uz"}


@pytest.fixture
def c(toza):
    with TestClient(create_app(TEST_DB), base_url="https://testserver", headers=ORIGIN) as client:
        yield client


def test_admin_faqat_adminga(c):
    user_yarat(login="ali4821", parol="qovun123")
    assert c.get("/api/admin/sorovlar").status_code == 401
    c.post("/api/hisob/kirish", json={"login": "ali4821", "parol": "qovun123"})
    assert c.get("/api/admin/sorovlar").json() == {"detail": "ruxsat-yoq"}


def test_yangi_admin_va_sorovlar(c):
    parol = asyncio.run(cli.yangi_admin(TEST_DB, "admin"))
    assert len(parol) >= 10
    r = c.post("/api/hisob/kirish", json={"login": "admin", "parol": parol})
    assert r.json()["user"]["rol"] == "admin" and r.json()["user"]["parol_almashtirsin"] is True
    assert c.get("/api/admin/sorovlar").json() == {"detail": "parol-almashtir"}
    c.post("/api/hisob/parol", json={"yangi": "admin-yangi-parol"})

    a = user_yarat(google_sub="g-1", email="a@gmail.com", ism="Dilnoza R.")
    b = user_yarat(google_sub="g-2", email="b@gmail.com", ism="Sardor M.")
    sql("update users set oqituvchi_sorov = 'kutilmoqda' where id in (:a, :b)", a=a, b=b)
    royxat = c.get("/api/admin/sorovlar").json()["sorovlar"]
    assert [s["ism"] for s in royxat] == ["Dilnoza R.", "Sardor M."] and royxat[0]["email"] == "a@gmail.com"
    assert c.post(f"/api/admin/sorov/{a}", json={"qaror": "tasdiq"}).json() == {"ok": True}
    assert c.post(f"/api/admin/sorov/{b}", json={"qaror": "rad"}).json() == {"ok": True}
    assert c.post(f"/api/admin/sorov/{b}", json={"qaror": "tasdiq"}).json() == {"detail": "topilmadi"}
    assert c.post(f"/api/admin/sorov/{a}", json={"qaror": "boshqa"}).status_code == 422
    holat = {r["id"]: (r["rol"], r["oqituvchi_sorov"]) for r in sql("select id, rol, oqituvchi_sorov from users")}
    assert holat[a] == ("teacher", None) and holat[b] == ("student", "rad")
    st = c.get("/api/admin/statistika").json()
    assert st == {"oquvchilar": 1, "oqituvchilar": 1, "sinflar": 0, "faol7": 1, "kutilmoqda": 0}


def test_make_admin_login_bilan(c):
    user_yarat(login="ustoz01", parol="qovun123")
    assert "admin" in asyncio.run(cli.make_admin(TEST_DB, "ustoz01"))
    with pytest.raises(SystemExit):
        asyncio.run(cli.make_admin(TEST_DB, "yoq0000"))


def admin_mijoz(c):
    p = asyncio.run(cli.yangi_admin(TEST_DB, "admin"))
    c.post("/api/hisob/kirish", json={"login": "admin", "parol": p})
    c.post("/api/hisob/parol", json={"yangi": "admin-yangi-parol"})
    return sql("select id from users where login = 'admin'")[0]["id"]


def test_statistika_sorov_yuborganni_oquvchi_deb_sanamaydi(c):
    admin_mijoz(c)
    user_yarat(google_sub="g-1", email="a@gmail.com", ism="Dilnoza R.")
    b = user_yarat(google_sub="g-2", email="b@gmail.com", ism="Sardor M.")
    sql("update users set oqituvchi_sorov = 'kutilmoqda' where id = :b", b=b)
    t = user_yarat(login="ustoz01", parol="qovun123", rol="teacher", ism="Ustoz U.")
    sql("insert into sinflar(oqituvchi_id, nom, kod) values (:t, '5-A', 'ABCDEF')", t=t)
    st = c.get("/api/admin/statistika").json()
    assert st == {"oquvchilar": 1, "oqituvchilar": 1, "sinflar": 1, "faol7": 1, "kutilmoqda": 1}


def test_oqituvchilar_va_rol(c):
    me = admin_mijoz(c)
    t = user_yarat(login="ustoz01", parol="qovun123", rol="teacher", ism="Ustoz U.")
    s = sql("insert into sinflar(oqituvchi_id, nom, kod) values (:t, '5-A', 'ABCDEF') returning id", t=t)[0]["id"]
    o = user_yarat(login="ali4821", parol="qovun123", ism="Ali K.")
    sql("insert into sinf_azolari(sinf_id, user_id, holat) values (:s, :o, 'qabul')", s=s, o=o)
    r = c.get("/api/admin/oqituvchilar").json()["oqituvchilar"]
    assert [(x["ism"], x["sinflar"], x["oquvchilar"]) for x in r] == [("Ustoz U.", 1, 1)]
    assert c.post(f"/api/admin/rol/{t}", json={"rol": "student"}).json() == {"ok": True}
    assert c.get("/api/admin/oqituvchilar").json()["oqituvchilar"] == []
    assert c.post(f"/api/admin/rol/{t}", json={"rol": "teacher"}).json() == {"ok": True}
    assert c.post(f"/api/admin/rol/{me}", json={"rol": "student"}).json() == {"detail": "mumkin-emas"}
    assert c.post(f"/api/admin/rol/{t}", json={"rol": "admin"}).status_code == 422
    assert c.post("/api/admin/rol/99999", json={"rol": "teacher"}).json() == {"detail": "topilmadi"}


def test_foydalanuvchilar_qidiruv(c):
    admin_mijoz(c)
    user_yarat(login="ali4821", parol="qovun123", ism="Ali K.")
    user_yarat(google_sub="g-1", email="malika@gmail.com", ism="Malika T.")
    user_yarat(login="ustoz01", parol="qovun123", rol="teacher", ism="Ustoz U.")
    r = c.get("/api/admin/foydalanuvchilar").json()
    assert r["jami"] == 4 and len(r["foydalanuvchilar"]) == 4
    assert [x["ism"] for x in c.get("/api/admin/foydalanuvchilar", params={"q": "mali"}).json()["foydalanuvchilar"]] == ["Malika T."]
    assert [x["login"] for x in c.get("/api/admin/foydalanuvchilar", params={"q": "ALI48"}).json()["foydalanuvchilar"]] == ["ali4821"]
    assert [x["ism"] for x in c.get("/api/admin/foydalanuvchilar", params={"rol": "teacher"}).json()["foydalanuvchilar"]] == ["Ustoz U."]
    assert c.get("/api/admin/foydalanuvchilar", params={"q": "%"}).json()["jami"] == 0  # LIKE belgisi oddiy harf
    assert set(r["foydalanuvchilar"][0]) == {"id", "ism", "login", "email", "rol", "oxirgi_kirish", "yaratilgan"}

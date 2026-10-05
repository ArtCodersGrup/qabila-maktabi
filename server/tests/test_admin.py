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
    assert st == {"rollar": {"admin": 1, "student": 1, "teacher": 1}, "kutilmoqda": 0}


def test_make_admin_login_bilan(c):
    user_yarat(login="ustoz01", parol="qovun123")
    assert "admin" in asyncio.run(cli.make_admin(TEST_DB, "ustoz01"))
    with pytest.raises(SystemExit):
        asyncio.run(cli.make_admin(TEST_DB, "yoq0000"))

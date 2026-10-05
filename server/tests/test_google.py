import asyncio
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi.testclient import TestClient

from app import cli
from app.main import create_app
from tests.conftest import TEST_DB, sql

ORIGIN = {"Origin": "https://kelajagim.uz"}


@pytest.fixture
def google_env(monkeypatch):
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "cid-123")
    monkeypatch.setenv("GOOGLE_CLIENT_SECRET", "sir")


def mijoz(info):
    app = create_app(TEST_DB)

    async def soxta(code):
        if code != "yaxshi-kod":
            raise RuntimeError("yomon kod")
        return info

    app.state.google = soxta
    return TestClient(app, base_url="https://testserver", headers=ORIGIN, follow_redirects=False)


def test_sozlama(toza, monkeypatch):
    monkeypatch.delenv("GOOGLE_CLIENT_ID", raising=False)
    with mijoz({}) as c:
        assert c.get("/api/hisob/sozlama").json() == {"google": False}
        assert c.get("/api/hisob/google").status_code == 503


def oqim(c):
    r = c.get("/api/hisob/google")
    assert r.status_code == 302
    q = parse_qs(urlparse(r.headers["location"]).query)
    assert q["client_id"] == ["cid-123"] and q["scope"] == ["openid email"]
    assert q["redirect_uri"] == ["https://kelajagim.uz/api/hisob/google/qaytish"]
    return q["state"][0]


def test_google_yangi_foydalanuvchi(toza, google_env):
    with mijoz({"sub": "g-777", "email": "bola@gmail.com", "email_verified": True}) as c:
        assert c.get("/api/hisob/sozlama").json() == {"google": True}
        state = oqim(c)
        r = c.get("/api/hisob/google/qaytish", params={"code": "yaxshi-kod", "state": state})
        assert r.status_code == 302 and r.headers["location"] == "/kirish/"
        u = c.get("/api/hisob/men").json()["user"]
        assert u["email"] == "bola@gmail.com" and u["rol"] == "student" and u["login"] is None and u["parol_bor"] is False
        # ikkinchi marta — o'sha foydalanuvchi
        state = oqim(c)
        c.get("/api/hisob/google/qaytish", params={"code": "yaxshi-kod", "state": state})
        assert sql("select count(*) as n from users")[0]["n"] == 1


def test_google_xatolar(toza, google_env):
    with mijoz({"sub": "g-777", "email": "bola@gmail.com", "email_verified": True}) as c:
        oqim(c)
        yomon = [{"code": "yaxshi-kod", "state": "boshqa"}, {"code": "yomon-kod", "state": c.cookies.get("kj_google")}, {"state": "x"}]
        for p in yomon:
            r = c.get("/api/hisob/google/qaytish", params=p)
            assert r.headers["location"] == "/kirish/?xato=google", p
        assert sql("select count(*) as n from users")[0]["n"] == 0


def test_admin_email_bilan_bogʻlanadi(toza, google_env):
    assert "admin" in asyncio.run(cli.make_admin(TEST_DB, "Ustoz@Gmail.com"))
    with mijoz({"sub": "g-1", "email": "ustoz@gmail.com", "email_verified": True}) as c:
        c.get("/api/hisob/google/qaytish", params={"code": "yaxshi-kod", "state": oqim(c)})
        assert c.get("/api/hisob/men").json()["user"]["rol"] == "admin"
    # tasdiqlanmagan email bilan bog'lanmaydi
    asyncio.run(cli.make_admin(TEST_DB, "boshqa@gmail.com"))
    with mijoz({"sub": "g-2", "email": "boshqa@gmail.com", "email_verified": False}) as c:
        c.get("/api/hisob/google/qaytish", params={"code": "yaxshi-kod", "state": oqim(c)})
        assert c.get("/api/hisob/men").json()["user"]["rol"] == "student"

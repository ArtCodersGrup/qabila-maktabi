from fastapi.testclient import TestClient

from app.main import create_app
from tests.conftest import TEST_DB


def test_salomat_baza_bilan():
    with TestClient(create_app(TEST_DB)) as c:
        r = c.get("/api/salomat")
    assert r.status_code == 200
    assert r.json() == {"ok": True, "baza": True}


def test_salomat_baza_yoq():
    # 1-port — hech kim tinglamaydi: baza yo'q holati
    with TestClient(create_app("postgresql+psycopg://localhost:1/yoq")) as c:
        r = c.get("/api/salomat")
    assert r.status_code == 503
    assert r.json() == {"ok": False, "baza": False}


def test_hujjat_sahifalari_yopiq():
    with TestClient(create_app(TEST_DB)) as c:
        for yol in ("/docs", "/redoc", "/openapi.json"):
            assert c.get(yol).status_code == 404

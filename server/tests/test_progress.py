import pytest
from fastapi.testclient import TestClient

from app import progress as P
from app.main import create_app
from tests.conftest import TEST_DB, sql, user_yarat

ORIGIN = {"Origin": "https://kelajagim.uz"}


def test_bosqichlar_birlashadi():
    a = {"done": [True, False, False], "stars": [2, 0, 0], "hard": [False, False, False]}
    b = {"done": [True, True, False], "stars": [1, 3, 0], "hard": [True, False, False], "muted": True}
    assert P.birlashtir("rim-toshi:v1", a, b) == {"done": [True, True, False], "stars": [2, 3, 0], "hard": [True, False, False]}
    assert P.birlashtir("rim-toshi:v1", None, b) == {"done": [True, True, False], "stars": [1, 3, 0], "hard": [True, False, False]}
    # uzunlik o'zgardi (o'yinga bosqich qo'shildi) — yangisi olinadi
    c = {"done": [True, False, False, False], "stars": [1, 0, 0, 0], "hard": [False] * 4}
    assert P.birlashtir("rim-toshi:v1", a, c) == c


def test_yaroqsiz_shakl():
    for kalit, q in [("rim-toshi:v1", {"done": [True], "stars": [5], "hard": [False]}),
                     ("rim-toshi:v1", {"done": [True], "stars": [1]}),
                     ("rim-toshi:v1", {"done": [True], "stars": [1, 2], "hard": [False]}),
                     ("rim-toshi:v1", {"done": [True] * 31, "stars": [1] * 31, "hard": [False] * 31}),
                     ("Rim toshi", {"done": [True], "stars": [1], "hard": [False]}),
                     ("qabila:toifa:v1", "kichik"),
                     ("on-barmoq:rekord", -5), ("on-barmoq:rekord", 99999), ("on-barmoq:rekord", True),
                     ("masalalar:holat:v1", {"a b": {"foiz": 10}}), ("masalalar:holat:v1", [1])]:
        assert P.birlashtir(kalit, None, q) is None, (kalit, q)


def test_rekord_va_masalalar():
    assert P.birlashtir("on-barmoq:rekord", 180, 150) == 180
    assert P.birlashtir("on-barmoq:rekord", 150, 180.6) == 181
    eski = {"yigindi": {"foiz": 60, "yechilgan": False, "urinish": 3, "ochilgan": [1, 2]}}
    yangi = {"yigindi": {"foiz": 40, "yechilgan": True, "urinish": 2, "ochilgan": [2, 5]}, "toq-juft": {"foiz": 100, "yechilgan": True, "urinish": 1}}
    assert P.birlashtir("masalalar:holat:v1", eski, yangi) == {
        "yigindi": {"foiz": 60, "yechilgan": True, "urinish": 3, "ochilgan": [1, 2, 5]},
        "toq-juft": {"foiz": 100, "yechilgan": True, "urinish": 1, "ochilgan": []},
    }


@pytest.fixture
def c(toza):
    with TestClient(create_app(TEST_DB), base_url="https://testserver", headers=ORIGIN) as client:
        yield client


def test_progress_endpoint(c):
    user_yarat(login="ali4821", parol="qovun123")
    assert c.post("/api/progress", json={"kalitlar": {}}).status_code == 401
    c.post("/api/hisob/kirish", json={"login": "ali4821", "parol": "qovun123"})
    r = c.post("/api/progress", json={"kalitlar": {
        "rim-toshi:v1": {"done": [True, False], "stars": [3, 0], "hard": [False, False], "muted": False},
        "on-barmoq:rekord": 120,
        "yomon kalit": 1,
    }})
    assert r.status_code == 200
    assert r.json()["kalitlar"] == {"rim-toshi:v1": {"done": [True, False], "stars": [3, 0], "hard": [False, False]}, "on-barmoq:rekord": 120}
    # boshqa qurilma: 2-bosqich tugagan, rekord pastroq — birlashadi, hammasi qaytadi
    r = c.post("/api/progress", json={"kalitlar": {"rim-toshi:v1": {"done": [False, True], "stars": [0, 2], "hard": [False, False]}, "on-barmoq:rekord": 90}})
    assert r.json()["kalitlar"] == {"rim-toshi:v1": {"done": [True, True], "stars": [3, 2], "hard": [False, False]}, "on-barmoq:rekord": 120}
    assert c.post("/api/progress", json={"kalitlar": {}}).json()["kalitlar"]["on-barmoq:rekord"] == 120  # faqat olish


def test_progress_cheklovlari(c):
    user_yarat(login="ali4821", parol="qovun123")
    c.post("/api/hisob/kirish", json={"login": "ali4821", "parol": "qovun123"})
    kop = {f"oyin{i}:v1": {"done": [True], "stars": [1], "hard": [False]} for i in range(201)}
    assert c.post("/api/progress", json={"kalitlar": kop}).status_code == 422
    sql("update users set parol_almashtirsin = true")
    assert c.post("/api/progress", json={"kalitlar": {}}).json() == {"detail": "parol-almashtir"}

# 3b-bo'lak: sinflar, o'quvchi akkauntlari, progress sinxroni, o'qituvchi paneli — amalga oshirish rejasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:**
- O'qituvchi sinf ochadi va o'quvchi akkauntlarini yaratadi (login + bir martalik parol, chop etiladigan kartochkalar).
- Mustaqil o'quvchi sinf kodi bilan qo'shiladi.
- Kirgan bolaning progressi serverga yoziladi va qurilmalar orasida birlashadi.
- O'qituvchi panelida sinf jadvali ko'rinadi: bo'limlar bo'yicha %, ★, 🔥, rekordlar.

**Architecture:**
- Alembic 0003: `sinflar`, `sinf_azolari`, `progress` (`user_id, kalit, qiymat jsonb`).
- Progress birlashtirish faqat **serverda** (`app/progress.py`, sof funksiyalar): mijoz o'z qiymatlarini yuboradi, server birlashtirib hammasini qaytaradi.
- O'yinlar avvalgidek faqat localStorage bilan ishlaydi. `storage.js` `save()` kirgan foydalanuvchi uchun kalitni navbatga qo'yadi va `fetch(keepalive)` bilan yuboradi.
- To'liq sinxron (yuborish + olish) `hisob.js` da: kirishda va bosh sahifada.
- O'qituvchi paneli `oqituvchi/panel/` — o'yinlar katalogini `bosh/js/bosh.js` dagi `QK.bosh` dan oladi.

**Tech Stack:** FastAPI, SQLAlchemy Core, PostgreSQL jsonb, pytest; vanilla JS; Playwright.

**Spec:** `docs/superpowers/specs/2026-10-04-akkaunt-server-design.md` (3-bo'lak: Jadvallar, Progress oqimi, Sahifalar)

## Global Constraints

- Sinfni faqat **o'qituvchi** yoki **admin** boshqaradi (`faol` + rol). Har kim faqat **o'z** sinfini ko'radi (admin — hammasini).
- Parolni tiklash faqat shu o'qituvchi **o'zi yaratgan** o'quvchiga mumkin (yoki admin). Begona akkauntni egallab olish bo'lmasin.
- Cheklovlar:
  - o'qituvchida ≤ 30 sinf;
  - sinfda ≤ 60 a'zo;
  - bitta so'rovda ≤ 40 o'quvchi yaratiladi;
  - sinf nomi 1–40 belgi.
- Sinf kodi: 6 belgi, alifbo `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (0/O, 1/I/L yo'q). Noto'g'ri kod urinishlari cheklanadi: 15 daqiqada 10 ta.
- O'quvchi logini: ism birinchi so'zining lotin harflari (≤ 8, `oʻ→o`, `gʻ→g`; harf bo'lmasa `oquvchi`) + 4 tasodifiy raqam, masalan `ali4821`.
- Bir martalik parol: 6 raqam, `parol_almashtirsin = true`. Parol faqat yaratilgan/tiklangan javobda bir marta qaytadi, bazada xesh.
- Progress kalitlari va birlashtirish qoidalari:
  - `<nom>:v<raqam>` (`^[a-z0-9-]{1,40}:v\d{1,3}$`) — `{done: bool[], stars: 0..3[], hard: bool[]}`, uzunliklar teng, ≤ 30. Birlashtirish: done/hard — YOKI, stars — max. Uzunlik farq qilsa — yangi kelgani olinadi.
  - `masalalar:holat:v1` — `{<id>: {foiz 0..100, yechilgan, urinish, ochilgan: int[]}}`, ≤ 500 masala. Birlashtirish: foiz max, yechilgan YOKI, urinish max, ochilgan birlashma (≤ 50).
  - `on-barmoq:rekord` — son 1..3000. Birlashtirish: max.
  - Boshqa kalit yoki noto'g'ri shakl — jim tashlab yuboriladi. Bitta so'rovda ≤ 200 kalit.
  - `muted` serverga yuborilmaydi va mahalliy qiymati saqlanib qoladi.
- Umumiy qurilma: chiqishda progress kalitlari, `qabila:egasi:v1` va navbat tozalanadi. Kirishda qurilmada **mehmon** progressi bo'lsa, bir marta so'raladi: "Bu yulduzlar seniki?".
- Ism hech qayerda ochiq ko'rinmaydi: faqat o'qituvchi panelida va o'quvchining o'z profilida.
- Xato kodlari (3a ga qo'shimcha): `sinf-kop`, `sinf-toʻla`, `kod-notogri`, `allaqachon`, `nom-notogri`, `ismlar-notogri`, `ruxsat-yoq`, `topilmadi`.

---

### Task 1: Jadvallar (0003) va progress birlashtirish

**Files:**
- Create: `server/migrations/versions/0003_sinflar_progress.py`, `server/app/progress.py`
- Modify: `server/app/main.py` (router), `server/tests/test_migratsiya.py` (`"0003"`), `server/tests/conftest.py` (truncate ro'yxati o'zgarmaydi — `users cascade` hammasini tozalaydi)
- Test: `server/tests/test_progress.py`

**Interfaces:**
- Produces:
  - `progress.birlashtir(kalit, eski, yangi) -> qiymat | None` (None — kalit/shakl yaroqsiz);
  - `progress.tozala(kalit, qiymat) -> qiymat | None` (shaklni tekshiradi va tozalaydi);
  - `POST /api/progress {kalitlar: {kalit: qiymat}}` → `{"kalitlar": {foydalanuvchining hamma kalitlari, birlashtirilgan}}` (`faol` kerak);
  - `progress.hammasi(conn, user_id) -> dict`.

- [ ] **Step 1: Failing test**

`server/tests/test_progress.py`:
```python
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
```

- [ ] **Step 2: Run — fail.** `.venv/bin/pytest -q tests/test_progress.py` → `ImportError: app.progress`

- [ ] **Step 3: Implementation**

`server/migrations/versions/0003_sinflar_progress.py`:
```python
"""Sinflar, a'zolar va progress.

Revision ID: 0003
Revises: 0002
"""
from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        create table sinflar (
            id bigserial primary key,
            oqituvchi_id bigint not null references users(id) on delete cascade,
            nom text not null check (char_length(nom) between 1 and 40),
            kod text not null unique check (kod ~ '^[A-HJKMNP-Z2-9]{6}$'),
            yaratilgan timestamptz not null default now()
        )
    """)
    op.execute("create index sinflar_oqituvchi on sinflar(oqituvchi_id)")
    op.execute("""
        create table sinf_azolari (
            sinf_id bigint not null references sinflar(id) on delete cascade,
            user_id bigint not null references users(id) on delete cascade,
            holat text not null check (holat in ('sorov', 'qabul')),
            yaratilgan timestamptz not null default now(),
            primary key (sinf_id, user_id)
        )
    """)
    op.execute("create index sinf_azolari_user on sinf_azolari(user_id)")
    op.execute("""
        create table progress (
            user_id bigint not null references users(id) on delete cascade,
            kalit text not null,
            qiymat jsonb not null,
            yangilangan timestamptz not null default now(),
            primary key (user_id, kalit)
        )
    """)


def downgrade() -> None:
    op.execute("drop table progress")
    op.execute("drop table sinf_azolari")
    op.execute("drop table sinflar")
```

`server/app/progress.py`:
```python
# Progress: o'yin bosqichlari, masalalar holati va rekordlar. Birlashtirish faqat shu yerda (sof funksiyalar):
# bosqich tugagani va qiyin rejim — YOKI, yulduz va rekord — eng kattasi. Hech narsa yo'qolmaydi.
import json
import re

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field
from sqlalchemy import text

from .deps import db, faol

router = APIRouter(prefix="/api/progress")

_OYIN = re.compile(r"[a-z0-9-]{1,40}:v\d{1,3}")
_MASALA_ID = re.compile(r"[a-z0-9_-]{1,40}")
MASALALAR = "masalalar:holat:v1"
REKORD = "on-barmoq:rekord"


def _butun(v, lo, hi):
    return isinstance(v, int) and not isinstance(v, bool) and lo <= v <= hi


def _bosqichlar(q):
    if not isinstance(q, dict):
        return None
    done, stars, hard = q.get("done"), q.get("stars"), q.get("hard")
    if not all(isinstance(x, list) for x in (done, stars, hard)):
        return None
    n = len(done)
    if not 1 <= n <= 30 or len(stars) != n or len(hard) != n:
        return None
    if not all(isinstance(x, bool) for x in done + hard) or not all(_butun(s, 0, 3) for s in stars):
        return None
    return {"done": done, "stars": stars, "hard": hard}


def _masalalar(q):
    if not isinstance(q, dict) or len(q) > 500:
        return None
    out = {}
    for k, v in q.items():
        if not _MASALA_ID.fullmatch(str(k)) or not isinstance(v, dict):
            return None
        foiz, urinish, ochilgan = v.get("foiz", 0), v.get("urinish", 0), v.get("ochilgan", [])
        if not _butun(foiz, 0, 100) or not _butun(urinish, 0, 100000) or not isinstance(ochilgan, list):
            return None
        out[k] = {"foiz": foiz, "yechilgan": v.get("yechilgan") is True, "urinish": urinish,
                  "ochilgan": sorted({x for x in ochilgan if _butun(x, 1, 1000)})[:50]}
    return out


def _rekord(q):
    if isinstance(q, bool) or not isinstance(q, (int, float)) or not 1 <= q <= 3000:
        return None
    return round(q)


def tozala(kalit, q):
    if kalit == MASALALAR:
        return _masalalar(q)
    if kalit == REKORD:
        return _rekord(q)
    if _OYIN.fullmatch(kalit):
        return _bosqichlar(q)
    return None


def birlashtir(kalit, eski, yangi):
    y = tozala(kalit, yangi)
    if y is None:
        return None
    e = tozala(kalit, eski) if eski is not None else None
    if e is None:
        return y
    if kalit == REKORD:
        return max(e, y)
    if kalit == MASALALAR:
        out = dict(e)
        for k, v in y.items():
            w = out.get(k)
            out[k] = v if w is None else {
                "foiz": max(w["foiz"], v["foiz"]), "yechilgan": w["yechilgan"] or v["yechilgan"],
                "urinish": max(w["urinish"], v["urinish"]), "ochilgan": sorted(set(w["ochilgan"]) | set(v["ochilgan"]))[:50]}
        return out
    if len(e["done"]) != len(y["done"]):
        return y  # o'yinning bosqichlari soni o'zgargan — yangisi
    return {"done": [a or b for a, b in zip(e["done"], y["done"])],
            "stars": [max(a, b) for a, b in zip(e["stars"], y["stars"])],
            "hard": [a or b for a, b in zip(e["hard"], y["hard"])]}


async def hammasi(conn, user_id: int) -> dict:
    rows = await conn.execute(text("select kalit, qiymat from progress where user_id = :u"), {"u": user_id})
    return {r.kalit: r.qiymat for r in rows}


class Sinxron(BaseModel):
    kalitlar: dict = Field(default_factory=dict, max_length=200)


@router.post("")
async def sinxron(body: Sinxron, request: Request, u=Depends(faol), conn=Depends(db)):
    if body.kalitlar:
        bor = await hammasi(conn, u["id"])
        for kalit, q in body.kalitlar.items():
            yangi = birlashtir(str(kalit), bor.get(kalit), q)
            if yangi is None or yangi == bor.get(kalit):
                continue
            await conn.execute(text(
                "insert into progress(user_id, kalit, qiymat) values (:u, :k, cast(:q as jsonb)) "
                "on conflict (user_id, kalit) do update set qiymat = excluded.qiymat, yangilangan = now()"),
                {"u": u["id"], "k": kalit, "q": json.dumps(yangi)})
        await conn.commit()
    return {"kalitlar": await hammasi(conn, u["id"])}
```

`server/app/main.py` — import va ulash:
- `from .progress import router as progress_router`;
- `app.include_router(admin_router)` dan keyin `app.include_router(progress_router)`.

`server/tests/test_migratsiya.py`: `"0002"` → `"0003"`.

- [ ] **Step 4: Run — pass.** `.venv/bin/pytest -q`

- [ ] **Step 5: Commit** — `git commit -m "server: sinf va progress jadvallari (0003), progress birlashtirish va /api/progress"`

---

### Task 2: Sinflar API

**Files:**
- Create: `server/app/sinflar.py`
- Modify: `server/app/main.py` (router)
- Test: `server/tests/test_sinflar.py`

**Interfaces:**
- Consumes: `deps.faol`, `deps.db`, `parol`, `progress.hammasi`, `app.state.cheklov_login`.
- Produces:
  - `login_asos(ism) -> str`, `yangi_kod() -> str`, `bir_martalik() -> str`;
  - O'qituvchi/admin uchun:
    - `GET /api/sinflar` → `{"sinflar": [{id, nom, kod, soni, sorovlar}]}`;
    - `POST /api/sinflar {nom}` → `{"sinf": {id, nom, kod}}`;
    - `GET /api/sinflar/{id}` → `{"sinf": {...}, "oquvchilar": [{id, ism, login, email, oxirgi_kirish, meniki}], "sorovlar": [{id, ism, email}]}`;
    - `POST /api/sinflar/{id}/oquvchilar {ismlar: [str]}` → `{"yangi": [{id, ism, login, parol}]}`;
    - `POST /api/sinflar/{id}/oquvchilar/{uid}/parol` → `{id, ism, login, parol}`;
    - `POST /api/sinflar/{id}/sorovlar/{uid} {qaror: "qabul"|"rad"}` → `{ok}`;
    - `POST /api/sinflar/{id}/chiqar/{uid}` → `{ok}`;
    - `GET /api/sinflar/{id}/progress` → `{"oquvchilar": {uid: {kalit: qiymat}}}`.
  - O'quvchi uchun:
    - `POST /api/sinflar/qoshil {kod}` → `{"sinf": {nom}}`;
    - `GET /api/sinflar/meniki` → `{"sinflar": [{nom, oqituvchi, holat}]}`.

- [ ] **Step 1: Failing test**

`server/tests/test_sinflar.py`:
```python
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
```

- [ ] **Step 2: Run — fail.** `.venv/bin/pytest -q tests/test_sinflar.py` → `ImportError: app.sinflar`

- [ ] **Step 3: Implementation**

`server/app/sinflar.py`:
```python
# /api/sinflar — o'qituvchi sinf ochadi, o'quvchi akkauntlarini yaratadi, so'rovlarni qabul qiladi, progressni ko'radi.
# O'quvchi sinf kodi bilan qo'shiladi. Har o'qituvchi faqat o'z sinfini ko'radi (admin — hammasini).
import re
import secrets
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import text
from starlette.concurrency import run_in_threadpool

from . import parol, sessiya
from .deps import db, faol
from .hisob import ism_toza

router = APIRouter(prefix="/api/sinflar")

KOD_ALIFBO = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"  # 0/O va 1/I/L yo'q — doskadan o'qish oson
MAX_SINF, MAX_AZO, MAX_YARATISH = 30, 60, 40


def yangi_kod() -> str:
    return "".join(secrets.choice(KOD_ALIFBO) for _ in range(6))


def login_asos(ism: str) -> str:
    s = ism.lower()
    for a, b in (("oʻ", "o"), ("gʻ", "g"), ("o'", "o"), ("g'", "g"), ("o‘", "o"), ("g‘", "g")):
        s = s.replace(a, b)
    birinchi = re.split(r"[^a-zʻʼ'‘’`]+", s.strip())[0]
    harflar = re.sub(r"[^a-z]", "", birinchi)[:8]
    return harflar or "oquvchi"


def bir_martalik() -> str:
    return f"{secrets.randbelow(10 ** 6):06d}"


async def oqituvchi(u=Depends(faol)):
    if u["rol"] not in ("teacher", "admin"):
        raise HTTPException(403, "ruxsat-yoq")
    return u


async def _sinf(conn, sid: int, u) -> dict:
    r = (await conn.execute(text("select id, nom, kod, oqituvchi_id from sinflar where id = :s"), {"s": sid})).mappings().first()
    if r is None or (u["rol"] != "admin" and r["oqituvchi_id"] != u["id"]):
        raise HTTPException(404, "topilmadi")
    return dict(r)


class Nom(BaseModel):
    nom: str = Field(max_length=80)


class Ismlar(BaseModel):
    ismlar: list[str] = Field(max_length=MAX_YARATISH)


class Qaror(BaseModel):
    qaror: Literal["qabul", "rad"]


class Kod(BaseModel):
    kod: str = Field(max_length=20)


# ---------- O'quvchi ----------

@router.post("/qoshil")
async def qoshil(body: Kod, request: Request, u=Depends(faol), conn=Depends(db)):
    if not u["ism"]:
        raise HTTPException(400, "ism-kerak")
    cl, k = request.app.state.cheklov_login, f"kod:{u['id']}"
    if cl.bandmi(k):
        raise HTTPException(429, "kop-urinish")
    s = (await conn.execute(text("select id, nom from sinflar where kod = :k"), {"k": body.kod.strip().upper()})).mappings().first()
    if s is None:
        cl.xato(k)
        raise HTTPException(404, "kod-notogri")
    bor = (await conn.execute(text("select 1 from sinf_azolari where sinf_id = :s and user_id = :u"), {"s": s["id"], "u": u["id"]})).first()
    if bor:
        raise HTTPException(409, "allaqachon")
    soni = (await conn.execute(text("select count(*) from sinf_azolari where sinf_id = :s"), {"s": s["id"]})).scalar()
    if soni >= MAX_AZO:
        raise HTTPException(409, "sinf-toʻla")
    await conn.execute(text("insert into sinf_azolari(sinf_id, user_id, holat) values (:s, :u, 'sorov')"), {"s": s["id"], "u": u["id"]})
    await conn.commit()
    return {"sinf": {"nom": s["nom"]}}


@router.get("/meniki")
async def meniki(u=Depends(faol), conn=Depends(db)):
    rows = await conn.execute(text(
        "select s.nom, o.ism as oqituvchi, a.holat from sinf_azolari a join sinflar s on s.id = a.sinf_id "
        "join users o on o.id = s.oqituvchi_id where a.user_id = :u order by a.yaratilgan"), {"u": u["id"]})
    return {"sinflar": [dict(r) for r in rows.mappings()]}


# ---------- O'qituvchi ----------

@router.get("")
async def royxat(u=Depends(oqituvchi), conn=Depends(db)):
    rows = await conn.execute(text(
        "select s.id, s.nom, s.kod, "
        "count(a.user_id) filter (where a.holat = 'qabul') as soni, "
        "count(a.user_id) filter (where a.holat = 'sorov') as sorovlar "
        "from sinflar s left join sinf_azolari a on a.sinf_id = s.id "
        "where s.oqituvchi_id = :u group by s.id order by s.id"), {"u": u["id"]})
    return {"sinflar": [dict(r) for r in rows.mappings()]}


@router.post("")
async def yarat(body: Nom, u=Depends(oqituvchi), conn=Depends(db)):
    nom = " ".join(body.nom.split())
    if not 1 <= len(nom) <= 40:
        raise HTTPException(400, "nom-notogri")
    soni = (await conn.execute(text("select count(*) from sinflar where oqituvchi_id = :u"), {"u": u["id"]})).scalar()
    if soni >= MAX_SINF:
        raise HTTPException(409, "sinf-kop")
    for _ in range(20):
        kod = yangi_kod()
        if not (await conn.execute(text("select 1 from sinflar where kod = :k"), {"k": kod})).first():
            break
    sid = (await conn.execute(text("insert into sinflar(oqituvchi_id, nom, kod) values (:u, :n, :k) returning id"),
                              {"u": u["id"], "n": nom, "k": kod})).scalar()
    await conn.commit()
    return {"sinf": {"id": sid, "nom": nom, "kod": kod}}


@router.get("/{sid}")
async def sinf(sid: int, u=Depends(oqituvchi), conn=Depends(db)):
    s = await _sinf(conn, sid, u)
    rows = (await conn.execute(text(
        "select u.id, u.ism, u.login, u.email, u.oxirgi_kirish, (u.kim_yaratgan = :o) as meniki, a.holat "
        "from sinf_azolari a join users u on u.id = a.user_id where a.sinf_id = :s order by u.ism, u.id"),
        {"s": sid, "o": s["oqituvchi_id"]})).mappings().all()
    oquvchilar = [{"id": r["id"], "ism": r["ism"], "login": r["login"], "email": r["email"],
                   "oxirgi_kirish": r["oxirgi_kirish"].isoformat() if r["oxirgi_kirish"] else None, "meniki": bool(r["meniki"])}
                  for r in rows if r["holat"] == "qabul"]
    sorovlar = [{"id": r["id"], "ism": r["ism"], "email": r["email"]} for r in rows if r["holat"] == "sorov"]
    return {"sinf": {"id": s["id"], "nom": s["nom"], "kod": s["kod"]}, "oquvchilar": oquvchilar, "sorovlar": sorovlar}


async def _login_top(conn, asos: str) -> str:
    for _ in range(50):
        login = f"{asos}{secrets.randbelow(10 ** 4):04d}"
        if not (await conn.execute(text("select 1 from users where login = :l"), {"l": login})).first():
            return login
    raise HTTPException(500, "login-topilmadi")


@router.post("/{sid}/oquvchilar")
async def oquvchi_qosh(sid: int, body: Ismlar, u=Depends(oqituvchi), conn=Depends(db)):
    s = await _sinf(conn, sid, u)
    ismlar = [ism_toza(i) for i in body.ismlar]
    if not ismlar or any(i is None for i in ismlar):
        raise HTTPException(400, "ismlar-notogri")
    soni = (await conn.execute(text("select count(*) from sinf_azolari where sinf_id = :s"), {"s": sid})).scalar()
    if soni + len(ismlar) > MAX_AZO:
        raise HTTPException(409, "sinf-toʻla")
    yangi = []
    for ism in ismlar:
        login = await _login_top(conn, login_asos(ism))
        p = bir_martalik()
        xesh = await run_in_threadpool(parol.xeshla, p)
        uid = (await conn.execute(text(
            "insert into users(login, parol_xesh, ism, parol_almashtirsin, kim_yaratgan) values (:l, :x, :i, true, :k) returning id"),
            {"l": login, "x": xesh, "i": ism, "k": s["oqituvchi_id"]})).scalar()
        await conn.execute(text("insert into sinf_azolari(sinf_id, user_id, holat) values (:s, :u, 'qabul')"), {"s": sid, "u": uid})
        yangi.append({"id": uid, "ism": ism, "login": login, "parol": p})
    await conn.commit()
    return {"yangi": yangi}


@router.post("/{sid}/oquvchilar/{uid}/parol")
async def parol_tikla(sid: int, uid: int, u=Depends(oqituvchi), conn=Depends(db)):
    s = await _sinf(conn, sid, u)
    r = (await conn.execute(text(
        "select u.id, u.ism, u.login, u.kim_yaratgan from users u join sinf_azolari a on a.user_id = u.id "
        "where a.sinf_id = :s and u.id = :i and a.holat = 'qabul'"), {"s": sid, "i": uid})).mappings().first()
    if r is None:
        raise HTTPException(404, "topilmadi")
    if r["login"] is None or (u["rol"] != "admin" and r["kim_yaratgan"] != s["oqituvchi_id"]):
        raise HTTPException(403, "ruxsat-yoq")
    p = bir_martalik()
    xesh = await run_in_threadpool(parol.xeshla, p)
    await conn.execute(text("update users set parol_xesh = :x, parol_almashtirsin = true where id = :i"), {"x": xesh, "i": uid})
    await sessiya.boshqalarini_yop(conn, uid, "")  # hamma qurilmadagi kirish yopiladi
    await conn.commit()
    return {"id": r["id"], "ism": r["ism"], "login": r["login"], "parol": p}


@router.post("/{sid}/sorovlar/{uid}")
async def sorov_qaror(sid: int, uid: int, body: Qaror, u=Depends(oqituvchi), conn=Depends(db)):
    await _sinf(conn, sid, u)
    if body.qaror == "qabul":
        q = "update sinf_azolari set holat = 'qabul' where sinf_id = :s and user_id = :u and holat = 'sorov' returning user_id"
    else:
        q = "delete from sinf_azolari where sinf_id = :s and user_id = :u and holat = 'sorov' returning user_id"
    if (await conn.execute(text(q), {"s": sid, "u": uid})).scalar() is None:
        raise HTTPException(404, "topilmadi")
    await conn.commit()
    return {"ok": True}


@router.post("/{sid}/chiqar/{uid}")
async def chiqar(sid: int, uid: int, u=Depends(oqituvchi), conn=Depends(db)):
    await _sinf(conn, sid, u)
    if (await conn.execute(text("delete from sinf_azolari where sinf_id = :s and user_id = :u returning user_id"),
                           {"s": sid, "u": uid})).scalar() is None:
        raise HTTPException(404, "topilmadi")
    await conn.commit()
    return {"ok": True}


@router.get("/{sid}/progress")
async def sinf_progressi(sid: int, u=Depends(oqituvchi), conn=Depends(db)):
    await _sinf(conn, sid, u)
    rows = await conn.execute(text(
        "select p.user_id, p.kalit, p.qiymat from progress p join sinf_azolari a on a.user_id = p.user_id "
        "where a.sinf_id = :s and a.holat = 'qabul'"), {"s": sid})
    out: dict = {}
    for r in rows:
        out.setdefault(str(r.user_id), {})[r.kalit] = r.qiymat
    return {"oquvchilar": out}
```

Eslatma: `/qoshil` va `/meniki` `/{sid}` dan **oldin** e'lon qilingan (FastAPI yo'llarni tartib bilan tekshiradi; `sid: int` baribir matnni qabul qilmaydi, lekin aniqlik uchun).

`server/app/main.py`: `from .sinflar import router as sinflar_router` + `app.include_router(sinflar_router)`.

- [ ] **Step 4: Run — pass.** `.venv/bin/pytest -q`

- [ ] **Step 5: Commit** — `git commit -m "server: sinflar — oʻquvchi yaratish, parol tiklash, kod bilan qoʻshilish, sinf progressi"`

---

### Task 3: Mijoz — progress sinxroni (storage.js navbati + hisob.js to'liq sinxron)

**Files:**
- Modify: `oyinlar/umumiy/js/storage.js` (navbat), `oyinlar/umumiy/js/hisob.js` (sinxron, tozalash, sinf API), `oyinlar/masalalar/js/holat.js` va `oyinlar/23-on-barmoq/js/typing-ui.js` (navbatga qo'yish), `oyinlar/masalalar/index.html` (+ storage.js), `bosh/js/bosh.js` (faqat `#list` bo'lsa chizadi), `bosh/js/hisob-tugma.js` (fonda sinxron)
- Test: `oyinlar/umumiy/tests/hisob.test.js` (qo'shimcha)

**Interfaces:**
- Produces:
  - `QK.storage.navbatga(kalit)` — kirgan bo'lsa kalitni navbatga qo'yadi va 1.5 s dan keyin yuboradi;
  - `QK.storage.KIRGAN = "qabila:hisob:v1"`;
  - `QK.hisob.progressKalitlari(store) -> string[]` (sof: `store` = `{length, key(i), getItem(k)}`);
  - `QK.hisob.egasi() -> number | null`, `QK.hisob.mehmonBor() -> bool`, `QK.hisob.sinxron(userId) -> {ok}`, `QK.hisob.tozala()`;
  - `QK.hisob.sinf = { royxat, yarat(nom), olish(id), qosh(id, ismlar), parol(id, uid), qaror(id, uid, q), chiqar(id, uid), progress(id), qoshil(kod), meniki() }`;
  - `chiqish()` endi progressni ham tozalaydi.

- [ ] **Step 1: Failing test** — `oyinlar/umumiy/tests/hisob.test.js` oxiriga:
```js
test("progress kalitlari: bosqichli o'yinlar, masalalar, rekord — sozlamalar emas", () => {
  const d = {
    "rim-toshi:v1": JSON.stringify({ done: [true, false], stars: [3, 0], hard: [false, false], muted: false }),
    "tog:v1": JSON.stringify({ done: [], stars: [], hard: [], muted: true }),
    "masalalar:holat:v1": JSON.stringify({ yigindi: { foiz: 50 } }),
    "on-barmoq:rekord": "120",
    "qabila:toifa:v1": "kichik",
    "qabila:hisob:v1": JSON.stringify({ ism: "Ali K.", rol: "student" }),
    "masalalar:filtr:v1": JSON.stringify({ daraja: "oson" }),
    "buzuq:v1": "{",
  };
  const keys = Object.keys(d);
  const store = { length: keys.length, key: (i) => keys[i], getItem: (k) => d[k] };
  assert.deepEqual(H.progressKalitlari(store).sort(), ["masalalar:holat:v1", "on-barmoq:rekord", "rim-toshi:v1"]);
});

test("storage.js: kirgan bo'lsa saqlanganini navbatga qo'yadi, masalalar va o'n barmoq ham", () => {
  const st = oqi("oyinlar/umumiy/js/storage.js");
  assert.match(st, /navbatga\(key\)/);
  assert.match(st, /keepalive: true/);
  assert.match(st, /\/api\/progress/);
  assert.match(oqi("oyinlar/masalalar/js/holat.js"), /navbatga\(kalit\)/);
  assert.match(oqi("oyinlar/23-on-barmoq/js/typing-ui.js"), /navbatga\(BEST_KEY\)/);
  assert.ok(skriptlar("oyinlar/masalalar/index.html").includes("../umumiy/js/storage.js"));
});
```

Run: `node --test oyinlar/umumiy/tests/hisob.test.js` → FAIL (`H.progressKalitlari is not a function`).

- [ ] **Step 2: Implementation**

`oyinlar/umumiy/js/storage.js` — `save` ichidagi `setItem` dan keyin `navbatga(key);` chaqiriladi. `create` dan oldin quyidagi blok qo'shiladi; eksport `root.QK.storage = { create, navbatga, KIRGAN };` bo'ladi:
```js
  // ---------- Akkaunt bilan sinxron ----------
  // Bola kirgan bo'lsa (hisob.js "qabila:hisob:v1" ni yozadi) va sayt o'z serverida ochilgan bo'lsa,
  // saqlangan kalit navbatga qo'yiladi va serverga yuboriladi. Internet bo'lmasa — navbatda qoladi.
  const KIRGAN = "qabila:hisob:v1";
  const NAVBAT = "qabila:navbat:v1";
  const OZIMIZ = ["kelajagim.uz", "www.kelajagim.uz", "localhost", "127.0.0.1"];
  let taymer = null;

  function kirganmi() {
    try {
      const loc = root.location;
      return !!loc && /^https?:$/.test(loc.protocol) && OZIMIZ.includes(loc.hostname) && !!root.localStorage.getItem(KIRGAN);
    } catch (e) {
      return false;
    }
  }

  function navbat() {
    try {
      const n = JSON.parse(root.localStorage.getItem(NAVBAT) || "[]");
      return Array.isArray(n) ? n.filter((k) => typeof k === "string").slice(0, 200) : [];
    } catch (e) {
      return [];
    }
  }

  function navbatga(key) {
    if (!kirganmi()) return;
    try {
      const n = navbat();
      if (!n.includes(key)) n.push(key);
      root.localStorage.setItem(NAVBAT, JSON.stringify(n.slice(-200)));
    } catch (e) {
      return;
    }
    clearTimeout(taymer);
    taymer = setTimeout(yubor, 1500);
  }

  function yubor() {
    if (!kirganmi() || typeof root.fetch !== "function") return;
    const n = navbat();
    if (!n.length) return;
    const kalitlar = {};
    for (const k of n) {
      try {
        const v = JSON.parse(root.localStorage.getItem(k));
        if (v && typeof v === "object" && !Array.isArray(v)) delete v.muted;
        if (v != null) kalitlar[k] = v;
      } catch (e) { /* buzuq yozuv — yuborilmaydi */ }
    }
    root.fetch("/api/progress", {
      method: "POST", credentials: "same-origin", keepalive: true,
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kalitlar }),
    }).then((r) => {
      if (!r.ok) return;
      // Yuborilganlari navbatdan chiqadi (shu orada qo'shilgan yangilari qoladi)
      try {
        root.localStorage.setItem(NAVBAT, JSON.stringify(navbat().filter((k) => !n.includes(k))));
      } catch (e) { /* e'tiborsiz */ }
    }, () => { /* internet yo'q — navbatda qoladi */ });
  }

  if (root.addEventListener) {
    root.addEventListener("online", yubor);
    setTimeout(yubor, 2000); // oldingi sahifadan qolgan navbat
  }
```

`oyinlar/masalalar/js/holat.js` — `yozKalit` ichida, `setItem` dan keyin:
```js
      if (root.QK && root.QK.storage && root.QK.storage.navbatga) root.QK.storage.navbatga(kalit);
```
(`try` bloki ichida, `setItem` qatoridan keyin.) Filtr kaliti ham navbatga tushadi — server uni jim tashlab yuboradi.

`oyinlar/23-on-barmoq/js/typing-ui.js` — `saveBest` dagi `setItem` dan keyin:
```js
      if (root.QK && root.QK.storage && root.QK.storage.navbatga) root.QK.storage.navbatga(BEST_KEY);
```

`oyinlar/masalalar/index.html` — birinchi `oyinlar`/`umumiy` skriptidan oldin `<script src="../umumiy/js/storage.js"></script>`. Agar sahifada `umumiy/js/*.js` skriptlari bo'lsa, ularning birinchisidan oldin qo'yiladi.

`oyinlar/umumiy/js/hisob.js` — qo'shimchalar (`api` obyektiga):
```js
  const EGASI = "qabila:egasi:v1"; // bu qurilmadagi progress kimniki (user id)
  const NAVBAT = "qabila:navbat:v1";
  const MAXSUS = ["masalalar:holat:v1", "on-barmoq:rekord"];

  // localStorage dagi progress kalitlari: bosqichli o'yinlar (done bor va bo'sh emas), masalalar, o'n barmoq rekordi
  function progressKalitlari(store) {
    const out = [];
    for (let i = 0; i < store.length; i++) {
      const k = store.key(i);
      if (!k || k.startsWith("qabila:")) continue;
      if (MAXSUS.includes(k)) { out.push(k); continue; }
      if (!/^[a-z0-9-]{1,40}:v\d{1,3}$/.test(k)) continue;
      try {
        const v = JSON.parse(store.getItem(k));
        if (v && Array.isArray(v.done) && v.done.length > 0) out.push(k);
      } catch (e) { /* buzuq */ }
    }
    return out;
  }

  function egasi() {
    try {
      const n = Number(root.localStorage.getItem(EGASI));
      return Number.isInteger(n) && n > 0 ? n : null;
    } catch (e) {
      return null;
    }
  }

  // Qurilmada kimgadir tegishli bo'lmagan (mehmon) progress bormi
  function mehmonBor() {
    try {
      return egasi() === null && progressKalitlari(root.localStorage).length > 0;
    } catch (e) {
      return false;
    }
  }

  // To'liq sinxron: mahalliy progressni yuboradi, serverdan birlashtirilganini oladi va yozadi
  async function sinxron(userId) {
    let ls;
    try { ls = root.localStorage; } catch (e) { return { ok: false, xato: "xotira" }; }
    const kalitlar = {};
    for (const k of progressKalitlari(ls)) {
      try {
        const v = JSON.parse(ls.getItem(k));
        if (v && typeof v === "object" && !Array.isArray(v)) delete v.muted;
        kalitlar[k] = v;
      } catch (e) { /* buzuq */ }
    }
    const r = await sorov("/api/progress", { kalitlar });
    if (!r.ok) return r;
    for (const [k, v] of Object.entries(r.kalitlar || {})) {
      try {
        let yoz = v;
        if (v && typeof v === "object" && Array.isArray(v.done)) {
          // ovoz tanlovi faqat shu qurilmaniki — saqlanib qoladi
          let muted = false;
          try { muted = !!(JSON.parse(ls.getItem(k)) || {}).muted; } catch (e) { /* yo'q */ }
          yoz = Object.assign({}, v, { muted });
        }
        ls.setItem(k, JSON.stringify(yoz));
      } catch (e) { /* joy yo'q */ }
    }
    try {
      ls.setItem(EGASI, String(userId));
      ls.removeItem(NAVBAT);
    } catch (e) { /* e'tiborsiz */ }
    return { ok: true };
  }

  // Chiqishda: bu qurilmadagi progress keyingi bolaga o'tib ketmasin
  function tozala() {
    try {
      const ls = root.localStorage;
      for (const k of progressKalitlari(ls)) ls.removeItem(k);
      ls.removeItem(EGASI);
      ls.removeItem(NAVBAT);
    } catch (e) { /* e'tiborsiz */ }
  }
```
`chiqish` o'zgaradi:
```js
    async chiqish() {
      const r = await sorov("/api/hisob/chiqish", {});
      if (r.ok) { eslab(null); tozala(); }
      return r;
    },
```
`api` ga qo'shiladi: `progressKalitlari, egasi, mehmonBor, sinxron, tozala,` va:
```js
    sinf: {
      royxat: () => sorov("/api/sinflar"),
      yarat: (nom) => sorov("/api/sinflar", { nom }),
      olish: (id) => sorov("/api/sinflar/" + Number(id)),
      qosh: (id, ismlar) => sorov("/api/sinflar/" + Number(id) + "/oquvchilar", { ismlar }),
      parol: (id, uid) => sorov("/api/sinflar/" + Number(id) + "/oquvchilar/" + Number(uid) + "/parol", {}),
      qaror: (id, uid, qaror) => sorov("/api/sinflar/" + Number(id) + "/sorovlar/" + Number(uid), { qaror }),
      chiqar: (id, uid) => sorov("/api/sinflar/" + Number(id) + "/chiqar/" + Number(uid), {}),
      progress: (id) => sorov("/api/sinflar/" + Number(id) + "/progress"),
      qoshil: (kod) => sorov("/api/sinflar/qoshil", { kod }),
      meniki: () => sorov("/api/sinflar/meniki"),
    },
```

`bosh/js/bosh.js` oxirgi qatori: `if (root.document) render();` → `if (root.document && root.document.getElementById("list")) render(); // o'qituvchi paneli faqat katalogni oladi`

`bosh/js/hisob-tugma.js` — `H.men().then(...)` ichida, `r.ok` bo'lsa:
```js
    if (r.ok) {
      yoz(r.user);
      // Boshqa qurilmadagi yulduzlar shu yerga ham kelsin. Mehmon progressi bo'lsa — kirish sahifasida so'raladi.
      const u = r.user;
      if (!u.parol_almashtirsin && (H.egasi() === u.id || !H.mehmonBor())) {
        H.sinxron(u.id).then((s) => { if (s.ok && root.QK.bosh) root.QK.bosh.render(); });
      }
    }
```

- [ ] **Step 3: Run — pass.** `node --test 2>&1 | grep -E "^ℹ (pass|fail)"` → `fail 0`

- [ ] **Step 4: Commit** — `git commit -m "Progress sinxroni: storage navbati, toʻliq sinxron, chiqishda tozalash"`

---

### Task 4: Kirish sahifasi (mehmon progressi savoli, sinflarim) va o'qituvchi paneli

**Files:**
- Modify: `kirish/kirish.js`
- Create: `oqituvchi/panel/index.html`, `oqituvchi/panel/panel.js`
- Modify: `oyinlar/umumiy/css/hisob.css` (jadval, kartochkalar, chop etish)
- Test: `oyinlar/umumiy/tests/hisob.test.js` (panel sahifasi skriptlari)

**Interfaces:**
- Consumes: `QK.hisob.*` (Task 3), `QK.bosh.GAMES/SECTIONS`.
- Produces:
  - `oqituvchi/panel/` sahifasi;
  - `panel.js` sof funksiyasi `QK.panelHisob(kalitlar, GAMES, SECTIONS) -> {bolimlar: [{id, title, tugagan, jami}], yulduz, qiyin, rekord, masalalar}` (Node'da test qilinadi).

- [ ] **Step 1: Failing test** — `hisob.test.js` oxiriga:
```js
test("o'qituvchi paneli: skriptlar va sinf hisobi", () => {
  assert.deepEqual(skriptlar("oqituvchi/panel/index.html"), [
    "../../oyinlar/umumiy/js/storage.js", "../../bosh/js/bosh.js", "../../oyinlar/umumiy/js/hisob.js", "panel.js"]);
  const P = require("../../../oqituvchi/panel/panel.js");
  const GAMES = [{ topic: "kod", key: "a:v1", stages: 3 }, { topic: "kod", key: "b:v1", stages: 2 }, { topic: "ai", key: "c:v1", stages: 3 }];
  const SECTIONS = [{ id: "kod", title: "Kodlash" }, { id: "ai", title: "AI" }, { id: "bosh", title: "Bo'sh" }];
  const h = P.hisobla({
    "a:v1": { done: [true, true, false], stars: [3, 2, 0], hard: [true, false, false] },
    "c:v1": { done: [true, true, true], stars: [1, 1, 1], hard: [false, false, false] },
    "on-barmoq:rekord": 140,
    "masalalar:holat:v1": { x: { yechilgan: true }, y: { yechilgan: false }, z: { yechilgan: true } },
  }, GAMES, SECTIONS);
  assert.deepEqual(h.bolimlar, [{ id: "kod", title: "Kodlash", tugagan: 2, jami: 5 }, { id: "ai", title: "AI", tugagan: 3, jami: 3 }]);
  assert.equal(h.yulduz, 8);
  assert.equal(h.qiyin, 1);
  assert.equal(h.rekord, 140);
  assert.equal(h.masalalar, 2);
  assert.equal(h.foiz, 63); // 5 / 8 bosqich
});
```

Run → FAIL.

- [ ] **Step 2: `kirish/kirish.js` o'zgarishlari**

1. `keyingi(u)` → profilga o'tishdan oldin sinxron:
```js
  function keyingi(u) {
    if (u.parol_almashtirsin) return parolEkrani(true);
    if (!u.ism) return ismEkrani();
    sinxronQil(u);
  }

  // Qurilmada mehmon (kirmagan bola) yulduzlari bo'lsa — bir marta so'raymiz: umumiy kompyuterda
  // boshqa bolaning yulduzlari bu akkauntga o'tib ketmasin
  async function sinxronQil(u) {
    if (H.egasi() !== u.id && H.mehmonBor()) {
      ekran("Bu yulduzlar seniki?",
        h("p", { class: "hisob-izoh", text: "Bu qurilmada kirmasdan oʻynalgan oʻyinlar bor. Ularni oʻzing oʻynagan boʻlsang — akkauntingga qoʻshamiz." }),
        h("div", { class: "hisob-tugmalar" },
          tugma("Ha, meniki", async () => { await H.sinxron(u.id); profilEkrani(u); }),
          tugma("Yoʻq, boshqa bolaniki", async () => { H.tozala(); await H.sinxron(u.id); profilEkrani(u); }, "secondary")));
      return;
    }
    if (H.egasi() !== null && H.egasi() !== u.id) H.tozala(); // boshqa akkauntning qoldig'i
    await H.sinxron(u.id);
    profilEkrani(u);
  }
```

2. `profilEkrani(u)` — teacher qismi o'rniga:
```js
    if (u.rol === "teacher" || u.rol === "admin") kids.push(h("a", { class: "btn big", href: "../oqituvchi/panel/", text: "Oʻqituvchi paneli" }));
```
(eski "tez orada" kartasi olib tashlanadi; admin tugmasi saqlanadi.) O'quvchi uchun (`u.rol === "student"`), tugmalar qatoridan oldin `kids.push(sinflarim())`:
```js
  // O'quvchining sinflari va sinf kodi bilan qo'shilish
  function sinflarim() {
    const karta = h("div", { class: "hisob-karta" }, h("p", { class: "hisob-qator-nom", text: "Sinfim" }));
    const royxat = h("div", {}, h("p", { class: "hisob-izoh", text: "Yuklanmoqda…" }));
    const kod = input({ maxlength: "6", autocapitalize: "characters", autocomplete: "off", spellcheck: "false", placeholder: "AB3K7Q" });
    const f = forma([maydon("Sinf kodi (oʻqituvchidan)", kod)], "Qoʻshilish", async () => {
      const r = await H.sinf.qoshil(kod.value);
      if (!r.ok) return r.xato;
      kod.value = "";
      yangila();
      return null;
    });
    async function yangila() {
      const r = await H.sinf.meniki();
      royxat.innerHTML = "";
      if (!r.ok) return;
      if (!r.sinflar.length) royxat.append(h("p", { class: "hisob-izoh", text: "Hali sinfga qoʻshilmagansan." }));
      for (const s of r.sinflar) {
        royxat.append(h("div", { class: "hisob-qator" },
          h("div", {}, h("div", { class: "hisob-qator-nom", text: s.nom }), h("div", { class: "hisob-qator-izoh", text: "Oʻqituvchi: " + (s.oqituvchi || "—") })),
          h("span", { class: "hisob-qator-izoh", text: s.holat === "qabul" ? "✓ aʼzo" : "⏳ kutilmoqda" })));
      }
    }
    yangila();
    karta.append(royxat, f);
    return karta;
  }
```
XATOLAR ga qo'shiladi: `"kod-notogri": "Bunday sinf kodi yoʻq. Oʻqituvchidan qayta soʻrang."`, `allaqachon: "Bu sinfga soʻrov allaqachon yuborilgan."`, `"sinf-toʻla": "Sinf toʻla."`.

- [ ] **Step 3: O'qituvchi paneli**

`oqituvchi/panel/index.html`:
```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Oʻqituvchi paneli — Qabila maktabi</title>
  <link rel="icon" href="../../bosh/icon.svg">
  <meta name="theme-color" content="#FFF6E5">
  <meta name="robots" content="noindex">
  <link rel="stylesheet" href="../../oyinlar/umumiy/css/asos.css">
  <link rel="stylesheet" href="../../oyinlar/umumiy/css/hisob.css">
</head>
<body>
  <div class="hisob-app">
    <main class="hisob keng" id="hisob" aria-live="polite"></main>
  </div>
  <script src="../../oyinlar/umumiy/js/storage.js"></script>
  <script src="../../bosh/js/bosh.js"></script>
  <script src="../../oyinlar/umumiy/js/hisob.js"></script>
  <script src="panel.js"></script>
</body>
</html>
```

`oqituvchi/panel/panel.js`:
```js
// O'qituvchi paneli: sinflar → sinf (kod, so'rovlar, o'quvchilar jadvali) → o'quvchi tafsiloti.
// O'quvchi qo'shish va parol tiklash — chop etiladigan kirish kartochkalari (parol faqat shu yerda bir marta ko'rinadi).
(function (root) {
  "use strict";

  // ---------- Sof qism: bitta o'quvchining progressidan jadval qatori ----------
  function hisobla(kalitlar, GAMES, SECTIONS) {
    const bolimlar = [];
    let yulduz = 0, qiyin = 0, tugagan = 0, jami = 0;
    for (const s of SECTIONS) {
      const oyinlar = GAMES.filter((g) => g.topic === s.id);
      if (!oyinlar.length) continue;
      let t = 0, j = 0;
      for (const g of oyinlar) {
        j += g.stages;
        const q = kalitlar[g.key];
        if (!q || !Array.isArray(q.done)) continue;
        t += q.done.filter(Boolean).length;
        yulduz += (q.stars || []).reduce((a, b) => a + (Number(b) || 0), 0);
        qiyin += (q.hard || []).filter(Boolean).length;
      }
      bolimlar.push({ id: s.id, title: s.title, tugagan: t, jami: j });
      tugagan += t;
      jami += j;
    }
    const m = kalitlar["masalalar:holat:v1"];
    const masalalar = m && typeof m === "object" ? Object.values(m).filter((x) => x && x.yechilgan).length : 0;
    const rekord = Number(kalitlar["on-barmoq:rekord"]) || 0;
    return { bolimlar, yulduz, qiyin, rekord, masalalar, foiz: jami ? Math.round((tugagan / jami) * 100) : 0 };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { hisobla };
    return;
  }

  const H = root.QK.hisob;
  const B = root.QK.bosh;
  const box = root.document.getElementById("hisob");

  function h(tag, attrs, ...kids) {
    const el = root.document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "text") el.textContent = v;
      else if (k === "onClick") el.addEventListener("click", v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids) if (kid) el.append(kid);
    return el;
  }
  const tugma = (text, onClick, cls) => h("button", { class: "btn " + (cls || ""), type: "button", text, onClick });
  const XATOLAR = {
    "nom-notogri": "Sinf nomi 1–40 belgi boʻlsin.",
    "sinf-kop": "Sinflar soni chegarasiga yetdingiz (30).",
    "sinf-toʻla": "Sinfda 60 tadan ortiq oʻquvchi boʻlmaydi.",
    "ismlar-notogri": "Har qatorda bitta ism boʻlsin, masalan «Ali K.» (2–40 harf).",
    "ruxsat-yoq": "Bu amalga ruxsat yoʻq.",
    tarmoq: "Server bilan aloqa yoʻq.",
  };
  const xabar = (kod) => XATOLAR[kod] || "Nimadir xato ketdi. Qayta urinib koʻring.";
  const OYLAR = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  const sana = (iso) => { if (!iso) return "hali kirmagan"; const d = new Date(iso); return `${d.getDate()}-${OYLAR[d.getMonth()]}`; };
  const SAYT = root.location.host + "/kirish";

  function ekran(orqaga, sarlavha, ...kids) {
    box.innerHTML = "";
    box.append(orqaga, h("h1", { class: "hisob-h1", text: sarlavha }), ...kids);
    root.scrollTo({ top: 0 });
  }
  const akkauntga = () => h("a", { class: "hisob-bosh", href: "../../kirish/", text: "◀︎ Akkaunt" });
  const orqagaTugma = (text, fn) => h("button", { class: "hisob-bosh hisob-bosh-btn", type: "button", text: "◀︎ " + text, onClick: fn });

  // ---------- Sinflar ro'yxati ----------
  async function sinflar() {
    const men = await H.men();
    if (!men.ok || !["teacher", "admin"].includes(men.user.rol) || men.user.parol_almashtirsin) {
      ekran(akkauntga(), "Oʻqituvchi paneli",
        h("p", { class: "hisob-izoh", text: "Bu sahifa oʻqituvchilar uchun. Avval oʻqituvchi akkaunti bilan kiring." }),
        h("a", { class: "btn", href: "../../kirish/", text: "Kirish" }));
      return;
    }
    const r = await H.sinf.royxat();
    if (!r.ok) return ekran(akkauntga(), "Oʻqituvchi paneli", h("p", { class: "hisob-xato", text: xabar(r.xato) }), tugma("Qayta urinish", sinflar));
    const royxat = h("div", { class: "hisob-karta" });
    if (!r.sinflar.length) royxat.append(h("p", { class: "hisob-izoh", text: "Hali sinf yoʻq. Birinchisini oching." }));
    for (const s of r.sinflar) {
      royxat.append(h("button", { class: "hisob-qator hisob-qator-btn", type: "button", onClick: () => sinf(s.id) },
        h("div", {}, h("div", { class: "hisob-qator-nom", text: s.nom }),
          h("div", { class: "hisob-qator-izoh", text: `${s.soni} oʻquvchi` + (s.sorovlar ? ` · ${s.sorovlar} ta soʻrov` : "") })),
        h("span", { class: "sinf-kod-kichik", text: s.kod })));
    }
    const nom = h("input", { class: "hisob-input", maxlength: "40", placeholder: "5-A sinf" });
    const xato = h("p", { class: "hisob-xato", role: "alert" });
    const f = h("form", { class: "hisob-form" }, h("label", { class: "hisob-maydon" }, h("span", { text: "Yangi sinf nomi" }), nom), xato,
      h("button", { class: "btn", type: "submit", text: "Sinf ochish" }));
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const y = await H.sinf.yarat(nom.value);
      if (y.ok) sinf(y.sinf.id);
      else xato.textContent = xabar(y.xato);
    });
    ekran(akkauntga(), "Oʻqituvchi paneli", royxat, f);
  }

  // ---------- Bitta sinf ----------
  async function sinf(id) {
    const [r, p] = await Promise.all([H.sinf.olish(id), H.sinf.progress(id)]);
    if (!r.ok || !p.ok) return ekran(orqagaTugma("Sinflar", sinflar), "Sinf", h("p", { class: "hisob-xato", text: xabar((r.ok ? p : r).xato) }));
    const kod = h("div", { class: "hisob-karta sinf-kod-karta" },
      h("span", { class: "hisob-qator-izoh", text: "Sinf kodi — oʻzi kirgan oʻquvchilar shu kod bilan qoʻshiladi:" }),
      h("span", { class: "sinf-kod", text: r.sinf.kod }));
    const kids = [kod, h("div", { class: "hisob-tugmalar" }, tugma("Oʻquvchi qoʻshish", () => qoshish(r.sinf)))];
    if (r.sorovlar.length) {
      const sk = h("div", { class: "hisob-karta eslatma" }, h("p", { class: "hisob-qator-nom", text: "Qoʻshilish soʻrovlari" }));
      for (const s of r.sorovlar) {
        sk.append(h("div", { class: "hisob-qator" },
          h("div", {}, h("div", { class: "hisob-qator-nom", text: s.ism || "—" }), h("div", { class: "hisob-qator-izoh", text: s.email || "" })),
          h("div", { class: "hisob-tugmalar" },
            tugma("Qabul", async () => { await H.sinf.qaror(id, s.id, "qabul"); sinf(id); }, "ok sm"),
            tugma("Rad", async () => { await H.sinf.qaror(id, s.id, "rad"); sinf(id); }, "secondary sm"))));
      }
      kids.push(sk);
    }
    if (!r.oquvchilar.length) {
      kids.push(h("p", { class: "hisob-izoh", text: "Sinfda hali oʻquvchi yoʻq. «Oʻquvchi qoʻshish» tugmasini bosing yoki sinf kodini bering." }));
    } else {
      const jadval = h("table", { class: "sinf-jadval" },
        h("thead", {}, h("tr", {}, ...["Oʻquvchi", "Bajargani", "★", "🔥", "Oʻn barmoq", "Masalalar", "Oxirgi kirish"].map((t) => h("th", { text: t })))));
      const tb = h("tbody");
      for (const o of r.oquvchilar) {
        const x = hisobla(p.oquvchilar[String(o.id)] || {}, B.GAMES, B.SECTIONS);
        tb.append(h("tr", { tabindex: "0", onClick: () => oquvchi(r.sinf, o, x) },
          h("td", {}, h("b", { text: o.ism || "—" }), h("div", { class: "hisob-qator-izoh", text: o.login || o.email || "" })),
          h("td", {}, h("div", { class: "sinf-bar" }, h("span", { style: `width:${x.foiz}%` })), h("div", { class: "hisob-qator-izoh", text: x.foiz + "%" })),
          h("td", { text: String(x.yulduz) }), h("td", { text: String(x.qiyin) }),
          h("td", { text: x.rekord ? x.rekord + " b/daq" : "—" }), h("td", { text: String(x.masalalar) }),
          h("td", { text: sana(o.oxirgi_kirish) })));
        tb.lastChild.addEventListener("keydown", (e) => { if (e.key === "Enter") oquvchi(r.sinf, o, x); });
      }
      jadval.append(tb);
      kids.push(h("div", { class: "sinf-jadval-oram" }, jadval));
    }
    ekran(orqagaTugma("Sinflar", sinflar), r.sinf.nom, ...kids);
  }

  // ---------- O'quvchi tafsiloti ----------
  function oquvchi(s, o, x) {
    const bolimlar = h("div", { class: "hisob-karta" });
    for (const b of x.bolimlar) {
      const f = b.jami ? Math.round((b.tugagan / b.jami) * 100) : 0;
      bolimlar.append(h("div", { class: "sinf-bolim" },
        h("span", { class: "hisob-qator-nom", text: b.title }),
        h("div", { class: "sinf-bar" }, h("span", { style: `width:${f}%` })),
        h("span", { class: "hisob-qator-izoh", text: `${b.tugagan} / ${b.jami}` })));
    }
    const xato = h("p", { class: "hisob-xato", role: "alert" });
    const amallar = h("div", { class: "hisob-tugmalar" });
    if (o.meniki && o.login) {
      amallar.append(tugma("Yangi bir martalik parol", async () => {
        const r = await H.sinf.parol(s.id, o.id);
        if (r.ok) kartochkalar(s, [r], "Parol yangilandi");
        else xato.textContent = xabar(r.xato);
      }, "secondary"));
    }
    amallar.append(tugma("Sinfdan chiqarish", async () => {
      if (!root.confirm(`${o.ism} sinfdan chiqarilsinmi? Akkaunti va yulduzlari saqlanib qoladi.`)) return;
      const r = await H.sinf.chiqar(s.id, o.id);
      if (r.ok) sinf(s.id);
      else xato.textContent = xabar(r.xato);
    }, "secondary"));
    ekran(orqagaTugma(s.nom, () => sinf(s.id)), o.ism || "Oʻquvchi",
      h("p", { class: "hisob-rol", text: (o.login ? "login: " + o.login : o.email || "") + ` · ★ ${x.yulduz} · 🔥 ${x.qiyin}` }),
      bolimlar, amallar, xato);
  }

  // ---------- O'quvchi qo'shish ----------
  function qoshish(s) {
    const matn = h("textarea", { class: "hisob-input sinf-ismlar", rows: "8", placeholder: "Ali K.\nOʻgʻiloy T.\nSardor M." });
    const xato = h("p", { class: "hisob-xato", role: "alert" });
    const btn = h("button", { class: "btn big", type: "submit", text: "Akkauntlarni yaratish" });
    const f = h("form", { class: "hisob-form" },
      h("label", { class: "hisob-maydon" }, h("span", { text: "Har qatorda bitta oʻquvchi: ism va familiyaning birinchi harfi" }), matn), xato, btn);
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const ismlar = matn.value.split("\n").map((x) => x.trim()).filter(Boolean);
      if (!ismlar.length) { xato.textContent = xabar("ismlar-notogri"); return; }
      btn.disabled = true;
      const r = await H.sinf.qosh(s.id, ismlar);
      btn.disabled = false;
      if (r.ok) kartochkalar(s, r.yangi, "Akkauntlar yaratildi");
      else xato.textContent = xabar(r.xato);
    });
    ekran(orqagaTugma(s.nom, () => sinf(s.id)), "Oʻquvchi qoʻshish",
      h("p", { class: "hisob-izoh", text: "Har bir oʻquvchiga login va bir martalik parol beriladi. Birinchi kirishda oʻquvchi oʻz parolini qoʻyadi." }), f);
    matn.focus();
  }

  // ---------- Kirish kartochkalari (chop etish uchun) ----------
  function kartochkalar(s, royxat, sarlavha) {
    const varaq = h("div", { class: "kartochkalar" });
    for (const y of royxat) {
      varaq.append(h("div", { class: "kartochka" },
        h("div", { class: "kartochka-sayt", text: "Qabila maktabi · " + SAYT }),
        h("div", { class: "kartochka-ism", text: y.ism }),
        h("div", { class: "kartochka-qator" }, h("span", { text: "Login" }), h("b", { text: y.login })),
        h("div", { class: "kartochka-qator" }, h("span", { text: "Parol" }), h("b", { text: y.parol })),
        h("div", { class: "kartochka-izoh", text: "Birinchi kirishda oʻz parolingni qoʻyasan." })));
    }
    ekran(orqagaTugma(s.nom, () => sinf(s.id)), sarlavha,
      h("div", { class: "hisob-karta eslatma ekranda" }, h("p", { class: "hisob-izoh", text: "Parollar faqat hozir koʻrinadi. Chop eting yoki yozib oling — keyin ularni koʻrib boʻlmaydi (faqat yangisini berish mumkin)." })),
      h("div", { class: "hisob-tugmalar ekranda" }, tugma("Chop etish", () => root.print()), tugma("Tayyor", () => sinf(s.id), "secondary")),
      varaq);
  }

  sinflar();
})(typeof window !== "undefined" ? window : globalThis);
```

`oyinlar/umumiy/css/hisob.css` oxiriga:
```css
/* ---------- O'qituvchi paneli ---------- */
.hisob-bosh-btn { border: 0; background: none; padding: 0; font: inherit; font-weight: 800; cursor: pointer; }
.hisob-qator-btn { width: 100%; min-height: 64px; padding: var(--s3); border: 2px solid var(--chiziq); border-radius: var(--r-m); background: var(--yuza-2); text-align: left; font: inherit; color: inherit; }
.sinf-kod-kichik { font-family: ui-monospace, Menlo, monospace; font-size: var(--t1); font-weight: 900; letter-spacing: 2px; color: var(--asosiy-matn); }
.sinf-kod-karta { align-items: center; text-align: center; }
.sinf-kod { font-family: ui-monospace, Menlo, monospace; font-size: var(--t4); font-weight: 900; letter-spacing: 6px; color: var(--asosiy-matn); }
.sinf-jadval-oram { overflow-x: auto; border: 2px solid var(--chiziq); border-radius: var(--r-l); background: var(--yuza); }
.sinf-jadval { width: 100%; border-collapse: collapse; font-size: var(--t-1); font-weight: 700; }
.sinf-jadval th, .sinf-jadval td { padding: 10px 12px; text-align: left; border-bottom: 1px solid var(--chiziq); white-space: nowrap; }
.sinf-jadval th { background: var(--panel); font-weight: 900; color: var(--matn-2); }
.sinf-jadval tbody tr { cursor: pointer; }
.sinf-jadval tbody tr:focus-visible { outline: 3px solid var(--asosiy); outline-offset: -3px; }
@media (hover: hover) { .sinf-jadval tbody tr:hover { background: var(--asosiy-och); } }
.sinf-bar { width: 96px; height: 10px; border-radius: var(--r-pill); background: #EAE2CF; overflow: hidden; }
.sinf-bar span { display: block; height: 100%; background: var(--togri); }
.sinf-bolim { display: grid; grid-template-columns: 1fr 120px 64px; align-items: center; gap: var(--s3); }
.sinf-bolim .sinf-bar { width: 100%; }
.sinf-ismlar { min-height: 200px; resize: vertical; font-size: var(--t0); line-height: 1.5; }
.kartochkalar { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--s3); }
.kartochka { display: flex; flex-direction: column; gap: 6px; padding: var(--s4); border: 2px dashed var(--chiziq-kuchli); border-radius: var(--r-m); background: var(--yuza); break-inside: avoid; }
.kartochka-sayt { font-size: 13px; font-weight: 800; color: var(--matn-3); }
.kartochka-ism { font-size: var(--t1); font-weight: 900; }
.kartochka-qator { display: flex; justify-content: space-between; gap: var(--s3); font-size: var(--t0); }
.kartochka-qator b { font-family: ui-monospace, Menlo, monospace; font-size: var(--t1); letter-spacing: 1px; }
.kartochka-izoh { font-size: 13px; font-weight: 700; color: var(--matn-3); }
@media print {
  body { background: #fff; }
  .hisob-app { padding: 0; }
  .hisob { max-width: none; padding: 0; }
  .hisob-bosh, .hisob-h1, .ekranda { display: none !important; }
  .kartochkalar { grid-template-columns: repeat(2, 1fr); gap: 8mm; }
  .kartochka { border-color: #888; }
}
```

- [ ] **Step 4: Run — pass.** `node --test 2>&1 | grep -E "^ℹ (pass|fail)"` → `fail 0`

- [ ] **Step 5: Commit** — `git commit -m "Oʻqituvchi paneli, sinflarim, mehmon yulduzlari savoli"`

---

### Task 5: Brauzerda sinov, deploy

- [ ] **Step 1:** Lokal server (`KELAJAGIM_STATIK=..`, port 8199). Bazada o'qituvchi (`ustoz01`) va admin bo'ladi.
- [ ] **Step 2: Playwright stsenariysi** (o'qituvchi 1280×800, o'quvchi 390×800):
  1. O'qituvchi kiradi → "Oʻqituvchi paneli" → sinf ochadi "5-A" → kod ko'rinadi.
  2. "O'quvchi qo'shish": 3 ism → kartochkalar (login + 6 raqamli parol). `Chop etish` sahifasi rasmi `page.emulateMedia({ media: "print" })` bilan olinadi.
  3. O'quvchi (boshqa kontekst) → avval **mehmon bo'lib** bitta o'yin bosqichini "tugatadi": `rim-toshi:v1` ni `QK.storage.create(...).save` bilan yozadi.
  4. O'quvchi kirish → bir martalik parol → o'z paroli → "Bu yulduzlar seniki?" → **Ha**.
  5. O'quvchi profilida "Sinfim: 5-A ✓ aʼzo" ko'rinadi.
  6. O'quvchi o'yin sahifasini ochib yana bitta bosqichni saqlaydi → 2 s kutish (navbat yuboriladi).
  7. O'qituvchi sinf sahifasini yangilaydi → o'quvchi qatorida foiz > 0 va ★ ko'rinadi → qatorni bosadi → bo'limlar.
  8. O'quvchi chiqadi → localStorage da `rim-toshi:v1` yo'q. Yana kiradi → so'rov chiqmaydi, yulduzlar serverdan qaytadi.
  9. Google'siz mustaqil o'quvchi oqimi pytest bilan qoplangan. Kod bilan qo'shilish UI'da: ikkinchi o'qituvchi yaratgan o'quvchi kodni kiritadi → birinchi o'qituvchida so'rov chiqadi → Qabul.
  10. Konsolda xato yo'q (401 kirmagan holatdan tashqari). Har ekran rasmi ko'rib chiqiladi.
- [ ] **Step 3: Deploy** — `git push && bash server/deploy/deploy.sh`. Serverda `alembic current` → `0003 (head)`. Jonli `oqituvchi/panel/` ochiladi.

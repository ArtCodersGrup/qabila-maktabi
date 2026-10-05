# 3a-bo'lak: kirish va rollar — amalga oshirish rejasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Foydalanuvchi akkaunti (login+parol va Google), sessiya cookie'si, majburiy parol almashtirish, ism, "O'qituvchiman" so'rovi, admin tasdig'i; `kirish/` va `admin/` sahifalari, bosh sahifada "Kirish / 👤 Ism" tugmasi.

**Architecture:**
- Server: `users` va `sessiyalar` jadvallari (alembic 0002); `/api/hisob/*` (kirish, chiqish, men, parol, profil, oqituvchi-sorov, sozlama, google); `/api/admin/*`.
- Sessiya: tasodifiy token `httpOnly; Secure; SameSite=Lax` cookie'da, bazada faqat uning sha256 xeshi saqlanadi.
- POST so'rovlarida `Origin` tekshiriladi.
- Mijoz: `oyinlar/umumiy/js/hisob.js` (fetch qatlami) + sahifalar. Service worker `/api/` ni keshlamaydi.
- Bu bo'lakda sinflar, progress va panel yo'q (3b).

**Tech Stack:** FastAPI, SQLAlchemy Core (`text()` so'rovlar, async), argon2-cffi, httpx (Google), pytest, `node --test`, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-04-akkaunt-server-design.md` (3-bo'lak: Auth, Sahifalar)

## Global Constraints

- Rollar: `student`, `teacher`, `admin`. O'qituvchi bo'lish faqat admin tasdig'i bilan. So'rovni faqat **login'siz** (Google) foydalanuvchi yuboradi.
- Login: `^[a-z0-9]{3,20}$` (kichik harfga keltiriladi). Parol: 6–72 belgi. Ism: 2–40 belgi, harf bilan boshlanadi, keyin harf, bo'sh joy, `. ' ʻ ʼ ‘ ’ \` -` (masalan "Ali K.", "Oʻgʻiloy T.").
- Parol xeshi argon2id: `time_cost=2, memory_cost=19456 KiB, parallelism=1` (server 1 CPU, 300 MB). Hisoblash `run_in_threadpool` da bajariladi.
- Cookie `kj_sessiya`, 60 kun.
- Xato urinishlar: login uchun 15 daqiqada 10 ta, IP uchun 15 daqiqada 30 ta → `429 kop-urinish`.
- POST/PUT/PATCH/DELETE `/api/*`: `Origin` `KELAJAGIM_ORIGINS` ro'yxatida bo'lishi shart (default `https://kelajagim.uz,https://www.kelajagim.uz,http://localhost:8199`), aks holda `403 origin`.
- Xato javobi shakli: `{"detail": "<kod>"}`. Kodlar: `kirilmagan`, `notogri`, `kop-urinish`, `parol-qisqa`, `eski-notogri`, `parol-yoq`, `parol-almashtir`, `ism-notogri`, `ism-kerak`, `mumkin-emas`, `ruxsat-yoq`, `topilmadi`, `google-yoq`, `origin`.
- Yozadigan endpoint `await conn.commit()` ni javobdan **oldin** o'zi chaqiradi. Ulanish dependency'si `engine.connect()` — commit qilinmagani yopilganda bekor bo'ladi.
- Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` muhitda bo'lmasa, Google tugmasi ko'rinmaydi va `/api/hisob/google` `503` qaytaradi. Qaytish manzili `GOOGLE_REDIRECT` (default `https://kelajagim.uz/api/hisob/google/qaytish`).
- Hamma matn o'zbekcha, lotin; `oʻ`/`gʻ` uchun U+02BB (sayt uslubi).

---

### Task 1: Ma'lumotlar bazasi (0002), parol va cheklov modullari

**Files:**
- Modify: `server/requirements.txt` (+ `argon2-cffi==23.1.0`, `httpx==0.28.1` — httpx dev'dan asosiyga), `server/requirements-dev.txt` (httpx qatori olib tashlanadi)
- Create: `server/migrations/versions/0002_akkauntlar.py`, `server/app/parol.py`, `server/app/cheklov.py`
- Modify: `server/tests/test_migratsiya.py` (`"0001"` → `"0002"`), `server/tests/conftest.py`
- Test: `server/tests/test_parol.py`

**Interfaces:**
- Produces:
  - `parol.yaxshimi(p) -> bool`, `parol.xeshla(p) -> str`, `parol.tekshir(xesh, p) -> bool`, `parol.SOXTA: str`;
  - `Cheklov(soni, oyna_soniya, soat=time.monotonic)` → `.bandmi(k)`, `.xato(k)`, `.tozala(k)`;
  - conftest: `baza` (session fixture, `alembic upgrade head`), `toza` (har testdan oldin `truncate users cascade`), `sql(query, **params)` yordamchisi, `user_yarat(...) -> int`.

- [ ] **Step 1: Failing test**

`server/tests/test_parol.py`:
```python
from app import parol
from app.cheklov import Cheklov


def test_parol_xesh_va_tekshiruv():
    x = parol.xeshla("qovun123")
    assert x.startswith("$argon2id$") and "qovun123" not in x
    assert parol.tekshir(x, "qovun123")
    assert not parol.tekshir(x, "qovun124")
    assert not parol.tekshir(None, "qovun123")
    assert not parol.tekshir("buzuq-xesh", "qovun123")


def test_parol_uzunligi():
    assert parol.yaxshimi("123456") and parol.yaxshimi("x" * 72)
    assert not parol.yaxshimi("12345") and not parol.yaxshimi("x" * 73) and not parol.yaxshimi(None)


def test_cheklov():
    vaqt = [0.0]
    c = Cheklov(3, 60, soat=lambda: vaqt[0])
    for _ in range(3):
        assert not c.bandmi("a")
        c.xato("a")
    assert c.bandmi("a") and not c.bandmi("b")
    vaqt[0] = 61
    assert not c.bandmi("a")  # oyna o'tdi
    c.xato("a"); c.tozala("a")
    assert not c.bandmi("a")
```

`server/tests/conftest.py` — to'liq yangi ko'rinishi:
```python
import os
import subprocess
import sys
from pathlib import Path

import pytest
from sqlalchemy import create_engine, text

# server/ papkasi import yo'lida bo'lsin (app paketi)
SERVER = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SERVER))

TEST_DB = os.environ.get("KELAJAGIM_TEST_DB", "postgresql+psycopg://localhost/kelajagim_test")
_engine = create_engine(TEST_DB)


@pytest.fixture(scope="session")
def baza():
    env = {**os.environ, "KELAJAGIM_DB": TEST_DB}
    r = subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], cwd=SERVER, env=env, capture_output=True, text=True)
    assert r.returncode == 0, r.stderr


@pytest.fixture
def toza(baza):
    with _engine.begin() as conn:
        conn.execute(text("truncate users restart identity cascade"))


def sql(query, **params):
    with _engine.begin() as conn:
        res = conn.execute(text(query), params)
        return res.mappings().all() if res.returns_rows else None


def user_yarat(login=None, parol=None, rol="student", ism=None, email=None, google_sub=None, almashtirsin=False):
    from app import parol as P
    xesh = P.xeshla(parol) if parol else None
    return sql(
        "insert into users(login, parol_xesh, rol, ism, email, google_sub, parol_almashtirsin) "
        "values (:l, :x, :r, :i, :e, :g, :a) returning id",
        l=login, x=xesh, r=rol, i=ism, e=email, g=google_sub, a=almashtirsin)[0]["id"]
```

`server/tests/test_migratsiya.py` da `== "0001"` → `== "0002"`.

- [ ] **Step 2: Run — fail.** `cd server && .venv/bin/pip install -q -r requirements-dev.txt && .venv/bin/pytest -q tests/test_parol.py` → `ImportError` (app.parol)

- [ ] **Step 3: Implementation**

`server/requirements.txt`:
```
fastapi==0.115.6
uvicorn[standard]==0.32.1
sqlalchemy[asyncio]==2.0.36
psycopg[binary]==3.2.3
alembic==1.14.0
argon2-cffi==23.1.0
httpx==0.28.1
```
`server/requirements-dev.txt`:
```
-r requirements.txt
pytest==8.3.4
```

`server/migrations/versions/0002_akkauntlar.py`:
```python
"""Akkauntlar: foydalanuvchilar va sessiyalar.

Revision ID: 0002
Revises: 0001
"""
from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        create table users (
            id bigserial primary key,
            rol text not null default 'student' check (rol in ('student', 'teacher', 'admin')),
            oqituvchi_sorov text check (oqituvchi_sorov in ('kutilmoqda', 'rad')),
            ism text check (char_length(ism) between 2 and 40),
            google_sub text unique,
            email text,
            login text unique check (login ~ '^[a-z0-9]{3,20}$'),
            parol_xesh text,
            parol_almashtirsin boolean not null default false,
            kim_yaratgan bigint references users(id) on delete set null,
            yaratilgan timestamptz not null default now(),
            oxirgi_kirish timestamptz
        )
    """)
    op.execute("create index users_sorov on users(oqituvchi_sorov) where oqituvchi_sorov is not null")
    op.execute("""
        create table sessiyalar (
            token_xesh bytea primary key,
            user_id bigint not null references users(id) on delete cascade,
            tugaydi timestamptz not null
        )
    """)
    op.execute("create index sessiyalar_user on sessiyalar(user_id)")


def downgrade() -> None:
    op.execute("drop table sessiyalar")
    op.execute("drop table users")
```

`server/app/parol.py`:
```python
# Parol xeshi: argon2id. Server kichik (1 CPU, 300 MB) — OWASP minimal sozlamasi: 19 MiB, 2 o'tish.
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

_ph = PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)
MIN, MAX = 6, 72


def yaxshimi(p) -> bool:
    return isinstance(p, str) and MIN <= len(p) <= MAX


def xeshla(p: str) -> str:
    return _ph.hash(p)


def tekshir(xesh, p) -> bool:
    if not xesh or not isinstance(p, str):
        return False
    try:
        return _ph.verify(xesh, p)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


# Login topilmasa ham xuddi shuncha vaqt ketsin (login bor-yo'qligi vaqtdan bilinmasin)
SOXTA = xeshla("soxta-parol-vaqt-uchun")
```

`server/app/cheklov.py`:
```python
# Xato urinishlarni sanash (xotirada): oyna ichida `soni` ta xato bo'lsa — kalit band.
import time


class Cheklov:
    def __init__(self, soni: int, oyna: float, soat=time.monotonic):
        self.soni = soni
        self.oyna = oyna
        self.soat = soat
        self.yozuv: dict[str, list[float]] = {}

    def _yangila(self, k: str) -> list[float]:
        chegara = self.soat() - self.oyna
        qolgan = [t for t in self.yozuv.get(k, []) if t > chegara]
        if qolgan:
            self.yozuv[k] = qolgan
        else:
            self.yozuv.pop(k, None)
        return qolgan

    def bandmi(self, k: str) -> bool:
        return len(self._yangila(k)) >= self.soni

    def xato(self, k: str) -> None:
        if len(self.yozuv) > 10_000:  # hujumda xotira o'smasin
            self.yozuv.clear()
        self._yangila(k)
        self.yozuv.setdefault(k, []).append(self.soat())

    def tozala(self, k: str) -> None:
        self.yozuv.pop(k, None)
```

- [ ] **Step 4: Run — pass.** `.venv/bin/pytest -q` → hammasi o'tadi.

- [ ] **Step 5: Commit** — `git add server && git commit -m "server: akkaunt jadvallari (0002), parol xeshi, urinishlar cheklovi"`

---

### Task 2: Sessiya, `/api/hisob` va Origin tekshiruvi

**Files:**
- Modify: `server/app/config.py`, `server/app/main.py`
- Create: `server/app/sessiya.py`, `server/app/deps.py`, `server/app/hisob.py`
- Test: `server/tests/test_hisob.py`

**Interfaces:**
- Consumes: Task 1.
- Produces:
  - `config.originlar() -> set[str]`;
  - `sessiya.COOKIE`, `sessiya.och(conn, user_id) -> str`, `sessiya.kim(conn, token) -> dict | None`, `sessiya.yop(conn, token)`, `sessiya.boshqalarini_yop(conn, user_id, token)`, `sessiya.korinish(u) -> dict`, `sessiya.cookie_qoy(resp, token)`, `sessiya.cookie_ochir(resp)`;
  - `deps.db`, `deps.joriy`, `deps.kirgan`, `deps.faol`, `deps.admin`;
  - `korinish(u)` maydonlari: `{id, rol, ism, login, email, parol_almashtirsin, oqituvchi_sorov, parol_bor}`;
  - endpointlar: `GET /api/hisob/men`, `POST /api/hisob/kirish {login, parol}`, `POST /api/hisob/chiqish`, `POST /api/hisob/parol {eski, yangi}`, `POST /api/hisob/profil {ism}`, `POST /api/hisob/oqituvchi-sorov`, `GET /api/hisob/sozlama` (Task 3 da to'ldiriladi).
  - Muvaffaqiyatli javob: `{"user": korinish}` (chiqish: `{"ok": true}`).

- [ ] **Step 1: Failing test**

`server/tests/test_hisob.py`:
```python
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
```

- [ ] **Step 2: Run — fail.** `.venv/bin/pytest -q tests/test_hisob.py` → 404 / ImportError

- [ ] **Step 3: Implementation**

`server/app/config.py` — to'liq:
```python
# Sozlamalar muhit o'zgaruvchilaridan olinadi (serverda /srv/kelajagim/api.env, systemd EnvironmentFile).
import os

ORIGINLAR = "https://kelajagim.uz,https://www.kelajagim.uz,http://localhost:8199"


def database_url() -> str:
    url = os.environ.get("KELAJAGIM_DB")
    if not url:
        raise RuntimeError("KELAJAGIM_DB muhit o'zgaruvchisi berilmagan")
    return url


def originlar() -> set[str]:
    # POST so'rovlari faqat shu sahifalardan (CSRF himoyasi)
    return {o.strip() for o in os.environ.get("KELAJAGIM_ORIGINS", ORIGINLAR).split(",") if o.strip()}


def google():
    """(client_id, client_secret) yoki None — Google ulanmagan."""
    cid, sec = os.environ.get("GOOGLE_CLIENT_ID"), os.environ.get("GOOGLE_CLIENT_SECRET")
    return (cid, sec) if cid and sec else None


def google_qaytish() -> str:
    return os.environ.get("GOOGLE_REDIRECT", "https://kelajagim.uz/api/hisob/google/qaytish")
```

`server/app/sessiya.py`:
```python
# Sessiya: tasodifiy token cookie'da, bazada faqat uning sha256 xeshi (baza o'g'irlansa ham token bilinmaydi).
import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import text

COOKIE = "kj_sessiya"
MUDDAT = timedelta(days=60)
USTUNLAR = ("u.id, u.rol, u.ism, u.login, u.email, u.parol_almashtirsin, u.oqituvchi_sorov, "
            "(u.parol_xesh is not null) as parol_bor")


def _xesh(token: str) -> bytes:
    return hashlib.sha256(token.encode()).digest()


async def och(conn, user_id: int) -> str:
    token = secrets.token_urlsafe(32)
    await conn.execute(text("insert into sessiyalar(token_xesh, user_id, tugaydi) values (:x, :u, :t)"),
                       {"x": _xesh(token), "u": user_id, "t": datetime.now(timezone.utc) + MUDDAT})
    await conn.execute(text("update users set oxirgi_kirish = now() where id = :u"), {"u": user_id})
    await conn.execute(text("delete from sessiyalar where tugaydi < now()"))  # eskilari tozalanadi
    return token


async def kim(conn, token):
    if not token or len(token) > 100:
        return None
    r = (await conn.execute(text(f"select {USTUNLAR} from sessiyalar s join users u on u.id = s.user_id "
                                 "where s.token_xesh = :x and s.tugaydi > now()"), {"x": _xesh(token)})).mappings().first()
    return dict(r) if r else None


async def yop(conn, token) -> None:
    if token:
        await conn.execute(text("delete from sessiyalar where token_xesh = :x"), {"x": _xesh(token)})


async def boshqalarini_yop(conn, user_id: int, token: str) -> None:
    await conn.execute(text("delete from sessiyalar where user_id = :u and token_xesh <> :x"),
                       {"u": user_id, "x": _xesh(token or "")})


def korinish(u: dict) -> dict:
    keys = ("id", "rol", "ism", "login", "email", "parol_almashtirsin", "oqituvchi_sorov", "parol_bor")
    return {k: u[k] for k in keys}


def cookie_qoy(response, token: str) -> None:
    response.set_cookie(COOKIE, token, max_age=int(MUDDAT.total_seconds()), httponly=True, secure=True, samesite="lax", path="/")


def cookie_ochir(response) -> None:
    response.delete_cookie(COOKIE, path="/", httponly=True, secure=True, samesite="lax")
```

`server/app/deps.py`:
```python
# Umumiy dependency'lar: baza ulanishi va joriy foydalanuvchi (rol tekshiruvi bilan).
# Ulanish engine.connect() — yozadigan endpoint javobdan oldin o'zi commit qiladi.
from fastapi import Depends, HTTPException, Request

from . import sessiya


async def db(request: Request):
    async with request.app.state.engine.connect() as conn:
        yield conn


async def joriy(request: Request, conn=Depends(db)):
    return await sessiya.kim(conn, request.cookies.get(sessiya.COOKIE))


async def kirgan(u=Depends(joriy)):
    if u is None:
        raise HTTPException(401, "kirilmagan")
    return u


async def faol(u=Depends(kirgan)):
    # Bir martalik parol bilan kirgan — avval o'z parolini qo'yadi
    if u["parol_almashtirsin"]:
        raise HTTPException(403, "parol-almashtir")
    return u


async def admin(u=Depends(faol)):
    if u["rol"] != "admin":
        raise HTTPException(403, "ruxsat-yoq")
    return u
```

`server/app/hisob.py`:
```python
# /api/hisob — kirish, chiqish, men, parol, profil, o'qituvchi so'rovi.
import re

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, Field
from sqlalchemy import text
from starlette.concurrency import run_in_threadpool

from . import config, parol, sessiya
from .deps import db, faol, kirgan

router = APIRouter(prefix="/api/hisob")

# Ism: harf bilan boshlanadi; keyin harf, bo'sh joy va . ' ʻ ʼ ‘ ’ ` - (masalan "Ali K.", "Oʻgʻiloy T.")
_ISM = re.compile(r"[^\W\d_][^\W\d_ .'ʻʼ‘’`-]*(?:[ .'ʻʼ‘’`-]+[^\W\d_]*)*\.?")


def ism_toza(s: str):
    if any(ord(ch) < 32 for ch in s):  # yangi qator, tab — bitta qatorli ism emas
        return None
    s = " ".join(s.split())
    return s if 2 <= len(s) <= 40 and _ISM.fullmatch(s) else None


class KirishSorov(BaseModel):
    login: str = Field(max_length=40)
    parol: str = Field(max_length=200)


class ParolSorov(BaseModel):
    eski: str = Field("", max_length=200)
    yangi: str = Field(max_length=200)


class ProfilSorov(BaseModel):
    ism: str = Field(max_length=80)


async def _men(conn, request, token=None):
    return {"user": sessiya.korinish(await sessiya.kim(conn, token or request.cookies.get(sessiya.COOKIE)))}


@router.get("/sozlama")
async def sozlama():
    return {"google": config.google() is not None}


@router.get("/men")
async def men(u=Depends(kirgan)):
    return {"user": sessiya.korinish(u)}


@router.post("/kirish")
async def kirish(body: KirishSorov, request: Request, response: Response, conn=Depends(db)):
    login = body.login.strip().lower()
    kl = "login:" + login
    ip = "ip:" + (request.client.host if request.client else "?")
    cl, ci = request.app.state.cheklov_login, request.app.state.cheklov_ip
    if cl.bandmi(kl) or ci.bandmi(ip):
        raise HTTPException(429, "kop-urinish")
    r = (await conn.execute(text("select id, parol_xesh from users where login = :l"), {"l": login})).first()
    xesh = r.parol_xesh if r is not None and r.parol_xesh else parol.SOXTA
    ok = await run_in_threadpool(parol.tekshir, xesh, body.parol)
    if r is None or not r.parol_xesh or not ok:
        cl.xato(kl)
        ci.xato(ip)
        raise HTTPException(401, "notogri")
    cl.tozala(kl)
    token = await sessiya.och(conn, r.id)
    await conn.commit()
    sessiya.cookie_qoy(response, token)
    return await _men(conn, request, token)


@router.post("/chiqish")
async def chiqish(request: Request, response: Response, conn=Depends(db)):
    await sessiya.yop(conn, request.cookies.get(sessiya.COOKIE))
    await conn.commit()
    sessiya.cookie_ochir(response)
    return {"ok": True}


@router.post("/parol")
async def parol_almashtir(body: ParolSorov, request: Request, u=Depends(kirgan), conn=Depends(db)):
    if not parol.yaxshimi(body.yangi):
        raise HTTPException(400, "parol-qisqa")
    if not u["parol_almashtirsin"]:
        xesh = (await conn.execute(text("select parol_xesh from users where id = :i"), {"i": u["id"]})).scalar()
        if not xesh:
            raise HTTPException(400, "parol-yoq")
        cl, k = request.app.state.cheklov_login, f"parol:{u['id']}"
        if cl.bandmi(k):
            raise HTTPException(429, "kop-urinish")
        if not await run_in_threadpool(parol.tekshir, xesh, body.eski):
            cl.xato(k)
            raise HTTPException(400, "eski-notogri")
    yangi = await run_in_threadpool(parol.xeshla, body.yangi)
    await conn.execute(text("update users set parol_xesh = :x, parol_almashtirsin = false where id = :i"), {"x": yangi, "i": u["id"]})
    await sessiya.boshqalarini_yop(conn, u["id"], request.cookies.get(sessiya.COOKIE))
    await conn.commit()
    return await _men(conn, request)


@router.post("/profil")
async def profil(body: ProfilSorov, request: Request, u=Depends(faol), conn=Depends(db)):
    ism = ism_toza(body.ism)
    if ism is None:
        raise HTTPException(400, "ism-notogri")
    await conn.execute(text("update users set ism = :s where id = :i"), {"s": ism, "i": u["id"]})
    await conn.commit()
    return await _men(conn, request)


@router.post("/oqituvchi-sorov")
async def oqituvchi_sorov(request: Request, u=Depends(faol), conn=Depends(db)):
    # O'qituvchi yaratgan o'quvchi (login bilan) va allaqachon o'qituvchi/admin so'rov yubormaydi
    if u["rol"] != "student" or u["login"] is not None:
        raise HTTPException(400, "mumkin-emas")
    if not u["ism"]:
        raise HTTPException(400, "ism-kerak")
    await conn.execute(text("update users set oqituvchi_sorov = 'kutilmoqda' where id = :i"), {"i": u["id"]})
    await conn.commit()
    return await _men(conn, request)
```

`server/app/main.py` — to'liq:
```python
# kelajagim.uz API. Hamma yo'llar /api ostida (nginx /api/ ni shu yerga uzatadi).
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from . import config
from .cheklov import Cheklov
from .db import baza_tirikmi, make_engine
from .hisob import router as hisob_router
from .xonalar import Boshqaruvchi, router as xonalar_router

XAVFSIZ = ("GET", "HEAD", "OPTIONS")


def create_app(db_url: str | None = None) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.engine = make_engine(db_url or config.database_url())
        yield
        await app.state.engine.dispose()

    # Avtomatik hujjat sahifalari yopiq — ochiq saytda API tuzilishi ko'rinmasin
    app = FastAPI(title="kelajagim", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)
    app.state.xonalar = Boshqaruvchi()
    app.state.cheklov_login = Cheklov(10, 15 * 60)
    app.state.cheklov_ip = Cheklov(30, 15 * 60)

    @app.middleware("http")
    async def origin_tekshir(request: Request, call_next):
        # CSRF: o'zgartiradigan so'rov faqat o'z sahifalarimizdan (brauzer Origin ni o'zi qo'yadi)
        if request.method not in XAVFSIZ and request.url.path.startswith("/api/"):
            if request.headers.get("origin") not in config.originlar():
                return JSONResponse({"detail": "origin"}, status_code=403)
        return await call_next(request)

    app.include_router(xonalar_router)
    app.include_router(hisob_router)

    @app.get("/api/salomat")
    async def salomat(response: Response):
        ok = await baza_tirikmi(app.state.engine)
        if not ok:
            response.status_code = 503
        return {"ok": ok, "baza": ok}

    # Faqat lokal sinov: sayt fayllari ham shu serverdan (serverda statikni nginx beradi)
    statik = os.environ.get("KELAJAGIM_STATIK")
    if statik:
        app.mount("/", StaticFiles(directory=statik, html=True), name="sayt")

    return app


app = create_app()
```

- [ ] **Step 4: Run — pass.** `.venv/bin/pytest -q` → hammasi o'tadi.

- [ ] **Step 5: Commit** — `git add server && git commit -m "server: sessiya, /api/hisob (kirish, parol, profil, oʻqituvchi soʻrovi), Origin tekshiruvi"`

---

### Task 3: Google orqali kirish, admin API va CLI

**Files:**
- Create: `server/app/google.py`, `server/app/admin.py`, `server/app/cli.py`
- Modify: `server/app/main.py` (2 router + `app.state.google`), `server/README.md` (admin yaratish, Google sozlamasi)
- Test: `server/tests/test_google.py`, `server/tests/test_admin.py`

**Interfaces:**
- Consumes: Task 2.
- Produces:
  - `GET /api/hisob/google` → 302 Google'ga (`kj_google` holat cookie'si, 10 daqiqa);
  - `GET /api/hisob/google/qaytish?code&state` → 302 `/kirish/` (muvaffaqiyat) yoki `/kirish/?xato=google`;
  - `app.state.google: async (code) -> {"sub", "email", "email_verified"}` (testda almashtiriladi);
  - `GET /api/admin/sorovlar` → `{"sorovlar": [{id, ism, email, yaratilgan}]}`;
  - `POST /api/admin/sorov/{id} {qaror: "tasdiq"|"rad"}` → `{"ok": true}`;
  - `GET /api/admin/statistika` → `{"rollar": {rol: soni}, "kutilmoqda": n}`;
  - CLI: `python -m app.cli make-admin <email|login>`, `python -m app.cli yangi-admin <login>` (bir martalik parolni chiqaradi); funksiyalar `make_admin(url, kim) -> str`, `yangi_admin(url, login) -> str` (parol).

- [ ] **Step 1: Failing tests**

`server/tests/test_google.py`:
```python
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
```

`server/tests/test_admin.py`:
```python
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
```

- [ ] **Step 2: Run — fail.** `.venv/bin/pytest -q tests/test_google.py tests/test_admin.py` → `ImportError: cannot import name 'cli'`

- [ ] **Step 3: Implementation**

`server/app/google.py`:
```python
# Google orqali kirish (OAuth 2.0 code oqimi, server tomonda). Kalitlar: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET.
import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlalchemy import text

from . import config, sessiya
from .deps import db

router = APIRouter(prefix="/api/hisob/google")
HOLAT = "kj_google"  # CSRF: Google'ga ketishdan oldingi tasodifiy qiymat
YOL = "/api/hisob/google"


async def foydalanuvchi(code: str) -> dict:
    """Google'dan kod evaziga {sub, email, email_verified} oladi."""
    cid, sec = config.google()
    async with httpx.AsyncClient(timeout=10) as c:
        t = await c.post("https://oauth2.googleapis.com/token", data={
            "code": code, "client_id": cid, "client_secret": sec,
            "redirect_uri": config.google_qaytish(), "grant_type": "authorization_code"})
        t.raise_for_status()
        i = await c.get("https://openidconnect.googleapis.com/v1/userinfo",
                        headers={"Authorization": "Bearer " + t.json()["access_token"]})
        i.raise_for_status()
        return i.json()


@router.get("")
async def boshla():
    g = config.google()
    if g is None:
        raise HTTPException(503, "google-yoq")
    holat = secrets.token_urlsafe(24)
    url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode({
        "client_id": g[0], "redirect_uri": config.google_qaytish(), "response_type": "code",
        "scope": "openid email", "state": holat, "prompt": "select_account"})
    r = RedirectResponse(url, 302)
    r.set_cookie(HOLAT, holat, max_age=600, httponly=True, secure=True, samesite="lax", path=YOL)
    return r


@router.get("/qaytish")
async def qaytish(request: Request, code: str = "", state: str = "", conn=Depends(db)):
    xato = RedirectResponse("/kirish/?xato=google", 302)
    kutilgan = request.cookies.get(HOLAT) or ""
    if config.google() is None or not code or not kutilgan or not secrets.compare_digest(state, kutilgan):
        return xato
    try:
        info = await request.app.state.google(code)
    except Exception:
        return xato
    sub = str(info.get("sub") or "")
    email = str(info["email"]).lower() if info.get("email_verified") and info.get("email") else None
    if not sub:
        return xato
    uid = (await conn.execute(text("select id from users where google_sub = :s"), {"s": sub})).scalar()
    if uid is None and email:
        # admin CLI orqali email bilan oldindan yaratilgan yozuv — birinchi kirishda bog'lanadi
        uid = (await conn.execute(text(
            "update users set google_sub = :s where id = (select id from users where lower(email) = :e "
            "and google_sub is null and login is null order by id limit 1) returning id"), {"s": sub, "e": email})).scalar()
    if uid is None:
        uid = (await conn.execute(text("insert into users(google_sub, email) values (:s, :e) returning id"),
                                  {"s": sub, "e": email})).scalar()
    elif email:
        await conn.execute(text("update users set email = :e where id = :i"), {"e": email, "i": uid})
    token = await sessiya.och(conn, uid)
    await conn.commit()
    r = RedirectResponse("/kirish/", 302)
    sessiya.cookie_qoy(r, token)
    r.delete_cookie(HOLAT, path=YOL, httponly=True, secure=True, samesite="lax")
    return r
```

`server/app/admin.py`:
```python
# /api/admin — o'qituvchi so'rovlarini tasdiqlash va umumiy statistika (faqat admin).
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text

from .deps import admin, db

router = APIRouter(prefix="/api/admin", dependencies=[Depends(admin)])


class Qaror(BaseModel):
    qaror: Literal["tasdiq", "rad"]


@router.get("/sorovlar")
async def sorovlar(conn=Depends(db)):
    rows = (await conn.execute(text("select id, ism, email, yaratilgan from users "
                                    "where oqituvchi_sorov = 'kutilmoqda' order by id"))).mappings().all()
    return {"sorovlar": [{**r, "yaratilgan": r["yaratilgan"].isoformat()} for r in rows]}


@router.post("/sorov/{uid}")
async def sorov(uid: int, body: Qaror, conn=Depends(db)):
    yangi = "rol = 'teacher', oqituvchi_sorov = null" if body.qaror == "tasdiq" else "oqituvchi_sorov = 'rad'"
    r = (await conn.execute(text(f"update users set {yangi} where id = :i and oqituvchi_sorov = 'kutilmoqda' returning id"),
                            {"i": uid})).scalar()
    if r is None:
        raise HTTPException(404, "topilmadi")
    await conn.commit()
    return {"ok": True}


@router.get("/statistika")
async def statistika(conn=Depends(db)):
    rollar = {r.rol: r.n for r in await conn.execute(text("select rol, count(*) as n from users group by rol"))}
    kut = (await conn.execute(text("select count(*) from users where oqituvchi_sorov = 'kutilmoqda'"))).scalar()
    return {"rollar": rollar, "kutilmoqda": kut}
```

`server/app/cli.py`:
```python
# Server buyruqlari (serverda api.env bilan):
#   python -m app.cli make-admin <email|login>  — mavjud foydalanuvchini admin qiladi (email bo'lsa, oldindan yozuv ochadi:
#                                                 shu Gmail bilan birinchi kirishda bog'lanadi)
#   python -m app.cli yangi-admin <login>        — login+parolli admin; bir martalik parol chiqariladi, birinchi kirishda almashtiriladi
import asyncio
import secrets
import sys

from sqlalchemy import text

from . import parol
from .config import database_url
from .db import make_engine


async def make_admin(url: str, kim: str) -> str:
    e = make_engine(url)
    try:
        async with e.connect() as c:
            if "@" in kim:
                email = kim.strip().lower()
                r = (await c.execute(text("update users set rol = 'admin', oqituvchi_sorov = null where lower(email) = :e returning id"),
                                     {"e": email})).scalar()
                if r is None:
                    await c.execute(text("insert into users(email, rol) values (:e, 'admin')"), {"e": email})
            else:
                r = (await c.execute(text("update users set rol = 'admin', oqituvchi_sorov = null where login = :l returning id"),
                                     {"l": kim.strip().lower()})).scalar()
                if r is None:
                    raise SystemExit(f"Bunday login yo'q: {kim}")
            await c.commit()
    finally:
        await e.dispose()
    return f"{kim} — endi admin"


async def yangi_admin(url: str, login: str) -> str:
    bir_martalik = secrets.token_urlsafe(9)
    e = make_engine(url)
    try:
        async with e.connect() as c:
            await c.execute(text("insert into users(login, parol_xesh, rol, ism, parol_almashtirsin) "
                                 "values (:l, :x, 'admin', 'Admin', true)"),
                            {"l": login.strip().lower(), "x": parol.xeshla(bir_martalik)})
            await c.commit()
    finally:
        await e.dispose()
    return bir_martalik


def main(argv: list[str]) -> None:
    if len(argv) == 2 and argv[0] == "make-admin":
        print(asyncio.run(make_admin(database_url(), argv[1])))
    elif len(argv) == 2 and argv[0] == "yangi-admin":
        p = asyncio.run(yangi_admin(database_url(), argv[1]))
        print(f"Admin yaratildi: login {argv[1]}, bir martalik parol: {p}  (birinchi kirishda almashtiriladi)")
    else:
        raise SystemExit("Ishlatish: python -m app.cli make-admin <email|login> | yangi-admin <login>")


if __name__ == "__main__":
    main(sys.argv[1:])
```

`server/app/main.py` ga qo'shiladi:
- importlar: `from .admin import router as admin_router` va `from .google import foydalanuvchi as google_foydalanuvchi, router as google_router`;
- `app.state.cheklov_ip = ...` dan keyin: `app.state.google = google_foydalanuvchi`;
- `app.include_router(hisob_router)` dan keyin: `app.include_router(google_router)` va `app.include_router(admin_router)`.

`server/README.md` oxiriga:
```markdown
## Akkauntlar

Serverda buyruq (api.env bilan):

    sudo -u kelajagim bash -c 'set -a; . /srv/kelajagim/api.env; set +a; cd /srv/kelajagim/api && .venv/bin/python -m app.cli yangi-admin admin'

`yangi-admin` bir martalik parol chiqaradi, birinchi kirishda almashtiriladi. `make-admin <gmail>` — shu Gmail bilan kirgan (yoki kiradigan) odamni admin qiladi.

Google: `api.env` ga `GOOGLE_CLIENT_ID=...` va `GOOGLE_CLIENT_SECRET=...` qo'shib, `systemctl restart kelajagim-api`. Google Console'dagi qaytish manzili: `https://kelajagim.uz/api/hisob/google/qaytish`.
```

- [ ] **Step 4: Run — pass.** `.venv/bin/pytest -q` → hammasi o'tadi.

- [ ] **Step 5: Commit** — `git add server && git commit -m "server: Google orqali kirish, admin API va CLI"`

---

### Task 4: Mijoz — `hisob.js`, service worker, `kirish/` va `admin/` sahifalari, bosh sahifa tugmasi

**Files:**
- Create: `oyinlar/umumiy/js/hisob.js`, `oyinlar/umumiy/css/hisob.css`, `kirish/index.html`, `kirish/kirish.js`, `admin/index.html`, `admin/admin.js`, `bosh/js/hisob-tugma.js`
- Modify: `index.html` (2 skript), `bosh/style.css` (tugma), `bosh/sw-royxat.py` → `sw.js` (`/api/` keshlanmaydi + bump)
- Test: `oyinlar/umumiy/tests/hisob.test.js`

**Interfaces:**
- Consumes: Task 2–3 endpointlari.
- Produces: `QK.hisob` = `{ XOTIRA, ROLLAR, mumkin(loc), saqlangan(), men(), sozlama(), kirish(login, parol), chiqish(), parol(eski, yangi), profil(ism), oqituvchiman(), admin: { sorovlar(), qaror(id, q), statistika() } }`. Har bir so'rov `{ok: true, ...javob}` yoki `{ok: false, holat, xato}` qaytaradi (`xato` = server `detail` kodi yoki `"tarmoq"`).

- [ ] **Step 1: Failing test**

`oyinlar/umumiy/tests/hisob.test.js`:
```js
// hisob.js — akkaunt qatlami: qachon ishlaydi, sahifalar ulangan, service worker /api ni keshlamaydi.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const H = require("../js/hisob.js");
const ROOT = path.join(__dirname, "../../..");
const oqi = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const skriptlar = (f) => [...oqi(f).matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);

test("akkaunt faqat o'z serverimizda (fayldan ochilganda yo'q)", () => {
  assert.equal(H.mumkin({ protocol: "https:", hostname: "kelajagim.uz" }), true);
  assert.equal(H.mumkin({ protocol: "http:", hostname: "localhost" }), true);
  assert.equal(H.mumkin({ protocol: "file:", hostname: "" }), false);
  assert.equal(H.mumkin({ protocol: "http:", hostname: "192.168.1.5" }), false);
  assert.equal(H.mumkin(undefined), false);
  assert.deepEqual(Object.keys(H.ROLLAR).sort(), ["admin", "student", "teacher"]);
});

test("service worker /api/ ni keshlamaydi", () => {
  const sw = oqi("sw.js");
  assert.match(sw, /url\.pathname\.startsWith\("\/api\/"\)\) return;/);
  assert.ok(sw.indexOf('startsWith("/api/")') < sw.indexOf("event.respondWith"));
  const gen = oqi("bosh/sw-royxat.py");
  assert.ok(gen.includes('startsWith("/api/")') || !gen.includes("respondWith"), "generator ham shu qatorni saqlaydi");
});

test("sahifalar: kirish, admin, bosh sahifa tugmasi", () => {
  for (const [f, oxirgi] of [["kirish/index.html", "kirish.js"], ["admin/index.html", "admin.js"]]) {
    const s = skriptlar(f);
    assert.deepEqual(s, ["../oyinlar/umumiy/js/hisob.js", oxirgi], f);
    assert.match(oqi(f), /oyinlar\/umumiy\/css\/asos\.css/);
    assert.match(oqi(f), /oyinlar\/umumiy\/css\/hisob\.css/);
  }
  const bosh = skriptlar("index.html");
  assert.ok(bosh.indexOf("oyinlar/umumiy/js/hisob.js") >= 0);
  assert.ok(bosh.indexOf("oyinlar/umumiy/js/hisob.js") < bosh.indexOf("bosh/js/hisob-tugma.js"));
  assert.ok(bosh.indexOf("bosh/js/bosh.js") < bosh.indexOf("bosh/js/hisob-tugma.js"));
});

test("maxfiy narsa saqlanmaydi: localStorage da faqat ism va rol", () => {
  const src = oqi("oyinlar/umumiy/js/hisob.js");
  assert.ok(!/localStorage\.setItem\([^)]*parol/i.test(src));
  assert.match(src, /JSON\.stringify\(\{ ism: [^}]*rol: [^}]*\}\)/);
});
```

- [ ] **Step 2: Run — fail.** `node --test oyinlar/umumiy/tests/hisob.test.js` → `Cannot find module '../js/hisob.js'`

- [ ] **Step 3: Implementation**

`oyinlar/umumiy/js/hisob.js`:
```js
// Akkaunt qatlami: serverdagi /api/hisob va /api/admin bilan ishlash. Faqat sayt o'z serverida ochilganda
// (kelajagim.uz yoki lokal sinov serveri) ishlaydi; fayldan ochilganda akkaunt yo'q — o'yinlar baribir ishlaydi.
// Brauzerda faqat ism va rol eslab qolinadi (bosh sahifada darhol ko'rsatish uchun); sessiya — httpOnly cookie'da.
(function (root) {
  "use strict";

  const XOTIRA = "qabila:hisob:v1";
  const OZIMIZ = ["kelajagim.uz", "www.kelajagim.uz", "localhost", "127.0.0.1"];
  const ROLLAR = { student: "Oʻquvchi", teacher: "Oʻqituvchi", admin: "Admin" };

  const mumkin = (loc) => !!loc && /^https?:$/.test(loc.protocol) && OZIMIZ.includes(loc.hostname);

  async function sorov(yol, body) {
    const opt = { method: body === undefined ? "GET" : "POST", credentials: "same-origin", headers: {} };
    if (body !== undefined) {
      opt.headers["Content-Type"] = "application/json";
      opt.body = JSON.stringify(body);
    }
    let r;
    try {
      r = await root.fetch(yol, opt);
    } catch (e) {
      return { ok: false, holat: 0, xato: "tarmoq" };
    }
    let d = {};
    try { d = await r.json(); } catch (e) { /* bo'sh javob */ }
    if (r.ok) return Object.assign({ ok: true }, d);
    return { ok: false, holat: r.status, xato: (d && typeof d.detail === "string" && d.detail) || "xato" };
  }

  function eslab(user) {
    try {
      if (user) root.localStorage.setItem(XOTIRA, JSON.stringify({ ism: user.ism || "", rol: user.rol }));
      else root.localStorage.removeItem(XOTIRA);
    } catch (e) { /* maxfiy rejim */ }
  }

  function saqlangan() {
    try {
      const d = JSON.parse(root.localStorage.getItem(XOTIRA) || "null");
      return d && typeof d.rol === "string" && typeof d.ism === "string" ? d : null;
    } catch (e) {
      return null;
    }
  }

  // Foydalanuvchi qaytaradigan so'rovlar: javobdagi user eslab qolinadi
  async function userli(yol, body) {
    const r = await sorov(yol, body);
    if (r.ok && r.user) eslab(r.user);
    else if (r.holat === 401) eslab(null);
    return r;
  }

  const api = {
    XOTIRA,
    ROLLAR,
    mumkin,
    saqlangan,
    men: () => userli("/api/hisob/men"),
    sozlama: () => sorov("/api/hisob/sozlama"),
    kirish: (login, parol) => userli("/api/hisob/kirish", { login, parol }),
    async chiqish() {
      const r = await sorov("/api/hisob/chiqish", {});
      if (r.ok) eslab(null);
      return r;
    },
    parol: (eski, yangi) => userli("/api/hisob/parol", { eski, yangi }),
    profil: (ism) => userli("/api/hisob/profil", { ism }),
    oqituvchiman: () => userli("/api/hisob/oqituvchi-sorov", {}),
    admin: {
      sorovlar: () => sorov("/api/admin/sorovlar"),
      qaror: (id, qaror) => sorov("/api/admin/sorov/" + Number(id), { qaror }),
      statistika: () => sorov("/api/admin/statistika"),
    },
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.hisob = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
```

`oyinlar/umumiy/css/hisob.css`:
```css
/* Kirish va admin sahifalari (asos.css tokenlari ustida). Telefonda 360px dan, kompyuterda markazda tor ustun. */
.hisob-app { min-height: 100vh; min-height: 100dvh; padding: 16px; display: flex; justify-content: center; }
.hisob { width: 100%; max-width: 440px; display: flex; flex-direction: column; gap: var(--s4); padding-top: var(--s4); }
.hisob.keng { max-width: 760px; }
.hisob-bosh { align-self: flex-start; font-weight: 800; color: var(--asosiy-matn); text-decoration: none; min-height: 48px; display: inline-flex; align-items: center; }
.hisob-h1 { margin: 0; font-size: var(--t3); font-weight: 900; line-height: 1.15; }
.hisob-izoh { margin: 0; font-size: var(--t0); font-weight: 600; color: var(--matn-2); }
.hisob-salom { margin: 0; font-size: var(--t2); font-weight: 900; }
.hisob-rol { margin: 0; font-size: var(--t0); font-weight: 700; color: var(--matn-3); overflow-wrap: anywhere; }
.hisob-form { display: flex; flex-direction: column; gap: var(--s3); padding: var(--s4); border: 2px solid var(--chiziq); border-radius: var(--r-l); background: var(--yuza); }
.hisob-maydon { display: flex; flex-direction: column; gap: 6px; font-size: var(--t0); font-weight: 800; }
.hisob-input {
  min-height: 52px; padding: 10px 14px; border: 2px solid var(--chiziq-kuchli); border-radius: var(--r-m);
  background: var(--yuza-2); font: inherit; font-size: var(--t1); font-weight: 700; color: var(--matn);
}
.hisob-input:focus-visible { outline: 3px solid var(--asosiy); outline-offset: 1px; }
.hisob-xato { margin: 0; min-height: 1.4em; font-size: var(--t0); font-weight: 800; color: var(--yana-matn); }
.hisob-xato:empty { min-height: 0; }
.hisob-yoki { margin: 0; text-align: center; font-size: var(--t-1); font-weight: 800; color: var(--matn-3); }
.hisob-tugmalar { display: flex; flex-wrap: wrap; gap: var(--s3); }
.hisob-tugmalar .btn { flex: 1 1 160px; text-decoration: none; }
.hisob .btn { text-decoration: none; }
.hisob-karta { display: flex; flex-direction: column; gap: var(--s2); padding: var(--s4); border: 2px solid var(--chiziq); border-radius: var(--r-l); background: var(--yuza); }
.hisob-karta.eslatma { background: var(--sariq-och); border-color: var(--sariq); }
.hisob-qator { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--s3); }
.hisob-qator-nom { font-size: var(--t0); font-weight: 900; overflow-wrap: anywhere; }
.hisob-qator-izoh { font-size: var(--t-1); font-weight: 700; color: var(--matn-3); overflow-wrap: anywhere; }
.hisob-raqamlar { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--s3); }
.hisob-raqam { padding: var(--s3); border-radius: var(--r-m); background: var(--panel); text-align: center; }
.hisob-raqam b { display: block; font-size: var(--t3); font-weight: 900; }
.hisob-raqam span { font-size: var(--t-1); font-weight: 800; color: var(--matn-3); }
```

`kirish/index.html`:
```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Kirish — Qabila maktabi</title>
  <link rel="icon" href="../bosh/icon.svg">
  <meta name="theme-color" content="#FFF6E5">
  <meta name="robots" content="noindex">
  <link rel="stylesheet" href="../oyinlar/umumiy/css/asos.css">
  <link rel="stylesheet" href="../oyinlar/umumiy/css/hisob.css">
</head>
<body>
  <div class="hisob-app">
    <main class="hisob" id="hisob" aria-live="polite"></main>
  </div>
  <script src="../oyinlar/umumiy/js/hisob.js"></script>
  <script src="kirish.js"></script>
</body>
</html>
```

`kirish/kirish.js`:
```js
// Kirish sahifasi: login+parol yoki Google → (bir martalik parol bo'lsa) yangi parol → (ism yo'q bo'lsa) ism → profil.
// Profilda: rol, "Men oʻqituvchiman" so'rovi (faqat Google bilan kirganlar), admin paneli havolasi, parol, chiqish.
(function (root) {
  "use strict";

  const H = root.QK.hisob;
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

  const XATOLAR = {
    notogri: "Login yoki parol notoʻgʻri.",
    "kop-urinish": "Juda koʻp urinish. 15 daqiqadan keyin qayta urinib koʻring.",
    tarmoq: "Server bilan aloqa yoʻq. Internetni tekshiring.",
    "parol-qisqa": "Parol 6 tadan 72 tagacha belgi boʻlsin.",
    "parol-mos-emas": "Ikki parol bir xil emas.",
    "eski-notogri": "Hozirgi parol notoʻgʻri.",
    "ism-notogri": "Ism 2–40 harf boʻlsin, masalan: Ali K.",
    "ism-kerak": "Avval ismingizni yozing.",
    google: "Google orqali kirib boʻlmadi. Qayta urinib koʻring.",
  };
  const xabar = (kod) => XATOLAR[kod] || "Nimadir xato ketdi. Qayta urinib koʻring.";

  const boshSahifa = () => h("a", { class: "hisob-bosh", href: "../", text: "◀︎ Barcha oʻyinlar" });
  const input = (attrs) => h("input", Object.assign({ class: "hisob-input" }, attrs));
  const maydon = (nom, el) => h("label", { class: "hisob-maydon" }, h("span", { text: nom }), el);
  const tugma = (text, onClick, cls) => h("button", { class: "btn " + (cls || ""), type: "button", text, onClick });

  function ekran(sarlavha, ...kids) {
    box.innerHTML = "";
    box.append(boshSahifa(), h("h1", { class: "hisob-h1", text: sarlavha }), ...kids);
  }

  // Forma: yuborilganda tugma o'chadi, xato pastda chiqadi
  function forma(maydonlar, yozuv, yubor) {
    const xato = h("p", { class: "hisob-xato", role: "alert" });
    const btn = h("button", { class: "btn big", type: "submit", text: yozuv });
    const f = h("form", { class: "hisob-form", novalidate: true }, ...maydonlar, xato, btn);
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      btn.disabled = true;
      xato.textContent = "";
      const kod = await yubor();
      btn.disabled = false;
      if (kod) xato.textContent = xabar(kod);
    });
    f.xato = xato;
    return f;
  }

  async function boshla() {
    if (!H.mumkin(root.location)) {
      ekran("Kirish", h("p", { class: "hisob-izoh", text: "Akkaunt faqat kelajagim.uz saytida ishlaydi. Oʻyinlar esa kirmasdan ham ishlayveradi." }));
      return;
    }
    ekran("Kirish", h("p", { class: "hisob-izoh", text: "Yuklanmoqda…" }));
    const r = await H.men();
    if (r.ok) return keyingi(r.user);
    if (r.xato === "tarmoq") {
      ekran("Kirish", h("p", { class: "hisob-xato", text: xabar("tarmoq") }), tugma("Qayta urinish", boshla));
      return;
    }
    kirishEkrani();
  }

  function keyingi(u) {
    if (u.parol_almashtirsin) return parolEkrani(true);
    if (!u.ism) return ismEkrani();
    profilEkrani(u);
  }

  async function kirishEkrani() {
    const s = await H.sozlama();
    const login = input({ name: "login", autocomplete: "username", autocapitalize: "none", spellcheck: "false", maxlength: "20" });
    const parol = input({ name: "parol", type: "password", autocomplete: "current-password", maxlength: "72" });
    const f = forma([maydon("Login", login), maydon("Parol", parol)], "Kirish", async () => {
      const r = await H.kirish(login.value, parol.value);
      if (r.ok) { keyingi(r.user); return null; }
      parol.value = "";
      parol.focus();
      return r.xato;
    });
    const xatoKod = new URLSearchParams(root.location.search).get("xato");
    if (xatoKod) f.xato.textContent = xabar(xatoKod);
    const google = s.ok && s.google
      ? [h("a", { class: "btn secondary big", href: "/api/hisob/google", text: "Google bilan kirish" }),
        h("p", { class: "hisob-yoki", text: "yoki oʻqituvchi bergan login bilan" })]
      : [];
    ekran("Kirish", ...google, f,
      h("p", { class: "hisob-izoh", text: "Kirmasang ham hamma oʻyin ishlaydi. Kirsang — yulduzlaring boshqa qurilmada ham saqlanadi." }));
    login.focus();
  }

  function parolEkrani(majburiy, u) {
    const eski = majburiy ? null : input({ type: "password", autocomplete: "current-password", maxlength: "72" });
    const yangi = input({ type: "password", autocomplete: "new-password", maxlength: "72" });
    const takror = input({ type: "password", autocomplete: "new-password", maxlength: "72" });
    const maydonlar = [eski && maydon("Hozirgi parol", eski), maydon("Yangi parol", yangi), maydon("Yangi parol (yana bir marta)", takror)].filter(Boolean);
    const f = forma(maydonlar, "Saqlash", async () => {
      if (yangi.value.length < 6 || yangi.value.length > 72) return "parol-qisqa";
      if (yangi.value !== takror.value) return "parol-mos-emas";
      const r = await H.parol(eski ? eski.value : "", yangi.value);
      if (r.ok) { keyingi(r.user); return null; }
      return r.xato;
    });
    ekran(majburiy ? "Oʻz parolingni qoʻy" : "Parolni almashtirish",
      h("p", { class: "hisob-izoh", text: majburiy
        ? "Oʻqituvchi bergan parol bir martalik edi. Endi oʻzing eslab qoladigan parol oʻyla va uni hech kimga aytma."
        : "Parol almashgach, boshqa qurilmalardagi kirishlar yopiladi." }),
      f,
      majburiy ? tugma("Chiqish", chiqish, "secondary") : tugma("Orqaga", () => profilEkrani(u), "secondary"));
    (eski || yangi).focus();
  }

  function ismEkrani() {
    const ism = input({ autocomplete: "nickname", maxlength: "40", placeholder: "Ali K." });
    const f = forma([maydon("Ismingiz", ism)], "Saqlash", async () => {
      const r = await H.profil(ism.value);
      if (r.ok) { keyingi(r.user); return null; }
      return r.xato;
    });
    ekran("Ismingiz", h("p", { class: "hisob-izoh", text: "Ism va familiyaning birinchi harfi, masalan «Ali K.». Uni faqat oʻqituvchingiz koʻradi." }), f);
    ism.focus();
  }

  function profilEkrani(u) {
    const kids = [
      h("p", { class: "hisob-salom", text: `Salom, ${u.ism}!` }),
      h("p", { class: "hisob-rol", text: H.ROLLAR[u.rol] + (u.login ? " · login: " + u.login : u.email ? " · " + u.email : "") }),
    ];
    if (u.rol === "admin") kids.push(h("a", { class: "btn big", href: "../admin/", text: "Admin paneli" }));
    if (u.rol === "teacher") kids.push(h("div", { class: "hisob-karta eslatma" }, h("p", { class: "hisob-izoh", text: "Oʻqituvchi paneli (sinflar va oʻquvchilar) tez orada shu yerda paydo boʻladi." })));
    if (u.rol === "student" && !u.login) {
      if (u.oqituvchi_sorov === "kutilmoqda") kids.push(h("div", { class: "hisob-karta eslatma" }, h("p", { class: "hisob-izoh", text: "Oʻqituvchi boʻlish soʻrovingizni admin koʻrib chiqyapti." })));
      else if (u.oqituvchi_sorov === "rad") kids.push(h("div", { class: "hisob-karta" }, h("p", { class: "hisob-izoh", text: "Oʻqituvchi boʻlish soʻrovi rad etildi. Savol boʻlsa, sayt muallifiga yozing." })));
      else kids.push(tugma("Men oʻqituvchiman", () => sorovEkrani(u), "secondary"));
    }
    const pastki = [tugma("Barcha oʻyinlar", () => { root.location.href = "../"; })];
    if (u.parol_bor) pastki.push(tugma("Parolni almashtirish", () => parolEkrani(false, u), "secondary"));
    pastki.push(tugma("Chiqish", chiqish, "secondary"));
    ekran("Mening akkauntim", ...kids, h("div", { class: "hisob-tugmalar" }, ...pastki));
  }

  function sorovEkrani(u) {
    const xato = h("p", { class: "hisob-xato", role: "alert" });
    ekran("Oʻqituvchi boʻlish",
      h("p", { class: "hisob-izoh", text: "Soʻrov sayt adminiga boradi. Tasdiqlansa, sinf ochib, oʻquvchilaringiz uchun akkaunt yarata olasiz." }),
      xato,
      h("div", { class: "hisob-tugmalar" },
        tugma("Soʻrov yuborish", async () => {
          const r = await H.oqituvchiman();
          if (r.ok) profilEkrani(r.user);
          else xato.textContent = xabar(r.xato);
        }),
        tugma("Bekor qilish", () => profilEkrani(u), "secondary")));
  }

  async function chiqish() {
    await H.chiqish();
    kirishEkrani();
  }

  boshla();
})(window);
```

`admin/index.html`:
```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Admin — Qabila maktabi</title>
  <link rel="icon" href="../bosh/icon.svg">
  <meta name="theme-color" content="#FFF6E5">
  <meta name="robots" content="noindex">
  <link rel="stylesheet" href="../oyinlar/umumiy/css/asos.css">
  <link rel="stylesheet" href="../oyinlar/umumiy/css/hisob.css">
</head>
<body>
  <div class="hisob-app">
    <main class="hisob keng" id="hisob" aria-live="polite"></main>
  </div>
  <script src="../oyinlar/umumiy/js/hisob.js"></script>
  <script src="admin.js"></script>
</body>
</html>
```

`admin/admin.js`:
```js
// Admin paneli: foydalanuvchilar soni va o'qituvchi bo'lish so'rovlari (tasdiqlash / rad etish).
(function (root) {
  "use strict";

  const H = root.QK.hisob;
  const box = root.document.getElementById("hisob");

  function h(tag, attrs, ...kids) {
    const el = root.document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null) continue;
      if (k === "text") el.textContent = v;
      else if (k === "onClick") el.addEventListener("click", v);
      else el.setAttribute(k, v);
    }
    for (const kid of kids) if (kid) el.append(kid);
    return el;
  }

  function ekran(...kids) {
    box.innerHTML = "";
    box.append(h("a", { class: "hisob-bosh", href: "../kirish/", text: "◀︎ Akkaunt" }), h("h1", { class: "hisob-h1", text: "Admin paneli" }), ...kids);
  }

  const sana = (iso) => new Date(iso).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" });

  async function yukla() {
    const men = await H.men();
    if (!men.ok || men.user.rol !== "admin" || men.user.parol_almashtirsin) {
      ekran(h("p", { class: "hisob-izoh", text: "Bu sahifa faqat admin uchun. Avval admin akkaunti bilan kiring." }),
        h("a", { class: "btn", href: "../kirish/", text: "Kirish" }));
      return;
    }
    const [st, sr] = await Promise.all([H.admin.statistika(), H.admin.sorovlar()]);
    if (!st.ok || !sr.ok) {
      ekran(h("p", { class: "hisob-xato", text: "Maʼlumotni olib boʻlmadi." }), h("button", { class: "btn", type: "button", text: "Qayta urinish", onClick: yukla }));
      return;
    }
    const raqam = (n, nom) => h("div", { class: "hisob-raqam" }, h("b", { text: String(n || 0) }), h("span", { text: nom }));
    const raqamlar = h("div", { class: "hisob-raqamlar" },
      raqam(st.rollar.student, "oʻquvchi"), raqam(st.rollar.teacher, "oʻqituvchi"), raqam(st.rollar.admin, "admin"), raqam(st.kutilmoqda, "soʻrov"));
    const royxat = h("div", { class: "hisob-karta" }, h("p", { class: "hisob-qator-nom", text: "Oʻqituvchi boʻlish soʻrovlari" }));
    if (!sr.sorovlar.length) royxat.append(h("p", { class: "hisob-izoh", text: "Hozircha soʻrov yoʻq." }));
    for (const s of sr.sorovlar) {
      const xato = h("p", { class: "hisob-xato", role: "alert" });
      const qaror = async (q) => {
        const r = await H.admin.qaror(s.id, q);
        if (r.ok) yukla();
        else xato.textContent = "Saqlab boʻlmadi. Qayta urinib koʻring.";
      };
      royxat.append(h("div", { class: "hisob-qator" },
        h("div", {}, h("div", { class: "hisob-qator-nom", text: s.ism || "(ism yoʻq)" }), h("div", { class: "hisob-qator-izoh", text: (s.email || "") + " · " + sana(s.yaratilgan) })),
        h("div", { class: "hisob-tugmalar" },
          h("button", { class: "btn ok sm", type: "button", text: "Tasdiqlash", onClick: () => qaror("tasdiq") }),
          h("button", { class: "btn secondary sm", type: "button", text: "Rad etish", onClick: () => qaror("rad") }))),
        xato);
    }
    ekran(raqamlar, royxat);
  }

  yukla();
})(window);
```

`bosh/js/hisob-tugma.js`:
```js
// Bosh sahifa: o'ng yuqorida "Kirish" yoki "👤 Ism" tugmasi (kirish/ sahifasiga). Fayldan ochilganda ko'rinmaydi.
(function (root) {
  "use strict";

  const H = root.QK && root.QK.hisob;
  const top = root.document.querySelector(".bosh-top");
  if (!H || !top || !H.mumkin(root.location)) return;
  const a = root.document.createElement("a");
  a.className = "bosh-hisob";
  a.href = "kirish/";
  const yoz = (d) => { a.textContent = d && d.ism ? "👤 " + d.ism : d ? "👤 Akkaunt" : "Kirish"; };
  yoz(H.saqlangan());
  top.prepend(a);
  H.men().then((r) => {
    if (r.ok) yoz(r.user);
    else if (r.holat === 401) yoz(null);
  });
})(window);
```

`bosh/style.css` oxiriga:
```css
/* Akkaunt tugmasi — o'ng yuqorida (bosh/js/hisob-tugma.js) */
.bosh-top { position: relative; }
.bosh-hisob {
  position: absolute; top: 6px; right: 0; max-width: 45%; min-height: 44px; padding: 8px 14px;
  display: inline-flex; align-items: center; border: 2px solid var(--chiziq); border-radius: var(--r-pill);
  background: var(--yuza); box-shadow: 0 3px 0 var(--oq-qora); color: var(--asosiy-matn);
  font-size: var(--t-1); font-weight: 800; text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
```

`index.html`: `bosh/js/bosh.js` dan keyin, `offline.js` dan oldin:
```html
  <script src="oyinlar/umumiy/js/hisob.js"></script>
  <script src="bosh/js/hisob-tugma.js"></script>
```

Service worker: `sw.js` dagi fetch ishlovchisida `if (url.origin !== self.location.origin) return;` dan keyin yangi qator:
```js
  if (url.pathname.startsWith("/api/")) return; // server javoblari (kirish holati, xonalar) hech qachon keshlanmaydi
```
Agar `bosh/sw-royxat.py` faylni to'liq yozsa, o'sha qator generatordagi shablonga ham qo'shiladi; keyin `python3 bosh/sw-royxat.py --bump`.

- [ ] **Step 4: Run — pass.** `node --test 2>&1 | grep -E "^ℹ (pass|fail)"` → `fail 0`

- [ ] **Step 5: Commit** — `git add -A oyinlar kirish admin bosh index.html sw.js && git commit -m "Akkaunt sahifalari: kirish, admin paneli, bosh sahifa tugmasi; SW /api ni keshlamaydi"`

---

### Task 5: Brauzerda sinov, deploy, birinchi admin

- [ ] **Step 1: Lokal server** — `cd server && KELAJAGIM_DB=postgresql+psycopg://localhost/kelajagim_test KELAJAGIM_STATIK=.. .venv/bin/uvicorn app.main:app --port 8199` (fon). Test bazasiga ma'lumot pytest'dagi `user_yarat` yoki CLI orqali.

- [ ] **Step 2: Playwright (localhost:8199, telefon 390×800 va kompyuter 1280×800)**
1. Bosh sahifada "Kirish" tugmasi ko'rinadi.
2. `kirish/` da login+parol (`almashtirsin=true` o'quvchi) → yangi parol ekrani. Qisqa va mos kelmaydigan parol xatolari chiqadi → saqlash → profil "Salom, Ali K.!".
3. Bosh sahifada "👤 Ali K." ko'rinadi. Chiqish → "Kirish".
4. Yangi admin (CLI) → bir martalik parol → o'z parolini qo'yadi → "Admin paneli".
5. Admin panelida so'rov (bazaga qo'yilgan) ko'rinadi → Tasdiqlash → raqamlar yangilanadi.
6. Noto'g'ri parol bilan xato matni chiqadi; konsolda xato yo'q.
Har ekran rasmi ko'rib chiqiladi.

- [ ] **Step 3: Deploy** — `git push && bash server/deploy/deploy.sh`. Alembic 0002 serverda qo'llanadi. Jonli `https://kelajagim.uz/kirish/` ochiladi, `/api/hisob/sozlama` → `{"google": false}`.

- [ ] **Step 4: Birinchi admin** — serverda `yangi-admin admin` (README buyrug'i). Bir martalik parol muallifga beriladi, muallif birinchi kirishda o'zinikini qo'yadi.

- [ ] **Step 5: Google** — muallif Google Cloud'da OAuth mijoz ochadi (Web application; Authorized redirect URI `https://kelajagim.uz/api/hisob/google/qaytish`). ID va secret `api.env` ga yoziladi, servis qayta yoqiladi. Jonli Google kirishni muallif o'zi sinaydi.

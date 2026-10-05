# 1-bo'lak: server, domen, baza, FastAPI skeleti — amalga oshirish rejasi

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** kelajagim.uz ni GitHub Pages'dan o'z VPS'imizga ko'chirish: nginx statik saytni beradi, `/api` ostida FastAPI ishlaydi, PostgreSQL bazasi va kechki zaxira tayyor.

**Architecture:**
- Repoda yangi `server/` papkasi: FastAPI ilovasi (`app/`), alembic migratsiyalari, pytest testlari, deploy fayllari (`deploy/`).
- Mac'dan `server/deploy/deploy.sh` ishga tushiriladi:
  1. `git archive HEAD` → sayt va API `rsync` bilan serverga;
  2. serverda idempotent `ornat.sh`: foydalanuvchi, baza, venv, migratsiya, systemd, cron, nginx (faqat birinchi marta).
- Serverdagi boshqa loyihalarga (ShifoTop, crm.medpuls.uz, TeamBoard, botqur) tegilmaydi.

**Tech Stack:** Python 3.10, FastAPI, uvicorn, SQLAlchemy 2 (async, psycopg 3), alembic, pytest + httpx, PostgreSQL 14 (server) / 16 (Mac, testlar), nginx 1.18, certbot, systemd, cron.

**Spec:** `docs/superpowers/specs/2026-10-04-akkaunt-server-design.md` (1-bo'lak bo'limi)

## Global Constraints

- Server: `root@188.137.181.107`, Ubuntu 22.04, 1 CPU, 2.4 GB RAM. Band portlar: 8000 (ShifoTop), 8080, 5432, 6379.
- Bizning port: **127.0.0.1:8100**, 1 worker, systemd `MemoryMax=300M`.
- Linux foydalanuvchi `kelajagim`; papkalar `/srv/kelajagim/{sayt,api,zaxira}`; maxfiy sozlamalar `/srv/kelajagim/api.env` (600).
- Baza `kelajagim`, rol `kelajagim` — faqat o'z bazasiga ulanadi (`REVOKE CONNECT ... FROM PUBLIC`).
- nginx: faqat **yangi** `sites-available/kelajagim.uz` + symlink. Boshqa fayllarga tegilmaydi. Har reload'dan oldin `nginx -t`. Fayl bir marta o'rnatiladi, keyin uni certbot boshqaradi — deploy uni qayta yozmaydi.
- Har server o'zgarishidan **oldin va keyin**: `curl` bilan botqur.uz, crm.medpuls.uz, shifotop (`:8080/health`) javob beradi.
- Parollar, kalitlar repoga yozilmaydi. Server root paroli hech qayerga yozilmaydi.
- Kod — inglizcha nomlar, izohlar o'zbekcha (QOIDALAR §10 uslubi). Papka nomlari kichik harf, `'` siz.
- Saytga chiqadigan fayllar = `git archive HEAD` minus `server/`, `docs/`. Gitignore'dagi `testlar/`, `hisobotlar/` hech qachon chiqmaydi.

---

### Task 1: FastAPI skeleti va `/api/salomat`

**Files:**
- Create: `server/requirements.txt`, `server/requirements-dev.txt`
- Create: `server/app/__init__.py`, `server/app/config.py`, `server/app/db.py`, `server/app/main.py`
- Create: `server/tests/__init__.py`, `server/tests/conftest.py`, `server/tests/test_salomat.py`
- Modify: `.gitignore` (+ `server/.venv/`)

**Interfaces:**
- Produces: `app.main.create_app(db_url: str | None = None) -> FastAPI`, `app.main.app`; `app.config.database_url() -> str` (env `KELAJAGIM_DB`); `app.db.make_engine(url) -> AsyncEngine`, `app.db.baza_tirikmi(engine) -> bool`; `GET /api/salomat` → 200 `{"ok": true, "baza": true}` yoki 503 `{"ok": false, "baza": false}`; tests: `TEST_DB` fixture qiymati (env `KELAJAGIM_TEST_DB`, default `postgresql+psycopg://localhost/kelajagim_test`).

- [ ] **Step 1: venv va bog'liqliklar**

`server/requirements.txt`:
```
fastapi==0.115.6
uvicorn[standard]==0.32.1
sqlalchemy==2.0.36
psycopg[binary]==3.2.3
alembic==1.14.0
```
`server/requirements-dev.txt`:
```
-r requirements.txt
pytest==8.3.4
httpx==0.28.1
```
`.gitignore` oxiriga: `server/.venv/`

Run:
```bash
cd server && python3.10 -m venv .venv && .venv/bin/pip install -q -r requirements-dev.txt && createdb kelajagim_test 2>/dev/null; echo ok
```
Expected: `ok` (bazasi bor bo'lsa createdb xatosi jim o'tadi).

- [ ] **Step 2: Failing test**

`server/tests/__init__.py` — bo'sh. `server/tests/conftest.py`:
```python
import os
import sys
from pathlib import Path

# server/ papkasi import yo'lida bo'lsin (app paketi)
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

TEST_DB = os.environ.get("KELAJAGIM_TEST_DB", "postgresql+psycopg://localhost/kelajagim_test")
```
`server/tests/test_salomat.py`:
```python
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
```

- [ ] **Step 3: Run — fail**

Run: `cd server && .venv/bin/pytest -q`
Expected: FAIL — `ModuleNotFoundError: No module named 'app'`

- [ ] **Step 4: Implementation**

`server/app/__init__.py` — bo'sh.

`server/app/config.py`:
```python
# Sozlamalar muhit o'zgaruvchilaridan olinadi (serverda /srv/kelajagim/api.env, systemd EnvironmentFile).
import os


def database_url() -> str:
    url = os.environ.get("KELAJAGIM_DB")
    if not url:
        raise RuntimeError("KELAJAGIM_DB muhit o'zgaruvchisi berilmagan")
    return url
```

`server/app/db.py`:
```python
# Baza bilan ulanish: bitta async engine (ilova ishga tushganda yaratiladi).
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine


def make_engine(url: str) -> AsyncEngine:
    # Server kichik (1 CPU) — kichik pul; connect_timeout baza o'chiq bo'lsa so'rovni osiltirmaydi
    return create_async_engine(url, pool_size=5, max_overflow=5, pool_pre_ping=True, connect_args={"connect_timeout": 3})


async def baza_tirikmi(engine: AsyncEngine) -> bool:
    try:
        async with engine.connect() as conn:
            await conn.execute(text("select 1"))
        return True
    except Exception:
        return False
```

`server/app/main.py`:
```python
# kelajagim.uz API. Hamma yo'llar /api ostida (nginx /api/ ni shu yerga uzatadi).
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response

from . import config
from .db import baza_tirikmi, make_engine


def create_app(db_url: str | None = None) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.engine = make_engine(db_url or config.database_url())
        yield
        await app.state.engine.dispose()

    # Avtomatik hujjat sahifalari yopiq — ochiq saytda API tuzilishi ko'rinmasin
    app = FastAPI(title="kelajagim", docs_url=None, redoc_url=None, openapi_url=None, lifespan=lifespan)

    @app.get("/api/salomat")
    async def salomat(response: Response):
        ok = await baza_tirikmi(app.state.engine)
        if not ok:
            response.status_code = 503
        return {"ok": ok, "baza": ok}

    return app


app = create_app()
```

- [ ] **Step 5: Run — pass**

Run: `cd server && .venv/bin/pytest -q`
Expected: `3 passed`

- [ ] **Step 6: Commit**

```bash
git add .gitignore server/requirements.txt server/requirements-dev.txt server/app server/tests
git commit -m "server: FastAPI skeleti va /api/salomat"
```

---

### Task 2: Alembic migratsiyalari

**Files:**
- Create: `server/alembic.ini`, `server/migrations/env.py`, `server/migrations/script.py.mako`, `server/migrations/versions/0001_boshlangich.py`
- Test: `server/tests/test_migratsiya.py`

**Interfaces:**
- Consumes: `app.config.database_url()`, `TEST_DB`.
- Produces: `alembic upgrade head` (cwd `server/`, env `KELAJAGIM_DB`) → `alembic_version.version_num = '0001'`. 2- va 3-bo'lak jadvallari keyingi reviziyalar bo'ladi (`down_revision = "0001"`).

- [ ] **Step 1: Failing test**

`server/tests/test_migratsiya.py`:
```python
import os
import subprocess
import sys
from pathlib import Path

from sqlalchemy import create_engine, text

from tests.conftest import TEST_DB

SERVER = Path(__file__).resolve().parents[1]


def test_upgrade_head():
    env = {**os.environ, "KELAJAGIM_DB": TEST_DB}
    r = subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], cwd=SERVER, env=env, capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    eng = create_engine(TEST_DB)
    with eng.connect() as conn:
        assert conn.execute(text("select version_num from alembic_version")).scalar() == "0001"
    eng.dispose()
```

- [ ] **Step 2: Run — fail**

Run: `cd server && .venv/bin/pytest -q tests/test_migratsiya.py`
Expected: FAIL — alembic `No config file 'alembic.ini' found` (returncode != 0)

- [ ] **Step 3: Implementation**

`server/alembic.ini`:
```ini
[alembic]
script_location = migrations
prepend_sys_path = .
```

`server/migrations/env.py`:
```python
# Alembic: baza manzili KELAJAGIM_DB dan (ilova bilan bir xil). Modellar yo'q — migratsiyalar qo'lda yoziladi.
from alembic import context
from sqlalchemy import create_engine, pool

from app.config import database_url

engine = create_engine(database_url(), poolclass=pool.NullPool)
with engine.connect() as connection:
    context.configure(connection=connection, target_metadata=None)
    with context.begin_transaction():
        context.run_migrations()
```

`server/migrations/script.py.mako`:
```mako
"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
"""
from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

revision = ${repr(up_revision)}
down_revision = ${repr(down_revision)}
branch_labels = None
depends_on = None


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}
```

`server/migrations/versions/0001_boshlangich.py`:
```python
"""Boshlang'ich reviziya: jadval yo'q, faqat migratsiya zanjiri boshi (deploy oqimini sinash uchun).

Revision ID: 0001
Revises:
"""

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
```

- [ ] **Step 4: Run — pass**

Run: `cd server && .venv/bin/pytest -q`
Expected: `4 passed`

- [ ] **Step 5: Commit**

```bash
git add server/alembic.ini server/migrations server/tests/test_migratsiya.py
git commit -m "server: alembic migratsiyalari (0001 boshlangʻich)"
```

---

### Task 3: Deploy fayllari (nginx, systemd, cron, ornat.sh, deploy.sh)

**Files:**
- Create: `server/deploy/nginx-kelajagim.conf`, `server/deploy/kelajagim-api.service`, `server/deploy/kelajagim-zaxira.cron`, `server/deploy/zaxira.sh`, `server/deploy/ornat.sh`, `server/deploy/deploy.sh`, `server/README.md`
- Test: `server/tests/test_deploy.py`

**Interfaces:**
- Produces: `server/deploy/deploy.sh` (Mac'dan, env `KELAJAGIM_HOST` default `root@188.137.181.107`) — commit qilinmagan o'zgarish bo'lsa to'xtaydi; `/srv/kelajagim/api/deploy/ornat.sh` (serverda root, idempotent) — oxirida `127.0.0.1:8100/api/salomat` 200 bo'lmasa xato bilan chiqadi.

- [ ] **Step 1: Failing test (fayllar bir-biriga mos)**

`server/tests/test_deploy.py`:
```python
# Deploy fayllari bir-biriga mos: port, xotira chegarasi, WebSocket, saytga nima chiqadi.
from pathlib import Path

D = Path(__file__).resolve().parents[1] / "deploy"
read = lambda name: (D / name).read_text(encoding="utf-8")


def test_port_bir_xil():
    assert "--port 8100" in read("kelajagim-api.service")
    assert read("nginx-kelajagim.conf").count("proxy_pass http://127.0.0.1:8100;") == 2
    assert "127.0.0.1:8100/api/salomat" in read("ornat.sh")


def test_systemd_chegaralar():
    unit = read("kelajagim-api.service")
    for qator in ("User=kelajagim", "MemoryMax=300M", "--workers 1", "EnvironmentFile=/srv/kelajagim/api.env", "NoNewPrivileges=true"):
        assert qator in unit


def test_nginx_websocket_va_server_nomi():
    conf = read("nginx-kelajagim.conf")
    assert "location /api/ws/" in conf and "proxy_set_header Upgrade $http_upgrade;" in conf
    assert "server_name kelajagim.uz;" in conf and "server_name www.kelajagim.uz;" in conf
    assert "default_server" not in conf  # boshqa saytlarning standart serverini egallamaymiz


def test_saytga_faqat_commit_chiqadi():
    sh = read("deploy.sh")
    assert "git archive HEAD" in sh
    assert "--exclude=/server/" in sh and "--exclude=/docs/" in sh
    assert "git status --porcelain" in sh


def test_nginx_faqat_bir_marta_va_tekshiruv_bilan():
    sh = read("ornat.sh")
    assert "if [ ! -e /etc/nginx/sites-available/kelajagim.uz ]" in sh
    assert "nginx -t" in sh
    assert "REVOKE CONNECT ON DATABASE kelajagim FROM PUBLIC" in sh


def test_maxfiy_narsa_yoq():
    for f in D.iterdir():
        matn = f.read_text(encoding="utf-8")
        assert "PASSWORD '" not in matn or "$PASS" in matn, f.name
        assert "postgresql://kelajagim:" not in matn or "%s@" in matn, f.name
```

- [ ] **Step 2: Run — fail**

Run: `cd server && .venv/bin/pytest -q tests/test_deploy.py`
Expected: FAIL — `FileNotFoundError`

- [ ] **Step 3: Implementation**

`server/deploy/nginx-kelajagim.conf`:
```nginx
# kelajagim.uz — statik sayt + /api (FastAPI, 127.0.0.1:8100). Bir marta o'rnatiladi (ornat.sh),
# keyin HTTPS qatorlarini certbot qo'shadi — deploy bu faylni qayta yozmaydi.
server {
    listen 80;
    listen [::]:80;
    server_name www.kelajagim.uz;
    return 301 http://kelajagim.uz$request_uri;
}

server {
    listen 80;
    listen [::]:80;
    server_name kelajagim.uz;

    root /srv/kelajagim/sayt;
    index index.html;
    charset utf-8;
    client_max_body_size 1m;

    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;

    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    # Service worker har safar tekshirilsin — eski versiyada qotib qolmaslik uchun
    location = /sw.js {
        add_header Cache-Control "no-cache" always;
        add_header X-Content-Type-Options nosniff always;
    }

    location /api/ws/ {
        proxy_pass http://127.0.0.1:8100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

`server/deploy/kelajagim-api.service`:
```ini
[Unit]
Description=kelajagim.uz API (FastAPI/uvicorn)
After=network.target postgresql.service

[Service]
User=kelajagim
Group=kelajagim
WorkingDirectory=/srv/kelajagim/api
EnvironmentFile=/srv/kelajagim/api.env
ExecStart=/srv/kelajagim/api/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8100 --workers 1 --proxy-headers --forwarded-allow-ips 127.0.0.1
Restart=on-failure
RestartSec=5
# Server boshqa loyihalar bilan umumiy: xotira chegarasi va tizimni himoyalash
MemoryMax=300M
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
ReadWritePaths=/srv/kelajagim/api

[Install]
WantedBy=multi-user.target
```

`server/deploy/kelajagim-zaxira.cron`:
```
# Har kecha 03:30 — baza zaxirasi (14 kun saqlanadi)
30 3 * * * kelajagim /srv/kelajagim/api/deploy/zaxira.sh >> /srv/kelajagim/zaxira/zaxira.log 2>&1
```

`server/deploy/zaxira.sh`:
```bash
#!/bin/bash
# Baza zaxirasi: /srv/kelajagim/zaxira/kelajagim-YYYY-MM-DD.dump, 14 kundan eskisi o'chiriladi.
set -euo pipefail
set -a; . /srv/kelajagim/api.env; set +a
DIR=/srv/kelajagim/zaxira
pg_dump --format=custom --file="$DIR/kelajagim-$(date +%F).dump" "$PG_URL"
find "$DIR" -name 'kelajagim-*.dump' -mtime +14 -delete
echo "$(date -Is) zaxira tayyor"
```

`server/deploy/ornat.sh`:
```bash
#!/bin/bash
# Serverda root sifatida (deploy.sh chaqiradi). Qayta ishga tushirsa ham xavfsiz.
# Boshqa loyihalarga tegmaydi: faqat kelajagim foydalanuvchisi, bazasi, servisi va nginx fayli.
set -euo pipefail
ROOT=/srv/kelajagim
API=$ROOT/api
cd /tmp  # postgres foydalanuvchisi /root ga kira olmaydi

# 1. Foydalanuvchi va papkalar
id kelajagim >/dev/null 2>&1 || useradd --system --home-dir "$ROOT" --shell /usr/sbin/nologin kelajagim
mkdir -p "$ROOT/sayt" "$API" "$ROOT/zaxira"
chown -R kelajagim:kelajagim "$ROOT"
chmod 755 "$ROOT" "$ROOT/sayt"
chmod 750 "$ROOT/zaxira"
chmod +x "$API/deploy/zaxira.sh"

# 2. Baza va rol (faqat birinchi marta; parol tasodifiy, faqat api.env da)
if [ ! -f "$ROOT/api.env" ]; then
  PASS=$(openssl rand -hex 24)
  sudo -u postgres psql -v ON_ERROR_STOP=1 -qc "CREATE ROLE kelajagim LOGIN PASSWORD '$PASS'"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -qc "CREATE DATABASE kelajagim OWNER kelajagim"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -qc "REVOKE CONNECT ON DATABASE kelajagim FROM PUBLIC"
  sudo -u postgres psql -v ON_ERROR_STOP=1 -d kelajagim -qc "REVOKE ALL ON SCHEMA public FROM PUBLIC; GRANT ALL ON SCHEMA public TO kelajagim"
  ( umask 077
    printf 'KELAJAGIM_DB=postgresql+psycopg://kelajagim:%s@127.0.0.1/kelajagim\nPG_URL=postgresql://kelajagim:%s@127.0.0.1/kelajagim\n' "$PASS" "$PASS" > "$ROOT/api.env" )
  chown kelajagim:kelajagim "$ROOT/api.env"
  chmod 600 "$ROOT/api.env"
fi

# 3. Python muhiti va migratsiyalar
[ -x "$API/.venv/bin/python" ] || sudo -u kelajagim python3 -m venv "$API/.venv"
sudo -u kelajagim "$API/.venv/bin/pip" install -q -r "$API/requirements.txt"
sudo -u kelajagim bash -c "set -a; . $ROOT/api.env; set +a; cd $API && .venv/bin/alembic upgrade head"

# 4. systemd va cron (bizning fayllar — har safar yangilanadi)
install -m 644 "$API/deploy/kelajagim-api.service" /etc/systemd/system/kelajagim-api.service
install -m 644 "$API/deploy/kelajagim-zaxira.cron" /etc/cron.d/kelajagim-zaxira
systemctl daemon-reload
systemctl enable -q kelajagim-api
systemctl restart kelajagim-api

# 5. nginx — faqat birinchi marta (keyin faylni certbot boshqaradi)
if [ ! -e /etc/nginx/sites-available/kelajagim.uz ]; then
  install -m 644 "$API/deploy/nginx-kelajagim.conf" /etc/nginx/sites-available/kelajagim.uz
  ln -s /etc/nginx/sites-available/kelajagim.uz /etc/nginx/sites-enabled/kelajagim.uz
  if ! nginx -t; then
    rm -f /etc/nginx/sites-enabled/kelajagim.uz /etc/nginx/sites-available/kelajagim.uz
    echo "nginx -t xato — kelajagim.uz fayli olib tashlandi, boshqa saytlar o'zgarmadi" >&2
    exit 1
  fi
  systemctl reload nginx
fi

# 6. Tekshiruv: API javob beryaptimi
for i in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:8100/api/salomat; then echo; echo "API tayyor"; exit 0; fi
  sleep 1
done
echo "API javob bermadi: journalctl -u kelajagim-api -n 50" >&2
exit 1
```

`server/deploy/deploy.sh`:
```bash
#!/bin/bash
# Mac'dan: bash server/deploy/deploy.sh — commit qilingan holatni serverga chiqaradi.
# Sayt = git archive HEAD (server/ va docs/ siz); gitignore'dagi testlar/, hisobotlar/ hech qachon chiqmaydi.
set -euo pipefail
HOST=${KELAJAGIM_HOST:-root@188.137.181.107}
REPO=$(git -C "$(dirname "$0")" rev-parse --show-toplevel)
cd "$REPO"
if [ -n "$(git status --porcelain)" ]; then
  echo "Commit qilinmagan o'zgarish bor — avval commit qiling" >&2
  exit 1
fi
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
git archive HEAD | tar -x -C "$TMP"

ssh "$HOST" 'mkdir -p /srv/kelajagim/sayt /srv/kelajagim/api'
rsync -az --delete --exclude=/server/ --exclude=/docs/ "$TMP"/ "$HOST":/srv/kelajagim/sayt/
rsync -az --delete --exclude=.venv --exclude=__pycache__ "$TMP/server/" "$HOST":/srv/kelajagim/api/
ssh "$HOST" 'bash /srv/kelajagim/api/deploy/ornat.sh'
echo "Deploy tayyor: $(git rev-parse --short HEAD)"
```

`server/README.md`:
```markdown
# kelajagim.uz serveri

FastAPI ilovasi (`app/`), migratsiyalar (`migrations/`), deploy fayllari (`deploy/`). Dizayn: `docs/superpowers/specs/2026-10-04-akkaunt-server-design.md`.

## Lokal ishlash
    cd server
    python3.10 -m venv .venv && .venv/bin/pip install -r requirements-dev.txt
    createdb kelajagim_test
    .venv/bin/pytest -q

## Serverga chiqarish
Hamma narsa commit qilingan bo'lsin, keyin repo ildizidan:

    bash server/deploy/deploy.sh

Serverda: sayt `/srv/kelajagim/sayt`, API `/srv/kelajagim/api` (systemd `kelajagim-api`, port 8100),
maxfiy sozlamalar `/srv/kelajagim/api.env`, zaxiralar `/srv/kelajagim/zaxira` (har kecha, 14 kun).
Loglar: `journalctl -u kelajagim-api -n 100`.
```

- [ ] **Step 4: Run — pass**

Run: `cd server && .venv/bin/pytest -q && bash -n deploy/ornat.sh deploy/deploy.sh deploy/zaxira.sh && echo sintaksis-ok`
Expected: `10 passed`, `sintaksis-ok`

- [ ] **Step 5: Commit**

```bash
chmod +x server/deploy/*.sh
git add server/deploy server/README.md server/tests/test_deploy.py
git commit -m "server: deploy fayllari (nginx, systemd, zaxira, ornat.sh, deploy.sh)"
```

---

### Task 4: SSH kalit va birinchi deploy (DNS'dan oldin, IP orqali)

**Files:** yo'q (server amallari).

**Interfaces:**
- Consumes: `server/deploy/deploy.sh`.
- Produces: serverda ishlab turgan `kelajagim-api` va nginx `kelajagim.uz` sayti (HTTP).

- [ ] **Step 1: Mac kalitini serverga qo'shish** (root paroli faqat shu bir buyruqda, `SSHPASS` muhitida, hech qayerga yozilmaydi)

Run: `SSHPASS='<muallif bergan parol>' sshpass -e ssh-copy-id -o PubkeyAuthentication=no -i ~/.ssh/id_ed25519.pub root@188.137.181.107`
Keyin: `ssh -o BatchMode=yes root@188.137.181.107 'echo kalit-ok'` → `kalit-ok`

- [ ] **Step 2: Boshqa saytlar — oldingi holat**

Run:
```bash
for u in https://botqur.uz https://crm.medpuls.uz http://188.137.181.107:8080/health; do printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' -m 10 $u)" "$u"; done
```
Natijani yozib qo'yish (keyin solishtiriladi).

- [ ] **Step 3: Deploy**

Run: `bash server/deploy/deploy.sh`
Expected: oxirida `{"ok":true,"baza":true}`, `API tayyor`, `Deploy tayyor: <sha>`

- [ ] **Step 4: IP orqali tekshirish (DNS hali GitHub'da)**

Run:
```bash
curl -s --resolve kelajagim.uz:80:188.137.181.107 http://kelajagim.uz/api/salomat
curl -s -o /dev/null -w '%{http_code}\n' --resolve kelajagim.uz:80:188.137.181.107 http://kelajagim.uz/
curl -sI --resolve kelajagim.uz:80:188.137.181.107 http://kelajagim.uz/sw.js | grep -i cache-control
curl -s -o /dev/null -w '%{http_code}\n' --resolve kelajagim.uz:80:188.137.181.107 http://kelajagim.uz/testlar/
```
Expected: `{"ok":true,"baza":true}`, `200`, `Cache-Control: no-cache`, `404`

- [ ] **Step 5: Boshqa saytlar — keyingi holat**: Step 2 buyrug'ini qayta ishga tushirish, kodlar bir xil bo'lishi shart. Farq bo'lsa — `rm /etc/nginx/sites-enabled/kelajagim.uz && systemctl reload nginx` va sababini topish.

- [ ] **Step 6: Zaxira skriptini qo'lda sinash**

Run: `ssh root@188.137.181.107 'sudo -u kelajagim /srv/kelajagim/api/deploy/zaxira.sh && ls -la /srv/kelajagim/zaxira'`
Expected: `zaxira tayyor`, `kelajagim-<bugun>.dump` fayli

- [ ] **Step 7: Brauzerda ko'rish** — Playwright'da `--host-resolver-rules="MAP kelajagim.uz 188.137.181.107"` bilan `http://kelajagim.uz/` ochiladi, bosh sahifa va bitta o'yin ishlaydi, konsolda xato yo'q.

---

### Task 5: DNS ko'chishi, HTTPS, GitHub Pages'ni o'chirish

**Files:**
- Delete: `CNAME`
- Modify: `QOIDALAR.md` (sayt joylashuvi haqida qator, agar GitHub Pages tilga olingan bo'lsa), `README.md` (github.io havolasi → kelajagim.uz, deploy buyrug'i)

**Interfaces:**
- Consumes: Task 4 dagi ishlab turgan server.
- Produces: `https://kelajagim.uz` serverimizdan, `https://www.kelajagim.uz` → apex'ga 301.

- [ ] **Step 1: Muallifdan so'rash** — ahost panelida: `kelajagim.uz` A → `188.137.181.107` (GitHub'ning 4 ta 185.199.x.153 yozuvi o'chiriladi), `www` → CNAME `kelajagim.uz` yoki A `188.137.181.107`. TTL imkon qadar past.

- [ ] **Step 2: DNS tarqalishini kutish**

Run (takrorlab): `dig +short kelajagim.uz @1.1.1.1; dig +short www.kelajagim.uz @1.1.1.1`
Expected: ikkalasida `188.137.181.107`

- [ ] **Step 3: Sertifikat**

Run: `ssh root@188.137.181.107 'certbot --nginx -d kelajagim.uz -d www.kelajagim.uz --redirect --non-interactive --agree-tos -m <muallif emaili> && nginx -t && systemctl reload nginx'`
Expected: `Successfully deployed certificate`

- [ ] **Step 4: Tekshiruv**

```bash
curl -s https://kelajagim.uz/api/salomat
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' http://kelajagim.uz/
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://www.kelajagim.uz/
```
Expected: `{"ok":true,"baza":true}`, `301 https://kelajagim.uz/`, `301 https://kelajagim.uz/` (www). Keyin Task 4 Step 2 dagi boshqa saytlar tekshiruvi.

- [ ] **Step 5: GitHub Pages'ni o'chirish**

```bash
git rm CNAME
# README: github.io havolasini kelajagim.uz ga, "Serverga chiqarish: bash server/deploy/deploy.sh" qatori
cd /Users/bicoder/Documents/Information && node --test 2>&1 | tail -3
git commit -am "Sayt oʻz serverimizga koʻchdi: CNAME olib tashlandi"
git push
gh api -X DELETE repos/ArtCodersGrup/qabila-maktabi/pages
bash server/deploy/deploy.sh
```
Expected: node testlari o'tadi; `gh api` 204; deploy tayyor.

- [ ] **Step 6: Brauzerda yakuniy tekshiruv** — `https://kelajagim.uz` (Playwright): bosh sahifa, bitta o'yin, service worker ro'yxatdan o'tgan, onlayn sahifa hali Supabase bilan ishlaydi (2-bo'lakkacha).

---

## Eslatma: 2- va 3-bo'laklar

Bu reja faqat 1-bo'lakni qamraydi. Onlayn xonalar (2-bo'lak) va akkauntlar (3-bo'lak) alohida rejalarda yoziladi, `0001` dan keyingi alembic reviziyalarini qo'shadi.

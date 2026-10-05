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

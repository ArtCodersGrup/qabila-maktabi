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

## Akkauntlar

Serverda buyruq (api.env bilan):

    sudo -u kelajagim bash -c 'set -a; . /srv/kelajagim/api.env; set +a; cd /srv/kelajagim/api && .venv/bin/python -m app.cli yangi-admin admin'

`yangi-admin` bir martalik parol chiqaradi, birinchi kirishda almashtiriladi. `make-admin <gmail>` — shu Gmail bilan kirgan (yoki kiradigan) odamni admin qiladi.

Google: `api.env` ga `GOOGLE_CLIENT_ID=...` va `GOOGLE_CLIENT_SECRET=...` qo'shib, `systemctl restart kelajagim-api`. Google Console'dagi qaytish manzili: `https://kelajagim.uz/api/hisob/google/qaytish`.

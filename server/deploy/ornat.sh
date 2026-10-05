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

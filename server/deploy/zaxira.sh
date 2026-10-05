#!/bin/bash
# Baza zaxirasi: /srv/kelajagim/zaxira/kelajagim-YYYY-MM-DD.dump, 14 kundan eskisi o'chiriladi.
set -euo pipefail
umask 077  # zaxirada bolalar ma'lumoti bo'ladi — faqat egasi o'qiydi
set -a; . /srv/kelajagim/api.env; set +a
DIR=/srv/kelajagim/zaxira
cd "$DIR"  # o'qib bo'lmaydigan papkadan (masalan /root) chaqirilsa ham ishlasin
pg_dump --format=custom --file="$DIR/kelajagim-$(date +%F).dump" "$PG_URL"
find "$DIR" -name 'kelajagim-*.dump' -mtime +14 -delete
echo "$(date -Is) zaxira tayyor"

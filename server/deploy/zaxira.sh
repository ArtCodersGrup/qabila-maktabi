#!/bin/bash
# Baza zaxirasi: /srv/kelajagim/zaxira/kelajagim-YYYY-MM-DD.dump, 14 kundan eskisi o'chiriladi.
set -euo pipefail
set -a; . /srv/kelajagim/api.env; set +a
DIR=/srv/kelajagim/zaxira
pg_dump --format=custom --file="$DIR/kelajagim-$(date +%F).dump" "$PG_URL"
find "$DIR" -name 'kelajagim-*.dump' -mtime +14 -delete
echo "$(date -Is) zaxira tayyor"

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

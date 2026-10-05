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
# Serverda ufw 22-portni LIMIT qilgan (30 s da 6 ulanish) — hamma buyruq bitta SSH ulanishdan o'tadi
SSH="ssh -o ControlMaster=auto -o ControlPath=/tmp/kelajagim-%C -o ControlPersist=60"
trap 'rm -rf "$TMP"; $SSH -O exit "$HOST" 2>/dev/null || true' EXIT
git archive HEAD | tar -x -C "$TMP"

$SSH "$HOST" 'mkdir -p /srv/kelajagim/sayt /srv/kelajagim/api'
rsync -e "$SSH" -az --delete --exclude=/server/ --exclude=/docs/ "$TMP"/ "$HOST":/srv/kelajagim/sayt/
rsync -e "$SSH" -az --delete --exclude=.venv --exclude=__pycache__ "$TMP/server/" "$HOST":/srv/kelajagim/api/
$SSH "$HOST" 'bash /srv/kelajagim/api/deploy/ornat.sh'
echo "Deploy tayyor: $(git rev-parse --short HEAD)"

#!/bin/bash
# Qabila maktabi — mahalliy server. Telefonda ochish uchun kerak.
# Noutbukning oʻzida oʻynash uchun bu kerak emas: index.html ni ikki marta bossangiz boʻldi.
cd "$(dirname "$0")" || exit 1
PORT=8777
pkill -f "http.server $PORT" 2>/dev/null
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
echo ""
echo "  Kompyuterda:  http://localhost:$PORT/"
[ -n "$IP" ] && echo "  Telefonda:    http://$IP:$PORT/    (telefon shu Wi-Fi'da boʻlsin)"
echo ""
echo "  Toʻxtatish: shu oynada Control + C"
echo ""
open "http://localhost:$PORT/"
python3 -m http.server "$PORT" --bind 0.0.0.0

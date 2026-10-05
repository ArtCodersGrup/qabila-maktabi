# 60 — Paket yoʻli: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok rejasi: [`../umumiy/INTERNET-BLOK.md`](../umumiy/INTERNET-BLOK.md).

- [x] **1. Mantiq** — 4×3 toʻr (17 yonma-yon sim + qiya simlar toʻplami), bogʻlanganlik saqlanib 3–5 sim olinadi; kenglik boʻyicha qidiruv (`bfs`), qoʻshnilar, sim uzish; sahifa fayllari, kelmagan fayl koʻrinishi, server navbati (`kutish`); sakkiz savol generatori.
- [x] **2. Testlar** — 9 ta: BFS qoʻlda tekshirilgan toʻrda, tasodifiy toʻr doim bogʻlangan, javob — BFS masofasi, «keyingi qadam» yagona, uzilgan sim, «qaysi sim» javobi yagona va yoʻlni uzaytiradi, «yetadimi» holatlari, navbat formulasi.
- [x] **3. Ekran** — toʻr: simlar SVG'da, tugunlar HTML tugma (harflar rasm ichida emas), uzilgan sim uzuq chiziq + ✕, eng qisqa yoʻl yashil; sahifa koʻrinishi (sahifa/uslub/shrift/rasm kelganiga qarab), navbat.
- [x] **4. Sahnalar** — kirish, 1-bosqich (paketni qoʻlda uzatish → marshrut), 2-bosqich (sim uzildi), 3-bosqich (sahifa fayllar kelgan sari yigʻiladi → mijoz, server), tabrik.

## Yoʻl-yoʻlakay tanlangan yechimlar

1. **«6 ta qoʻlda chizilgan shakl» oʻrniga** bitta 4×3 toʻr + 4 xil qiya simlar toʻplami + tasodifiy sim olish (bogʻlanganlik saqlanadi) — xilma-xillik koʻproq, test qilish oson.
2. **Generator shartni bajarolmasa** (`null`) — `pickNew` 400 marta qayta urinadi; bu oʻyinda «javob yagona» kabi shartlar koʻp.
3. **«Yetadimi» savolida yoʻl butunlay uzilishi** uchun manzil (yoki boshlanish) tugunining ikkala simi uziladi — tasodifiy uzishda bu juda kam chiqardi.

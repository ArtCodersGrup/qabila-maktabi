# 21 — Oʻn oltilik ranglar: ish rejasi

**Maqsad:** 21-o'yin: A–F, 2 ↔ 16 (4 tadan guruhlash), rang kodlari, 16-likda qo'shish/ayirish (ko'chish 16 da, qarz 16), bir xonali songa ko'paytirish.

**Arxitektura:** umumiy `sanoq.js` (`stepsAdd/Sub/Mul`) va `sanoq-ui.js` (`ustun`, `guide`, `digitTries`), o'yin topshiriqlari `js/amal16.js` (tetradalar, guruhlash, ranglar), ekran qismlari `js/amal16-ui.js` (tetradalar jadvali, bosiladigan guruhlar, rang namunasi, A–F va 16 ga karralilar).

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi (muallif topshirig'i: blokni to'xtamasdan oxirigacha olib borish).

## Vazifalar

- [x] 1. `js/amal16.js` + `tests/amal16.test.js`: tetradalar, guruhlash, 9 ta rang, topshiriqlar (2 → 16, 16 → 2, rang; qo'shish/ayirish 75% ko'chish/qarzli; × 2–9, natija ≤ 3 xona).
- [x] 2. `js/amal16-ui.js`, rasmlar + test (harf shaklidagi rasm ishlatilmadi — QOIDALAR 6), sahnalar, uslublar, `index.html`, `main.js` + test.
- [x] 3. Bosh sahifa: 21-o'yin (`rang16` ikonkasi, yosh 10–12); `sw-royxat.py --bump`.
- [x] 4. Brauzerda avtomat o'ynab chiqish (360×740, 740×360, 1280×800): xato, qotish, gorizontal aylantirish yo'q.

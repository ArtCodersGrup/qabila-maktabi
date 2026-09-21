# 18 — Tangalar bozori: ish rejasi

**Maqsad:** 18-o'yin: istalgan sanoq tizimidan o'nlikka (x → 10) — tangalar = xona qiymatlari, raqam × xona qiymati yig'indisi; 2-lik, 3–8-lik, 16-lik.

**Arxitektura:** umumiy `umumiy/js/sanoq.js` (expand, fromBase), o'yin topshiriqlari `js/bozor.js` (Node testlari), ekran qismlari `js/bozor-ui.js` (tanga olish, hamyon, son ustida xona qiymatlari, A–F qatori).

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi (muallif topshirig'i: blokni to'xtamasdan oxirigacha olib borish).

## Vazifalar

- [x] 1. `js/bozor.js` + `tests/bozor.test.js`: 2-lik (4–8 xona), 3–8-lik (2–3 xona), 16-lik (2 xona, 80% harfli), barchasi ≤ 255; yoyib yozish matni.
- [x] 2. `js/bozor-ui.js`, `js/game-art.js` + test, sahnalar, uslublar, `index.html`, `main.js` + test.
- [x] 3. Bosh sahifa: 18-o'yin (`tanga` ikonkasi, yosh 10–12); `sw-royxat.py --bump`.
- [x] 4. Brauzerda avtomat o'ynab chiqish (360×740, 740×360, 1280×800): xato, qotish, gorizontal aylantirish yo'q.

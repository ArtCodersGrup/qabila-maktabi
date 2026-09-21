# 17 — Qabila choʻti: ish rejasi

**Maqsad:** 17-o'yin (sanoq tizimlari blokining boshi): asos, raqamlar 0 … n−1 va A–F, yozuv 101₂, pozitsion/nopozitsion, xona qiymatlari.

**Arxitektura:** blok uchun umumiy kod yaratildi — `umumiy/js/sanoq.js` (hisob: toBase, fromBase, valid, expand, divSteps, ustunda qo'shish/ayirish/ko'paytirish; `umumiy/tests/sanoq.test.js`), `umumiy/js/sanoq-ui.js` (cho't, ustun taxtasi, asosga mos klaviatura `basePad`, `digitTries`, `guide`), `umumiy/css/sanoq.css`. O'yinning o'z topshiriqlari — `js/tizim.js`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi (muallif topshirig'i: blokni to'xtamasdan oxirigacha olib borish).

## Vazifalar

- [x] 1. `umumiy/js/sanoq.js` + testlar (TDD): o'tishlar 2–16 asoslarda aylanma tekshiruv, ustunda amallar tasodifiy sonlarda `toBase` bilan solishtiriladi.
- [x] 2. `umumiy/js/sanoq-ui.js`, `umumiy/css/sanoq.css`; `bosh/sw-royxat.py` va `bosh/tests/offline.test.js` endi `umumiy/css/` dagi barcha fayllarni oladi.
- [x] 3. `js/tizim.js` + `tests/tizim.test.js`: cho't (o'qish, +1), yozuv to'g'riligi, eng kichik asos, harf qiymati, xona qiymati, raqam turgan xona, tizim turi.
- [x] 4. Sahnalar, rasmlar, uslublar, `index.html`, `main.js` + testlar.
- [x] 5. Bosh sahifa: 17-o'yin, `choti` ikonkasi, **o'yinning o'z yoshi** (`age: "10–12"`, kartada ko'rsatiladi; test: 17+ o'yinlar — 10–12).
- [x] 6. Brauzerda avtomat o'ynab chiqish (360×740, 740×360, 1280×800). Topilgan va tuzatilgan: mashqda cho't simlari ostidagi raqamlar javobni ochib qo'yardi — endi yashirin, maslahatda ochiladi.

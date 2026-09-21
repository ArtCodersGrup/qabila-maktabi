# 20 — Ikkilik hisobchi: ish rejasi

**Maqsad:** 20-o'yin: ikkilikda qo'shish (1 + 1 = 10), ayirish (qarz), ko'paytirish (surish va qo'shish), natijani o'nlikda tekshirish.

**Arxitektura:** umumiy kodga ustunda hisoblash qadamlari qo'shildi — `sanoq.stepsAdd/stepsSub/stepsMul` (har ustun uchun savol, maslahat, ko'chish/qarz yozuvi; testlar natijani `toBase` bilan solishtiradi) — 20–22-o'yinlar ishlatadi. `sanoqUi.guide` joriy qadamni `QK.guideStep` ga yozadi (avtomat tekshiruv uchun). O'yin topshiriqlari `js/amal2.js`; ko'paytirish bloki `common.mulBlock`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi (muallif topshirig'i: blokni to'xtamasdan oxirigacha olib borish).

## Vazifalar

- [x] 1. `umumiy/js/sanoq.js`: `stepsAdd`, `stepsSub`, `stepsMul`, `dv` + testlar (2–16 asoslarda tasodifiy sonlar).
- [x] 2. `js/amal2.js` + `tests/amal2.test.js`: qo'shish (3–5 xona), ayirish (85% qarzli), surish (× 10₂…1000₂) va ko'paytirish (× 11, 101, 110, 111; ≤ 8 xona).
- [x] 3. Sahnalar (cho'tda +1/−1, ustunda bosqichma-bosqich, qatorlar bilan ko'paytirish), rasmlar + test, uslublar, `index.html`, `main.js` + test.
- [x] 4. Bosh sahifa: 20-o'yin (`hisob2` ikonkasi, yosh 10–12); `sw-royxat.py --bump`.
- [x] 5. Brauzerda avtomat o'ynab chiqish (360×740, 740×360, 1280×800), ustunda ataylab xato raqam bilan: xato, qotish, gorizontal aylantirish yo'q.

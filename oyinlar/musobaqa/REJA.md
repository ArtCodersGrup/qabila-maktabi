# Musobaqa: ish rejasi

**Maqsad:** ikki oʻyinchi bitta ekranda: shaxmat soati, 3 ta yurak, juft savollar (bir xil tur, har xil son), bir martalik oʻtkazish, tanga, pauza, natija va xatolar roʻyxati.

**Arxitektura:** sof mantiq ikki faylda: `js/savollar.js` (savol turlari va juft savol) va `js/musobaqa.js` (holat mashinasi, soat `tick(ms)` orqali, taymersiz). Ikkalasi Node testlari bilan tekshiriladi. Ekran: `js/maydon.js` + `js/main.js`, rasmlar `js/musobaqa-art.js`. Mavjud mantiq qayta ishlatiladi: `sanoq.js`, `roman.js`, `caesar.js`, `morse.js`, `neural.js`, `atlas.js`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Muallif topshirigʻi: dizayn kelishilgach, ishni toʻxtamasdan oxirigacha olib borish.

## Vazifalar

- [x] 1. `js/musobaqa.js` + `tests/musobaqa.test.js`: navbat, soat faqat "savol" holatida, yurak, oʻtkazish (1 marta), raund oxirigacha oʻynash, vaqt tugashi, ikkalasi chiqsa — vaqt, savollar tugasa — yurak, keyin vaqt, durang.
- [x] 2. `js/savollar.js` + `tests/savollar.test.js`: 5 mavzu × 3 qiyinlik, har tur uchun: javob toʻgʻri (mustaqil tekshiruv), variantlar noyob va javobni oʻz ichiga oladi, tugmalar javobni yoza oladi, matnda `ʻ`, juftda kalitlar har xil, takror yoʻq, tugaydigan turlar toʻgʻri chiqib ketadi.
- [x] 3. `js/musobaqa-art.js` + test (SVG, matnsiz); `index.html`, `css/style.css`, `js/maydon.js`, `js/main.js`.
- [x] 4. Bosh sahifa: "Musobaqa" kartasi; `sw-royxat.py` va `offline.test.js` musobaqa papkasini oladi; `--bump`; README.
- [x] 5. Brauzerda avtomat oʻynab chiqish (360×740, 740×360, 1280×800): xato, qotish, gorizontal aylantirish yoʻq.
- [x] 6. Yakuniy kod koʻrigi, tuzatishlar, main'ga birlashtirish, push.

# 19 — Qoplarga joylash: ish rejasi

**Maqsad:** 19-o'yin: o'nlikdan istalgan tizimga (10 → x) — kattadan boshlab (tangalar), bo'lib-bo'lib (qoldiqlar pastdan yuqoriga), 8-lik va 16-lik, teskari tekshirish.

**Arxitektura:** umumiy `umumiy/js/sanoq.js` (divSteps, toBase, expand), o'yin topshiriqlari `js/qop.js` (Node testlari), ekran qismlari `js/qop-ui.js` (tangalar qatori, bo'lish jadvali — qoldiqlarni bosish, pastdan yuqoriga o'q). 2-bosqichdagi "bo'l va o'qi" sahnasi 3-bosqichda ham ishlatiladi (`QK.qopScenes`).

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi (muallif topshirig'i: blokni to'xtamasdan oxirigacha olib borish).

## Vazifalar

- [x] 1. `js/qop.js` + `tests/qop.test.js`: kattadan boshlab qadamlari (1–99 da toBase bilan solishtiriladi), 5–63 → 2-lik, 10–100 → 2–8-lik, 20–255 → 8/16-lik, "to'g'rimi?" (to'g'ri yoki teskari o'qilgan, teskarisi 0 bilan boshlanmaydi).
- [x] 2. `js/qop-ui.js`, `js/game-art.js` + test, sahnalar, uslublar, `index.html`, `main.js` + test.
- [x] 3. Bosh sahifa: 19-o'yin (`qop` ikonkasi, yosh 10–12); `sw-royxat.py --bump`.
- [x] 4. Brauzerda avtomat o'ynab chiqish (360×740, 740×360, 1280×800): xato, qotish, gorizontal aylantirish yo'q (ataylab noto'g'ri tartibda qoldiq bosish ham sinaldi).

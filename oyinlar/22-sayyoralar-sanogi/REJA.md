# 22 — Sayyoralar sanogʻi: ish rejasi

**Maqsad:** 22-o'yin (sanoq tizimlari blokining yakuni): 3–9-lik tizimda qo'shish, ayirish (qarz = n), bir xonali songa ko'paytirish, "qaysi tizimda a + b = 1c?" jumbog'i, Bobil (60-lik) va Mayya (20-lik).

**Arxitektura:** umumiy `sanoq.js` (`stepsAdd/Sub/Mul`) va `sanoq-ui.js` (cho't, `ustun`, `guide`, `digitTries`), o'yin topshiriqlari `js/sayyora.js`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi (muallif topshirig'i: blokni to'xtamasdan oxirigacha olib borish).

## Vazifalar

- [x] 1. `js/sayyora.js` + `tests/sayyora.test.js`: qo'shish (90% ko'chishli), ayirish (90% qarzli, a > b, b kamida 2 xonali — test a = b chekka holatini topdi va u tuzatildi), ko'paytirish (2 xonali × 2 … n−1) va jumboq (x, y < n, x + y ≥ n).
- [x] 2. Rasmlar + test (barmoqli qo'llar, Bobil soati, Mayya ehromi), sahnalar, uslublar, `index.html`, `main.js` + test.
- [x] 3. Bosh sahifa: 22-o'yin (`sayyora` ikonkasi, yosh 10–12); `sw-royxat.py --bump`; README jadvali 22 tagacha.
- [x] 4. Brauzerda avtomat o'ynab chiqish (360×740, 740×360, 1280×800): xato, qotish, gorizontal aylantirish yo'q.

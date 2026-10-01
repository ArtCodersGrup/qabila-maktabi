# 41 — Tanlov daraxti: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok rejasi: [`../umumiy/KOMBINATORIKA-BLOK.md`](../umumiy/KOMBINATORIKA-BLOK.md).

- [x] **1. Umumiy modul** — `umumiy/js/sanash.js`: `fakt`, `A`, `C`, `takrorli`, `kopaytir`, `qosh`, `variantlar`, `tartiblar`, `orinlar`, `tanlovlar`, `paskal`, `dirixle`. Hammasi **BigInt** (20! JS `number` ga sigʻmaydi). 42–45-oʻyinlar shu ustiga quriladi.
- [x] **2. Testlar** — `umumiy/tests/sanash.test.js` (10 ta): `C(n,k) = C(n,n−k)`, `A = C·k!`, roʻyxat uzunligi formulaga teng, Paskal qatorining yigʻindisi `2ⁿ`. `tests/logic.test.js` (10 ta): daraxt barglari koʻpaytmaga teng, VA/YOKI javoblari, namunali yechimlar testdan oʻtishi.
- [x] **3. Ekran** — daraxt HTML bilan (SVG ichida matn yoʻq), variantlar roʻyxati, VA/YOKI kartalari.
- [x] **4. Sahnalar** — daraxt shox-shox oʻsadi; uchinchi qadam; ikki karta; sikl va formulaning bir xil javobi.
- [x] **5. Bosh sahifa va oflayn** — yangi boʻlim **«Kombinatorika»** (algoritmlardan keyin), ikonka `daraxt`, `sw.js` (`v59`), `bosh.test.js` da 💻 va yosh testlariga yangi blok qoʻshildi.
- [x] **6. Tekshiruv** — testlar yashil; brauzerda oxirigacha oʻynaldi, konsol toza; 390/768/1200 px da sahifa yon tomonga siljimaydi.

## Qoladi

- Blokning qolgan oʻyinlari: 42 Qatorga terish, 43 Jamoa tanlash, 44 Paskal uchburchagi, 45 Kaptarxona.
- Masalalar bankiga `kombinatorika` tegi bilan masalalar (muallif roziligi bor).

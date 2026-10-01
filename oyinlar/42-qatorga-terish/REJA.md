# 42 — Qatorga terish: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok rejasi: [`../umumiy/KOMBINATORIKA-BLOK.md`](../umumiy/KOMBINATORIKA-BLOK.md).

- [x] **1. Mantiq** — `js/logic.js`: `qadamlar(n)`, `tartiblar(n)`, `n!` va `A(n,k)` savollari, kod masalalari (`fakt`, `orin`), `OSISH` jadvali.
- [x] **2. Testlar** — 11 ta: tartiblar roʻyxati `n!` ga teng va takrorsiz, `A` koʻpaytuvchilari soni `k`, `k = n` da `n!` chiqishi, namunali yechimlar oʻtishi, `n ** k` oʻtmasligi, `23!` ning aniqligi.
- [x] **3. Ekran** — tartiblar roʻyxati, qadam chiplari (5 × 4 × 3), `n!` oʻsish jadvali.
- [x] **4. Sahnalar** — 6 ta tartib yozib chiqiladi; bola oʻrinlarni oʻzi sanaydi; medallar; kod va oʻsish.
- [x] **5. Bosh sahifa va oflayn** — `bosh.js`, ikonka `qator3`, `sw.js` (`v60`), havola (`40-oʻyin`) roʻyxatga qoʻshildi.
- [x] **6. Tekshiruv** — testlar yashil; brauzerda oxirigacha oʻynaldi, konsol toza.

## Yoʻl-yoʻlakay tuzatilgan xatolar

1. **«20! JS number ga sigʻmaydi» — notoʻgʻri daʼvo edi.** Oʻlchab koʻrildi: `20!`, `21!`, `22!` aniq chiqadi,
   birinchi xato beradigani — `23!`; `MAX_SAFE_INTEGER` dan oshadigani esa `19!`. Daʼvo hamma faylda tuzatildi
   (`sanash.js`, blok rejasi, 41-oʻyin rejasi, testlar).
2. **`bosh.test.js` vergulli bosqich sarlavhasini notoʻgʻri sanardi** («Medallar A(n,k)» → 4 ta bosqich deb).
   Test qoʻshtirnoq juftlari boʻyicha sanaydigan qilindi.

# 48 — Mantiq kodda: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md).

- [x] **1. Mantiq** — `qiymat()`, `jadval()`, solishtirish/ifoda/gap/kod/yozish savollari.
- [x] **2. Testlar** — 10 ta: and/or/not jadvallari, De Morgan, ikkala javobning uchrashi,
      namunali yechimlar, chegara xatolari (`>` ↔ `>=`, `or` ↔ `and`).
- [x] **3. Ekran** — rostlik jadvali (qiymatlar Pythondan), True/False tugmalari, gap kartasi.
- [x] **4. Sahnalar** — solishtirish namoyishi; uch jadval; shart yozish.
- [x] **5. Bosh sahifa va oflayn** — `bosh.js` (12–16, 💻), ikonka `mantiqkod`, `sw.js` (`v69`).
- [x] **6. Tekshiruv** — testlar yashil; brauzerda uch bosqich oxirigacha oʻynaldi.

## Yoʻl-yoʻlakay tuzatilgan xatolar

1. **`gapTask` id ni bitta gapdan, matnni boshqasidan olardi** (`pick()` ikki marta chaqirilgan).
   Endi bitta gap tanlanadi; test id va matn bir gapga tegishli ekanini tekshiradi.
2. **`mantiq-ui.js` `ui.js` dan oldin ulangan edi** — u yuklanish paytida `QK.ui.h` ni oʻqiydi va
   konsolda xato berardi. Bu oʻyin unga muhtoj emas (oʻz jadvali bor), shuning uchun butunlay olib tashlandi.
3. **💻 testi blokka bogʻlangan edi.** Bu oʻyin mantiq blokida, lekin kod yoziladi —
   test endi «kod yoziladigan oʻyinlar» roʻyxati boʻyicha tekshiradi.

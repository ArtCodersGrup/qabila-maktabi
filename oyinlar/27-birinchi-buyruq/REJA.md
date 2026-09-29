# 27 — Birinchi buyruq: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok rejasi: [`../umumiy/PYTHON-BLOK.md`](../umumiy/PYTHON-BLOK.md).

- [x] **1. Dvigatel** — `umumiy/js/python/` (alohida commit): tokenizer, parser, qiymatlar, ichki funksiyalar, bajaruvchi. Testlar: birlik + `python3` bilan solishtirish + fuzz.
- [x] **2. Masala turlari** — `umumiy/js/kod.js`: `ter`, `natija`, `bosh-joy`, `xato-top`, `kod-yoz` va ularni tekshirish. Test: `umumiy/tests/kod.test.js`.
- [x] **3. Ekran qismlari** — `umumiy/js/kod-ui.js` va `umumiy/css/kod.css`: muharrir, chiqish paneli, qadam-baqadam panel, kodni boʻyash, telefon ogohlantirishi.
- [x] **4. Savollar** — `js/logic.js`: toʻrt generator (ter, natija, xato-top, kod-yoz) + 3-bosqichda navbat. Test: `tests/logic.test.js` (8 ta test).
- [x] **5. Sahnalar** — `js/scenes/`: kirish, uch bosqich, hikoya, tabrik.
- [x] **6. Rasmlar va uslub** — `js/game-art.js` (ekran, ilon), `css/style.css`.
- [x] **7. Bosh sahifa** — `bosh/js/bosh.js` da `python` boʻlimi va oʻyin; ikonka `bosh/js/bosh-art.js` da; `bosh/tests/bosh.test.js` da 💻 va yosh testlari yangilandi.
- [x] **8. Raqamlar** — blok qoʻshilgani uchun undan keyingi oʻyinlar raqami surildi: `node bosh/tools/renumber.js` (19 faylda 22 ta raqam).
- [x] **9. Oflayn** — `sw.js` ga yangi fayllar qoʻshildi, versiya `v42`.
- [x] **10. Tekshiruv** — `node --test bosh/tests/*.test.js`, `node --test oyinlar/umumiy/tests/*.test.js`, `cd oyinlar/27-birinchi-buyruq && node --test tests/*.test.js`; brauzerda bitta yakuniy sinov (kod yozildi, ishga tushdi, chiqish toʻgʻri).

## Qoladi

- Muallif oʻyinni oʻzi koʻrib chiqadi (kompyuterda).
- Keyingi oʻyin: `28-sonlar-ustaxonasi`.

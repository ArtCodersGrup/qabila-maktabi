# 39 — Saralash: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok rejasi: [`../umumiy/ALGORITM-BLOK.md`](../umumiy/ALGORITM-BLOK.md).

- [x] **1. Mantiq** — `js/logic.js`: `pufakQadamlar()` va `tanlashQadamlar()` har qadamni yozib boradi (ekran shuni chizadi), oʻlchov va jadval, uch xil savol, ikkita kod yozish masalasi.
- [x] **2. Testlar** — `tests/logic.test.js` (12 ta): saralash toʻgʻriligi tasodifiy roʻyxatlarda, qadamlar soni `n(n−1)/2`, tanlashda har oʻtishda haqiqatan eng kichigi topilishi, jadvalning toʻrt barobar oʻsishi, saralamaydigan va bitta oʻtishli yechim oʻtmasligi.
- [x] **3. Ekran** — ustunlar (balandlik + son), belgilangan juftlik, tayyor qism, oʻlchov jadvali.
- [x] **4. Sahnalar** — bola bir oʻtishni oʻzi bajaradi; kod; tanlash qadam-baqadam; jadval; kod yozish.
- [x] **5. Bosh sahifa va oflayn** — `bosh.js`, ikonka, `sw.js` (`v57`), havola raqamlari.
- [x] **6. Tekshiruv** — testlar yashil; brauzerda sinaldi. **Topilgan xato:** birinchi juftlik (indeks 0) belgilanmasdi — `o.juft && …` nol uchun ishlamaydi. Tuzatildi (`!= null`) va test bilan qotirildi.

## Qoladi

- Muallif oʻyinni oʻzi koʻrib chiqadi.
- Keyingi (oxirgi) oʻyin: **40 — Qadamlar soni va O(n)**: 38 va 39-oʻyinlardagi oʻlchovlar shu yerda nom oladi.

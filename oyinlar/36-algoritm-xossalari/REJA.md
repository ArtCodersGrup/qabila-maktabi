# 36 — Algoritm va xossalari: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok rejasi: [`../umumiy/ALGORITM-BLOK.md`](../umumiy/ALGORITM-BLOK.md).

- [x] **1. Savollar** — `js/logic.js`: beshta xossa; yettita buzuq kundalik algoritm (har xossaga kamida bittasi); toʻrtta «bir masala — ikki yechim» juftligi; uchta buzuq Python kodi va yechimi. Qadamlar soni talqinchidan olinadi (`py.run().steps`). Test: `tests/logic.test.js` (10 ta).
- [x] **2. Umumiy asbob** — `umumiy/js/kod-ui.js` ga `qadamJadval()` qoʻshildi: yechimlarni qadamlar soni boʻyicha yonma-yon koʻrsatadi (chiziq bilan, tejamlisi belgilanadi). **38–40-oʻyinlar ham shuni ishlatadi.**
- [x] **3. Rasm** — `js/game-art.js`: ikki yoʻl (biri uzun va burilishli, biri toʻgʻri; ikkalasi bir joyga boradi).
- [x] **4. Sahnalar** — kirish, uch bosqich, tabrik. Xossani tanlash uchun beshta tugmali roʻyxat; 1-bosqichda ikki yechimdan tanlash.
- [x] **5. Bosh sahifa va oflayn** — yangi boʻlim **«Algoritmlar va samaradorlik»** (Python blokidan keyin), ikonka, `sw.js` (`v54`), havola raqamlari yangilandi, `bosh.test.js` da 💻 va yosh testlari yangi blokni qamrab oldi.
- [x] **6. Tekshiruv** — testlar yashil; brauzerda sinaldi:
  - 1-bosqich: jadvalda «Sikl bilan — 203 qadam» va «Formula bilan — 2 qadam», javob ikkalasida ham 5050;
  - 2-bosqich: beshta xossa tugmasi, xato javobdan keyin buzilgan qator belgilanadi;
  - 3-bosqich: kodni tuzatish testlardan oʻtdi.

## Qoladi

- Muallif oʻyinni oʻzi koʻrib chiqadi.
- Keyingi oʻyin: **37 — Blok-sxema** (blokning eng katta qismi; `ALGORITM-BLOK.md` da cheklov yozilgan: bitta darajali ichma-ichlik).

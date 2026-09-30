# Algoritm va xossalari: ish rejasi (TUGALLANMAGAN)

**Holat (2026-10-01): ish toʻxtatildi, keyin davom ettiriladi.**

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok rejasi: [`../umumiy/ALGORITM-BLOK.md`](../umumiy/ALGORITM-BLOK.md).

> **Papka nomi ataylab raqamsiz.** Tugallanmagan oʻyin `36-…` deb nomlansa, bosh sahifa testlari
> yiqiladi (oʻyin `GAMES` roʻyxatida boʻlishi shart). Ish tugagach, papka `36-algoritm-xossalari`
> deb nomlanadi va roʻyxatga qoʻshiladi.

## Bajarildi

- [x] **DIZAYN.md** — oʻquv maqsadlari, uch bosqich, ekran va kod tuzilishi.
- [x] **js/logic.js** — beshta xossa; yettita buzuq kundalik algoritm (har xossa uchun kamida bittasi);
      toʻrtta "bir masala — ikki yechim" juftligi; uchta buzuq Python kodi va yechimi.
      Qadamlar soni talqinchidan olinadi (`py.run().steps`).
- [x] **tests/logic.test.js** — 10 ta test, hammasi yashil: xossalar toʻliq, buzilgan qator chegarada,
      ikki yechimning javobi bir xil va qadamlari boshqa, buzuq kod testdan oʻtmasligi, cheksiz sikl tutilishi.

## Qoladi

- [ ] **js/game-art.js** — ikki yoʻl rasmi (biri uzun, biri qisqa; ikkalasi bir joyga boradi).
- [ ] **js/scenes/** — `common.js` (xossa tanlash mashqi, qadam jadvali), `stage1.js` (ikki yoʻl),
      `stage2.js` (beshta xossa), `stage3.js` (kodda xossa), `final.js`.
- [ ] **index.html**, **css/style.css**, **js/main.js** — 27–35-oʻyinlardagi naqsh boʻyicha.
- [ ] **Umumiy asbob:** `qadamOlchov` — ikki kodning qadamlarini yonma-yon koʻrsatadigan jadval.
      38–40-oʻyinlarga ham kerak, shuning uchun `umumiy/js/` ga chiqariladi.
- [ ] **Bosh sahifa:** yangi boʻlim `algoritm` («Algoritmlar va samaradorlik», Python blokidan keyin),
      ikonka, `sw.js` ga fayllar va versiya, `node bosh/tools/renumber.js`.
- [ ] Papkani `36-algoritm-xossalari` deb nomlash.

## Davom ettirish

```bash
cd oyinlar/algoritm-xossalari && node --test tests/*.test.js   # hozir: 10/10 yashil
```

Keyin yuqoridagi roʻyxat boʻyicha: rasm → sahnalar → sahifa → bosh sahifa → brauzerda sinov → git.

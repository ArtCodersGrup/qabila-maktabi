# 16 — Xotira ombori: ish rejasi

**Maqsad:** 16-o'yin (blok yakuni): bit → bayt → Kbayt → Mbayt → Gbayt → Tbayt zinapoyasi, fayllarni tartiblash, turli birliklarni solishtirish, "nechta sig'adi", 1 Tbayt = 931 Gbayt.

**Arxitektura:** oldingi o'yinlardagidek. Sof hisob `js/units.js` (Node testlari), ekran qismlari `js/units-ui.js`, sahnalar `js/scenes/`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi (muallif topshirig'i: blokni to'xtamasdan oxirigacha olib borish).

## Nomlar va interfeyslar

- `QK.units`: `UNITS`, `factor(i)`, `toBits(n, unit)`, `compare(a, b)`, `ITEMS`, `ORDER`, `DISK`, `FLASH`, `CROSS`, `makeLadderTask`, `makeCompareTask`, `makeFitTask`.
- `QK.unitsUi`: `ladder(host, show)` → `{el, setShown, light}` (DOM bitdan boshlanadi; tik ekranda pastdan yuqoriga, yotiq ekranda chapdan o'ngga), `unitButtons(list, onPick)`, `fileCard(item, asButton)`, `storageBar(host, parts, label)` → `{fill}`, `sizeCard(s)`.
- `QK.art`: `storehouse()`, `fileIcon(id)`, `story("disk" | "datacenter" | "ladder")`.

## Vazifalar

- [x] 1. `js/units.js` + `tests/units.test.js`: birliklar, × 8 / × 1024, taqqoslash, fayllar tartibi, 931 Gbayt, topshiriqlar (takrorsiz; javob ≤ 64).
- [x] 2. `js/game-art.js` + test (SVG, matnsiz, har faylga ikonka).
- [x] 3. `js/units-ui.js`, `js/scenes/*.js`, `css/style.css`, `index.html`, `js/main.js` + test.
- [x] 4. Bosh sahifa: `GAMES` ga 16-o'yin, `ombor` ikonkasi; `sw-royxat.py --bump`. README'dagi o'yinlar jadvali 16 tagacha to'ldirildi.
- [x] 5. Brauzerda avtomat o'ynab chiqish (360×740, 740×360, 1280×800). Topilgan va tuzatilgan: "1 bayt = 8 ___" yechimida javob emas, savoldagi pog'ona yoritilardi.

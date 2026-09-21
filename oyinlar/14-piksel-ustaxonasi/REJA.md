# 14 — Piksel ustaxonasi: ish rejasi

**Maqsad:** 14-o'yin: rasm hajmi — oq-qora piksel 1 bit, ranglar va bitlar, rangli piksel 3 bayt, megabayt, siqish (takrorlanuvchi ranglar).

**Arxitektura:** oldingi o'yinlardagidek. Sof hisob `js/pixels.js` (Node testlari), ekran qismlari `js/pixels-ui.js`, sahnalar `js/scenes/`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi (muallif topshirig'i: blokni to'xtamasdan oxirigacha olib borish).

## Nomlar va interfeyslar

- `QK.pixels`: `PALETTE4`, `PALETTE16`, `COLOR_TABLE`, `BPP_COLORS`, `MIX_NAMES`, `TARGETS`, `DEMO_ROW`, `PHOTO`, `minBits`, `code(i, bits)`, `mixName(rgb)`, `mixCss(rgb)`, `runs(row)`, `taskKey(t)`, `makeBwTask`, `makeColorTask`, `makePhotoTask`.
- `QK.pixelsUi`: `BW`, `fit(w, h)`, `grid(host, {w, h, cells, colors, editable, pickColor, size})` → `{get, lock, showCodes, highlightRow}`, `taskPicture(host, task, colors, extra)`, `palette(host, list, start)` → `{get}`, `mixer(host, target, onChange)` → `{lock}`, `rowView(row, split)`, `rleView(row)`.
- `QK.art`: `easel()`, `story("phone" | "zoom" | "film")`.
- `QK.common.add(host, ...nodes)` — maslahat/yechim qo'shib, ko'rinadigan joyga suradi (13-o'yinga ham qo'shildi).

## Vazifalar

- [x] 1. `js/pixels.js` + `tests/pixels.test.js`: palitralar, bitlar, qator bo'laklari, rang aralashtirish, surat hajmi (34 Mbayt), topshiriqlar (javob ≤ 100, takrorsiz).
- [x] 2. `js/game-art.js` + test (SVG, matnsiz).
- [x] 3. `js/pixels-ui.js`, `js/scenes/*.js`, `css/style.css`, `index.html`, `js/main.js` + test.
- [x] 4. Bosh sahifa: `GAMES` ga 14-o'yin, `piksel` ikonkasi; `sw-royxat.py --bump`.
- [x] 5. Brauzerda avtomat o'ynab chiqish (360×740, 740×360, 1280×800). Topilgan va tuzatilgan: kichik rasm juda mayda edi (katak o'lchami rasmga qarab), yotiq ekranda rasm va maslahat raqam klaviaturasi bilan sig'masdi (`.pgrid.fit`, rasm ostida "W × H piksel", maslahat ko'rinadigan joyga suriladi).

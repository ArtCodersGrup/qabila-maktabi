# 25 — Zinapoya chirogʻi: ish rejasi

**Maqsad:** 25-oʻyin: XOR (faqat bittasi), amallar zanjiri (sxema), yarim qoʻshuvchi — kompyuter qanday qoʻshadi.

**Arxitektura:** oldingi oʻyinlardagidek. Sof mantiq `js/gates.js` (Node testlari), ekran qismlari `js/gates-ui.js`, sahnalar `js/scenes/`. Kalit tugmalari va rostlik jadvali — umumiy `umumiy/js/mantiq-ui.js` + `umumiy/css/mantiq.css` (24-oʻyindan chiqarildi, ikkalasi ishlatadi).

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi (muallif topshirigʻi: "mantiq qoʻsh", oxirigacha toʻxtamasdan).

## Nomlar va interfeyslar

- `QK.gates`: `OPS` (and, or, xor, not), `PAIRS`, `BINARY`, `TEMPLATES` (single, thenNot, notFirst, xorBuild, halfAdder), `circuit(tpl, op)`, `evaluate`, `outputs`, `output`, `exprText`, `steps`, `halfAdd`, `bin`, `add2`, `add2Options`, `makeTask(stage, prev)`.
- `QK.gatesUi`: `stairView`, `gatesView(host, c, { unknown })` → `{ set(a, b, { hide, reveal }), open() }`, `sumView`, `addTable` (ustunni belgilash), `columnAdd`.
- `QK.mantiqUi` (umumiy): `switches`, `letterSwitch(key, subs)`, `truthTable`.
- `QK.art`: `stairCircuit`, `stairs`, `gateLayout`, `gatesSvg`, `room`, `chip`.

## Vazifalar

- [x] 1. `js/gates.js` + `tests/gates.test.js` (TDD): jadvallar, sxemalar qiymati va tuzilishi, ifoda matni va qadamlar, qoʻshish, topshiriqlar ("qaysi amal?" — javobi yagona).
- [x] 2. `js/game-art.js` + `tests/game-art.test.js`: zinapoya (XOR), sxema joylashuvi (hamma narsa rasm ichida), matnsiz.
- [x] 3. Umumiy: kalitlar va jadval `umumiy/js/mantiq-ui.js` ga; 24-oʻyin undan oladi (qayta oʻynab tekshirildi).
- [x] 4. `js/gates-ui.js`, `js/scenes/*.js`, `css/style.css`, `index.html`, `js/main.js` + `tests/main.test.js`.
- [x] 5. Bosh sahifa: `GAMES` ga 25-oʻyin ("10–12"), `zinapoya` ikonkasi; `python3 bosh/sw-royxat.py --bump`; README.
- [x] 6. Barcha testlar; brauzerda avtomat oʻynab chiqish (360×740, 740×360, 1280×800). Tuzatilgan: zinapoya yozuvlari chiroqqa tushardi, kalit ostida "uzilgan" (zinapoya kaliti uzilmaydi — "bosilgan"), kirish yozuvlari simlarga tegardi, "EMAS" qutidan chiqardi.

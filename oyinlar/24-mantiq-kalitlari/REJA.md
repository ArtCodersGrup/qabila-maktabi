# 24 — Mantiq kalitlari: ish rejasi

**Maqsad:** 24-oʻyin: rost va yolgʻon, VA (ketma-ket kalitlar), YOKI (parallel), EMAS (teskari kalit), rostlik jadvali, ifodalar va hayotiy qoidalar.

**Arxitektura:** oldingi oʻyinlardagidek. Sof mantiq `js/logic.js` (Node testlari), ekran qismlari `js/logic-ui.js`, sahnalar `js/scenes/`. Mashq sikli — `umumiy/js/practice.js`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi (muallif topshirigʻi: "mantiq qoʻsh", oxirigacha toʻxtamasdan).

## Nomlar va interfeyslar

- `QK.logic`: `OPS` (and, or, not: name, circuit, f), `PAIRS`, `apply`, `rowIndex`, `table`, `needB` → `"1" | "0" | "any" | "none"`, `NEED_LABELS`, `NEED_ORDER`, `EXPRS` (6 ta ifoda, `steps`), `evalExpr`, `exprSteps`, `LIFE` (5 ta hayotiy qoida), `evalLife`, `lifeSteps`, `makeTask(stage, prev)`.
- `QK.logicUi`: `circuitView(host, kind)` → `{ set({ a, b, lamp, wires }) }`, `switches`, `letterSwitch`, `lifeSwitch`, `truthTable`, `opTable`, `ruleCard`, `lifeFacts`, `exprView`.
- `QK.art`: `circuit(kind, state)`, `circuitLabels(kind)`, `CIRCUIT_SIZE`, `LAMP_AT`, `book()`, `chip()`, `venn()`.

## Vazifalar

- [x] 1. `js/logic.js` + `tests/logic.test.js` (TDD): jadvallar, "B qanday boʻlsin", ifodalar qadamlari, hayotiy qoidalar, topshiriqlar (takrorsiz).
- [x] 2. `js/game-art.js` + `tests/game-art.test.js`: sxemalar (4 xil), chiroq holatlari, noma'lum kalit; matnsiz.
- [x] 3. `js/logic-ui.js`, `js/scenes/*.js`, `css/style.css`, `index.html`, `js/main.js` + `tests/main.test.js`.
- [x] 4. Bosh sahifa: yangi boʻlim "Mantiq" (`mantiq`), `GAMES` ga 24-oʻyin, `mantiq` ikonkasi; `python3 bosh/sw-royxat.py --bump`; README.
- [x] 5. Barcha testlar; brauzerda avtomat oʻynab chiqish (360×740, 740×360, 1280×800). Topilgan va tuzatilgan: kalit harflari ochiq dastakni toʻsardi, parallel sxemada yuqori dastak rasmdan chiqib ketardi (sxema qayta joylashtirildi); EMAS jadvali choʻzilardi; tor ekranda kalit tugmalari ikki qatorga tushib, jadvalni kesardi.

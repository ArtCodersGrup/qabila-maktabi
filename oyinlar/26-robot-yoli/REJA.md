# 26 — Robot yoʻli: ish rejasi

**Maqsad:** "Algoritm va dasturlash" blokining birinchi oʻyini: buyruqlar roʻyxati (algoritm), tartibning ahamiyati, dasturni oʻqish.

**Arxitektura:** oldingi bloklardagidek (`sanoq`, `mantiq`). Blokning umumiy qismi — `umumiy/js/dastur.js` (sof mantiq, Node testlari), `umumiy/js/dastur-ui.js` (maydon va buyruq tugmalari), `umumiy/css/dastur.css`. Oʻyinga xos qismi — `js/logic.js` va `js/scenes/`. Mashq sikli — `umumiy/js/practice.js`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi (muallif topshirigʻi: blok tanlangandan keyin oxirigacha toʻxtamasdan).

## Nomlar va interfeyslar

- `QK.dastur` (umumiy): `DIRS` (`up`, `down`, `left`, `right`: `dx`, `dy`, `arrow`), `ORDER`, `field(...)`, `cellAt`, `isWall`, `run(field, program)` → `{ path, status: "goal" | "wall" | "edge" | "end", at, used }`, `solve(field)` → buyruqlar yoki `null`, `turns(program)`, `pathToProgram(path)`, `randomField(opts, prev, rng)`, `sameCell`.
- `QK.dasturUi` (umumiy): `fieldView(host, field)` → `{ set, walk, trail, bump, pickCell, mark, reset }`, `programList(host)` → `{ add, removeAt, clear, get, highlight, setProgram, lock }`, `commandPad(host, handlers)`.
- `QK.logic` (oʻyin): `STAGE` (bosqich chegaralari), `DEMO` (2-bosqich koʻrsatuvi), `makeTask(stage, prev, rng)`, `checkTask`.
- `QK.art`: `bookPen()`, `phone()`, `map()`.

## Vazifalar

- [x] 1. `umumiy/js/dastur.js` + `umumiy/tests/dastur.test.js` (TDD): maydon, bajarish (tosh, chekka, gulxan), BFS yechim, burilishlar, tasodifiy maydon (yechimi bor, chegarada, takrorsiz).
- [x] 2. `js/logic.js` + `tests/logic.test.js` (TDD): bosqich chegaralari, 3-bosqich savollari (ikki xil), takrorlanmaslik.
- [x] 3. `umumiy/js/dastur-ui.js`, `umumiy/css/dastur.css`: maydon SVG, robot yurishi, dastur roʻyxati, buyruq tugmalari.
- [x] 4. `js/game-art.js` + `tests/game-art.test.js`: hikoya rasmlari (matnsiz).
- [x] 5. `js/scenes/*.js`, `css/style.css`, `index.html`, `js/main.js` + `tests/main.test.js`.
- [x] 6. Bosh sahifa: yangi boʻlim "Algoritm va dasturlash" (`dastur`) klaviaturadan keyin, `GAMES` ga 26-oʻyin, `yol` ikonkasi.
- [x] 7. **Raqamlar surildi:** blok boshiga qoʻyilgani uchun oʻyinlar ichidagi 18 ta havola +1 ga oʻzgaradi (`bosh/tests/havolalar.json` tekshiradi) + yangi havola (al-Xorazmiy → 18).
- [x] 8. `python3 bosh/sw-royxat.py --bump`, README yangilanadi.
- [x] 9. Barcha testlar: `node --test bosh/tests/*.test.js`, `oyinlar/umumiy/tests/*.test.js` va har bir oʻyin testi — **446 ta test, hammasi oʻtdi**.
- [x] 10. Brauzerda avtomat oʻynab chiqish (360×740, 740×360, 1280×800): uchala bosqich, ikkala savol turi, ataylab xato javob. Topilgan va tuzatilgan:
  - **yotiq telefonda maydon kesilib qolardi** — endi maydon va dastur roʻyxati yonma-yon, buyruq tugmalari bitta qatorda;
  - **SVG choʻzilib ketardi** — maydon oʻlchovi CSS'ga (`--fw`, `--fh`) beriladi, katak doim kvadrat;
  - **tik holatda uzun pufak bilan maydon sigʻmay qolardi** — maydon balandligi 42vh bilan chegaralandi, 1-bosqichdagi uzun gap qisqartirildi.

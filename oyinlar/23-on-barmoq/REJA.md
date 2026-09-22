# 23 — Oʻn barmoq: ish rejasi

**Maqsad:** 23-oʻyin: oʻn barmoq bilan tez yozish — asosiy, yuqori va pastki qator, katta harf, aniqlik va tezlik, doʻst bilan navbatma-navbat poyga.

**Arxitektura:** oldingi oʻyinlardagidek. Sof mantiq `js/typing.js` (Node testlari), ekran qismlari `js/typing-ui.js`, sahnalar `js/scenes/`. Oy va Quyosh belgilari `../musobaqa/js/musobaqa-art.js` dan (musobaqa ham boshqa oʻyinlar fayllarini shunday ulaydi).

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi (muallif topshirigʻi: dizayn kelishilgach, oxirigacha toʻxtamasdan).

## Nomlar va interfeyslar

- `QK.typing`: `PASS` (90), `FINGERS`, `ROWS`, `fingerOf(ch)`, `keyOf(ch)`, `shiftFor(ch)`, `isApostrophe(k)`, `same(expected, key)`, `isCyrillic(k)`, `allowed(stage)`, `HOME_WORDS`, `TOP_WORDS`, `PROVERBS`, `DRILLS`, `makeLine(stage, prev, rng)`, `raceText(level, prev, rng)`, `session(text)` → `{ press(key, t) → "ok" | "wrong" | "done" | "skip", pos, strokes, times }`, `stats(session)` → `{ accuracy, cpm, seconds, strokes }`, `passed(stats)`, `raceResult(a, b)`, `ghostAt(times, ms)`.
- `QK.typingUi`: `keyboard(host, { learned })` → `{ show(ch), press(key, ok), clear() }`, `hands(host)` → `{ show(finger) }`, `line(host, text)` → `{ at(pos), wrong() }`, `track(host, { side })` → `{ set(frac), ghost(frac) }`, `result(stats, { speed })`, `best()`, `saveBest(cpm)`.
- `QK.art`: `hands()`, `runner()`, `flag()`, `typewriter()`, `trophy()`.
- `QK.app.start({ extras: [{ scene, title, icon }] })` — umumiy qobiq.

## Vazifalar

- [x] 1. `js/typing.js` + `tests/typing.test.js` (TDD): barmoqlar, `ʻ` belgilari, sessiya, aniqlik va tezlik, matnlarda faqat oʻrganilgan tugmalar, qator yasash (takrorsiz), poyga gʻolibi, soya.
- [x] 2. `js/game-art.js` + `tests/game-art.test.js`: SVG, matnsiz; qoʻllarda 10 ta barmoq.
- [x] 3. `app.start({ extras })` — umumiy; barcha oʻyinlar testlari oʻtadi.
- [x] 4. `js/typing-ui.js`, `js/scenes/*.js`, `css/style.css`, `index.html`, `js/main.js` + `tests/main.test.js`.
- [x] 5. Bosh sahifa: yangi boʻlim "Klaviatura" (`klaviatura`), `GAMES` ga 23-oʻyin, `klaviatura` ikonkasi, "💻" belgisi; `python3 bosh/sw-royxat.py --bump`; README va QOIDALAR (3-boʻlim istisnosi).
- [x] 6. Barcha testlar; brauzerda avtomat oʻynab chiqish (360×740, 740×360, 1280×800) — xato, gorizontal aylantirish va qotish yoʻq.

# 15 — Multfilm daftari: ish rejasi

**Maqsad:** 15-o'yin: video — kadrlar, kadr/soniya, video hajmi, 1 Gbayt = 1024 Mbayt, siqish (faqat o'zgargan piksellar).

**Arxitektura:** oldingi o'yinlardagidek. Sof hisob `js/video.js` (Node testlari), ekran qismlari `js/video-ui.js`, sahnalar `js/scenes/`.

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi (muallif topshirig'i: blokni to'xtamasdan oxirigacha olib borish).

## Nomlar va interfeyslar

- `QK.video`: `SIZE`, `CELLS`, `COLORS`, `GROUND`/`SUN`/`BALL`/`BIRD`/`BOX`, `background()`, `BOUNCE`, `MISSING`, `bounceFrame(k)`, `placeOk(x, y)`, `SPEEDS`, `TINY`, `tinyFrame(k)`, `REAL`, `DEMO_A`/`DEMO_B`, `diff(a, b)`, `makeScene(rng)`, `PAIRS`, `FPS`, `taskKey`, `makeFrameTask`, `makeSizeTask`, `makeCompressTask`.
- `QK.videoUi`: `frameGrid(host, cells, {size, onTap, ghosts})` → `{set, mark, markRows, shake}`, `strip(host, frames, missing)` → `{fill}`, `player(host, first)` → `{play(frames, fps, seconds)}`, `pair(host, a, b, {size, onTap})`, `tinyCard(k)`, `frameIcons(n, label)`, `secondBoxes(n, fps)`, `choiceButtons(labels, onPick, cls)`.
- `QK.art`: `notebook()`, `frame()`, `story("film" | "speaker" | "stream")`.

## Vazifalar

- [x] 1. `js/video.js` + `tests/video.test.js`: kadrlar, koptok yoyi, sahna generatori (2–8 o'zgarish, toq sonlar ham), haqiqiy video (6 → 144 → 8640 Mbayt ≈ 8 Gbayt), topshiriqlar (javob ≤ 100, takrorsiz).
- [x] 2. `js/game-art.js` + test (SVG, matnsiz).
- [x] 3. `js/video-ui.js`, `js/scenes/*.js`, `css/style.css`, `index.html`, `js/main.js` + test.
- [x] 4. Bosh sahifa: `GAMES` ga 15-o'yin, `kadr` ikonkasi; `sw-royxat.py --bump`.
- [x] 5. Brauzerda avtomat o'ynab chiqish (360×740, 740×360, 1280×800). Topilgan va tuzatilgan: mashq sonlari faqat pufakda edi — maslahat chiqqanda yo'qolardi (endi ish maydonida ham); yechimda o'zgargan kataklar qator yoritmasidan ajralib turmasdi.

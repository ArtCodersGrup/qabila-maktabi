# 13 — Bayt sandigʻi: ish rejasi

**Maqsad:** 13-o'yin: nega 8 bit = 1 bayt, matn hajmi (1 belgi = 1 bayt), 1 Kbayt = 1024 bayt.

**Arxitektura:** oldingi o'yinlardagidek. Sof hisob `js/bytes.js` (Node testlari), ekran qismlari `js/bytes-ui.js`, sahnalar `js/scenes/`. Umumiy `ui.counter` ga `unit` qo'shildi (1-o'yin o'zgarmaydi — standart "harf").

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi (muallif topshirig'i: blokni to'xtamasdan oxirigacha olib borish).

## Nomlar va interfeyslar

- `QK.bytes`: `KB`, `SETS`, `DEMO`, `MESSAGES`, `pow2`, `minBits(n)`, `checkBits(bits, need)` → `"few" | "many" | "ok"`, `charBits(ch)`, `doublings()`, `makeBitTask`, `makeTextTask`, `makeKbTask`.
- `QK.bytesUi`: `bitDots(count, pattern)`, `chest(ch, {size, bits, code})`, `chests(count)`, `packer(host, message)` → `{fill(k)}`, `charButtons(message, onTap)`, `messageView(message, split)`, `kbBox(host, onCount)` → `{fill()}`, `pages(count, labels)`.
- `QK.art`: `computer()`, `chest(bits)`, `page()`, `story("sms" | "book" | "emoji")`.

## Vazifalar

- [x] 1. `js/bytes.js` + `tests/bytes.test.js` (TDD): to'plamlar, eng kamida nechta bit, ASCII kod, xabarlar, topshiriqlar (javob ≤ 96, takrorsiz).
- [x] 2. `js/game-art.js` + `tests/game-art.test.js`: SVG, matnsiz; sandiqda 8 ta doira.
- [x] 3. `ui.counter({ unit })` — umumiy; 1-o'yin testlari o'tadi.
- [x] 4. `js/bytes-ui.js`, `js/scenes/*.js`, `css/style.css`, `index.html`, `js/main.js` + `tests/main.test.js`.
- [x] 5. Bosh sahifa: yangi bo'lim "Axborot oʻlchovi" (`olchov`), `GAMES` ga 13-o'yin, `sandiq` ikonkasi; `python3 bosh/sw-royxat.py --bump`.
- [x] 6. Barcha testlar; brauzerda avtomat o'ynab chiqish (360×740, 740×360, 1280×800) — xato, gorizontal aylantirish va qotish yo'q. Yotiq ekranda "Kerak: … ta belgi" va ikkinchi qator sandiqlar ko'rinmayotgan edi — hisoblagich va "Tayyor" bitta qatorga, xabar va hisob bitta qatorga olindi.

# «Kompyuter bilan tanishuv» bloki (66–69) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 1–4-sinf toifasiga 4 ta yangi oʻyin: kompyuter qismlari, sichqoncha, ekran va oynalar, fayl va papka.

**Architecture:** Har oʻyin oʻz papkasida, mavjud qobiq (`umumiy/js/app.js`, `practice.js`) ustida; namuna — `oyinlar/58-xabar-bolaklari/`. 68 va 69 umumiy "oʻyinchoq kompyuter" qatlamini ishlatadi (`umumiy/css/stol.css`, `umumiy/js/stol-art.js`); mantiq har oʻyinning oʻz `logic.js` ida. Oʻyinlar parallel yoziladi (har biri faqat oʻz papkasiga), ulash — oxirida bitta qadam.

**Tech Stack:** oddiy HTML + CSS + JS (`<script>`), SVG, Node `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md` — bosqichlar, mashq turlari, tier, holat modellari va tekshirish qoidalari shu yerda; har oʻyinning batafsil rejasi oʻz `REJA.md` ida.

## Global Constraints

- QOIDALAR.md toʻliq amal qiladi (matn, oʻlcham ≥ 48 px, 360 px, xato javob, ranglar).
- `<html lang="uz" data-toifa="boshlangich">`, `theme-color` `#FFF6E5`.
- Nom, kalit va bosqich nomlari spec jadvalidagidek — `bosh/tests/bosh.test.js` ularni `main.js` dan tekshiradi.
- Ikki marta bosish oʻzimizcha aniqlanadi: bitta narsaga 450 ms ichida ikki `click`.
- Oʻyin faqat oʻz papkasiga yozadi; brauzer tekshiruvi — oxirida bitta.

---

### Task 1: Umumiy qatlam `stol`

**Files:** Create `oyinlar/umumiy/css/stol.css`, `oyinlar/umumiy/js/stol-art.js`, `oyinlar/umumiy/tests/stol-art.test.js`.

**Interfaces — Produces:** `QK.stolArt.icon(nom): string` (SVG yoki `""`), `QK.stolArt.NOMLAR`; nomlar: `rasm`, `matn`, `hisob`, `musiqa`, `fayllar`, `internet`, `papka`, `f-rasm`, `f-matn`, `f-musiqa`, `f-video`, `savat`, `savat-tola`, `pusk`. CSS sinflari: `.stol`, `.stol-yuza`, `.stol-belgi(.tanlangan)`, `.stol-panel`, `.stol-pusk`, `.stol-panel-tugma(.faol|.kichik)`, `.oyna(.faol|.katta|.kichik)`, `.oyna-sarlavha`, `.oyna-nom`, `.oyna-tugmalar`, `.oyna-tugma`, `.oyna-ichi`.

- [x] Test: har belgi `<svg viewBox="0 0 48 48">`, `<text` yoʻq, nomaʼlum nom — `""`, belgilar bir-biridan farq qiladi.
- [x] Run: `node --test oyinlar/umumiy/tests/stol-art.test.js` — PASS.
- [x] Commit.

### Task 2–5: Oʻyinlar (parallel, har biri oʻz papkasida)

| Task | Papka | Oʻziga xos qismi |
|---|---|---|
| 2 | `oyinlar/66-kompyuter-qismlari/` | 9 qism SVG; koʻp tanlov va tartiblash mashqlari |
| 3 | `oyinlar/67-chaqqon-sichqoncha/` | `.maydon`, ustma-ust tushmaydigan joylash, oʻz ikki-bosishi, `contextmenu`, Pointer Events bilan sudrash |
| 4 | `oyinlar/68-ekran-va-oynalar/` | oynalar holati (`och`, `yop`, `kichraytir`, `kattalashtir`, `qaytar`, `oldinga`), "birinchi amal" tekshiruvi, «Pusk» |
| 5 | `oyinlar/69-fayl-va-papka/` | fayl daraxti (`kir`, `orqaga`, `yangiPapka`, `nomla`, `nusxa`, `kes`, `qoy`, `ochir`, `tikla`), maqsad tekshiruvlari, tezkor tugmalar |

Har birida:

- [ ] `DIZAYN.md` va `REJA.md` (spec boʻlimidan).
- [ ] `js/logic.js` + `tests/logic.test.js`: generatorlar har tierda yuzlab marta (variant ≥ 4, javob ichida, takror yoʻq, tier chegaralari), holat amallari.
- [ ] Run: `cd oyinlar/NN-… && node --test tests/*.test.js` — PASS; har JS faylga `node --check`.
- [ ] `index.html`, `js/main.js`, `js/game-art.js`, `js/scenes/*.js`, `css/style.css`.

### Task 6: Ulash

**Files:** Modify `bosh/js/bosh.js`, `bosh/js/bosh-art.js`, `bosh/tests/bosh.test.js`, `QOIDALAR.md` (§3 sudrash istisnosi), `README.md`, `sw.js` (asbob orqali).

- [ ] `SECTIONS` boshiga `tanishuv`; `GAMES` ga 4 satr (67 da `pc: true`); 💻 yozuvi — "Kompyuter kerak".
- [ ] 4 ikonka: `qismlar`, `sichqoncha`, `oynalar`, `papka` (64×64, matnsiz).
- [ ] Testlar: taqsimot 13 / 43 / 12; birinchi oʻyin — «Kompyuter qismlari»; 💻 roʻyxatida `67-chaqqon-sichqoncha`.
- [ ] `node bosh/tools/toifa-yoz.js` (oʻzgarish boʻlmasligi kerak), `python3 bosh/sw-royxat.py --bump`.
- [ ] Run: `node --test bosh/tests/*.test.js oyinlar/umumiy/tests/*.test.js` va barcha oʻyin papkalari — PASS.

### Task 7: Yakuniy koʻrik

- [ ] Kod koʻrigi: har oʻyin hisobotidagi shubhali joylar, umumiy API toʻgʻri ishlatilgani, matn qoidalari (≤ 2 gap, `oʻ`/`gʻ`).
- [ ] Brauzer (bitta): har oʻyin ochiladi, 1-bosqich mashqigacha boradi, konsolda xato yoʻq, 360 px da gorizontal aylantirish yoʻq; 67 da ikki marta bosish, oʻng tugma va sudrash ishlaydi.
- [ ] Commit, `main` ga birlashtirish, push, `bash server/deploy/deploy.sh`, jonli saytni `curl` bilan tekshirish.

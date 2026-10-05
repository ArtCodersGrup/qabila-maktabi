# 1–4-sinf: «Kompyuter bilan tanishuv» bloki (66–69) — dizayn

**Sana:** 2026-10-06
**Muallif qarorlari:** 1–4 toifasi birinchi boʻlib toʻldiriladi; telefon ham, kompyuter ham; eng kichik
oʻquvchi 2–4-sinf (oʻqiy oladi, diktor yoʻq); mavzular — sichqoncha, kompyuter qismlari, ekrandagi
narsalar, fayl va papka; **"imkon qadar oʻyin kabi"**. A bloki — shu 4 oʻyin; B bloki (matn, rasm,
brauzer) — keyin, bolalarda sinovdan soʻng.

## Muammo

1–4 toifasida "kompyuter boshlangʻich koʻnikmalari" deyarli yoʻq: bor narsa — klaviatura (2), robot (6),
Morze. Bola sichqonchani, oynani, fayl va papkani hech qayerda mashq qilmaydi.

Xavf: bu mavzular osongina "Monitor nima? → 4 variant" testiga aylanadi. Yechim — bola **harakatni oʻzi
qiladi** (bosadi, ochadi, yopadi, koʻchiradi), nomini oʻyin keyin aytadi (QOIDALAR §4.1).

## Oʻyinlar

| № | Papka | Nomi | Kalit | Qurilma | Mavzu |
|---|---|---|---|---|---|
| 66 | `66-kompyuter-qismlari` | Kompyuter qismlari | `kompyuter-qismlari:v1` | ikkalasi | qismlar, kiritish/chiqarish, yoqish-oʻchirish |
| 67 | `67-chaqqon-sichqoncha` | Chaqqon sichqoncha | `chaqqon-sichqoncha:v1` | 💻 | bosish, ikki marta bosish, oʻng tugma, sudrash |
| 68 | `68-ekran-va-oynalar` | Ekran va oynalar | `ekran-va-oynalar:v1` | ikkalasi | ish stoli, belgi, oyna tugmalari, bir nechta oyna |
| 69 | `69-fayl-va-papka` | Fayl va papka | `fayl-va-papka:v1` | ikkalasi | fayl turi, papka, yoʻl, koʻchirish, nusxa, savat |

Hammasi `toifa: "boshlangich"`, 3 bosqich, yangi boʻlim **`tanishuv`** — «Kompyuter bilan tanishuv»
(`SECTIONS` da birinchi, klaviaturadan oldin). Tartib — oʻrganish yoʻli: avval qismlar (sichqoncha —
shulardan biri), keyin sichqoncha, keyin ekran, keyin fayllar.

**Hikoya (blok boʻyi):** qabilaga kompyuter keldi. Shogird uni birinchi marta koʻryapti, oqsoqol
oʻrgatadi. Matn — "sen", pufakda koʻpi bilan 2 qisqa gap, kirish ≤ 2 pufak, mashqgacha ≤ 6 pufak.

**Windows odatlari** (faraz: maktab kompyuterlari Windows): oyna tugmalari oʻngda tepada `— □ ✕`,
pastda vazifalar paneli va «Pusk» tugmasi, oʻchirilgan fayl — «Savat»da.

## Umumiy qoidalar (4 oʻyin uchun)

- Tuzilish — boshqa oʻyinlardagidek (namuna: `oyinlar/58-xabar-bolaklari/`): `index.html`, `js/main.js`
  (`QK.app.start`), `js/logic.js` (ekransiz sof mantiq, `module.exports`), `js/game-art.js` (SVG, matnsiz),
  `js/scenes/{common,stage1,stage2,stage3,final}.js`, `css/style.css`, `tests/logic.test.js`,
  `DIZAYN.md`, `REJA.md`.
- `<html lang="uz" data-toifa="boshlangich">`, `theme-color` `#FFF6E5`.
- Har bosqich: **koʻrsatish** (bola oʻzi qiladi) → **nom va 1–2 gapli taʼrif** → **mashq**
  (`practice.exercises`, generator `next(prev, correct, tier)`; `practice.need()` ta toʻgʻri javob).
- Xato: 1-xato — maslahat (**javobni aytmaydi**), 2-xato — yechim koʻrsatiladi (`practice.tries`).
  Qizil rang va "Xato" soʻzi yoʻq; ✓ va ↻.
- Variantli savolda kamida 4 variant. Ketma-ket bir xil misol chiqmaydi (`task.id`).
- `tier` 0 / 1 / 2 bilan qiyinlik oʻsadi (obyektlar soni, oʻlchami, qadamlar soni).
- Bosiladigan narsa ≥ 48×48 px; 360 px da gorizontal aylantirish yoʻq; hover'ga tayanilmaydi.
- Ikki marta bosish **oʻzimizcha aniqlanadi**: bitta narsaga 450 ms ichida ikki `click` — sichqonchada
  ham, barmoqda ham bir xil ishlaydi. Bitta bosish — tanlash (jarima yoʻq).
- Sinov ilgagi: `QK.current` (joriy vazifa, `practice.exercises` oʻzi qoʻyadi) va vazifada **javob**
  maydoni boʻlsin — avtomatik oʻynovchi uchun.
- Oʻyin faqat oʻz papkasiga yozadi. `bosh/`, `sw.js`, `README.md`, `umumiy/` ga tegilmaydi — ulashni
  blok oxirida bitta qadam qiladi.

### Umumiy qatlam: `stol` (68 va 69 ishlatadi)

- `oyinlar/umumiy/css/stol.css` — oʻyinchoq kompyuter koʻrinishi: `.stol` (ish stoli yuzasi),
  `.stol-belgi` (belgi: rasm + nom, tanlangan holati), `.stol-panel` (vazifalar paneli), `.oyna`,
  `.oyna-sarlavha`, `.oyna-nom`, `.oyna-tugmalar`, `.oyna-tugma` (`— □ ✕`), `.oyna-ichi`.
- `oyinlar/umumiy/js/stol-art.js` — `QK.stolArt.icon(nom)` → SVG (matnsiz). Dasturlar: `rasm`, `matn`,
  `hisob`, `musiqa`, `fayllar`, `internet`; fayl turlari: `papka`, `f-rasm`, `f-matn`, `f-musiqa`,
  `f-video`; `savat`, `savat-tola`, `pusk`. Nomaʼlum nom — boʻsh satr.

Mantiq (oynalar holati, fayl daraxti) har oʻyinning oʻz `logic.js` ida qoladi — uni hozircha bittadan
oʻyin ishlatadi (QOIDALAR §9: umumiyga faqat ≥ 2 oʻyin ishlatadigan kod chiqadi).

---

## 66 — Kompyuter qismlari

**Bosqichlar:** `["Qismlar va nomlari", "Kiritish va chiqarish", "Yoqish va ehtiyot qilish"]`

**Qismlar (9):** monitor, klaviatura, sichqoncha, tizim bloki, kolonka, printer, mikrofon, kamera,
quloqchin. Har birida: `id`, `nom`, `vazifa` (bitta qisqa gap), `yonalish`: `kiritish` (klaviatura,
sichqoncha, mikrofon, kamera) / `chiqarish` (monitor, kolonka, printer, quloqchin) / `markaz` (tizim
bloki). Har qism — alohida SVG (`gameArt.qism(id)`).

1. **Qismlar va nomlari.** Koʻrsatish: stol ustidagi kompyuter rasmi; bola har qismni bosadi — nomi
   va vazifasi chiqadi (hammasini bosguncha). Mashq:
   - `nom` (tier 0): "Qaysi biri — klaviatura?" → 4 ta rasm-tugma;
   - `rasm` (tier 1): qism rasmi → 4 ta nomdan tanlash;
   - `vazifa` (tier 2): "Qaysi qurilma ovozni yozib oladi?" → 4 ta rasm. Variantlar orasida vazifasi
     bir xil ikki qurilma boʻlmasin (kolonka va quloqchin birga chiqmaydi).
2. **Kiritish va chiqarish.** Koʻrsatish: bola qurilmani bosadi — u "kompyuterga kiradi →" yoki
   "→ kompyuterdan chiqadi" tomoniga oʻtadi. Nom: *kiritish* va *chiqarish qurilmalari*. Mashq:
   - `kerak` (tier 0): vaziyat → qurilma ("Doʻstingga ovozli xabar yozmoqchisan. Nima kerak?"), 4 rasm;
   - `tanla` (tier 1): "Kiritish qurilmalarining hammasini belgila" — 6 ta qurilma, 2–4 tasi toʻgʻri,
     «Tayyor» tugmasi; toʻplam aynan teng boʻlsa — toʻgʻri;
   - `ortiqcha` (tier 2): 4 qurilmadan bittasi boshqa yoʻnalishda — oʻshani top.
3. **Yoqish va ehtiyot qilish.** Koʻrsatish: toʻgʻri oʻchirish tartibi — ishni saqla → dasturlarni yop →
   «Oʻchirish»ni tanla → ekran oʻchishini kut. Nega: saqlanmagan ish yoʻqoladi. Mashq:
   - `tartib`: aralash qadamlarni toʻgʻri tartibda bos (tier 0 — 3 qadam, 1 — 4, 2 — 5); yoqish va
     oʻchirish ketma-ketliklari;
   - `zarar`: "Qaysi biri kompyuterga zarar qiladi?" — 4 variant, bittasi zararli (hoʻl qoʻl, simdan
     tortib oʻchirish, klaviatura ustida ovqat, ekranni qattiq narsa bilan bosish); tier 2 da —
     "hammasini belgila" (5 tadan 2–3 tasi).

**Tabrik xulosasi:** qismlar nomi; kiritish ↔ chiqarish; avval saqla, keyin oʻchir; 20 daqiqada koʻzga dam.

**Oʻquv maqsadlari:** bola 9 qismni nomi va vazifasi bilan taniydi; kiritish va chiqarish qurilmasini
ajratadi; kompyuterni toʻgʻri oʻchirish tartibini aytadi; 3 ta ehtiyot qoidasini biladi.

---

## 67 — Chaqqon sichqoncha (💻)

**Bosqichlar:** `["Bosish", "Ikki marta va oʻng tugma", "Sudrab olib borish"]`

Kompyuter uchun (`pc: true`). Boshida barmoqli qurilma boʻlsa — ogohlantirish: "Bu oʻyin sichqoncha
uchun. Uni kompyuterda och." («Sichqoncham bor» / «Barcha oʻyinlar») — `ui.touchOnly()` + `ui.choice`,
`ui.keyboardCheck` namunasida, lekin oʻyinning oʻz `common.js` ida.

**Maydon:** `.maydon` — nisbiy oʻlchamli quti (eni 100 %, koʻpi 640 px, nisbat 4:3); obyektlar foizli
koordinatada (`x`, `y`, `r` — maydon enining ulushi). Mantiq obyektlarni **ustma-ust tushmaydigan** qilib
joylaydi. **QOIDALAR §3 dan istisno:** bu oʻyin sudrashni oʻrgatadi, shuning uchun 3-bosqichda sudrash bor.

1. **Bosish.** Nom: *koʻrsatkich* va *chap tugma*. Mashq — `ter`: "Hamma olmalarni bos": maydonda
   nishonlar va chalgʻituvchilar (olma, nok, tosh). Nishon bosilsa — yoʻqoladi; hammasi terilsa —
   toʻgʻri. Chalgʻituvchi bosilsa — xato. **Boʻsh joyga bosish jarimasiz.**
   Tier: 3 nishon + 2 chalgʻituvchi, `r` 0.09 → 4 + 4, `r` 0.07 → 5 + 5, `r` 0.055.
2. **Ikki marta va oʻng tugma.** Sandiqlar (2–4 ta, har xil rang). Nom: *ikki marta bosish — ochadi*,
   *oʻng tugma — menyu chiqaradi*. Mashq:
   - `ikki` (tier 0): "Koʻk sandiqni och — ikki marta tez bos". Boshqa sandiq ochilsa — xato;
   - `ong` (tier 1): "Yashil sandiqda oʻng tugmani bos va «Boʻya»ni tanla" — `contextmenu` oʻz
     menyumizni ochadi (brauzer menyusi chiqmaydi); boshqa sandiq yoki boshqa amal — xato;
   - tier 2: ikkala tur aralash, 4 sandiq, menyuda 4 amal.
3. **Sudrab olib borish.** Nom: *bos — qoʻyib yubormay sur — qoʻyib yubor*. Mashq — `sudra`:
   "Mevalarni oʻz savatiga olib bor" (Pointer Events). Toʻgʻri savatga tushsa — joylashadi; notoʻgʻri
   savat — xato, narsa qaytadi; **savatdan tashqariga qoʻyib yuborish jarimasiz** (qaytadi).
   Tier: 3 narsa / 2 savat → 4 / 3 → 6 / 3.

Maslahat (1-xato): sichqoncha rasmi — kerakli tugma belgilangan, yoki "qaysi biri olma?" namunasi.
Yechim (2-xato): nishonlar yoritiladi.

**Oʻquv maqsadlari:** bola koʻrsatkichni nishonga olib boradi va chap tugma bilan bosadi; ikki marta
bosish va bitta bosish farqini biladi; oʻng tugma menyu ochishini biladi; narsani sudrab koʻchiradi.

---

## 68 — Ekran va oynalar

**Bosqichlar:** `["Ish stoli va belgilar", "Oyna tugmalari", "Bir nechta oyna"]`

Ish zonasida **oʻyinchoq kompyuter**: ish stoli (belgilar), vazifalar paneli («Pusk» + ochiq dasturlar),
oynalar. Dasturlar (6): Rasm, Matn, Hisoblagich, Musiqa, Fayllar, Internet.

**Mantiq** (`logic.js`, sof): holat `{ oynalar: [{ id, dastur, holat: "oddiy" | "katta" | "kichik" }] }`
(roʻyxat tartibi — ustma-ustlik: oxirgisi eng oldinda); amallar `och`, `yop`, `kichraytir`,
`kattalashtir` (yoyish ↔ qaytarish), `qaytar` (paneldan), `oldinga`; `faol(holat)`.
Vazifa: `{ tur, matn, boshlangich, kutilgan: { amal, dastur } }`. **Bolaning birinchi holatni
oʻzgartiruvchi amali** kutilganiga teng boʻlsa — toʻgʻri. Belgini tanlash, «Pusk»ni ochib-yopish,
faol oynani bosish — betaraf, sanalmaydi.

1. **Ish stoli va belgilar.** Nom: *ish stoli*, *belgi*, *dastur*. Koʻrsatish: belgini ikki marta
   bossang — dastur ochiladi. Mashq: `och` — "«Musiqa» dasturini och" (tier: 3 → 5 → 6 belgi);
   `nom` (tier 1+) — belgi rasmi → 4 nomdan tanlash.
2. **Oyna tugmalari.** Nom: *sarlavha*, `✕` *yopish*, `—` *kichraytirish* (oyna panelda qoladi),
   `□` *yoyish*. Mashq: `yop`, `kattalashtir` (tier 0); `kichraytir`, `qaytar` — kichraytirilgan oynani
   paneldan qaytarish (tier 1); ikki oyna ochiq, bittasi nomi bilan soʻraladi (tier 2).
3. **Bir nechta oyna.** Nom: *faol oyna* — eng oldindagisi. Mashq: `oldinga` — "Orqadagi
   «Hisoblagich»ni oldinga chiqar" (oynaning koʻrinib turgan joyini yoki paneldagi tugmasini bos);
   `faqat` — "Faqat «Matn» qolsin" (koʻp qadamli: qolganlari yopilguncha; «Matn»ni yopish — xato);
   `pusk` — "«Pusk» menyusidan «Internet»ni och" (stolda belgisi yoʻq).

**Oʻquv maqsadlari:** bola dasturni belgisidan ochadi; oynani yopadi, kichraytiradi, yoyadi va paneldan
qaytaradi; bir nechta oynadan keraklisini oldinga chiqaradi; «Pusk» menyusidan dastur topadi.

---

## 69 — Fayl va papka

**Bosqichlar:** `["Fayl, papka va yoʻl", "Tartibga solamiz", "Nusxa, oʻchirish va savat"]`

Ish zonasida oʻyinchoq kompyuterning **«Fayllar» oynasi**: asboblar qatori (← Orqaga, Yangi papka,
Nomla, Nusxa, Kesish, Qoʻyish, Oʻchirish — kerakmaslari bosqichga qarab yashirin), yoʻl satri
("Kompyuter › Hujjatlar › Rasmlar"), ichidagilar (belgi + nom). Ochish — ikki marta bosish, tanlash —
bitta. Fayl turlari: rasm (`.jpg`), matn (`.txt`), musiqa (`.mp3`), video (`.mp4`).

**Mantiq** (`logic.js`, sof): daraxt tuguni `{ id, nom, tur: "papka" | "rasm" | "matn" | "musiqa" |
"video", ichi: [] }`; holat `{ ildiz, joriy, tanlangan, bufer: { id, amal: "nusxa" | "kesish" } | null,
savat: [] }`; amallar `kir`, `orqaga`, `tanla`, `yangiPapka`, `nomla`, `nusxa`, `kes`, `qoy`, `ochir`,
`tikla`; soʻrovlar `yol(id)`, `qayerda(id)`. Nom toʻqnashsa `qoy` nusxaga " (2)" qoʻshadi.

**Nom berish** — tayyor nomlardan tanlash (chiplar: «Rasmlar», «Musiqa», «Matnlar»…), harf terilmaydi:
telefonda klaviatura ekranni buzmaydi, `oʻ`/`gʻ` xatosi boʻlmaydi.

1. **Fayl, papka va yoʻl.** Nom: *fayl*, *papka*, *yoʻl*. Mashq: `top` — "«olma.jpg» rasmini top va
   och" (chuqurlik tier bilan 1 → 2 → 3; boshqa faylni ochish — xato, papkalarda yurish erkin);
   `tur` — "«qoʻshiq.mp3» — bu nima?" → rasm / matn / musiqa / video; `yol` (tier 2) — fayl yoʻlini
   4 variantdan tanlash.
2. **Tartibga solamiz.** Nom: *kesish* (koʻchirish) va *qoʻyish*. Mashq — `tartibla`: aralash fayllarni
   turiga mos papkaga koʻchir, keyin «Tekshir». Tier 0 — papkalar tayyor, 2 tur; tier 1 — bitta papkani
   oʻzi yaratadi va nomlaydi; tier 2 — 3 tur, bitta papka notoʻgʻri nomlangan (qayta nomlash).
   Maslahat: "2 ta fayl hali oʻz joyida emas" (qaysiligini aytmaydi). Yechim: toʻgʻri tartib koʻrsatiladi.
3. **Nusxa, oʻchirish va savat.** Nom: *nusxa* — ikkita boʻladi; *kesish* — bitta qoladi; oʻchirilgan
   fayl *savat*da, qaytarsa boʻladi. Mashq: `nusxa` — "«xat.txt»dan nusxa olib «Zaxira»ga qoʻy"
   (asli joyida qolishi shart); `ochir` — "Keraksiz fayllarni oʻchir: …"; `tikla` — "Adashib oʻchirilgan
   «rasm.jpg»ni savatdan qaytar". Kompyuterda tezkor tugmalar ham ishlaydi: `Ctrl+C`, `Ctrl+X`,
   `Ctrl+V`, `Delete` — ular faqat klaviaturali qurilmada maslahat sifatida koʻrsatiladi.

**Oʻquv maqsadlari:** bola fayl turini belgisi va nom oxiridan taniydi; faylni yoʻli boʻyicha topadi;
papka yaratadi va mazmuniga mos nomlaydi; koʻchirish va nusxa farqini biladi; oʻchirilgan faylni
savatdan qaytaradi.

---

## Ulash (blok oxirida, bitta qadam)

- `bosh/js/bosh.js`: `SECTIONS` boshiga `{ id: "tanishuv", title: "Kompyuter bilan tanishuv", note:
  "Qismlar, sichqoncha, oynalar va fayllar" }`; `GAMES` ga 4 satr (`icon`: `qismlar`, `sichqoncha`,
  `oynalar`, `papka`; 67 da `pc: true`); 💻 belgisi yozuvi "Klaviatura kerak" → "Kompyuter kerak".
- `bosh/js/bosh-art.js`: 4 ikonka. `bosh/tests/bosh.test.js`: taqsimot 13 / 43 / 12, birinchi oʻyin —
  «Kompyuter qismlari», 💻 roʻyxatiga `67-chaqqon-sichqoncha`.
- `node bosh/tools/toifa-yoz.js`, `python3 bosh/sw-royxat.py --bump`, `README.md` jadvali, QOIDALAR §3
  (sudrash istisnosi).

## Tekshiruv

Har oʻyinda `node --test tests/*.test.js`: generatorlar (tier chegaralari, 4 variant, javob variantlar
ichida, takror yoʻq, ustma-ust tushmaslik), holat amallari (oyna, fayl daraxti). Oxirida bitta brauzer
koʻrigi: har oʻyin ochiladi, 1-bosqich boshlanadi, konsolda xato yoʻq, 360 px da gorizontal aylantirish
yoʻq. Vizual va bolalarda sinov — muallifda.

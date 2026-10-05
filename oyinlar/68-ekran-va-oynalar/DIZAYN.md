# 68-oʻyin — «Ekran va oynalar»

«Kompyuter bilan tanishuv» blokining uchinchi oʻyini (1–4-sinf toifasi, amalda 2–4-sinf).
Blok dizayni: [`../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md`](../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md).

- **Yosh:** 2–4-sinf. Telefon va kompyuter — faqat bosish (sudrash yoʻq, klaviatura kerak emas).
- **Ulanish:** «Chaqqon sichqoncha»dan keyin (ikki marta bosish tanish), «Fayl va papka»dan oldin (oyna va belgi tanish boʻladi).
- **Hikoya:** qabilaga kompyuter keldi. Shogird ekranni birinchi marta koʻryapti, oqsoqol oʻrgatadi.

## Asosiy fikr

Bola ekrandagi narsalarni rasmda emas, **oʻzi ishlatib** oʻrganadi. Ish zonasida — **oʻyinchoq kompyuter**:
ish stoli (belgilar), oynalar va pastda vazifalar paneli («Pusk» + har ochiq oyna uchun tugma).
Bola haqiqiy harakatni qiladi: belgini ikki marta bosadi, `— □ ✕` tugmalarini bosadi, paneldan oynani
qaytaradi, orqadagi oynani oldinga chiqaradi. Nomni oʻyin keyin aytadi (QOIDALAR §4.1).

Windows odatlari: oyna tugmalari oʻngda tepada `— □ ✕`, panel pastda, «Pusk» chap burchakda.

Dasturlar (6): **Rasm, Matn, Hisoblagich, Musiqa, Fayllar, Internet**. Belgilari — umumiy
`umumiy/js/stol-art.js`; har oynaning ichi — shu dasturga mos oddiy rasm (`js/game-art.js`, matnsiz SVG).

## Holat va amallar (`js/logic.js`)

Holat: `{ oynalar: [{ id, dastur, holat: "oddiy" | "katta" | "kichik" }] }`. Roʻyxat tartibi —
ustma-ustlik: **oxirgisi eng oldinda**. Har dasturning koʻpi bilan bitta oynasi bor.
Amallar oʻzgarmas uslubda (yangi holat qaytaradi):

| Amal | Nima qiladi |
|---|---|
| `och` | yangi oyna eng oldinda; dastur allaqachon ochiq boʻlsa — oʻsha oyna oldinga chiqadi |
| `yop` | oyna roʻyxatdan chiqadi |
| `kichraytir` | oyna `kichik` — koʻrinmaydi, lekin ochiq (panelda qoladi); faol oyna oʻzgaradi |
| `kattalashtir` | `oddiy` ↔ `katta` (yoyish ↔ avvalgi oʻlcham), oyna oldinga chiqadi |
| `qaytar` | `kichik` oyna oddiy oʻlchamda, eng oldinda qaytadi |
| `oldinga` | koʻrinib turgan oyna eng oldinga chiqadi |

`faol(holat)` — eng oldindagi kichraytirilmagan oyna.

**Bosish → amal** (`niyat`): belgi (ikki marta) va «Pusk» roʻyxati — oyna yoʻq boʻlsa `och`, panelda
boʻlsa `qaytar`, orqada boʻlsa `oldinga`; paneldagi tugma — `qaytar` yoki `oldinga`; oynaning oʻzi —
`oldinga`. Natija **amalning taʼsiriga** qarab nomlanadi, shuning uchun «Rasm»ni belgisidan ham,
«Pusk»dan ham ochish — bir xil `och`.

## Tekshirish qoidasi (`baho`)

Vazifa: `{ tur, matn, belgilar, boshlangich, kutilgan: { amal, dastur }, javob }`.
**Bolaning birinchi holatni oʻzgartiruvchi amali** `kutilgan`ga teng boʻlsa — toʻgʻri, boshqa amal — urinish.

- **Betaraf** (sanalmaydi, holat oʻzgarmaydi): belgini tanlash (bitta bosish), «Pusk» menyusini
  ochib-yopish, allaqachon faol oynani yoki uning paneldagi tugmasini bosish, boʻsh joyni bosish.
- **Tayyorgarlik** (sanalmaydi): `yop` / `kattalashtir` / `kichraytir` vazifasida kerakli oynani avval
  oldinga chiqarish. Bola "avval oynani bosaman, keyin tugmasini" desa — bu toʻgʻri odat, jarima emas.
- **«Faqat … qolsin»** (`kutilgan.amal = "faqat"`) — koʻp qadamli: har yopish tekshiriladi. Kerakli
  oynani yopish — urinish; yangi dastur ochish — urinish (teskari ish, oynalar 4 tadan oshmaydi);
  qolgan amallar (oldinga chiqarish, kichraytirish, yoyish) erkin. Faqat kerakli oyna qolganda — toʻgʻri.
  Ortiqcha oynalar yopilmay kichraytirilgan boʻlsa, oqsoqol jarimasiz eslatadi: u hali ochiq.
- **1-urinishdan keyin:** bola oʻz amalining natijasini 0,9 soniya koʻradi, soʻng stol vazifa boshidagi
  holatga qaytadi va maslahat chiqadi. **2-urinishdan keyin:** stol boshiga qaytadi, kerakli belgi yoki
  tugma yoritiladi, qisqa izoh yoziladi; keyin shunga oʻxshash yangi vazifa.

**Ikki marta bosish** oʻzimizcha aniqlanadi: bitta belgiga 450 ms ichida ikki `click` (`ikkiMarta`).
Bitta bosish — belgi tanlanadi. Ikkinchi bosish kech qolsa (1,5 soniyagacha) — jarimasiz eslatma:
"tezroq bos".

**Ortiqcha ikkinchi bosish yutiladi:** har amaldan (va «Pusk»ni ochib-yopishdan) keyin 450 ms ichidagi
bosishlar inobatga olinmaydi. Bola `✕` ni odat boʻyicha ikki marta bosib yuborsa, ikkinchi bosish
yopilgan oyna oʻrniga surilib kelgan boshqa oynaning `✕` iga tushib, uni ham yopib qoʻymaydi.

## Bosqichlar

Har bosqich: **koʻrsatish** (bola oʻzi qiladi, boshqa amal bajarilmaydi — jarima yoʻq) → **nom** →
**mashq** (`practice.exercises`, 4 / 5 / 6 ta toʻgʻri javob).

### 1. Ish stoli va belgilar
Koʻrsatish: yonib turgan rasmchani ikki marta bos → «Rasm» ochiladi. Nom: *ish stoli*, *belgi*, *dastur*.

- **`och`** — "«Musiqa» dasturini och." Belgilar soni tier bilan: 3 → 5 → 6; tartibi har safar aralash.
- **`nom`** (tier 1 dan) — belgi rasmi → 4 nomdan tanlash. Maslahat nomni aytmaydi: dastur ochilganda
  ichi qanday koʻrinishini koʻrsatadi.

### 2. Oyna tugmalari
Koʻrsatish: bitta oynada toʻrt ish — `—` (oyna panelga tushadi) → paneldan qaytarish → `□` (yoyiladi) →
`✕` (yopiladi). Nom: *sarlavha*, *kichraytirish*, *yoyish*, *yopish*.

- tier 0: **`yop`**, **`kattalashtir`** — bitta oyna;
- tier 1: **`kichraytir`**, **`qaytar`** (kichraytirilgan oynani paneldan qaytarish) — bitta oyna;
- tier 2: toʻrttasi navbat bilan, **ikki oyna** ochiq, bittasi nomi bilan soʻraladi (oldindagisi yoki
  orqadagisi); `qaytar`da ikkinchi oyna ham panelda boʻlishi mumkin.

Maslahat: tugma adashtirilsa — tugmalar sxemasi (`—` kichraytiradi, `□` yoyadi, `✕` yopadi); boshqa
oyna tanlansa — "nomi sarlavhada yozilgan".

### 3. Bir nechta oyna
Koʻrsatish: uchta oyna — orqadagisini bos; paneldan boshqasini tanla; «Pusk»dan yangi dastur och.
Nom: *faol oyna* — eng oldindagisi; *«Pusk» menyusi*.

- **`oldinga`** — "Orqadagi «Hisoblagich» oynasini oldinga chiqar." Oynalar: 2 → 3 → 4.
- **`faqat`** — "Faqat «Matn» oynasi qolsin. Qolganlarini yop." Oynalar: 2 → 3 → 4.
- **`pusk`** — "«Pusk» menyusidan «Internet»ni och." Bu dasturning belgisi stolda yoʻq; stolda 3 → 4 → 5
  boshqa belgi va 0 → 1 → 2 ochiq oyna.

## Ekran

- **Vazifa** — stol ustidagi satrda (doim koʻrinadi). **Maslahat** — oqsoqol pufagida (`↻`), kerak boʻlsa
  sxema satr ostida. **Yechim izohi** — shu joyda, yashil.
- **Oynalar kaskad** boʻlib turadi va joyi **roʻyxatdagi oʻrniga** bogʻliq: eng oldindagisi oʻngda-pastda,
  har orqadagisi bir qadam chapda-tepada. Oyna oldinga chiqsa — joylar almashadi (0,25 s). Shunda
  orqadagi har oynaning **sarlavhasi toʻliq koʻrinib turadi** (nomi oʻqiladi, tugmalari bosiladi) —
  tor telefonda ham. Kaskad qadami sarlavha balandligidan (48 px) kichik boʻlmaydi.
- Stol balandligi ish zonasiga moslashadi (kamida 340 px): panel doim koʻrinadi. Juda past tik ekranda
  qahramonlar joy boʻshatadi, pufak qoladi.
- Tor ekranda: sarlavhadagi kichik belgi yashirinadi (nom va uch tugma sigʻishi uchun); uch va undan
  koʻp oynada paneldagi tugmalarda faqat belgi qoladi.
- «Pusk» menyusi — yuzaning pastki chap burchagida, ikki ustun (har satr ≥ 48 px, belgi + nom). Menyudan
  tashqariga bosish uni faqat yopadi.
- Rang: toʻgʻri — yashil ✓, yana urin — toʻq sariq ↻, yoritish — sariq. Qizil va "Xato" soʻzi yoʻq.

## Qarorlar

- **Orqadagi oynaning tugmalari ham ishlaydi** (Windows'dagidek): `✕` bosilsa — oʻsha oyna yopiladi.
  Aks holda 2-bosqichdagi "nomi bilan soʻralgan orqadagi oyna" vazifasi ikki qadamli boʻlib qolardi.
- **Paneldagi faol oyna tugmasi — betaraf.** Windows'da u oynani kichraytiradi; bolaga bu chalkash.
- **Paneldan qaytgan oyna doim oddiy oʻlchamda** (yoyilgan holi eslab qolinmaydi) — holat modeli sodda.
- **`□` belgisi yoyilgan oynada ham oʻzgarmaydi** — bola bitta belgini eslab qoladi.
- **`nom` vazifasida doim 4 variant** — telefonda toʻrtta tugma 2 × 2 boʻlib sigʻadi.
- Vazifa matni `—` belgisini ishlatmaydi (chiziqcha bilan adashadi): pufak va sxemada tugma belgilari
  koʻk tugmacha ichida chiziladi.

## Sinov ilgaklari

- `QK.current` — joriy vazifa; `javob` — `kutilgan` amal (`{ amal, dastur }`; `faqat`da — qoladigan
  oyna) yoki variant qiymati (`nom`). `QK.logic.qadamlar(vazifa)` — yechadigan amallar ketma-ketligi.
- `QK.stol` — ekrandagi oʻyinchoq kompyuter: `holat()`, `qil({ amal, dastur })` (bola qilgandek bajaradi).
- DOM: `[data-belgi]`, `[data-oyna]`, `[data-tugma="yop|kichraytir|kattalashtir"]`, `[data-panel]`,
  `[data-pusk]`, `[data-menyu]`.

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Ish stoli, belgi, dastur, oyna, sarlavha va vazifalar panelini koʻrsatib, nomini aytadi.
2. Dasturni belgisidan ikki marta bosib ochadi; oltita dastur belgisini taniydi.
3. Oynani yopadi, kichraytiradi, yoyadi va kichraytirilgan oynani paneldan qaytaradi.
4. Kichraytirish va yopish farqini aytadi: kichraytirilgan oyna panelda qoladi.
5. Bir nechta oynadan keraklisini nomi boʻyicha topib, oldinga chiqaradi; faol oyna nima ekanini biladi.
6. Stolda belgisi yoʻq dasturni «Pusk» menyusidan topib ochadi.

## Fayllar

- `js/logic.js` — dasturlar, oynalar holati va amallari, `niyat`, `ikkiMarta`, `baho`, maslahat va yechim
  joylari, olti generator (`tier` bilan), bosqich navbatlari.
- `tests/logic.test.js` — holat amallari, "birinchi amal" tekshiruvi, generatorlar (har tierda 300 marta),
  matn qoidalari, rasmlar.
- `js/scenes/common.js` — oʻyinchoq kompyuter (`stol`), koʻrsatish qadami (`qildir`), mashq ekranlari.
- `js/scenes/stage1–3.js`, `final.js` — koʻrsatish, mashq, tabrik.
- `js/game-art.js` — kirish rasmi (kompyuter) va olti dastur oynasining ichi.
- `css/style.css` — kaskad, «Pusk» menyusi, yoritish, mashq qutisi (umumiy `stol.css` ustiga).

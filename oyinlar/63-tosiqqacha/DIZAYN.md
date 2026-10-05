# 63-oʻyin — «Toʻsiqqacha»

«Algoritm va dasturlash» blokida 8–11 yosh uchun **while** (…gacha takrorla) oʻyini.

- **Yosh:** 8–11. Klaviatura kerak emas — hammasi bosish bilan (QOIDALAR §3).
- **Oldin oʻtilgan:** «Robot aqlli boʻldi» (takror, agar), «Oʻz buyrugʻim» (funksiya).
- **Spec:** `docs/superpowers/specs/2026-10-05-dasturlash-8-11-design.md`, reja — `docs/superpowers/plans/2026-10-05-dasturlash-8-11.md` (Task 2).

## Asosiy fikr

`takror 3` — robot **sanaydi**. `→ boʻsh ekan takrorla` — robot **qaraydi**: necha marta ekanini oʻzi topadi.
Buni bola oʻz koʻzi bilan koʻrishi uchun har vazifada **ikkita maydon** beriladi: yoʻlak uzunligi yoki
zinapoya shakli har xil, dastur esa bitta. Aniq sonli dastur bittasida ishlaydi, ikkinchisida toshga uriladi
yoki gulxanga yetmay qoladi.

| Blok | Python | Nima qiladi |
| --- | --- | --- |
| `→ boʻsh ekan takrorla [ … ]` | `while ong_bosh():` | shu tomon boʻsh ekan, ichidagini qayta-qayta bajaradi |
| `gulxanga yetguncha takrorla [ … ]` | `while not yetdi():` | gulxanga yetguncha ichidagini bajaradi |

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Aniq sonli takror (`takror 3`) bilan shartli takror (`→ boʻsh ekan takrorla`) farqini aytib bera oladi: birinchisi sanaydi, ikkinchisi har safar qaraydi.
2. Uzunligi oldindan nomaʼlum yoʻlakni `→ boʻsh ekan takrorla [→]` bilan toshgacha yurib oʻtadi.
3. Bir nechta yoʻlakni ketma-ket `boʻsh ekan` bloklari bilan yozadi (L shakli, uch boʻlakli yoʻl).
4. `gulxanga yetguncha takrorla` ichiga bitta qadamni yozib, butun zinapoyani yuradi (ichida `agar`).
5. Ichma-ich takror tuzadi: `gulxanga yetguncha` ichida `boʻsh ekan` — eni har xil pogʻonalar uchun.
6. Ichi boʻsh shartli takror toʻxtamasligini tushuntiradi (robot joyidan qimirlamaydi — shart oʻzgarmaydi).
7. Bitta dastur har xil uzunlikdagi maydonlarda ishlashi kerakligini biladi va dasturini ikkala maydonda tekshiradi.

## Bosqichlar

Hamma vazifa — ikki maydon, maydon ≤ 8×6, maydon **tor yoʻl** (`B.torYol`: yoʻldan boshqa hamma katak tosh).
Yoʻlak oxirida doim tosh yoki maydon chekkasi turadi.

**1. Toʻsiqqacha.** Koʻrsatuv: `takror 3 [→], ↓` qisqa yoʻlakda ishlaydi, uzunida toshga uriladi →
`→ boʻsh ekan takrorla [→], ↓` ikkalasida ishlaydi. Keyin nom beriladi.
- tier 0: bitta yoʻlak (2–6 katak, ikki maydonda har xil), burilib 1–2 qadam.
- tier 1: ikki yoʻlak ketma-ket (L shakli), ikkala uzunlik ikki maydonda har xil, oxirida burilish + 1 qadam.
- tier 2: uch boʻlak, oxirida burilish + 1 qadam.
- Tugmalar: kerakli yoʻnalishlar, `takror` (chalgʻituvchi), `boʻsh ekan`.

**2. Gulxangacha.** Koʻrsatuv: `takror 6 [agar → boʻsh: → | aks: ↓]` bitta zinapoyada yetadi, ikkinchisida
gulxanga yetmay toʻxtaydi → `gulxanga yetguncha takrorla [agar …]` ikkalasida ishlaydi.
- Har maydonda pogʻonalar bir xil, lekin eni/balandligi va soni maydonlarda boshqacha.
- tier 0: balandlik 1; tier 1: balandlik 1–2; tier 2: 3–4 pogʻona, kamida bitta maydonda 8+ qadam.
- Namunali yechim: `gulxanga yetguncha [agar d1 boʻsh: d1 | aks: d2]`; `gulxanga yetguncha [d1 boʻsh ekan [d1], d2]` ham ishlaydi.
- Tugmalar: yoʻnalishlar, `agar`, `boʻsh ekan`, `gulxangacha` (**`takror` yoʻq**).

**3. Birga.** Koʻrsatuv: ichma-ich dastur ikki zinapoyada yurgiziladi.
- Har pogʻonaning eni boshqa (1–4 dan har xil sonlar); tier 0: 2 pogʻona, tier 1: 2–3, tier 2: 3 pogʻona va balandligi 1–2.
- Namunali yechim: `gulxanga yetguncha [d1 boʻsh ekan [d1], d2]`.
- Tugmalar: yoʻnalishlar, `boʻsh ekan`, `gulxangacha` (`agar` va `takror` yoʻq — ichma-ich yozish shart).

Blok chegarasi: `maxBlok = namunali yechim + 1`.

## Qarorlar

- **Qulf — har qanday sezgisiz dastur ikkala maydonni yecha olmaydi** (`qotirilganYolYoq`): maydonlar robot
  boʻyicha ustma-ust qoʻyiladi va ikkalasida ham boʻsh kataklar orqali biror gulxanga yetib boʻladimi —
  BFS bilan tekshiriladi. Bir maydon gulxanga yetsa, dastur unda toʻxtaydi, qolgan buyruqlar faqat
  ikkinchisiga ishlaydi — shuning uchun "birinchi gulxanga, keyin ikkinchisiga" degan qotirilgan yoʻl ham
  hisobga olinadi. Ochiq maydonda (toshsiz) bu yoʻl doim bor edi — shu sababli **tor yoʻl** tanlandi.
- **1-bosqichda oxirgi yoʻlakdan keyin ham burilish bor.** Gulxan yoʻlak oxirida boʻlsa, `takror 9 [→]`
  ham oʻtib ketardi (gulxanga yetgach dastur toʻxtaydi, ortiqcha qadamlar sezilmaydi).
- **2–3-bosqichda `takror` tugmasi yoʻq.** `takror 9 [ … ]` gulxanga yetganda baribir toʻxtaydi va
  `gulxangacha` oʻrnini bosib qoʻyardi.
- **3-bosqichda `agar` yoʻq.** Monoton zinapoyada `gulxangacha [agar …]` va `gulxangacha [boʻsh ekan …, d2]`
  bir xil yuradi; 3-bosqichning maqsadi — ichma-ich takror, shuning uchun `agar` olib tashlandi.
- Yoʻnalishlar (4 tomon) tasodifiy, tugmalar tartibi aralash — bola yechimni yodlab ololmaydi.
- Maslahat (1-xato) javobni aytmaydi:
  - 1: "Yoʻlak har maydonda boshqa uzunlikda. Robot sonni bilmaydi — u faqat oldinga qaray oladi."
  - 2: "Robot gulxanga yetguncha nima qilishi kerak — har qadamda qaysi tomon boʻsh?"
  - 3: "Bitta pogʻonani qanday yurasan? Oʻshani gulxanga yetguncha takrorla."
- Matn dietasi: intro 2 pufak + 1-bosqich koʻrsatuvi 4 pufak = 6; 2-bosqich 4 pufak; 3-bosqich 3 pufak.

## Fayllar

- `js/logic.js` — `QK.logic`: `yasa(bosqich, prev, rng, tier)` (`"tosiq" | "gulxan" | "birga"`), `KORSATUV`
  (koʻrsatuv namunalari, `sodda` — yiqiladigan dastur), `qotirilganYolYoq`, `yolMaydon`, `zinaMaydon`.
- `js/scenes/common.js` — koʻrsatuv yordamchisi (qulflangan quruvchi + ▶︎).
- `js/scenes/stage1.js` (intro + 1-bosqich), `stage2.js`, `stage3.js`, `final.js`.
- `js/game-art.js` — matnsiz SVG: robot yoʻlakda, oxirida tosh, burilishdan keyin gulxan.
- Bloklar, quruvchi, yurgizish, mashq — umumiy `umumiy/js/blok.js`, `blok-ui.js`, `css/blok.css`.
- `tests/logic.test.js` — har bosqich × tier da 200 vazifa: yechim ikkala maydonda `goal`, `soni ≤ maxBlok`,
  maydon ≤ 8×6, ketma-ket takror yoʻq; qulf (sezgisiz yoʻl yoʻq, `D.solve` yoʻllari farqli,
  har `boʻsh ekan`/`gulxangacha` oʻrniga `takror n [d]` oʻtmaydi), boʻsh `toki([])` → `uzun`.

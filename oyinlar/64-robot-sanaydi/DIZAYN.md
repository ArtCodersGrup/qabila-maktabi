# 64-oʻyin — «Robot sanaydi»

8–11 yosh dasturlash blokining uchinchi yangi oʻyini: **oʻzgaruvchi** (hisoblagich).
Spec: `docs/superpowers/specs/2026-10-05-dasturlash-8-11-design.md`, reja: `docs/superpowers/plans/2026-10-05-dasturlash-8-11.md` (Task 3).

- **Yosh:** 8–11. Hammasi bosish bilan, klaviatura kerak emas (javob — ekrandagi raqam klaviaturasi).
- **Oldin oʻtilgan:** «Robot aqlli boʻldi» (takror, agar), «Toʻsiqqacha» (… boʻsh ekan takrorla).
- **Bosqichlar:** Kuzat · Oʻlcha va qaytar · Sanoq bilan.

## Asosiy fikr

Robotning xotirasida bitta quti bor — `qadam`. Uchta yangi blok:

| Blok | Python | Nima qiladi |
| --- | --- | --- |
| `qadam = 0` | `qadam = 0` | qutiga nol yozadi |
| `qadam + 1` | `qadam = qadam + 1` | qutidagi songa bitta qoʻshadi |
| `takror qadam marta` | `for i in range(qadam):` | qutidagi sonni takror soni sifatida ishlatadi |

Oʻyinning yuragi — 2-bosqich: **toshgacha masofa ikki maydonda har xil**. Aniq sonli `takror` bitta
maydonda ishlaydi, ikkinchisida yiqiladi. Robot toshgacha yurib sanaydi va shu sonni eslab qoladi —
shunda bitta dastur ikkala maydonda ishlaydi.

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Oʻzgaruvchini "nomli quti, ichida son" deb tushuntira oladi; `qadam = 0` qutiga son yozishini biladi.
2. `qadam + 1` qutidagi sonni bittaga oshirishini va u **necha marta bajarilsa**, son shunchaga oshishini biladi.
3. Tayyor dasturni (takror ichida, ichma-ich takrorda `qadam + 1`, oʻrtada `qadam = 0`) oʻqib,
   oxirida qutida qanday son boʻlishini aytib bera oladi (≤ 20).
4. Robot yurishlari soni bilan qutidagi sonni farqlaydi: `qadam + 1` boʻlmagan takror qutiga tegmaydi.
5. "… boʻsh ekan takrorla" ichida `qadam + 1` bilan masofani oʻlchay oladi.
6. Oʻlchangan sonni `takror qadam marta` bilan ishlatib, har xil uzunlikdagi maydonlarda ishlaydigan bitta dastur yoza oladi.
7. Bitta saqlangan sonni bir necha marta va har xil shaklda ishlata oladi (burchak, zinapoya, ikki barobar).

## Bosqichlar

**1. Kuzat.** Koʻrsatuv: tayyor dastur (`qadam = 0`, `→ qadam+1`, `takror 3 [↓ qadam+1]`, `→`) ishga
tushiriladi, quti ochiq — son oʻzgarishini bola koʻradi. Keyin nom beriladi va mashq: quti **yopiq** ("?"),
bola oxirgi sonni raqam klaviaturasida yozadi (`practice.numberTries`, 2 xona).
- tier 0: tekis `qadam + 1` va `takror n [yur, qadam+1]`, javob 2–8. Dasturni yurgizib kuzatish mumkin (quti baribir yopiq).
- tier 1: chalgʻituvchilar — `takror n [yur]` (qutiga tegmaydi), `→ → qadam+1` (ikki yurish, bitta qoʻshish),
  `takror n [qadam+1]` (yurishsiz qoʻshish); javob 4–14 va robot yurishlari soniga teng emas. Faqat oʻqib.
- tier 2: ichma-ich `takror a [takror b [yur, qadam+1], yur]` yoki `takror n [yur, qadam+1, qadam+1]`,
  ba'zan oʻrtada `qadam = 0`; javob 6–20. Faqat oʻqib.
- Maslahat: "Har «qadam + 1» qutiga bitta qoʻshadi. Takror ichidagisi necha marta bajariladi?"
- Yechim: quti ochiladi, dastur yurgiziladi.

**2. Oʻlcha va qaytar.** Koʻrsatuv: `takror 2 [↓]` li dastur birinchi maydonda (L = 2) yetadi, ikkinchisida
(L = 3) yetmaydi → `takror qadam marta` bilan ikkalasida yetadi. Mashq — 2 maydon, L1 ≠ L2 (2–4):
- yechim: `qadam = 0`, `→ boʻsh ekan [→, qadam+1]`, `takror qadam marta [↓]`, `→` — gulxan toshning ostida;
- tier 0: → va ↓; tier 1: chapga ham; tier 2: yuqoriga ham va ba'zan burilgan (avval ↓ oʻlchab, keyin → qaytish).

**3. Sanoq bilan.** Shu gʻoya boshqa shakllarda, 2 maydon, L har xil:
- tier 0 — **burchak**: L ↓, keyin L ← (`qadam` ikki marta ishlatiladi), oxirida bitta ↑ — gulxan "tokchada";
- tier 1 — burchak yoki **zinapoya**: `takror qadam marta [↓, ←]`, keyin ←;
- tier 2 — zinapoya, burchak yoki **ikki barobar**: avval ↓ oʻlchab, `takror qadam marta [→, →]`, keyin ↓.

Tugmalar: kerakli yoʻnalishlar, `… boʻsh ekan`, `takror` (chalgʻituvchi), `qadam = 0`, `qadam + 1`,
`takror qadam`. `maxBlok` = namunali yechim + 1 (masalan, `takror qadam [→]` ni ikki marta yozish ham sigʻadi).

## Qarorlar

- **Oxirgi "burilish" qadami (rejadan farq).** Rejada gulxan `(L, L)` da — toʻgʻri qaytish chizigʻining
  oxirida. Lekin robot gulxanga yetishi bilan toʻxtaydi, shuning uchun `↓ boʻsh ekan takrorla` (yoki chekka)
  robotni gulxanga **sanoqsiz** olib borardi — bola oʻzgaruvchisiz yechib qoʻyardi. Shuning uchun har shakl
  oxirida bitta burilish qadami bor, qaytish yoʻlidan keyin esa yana boʻsh joy (qator / ustun) qoldirilgan.
  Burchakda gulxan yonida qoʻshimcha tosh: bir qator kam tushgan robot ← yoʻlida gulxanga yetib qolmasin.
- **Qulf generatorning oʻzida:** har vazifa uchun "aldash" dasturlari tekshiriladi — har `takror qadam`
  oʻrniga aniq son 1..9 yoki `… boʻsh ekan takrorla` (4 tomon, ichi oʻsha). Birortasi ikkala maydondan
  birdan oʻtsa, vazifa tashlanadi. Test ham shuni 200 × (bosqich × tier) vazifada tekshiradi.
- **1-bosqichda dastur oxiri — oddiy qadam.** Gulxanga yetgach qolgan bloklar bajarilmaydi; oxirida
  `qadam + 1` boʻlsa, oʻqib topilgan javob bilan robotdagi son farq qilardi. Shuning uchun har dastur
  gulxanga olib boradigan oddiy `yur` bilan tugaydi va yoʻl oʻzini kesmaydi (test: oʻqib sanash = `bajar().qiymat`).
- Spec dagi "oʻtkazib yuborilgan qosh" — tier 1–2 dagi `takror n [yur]` (qutiga tegmaydigan takror) va
  oʻrtadagi `qadam = 0` bilan berildi; gulxandan keyingi bajarilmaydigan blok ishlatilmadi (8–11 yosh uchun chalkash).
- Quti yopiqligi: umumiy `quti()` da yopiq rejim yoʻq — sahna son oʻrniga "?" yozadi va `set` chaqirmaydi.

## Fayllar

- `js/logic.js` — `QK.logic.yasa(bosqich, prev, rng, tier)`: 1-bosqich `{ id, f, dastur, javob, yurgiz }`,
  2–3-bosqich `qurExercise` uchun daraja; `SHAKL` (olcha, burchak, zina, ikki), `aldashlar`, `KORSATUV`.
- `js/scenes/stage1.js` — kirish, koʻrsatuv, "kuzat" mashqi; `stage2.js` — muammo + mashq; `stage3.js`; `final.js`.
- `js/game-art.js` — robot, tosh va xotira qutisi (sanoq chiziqlari, matnsiz SVG).
- Umumiy: `umumiy/js/blok.js`, `blok-ui.js`, `blok.css`, `dastur-ui.js`.
- `tests/logic.test.js` — har bosqich × tier 200 vazifa: javob = `bajar().qiymat` (2–20), yechim ikkala
  maydonda `goal`, `soni ≤ maxBlok`, maydon ≤ 8×6, ketma-ket takror yoʻq, qulf (aniq son va "… boʻsh ekan" aldashlari).

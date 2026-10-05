# 62-oʻyin — «Oʻz buyrugʻim»

8–11 yosh dasturlash blokining birinchi oʻyini (62–65): **funksiya** — ★ buyrugʻini yasash va chaqirish.

- **Yosh:** 8–11. Klaviatura va sudrash yoʻq — hammasi bosish bilan.
- **Oldin oʻtilgan:** «Robot yoʻli» (buyruqlar roʻyxati), «Robot aqlli boʻldi» (takror, agar).
- **Spec:** `docs/superpowers/specs/2026-10-05-dasturlash-8-11-design.md`, reja — Task 1.

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Yoʻlda (yoki buyruqlar roʻyxatida) **qayta-qayta keladigan boʻlakni** topa oladi.
2. Tayyor buyruqni (★) **chaqirish** nima ekanini tushuntira oladi: chaqirilganda ichidagi hamma buyruq bajariladi.
3. Bir xil boʻlakni **oʻzi buyruqqa yigʻa oladi** (★ ichini toʻldiradi) va asosiy dasturda chaqiradi.
4. Ikki xil boʻlak uchun **ikkita buyruq** (★ va ●) yasab, ularni toʻgʻri tartibda chaqira oladi.
5. Nega funksiya kerakligini aytadi: bir marta yoziladi, koʻp marta chaqiriladi — dastur qisqa va oʻqishga oson.
6. Funksiya bilan `takror` farqini koʻradi: oraliqlar har xil boʻlsa, oddiy `takror` yetmaydi.

## Asosiy fikr

Maydon — **tor yoʻl** (`B.torYol`): yoʻldan boshqa hamma katak tosh, yoʻl yagona. Yoʻlda bir xil boʻlak
(naqsh) bir necha marta keladi, oraliqlari har xil. Shuning uchun faqat oʻq va `takror` bilan yozilgan
dastur **blok chegarasiga sigʻmaydi** — ★ kerak boʻladi. Chegara (`maxBlok`) = namunali yechim bloklari
(★ ichidagilar ham sanaladi).

## Bosqichlar

**1. Tayyor buyruq.** ★ ichi tayyor va qulflangan. Bola asosiy dasturni ★ va oʻqlar bilan yigʻadi.
Koʻrsatuv: avval faqat oʻqlar bilan yozilgan dastur (11 blok, chegara 9) — sigʻmaydi; keyin ★ bilan
qisqa dastur yurgiziladi. Nom: "★ — oʻzimiz yasagan yangi buyruq. Bir marta yozamiz, xohlagancha chaqiramiz."

**2. Oʻzing yasa.** ★ ichi boʻsh: bola uni ham, asosiy dasturni ham yigʻadi. Koʻrsatuvda ★ ichi oʻq-oʻq
boʻlib toʻladi, keyin dastur yuradi.

**3. Ikki buyruq.** Yoʻlda ikki xil boʻlak aralash keladi (★ ● ★ ●, ★ ● ● ★, ★ ★ ● ★ ● …): ★ va ● ning
ikkalasi ham boʻsh, har biri kamida ikki marta chaqiriladi. Koʻrsatuv — "arra tishlari": ★ = ↓↓→, ● = →↑↑.

Matn dietasi: intro 2 pufak, 1-bosqich mashqgacha 3 pufak, 2- va 3-bosqich — 2 tadan.

## Generator (`js/logic.js`)

`yasa(bosqich, prev, rng, tier)` — `bosqich`: `"tayyor"`, `"yasa"`, `"ikki"`.

- **Naqshlar katalogi:** doʻngliklar (↑→↓, ↑→→↓, →↑→↓, ↑→↓→, ↑↑→→↓↓) va zinalar (→↓, →→↓, →↓→, ↓→→,
  →↓↓, →→↓↓, →↓→→ va 5 qadamlilar), har biri 8 ta burish/koʻzgu bilan. Oʻzi davriy naqsh (→↓→↓) olinmaydi.
- **Oraliqlar** 0–3, bitta yoʻnalishda (doʻnglikda — oldinga, zinada — ikki tomonidan biri); kamida ikkitasi har xil.
- **Sanab chiqish:** 8×6 maydon juda tor — tasodifiy oraliqlarning koʻpi sigʻmaydi yoki ★ foyda bermaydi.
  Shuning uchun naqsh tasodifiy tanlanadi, unga mos **hamma** oraliqlar sanab chiqiladi (keshda qoladi)
  va ulardan biri olinadi.
- **Yechim:** `fn = { yulduz: naqsh }` (3-bosqichda `doira` ham), asosiy dastur — chaqiruvlar va oraliqlar
  (2–3 qadamli oraliq `takror` bilan). Asosiy dasturni chaqiruvlar ustidan takror bilan qisqartirish
  mumkin boʻlgan vazifalar chiqarilmaydi — chegara oddiy yozuvga moʻljallangan.
- **tier:** 1–2-bosqich — tier 0: ★ 2 marta (naqsh 3–4 qadam); tier 1: yarmida 3 marta; tier 2: koʻpincha 3 marta,
  2 marta boʻlsa naqsh uzunroq (4–6 qadam). 3-bosqich — tier 0: 4 chaqiruv, tier 1: 4 yoki 5, tier 2: 5 chaqiruv.
- **3-bosqich juftlari** (`JUFTLAR`) oldindan qidirib topilgan: ikki naqsh × tartib × oraliqlar — qaysilari 8×6 ga
  sigʻib, ★ va ● siz chegaradan oshadi. Ishlaganda ularga 8 simmetriyadan biri qoʻllanadi, oraliqlar sanab chiqiladi.

## Qarorlar (rejadan farqlar)

- **k = 4 yoʻq.** 8×6 maydonda naqsh 4 marta (har xil oraliqlar bilan) sigʻib, ★ siz chegaradan oshadigan
  birorta vazifa topilmadi (toʻliq qidiruv). tier 2 da k = 3 (yoki k = 2 va uzunroq naqsh).
- **3-bosqich, tier 2: chaqiruvlarni `takror` bilan qisqartirish yoʻq.** Bunday vazifa 8×6 ga sigʻib, qulf
  (`ixchamNarx > maxBlok`) bilan birga — birorta ham topilmadi. Oʻrniga tier 2 da chaqiruvlar soni 5 ta.
- **Naqsh uzunligi 6 gacha.** 2–4 qadamli doʻnglik 3 marta 8 katakka sigʻmaydi (doʻngliklar orasida kamida bitta
  katak boʻsh boʻlishi kerak, aks holda yorliq paydo boʻladi). Shuning uchun k = 3 da faqat 3 qadamli zinalar,
  k = 2 da 6 qadamli baland doʻnglik (↑↑→→↓↓) va 5 qadamli zinalar ham bor.
- 1-bosqichda `yechimFn` yoʻq (★ tayyor, `fn` ning oʻzi), 2–3-bosqichda `fn` boʻsh va `yechimFn` toʻliq.
- Vazifada qoʻshimcha maydonlar: `yurishlar` (yoʻl), `naqshlar`, `tartib`, `oraliqlar` — testlar va koʻrsatuv uchun.

## Fayllar

- `index.html`, `js/main.js` (storageKey `oz-buyrugim:v1`), `css/style.css` — faqat shu oʻyinga xos uslublar.
- `js/logic.js` — `QK.logic`: katalog, `qur`, `yasa`, `ixcham` (asosiy dasturni takror bilan siqish), `KORSATUV`.
- `js/game-art.js` — matnsiz SVG: robot, bir xil doʻngliklari bor yoʻl, ★ shakli, gulxan.
- `js/scenes/stage1.js` (intro + 1-bosqich), `stage2.js`, `stage3.js`, `final.js`.
- Quruvchi, tugmalar, yurgizish, mashq — umumiy `umumiy/js/blok-ui.js` (`qurExercise`), mantiq — `umumiy/js/blok.js`.
- `tests/logic.test.js` — har bosqich × tier da 200 vazifa: yechim gulxanga yetadi, `soni ≤ maxBlok`,
  maydon ≤ 8×6, ketma-ket takror yoʻq, **qulf** (`ixchamNarx(yoʻl) > maxBlok`, `D.solve` uzunligi = yoʻl uzunligi);
  koʻrsatuv va zaxira vazifalar; `ixcham` = `B.ixchamNarx`.

# 65-oʻyin — «Bloklardan Pythonga»

8–11 yosh dasturlash blokining (62–65) oxirgi oʻyini va 12–16 yosh Python blokiga **koʻprik**:
bitta dastur — ikki xil yozuv, bloklar va Python matni.

- **Yosh:** 10–16 (ikkala toifada koʻrinadi). Klaviatura kerak emas — hammasi bosish bilan, telefonda ham ishlaydi.
- **Oldin oʻtilgan:** «Robot aqlli boʻldi» (takror, agar), «Oʻz buyrugʻim» (★), «Toʻsiqqacha» (while), «Robot sanaydi» (qadam).
- Spec: `docs/superpowers/specs/2026-10-05-dasturlash-8-11-design.md`, reja: `docs/superpowers/plans/2026-10-05-dasturlash-8-11.md` (Task 4).

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Bloklar bilan yozilgan dasturning Python matnini va Python matnining bloklardagi koʻrinishini taniydi (bitta dastur — ikki yozuv).
2. `ongga()`, `chapga()`, `yuqoriga()`, `pastga()` qatorlarini oʻqib, robot yoʻlini aytadi.
3. `for i in range(n):` — «n marta takrorla» ekanini va ichidagi qatorlar **otstup** (4 boʻsh joy) bilan ajralishini tushuntiradi.
4. `if …_bosh(): … else: …` ni «agar … boʻsh boʻlsa / aks holda», `while …_bosh():` ni «… boʻsh ekan takrorla» deb oʻqiydi.
5. `def yulduz():` — yangi buyruq yasash, `yulduz()` — uni chaqirish ekanini biladi; `qadam = qadam + 1` va `range(qadam)` ni oʻqiydi.
6. Qisqa Python dasturini koʻzi bilan bajarib, robot qaysi katakda toʻxtashini topadi.
7. Python matnidagi bitta xato son yoki yoʻnalishni topib tuzatadi (debug).
8. Berilgan Python matnini bloklardan aynan qayta yigʻadi.

## Bosqichlar

**1. Oʻqi.** Maydon (gulxansiz) va faqat Python matni. Bola robot toʻxtaydigan katakni bosadi, «Tayyor ✓».
- Koʻrsatuv: bitta dastur — bloklar va Python yonma-yon, ishga tushiriladi; keyin `for i in range(3):` va otstup nomlanadi.
- Javob — `B.bajar(f, dastur).at`, status `end` (gulxan ichki ravishda yoʻlda yoʻq katakka qoʻyiladi), boshlangʻich katak emas.
- Maslahat: «Har qatorni navbat bilan oʻqi: for — necha marta, ichidagi qatorlar — nima qiladi.» Yechim: robot yurib koʻrsatadi.

**2. Tuzat.** Toʻgʻri dasturning bitta tahrir qismi (son yoki yoʻnalish) buzilgan. Matndagi sariq ramkali qismlar bosilganda
keyingi qiymatga oʻtadi (`blokUi.tahrirla`), yonidagi qulflangan bloklar ham birga yangilanadi. ▶︎ — robot yuradi; gulxanga yetsa toʻgʻri.
- Koʻrsatuv: bola birinchi xatoni oʻzi tuzatadi (urinish sanalmaydi), keyin «debug» nomi.
- Maslahat: robot qanday toʻxtagani + «Robot qaysi qatorda yoʻldan chiqqanini kuzat — oʻsha qatordagi son yoki yoʻnalish xato.»
- Yechim: toʻgʻri dastur, oʻzgargan qator yoritiladi (`belgila(k, "farq")`), robot yuradi.

**3. Tarjima qil.** Python matni berilgan, bola quruvchida aynan shu dasturni yigʻadi. ▶︎ Tekshir — robot yuradi,
keyin `pythonMatn(qurilgan) === pythonMatn(yechim)` tekshiriladi.
- Tugmalar: dasturda ishlatilgan yoʻnalishlar va blok turlari (`kerakliBloklar`). `maxBlok` = yechim + 2.
- Maslahat: birinchi farq qilgan qator yoritiladi — «Belgilangan qatorni yana bir solishtir.»

## Dastur generatori (`js/logic.js`)

Dastur boʻlaklardan yigʻiladi va robot yoʻli shu bilan birga «xayoliy» katakli joyda chiziladi; shart bloklari kerakli joyga tosh qoʻyadi.
Oxirida yoʻl + toshlardan maydon (≤ 8×6) yasaladi va `B.bajar` bilan tekshiriladi.

| Boʻlak | Dastur | Tier |
| --- | --- | --- |
| bir | `pastga()` | 0+ |
| tekis | `for i in range(n): ongga()` (n = 2–4) | 0+ |
| zina | `for i in range(n): ongga(); pastga()` | 0+ |
| toki | `while ong_bosh(): ongga()` + oxirida tosh | 1+ |
| agar | `if ong_bosh(): … else: …` — tosh bor-yoʻqligi tasodifiy | 1+ |
| yulduz | `def yulduz(): …` + 2–3 chaqiruv (takror ichida yoki oraliq bilan) | 2 |
| qadam | `qadam = 0`, `while …: …; qadam = qadam + 1`, `for i in range(qadam): …` | 2 |

- tier 0: 2–3 boʻlak, faqat yur va takror; tier 1: bitta `agar`/`while` + 1–2 oddiy boʻlak, 0–2 bezak tosh;
  tier 2: ★ funksiya yoki `qadam` + yana bitta boʻlak.
- Yoʻl oʻzini kesmaydi, shart toshlari yoʻlda emas. Yangi boʻlak oldingi harakatga koʻndalang boshlanadi.
- `yasa(bosqich, prev, rng, tier)` — 500 urinish, `prev.id` bilan bir xil vazifa tashlanadi, keyin zaxira (ikki xil).

## Qarorlar

- «Tuzat» da hech narsa almashtirilmasdan ▶︎ bosilsa — bu xatoni koʻrish uchun yurgizish, **urinish sanalmaydi** (bola avval robot qayerda adashganini koʻradi).
- Buzilgan dastur `uzun` (toʻxtamaydigan) boʻlmaydi — bolaga 200 qadamlik animatsiya foydasiz.
- Son buzilganda yaqin son tanlanadi (±1–2, oraliq 2–9) — haqiqiy «bittaga adashish» xatosiga oʻxshaydi.
- **Python lugʻati** (yordamchi jadval, QOIDALAR 4.3): matnda uchragan kalit soʻzlar (`for`, `if`, `else`, `while`, `def`, `qadam`)
  ma'nosi bilan. Kalit soʻz 2 ta toʻgʻri yechilgan vazifada uchragach yashiriladi; maslahat uni toʻliq qaytaradi.
  Shu bilan yangi kalit soʻz (tier 1–2 da `while`, `def`) birinchi uchraganda izohsiz qolmaydi.
- Tahrir tugmalari 44×48 px (umumiy `blok.css` da 30 px) — `css/style.css` da kattalashtirilgan.
- 3-bosqichda maydon ham koʻrsatiladi: bola yigʻgan dastur ▶︎ bilan yurgiziladi, keyin matn solishtiriladi.

## Fayllar

- `js/logic.js` — dastur generatori (`SEG`, `reja`, `yasaDastur`), bosqich vazifalari (`yasa`), `qismlar`, `kerakliBloklar`, `farqQator`, `KORSATUV`, `zaxira`.
- `js/scenes/common.js` — uch mashq ekrani (`oqiExercise`, `tuzatEkran`/`tuzatExercise`, `tarjimaEkran`/`tarjimaExercise`), Python lugʻati.
- `js/scenes/stage1.js` (intro + Oʻqi), `stage2.js` (Tuzat), `stage3.js` (Tarjima qil), `final.js`.
- `js/game-art.js` — matnsiz SVG: bloklar ⇄ matn qatorlari.
- Umumiy: `umumiy/js/blok.js` (bajarish, Python matni), `umumiy/js/blok-ui.js` (quruvchi, `pythonKod`, `tahrirla`, `yurgiz`), `umumiy/css/blok.css`.
- `tests/logic.test.js` — har bosqich × tier da 200 vazifa: Python matni talqinchimizda (`umumiy/js/python/python.js`) bloklar bilan
  bir xil yoʻl va status; «Oʻqi» javobi boshlangʻich katak emas, status `end`; «Tuzat» da buzuq dastur yetmaydi, toʻgʻrisi yetadi,
  farq — aynan bitta tahrir qismi; «Tarjima» yechimi yetadi, `soni ≤ maxBlok`; ketma-ket vazifalar har xil; maydon ≤ 8×6.

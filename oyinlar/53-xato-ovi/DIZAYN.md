# 53-oʻyin — «Xato ovi»

«Algoritm va dasturlash» blokining uchinchi oʻyini: **tayyor dasturdagi xatoni topish va tuzatish**.
Dastlabki blok rejasida (26-oʻyin DIZAYN.md) 29-oʻyin sifatida yozilgan edi.

- **Yosh:** 8–11 (kichik toifa). Klaviatura kerak emas — hammasi bosish bilan.
- **Oldin oʻtilgan:** «Robot yoʻli» (buyruqlar, tartib), «Robot aqlli boʻldi» (takror va agar).

## Nega kerak

Bola dastur yozishni oʻrgandi, lekin **dastur ishlamay qolganda nima qilishni** bilmaydi.
Dasturchi ishining yarmi — xato qidirish. Shuni alohida koʻnikma sifatida oʻrgatamiz:

1. **Yurgiz** — robot qayerda notoʻgʻri ketganini koʻr.
2. **Top** — qaysi buyruq xato ekanini aniqla.
3. **Tuzat** — kichik oʻzgartirish qil, qaytadan yozma.

## Bosqichlar

**1. Xatoni top.** Tayyor dastur beriladi, bola uni yurgizadi va robot toʻxtagan joyni koʻradi.
Keyin dasturdagi **xato buyruqni bosadi**. Oxirida «+» tugmasi ham bor — «bu yerda buyruq
yetishmaydi» degani (dastur kalta boʻlgan holat uchun).

**2. Tuzat.** Dastur tayyor holda beriladi, bola buyruq qoʻshadi yoki oʻchiradi. Uch xil holat:
notoʻgʻri yoʻnalish, **ortiqcha qadamlar** (dastur ishlaydi, lekin uzun) va toshni aylanib oʻtish.

**3. Ikkisi birga** — topish va tuzatish navbat bilan keladi.

## Qarorlar

- **«Ortiqcha qadamlar» vazifasi alohida tekshiriladi:** dastur gulxanga yetsa ham, eng qisqa
  yoʻldan uzun boʻlsa qabul qilinmaydi (`dastur.solve()` bilan solishtiriladi). Bu — 36-oʻyindagi
  «ishlaydi ≠ yaxshi» fikrining davomi.
- Dastur **tekis** (takror yoki shartsiz): 8–11 yosh uchun xato qidirish shundayam yetarli qiyin.
- Har vazifada **xato dastur haqiqatan yiqilishi** test bilan qulflangan — aks holda bola nimani
  tuzatishini tushunmaydi.

## Fayllar

- `js/logic.js` — vazifalar, `tekshir()` (yetdimi + qisqami), `xatoJoyi()`.
- Maydon, dastur roʻyxati va buyruq tugmalari — umumiy `dastur.js` / `dastur-ui.js` dan.
- `tests/logic.test.js` — 9 test: har xato dasturning yiqilishi, har tuzatishning oʻtishi,
  qisqalik talabi, maydonlarning yaroqliligi.

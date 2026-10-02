# 47-oʻyin — «Robot aqlli boʻldi»

«Algoritm va dasturlash» blokining ikkinchi oʻyini: **takror** (sikl) va **agar** (shart).

- **Yosh:** 8–11 (kichik toifa). Klaviatura kerak emas — hammasi bosish bilan.
- **Oldin oʻtilgan:** «Robot yoʻli» (buyruqlar roʻyxati, tartib).
- Dastlabki rejada bu ikki mavzu ikkita alohida oʻyin edi (27 va 28); muallif bitta oʻyinda
  uch bosqich qilishni tanladi (2026-10-01).

## Asosiy fikr

Bolaning birinchi dasturi — **buyruqlar roʻyxati**. Ikkita yangi narsa qoʻshiladi:

| Blok | Nima qiladi | Nega kerak |
| --- | --- | --- |
| `takror n` | ichidagini n marta bajaradi | bir xil buyruqni qayta-qayta yozmaslik |
| `agar <yon> boʻsh boʻlsa` | ikki yoʻldan birini tanlaydi | **bitta dastur har xil maydonda ishlashi uchun** |

Ikkinchisi — oʻyinning yuragi. Shuning uchun 2- va 3-bosqichda **ikkita maydon** beriladi:
toshning joyi har xil, dastur esa bitta boʻlishi kerak. Shartsiz dastur bir maydonda ishlab,
ikkinchisida toshga uriladi — buni bola oʻz koʻzi bilan koʻradi.

## Bosqichlar

**1. Takror.** Yoʻlak, burchak, zinapoya. Avval tayyor dastur koʻrsatiladi (toʻrtta «oʻngga»
oʻrniga bitta takror), keyin bola oʻzi yigʻadi.

**2. Agar.** Ikki maydon: birida tosh bor. Shartsiz dastur ishga tushiriladi va yiqiladi —
shundan keyin `agar` kiritiladi.

**3. Ikkisi birga.** `takror` ichida `agar`: robot har qadamda qaraydi. Shu bilan uzun yoʻlak
qisqa dastur bilan yechiladi va dastur **maydonni oldindan bilmasa ham** ishlaydi.

## Quruvchi (ekran)

- Blok bosilsa — **faol joyga** qoʻshiladi; faol joy «shu yerga qoʻyiladi» deb turadi.
- `takror` va `agar` ichida oʻz joyi bor; `agar` da ikkita — «ha» va «aks holda».
- Qoʻyilgan oʻq blokini bosish — oʻchiradi; qamrov bloklarida `×` tugmasi bor.
- Takror soni va `agar` yoʻnalishi ustiga bosib almashtiriladi (sudrash yoʻq — QOIDALAR §3).
- Har darajada **blok chegarasi** bor (`maxBlok`): qisqaroq yozishga undaydi.

## Fayllar

- `js/logic.js` — blok modeli va bajaruvchi (`bajar`), 7 ta daraja, `tekshir()`.
- `js/scenes/common.js` — quruvchi, maydonlar, yurgizish.
- Maydon va robot chizigʻi — umumiy `dastur.js` / `dastur-ui.js` dan (26-oʻyin bilan bir xil).
- `tests/logic.test.js` — 9 test: cheksiz takrorning toʻxtatilishi, `agar` ning ikki yoʻli,
  har darajaning namunali yechimi, **shartsiz dasturning ikki maydonda oʻtmasligi**.

## 2026-10-02 qiyinlik yangilanishi

Sabab: har bosqichda 2–3 ta qotirilgan daraja bor edi (jami 7) — 3-javobda oʻsha daraja qaytib kelardi, qayta oʻynaganda ham aynan shu; AGAR darajalarida "doim aylanib oʻt" degan shartsiz dastur ham oʻtib ketardi.

- **Daraja generatori** `yasa(bosqich, prev, rng, tier)` (`logic.js`) — har safar yangi maydon; qotirilgan `TAKROR / AGAR / BIRGA` faqat koʻrsatuv sahnalari uchun qoldi.
  - **Takror:** tier 0 — yoʻlak (4–5 qadam, 4 yoʻnalish) va burchak (ikki takror); tier 1 — burchak, zinapoya (takror ichida 2 buyruq); tier 2 — uzun zinapoya (3–4 marta) va "keng zina" (takror ichida 3 buyruq). `maxBlok` shunday tanlanganki, **takrorsiz yozib boʻlmaydi** (test: eng qisqa yoʻl > maxBlok).
  - **Agar:** ikki qatorli yoʻlak — bir maydonda yoʻlda tosh, ikkinchisida **aylanma yoʻl yopiq**. Shuning uchun shartsiz dastur ikkalasidan oʻtolmaydi (test: `shartsizYolYoq`). Tier 1–2 da `agar` dan oldin 1–2 qadam bor, tier 2 da toshdan keyingi yoʻl 2–3 qadam.
  - **Birga:** yoʻlak 5 → 6 katak, har maydonda 1–2 tosh (tier 2 da jami ≥ 3), aylanma qatorda ham tosh — "boshidan oxirigacha aylanma qatordan yur" oʻtmaydi. Yechim: `takror N [ agar → : → | aks: ↑ → → ↓ ]`.
- Hamma yoʻnalish (oʻng, chap, yuqori, past) tasodifiy — bola yechimni yodlab ololmaydi.
- Testlar: har bosqich × tier da 200 daraja — namunali yechim hamma maydonda ishlaydi, maydon ≤ 6×5, ketma-ket takror yoʻq.

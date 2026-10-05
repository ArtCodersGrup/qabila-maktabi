# 58-oʻyin — «Xabar boʻlaklari»

«Internet qanday ishlaydi» blokining birinchi oʻyini. Blok rejasi: [`../umumiy/INTERNET-BLOK.md`](../umumiy/INTERNET-BLOK.md).

- **Yosh:** 8–11. Telefon va kompyuter — faqat bosish va raqam klaviaturasi.
- **Ulanish:** «Qabila Morzesi» — xabar belgilarga aylanadi; bu oʻyin — xabar **qanday yetib boradi**.

## Asosiy fikr

Bola tasavvuri: *«xabarim bitta boʻlib uchib boradi»*. Aslida:

- uzun xabar **boʻlaklarga** boʻlinadi, har boʻlak alohida konvertga solinadi;
- har konvertda **raqam** (nechanchi boʻlak, jami nechta) va **manzil** bor;
- konvertlar har xil yoʻldan ketadi va **aralash** kelishi mumkin — raqam boʻyicha qayta yigʻiladi;
- bitta konvert yoʻqolsa, aynan **oʻsha raqamlisi** qayta soʻraladi.

Oxirida nom beriladi: bunday raqamlangan konvert — **paket**.

## Metafora (blok boʻyi oʻzgarmaydi)

Xabar — qogʻozdagi xat. Boʻlak — **raqamlangan konvert** (`3/5` — beshtadan uchinchisi).
Konvert rasmi SVG, ichidagi harflar va raqamlar — HTML (QOIDALAR §6).

## Bosqichlar

### 1. Boʻlaklash
Koʻrsatish: «SALOM» xati qaychi bilan 2 harfdan boʻlinadi → `SA`, `LO`, `M` — uch konvert,
har biriga `1/3`, `2/3`, `3/3` yoziladi. Bola oʻzi «qirqadi» (konvertni bosadi, harflar tushadi).

Mashq turlari:
- **Nechta konvert?** — xabar uzunligi va konvert sigʻimi berilgan. Javob — son.
  - tier 0: 6–12 harf, sigʻim 2–4, boʻlinadi qoldiqsiz;
  - tier 1: qoldiq bor (oxirgi konvert toʻla emas — «+1» ni topish kerak);
  - tier 2: 15–30 belgi, sigʻim 4–6, xabarda boʻsh joy bor — **boʻsh joy ham belgi**, sanaladi (ekranda boʻsh joy `␣` katagi bilan koʻrinadi).
- **N-konvertda nima bor?** — 4 variant (toʻgʻri boʻlak, qoʻshni boʻlaklar, bir harf siljigani).

### 2. Yoʻlda aralashdi
Koʻrsatish: konvertlar yoʻlda aralashib keladi (`3/4`, `1/4`, `4/4`, `2/4`). Bola ularni raqam
tartibida bosib, xatni qaytadan yigʻadi — xat koʻz oldida tiklanadi. Shundan keyin nom: **paket**.

Mashq turlari:
- **Xabar nima deydi?** — konvertlar kelgan tartibda turibdi (raqamlari koʻrinadi). 4 variant: toʻgʻri
  tartib, kelgan tartib, teskari tartib, ikki boʻlagi almashgan. tier 0 — 3 konvert, tier 1 — 4, tier 2 — 5–6.
- **Qaysi konvert uchinchi oʻqiladi?** — raqami boʻyicha toʻgʻri konvertni tanlash (4 ta konvert-tugma).

### 3. Boʻlak yoʻqoldi
Koʻrsatish: `1/5`, `2/5`, `4/5`, `5/5` keldi — xat oʻrtasida teshik. «Qaysi raqam yoʻq?» — `3`.
Qabul qiluvchi faqat **3-konvertni** qayta soʻraydi, hammasini emas.

Mashq turlari:
- **Qaysi raqamli konvert kelmadi?** — javob son. tier 0: 4–5 konvertdan bittasi yoʻq; tier 1: 6–8 konvert, aralash tartibda; tier 2: 8–10 konvert, aralash.
- **Hammasi keldimi?** — 4 variant: «Ha, hammasi keldi», «Yoʻq, 1 ta kelmadi», «Yoʻq, 2 ta kelmadi», «Bitta konvert ikki marta keldi». Holatlar tasodifiy, javob har xil.
- **Nechta konvert qayta soʻraladi?** (tier 2) — ikki boʻlak yoʻq va bittasi ikki marta kelgan: javob — yoʻqlari soni.

## Qarorlar

- **Faqat lotin bosh harflari va boʻsh joy** — `Oʻ`, `Gʻ` bitta katakda turadi (bitta belgi deb sanaladi), shunda hisob aniq.
- Xabarlar — qisqa, bolaga tanish iboralar banki (`SALOM DOʻSTIM`, `ERTAGA MAKTABDA`, …), hammasi qoʻlda yozilgan; tasodifiy harflardan xabar yasalmaydi.
- **Variantli savolda doim 4 variant** (QOIDALAR 4.3); «Hammasi keldimi?» ham 4 variantli.
- Maslahat javobni aytmaydi: «konvert sigʻimini xabar uzunligiga necha marta qoʻyib boʻladi?», «raqamlarni 1 dan boshlab sanab chiq».
- Haqiqatda bundan murakkabroq: bitta satr — *«haqiqiy paketda manzil, raqam va tekshiruv soni bor; boʻlak yuzlab harf sigʻdiradi»*.

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Uzun xabar internetda boʻlaklarga boʻlinib ketishini aytadi.
2. Xabar uzunligi va boʻlak sigʻimidan nechta boʻlak kerakligini hisoblaydi (qoldiqli holat ham).
3. Har boʻlakda nima yozilishini aytadi: raqam (nechanchisi, jami nechta) va manzil.
4. Aralash kelgan boʻlaklardan xabarni raqam boʻyicha tiklaydi.
5. Yetib kelmagan boʻlakni topadi va faqat oʻshani qayta soʻrash kerakligini tushuntiradi.
6. «Paket» soʻzini toʻgʻri ishlatadi.

## Fayllar (reja)

- `js/logic.js` — xabarlar banki, boʻlaklash, aralashtirish, yoʻqotish/ikki marta kelish, uch bosqich generatorlari (`tier` bilan).
- `tests/logic.test.js` — boʻlaklash qoldiqli/qoldiqsiz, raqamlar uzluksizligi, variantlar 4 ta va takrorlanmasligi, javob har doim variantlar ichida.
- `js/scenes/` — `common.js` (konvert, xat qatori, mashq ekranlari), `stage1–3.js`, `final.js`.
- `js/game-art.js` — konvert, qaychi, pochta qutisi (matnsiz SVG).

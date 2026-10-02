# 36 — Algoritm va xossalari: dizayn

**Mavzu:** algoritm nega kerak; uning beshta xossasi; bir masalaning ikki yechimi
**Yosh:** 12–16 · **Qurilma:** kompyuter (💻) · **Taxminiy davomiyligi:** 25–30 daqiqa
**Holati:** kod yozildi, testlar yashil — muallif koʻrib chiqishini kutmoqda (2026-10-01)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok rejasi: [`../umumiy/ALGORITM-BLOK.md`](../umumiy/ALGORITM-BLOK.md).
Bu — **«Algoritmlar va samaradorlik»** blokining birinchi oʻyini. Oldingi blok: Python (27–35).
Bogʻliq oʻyin: **Robot yoʻli** — u yerda algoritm *nima* ekanini koʻrgan edik, bu yerda *qanaqa boʻlishi kerakligini* oʻrganamiz.

> Ikki dastur ham toʻgʻri javob beradi. Lekin biri **12 qadam**, ikkinchisi **2 qadam** bajaradi.
> Demak "ishlaydi" degani "yaxshi" degani emas.

## 1. Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Algoritmning beshta xossasini nomi bilan aytadi: **tushunarlilik, aniqlik, diskretlik, natijaviylik, ommaviylik**.
2. Berilgan algoritmda qaysi xossa buzilganini topadi va **nima uchun** buzilganini tushuntiradi.
3. Buzilgan algoritmni tuzatadi (aniq qadam, toʻxtash sharti, istalgan kirish uchun ishlash).
4. Bitta masalaning ikki yechimini solishtiradi va **qadamlar soni** boʻyicha qaysi biri tejamli ekanini aytadi.
5. "Ishlaydi" va "yaxshi" — boshqa-boshqa narsa ekanini misolda koʻrsatadi.
6. Kompyuter "oʻzicha tushunmasligini" biladi: har buyruq aniq boʻlishi kerak.

## 2. Qahramonlar va rasmlar

Oqsoqol va Shogird. Oʻyinga xos rasm (`js/game-art.js`, matnsiz): **ikki yoʻl** — biri uzun va burilishli, ikkinchisi qisqa; ikkalasi ham bir joyga olib boradi.

## 3. Asboblar

Umumiy: kod bloki, chiqish paneli, mashq ekranlari (`umumiy/js/kod-mashq.js`).
**Yangi:** `qadamOlchov` — ikki kodni ishga tushirib, **qadamlar sonini** yonma-yon koʻrsatadigan jadval (talqinchi `run().steps` ni beradi). Bu asbob 38–40-oʻyinlarda ham ishlatiladi.

## 4. Oʻyin oqimi

```
Bosh ekran
   ├─► 1-bosqich: Ikki yoʻl        [bir masala, ikki yechim → qadamlarni solishtirish → mashq 3]
   ├─► 2-bosqich: Beshta xossa     [har xossa buzilgan misol → nom → mashq 3]
   └─► 3-bosqich: Kodda xossa      [Python kodida buzilgan xossani topish va tuzatish → mashq 3] → tabrik
```

## 5. 1-bosqich: Ikki yoʻl

1. **Koʻrsatish:** 1 dan 100 gacha yigʻindi ikki xil yoziladi — sikl bilan va Gauss formulasi bilan. Ikkalasi ham `5050` beradi; qadamlar jadvalida **306** va **2**.
2. **Nom:** "Ikkalasi ham toʻgʻri. Lekin biri kam ish qiladi. Buni **samaradorlik** deymiz."
3. **Mashq** (3 ta toʻgʻri): ikki kod beriladi — qaysi biri kamroq qadam bajaradi? Bola tanlaydi, keyin haqiqiy oʻlchov koʻrsatiladi.

## 6. 2-bosqich: Beshta xossa

1. **Koʻrsatish:** kundalik algoritm (retsept, yoʻl koʻrsatma) — har safar bitta xossasi buzilgan:
   - "bir oz tuz sol" → **aniqlik** yoʻq;
   - "toʻrtburchakni chiroyli chiz" → **tushunarlilik** yoʻq;
   - "suv qaynaguncha kut, qaynamasa yana kut" → **natijaviylik** yoʻq;
   - "faqat 5 soni uchun javob: 25" → **ommaviylik** yoʻq;
   - "hammasini bir vaqtda qil" → **diskretlik** yoʻq.
2. **Taʼrif:** beshta xossa bitta kartada, har biri bitta gap bilan.
3. **Mashq** (3 ta toʻgʻri): tasodifiy buzuq algoritm — qaysi xossa buzilgan? (5 ta tanlov.)
   - 1-xato: buzilgan qator belgilanadi.
   - 2-xato: javob va izoh koʻrsatiladi.

## 7. 3-bosqich: Kodda xossa

1. **Koʻrsatish:** Python kodida xossa buzilishi: cheksiz sikl (**natijaviylik**), faqat bitta songa ishlaydigan kod (**ommaviylik**).
2. **Mashq** (3 ta toʻgʻri), navbat bilan:
   - **Qaysi xossa buzilgan?** — kod berilgan, 5 ta tanlovdan biri.
   - **Tuzat** — oʻsha kodni ishlaydigan qilish (testlar bilan tekshiriladi).

**Tabrik:** `Beshta xossa: tushunarlilik, aniqlik, diskretlik, natijaviylik, ommaviylik`, `Ishlaydi ≠ yaxshi`, `Qadamlar sonini oʻlchash mumkin`.

## 8. Ekran tuzilishi

27–35-oʻyinlardagidek uch zona. Qadamlar jadvali ish maydonining oʻrtasida, eni ≤ 640 px.

## 9. Kod tuzilishi

```
36-algoritm-xossalari/
├── js/logic.js     xossalar, buzuq algoritmlar, kod juftliklari va qadam o'lchovi
├── js/game-art.js  ikki yo'l rasmi
├── js/scenes/…     kirish, uch bosqich, tabrik
└── tests/logic.test.js
```

## 10. 2026-10-02 qiyinlik yangilanishi

Sabab: hisobot-5 (C jadvali) — xossa mashqida 7 ta qotirilgan algoritm (ikkinchi aylanishda takror),
«qaysi yechim tejamli» mashqida tejamlisi **doim ikkinchi tugmada** va tanlov ikkita edi.

- **`BUZUQ` 7 → 14:** har xossaga kamida ikkita misol (yugurish, robot, tanga, juft-toq, tuxum, oʻrtacha, sanash).
- **Ikki yechim (`JUFTLAR` 4 → 9):** yangi juftliklarda ikkalasi ham sikl (break bilan toʻxtash, qadamli `range`,
  ildizgacha sinash) va ikkita **teng** juftlik (`range(12)` / `range(1, 13)`; roʻyxat / qadamli `range`).
  Yechimlar tasodifiy tartibda koʻrsatiladi. Javob — uch tanlovdan biri (A, B, «ikkalasi teng») **va** juft savol:
  «koʻproq aylanadigan sikl necha marta aylanadi?» (son). Ikkalasi toʻgʻri boʻlsagina hisoblanadi (QOIDALAR §4.3).
  Sikl aylanishlari qoʻlda yozilmagan — `aylanish()` talqinchi kuzatuvidan sanaydi.
- **`KODLAR` 3 → 6:** `(a + b) // 2` (ommaviylik), `input()` ni `int` qilmaslik (natijaviylik — TypeError),
  toq sonda toʻxtamaydigan `while n != 0` (natijaviylik).
- Zina: 1-bosqichda `tier` 0 — «sikl va formula», 1–2 — ikkalasi ham sikl. Testlar: 10 → 14.

# 37 — Blok-sxema: dizayn

**Mavzu:** algoritmni chizish — belgilar, sxemani yigʻish va oʻqish
**Yosh:** 12–16 · **Qurilma:** kompyuter (💻) · **Taxminiy davomiyligi:** 30 daqiqa
**Holati:** kod yozildi, testlar yashil — muallif koʻrib chiqishini kutmoqda (2026-10-01)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok rejasi: [`../umumiy/ALGORITM-BLOK.md`](../umumiy/ALGORITM-BLOK.md).
Blokdagi oʻrni: `36` Algoritm va xossalari → **37** → `38` Izlash.

> Algoritmni soʻz bilan ham, kod bilan ham yozish mumkin. Uchinchi yoʻl — **chizish**.
> Chizilgan algoritmni dasturlash tilini bilmagan odam ham oʻqiydi.

## 1. Oʻquv maqsadlari

1. Blok-sxema belgilarini biladi: oval (boshi/oxiri), qiyshiq toʻrtburchak (kiritish/chiqarish), toʻrtburchak (amal), romb (shart), qoʻshaloq toʻrtburchak (takror).
2. Sxemani **oʻqiydi**: berilgan kirish uchun nima chiqishini aytadi.
3. Sxemani **yigʻadi**: bloklarni toʻgʻri tartibda qoʻyadi, shart ichiga "ha" va "yoʻq" tomonlarini ajratadi.
4. Sxema va kod bir narsaning ikki koʻrinishi ekanini koʻrsatadi: har blok — kodning bitta satri.
5. Oval bloklar kodga tushmasligini biladi.

## 2. Men qabul qilgan qarorlar

1. **Bloklar HTML, shakllar CSS bilan.** QOIDALAR §6: SVG ichiga matn yozilmaydi. Shuning uchun sxema SVG emas — HTML bloklar (romb `clip-path` bilan, parallelogramm `skewX` bilan).
2. **Sudrash yoʻq** (QOIDALAR §3): palitradagi blok **bosiladi** — faol zonaga qoʻshiladi; qoʻyilgan blok bosilsa — oʻchadi.
3. **Bitta darajali ichma-ichlik** (blok rejasida kelishilgan): shart va takror faqat asosiy yoʻlga qoʻyiladi, ularning ichiga esa oddiy bloklar. Shart ichida shart — yoʻq. Maktab dasturidagi mavzular shu bilan qoplanadi.
4. **Tekshirish — kod orqali.** Yigʻilgan sxemadan Python kodi yasaladi va test holatlarida ishga tushiriladi. Shuning uchun **bir nechta toʻgʻri tartib** avtomatik qabul qilinadi (masalan, ikki kiritish blokining oʻrni).
5. **Faol zona koʻrinadi:** shart qoʻyilganda "ha" tomoni oʻzi tanlanadi va punktir bilan belgilanadi — bola qayerga qoʻshayotganini koʻrib turadi.

## 3. Oʻyin oqimi

```
Bosh ekran
   ├─► 1-bosqich: Belgilar       [toʻliq sxema → har shakl nima uchun → mashq 3]
   ├─► 2-bosqich: Sxemani yigʻish [sxema → kod; shart → if/else → mashq 3]
   └─► 3-bosqich: Oʻqish va yigʻish [takror bloki → navbat bilan oʻqish va yigʻish] → tabrik
```

## 4. Mashqlar

- **Belgilar:** shakl koʻrsatiladi, beshta javobdan biri tanlanadi.
- **Yigʻish** (5 ta masala): kvadrat, juft/toq, 1–5 yigʻindi, ikki sondan kattasi, uch marta "Salom". Palitrada chalgʻituvchi blok ham bor.
- **Oʻqish** (4 ta sxema): chiziqli, shartli, sikl va sanoq. Bola chiqishni yozadi.

## 5. Kod tuzilishi

```
37-blok-sxema/
├── js/sxema.js     model va kod yasash (sof mantiq): kodYasa, tekshir, soni
├── js/sxema-ui.js  chizish va bosish bilan yig'ish (HTML + CSS shakllar)
├── js/logic.js     savollar: belgilar, yig'ish masalalari, o'qish sxemalari
├── js/game-art.js  blok-sxema rasmi
├── js/scenes/…     kirish, uch bosqich, tabrik
└── tests/          sxema.test.js (10 ta), logic.test.js (10 ta)
```

# 38 — Izlash: dizayn

**Mavzu:** chiziqli va ikkilik izlash; nega usul tanlash muhim
**Yosh:** 12–16 · **Qurilma:** kompyuter (💻) · **Taxminiy davomiyligi:** 30 daqiqa
**Holati:** kod yozildi, testlar yashil — muallif koʻrib chiqishini kutmoqda (2026-10-01)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok rejasi: [`../umumiy/ALGORITM-BLOK.md`](../umumiy/ALGORITM-BLOK.md).
Blokdagi oʻrni: `37` Blok-sxema → **38** → `39` Saralash.

> 100 ta sondan bittasini topish uchun 100 ta savol kerakmi?
> Yoʻq — **7 ta** yetadi. Har savol qolganining yarmini tashlab yuboradi.

## 1. Oʻquv maqsadlari

1. Chiziqli izlashni tushuntiradi: boshidan oxirigacha bitta-bitta tekshirish.
2. Ikkilik izlashni tushuntiradi: oʻrtasiga qarash va yarmini tashlab yuborish.
3. Ikkilik izlash **faqat tartiblangan** roʻyxatda ishlashini biladi.
4. 1–100 oraligʻida oʻylangan sonni **7 ta savolda** topadi.
5. Ikkala usulni Python'da yozadi (`izla(a, x)` → indeks yoki −1).
6. Qadamlar jadvalini oʻqiydi: roʻyxat ikki barobar uzaysa, chiziqli izlash ham ikki barobar koʻp ishlaydi, ikkilik izlashga esa bir necha qadam qoʻshiladi.
7. **Kichik roʻyxatda farq yoʻqligini** biladi — usul katta maʼlumotda ahamiyatli.

## 2. Men qabul qilgan qarorlar

1. **Oʻlchovda roʻyxat bitta satrda beriladi** (`a = [0, 1, 2, …]`). Agar roʻyxat siklda yasalsa, oʻsha qadamlar ikkala usulga ham qoʻshilib, izlashning farqini yashirib qoʻyadi. Biz faqat **izlash qadamlarini** oʻlchaymiz.
2. **1-bosqichda bola avval oʻz usuli bilan oʻynaydi** (cheklovsiz), keyin kompyuter topadi, keyin mashqda 7 ta savol chegarasi qoʻyiladi. Oldin qiyinchilikni his qilsin, keyin usulni oʻrgansin (QOIDALAR §4.1).
3. **Kompyuter ham oʻynaydi:** bola son oʻylaydi, kompyuter “oʻrtasini aytish” bilan topadi — bola strategiyani tashqaridan koʻradi.
4. Mashqda **7 ta savol chegarasi** — yutqazish emas: javob koʻrsatiladi va yangi son beriladi (QOIDALAR §4.4).

## 3. Oʻlchangan natija (2026-10-01)

| Roʻyxat uzunligi | Chiziqli | Ikkilik |
|---|---|---|
| 10 | 26 | 28 |
| 20 | 46 | 33 |
| 40 | 86 | 38 |
| 80 | 166 | 43 |

Diqqat: **n = 10 da ikkilik izlash biroz koʻproq ishlaydi.** Bu — yashirilmaydi, aksincha tushuntiriladi: kichik roʻyxatda farq yoʻq, katta roʻyxatda farq ulkan.

## 4. Oʻyin oqimi

```
Bosh ekran
   ├─► 1-bosqich: Oʻylangan son   [bola topadi → kompyuter topadi → 7 savol chegarasi bilan mashq 3]
   ├─► 2-bosqich: Chiziqli izlash [kod → indeks; topilmasa −1 → mashq 3]
   └─► 3-bosqich: Ikkilik izlash  [kod → qadamlar jadvali → ikkala funksiyani yozish] → tabrik
```

## 5. Kod tuzilishi

```
38-izlash/
├── js/logic.js    "son o'yladim" mantiqi (javob, yarmi, torayt, kerakliSavol),
│                  izlash kodlari, qadam o'lchovi va jadval, savollar
├── js/game-art.js lupa va kataklar rasmi
├── js/scenes/…    kirish, uch bosqich, tabrik
└── tests/logic.test.js  (11 ta): strategiya 7 savoldan oshmaydi, jadval o'sishi, yechimlar testdan o'tishi
```

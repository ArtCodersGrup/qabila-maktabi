# 31 — Takror charxi: dizayn

**Mavzu:** `while` sikli — hisoblagich, yigʻindi, `break`, raqamlarni ajratish (`% 10`, `// 10`)
**Yosh:** 12–16 · **Qurilma:** kompyuter (💻) · **Taxminiy davomiyligi:** 25–30 daqiqa
**Holati:** kod yozildi, testlar yashil — muallif koʻrib chiqishini kutmoqda (2026-09-30)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok rejasi: [`../umumiy/PYTHON-BLOK.md`](../umumiy/PYTHON-BLOK.md).
Blokdagi oʻrni: `30` Ikki yoʻl → **31** → `32` Sanoqli takror.

> Charx aylanaveradi. Uni toʻxtatadigan narsa — **shart**. Shart yolgʻon boʻlmasa, charx toʻxtamaydi.

## 1. Oʻquv maqsadlari

Oʻyindan keyin bola:

1. `while shart:` bilan takrorlanadigan blok yozadi va hisoblagichni oʻzi oshiradi.
2. Sikl necha marta aylanishini oldindan aytadi (`i = 1`, `while i <= 5` → 5 marta).
3. **Cheksiz sikl** nega yuz berishini biladi: hisoblagich oʻzgarmasa yoki shart hech qachon yolgʻon boʻlmasa.
4. Yigʻindi va sanoqni sikl bilan toʻplaydi (`s = s + i`).
5. `break` bilan siklni oʻrtasidan toʻxtatadi.
6. `n % 10` — oxirgi raqam, `n // 10` — qolgani ekanini bilib, sonning **raqamlarini ajratadi**.
7. Raqamlar yigʻindisi, raqamlar soni va sonni teskari oʻgirish masalalarini yechadi.

## 2. Qahramonlar va rasmlar

Oqsoqol va Shogird. Oʻyinga xos rasm (`js/game-art.js`, matnsiz): **suv charxi** — aylanadigan gʻildirak; qadam sanogʻiga qarab paraklari boʻyaladi.

## 3. Asboblar

Umumiy asboblar. Qadam-baqadam panel bu oʻyinda eng muhim: har aylanishda shart satri qayta yonadi va hisoblagich qutisi oʻzgaradi.

## 4. Oʻyin oqimi

```
Bosh ekran
   ├─► 1-bosqich: Charx aylanadi   [qadam-baqadam sanoq → cheksiz sikl → taʼrif → mashq 3]
   ├─► 2-bosqich: Yigʻib borish    [yigʻindi → break → mashq 3]
   └─► 3-bosqich: Raqamlarni ajratish [% 10 va // 10 → mashq 3] → tabrik
```

## 5. 1-bosqich: Charx aylanadi

1. **Koʻrsatish:** `i = 1 / while i <= 5: / print(i) / i += 1` qadam-baqadam. Shart satri har aylanishda qayta yonadi.
2. **Cheksiz sikl:** `i += 1` oʻchirilgan kod ishga tushiriladi — talqinchi 200 000 qadamdan keyin toʻxtatadi va izoh beradi. Bola qatorning oʻzini qoʻshib tuzatadi.
3. **Taʼrif:** `while shart:` — shart rost boʻlgan **har safar** blok qayta bajariladi. Hisoblagichni oʻzgartirishni unutma.
4. **Mashq** (3 ta toʻgʻri): tasodifiy hisoblagichli sikl, bola chiqishni yozadi (qadamlar soni ≤ 8).

## 6. 2-bosqich: Yigʻib borish

1. **Koʻrsatish:** `s = 0` va `s = s + i` — qadam-baqadam, `s` qutisi toʻlib boradi.
2. **`break`:** shart oʻrtada bajarilganda sikl darrov toʻxtaydi.
3. **Taʼrif:** yigʻuvchi quti sikldan **oldin** yaratiladi, sikl ichida oʻzgaradi, sikldan keyin chiqariladi.
4. **Mashq** (3 ta toʻgʻri): yigʻindi, koʻpaytma yoki sanoq; javob ≤ 500.

## 7. 3-bosqich: Raqamlarni ajratish

1. **Koʻrsatish:** 5382 sonining raqamlari birma-bir ajratiladi: `n % 10` → oxirgisi, `n // 10` → qolgani. Jadval koʻrinishida.
2. **Mashq** (3 ta toʻgʻri), navbat bilan:
   - **Xatoni tuzat** — cheksiz sikl (hisoblagich oshmaydi) yoki `%` va `//` almashib ketgan kod.
   - **Kodni yoz** — raqamlar yigʻindisi; raqamlar soni; sonni teskari oʻgirish; eng katta raqam. Har biri 4 ta test holatida.

**Tabrik:** `while — shart rost boʻlgancha takrorlanadi`, `Hisoblagichni oʻzgartirishni unutma`, `% 10 — oxirgi raqam, // 10 — qolgani`.

## 8. Ekran tuzilishi

27–30-oʻyinlardagidek. 3-bosqichdagi raqam ajratish jadvali `kod-ui` dagi oddiy jadval bilan koʻrsatiladi (yangi asbob kerak emas).

## 9. Kod tuzilishi

```
31-takror-charxi/
├── js/logic.js     savollar: sanoq sikli, yig'indi, break, raqam ajratish, xato ovi
├── js/game-art.js  suv charxi rasmi
├── js/scenes/…     kirish, uch bosqich, tabrik
└── tests/logic.test.js
```

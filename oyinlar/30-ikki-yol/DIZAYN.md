# 30 — Ikki yoʻl: dizayn

**Mavzu:** shart — `if / elif / else`, otstup, `and` `or` `not`
**Yosh:** 12–16 · **Qurilma:** kompyuter (💻) · **Taxminiy davomiyligi:** 25–30 daqiqa
**Holati:** kod yozildi, testlar yashil — muallif koʻrib chiqishini kutmoqda (2026-09-30)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok rejasi: [`../umumiy/PYTHON-BLOK.md`](../umumiy/PYTHON-BLOK.md).
Blokdagi oʻrni: `29` Nomli qutilar → **30** → `31` Takror charxi.
Bogʻliq oʻyin: **Mantiq kalitlari** (VA, YOKI, EMAS) — shu yerda `and`, `or`, `not` boʻlib qaytadi.

> Yoʻl ikkiga ayriladi. Qaysi yoʻldan borishni **shart** hal qiladi.

## 1. Oʻquv maqsadlari

Oʻyindan keyin bola:

1. `if` va `else` bilan dasturni ikki yoʻlga ajratadi.
2. Solishtirish belgilarini ishlatadi: `== != < <= > >=`; `=` va `==` farqini aytadi.
3. **Otstup** blokni belgilashini tushuntiradi: surilgan satrlar shartga tegishli, surilmagani doim bajariladi.
4. `elif` bilan uchdan ortiq yoʻl yasaydi va **tartib muhimligini** koʻrsatadi.
5. `and`, `or`, `not` ni ishlatadi va ularni Mantiq blokidagi VA, YOKI, EMAS bilan bogʻlaydi.
6. Toʻrt xil xatoni tuzatadi: `=` oʻrniga `==`, ikki nuqta yoʻq, otstup yoʻq, `else` ga shart yozilgan.
7. Kiritilgan songa qarab javob beradigan dastur yozadi (juft/toq, eng katta, oraliq, baho).

## 2. Qahramonlar va rasmlar

Oqsoqol va Shogird. Oʻyinga xos rasm (`js/game-art.js`, matnsiz): **ayrilgan yoʻl** — oʻngga va chapga ketadigan ikki soʻqmoq, oʻrtasida belgi.

## 3. Asboblar

Umumiy asboblar yetarli: muharrir, chiqish paneli, qadam-baqadam panel (qaysi satr bajarilayotgani koʻrinadi — shart uchun ayni muddao), mashq ekranlari.

## 4. Oʻyin oqimi

```
Bosh ekran
   ├─► 1-bosqich: Shart va otstup   [qadam-baqadam: qaysi yoʻl → otstup sinovi → taʼrif → mashq 3]
   ├─► 2-bosqich: Uchinchi yoʻl     [elif zanjiri → tartib muhim → and/or/not → mashq 3]
   └─► 3-bosqich: Oʻzing yoz        [xato ovi → kod yozish → mashq 3] → tabrik
```

## 5. 1-bosqich: Shart va otstup

1. **Koʻrsatish:** `yosh = 15`, `if yosh >= 12:` … `else:` … Qadam-baqadam yuriladi: bola **qaysi satr bajarilganini** koʻradi. Keyin `yosh = 8` bilan qayta yuriladi — boshqa yoʻl yonadi.
2. **Otstup sinovi:** oxirgi `print` surilgan va surilmagan holatda solishtiriladi: surilgani faqat shart bajarilganda, surilmagani doim chiqadi.
3. **Taʼrif:** `if shart:` — shart rost boʻlsa, surilgan satrlar bajariladi; `else:` — aks holda.
4. **Mashq** (3 ta toʻgʻri): tasodifiy son va shart, bola chiqishni yozadi. Ayrimlarida blokdan keyin doim bajariladigan satr ham bor.

## 6. 2-bosqich: Uchinchi yoʻl

1. **Koʻrsatish:** ball → baho zanjiri (`90`, `70`, `50`). Bir nechta `elif`, oxirida `else`.
2. **Tartib muhim:** shu zanjir teskari tartibda yoziladi — hammasi birinchi shartga tushib qoladi. "Yuqoridan pastga tekshiriladi, birinchi rost topilganda toʻxtaydi."
3. **`and`, `or`, `not`:** Mantiq blokidagi kalitlar eslatiladi; `0 < x < 10` — Pythonning qisqa yoʻli.
4. **Mashq** (3 ta toʻgʻri): `elif` zanjiri yoki mantiqiy ifoda (`True`/`False` chiqadi).

## 7. 3-bosqich: Oʻzing yoz

1. **Koʻrsatish:** `if x = 5:` xatosi — Python oʻzi maslahat beradi ("Maybe you meant '=='").
2. **Mashq** (3 ta toʻgʻri), navbat bilan:
   - **Xatoni tuzat** — toʻrt xil buzilish: `=`/`==`, ikki nuqta yoʻq, otstup yoʻq, `else` ga shart yozilgan.
   - **Kodni yoz** — juft/toq; uch sondan eng kattasi; son oraliqdami; ball → baho. Har biri 3–4 test holatida tekshiriladi.

**Tabrik:** `if shart: — surilgan satrlar shartga tegishli`, `elif — yuqoridan pastga, birinchi rost`, `and, or, not — Mantiq blokidagi kalitlar`.

## 8. Ekran tuzilishi

27–29-oʻyinlardagidek. Qadam-baqadam panel 1- va 2-bosqichda asosiy asbob: shart rost boʻlganda qaysi satrga sakraganini koʻrsatadi.

## 9. Kod tuzilishi

```
30-ikki-yol/
├── js/logic.js     savollar: if/else, elif zanjiri, mantiqiy ifoda, xato tuzatish, kod yozish
├── js/game-art.js  ayrilgan yo'l rasmi
├── js/scenes/…     kirish, uch bosqich, tabrik
└── tests/logic.test.js
```

## 10. 2026-10-02 qiyinlik yangilanishi

Sabab: hisobot-5 (C jadvali) — 1-bosqichda faqat bitta shartli `if/else`, «xatoni tuzat» da bitta shablon (`x == limit`).

- **1-bosqich:** uch shakl — oddiy (zina 0), `and` li shart (zina 1: `if x >= a and x < b`), ichma-ich `if` (zina 2,
  uch tarmoq). Yuqori zinalarda qiymat koʻpincha chegaraning oʻzi yoki ±1 — `>=` va `>` farqi koʻrinadi.
- **2-bosqich:** `elif` zanjirida ball koʻpincha chegaraning oʻzida yoki bitta kam; mantiqiy ifodalarga
  `not ( … and … )`, `x % 3 == 0 or x % 5 == 0`, `or` ichida `and` (amallar tartibi) qoʻshildi.
- **3-bosqich — xato ovi:** uch xil dastur (teng/teng emas; oraliq `and` bilan; `if/elif/else`), buzilish turlari 4 → 6
  (`else` dan keyin ikki nuqta yoʻq; `else` tanasi surilmagan).
- **3-bosqich — kod yozish 4 → 8:** `uch-besh` (3 ga ham, 5 ga ham), `osish` (qatʼiy oʻsish — teng sonlar testda),
  `uchburchak` (uch tengsizlik — uzun kesma har uch oʻrinda), `kabisa` (1900, 2000, 2100 testda). Har biriga 6 test;
  boshqa toʻgʻri yoʻllar (`n % 15`, `a < b < c`, bitta `and/or` sharti) ham qabul qilinadi.
- Testlar: 10 → 15.

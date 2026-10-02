# 28 — Sonlar ustaxonasi: dizayn

**Mavzu:** sonlar ustida amallar — `//` (butun boʻlinma), `%` (qoldiq), `**`, amallar tartibi
**Yosh:** 12–16 · **Qurilma:** kompyuter (💻) · **Taxminiy davomiyligi:** 20–25 daqiqa
**Holati:** kod yozildi, testlar yashil — muallif koʻrib chiqishini kutmoqda (2026-09-30)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok rejasi: [`../umumiy/PYTHON-BLOK.md`](../umumiy/PYTHON-BLOK.md).
Blokdagi oʻrni: `27` Birinchi buyruq → **28** → `29` Nomli qutilar.

> 17 ta toshni 5 bolaga boʻlsang, har biriga 3 tadan tegadi va 2 tasi ortadi.
> Kompyuterda buni ikkita amal qiladi: `//` va `%`.

## 1. Oʻquv maqsadlari

Oʻyindan keyin bola:

1. `+ - * /` va yangi ikkitasini — `//`, `%` — ishlatadi.
2. `/` **doim kasr** berishini biladi: `4 / 2` → `2.0`, `7 / 2` → `3.5`.
3. `17 // 5` — nechtadan tegishini, `17 % 5` — nechtasi ortishini hayotiy misolda tushuntiradi.
4. Amallar tartibini aytadi: avval `**`, keyin `* / // %`, keyin `+ -`; qavs tartibni oʻzgartiradi.
5. `2 ** 10` kabi darajani hisoblaydi va katta sonlar aniq chiqishini koʻradi.
6. `n % 10` — oxirgi raqam, `n // 10` — qolgani ekanini biladi (31-oʻyinga tayyorgarlik).
7. Matn va sonni birga chiqarish uchun vergul ishlatadi: `print("javob:", x)`.

## 2. Qahramonlar va rasmlar

Oqsoqol va Shogird. Oʻyinga xos rasm (`js/game-art.js`, matnsiz): **toshlarni boʻlish** — teng guruhlar va ortib qolgani boshqa rangda.

## 3. Asboblar

Umumiy: kod muharriri, chiqish paneli, qadam-baqadam panel, mashq ekranlari (`umumiy/js/kod-mashq.js`).
Yangi narsa yoʻq — 27 va 29-oʻyinlardagi asboblar yetarli.

## 4. Oʻyin oqimi

```
Bosh ekran
   ├─► 1-bosqich: Boʻlishning ikki natijasi  [toshlarni boʻlish → // va % → / kasr beradi → mashq 3]
   ├─► 2-bosqich: Amallar tartibi            [qavssiz va qavsli → daraja → mashq 3]
   └─► 3-bosqich: Hisoblaydigan dastur       [print("javob:", x) → mashq 3] → tabrik
```

## 5. 1-bosqich: Boʻlishning ikki natijasi

1. **Koʻrsatish:** 17 tosh, 5 bolaga. Rasmda teng guruhlar va ortgan toshlar. Yonida kod: `print(17 // 5)` → `3`, `print(17 % 5)` → `2`.
2. **`/` boshqacha:** `print(17 / 5)` → `3.4`; `print(4 / 2)` → `2.0`. "Boʻlish doim kasr beradi, hatto teng boʻlinsa ham."
3. **Taʼrif:** `//` — nechtadan tegdi, `%` — nechtasi ortdi, `/` — kasr natija.
4. **Mashq** (3 ta toʻgʻri): tasodifiy `a // b`, `a % b`, `a / b` (a ≤ 99, b 2–9). Bola natijani yozadi.
   - 1-xato: toshlar rasmi bilan eslatma.
   - 2-xato: haqiqiy chiqish.

## 6. 2-bosqich: Amallar tartibi

1. **Koʻrsatish:** `2 + 3 * 4` va `(2 + 3) * 4` yonma-yon ishga tushiriladi.
2. **Daraja:** `2 ** 10`, `2 ** 3 ** 2` (oʻngdan bogʻlanadi), `-2 ** 2` (daraja unar minusdan kuchli).
3. **Taʼrif:** avval `**`, keyin `* / // %`, keyin `+ -`; qavs — eng kuchlisi.
4. **Mashq** (3 ta toʻgʻri): 2–3 amalli ifoda, javob ≤ 200. Ayrimlarida qavs bor, ayrimlarida yoʻq.

## 7. 3-bosqich: Hisoblaydigan dastur

1. **Koʻrsatish:** `x = 17 // 5` va `print("javob:", x)`. Vergul — matn va sonni birga chiqarish yoʻli.
2. **Tuzoq:** `print("javob: " + x)` → `TypeError`. Ikki yechim: vergul yoki `str(x)`.
3. **Mashq** (3 ta toʻgʻri), navbat bilan:
   - **Xatoni tuzat** — matn va son `+` bilan qoʻshilgan kod.
   - **Kodni yoz** — kiritilgan sondan: oxirgi raqamini chiqar; daqiqani soat va daqiqaga ayir; ikki sonning boʻlinmasi va qoldigʻini chiqar. Har biri 3 ta test holatida tekshiriladi.

**Tabrik:** `// — nechtadan tegdi, % — nechtasi ortdi`, `/ doim kasr beradi`, `Avval daraja, keyin koʻpaytirish, keyin qoʻshish`.

## 8. Ekran tuzilishi

27-oʻyindagidek. 1-bosqichdagi toshlar rasmi eni ≤ 340 px.

## 9. Kod tuzilishi

```
28-sonlar-ustaxonasi/
├── js/logic.js        savollar: bo'lish, ifodalar (tartib bilan), kod yozish masalalari
├── js/game-art.js     toshlarni bo'lish rasmi (guruhlar va ortgani)
├── js/scenes/…        kirish, uch bosqich, tabrik
└── tests/logic.test.js
```

## 10. 2026-10-02 qiyinlik yangilanishi

Sabab: hisobot-5 (C jadvali) — sonlar 8–12 yosh chegarasida edi (javob ≤ 200, boʻlinuvchi ≤ 99).

- **1-bosqich (`//`, `%`, `/`):** boʻlinuvchi zina bilan oʻsadi — 99 → 299 → 999 (uch xonali sonlar).
- **2-bosqich (amallar tartibi):** `MAX` 200 → 500 (zina: 200 → 350 → 500). Yangi shakllar: toʻrt amalli
  (`a + b * c - d`, `(a - b) * (c + d)`, `a * b // c + d`, `a ** b * c % d`) va manfiy sonli (`-a // b`, `-a % b`) —
  Pythonda `//` pastga yumalaydi, `%` manfiy boʻlmaydi. Manfiy shakllar faqat oxirgi zinada.
- **3-bosqich (kod yozish) 4 → 8:** `orta-raqam` (`n // 10 % 10`), `tosh-bolish` (toshdan bola koʻp boʻlgan holat
  bilan), `sekund` (soat : daqiqa : sekund — `n % 3600 // 60`), `yuzlik` (oxirgi ikki raqamni ajratish).
  «Xatoni tuzat» da ham sonlar zina bilan kattalashadi.
- Testlar: 10 → 12.

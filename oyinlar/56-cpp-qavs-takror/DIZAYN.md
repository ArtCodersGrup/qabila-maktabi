# 56-oʻyin — «C++: qavs va takror»

C++ blokining uchinchi oʻyini (mavzular 5–6: shart va sikl). Blok rejasi:
[`../umumiy/CPP-BLOK.md`](../umumiy/CPP-BLOK.md).

- **Yosh:** 12–16, 💻. Oldin: «C++: tur va chegara».
- Bola kod **oʻqiydi va yozadi** — yadro (`umumiy/js/cpp/`) ishlaydi.

## Nega bu oʻyin kerak

Pythonda blokni otstup belgilaydi va boshqa yoʻl yoʻq. C++ da esa **otstup hech narsa anglatmaydi**:
blokni faqat `{ }` yasaydi. Shu bitta farq bolaga ikkita «koʻrinmas» xato beradi:

1. **Qavssiz `if`** — ichkariga surilgan ikkinchi satr shartga tegishli emas, lekin koʻzga shunday koʻrinadi.
2. **Qavssiz sikl** — xuddi shunday: siklga faqat bitta satr kiradi.

Uchinchi xato — **`=` va `==`**. `if (x = 5)` kompilyatsiya boʻladi, shart doim rost boʻladi va `x`
ham oʻzgarib ketadi. Buni bir marta koʻrish — yuz marta eslatishdan foydali.

## Bosqichlar

**1. Qavs blok yasaydi.** Qavssiz `if` va uning chiqishi; qavs qoʻyilgandagi farq; `=` va `==`.
Mashqlar: «nima chiqaradi» (javob klaviaturada).

**2. Sikl.** `for` ning uch qismi (boshi, sharti, qadami), teskari yurish, yigʻib borish naqshi.
Mashqlar: siklning chiqishini aytish, yigʻindi/koʻpaytma/sanoqni hisoblash.

**3. Xato va yechim.** Siklning toʻrt mashhur xatosi (toʻxtamaydigan sikl, ortiqcha `;`,
`i < n` oʻrniga `i <= n`, qavssiz tana) — bola xatoni nomlaydi; keyin **oʻz dasturini yozadi**
(yigʻindi, eng katta, juftlar soni, koʻpaytirish jadvali).

## Qarorlar

- **Har «xato» savoli haqiqiy xato**: test har dasturni yadroda ishga tushirib, u haqiqatan
  notoʻgʻri ishlashini tekshiradi (toʻxtamaydigan sikl — qadam chegarasiga uriladi, `;` li sikl —
  `i` tanilmay qoladi, va hokazo).
- **«Eng katta» mashqining sinovida manfiy sonlar bor** — `int eng = 0;` deb boshlagan yechim
  oʻtmaydi. Bu ataylab: olimpiadada shu xato juda koʻp uchraydi (test buni qulflagan).
- **«Yigʻindi» mashqi `i < n` bilan oʻtmaydi** — bir marta kam aylanish xatosi ham tutiladi.

## Fayllar

- `js/logic.js` — qavs/tenglik misollari, uch xil sikl, yigʻish naqshlari, 4 ta xato, 4 ta yozish mashqi.
- `tests/logic.test.js` — 11 test (1200 ta hosil qilingan misol yadro bilan solishtirildi).

## 2026-10-02 qiyinlik yangilanishi

Sabab: hisobot-5 (C jadvali) — «xatoni top» da 4 ta qotirilgan dastur (variantlar ham shu toʻrttasi), yozish 4 ta edi.

- **1-bosqich:** oxirgi zinada **«osilgan else»** — qavssiz ichma-ich `if` da `else` eng yaqin (ichki) `if` ga tegishli;
  otstup uni tashqi `if` ning jufti qilib koʻrsatadi. Uch xil natija; x tashqi shartdan oʻtmasa, hech narsa chiqmaydi.
- **2-bosqich:** sikllar 3 → 6 (`i < b` — oxirgisi kirmaydi; `i -= 3`; `i *= 2`), yigʻish naqshlari 3 → 6
  (toq sonlar yigʻindisi, `continue`, `while (true)` + `break` — sikldan keyingi `i` va `s`).
- **3-bosqich — xatolar 4 → 8:** `i--` (notoʻgʻri tomonga), `s = i` (yigʻish oʻrniga almashtirish), `int s;`
  (boshlangʻich qiymat yoʻq — yadro «uninitialized» deb toʻxtatadi), `while (i = 3)` (shartda tayinlash).
  Har savolda toʻgʻri javob + tasodifiy uchta boshqa xato nomi. Testda har dastur yadroda ishga tushirilib,
  aytilgan xato haqiqatan sodir boʻlishi tekshiriladi.
- **3-bosqich — yozish 4 → 8:** `faktorial`, `raqamlar` (`while`), `tub` (1, 25, 49 sinovda), `ekub`.
  Qoʻpol, lekin toʻgʻri yechimlar ham qabul qilinadi.
- Hamma yangi misol va yechim yadroda ham, haqiqiy `g++` da ham tekshirilgan. Testlar: 11 → 13.

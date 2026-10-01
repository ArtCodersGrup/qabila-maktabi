# 55-oʻyin — «C++: tur va chegara»

C++ blokining ikkinchi oʻyini (mavzular 3–4: tiplar, `long long`, toshib ketish, boʻlish).
Blok rejasi: [`../umumiy/CPP-BLOK.md`](../umumiy/CPP-BLOK.md).

- **Yosh:** 12–16, 💻. Oldin: «C++: birinchi dastur».
- **Bu oʻyinda kod ishlaydi:** yadro (`umumiy/js/cpp/`) tayyor, shuning uchun 3-bosqichda bola
  oʻz dasturini yozadi va ishga tushiradi.

## Nega aynan shu mavzu ikkinchi oʻrinda

Olimpiadada eng koʻp uchraydigan xato — **toshib ketish**: yechim toʻgʻri, algoritm toʻgʻri,
lekin `int` ishlatilgani uchun javob notoʻgʻri. Bu xatoning yomoni — **dastur xato bermaydi**:
u ishlaydi, javob chiqaradi, javob esa jim buziladi. Shuning uchun bu mavzu nazariya emas,
**koʻrsatiladi**: bola qirqilgan sonni oʻz koʻzi bilan koʻradi.

Ikkinchi tuzoq — **butun boʻlish**. Pythonda `/` doim kasr, `//` butun. C++ da esa `/` ning
maʼnosi operandlarga bogʻliq. `7 / 2 = 3` bolani qiynaydigan birinchi narsa.

## Bosqichlar

**1. Son cheksiz emas.** `int a = 2000000000; cout << a + a;` → `-294967296`.
Turlar jadvali (`int`, `long long`, `double` — chegaralari va qachon olinishi). Shu hisob
`long long` bilan toʻgʻri chiqishi. Mashqlar: «nima chiqadi» (toʻrt variant, biri «xato beradi» —
eng keng tarqalgan yanglish tasavvur) va `long long` bilan hisoblash.

**2. Boʻlish tuzogʻi.** `7 / 2` va `7 / 2.0`; manfiy sonlarda Python bilan farq
(`-7 / 2 = -3`, `-7 % 3 = -1`); `int a = 2.9;` → `2` (kesiladi, yaxlitlanmaydi).
Mashqlar: javobni klaviaturada yozish.

**3. Qaysi tur kerak.** Masala sharti beriladi (chegaralari bilan), bola turni tanlaydi;
keyin shu turni ishlatib **kod yozadi**. Yozgan kodi katta sonlar bilan sinaladi —
`int` bilan yozsa, sinovdan oʻtmaydi.

## Qarorlar

- **«Xato beradi va toʻxtaydi» varianti har savolda bor.** Bola koʻpincha shunday deb oʻylaydi;
  notoʻgʻri ekanini koʻrish — mavzuning yarmi.
- **Yozish mashqi aynan turni tekshiradi:** `yigindi` masalasining sinovida uchta 2·10⁹ beriladi.
  `int` bilan yozilgan yechim 6 000 000 000 oʻrniga boshqa son chiqaradi va qabul qilinmaydi.
  Test buni qulflagan (`int bilan o'tib ketdi` — sinov nomi).
- **Hamma son BigInt bilan hisoblanadi** (`int32`, `int64`), keyin g++ bilan solishtiriladi.
- **Oʻrtacha masalasi `double` ni oʻrgatadi:** `(a + b) / 2` butun boʻlsa, 7 va 8 uchun 7 chiqadi.

## Fayllar

- `js/logic.js` — chegaralar, toshish misollari, boʻlish tuzoqlari, 8 ta masala sharti, 3 ta yozish mashqi.
- `tests/logic.test.js` — 11 test (har misol yadro bilan solishtiriladi).
- Chiqishlar `umumiy/tests/cpp-parity.test.js` orqali haqiqiy `g++` bilan ham tekshiriladi.

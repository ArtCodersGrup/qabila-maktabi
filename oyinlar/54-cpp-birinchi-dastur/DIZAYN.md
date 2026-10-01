# 54-oʻyin — «C++: birinchi dastur»

C++ blokining birinchi oʻyini. Blok rejasi: [`../umumiy/CPP-BLOK.md`](../umumiy/CPP-BLOK.md),
mavzular 1–2 (dastur qolipi va chiqish, kirish).

- **Yosh:** 12–16, 💻 (javob klaviaturada yoziladi).
- **Shart:** Python bloki (27–34) oʻtilgan boʻlsin — har bosqich Python bilan solishtiradi.
- **Muallif qarori (2026-10-01):** 3-yoʻl — «aralash». Bu oʻyin **1-qadam**: kod ishga tushmaydi,
  bola oʻqiydi va natijani aytadi. Yadro qoʻshilgach, «kod yoz» mashqlari ustiga qoʻshiladi.

## Nega oʻqishdan boshlanadi

Olimpiada tili C++ ekani — qaror, lekin bola uchun bu birinchi navbatda **begona koʻrinish**:
sakkiz satrlik qolip, nuqtali vergullar, qavslar. Shuning uchun birinchi oʻyin bitta ish qiladi:
**qolipni tanish va oʻqiy olish**. Kod yozish — keyingi qadam.

Pedagogik tayanch: har bosqich Pythonda **boʻlmagan** narsani beradi.

| Bosqich | Pythonda boʻlmagan narsa |
|---|---|
| 1. Qolip va chiqish | kompilyatsiya (xato ishdan **oldin**), `;`, `{ }`, `cout` yangi satr qoʻshmaydi |
| 2. Oʻzgaruvchi va kirish | tur **oldin** aytiladi; `cin` turini bilgani uchun `int()` kerak emas |
| 3. Python ↔ C++ | bir xil fikr, boshqa yozuv; aralashtirib yuborish xatosi |

## Halollik: chiqish qayerdan olingan

Oʻyinda C++ talqinchisi yoʻq. Har misolning chiqishi `js/logic.js` da hisoblanadi — yaʼni
**yozib qoʻyilgan**. Shu yozuv rost boʻlishi uchun:

- `oyinlar/umumiy/tests/cpp-parity.test.js` har misolni **haqiqiy `g++`** bilan kompilyatsiya qiladi,
  ishga tushiradi va chiqishni solishtiradi (kompilyator boʻlmagan mashinada test oʻtkazib yuboriladi);
- 1-bosqichdagi kompilyator xabari ham haqiqiy: u `g++` (Apple clang 21) chiqarganidan koʻchirilgan.

Shu bilan «talqinchi yarim ishlasa, bola yolgʻon natija koʻradi» xatari yoʻqoladi: biz hech narsani
taqlid qilmaymiz, faqat rost natijani koʻrsatamiz.

## Bosqichlar

**1. Qolip va chiqish.** Birinchi dastur va uning chiqishi; qolipning har satri nima qilishi;
uchta `cout` bitta satr chiqarishi; nuqtali vergul tushib qolgan dastur va `g++` ning xabari.
Mashqlar: «nima chiqaradi» (javob klaviaturada), «nimasi yetishmayapti», «bu satr nima qiladi».

**2. Oʻzgaruvchi va kirish.** `int/string/double`, hisob va matn farqi, `cin >> a >> b;`.
Mashqlar: toʻgʻri eʼlonni tanlash, berilgan maʼlumot bilan chiqishni aytish.

**3. Python ↔ C++.** Bir xil dastur ikki tilda, bir xil chiqish; sintaksis kartasi.
Mashqlar: Python satriga mos C++ satri; C++ dasturga kirib qolgan Python satrini topish.

## Qarorlar

- **Qolip har safar toʻliq koʻrsatiladi** (`#include`, `using namespace std;`, `main`, `return 0;`).
  Qisqartirilgan koʻrinish (`bits/stdc++.h`) olimpiada odati sifatida blok oxirida eslatiladi.
- **`string` ishlatilgan dasturga `#include <string>` qoʻshiladi** — `<iostream>` orqali ishlashiga
  tayanmaymiz: bola kodni boshqa kompilyatorga koʻchirsa ham ishlashi kerak.
- **Javob klaviaturada yoziladi** (tanlov emas): chiqishni aynan yozish — oʻqiganini tekshirishning
  eng halol usuli. Shuning uchun oʻyinda 💻 belgisi bor.
- **Umumiy qatlam** (`umumiy/js/cpp.js`, `cpp-ui.js`, `css/cpp.css`) shu yerda tugʻiladi, chunki
  blokdagi toʻrt oʻyin ham shuni ishlatadi: qolip, sintaksis kartasi, kodni boʻyash, chiqish paneli.

## Fayllar

- `js/logic.js` — misollar va ularning chiqishi, mashq savollari.
- `js/scenes/*.js` — sahnalar; umumiy ekran qismlari `umumiy/js/cpp-ui.js` da.
- `tests/logic.test.js` — 14 test; `umumiy/tests/cpp-parity.test.js` — `g++` bilan solishtirish.

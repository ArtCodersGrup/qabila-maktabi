# 41-oʻyin — «Tanlov daraxti»

Kombinatorika blokining birinchi oʻyini: **koʻpaytirish** va **qoʻshish** qoidasi.

- **Yosh:** 12–16. 💻 Kompyuter uchun (3-bosqichda kod yoziladi).
- **Oldin oʻtilgan:** Python bloki (27–34), 32-oʻyin — ichma-ich sikl.
- **Tartib:** avval daraxt chiziladi va variantlar sanaladi, keyin formula (QOIDALAR §4.1).

## Asosiy fikr

Bolaning eng koʻp qiladigan xatosi — **hamma yerda koʻpaytirish**. Shuning uchun blokning
birinchi oʻyini «qaysi qoida?» degan savolga ajratiladi:

| Holat | Qoida | Misol |
| --- | --- | --- |
| Ikkala tanlov ham qilinadi (**VA**) | koʻpaytiriladi | 3 ta koʻylak **va** 2 ta shim → 3 × 2 = 6 |
| Faqat bittasi tanlanadi (**YOKI**) | qoʻshiladi | 3 ta avtobus **yoki** 2 ta piyoda yoʻl → 3 + 2 = 5 |

Bir xil sonlar, ikki xil javob — shu ikki karta yonma-yon koʻrsatiladi.

Mantiqda har holat uchun **variantlar roʻyxati** ham bor (`umumiy/js/sanash.js`, `variantlar()`),
va test roʻyxat uzunligi formulaga teng ekanini tekshiradi: formula roʻyxatni sanaydi, aksincha emas.

## Bosqichlar

**1. Koʻpaytirish qoidasi.** Daraxt shox-shox boʻlib oʻsadi (3 ta koʻylak, har biriga 2 ta shim),
barglar sanab boriladi: 2 → 4 → 6. Soʻng hamma variant roʻyxati chiqadi — bittasi ham tushib qolmadi.
Uchinchi qadam qoʻshiladi (bayroq: rang × shakl × chekka = 12): daraxt chizishning hojati yoʻq.
Mashq: koʻpaytirish savollari (tanga 5 marta tashlandi, 4 xonali kod va h.k.).

**2. VA va YOKI.** Ikki karta yonma-yon. Mashqda savollar aralash keladi va bola avval qoidani
tanlashi kerak; xato qilsa, ishora «ikkala tanlov ham qilinadimi?» deb soʻraydi. Har savolning
«notoʻgʻri qoida» javobi ham hisoblangan (`task.xato`) — ikkalasi teng chiqadigan savollar
(2 + 2 = 2 × 2) umuman berilmaydi.

**3. Formula va dastur.** Ichma-ich sikl hamma juftlikni sanaydi — formula bilan bir xil javob
chiqadi. Mashq aralash: kodni oʻqish (natija) va kod yozish (`sana(a, b)`, `sana3(a, b, c)` —
koʻpaytirmasdan, sikl bilan sanash).

## Fayllar

- `js/logic.js` — daraxtlar, savollar, kod masalalari. Hisob `umumiy/js/sanash.js` da (BigInt).
- `js/scenes/common.js` — daraxt (HTML, SVG emas — QOIDALAR §6), variantlar roʻyxati, savol ekranlari.
- `tests/logic.test.js` — 10 test; `umumiy/tests/sanash.test.js` — 10 test (formula ↔ roʻyxat).

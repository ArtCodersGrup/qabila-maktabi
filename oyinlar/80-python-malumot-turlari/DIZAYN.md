# Oʻzgaruvchi va maʼlumot turlari — dizayn (qisqa)

**Dars:** IX sinf «Sunʼiy intellekt», 8-mavzu · **Toifa:** yuqori (9–11) · **Qurilma:** kompyuter (💻, `pc: true`; 1-bosqich telefonda ham ishlaydi)
Manba: `docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md`. Qolip: «Ikki yoʻl», «Funksiya ustaxonasi».
Barcha misollar maʼlumot toʻplami haqida: belgi qiymatlari, yorliqlar roʻyxati, oʻlchovlar, aniqlik.

## Oʻquv maqsadlari

Oʻyindan keyin oʻquvchi:

1. Besh turni (int, float, str, bool, list) yozilishidan ajratadi, tuzoqlarni ham: `"36.6"`, `50.0`, `"True"`, `[0.87]`.
2. Amal natijasining turini aytadi: `/` — doim float, `//` — int, solishtirish — bool, matnlarda `+` — ulash.
3. `int()`, `float()`, `str()` bilan turni oʻgiradi; TypeError va ValueError farqini tushuntiradi; «jim» xatoni (`"15" * 2`) topadi.
4. Roʻyxatda indeks (`[0]`, `[-1]`), `len()`, `append()`, element almashtirish, `sum() / len()` ni ishlatadi; IndexError sababini aytadi.
5. Har xil uzunlikdagi roʻyxatda ishlaydigan kod yozadi (qotirilgan indekssiz).

## Bosqichlar

| # | Nom | Koʻrsatish | Mashq (`js/logic.js`) |
|---|---|---|---|
| 1 | Turni aniqla | qadam-baqadam beshta oʻzgaruvchi; besh tur jadvali; `type()`; amal turi | navbat bilan: `typeTask` — 32 shakl (zina 0: 5, 1: 12, 2: 15), 5 variantdan tanlash; `typePrintTask` — 11 shakl (3/4/4), `type()` chiqishi yoziladi |
| 2 | Turni oʻgirish | TypeError, oʻgirish, ValueError, jim xato | navbat bilan: `convTask` (11 shakl, chiqish yoziladi) va `convFixTask` (9 xato turi) |
| 3 | Roʻyxat bilan ishlash | indeks, len, append; IndexError; oʻrtacha | navbat bilan: `listTask` (11 shakl) va `writeTask` (9 masala, zina 0/1/2: 2/3/4) |

**Tur javobi qayerdan olinadi:** `typeOf` — kodni talqinchida ishga tushirib, `print(type(x))` chiqishini oʻqiydi. Bankdagi kutilgan tur
test orqali shu natija bilan solishtiriladi; yechimda ham aynan shu chiqish koʻrsatiladi.

**Yozish tekshiruvi (`checkWrite`):** muharrirda boshlangʻich roʻyxat turadi; tekshiruv uni 3–4 xil (har xil uzunlikdagi)
roʻyxatga almashtirib ishga tushiradi. `yorliqlar[2]` kabi qotirilgan indeks boshqa uzunlikda IndexError beradi.

**Etika/cheklov:** 2-bosqich — notoʻgʻri turdagi maʼlumotda oʻqitilgan model xulosasi ham notoʻgʻri; 3-bosqich — maxfiylik (ism oʻrniga ID).

## Talqinchi cheklovlari

- `type()` va `round()` bor (2026-10-12). `type(x) == int` koʻrinishi ishlamaydi (False) — faqat `type(a) == type(b)` ishlatiladi.
- Roʻyxat metodlari: faqat `append`, `pop` (`count`, `insert`, `remove`, `index` yoʻq) — masalalar shularsiz tuzilgan.

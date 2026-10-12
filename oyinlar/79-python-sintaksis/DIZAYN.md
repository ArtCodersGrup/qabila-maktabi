# Python: sintaksis — dizayn (qisqa)

**Dars:** IX sinf «Sunʼiy intellekt», 7-mavzu · **Toifa:** yuqori (9–11) · **Qurilma:** kompyuter (💻, `pc: true`)
Manba: `docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md`. Qolip: «Ikki yoʻl», «Funksiya ustaxonasi».
Barcha misollar model va maʼlumot haqida: aniqlik, xato, ishonch, sinf yorligʻi.

## Oʻquv maqsadlari

Oʻyindan keyin oʻquvchi:

1. `print` bir nechta qiymatni qanday chiqarishini aytadi (vergul → boʻshliq); matn va son farqini koʻrsatadi (`"46 + 4"` va `46 + 4`, `"9" + "2"`).
2. Izoh (`#`) bajarilmasligini, matn ichidagi `#` esa izoh emasligini biladi.
3. Otstup blokni belgilashini tushuntiradi: surilgan satr `if` ga tegishli, surilmagani doim bajariladi.
4. Xato xabaridan turini (SyntaxError, IndentationError, NameError), satrini va sababini oʻqiydi; «jim» xatoni (`0,92`) kutilgan chiqish bilan solishtirib topadi.
5. Oʻzgaruvchilardan hisoblab chiqaradigan kichik hisobot dasturini yozadi (aniqlik = toʻgʻri / jami, foiz, shartli satr).

## Bosqichlar

| # | Nom | Koʻrsatish | Mashq (`js/logic.js`) |
|---|---|---|---|
| 1 | Natijani ayt | qadam-baqadam `print` + izoh; matn va son; otstup | `printTask` — 14 shakl (zina 0: 4, 1: 5, 2: 5), chiqish yoziladi |
| 2 | Xatoni tuzat | xato xabarini oʻqish; uch xato turi; jim xato | `fixTask` — 3 dastur × 11 buzilish, kutilgan chiqish koʻrsatiladi |
| 3 | Oʻzing yoz | izoh + oʻzgaruvchi + `print` hisoboti | `writeTask` — 9 masala (zina 0/1/2: 3/3/3) |

**Yozish tekshiruvi (`checkWrite`):** `input()` hali oʻtilmagan, shuning uchun muharrirda boshlangʻich satrlar turadi
(`togri = 46`, `jami = 50`). Tekshiruv shu satrlarni 3–4 xil qiymatga almashtirib, kodni har biri bilan ishga tushiradi va
namunali yechim chiqishi bilan solishtiradi — javobni qoʻlda yozib qoʻyish oʻtmaydi. Zina 0 masalalarida chiqish qatʼiy
(aynan shu satrlar) va kodda izoh yoki `*` amali talab qilinadi. Terish xatosi (SyntaxError, IndentationError) urinish sanalmaydi.

**Etika/cheklov:** 2-bosqich — xato xabari yoʻqligi natija toʻgʻri degani emas; qarorga ketadigan hisobot tekshiriladi.

## Talqinchi cheklovlari

`round()` yoʻq — foizlar yaxlitlashsiz toza chiqadigan sonlar bilan olinadi (`UZUN_KASR` filtri va test).
`x = 0,92` (tuple) qoʻllanmaydi — oʻnlik vergul xatosi faqat `print(…, 0,92)` ichida beriladi.

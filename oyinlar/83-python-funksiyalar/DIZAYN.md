# 83 — Funksiyalar: dizayn

**Mavzu:** `def`, parametr, `return`, funksiyani qayta ishlatish · **Sinf:** IX (toifa `yuqori`), 11-dars
**Qurilma:** kompyuter (💻, `pc: true`) · **Reja:** `docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md`

## Oʻquv maqsadlari
Oʻyindan keyin oʻquvchi:
1. `def nom(parametrlar):` … `return natija` koʻrinishidagi funksiyani oʻqiydi va natijasini aytadi.
2. `print` va `return` farqini, `None` qayerdan chiqishini tushuntiradi; argumentlar tartibi muhimligini biladi.
3. Xatoli funksiyani sinov chaqiruvlari yordamida topadi va tuzatadi (chegaradagi holat, manfiy son, bitta element).
4. `ortacha(royxat)`, `aniqlik(togri, jami)`, `masofa(a, b)`, `eng_katta(royxat)` kabi funksiyalarni oʻzi yozadi.
5. Bir funksiyani ikkinchisining ichida ishlatadi (`eng_yaqin` → `masofa`, `ortacha_xato`).
6. Aniqlik soni modelni toʻliq baholamasligini biladi (0.9 — har 10 tadan 1 xato).

## Bosqichlar
| № | Nom | Koʻrsatish | Mashq |
|---|---|---|---|
| 1 | Natijani ayt | qadam-baqadam `aniqlik`, parametr/argument, `print` ≠ `return` | kod berilgan — chiqishini yozadi (`READ`, 17 generator: zina 0/1/2 — 5/6/6) |
| 2 | Funksiyani tuzat | «jim» xato (`None`), bitta sinov yetmasligi | xatoli funksiya muharrirda — tuzatadi (`FIX`, 15 tur: 5/4/6) |
| 3 | Oʻzing yoz | funksiya ichida funksiya, aniqlik haqida ogohlantirish | funksiyani yozadi (`WRITE`, 14 tur: 5/4/5) |

## Tekshiruv
2- va 3-bosqichda matn solishtirilmaydi: oʻquvchi kodidan keyin `print(chaqiruv)` qoʻshiladi va chiqish namunali
yechimniki bilan solishtiriladi (`logic.check`). Har masalada 4–6 chaqiruv, ikkitasi ekranda koʻrinadi, qolgani yashirin;
bir qismi tasodifiy. Terishdagi xato (SyntaxError, otstup, «bu saytda hali yoʻq») urinish sanalmaydi.

## Talqinchi cheklovlari
`round`, `type`, f-satr, standart parametr qiymati, nomli argument, `import` yoʻq — masalalar ularsiz tuzilgan.
Kasr natijalar «dum»siz chiqishi uchun sonlar tanlab olingan (choraklar, 4/5/10/20 ga boʻlish, Pifagor uchliklari).

# 48-oʻyin — «Mantiq kodda»

Mantiq blokining uchinchi oʻyini: `True`/`False`, `and`, `or`, `not` — endi **kodda**.

- **Yosh:** 12–16 (katta toifa). 💻 Kod yoziladi.
- **Oldin oʻtilgan:** «Mantiq kalitlari» va «Zinapoya chirogʻi» (kalitlar va rostlik jadvali),
  «Ikki yoʻl» (Pythonda `if`).

## Nega kerak

24- va 25-oʻyinlarda bola VA/YOKI/EMAS ni **kalitlar** bilan oʻrgandi. Pythonda `if` ni ham
koʻrdi. Shu ikkisi orasida koʻprik yoʻq edi: `and`, `or`, `not` qayerdan chiqqani va
`a and b` nega `True` berishi aytilmagan.

## Asosiy qaror: jadvalni Python hisoblaydi

Rostlik jadvali **qoʻlda yozilmagan** — ekrandagi har qiymat talqinchida `print(a and b)` ni
ishga tushirib olinadi (`logic.jadval()`). Shuning uchun jadval hech qachon kod bilan
ziddiyatga tushmaydi, va test De Morgan qoidasini ham shu yoʻl bilan tekshiradi:
`not (a and b)` va `not a or not b` bir xil ustun berishi kerak.

## Bosqichlar

**1. True va False.** Solishtirish natijasi — son emas, `True`/`False`. `=` va `==` farqi.
Mashq: `print(7 > 3)` nima chiqaradi (javob ikki tugmadan tanlanadi).

**2. and, or, not.** Uch jadval ketma-ket chiqadi. Mashq aralash: ifoda qiymati
(`a` va `b` berilgan holda) va **hayotiy gap** — «kinoga kirish uchun yosh 12 dan katta
boʻlishi VA bilet boʻlishi kerak» → qaysi amal kerak?

**3. Shartni yozish.** `if yosh >= 12 and bilet:` koʻrsatiladi, keyin bola oʻzi yozadi:
`mumkin(yosh, bilet)`, `oraliqda(x)`, `dam(kun)`, `toq(n)`. Testlar **chegaralarni** ushlaydi:
`>` oʻrniga `>=` yozilsa yoki `or` oʻrniga `and` qoʻyilsa — oʻtmaydi.

## Fayllar

- `js/logic.js` — `qiymat()` va `jadval()` (ikkalasi ham Pythonni ishga tushiradi), toʻrt xil savol.
- `tests/logic.test.js` — 10 test: rostlik jadvallari, De Morgan, savol javoblarining
  hisoblanishi, chegara xatolarining rad etilishi.

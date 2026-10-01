# 49 — Tank jangi: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Muallif gʻoyasi — 2026-10-01.

- [x] **1. Dvigatel kengaytmasi** — talqinchiga **tashqi funksiya** qoʻshish imkoni
      (`python.run(kod, { tashqi: {...} })`). `builtins.js` oʻzgarmadi, shuning uchun boshqa
      oʻyinlarga taʼsiri yoʻq. 2 ta test: faqat berilgan ishga tushirishda koʻrinishi,
      oʻzgaruvchi undan ustun turishi, `trace()` da ham ishlashi.
- [x] **2. Jang mantiqi** — `js/jang.js`: maydon, yurish va toʻsiq, oʻq yoʻli, `scan`, `radar`,
      jon/oʻq, robot AI. 14 ta test.
- [x] **3. Vazifalar** — `js/logic.js`: 3 bosqich × 3 vazifa, bir satr = bir navbat
      (satrda koʻpi bilan 8 harakat). 10 ta test, ichida **har jangning yechilishi**.
- [x] **4. Ekran** — chapda maydon (SVG, matnsiz), oʻngda buyruq satri va tarix; jon/oʻq —
      HTML belgilarda. Harakatlar yozuvi animatsiya qilinadi.
- [x] **5. Bosh sahifa va oflayn** — Python bloki ichida (12–16, 💻), ikonka `tank`, `sw.js` (`v71`).
- [x] **6. Tekshiruv** — 24 ta oʻyin testi yashil; brauzerda 1-bosqichning uchala vazifasi
      va posbon bilan jang oʻynab chiqildi, konsol toza.

## Yoʻl-yoʻlakay topilgan xatolar

1. **`move(50)` tankni 253 birlik surib yuborardi** — `yur()` da har qadam yangilangan joydan
   hisoblanardi. Boshlangʻich nuqta eslab qolinadigan boʻldi.
2. **Argument 200 bilan cheklangan edi**, maydon esa 600 birlik — `move(320)` ishlamasdi.
   Chegara maydon oʻlchamiga bogʻlandi.
3. **Jang adolatsiz edi:** ikkalasining joni va koʻrish masofasi teng, robot esa hech qachon
   xato qilmaydi — bola har safar yutqazardi. Bolaga ustunlik berildi: **jon 5**, koʻrish **300**,
   robotniki **220**. Endi «uzoqdan turib ot» strategiyasi ishlaydi.
4. **Robot 8° xato bilan ham «qaradim» deb hisoblardi** — 200 birlikda bu 28 birlik chetga ketadi,
   oʻq tegmaydi va robot abadiy oʻqlanib turardi. Aniqlik 2° ga tushirildi.
5. **Ovchi robot toʻsiqqa tiralib qotib qolardi** — bloklangan harakatdan keyin burilishi qoʻshildi.
6. **Uchinchi vazifa yechib boʻlmasdi** — toʻsiq aynan ikki dushman orasida edi va dushman qayerdaligini
   bilish imkoni yoʻq edi. `radar()` buyrugʻi qoʻshildi va toʻsiq surildi; endi namunali strategiya
   bilan 11 navbatda yutiladi (test buni qulflaydi).

## Qoladi (muallif bilan kelishiladi)

- **Onlayn xona**: oʻqituvchi xona ochadi, bir nechta oʻquvchi oʻz qurilmasida yozadi.
  Infratuzilma tayyor (`umumiy/js/onlayn.js`, togʻ protokoli), lekin navbat tartibi va
  gʻolib shartlari alohida kelishiladi.
- Koʻproq vazifa va murakkabroq robot (masalan, panadan otadigan).

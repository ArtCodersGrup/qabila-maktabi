# «Data science»

IX sinf «Sunʼiy intellekt», 12-dars. Reja: [`docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md`](../../docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md).

- **Toifa:** `yuqori` (9–11), 14–15 yosh. Telefon va kompyuter — faqat bosish va raqam klaviaturasi.
- **Ohang:** «Maqsad: …», aniq atama (inglizchasi qavsda), qahramonsiz — faqat `ui.say/bubble("elder")`.
- **Davomi:** «Maʼlumot tahlili» (oʻrtacha, mediana, diagramma).

## Asosiy fikr

Maʼlumotlar fani — bitta yoʻl: **savol → yigʻish → tozalash → tahlil → xulosa**. Savol oʻlchanadigan boʻlishi kerak;
jadvalda **qator = obyekt, ustun = belgi**; belgi **sonli** yoki **toifali**; tahlildan oldin jadval **tozalanadi**.

## Bosqichlar

### 1. Savol va bosqichlar
Koʻrsatish: «maktab oshxonasidagi navbat» loyihasining besh bosqichini oʻquvchi tartib bilan bosadi; keyin ikki savoldan oʻlchanadiganini tanlaydi.

Mashq (`bosqich1Task`):
- `qadamTask` — loyiha ishi berilgan, 5 variant. tier 0: ish qaysi bosqichga tegishli; tier 1: undan keyingi bosqich; tier 2: undan oldingi bosqich.
- `savolTask` — 4 variant. tier 0: uchta noaniq orasidan oʻlchanadigan savol; tier 1: uchta aniq orasidan noaniq savol; tier 2: savolga qaysi maʼlumot javob beradi.

### 2. Maʼlumot turlari
Koʻrsatish: jadvalda qator raqamini bosadi (obyekt), «Yosh» sarlavhasini bosadi (belgi), qaysi ustunda oʻrtacha maʼnoli ekanini tanlaydi.

Mashq (`bosqich2Task`):
- `turTask` — yasalgan jadval, 4 ustun = 4 variant. tier 0: yagona toifali ustun; tier 1: yagona sonli ustun; tier 2: ikki raqamli «tuzoq» (telefon raqami, shkaf raqami…) orasidan haqiqiy sonli ustun.
- `jadvalTask` — javob son. tier 0: nechta obyekt / nechta belgi; tier 1: nechta sonli / toifali belgi; tier 2: jami qiymatlar soni yoki tuzoqli jadvalda sonli belgilar soni.

### 3. Tozalash
Koʻrsatish: soʻrovnoma jadvalidagi toʻrt xatoni yoʻl-yoʻriq bilan topadi (boʻsh katak, 250 yosh, «toshkent», takror qator).

Mashq (`bosqich3Task`):
- `tozalashTask` — xatolari ekilgan jadval; oʻquvchi xato kataklarni, takror qatorda esa qator raqamini (№) bosadi va «Tekshirish»ni bosadi. tier 0: 2 xato; tier 1: 3 xato (takror bilan); tier 2: 4 xato (hamma turi, nozik qiymatlar, takror qator yonma-yon emas).
- `turiTask` — bitta xato belgilab qoʻyilgan; tier 0–1: xato turi (4 variant); tier 2: qanday tuzatiladi (4 variant).

## Qarorlar

- **Xato turlari toʻrtta:** boʻsh qiymat, takror qator, imkonsiz qiymat, har xil yozuv. Har biri alohida qatorda, shuning uchun javob bir xil tushuniladi.
- **Takror qator:** juftlikdan aynan bittasi belgilanadi (qaysi biri — farqi yoʻq). Ikkalasini belgilash xato: obyekt yoʻqoladi — maslahat shuni aytadi.
- **Har xil yozuv:** toʻgʻri yozuv kamida ikki qatorda qoladi, xato yozuv — bitta (faqat harf kattaligi farq qiladi).
- **Imkonsiz qiymat:** har sonli ustunning `chegara`si bor; xato qiymat undan tashqarida, yasalgan qiymatlar ichida. Sarlavhada oʻlchov birligi yoki shkala yozilgan («Baho (1–5)»).
- **Jadvaldagi toifali ustunlar oʻzaro bogʻliq emas** (masalan, mahsulot turi yoʻq) — «mantiqan gʻalati» qator xato deb oʻylanmasin.
- Jadval keng boʻlsa, faqat oʻz konteynerida gorizontal aylanadi; katak — kamida 48 px.
- Maslahat joyni aytmaydi: nechta xato toʻgʻri belgilangani va ustunlarni qanday oʻqish kerakligi.
- **Etika:** tozalash — xatoni tuzatish, natijaga yoqmagan qatorni oʻchirish emas; kerak boʻlmagan shaxsiy maʼlumot yigʻilmaydi (3-bosqich va yakun).

## Oʻquv maqsadlari

Oʻyindan keyin oʻquvchi:

1. Data science metodologiyasining besh bosqichini tartib bilan aytadi va ishni bosqichiga mos qoʻyadi.
2. Noaniq savolni oʻlchanadigan savoldan ajratadi va savolga kerakli maʼlumotni tanlaydi.
3. Jadvalda obyekt (qator) va belgi (ustun) ni koʻrsatadi, ularni sanaydi.
4. Belgini sonli yoki toifali deb ajratadi; raqamdan iborat toifali belgini (telefon raqami) taniydi.
5. Jadvaldagi boʻsh qiymat, takror qator, imkonsiz qiymat va har xil yozuvni topadi, har birini qanday tuzatishni aytadi.

## Fayllar

- `js/logic.js` — loyihalar banki, jadval maʼlumot toʻplamlari, xato ekish (`xatoliJadval`), tekshiruv (`tekshir`), olti generator `(prev, rng, tier)`.
- `tests/logic.test.js` — har generator har tier da 30 ta har xil misol; javoblar mustaqil qayta hisoblanadi (xatolarni mustaqil qidiruvchi); imlo.
- `js/scenes/` — `common.js` (jadval, mashq ekranlari), `stage1–3.js`, `final.js`; `js/game-art.js` — matnsiz SVG.

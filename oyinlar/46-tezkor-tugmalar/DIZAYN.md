# 46-oʻyin — «Tezkor tugmalar»

Klaviatura blokining ikkinchi oʻyini: `Ctrl + C`, `Ctrl + Z`, `Home`, `Tab` va boshqalar.

- **Yosh:** 8–16 (ikkala toifada ham koʻrinadi). 💻 Klaviatura shart.
- **Oldin oʻtilgan:** «Oʻn barmoq» (yozish texnikasi).

## Nega kerak

Bola matnni koʻchirish uchun uni qayta terib oʻtiradi. Ikki tugma shu ishni bir soniyada qiladi.
Bu bilim butun umr ishlaydi — qaysi dastur boʻlishidan qatʼi nazar.

## Bosqichlar

**1. Nusxa olish uchligi.** `Ctrl + C`, `Ctrl + V`, `Ctrl + X`, keyin `Ctrl + Z` va `Ctrl + A`.
Harflar inglizcha soʻzdan kelib chiqqani aytiladi (C — copy, V — qoʻyish, X — qaychi).
Mashq: birikma koʻrsatiladi, bola nima qilishini tanlaydi (4 variant).

**2. Yurish va tahrir.** `Tab`, `Enter`, `Home`, `End`; `Backspace` ↔ `Delete` farqi;
`Shift + oʻq` (belgilash) va `Ctrl + oʻq` (soʻz boʻylab). Mashq ikki xil:
oʻxshash ikkitadan toʻgʻrisini tanlash va **tugmalarni haqiqatan bosish** (bosilgani ekranda koʻrinadi).

**3. Amalda.** Haqiqiy matn maydoni: «natija shunday boʻlsin» deb maqsad koʻrsatiladi.
Tekshiruvda **ikkita shart** bor: matn toʻgʻri boʻlsin **va** kerakli tugma bosilgan boʻlsin —
qoʻlda qayta terib qoʻyish hisoblanmaydi. Bosilgan tugmalar ekran ostida chip boʻlib koʻrinib turadi.

## Qarorlar

- **Mac:** `Ctrl` oʻrniga `⌘` bosiladi. Mantiq `metaKey` ni ham `Ctrl` deb qabul qiladi (test bilan qulflangan).
- **`preventDefault`:** 2-bosqichda bosilgan tugma ushlab qolinadi (aks holda `Ctrl + S` saqlash oynasini ochadi).
  3-bosqichda esa **ushlanmaydi** — nusxa olish, qoʻyish va bekor qilishni brauzerning oʻzi bajaradi,
  biz faqat qaysi tugma bosilganini yozib boramiz.
- **Nusxa olish bloklangan qurilma:** baʼzi brauzerda `Ctrl + C/V` ishlamasligi mumkin. Shuning uchun
  3-bosqichdagi 5 ta maqsaddan **3 tasi buferga umuman bogʻliq emas** (`Home`, `Shift + ←`, `Ctrl + Z`) —
  bola qolib ketmaydi. Test shuni tekshiradi.

## Fayllar

- `js/logic.js` — amallar roʻyxati, `belgi(hodisa)` (bosilgan birikma nomi), savollar, maqsadlar.
- `js/scenes/common.js` — tugma qopqoqlari, klaviatura tinglovchisi, toʻrt xil mashq ekrani.
- `tests/logic.test.js` — 12 test: `⌘` ↔ `Ctrl`, variantlarning aralashishi, qaysi bosish yozib
  borilishi, maqsadning ikki shartli tekshiruvi.

## Sinovda tekshirib boʻlmagani

Avtomatik brauzerda tizim buferi yopiq (yalangʻoch `textarea` da ham `Ctrl + C` ishlamadi), shuning uchun
**«ikki marta» va «ikki qator» maqsadlari qoʻlda sinaladi** — haqiqiy kompyuterda. Qolgan uchtasi
avtomatik tekshirildi va oʻtdi.

## 2026-10-02 qiyinlik yangilanishi
- 1-bosqich: 3-javobdan boshlab faqat nusxa olish tugmalari emas — barcha birikmalar aralash soʻraladi.
- 2-bosqich: «farq» savoli 2 → 4 variant (adashtiradigan juftlik + 2 ta boshqa). 3-javobdan boshlab variant tanlanmaydi — bola toʻgʻri birikmani klaviaturada **oʻzi bosadi**. Juftliklar 6 → 12.
- 3-bosqich: 4 ta yangi maqsad (End bilan qoʻshish, Home + Delete, Ctrl + ← bilan soʻz-soʻz yurish, kesib-qoʻyib soʻzlar oʻrnini almashtirish). Oxirgi javoblarda (tier 2) faqat koʻp tugmali maqsadlar.

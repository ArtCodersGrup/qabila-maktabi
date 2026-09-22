# Tog'ga chiqish (onlayn musobaqa): dizayn

**Nima:** birinchi onlayn musobaqa. Bitta xonada **2–12 ta o'yinchi**, har kim o'z qurilmasida. Savolga to'g'ri javob — bir pog'ona yuqoriga. Qolib ketgan yutqazadi, birinchi bo'lib cho'qqiga chiqqan yutadi.
**Yosh:** 8–12.
**Qayerda:** bosh sahifa → Musobaqalar → **Onlayn** → "Tog'ga chiqish" (papka `oyinlar/tog/`).
**Holati:** dizayn — muallif ko'rib chiqishini kutmoqda (2026-09-22). Kod yozilmagan (muallif: "code o'tmay tur").
**Bog'liqlik:** onlayn qatlam (`umumiy/js/onlayn.js`, Supabase Realtime) — 0-bosqich tugashi kerak: Supabase loyihasi hali yaratilmagan.

---

## 1. Muallif bilan kelishilgan

1. **Xona:** bitta qurilma xona ochadi, qolganlar 4 xonali kod bilan kiradi. Ko'pi bilan **12 ta o'yinchi**.
2. **Qahramon:** har bir o'yinchi qahramonchalardan birini tanlaydi.
3. **Tog':** **pog'onalar** (15 / 20 / 30 — o'qituvchi tanlaydi, 2.10). Pastda **oqsoqol** turadi, cho'qqida **shogird** kutib turadi. O'yinchi yuqoriga chiqqan sari ekran ham ko'tariladi va oqsoqol pastda ko'rinmay qoladi.
4. **Savollar:** har kimga o'z savoli chiqadi, javob bergach yangisi keladi. **To'g'ri** — bir pog'ona yuqoriga.
5. **Xato — pastga tushish yo'q, pauza:** o'sha o'yinchining o'zida 10 yoki 20 soniyalik pauza. Ekranda "To'g'ri javob: … Tepaga chiqa olmading — kut" va orqaga sanayotgan taymer. Keyin yangi savol.
6. **Qolib ketish:** birinchi o'rindagidan **4 pog'ona** orqada qolgan o'yinchi yutqazadi. Boshqalar yechib o'tib ketaveradi.
7. **Umumiy vaqt:** masalan, **10 daqiqa**. Hech kim cho'qqiga chiqa olmasa, **eng balandda turganlar** g'olib.
8. **G'alaba:**
   - **hamma pog'onani bosib o'tsa** (masalan, 15 ta to'g'ri javob) — cho'qqi, g'olib;
   - yoki bitta o'yinchi **ikkinchi o'rindagidan ham 4 pog'ona** o'zib ketsa — darhol g'olib (qolganlarning hammasi qolib ketgan bo'ladi).

**2026-09-22 da muallif tasdiqladi** (pastdagi takliflarim):
9. Qolib ketish qoidasi **yarim yo'ldan keyin** ishlaydi (2.1) — aks holda o'yin yarim daqiqada tugaydi.
10. Tog' **qiyinlashib boradi** (2.2).
11. Xato — 10 soniya, ketma-ket ikkinchi xato — 20 soniya; pauzada **to'g'ri javob ko'rsatiladi** (2.3).
12. Xonani **o'qituvchi ochadi va o'zi o'ynamaydi**; hisob-kitob uning qurilmasida (2.4).
13. Qahramonlar — **12 ta hayvon**, ism so'ralmaydi, bitta qahramon bitta kishiga (2.7).
14. Har kimga **boshqa sonli** savol (2.6). Teng holatda o'sha pog'onaga birinchi chiqqani oldinda (2.8). Uzilish qoidalari (2.9).
15. **Chiqib ketgan bola muxlis bo'ladi** — mexanikasi 2.5 da (muallif fikri bilan kengaytirildi).

## 2. Men taklif qilganlar (tasdiqlash kerak)

### 2.1. Birinchi daqiqada hamma chiqib ketmasligi uchun
**Muammo:** 4 pog'ona — atigi 4 ta savol. Tez bola 1 ta savolga ~8 soniya sarflasa, 4 pog'onaga ~30 soniyada chiqadi. Birinchi savolni hali o'qiyotgan bolalar esa 0 da turadi. Qoida darhol ishlasa, **o'yin 30 soniyada tugaydi**: bitta g'olib, qolganlar o'ynamay qoladi.
**Qaror (muallif tasdiqladi):** qolib ketish qoidasi **yetakchi yarim yo'lni bosib o'tgandan keyin** ishlaydi (15 pog'onada — 8-pog'ona, 20 da — 10, 30 da — 15). Pastki yarmida hamma bemalol chiqadi, keyin poyga jiddiylashadi.
Bu va boshqa sonlar (4 pog'ona, 15 pog'ona, 10 daqiqa, pauza) kodda **bitta joyda** turadi — sinfda sinab ko'rib, oson o'zgartiriladi.

### 2.2. Tog' qiyinlashib boradi
- 1–5-pog'ona — **Oson**
- 6–10-pog'ona — **O'rta**
- 11–15-pog'ona — **Qiyin**

Qiyin savol ko'proq vaqt oladi, shuning uchun yetakchi tepada sekinlashadi, orqadagilar yetib olish imkoniga ega bo'ladi. Bu muallifning "boshidan qiyinga tomon" fikriga ham mos.

### 2.3. Pauza
- Birinchi xato — **10 soniya**. Ketma-ket ikkinchi xato — **20 soniya**.
- Tavakkal bosishdan saqlaydi: variantli savolda tasodifiy bosgan bola ko'p vaqt yo'qotadi.
- Pauza paytida **to'g'ri javob ko'rsatiladi** — bola kutish vaqtida o'rganib oladi. Savol-javob musobaqasidan farqi: u yerda ikkinchi o'yinchi xuddi shu turdagi savolni olgani uchun to'g'ri javob yashirilgan. Bu yerda har kimning savoli va sonlari boshqa.

### 2.4. Xonani o'qituvchi ochadi
- **O'qituvchi qurilmasi** (proyektor yoki katta ekran): xona kodi, kim kirgani, butun tog' va hamma qahramonlar, taymer. O'qituvchi mavzularni tanlaydi, "Boshlash", "Pauza" va "Tugatish" tugmalarini boshqaradi. **O'zi o'ynamaydi.**
- **Bolalar qurilmasi** (telefon yoki kompyuter): kod → qahramon tanlash → kutish → o'yin.
- Sababi: xonani ochgan bola chiqib ketsa, hammaning o'yini to'xtaydi. O'qituvchi qurilmasi esa butun o'yinni "ushlab turadi" (2.8).

### 2.5. Muxlis (chiqib ketgan bola nima qiladi)
**Muallif fikri (2026-09-22):** chiqib ketgan bola hali chiqib ketmagan **bitta o'yinchining muxlisi** bo'ladi: uning savollarini ko'radi va kuzatadi, o'sha o'yinchining yonida **sharpa** (xira qahramon) bo'lib, qo'lida bayroqcha bilan ko'rinadi. **Muxlislik majburiy emas** — xohlamagan bola shunchaki tog'ni kuzatadi.

**Qanday qilamiz (mening taklifim):** muxlis o'zi javob beradi, lekin **boshqa sonlar bilan**:
- Muxlis do'stining savoli bilan **bir xil turdagi**, lekin boshqa sonli savolni oladi.
- To'g'ri javob bersa, uning sharpasi do'stining yonida bir pog'ona ko'tariladi. Bu do'stining o'rniga **ta'sir qilmaydi** — sharpa poygadan tashqarida.
- Sharpa do'stidan o'zib ketsa: "Sen do'stingdan tez topding!" degan yozuv chiqadi, bayroqcha yonadi.
- **Nega boshqa sonlar bilan:** muxlis do'stining aynan savolini ko'rsa, sinfda yonidan javobni aytib yuboradi. Bunda esa u ham o'ynaydi, ham hech kimga yordam bera olmaydi.

**Muxlis ekranida:** tepada do'stining qahramoni va pog'onasi, pastda o'zining savoli va sharpasi. "Boshqa do'stga o'tish" va "Faqat kuzatish" tugmalari bor.

**Bayroqcha (qo'llab-quvvatlash):** muxlis "🚩 Bo'l!" tugmasini bosadi — do'stining ekranida bayroqcha bir lahza silkinadi. 10 soniyada bir marta bosiladi, shunda chalg'itmaydi. Yozuv yuborish yo'q, faqat bayroqcha.

### 2.6. Ko'chirib bo'lmaydi
Sinfda hamma yonma-yon o'tiradi. Har kimga **boshqa sonli** savol beriladi: musobaqadagi `savollar.js` har kim uchun alohida yasaydi, hamma savollar esa bir xil mavzu va qiyinlikdan.

### 2.7. Qahramonlar — 12 ta hayvon
**Tulki, Burgut, Tog' echkisi, Ayiq, Irbis, Bo'ri, Quyon, Boyqush, Kiyik, Olmaxon, Tipratikan, Lochin** — har biri o'z rangida.
- Bitta qahramonni ikki kishi tanlay olmaydi: band bo'lgani xira ko'rinadi.
- **Ism so'ralmaydi.** Bola qahramon nomi bilan ko'rinadi ("Irbis 11-pog'onada").

### 2.8. G'olib aniqlanmasa va teng bo'lsa
- 10 daqiqa tugaganda bir xil balandlikda turganlar orasida o'sha pog'onaga **birinchi chiqqani** oldinda turadi.
- Shoxsupada 1-, 2-, 3-o'rin.

### 2.9. Uzilish
- Internet uzilgan bola joyida qotib turadi.
- **30 soniya ichida** o'sha kod bilan qaytib kirsa, qahramoni va pog'onasi saqlangan bo'ladi.
- Qaytmasa, chiqib ketgan hisoblanadi.
- O'qituvchi qurilmasi uzilsa, o'yin hamma uchun **pauza** bo'ladi va u qaytgach davom etadi.

### 2.10. Tog' balandligi (pog'onalar soni)
**Muallif so'radi:** 15 ta emas, 30 ta qilaylikmi?

Hisob: bitta savol bolaga taxminan **8–15 soniya** oladi (o'qish + javob), xatolarda pauza ham qo'shiladi.

| Balandlik | Tez bola yetib boradi | Sekinroq bola |
|---|---|---|
| 15 pog'ona | ~2,5 daqiqa | ~4 daqiqa |
| 20 pog'ona | ~3,5 daqiqa | ~5 daqiqa |
| 30 pog'ona | ~5 daqiqa | 10 daqiqada yetib bormaydi |

**Taklif:** balandlik — **o'qituvchi sozlamasi**: 15 (qisqa) / 20 / 30 (uzun), boshida **20** turadi. 45 daqiqalik darsda 3–4 marta o'ynab, orada gaplashish uchun bitta o'yin 4–5 daqiqa bo'lgani ma'qul.

30 pog'ona tanlansa, qolgan sonlar ham o'zgaradi:
- qolib ketish chegarasi 4 emas, **6 pog'ona** (30 ta pog'onada 4 juda kichik — tez-tez chiqib ketiladi);
- qoida 15-pog'onadan boshlab ishlaydi;
- qiyinlik: 1–10 Oson, 11–20 O'rta, 21–30 Qiyin.

Ekranda har doim **8 pog'ona atrofi** ko'rinadi (bolaning o'zi o'rtada), shuning uchun tog' baland bo'lsa ham pog'onalar kichrayib ketmaydi.

## 3. Ekranlar

### 3.1. O'qituvchi (katta ekran)
```
┌────────────────────────────────────────────┐
│ Xona kodi: 4827          ⏱ 07:42   ⏸  ⏹    │
│                                            │
│   ⛰ 15  shogird                            │
│   14 ─────────────                         │
│   13 ── 🦊 Tulki                           │
│   12 ── 🐐 Echki  🦅 Burgut                │
│   ...                                      │
│    8 ── ⚠️ chegara: yetakchidan 4 past     │
│   ...                                      │
│    0 ── 🧓 oqsoqol                         │
│  "Burgut 12-pog'onaga chiqdi!"             │
└────────────────────────────────────────────┘
```
- Kutish xonasi: kod katta harflarda, kirganlar qahramonlari bilan (12 tagacha), "Boshlash" (kamida 2 o'yinchi bo'lsa).
- Sozlash: mavzular (musobaqadagi 7 mavzu), vaqt (5 / 10 / 15 daqiqa).

### 3.2. Bola (telefon — tik ekran)
- **Tepada:** tog'ning o'zi turgan qismi — o'zi va yaqinidagilar, cho'qqigacha qancha qolgani ("Yana 4 pog'ona").
- **O'rtada:** savol.
- **Pastda:** javob tugmalari yoki raqam klaviaturasi (musobaqadagidek).
- **Pauza:** savol o'rnida "↻ Xato. To'g'ri javob: 56. Tepaga chiqa olmading — kut: 0:09" va taymer.
- **Chiqib ketdi:** "Qolib ketding — endi muxlissan" va tog'ni kuzatish.
- **Oxiri:** shoxsupa va o'zining natijasi: pog'ona, to'g'ri va xato javoblar soni.

## 4. Ovoz
Har pog'onada qadam ovozi. Xato — yumshoq "retry" (qo'rqituvchi emas, QOIDALAR 4.4). Kimdir chiqib ketsa — past "dum". G'olib — tantana. Ovozni o'chirish tugmasi — hamma sahifalardagidek.

## 5. Texnik tuzilish (Supabase Realtime)

- **Kanal:** `xona:tog:<kod>`. **Presence** — kim ulangan: `{ rol: "host" | "player", qahramon }`.
- **Hisob-kitob o'qituvchi qurilmasida.** U pog'onalarni, chiqib ketganlarni va g'olibni hisoblaydi hamda holatni hammaga yuboradi. Bolalar qurilmasi faqat "to'g'ri" yoki "xato" deb xabar beradi.
- **Xabarlar** (erkin matn yo'q, `onlayn.validMessage` bilan tekshiriladi):

| Kimdan | Turi | Ma'lumot |
|---|---|---|
| bola | `kirish` | qahramon |
| bola | `javob` | to'g'rimi (ha/yo'q) |
| o'qituvchi | `holat` | har kimning pog'onasi, pauzada / chiqib ketdi, qolgan vaqt |
| o'qituvchi | `boshla` / `pauza` / `tugadi` | sozlamalar (mavzular, vaqt) va g'oliblar |

- **Hajm:** 12 bola har 5–10 soniyada bitta javob va har o'zgarishda holat — sekundiga bir necha xabar. Bepul tarifda sekundiga 100 ta xabar mumkin, bemalol yetadi.
- **Savollar** bolaning o'z qurilmasida `musobaqa/js/savollar.js` dan yasaladi (tayyor 7 mavzu × 3 qiyinlik), qiyinlik pog'onaga qarab tanlanadi.
- **Sonlar** — bitta joyda: 15 pog'ona, 4 pog'ona chegara, qoida 8-pog'onadan, 10 daqiqa, 10/20 soniya pauza, 12 o'yinchi.

## 6. Tekshiruv
- Hisob (kim oldinda, kim chiqib ketdi, g'olib, teng holat) — alohida sof faylda, Node testlari bilan.
- **Robot o'yinchilar:** sinov uchun 12 ta "robot" turli tezlikda va turli xato bilan javob beradi. Ular bilan qoidalarni sinfdan oldin tekshiraman: o'yin necha daqiqa davom etadi, qachon kim chiqib ketadi.
- Brauzerda: bitta o'qituvchi va bir nechta bola oynasi, haqiqiy Supabase orqali.

## 7. Qo'shimcha g'oyalar (keyingi versiyalar uchun, hozir kirmaydi)
1. **Robotlar bilan mashq** — internetsiz, bitta qurilmada: bola 3–5 ta robot bilan tog'ga chiqadi. Robotlar sinov uchun baribir yoziladi.
2. **O'qituvchi hisoboti** — o'yin oxirida qaysi mavzuda ko'p xato qilinganini ko'rsatadi, qaysi mavzuni takrorlash kerakligini bilish uchun.
3. **Seriya bonusi** — ketma-ket 5 ta to'g'ri javob uchun "arqon" (+1 pog'ona). Kuchli bolani yanada kuchaytirib yuboradi, shuning uchun ehtiyot bo'lish kerak.
4. **Jamoalar** — 2 ta jamoa, har jamoaning o'rtacha balandligi hisoblanadi.
5. **Boshqa tog'lar** — har mavzu uchun o'z tog'i va manzarasi (Chimyon, Pomir …).

## 8. Bu versiyaga kirmaydi
Ism va login, chat, reyting jadvali (kunlik yoki umumiy), 12 dan ko'p o'yinchi, bir vaqtda bir nechta xona uchun bitta o'qituvchi ekrani.

## 9. Ochiq savollar (muallifga)

1. **Muxlis:** do'stining aynan savolini ko'rsinmi yoki bir xil turdagi, boshqa sonli savolni (2.5 dagi taklifim)?
2. **Balandlik:** o'qituvchi tanlaydigan qilaylikmi (15 / 20 / 30, boshida 20)?
3. **Chiqarib yuborish:** o'qituvchida "o'yinchini chiqarib yuborish" tugmasi bo'lsinmi? Kod tarqalib ketsa yoki begona kirsa kerak bo'ladi.
4. **Kech qolganlar:** o'yin boshlangandan keyin kirgan bola faqat muxlis bo'lsinmi?
5. **Bayroqcha:** muxlisning "🚩 Bo'l!" tugmasi 10 soniyada bir marta bosilsinmi?

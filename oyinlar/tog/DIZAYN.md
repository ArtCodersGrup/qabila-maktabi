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
15. **Chiqib ketgan bola — oddiy tomoshabin** (2.5). Muxlislik, sharpa va bayroqcha g'oyalaridan voz kechildi.
16. **Tog'larning nomi bor, nomiga qarab balandligi o'zgaradi** (2.10): Chimyon 15, Hazrati Sulton 20, Pomir 25, Himolay 30 pog'ona.
17. **O'qituvchi o'yinchini chiqarib yuborishi mumkin**; o'yin boshlangach kirgan bola faqat kutadi (2.9).

## 2. Tafsilotlar (hammasi muallif bilan kelishilgan, 2026-09-22)

### 2.1. Birinchi daqiqada hamma chiqib ketmasligi uchun
**Muammo:** 4 pog'ona — atigi 4 ta savol. Tez bola 1 ta savolga ~8 soniya sarflasa, 4 pog'onaga ~30 soniyada chiqadi. Birinchi savolni hali o'qiyotgan bolalar esa 0 da turadi. Qoida darhol ishlasa, **o'yin 30 soniyada tugaydi**: bitta g'olib, qolganlar o'ynamay qoladi.
**Qaror (muallif tasdiqladi):** qolib ketish qoidasi **yetakchi yarim yo'lni bosib o'tgandan keyin** ishlaydi (15 pog'onada — 8-pog'ona, 20 da — 10, 30 da — 15). Pastki yarmida hamma bemalol chiqadi, keyin poyga jiddiylashadi.
Bu va boshqa sonlar (4 pog'ona, 15 pog'ona, 10 daqiqa, pauza) kodda **bitta joyda** turadi — sinfda sinab ko'rib, oson o'zgartiriladi.

### 2.2. Tog' qiyinlashib boradi
Pastki uchdan bir qismi — **Oson**, o'rtasi — **O'rta**, yuqorisi — **Qiyin** savollar (aniq chegaralar 2.10 dagi jadvalda, tog'ga qarab).

Qiyin savol ko'proq vaqt oladi, shuning uchun yetakchi tepada sekinlashadi, orqadagilar yetib olish imkoniga ega bo'ladi. Bu muallifning "boshidan qiyinga tomon" fikriga ham mos.

### 2.3. Pauza
- Birinchi xato — **10 soniya**. Ketma-ket ikkinchi xato — **20 soniya**.
- Tavakkal bosishdan saqlaydi: variantli savolda tasodifiy bosgan bola ko'p vaqt yo'qotadi.
- Pauza paytida **to'g'ri javob ko'rsatiladi** — bola kutish vaqtida o'rganib oladi. Savol-javob musobaqasidan farqi: u yerda ikkinchi o'yinchi xuddi shu turdagi savolni olgani uchun to'g'ri javob yashirilgan. Bu yerda har kimning savoli va sonlari boshqa.

### 2.4. Xonani o'qituvchi ochadi
- **O'qituvchi qurilmasi** (proyektor yoki katta ekran): xona kodi, kim kirgani, butun tog' va hamma qahramonlar, taymer. O'qituvchi mavzularni tanlaydi, "Boshlash", "Pauza" va "Tugatish" tugmalarini boshqaradi. **O'zi o'ynamaydi.**
- **Bolalar qurilmasi** (telefon yoki kompyuter): kod → qahramon tanlash → kutish → o'yin.
- Sababi: xonani ochgan bola chiqib ketsa, hammaning o'yini to'xtaydi. O'qituvchi qurilmasi esa butun o'yinni "ushlab turadi" (2.8).

### 2.5. Chiqib ketgan bola — tomoshabin
**Muallif qarori (2026-09-22):** muxlislik, sharpa va bayroqcha g'oyalaridan **voz kechildi**. Yutqazgan bola **oddiy tomoshabin** bo'ladi: ekranida tog' va qolgan o'yinchilar ko'rinib turadi, o'yin oxirigacha kuzatadi. Savol berilmaydi, hech narsa yubormaydi.
Shuning uchun bitta o'yin qisqa (4–5 daqiqa) bo'lishi muhim: chiqib ketgan bola uzoq kutmaydi, keyingi o'yinda qayta qatnashadi.

### 2.6. Ko'chirib bo'lmaydi
Sinfda hamma yonma-yon o'tiradi. Har kimga **boshqa sonli** savol beriladi: musobaqadagi `savollar.js` har kim uchun alohida yasaydi, hamma savollar esa bir xil mavzu va qiyinlikdan.

### 2.7. Qahramonlar — 12 ta hayvon
**Tulki, Burgut, Tog' echkisi, Ayiq, Irbis, Bo'ri, Quyon, Boyqush, Kiyik, Olmaxon, Tipratikan, Lochin** — har biri o'z rangida.
- Bitta qahramonni ikki kishi tanlay olmaydi: band bo'lgani xira ko'rinadi.
- **Ism so'ralmaydi.** Bola qahramon nomi bilan ko'rinadi ("Irbis 11-pog'onada").

### 2.8. G'olib aniqlanmasa va teng bo'lsa
- 10 daqiqa tugaganda bir xil balandlikda turganlar orasida o'sha pog'onaga **birinchi chiqqani** oldinda turadi.
- Shoxsupada 1-, 2-, 3-o'rin.

### 2.9. Chiqarib yuborish va kech kelganlar (muallif tasdiqladi)
- **O'qituvchi o'yinchini chiqarib yuborishi mumkin:** ro'yxatdagi qahramon yonidagi tugma. Kod tarqalib ketsa yoki begona kirsa kerak bo'ladi. Chiqarib yuborilgan bola shu kod bilan qayta kira olmaydi.
- **O'yin boshlangandan keyin kirgan bola faqat kutadi:** u xonada turadi, tog'ni kuzatadi va **keyingi o'yinda** qatnashadi. Boshlangan o'yinga qo'shilmaydi.

### 2.11. Uzilish
- Internet uzilgan bola joyida qotib turadi.
- **30 soniya ichida** o'sha kod bilan qaytib kirsa, qahramoni va pog'onasi saqlangan bo'ladi.
- Qaytmasa, chiqib ketgan hisoblanadi.
- O'qituvchi qurilmasi uzilsa, o'yin hamma uchun **pauza** bo'ladi va u qaytgach davom etadi.

### 2.10. Tog'lar: nomi va balandligi
**Muallif qarori (2026-09-22):** tog'larga nom beriladi, nomiga qarab balandligi (pog'onalar soni) o'zgaradi. O'qituvchi o'yin boshida tog'ni tanlaydi.

| Tog' | Haqiqiy balandligi | Pog'ona | Chegara (qolib ketish) | Taxminiy vaqt | Qiyinlik |
|---|---|---|---|---|---|
| **Chimyon** | 3 309 m | 15 | 4 | 3–4 daqiqa | 1–5 Oson · 6–10 Oʻrta · 11–15 Qiyin |
| **Hazrati Sulton** | 4 643 m | 20 | 4 | 4–5 daqiqa | 1–7 · 8–14 · 15–20 |
| **Pomir** | 7 495 m | 25 | 5 | 5–6 daqiqa | 1–9 · 10–17 · 18–25 |
| **Himolay** | 8 849 m | 30 | 6 | 6–8 daqiqa | 1–10 · 11–20 · 21–30 |

- Boshida **Hazrati Sulton (20)** turadi — 45 daqiqalik darsda 3–4 marta o'ynash uchun qulay.
- Har tog'ning o'z manzarasi: Chimyon — archazor va yashil yon bagʻir, Hazrati Sulton — qoyalar, Pomir — muzlik, Himolay — qor va bulutlar (bola bulutdan yuqoriga chiqadi).
- Tanlash ekranida tog'ning **haqiqiy balandligi metrda** yoziladi — bola yo'l-yo'lakay geografiyani ham biladi. Hazrati Sulton — O'zbekistondagi eng baland cho'qqi, Himolaydagi Jomolungma — dunyodagi eng balandi.
- Qolib ketish qoidasi har doim **yarim yo'ldan keyin** ishlaydi (Chimyonda 8-pog'ona, Himolayda 15-pog'ona).
- Ekranda har doim **8 pog'ona atrofi** ko'rinadi, shuning uchun baland tog'da ham pog'onalar kichrayib ketmaydi.
- Vaqt: Chimyon va Hazrati Sulton — 10 daqiqa, Pomir va Himolay — 15 daqiqa (o'qituvchi o'zgartira oladi).

## 3. Ekranlar

### 3.1. O'qituvchi (katta ekran)
```
┌────────────────────────────────────────────┐
│ Xona kodi: 4827          ⏱ 07:42   ⏸  ⏹    │
│                                            │
│   ⛰ Hazrati Sulton (4 643 m) — 20-pog'ona  │
│   14 ─────────────                         │
│   13 ── 🦊 Tulki                           │
│   12 ── 🐐 Echki  🦅 Burgut                │
│   ...                                      │
│   10 ── ⚠️ chegara: yetakchidan 4 past     │
│   ...                                      │
│    0 ── 🧓 oqsoqol                         │
│  "Burgut 12-pog'onaga chiqdi!"             │
└────────────────────────────────────────────┘
```
- Kutish xonasi: kod katta harflarda, kirganlar qahramonlari bilan (12 tagacha), har birining yonida **chiqarib yuborish** tugmasi, "Boshlash" (kamida 2 o'yinchi bo'lsa).
- Sozlash: **tog'** (Chimyon / Hazrati Sulton / Pomir / Himolay — 2.10), mavzular (musobaqadagi 7 mavzu), vaqt.
- O'yin paytida: tog' nomi va balandligi, taymer, har o'yinchining ulanish holati (uzildi / 60 soniyadan beri javob yo'q), chiqarib yuborish tugmasi.

### 3.2. Bola (telefon — tik ekran)
- **Tepada:** tog'ning o'zi turgan qismi — o'zi va yaqinidagilar, cho'qqigacha qancha qolgani ("Yana 4 pog'ona").
- **O'rtada:** savol.
- **Pastda:** javob tugmalari yoki raqam klaviaturasi (musobaqadagidek).
- **Pauza:** savol o'rnida "↻ Xato. To'g'ri javob: 56. Tepaga chiqa olmading — kut: 0:09" va taymer.
- **Chiqib ketdi:** "Qolib ketding" degan yozuv, keyin tog'ni kuzatish (savol berilmaydi).
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

## 9. Keyingi qadamlar

1. **Supabase** (0-bosqich): loyiha yaratilishi kerak — "kelajagim" to'xtatilgach. Usiz onlayn qismni sinab bo'lmaydi.
2. Shundan keyin: hisob-kitob (sof mantiq + testlar) → robot o'yinchilar bilan sinov → ekranlar → sinfda sinov.
3. Sinfdagi sinovdan keyin sozlanadigan sonlar: pog'ona, chegara, pauza, vaqt.

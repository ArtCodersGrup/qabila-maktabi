# Umumiy qoidalar

Barcha o'yinlar uchun bitta qoidalar to'plami. Har bir yangi o'yin shu qoidalarga amal qiladi.
Qoidani o'zgartirish kerak bo'lsa, avval shu faylni o'zgartiramiz, keyin o'yinlarni.

---

## 1. Loyiha maqsadi

Bolalarga informatika, dasturlash va sun'iy intellekt qanday ishlashini **2D o'yinlar orqali ko'z bilan ko'rsatish**.
Har bir o'yin bitta mavzuni o'rgatadi. O'yinlar bittadan, alohida qilinadi. Ularni bitta saytga yig'ish keyinroq hal qilinadi.

## 2. Kim uchun

- **Uch toifa, sinf bo'yicha** (2026-10-06): **1–4-sinf** — kompyuter boshlang'ich ko'nikmalari (amalda 2–4-sinf: bola o'qiy oladi), **5–8-sinf** — chuqurlashtirilgan informatika, **9–11-sinf** — olimpiada dasturlash. Har toifaning ko'rinishi va ohangi o'ziga xos; kattaroq o'quvchiga bolalarcha maskot, konfeti va haddan tashqari sodda tushuntirish berilmaydi. Shu fayldagi matn, o'lcham va uslub qoidalari (§4–§6) — **1–4 toifasi** uchun; 5–8 va 9–11 qoidalari o'z bosqichida yoziladi.
- **Til:** o'zbek tili, lotin yozuvi.
  - Ekrandagi matnda to'g'ri belgilar ishlatiladi: `oʻ`, `gʻ` (ʻ — U+02BB), tutuq belgisi `ʼ` (U+02BC).
  - Bolaga **"sen"** deb murojaat qilinadi.
- Bola matnni sekin o'qishi mumkin, shuning uchun asosiy tushuntirish **rasm va animatsiya** bilan, matn esa yordamchi.

## 3. Qurilmalar

O'yin **telefon/planshetda ham, kompyuterda ham** ishlaydi. Avval barmoq uchun loyihalanadi:

- Bosiladigan har bir narsa kamida **48×48 px**.
- Sichqonchani ustiga olib borganda (hover) chiqadigan muhim narsa **bo'lmaydi**.
- Sudrab olib borish (drag) o'rniga **bosish** ishlatiladi. Masalan, harfni bossang, u bo'sh katakka tushadi.
- Son kiritish uchun **ekrandagi raqam klaviaturasi**. Kompyuterda oddiy klaviatura raqamlari ham ishlaydi (qo'shimcha qulaylik).
- Eng tor ekran: **360 px**. Gorizontal aylantirish (scroll) bo'lmaydi.
- Telefon **tik va yotiq** holatda ham ishlaydi, burilganda o'yin holati yo'qolmaydi.

**Istisno — klaviatura bloki** (23-o'yindan): bu o'yinlar haqiqiy klaviaturani o'rgatadi, shuning uchun **kompyuter** (yoki klaviatura ulangan planshet) uchun. Bosh sahifada kartasida 💻 belgisi (`GAMES` da `pc: true`), telefonda ochilsa — ogohlantirish. Ekran baribir 360 px ga sig'adi.

**Istisno — Python bloki** (27-o'yindan): bola klaviaturada haqiqiy kod yozadi, shuning uchun bu blok ham **kompyuter** uchun (💻, `pc: true`). Telefonda ochilsa — ogohlantirish. "Natijani top" kabi o'qish masalalari telefonda ham ishlaydi va 360 px ga sig'adi.

## 4. O'qitish tamoyillari

### 4.1. Avval qildir, keyin nomla
Bola avval biror narsani **o'zi qiladi**, keyin o'yin unga nom beradi ("Sen hozir … qilding!").
O'yin boshida uzun tushuntirish o'qitilmaydi.

### 4.2. Har bir bosqich tartibi
Har bir bosqich uch qismdan iborat va shu tartibda keladi:

1. **Ko'rsatish** — bola qo'lda bajaradi, rasm/animatsiyada ko'radi.
2. **Formula va ta'rif** — avval uzun ko'rinishda (3 × 3 × 3), keyin qisqa yozuvda (3³). Ta'rif oddiy so'zlar bilan, 1–2 gap.
3. **Mashq** — tasodifiy misollar, har safar boshqa sonlar.

### 4.3. Tasodifiy misollar
- Har bir o'yin sonlar uchun **aniq chegara** belgilaydi. Bola yoddan hisoblay oladigan sonlar bo'lishi kerak (odatda javob ≤ 100).
- Juda oson yoki chalg'ituvchi holatlar chiqarilmaydi (masalan, 1 ta harfli alifbo).
- Bir xil misol **ketma-ket ikki marta** chiqmaydi.
- Savolda javobni ikki xil tushunish mumkin bo'lmasligi kerak ("eng kamida", "aynan", "…gacha" kabi so'zlar aniq yoziladi).
- **Qiyinlik zinasi (2026-10-02):** generator `next(prev, correct, tier)` oladi — `tier` 0 (birinchi javoblar), 1 (o'rta), 2 (oxirgi va qiyin rejim). Bosqich ichida sonlar chegarasi `tier` bilan o'sadi: bola 1-misolda "oson" desa, 5-misolda o'ylashi kerak.
- **Variantli savolda kamida 4 variant.** 2 variantli savol (ha/yo'q, 0/1, A/B) ikki urinish bilan yutqazib bo'lmaydi — u faqat ikkinchi savol ("nega?", "qaysi joyda?") bilan juft bo'ladi va ikkalasi to'g'ri bo'lsagina hisoblanadi.
- **Maslahat (1-xato) javobni aytmaydi** — asbobni yoki qadamni ko'rsatadi (bo'sh jadval, formula, rasm). Yordamchi jadval/qo'llanma 2-to'g'ri javobdan keyin yashiriladi, maslahat uni qaytaradi.

**Istisno — masala banki** (Python bloki): olimpiada uslubidagi masalani generator yasay olmaydi, shuning uchun bunday masalalar **qo'lda** yoziladi va har biriga test holatlari (kirish → chiqish) beriladi. Test shuni tekshiradi: bankdagi har masalaning namunali yechimi barcha test holatlaridan o'tadi. Tasodifiylik oddiy mashq generatorlarida qoladi.

### 4.4. Xato javob
Bolaga faqat "Xato" deyilmaydi. Qizil rang va qo'rqituvchi ovoz ishlatilmaydi.

1. **1-xato:** maslahat — bosqichdagi rasm yoki formula qayta ko'rsatiladi. Bola yana urinadi.
2. **2-xato:** to'g'ri javob tushuntirish bilan ko'rsatiladi, keyin **shunga o'xshash yangi misol** beriladi. Xato qilingan misol to'g'ri javoblar soniga qo'shilmaydi.

**Kod yozadigan o'yinlarda** (Python bloki): sintaksis xatosi — qavs yopilmagani, otstup, harf xatosi — **urinish sanalmaydi**. Bu javob xatosi emas, terishdagi xato: talqinchi satr raqamini va izohni ko'rsatadi, bola tuzatib yana ishga tushiradi.

### 4.5. Bosqichdan o'tish
- Mashqda **4 / 5 / 6 ta to'g'ri javob** (1- / 2- / 3-bosqich) — bosqich tugadi (`QK.practice.need()`; matnda `${QK.practice.need()} ta` deb yoziladi, son qotirilmaydi).
- **Yulduzlar:** xatosiz — ★★★, xato bo'ldi lekin yechim ko'rsatilmadi — ★★, yechim ko'rsatildi — ★. Eng yaxshi natija saqlanadi; bosqich tugaganda karta (raqam, nom, yulduzlar), o'yin tugaganda final kartasi ko'rsatiladi.
- **Seriya:** ketma-ket 3 / 5 / 7 to'g'ri javobda 🔥 toast chiqadi.
- **Qiyin rejim 🔥** (hamma bosqich tugagach ochiladi): 7 ta javob, bitta urinish (maslahat yo'q), `tier` doim 2. Natija alohida belgilanadi.
- Tugagan bosqichlar, yulduzlar va qiyin rejim brauzerda saqlanadi, sahifa yangilansa ham yo'qolmaydi.
- Keyingi bosqich oldingisi tugagandan keyin ochiladi.

### 4.6. Bilimni tekshirish
O'yin ichida alohida test **yo'q**. Bola nimani o'rganganini o'qituvchi o'yindan **oldin va keyin** o'z testlari bilan tekshiradi.
Shuning uchun har bir o'yinning `DIZAYN.md` faylida **"O'quv maqsadlari"** bo'limi bo'ladi: o'yindan keyin bola nimani qila olishi kerak. Testlar shu ro'yxat asosida tuziladi.

## 5. Matn qoidalari

- Nutq pufagida bir vaqtda **ko'pi bilan 2 ta qisqa gap**.
- Keyingi gapga bola o'zi o'tadi ("Davom" tugmasi yoki ekranni bosish). Matn o'z-o'zidan tez almashib ketmaydi.
- Shrift o'lchami kamida **18 px**, sonlar va formulalar kattaroq.
- **Matn dietasi:** intro ≤ 2 pufak, mashqgacha ≤ 6 pufak. Hikoya sahnalari mashqdan **keyin** keladi va "O'tkazib yuborish" bilan.

## 6. Vizual uslub

- **2D, tekis (flat) uslub.** Barcha rasmlar **SVG**'da, kod bilan chiziladi.
- Rasm ichiga **matn yoki son yozilmaydi**. O'zgaradigan hamma narsa (harflar, sonlar, tugmalar) alohida, kod bilan chiziladi.
- Animatsiyalar qisqa: **0.2–0.6 soniya**. Qahramonlar "tirik" ko'rinadi (ko'z qisish, nafas olish), lekin bolani chalg'itmaydi. **Mukofot animatsiyasi** (konfeti, ✓ portlashi) — ≤ 1 soniya, ish zonasini to'smaydi, `prefers-reduced-motion` da o'chadi.
- To'g'ri/xato holat faqat rang bilan emas, **belgi bilan ham** ko'rsatiladi (✓, ↻). Pufak matni `✓` bilan boshlansa yashil, `↻` bilan boshlansa to'q sariq holatga o'tadi (`ui.bubble` o'zi qo'yadi).
- **Tokenlar** (`asos.css` `:root`): matn uchun to'q variantlar (`--asosiy-matn`, `--togri-matn`, `--yana-matn`, `--matn-2`, `--matn-3`), rangli qirra (`--*-qora`), och fonlar (`--*-och`), shkalalar (`--s1…s6`, `--r-s…r-xl`, `--t-1…t4`). Yangi CSS'da qattiq kulrang yozilmaydi — token ishlatiladi. To'q sariq fon ustida matn **qora** (`--matn`), oq emas.
- Bosiladigan narsa holatlari: `:active` — pastga tushadi, `:focus-visible` — halqa, sichqoncha bor qurilmada `:hover` — yorishadi (faqat bezak), `:disabled` — xira emas, uzuq chiziqli/kulrang.

### Ranglar

| Nomi | Vazifasi | Rang |
|---|---|---|
| `fon` | Asosiy fon | `#FFF6E5` (iliq qum) |
| `matn` | Asosiy matn | `#2B2B3A` |
| `asosiy` | Asosiy tugmalar | `#2F6FDE` |
| `togri` | To'g'ri javob | `#1A9E77` |
| `yana` | "Yana urinib ko'r" (qizil emas) | `#F08A24` |
| `pufak` | Nutq pufagi foni | `#FFFFFF` |

Harflar/belgilar uchun ranglar, tartib bo'yicha (rang ko'rish buzilishida ham farqlanadi):

| 1-belgi | 2-belgi | 3-belgi | 4-belgi |
|---|---|---|---|
| `#2F6FDE` ko'k | `#F08A24` to'q sariq | `#1A9E77` yashil | `#8E5BD0` binafsha |

### Shrift
**Nunito** — dumaloq, bolalarga mos. Fayli o'yin papkasida saqlanadi, internet talab qilinmaydi.
Agar `ʻ` belgisi to'g'ri chiqmasa, tizim shrifti ishlatiladi.

**Kod uchun** (Python bloki) — tizimning monospace shrifti: `ui-monospace, Menlo, Consolas, monospace`. Yangi fayl yuklanmaydi. Otstup va qavslar tekis ko'rinishi uchun harflar bir xil kenglikda bo'lishi shart.

## 7. Ovoz

- Tovush effektlari (bosish, to'g'ri, "yana urin", tabrik, baraban) **kod bilan yasaladi** (Web Audio). Tayyor fayl kerak emas.
- Ekranda doim **ovozni o'chirish** tugmasi bor, tanlov saqlanadi.
- Brauzer talabiga ko'ra ovoz bola birinchi marta bosgandan keyin yoqiladi.
- O'zbekcha diktor ovozi **hozircha yo'q**. Kerak bo'lsa, ovoz alohida yozib olinadi.

## 8. Texnologiya

- Oddiy **HTML + CSS + JavaScript**, grafika — **SVG**.
- Kutubxona, yig'ish (build) va o'rnatish **yo'q**.
  **Onlayn qism** (2026-10-05): kutubxona yo'q — brauzerning o'z `WebSocket`i va o'z serverimiz (`server/`, FastAPI, kelajagim.uz/api). O'yinlar va bitta ekrandagi musobaqalar serversiz, internetsiz ishlaydi.
- Skriptlar oddiy `<script>` bilan ulanadi (modul emas). Shunda `index.html` ni ikki marta bosib ochish mumkin.
- O'yin ishlashi uchun **internet kerak emas**. Faqat **onlayn musobaqalar** (`oyinlar/onlayn/` va keyingilari) internet bilan ishlaydi: o'z serverimiz (WebSocket), ism va chat yo'q, faqat 4 xonali xona kodi; xabarlarni server ham tekshiradi.
- **Akkaunt ixtiyoriy** (2026-10-05): kirmasdan ham hamma o'yin ishlaydi. Kirgan bolaning progressi serverga ham yoziladi, lekin o'yinlar baribir faqat `localStorage` bilan ishlaydi (sinxron — `umumiy/js/storage.js` navbati va `hisob.js`). Yangi o'yin `QK.storage` dan foydalansa, sinxron o'zi ishlaydi.
- **Shaxsiy ma'lumot — eng kami:** ism + familiyaning bosh harfi ("Ali K."), login yoki Google email. Tug'ilgan sana, telefon, maktab, to'liq familiya **yig'ilmaydi**. Ismni faqat bolaning o'zi va uning o'qituvchisi ko'radi; onlayn xona ekranlarida ism ko'rinmaydi. Parollar faqat xesh (argon2); maxfiy kalitlar (baza, Google secret) faqat serverdagi `/srv/kelajagim/api.env` da — repoga hech qachon yozilmaydi.
- Brauzer xotirasi (`localStorage`) faqat qulaylik uchun: tugagan bosqichlar va ovoz tanlovi. U ishlamasa ham o'yin to'liq ishlaydi.
- Bolaning yozgan kodi **hech qachon** `eval` yoki `new Function` bilan bajarilmaydi. Python kodi `umumiy/js/python/` dagi o'z talqinchimizda bajariladi — u ham kutubxona emas, o'zimiz yozgan kod.
- Hisob-kitob (mantiq) kodi ekran kodidan **alohida faylda** bo'ladi va avtomatik testlar bilan tekshiriladi.

## 9. Papkalar va nomlar

```
Information/
├── QOIDALAR.md                ← shu fayl
├── index.html                 ← bosh sahifa: barcha o'yinlarga kirish
├── bosh/                      ← bosh sahifa fayllari (uslub, ikonkalar, ro'yxat, test)
└── oyinlar/
    ├── umumiy/                ← kamida 2 ta o'yin ishlatadigan kod (qahramonlar, UI, tovush, shrift)
    └── NN-oyin-nomi/          ← har bir o'yin o'z papkasida
        ├── DIZAYN.md          ← o'yin dizayni
        ├── REJA.md            ← ish rejasi
        ├── index.html         ← umumiy skriptlarni ../umumiy/ dan ulaydi
        └── ...
```

- Papka nomlari: kichik harflar, so'zlar `-` bilan, **`'` belgisisiz** (o'yin → oyin), boshida tartib raqami (`01-`, `02-`).
- Hujjatlar va papka nomlari **o'zbekcha**.
- Kod fayllari va o'zgaruvchilar **inglizcha** (dasturlashdagi odatiy standart), kod ichidagi izohlar **o'zbekcha**.
- Bir o'yinning fayllari boshqa o'yin papkasiga aralashmaydi.
- Bir nechta o'yinga kerak bo'lgan kod `oyinlar/umumiy/` papkasida turadi. U yerga faqat **kamida 2 ta o'yin** ishlatadigan kod chiqariladi; bitta o'yinga xos narsa o'z papkasida qoladi.
- `umumiy/` dagi kod o'zgarsa, **barcha o'yinlarning** testlari ishga tushiriladi.
- Yangi o'yin tayyor bo'lgach, **bosh sahifadagi ro'yxatga** qo'shiladi (`bosh/js/bosh.js` dagi `GAMES`); `node --test bosh/tests/*.test.js` buni tekshiradi.
- **Bosh sahifadagi tartib** — o'rganish yo'li: osondan qiyinga, boshqa o'yinga tayanadigan o'yin undan keyin (`SECTIONS` tartibi). Kartadagi raqam — **tanlangan toifa ichidagi** o'rni, papka raqami emas (papka nomlari o'zgarmaydi).
- **Toifalar:** har o'yinda `toifa` bor — `boshlangich` (1–4-sinf), `orta` (5–8) yoki `yuqori` (9–11). **Har o'yin aynan bitta toifada**: kattaroq o'quvchi kichiklar o'yinini o'z ro'yxatida ko'rmaydi. O'quvchi kirishda sinfini tanlaydi va bosh sahifadagi almashtirgich bilan xohlagan toifasiga o'tadi (akkaunt bitta, progress yo'qolmaydi). Asbob va musobaqalar (masalalar, shpargalka, poyga…) o'yin emas — ularda `toifalar: [...]`, bir nechta toifada ko'rinadi.
- **Ko'rinish `<html>` atributlaridan olinadi:** `data-toifa` — o'yin sahifasida **faylga yozilgan** (o'yinning o'z toifasi), bosh sahifa va asboblarda `umumiy/js/toifa.js` o'quvchi tanlovidan qo'yadi. Kattalar ko'rinishi (5–8, 9–11): qahramonlar yo'q, ko'rsatma — oddiy panel, shogird gapi "Shogird" yozuvi bilan, konfeti o'rniga ✓ (`asos.css` oxiridagi bo'lim). O'yin toifasi o'zgarsa yoki yangi o'yin qo'shilsa: `node bosh/tools/toifa-yoz.js`.
- **`data-maskot`:** shogirdning qog'ozi yoki barabanini ishlatadigan o'yin (`ui.paper("…")`, `ui.raisePaper`, `"drum"`) qahramonsiz tushunarsiz — u toifasidan qat'i nazar bolalar ko'rinishida qoladi. Shuning uchun **5–8 va 9–11 o'yinlarida qog'oz va baraban ishlatilmaydi**.
- O'yin ichida boshqa o'yinga havola **nom bilan** yoziladi: «Qabila chiroqlari» o'yinidagi chiroqlarni esla. **Raqam bilan yozilmaydi** — raqam toifaga bog'liq. `bosh/tests/bosh.test.js` ikkalasini ham tekshiradi: raqamli havola qolmaganini va «…» ichidagi nom haqiqiy o'yinga tegishli ekanini.
- Yangi **blok** qo'shilsa, `SECTIONS` ga o'rganish yo'li bo'yicha o'z o'rniga qo'yiladi. Raqamlar o'z-o'zidan suriladi — boshqa faylga tegilmaydi.
- **Musobaqalar** (o'yin emas, bosqichi yo'q) — bosh sahifada `CONTESTS`, ikki guruh: **bitta ekranda** (`oyinlar/musobaqa/` savol-javob, `oyinlar/poyga/` tez yozish poygasi) va **onlayn** (`oyinlar/onlayn/` aloqa sinovi; onlayn o'yinlar keyin qo'shiladi).

## 10. Ish tartibi

Har bir o'yin shu yo'l bilan qilinadi:

1. **Suhbat** — g'oya muhokama qilinadi.
2. **`DIZAYN.md`** yoziladi → muallif o'qib, tasdiqlaydi.
3. **`REJA.md`** — qadam-baqadam ish rejasi yoziladi → tasdiqlanadi.
4. **Kod** reja bo'yicha yoziladi.
5. **Tekshiruv** (oraliq brauzer tekshiruvlari yo'q — muallif talabi):
   - mantiq uchun avtomatik testlar (`node --test`);
   - oxirida bitta yakuniy kod ko'rigi;
   - muallif o'yinni o'zi ko'rib chiqadi (telefon va kompyuterda).
6. **Bolalarda sinov** — muallif bolalarga o'ynatib ko'radi, natijaga qarab tuzatiladi.

Har bir muhim qadamdan keyin o'zgarishlar **git**'ga saqlanadi.

## 11. Ochiq savollar (keyin hal qilinadi)

- Barcha o'yinlarda chiqadigan **umumiy qahramon (maskot)** bo'ladimi?
- **Diktor ovozi** kerakmi?
- O'yinlarni **saytga yig'ish**: bosh sahifa, mavzular ro'yxati, qayerda joylashadi.

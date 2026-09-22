# Umumiy qoidalar

Barcha o'yinlar uchun bitta qoidalar to'plami. Har bir yangi o'yin shu qoidalarga amal qiladi.
Qoidani o'zgartirish kerak bo'lsa, avval shu faylni o'zgartiramiz, keyin o'yinlarni.

---

## 1. Loyiha maqsadi

Bolalarga informatika, dasturlash va sun'iy intellekt qanday ishlashini **2D o'yinlar orqali ko'z bilan ko'rsatish**.
Har bir o'yin bitta mavzuni o'rgatadi. O'yinlar bittadan, alohida qilinadi. Ularni bitta saytga yig'ish keyinroq hal qilinadi.

## 2. Kim uchun

- **Yosh:** 8–12.
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

### 4.4. Xato javob
Bolaga faqat "Xato" deyilmaydi. Qizil rang va qo'rqituvchi ovoz ishlatilmaydi.

1. **1-xato:** maslahat — bosqichdagi rasm yoki formula qayta ko'rsatiladi. Bola yana urinadi.
2. **2-xato:** to'g'ri javob tushuntirish bilan ko'rsatiladi, keyin **shunga o'xshash yangi misol** beriladi. Xato qilingan misol to'g'ri javoblar soniga qo'shilmaydi.

### 4.5. Bosqichdan o'tish
- Mashqda **3 ta to'g'ri javob** — bosqich tugadi.
- Tugagan bosqichlar brauzerda saqlanadi, sahifa yangilansa ham yo'qolmaydi.
- Keyingi bosqich oldingisi tugagandan keyin ochiladi.

### 4.6. Bilimni tekshirish
O'yin ichida alohida test **yo'q**. Bola nimani o'rganganini o'qituvchi o'yindan **oldin va keyin** o'z testlari bilan tekshiradi.
Shuning uchun har bir o'yinning `DIZAYN.md` faylida **"O'quv maqsadlari"** bo'limi bo'ladi: o'yindan keyin bola nimani qila olishi kerak. Testlar shu ro'yxat asosida tuziladi.

## 5. Matn qoidalari

- Nutq pufagida bir vaqtda **ko'pi bilan 2 ta qisqa gap**.
- Keyingi gapga bola o'zi o'tadi ("Davom" tugmasi yoki ekranni bosish). Matn o'z-o'zidan tez almashib ketmaydi.
- Shrift o'lchami kamida **18 px**, sonlar va formulalar kattaroq.

## 6. Vizual uslub

- **2D, tekis (flat) uslub.** Barcha rasmlar **SVG**'da, kod bilan chiziladi.
- Rasm ichiga **matn yoki son yozilmaydi**. O'zgaradigan hamma narsa (harflar, sonlar, tugmalar) alohida, kod bilan chiziladi.
- Animatsiyalar qisqa: **0.2–0.6 soniya**. Qahramonlar "tirik" ko'rinadi (ko'z qisish, nafas olish), lekin bolani chalg'itmaydi.
- To'g'ri/xato holat faqat rang bilan emas, **belgi bilan ham** ko'rsatiladi (✓, ↻).

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

## 7. Ovoz

- Tovush effektlari (bosish, to'g'ri, "yana urin", tabrik, baraban) **kod bilan yasaladi** (Web Audio). Tayyor fayl kerak emas.
- Ekranda doim **ovozni o'chirish** tugmasi bor, tanlov saqlanadi.
- Brauzer talabiga ko'ra ovoz bola birinchi marta bosgandan keyin yoqiladi.
- O'zbekcha diktor ovozi **hozircha yo'q**. Kerak bo'lsa, ovoz alohida yozib olinadi.

## 8. Texnologiya

- Oddiy **HTML + CSS + JavaScript**, grafika — **SVG**.
- Kutubxona, yig'ish (build) va o'rnatish **yo'q**.
- Skriptlar oddiy `<script>` bilan ulanadi (modul emas). Shunda `index.html` ni ikki marta bosib ochish mumkin.
- O'yin ishlashi uchun **internet kerak emas**.
- Brauzer xotirasi (`localStorage`) faqat qulaylik uchun: tugagan bosqichlar va ovoz tanlovi. U ishlamasa ham o'yin to'liq ishlaydi.
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
- **Bosh sahifadagi tartib** — o'rganish yo'li: osondan qiyinga, boshqa o'yinga tayanadigan o'yin undan keyin (`SECTIONS` tartibi). Kartadagi raqam — shu tartibdagi o'rni, papka raqami emas (papka nomlari o'zgarmaydi).
- O'yin ichida boshqa o'yinga raqam bilan havola ("5-oʻyindagi chiroqlarni esla") — **bosh sahifadagi raqam** bilan yoziladi va `bosh/tests/havolalar.json` ga qo'shiladi; tartib o'zgarsa, test eslatadi.
- **Musobaqalar** (o'yin emas, bosqichi yo'q): `oyinlar/musobaqa/` (savol-javob) va `oyinlar/poyga/` (tez yozish poygasi) — bosh sahifada `CONTESTS`.

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

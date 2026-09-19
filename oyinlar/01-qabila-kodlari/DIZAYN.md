# 01 — Qabila kodlari: dizayn

**Mavzu:** Ma'lumotlarni kodlash
**Yosh:** 8–12
**Taxminiy davomiyligi:** 20 daqiqa
**Holati:** tayyor — bolalarda sinovni kutmoqda

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Bu hujjat faqat shu o'yinga xos narsalarni yozadi.

> **Kodlash va shifrlash.** Bu o'yin **kodlash** haqida: ma'lumotni belgilar bilan yozish, qoidani hamma biladi.
> Shifrlash (ma'lumotni yashirish) — boshqa o'yin mavzusi.

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. Berilgan harflardan berilgan uzunlikdagi **barcha so'zlarni** tartib bilan yozib chiqa oladi (kichik holatlarda).
2. Alifboda **a** ta harf bo'lsa, **aynan i** harfli so'zlar sonini topadi: **N = aⁱ**.
3. **i tagacha** (1, 2, …, i harfli) so'zlar sonini topadi: **N = a¹ + a² + … + aⁱ**.
4. "Aynan i harfli" va "i harfgacha" farqini tushuntiradi.
5. N ta narsaga alohida nom berish uchun **eng kamida** nechta harf kerakligini topadi.
6. Kompyuter faqat 2 ta belgidan — **0 va 1** — foydalanishini biladi.

O'qituvchi o'yindan oldin va keyin shu 6 ta maqsad bo'yicha test o'tkazadi.

## 2. Qahramonlar va hikoya

Qadimgi qabila. Ularda endigina yozuv paydo bo'ldi, lekin alifboda bor-yo'g'i bir nechta harf bor.
Har bir narsaga — hayvonlarga, odamlarga — nom berish kerak. Qancha so'z yasash mumkin?

| Qahramon | Vazifasi | Harakatlari (animatsiya) |
|---|---|---|
| **Oqsoqol** | Alifboni aytadi: harflar uning nutq pufagida rangli kartochkalar bo'lib chiqadi | turish, gapirish, qo'l bilan ko'rsatish, xursand bo'lish, o'ylash |
| **Shogird** | So'z uzunligi yozilgan qog'ozni ko'taradi | turish, qog'oz ko'tarish, sakrab xursand bo'lish, bosh qashish (xatoda) |

Qahramon ismlarini keyin o'zgartirish mumkin.

## 3. O'yin oqimi

```
Bosh ekran
   │
   ├─► Kirish sahnasi (hikoya, 3 ta pufak)
   │
   ├─► 1-bosqich: Aynan i harfli so'zlar     [ko'rsatish → formula → mashq]
   │
   ├─► 2-bosqich: i harfgacha so'zlar         [ko'rsatish → formula → mashq]   (1-bosqichdan keyin ochiladi)
   │
   ├─► 3-bosqich: Nechta harf kerak?          [ko'rsatish → qoida → mashq]     (2-bosqichdan keyin ochiladi)
   │
   └─► Final: kompyuter alifbosi 0 va 1  →  Tabrik ekrani
```

**Bosh ekran:** o'yin nomi, "Boshlash" tugmasi, 3 ta bosqich kartasi (yopiq 🔒 / ochiq / tugagan ✓), ovoz tugmasi.
"Boshlash" birinchi ochiq, lekin hali tugamagan bosqichdan boshlaydi. Tugagan bosqichni kartasini bosib qayta o'ynash mumkin.

**O'qituvchi va sinov uchun:** manzilga `?bosqich=2` (yoki `1`, `3`) qo'shilsa, o'yin shu bosqichdan boshlanadi — oldingi bosqichlarni o'ynash shart emas.

---

## 4. 1-bosqich: Aynan i harfli so'zlar

### 4.1. Ko'rsatish

**1.1 — Qo'lda yasash (kichik).**
Oqsoqol: harflar **A, U**. Shogird qog'oz ko'taradi: **2**.
- Ekranda 2 ta bo'sh katak va harf tugmalari (A, U).
- Harfni bossang — birinchi bo'sh katakka tushadi. To'lgan katakni bossang — bo'shaydi.
- Ikkala katak to'lganda so'z avtomatik ravishda **devorga** yoziladi.
- Bu so'z oldin topilgan bo'lsa: kataklar silkinadi, "Bu so'z bor edi!" deyiladi.
- 4 ta so'zning hammasi (AA, AU, UA, UU) topilganda — tabrik.
- **Yordam** tugmasi: topilmagan so'zlardan biri qisqa miltillab ko'rsatiladi. Bu tugma qo'lda yasashning barcha qismlarida bor (1.1, 1.2, 2.1).

**1.2 — Qo'lda yasash + daraxt.**
Oqsoqol: harflar **A, U, F**. Qog'oz: **2**.
- Bu safar devor o'rnida **daraxt** turadi: ildizdan 3 ta shox (1-harf), har biridan yana 3 ta (2-harf) — 9 ta barg.
- Barglar boshida kulrang. Bola so'z yasaganda, shu so'zning yo'li daraxtda rangga kiradi.
- 9 ta so'z topilganda tabrik.

**1.3 — Daraxt o'sadi.**
Qog'oz **3** ga almashadi. Oqsoqol: "Endi hammasini yasash uzoq. Daraxtga qara!"
- Daraxtga 3-qavat animatsiya bilan qo'shiladi: har bir barg yana 3 taga bo'linadi.
- Savol: "Nechta so'z bo'ldi?" — bola raqam klaviaturasida javob beradi (**27**).

### 4.2. Formula va ta'rif

Animatsiya ketma-ketligi:
1. 3 ta katak: `□ □ □`, har birining tagida "3 ta variant".
2. `3 × 3 × 3 = 27`
3. "Qisqacha yoziladi:" `3³ = 27`
4. Ta'rif: **"Alifboda nechta harf bo'lsa, shu sonni so'z uzunligicha marta ko'paytiramiz."**
5. Umumiy formula: **N = aⁱ** (a — harflar soni, i — so'z uzunligi, N — so'zlar soni).

### 4.3. Mashq

- Oqsoqol tasodifiy harflarni aytadi, Shogird qog'ozda uzunlikni ko'taradi.
- Savol: **"Aynan {i} harfli nechta so'z bor?"**
- Javob raqam klaviaturasida kiritiladi.
- Sonlar chegarasi: 7-bo'limga qarang.

**Xato bo'lganda (QOIDALAR 4.4):**
- 1-xato — maslahat: `□ □ □` kataklar, har birining tagida "{a} ta variant", pastida `{a} × {a} × {a} = ?`
- 2-xato — to'g'ri javob tushuntirish bilan (`4 × 4 × 4 = 64`), keyin yangi misol.

---

## 5. 2-bosqich: i harfgacha so'zlar

### 5.1. Ko'rsatish

**2.1 — Qo'lda yasash.**
Harflar **A, U**. Qog'oz: **1–2**. Oqsoqol: "Endi so'z 1 harfli ham, 2 harfli ham bo'lishi mumkin."
- 2 ta katak + **"Tayyor"** tugmasi. Ikkala katak to'lsa, so'z avvalgidek avtomatik yuboriladi. 1 ta harf qo'yib "Tayyor"ni bossang — 1 harfli so'z yuboriladi.
- Devor ikki ustunli: "1 harfli" va "2 harfli".
- 6 ta so'zning hammasi (A, U, AA, AU, UA, UU) topilganda tabrik.

**2.2 — Daraxtdagi hamma tugunlar.**
- 1-bosqichdagi daraxt, lekin endi faqat barglar emas, **har bir tugun** so'z bo'lib yonadi.
- Harflar **A, U**, qog'oz **1–2**: qavatlar bo'yicha `2 + 4 = 6`.
- Harflar **A, U, F**, qog'oz **1–3**: `3 + 9 + 27 = ?` — bola javob beradi (**39**).

**2.3 — Qiziq holat: pauza nega kerak.** *(baholanmaydi)*
- Shogird barabanda xabar chaladi: **A U**, orada pauza yo'q.
- Ekranda ikki xil tushunish ko'rsatiladi: bitta so'z **"AU"** yoki ikkita so'z **"A"** va **"U"**.
- Oqsoqol: "So'zlar har xil uzunlikda bo'lsa, orasiga pauza qo'yamiz. Morze alifbosida ham shunday."
- Davom etish uchun bitta bosish.

### 5.2. Formula va ta'rif

1. Har bir uzunlik alohida: `1 harfli: 3`, `2 harfli: 3 × 3 = 9`, `3 harfli: 3 × 3 × 3 = 27`
2. `3 + 9 + 27 = 39`
3. Ta'rif: **"Har bir uzunlik uchun 1-bosqichdagidek hisoblaymiz, keyin hammasini qo'shamiz."**
4. Formula: **N = a¹ + a² + … + aⁱ**

Yig'indining qisqa (umumiy) formulasi **ko'rsatilmaydi** — bu yosh uchun juda murakkab.

### 5.3. Mashq

- Savol: **"{i} harfgacha (1, 2, …, {i} harfli) nechta so'z bor?"**
- Qog'ozda: `1–{i}`.
- 1-xato — maslahat: har bir uzunlik alohida qatorda, `4 + 4×4 + 4×4×4 = ?`
- 2-xato — to'g'ri javob tushuntirish bilan, keyin yangi misol.

---

## 6. 3-bosqich: Nechta harf kerak?

### 6.1. Ko'rsatish

**3.1 — "Gacha" holati.**
Ekranda **5 ta odam**, ismlari yo'q (boshlari ustida "?").
Oqsoqol: "Har biriga **boshqa-boshqa** ism kerak. Ism **2 harfgacha**. **Eng kamida** nechta harf kerak?"
- Ekranda **harflar soni** hisoblagichi: `[−] 1 [+]`.
- Harflar soni o'zgarganda: shu harflardan yasalgan ismlar odamlarga birma-bir beriladi.
  - 1 ta harf (A): ismlar A, AA → 2 kishiga ism yetdi, 3 kishi "?" bilan qoldi, xafa.
  - 2 ta harf (A, U): 6 ta ism → hammaga yetdi (1 ta ortdi) ✓, hamma xursand.
- Oqsoqol: "1 ta harf yetmadi, 2 ta yetdi. Demak, **eng kamida 2 ta**."

**3.2 — "Aynan" holati (farqni ko'rsatish).**
Xuddi shu 5 kishi, lekin ism **aynan 2 harfli**.
- 2 ta harf → 4 ta ism, 1 kishi ismsiz qoladi.
- 3 ta harf → 9 ta ism ✓.
- Oqsoqol: "Savol deyarli bir xil, lekin javob boshqa: **3**. 'Aynan' va 'gacha' so'zlariga diqqat qil!"

### 6.2. Qoida

Bu bosqichda formula emas, **qoida**:
**"Harflar sonini 1 dan boshlab bittadan oshiramiz. So'zlar soni odamlar sonidan kam bo'lmay qolgan birinchi son — javob."**

### 6.3. Mashq

- Savol: **"{P} ta odam bor. Ism {aynan i harfli / i harfgacha}. Eng kamida nechta harf kerak?"**
- Javob raqam klaviaturasida.
- 1-xato — maslahat: 6.1 dagi hisoblagich va odamlar ochiladi, bola sinab ko'radi.
- 2-xato — to'g'ri javob tushuntirish bilan (`2 ta harf: 8 ta so'z — yetmaydi; 3 ta harf: 27 ta — yetadi`), keyin yangi misol.

---

## 7. Tasodifiy misollar qoidalari

**Harflar to'plami:** `A U F K M S T R` — har bir misol uchun kerakli sondagi har xil harflar tasodifiy tanlanadi.
(`O` harfi ishlatilmaydi — finaldagi `0` bilan chalkashmasligi uchun.)

| Bosqich | a (harflar) | i (uzunlik) | Shart | Mumkin bo'lgan misollar |
|---|---|---|---|---|
| 1 | 2, 3, 4 | 2–5 | aⁱ ≤ 64 | (2,2) (2,3) (2,4) (2,5) (3,2) (3,3) (4,2) (4,3) |
| 2 | 2, 3, 4 | 2–5 | a + … + aⁱ ≤ 84 | xuddi shu 8 ta juftlik |
| 3 | javob: 2, 3, 4 | 2, 3 | pastga qarang | |

**3-bosqich misoli qanday yasaladi:**
1. Tasodifiy tanlanadi: tur (`aynan` / `gacha`), uzunlik i (2 yoki 3), javob a (2, 3 yoki 4).
2. Odamlar soni P shunday tanlanadiki: **(a−1) ta harf yetmaydi, a ta harf yetadi.**
   Ya'ni `soni(a−1) < P ≤ soni(a)`, shuningdek `2 ≤ P ≤ 30`.
3. Bu oraliq bo'sh bo'lsa (masalan, `gacha`, i=3, a=4), boshqa kombinatsiya tanlanadi.

Bu usul javob doim **bitta va aniq** bo'lishini kafolatlaydi.

**Umumiy:**
- Oldingi misol bilan bir xil misol (bir xil a, i, tur va P) ketma-ket chiqmaydi.
- Har bir mashqda 3 ta to'g'ri javob kerak. Ekranda 3 ta doira — to'g'ri javobda biri to'ladi.

---

## 8. Final: kompyuter alifbosi

*(baholanmaydi)*

1. Oqsoqol: "Bizning alifbomizda bir nechta harf bor edi. Kompyuter alifbosida esa faqat **2 ta**: **0** va **1**."
2. Shogird barabanda chaladi: **tak = 0**, **dum = 1**. Har bir zarb ekranda belgi bo'lib chiqadi.
3. 0 va 1 daraxti o'sadi: 3 qavat → 8 ta so'z (`000` … `111`).
4. Oqsoqol: "Kompyuter ko'pincha har bir harfni **8 ta** 0 yoki 1 bilan yozadi. `2⁸ = 256` xil so'z — hamma harf va raqamlarga yetadi."
5. **Tabrik ekrani:** o'rganilgan 3 ta qoida qisqa ko'rinishda (`aⁱ`, `a + … + aⁱ`, "eng kamida"), "Qayta o'ynash" va "Bosh ekran" tugmalari.

---

## 9. Ekran tuzilishi

Ekran 3 zonaga bo'linadi:

| Zona | Nima bor |
|---|---|
| **Sahna** | Oqsoqol, Shogird, nutq pufagi, qog'oz |
| **Ish maydoni** | kataklar, devor, daraxt, odamlar, formula |
| **Boshqaruv** | harf tugmalari / raqam klaviaturasi / "Davom" |

- **Tik ekran (telefon):** zonalar tepadan pastga: sahna → ish maydoni → boshqaruv.
- **Yotiq ekran (planshet, kompyuter):** sahna chapda, o'ngda — ish maydoni va uning ostida boshqaruv.
- **Daraxt** chapdan o'ngga o'sadi (ildiz chapda, barglar o'ngda ustun bo'lib). Daraxt ko'rsatilganda sahna kichrayadi (qahramonlar va pufak ixcham holatga o'tadi).
- Barglar **9 tadan ko'p** bo'lsa, so'z harflar bilan emas, **rangli kvadratchalar** bilan chiziladi (har bir harf o'z rangida). Shunda 27 ta barg telefonda ham sig'adi va o'qiladi.
- 3-bosqichda odamlar ko'p bo'lsa (30 tagacha), ular kichikroq, qator-qator chiziladi.
- Ekranning yuqori burchagida doim: **bosh ekranga qaytish** va **ovoz** tugmalari.

## 10. Kod tuzilishi

Hammasi `oyinlar/01-qabila-kodlari/` ichida:

| Fayl | Vazifasi | Nimaga bog'liq |
|---|---|---|
| `index.html` | Sahifa, skriptlarni ulaydi | — |
| `css/style.css` | Ranglar, zonalar, tik/yotiq joylashuv | — |
| `js/logic.js` | **Sof hisob:** so'zlar soni, so'zlar ro'yxati, eng kamida nechta harf, tasodifiy misol yasash, javobni tekshirish. Ekran bilan ishlamaydi. | — |
| `js/storage.js` | Tugagan bosqichlar va ovoz tanlovini saqlash (`localStorage`, xato bo'lsa jim o'tkazib yuboradi) | — |
| `js/sound.js` | Tovush effektlari (Web Audio) | storage |
| `js/art.js` | SVG rasmlar: qahramonlar va ularning holatlari, qog'oz, harf kartochkasi, daraxt, odamlar | — |
| `js/ui.js` | Nutq pufagi, harf tugmalari, raqam klaviaturasi, progress doiralari, "Davom" | art, sound |
| `js/scenes/common.js` | Bosqichlar uchun umumiy: mashq sikli, qo'lda yasash, daraxt sahnalari | logic, art, ui, sound |
| `js/scenes/stage1.js` | Kirish sahnasi va 1-bosqich | common |
| `js/scenes/stage2.js` | 2-bosqich (pauza sahnasi bilan) | common |
| `js/scenes/stage3.js` | 3-bosqich (odamlar, hisoblagich) | common |
| `js/scenes/final.js` | Bosqich tugashi, final (0 va 1), tabrik | common |
| `js/main.js` | Ishga tushirish, ekranlar orasida o'tish, bosh ekran | hammasi |
| `fonts/` | Nunito shrift fayli (OFL litsenziya) | — |
| `tests/logic.test.js` | `logic.js` uchun avtomatik testlar | logic |

`logic.js` ham brauzerda, ham Node'da ishlaydi (testlar uchun).

## 11. Kutilmagan holatlar

| Holat | Nima bo'ladi |
|---|---|
| `localStorage` ishlamaydi (maxfiy rejim va h.k.) | O'yin to'liq ishlaydi, faqat progress saqlanmaydi |
| Ovoz bloklangan | Ovoz bola birinchi marta bosgandan keyin yoqiladi; ungacha jim |
| Ekran burildi | Joylashuv o'zgaradi, o'yin holati saqlanadi |
| Sahifa yangilandi | Bosh ekran; tugagan bosqichlar joyida |
| Eski versiyadagi saqlangan ma'lumot | E'tiborga olinmaydi, o'yin toza boshlanadi |
| Bola klaviaturada juda uzun son yozdi | Ko'pi bilan 3 ta raqam qabul qilinadi |

## 12. Tekshiruv

1. **Avtomatik testlar** (`node --test tests/`) — `logic.js` uchun:
   - `aⁱ` va yig'indi jadvaldagi barcha juftliklar uchun to'g'ri;
   - so'zlar ro'yxati to'liq va takrorsiz (masalan, A, U, F dan 2 harfli — aynan 9 ta, hammasi har xil);
   - "eng kamida" funksiyasi 6.1 va 6.2 misollarida 2 va 3 ni beradi;
   - tasodifiy misollar (1000 marta yasab): hammasi chegarada, javob yagona, ketma-ket takror yo'q.
2. **Skrinshotlar** (Playwright): telefon tik (375×667), telefon yotiq (667×375), kompyuter (1280×800) — har bir ekran.
3. **To'liq o'ynab chiqish:** bosh ekrandan tabrikkacha, har bir mashqda ataylab 1 va 2 marta xato qilib.
4. **Bolalarda sinov** — muallif.

## 13. Bu o'yinga kirmaydi

- Ro'yxatdan o'tish, reyting, ball
- O'yin ichidagi test (o'qituvchi alohida o'tkazadi)
- Diktor ovozi
- Boshqa tillar
- Shifrlash (alohida o'yin)
- Saytga yig'ish (keyinroq)

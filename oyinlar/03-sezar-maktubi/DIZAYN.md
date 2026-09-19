# 03 — Sezar maktubi: dizayn

**Mavzu:** Shifrlash — Sezar shifri
**Yosh:** 8–12
**Taxminiy davomiyligi:** 20 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Oldingi o'yinlar: [`01`](../01-qabila-kodlari/DIZAYN.md) — kodlash, [`02`](../02-qabila-morzesi/DIZAYN.md) — Morze.

> **Kodlash va shifrlash.** Morze qoidasini hamma biladi — bu kodlash. Sezar xatini faqat **kalitni** biladigan odam o'qiydi — bu shifrlash. Bu o'yinning asosiy yangi tushunchasi — **kalit**.

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. Sezar shifrida har bir harf alifbo bo'yicha kalit songa surilishini biladi.
2. Kalit berilganda so'zni ochadi (orqaga suradi) va shifrlaydi (oldinga suradi).
3. Alifbo aylana ekanini biladi: Ng dan keyin yana A keladi.
4. Kodlash va shifrlash farqini tushuntiradi (kalit — sir).
5. Kalitlar soni kam bo'lsa, shifrni hamma kalitni sinab ochish mumkinligini tushuntiradi.
6. Yuliy Sezar kim bo'lgani va shifrni nima uchun ishlatganini aytib beradi.

## 2. Alifbo

O'zbek lotin alifbosi tartibida **29 ta harf**. `Oʻ`, `Gʻ`, `Sh`, `Ch`, `Ng` — har biri **bitta harf** va ekranda **bitta katakda** turadi:

`A B D E F G H I J K L M N O P Q R S T U V X Y Z Oʻ Gʻ Sh Ch Ng`

- Alifbo **aylana**: Ng dan keyin A; A dan orqaga — Ng.
- Tutuq belgisi (ʼ) va bo'sh joy surilmaydi; xatlarda tutuq belgisi ishlatilmaydi.
- Matn doim **kataklarda** ko'rsatiladi (har harf — alohida katak), shuning uchun shifrda yonma-yon tushgan `S` va `H` bilan `Sh` chalkashmaydi.

## 3. Asboblar

**Sezar g'ildiragi** (faqat ko'rsatish va ta'rifda): ikki halqa — tashqisida oddiy alifbo, ichkisida kalitga surilgan alifbo, markazda kalit soni. Kalit o'zgarganda ichki halqa harflari birma-bir suriladi (animatsiya).

**Surish jadvali** (ishchi asbob, g'ildirakning yoyilgan ko'rinishi): 29 ta katak, har birida tepada oddiy harf (katta), pastda uning shifri (kalitga surilgani). Jadval — **klaviatura** ham:
- ochishda bola shifrlangan harfni **pastki** qatordan topib, katakni bosadi → **tepadagi** harf so'zga tushadi;
- shifrlashda oddiy harfni **tepa** qatordan topib bosadi → **pastdagi** harf so'zga tushadi.

**Jadval kaliti**ni bola o'zi o'rnatadi: `Jadval kaliti: [−] 3 [+]` (0–28, aylana). Asosiy ko'nikma: kalitni bilasan → jadvalni sozlaysan → o'qiysan.

## 4. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (xat keldi)
   ├─► 1-bosqich: Xatni ochish       [g'ildirak → xat (kalit 3) → ta'rif → 2 ta so'z]
   ├─► 2-bosqich: Javobni shifrlash  [3 ta so'z]
   └─► 3-bosqich: Kalitsiz ochish va hikoya  [2 ta so'z → 6 ta sahna] → tabrik
```

Bosh ekran, bosqich kartalari, `?bosqich=N` — 1–2-o'yindagidek (`umumiy/js/app.js`).

**Kirish:**
1. Oqsoqol: "Qabilaga uzoq Rimdan xat keldi!"
2. Shogird: "Xat Yuliy Sezardan. Lekin uni oʻqib boʻlmaydi!"
3. Oqsoqol: "Harflari surilgan. Kel, birga ochamiz!"

## 5. 1-bosqich: Xatni ochish

Tepada 3 ta doira: **xat** + **2 ta so'z**.

### 5.1. Ko'rsatish: g'ildirak
1. Ish maydonida katta g'ildirak (kalit 0). Oqsoqol: "Bu — Sezar gʻildiragi. Ichki halqani 3 ga buramiz."
2. Ichki halqa 0 → 1 → 2 → 3 ga birma-bir suriladi. Oqsoqol: "Endi har harf ostida 3 ta keyingi harf turibdi: A ostida — E."
3. Oqsoqol: "Gʻildirakni yoyib chiqsak — jadval boʻladi." Jadval ochiladi (kalit 0). Shogird qog'ozda **3** ni ko'taradi.
4. Oqsoqol: "Jadval kalitini 3 ga qoʻy." — bola `+` ni bosib 3 ga yetkazadi.

### 5.2. Xat
- Xat 3–4 so'zdan iborat, kalit **3**. So'zlar birma-bir ochiladi.
- Ish maydonida: tepada ochilgan so'zlar (oddiy matn), pastida joriy so'z — shifr kataklari va ular ostida bo'sh kataklar.
- Birinchi so'zda Oqsoqol: "Pastki qatordan shifrlangan harfni top va katakni bos."
- Hamma katak to'lganda **avtomatik** tekshiriladi.
- Xato bo'lganda (QOIDALAR 4.4):
  - 1-xato — jadval kaliti noto'g'ri bo'lsa: "Jadval kaliti {k} emas, 3 boʻlishi kerak." Aks holda noto'g'ri kataklar `↻` bilan bo'shatiladi: "↻ Belgilangan harflarni qaytadan top."
  - 2-xato — to'g'ri so'z ko'rsatiladi, xat davom etadi.
- Hamma so'z ochilgach: Oqsoqol: `Sezar yozibdi: «…»` (butun gap). 1-doira to'ladi.

**Xatlar** (tasodifiy):

| Xat | So'zlar |
|---|---|
| XATNI HECH KIM OʻQIMASIN | 4 |
| ERTAGA TONGDA YOʻLGA CHIQAMIZ | 4 |
| DOʻSTLARIM SIZGA ISHONAMAN | 3 |
| QOʻSHIN DARYO BOʻYIDA KUTSIN | 4 |

### 5.3. Ta'rif
1. "Kalit — har bir harf nechta surilgani. Sezarning kaliti — 3."
2. "Shifrlashda harf oldinga suriladi, ochishda — orqaga."
3. "Alifbo aylana: Ng dan keyin yana A keladi." — g'ildirakda Ng va A yonadi.

### 5.4. Mashq
- 2 ta so'z, har birida boshqa kalit (1–6, 3 dan tashqari). Shogird qog'ozda kalitni ko'rsatadi, pufakda ham yoziladi: "Kalit — {k}. Jadvalni sozla va soʻzni och."
- So'zlar: KITOB, QUSH, CHOY, TONG, GʻOZ, SHAMOL, BULUT, OLMA (ketma-ket takrorlanmaydi).
- Xato qoidasi 5.2 dagidek; 2-xatodan keyin **yangi so'z** (xato qilingani hisoblanmaydi).

## 6. 2-bosqich: Javobni shifrlash

- Oqsoqol: "Endi Sezarga javob yozamiz. Javob ham shifrlanadi!" / "Oddiy harfni tepa qatordan top — pastdagisi shifr."
- 3 ta to'g'ri javob (3 ta doira). Ish maydonida: oddiy so'z kataklari, ostida bo'sh kataklar.
- Pufakda: "Kalit — {k}. «{SOʻZ}» soʻzini shifrla."
- Birinchi javob har doim **XOʻP**, kalit 3. Keyingilari tasodifiy: TAYYOR, RAHMAT, SALOM, KELING (kalit 1–6).
- Xato qoidasi 5.2 dagidek; 2-xatodan keyin yangi so'z.
- Yakunda Shogird: "Javob Sezarga joʻnatildi!"

## 7. 3-bosqich: Kalitsiz ochish va hikoya

### 7.1. Kalitsiz ochish (bonus)
- Oqsoqol: "Dushman xatni tutib oldi. Lekin u kalitni bilmaydi!" / "Sen ham kalitni bilmaysan. Kalitni oʻzgartirib, maʼnoli soʻz chiqquncha sinab koʻr."
- Ish maydonida: shifrlangan so'z kataklari; ostida — **joriy jadval kaliti bilan ochilgan** so'z (har o'zgarishda yangilanadi); `Jadval kaliti: [−] k [+]`; **"Topdim!"** tugmasi.
- "Topdim!": kalit to'g'ri bo'lsa — "✓ Toʻgʻri! Kalit — {k}." Aks holda: "Bu soʻz maʼnoli emas. Yana sinab koʻr."
- 2 ta so'z: SALOM, DOʻST, QUYOSH, YULDUZ dan (kalit 4–9). Baholanmaydi.
- Oqsoqol: "Kalit atigi 28 xil. Hammasini sinab chiqish oson — shuning uchun Sezar shifri kuchsiz."

### 7.2. Hikoya
*(Har bir sahnada rasm va 1–2 pufak.)*

| # | Rasm | Oqsoqol aytadi |
|---|---|---|
| 1 | Sezar (dafna gulchambari) | "Yuliy Sezar Qadimgi Rimning sarkardasi va hukmdori edi." / "U taxminan 2000 yil oldin yashagan." |
| 2 | Muhrli xat | "U sarkardalariga maxfiy xatlar yuborgan." / "Xat dushman qoʻliga tushsa ham oʻqib boʻlmasin deb, harflarni 3 ga surgan." |
| 3 | Kalit | "Buni Rim tarixchisi Svetoniy yozib qoldirgan." / "Kalit — sir. Kalitni bilgan odam xatni bir zumda ochadi." |
| 4 | Ko'p kalitlar | "Lekin kalit atigi 28 xil. Sen hozir oʻzing sinab koʻrding!" |
| 5 | Kitob va ustunchalar | "IX asrda olim Al-Kindiy harflar qanchalik koʻp uchrashiga qarab shifrni ochishni oʻylab topdi." / "Esingdami, Morzeda eng koʻp ishlatiladigan harf eng qisqa edi?" |
| 6 | Qulfli telefon | "Bugun telefondagi xabarlar ham shifrlanadi." / "Faqat kalitlar juda uzun — hammasini sinash uchun millionlab yil kerak." |

**Tabrik:** "Tabriklayman! Endi sen Sezar shifrini bilasan!" — 3 ta xulosa: "Kalit — sir", "Shifrlash — oldinga, ochish — orqaga", "Kalit kam boʻlsa — shifrni sinab ochish mumkin"; "Qayta oʻynash", "Bosh ekran".

## 8. Ekran tuzilishi

2-o'yindagi 4 zona (sahna, ish maydoni, boshqaruv, **qo'llanma zonasi**). Qo'llanma zonasida — surish jadvali.

- Telefon tik: jadval pastda, **6 ustun × 5 qator**, katak ≥ 48×48 px (tepa harf 20 px, pastki 18 px). Jadval ochiq va ixcham rejimda qahramonlar yashirinadi (pufak qoladi).
- Telefon yotiq va kompyuter: jadval o'ng chekkada.
- Jadval kaliti boshqaruvi ish maydonida, so'z ustida. Tekshirish avtomatik — "Tekshir" tugmasi yo'q (joy tejaladi).
- G'ildirak: ish maydonida, eni `min(300px, 80vw)`.

## 9. Kutilmagan holatlar

1–2-o'yin holatlari, qo'shimcha:

| Holat | Nima bo'ladi |
|---|---|
| Jadval kaliti noto'g'ri, bola harflarni to'ldirdi | 1-xato maslahati kalit haqida bo'ladi |
| Kalit 28 dan oshirildi / 0 dan kamaytirildi | Aylana: 28 → 0, 0 → 28 |
| So'z tugagandan keyin jadval bosildi | Hech narsa (kataklar qulflangan) |

## 10. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `index.html` | Sahifa (umumiy skriptlar `../umumiy/`) |
| `css/style.css` | Jadval, g'ildirak, kataklar, hikoya |
| `js/caesar.js` | **Sof hisob:** alifbo, harflarga ajratish, surish, shifrlash/ochish, tekshirish, so'zlar ro'yxatlari, tasodifiy tanlash. Node'da test qilinadi. |
| `js/game-art.js` | G'ildirak SVG va hikoya rasmlari |
| `js/caesar-ui.js` | Harf kataklari, so'z kataklari, surish jadvali, kalit boshqaruvi |
| `js/scenes/common.js` | So'zni ochish/shifrlash va mashq sikllari |
| `js/scenes/stage1.js`, `stage2.js`, `stage3.js`, `final.js` | Bosqichlar, tabrik |
| `js/main.js` | `QK.app.start` (kalit `sezar-maktubi:v1`) |
| `tests/*.test.js` | `caesar.js`, `game-art.js`, `main.js` testlari |

**Umumiy papkaga:** qo'llanma zonasi endi 2 ta o'yinda ishlatiladi — uning joylashuv uslublari `umumiy/css/asos.css` ga, ochish/yopish (`ui.openGuide()`, `ui.closeGuide()`) `umumiy/js/ui.js` ga chiqariladi; 2-o'yin shularni ishlatadi.

## 11. Tekshiruv

Avtomatik testlar (`caesar.js`: alifbo, harflarga ajratish, aylana surish, shifrlash↔ochish teskari, ro'yxatlar faqat alifbo harflaridan va uzunlik chegaralarida, tasodifiy tanlash qoidalari), uchala o'yin testlari, yakuniy kod ko'rigi, oxirida qisqa brauzer ko'rigi (telefon tik va kompyuter), muallif ko'rib chiqadi.

## 12. Bu o'yinga kirmaydi

- Chastota tahlili bilan ochish (faqat hikoyada aytiladi)
- Tinish belgilari va raqamlarni shifrlash
- Erkin matn yozish

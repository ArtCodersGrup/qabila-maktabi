# 05 — Rim toshi: dizayn

**Mavzu:** Rim raqamlari; pozitsion va nopozitsion sanoq tizimlari
**Yosh:** 8–12
**Taxminiy davomiyligi:** 20 daqiqa
**Holati:** tasdiqlangan (2026-09-19)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Oldingi o'yinlar: `03` Sezar (Rim), `04` ikkilik sonlar (pozitsion tizim).

> Qabila Sezar askarlari qoldirgan tosh topdi. Unda g'alati belgilar: **XII**, **XXVI**… Bular — Rim raqamlari.

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. I, V, X, L, C qiymatlarini biladi va 1–100 oralig'idagi Rim sonlarini o'qiydi va yozadi.
2. Qo'shish qoidasini (VI = 5 + 1) va ayirish qoidasini (IV = 5 − 1; faqat IV, IX, XL, XC) qo'llaydi; bir belgi 3 martadan ko'p takrorlanmasligini biladi.
3. Rimliklar usulida qo'shadi: belgilarni birlashtirib, IIIII → V, VV → X, XXXXX → L, LL → C bilan tartibga soladi.
4. Rim raqamlari bilan qo'shish-ayirishni oddiy songa aylantirib ham bajaradi.
5. Pozitsion tizimda raqam qiymati o'rniga bog'liqligini (352 dagi 5 — 50), nopozitsion tizimda esa belgi qiymati o'zgarmasligini (X doim 10) tushuntiradi; nol nega kerakligini biladi.
6. Al-Xorazmiy va "algoritm" so'zi haqida aytib beradi.

## 2. Asboblar

- **Belgi kartochkalari** I, V, X, L, C (va hikoyada M).
- **Rim klaviaturasi:** 1-qator `I V X L C`, 2-qator `⌫` va `Tayyor`. Yasalgan son kataklarda, yonida jonli qiymat: `= 12`.
- **Rimliklar laganı** (tray): belgilar kattadan kichikka tartiblangan kataklar; qoida tugmalari `IIIII → V`, `VV → X`, `XXXXX → L`, `LL → C`.
- **Raqam klaviaturasi** (umumiy `askNumber`).
- **Yoyilma:** Rim soni — har belgi ostida qiymati (`X X V I I` → `10 10 5 1 1`); oddiy son — har raqam ostida o'rni va qiymati (`3 5 2` → `300 50 2`).

## 3. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (Rim toshi)
   ├─► 1-bosqich: O'qish va yozish   [belgilar → qo'shish qoidasi → ayirish qoidasi → mashq 3]
   ├─► 2-bosqich: Qo'shish va ayirish [Rimliklar usuli (qo'shish) → oddiy sonda → ayirish namoyishi → mashq 3]
   └─► 3-bosqich: Pozitsion tizim     [yoyilma → 352/325 → nol → mashq 3 → hikoya] → tabrik
```

**Kirish:** "Qabila qadimgi tosh topdi!" / (Shogird) "Unda gʻalati belgilar bor: XII, XXVI…" / "Bular — Rim raqamlari. Sezar askarlari shunday yozgan."

## 4. 1-bosqich: O'qish va yozish

1. **Belgilar:** I = 1, V = 5, X = 10, L = 50, C = 100. "I — bitta barmoq, V — ochiq qoʻl, X — ikki qoʻl."
2. **Qo'shish qoidasi:** "Belgilar kattadan kichikka yozilsa — qoʻshiladi: VII = 5 + 1 + 1." Bola yasaydi: **7**, keyin **12**, keyin **26** (jonli qiymat yordam beradi).
3. **Ayirish qoidasi:** "Kichik belgi kattasidan oldin tursa — ayiriladi: IV = 5 − 1 = 4." Faqat IV, IX, XL, XC. "Bir belgi 3 martadan koʻp takrorlanmaydi: IIII emas — IV." Bola **4** ni yasaydi (IIII yozsa — shu qoida aytiladi).
4. **Mashq** (3 ta to'g'ri, 1–100), tasodifiy:
   - **O'qish:** "Toshda {XLII} yozilgan. Bu qaysi son?" — raqam klaviaturasi. 1-xato: yoyilma (`X L I I` ostida `−10 50 1 1`). 2-xato: javob.
   - **Yozish:** "{42} ni Rim raqamida yoz." — Rim klaviaturasi. Qiymat to'g'ri, lekin yozuv nostandart bo'lsa (IIII, VV…): "Qiymat toʻgʻri, lekin Rimliklar boshqacha yozgan…" — 1-xato sifatida. 2-xato: to'g'ri yozuv.

## 5. 2-bosqich: Qo'shish va ayirish

1. **Rimliklar usulida qo'shish (interaktiv):** XII + VIII. Belgilar laganga birlashtiriladi: `X V I I I I I`. Bola qoida tugmalarini bosadi: `IIIII → V` → `X V V`; `VV → X` → `X X`. Qo'llab bo'lmaydigan qoida — "Bunday belgilar yetarli emas". Tartibga tushgach: "XII + VIII = XX".
2. **Oddiy sonda:** "Endi oʻzimiznikida: 12 + 8 = ?" — raqam klaviaturasi. "Bir zumda!"
3. **Ayirish namoyishi (bola kuzatadi):** XV − VII: `X V` → V ni olib tashlaymiz → `X`; I yo'q — X ni V V ga "sindiramiz" → `V V`; V ni I I I I I ga → `V I I I I I`; I I ni olib tashlaymiz → `V I I I` = 8. "Rimliklar buni hisob taxtasida qilgan." Keyin: "15 − 7 = ?" — raqam klaviaturasi.
4. **Mashq** (3 ta to'g'ri), tasodifiy:
   - **Rimliklar usuli (qo'shish):** misol, lagan va qoida tugmalari, "Tayyor". Operandlar va yig'indida 4 va 9 raqami yo'q (yozuv faqat qo'shish qoidasida), yig'indi ≤ 80. "Tayyor" erta bosilsa (qoida hali qo'llanadi) — 1-xato: "Hali tartibga solsa boʻladi". 2-xato: yakuniy yozuv.
   - **Aylantirib hisoblash:** "{XXV} + {XVII} = ?" yoki "{XL} − {XII} = ?" — natija Rim klaviaturasida. Qo'shishda yig'indi ≤ 100; ayirishda natija ≥ 1. 1-xato: oddiy sonlarda misol ko'rsatiladi (`25 + 17 = 42`). 2-xato: javob.

## 6. 3-bosqich: Pozitsion tizim

1. **Yoyilma:** 352 — `3 yuz`, `5 oʻn`, `2 bir` → `300 + 50 + 2`. Rim: XXVII → `10 + 10 + 5 + 1 + 1`.
2. **Tajriba:** "Almashtir" tugmasi 5 va 2 ning joyini almashtiradi — 352 → 325: 5 raqami 50 dan 5 ga aylanadi. "Oddiy sonda raqam qiymati oʻrniga bogʻliq — bu **pozitsion** tizim." / "Rimda X qayerda tursa ham 10 — bu **nopozitsion** tizim."
3. **Nol:** "105 da 0 oʻnlar joyini saqlaydi — usiz 15 boʻlib qolardi." / "Rimda nol yoʻq: 105 — CV."
4. **Mashq** (3 ta to'g'ri): "{352} sonidagi {5} raqami nechaga teng?" — raqam klaviaturasi. Sonlar 2–3 xonali, raqamlari har xil va noldan farqli. 1-xato: o'rinlar belgisi (`yuz / oʻn / bir`). 2-xato: yoyilma.
5. **Hikoya:**
   1. (abak) "Rimliklar hisobni hisob taxtasida qilgan." / "Rim raqamlari faqat yozib qoʻyish uchun edi."
   2. (raqamlar) "Hindistonda 0 va oʻnlik pozitsion sonlar paydo boʻldi."
   3. (olim) "Muhammad al-Xorazmiy — Xorazmdan chiqqan buyuk olim — bu sonlar haqida kitob yozdi." / "Kitob Yevropaga yetib bordi va butun dunyo shu sonlarni ishlata boshladi."
   4. (kompyuter) "«Algoritm» soʻzi al-Xorazmiy nomidan kelib chiqqan." / "Kompyuterlar ham algoritm bilan ishlaydi!"
   5. (tosh) Joriy yil Rim raqamida (masalan, 2026 — MMXXVI): "M — 1000. Bu yil Rim raqamida shunday yoziladi!"

**Tabrik:** "Tabriklayman! Endi sen Rim raqamlarini bilasan!" — "I V X L C — 1 5 10 50 100", "Kichik belgi oldinda — ayiriladi: IV = 4", "Oddiy sonlarda raqam qiymati oʻrniga bogʻliq".

## 7. Ekran tuzilishi

3 zona (qo'llanma zonasi yo'q). Klaviaturalar boshqaruv zonasida; lagan, kataklar, yoyilma ish maydonida; klaviatura paytida ixcham rejim.

## 8. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `js/roman.js` | Sof hisob: `toRoman`, `fromRoman`, standart yozuv, qo'shish qoidasidagi yozuv, birlashtirish, tartibga solish qoidalari, topshiriqlar. Node testlari. |
| `js/game-art.js` | Tosh, abak, raqamlar, olim, kompyuter rasmlari (matnsiz) |
| `js/roman-ui.js` | Belgi kataklari, Rim klaviaturasi, lagan va qoida tugmalari, yoyilmalar |
| `js/scenes/*.js` | Yozish/o'qish/lagan/hisob/o'rin vazifalari, bosqichlar, tabrik |
| `../umumiy/js/practice.js` | Mashq sikli va ikki urinish (4- va 5-o'yin uchun umumiy — 4-o'yindan chiqariladi) |
| `js/main.js` | `QK.app.start` (kalit `rim-toshi:v1`) |

## 9. Bu o'yinga kirmaydi

D (500) va 100 dan katta sonlar bilan mashq (M faqat yil misolida), Rim usulida interaktiv ayirish, ko'paytirish va bo'lish.

# 13 — Bayt sandigʻi: dizayn

**Mavzu:** Axborot oʻlchovi — bit, bayt, matn hajmi, kilobayt
**Yosh:** 8–12
**Taxminiy davomiyligi:** 20 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-21)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Bu "Axborot oʻlchovi" blokining birinchi oʻyini (13 bayt → 14 rasm → 15 video → 16 xotira ombori).
Bogʻliq oʻyin: `04` chiroqlar (2ⁿ naqsh, "eng kamida nechta chiroq", hikoyada bit va bayt). 2ⁿ ni qaytadan oʻrgatmaymiz — eslatib, davom ettiramiz.

> Qabilaga kompyuter keldi. U har bir harfni kichik chiroqlar — bitlar bilan saqlaydi.
> Bitta harf uchun nechta bit kerak? Nega kompyuterda aynan **8 bit = 1 bayt**?

**Blok boʻyicha qarorlar** (muallif bilan kelishilgan):
- **1 Kbayt = 1024 bayt.** "Taxminan 1000" faqat chamalashda.
- Birliklar toʻliq soʻz bilan: "bit", "bayt", "Kbayt" (KB/Kb emas — bit va bayt chalkashmasin).
- "8 bit = 1 bayt" — **tabiat qonuni emas, kelishuv**: shunday deb ochiq aytiladi, sababi bilan.
- Katta sonlarni hisoblatmaymiz: hisob mashqlari javobi ≤ 100; kilobayt bilan — taqqoslash va kichik koʻpaytuvchilar.

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. Klaviaturadagi belgilar (≈ 95 ta) uchun kamida 7 bit kerakligini, odamlar zaxira bilan **8 bitni tanlab, uni 1 bayt deb atashganini** tushuntiradi. 1 baytda 256 xil naqsh borligini biladi.
2. Baytni bitga (× 8) va bitni baytga (: 8) aylantiradi.
3. Matn hajmini hisoblaydi: **har bir belgi — 1 bayt**, boʻsh joy va tinish belgilari ham belgi.
4. **1 Kbayt = 1024 bayt** ekanini va 1024 qayerdan kelganini (2 ni 10 marta koʻpaytirish, 1000 ga eng yaqini) biladi.
5. "1 Kbayt" va "1000 bayt"ni taqqoslaydi; sahifalar hajmini Kbaytda hisoblaydi.

## 2. Qahramonlar

Oqsoqol va Shogird (`umumiy/`). Kirishda kompyuter rasmi.

## 3. Asboblar

- **Bitlar qatori** — N ta kichik chiroq (doira), yonida "5 bit → 32 xil naqsh".
- **Bit hisoblagichi** — `−` / `+` (1–8 bit). Umumiy `ui.counter` ga `unit` qoʻshiladi ("5 ta bit").
- **Belgilar roʻyxati** — qoʻshilib boradigan toʻplamlar: `a–z` 26, `A–Z` 26, `0–9` 10, `. , ! ? …` 33.
- **Sandiq (bayt)** — 8 ta bit-doirali quti. Ichida belgining haqiqiy kodi: `A` → `01000001`.
- **Belgi tugmalari** — xabarning har belgisi alohida tugma; boʻsh joy `␣` bilan koʻrinadi.
- **Kilobayt qutisi** — 32 × 32 = 1024 ta mayda katak, bosilganda toʻladi.

## 4. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (qabilaga kompyuter keldi)
   ├─► 1-bosqich: Nega 8 ta bit?     [toʻplamlar → eng kamida nechta bit → 8 bit = 1 bayt → mashq 3]
   ├─► 2-bosqich: Matnni oʻlchaymiz  [belgilarni sandiqqa joylash → 1 belgi = 1 bayt → mashq 3]
   └─► 3-bosqich: Kilobayt           [×2 ni 10 marta → 1024 → Kbayt qutisi → mashq 3 → hikoya] → tabrik
```

**Kirish:** "Qabilamizga kompyuter keldi!" / (Shogird) "U harflarni qanday eslab qoladi?" / "Kichik chiroqlar — bitlar bilan. Xuddi 4-oʻyindagidek!"

## 5. 1-bosqich: Nega 8 ta bit?

1. **Toʻplamlar** (har biri: toʻplam qoʻshiladi → bola hisoblagich bilan bit sonini tanlaydi → "Tayyor"):
   1. Kichik harflar `a–z`: 26 ta → **5 bit** (32).
   2. + Katta harflar `A–Z`: jami 52 → **6 bit** (64).
   3. + Raqamlar `0–9`: jami 62 → yana **6 bit** (64 hali yetadi — bola buni oʻzi koʻradi).
   4. + Tinish belgilari va boʻsh joy: jami 95 → **7 bit** (128).
   - Tekshiruv: kam boʻlsa — "Yetmaydi: 5 bit — 32 xil naqsh, kerak 52." Koʻp boʻlsa — "Yetadi, lekin kamroq bit bilan ham boʻladi. Eng kamida nechta?" Toʻgʻri — ✓.
   - Klaviatura haqida bir gap: "Klaviaturada 26 ta harf tugmasi bor. Oʻ, sh kabi harflar ham shulardan yasaladi."
2. **8 bit:** "7 bit yetdi. Lekin kompyuter yaratganlar yana 1 ta zaxira bit qoʻshib, 8 ni tanlashdi." / "8 bit — 1 bayt. Unda 256 xil naqsh bor."
3. **Ta'rif** (sandiq rasmi bilan): `1 bayt = 8 bit`, `2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 = 256`. "Bu — odamlar kelishib olgan qoida. Qadimgi kompyuterlarda 6 va 7 bitli baytlar ham boʻlgan." / "8 — kompyuterga qulay son: 2 × 2 × 2."
4. **Mashq** (3 ta to'g'ri), tasodifiy ikki xil:
   - "N bayt — necha bit?" (N = 2–9; N ta sandiq koʻrsatiladi). 1-xato: "8 + 8 + … = ?". 2-xato: "N × 8 = …".
   - "M bit — necha bayt?" (M = 16–72, 8 ga karrali; M ta bit bitta qatorda). 1-xato: bitlar 8 tadan sandiqlarga ajraladi. 2-xato: "M : 8 = …".

## 6. 2-bosqich: Matnni oʻlchaymiz

1. **Joylash:** ekranda `SALOM, ALI!` — har belgi tugma. Bola bosgan belgi sandiqqa tushadi (ichida uning 8 bitli kodi), hisoblagich: "Baytlar: 3". Birinchi marta boʻsh joy bosilganda: "Boʻsh joy ham belgi! U ham 1 bayt oladi." Tinish belgisida: "Vergul va undov ham belgi!"
2. Hammasi joylanganda: "11 ta belgi — 11 bayt. Bitda: 11 × 8 = 88 bit."
3. **Ta'rif:** "Har bir belgi — 1 bayt: harf, raqam, boʻsh joy, nuqta — hammasi." / "Har belgining oʻz naqshi bor: A — 01000001. Bu jadval ASCII deyiladi." Formula: `belgilar = baytlar`, `bitlar = baytlar × 8`.
4. **Mashq** (3 ta to'g'ri), xabar butun holda koʻrsatiladi (oʻ, gʻ, ʻ ishlatilmaydi):
   - "Bu xabar necha bayt?" (6–16 belgi). 1-xato: xabar belgilarga ajraladi (`␣` bilan). 2-xato: "N ta belgi — N bayt".
   - "Bu xabar necha bit?" (6–12 belgi, javob ≤ 96). 1-xato: belgilarga ajraladi + "Har belgi — 8 bit". 2-xato: "N × 8 = …".

## 7. 3-bosqich: Kilobayt

1. **Ikkilantirish:** ekranda `1`, tugma `× 2`. Bola 10 marta bosadi: 2, 4, 8 … 256 ("256 — bitta baytdagi naqshlar!") … 1024. "10 marta ikkilantirding — 1024. Bu 1000 ga juda yaqin!" / "Shuning uchun 1024 bayt **kilobayt** deyiladi. Kilo — ming degani."
2. **Kilobayt qutisi:** 32 × 32 = 1024 katak, "Toʻldir" — kataklar tez toʻladi. "1024 ta bayt — 1 Kbayt."
3. **Ta'rif:** `1 Kbayt = 1024 bayt`. "Bir sahifa kitob — taxminan 2000 belgi, yaʼni 2 Kbaytga yaqin."
4. **Mashq** (3 ta to'g'ri), tasodifiy uch xil:
   - "Bir sahifa — 2 Kbayt deb olamiz. N sahifa — necha Kbayt?" (N = 2–10). 1-xato: sahifalar ostida "2". 2-xato: "N × 2 = …".
   - "X bayt — necha Kbayt?" (X = 1024 × k, k = 2–6). 1-xato: "1 Kbayt = 1024, 2 Kbayt = 2048 …" jadvali. 2-xato: "k × 1024 = X".
   - "Qaysi biri katta?" — `k Kbayt` va `m bayt` (m = 1000 × k yoki 1000 × (k + 1)). 1-xato: "k Kbayt = k × 1024 = … bayt". 2-xato: ikkalasi baytda, `>` belgisi bilan.
5. **Hikoya** (rasm + 1–2 pufak):
   1. SMS: "Qisqa SMS — 100 baytga yaqin." / "Bir sahifa — 2 Kbayt atrofida."
   2. Kitob: "Qalin kitob — 1000 Kbaytdan ham koʻp!" / "Bunday sonlar uchun yanada katta birlik bor — keyingi oʻyinlarda."
   3. Kulgich: "Aslida baʼzi belgilar koʻproq joy oladi." / "Oʻ harfidagi ʻ belgisi — 2 bayt, kulgich (emoji) — 4 bayt."

**Tabrik:** "Tabriklayman! Endi sen matnni oʻlchay olasan!" — "8 bit = 1 bayt", "1 belgi = 1 bayt (boʻsh joy ham!)", "1024 bayt = 1 Kbayt".

## 8. Ekran tuzilishi

1–2-o'yindagi 3 zona (qo'llanma zonasi yo'q). Ish maydonida bitlar/sandiqlar/xabar, boshqaruvda hisoblagich, raqam klaviaturasi va tanlov tugmalari. Sandiq va xabar paytida ixcham rejim (qahramonlar kichik).

## 9. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `js/bytes.js` | Sof hisob: toʻplamlar, eng kamida nechta bit, belgining 8 bitli kodi, xabarlar, ikkilantirish, topshiriqlar. Node testlari. |
| `js/game-art.js` | Kompyuter, sandiq (8 bit), hikoya rasmlari (SMS, kitob, kulgich) |
| `js/bytes-ui.js` | Bitlar qatori, sandiq, belgi tugmalari, xabar, kilobayt qutisi |
| `js/scenes/common.js` | Umumiy sahna qismlari |
| `js/scenes/stage1.js`, `stage2.js`, `stage3.js`, `final.js` | Bosqichlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `bayt-sandigi:v1`) |

## 10. Bu o'yinga kirmaydi

Megabayt va undan kattasi (14–16-oʻyinlar), rasmiy KiB/KB farqi (16-oʻyin hikoyasida), UTF-8 tafsilotlari (faqat hikoyadagi qiziq fakt), toʻliq ASCII jadvali.

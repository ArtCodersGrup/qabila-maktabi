# Musobaqa: dizayn

**Nima:** ikki bola bitta ekranda (telefon, planshet yoki kompyuter) navbatma-navbat savolga javob berib bellashadi.
**Yosh:** 8–12 (qiyinlikni oʻyinchilar tanlaydi)
**Davomiyligi:** 3, 5 yoki 10 daqiqa har bir oʻyinchiga
**Holati:** kod yozildi, brauzerda 3 oʻlchamda oʻynab chiqildi — muallif koʻrishini kutmoqda (2026-09-22)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Savollar oʻyinlar mavzularidan olinadi (1–25-oʻyinlar va tezkor tugmalar).
Bu oʻyin emas, **musobaqa rejimi**: bosqichlar ham, tushuntirish ham yoʻq. Bola mavzuni oldin oʻyinda oʻrgangan boʻladi.

---

## 1. Maqsad

- Oʻrganilganni **tez va aniq** qoʻllashga undash: sinfda, uyda aka-uka yoki doʻstlar bilan.
- Xato qilingan savollar oxirida **toʻgʻri javobi bilan** koʻrsatiladi, shunda musobaqa ham oʻrgatadi.

## 2. Qoidalar

1. **Ikki tomon:** chapda **Oy** (koʻk), oʻngda **Quyosh** (binafsha). Tomonlar doim shunday.
2. **Sozlash:** mavzular (bir nechta), qiyinlik (bir nechta: Oson / Oʻrta / Qiyin) va vaqt (3 / 5 / 10 daqiqa) tanlanadi. Ikkala oʻyinchi uchun bir xil.
3. **Kim boshlaydi — tanga.** Oqsoqol tangani tashlaydi: bir tomonida quyosh, bir tomonida oy. Tasodifiy tushadi; qaysi tomoni bilan tushsa, oʻsha boshlaydi.
4. **Shaxmat soati.** Har kimning oʻz soati bor. Savol kimga berilgan boʻlsa, faqat oʻshaning soati yuradi.
   Soat **toʻxtaydi**: toʻgʻri/xato koʻrsatilayotganda, tanga paytida, pauzada va sahifa yashirilganda.
5. **Raund — juft savol.** Raundda ikkala oʻyinchi navbat bilan bittadan savol oladi: **bir xil mavzu, bir xil tur, bir xil qiyinlik, lekin sonlari boshqa** (koʻchirib boʻlmaydi). Keyingi raundda mavzu tasodifiy almashadi.
   **Raundni navbat bilan boshlashadi** (muallif qarori, 2026-09-22): Oʻng, Chap | Chap, Oʻng | Oʻng, Chap … Yangi turdagi savolga birinchi boʻlib duch kelgan qiynaladi, ikkinchisi turini koʻrib olgan boʻladi — shuning uchun bu navbat bilan. Tanga faqat 1-raundni kim boshlashini aniqlaydi.
6. **3 ta yurak.** Xato javob bitta yurakni oladi, navbat raqibga oʻtadi. Qayta urinish yoʻq. **Toʻgʻri javob va yechim musobaqa paytida koʻrsatilmaydi** (muallif qarori, 2026-09-22: ikkinchi oʻyinchi xuddi shu turdagi savolni oladi) — faqat oxirida.
7. **Oʻtkazish** — har kimda **bir marta**: navbat jarimasiz raqibga oʻtadi (toʻgʻri javob — oxirida).
8. **Yutqazish:**
   - **Vaqti tugagan** darhol yutqazadi.
   - **Yuraklari tugagan** yutqazadi, lekin **raund oxirigacha oʻynaladi**: agar raundni boshlagan bola oxirgi yuragini yoʻqotsa, ikkinchisi oʻz juft savoliga baribir javob beradi.
   - **Ikkalasi ham chiqib ketsa** (ikkalasining ham yuragi tugasa yoki ikkinchisining vaqti tugasa) — soatida **koʻproq vaqt qolgan** yutadi.
   - **Savollar tugasa** — zaxira qoida (amalda boʻlmaydi, 4-boʻlimga qarang): yuragi koʻp qolgan, teng boʻlsa vaqti koʻp qolgan yutadi.
   - Hammasi teng boʻlsa — **durang**.
9. **Pauza** — ikkala soat toʻxtaydi, savol yashiriladi (pauzada oʻylab olib boʻlmaydi).

## 3. Ekranlar

```
Sozlash ──► Tanga ──► Musobaqa (raundlar) ──► Natija
   ▲                                            │
   └──────────── "Sozlamalar" ◄─────────────────┤
                 "Yana oʻynash" ──► Tanga ◄─────┘
```

### 3.1. Sozlash
- Sarlavha **"Musobaqa"**, "◀︎ Barcha oʻyinlar" havolasi.
- **Mavzular** — 5 ta tugma (bir nechtasini tanlash mumkin, kamida bittasi): Kodlash va shifrlash · Ikkilik kod · Axborot oʻlchovi · Sanoq tizimlari · Sunʼiy intellekt.
- **Qiyinlik** — Oson · Oʻrta · Qiyin (bir nechtasi, kamida bittasi). Har raundda tanlanganlar ichidan tasodifiy.
- **Vaqt** — 3 · 5 · 10 daqiqa (bittasi, boshida 5).
- Eslatma: "Har kimda 3 ta yurak va 1 ta oʻtkazish."
- **"Boshlash"**. Tanlov brauzerda eslab qolinadi (`musobaqa:v1`).

### 3.2. Tanga
- Oʻrtada katta tanga, ostida: "Quyosh tushsa — oʻngdagi, oy tushsa — chapdagi boshlaydi."
- "Tangani tashla" → tanga aylanadi (≈1,5 s) → tomonlardan biri bilan tushadi → "Quyosh! Oʻngdagi boshlaydi." → oʻsha tomon muxlisi quvonadi → "Boshladik ▶︎".

### 3.3. Musobaqa
- **Oʻyinchi panellari** (chap — Oy, oʻng — Quyosh): belgi, soat (`4:59`), 3 ta yurak, "↷ Oʻtkazish" tugmasi.
  - Navbatdagi panel **rangli va yorqin**, soati katta; ikkinchisi oq va xira.
  - Soat 30 soniyadan kam qolsa — sekin yonib-oʻchadi; oxirgi 10 soniyada har soniyada "tak".
- **Savol kartasi** (oʻrtada): yuqorida navbatdagi oʻyinchi rangidagi chiziq — "Quyosh navbati · Sanoq tizimlari · ★★☆". Ostida savol va kerak boʻlsa rasm/jadval.
- **Javob:** raqam klaviaturasi, maxsus tugmalar (0 1; I V X L C; 0–9 A–F) yoki 2–4 ta variant.
- **Toʻgʻri:** ✓ "Toʻgʻri!", muxlis sakraydi va bayrogʻini silkitadi ("Barakalla!"), ≈1,2 s dan keyin navbat almashadi.
- **Xato:** yurak sinadi, "↻ Xato. Toʻgʻri javob musobaqa oxirida koʻrsatiladi.", muxlis: "Hechqisi yoʻq!". 1,6 soniyadan keyin navbat raqibga (soatlar toʻxtagan).
- **Oʻtkazish:** "Oʻtkazildi. Toʻgʻri javob: …", "Davom ▶︎".
- Raundni boshlagan bola yuragini yoʻqotsa: "Oyning yuraklari tugadi. Quyosh oxirgi savolga javob beradi."
- **🏠 yoki ⏸** — pauza oynasi: "Davom etish" · "Musobaqani tugatish" (sozlashga qaytadi).

### 3.4. Natija
- Gʻolib belgisi va **"Quyosh yutdi!"** (yoki "Durang!"), sababi: "Oyning yuraklari tugadi" / "Oyning vaqti tugadi" / "Ikkalasi ham chiqdi — Quyoshning vaqti koʻproq qoldi" / "Savollar tugadi".
- Gʻolib muxlisi quvonadi: "Tabriklaymiz!"; ikkinchisining muxlisi: "Yaxshi oʻynading!".
- Jadval (har tomon): ✓ toʻgʻri · xato · ↷ oʻtkazilgan · qolgan vaqt · qolgan yurak.
- **"Xatolar ustida ishlaymiz"** roʻyxati: savol, "Sening javobing: …" (yoki oʻtkazildi / vaqt tugadi) va "Toʻgʻri javob: …". Yechilish yoʻli koʻrsatilmaydi.
- "Yana oʻynash" (oʻsha sozlamalar, yangi tanga) · "Sozlamalar".

## 4. Savollar

Har savol **tasodifiy yasaladi** (sonlar har safar boshqa). Bir musobaqada bir xil savol ikki marta chiqmaydi.
Tayyor roʻyxatli yoki kichik turlar (AI tasdiqlari, 2–4 chiroq) tugasa, oʻsha tur navbatdan chiqadi.
Tanlangan **hamma** savol ishlatilib boʻlsa, dasta **qaytadan aralashtiriladi**: musobaqa toʻxtamaydi, takror faqat shundan keyin boshlanadi.
Tor tanlovda ham (bitta mavzu, bitta qiyinlik) kamida 15 raund takrorsiz chiqadi — testlar tekshiradi.
Ketma-ket ikki raundda bir xil tur chiqmaydi (boshqa tur boʻlsa).

Javob turlari: **son** (raqam klaviaturasi), **belgilar** (maxsus tugmalar: 0/1, Rim, n-lik raqamlar), **variant** (2–4 ta).

### 4.1. Kodlash va shifrlash (1–3-oʻyinlar)
| Tur | Oson | Oʻrta | Qiyin |
|---|---|---|---|
| **Soʻzlar soni** (son) | aⁱ: 2–3 harf, 2–4 harfli (≤ 27) | aⁱ (≤ 100) yoki "i harfgacha" a + … + aⁱ | "p kishiga i harfli ism — eng kamida nechta harf?" |
| **Morze** (variant) | 3 harfli soʻzni oʻqish | 4 harfli | 5 harfli |
| **Sezar** (variant/son) | harfni kalit 1–3 ga oldinga surish (aylanmasdan) | harfni orqaga surish (ochish), kalit 1–5, aylanib | soʻzni ochish yoki "A → D: kalit nechchi?" |
| **Alifbo tartibi** (son/variant) — 2026-09-23 | "K harfi nechanchi?" yoki "7-harf qaysi?" (1–15) | 10–29 | — |

Morze savolida **qoʻllanma** koʻrsatiladi: variantlardagi barcha harflar va ularning kodlari (2-oʻyindagidek).
Sezar savolida **alifbo qatori** (29 harf) koʻrsatiladi.

### 4.2. Ikkilik kod (4-oʻyin)
| Tur | Oson | Oʻrta | Qiyin |
|---|---|---|---|
| **Naqshlar soni** (son) | 2–4 oddiy chiroq → 2ⁿ | 5–7 oddiy yoki 2–4 rangli (oʻchiq, sariq, koʻk) → 3ⁿ | "N ta narsa uchun eng kamida nechta chiroq?" |
| **Ikkilikdan oʻnlikka** (son) | 1–15, xona qiymatlari (8-4-2-1) koʻrsatiladi | 8–31 | 16–63 |
| **Oʻnlikdan ikkilikka** (0/1) | 2–15, 8-4-2-1 koʻrsatiladi | 8–31 | 16–63 |
| **Nechta chiroq yoniq** (son) — 2026-09-23 | 1–31 dagi 1 lar soni | 16–127 | — |
| **Xona qiymati** (son) — 2026-09-23 | oʻngdan 1–4-oʻrin (xona qiymatlari koʻrsatiladi) | oʻngdan 4–7-oʻrin | — |
| **Ikkilikda qoʻshish** (0/1) — 2026-09-23 | — | ikkita son ≤ 7 | ikkita son ≤ 15 |
| **Qaysi kattaroq** (variant) — 2026-09-23 | — | 3–31 | 8–127 |
| **Keyingi son** (0/1) — 2026-09-23 | 1–14 | 8–62 | — |

### 4.3. Axborot oʻlchovi (13–16-oʻyinlar)
| Tur | Oson | Oʻrta | Qiyin |
|---|---|---|---|
| **Bit va bayt** (son) | n bayt → bit, bit → bayt | n Kbayt → bayt (× 1024); matn necha bayt | Mbayt → Kbayt; bayt → Kbayt |
| **Piksel** (son) | oq-qora w × h → bit | oq-qora → bayt; ranglar soni → bit | rangli (3 bayt) w × h → bayt |
| **Kadr** (son) | 10–12 kadr/s × soniya | 24 kadr/s: kadrlar yoki soniyalar | 1 kadr hajmi × kadrlar soni |
| **Birliklar** (variant) | birliklar tartibi, 1 bayt = 8 bit | "Qaysi katta?" (Kbayt / bayt) | "Qaysi katta?" (Gbayt / Mbayt, Tbayt / Gbayt; teng ham boʻladi) |

1 Kbayt = 1024 bayt (13-oʻyin qarori).

### 4.4. Sanoq tizimlari (5, 17–22-oʻyinlar)
| Tur | Oson | Oʻrta | Qiyin |
|---|---|---|---|
| **Rimni oʻqish** (son) | 2–20 | 21–50 | 51–100 |
| **Rimda yozish** (I V X L C) | 2–20 | 21–50 | 51–100 |
| **Oʻnlikka** (son) | 2 xonali, 3–8-lik | 3 xonali, 3–6-lik | 16-lik (2 xonali) yoki 3 xonali 7–8-lik |
| **Oʻnlikdan** (n-lik raqamlar) | 5–24 → 3–5-lik | → 2-lik (≤ 31) yoki 6–8-lik (≤ 63) | → 16-lik (16–255) |
| **Tizimlar** (son / raqamlar) | "3042 — eng kamida necha-lik?" | "Qaysi tizimda 3 + 4 = 10?" | n-lik qoʻshish (2–9-lik, 2 xonali) |

### 4.5. Sunʼiy intellekt (6–12-oʻyinlar)
| Tur | Oson | Oʻrta | Qiyin |
|---|---|---|---|
| **Toʻgʻrimi?** (2 variant) | tasdiqlar (≈ 20 ta, 6–12-oʻyinlardan) | — | — |
| **AI mi?** (Ha / Yoʻq) | kalkulyator, chatbot… (12-oʻyin misollari) | — | — |
| **Neyron** (Ha / Yoʻq, son) | ogʻirliklar +1: yonadimi? | ogʻirliklar +1/−1: yonadimi? | yigʻindi nechchi? |
| **AI xaritasi** (variant) | — | misol yoki taʼrif → doira | ish → vazifa (koʻrish, til, harakat, hisob) |
| **Keyingi soʻz** (variant / son) | — | gaplardan: keyingi soʻz qaysi? | juftlik necha marta uchradi? |

Neyron qoidasi 11-oʻyindagidek: yigʻindi ≥ chegara — yonadi.

### 4.6. Klaviatura (23-oʻyin va tezkor tugmalar) — 2026-09-22 da qoʻshildi
| Tur | Oson | Oʻrta | Qiyin |
|---|---|---|---|
| **Qaysi barmoq?** (variant) | asosiy qator harfi | yuqori va pastki qator harfi | — |
| **Qaysi qator?** (variant) | har qanday harf | — | — |
| **Ikki tugma** (variant) | Oʻ, Gʻ, Sh, Ch, Ng qanday yoziladi | — | — |
| **Qaysi Shift?** (variant) | — | katta harf uchun chap yoki oʻng Shift | — |
| **Aniqlik / tezlik** (son) | — | — | "20 belgi, 25 bosish — necha foiz?", "30 soniyada 40 belgi — belgi/daqiqa?" |
| **Poyga** (variant) | — | — | Oy yoki Quyosh yutdi (aniqlik ≥ 90%, keyin vaqt) |
| **Tezkor tugma nima qiladi / qaysi tugma** (variant) | Ctrl + C, V, Z, S | Ctrl + X, A, P, F, Y | Ctrl + B, I, U, E, L, R |
| **Vaziyat** (variant) | — | bitta tugma: oʻchirib yubording, saqlash, qidirish, Mac'da ⌘ | ikki tugma ketma-ket: koʻchirish (X, V), nusxa (C, V), hammasini qalin (A, B) |

Barmoq, Shift va poyga qoidasi 23-oʻyin mantiqidan (`23-on-barmoq/js/typing.js`). Tezkor tugmalar hali oʻyinda oʻrgatilmagan (tezkor tugmalar oʻyini muhokamada) — roʻyxat `savollar.js` dagi `SHORTCUTS`; oʻyin yozilganda uning mantiqiga koʻchiriladi. Tekislash (E, L, R) — Word dasturidagi tugmalar.

### 4.6b. Klaviatura — 2026-09-23 da qoʻshilgan turlar
| Tur | Oson | Oʻrta | Qiyin |
|---|---|---|---|
| **Tugma vazifasi** (variant) | "Enter nima qiladi?" (12 ta tugma) | "Qaysi tugma buni qiladi?" | — |
| **Klaviatura bilimi** (variant) | oʻn barmoq usuli, F/J doʻngchalari, qayerga qarash | tezlik oʻlchovi, asosiy qator harflari | — |

Tezkor tugmalar roʻyxati 15 tadan **21 taga** (Ctrl+N/O/W, Alt+Tab, Ctrl+Home/End), vaziyatlar 8 tadan **14 taga** kengaytirildi.

### 4.7. Mantiq (24–25-oʻyinlar) — 2026-09-22 da qoʻshildi
| Tur | Oson | Oʻrta | Qiyin |
|---|---|---|---|
| **Rostmi?** (Rost / Yolgʻon) | ikki oddiy gap VA yoki YOKI bilan: «Qor oq VA 3 + 3 = 7» | — | — |
| **Amal** (1 / 0) | A VA B, A YOKI B | XOR va EMAS A ham | — |
| **Hayotiy qoida** (Ha / Yoʻq) | qoidada faqat VA, YOKI (choy, darvoza) | EMAS bilan (yomgʻir va soyabon, robot…) | — |
| **B qanday boʻlsin?** (4 variant) | — | 1 / 0 / Farqi yoʻq / Boʻlmaydi | — |
| **Qaysi amal?** (variant) | — | jadval → VA / YOKI / XOR | — |
| **Zinapoya** (Ha / Yoʻq) | — | kalitlar 0–5 marta bosildi: yonadimi? | — |
| **Ifoda** (1 / 0) | — | — | A VA (EMAS B), EMAS (A YOKI B) … |
| **Sxema** (Ha / Yoʻq) | — | — | EMAS (A VA B), (EMAS A) YOKI B … |
| **Qoʻshish** (variant) | — | — | yarim qoʻshuvchi (00…11) yoki ikki xonali: 01 + 11 |

Qiymatlar 24-oʻyin (`logic.js`) va 25-oʻyin (`gates.js`) mantiqidan olinadi; testlar ularni mustaqil (bit amallari bilan) qayta hisoblaydi.

### 4.7b. Mantiq — 2026-09-23 da qoʻshilgan turlar
| Tur | Oson | Oʻrta | Qiyin |
|---|---|---|---|
| **Koʻp amalli ifoda** (variant) | — | "EMAS A VA B" koʻrinishi (VA/YOKI/XOR) | "(A VA B) YOKI C", kirishlardan biriga EMAS |
| **Inkor** (variant) | — | "«Hamma bolalar keldi» gapining teskarisi qaysi?" (8 ta gap) | oʻsha |

Hayotiy qoidalar (24-oʻyindagi `LIFE`) 5 tadan **11 taga** koʻpaydi; rost/yolgʻon faktlar 6+6 dan **14+14 taga**.

## 5. Koʻrinish

- **Ranglar:** Oy — `#2F6FDE` (koʻk), Quyosh — `#8E5BD0` (binafsha). Yashil — toʻgʻri, toʻq sariq — "yana"; qizil ishlatilmaydi.
- **Muxlislar:** oqsoqol — **Oy muxlisi** (chap), shogird — **Quyosh muxlisi** (oʻng). Har biri oʻz oʻyinchisi rangidagi bayroqcha ushlaydi. Muxlisning gapi oʻz tomonidagi kichik pufakda.
- **Joylashuv:**
  - Telefon (tik): tepada ikki panel yonma-yon (muxlislar chekkada), ostida savol kartasi, pastda javob tugmalari.
  - Yotiq ekran va kompyuter: chap ustun — Oy, oʻng ustun — Quyosh, oʻrtada savol va javob.
- Bosiladigan hamma narsa ≥ 48 px; eng tor ekran 360 px.

## 6. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `js/savollar.js` | Savol turlari: har tur `make(daraja, rng)` → savol; `pair(...)` — raund uchun juft savol; `check`. Sof hisob, Node testlari. |
| `js/musobaqa.js` | Musobaqa holati: navbat, soatlar (`tick`), yuraklar, oʻtkazish, raund oxiri, natija. Sof hisob, Node testlari. |
| `js/musobaqa-art.js` | Oy, quyosh, tanga, yurak, bayroq SVG |
| `js/maydon.js` | Ekran: panellar, savol kartasi, javob tugmalari, muxlislar, pauza oynasi |
| `js/main.js` | Oqim: sozlash → tanga → musobaqa → natija; soat sikli; saqlash |

Qayta ishlatiladigan mantiq (oʻyinlar papkasidan): `umumiy/js/sanoq.js`, `05/js/roman.js`, `03/js/caesar.js`, `02/js/morse.js`, `11/js/neural.js`, `12/js/atlas.js`, `13/js/bytes.js`, `16/js/units.js`, `23/js/typing.js`, `24/js/logic.js`, `25/js/gates.js`.

Bosh sahifada roʻyxat tepasida **"Musobaqa"** kartasi. Offline roʻyxati (`bosh/sw-royxat.py`) musobaqa papkasini ham oladi.

## 7. Bu versiyaga kirmaydi

Oʻyinchi ismlari, har oʻyinchiga alohida qiyinlik, 3 va undan koʻp oʻyinchi, internet orqali oʻynash, reyting jadvali, ovozli savollar.

## 8. Kelishilgan qarorlar (muallif bilan, 2026-09-21)

- Xato — vaqt jarimasi emas, **3 ta yurak**.
- Raund oxirigacha oʻynaladi (navbati qolgan bola yakunlaydi).
- Mavzu tanlashda navbat yoʻq: savollar **tanlangan mavzu va qiyinliklar ichidan tasodifiy**.
- Tanga faqat kim boshlashini aniqlaydi: oʻng — doim Quyosh, chap — doim Oy.
- Har oʻyinchining oʻz muxlisi; pauza bor; oʻtkazish — bir marta, navbat raqibga.

Kod yozilayotganda qabul qilingan qarorlar (muallif koʻrib chiqadi):
- Savollar tugasa musobaqa toʻxtamaydi: dasta qaytadan aralashtiriladi (tor tanlovda 5 daqiqaga yetmay qolmasligi uchun).
- 🏠 musobaqa paytida darhol chiqarmaydi — pauza oynasini ochadi (tasodifan yoki ataylab bosilsa, musobaqa yoʻqolmasin).
- Yuraklar oʻyinchi rangida (qizil ishlatilmaydi — QOIDALAR 4.4).

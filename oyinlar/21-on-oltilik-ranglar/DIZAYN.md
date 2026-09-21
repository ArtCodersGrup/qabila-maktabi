# 21 — Oʻn oltilik ranglar: dizayn

**Mavzu:** Oʻn oltilik sanoq tizimi: A–F, 2 ↔ 16 (4 tadan guruhlash), rang kodlari, qoʻshish, ayirish, bir xonali songa koʻpaytirish
**Yosh:** 10–12
**Taxminiy davomiyligi:** 20–25 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-21)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok: 17 → 18 → 19 → 20 → **21 oʻn oltilik** → 22 n-lik.
Bogʻliq oʻyinlar: `14` (rangli piksel: 3 chiroq, har biri 0–255), `18` (16-lik → 10), `20` (ustunda amallar). Blok qarorlari — 17-oʻyin DIZAYN.md (koʻpaytirish — faqat bir xonali songa, yordamchi jadval bilan).

> Dasturchilar ranglarni #FF8800 deb yozadi. Bu — oʻn oltilik sonlar!
> Nega aynan 16? Chunki 4 ta bit — bitta 16-lik raqam.

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. 16-lik raqamlar va 4 bitli guruhlar (tetradalar) mosligini biladi: 0 = 0000 … F = 1111.
2. Ikkilik sonni 16-likka oʻtkazadi: **oʻngdan 4 tadan** guruhlab, har guruhni bitta raqamga (1011 0110₂ = B6₁₆); va teskarisi.
3. Rang kodini oʻqiydi: #RRGGBB — qizil, yashil, koʻk chiroqlar (FF — toʻliq, 00 — oʻchiq).
4. 16-lik sonlarni **ustunda qoʻshadi va ayiradi**: yigʻindi 16 dan oshsa — 16 ni ayirib, 1 koʻchiradi; qarz — 16 birlik.
5. 16-lik sonni **bir xonali songa koʻpaytiradi** (1A₁₆ × 3 = 4E₁₆) va natijani oʻnlikda tekshiradi.

## 2. Asboblar

- **Tetradalar jadvali** — 16 qator: `0 — 0000` … `F — 1111`.
- **Guruh tugmalari** — ikkilik son 4 tadan boʻlingan; bosilgan guruh 16-lik raqamga aylanadi (va teskarisi).
- **Rang namunasi** — kvadrat va kodi, uchta chiroq qiymati.
- **Ustun taxtasi** va **0–F raqam tugmalari** (umumiy); **A–F qatori** doim koʻrinadi.

## 3. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (rang kodlari — 16-lik sonlar)
   ├─► 1-bosqich: 2 ↔ 16 va ranglar  [tetradalar → 1011 0110₂ = B6₁₆ → 3F₁₆ = 0011 1111₂ → #FF8800 → mashq 3]
   ├─► 2-bosqich: Qoʻshish va ayirish [ustunda 2A + 3F = 69, 5C − 2F = 2D → mashq 3]
   └─► 3-bosqich: Koʻpaytirish       [ustunda 1A × 3 = 4E, 16 ga karralilar qatori → mashq 3 → hikoya] → tabrik
```

**Kirish:** (Shogird) "Rassom kompyuterda #FF8800 deb yozibdi. Bu nima?" / (Oqsoqol) "Bu — oʻn oltilik sonlar. Kel, ochib koʻramiz."

## 4. 1-bosqich: 2 ↔ 16 va ranglar

1. **Tetradalar:** "Bitta 16-lik raqam — 16 xil. 4 ta bit ham 16 xil (2·2·2·2). Demak, 4 bit = 1 raqam!" Jadval koʻrsatiladi.
2. **2 → 16:** 10110110₂ oʻngdan 4 tadan ajratilgan: `1011` `0110`. Bola guruhlarni bosadi → B, 6: "B6₁₆!"
3. **16 → 2:** 3F₁₆ — bola raqamlarni bosadi → `0011` `1111`: "Har raqam — 4 bit."
4. **Ranglar:** #FF8800 — "FF — qizil 255, 88 — yashil 136, 00 — koʻk 0: toʻq sariq!"
5. **Mashq** (3 ta to'g'ri), tasodifiy uch xil:
   - 8 xonali ikkilik → 16-lik. 1-xato: 4 tadan ajratilgan + jadval. 2-xato: guruhlar va raqamlar.
   - 2 xonali 16-lik → ikkilik. 1-xato: jadval. 2-xato: har raqamning 4 biti.
   - "#00FF00 qaysi rang?" — uchta rang namunasi. 1-xato: "Qaysi chiroq FF — toʻliq yoniq?" 2-xato: javob.

## 5. 2-bosqich: Qoʻshish va ayirish

1. **Ustunda qoʻshish:** 2A₁₆ + 3F₁₆: "A(10) + F(15) = 25. 25 ≥ 16: 25 − 16 = 9 ni yoz, 1 ni koʻchir." → 69₁₆. "Tekshiramiz: 42 + 63 = 105 ✓".
2. **Ustunda ayirish:** 5C₁₆ − 2F₁₆: "C(12) dan F(15) ni ayirib boʻlmaydi — qarz: 12 + 16 = 28, 28 − 15 = 13 = D." → 2D₁₆.
3. **Mashq** (3 ta to'g'ri; 2 xonali sonlar, tasodifiy qoʻshish yoki ayirish): 1-xato: koʻchish/qarz belgilari. 2-xato: natija va oʻnlikda tekshirish.

## 6. 3-bosqich: Koʻpaytirish

1. **Ustunda:** 1A₁₆ × 3: "A(10) × 3 = 30. 30 = 1·16 + 14 → E ni yoz, 1 ni koʻchir." "1 × 3 + 1 = 4." → 4E₁₆. Yordamchi qator: 16 ga karralilar (16, 32, 48 … 144).
2. **Mashq** (3 ta to'g'ri): 2 xonali 16-lik son × 2–9 (natija ≤ 3 xona). 1-xato: har ustun oʻnlikda ("A × 3 = 30 = 1·16 + 14"). 2-xato: natija va tekshirish.
3. **Hikoya:** 1) "Veb-sahifalardagi har bir rang — 16-lik kod." 2) "Dasturchilar kompyuter xotirasini ham 16-likda koʻradi." 3) "Keyingi oʻyinda — boshqa sayyoralar: 3-, 5-, 7-lik tizimlar!"

**Tabrik:** "Tabriklayman! Endi sen 16-likda hisoblay olasan!" — "4 bit = 1 ta 16-lik raqam", "16 dan oshsa — 1 koʻchadi", "Qarz — 16 birlik".

## 7. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `../umumiy/js/sanoq.js` | toBase, addColumns, subColumns, mulDigit, `stepsAdd/Sub/Mul` (umumiy) |
| `js/amal16.js` | Tetradalar, guruhlash, ranglar, topshiriqlar. Node testlari. |
| `js/amal16-ui.js` | Tetradalar jadvali, guruh tugmalari, rang namunasi, 16 ga karralilar |
| `js/game-art.js` | Rassom ekrani (kirish), hikoya rasmlari |
| `js/scenes/*.js` | Bosqichlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `on-oltilik-ranglar:v1`) |

## 8. Bu o'yinga kirmaydi

Koʻp xonali songa koʻpaytirish, boʻlish, 8-lik ↔ 2-lik (3 tadan guruhlash).

# 20 — Ikkilik hisobchi: dizayn

**Mavzu:** Ikkilik sanoq tizimida qoʻshish, ayirish va koʻpaytirish (ustunda)
**Yosh:** 10–12
**Taxminiy davomiyligi:** 20–25 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-21)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok: 17 → 18 → 19 → **20 ikkilik amallar** → 21 oʻn oltilik → 22 n-lik.
Bogʻliq oʻyinlar: `17` (choʻt: 2 ta munchoq — keyingi simga), `18`–`19` (natijani oʻnlikda tekshirish). Blok qarorlari — 17-oʻyin DIZAYN.md.

> Kompyuter faqat 0 va 1 bilan hisoblaydi. Ikkilikda qoʻshish jadvali bor-yoʻgʻi 4 qator — lekin 1 + 1 = 10!

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. Ikkilik qoʻshish jadvalini biladi: 0 + 0 = 0, 0 + 1 = 1, 1 + 1 = 10₂, 1 + 1 + 1 = 11₂.
2. Ikkilik sonlarni **ustunda qoʻshadi**: yigʻindi 2 boʻlsa — 0 yozib, 1 ni koʻchiradi.
3. Ikkilik sonlarni **ustunda ayiradi**: 0 − 1 da chapdan **qarz** oladi (10₂ − 1 = 1); qarz bergan xona 1 ga kamayadi.
4. **× 10₂, × 100₂** — oxiriga nol qoʻshish ekanini biladi (oʻnlikdagi × 10 kabi); ikkilik sonlarni **surish va qoʻshish** bilan koʻpaytiradi.
5. Natijani oʻnlikka oʻtkazib tekshiradi (1011₂ + 110₂ = 10001₂: 11 + 6 = 17 ✓).

## 2. Asboblar

- **Choʻt** (umumiy) — 2-lik, qoʻshish/ayirish qoidasini koʻrsatish uchun ("+1", "−1").
- **Ustun taxtasi** (umumiy) — koʻchish/qarz qatori, ikki son, chiziq, natija kataklari; joriy ustun yoritiladi.
- **Raqam tugmalari** `0` `1` — ustunda bosqichma-bosqich; mashqda — asosga mos klaviatura.

## 3. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (kompyuter faqat 0 va 1 bilan hisoblaydi)
   ├─► 1-bosqich: Qoʻshish       [choʻtda 1 + 1 = 10₂ → jadval → ustunda 1011 + 110 → mashq 3]
   ├─► 2-bosqich: Ayirish        [choʻtda 10₂ − 1 = 1 → jadval → ustunda 1101 − 110 → mashq 3]
   └─► 3-bosqich: Koʻpaytirish   [× 10₂ = oxiriga 0 → 101 × 11 surish va qoʻshish → mashq 3 → hikoya] → tabrik
```

**Kirish:** "Kompyuter faqat 0 va 1 bilan hisoblaydi." / (Shogird) "Unda 1 + 1 nima boʻladi? 2 degan raqam yoʻq-ku!" / "Ana shuni oʻrganamiz!"

## 4. 1-bosqich: Qoʻshish

1. **Choʻtda:** 2-lik choʻt, qiymat 1; bola "+1" ni bosadi → munchoqlar keyingi simga oʻtadi: "1 + 1 = 10₂!" Yana "+1": "10₂ + 1 = 11₂."
2. **Jadval:** `0 + 0 = 0`, `0 + 1 = 1`, `1 + 1 = 10`, `1 + 1 + 1 = 11`.
3. **Ustunda:** 1011₂ + 110₂. Har ustunda Oqsoqol soʻraydi ("1 + 1 = 2. Qaysi raqamni yozamiz?"), bola `0`/`1` ni bosadi; 1-xatodan keyin qoida ("2 ≥ 2: 0 ni yoz, 1 ni koʻchir"); koʻchgan 1 keyingi ustun tepasida paydo boʻladi. Natija 10001₂. "Tekshiramiz: 11 + 6 = 17 ✓".
4. **Mashq** (3 ta to'g'ri): 3–5 xonali ikki son; ustun taxtasida misol, javob klaviaturada. 1-xato: koʻchishlar taxtada koʻrsatiladi. 2-xato: natija va oʻnlikda tekshirish.

## 5. 2-bosqich: Ayirish

1. **Choʻtda:** qiymat 10₂; "−1" → chapdagi simdan 1 munchoq olinib, 2 taga maydalanadi, bittasi olinadi: "10₂ − 1 = 1".
2. **Jadval:** `0 − 0 = 0`, `1 − 0 = 1`, `1 − 1 = 0`, `10 − 1 = 1 (qarz)`.
3. **Ustunda:** 1101₂ − 110₂: qarz olingan ustun tepasida "+2", qarz bergan raqam chiziladi. Natija 111₂. "Tekshiramiz: 13 − 6 = 7 ✓".
4. **Mashq** (3 ta to'g'ri; koʻpincha qarzli): 3–5 xonali sonlar, a > b. 1-xato: qarz belgilari. 2-xato: natija va tekshirish.

## 6. 3-bosqich: Koʻpaytirish

1. **Surish:** 101₂; bola "× 10₂" ni bosadi → 1010₂, yana → 10100₂: "Oʻnlikda × 10 — oxiriga 0. Ikkilikda × 10₂ ham shunday! 5 → 10 → 20."
2. **Ustunda:** 101₂ × 11₂ — "Keyingi qator" bilan: 101 (× 1), 1010 (× 1, surilgan) → qoʻshamiz: 1111₂. "5 × 3 = 15 ✓". "Ikkilikda koʻpaytirish jadvali yoʻq: 1 boʻlsa — sonni yozamiz, 0 boʻlsa — nol."
3. **Mashq** (3 ta to'g'ri), tasodifiy ikki xil:
   - "101₂ × 100₂ = ?" (× 10₂, × 100₂, × 1000₂). 1-xato: "Nechta nol bor — shuncha nol qoʻsh". 2-xato: javob.
   - "1011₂ × 11₂ = ?" (koʻpaytuvchi 11, 101, 110, 111; natija ≤ 8 xona). 1-xato: surilgan qatorlar. 2-xato: natija va oʻnlikda tekshirish.
4. **Hikoya:** 1) "Protsessor sekundiga milliardlab shunday qoʻshadi — faqat 0 va 1 bilan." 2) "Keyingi oʻyinda — 16-lik: harfli raqamlar bilan hisob!"

**Tabrik:** "Tabriklayman! Endi sen ikkilikda hisoblay olasan!" — "1 + 1 = 10: 0 yoz, 1 koʻchir", "0 − 1: chapdan qarz", "× 10₂ — oxiriga 0".

## 7. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `../umumiy/js/sanoq.js` | addColumns, subColumns, mulBinary, `stepsAdd`/`stepsSub` (ustun qadamlari, umumiy) |
| `../umumiy/js/sanoq-ui.js` | Choʻt, ustun taxtasi, `guide`, `basePad`, `digitTries` |
| `js/amal2.js` | Topshiriqlar: qoʻshish, ayirish (qarzli), surish, koʻpaytirish. Node testlari. |
| `js/game-art.js` | Kalkulyator-robot (kirish), hikoya rasmlari |
| `js/scenes/*.js` | Bosqichlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `ikkilik-hisobchi:v1`) |

## 8. Bu o'yinga kirmaydi

Ikkilikda boʻlish, manfiy sonlar va "qoʻshimcha kod", 8 xonadan uzun sonlar.

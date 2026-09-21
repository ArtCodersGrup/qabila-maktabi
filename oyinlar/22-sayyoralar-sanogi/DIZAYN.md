# 22 — Sayyoralar sanogʻi: dizayn

**Mavzu:** n-lik sanoq tizimida (3–9) qoʻshish, ayirish, bir xonali songa koʻpaytirish; "qaysi tizimda?" jumbogʻi; blok yakuni
**Yosh:** 10–12
**Taxminiy davomiyligi:** 20–25 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-21)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok: 17 → 18 → 19 → 20 → 21 → **22 n-lik** (blok yakuni).
Bogʻliq oʻyinlar: `17` (choʻt), `20` (2-likda amallar), `21` (16-likda amallar). Blok qarorlari — 17-oʻyin DIZAYN.md.

> Uzoq sayyoralarda aholining barmoqlari har xil: kimda 3 ta, kimda 5 ta, kimda 7 ta.
> Ular oʻz tizimida sanaydi. 2-lik va 16-likdagi qoidalar ularda ham ishlaydimi?

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. **Umumiy qoidani** aytadi: yigʻindi asosga teng yoki katta boʻlsa — asosni ayirib yozamiz, 1 ni koʻchiramiz (2-lik va 16-likdagi qoidaning oʻzi).
2. 3–9-lik tizimda sonlarni **ustunda qoʻshadi**.
3. 3–9-lik tizimda **ustunda ayiradi**: qarz — asosga teng birlik (5-likda 2 − 4: 2 + 5 = 7, 7 − 4 = 3).
4. n-lik sonni **bir xonali songa koʻpaytiradi** (23₅ × 4 = 202₅).
5. "Qaysi tizimda 3 + 4 = 10?" kabi jumboqni yechadi: 10 — asosning oʻzi (7-lik).
6. Tarixiy tizimlarni biladi: Bobil — 60-lik (soatdagi 60 daqiqa), Mayya — 20-lik.

## 2. Asboblar

- **Choʻt** (umumiy) — sayyora asosida.
- **Ustun taxtasi** va **raqam tugmalari 0 … n−1** (umumiy); mashqda asosga mos klaviatura.
- **Sayyora tugmalari** — jumboqda asosni tanlash (masalan 5, 7, 8).

## 3. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (sayyoralar va barmoqlar)
   ├─► 1-bosqich: Qoʻshish               [5-lik choʻtda 4 + 1 = 10₅ → umumiy qoida → ustunda 34₅ + 13₅ → mashq 3]
   ├─► 2-bosqich: Ayirish                [ustunda 42₅ − 14₅ (qarz = 5) → mashq 3]
   └─► 3-bosqich: Koʻpaytirish va jumboq [ustunda 23₅ × 4 → "qaysi sayyorada 3 + 4 = 10?" → mashq 3 → hikoya] → tabrik
```

**Kirish:** "Uzoq sayyoralardan xabar keldi!" / (Shogird) "Ular ham bizdek sanaydimi?" / "Barmoqlari boshqa — tizimi ham boshqa. Lekin qoidalar bir xil. Koʻramiz!"

## 4. 1-bosqich: Qoʻshish

1. **Choʻt:** besh barmoqli sayyora, 5-lik choʻt, qiymat 4: "+1" → "10₅: 5 ta boʻldi — keyingi xonaga!"
2. **Umumiy qoida** (formula): `yigʻindi < n → shuni yoz`, `yigʻindi ≥ n → yigʻindi − n ni yoz, 1 koʻchir`. "2-likda n = 2, 16-likda n = 16 — qoida bitta!"
3. **Ustunda:** 34₅ + 13₅ = 102₅ ("4 + 3 = 7 ≥ 5: 7 − 5 = 2 ni yoz, 1 ni koʻchir"). "Tekshiramiz: 19 + 8 = 27 ✓".
4. **Mashq** (3 ta to'g'ri): 3–9-lik, 2–3 xonali ikki son. 1-xato: koʻchishlar. 2-xato: natija va oʻnlikda tekshirish.

## 5. 2-bosqich: Ayirish

1. **Ustunda:** 42₅ − 14₅ = 23₅: "2 dan 4 ni ayirib boʻlmaydi — qarz: 2 + 5 = 7, 7 − 4 = 3." "Qarz — asosga teng: bu yerda 5 ta."
2. **Mashq** (3 ta to'g'ri; koʻpincha qarzli): 3–9-lik, a > b. 1-xato: qarz belgilari ("+n"). 2-xato: natija va tekshirish.

## 6. 3-bosqich: Koʻpaytirish va jumboq

1. **Ustunda:** 23₅ × 4 = 202₅ ("3 × 4 = 12 = 2·5 + 2 → 2 ni yoz, 2 ni koʻchir"). "Tekshiramiz: 13 × 4 = 52 ✓".
2. **Jumboq:** "Qaysi sayyorada 3 + 4 = 10?" — bola sayyora tugmasini tanlaydi (5, 7, 8). "10 — bu asosning oʻzi! 3 + 4 = 7 → 7-lik sayyora."
3. **Mashq** (3 ta to'g'ri), tasodifiy ikki xil:
   - 2 xonali n-lik son × bir xonali son (3–9-lik). 1-xato: har ustun oʻnlikda. 2-xato: natija va tekshirish.
   - "Qaysi sayyorada a + b = 1c?" (raqam klaviaturasi, javob — asos). 1-xato: "10 — asos. Demak, a + b = asos + c." 2-xato: "a + b = … = x + c → x-lik".
4. **Hikoya (blok yakuni):**
   1. Bobil: "Qadimgi Bobilda 60-lik tizim boʻlgan." / "Shuning uchun soatda 60 daqiqa, daqiqada 60 soniya!"
   2. Mayya: "Mayyalar 20-likda sanashgan: qoʻl va oyoq barmoqlari — 20 ta."
   3. Yakun: "Kompyuter — 2-likda, dasturchi — 16-likda, biz — 10-likda." / "Endi sen istalgan tizimda hisoblay olasan!"

**Tabrik:** "Tabriklayman! Endi sen istalgan sayyorada hisoblay olasan!" — "Yigʻindi ≥ n — n ni ayir, 1 koʻchir", "Qarz — n birlik", "10ₙ = n".

## 7. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `../umumiy/js/sanoq.js` | addColumns, subColumns, mulDigit, `stepsAdd/Sub/Mul` (umumiy) |
| `js/sayyora.js` | Topshiriqlar: qoʻshish, ayirish, koʻpaytirish (3–9-lik), jumboq. Node testlari. |
| `js/game-art.js` | Sayyoralar va barmoqlar (kirish), hikoya rasmlari (Bobil soati, Mayya, yakun) |
| `js/scenes/*.js` | Bosqichlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `sayyoralar-sanogi:v1`) |

## 8. Bu o'yinga kirmaydi

10 dan katta asoslar (16-lik — 21-oʻyinda), boʻlish, kasr sonlar, 60-likda hisoblash (faqat hikoya).

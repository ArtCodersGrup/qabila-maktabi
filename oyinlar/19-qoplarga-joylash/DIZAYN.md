# 19 — Qoplarga joylash: dizayn

**Mavzu:** Oʻnlikdan istalgan sanoq tizimiga oʻtish (10 → x): kattadan boshlab (tangalar), boʻlib-boʻlib (qoldiqlar), 8-lik va 16-lik, teskari tekshirish
**Yosh:** 10–12
**Taxminiy davomiyligi:** 20 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-21)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok: 17 tizim nima → 18 x → 10 → **19 10 → x** → 20 ikkilik amallar → 21 oʻn oltilik → 22 n-lik.
Bogʻliq oʻyinlar: `18` (tangalar = xona qiymatlari; teskari yoʻl bilan tekshirish), `04` ("eng katta qiymatli chiroqdan boshla"). Blok qarorlari — 17-oʻyin DIZAYN.md.

> 13 ta olmani 2 tadan qopga joylaymiz: 6 qop, 1 ta ortadi. Qoplarni 2 tadan qutiga: 3 quti, 0 ortadi…
> Ortib qolganlarni **pastdan yuqoriga** oʻqisak — 1101₂. Maktabdagi "boʻlib, qoldiqni yozish" usuli aynan shu!

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. Oʻnlikdagi sonni ikkilikka **kattadan boshlab** oʻtkazadi: eng katta sigʻadigan tangadan boshlab "sigʻdi — 1, sigʻmadi — 0" (13 = 8 + 4 + 1 → 1101₂).
2. **Boʻlib-boʻlib** usulini qoʻllaydi: asosga boʻladi, qoldiqni yozadi, boʻlinmani yana boʻladi — 0 chiqquncha.
3. Qoldiqlarni **pastdan yuqoriga** oʻqish kerakligini tushuntiradi (klassik xato — teskari oʻqish).
4. Oʻnlikdagi sonni 8-lik va 16-likka oʻtkazadi; 10–15 qoldiqni harf bilan yozadi (200 → C8₁₆).
5. Natijani teskari yoʻl (18-oʻyin) bilan tekshiradi va teskari oʻqilgan javobni topadi.

## 2. Asboblar

- **Tangalar qatori** — 32, 16, 8, 4, 2, 1; har biri uchun "Sigʻadi (1)" / "Sigʻmaydi (0)" tugmalari; "Qoldi: 5".
- **Boʻlish jadvali** — qatorlar: `13 : 2 = 6, qoldiq 1`; qoldiqlar ustuni — bosiladigan kataklar, pastdan yuqoriga oʻq.
- **Asosga mos klaviatura** (umumiy) — javob shu tizimda.

## 3. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (olmalarni qoplarga joylaymiz)
   ├─► 1-bosqich: Kattadan boshlab   [13 → 8, 4, 2, 1 tangalar: sigʻadimi? → 1101₂ → mashq 3]
   ├─► 2-bosqich: Boʻlib-boʻlib      [13 : 2 … qoldiqlar → pastdan yuqoriga bosish → mashq 3]
   └─► 3-bosqich: Istalgan tizimga   [200 → C8₁₆, tekshirish → mashq 3 → hikoya] → tabrik
```

**Kirish:** "Oldingi oʻyinda istalgan sonni oʻnlikka oʻtkazding." / (Shogird) "Teskarisi-chi? 13 ni ikkilikda qanday yozaman?" / "Ikki usul bor. Kel, olmalar va tangalar bilan koʻramiz."

## 4. 1-bosqich: Kattadan boshlab

1. **Tangalar:** son 13, tangalar 8, 4, 2, 1. Har tanga uchun: "8 sigʻadimi? Qoldi: 13" → bola "Sigʻadi (1)" / "Sigʻmaydi (0)" ni bosadi. Sigʻsa qoldiq kamayadi, raqam yoziladi: 1 → 1 → 0 → 1. Notoʻgʻri: "↻ Qoldi 1, tanga 2 — sigʻmaydi."
2. **Ta'rif:** "Eng katta sigʻadigan tangadan boshlaymiz: sigʻdi — 1, sigʻmadi — 0." `13 = 8 + 4 + 1 → 1101₂`.
3. **Mashq** (3 ta to'g'ri): 5–63 → ikkilik (asosga mos klaviatura). 1-xato: tangalar qatori 32 16 8 4 2 1. 2-xato: "32 + 8 + 1 = 41 → 101001₂".

## 5. 2-bosqich: Boʻlib-boʻlib

1. **Qoplar:** "Boʻl" tugmasi — har bosishda jadvalga bitta qator: `13 : 2 = 6, qoldiq 1` ("6 qop, 1 olma ortdi"), `6 : 2 = 3, qoldiq 0` ("3 quti") … `1 : 2 = 0, qoldiq 1`.
2. **Pastdan yuqoriga:** "Endi qoldiqlarni pastdan yuqoriga bos!" — bola qoldiq kataklarini bosadi; notoʻgʻri tartib: "↻ Pastdan boshla: oxirgi qoldiq — birinchi raqam." Yigʻilgan javob: 1101₂.
3. **Ta'rif:** "Asosga boʻlamiz, qoldiqni yozamiz, boʻlinmani yana boʻlamiz — 0 chiqquncha. Qoldiqlarni pastdan yuqoriga oʻqiymiz." Misol: `38 → 123₅`.
4. **Mashq** (3 ta to'g'ri): 10–100 → 2–8-lik. 1-xato: jadvalning birinchi qatori. 2-xato: toʻliq jadval va javob.

## 6. 3-bosqich: Istalgan tizimga

1. **16-lik:** `200 : 16 = 12, qoldiq 8`, `12 : 16 = 0, qoldiq 12` → "Qoldiq 12 — bitta raqam: C!" → C8₁₆. **Tekshirish:** `C8₁₆ = 12·16 + 8 = 200 ✓`.
2. **Mashq** (3 ta to'g'ri), tasodifiy uch xil:
   - 20–255 → 16-lik. 1-xato: birinchi qator. 2-xato: jadval va javob.
   - 20–255 → 8-lik. Xuddi shunday.
   - "13 = 1011₂ — toʻgʻrimi?" (toʻgʻri yoki qoldiqlar teskari oʻqilgan) → "Ha" / "Yoʻq". 1-xato: "Tekshir: raqam × xona qiymati". 2-xato: "1011₂ = 11 ≠ 13 — qoldiqlar teskari oʻqilgan".
3. **Hikoya:** 1) "Kompyuter ham har kuni shunday aylantiradi: sen yozgan 13 ni ichida 1101 qilib saqlaydi." 2) "Keyingi oʻyinda — ikkilikda qoʻshish, ayirish va koʻpaytirish!"

**Tabrik:** "Tabriklayman! Endi sen oʻnlikdan istalgan tizimga oʻtkaza olasan!" — "Kattadan boshla: sigʻdi — 1", "Boʻl, qoldiqni yoz", "Qoldiqlar — pastdan yuqoriga".

## 7. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `../umumiy/js/sanoq.js` | toBase, fromBase, divSteps, expand (umumiy) |
| `js/qop.js` | Tangalar qadamlari, topshiriqlar (ikkilik, 2–8-lik, 16/8-lik, tekshirish). Node testlari. |
| `js/qop-ui.js` | Tangalar qatori, boʻlish jadvali (qoldiqlarni bosish), tekshirish qatori |
| `js/game-art.js` | Olma va qoplar (kirish), hikoya rasmlari |
| `js/scenes/*.js` | Bosqichlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `qoplarga-joylash:v1`) |

## 8. Bu o'yinga kirmaydi

Kasr sonlarni oʻtkazish, 255 dan katta sonlar, 2 ↔ 16 tez usul (21-oʻyinda).

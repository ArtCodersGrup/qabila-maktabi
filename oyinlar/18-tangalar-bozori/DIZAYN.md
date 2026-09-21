# 18 — Tangalar bozori: dizayn

**Mavzu:** Istalgan sanoq tizimidan oʻnlikka oʻtish (x → 10): 2-lik, 8-lik va 5-lik (3–8), 16-lik
**Yosh:** 10–12
**Taxminiy davomiyligi:** 20 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-21)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok: 17 tizim nima → **18 x → 10** → 19 10 → x → 20 ikkilik amallar → 21 oʻn oltilik → 22 n-lik.
Bogʻliq oʻyinlar: `17` (asos, xona qiymatlari), `04` (8-4-2-1). Blok qarorlari — 17-oʻyin DIZAYN.md.

> Qabilalar bozorida har kimning oʻz tangalari bor. Ikkilik qabilaning tangalari: 1, 2, 4, 8, 16 …
> Sonning har bir raqami — shu xonadagi tangalar soni. Hammasini qoʻshsak — oʻnlikdagi qiymat!

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. Xona qiymatini **tanga** deb tasavvur qiladi: raqam — shu tangadan nechta.
2. Ikkilik sonni (8 xonagacha) oʻnlikka oʻtkazadi: 1 turgan xonalarning qiymatlarini qoʻshadi (1011₂ = 8 + 2 + 1 = 11).
3. 3–8-lik sonni oʻnlikka oʻtkazadi: **raqam × xona qiymati** yigʻindisi (213₈ = 2·64 + 1·8 + 3 = 139).
4. 16-lik sonni oʻnlikka oʻtkazadi: avval harflarni songa aylantiradi (C8₁₆ = 12·16 + 8 = 200); FF₁₆ = 255 ekanini biladi.
5. Yoyib yozish formulasini yozadi: `raqam·xona + raqam·xona + …`.

## 2. Asboblar

- **Tangali son** — har raqam ustida tanga (xona qiymati). Tangani bosish — shu xonadan bitta tanga olish; olinganlar "hamyon"ga tushadi, jami koʻrinadi.
- **Harf kartochkasi** (16-lik) — bosilganda aylanadi: `C` → `12`.
- **Raqam klaviaturasi** (umumiy `askNumber`) — javob oʻnlikda.

## 3. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (qabilalar bozori, har xil tangalar)
   ├─► 1-bosqich: 2-likdan oʻnlikka    [1011₂: 1 turgan tangalarni olish → 8 + 2 + 1 → mashq 3]
   ├─► 2-bosqich: 8-lik va 5-likdan    [213₈: har xonadan raqamcha tanga → 2·64 + 8 + 3 → mashq 3]
   └─► 3-bosqich: 16-likdan oʻnlikka   [C8₁₆: harfni aylantirish → 12·16 + 8 → mashq 3 → hikoya] → tabrik
```

**Kirish:** "Bugun qabilalar bozoriga boramiz!" / (Shogird) "Har qabilaning tangasi boshqa-ku?" / "Ha. Tangalar — xona qiymatlari. Qani, hisoblab koʻramiz."

## 4. 1-bosqich: 2-likdan oʻnlikka

1. **Tangalar:** 1011₂, har raqam ustida tanga: 8, 4, 2, 1. Bola 1 turgan xonalardagi tangalarni bosadi → hamyonga tushadi: "8 + 2 + 1". 0 ustidagi tanga bosilsa: "Bu xonada 0 — tanga olinmaydi."
2. **Ta'rif:** `1011₂ = 1·8 + 0·4 + 1·2 + 1·1 = 11`. "Ikkilikda: 1 turgan xonalarning qiymatlarini qoʻshamiz."
3. **Mashq** (3 ta to'g'ri): 4–8 xonali ikkilik son → oʻnlik (≤ 255). 1-xato: son ustida xona qiymatlari. 2-xato: "128 + 32 + 4 + 1 = 165".

## 5. 2-bosqich: 8-lik va 5-likdan

1. **Tangalar:** 213₈, tangalar 64, 8, 1. Bola har xonadan raqamcha tanga oladi (64 — 2 marta, 8 — 1, 1 — 3); ortiqcha bosilsa: "Bu xonada faqat 2 ta." Jami: "2·64 + 1·8 + 3·1 = 139".
2. **Ta'rif:** `raqam × xona qiymati — hammasini qoʻshamiz`; misol `324₅ = 3·25 + 2·5 + 4·1 = 89`.
3. **Mashq** (3 ta to'g'ri): 3–8-lik, 2–3 xonali son → oʻnlik (≤ 255). 1-xato: xona qiymatlari. 2-xato: yoyib yozilgan yigʻindi.

## 6. 3-bosqich: 16-likdan oʻnlikka

1. **Harflar:** C8₁₆ — bola `C` kartochkasini bosadi → `12`. Keyin: `12·16 + 8·1 = 200`. Ikkinchi misol: `FF₁₆ = 15·16 + 15 = 255` — "Eng katta ikki xonali 16-lik son — 255. Esingdami, rang chirogʻi 0–255!"
2. **Ta'rif:** "Avval harfni songa aylantir (A = 10 … F = 15), keyin xona qiymatiga koʻpaytir."
3. **Mashq** (3 ta to'g'ri; A–F qatori doim koʻrinadi): 2 xonali 16-lik son → oʻnlik (koʻpincha harfli). 1-xato: harflar songa aylanadi + xonalar. 2-xato: yoyib yozilgan yigʻindi.
4. **Hikoya:** 1) Rang kodi: "#FF8800 — qizil FF = 255, yashil 88 = 136, koʻk 00 = 0." 2) "Keyingi oʻyinda — teskari yoʻl: oʻnlikdan istalgan tizimga!"

**Tabrik:** "Tabriklayman! Endi sen istalgan sonni oʻnlikka aylantira olasan!" — "Raqam × xona qiymati", "Hammasini qoʻshamiz", "A = 10 … F = 15".

## 7. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `../umumiy/js/sanoq.js` | toBase, fromBase, expand (umumiy) |
| `js/bozor.js` | Topshiriqlar: 2-lik, 3–8-lik, 16-lik son → oʻnlik; yoyib yozish matni. Node testlari. |
| `js/bozor-ui.js` | Tangali son (tanga bosish, hamyon), harf kartochkasi, A–F qatori |
| `js/game-art.js` | Bozor (kirish), hikoya rasmlari |
| `js/scenes/*.js` | Bosqichlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `tangalar-bozori:v1`) |

## 8. Bu o'yinga kirmaydi

Oʻnlikdan boshqa tizimga (19), kasr sonlar, 255 dan katta sonlar.

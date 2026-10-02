# 45-oʻyin — «Kaptarxona»

Kombinatorika blokining oxirgi oʻyini: **Dirixle printsipi** (kaptarxona qoidasi).
Blokdagi yagona oʻyin, u yerda **sanamaymiz — isbotlaymiz**.

- **Yosh:** 12–16. 💻 Kompyuter uchun.
- **Oldin oʻtilgan:** 41–44 (sanash qoidalari), 40 (oʻsish).

## Asosiy fikr

Bola 5 ta kaptarni 4 ta uyaga **oʻzi joylaydi** — istagancha. Har safar bitta uyada ikkita
boʻlib qoladi. Ikki urinishdan keyin savol tugʻiladi: «balki boshqa tartibda?» Javob —
boʻlmaydi, va nega boʻlmasligi bir qatorda koʻrsatiladi:

> Har uyaga bittadan qoʻysak, 4 ta joylashadi. Beshinchisi albatta band uyaga tushadi.

Shu yerdan umumiy qoida: `n` ta narsa, `k` ta quti → eng toʻla qutida kamida `⌈n/k⌉` ta.

**Test buni oʻynab chiqadi:** `5 narsa 4 quti`, `4 narsa 3 quti`, `7 narsa 3 quti`, `6 narsa 2 quti`
uchun **hamma joylashuv** (`k^n` tagacha) koʻrib chiqiladi va eng tekis joylashda ham kafolat
buzilmasligi tekshiriladi.

## 2-bosqich: teskari savol

«Qorongʻi xonada 3 xil rangdagi paypoq — kamida nechta olish kerak?» Bu yerda **eng yomon holat**
oʻylab topiladi: har rangdan bittadan (3 ta), keyin yana bittasi albatta takrorlanadi → `3 × 1 + 1 = 4`.
Umumiy koʻrinishi: `k × (m − 1) + 1`.

## 3-bosqich: nega isbot kerak

Dastur qoldiqlar boʻyicha qutilarga taqsimlaydi va eng toʻlasini koʻrsatadi — lekin bu **bitta misol**.
Keyin jadval koʻrsatiladi:

| Narsa | Quti | Nechta joylashuv bor |
| --- | --- | --- |
| 5 | 4 | 1 024 |
| 10 | 5 | 9 765 625 |
| 20 | 10 | 100 000 000 000 000 000 000 |

Hammasini sinab koʻrib boʻlmaydi — isbot esa bir qatorda tugaydi. Blok (va 40-oʻyindagi oʻsish
mavzusi) shu fikr bilan yopiladi.

## Fayllar

- `js/logic.js` — `kafolat(n,k)`, `kerak(k,m)`, savollar, kod masalalari, `SINOV` jadvali.
- `tests/logic.test.js` — 11 test; eng muhimi — hamma joylashuvni koʻrib chiqadigan tekshiruv.

## 2026-10-02 qiyinlik yangilanishi

Sabab: hisobot-5 (C jadvali) — savollarda qutilar matnda tayyor berilardi (uya, oy, quti): faqat boʻlish qolardi.

- **1-bosqich (Dirixle):** **quti yashirin** savollar — «k ga boʻlgandagi qoldigʻi bir xil» (qutilar — qoldiqlar),
  «ayirmasi k ga boʻlinadigan sonlar» (ayirma boʻlinadi ⇔ qoldiq bir xil), inglizcha soʻzning birinchi harfi (26 quti),
  365 kunlik yil. Maslahat qutilar nima ekanini aytadi, javobni emas.
- **2-bosqich (kamida nechta kerak):** turlar soni matnda aytilmagan savollar — bir oyda tugʻilgan m ta bola (12),
  hafta kuni (7), ayirmasi k ga boʻlinadigan ikki son (k + 1), 4 xil mastdan m ta karta, oxirgi raqami bir xil sonlar (10).
  Testda: kafolat aynan shu sonda paydo boʻladi, bitta kam boʻlsa — yoʻq.
- **3-bosqich (yozish 2 → 4):** `kerak(k, m)` (k × m va k × (m − 1) yechimlari yiqiladi) va
  `bir_xil_qoldiq(sonlar, k)` («sonlar k dan koʻp boʻlsa True» degan yechim yiqiladi — bu Dirixlening teskarisi emas).
  Oʻqiladigan kodda sonlar zina bilan koʻpayadi.
- Hisobotdagi «ayirmasi k ga boʻlinadigan juftlik **bormi**» (ha/yoʻq) savoli son soʻraydigan koʻrinishda berildi
  (QOIDALAR §4.3: 2 variantli savol yolgʻiz kelmaydi). Testlar: 11 → 14.

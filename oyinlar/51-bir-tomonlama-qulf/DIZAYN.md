# 51-oʻyin — «Bir tomonlama qulf»

«Parol va xavfsizlik» blokining ikkinchi oʻyini. Blok rejasi:
[`../umumiy/XAVFSIZLIK-BLOK.md`](../umumiy/XAVFSIZLIK-BLOK.md).

- **Yosh:** 10–16 (ikkala toifada). Klaviatura shart emas — faqat bosish va raqam klaviaturasi.
- **Ulanish:** «Parol kuchi» — parol qanchalik kuchli; bu oʻyin — sayt parolni qanday saqlaydi.

## Asosiy fikr

Bolaning tasavvuri: *«sayt parolimni roʻyxatiga yozib qoʻyadi»*. Yaxshi sayt bunday qilmaydi —
u parolning **izini** (xeshini) saqlaydi:

- izni hisoblash oson, **orqaga qaytarish mumkin emas**;
- bir xil parol har safar bir xil iz beradi — shuning uchun sayt seni taniydi;
- baza oʻgʻirlansa, oʻgʻri faqat izlarni oladi;
- bir nechta parol bitta iz berishi mumkin — bu **toʻqnashuv**, va u aynan shu sababdan
  orqaga yoʻl yoʻqligini koʻrsatadi.

## Iz qoidasi (haqiqiy SHA emas)

Qoida atayin kichik qilib tanlangan: bola uni **qogʻozda ham** hisoblay olishi shart.

1. Har belgi songa aylanadi: harf — alifbodagi oʻrni (`a` = 1 … `z` = 26), raqam — oʻzi.
2. Chapdan boshlab: `iz = iz × 3 + belgining soni`.
3. Faqat oxirgi ikki raqam qoladi (`184` → `84`). Boshlangʻich iz — **tuz** (sayt soni), odatda 0.

Misol — `olma`:

| Belgi | Soni | Hisob | Iz |
| --- | --- | --- | --- |
| o | 15 | 0 × 3 + 15 = 15 | 15 |
| l | 12 | 15 × 3 + 12 = 57 | 57 |
| m | 13 | 57 × 3 + 13 = 184 | 84 |
| a | 1 | 84 × 3 + 1 = 253 | 53 |

Nega shu koʻrinish:

- **×3 va oxirgi ikki raqam** — natija sakrab oʻzgaradi: `olma` → 53, `olmo` → 67. Bitta belgi
  oʻzgarsa, iz butunlay boshqa chiqadi (bola buni oʻz koʻzi bilan koʻradi).
- **Tartib muhim**: `ab` ≠ `ba`. Oddiy yigʻindida bunday boʻlmaydi.
- **Toʻqnashuvlar bor va ular oson topiladi**: `qush` ham, `asal` ham 13 beradi;
  `kitob` va `olma2` — ikkisi ham 61. Oʻyinning gʻoyasi shu: izdan parolni tiklab boʻlmaydi.
- Iz **ikki xonali** — shuning uchun oʻyinda «haqiqiy saytlarda iz ancha uzun» deb aytiladi.

Hisob kodi: `js/logic.js` (`iz`, `izQadamlar`, `toqnash`). Haqiqiy xeshlash algoritmlari
(SHA va boshqalar) oʻrgatilmaydi — faqat gʻoyasi.

## Bosqichlar

1. **Bir tomonlama amal** — eng oddiy misol: raqamlar yigʻindisi (`3791` → 20). Bola yigʻindini
   hisoblaydi, keyin teskari savolga javob beradi («yigʻindidan asl sonni topib boʻladimi?») va
   bir xil yigʻindi beradigan boshqa sonni topadi — toʻqnashuvni oʻzi koʻradi.
2. **Barmoq izi** — alifbo jadvali va uch qadamli qoida. Bola parolning izini hisoblaydi, ikki
   parolning izi bir xilmi degan savolga javob beradi va «sayt qanday taniydi / baza oʻgʻirlansa
   nima boʻladi» holatlarini hal qiladi.
3. **Nega bu muhim** — bitta parol hamma saytda = bitta kalit hamma qulfga. Keyin **tuz**:
   har saytning oʻz soni bor, shuning uchun bir xil parol har saytda boshqa iz beradi
   (`kitob`: 62 / 50 / 55 / 24). Mashq — hisob va holatlar boʻyicha xulosa.

## Qarorlar

- **Faqat himoya tomoni.** Parol sindiradigan dastur ham, tayyor «iz lugʻati» ham yasalmaydi;
  oʻgʻri haqida faqat «nima bila oladi» darajasida gapiriladi.
- **Tuz soddalashtirilgan**: boshlangʻich iz sifatida olinadi (haqiqatda parolga qoʻshiladi).
  Shunda qoida oʻzgarmaydi va bola tuzli izni ham qogʻozda hisoblaydi.
- **Halol chegara**: oʻyinda aytiladi — tuz oʻgʻrining tayyor roʻyxatini buzadi, lekin parolning
  oʻzi qoʻlga tushsa yordam bermaydi. Shuning uchun har saytga boshqa parol kerak.
- **Parollarda faqat lotin harflari va raqamlar** (`oʻ`, `gʻ` yoʻq) — har belgining soni aniq boʻlsin.
- Mashqlarda iz **10 dan kichik boʻlmaydi**, aks holda «07» ni raqam klaviaturasida yozish chalkash boʻladi.
- Toʻqnashuv juftligi «soʻz + son» koʻrinishida izlanadi (`olma2`, `shamol9`) — haqiqiy parolga oʻxshaydi.

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Bir tomonlama amalga misol keltiradi va nega orqaga qaytarib boʻlmasligini aytadi.
2. Berilgan qoida boʻyicha qisqa parolning izini **qogʻozda hisoblaydi**.
3. Bir xil iz beradigan ikki xil parol boʻlishi mumkinligini (toʻqnashuv) tushuntiradi.
4. Sayt kirishda nima qilishini aytadi: izni qayta hisoblab, saqlangan iz bilan solishtiradi.
5. «Sayt eski parolimni xat bilan yubordi» — bu xavfli belgi ekanini biladi.
6. Nega hamma saytda bir xil parol ishlatmaslik kerakligini va tuz nima uchun kerakligini aytadi.

## Fayllar

- `js/logic.js` — iz qoidasi (`iz`, `izQadamlar`, `izHisob`), toʻqnashuv izlash (`toqnash`),
  raqamlar yigʻindisi, tuz va yetti xil savol generatori.
- `tests/logic.test.js` — 17 test; ichida **«har parol uchun bir xil iz beradigan boshqa parol
  topiladi»** va **«bir xil parol har saytda boshqa iz beradi»** daʼvolari qulflangan.
- `js/scenes/` — `common.js` (karta, alifbo jadvali, qoida, hisob jadvali, yetti xil mashq ekrani),
  `stage1.js`, `stage2.js`, `stage3.js`, `final.js`.
- `js/game-art.js` — uch rasm (voronka, barmoq izi, baza), hammasi matnsiz SVG.

## 2026-10-02 qiyinlik yangilanishi

Sabab: "izlar bir xilmi? Ha / Yoʻq" 2 variantli edi (ikki urinish bilan yutqazib boʻlmasdi); xulosa savollari 3 variantli; sonlar va parollar bosqich ichida oʻsmasdi; maslahat (`nega`) koʻp joyda javobning oʻzini aytardi.

- Hamma mashq `tier` oladi (`bosqich1Task(r, prev, n, tier)` va h.k.):
  - 1-bosqich: son 4 → 5 → **6 xonali** (`SON`). Toʻqnashuv savolida chalgʻituvchilarning yigʻindisi javobdan ±3 ichida — koʻz bilan ajratib boʻlmaydi.
  - 2–3-bosqich: parol (`parolTanla`) 3 harf → 4 harf yoki 3 harf + raqam → **5 belgi** (4 harf + raqam yoki 5 harfli soʻz). `QISQA` 12 → 26 soʻz.
- **"Teng" savoli qayta yozildi** — "«non» parolining izi — 85. Qaysi parolning izi ham 85?": **4 variant**, har nomzodning izini bola oʻzi hisoblaydi. Tier 0 — 4 ta ikki harfli nomzod (bittasi toʻqnashadi); tier 1+ — 3 ta uch harfli nomzod + **"Hech biri"** (25% hollarda toʻgʻri javob shu). Nomzodlar unlisiz harflardan yasaladi (tasodifan soʻz chiqib qolmasin), toʻqnashuv kod bilan qidiriladi va test bilan tasdiqlanadi.
- **Xulosa savollari 4 variantli:** `HOLATLAR2/3` ning har biriga va `QAYTAR_SOXTA` ga uchinchi chalgʻituvchi qoʻshildi.
- **Maslahat javobni aytmaydi:** variantli savollarda `ishora` (usul yoki tushuncha eslatmasi) koʻrsatiladi; `nega` (toʻliq tushuntirish) faqat yechimda.

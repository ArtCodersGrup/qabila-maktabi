# Algoritmlar bloki: reja

Python blokidan keyingi blok. Bola endi **kod yozadi**; bu blokda uni **baholashni** oʻrganadi:
algoritm nima, qanday koʻrinadi (blok-sxema), qaysi biri tezroq va nega.

**Yosh:** 12–16 · **Qurilma:** kompyuter (💻) · **Holati:** reja kelishildi (2026-10-01), kod yozilmagan.
**Shart:** Python bloki bolalarda sinalgach boshlanadi ([`PYTHON-SINOV.md`](PYTHON-SINOV.md)).

> **Holat (2026-10-01):** **36-oʻyin toʻliq yozildi** va saytga ulandi (`36-algoritm-xossalari`).
> **Blok yopildi: 36–40-oʻyinlar yozildi va saytga ulandi (2026-10-01).**
> Qoladi: muallif oʻzi koʻrib chiqadi; keyin — kombinatorika bloki.

**Muallif topshirigʻi (2026-10-01):** «algoritmlar, ularning turlari va xossalari, misollar, nega ular bizga kerak.
O bolshoy ham boʻlar edi. Blok-sxema koʻrinishini tasvirlash ham yaxshi (oʻyinga oʻxshatib, blok qoʻyadigan qilib).
Kombinatorika ham yaxshi variant.»

**Kelishilgan (2026-10-01):**

| Savol | Qaror |
|---|---|
| Qaysi blok avval | **Algoritmlar** (kombinatorika alohida blok, keyin) |
| O bolshoy | **Oʻlchov + nom**: bolaning kodi har xil n da ishga tushiriladi, qadamlar jadvali chiziladi, keyin `O(n)`, `O(n²)`, `O(log n)` deb nomlanadi. Taʼrif va formula yoʻq |
| Blok-sxema | **Alohida oʻyin**: bosish bilan sxema yigʻiladi va undan Python kodi chiqadi; teskarisi ham |
| Bolalarda sinov | Yangi blokdan **oldin** |

---

## 1. Nega bu blok kerak

Python blokida bola "ishlaydigan kod" yozishni oʻrgandi. Olimpiadada bu yetmaydi: kod **ishlashi** kerak, lekin
**vaqtida** ishlashi ham kerak. Shu blok ikkita savolga javob beradi: *bu algoritm toʻgʻrimi?* va *bu algoritm tezmi?*

**Asosiy asbob — talqinchimiz qadamlarni sanaydi.** Oʻlchandi (2026-10-01), bolaning kodida:

| Usul | n=10 | n=20 | n=40 | n=80 |
|---|---|---|---|---|
| chiziqli izlash | 45 | 85 | 165 | 325 |
| ikkilik izlash | 47 | 72 | 117 | 202 |
| pufakcha saralash | 359 | 1 414 | 5 624 | 22 444 |

n ikki barobar oshsa: chiziqli — ikki barobar, saralash — **toʻrt barobar**, ikkilik izlash — deyarli oʻzgarmaydi.
Bola buni **oʻz kodida** koʻradi. `O(n)` shundan keyin nom sifatida kiritiladi.

## 2. Blok rejasi: besh oʻyin

| № | Oʻyin | Mavzu |
|---|---|---|
| 36 | **Algoritm va xossalari** ✅ | nega kerak; tushunarlilik, aniqlik, diskretlik, natijaviylik, ommaviylik |
| 37 | **Blok-sxema** ✅ | belgilar; sxemani yigʻish → kod; kodni oʻqib sxemani tanlash |
| 38 | **Izlash** ✅ | "oʻylagan sonni top" → chiziqli izlash → ikkilik izlash |
| 39 | **Saralash** ✅ | pufakcha va tanlash: koʻz bilan koʻrinadigan almashinuv, keyin kod |
| 40 | **Qadamlar soni** ✅ | oʻlchov jadvali → `O(n)`, `O(n²)`, `O(log n)`; "10 000 ta son uchun qaysi biri ishlaydi?" |

### 36. Algoritm va xossalari
1. **Nega kerak:** bir xil ishni ikki xil yoʻl bilan bajarish (masalan, 1 dan 100 gacha yigʻindi: sikl bilan va formula bilan) — ikkalasi ham toʻgʻri, lekin qadamlari boshqa.
2. **Xossalar buzilgan:** bolaga buzuq algoritm beriladi — "bir oz tuz sol" (aniqlik yoʻq), toʻxtamaydigan (natijaviylik yoʻq), faqat bitta songa ishlaydigan (ommaviylik yoʻq), bir vaqtda ikki ish (diskretlik yoʻq). Bola qaysi xossa buzilganini topadi.
3. **Mashq:** kod berilgan — qaysi xossa buzilgan? Va buzilganini tuzatish.

### 37. Blok-sxema
1. **Belgilar:** boshlash/tugash (oval), amal (toʻrtburchak), shart (romb), kiritish/chiqarish (parallelogramm) — kodga moslash.
2. **Yigʻish:** bosish bilan blok qoʻshiladi (sudrash yoʻq — QOIDALAR §3), sxema chiziladi va **undan Python kodi hosil boʻladi**; ▶︎ bosilsa, kod ishga tushadi.
3. **Ikki tomon:** kod berilgan — mos sxemani tanlash; sxema berilgan — kodni yozish.

> **Cheklov (ish hajmini ushlab turish uchun):** sxema chiziqli ketma-ketlik + bitta darajali ichma-ichlik (shart yoki sikl ichida amallar). Ichma-ich shart ichida sikl — yoʻq. Maktab dasturidagi mavzular shu bilan qoplanadi.

### 38. Izlash
1. **Oʻylangan son:** kompyuter 1–1000 orasida son oʻylaydi, bola topadi ("katta/kichik"). Nechta savolda topdi? Keyin kompyuter topadi — 10 ta savolda.
2. **Chiziqli izlash:** roʻyxatdan sonni topadigan kodni bola yozadi; qadamlar sanaladi.
3. **Ikkilik izlash:** saralangan roʻyxatda yarmini tashlab yuborish; kodini yozadi; ikkala usul jadvalda solishtiriladi.

### 39. Saralash
1. **Pufakcha:** ustunlar koʻrinadi; bola qaysi juftni almashtirishni oʻzi tanlaydi, keyin kompyuter qoidani aytadi.
2. **Kod:** pufakcha saralashni yozadi (ichma-ich sikl — 32-oʻyin davomi).
3. **Tanlash saralashi** va solishtirish: ikkalasi ham `O(n²)`, lekin almashinuvlar soni boshqa.

### 40. Qadamlar soni ✅
1. **Oʻlchov:** bitta kod n = 10, 20, 40 da oʻlchanadi; jadvalda «oldingidan necha barobar» ustuni. Mashq: ikki oʻlchov berilgan — uchinchisini bashorat qilish.
2. **Nom qoʻyish:** toʻrt usul yonma-yon, oʻsish grafigi, keyin nom: `O(1)`, `O(log n)`, `O(n)`, `O(n²)`. Mashq: kod + oʻlchov → nom.
3. **Amaliy savol:** qoida bilan hisoblash (n → 2n), keyin tanlov: 1 000 000 ta sondan izlash, 100 000 ta sonni pufakcha bilan saralash va h.k.

**Oʻlchov sonlari qoʻlda yozilmagan:** talqinchi sanaydi, `tests/logic.test.js` har namunaning nisbati oʻz sinfiga tushishini tekshiradi
(formula ×1.00, ikkilik izlash ×1.13, chiziqli izlash ×1.93, pufakcha ×4.01).

## 3. Keyingi blok: Kombinatorika

`01-qabila-kodlari` ga ulanadi (u yerda aⁱ allaqachon bor): koʻpaytirish va qoʻshish qoidalari,
oʻrin almashtirish, guruhlash, Paskal uchburchagi — hammasi olimpiada masalalarida uchraydi.

## 4. Men koʻrgan xatarlar

1. **Blok-sxema yigʻuvchisi — blokning eng katta qismi** (maydon, bloklar, ichma-ichlik, kod hosil qilish). Uni birinchi qilib emas, **36-oʻyindan keyin** yozish kerak: avval kichikroq oʻyinda naqsh sinaladi.
2. **O(n) formulaga aylanib qolishi mumkin.** Qoida: har bir taʼrif **oʻlchovdan keyin** keladi, oldin emas.
3. **Saralash animatsiyasi chalgʻitishi mumkin.** QOIDALAR §6: animatsiya 0,2–0,6 s. Almashinuvni tez qilib, qadam sonini yonida koʻrsatish kerak.

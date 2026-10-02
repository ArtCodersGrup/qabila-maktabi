# 09 — Qoida yoki misol?: dizayn

**Mavzu:** Sunʼiy intellekt — qoida yozilgan dastur va misoldan o'rganadigan dastur (AI ↔ ML)
**Yosh:** 8–12
**Taxminiy davomiyligi:** 20 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-21)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Oldingi AI o'yinlari: `06` misollardan o'rganish, `07` til modeli, `08` mukofot.

> Robot ikki xil ishlaydi. Ba'zi ishga **qoida yozib beramiz** ("agar … bo'lsa …").
> Ba'zi ishga esa qoida yozib bo'lmaydi — o'shanda **misollar ko'rsatamiz** va u o'zi topadi.

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. "Agar … bo'lsa … aks holda …" ko'rinishidagi **qoida** yozadi va uni misollarda sinaydi.
2. Qoida yozib bo'ladigan ishni (aniq belgi, aniq chegara) qoida yozib bo'lmaydiganidan **ajratadi**.
3. Qoida ishlamaganda **misollardan o'rgatish** kerakligini biladi — buni **mashinali o'rganish** deyishadi.
4. Mashinali o'rganish sunʼiy intellektning **bir qismi** ekanini aytadi (oddiy qoidali dastur — masalan kalkulyator — sunʼiy intellekt emas).
5. Yangi ishni ko'rganda "bunga qoida yozamizmi yoki misol beramizmi?" degan savolga javob beradi.

## 2. Asboblar

- **Narsalar (kartochkalar):** har birida 2 ta belgi ko'rinadi: **kattaligi** (1–9) va **dogʻlari soni** (1–9), hamda javobi (✓ / ✗ ko'rinishida ochiladi).
- **Qoida yasagich:** `Agar [kattaligi ▾] [> ▾] [5 ▾] boʻlsa — HA` — uch tugma bilan tanlanadi (belgi, amal, son). Har bosishda keyingi qiymatga o'tadi.
- **Sinov taxtasi:** 8 ta narsa; qoida ishga tushirilganda har biriga ✓ yoki ✗ qo'yiladi, pastda **"Xato: N"**.
- **Robot** (umumiy rasm) — qoidani bajaradi yoki misollardan o'rganadi.

## 3. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (robotga ish buyuramiz)
   ├─► 1-bosqich: Qoida yozamiz      [qoida yasagich → 2 ta ish → mashq]
   ├─► 2-bosqich: Qoida ishlamaydi   [yangi ish → hamma qoida sinaladi → misollar bilan o'rganish → mashq]
   └─► 3-bosqich: Qaysi biri kerak?  [qiyoslash jadvali → mashq 3 → hikoya] → tabrik
```

**Kirish:** "Robotga ish buyuramiz!" / (Shogird) "Unga qanday tushuntiramiz?" / "Ikki yoʻl bor: qoida yozamiz yoki misol koʻrsatamiz."

## 4. 1-bosqich: Qoida yozamiz

1. **Ish:** "Katta yong'oqlarni ajrat." Bola qoida yasaydi: `Agar kattaligi > 5 boʻlsa — HA`. "Ishga tushir" bosiladi: 8 ta narsa tekshiriladi, xato 0 bo'lsa — tayyor.
2. **Ikkinchi ish:** "Dogʻi ko'p mevalarni ajrat" — belgi almashadi (`dogʻlari > 4`).
3. **Ta'rif:** "Biz robotga **qoida** yozdik. U qoidani soʻzsiz bajaradi — bu oddiy dastur."
4. **Mashq** (4 / 5 / 6 ta to'g'ri — oxirdagi «qiyinlik yangilanishi»ga qara): tasodifiy ish beriladi ("kattaligi 6 dan kichiklarni ajrat" kabi), bola qoidani yasab, xato 0 ga keltiradi. 1-xato: xato qilingan narsalar yonadi. 2-xato: to'g'ri qoida ko'rsatiladi.

## 5. 2-bosqich: Qoida ishlamaydigan ish

1. **Yangi ish:** "Shu mevalarni ajrat" — bu safar belgilar chalkash (kichigi ham, kattasi ham HA bo'lishi mumkin).
2. Bola qoida yasab ko'radi — xato qolaveradi. Keyin: **"Robot hamma qoidani sinab koʻrsin"** tugmasi: robot barcha qoidalarni (belgi × amal × son) sinaydi va **eng yaxshisi ham xato qilishini** ko'rsatadi.
3. **Yechim:** "Unda misol koʻrsatamiz." Bola 6 ta misolni belgilaydi → robot ularga qarab qaror qiladi (eng yaqin misol — 6-o'yindagidek) va sinovda xato 0 bo'ladi.
4. **Ta'rif:** "Qoida yozib boʻlmasa — misol koʻrsatamiz. Buni **mashinali oʻrganish** deyishadi."
5. **Mashq** (4 / 5 / 6 ta to'g'ri — oxirdagi «qiyinlik yangilanishi»ga qara): ikki xil ish beriladi ("qoidali" yoki "chalkash"), bola **"Qoida yozamiz"** yoki **"Misol koʻrsatamiz"** tugmasini tanlaydi. 1-xato: narsalar joylashuviga ishora. 2-xato: javob va sababi.

## 6. 3-bosqich: Qaysi biri kerak?

1. **Qiyoslash:** ikki ustun — `Qoida yozamiz` (aniq belgi, aniq chegara, kam holat) va `Misol koʻrsatamiz` (chalkash, koʻp holat, rasm/ovoz/matn).
2. **Ta'rif:** "Aqlli ishni qoida bilan ham, misol bilan ham qilsa boʻladi. Misoldan oʻrganadigani — **mashinali oʻrganish**." (Kalkulyator kabi oddiy qoidali dastur sunʼiy intellekt hisoblanmaydi — 12-oʻyinda "Oddiy dastur" zonasi.)
3. **Mashq** (4 / 5 / 6 ta to'g'ri — oxirdagi «qiyinlik yangilanishi»ga qara): hayotdan misollar — "kalkulyator", "yuzni tanish", "budilnik", "ovozni matnga aylantirish", "svetofor taymeri", "qoʻlda yozilgan raqamni oʻqish", "narxni qoʻshish", "kasallikni rasmdan topish". Bola "Qoida" yoki "Misol" deb javob beradi.
4. **Hikoya:**
   1. (kalkulyator) "Kalkulyator — qoida yozilgan dastur. U hech narsa oʻrganmaydi, lekin xato ham qilmaydi."
   2. (mushuk rasmi) "Mushukni tanish uchun qoida yozib boʻlmaydi — minglab misol kerak."
   3. (ichma-ich doiralar) "Sunʼiy intellekt — katta doira. Misoldan oʻrganish — uning ichidagi qism: mashinali oʻrganish."
   4. (robot) "Sen 6-, 7- va 8-oʻyinlarda aynan mashinali oʻrganishni qilding!"

**Tabrik:** "Tabriklayman! Endi sen qoida bilan misolni ajrata olasan!" — "Aniq chegara boʻlsa — qoida yozamiz", "Chalkash boʻlsa — misol koʻrsatamiz", "Misoldan oʻrganish — mashinali oʻrganish".

## 7. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `js/rules.js` | Sof hisob: narsalar, qoida (`belgi`, `amal`, `son`), qoidani baholash, barcha qoidalarni sinash, "qoidali"/"chalkash" to'plamlar, hayotdan misollar, topshiriqlar. Node testlari. |
| `js/game-art.js` | Meva/narsa kartochkasi, kalkulyator, doiralar (AI ⊃ ML) rasmlari |
| `js/rules-ui.js` | Narsalar taxtasi, qoida yasagich, xato hisoblagichi, javob tugmalari |
| `js/scenes/*.js` | Bosqichlar, mashqlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `qoida-yoki-misol:v1`) |

## 8. Bu o'yinga kirmaydi

Bir nechta shartli qoida (`va`, `yoki`), qaror daraxti, dasturlash tili sintaksisi, neyron tarmoq (11-o'yinda).

## 9. 2026-10-02 qiyinlik yangilanishi

Bolalar "o'ta oson" deyishgan: 2- va 3-bosqich mashqi "Qoida / Misol" (2 variant, 2 urinish) edi — o'ylamasdan o'tib bo'lardi. Yuqoridagi mashq tavsiflari o'rniga endi shu amal qiladi (QOIDALAR §4.3, §4.5):

- **To'g'ri javoblar soni:** 4 / 5 / 6 (1- / 2- / 3-bosqich), qiyin rejimda 7 — `QK.practice.need()`.
- **1-bosqich** (qoidani o'zi yasaydi): `makeRuleTask(prev, rng, tier)` — tier 0: 8 ta narsa, chegara 3..7; tier 1: chegara 2..8, xatosiz ishlaydigan qoidalar ko'pi bilan 4 ta; tier 2: **10 ta narsa**, ko'pi bilan 2 ta (chegarani aniq topish kerak). Maslahat endi kerakli belgini aytmaydi.
- **2-bosqich:** "qoida yetadimi?" o'rniga **"Qaysi qoida shu narsalarni xatosiz ajratadi?"** — 3 ta qoida + "Hech qaysi qoida — misol kerak" (4 variant, `makeSetKindTask` → `options`, `answerIndex`). Chalg'ituvchi qoidalar tier bilan to'g'riga yaqinlashadi: tier 0 — ≥ 3 xato, tier 2 — eng kam xatolilar. Maslahat: bola tanlagan qoida taxtada ishga tushiriladi (qayerda adashgani ko'rinadi), to'g'ri javob aytilmaydi.
- **3-bosqich — ikki qadam** (`common.twoStep`): "Qoida / Misol", keyin **"Nega?"** — 4 ta sabab (to'g'risi, shu turdagi boshqa ishning sababi, ikkinchi turdan ikkita). Ikkalasi to'g'ri bo'lsagina hisoblanadi.
- **Bank:** hayotdan holatlar 12 → **24** (12 qoida + 12 misol), sabablar takrorlanmaydi.
- **Qilinmadi:** uchinchi belgi ("rangi") qo'shilmadi — "rangi > 5" degan qoida bolaga ma'nosiz, narsa rasmi (`game-art.js`) va qoida yasagichni qayta loyihalash kerak.
- **Testlar:** `tests/rules.test.js` (tier chegaralari, 4 variant, yagona to'g'ri javob, takrorlanmaslik), `tests/twostep.test.js` (ikki qadamli savolni taxmin bilan o'tib bo'lmasligi).


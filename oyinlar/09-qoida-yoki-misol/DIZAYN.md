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
4. Mashinali o'rganish sunʼiy intellektning **bir qismi** ekanini aytadi.
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
   ├─► 1-bosqich: Qoida yozamiz      [qoida yasagich → 2 ta ish → mashq 3]
   ├─► 2-bosqich: Qoida ishlamaydi   [yangi ish → hamma qoida sinaladi → misollar bilan o'rganish → mashq 3]
   └─► 3-bosqich: Qaysi biri kerak?  [qiyoslash jadvali → mashq 3 → hikoya] → tabrik
```

**Kirish:** "Robotga ish buyuramiz!" / (Shogird) "Unga qanday tushuntiramiz?" / "Ikki yoʻl bor: qoida yozamiz yoki misol koʻrsatamiz."

## 4. 1-bosqich: Qoida yozamiz

1. **Ish:** "Katta yong'oqlarni ajrat." Bola qoida yasaydi: `Agar kattaligi > 5 boʻlsa — HA`. "Ishga tushir" bosiladi: 8 ta narsa tekshiriladi, xato 0 bo'lsa — tayyor.
2. **Ikkinchi ish:** "Dogʻi ko'p mevalarni ajrat" — belgi almashadi (`dogʻlari > 4`).
3. **Ta'rif:** "Biz robotga **qoida** yozdik. U qoidani soʻzsiz bajaradi — bu oddiy dastur."
4. **Mashq** (3 ta to'g'ri): tasodifiy ish beriladi ("kattaligi 6 dan kichiklarni ajrat" kabi), bola qoidani yasab, xato 0 ga keltiradi. 1-xato: xato qilingan narsalar yonadi. 2-xato: to'g'ri qoida ko'rsatiladi.

## 5. 2-bosqich: Qoida ishlamaydigan ish

1. **Yangi ish:** "Shu mevalarni ajrat" — bu safar belgilar chalkash (kichigi ham, kattasi ham HA bo'lishi mumkin).
2. Bola qoida yasab ko'radi — xato qolaveradi. Keyin: **"Robot hamma qoidani sinab koʻrsin"** tugmasi: robot barcha qoidalarni (belgi × amal × son) sinaydi va **eng yaxshisi ham xato qilishini** ko'rsatadi.
3. **Yechim:** "Unda misol koʻrsatamiz." Bola 6 ta misolni belgilaydi → robot ularga qarab qaror qiladi (eng yaqin misol — 6-o'yindagidek) va sinovda xato 0 bo'ladi.
4. **Ta'rif:** "Qoida yozib boʻlmasa — misol koʻrsatamiz. Buni **mashinali oʻrganish** deyishadi."
5. **Mashq** (3 ta to'g'ri): ikki xil ish beriladi ("qoidali" yoki "chalkash"), bola **"Qoida yozamiz"** yoki **"Misol koʻrsatamiz"** tugmasini tanlaydi. 1-xato: narsalar joylashuviga ishora. 2-xato: javob va sababi.

## 6. 3-bosqich: Qaysi biri kerak?

1. **Qiyoslash:** ikki ustun — `Qoida yozamiz` (aniq belgi, aniq chegara, kam holat) va `Misol koʻrsatamiz` (chalkash, koʻp holat, rasm/ovoz/matn).
2. **Ta'rif:** "Ikkalasi ham sunʼiy intellekt. Misoldan oʻrganadigani — **mashinali oʻrganish**."
3. **Mashq** (3 ta to'g'ri): hayotdan misollar — "kalkulyator", "yuzni tanish", "budilnik", "ovozni matnga aylantirish", "svetofor taymeri", "qoʻlda yozilgan raqamni oʻqish", "narxni qoʻshish", "kasallikni rasmdan topish". Bola "Qoida" yoki "Misol" deb javob beradi.
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

# Yozuv poygasi (onlayn musobaqa): dizayn

**Nima:** oʻqituvchi bitta xona ochadi, bolalar 4 xonali kod bilan kiradi. Hamma **bir xil matnni** yozadi; yozgan sari qahramoni **togʻga koʻtariladi**. Oʻyin **hamma choʻqqiga chiqquncha** davom etadi.
**Yosh:** 8–12 (yozishni «Oʻn barmoq» oʻyinida oʻrgangan bola).
**Qayerda:** bosh sahifa → Musobaqalar → **Onlayn** → «Yozuv poygasi» (papka `oyinlar/yozuv-poygasi/`).
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-29).

**Muallif topshirigʻi (2026-09-29):** «tez yozish poygasi koʻpchilik bogʻlangan holda qiladigan qilish kerak. Ustoz bitta xona ochadi, qolgani raqam bilan kiradi. Yozgan sari togʻga chiqadigan qilinsa boʻladi, faqat olib ketmaydi. Oʻyin hamma yetib olguncha davom etsin, qolgan joyini oʻzing oʻylab top.»

**Kelishilgan:**
- Bitta ekrandagi eski «Tez yozish poygasi» (`oyinlar/poyga/`) **oʻz oʻrnida qoladi** — internetsiz va uyda ikki kishi uchun.
- Nomi — **«Yozuv poygasi»**, onlayn musobaqalar qatorida.

---

## 1. Men qabul qilgan qarorlar (muallif hali koʻrmagan)

1. **Tayyor qismlar qayta yozilmaydi.** Togʻ manzarasi, 12 rangli qahramon va sahna — `oyinlar/tog/` dan; yozish mexanikasi, klaviatura koʻrsatkichi va matnlar — `oyinlar/23-on-barmoq/` dan; xona qatlami — `umumiy/js/onlayn.js` dagi `xona()`. Boshqa papkadagi faylga murojaat qilish loyihada bor (eski poyga `23-on-barmoq` ni shunday ishlatadi).
2. **Togʻ oʻyinining qoidalari BU YERDA ishlamaydi:** pauza yoʻq, qolib ketish yoʻq, chiqib ketish yoʻq, vaqt chegarasi yoʻq. Shuning uchun `tog.js` hisobi ishlatilmaydi — yangi, ancha soddasi yoziladi. Togʻdan faqat **koʻrinish** olinadi.
3. **Xato tugma oʻtkazmaydi.** Notoʻgʻri bosilgan belgi qahramonni joyida ushlab turadi (yozish oʻyinidagidek). Jarima, qizil rang, orqaga tushish **yoʻq** — xato faqat vaqt oladi (QOIDALAR 4.4).
4. **Faqat kompyuterda.** Yozish uchun haqiqiy klaviatura kerak: bosh sahifada 💻 belgisi. Telefondan kirgan bolaga ogohlantirish chiqadi va u **tomoshabin** boʻladi (togʻni koʻradi, yozmaydi).
5. **Matn tarmoqqa chiqmaydi.** Oʻqituvchi faqat **matn turi + urugʻ (son)** yuboradi; har qurilma matnni oʻzi yasaydi (`typing.raceText` urugʻli tasodif bilan). Loyiha qoidasi: tarmoqqa faqat sonlar, 0/1 va qisqa kalit soʻzlar.
6. **Xabarlar kam.** Bola har belgida emas, **pogʻonasi oʻzgarganda** xabar yuboradi (~2 soniyada bir marta). Oʻqituvchi holatni 0,7 soniyada bir marta tarqatadi (togʻdagidek). 12 bola — sekundiga ~5 ta xabar.
7. **Oʻqituvchi oʻzi yozmaydi** — ekrani doska: kod, togʻ, hamma qahramon, «chiqqanlar 3/8».
8. **Oxiri:** hamma choʻqqiga chiqqanda oʻzi tugaydi. **Xonadan chiqib ketgan bola kutilmaydi** — poyga qolganlar uchun osilib qolmasligi kerak (kamida bittasi yetib borgan boʻlsa). Bundan tashqari oʻqituvchida **«Tugatish»** tugmasi bor (dars tugasa) va bolani **chiqarib yuborish** tugmasi.
9. **Togʻ matn turiga qarab tanlanadi** — bola uchun bepul xilma-xillik: asosiy qator → Chimyon (15 pogʻona), soʻzlar → Hazrati Sulton (20), maqol → Pomir (25). Pogʻona faqat koʻrinish: yozilgan ulush pogʻonaga aylantiriladi.
10. **Uzilish:** bola yashirin raqami (`poyga:men:v1`) bilan qaytib kirsa, oʻsha joyidan davom etadi. Oʻqituvchidan 20 soniya xabar kelmasa, bolalarda oʻyin natija bilan tugaydi. Poyga boshlangandan keyin kirgan bola keyingisini kutadi.

## 2. Oʻquv maqsadi

Bola klaviaturaga qaramay, **aniq va tez** yozishga mashq qiladi. Poyga qiziqish uygʻotadi; xato jazolanmagani uchun bola shoshmay, toʻgʻri yozishga harakat qiladi (aniqlik tezlikni oʻzi keltiradi).

## 3. Ekranlar

### 3.1. Bosh menyu
«Xona ochish (oʻqituvchi)» · «Xonaga kirish» · pastda havolalar: «Oʻn barmoq» (yozishni oʻrganish) va «Tez yozish poygasi» (internetsiz, ikki kishi).

### 3.2. Oʻqituvchi (proyektor)
```
┌──────────────────────────────────────────────┐
│ Xona kodi: 4827            Chiqqanlar: 3/8   │
│                                              │
│   ⛰ Hazrati Sulton — 20-pogʻona              │
│   20 ── 🔴 🟢 🟣   (choʻqqi)                  │
│   14 ── 🔵                                    │
│   ...                                        │
│    0 ── 🧓                                    │
│   1. Qizil  2. Yashil  3. Binafsha  …        │
│                        [Tugatish]            │
└──────────────────────────────────────────────┘
```
- **Lobbi:** kod katta harflarda, kirganlar rangi bilan, har birining yonida chiqarib yuborish tugmasi, «Boshlash» (kamida 2 bola).
- **Poyga:** togʻ va hamma qahramon jonli, yon roʻyxatda tartib, tepada «Chiqqanlar: 3/8».
- **Oxiri:** natija jadvali — oʻrin, rang, vaqt, belgi/daqiqa, aniqlik. «Yangi poyga» (oʻsha xona, yangi matn) va «Tugatish».

### 3.3. Bola (kompyuter)
- Kod → rang tanlash (bitta rang bitta bolaga) → «Oʻqituvchi boshlashini kut».
- 3-2-1 sanoq → poyga ekrani: **chapda togʻ** (hamma qahramon jonli), **oʻngda matn va klaviatura koʻrsatkichi**.
- Choʻqqi: «2-oʻrin!» + oʻz natijasi (vaqt, belgi/daqiqa, aniqlik), keyin togʻni kuzatadi.
- Oxirida hammaning natijasi.

## 4. Matn

`typing.RACE_LEVELS` dagi uch tur (eski poygadagidek):

| Tur | Matn | Togʻ | Uzunligi |
|---|---|---|---|
| Asosiy qator | 5 ta soʻz (asosiy qator harflari) | Chimyon (15) | ~25 belgi |
| Soʻzlar | 5 ta koʻp ishlatiladigan soʻz | Hazrati Sulton (20) | ~30 belgi |
| Maqol | bitta maqol | Pomir (25) | ~45 belgi |

Bitta poyga — 30–90 soniya. 45 daqiqalik darsda koʻp marta oʻynash mumkin.

## 5. Texnik tuzilish

- **Kanal:** `xona:poyga:<kod>` (`onlayn.KINDS` da `poyga` bor — bazaga tegilmaydi). Presence: `host` + bolalarning yashirin raqami.
- **Hisob oʻqituvchi qurilmasida.** Bola faqat oʻz qadamini yuboradi, tartibni va natijani oʻqituvchi hisoblaydi va tarqatadi.
- **Xabarlar** (erkin matn yoʻq, `onlayn.validMessage` tekshiradi):

| Kimdan | Turi | Maʼlumot |
|---|---|---|
| bola | `kirdi` | tanlagan rangi |
| bola | `qadam` | yozilgan belgilar soni; tugagan boʻlsa — vaqt, tezlik, aniqlik |
| oʻqituvchi | `lobbi` | kim kirdi va qaysi rangni tanladi |
| oʻqituvchi | `holat` | matn turi va urugʻi, har kimning belgilari/pogʻonasi/oʻrni, tugadimi |

- **Sof mantiq** `js/poyga.js` (holat, pogʻona hisobi, tartib, natija) va `js/protokol.js` (urugʻ, paket) — Node testlari bilan. Robot yozuvchilar bilan sinov: 12 ta robot har xil tezlik va xato bilan yozadi.

## 6. Kirmaydi

Ism va chat, qolib ketish/chiqib ketish, vaqt chegarasi, telefonda yozish, umumiy reyting jadvali, robotlar bilan mashq rejimi (keyingi versiyada boʻlishi mumkin), 12 dan koʻp bola.

# 40-oʻyin — «Qadamlar soni va O(n)»

Blokning yopiluvchi oʻyini. 36–39-oʻyinlarda bola qadamlarni **oʻlchadi**; shu yerda
oʻlchov **nom** oladi: O(1), O(log n), O(n), O(n²).

- **Yosh:** 12–16. 💻 Kompyuter uchun (klaviatura kerak).
- **Oldin oʻtilgan:** 36 (algoritm xossalari), 37 (blok-sxema), 38 (izlash), 39 (saralash).
- **Tartib:** avval oʻlchov, keyin nom (QOIDALAR §4.1 — qoida misoldan keyin).

## Asosiy fikr

Vaqtni sekundda oʻlchash notoʻgʻri: kompyuterlar har xil tez. Shuning uchun
**qadamni sanaymiz**. Lekin bitta son ham yetarli emas — muhimi, **n ikki barobar
oshganda qadam necha barobar oshadi**:

| Oʻsish | Nomi | n ikki barobar oshsa |
| --- | --- | --- |
| oʻzgarmas | O(1) | qadam oʻzgarmaydi |
| logarifmik | O(log n) | bir necha qadam qoʻshiladi (×1.1) |
| chiziqli | O(n) | qadam ikki barobar (×2) |
| kvadratik | O(n²) | qadam toʻrt barobar (×4) |

Qadamlarni talqinchining oʻzi sanaydi (`QK.python.run(kod).steps`) — hech qanday
raqam qoʻlda yozilmagan. `tests/logic.test.js` har namunaning oʻlchovi oʻz sinfiga
tushishini tekshiradi.

## Bosqichlar

**1. Qadamni oʻlchash.** Bitta kod n = 10, 20, 40 da oʻlchanadi. Jadval toʻladi,
nisbat ustuni koʻrinadi. Mashq: ikki oʻlchov berilgan, bola uchinchisini bashorat
qiladi (oʻzgarmaydi / bir necha qadam / ikki barobar / toʻrt barobar), keyin
haqiqiy oʻlchov ochiladi.

**2. Nom berish.** Toʻrt usul yonma-yon qoʻyiladi, oʻsish grafigi koʻrsatiladi va
har qatorga nom beriladi. `O(...)` belgisi — «oʻsish nomi»; aniq son emas,
shuning uchun 2n ham, n + 5 ham O(n). Mashq: kod + oʻlchov jadvali berilgan,
bola toʻrt nomdan birini tanlaydi.

**3. Katta n da tanlash.** Qoida bilan oʻlchamasdan hisoblash (n → 2n), keyin
amaliy savollar: 1 000 000 ta son ichidan izlash, 100 000 ta sonni pufakcha bilan
saralash, 1 dan 1 000 000 gacha yigʻindi, 10 000 ta oʻquvchining juftliklari.

## Grafik (dataviz)

- Oʻlchangan **nisbat** chiziladi (×1, ×1.1, ×2, ×4), absolyut qadamlar — jadvalda.
  Sabab: n² da n = 80 dagi ustun qolganini bosib ketadi.
- Gorizontal ustun: nomi chapda, nisbat ustun oxirida yozilib turadi (rang yolgʻiz
  belgi emas).
- Ranglar — loyiha palitrasi: O(1) `#1A9E77`, O(log n) `#2F6FDE`, O(n) `#F08A24`,
  O(n²) `#8E5BD0`. `validate_palette.js` bilan tekshirilgan (hammasi PASS;
  `#F08A24` kontrasti 2.45 — shuning uchun yozuv va jadval majburiy, ikkalasi ham bor).

## Fayllar

- `js/logic.js` — namunalar, `olcha/olchovlar/nisbat/sinfniTop`, savollar.
- `js/scenes/*` — bosqichlar; `common.js` da oʻsish grafigi va jadval.
- `tests/logic.test.js` — 14 test, oʻlchov ↔ sinf mosligi shu yerda qulflangan.

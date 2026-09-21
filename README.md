# Qabila maktabi

**Sayt: https://artcodersgrup.github.io/qabila-maktabi/**

8–12 yoshli bolalarga informatika, kodlash va sunʼiy intellekt qanday ishlashini **2D oʻyinlar orqali koʻrsatuvchi** sayt. Hammasi oʻzbek tilida (lotin yozuvi).

Har bir oʻyin bitta mavzuni oʻrgatadi: bola avval oʻzi qiladi, keyin oʻyin unga nom beradi, oxirida tasodifiy mashqlar beriladi (3 ta toʻgʻri javob — bosqich tugadi).

## Ochish

**Kompyuterda:** `index.html` ni ikki marta bosing — tamom. Oʻrnatish, server va internet kerak emas (rasm, shrift, ovoz va saqlangan progress — hammasi `file://` da ishlaydi).

**Telefonda (onlayn):** yuqoridagi havolani oching. Brauzer menyusidan **«Ekranga qoʻshish»** ni tanlasangiz, ilova kabi oʻrnatiladi va keyin **internetsiz ham** ishlaydi.

**Telefonda (internetsiz, uy tarmogʻida):** `sayt-ishga-tushir.command` faylini ikki marta bosing — u mahalliy serverni yoqadi va havolani koʻrsatadi (masalan `http://192.168.1.103:8777/`). Telefon kompyuter bilan bir xil Wi-Fi'da boʻlsin. Toʻxtatish: oynada Control + C.

Eslatma: progress brauzer xotirasida saqlanadi va `file://` bilan `http://localhost` alohida hisoblanadi — bitta usulni tanlab ishlatgan maʼqul.

## Oʻyinlar

| № | Oʻyin | Mavzu |
|---|---|---|
| 1 | Qabila kodlari | Nechta belgidan nechta soʻz yasaladi (aⁱ, yigʻindi, teskari masala) |
| 2 | Qabila Morzesi | Morze alifbosi: nuqta va chiziq bilan oʻqish va yozish |
| 3 | Sezar maktubi | Sezar shifri: harflarni surish, kalit, kalitsiz ochish |
| 4 | Qabila chiroqlari | Ikkilik kod: 2ⁿ naqsh, bit va bayt, rangli chiroqlar |
| 5 | Rim toshi | Rim raqamlari, Rimliklar usulida hisob, pozitsion tizim, al-Xorazmiy |
| 6 | Robotni oʻrgatamiz | Mashina misollardan oʻrganadi: eng yaqin misol, chegara chizigʻi, sinov |
| 7 | Keyingi soʻz | Til modeli: soʻz juftliklarini sanash, keyingi soʻzni tanlash |
| 8 | Sehrli qutilar | Mukofot bilan oʻrganish (MENACE) |
| 9 | Qoida yoki misol? | Qoida yozilgan dastur va misoldan oʻrganish |
| 10 | Robot nimani koʻradi? | Kompyuter koʻrish: piksellar, shablon, belgi |
| 11 | Koʻp qatlamli tarmoq | Neyron, qatlamlar, chuqur oʻrganish |
| 12 | AI xaritasi | Oddiy dastur ⊃ AI ⊃ ML ⊃ DL; usul va vazifa |
| 13 | Bayt sandigʻi | Nega 8 bit = 1 bayt, matn hajmi (1 belgi = 1 bayt), 1 Kbayt = 1024 bayt |
| 14 | Piksel ustaxonasi | Rasm hajmi: piksel, ranglar va bitlar, rangli piksel 3 bayt, Mbayt, siqish |
| 15 | Multfilm daftari | Video: kadrlar, kadr/soniya, video hajmi, Gbayt, faqat oʻzgargani |
| 16 | Xotira ombori | Bitdan Tbaytgacha zinapoya, solishtirish, nechta sigʻadi, 1 Tbayt = 931 Gbayt |
| 17 | Qabila choʻti | Sanoq tizimi nima: asos, raqamlar 0 … n−1 va A–F, 101₂ yozuvi, xona qiymatlari (10–12 yosh) |
| 18 | Tangalar bozori | Istalgan tizimdan oʻnlikka: raqam × xona qiymati (10–12) |
| 19 | Qoplarga joylash | Oʻnlikdan istalgan tizimga: kattadan boshlab, boʻlib-boʻlib, tekshirish (10–12) |
| 20 | Ikkilik hisobchi | Ikkilikda qoʻshish, ayirish (qarz), koʻpaytirish (surish) (10–12) |
| 21 | Oʻn oltilik ranglar | A–F, 2 ↔ 16, rang kodlari, 16-likda amallar (10–12) |
| 22 | Sayyoralar sanogʻi | n-lik tizimda amallar, "qaysi tizimda 3 + 4 = 10?", Bobil va Mayya (10–12) |

**Musobaqa** (`oyinlar/musobaqa/`): ikki bola bitta ekranda navbat bilan savolga javob beradi. Har kimning oʻz soati (shaxmat soatidek), 3 ta yuragi va bitta oʻtkazishi bor; savollar tanlangan mavzu va qiyinlikdan tasodifiy yasaladi.

Tugagan bosqichlar brauzer xotirasida (`localStorage`) saqlanadi — sahifa yangilansa ham yoʻqolmaydi.

## Papkalar

```
index.html          bosh sahifa: barcha oʻyinlarga kirish
bosh/               bosh sahifa fayllari (uslub, ikonkalar, roʻyxat, test)
oyinlar/umumiy/     umumiy kod: qahramonlar (SVG), ekran qismlari, tovush (Web Audio), shrift
oyinlar/NN-nomi/    har bir oʻyin: DIZAYN.md, REJA.md, index.html, js/, css/, tests/
oyinlar/musobaqa/   ikki kishilik musobaqa: savollar oʻyinlar mantiqidan yasaladi
QOIDALAR.md         barcha oʻyinlar uchun umumiy qoidalar (yosh, til, qurilmalar, xato javob, ranglar)
```

## Texnologiya

Oddiy HTML + CSS + JavaScript, grafika — SVG (kod bilan chiziladi). Kutubxona ham, yigʻish (build) ham yoʻq: skriptlar oddiy `<script>` bilan ulanadi. Hisob-kitob mantiqi ekran kodidan alohida faylda turadi va Node testlari bilan tekshiriladi.

## Testlar

```bash
node --test bosh/tests/*.test.js                       # bosh sahifa roʻyxati
cd oyinlar/05-rim-toshi && node --test tests/*.test.js  # bitta oʻyin
```

## Yangi oʻyin qoʻshish

1. [`QOIDALAR.md`](QOIDALAR.md) ni oʻqing — matn, oʻlcham, xato javob va rang qoidalari shu yerda.
2. `oyinlar/NN-oyin-nomi/` papkasini oching: `DIZAYN.md` → `REJA.md` → kod → testlar.
3. Oʻyinni [`bosh/js/bosh.js`](bosh/js/bosh.js) dagi `GAMES` roʻyxatiga qoʻshing (`bosh/tests/bosh.test.js` buni tekshiradi).

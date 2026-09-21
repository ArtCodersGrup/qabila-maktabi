# Qabila maktabi

8–12 yoshli bolalarga informatika, kodlash va sunʼiy intellekt qanday ishlashini **2D oʻyinlar orqali koʻrsatuvchi** sayt. Hammasi oʻzbek tilida (lotin yozuvi).

Har bir oʻyin bitta mavzuni oʻrgatadi: bola avval oʻzi qiladi, keyin oʻyin unga nom beradi, oxirida tasodifiy mashqlar beriladi (3 ta toʻgʻri javob — bosqich tugadi).

## Ochish

**Kompyuterda:** `index.html` ni ikki marta bosing — tamom. Oʻrnatish, server va internet kerak emas (rasm, shrift, ovoz va saqlangan progress — hammasi `file://` da ishlaydi).

**Telefonda:** `sayt-ishga-tushir.command` faylini ikki marta bosing — u mahalliy serverni yoqadi va havolani koʻrsatadi (masalan `http://192.168.1.103:8777/`). Telefon kompyuter bilan bir xil Wi-Fi'da boʻlsin. Toʻxtatish: oynada Control + C.

Eslatma: progress brauzer xotirasida saqlanadi va `file://` bilan `http://localhost` alohida hisoblanadi — bitta usulni tanlab ishlatgan maʼqul.

## Oʻyinlar

| № | Oʻyin | Mavzu |
|---|---|---|
| 1 | Qabila kodlari | Nechta belgidan nechta soʻz yasaladi (aⁱ, yigʻindi, teskari masala) |
| 2 | Qabila Morzesi | Morze alifbosi: nuqta va chiziq bilan oʻqish va yozish |
| 3 | Sezar maktubi | Sezar shifri: harflarni surish, kalit, kalitsiz ochish |
| 4 | Qabila chiroqlari | Ikkilik kod: 2ⁿ naqsh, bit va bayt, rangli chiroqlar |
| 5 | Rim toshi | Rim raqamlari, Rimliklar usulida hisob, pozitsion tizim, al-Xorazmiy |

Tugagan bosqichlar brauzer xotirasida (`localStorage`) saqlanadi — sahifa yangilansa ham yoʻqolmaydi.

## Papkalar

```
index.html          bosh sahifa: barcha oʻyinlarga kirish
bosh/               bosh sahifa fayllari (uslub, ikonkalar, roʻyxat, test)
oyinlar/umumiy/     umumiy kod: qahramonlar (SVG), ekran qismlari, tovush (Web Audio), shrift
oyinlar/NN-nomi/    har bir oʻyin: DIZAYN.md, REJA.md, index.html, js/, css/, tests/
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

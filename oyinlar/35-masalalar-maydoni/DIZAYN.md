# 35 — Masalalar maydoni: dizayn

**Mavzu:** olimpiada uslubidagi masalalar — uch daraja, 24 ta masala
**Yosh:** 12–16 · **Qurilma:** kompyuter (💻) · **Davomiyligi:** cheklanmagan (bank katta)
**Holati:** kod yozildi, testlar yashil — muallif koʻrib chiqishini kutmoqda (2026-09-30)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok rejasi: [`../umumiy/PYTHON-BLOK.md`](../umumiy/PYTHON-BLOK.md).
Bu — Python blokining **oxirgi** qismi: 27–34-oʻyinlarda oʻrganilgan hamma narsa shu yerda ishlatiladi.

> Bu yerda oʻyin yoʻq — faqat masalalar. Kirish beriladi, sen javobni chiqarasan.
> Dasturing bir nechta sinovdan oʻtadi, faqat namunadagisidan emas.

## 1. Oʻquv maqsadlari

1. Masala shartini oʻqib, **kirish va chiqish formatini** aniqlaydi.
2. Namunaviy kirish/chiqishdan yechim toʻgʻriligini tekshiradi.
3. Yechimi faqat namunaga emas, **hamma holatga** ishlashi kerakligini tushunadi.
4. Yiqilgan testni oʻqib, xatoni oʻzi topadi.
5. 27–34-oʻyinlardagi hamma vositani birga ishlatadi.

## 2. Bank tuzilishi (`js/bank.js`)

Toʻrt daraja. Har masalada **qiyinlik** (`rating`) va **teglar** bor; daraja ichida masalalar
qiyinlik boʻyicha tartiblangan — bola eng osonidan boshlaydi.

**Teglar** — bizning mavzularimiz (`TAGS`): `oʻzgaruvchi`, `matematika`, `shart`, `while`, `for`,
`roʻyxat`, `satr`, `raqamlar`, `saralash`, `funksiya`. Test notanish tegni oʻtkazmaydi.

**Codeforces darajasi** (10 ta masala, reyting 800): masala **gʻoyasi** Codeforces'dan olingan,
**shart matni oʻzimizniki** — asl matn koʻchirilmagan va tarjima qilinmagan (mualliflik huquqi).
Kartada asl masalaga havola koʻrsatiladi: `manba: { kod, nom, cfTags, url }`. Reyting va `cfTags`
Codeforces API dan olingan haqiqiy qiymatlar (2026-09-30).

Har masalada `animatsiya` maydoni bor — hozircha `null`. Qiyin masalalarga keyin bittadan
animatsiya yoziladi (har biri alohida kelishiladi).

Uchta boshlangʻich daraja, har birida 8 ta masala:

| Daraja | Mavzu | Masalalar |
|---|---|---|
| **Oson** | shart va sikl | ikki son yigʻindisi · kvadrat · juft/toq · uchtadan kattasi · 1 dan n gacha · a dan b gacha · musbat/manfiy/nol · yulduzchalar |
| **Oʻrta** | raqamlar, roʻyxat, satr | raqamlar yigʻindisi · teskari son · eng katta va kichik farqi · nechta juft · unli harflar · boʻluvchilar soni · Fibonachchi · palindrom |
| **Qiyin** | bir nechta qadam | tub sonmi · nechta tub son · EKUB · ikkinchi eng katta · ikkilik yozuv · faktorial · nechta har xil son · boʻluvchilarni chiqarish |
| **Codeforces** | haqiqiy olimpiada (800) | tarvuzni boʻlish (4A) · domino (50A) · fil qadamlari (617A) · ukalar vazni (791A) · notoʻgʻri ayirish (977A) · toshlar (266A) · gʻalati hisoblagich (282A) · jamoa (231A) · soʻzlarni solishtirish (112A) · har xil harflar (236A) |

Har masala: `title`, `what` (shart), `kirish`/`chiqish` (format), `namuna` (koʻrinadigan test), `tests` (4–5 yashirin), `solution` (namunali yechim), `hint` (maslahat).

**Testlar majburiy tekshiradi** (`tests/bank.test.js`): har yechim namunadagi javobni aynan beradi; hamma yashirin testdan oʻtadi; boʻsh va soxta yechim oʻtmaydi; yechimlarda faqat oʻrgatilgan qism ishlatiladi (`import`, `f-satr`, `map`, `enumerate` va boshqalar taqiqlangan).

## 3. Oʻyin oqimi

Har bosqich — bitta daraja. Masala **eng osonidan** beriladi, **3 tasi yechilsa** bosqich tugaydi.

**Yechilgan masalalar brauzer xotirasida saqlanadi** (`masalalar-yechilgan:v1`): bola qayta oʻynasa,
oʻsha uchtasi emas, **keyingi uchtasi** beriladi. Daraja toʻliq yechilgach roʻyxat tozalanadi va bank
boshidan beriladi. Xotira ishlamasa ham oʻyin toʻliq ishlaydi (QOIDALAR §8).

**Xato javob** (QOIDALAR §4.4): 1-xato — yiqilgan test koʻrsatiladi (kirish, kutilgan, sendan) va **maslahat** beriladi; 2-xato — yechimning bir yoʻli koʻrsatiladi va yangi masala beriladi.

## 4. Ekran

Masala kartasi: sarlavha, shart, kirish/chiqish formati, namunaviy kirish va chiqish yonma-yon. Ostida kod maydoni (6 qator) va chiqish paneli. Bolaning kodi saqlanadi (`saveKey`), sahifa yangilansa yoʻqolmaydi.

## 5. Kod tuzilishi

```
35-masalalar-maydoni/
├── js/bank.js        24 ta masala (qo'lda yozilgan)
├── js/logic.js       masala tanlash va kod.js uchun vazifaga aylantirish
├── js/game-art.js    uch pog'onali minora
├── js/scenes/…       kirish, uch daraja (bitta sahna), tabrik
└── tests/bank.test.js
```

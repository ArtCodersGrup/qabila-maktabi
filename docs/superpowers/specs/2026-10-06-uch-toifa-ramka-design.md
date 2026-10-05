# Uch toifa: ramka (0-bosqich) — dizayn

**Sana:** 2026-10-06
**Muallif qarorlari:** sayt sinf boʻyicha uch toifaga ajraladi — **1–4** (kompyuter boshlangʻich
koʻnikmalari), **5–8** (chuqurlashtirilgan informatika), **9–11** (olimpiada dasturlash). Bitta akkaunt,
oʻquvchi xohlagan toifasiga oʻtadi. Koʻrinish va tushuntirish ohangi toifaga qarab farq qiladi.
Ish tartibi: ramka → 1–4 → 5–8 → 9–11. Sunʼiy intellekt bloki 1–4 ga qoʻyilmaydi.

## Muammo

7-sinf oʻquvchisi: "juda yosh bolacha ekan", "oʻta oson ekan". Oʻlchov (2026-10-05):

- "12–16" tanlagan bola 49 oʻyin koʻradi, 25 tasi kichiklar bilan umumiy — `yosh` oraligʻi toifa
  bilan kesishsa, oʻyin ikkala toifada chiqadi.
- 64 oʻyinning hammasi bitta qobiqda: qum fon, Nunito, oqsoqol va shogird, pufak, konfeti.
- Toifalar yosh boʻyicha (8–11 / 12–16), reja esa sinf boʻyicha.

## Qamrov

**Kiradi:** uch toifa va har oʻyinning bitta toifaga biriktirilishi; bosh sahifa (sinf tanlash,
almashtirgich); koʻrinishni almashtirish mexanizmi; kattalar uchun **vaqtinchalik** koʻrinish.

**Kirmaydi (keyingi bosqichlar):**

- mashq qoidalari (necha javob, necha urinish) va matnlarni qayta yozish — 5–8 bosqichi;
- kattalar koʻrinishining haqiqiy dizayni (2–3 variant, oʻquvchilar tanlaydi) — 5–8 bosqichi;
- toʻq mavzu — 9–11 bosqichi (oʻyin fayllarida 1600 dan ortiq qattiq yozilgan rang bor);
- 1–4 uchun yangi oʻyinlar — 1–4 bosqichi.

## Toifalar

| id | Yorliq | Bosh sahifa sarlavhasi | Izoh |
|---|---|---|---|
| `boshlangich` | 1–4-sinf | Qabila maktabi | Klaviatura, robotga buyruq va sirli xabarlar |
| `orta` | 5–8-sinf | 5–8-sinf informatikasi | Kod, sonlar, internet, sunʼiy intellekt va Python |
| `yuqori` | 9–11-sinf | Olimpiada dasturlash | Algoritmlar, kombinatorika, C++ va masalalar |
| `hammasi` | Hammasi | Qabila maktabi | Oʻqituvchi uchun — barcha oʻyinlar |

### Taqsimot: har oʻyin aynan bitta toifada

`GAMES` dagi `yosh: [min, max]` oʻrniga `toifa: "<id>"`. Mezon — mavzu, ohang emas.

| Toifa | Oʻyinlar (papka raqami) | Soni |
|---|---|---|
| `boshlangich` | 02, 23, 26, 46, 47, 53, 62, 63, 64 | 9 |
| `yuqori` | 38, 39, 40, 41, 42, 43, 44, 45, 54, 55, 56, 57 | 12 |
| `orta` | qolgan hammasi | 43 |

Oʻyin boʻlmagan sahifalar (asbob va musobaqa) bir nechta toifada turishi mumkin — ularda
`toifalar: [...]`:

| Sahifa | Toifalar |
|---|---|
| `masalalar` | orta, yuqori |
| `cpp-shpargalka` | yuqori |
| `musobaqa` (savol-javob), `tog` | boshlangich, orta |
| `poyga`, `yozuv-poygasi`, `onlayn` | boshlangich, orta, yuqori |
| `tank-duel`, `tank-onlayn` | orta, yuqori |

`mos(item, toifa)`: `hammasi` — har doim; aks holda `item.toifa === toifa.id` yoki
`item.toifalar.includes(toifa.id)`. `oyinlar(toifa)` va `number(game, toifa)` oʻzgarmaydi — raqam
hamon toifa ichida 1 dan boshlanadi. `SECTIONS` tartibi bu bosqichda oʻzgarmaydi.

## Koʻrinish mexanizmi

Koʻrinishni `<html>` dagi ikki atribut belgilaydi:

- `data-toifa="boshlangich|orta|yuqori"` — sahifa qaysi toifaning koʻrinishida.
- `data-maskot` — sahifa qahramonlarsiz ishlamaydi; bunday sahifa toifasidan qatʼi nazar **hozirgi
  (bolalar) koʻrinishda qoladi**.

Kattalar koʻrinishi faqat shu shartda yoqiladi:
`data-toifa` — `orta` yoki `yuqori` **va** `data-maskot` yoʻq.

**Oʻyin sahifalarida** ikkala atribut `index.html` ichiga **yozib qoʻyiladi** (oʻyinning oʻz toifasi) —
JS kutilmaydi, sahifa birinchi chizilishdayoq toʻgʻri koʻrinishda.

**Bosh sahifa va asboblar** (`index.html`, `masalalar`, `cpp-shpargalka`, `tank-duel`, `tank-onlayn`)
da atributni `<head>` dagi `oyinlar/umumiy/js/toifa.js` oʻquvchi tanlovidan qoʻyadi (skript
`<head>` da, chizishdan oldin ishlaydi — koʻrinish "sakramaydi").

Qahramonli musobaqa sahifalari (`musobaqa`, `poyga`, `onlayn`, `tog`, `yozuv-poygasi`) ga tegilmaydi —
ular hozirgi koʻrinishda qoladi.

### Nega `data-maskot` kerak (kodni oʻlchash natijasi)

64 oʻyinning hammasida matn — **ikki ovozli suhbat**: oqsoqol tushuntiradi, shogird savol beradi
(`ui.say("apprentice", …)`). Matnda qahramonlar deyarli tilga olinmaydi, shuning uchun ularni
yashirish mumkin — shogird gapi **"Shogird" yorligʻi** bilan ajratiladi (pastga qarang).

Istisno — **3 ta oʻyin** shogirdning qogʻozi va barabanini haqiqatan ishlatadi (`ui.paper("2")`,
`ui.raisePaper`, `"drum"` holati) va matnda tilga oladi ("Qogʻozimda 2 yozilgan", "Barabanda xabar
chalaman"): **01 Qabila kodlari, 02 Qabila Morzesi, 03 Sezar maktubi**. Qolgan oʻyinlardagi
`ui.paper("")` — faqat tozalash.

Qoida: oʻyin kodi `ui.paper(` ni boʻsh boʻlmagan qiymat bilan, `raisePaper(` ni yoki `"drum"` ni
ishlatsa — `data-maskot` oladi. `orta` da bular 01 va 03: ular **5–8 bosqichida qayta yoziladi**,
shunda `data-maskot` olib tashlanadi va oʻyin kattalar koʻrinishiga oʻzi oʻtadi.

## Kattalar koʻrinishi (vaqtinchalik)

Maqsad — bolalarcha belgilarni olib tashlash; haqiqiy dizayn 5–8 bosqichida.

| Narsa | 1–4 (hozirgi) | 5–8 | 9–11 |
|---|---|---|---|
| Fon | `#FFF6E5` qum | `#FBFAF7` | `#FBFAF7` |
| Shrift | Nunito | tizim shrifti | tizim shrifti |
| Asosiy rang | `#2F6FDE` | `#2F6FDE` | `#33408A` |
| Qahramonlar | bor | yoʻq | yoʻq |
| Koʻrsatma | dumli pufak | dumsiz panel | dumsiz panel |
| Tantana | konfeti + ✓ | faqat ✓ | faqat ✓ |

Fon oq-iliq tanlandi (sovuq emas): oʻyin CSS'larida iliq kulranglar (`#F3EFE3`, `#6B6558`, `#EFE9DC`)
qattiq yozilgan — sovuq fonda ular begona koʻrinadi.

**3D qirra va burchak radiusi oʻzgarmaydi.** Oʻyinlarning oʻz CSS'larida 116 ta qirra va 268 ta radius
qattiq yozilgan; faqat umumiy tugmalarni tekislasak, bir ekranda ikki xil uslub chiqadi. Bu haqiqiy
dizayn bilan birga (5–8 bosqichi) hal qilinadi.

Kattalar selektori (`asos.css` oxirida alohida boʻlim):
`:root[data-toifa]:not([data-toifa="boshlangich"]):not([data-maskot])`.

```
--fon:#FBFAF7; --matn:#1E2230; --pufak:#FFFFFF; --matn-2:#55524A; --matn-3:#6A665C;
--yuza:#FFFFFF; --yuza-2:#F6F4EE; --panel:#F1EEE6;
--chiziq:#DAD6CB; --chiziq-kuchli:#8B8676; --soya:#DAD6CB; --oq-qora:#DAD6CB;
```

`yuqori` qoʻshimcha: `--asosiy:#33408A; --asosiy-qora:#232D63; --asosiy-matn:#33408A;
--asosiy-och:#E8EAF6`.

Kontrast (AA): `--matn-3` fonda 5.5:1, `--chiziq-kuchli` oqda 3.6:1.

Komponentlar (shu selektor ostida):

- `body` — `system-ui` shrifti.
- `.zone-stage .actor`, `.bosh-actors`, bosh sahifadagi pufak — yashirin; `.zone-stage` bitta ustun;
  yotiq holatda koʻrsatma paneli chap ustunning tepasida turadi.
- `.bubble` — dumsiz (`::after` yoʻq), soyasiz, chegarasi 1 px, qalinligi 600.
- `.bubble.from-apprentice` — och koʻk fon va tepasida kichik **"Shogird"** yozuvi (`::before`).
  Oqsoqol gapi yorliqsiz (asosiy ovoz). ✓ / ↻ holatlari ranglari saqlanadi.

`ui.js`: kattalar koʻrinishida `celebrate()` konfeti chizmaydi, katta ✓ qoladi.

`<meta name="theme-color">`: kattalar koʻrinishidagi sahifalarda `#FBFAF7`.

## Bosh sahifa

- **Tanlov yoʻq boʻlsa** — "Nechanchi sinfda oʻqiysan?" ekrani: uchta katta tugma (yorliq, izoh,
  oʻyinlar soni) va kichik "Hammasi" tugmasi.
- **Tanlov bor boʻlsa** — sarlavha ostida doim koʻrinadigan **almashtirgich**: `1–4-sinf · 5–8-sinf ·
  9–11-sinf` uch boʻlakli tugma (`aria-pressed`) va alohida kichik "Hammasi". Bir bosishda oʻtadi,
  sahifa tepasiga qaytadi. Eski "Yosh: 8–11 ▾" tugmasi olib tashlanadi.
- Tanlov `localStorage` da `qabila:toifa:v2` kalitida (`QK.toifa`). Eski `qabila:toifa:v1` oʻqilmaydi
  va oʻchiriladi — yosh oraliqlari sinflarga aniq toʻgʻri kelmaydi, bola bir marta qayta tanlaydi.
  Kalit `qabila:` bilan boshlanadi, shuning uchun akkauntga sinxronlanmaydi (hozirgidek); progress
  oʻyin kaliti boʻyicha saqlanadi va toifa almashganda yoʻqolmaydi.
- Sarlavha toifaga qarab (jadvalga qarang). Kattalar koʻrinishida qahramonlar va pufak yoʻq.
- Kartadagi yosh belgisi (`8–16`) olib tashlanadi. Faqat "Hammasi" da kartada toifa yorligʻi
  (`1–4`, `5–8`, `9–11`) koʻrinadi; asbob va musobaqa kartasida yorliq yoʻq.

## Fayllar

| Fayl | Oʻzgarish |
|---|---|
| `oyinlar/umumiy/js/toifa.js` | **yangi**: `QK.toifa = { KALIT, IDS, oqi(), yoz(id), qolla() }`; yuklanganda `qolla()` |
| `bosh/js/bosh.js` | `TOIFALAR`, `toifa`/`toifalar`, `mos`, sinf ekrani, almashtirgich, sarlavha, yorliq |
| `bosh/style.css` | almashtirgich uslubi; kattalar koʻrinishida bosh sahifa |
| `index.html` | `<head>` ga `toifa.js` |
| `oyinlar/umumiy/css/asos.css` | kattalar tokenlari va komponentlari (fayl oxirida alohida boʻlim) |
| `oyinlar/umumiy/js/ui.js` | `celebrate()` — kattalarda konfeti yoʻq |
| `oyinlar/NN-*/index.html` (64 ta) | `<html>` ga `data-toifa` (+ kerak boʻlsa `data-maskot`), `theme-color` |
| `oyinlar/{masalalar,cpp-shpargalka,tank-duel,tank-onlayn}/index.html` | `<head>` ga `toifa.js` |
| `bosh/tools/toifa-yoz.js` | **yangi**: 64 ta `index.html` ga atributlarni katalogdan yozadi (qayta ishga tushirsa — oʻzgarish yoʻq) |
| `bosh/tests/bosh.test.js` | toifa testlari (pastda) |
| `oyinlar/umumiy/tests/toifa.test.js` | **yangi** |
| `QOIDALAR.md`, `README.md`, `bosh/DIZAYN.md` | toifalar va `data-toifa` qoidasi |
| `sw.js` | `python3 bosh/sw-royxat.py --bump` |

## Testlar

`bosh/tests/bosh.test.js`:

- har oʻyinda `toifa` bor va u uchta id dan biri; har oʻyin **aynan bitta** toifada;
- taqsimot soni: 9 / 43 / 12; AI bloki (`ai`, `ai2`) butunicha `orta` da;
- har toifada raqamlar 1 dan ketma-ket, `SECTIONS` tartibida;
- asbob va musobaqalarda `toifalar` boʻsh emas va faqat mavjud id lar;
- **har oʻyin `index.html` idagi `data-toifa` katalogdagi `toifa` ga teng**;
- **`data-maskot` bor ⇔ oʻyin qogʻoz yoki barabanni ishlatadi** (`bosh/tools/toifa-yoz.js` dagi `maskotKerak`);
- kattalar koʻrinishidagi oʻyin `theme-color` i `#FBFAF7`.

`oyinlar/umumiy/tests/toifa.test.js`: `oqi()` notoʻgʻri qiymatni rad etadi; `yoz()` → `oqi()`;
xotira yopiq boʻlsa xato tashlamaydi; `qolla()` yozib qoʻyilgan `data-toifa` ni oʻzgartirmaydi;
`hammasi` da atribut qoʻyilmaydi.

Mavjud testlar (64 oʻyin, umumiy, bosh, offline) oʻtishi kerak. Oxirida bitta brauzer koʻrigi:
bosh sahifa uch toifada, bittadan oʻyin (kattalar koʻrinishi, `data-maskot`li), masalalar.

## Maʼlum cheklovlar

- `orta` dagi 43 oʻyindan 2 tasi (01, 03) 5–8 bosqichigacha bolalar koʻrinishida qoladi.
- Kattalar oʻyinlarida matn ohangi ("sen", qisqa gaplar), ish zonasidagi rasmlar (qabila mavzusi),
  3D qirra va radius oʻzgarmaydi — 5–8 bosqichi.
- 9–11 oʻquvchisiga Python asoslari kerak boʻlsa, almashtirgich bilan 5–8 ga oʻtadi.

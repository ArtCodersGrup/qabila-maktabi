# 8–11 yosh: dasturlash bloki (62–65) — dizayn

**Sana:** 2026-10-05
**Muallif qarorlari:** 4 ta oʻyin; 4-oʻyinda bola Python matnini oʻqiydi va bosib tuzatadi (klaviaturasiz);
umumiy blok dvigateli (A yoʻli) — "oʻzing bilgan yoʻldan ket".

## Muammo

8–11 toifasida dasturlash — 3 ta oʻyin: «Robot yoʻli» (buyruqlar roʻyxati), «Robot aqlli boʻldi»
(takror, agar), «Xato ovi». Bola shundan keyin toʻgʻridan-toʻgʻri Python bloki (12–16) ga sakraydi.
Oraliqda yetishmaydi: **oʻz buyrugʻi (funksiya)**, **…gacha takrorla (while)**, **oʻzgaruvchi
(hisoblagich)** va **bloklar ↔ matn** koʻprigi.

## Oʻyinlar

| № | Papka | Nomi | Yosh | Mavzu |
|---|---|---|---|---|
| 62 | `62-oz-buyrugim` | Oʻz buyrugʻim | 8–11 | funksiya: ★ buyruq yasash va chaqirish |
| 63 | `63-tosiqqacha` | Toʻsiqqacha | 8–11 | while: "→ boʻsh ekan takrorla", "gulxangacha" |
| 64 | `64-robot-sanaydi` | Robot sanaydi | 8–11 | oʻzgaruvchi: `qadam = 0`, `qadam + 1`, `takror qadam marta` |
| 65 | `65-blokdan-pythonga` | Bloklardan Pythonga | 10–16 | bir dastur — ikki koʻrinish: bloklar va Python matni |

Tartib — 63 dan oldin 62: funksiya yangi blok turi talab qilmaydi (faqat nomlangan roʻyxat), while esa
yangi bajarish modeli. Hisoblagich while'dan keyin: uning eng kuchli misoli "toʻsiqqacha yur va sana".
Bosh sahifada `dastur` boʻlimida, «Xato ovi» dan keyin. 65 ikkala toifada koʻrinadi (12–16 uchun Python
blokiga kirish).

Robot modeli oʻzgarmaydi: absolut oʻqlar ⬅⬆⬇➡ (`umumiy/js/dastur.js`), maydon, tosh, gulxan.
Hammasi bosish bilan, sudrash va klaviatura yoʻq (QOIDALAR §3).

## Umumiy dvigatel: `umumiy/js/blok.js` (sof mantiq, Node'da test)

`QK.blok`. 47-oʻyindagi `bajar` shu yerga kengaytirilib koʻchiriladi; **47-oʻyinga tegilmaydi**
(u oʻz nusxasi bilan ishlayveradi).

### Bloklar

| Blok | JS | Python |
|---|---|---|
| yur | `{t:"yur", yon}` | `ongga()` `chapga()` `yuqoriga()` `pastga()` |
| takror | `{t:"takror", n, ichi}` — `n` son yoki `"qadam"` | `for i in range(4):` / `for i in range(qadam):` |
| agar | `{t:"agar", yon, ichi, aks}` | `if ong_bosh():` … `else:` |
| toki | `{t:"toki", yon, ichi}` — shu yon boʻsh ekan | `while ong_bosh():` |
| gulxangacha | `{t:"gulxangacha", ichi}` | `while not yetdi():` |
| chaqir | `{t:"chaqir", nom}` — `yulduz` (★) yoki `doira` (●) | `yulduz()` |
| qoy | `{t:"qoy", n}` | `qadam = 0` |
| qosh | `{t:"qosh"}` | `qadam = qadam + 1` |

Oʻzgaruvchi bitta — `qadam`. Funksiya tanalari: `fn = { yulduz: [...], doira: [...] }`; Python'da
dastur boshida `def yulduz():` boʻlib chiqadi. Funksiya ichida `chaqir`, `qoy`, `qosh` ishlatilmaydi
(Python'da lokal oʻzgaruvchi muammosi va rekursiya boʻlmasin). Boʻsh tana → `pass`.

### API

- `bajar(f, dastur, {fn})` → `{ path, status, at, qadam, iz, vars }`
  - `status`: `goal` / `wall` / `edge` / `end` / `uzun`.
  - `uzun`: 200 dan ortiq yurish yoki 1000 dan ortiq blok bajarilishi. Ikkinchisi tanasi boʻsh while'ni ham ushlaydi.
  - `iz` — animatsiya uchun voqealar: `{tur:"yur", at}` | `{tur:"var", qiymat}`.
- `soni(dastur, fn)` — bloklar soni: ichkaridagilar va funksiya tanalari ham, har biri bir marta.
- `ixchamNarx(yurishlar)` — shu yurishlar ketma-ketligini **faqat yur + takror** bilan yozishning eng kam
  bloklar soni (satr siqish DP: `c(s) = min(boʻlish, 1 + c(u))`, bunda `s = u^k`, `2 ≤ k ≤ 9`).
  62-oʻyin "funksiyasiz sigʻmaydi" degan shartni shu bilan tekshiradi.
- `pythonQatorlar(dastur, fn)` → `[{ chuqur, qismlar:[{ m, tahrir? }] }]`.
  - `tahrir = { blok, maydon }` — 65-oʻyinda bosib almashtiriladigan qism (son yoki yoʻnalish).
  - `pythonMatn(...)` — shu qatorlarni 4 boʻshliqli otstup bilan qoʻshadi.
- `pyTashqi(f)` — talqinchimiz uchun `ongga`, `ong_bosh`, `yetdi` va boshqa funksiyalar.
  Test **bloklar bilan Python matni bir xil yoʻl yurishini** tasodifiy dasturlarda shu orqali tekshiradi.
- Maydon yasovchilar:
  - `yoldanMaydon(yurishlar, pad)` — 47 dagidek;
  - `torYol(yurishlar)` — yoʻldan boshqa hamma katak tosh. Yoʻl yagona boʻlsa (BFS uzunligi = yoʻl uzunligi), maydon qaytariladi, aks holda `null`.

## Umumiy ekran: `umumiy/js/blok-ui.js` + `umumiy/css/blok.css`

47 quruvchisi umumlashtiriladi, `bk-` prefiksi bilan.

- **Quruvchi:** blok bosilsa faol joyga qoʻshiladi, qoʻyilgan blok bosilsa oʻchadi.
  - Qamrov bloklarida `×` tugmasi bor; son va yoʻnalish ustiga bosib almashtiriladi.
  - Funksiya maydoni "★ = [ … ]" koʻrinishida: u ham faol joy boʻla oladi, tayyor berilganda qulflanadi.
  - Bloklar chegarasi `maxBlok` koʻrsatiladi.
- **Hisoblagich qutisi:** "qadam" yozuvi va son. Yurish paytida `iz` dagi `var` voqealari bilan yangilanadi.
- **Python koʻrinishi:** monospace, tahrirlanadigan qismlar tugma boʻladi va bosilganda keyingi qiymatga oʻtadi.
- **`yurgiz(maydonlar, dastur, fn, quti)`:** robotni hamma maydonda navbat bilan yurgizadi, toʻxtagan joyga ↻ qoʻyadi.

## 62 «Oʻz buyrugʻim» — funksiya

Maydon — **tor yoʻl** (`torYol`): bitta naqsh (motiv) yoʻlda bir necha marta takrorlanadi, oraliqlari
har xil, shuning uchun bitta `takror` bilan yozib boʻlmaydi. Masalan, `★ →→ ★ → ★`, bunda ★ = ↑→→↓.

1. **Tayyor buyruq.** ★ tanasi tayyor va qulflangan. Bola asosiy dasturni ★ va oʻqlar bilan yigʻadi.
   - Koʻrsatuv: 15 ta oʻq bilan yozilgan dastur chegaraga sigʻmaydi → ★ bilan qisqarishi koʻrsatiladi.
2. **Oʻzing yasa.** Bola ★ tanasini ham, asosiy dasturni ham yigʻadi.
3. **Ikki buyruq.** ★ va ●: yoʻlda ikki xil naqsh aralash keladi.
   - tier 2 da asosiy dasturda `takror` ham kerak boʻladi.

**Qulf:**
- `maxBlok` = namunali yechim bloklari.
- **Test:** `ixchamNarx(yoʻl) > maxBlok`, ya'ni funksiyasiz yozib boʻlmaydi; tor yoʻl yagona; namunali yechim oʻtadi.

## 63 «Toʻsiqqacha» — while

Har vazifada **ikki maydon**. Yoʻlak uzunligi har xil, shuning uchun aniq sonli `takror` bir maydonda
xato qiladi. Avval shu koʻrsatiladi (47 dagi "shartsiz dastur yiqiladi" usuli).

1. **Toʻsiqqacha.** `→ boʻsh ekan takrorla [→]`, keyin burilib gulxanga.
   - tier 1–2: ikki yoki uch ketma-ket while (L shakli, zinapoya).
2. **Gulxangacha.** `gulxangacha [ agar → boʻsh: → | aks: ↓ ]`. Zinapoya shakli har maydonda boshqa.
3. **Birga.** `gulxangacha` ichida `toki` (ichma-ich).

**Qulf:**
- **Test:** namunali yechim ikkala maydonda oʻtadi.
- Har qanday `takror n` (n = 2..9, yoʻnalish bitta) faqat bitta maydonda ishlaydi, ya'ni ikki maydonning uzunliklari farq qiladi.
- Tanasi boʻsh `toki` → `uzun`. Xabar: "takror toʻxtamadi — ichida yurish yoʻq".

## 64 «Robot sanaydi» — oʻzgaruvchi

1. **Kuzat.** Tayyor dastur yurgiziladi, `qadam` qutisi koʻrinadi. Bola oxirgi qiymatni topadi (raqam klaviaturasi).
   - Ichida `qoy`, `qosh`, takror ichida `qosh` va oʻtkazib yuborilgan `qosh` bor.
   - Javob ≤ 20.
2. **Oʻlcha va qaytar.** Ikki maydon. Robot toshgacha oʻngga yuradi (uzunligi L — har maydonda boshqa),
   gulxan esa L katak pastda. Yechim: `qadam = 0`, `toki → [→, qadam+1]`, `takror qadam marta [↓]`.
   - Aniq son yozilgan dastur bir maydonda yiqiladi (test).
3. **Sanoq bilan yasash.** Shu gʻoya boshqa shakllarda (tier boʻyicha):
   - L pastga, keyin L chapga;
   - zinapoya `takror qadam [↓, ←]`;
   - ikki barobar `takror qadam [↓, ↓]`.

## 65 «Bloklardan Pythonga» — koʻprik

Yonma-yon: bloklar | Python matni (telefonda ustma-ust). Dasturlar 62–64 va 47 generatorlariga
oʻxshash, shu oʻyinning `logic.js` ida yasaladi.

1. **Oʻqi.** Faqat Python matni va maydon. Bola robot qayerda toʻxtashini katakni bosib belgilaydi (`pickCell`).
2. **Tuzat.** Python matnida bitta xato bor: son yoki yoʻnalish. Bola xato qismini bosib almashtiradi,
   ▶︎ bilan tekshiradi (gulxanga yetsa — toʻgʻri).
   - Bloklar koʻrinishi ham yonida yangilanib turadi.
3. **Tarjima qil.** Python matni berilgan, bola **shu dasturni** bloklardan yigʻadi.
   - Tekshiruv: `pythonMatn(bloklar) === berilgan matn`.
   - Maslahat birinchi farq qilgan qatorni koʻrsatadi.

**Qulf:**
- **Test:** generator dasturlarining Python matni talqinchimizda bloklar bilan bir xil yoʻl yuradi.
- "Tuzat" vazifasida xato dastur yiqiladi, toʻgʻrisi oʻtadi.
- "Oʻqi" javobi yagona katak.

## Umumiy talablar

- QOIDALAR §4: koʻrsatish → nom → mashq.
  - Tasodifiy vazifalar `next(prev, correct, tier)`; ketma-ket takror yoʻq.
  - 1-xatoda maslahat (javobni aytmaydi), 2-xatoda yechim.
  - Matn dietasi: intro ≤ 2 pufak, mashqgacha ≤ 6.
- Har oʻyin uchun:
  - `DIZAYN.md` ("Oʻquv maqsadlari" bilan);
  - `js/logic.js`, sahnalar, `game-art.js` (matnsiz SVG), `tests/logic.test.js`;
  - `index.html`, `main.js`, `css/style.css`.
- Ulash:
  - `bosh/js/bosh.js` GAMES va `bosh-art.js` ikonka;
  - `python3 bosh/sw-royxat.py --bump`;
  - README roʻyxati.
- Maydon oʻlchami ≤ 8×6, katak `min(42px, 7vw)`: 360 px telefonga sigʻadi.

## Tekshiruv

- `node --test`: `umumiy/tests/blok.test.js` va 4 ta oʻyin testlari.
- Brauzerda har oʻyinni avtomatik oʻynab chiqish: `QK.current` dagi namunali yechim bilan, 360 px va kompyuter oʻlchamida.

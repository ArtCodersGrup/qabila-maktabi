# 69-oʻyin — «Fayl va papka»

1–4-sinf «Kompyuter bilan tanishuv» blokining toʻrtinchi oʻyini. Blok dizayni:
[`../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md`](../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md).

- **Yosh:** 2–4-sinf (bola oʻqiy oladi). Telefon va kompyuter — faqat bosish, sudrash yoʻq.
- **Ulanish:** «Ekran va oynalar» — oyna va belgi nima; bu oʻyin — oynaning **ichidagi** narsalar: fayl va papka.
- **Hikoya:** qabilaga kompyuter keldi, shogirdning fayllari sochilib yotibdi — oqsoqol tartibga solishni oʻrgatadi.

## Asosiy fikr

Bola tasavvuri: *«kompyuterda rasmlar shunchaki bor»*. Aslida:

- har rasm, xat, qoʻshiq — alohida **fayl**; turi belgisidan va **nom oxiridan** bilinadi (`.jpg`, `.txt`, `.mp3`, `.mp4`);
- fayllar **papka**larda turadi, papka ichida papka boʻlishi mumkin;
- fayl qayerda turganini **yoʻl** aytadi: `Kompyuter › Hujjatlar › Rasmlar`;
- **kesish + qoʻyish** faylni koʻchiradi (bitta qoladi), **nusxa + qoʻyish** — ikkita qiladi;
- oʻchirilgan fayl yoʻqolmaydi — **savat**da yotadi, uni qaytarsa boʻladi.

Test emas: bola haqiqiy harakatni **oʻzi qiladi** — papkani ochadi, faylni koʻchiradi, papka yaratadi, savatdan
qaytaradi. Nomini oʻyin keyin aytadi (QOIDALAR §4.1).

## «Fayllar» oynasi

Ish zonasida oʻyinchoq kompyuterning bitta oynasi (`umumiy/css/stol.css` + `stol-art.js`):

- **sarlavha** — «Fayllar» belgisi va nomi;
- **asboblar qatori** — ← Orqaga, Yangi papka, Nomla, Nusxa, Kesish, Qoʻyish, Oʻchirish (belgi + yozuv, ≥ 48 px).
  Bosqichga kerak boʻlmagani koʻrinmaydi, hozir ishlamaydigani — uzuq chiziqli (`disabled`). Tor ekranda ikki qatorga oʻtadi;
- **yoʻl satri** — `Kompyuter › Hujjatlar › Rasmlar`;
- **ichidagilar** — belgi + nom, avval papkalar, keyin fayllar. Nom oxiri (`.jpg`) rang bilan ajratilgan va satr sinsa ham butun qoladi;
- **pastki qator** — «Kesildi: …» / «Nusxa olindi: …» yozuvi va (3-bosqichda) **Savat** tugmasi: boʻsh yoki toʻla.
  Savat bosilsa — ichi koʻrinadi, asboblar oʻrnida «Orqaga» va «Qaytarish» qoladi.

**Bitta bosish — tanlash, ikki marta bosish — ochish.** Ikki marta bosish oʻzimizcha aniqlanadi: bitta narsaga 450 ms
ichida ikki `click` (sichqonchada ham, barmoqda ham bir xil). Papka ochilsa — ichiga kiriladi; fayl ochilsa — oyna ichida
qisqa vaqt «ochilgan» koʻrinishi chiqadi.

**Nom berish — tayyor nomlardan tanlash** (chiplar: «Rasmlar», «Matnlar», «Musiqa», «Videolar», «Oʻyinlar», «Har xil»),
harf terilmaydi. Shu papkada band nom chiplarda chiqmaydi. Bu oʻyinda faqat papka nomlanadi.

## Bosqichlar

### 1. Fayl, papka va yoʻl
Koʻrsatish: bola «Rasmlar»ni ikki marta bosib ochadi → *papka*; «olma.jpg»ni ochadi → *fayl*, nom oxiri `.jpg`;
yoʻl satriga qaraydi → *yoʻl*; «Orqaga» bilan chiqadi.

Mashq turlari:
- **Top va och** (`top`) — «olma.jpg» rasmini top va och. Papkalarda yurish erkin, boshqa **fayl** ochilsa — urinish.
  - tier 0: fayl 1 papka ichkarida (3 ta tur papkasi) — papka nomi fayl turini aytadi;
  - tier 1: 2 papka ichkarida, yoʻl savolda beriladi (bir xil nomli «Rasmlar» ikki joyda boʻlishi mumkin);
  - tier 2: 3 papka ichkarida, yoʻl beriladi.
- **Bu nima?** (`tur`) — «qoʻshiq.mp3» → Rasm / Matn / Musiqa / Video.
  tier 0: belgisi ham koʻrinadi; tier 1: faqat nom (boʻsh varaq); tier 2: chalgʻituvchi nom («qoʻshiq.txt» — matn).
- **Yoʻlini tanla** (`yol`, faqat tier 2) — fayl turgan papkaning yoʻli, 4 variant — daraxtdagi toʻrtta haqiqiy papka.
  Bola oynada faylni oʻzi topadi va yoʻl satrini oʻqiydi.

### 2. Tartibga solamiz
Koʻrsatish: bola «olma.jpg»ni tanlaydi → Kesish → «Rasmlar»ni ochadi → Qoʻyish. Nom: *kesish va qoʻyish — koʻchirish*.
Keyin xat uchun papka yoʻq — «Yangi papka» va nom chipi. Nom: *papkaga ichidagiga mos nom beriladi*.

Mashq — **tartibla**: sochilgan 3 ta faylni turiga mos papkaga koʻchir, keyin «Tekshir».
- tier 0: 2 tur, papkalar tayyor (asboblar: Orqaga, Kesish, Qoʻyish);
- tier 1: 2 tur, bitta papka yoʻq — bola yaratadi va nom tanlaydi (+ Yangi papka, Nomla);
- tier 2: 3 tur, bitta papka (ichida 2 fayli bilan) boshqa turning nomi bilan turibdi — nomi oʻzgartiriladi
  (yoki yangi papka ochib, fayllari koʻchiriladi — ikkalasi ham toʻgʻri).

Toʻgʻri: har fayl nomi oʻz turiga mos papkada va hech narsa yoʻqolmagan.

### 3. Nusxa, oʻchirish va savat
Koʻrsatish: bola «xat.txt»dan nusxa olib «Zaxira»ga qoʻyadi → *nusxa — ikkita boʻladi*; «gul.jpg»ni oʻchiradi →
*savatga tushdi*; savatni ochib qaytaradi → *oʻz joyiga qaytdi*.

Mashq turlari (hammasi «Tekshir» bilan, oxirgi holat tekshiriladi):
- **nusxa** — «xat.txt»dan nusxa ol va «Zaxira»ga qoʻy, asli joyida qolsin. tier 0: fayl koʻrinib turibdi;
  tier 1: papka ichida; tier 2: ikki papka ichkarida. Toʻgʻri: fayl (yoki nusxasi) asl papkasida **va** «Zaxira»da.
- **ochir** — aytilgan 1 / 2 / 3 ta faylni oʻchir. Toʻgʻri: savatda aynan shular, boshqa hech narsa.
- **tikla** — adashib oʻchirilgan faylni savatdan qaytar. tier 1–2 da savatda ortiqcha fayl ham bor — «faqat shuni».
  Toʻgʻri: aytilgan fayllar asl papkasida, qolgani savatda.

Kompyuterda **tezkor tugmalar** ham ishlaydi: `Ctrl+C`, `Ctrl+X`, `Ctrl+V`, `Delete` (Mac'da `Cmd` ham) —
faqat klaviaturali qurilmada, asbob tugmasida kichik yozuv bilan koʻrsatiladi.

## Xato javob

- `top`, `tur`, `yol` — 1-xato: maslahat (nom oxiriga qara; yoʻlni chapdan oʻngga oʻqi; tur belgilari jadvali —
  soʻzsiz). 2-xato: fayl turgan papka ochilib, fayl ✓ bilan belgilanadi / toʻgʻri javob yoziladi.
- `tartibla`, `nusxa`, `ochir`, `tikla` — 1-xato: **holat saqlanadi**, bola davom ettiradi; maslahat nechta narsa
  joyida emasligini aytadi («2 ta fayl hali oʻz joyida emas»), qaysiligini emas. 2-xato: toʻgʻri yakuniy holat —
  papkalar (yoki savat) va ichidagi fayllar roʻyxati; oynaning oʻzi ham shu holatga oʻtadi.
- «Xato» soʻzi va qizil rang yoʻq; ✓ va ↻.

## Qarorlar

- **Mantiq oʻzgarmas uslubda**: har amal yangi holat qaytaradi; bajarilmagan amal — oʻsha holatning oʻzini
  (`y === h`). Ekran shundan «hech narsa oʻzgarmadi»ni biladi.
- **Nusxa asl faylga bogʻlangan** (`asl`): bola avval kesib koʻchirib, keyin nusxasini joyiga qaytarsa ham — ikkita
  boʻlgani hisobga olinadi. Tekshiruv yoʻlni emas, **oxirgi holatni** koʻradi.
- **Bitta daraxtda fayl nomi takrorlanmaydi** — «olma.jpg»ni top degan savol ikki xil tushunilmaydi. Nusxa oʻsha
  papkaga qoʻyilsa — «olma (2).jpg» (oxiri joyida qoladi).
- **Papkani oʻzining ichiga qoʻyib boʻlmaydi** — «Qoʻyish» oʻchiq turadi.
- **Savatdan qaytarilgan narsa oʻchirilgan papkasiga qaytadi**; u papka ham oʻchirilgan boʻlsa — «Kompyuter»ga.
- **Har vazifada namunali yechim** (`javob` — amallar roʻyxati): test uni bajarib, maqsad tekshiruvidan oʻtkazadi;
  avtomat oʻynovchi ham shundan foydalanadi (`QK.current.javob`, `QK.common.oyna()`).
- Oyna tugmalari (`— □ ✕`) bu oʻyinda yoʻq — ular «Ekran va oynalar» mavzusi; ishlamaydigan tugma chalgʻitadi.
- Kichik telefonda (tik, boʻyi ≤ 740 px) mashq paytida qahramonlar yashirinadi — oynaga joy kerak; pufak qoladi.

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Fayl turini belgisi va nom oxiridan taniydi (rasm, matn, musiqa, video).
2. Papkani ochadi, «Orqaga» bilan chiqadi va faylni yoʻli boʻyicha topadi.
3. Yoʻl satrini oʻqiydi: fayl qaysi papkalar ichida turganini aytadi.
4. Faylni kesib, boshqa papkaga qoʻyadi (koʻchiradi).
5. Papka yaratadi va unga ichidagiga mos nom beradi; nomi mos boʻlmasa — oʻzgartiradi.
6. Koʻchirish va nusxa farqini biladi: koʻchirilsa — bitta, nusxa olinsa — ikkita.
7. Faylni oʻchiradi va adashib oʻchirilganini savatdan qaytaradi.

## Fayllar

- `js/logic.js` — daraxt va holat, amallar (`kir`, `orqaga`, `tanla`, `yangiPapka`, `nomla`, `nusxa`, `kes`, `qoy`,
  `ochir`, `tikla`), soʻrovlar (`yol`, `qayerda`), maqsad tekshiruvlari, yetti savol generatori (`tier` bilan).
- `tests/logic.test.js` — amallar va chekka holatlar, oʻzgarmas uslub, maqsad tekshiruvlari, generatorlar.
- `js/scenes/common.js` — «Fayllar» oynasi (`fayllar`), koʻrsatish qadami (`yolla`), mashq ekranlari.
- `js/scenes/stage1–3.js`, `final.js` — koʻrsatish, mashq, tabrik.
- `js/game-art.js` — hikoya rasmlari, ochilgan fayl koʻrinishi, asbob belgilari (matnsiz SVG).

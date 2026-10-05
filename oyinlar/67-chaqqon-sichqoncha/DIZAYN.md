# 67-oʻyin — «Chaqqon sichqoncha»

«Kompyuter bilan tanishuv» blokining ikkinchi oʻyini (1–4-sinf toifasi). Blok dizayni:
[`../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md`](../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md).

- **Kim uchun:** 2–4-sinf (bola oʻqiy oladi). **Kompyuter uchun** (💻, `pc: true`) — sichqoncha kerak.
- **Hikoya:** qabilaga kompyuter keldi. Shogird sichqonchani birinchi marta ushlayapti, oqsoqol oʻrgatadi.
- **QOIDALAR §3 dan istisno:** bu oʻyin sudrashni oʻrgatadi, shuning uchun 3-bosqichda sudrab olib borish bor.

## Asosiy fikr

Bola sichqoncha haqida oʻqimaydi — toʻrt harakatni **oʻzi qiladi**, nomini oʻyin keyin aytadi (QOIDALAR §4.1):

| Harakat | Nima qiladi | Bosqich |
|---|---|---|
| chap tugma bilan bosish | tanlaydi, bosadi | 1 |
| ikki marta tez bosish | ochadi | 2 |
| oʻng tugma | menyu chiqaradi | 2 |
| bosib turib surish | narsani koʻchiradi | 3 |

## Boshida: qurilma tekshiruvi

Barmoqli qurilmada (`ui.touchOnly()`) oqsoqol: «Bu oʻyin sichqoncha uchun. Uni kompyuterda och.» —
«Sichqoncham bor» / «Barcha oʻyinlar». Sahifa ochilgandan beri bir marta soʻraladi (kirishda ham,
`?bosqich=2` bilan toʻgʻridan-toʻgʻri kirilganda ham). Sahifa 360 px ekranda ham buzilmaydi.

## Maydon

`.maydon` — nisbiy oʻlchamli quti: eni 100 % (koʻpi 640 px), nisbati 4:3. Past ekranli noutbukda boʻyi
sigʻishi uchun eni ekran balandligidan ham cheklanadi. Hamma narsa **foizli koordinatada**:
`x` — maydon enidan, `y` — boʻyidan, `r` (radius) — enidan. Mantiq narsalarni **ustma-ust tushmaydigan**
(orasida kamida enning 2 % i) va **chetdan chiqmaydigan** qilib joylaydi: 40 marta tasodifiy urinish,
oʻxshamasa — panjara; shunda ham sigʻmasa — xato (cheksiz sikl yoʻq).

Maydon ichida brauzerning oʻz menyusi chiqmaydi (`contextmenu` toʻxtatiladi).

## Bosqichlar

Har bosqich: **koʻrsatish** (bola oʻzi qiladi; maydon burchagida kerakli tugmasi belgilangan sichqoncha
rasmi) → **nom** → **mashq** (`practice.need()` ta toʻgʻri javob).

### 1. Bosish
Koʻrsatish: bitta olma — bola oʻqchani olib borib bosadi, olma yoʻqoladi.
Nom: ekrandagi oʻqcha — **koʻrsatkich**; bosgan tugmang — **chap tugma**.

Mashq — `ter`: «Hamma olmalarni bos.» Maydonda nishonlar va chalgʻituvchilar (olma, nok, tosh; nishon
turi har vazifada boshqa).
- Nishon bosilsa — yoʻqoladi; hammasi terilsa — toʻgʻri.
- Chalgʻituvchi bosilsa — xato javob. **Boʻsh joyga bosish — jarimasiz.**

| tier | nishon | chalgʻituvchi | `r` |
|---|---|---|---|
| 0 | 3 | 2 | 0.09 |
| 1 | 4 | 4 | 0.07 |
| 2 | 5 | 5 | 0.055 |

### 2. Ikki marta va oʻng tugma
Koʻrsatish: ikki sandiq. Bola koʻk sandiqni ikki marta tez bosib ochadi, keyin yashil sandiqda oʻng
tugma bilan menyu chiqarib, «Boʻya»ni tanlaydi. Bu yerda jarima yoʻq — faqat eslatmalar.
Nom: **ikki marta bosish — ochadi**, **oʻng tugma — menyu chiqaradi**; bitta bosish — faqat tanlaydi.

Mashq:
- `ikki` (tier 0): «Koʻk sandiqni och — ikki marta tez bos.»
- `ong` (tier 1): «Yashil sandiqda oʻng tugmani bos va «Boʻya»ni tanla.»
- tier 2: ikkala tur aralash (birinchisi tasodifiy, keyin navbat bilan), 4 sandiq, menyuda 4 ish.

| tier | sandiq | menyudagi ishlar | `r` |
|---|---|---|---|
| 0, 1 | 3 | 3 | 0.11 |
| 2 | 4 | 4 | 0.095 |

Qoidalar:
- **Ikki marta bosish oʻzimizcha aniqlanadi:** bitta sandiqqa 450 ms ichida ikki `click` (brauzerning
  `dblclick` iga tayanilmaydi). Bitta bosish — sandiq tanlanadi (halqa), jarima yoʻq.
  Ikkinchi bosish kechiksa (1,5 soniyagacha) — jarimasiz eslatma: «Tezroq bos: tiq-tiq!»
  (oʻng tugma vazifasida — «Bu chap tugma. Oʻng tugmani bos.»).
- **Oʻng tugma** sandiq yonida, maydon ichida oʻz menyumizni ochadi (HTML tugmalar, 48 px). Boshqa joy
  bosilsa yoki Esc — menyu yopiladi. Menyudagi ishlar: «Boʻya», «Qulfla», «Tozala», «Bezat» — tartibi
  oʻzgarmaydi; «ochish» menyuda yoʻq.
- Javob — `{ sandiq, ish }`. Boshqa sandiq, boshqa ish yoki boshqa usul (ochish oʻrniga menyu yoki
  aksincha) — xato javob. Menyuni ochish va yopishning oʻzi — jarimasiz.
- **Rang koʻrishi zaif bola uchun:** har rangning oʻz belgisi bor (koʻk — doira, toʻq sariq — uchburchak,
  yashil — kvadrat, binafsha — yulduz). Vazifa matnida rang nomi aytiladi, yonida shu belgi chiziladi.

### 3. Sudrab olib borish
Koʻrsatish: bitta olma va bitta savat — bola olmani savatga sudraydi.
Nom: **bos — qoʻyib yubormay sur — qoʻyib yubor** (sudrab olib borish).

Mashq — `sudra`: «Har mevani oʻz savatiga olib bor.» Savatlar pastda, har birining yorligʻida mevasi
chizilgan (olma, nok, uzum, apelsin). Pointer Events: `pointerdown` → `setPointerCapture` →
`pointermove` → `pointerup` / `pointercancel`.
- Toʻgʻri savat ustida qoʻyib yuborilsa — meva savatga joylashadi; hammasi joylansa — toʻgʻri.
- Notoʻgʻri savat — xato javob, meva joyiga qaytadi.
- **Savatdan tashqarida qoʻyib yuborish — jarimasiz** (meva qaytadi).
- Sudrash paytida meva qaysi savat ustida tursa, oʻsha savat belgilanadi (toʻgʻri-notoʻgʻriligini aytmaydi).

| tier | narsa | savat | `r` |
|---|---|---|---|
| 0 | 3 | 2 | 0.075 |
| 1 | 4 | 3 | 0.07 |
| 2 | 6 | 3 | 0.06 |

Har savatga kamida 1, koʻpi bilan 3 ta meva tushadi; har mevaning savati bor (chalgʻituvchi yoʻq).

## Xato javob (QOIDALAR §4.4)

«Xato» soʻzi va qizil rang yoʻq; notoʻgʻri bosilgan narsa silkinadi, toʻq sariq halqa va ↻ belgisi chiqadi.

- **1-xato — maslahat** (javobni aytmaydi), maydon oʻz holida qoladi, bola davom etadi:
  - terish: «Olma mana bunday:» + olma rasmi (qaysi birini bosishni aytmaydi);
  - sandiq: boshqa usul ishlatilsa — kerakli tugmasi belgilangan sichqoncha rasmi; boshqa sandiq —
    «Rangiga va belgisiga qara»; boshqa ish — «Vazifani yana oʻqi»;
  - sudrash: «Savatdagi rasmga qara».
- **2-xato — yechim:** nishonlar yashil halqa va ✓ bilan yoritiladi (sandiq kerakli holatga keladi va
  ostida qisqa yozuv chiqadi; mevalar oʻz savatiga oʻzi boradi). Keyin yangi vazifa.

## Sinov ilgagi

`QK.current` — joriy vazifa, unda **`javob`**: terishda — nishon `id` lari roʻyxati; sandiqda —
`{ id, amal }` (`amal`: `"och"` yoki menyudagi ish); sudrashda — `{ narsa id: savat id }`.
Ekrandagi elementlarda `data-id` (narsa, sandiq, savat) va `data-amal` (menyu tugmasi) bor.

## Qarorlar

- **Rasmlar QOIDALAR ranglarida:** olma — yashil, nok — sariq, uzum — binafsha, apelsin (tilimi) —
  toʻq sariq, tosh — kulrang. Mevalar rangidan tashqari shakli bilan ham farq qiladi.
- **Tier 0 da ham 3 ta sandiq** (2 ta emas): ikki sandiqda ikki urinish bilan yutqazib boʻlmasdi
  (QOIDALAR §4.3). Ikki sandiq faqat «koʻrsatish»da.
- **Notoʻgʻri harakatdan keyin maydon 450 ms kutadi** — `practice.tries` shu paytda band; aks holda
  toʻgʻri harakat ekranda bajarilib, hisobga kirmay qolardi.
- Mevaning **markazi** savat ustida boʻlsa — «savat ustida» (savat atrofida enning 1,5 % i hoshiya bilan).
  Ikki savatga ham tushsa — markazi yaqinrogʻi.

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Koʻrsatkichni nishonga olib boradi va chap tugma bilan bosadi.
2. Bitta bosish (tanlash) va ikki marta bosish (ochish) farqini biladi va ikki marta tez bosa oladi.
3. Oʻng tugma menyu chiqarishini biladi va menyudan kerakli ishni tanlaydi.
4. Narsani sudrab koʻchiradi: bosadi, qoʻyib yubormay suradi, kerakli joyda qoʻyib yuboradi.
5. «Koʻrsatkich», «chap tugma», «oʻng tugma» soʻzlarini toʻgʻri ishlatadi.

## Fayllar

- `js/logic.js` — joylash (`joyla`), vazifa generatorlari (`terTask`, `ikkiTask`, `ongTask`, `sudraTask`),
  `ikkiBosish`, `togriAmal`, `xatoTuri`, `menyuJoyi`, `savatUstida`, `savatdagiJoy`, `maydonIchida`.
- `tests/logic.test.js` — joylash (ustma-ust tushmaydi, chetdan chiqmaydi, tier sonlari), ketma-ket bir
  xil vazifa chiqmasligi, sandiq va sudrash vazifalari, «nuqta qaysi savat ustida».
- `js/scenes/common.js` — maydon, uch xil maydon boshqaruvi (terish, sandiq, sudrash), qurilma tekshiruvi,
  mashq ekranlari; `stage1–3.js`, `final.js`.
- `js/game-art.js` — sichqoncha (`"chap"` / `"ong"` / `""`), koʻrsatkich, meva va tosh, sandiq
  (yopiq, ochiq, boʻyalgan, qulflangan, tozalangan, bezatilgan), savat (matnsiz SVG).

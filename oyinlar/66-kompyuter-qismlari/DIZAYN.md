# 66-oʻyin — «Kompyuter qismlari»

«Kompyuter bilan tanishuv» blokining birinchi oʻyini. Blok dizayni:
[`docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md`](../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md).

- **Toifa:** 1–4-sinf (amalda 2–4-sinf: bola oʻqiy oladi). Telefon va kompyuter — faqat bosish.
- **Hikoya:** qabilaga kompyuter keldi. Shogird uni birinchi marta koʻryapti, oqsoqol oʻrgatadi.
- **Keyingi oʻyinlar shunga tayanadi:** sichqoncha, ekran va oynalar, fayl va papka — hammasi shu
  qismlarning nomini biladigan bolaga yozilgan.

## Asosiy fikr

Bola tasavvuri: *«kompyuter — bu ekran»*. Aslida:

- kompyuter **bir necha qismdan** yigʻilgan, har qismning oʻz nomi va oʻz ishi bor;
- baʼzi qismlar **sendan kompyuterga** olib kiradi (kiritish), baʼzilari **kompyuterdan senga** olib
  chiqadi (chiqarish), tizim bloki esa oʻrtada — oʻylaydi;
- kompyuter **tartib bilan** oʻchiriladi: saqlanmagan ish yoʻqoladi;
- kompyuterga suv, ushoq, zarba va simdan tortish yoqmaydi.

Bu mavzu osongina «Monitor nima? → 4 variant» testiga aylanadi. Shuning uchun har bosqichda bola avval
**oʻzi qiladi** (bosadi, saralaydi, oʻchiradi), nom keyin beriladi (QOIDALAR §4.1).

## Qismlar (9)

| id | Nomi | Vazifasi (ekranda) | Yoʻnalish |
|---|---|---|---|
| `monitor` | Monitor | rasm va yozuvni ekranda koʻrsatadi | chiqarish |
| `klaviatura` | Klaviatura | harf va sonlarni kompyuterga kiritadi | kiritish |
| `sichqoncha` | Sichqoncha | ekrandagi koʻrsatkichni yurgizadi | kiritish |
| `blok` | Tizim bloki | oʻylaydi va hamma qismni boshqaradi | markaz |
| `kolonka` | Kolonka | ovozni hammaga eshittiradi | chiqarish |
| `printer` | Printer | rasm va yozuvni qogʻozga chiqaradi | chiqarish |
| `mikrofon` | Mikrofon | ovozni yozib oladi | kiritish |
| `kamera` | Kamera | seni suratga va videoga oladi | kiritish |
| `quloqchin` | Quloqchin | ovozni faqat senga eshittiradi | chiqarish |

Har qism — alohida SVG (`gameArt.qism(id)`), matnsiz; shakli ham, rangi ham boshqa (rang koʻrmaydigan
bola shakldan taniydi). Kolonka va quloqchinning vazifasi bir xil (ovoz chiqaradi) — ular bitta
`guruh`da va vazifa soʻralgan savolda **birga chiqmaydi**.

## Bosqichlar

### 1. Qismlar va nomlari

**Kirish (2 pufak):** stol ustidagi kompyuter rasmi.
**Koʻrsatish:** oʻsha rasm, lekin har qism — alohida tugma (eng tor ekranda ham ≥ 48×48 px). Bola
qismni bosadi — oqsoqol pufakda nomini va ishini aytadi («Bu — monitor. U rasm va yozuvni ekranda
koʻrsatadi.»), qism ✓ bilan belgilanadi; hali bosilmaganida toʻq sariq nuqta turadi. Hisoblagich:
`3 / 9`. Toʻqqiztasi bosilgach «Davom» chiqadi.

Mashq (4 ta toʻgʻri javob — `nom`, `nom`, `rasm`, `vazifa`):

- **`nom`** (tier 0) — «Qaysi biri — klaviatura?» → 4 ta rasm-tugma (nomsiz);
- **`rasm`** (tier 1) — katta rasm → 4 ta nomdan tanlash;
- **`vazifa`** (tier 1 ning ikkinchi misoli va tier 2) — «Qaysi qurilma ovozni yozib oladi?» → 4 ta rasm
  (nomsiz). Vazifasi bir xil ikki qurilma variantlarda birga boʻlmaydi.

### 2. Kiritish va chiqarish

**Koʻrsatish:** chapda «kiradi →» qutisi, oʻrtada tizim bloki, oʻngda «→ chiqadi» qutisi; pastda 8 ta
qurilma. Bola qurilmani bosadi — u oʻz tomoniga oʻtadi va oqsoqol aytadi: «Mikrofon ovozingni
kompyuterga kiritadi.» Sakkiztasi joylashgach nom beriladi: chapdagilar — **kiritish** qurilmalari (sendan
kompyuterga), oʻngdagilar — **chiqarish** qurilmalari (kompyuterdan senga). Quti yozuvlari ham
«Kiritish» / «Chiqarish» ga almashadi.

Mashq (5 ta — `kerak`, `kerak`, `tanla`, `tanla`, `ortiqcha`):

- **`kerak`** (tier 0) — vaziyat → qurilma («Doʻstingga ovozli xabar yozmoqchisan. Nima kerak?»),
  4 ta rasm (nomi bilan). 16 ta vaziyat, har qurilmaga 2 tadan;
- **`tanla`** (tier 1) — «Kiritish qurilmalarining hammasini belgila»: 6 ta qurilma, 2–4 tasi toʻgʻri,
  «Tayyor»; toʻplam **aynan teng** boʻlsa — toʻgʻri. Ikki misolda yoʻnalishlar almashadi;
- **`ortiqcha`** (tier 2) — 4 qurilmadan bittasi boshqa yoʻnalishda — oʻshani top (tizim bloki qatnashmaydi).

### 3. Yoqish va ehtiyot qilish

**Koʻrsatish:** oʻyinchoq ekranda shogird chizgan rasm («saqlanmagan»). Bola kompyuterni oʻzi
oʻchiradi: «Rasmni saqlash» yoki «Oʻchirish». Saqlamasdan oʻchirsa — ekran qorayadi, rasm yoʻqoladi
(«Voy! Rasmim saqlanmagan edi…»), keyin hammasi qaytadi va bola qaytadan tanlaydi — jarimasiz.
Toʻgʻri yoʻl: saqlash → dasturni yopish → «Pusk» → «Oʻchirish» → ekran oʻchishini kutish.
Nom: **saqla, yop, oʻchir, kut**. Oxirida bitta gap ehtiyot haqida.

Mashq (6 ta — `tartib` va `zarar` navbat bilan):

- **`tartib`** — aralash qadam kartalarini toʻgʻri tartibda bos: tier 0 — 3 qadam, 1 — 4, 2 — 5.
  Ikki ketma-ketlik navbat bilan: oʻchirish (saqla → yop → «Pusk» → «Oʻchirish» → kut → stulni sur) va
  yoqish (qoʻl quruqligi → tugma → ekran yonishini kut → dasturni och → rasm chiz → saqla). Bosilgan
  karta navbatga qoʻshiladi (raqami koʻrinadi), qayta bosilsa — chiqadi; «Tozalash» navbatni
  boʻshatadi; hammasi tanlangach «Tayyor» yonadi;
- **`zarar`** — «Qaysi biri kompyuterga zarar qiladi?»: 4 variant, bittasi zararli (tier 0 — dizayndagi
  toʻrttasi: hoʻl qoʻl, simdan tortib oʻchirish, klaviatura ustida ovqat, ekranni qalam bilan bosish;
  tier 1 — choy, qattiq urish, sichqonchani simidan aylantirish). Tier 2 — «hammasini belgila»:
  5 variantdan 2–3 tasi zararli, «Tayyor».

**Qiyin rejim** (tier doim 2): 1-bosqich — `vazifa` va `rasm` navbat bilan; 2-bosqich — `ortiqcha`,
`tanla`, `ortiqcha`, `kerak`; 3-bosqich — 5 qadamli `tartib` va koʻp tanlovli `zarar`.

## Xato javob

| Tur | Maslahat (1-xato) — javobni aytmaydi | Yechim (2-xato) |
|---|---|---|
| `nom`, `vazifa`, `kerak` | bola tanlagan qurilmaning oʻzi: «Bu — printer. U … chiqaradi.»; tugma ↻ bilan belgilanadi | toʻgʻri rasm + nomi + vazifasi |
| `rasm` | tanlangan nomning vazifasi: «Kamera … oladi. Rasmdagi qurilma-chi?» | nomi + vazifasi |
| `tanla` | «Kiritish — sendan kompyuterga. Bu yerda ular 3 ta.» | toʻgʻrilari ✓ bilan belgilanadi + roʻyxat |
| `ortiqcha` | «Har biriga qara: sendan kompyutergami yoki kompyuterdan sengami?» | rasm + «… — chiqarish qurilmasi. Qolgan uchtasi — kiritish…» |
| `tartib` | nechta qadam oʻz oʻrnida + oʻylash uchun savol | kartalar toʻgʻri tartibda qayta teriladi + sabab |
| `zarar` | «Bu — yaxshi odat. Kompyuterga suv, ushoq, zarba va simdan tortish yoqmaydi.» | zararli ish + sababi |

«Xato» soʻzi va qizil rang yoʻq; holatlar ✓ / ↻ belgisi bilan.

## Qarorlar

- **Tugmada nom qachon yoziladi:** nom yoki vazifa soʻralganda (1-bosqich) — yozilmaydi; yoʻnalish
  soʻralganda (2-bosqich) — yoziladi, bola nomni emas, yoʻnalishni oʻylasin.
- **«Kiritish» va «chiqarish» bolaning tilida:** *sendan kompyuterga* va *kompyuterdan senga*.
  «Maʼlumot» soʻzi ishlatilmaydi.
- **Tizim bloki** — kiritish ham, chiqarish ham emas: `tanla`da chalgʻituvchi boʻla oladi, `ortiqcha`da
  qatnashmaydi (aks holda ikkita «boshqacha» chiqadi).
- **Vaziyatlarda `emas` roʻyxati:** ikkinchi toʻgʻri javobdek koʻrinishi mumkin boʻlgan qurilma variantga
  qoʻshilmaydi (masalan, «ovozli xabar yozmoqchisan»da klaviatura).
- **Tartib toʻplamlari qoʻlda tanlangan:** 6 qadamdan tasodifiy kesim maʼnosiz chiqishi mumkin
  («Rasmni saqla» bor, «Rasm chiz» yoʻq). Oʻchirishda birinchi qadam doim «Ishingni saqla».
- **Windows odatlari:** «Pusk», «Oʻchirish» (blok farazi: maktab kompyuterlari Windows).
- **Ketma-ket ikki savol bitta qurilma haqida boʻlmaydi** (savol turi boshqa boʻlsa ham).

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Kompyuterning 9 qismini rasmidan taniydi va nomini aytadi.
2. Har qismning vazifasini bir gap bilan aytadi.
3. Kiritish va chiqarish qurilmasini ajratadi; tizim bloki ikkalasi ham emasligini biladi.
4. Vaziyatga qarab kerakli qurilmani tanlaydi.
5. Kompyuterni toʻgʻri oʻchirish tartibini aytadi: saqla → yop → «Oʻchirish» → ekran oʻchishini kut.
6. Kamida 3 ta ehtiyot qoidasini biladi (hoʻl qoʻl, ovqat, simdan tortish, ekranni qattiq narsa bilan bosish).
7. Har 20 daqiqada koʻzga dam berish kerakligini biladi.

## Sinov ilgagi

- `QK.current` — joriy vazifa; `QK.current.javob` — toʻgʻri javob: bitta `id` (`nom`, `rasm`, `vazifa`,
  `kerak`, `ortiqcha`, bitta javobli `zarar`), `id`lar massivi (`tanla`, koʻp tanlovli `zarar`) yoki
  tartib massivi (`tartib`).
- Har javob tugmasida `data-id`; «Tayyor» tugmasida `data-tayyor`. Bitta javobli savolda tugmalar
  boshqaruv zonasida, koʻp tanlovli va tartiblashda — ish zonasida.
- Mantiq: `L.tekshir(vazifa, qiymat)`, `L.ishora(vazifa, qiymat)` — sof funksiyalar.

## Fayllar

- `js/logic.js` — qismlar, vaziyatlar, tartiblar, zarar roʻyxatlari; sakkiz generator; `tekshir`,
  `ishora`; uch bosqich navbati.
- `tests/logic.test.js` — generatorlar (tier chegaralari, ≥ 4 variant, javob variantlar ichida, takror
  yoʻq), bir xil vazifali qurilmalar qoidasi, toʻplam va tartib tekshiruvi, maslahat javobni aytmasligi,
  matn belgilari, rasmlar va stoldagi tugma oʻlchamlari.
- `js/game-art.js` — 9 qism, stol foni va joylar (`JOY`), shogird rasmi, tabrik rasmi.
- `js/scenes/` — `common.js` (rasm-tugma, stol, mashq ekranlari), `stage1–3.js`, `final.js`.

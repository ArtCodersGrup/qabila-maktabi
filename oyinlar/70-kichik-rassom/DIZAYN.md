# 70-oʻyin — «Kichik rassom»

«Kompyuter bilan tanishuv» blokining beshinchi oʻyini (1–4-sinf toifasi). Blok dizayni:
[`../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md`](../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md).

- **Kim uchun:** 2–4-sinf (bola oʻqiy oladi). Telefon va kompyuter — chizish barmoq yoki sichqoncha bilan.
- **Hikoya:** qabilaga kompyuter keldi. Shogird uy chizmoqchi, oqsoqol Paint asboblarini oʻrgatadi.
- **QOIDALAR §3 dan istisno:** chizish — sudrash bilan (`touch-action: none`), sichqoncha oʻyinidagi kabi.

## Asosiy fikr

Erkin chizilgan rasmni kompyuter baholay olmaydi — **katakli** (32 × 24) taxtada esa har shakl aniq
tekshiriladi. Shuning uchun oʻyin ikki qismdan iborat:

| Qism | Nima | Baho |
|---|---|---|
| Darslar (3 bosqich) | asboblar, «uy» namunasi qadam-qadam, oʻzi tanlagan namuna | yulduzlar |
| Erkin chizish va galereya | toʻliq asboblar, saqlash, PNG yuklab olish, namunalarni qayta chizish | yoʻq |

Bola avval **qiladi**, keyin nom eshitadi (QOIDALAR §4.1): qalam bilan surdi → «bu — qalam».

## Taxta

- 32 × 24 katak, ikki `<canvas>`: rasm qatlami (kataklar + nozik katak chiziqlari) va ustki qatlam
  (soya va shakl preview). Eni 100 % (koʻpi 640 px), nisbat 4:3; kompyuterda eni ekran balandligidan ham
  cheklanadi. Katak koordinatasi koʻrsatkich joyidan hisoblanadi, chetdan chiqsa — chekka katak.
- **Asboblar (7):** qalam, oʻchirgʻich, chiziq (Brezenxem), toʻrtburchak, doira (ellips — Zingl algoritmi,
  juft oʻlchamlarda ham simmetrik), uchburchak (uchi tepada oʻrtada, asosi pastda, oʻng qirra chapning
  koʻzgusi), chelak (4-qoʻshni toʻldirish). **«Ichi toʻla»** — shakllar uchun yoqish/oʻchirish.
- Shakl — bosib sudrab, qoʻyib yuborilganda chiziladi; sudrash paytida och preview. Qalam/oʻchirgʻich —
  sudrash davomida har katak (tez surilganda kataklar orasiga chiziq tortiladi). Chelak — bitta bosish.
  Sudrash boshlanganda asbob va rang qotiriladi.
- **Palitra (12):** qora, kulrang, qizil, toʻq sariq, sariq, yashil, och yashil, koʻk, och koʻk, binafsha,
  jigarrang, pushti. Oq — oʻchirgʻich (boʻsh katak).
- **Amallar:** bekor, qaytar (tarix 50 qadam), tozalash, saqlash (faqat erkin chizishda). Kompyuterda
  tezkor tugmalar: `Ctrl+Z`, `Ctrl+Y` / `Ctrl+Shift+Z`, `Ctrl+S` (Mac'da `⌘`), `e.code` bilan; `Ctrl+N` yoʻq — brauzer uni sahifaga bermaydi;
  yozuvi tugmalarda faqat klaviaturali qurilmada.
- Tanlangan asbob va rang faqat rang bilan emas — qalin ramka va ✓ belgisi bilan ajralib turadi; holat
  satri: «toʻrtburchak · koʻk · ichi toʻla». Har tugma ≥ 48 × 48 px, asboblar nomi bilan.
- **Harakat jurnali:** har tugallangan harakat `{ asbob, rang, toliq, a, b, kataklar }` (tarix amallari —
  `{ asbob: "bekor" }`), tekshiruvlar shu jurnal va taxta holati boʻyicha (sof mantiq).

## Bosqichlar

Har bosqich: **koʻrsatish** (bola oʻzi qiladi) → **nom** → **mashq**.

### 1. Asboblar
Koʻrsatish — 4 harakat ketma-ket, har biri bola oʻzi qilgach nomlanadi: qalam bilan sur → toʻrtburchak
chiz → chelak bilan ichini toʻldir → «Bekor». Boshqa asbob ishlatilsa — eslatma, jarima yoʻq.

Mashq (`asbob` turi, navbat: shakl → toʻldir → shakl → bekor):
- **shakl** — «Koʻk toʻrtburchak chiz». Tier 0: asbob + rang; tier 1: + «(ichi toʻla)» / «(ichi boʻsh)»;
  tier 2: + «eni kamida 6 katak» (chiziq — «uzunligi kamida 8 katak»). Shakl ≥ 3 × 3.
- **toʻldir** — «Doirani qizilga toʻldir»: taxtada tayyor boʻsh shakl (10–14 × 8–12), chelak bilan
  **aynan ichi** shu rangga oʻzgarishi kerak (tashqarisi bosilsa — «joy»). Tier 2 da uchburchak ham.
- **bekor** — «Oxirgi ishni bekor qil»: taxtada 3 ta shakl (tarixda), tier 2 da «oxirgi 2 ta ish».
  Tekshiruv — taxta kutilgan holatga teng; koʻp qaytarilsa — «Qaytar» maslahati.

Tekshiruv jurnal boʻyicha: asbob, rang, ichi toʻla/boʻsh, oʻlcham. Bekor/qaytar/tozalash — urinish emas.

### 2. Uy chizamiz
Namuna «uy» (6 qadam: devor, tom, eshik, deraza, moʻri, tutun). Har qadamda taxtada **soya** (kutilgan
kataklar och rangda) va koʻrsatma («Devor: koʻk toʻrtburchak chiz (ichi toʻla)»). Tekshiruv: kutilgan
kataklarning ≥ 85 % i toʻgʻri rangda **va** qadam tashqarisida oʻzgargan kataklar ≤ 15 %. Shakl yoki chelak
tushgan zahoti tekshiriladi; qalam/oʻchirgʻich bilan bola davom etadi, «Tayyor» bosilganda tekshiriladi
(yoki mos kelgan zahoti oʻzi oʻtadi). `practice.exercises({ need: 6 })` — har qadam bitta javob.

### 3. Galereya
Koʻrsatish: quyosh rasmi ustiga **ataylab** notoʻgʻri chiziq, keyin `Ctrl+Z` (telefonda «Bekor»). Nom:
bekor, qaytar, saqlash tezkor tugmalari. Keyin bola namunani **oʻzi tanlaydi** (daraxt, quyosh, mashina,
kema, robot — rasmchalari bilan) va 2-bosqichdagidek qadam-qadam chizadi.

**Qiyin rejim:** soya yoʻq, moslik ≥ 90 %, bitta urinish.

## Xato javob (QOIDALAR §4.4)

- 1-bosqich: 1-xato — sabab boʻyicha maslahat (asbob / rang / «ichi toʻla» / oʻlcham / ichini bos / bekor) va
  kerakli tugma yonib-oʻchadi (↻ belgisi bilan); taxta holati saqlanadi. 2-xato — javob taxtada oʻzi
  chiziladi (animatsiya), matn bilan.
- 2–3-bosqich: 1-xato — soya aniqroq + «Asbob: toʻrtburchak, rang: koʻk» (joyni aytmaydi); taxta saqlanadi,
  bola «Bekor» bilan toʻgʻrilaydi. 2-xato — qadam oʻzi chiziladi (animatsiya); keyin **shu qadam yana
  soʻraladi** («Endi oʻzing chiz»), taxta qadam boshidagi holatga qaytariladi — bu QOIDALAR §4.4 dagi
  «shunga oʻxshash yangi misol» va `practice.exercises` hisobiga mos (xato qilingan qadam sanalmaydi).

## Hamma bosqich tugagach

Tabrik ekranida: **Erkin chizish** (toʻliq asboblar, «Saqlash» — «Rasm 1», «Rasm 2»…), **Mening rasmlarim**
(saqlangan rasmlar — rasmcha, «Ochish», «Yuklab olish» PNG 384 × 288, «Oʻchirish» ikki bosqichli; namunalar
galereyasi — istalgan namunani bahosiz qayta chizish, «Oʻtkazib yuborish» bilan), «Qayta oʻynash», «Bosh ekran».
Galereya `localStorage` `kichik-rassom:galereya:v1` da, 20 tagacha, akkauntga sinxronlanmaydi; xotira yopiq
boʻlsa oʻyin baribir ishlaydi.

## Sinov ilgagi

`QK.current` — joriy vazifa (`javob` bilan: 1-bosqichda `{ asbob, rang, toliq, min, a, b }` / `{ asbob:
"chelak", rang, a }` / `{ asbob: "bekor", soni }`; 2–3 da `{ asbob, rang, toliq, a, b }` yoki `{ asbob:
"qalam", rang, kataklar }`). `QK.taxta` — joriy taxta: `holat()` (taxta, asbob, rang, toliq, jurnal),
`chiz(harakat)` (jurnalga yozadi — tekshiruv ishga tushadi), `asbobTanla`, `rangTanla`, `toliqQoy`.
Taxtada `data-asbob`, `data-rang`, `data-amal`; kartalarda `data-namuna`, `data-rasm`.

## Qarorlar

1. **Uy 6 qadam** (spec'da 5): tutun moʻrisiz havoda qolardi — «moʻri» qadami qoʻshildi.
2. **Qalam qadami darhol tekshirilmaydi** — bola bir necha sur bilan chizadi; faqat mos kelganda oʻzi oʻtadi
   yoki «Tayyor» bosilganda tekshiriladi. Shakl va chelak — bitta harakat, darhol.
3. **2-xatodan keyin qadam takrorlanadi** (yuqorida) — spec'dagi «keyingi qadamga oʻtiladi» oʻrniga, chunki
   `practice.exercises` xato qilingan javobni sanamaydi va «kerak» soni qadamlar soniga teng.
4. **Har qadamda tarix yangidan** (darslarda): «Bekor» oldingi qadamlarni buzmasin; yechim koʻrsatilgandan
   keyin bekor bilan unga qaytib boʻlmaydi. Erkin chizishda tarix 50 qadam.
5. **Kodlash satrida rang — harf (a–l), soni — raqam**: «213» kabi satr ikki xil oʻqilmasin.
6. **Qalam/oʻchirgʻich/chelak hech narsani oʻzgartirmasa — jurnalga yozilmaydi** (tasodifiy tegish urinish
   boʻlmasin); shakl — doim yoziladi.
7. **Erkin chizish va galereya tabrik ekranidan** ochiladi (oʻyin bosh ekranini qobiq chizadi). Qayta kirish:
   «Qayta oʻynash» yoki `?bosqich=3`.
8. **Tik past ekranda** taxta koʻringanda qahramonlar yashirinadi (pufak qoladi) — joy taxta va panelga.

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Paint asboblarini (qalam, chiziq, toʻrtburchak, doira, uchburchak, chelak, oʻchirgʻich) nomi boʻyicha tanlaydi va ishlatadi.
2. Rangni palitradan tanlaydi, shaklning ichi toʻla yoki boʻsh boʻlishini boshqaradi.
3. Rasmni namuna boʻyicha qadam-qadam chizadi (soya ustiga).
4. Xatoni «Bekor» (`Ctrl+Z`) bilan qaytaradi, «Qaytar» bilan tiklaydi.
5. Rasmni saqlaydi va PNG qilib yuklab oladi.

## Fayllar

- `js/logic.js` — palitra, asboblar, rasterlash, chelak, tarix, kodlash, namunalar, qadam tekshiruvi, 1-bosqich generatorlari, jurnal tekshiruvi.
- `js/taxta.js` — taxta (canvas, pointer, panel, tezkor tugmalar), `QK.kichikRasm`.
- `js/galereya.js` — saqlash (localStorage), PNG.
- `js/scenes/` — `common.js` (mashq ekranlari, namuna tanlash, bahosiz chizish), `stage1–3.js`, `final.js` (tabrik, erkin chizish, galereya).
- `js/game-art.js` — asbob/amal belgilari, kompyuter va palitra rasmlari (matnsiz SVG).
- `tests/logic.test.js` — 18 test.

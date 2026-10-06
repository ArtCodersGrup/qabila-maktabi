# 72-oʻyin — «Brauzer va sayt»

1–4-sinf «Kompyuter bilan tanishuv» blokining B qismi. Blok dizayni:
[`../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md`](../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md).

- **Yosh:** 2–4-sinf. Telefon va kompyuter — faqat bosish, sudrash yoʻq.
- **Ulanish:** «Ekran va oynalar» — oyna nima; bu oʻyin — «Internet» oynasining ichi.
- **Hikoya:** qabilaga internet keldi, shogird birinchi marta sayt ochyapti.

## Asosiy fikr

- **Brauzer** — saytlarni ochadigan dastur; **manzil** satriga sayt manzili yoziladi (`hayvonlar.uz`).
- **Havola** — koʻk, tagiga chizilgan soʻz: bosilsa boshqa sahifa ochiladi. **← Orqaga** — avvalgi sahifa, **→ Oldinga** — qaytib oldinga.
- **Qidiruv** (`qidiruv.uz`) — soʻz boʻyicha sahifa topadi; qisqa, asosiy soʻz yoziladi.
- **Xavfsiz yurish:** qalqib chiquvchi oyna ✕ bilan yopiladi (ichidagi tugma aldaydi); parol va telefon saytga yozilmaydi — chiqib ketiladi, kattaga aytiladi. Qulf bor — yaxshi.

## Brauzer oynasi (`js/brauzer.js`)

`stol` oynasi (`.oyna.faol`, sarlavha «Internet», `QK.stolArt.icon("internet")`):

- asboblar: ← Orqaga, → Oldinga, ↻ Yangilash (≥ 48 px; tor ekranda faqat belgi), **manzil satri** (chapida SVG qulf: yashil yopiq / kulrang ochiq), ⭐ xatchoʻp;
- kompyuterda manzil — `<input>`: Enter bilan ochiladi, fokusda tarixdan 3 tagacha taklif; telefonda (`ui.touchOnly()`) satr — tugma, bosilsa bankdagi saytlar **chiplari** chiqadi;
- sahifa: sarlavha, matnsiz SVG rasm, 2–4 gap, havolalar; sahifa ichi aylanadi, oyna balandligi qatʼiy;
- notoʻgʻri manzil — «Bunday sayt yoʻq» sahifasi (uzilgan sim rasmi);
- qidiruv sahifasi: kompyuterda satr + «Qidir», telefonda soʻz chiplari; natija — sarlavha + manzil + 1 gap;
- qalqib chiquvchi oyna — sariq/toʻq sariq, burchakda ✕, ichida katta tugma;
- soʻrov shakli (3-bosqich): maydon, «Yuborish», «Chiqib ketaman».

## Oʻyinchoq internet (`logic.js`)

10 ta sayt (`qabila.uz`, `maktab.uz`, `obhavo.uz`, `hayvonlar.uz`, `sayyoralar.uz`, `ertaklar.uz`, `qidiruv.uz`, `oyinlar.uz`,
`sovga.uz`, `kino.uz` — oxirgi ikkitasi soʻrovchi) va ichki sahifalar (`hayvonlar.uz/tuyalar`, `…/qushlar/tuyaqush`,
`sayyoralar.uz/mars`, `ertaklar.uz/zumrad` …) — jami 18 sahifa. Har sahifada `id`, `manzil`, `sarlavha`, `matn`, `rasm`,
`havolalar`, `qulf`, `soroq`, `qalqib`. Soʻrovchi saytlar qidiruvda va telefon chiplarida chiqmaydi.

`qidir(soʻz)`: katta-kichik harf, `oʻ / o' / o\``, chiziqcha farqsiz; sarlavhada +3, matnda har uchrash +1; teng boʻlsa bank tartibi.

## Bosqichlar

### 1. Manzil va havola
Koʻrsatish: «hayvonlar.uz»ni yozadi/tanlaydi → *brauzer, manzil*; «Tuyalar»ni bosadi → *havola*; «Orqaga» → qaytdi.
Mashq (navbat): `manzil` (tier 0 — bosh sayt, tier 1–2 — ichki sahifa), `havola`, `orqaga` (tier 0 — 1 qadam, keyin 2),
`yol` (tier ≥ 1 — saytga kir, undagi havolani och). Tekshiruv — harakat: notoʻgʻri sayt yoki havola — xato; yoʻldagi
oraliq sahifa, manzil satrini bosish, chiplar, yangilash — betaraf. Mashqdan keyin: ☆ xatchoʻp (bezak).

### 2. Qidiruv
Koʻrsatish: `qidiruv.uz` → «tuya» → «Tuyalar» → javob gapi yoritiladi. Nom: *qidiruv*.
Mashq — **xazina ovi**: savol → bola erkin qidiradi va yuradi (jarimasiz) → 4 variantdan javob. Tier: kalit soʻz boʻyicha
javob sahifasi 1-natija → 2–3-natija → natija ichidagi havola ortida (Mars, Zumrad, Susambil).

### 3. Xavfsiz yurish
Koʻrsatish: «oyinlar.uz»da qalqib oyna → ✕; «sovga.uz» telefon soʻraydi → «Chiqib ketaman»; qulf belgisi.
Mashq: `qalqib` (✕ — toʻgʻri, ichidagi tugma — xato; tier 2 da ichidagi tugma «Yopish» deb aldaydi), `soroq`
(«Chiqib ketaman», «Orqaga» yoki boshqa sayt — toʻgʻri; maydonga yozish, «Yuborish» — xato; tier 0 — telefon),
`savol` (vaziyat, 4 variant, rasm kartasi).

## Xato javob

- 1-xato: holat saqlanadi (bola davom etadi), maslahat joyni koʻrsatadi: «manzil satri yuqorida, qulf yonida»,
  «havola — koʻk, tagiga chizilgan», «✕ — yuqori burchakda», «qidiruvga asosiy soʻzni yoz» (qaysi soʻzligini aytmaydi).
- 2-xato: brauzer boshlangʻich sahifaga qaytadi va kerakli joylar ketma-ket **yoritilib** (yashil halqa + ✓) bajariladi;
  xazinada javob gapi yoritiladi. Keyin yangi vazifa.
- «Xato» soʻzi va qizil rang yoʻq.

## Qarorlar

- Holat oʻzgarmas: `yangi`, `och`, `havola`, `orqaga`, `oldinga`, `qidirOch`, `natija`, `chiq` — yangi holat yoki oʻsha holat.
- Qidiruv natijalari tarixga yoziladi (soʻz bilan) — «Orqaga» natijalarga qaytaradi.
- Yangi sahifa ochilsa «oldinga» yoʻli oʻchadi (haqiqiy brauzerdagidek).
- Manzil `https://`, `www.`, katta harf, oxirgi `/` bilan ham ochiladi.
- `yol` vazifasida boshlangʻich sahifa saytning havolalari orasida boʻlmaydi — notoʻgʻri havola doim xato.
- Qalqib oyna 1-xatodan keyin ham turadi; soʻrov maydoni 1-xatodan keyin tozalanadi.
- Sinov ilgaklari: `QK.current.javob`, `QK.current.qadamlar` (namunali yoʻl), `QK.brauzer.holat/och/havola/orqaga/qidir/…`,
  DOM: `[data-amal]`, `[data-havola]`, `[data-chip]`, `[data-natija]`, `[data-variant]`, `[data-soz]`.

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Brauzer, sayt, manzil, havola soʻzlarini toʻgʻri ishlatadi.
2. Manzilni terib (tanlab) saytni ochadi; notoʻgʻri manzilda «sayt yoʻq»ni tushunadi.
3. Havolani topib bosadi; «Orqaga» va «Oldinga» bilan yuradi.
4. Qidiruvga asosiy soʻzni yozib, kerakli sahifani topadi va undan javobni oʻqiydi.
5. Qalqib chiquvchi oynani ✕ bilan yopadi, ichidagi tugmani bosmaydi.
6. Parol, telefon, manzil va rasmini saytga yoki notanishga bermaydi; bunday holatda kattaga aytadi.

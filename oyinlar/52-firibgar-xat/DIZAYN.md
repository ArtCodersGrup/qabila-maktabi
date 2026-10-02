# 52-oʻyin — «Firibgar xat»

«Parol va xavfsizlik» blokining oʻyini. Blok rejasi:
[`../umumiy/XAVFSIZLIK-BLOK.md`](../umumiy/XAVFSIZLIK-BLOK.md).

- **Yosh:** 10–16 (ikkala toifada). Klaviatura shart emas, faqat bosish.
- **Ulanish:** «Parol kuchi» oʻyini — parol nega qimmatli; bu oʻyin — parolni **soʻrab olishga**
  urinishni tanish.
- **Hisob yoʻq:** bu sof amaliyot oʻyini. Hisoblanadigan narsa — faqat uchta toʻgʻri javob.

## Asosiy fikr

Parolni sindirishning eng oson yoʻli — hisoblash emas, **soʻrab olish**. Shuning uchun bola
hisobdan muhimroq narsani oʻrganadi: xabarga qarab, uning soxta ekanini tanish.

Oʻyin **tanish va himoya** tomonida qoladi: soxta sayt yasash, xat joʻnatish, odamni aldash
usullari koʻrsatilmaydi. Namunalar faqat *koʻrib tanish* uchun.

## Uch bosqich

1. **Belgilarni oʻrgan** — sakkiz belgi misoli bilan: shoshiltirish, qoʻrqitish, parol yoki kod
   soʻrash, gʻalati manzil, kutilmagan yutuq, imlo xatolari, sir tutishni soʻrash, pul soʻrash.
   Mashqda bola gapni koʻrib, qaysi belgi ekanini aytadi.
2. **Xatni tekshir** — toʻliq xat kartasi (kimdan, manzil, sarlavha, matn, havola) koʻrsatiladi,
   bola «Haqiqiy» yoki «Firibgar» deb javob beradi. Xato qilsa — qaysi belgilarni sezmagani va
   manzil nimasi bilan soxta ekani yoziladi. **14 ta xat: 7 haqiqiy, 7 soxta.**
3. **Nima qilaman** — vaziyat beriladi (otaning nomidan pul soʻralgan xabar, SMS kod, soxta
   havola, «hech kimga aytma», xato qilib parolni kiritib qoʻyish), bola toʻrt variantdan toʻgʻri
   harakatni tanlaydi.

## Manzil (domen) qoidasi

Hal qiluvchi qism — **zonadan oldingi nom**. `logic.js` dagi `ajrat()` manzilni shu qismga
ajratadi (pochta manzili ham, havola ham), `domenFarqi()` esa haqiqiy nom bilan solishtiradi:

| Manzil | Baho | Nega |
| --- | --- | --- |
| `qabilabank.uz` | haqiqiy | nom va zona oʻsha |
| `kirish.qabilabank.uz` | haqiqiy | bankning oʻz boʻlimi — nom oʻzgarmagan |
| `qabi1abank.uz` | `harf` | `l` oʻrnida `1`: koʻzga oʻxshash belgilar tenglashtiriladi, qolgan farq tahrir masofasi bilan oʻlchanadi |
| `qabilabank-tekshiruv.xyz` | `qoshimcha` | nomga soʻz yopishtirilgan |
| `qabilabank.tekshir.uz` | `qoshimcha` | haqiqiy nom oldinga koʻchirilgan, egasi boshqa |
| `qabilabank.top` | `zona` | nom toʻgʻri, zona boshqa |
| `tez-pochta.site` | `boshqa` | umuman boshqa manzil |

Tashkilot maʼlum boʻlmasa (notanish yuboruvchi), faqat zona tekshiriladi: `xyz`, `top`, `site`
kabi arzon zona — `gumonli`.

**Muhim:** manzil toʻgʻri boʻlsa ham xat soxta boʻlishi mumkin. `dostlar-notanish` xati haqiqiy
domendan keladi, lekin parol soʻraydi va sir tutishni talab qiladi — bola buni matndan topadi.

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. firibgar xatning kamida beshta belgisini nomlab beradi;
2. xatning manzilini zonadan oldingi nomi boʻyicha tekshiradi va `kirish.bank.uz` bilan
   `bank.kirish.uz` ni farqlaydi;
3. koʻzga oʻxshash belgi almashtirilgan manzilni (`1` ↔ `l`, `0` ↔ `o`) topadi;
4. haqiqiy xatni soxtasidan ajratadi va tanlovini belgilar bilan tushuntiradi;
5. parol va SMS kodni hech kimga aytmaslik qoidasini biladi;
6. shoshiltirgan xabarga javob bermaslikni va kattalarga koʻrsatishni biladi;
7. xato qilib parolni kiritib qoʻysa, nima qilish kerakligini aytadi.

## Qarorlar

- **Haqiqiy brend nomlari yoʻq** — oʻylab topilgan tashkilotlar: «Qabila bank», «Maktab tizimi»,
  «Doʻstlar ilovasi», «Qabila pochta», «Kitob doʻkoni», «Oʻyin maydoni». Soxta domenlar ham
  oʻylab topilgan. Buni test qulflaydi.
- Xat kartasidagi havola **hech qachon bosiladigan emas** (`<a>` emas, matn): oʻyin havolani
  bosishga oʻrgatmaydi.
- 2-bosqichda soxta va haqiqiy xatlar **navbatlashadi** — bola hammasini «firibgar» deb
  javob berib oʻtib ketmaydi.
- Haqiqiy xatlarda ataylab **shubhali koʻrinadigan, lekin bezarar** gaplar bor («kartadan
  xarid», «yangi qurilmadan kirildi») — bola belgini emas, xabarni oʻqishni oʻrganadi.
- Qoʻrqituvchi tafsilot yoʻq: pul yoʻqolishi, jarima, politsiya haqida gap ketmaydi. Xato
  qilgan bola uyaltirilmaydi — 3-bosqichda shu alohida aytiladi.

## Fayllar

- `js/logic.js` — belgilar, 14 xat, 8 vaziyat, `ajrat` / `domenFarqi` / `manzilBahosi` va uch
  savol generatori.
- `tests/logic.test.js` — 15 test; ichida **har soxta xatda belgi bor**, **eʼlon qilingan belgi
  matnda bor**, **domen qoidasining uch holati** va **brend nomlari yoʻq** daʼvolari qulflangan.
- `js/scenes/` — kirish, uch bosqich, tabrik. `css/style.css` — prefiks `.fx-`.

## 2026-10-02 qiyinlik yangilanishi

Sabab: 2-bosqichning asosiy mashqi "Haqiqiy / Firibgar" — 2 variant, ikki urinish bilan yutqazib boʻlmasdi; 14 ta xat tez takrorlanardi.

- **2-bosqich — ikki qadam** (`xabarTask` → `joy`, `nom`; tekshiruv `tekshirXabar`):
  1. "Bu xat haqiqiymi yoki firibgarmi?"
  2. "Firibgar" desa — **"«Shoshiltirish» belgisi xatning qayerida? Oʻsha joyni bos"**: xat qismlarga boʻlingan (`xatQismlari`: manzil, sarlavha, har gap, havola — 5–7 ta bosiladigan joy). "Haqiqiy" desa — **"manzilda zonadan oldingi nom qaysi?"** (4 variant: nom, @ dan oldingi soʻz, zona, boʻlim/https).
  Ikkala javob birga tekshiriladi va ikkalasi toʻgʻri boʻlsagina hisoblanadi; qaysi qadam xatoligi aytilmaydi (maslahat: "ikki javobdan kamida bittasi xato" + nimaga qarash kerakligi). Belgi nomi haqiqiy xatda ham aytiladi — savolning oʻzi javobni oshkor qilmaydi.
- **Belgi joyi** kod bilan aniqlanadi (`qismdaBelgi`): manzil/havola — domen qoidasi (`birManzil`), gap — `KALIT` soʻzlari. "Imlo" soʻralmaydi (koʻz bilan tekshiriladi).
- **Xat generatori** (`yasaXabar`: 6 tashkilot × 4 soxta manzil turi × 6 belgi gaplari): tier 0 — qoʻlda yozilgan 14 xat (3–5 belgi); tier 1 — yasalgan, **2 belgi**; tier 2 — yasalgan, **bitta belgi** (faqat manzil xato yoki manzil toʻgʻri-yu bitta gap) va tuzoqli haqiqiy xatlar (`kirish.qabilabank.uz` boʻlimi, "biz hech qachon parol soʻramaymiz"). Test: har yasalgan gap faqat oʻz belgisining kalit soʻzini saqlaydi.
- 1- va 3-bosqich oʻzgarmadi (4 variant, bank 16 misol va 40 vaziyat).

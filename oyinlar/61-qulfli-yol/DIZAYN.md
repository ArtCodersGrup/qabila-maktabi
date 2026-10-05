# 61-oʻyin — «Qulfli yoʻl»

«Internet qanday ishlaydi» blokining toʻrtinchi oʻyini; «Parol va xavfsizlik» blokiga koʻprik.
Blok rejasi: [`../umumiy/INTERNET-BLOK.md`](../umumiy/INTERNET-BLOK.md).

- **Yosh:** 10–16. Telefon va kompyuter.
- **Ulanish:** «Paket yoʻli» (yoʻldagi tugunlar), «Sezar maktubi» (yashirish), «Parol kuchi», «Firibgar xat».

## Asosiy fikr

- Paket yoʻlda koʻp tugundan oʻtadi. **Qulfsiz** yoʻlda har tugun xabarni — parolni ham — **oʻqiy oladi**.
- **Qulf (HTTPS)** ikki narsani kafolatlaydi: yoʻldagi tugunlar matnni oʻqiy olmaydi va manzil **haqiqiy** (oʻsha sayt).
- Qulf saytning **halolligini bildirmaydi**: firibgar ham qulfli sayt ochishi mumkin. Shuning uchun manzilning oʻzini oʻqish kerak.

## Metafora

Qulfsiz xabar — **ochiq otkritka** (har pochtachi oʻqiydi), qulfli — **qulflangan quti**. Bola — yoʻldagi
tugun (pochtachi). Manzil satri (`🔒 https://…`) — HTML, haqiqiy brauzer satriga oʻxshab chiziladi.

## Bosqichlar

### 1. Ochiq yoʻl
Koʻrsatish: bola tugun boʻlib turadi; oldidan otkritka oʻtadi: `login: ali4821 parol: olma77`.
Hamma narsa oʻqiladi. Keyin yoʻldagi tugunlar soni — «Paket yoʻli»dan: xabarni shu hammasi koʻrdi.

Mashq turlari:
- **Bu xabarda parol qaysi?** — oʻtayotgan xabar (tier oshgani sari uzunroq, bir nechta maydon: login, parol, sinf, kod), 4 variant.
- **Bu xabarni nechta tugun oʻqiy oldi?** — yoʻl (tugunlar zanjiri) koʻrsatilgan, javob son (qabul qiluvchi ham sanaladimi — savolda aniq yoziladi: «yoʻldagi tugunlar, uchidagi ikkalasidan tashqari»).

### 2. Qulflangan yoʻl
Koʻrsatish: aynan oʻsha xabar qulf bilan oʻtadi — tugun faqat tushunarsiz belgilarni koʻradi (`x7Qp…`).
Qabul qiluvchi qutini ochadi va asl matnni oʻqiydi. Nom: **HTTPS**, manzil satridagi 🔒.

Mashq turlari:
- **Tugun nimani koʻrdi?** — 4 variant: aynan shu belgilar qatori ✓, asl matn, faqat parol, boʻsh joy.
- **Qulf nimani kafolatlaydi?** — 4 variant: yoʻlda oʻqib boʻlmaydi va manzil haqiqiy ✓; sayt halol; parol kuchli; kompyuterda virus yoʻq.
- **Qaysi manzilda qulf bor?** — 4 ta manzil satri, bittasida `https` va 🔒.

### 3. Ishonamanmi?
Koʻrsatish: uch sayt — qulfsiz; qulfli va toʻgʻri manzil; **qulfli, lekin firibgar manzil**
(`kelajagim.uz.sovga-yutuq.com`). Qaror: qayerga parol yozsa boʻladi. Asosiy xulosa: qulf + **manzilni oxiridan oʻqi**.

Mashq turlari:
- **Qaysi saytga parol yozish mumkin?** — 4 manzil satri: bitta toʻgʻri (qulf + asl domen), qolganlari: qulfsiz asl domen, qulfli lekin boshqa domen, qulfli lekin harf almashgan (`kelajagirn.uz` — `rn` ≈ `m`). tier oshgani sari aldov nozik.
- **Bu saytda nima xato?** — bitta manzil satri, 4 variant (qulf yoʻq / domen boshqa / harf almashgan / hammasi joyida).
- **Manzilning haqiqiy egasi kim?** — uzun manzil (`kelajagim.uz.sovga.com/kirish`), 4 variant (`sovga.com` ✓, `kelajagim.uz`, `kirish`, `uz`). Qoida: oxirgi nuqtadan oldingi qism + oxiri.

## Qarorlar

- **Haqiqiy shifrlash oʻrgatilmaydi.** Qulflangan matn — tasodifiy belgilar (har safar boshqa), *«haqiqatda bu matematik qulf; kalitlar haqida 12–16 yoshlarga keyingi bloklarda»* degan bir satr.
- «Qulf bor — sayt xavfsiz» — **yolgʻon**, 3-bosqichda «qulfli firibgar» holati **majburiy** (test tekshiradi: har mashqda kamida bitta qulfli aldov varianti).
- Domenlar oʻylab topilgan (`qabila.uz`, `kelajagim.uz` — bizniki) — boshqa haqiqiy brend nomi ishlatilmaydi.
- Parol misollari aniq «oʻyin» parollari (`olma77`), haqiqiyga oʻxshash maxfiy maʼlumot (karta raqami) yoʻq.
- Variantli savolda doim 4 variant; maslahat — manzilni qismlarga ajratib koʻrsatish, javob emas.

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Qulfsiz yoʻlda yoʻldagi har tugun xabarni oʻqiy olishini aytadi.
2. Qulf (HTTPS) nimani kafolatlashini va nimani kafolatlamasligini ajratadi.
3. Manzil satrida qulfni topadi.
4. Firibgar manzilni taniydi: qulf bor, lekin domen boshqa yoki harf almashgan.
5. Parolni faqat qulfli **va** toʻgʻri manzilli saytga yozish kerakligini tushuntiradi.

## Fayllar (reja)

- `js/logic.js` — xabarlar, tugunlar yoʻli, «qulflash» (tasodifiy belgilar), domen tahlili (`egasi`), aldov turlari, generatorlar.
- `tests/logic.test.js` — `egasi` (`a.b.sovga.com` → `sovga.com`), aldov variantlari, har mashqda qulfli aldov borligi, 4 variant.
- `js/scenes/`, `js/game-art.js` — otkritka, quti, qulf, tugun.

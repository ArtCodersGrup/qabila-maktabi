# 59-oʻyin — «Qabila manzillari»

«Internet qanday ishlaydi» blokining ikkinchi oʻyini. Blok rejasi: [`../umumiy/INTERNET-BLOK.md`](../umumiy/INTERNET-BLOK.md).

- **Yosh:** 10–16. Telefon va kompyuter.
- **Ulanish:** «Bayt sandigʻi» — nega har son 0–255 (1 bayt); «Xabar boʻlaklari» — konvertdagi manzil.

## Asosiy fikr

- Internetdagi har qurilmaning **raqamli manzili** bor: `192.168.1.5` — toʻrtta son, har biri **0 dan 255 gacha** (1 bayt). Bu **IP manzil**.
- Odam nomni eslaydi (`maktab.uz`), kompyuter raqamni. Nomdan manzilni topadigan **daftar** bor — **DNS**. Daftar **bitta joyda emas**: kichik daftarda yoʻq boʻlsa, kattarogʻidan soʻraladi.
- Bir marta topilgan javob **javonga** qoʻyiladi — ikkinchi safar daftar kerak emas, tez. Bu — **kesh**. Lekin javondagi javob **eskirishi** mumkin.

## Metafora

Uy — qurilma; uy raqami — IP manzil; daftar — DNS; javondagi qogʻoz — kesh. Xarita va uylar — SVG,
manzillar va nomlar — HTML (rasm ichida matn yoʻq).

## Bosqichlar

### 1. Manzil
Koʻrsatish: xaritada 6 uy, har birining eshigida toʻrtta son. Bola konvertni manzil boʻyicha uyga eltadi.
Manzilsiz konvert qaytib keladi; bitta son xato boʻlsa — boshqa uyga tushadi. Keyin: har son — **1 bayt**,
shuning uchun 0–255 («Bayt sandigʻi»ni esla). Nom: **IP manzil**.

Mashq turlari:
- **Konvert qaysi uyga?** — xaritadagi uylar (4–6 ta), manzillari bir-biriga juda oʻxshash (tier oshgani sari bitta raqam farq qiladi).
- **Qaysi manzil xato?** — 4 manzil, bittasi xato. Xatolar turi tier bilan murakkablashadi: tier 0 — son 255 dan katta (`300`); tier 1 — 3 yoki 5 boʻlak; tier 2 — `256`, manfiy son, harf aralashgan, oxirida nuqta.
- **Har son eng koʻpi bilan nechaga teng?** (bir marta, tier 0) — 255, nega — 8 bit.

### 2. Daftar (DNS)
Koʻrsatish: bola «daftarchi» boʻladi — nom beriladi, daftardan manzilni topadi. Keyingi nom kichik
daftarda yoʻq — «Shahar daftari»dan soʻraydi, u ham bilmasa — «.uz daftari»dan. Nom: **DNS**.

Mashq turlari:
- **Manzilni top** — 6–10 qatorli daftar jadvali, nom berilgan, 4 variant (oʻxshash raqamlar).
- **Nechta daftardan soʻraldi?** — uch daftar (mahalla → shahar → .uz) koʻrinadi, nom qaysi birida birinchi topilsa — oʻsha songacha sanaladi. Javob — son (1–3). tier 2: nom hech qayerda yoʻq — 4 variantli savol («Sayt topilmadi»).

### 3. Esda qoldi (kesh)
Koʻrsatish: bir nom ikki marta soʻraladi — birinchi safar 3 ta soʻrov, ikkinchi safar **javondan**, 0 ta.
Keyin sayt uyi koʻchadi (manzil oʻzgaradi), javonda eski manzil qolgan — konvert eski uyga boradi.
Nom: **kesh**, va «yangilash» nima uchun kerakligi.

Mashq turlari:
- **Nechta soʻrov ketadi?** — soʻrovlar ketma-ketligi (`maktab.uz`, `kitob.uz`, `maktab.uz`, …) va javon holati. Javob — jami soʻrovlar soni. tier oshgani sari roʻyxat uzayadi.
- **Konvert qaysi uyga boradi?** — manzil oʻzgargan, javonda eskisi: 4 variant (eski uy — toʻgʻri javob, yangi uy, qaytib keladi, daftarga boradi).
- **Nima qilish kerak?** — 4 variant: javondagi eski yozuvni oʻchirib qayta soʻrash ✓, sahifani yopish, boshqa saytga kirish, kompyuterni almashtirish.

## Qarorlar

- Manzillar `10.x.x.x` / `192.168.x.x` kabi **ichki** diapazondan va oʻylab topilgan nomlardan (`qabila.uz`, `ovchi.uz`) olinadi — haqiqiy saytlarning manzillari yozilmaydi.
- **IPv6 kiritilmaydi**; bir satr: *«haqiqatda manzil uzunrogʻi ham bor va qurilma manzili oʻzgarib turadi»*.
- DNS: *«haqiqatda daftarlar dunyo boʻylab minglab»*; kesh: *«haqiqatda javondagi yozuvning yaroqlilik muddati bor»*.
- Variantli savolda doim 4 variant; maslahat javobni aytmaydi (jadvalni koʻrsatadi, «har sonni 255 bilan solishtir»).
- Bolaning oʻz IP manzili **koʻrsatilmaydi** (internet talab qiladi va shaxsiy maʼlumot) — oʻyin toʻliq oflayn simulyatsiya.

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. IP manzil nima ekanini va u toʻrtta 0–255 sondan iborat boʻlishini aytadi; nega 255 — 1 bayt.
2. Berilgan manzil toʻgʻri yoki xato ekanini aniqlaydi va sababini aytadi.
3. DNS nimaga kerakligini (nom → manzil) va daftar bitta joyda emasligini tushuntiradi.
4. Kesh soʻrovlar sonini qanday kamaytirishini hisoblaydi.
5. «Eski sahifa koʻrinyapti» holatini kesh bilan tushuntiradi va yangilash kerakligini biladi.

## Fayllar (reja)

- `js/logic.js` — manzil tekshiruvi (`togriManzilmi`), xato manzil turlari, xarita/uylar, daftarlar zanjiri, kesh simulyatsiyasi, uch bosqich generatorlari.
- `tests/logic.test.js` — manzil tekshiruvi chegaralari (0, 255, 256, 3/5 boʻlak), DNS zanjiri soni, kesh hisobi, variantlar.
- `js/scenes/`, `js/game-art.js` — uy, xarita, daftar, javon.

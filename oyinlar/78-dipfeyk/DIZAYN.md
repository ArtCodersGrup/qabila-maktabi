# «Dipfeyk»

IX sinf «Sunʼiy intellekt», 6-dars (AI va DeepFakes). Reja: [`docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md`](../../docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md).

- **Toifa:** `yuqori` (9–11), 14–15 yosh. Telefon va kompyuter — faqat bosish va raqam klaviaturasi.
- **Ohang:** `docs/superpowers/specs/2026-10-10-orta-ohang.md`. Uslub namunasi — «Firibgar xat».

## Chegaralar (oʻzgarmaydi)

- **Faqat xabardorlik.** Dipfeyk yasash yoʻriqnomasi, vosita va xizmat nomlari, qadamlar — **yoʻq**. «Qanday yasaladi» — bitta sxema va bitta gap darajasida.
- **Haqiqiy odamlar yoʻq.** Yuzlar — sxematik chizma (`game-art.js` → `yuz()`), maʼlumotdan chiziladi. Haqiqiy ism, brend, platforma nomi yoʻq
  (akkauntlar — oʻylab topilgan `@shahar_xabar` kabi nomlar). Testda taqiqlangan soʻzlar roʻyxati bor.

## Asosiy fikr

1. Dipfeykda baʼzan izlar qoladi — lekin **belgi yoʻqligi haqiqiylikni isbotlamaydi**.
2. Shuning uchun asosiy himoya — **manbani tekshirish**: kim tarqatdi, boshqa mustaqil manbada bormi, sana mosmi.
3. Odamning yuzi va ovozi — shaxsiy maʼlumot: **ruxsat, zarar yoʻqligi, ochiqlik**. Duch kelganda: tarqatma → dalilni saqla → kattalarga ayt → platformaga shikoyat qil.

## Bosqichlar

### 1. Belgilarini tanish
Koʻrsatish: asl va oʻzgartirilgan chizma yonma-yon; oʻquvchi 6 joydan farq bor 4 tasini topadi (yuz cheti, koʻzlar, tishlar, yorugʻlik va soya).
Tushuntirish: sxema (bir odamning suratlari + boshqa video → model → yuzi almashgan video), atamalar: yuz almashtirish (face swap), ovozni klonlash (voice cloning);
lab-ovoz sxemasi; cheklov.
Mashq (`juftTask`, `belgiTask`, `labTask`): A va B dan qaysi biri oʻzgartirilgan va nimasi; yuzda qaysi belgi bor (yoki yoʻq) / nechta belgi bor;
lab-ovoz sxemasida nechta kadr mos emas.

Yuz maʼlumoti: `{ teri, soch, sochRang, kiyim, nur, qarash, chet, soya, koz, tish }`. Tabiiy yuzda: chet aniq, yuzdagi soya chiroqqa teskari tomonda
(yelkadagi soya bilan bir tomonda), ikki koʻz bir xil va yaltiroq nuqtasi chiroq tomonda, tishlar alohida.

### 2. Manbani tekshirish
Koʻrsatish: oʻquvchi namunaviy postga uch savolni oʻzi beradi (har savol bitta satrni ochadi) — uchalasidan ham oʻtmaydi.
Mashq (`shubhaTask`, `zanjirTask`, `sanaTask`): postda shubha qayerda (yoki nechta tekshiruvdan oʻtmadi); ulashish zanjiridan asl manbani topish;
«bugun» deb berilgan video necha kun eski (oy chegarasi orqali hisob).

### 3. Etika va harakat
Koʻrsatish: tarqalish modeli — 3 → 9 → 27, jami 39; «sen yubormasang, shox toʻxtaydi». Tushuntirish: uch shart va toʻrt qadam.
Mashq (`harakatTask`, `muammoTask`, `tarqalishTask`): eng toʻgʻri harakat (yuqori zinada yarim toʻgʻri variantlar bilan); uch shartdan qaysi biri buzilgan (yoki nechtasi);
tarqalish hisobi, shu jumladan bir necha kishi tarqatmasa nima oʻzgaradi.

## Qarorlar

- Mashq navbati (`BOSQICH1…3`) zina bilan birga yuradi: asosiy tur ikki marta, ikkinchisida qiyinroq zinasi bilan chiqadi.
- Post va vaziyat kartalari satrlardan yigʻiladi (toʻgʻri va shubhali satrlar banki + sonlar) — har misol boshqa.
- «Uch tekshiruvdan oʻtdi» javobi ham bor: har postni soxta deyish — xato odat. Izohda: bu 100 % kafolat emas.
- «Uch shart ham bajarilgan» javobi ham bor: AI bilan tasvir yasashning oʻzi yomon emas — ruxsat, zarar va ochiqlik hal qiladi.
- Toʻgʻri harakatlar faqat xavfsiz yoʻllar: tarqatmaslik, pul yubormaslik, dalil saqlash, kattalarga aytish, platformaga shikoyat. Qasos va «oʻzim ham yasayman» — doim notoʻgʻri variant.

## Oʻquv maqsadlari

Oʻyindan keyin oʻquvchi:

1. Dipfeyk nima ekanini va uning ikki turini (yuz almashtirish, ovozni klonlash) aytadi.
2. Beshta belgini sanaydi va chizmada topadi: xira chet, yorugʻlik va soya nomuvofiqligi, koʻz, tish, lab-ovoz.
3. Belgi yoʻqligi haqiqiylikni isbotlamasligini tushuntiradi.
4. Xabarni uch savol bilan tekshiradi: kim tarqatdi, boshqa manbada bormi, sana mosmi; ulashish zanjiridan asl manbani topadi.
5. AI bilan yasalgan tasvir uchun uch shartni (ruxsat, zarar yoʻqligi, ochiqlik) qoʻllaydi.
6. Soxta videoga duch kelganda toʻrt qadamni aytadi va tarqatmaslik nega muhimligini hisob bilan koʻrsatadi.

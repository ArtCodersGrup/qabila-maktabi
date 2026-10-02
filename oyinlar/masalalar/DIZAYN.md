# Masalalar maydoni: dizayn

**Nima:** olimpiada masalalari roʻyxati — qidiruv, filtr, sahifalash; har masala testlar bilan tekshiriladi va **foiz** bilan baholanadi.
**Yosh:** 12–16 · **Qurilma:** kompyuter (💻) · **Qayerda:** bosh sahifa → **Mashqlar** → «Masalalar» (`oyinlar/masalalar/`).
**Holati:** kod yozildi, testlari yashil — muallif koʻrib chiqishini kutmoqda (2026-10-01; 2026-10-02 da bank 12–16 yoshga moslab kuchaytirildi — pastdagi «Masalalar sifati» boʻlimi).

**Muallif topshirigʻi (2026-10-01):** «masalalar maydoni mashqlar qatoriga olish kerak, ularni roʻyxat qilish kerak. Filtrlash joyi va qidiruv oynasi. Masala 10 tadan koʻrinishi, keyingisi — sahifalar. Masalalar uchun shablon testlar boʻlishi va qaysi test xato bersa koʻrsatishi kerak. Yetib kelganiga qarab foiz berish: 4 test boʻlsa, 3 tasidan oʻtsa — 75%.»

---

## 1. Men qabul qilgan qarorlar

1. **Bu oʻyin emas** — bosqichi, qahramoni va hikoyasi yoʻq. Shuning uchun `QK.app.start` qobigʻi ishlatilmaydi va bosh sahifada oʻyinlar orasida emas, yangi **Mashqlar** qatorida turadi.
2. **Foiz — baho, «yechildi» esa boshqa narsa.** 75% olimpiadada ball beradi, lekin masala yechilgan hisoblanmaydi: aks holda bola chala yechimda toʻxtaydi. Kartada eng yaxshi foiz koʻrinadi, ✓ esa faqat **100%** da qoʻyiladi.
3. **Yashirin testlarning maʼlumoti ochilmaydi.** Hamma test raqami bilan ✓/✗ koʻrinadi. Kirish va kutilgan javob faqat **ochiq** testlarda koʻrsatiladi: namuna (1-test — u shartda baribir koʻrinib turibdi) va shu masalada bola **birinchi yiqilgan 2 ta yashirin test** (`baho.js` → `OCHIQ_SONI = 2`). Ochilgan test raqamlari eslab qolinadi (`holat.js`, masala yozuvidagi `ochilgan`): bola ikki javobni `if` bilan kodga qotirib yozsa ham, keyingi urinishda **yangi test ochilmaydi** — aks holda har urinishda bittadan javob ochilib, hamma testni yozib chiqish mumkin edi (2026-10-02 gacha shunday edi: har safar «birinchi yiqilgan» test ochilardi). Qolgan yiqilgan testlar **yopiq**: faqat `✗ 5-test` va hukm — «javob notoʻgʻri», «xato berdi» yoki «juda sekin» (olimpiadadagi kabi). Har masalada kamida 6 ta yashirin test bor, demak ikki javobni qotirgan yechim 100% ola olmaydi.
4. **Maslahat ikkinchi urinishdan keyin** beriladi — avval oʻzi oʻylab koʻrsin.
5. **Qidiruv** nom, shart, teg, daraja va manba kodi (`4A`) boʻyicha ishlaydi; bir nechta soʻz yozilsa, hammasi mos kelishi kerak.
6. **Havola bilan bitta masala:** `…/masalalar/index.html#masala=cf-tarvuz` — oʻqituvchi darsda aniq masalani ochib bera oladi.

## 2. Ekranlar

### 2.1. Roʻyxat
```
Masalalar                                   [🔍 qidiruv]  49 ta masala (jami 71)
[Daraja ▾] [Mavzu ▾] [Qiyinlik: 500+ ▾] [Holati ▾] [Tozalash]
 1  Ikkinchi eng katta   Qiyin · roʻyxat · saralash      500
 2  Nechanchi oʻrinda    Qiyin · izlash · for            500   75%
 …                                                     (10 tadan)
              ◀︎  1  2  3  4  5  ▶︎
```
Yechilgan masala yashil fonda va ✓ bilan; chala yechilgani foizi bilan koʻrinadi. Har qatorda daraja belgisi bor (Oson / Oʻrta / Qiyin / Codeforces / Olimpiada).

**Standart filtr — «Qiyinlik: 500+»** (2026-10-02): birinchi kirishda roʻyxat 500 reytingdan boshlanadi, «Ikki son yigʻindisi» birinchi sahifada turmaydi. «Tozalash» hamma filtrni (standartini ham) olib tashlaydi — bola 71 ta masalaning hammasini koʻradi. Tanlov (daraja, mavzu, qiyinlik, holati) brauzerda saqlanadi (`masalalar:filtr:v1`), shuning uchun «Tozalash» dan keyin standart filtr qaytib kelmaydi. «Qiyinlik» tanlovida avval chegaralar (500+, 800+, 1000+), keyin aniq reytinglar.

### 2.2. Bitta masala
Masala kartasi (sarlavha, qiyinlik va teglar, shart, kirish/chiqish formati, namunaviy kirish/chiqish, manba havolasi) → kod maydoni → **▶︎ Tekshirish**.

Natija paneli:
- `8 ta testdan 3 tasi oʻtdi — 38%` va rangli chiziq;
- har test raqami bilan: `✓ 1-test`, `✗ 2-test` …;
- ochiq yiqilgan testlar (namuna va birinchi 2 ta yashirin test): **Kirish / Kutilgan / Sendan** (yoki xato xabari va izohi); juda uzun kirish (1000 ta son) qisqartirib koʻrsatiladi;
- **Yopiq testlar** qutisi: `✗ 5-test — javob notoʻgʻri`, `✗ 8-test — juda sekin` — kirish va javob koʻrsatilmaydi, «chekka holatlarni oʻzing oʻylab koʻr» degan yoʻl-yoʻriq bilan;
- qadam chegarasiga urilgan testda (`qadam` bor masala): «Bu masalada tezlik ham sinaladi… tezroq usul kerak» — bola «javobim notoʻgʻri» deb emas, «usulim sekin» deb tushunadi;
- ikkinchi urinishdan keyin — maslahat.

## 3. Kod tuzilishi

```
oyinlar/masalalar/
├── js/bank.js      71 ta masala, 5 daraja (qo'lda yozilgan): Oson 9, O'rta 12, Qiyin 15,
│                   Codeforces 15 (reyting 800–1200), Olimpiada 20 (reyting 700–1400);
│                   27 tasi Codeforces g'oyasi asosida, 9 tasi "kombinatorika" tegi bilan;
│                   6 tasida `qadam: 200000` (samaradorlik sinovi)
├── js/royxat.js    qidiruv, filtr (standart "Qiyinlik: 500+"), sahifalash, vazifaga aylantirish (sof mantiq)
├── js/baho.js      har testni alohida bajarish, foiz, ochiq/yopiq testlar, hukm (sof mantiq)
├── js/holat.js     eng yaxshi foiz, yechilganlar, ochilgan testlar, filtr tanlovi (brauzer xotirasi)
├── js/ekran.js     ro'yxat va masala ekrani
├── js/main.js      sahifani ishga tushirish, ovoz tugmasi, #masala= havolasi
└── tests/          bank.test.js (har yechim hamma testdan o'tadi; samarasiz yechim yiqiladi),
                    royxat.test.js, baho.test.js, holat.test.js, cpp-yechim.test.js, cpp-gpp.test.js
```

## 4. Qoladi

- Masalaga **animatsiya** (muallif talabi): har masala uchun alohida kelishiladi, bank formatida `animatsiya` maydoni tayyor turibdi.
- Bankka masala qoʻshish: `js/bank.js` ga yangi yozuv — test uni oʻzi tekshiradi (kamida 6 ta yashirin test, javoblari xilma-xil; samaradorlik sinalsa — `qadam` va `bank.test.js` dagi `SAMARASIZ` ga sekin yechim).
- Olimpiada darajasidagi 20 masaladan 5 tasining (qadam chegarasi borlari) C++ yechimi `tests/cpp-yechimlar.js` da bor; qolgan 15 tasi C++ da test bilan tasdiqlanmagan (ixtiyoriy edi). `kvadrat-ildiz` da C++ bolasi oʻng chegarani 10⁹ dan boshlashi kerak — n ning oʻzidan boshlasa, `orta * orta` `long long` dan toshib ketadi.

## Ikki til: Python va C++ (2026-10-02)

Masala matni va kutilgan javob bitta: javob **bankdagi namunali Python yechimidan** hisoblanadi.
Shuning uchun C++ ni qoʻshish uchun har masalaga ikkinchi yechim yozish shart boʻlmadi —
faqat bolaning kodi qaysi dvigatelda ishlashi tanlanadi:

- muharrir ustida **Til: Python | C++** tugmalari (tanlov brauzerda saqlanadi);
- C++ tanlansa, kod `QK.cpp.run` yadrosida ishlaydi (`oyinlar/umumiy/js/cpp/`), xatolar
  kompilyator uslubida koʻrsatiladi;
- qoralama har til uchun alohida saqlanadi (`masala:<id>` va `masala:<id>:cpp`).

**Tekshiruv:** `tests/cpp-yechimlar.js` da 30 ta masalaning C++ yechimi bor (24 + qadam chegarasi bor 6 masala, 2026-10-02). Ular ikki marta
sinaladi: yadroda (`cpp-yechim.test.js`) va **haqiqiy g++ da** (`cpp-gpp.test.js`) — ikkalasida ham
bank testlaridan toʻliq oʻtishi shart. Shu bilan «C++ da ham yechsa boʻladimi?» degan savol
taxminga qoldirilmaydi.

**Yadroda yoʻq narsalar** (`vector`, `map`, funksiya) masalani yechishga halal bermaydi:
30 ta yechim massiv, `sort`, `while (cin >> x)` va `string` bilan yozilgan.

## Masalalar sifati: «oʻta oson» muammosi (2026-10-02)

**Muammo.** Bank 8–12 yosh uslubida yozilgan edi: 51 masaladan 47 tasi 1000 reytingdan past, deyarli har biri bitta formula yoki bitta sikl; samaradorlik hech qaerda sinalmasdi; 4–5 ta yashirin testning javobi urinish sayin bittadan ochilardi. 12–16 yoshli, Python blokini oʻtgan bola uchun bu — zerikarli.

**Nima oʻzgardi.**

1. **51 → 71 masala, beshinchi daraja «Olimpiada»** (`bank.OLIMPIADA`, reyting 700–1400: 700 — 1, 800 — 4, 900 — 5, 1000 — 5, 1100 — 3, 1200 — 1, 1400 — 1). Har masala ikki gʻoyani birlashtiradi: saralash + ochkoʻz, toʻplanuvchi yigʻindi, ikkilik izlash javob ustida, simulyatsiya. 12 tasi Codeforces gʻoyasi asosida (`manba` bilan), 8 tasi asl. CF darajasidagidek narvon: `tartib` 1–20, reyting kamaymaydi. Endi bankda 1000+ reytingli 13 ta, 800+ reytingli 34 ta masala bor.
2. **`qadam` — masalaga xos qadam chegarasi (samaradorlik sinovi).** Umumiy chegara 3 000 000 qadam (`umumiy/js/kod.js`) — unda O(n²) yechim ham oʻtib ketadi. Masalaga `qadam: 200000` yozilsa, `royxat.vazifa()` uni vazifaga uzatadi va `baho.js` har testni shu chegara bilan bajaradi (Python va C++ da bir xil). Katta test (n = 1000, 100–200 soʻrov; 10¹², 10¹⁸) samarasiz yechimni yiqitadi, toʻgʻri usul esa bemalol sigʻadi (eng ogʻiri ≈ 16 000 qadam). Hozir 6 ta masalada: `oraliq-sorovlar`, `ichimlik`, `balans-nuqtasi`, `kvadrat-ildiz`, `juft-toq-orin`, `cf-qurtlar`. `bank.test.js` har biri uchun **toʻgʻri, lekin sekin** yechimni ishga tushiradi: u kichik testlardan oʻtishi, katta testda esa aynan qadam chegarasiga urilishi shart. Chegara C++ da ham adolatli: oltitasining samarali C++ yechimi yadroda (eng koʻpi 66 400 qadam) va haqiqiy g++ da hamma testdan oʻtadi (`cpp-yechim.test.js`, `cpp-gpp.test.js`).
3. **Mavjud masalalar haqiqiylashtirildi:**
   - `tanga-gerb` — `jamoa-soni` ning dublikati edi («aynan k») → **«kamida k marta gerb»** (C(n, i) lar yigʻindisi), reyting 800 → 700;
   - `ikkilik-izlash` — faqat «bor/yoʻq» chiqarardi, `x in a` oʻtardi → endi **qaralgan oʻrta oʻrinlar** ham chiqariladi (faqat ikkilik izlash toʻgʻri javob beradi), 650 → 700;
   - `k-kichik` — `sorted(a)[k - 1]` bir satr edi → **«k-eng kichik har xil son»** (takrorlar bir marta, yetmasa −1), reyting 600 qoldi; C++ yechimi ham yangilandi;
   - maslahatlar yechimning oʻzini aytmaydi: `kaptarxona` (formula olib tashlandi), `unlilar`, `ekub` («Evklid» nomi oʻrniga gʻoya), `tubmi`;
   - reytinglar: `cf-qurtlar` 1100 → 1200 (CF API) + katta test va `qadam`; `cf-maydon` 1000 → 900 (CF dagi 64-bit tuzogʻi Pythonda yoʻq); `parol-soni` 700 → 500; `faktorial` 450 → 300 (kirish chegarasi n ≤ 20 yozildi — C++ da `long long` ga sigʻadi); `boluvchilar` 400 → 300.
4. **Testlar: 213 → 524 ta yashirin test** (eski 51 masalada 213 → 366; yangi 20 tasida 158). Har masalada **kamida 6 ta** (`bank.test.js` chegarasi 4 → 6). Chekka holatlar qoʻshildi: manfiy sonlar, nol, bitta element, teng qiymatlar, chegaradagi qiymat (25 va 49 — `d * d < n` deb yozgan yiqiladi; `abcab` — faqat chekkalarini solishtirgan yiqiladi), katta sonlar. Yangi sinov — **javoblar xilma-xilligi**: yashirin testlarda kamida 3 xil javob (ha/yoʻq masalalarida har javob kamida 2 marta) va bitta javob testlarning 70% idan koʻpida uchramaydi. Shu sinov `jamoa-soni` da 8 testdan 6 tasining javobi «1» ekanini topdi — testlar almashtirildi.
5. **Javobni qotirishga qarshi** — 1.3-band: faqat birinchi yiqilgan 2 ta yashirin testning kirishi/javobi ochiladi va bu eslab qolinadi; qolganlari yopiq, faqat hukm bilan.
6. **Roʻyxat** — 2.1-band: standart filtr «Qiyinlik: 500+», tanlov saqlanadi, qatorda daraja belgisi.

**Men qabul qilgan qarorlar.**

- **«Birinchi 2 ta yiqilgan test» — har urinishda emas, masala boʻyicha.** Har urinishda yangi ikkitasi ochilsa, 6 ta testni 3 urinishda yozib chiqish mumkin boʻlardi — maqsad (javobni qotirishni yopish) bajarilmasdi. Shuning uchun ochilgan raqamlar `holat.js` da saqlanadi. Brauzer xotirasi ishlamasa (maxfiy rejim) — sahifa yopilguncha xotirada turadi.
- **Namuna (1-test) hisobga kirmaydi** — u shartda yozilgan, uni ochish hech narsani oshkor qilmaydi.
- **Yopiq testda hukm aytiladi** («javob notoʻgʻri» / «xato berdi» / «juda sekin»): javobni bermaydi, lekin bola nimani tuzatishni biladi. Samaradorlik masalalarida busiz «nega yiqildi» tushunarsiz qolardi.
- **Yopiq va oʻtgan testlarning maʼlumoti `baho()` natijasida umuman yoʻq** (`kirish/kutilgan/chiqqan = null`) — ekran xato qilib koʻrsatib yubora olmaydi. (Bank fayli brauzerda ochiq, buni yashirib boʻlmaydi — himoya «tasodifan/osonlik bilan» qotirishga qarshi.)
- **«Tozalash» standart filtrga emas, boʻsh filtrga qaytaradi** va bu saqlanadi: bola bir marta «hammasini koʻraman» desa, har kirganda qayta bosishi shart emas.
- **`faktorial` ga 25! testi qoʻshilmadi** (hisobotda taklif qilingan edi): masala C++ da ham yechiladi, 25! `long long` ga sigʻmaydi. Oʻrniga n ≤ 20 chegarasi shartga yozildi.
- **`yigindi` ga 10¹² li test qoʻshilmadi**: eng birinchi masalada C++ bolasini `int` toshishiga urdirish — erta; bu 55-oʻyin mavzusi.
- **`ekub` ga `1000000 ⏎ 999999` testi qoʻshildi, lekin `qadam` qoʻyilmadi**: birma-bir sinab chiqadigan yechim 2 000 000 qadam bilan umumiy chegaraga sigʻadi. Qattiq sinov kerak boʻlsa — `qadam: 200000` qoʻshish kifoya (maslahat allaqachon shunga ishora qiladi).
- **Yangi masalalardagi `javoblar` maydoni bankka koʻchirilmadi** — kutilgan javob namunali yechimdan hisoblanadi, ikkinchi nusxa eskirib qolardi.

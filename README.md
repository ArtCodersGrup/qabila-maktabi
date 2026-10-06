# Qabila maktabi

**Sayt: https://kelajagim.uz** — oʻz serverimizda (nginx + FastAPI). Saytga chiqarish: hammasini commit qilib, `bash server/deploy/deploy.sh` (batafsil: `server/README.md`).

Maktab oʻquvchilariga informatika, kodlash va sunʼiy intellekt qanday ishlashini **2D oʻyinlar orqali koʻrsatuvchi** sayt. Uch toifa: **1–4-sinf** (kompyuter bilan tanishuv), **5–8-sinf** (informatika), **9–11-sinf** (olimpiada dasturlash) — oʻquvchi sinfini tanlaydi va xohlagan toifasiga oʻta oladi. Hammasi oʻzbek tilida (lotin yozuvi).

Har bir oʻyin bitta mavzuni oʻrgatadi: bola avval oʻzi qiladi, keyin oʻyin unga nom beradi, oxirida tasodifiy mashqlar beriladi: bosqichga qarab 4–6 ta toʻgʻri javob, misollar javob sari qiyinlashadi. Xatosiz oʻtgan bosqich — ★★★; hamma bosqich tugagach **qiyin rejim 🔥** ochiladi (7 ta javob, bitta urinish).

## Ochish

**Kompyuterda:** `index.html` ni ikki marta bosing — tamom. Oʻrnatish, server va internet kerak emas (rasm, shrift, ovoz va saqlangan progress — hammasi `file://` da ishlaydi).

**Telefonda (onlayn):** yuqoridagi havolani oching. Brauzer menyusidan **«Ekranga qoʻshish»** ni tanlasangiz, ilova kabi oʻrnatiladi va keyin **internetsiz ham** ishlaydi.

**Telefonda (internetsiz, uy tarmogʻida):** `sayt-ishga-tushir.command` faylini ikki marta bosing — u mahalliy serverni yoqadi va havolani koʻrsatadi (masalan `http://192.168.1.103:8777/`). Telefon kompyuter bilan bir xil Wi-Fi'da boʻlsin. Toʻxtatish: oynada Control + C.

Eslatma: progress brauzer xotirasida saqlanadi va `file://` bilan `http://localhost` alohida hisoblanadi — bitta usulni tanlab ishlatgan maʼqul.

## Oʻyinlar

Tartib — bosh sahifadagidek: osondan qiyinga, oldingi oʻyinga tayanadiganlari keyin. Kartadagi raqam bu yerda yozilmaydi: u oʻquvchi tanlagan **toifaga** qarab oʻzgaradi (papka raqami esa hech qachon oʻzgarmaydi). «Sinf» ustuni — oʻyin qaysi toifada koʻrinishi; har oʻyin faqat bitta toifada, asbob va musobaqalar bir nechtasida. 💻 — klaviatura kerak.

| Oʻyin | Papka | Sinf | Mavzu |
|---|---|---|---|
| **Kompyuter bilan tanishuv** | | | |
| Kompyuter qismlari | `66-kompyuter-qismlari` | 1–4 | Toʻqqizta qism nomi va vazifasi; kiritish va chiqarish qurilmalari; toʻgʻri oʻchirish va ehtiyot qoidalari |
| Chaqqon sichqoncha | `67-chaqqon-sichqoncha` | 1–4 💻 | Sichqoncha: bosish, ikki marta bosish, oʻng tugma menyusi, sudrab olib borish |
| Ekran va oynalar | `68-ekran-va-oynalar` | 1–4 | Oʻyinchoq kompyuter: ish stoli, belgilar, oynani yopish / kichraytirish / yoyish, «Pusk» menyusi |
| Fayl va papka | `69-fayl-va-papka` | 1–4 | Fayl turi va yoʻli, papkaga tartiblash, nusxa va kesish, oʻchirish va savat |
| Kichik rassom | `70-kichik-rassom` | 1–4 | Katakli Paint: qalam, shakllar, chelak; namunani (uy, daraxt…) qadam-qadam chizish; galereya va PNG; Ctrl+Z / Ctrl+S |
| **Klaviatura** | | | |
| Oʻn barmoq | `23-on-barmoq` | 1–4 💻 | Klaviaturaga qaramay yozish: asosiy, yuqori va pastki qator, katta harf, aniqlik va tezlik |
| Tezkor tugmalar | `46-tezkor-tugmalar` | 1–4 💻 | Ctrl + C, V, X, Z; Home/End, Backspace ↔ Delete; haqiqiy matn ustida mashq |
| **Algoritm va dasturlash** | | | |
| Robot yoʻli | `26-robot-yoli` | 1–4 | Robotga buyruq berish: algoritm, tartibning ahamiyati, dasturni oʻqish va izdan tiklash |
| Robot aqlli boʻldi | `47-robot-aqlli` | 1–4 | Takror va agar bloklari: bitta dastur ikki xil maydonda ishlaydi |
| Xato ovi | `53-xato-ovi` | 1–4 | Tayyor dasturdagi xatoni topish va tuzatish; ortiqcha qadamlarni qisqartirish |
| Oʻz buyrugʻim | `62-oz-buyrugim` | 1–4 | Funksiya: ★ buyrugʻini yasash va chaqirish; tor yoʻlda takrorlanadigan naqsh |
| Toʻsiqqacha | `63-tosiqqacha` | 1–4 | While: «boʻsh ekan takrorla» va «gulxanga yetguncha» — uzunlik oldindan nomaʼlum |
| Robot sanaydi | `64-robot-sanaydi` | 1–4 | Oʻzgaruvchi: qadam = 0, qadam + 1, takror qadam marta |
| Bloklardan Pythonga | `65-blokdan-pythonga` | 5–8 | Bloklar ↔ Python: oʻqish, bosib tuzatish, tarjima qilish |
| **Python: dasturlash** | | | |
| Birinchi buyruq | `27-birinchi-buyruq` | 5–8 💻 | print: birinchi kod, qoʻshtirnoq ichi va tashqarisi, xato xabarini oʻqish |
| Sonlar ustaxonasi | `28-sonlar-ustaxonasi` | 5–8 💻 | `//` va `%` (nechtadan tegdi, nechtasi ortdi), `/` doim kasr, amallar tartibi, daraja |
| Nomli qutilar | `29-nomli-qutilar` | 5–8 💻 | Oʻzgaruvchi, `x = x + 1`, kuzatuv jadvali, almashtirish, `input()` va turlar |
| Ikki yoʻl | `30-ikki-yol` | 5–8 💻 | Shart: `if / elif / else`, otstup bloki, `and` `or` `not`, `=` va `==` farqi |
| Takror charxi | `31-takror-charxi` | 5–8 💻 | `while`, hisoblagich va cheksiz sikl, yigʻindi va `break`, raqamlarni ajratish (`% 10`, `// 10`) |
| Sanoqli takror | `32-sanoqli-takror` | 5–8 💻 | `for` va `range`, chegaralar (oxiri kirmaydi), manfiy qadam, ichma-ich sikl va naqsh |
| Roʻyxat va satr | `33-royxat-va-satr` | 5–8 💻 | Roʻyxat: indeks 0 dan, `len`, `append`, kesish; satr boʻylab yurish, `input().split()` |
| Funksiya ustaxonasi | `34-funksiya-ustaxonasi` | 5–8 💻 | `def`, parametr, `return` va `print` farqi, lokal oʻzgaruvchi, masalani boʻlaklash |
| Tank jangi | `49-tank` | 5–8 💻 | Tankni Python buyruqlari bilan boshqarish: `move`, `left`, `scan`, `radar`, `fire`; robot tanklarga qarshi jang |
| **Algoritmlar va samaradorlik** | | | |
| Algoritm va xossalari | `36-algoritm-xossalari` | 5–8 💻 | Algoritmning beshta xossasi; bir masalaning ikki yechimi va qadamlar sonini oʻlchash |
| Blok-sxema | `37-blok-sxema` | 5–8 💻 | Algoritmni chizish: belgilar, sxemani bosib yigʻish va undan Python kodi, sxemani oʻqish |
| Izlash | `38-izlash` | 9–11 💻 | Chiziqli va ikkilik izlash: “son oʻyladim” oʻyini, qadamlar jadvali, ikkala usulni yozish |
| Saralash | `39-saralash` | 9–11 💻 | Pufakcha va tanlash saralashi: ustunlar koʻz oldida almashadi, qadamlar 4 barobar oʻsadi |
| Qadamlar soni | `40-qadamlar-soni` | 9–11 💻 | Oʻlchovga nom beramiz: `O(1)`, `O(log n)`, `O(n)`, `O(n²)`; katta n da qaysi usul yaraydi |
| **Kombinatorika** | | | |
| Tanlov daraxti | `41-tanlov-daraxti` | 9–11 💻 | Koʻpaytirish va qoʻshish qoidasi: daraxt, VA → ×, YOKI → +, sikl bilan sanash |
| Qatorga terish | `42-qatorga-terish` | 9–11 💻 | Faktorial `n!` va `A(n,k)`: tartib muhim; 23! ni dastur aniq hisoblaydi |
| Jamoa tanlash | `43-jamoa-tanlash` | 9–11 💻 | `C(n,k)`: bir xil jamoa `k!` marta takrorlanadi; tartib muhimmi degan savol |
| Paskal uchburchagi | `44-paskal-uchburchagi` | 9–11 💻 | `C(n,k)` ni faqat qoʻshish bilan; simmetriya, qator yigʻindisi `2ⁿ`, juftliklar diagonali |
| Kaptarxona | `45-kaptarxona` | 9–11 💻 | Dirixle printsipi: `n ÷ k` kafolati, eng yomon holat, nega isbot kerak |
| **Internet qanday ishlaydi** | | | |
| Xabar boʻlaklari | `58-xabar-bolaklari` | 5–8 | Xat raqamlangan konvertlarga (paketlarga) boʻlinadi, aralash keladi, yoʻqolgani qayta soʻraladi |
| Qabila manzillari | `59-qabila-manzillari` | 5–8 | IP manzil (toʻrtta 0–255), DNS daftarlari, kesh va eskirgan javob |
| Paket yoʻli | `60-paket-yoli` | 5–8 | Tugundan tugunga: eng qisqa yoʻl, uzilgan sim, mijoz va server, navbat |
| Qulfli yoʻl | `61-qulfli-yol` | 5–8 | Qulf (HTTPS) nimani himoyalaydi; qulfli firibgar saytni manzildan tanish |
| **Parol va xavfsizlik** | | | |
| Parol kuchi | `50-parol-kuchi` | 5–8 | Nechta variant bor (`aⁱ`), kompyuter qancha vaqtda topadi, nega uzunlik murakkablikdan kuchli |
| Bir tomonlama qulf | `51-bir-tomonlama-qulf` | 5–8 | Sayt parolni emas, uning izini (xesh) saqlaydi; toʻqnashuv va tuz |
| Firibgar xat | `52-firibgar-xat` | 5–8 | Soxta xatning belgilari va manzil qoidasi: zonadan oldingi nom |
| C++: birinchi dastur | `54-cpp-birinchi-dastur` | 9–11 | Olimpiada tili: qolip, `cout`/`cin`, kompilyatsiya va Python bilan farqi |
| C++: tur va chegara | `55-cpp-tur-chegara` | 9–11 | `int` toshib ketadi, `long long` sigʻdiradi; butun boʻlish tuzogʻi |
| C++: qavs va takror | `56-cpp-qavs-takror` | 9–11 | Blokni `{ }` yasaydi; `=` va `==`; `for` ning uch qismi |
| C++: massiv va saralash | `57-cpp-massiv-saralash` | 9–11 | Massiv va satr — yoziladi; `vector` va `sort` — oʻqiladi |
| C++ shpargalkasi | `cpp-shpargalka` | 9–11 | Bitta sahifalik qoʻllanma: qolip, Python bilan farqlar, tuzoqlar |
| **Kodlash va shifrlash** | | | |
| Qabila kodlari | `01-qabila-kodlari` | 5–8 | Nechta belgidan nechta soʻz yasaladi (aⁱ, yigʻindi, teskari masala) |
| Qabila Morzesi | `02-qabila-morzesi` | 1–4 | Morze alifbosi: nuqta va chiziq bilan oʻqish va yozish |
| Sezar maktubi | `03-sezar-maktubi` | 5–8 | Sezar shifri: harflarni surish, kalit, kalitsiz ochish |
| **Sonlar va ikkilik kod** | | | |
| Qabila chiroqlari | `04-qabila-chiroqlari` | 5–8 | Ikkilik kod: 2ⁿ naqsh, bit va bayt, rangli chiroqlar |
| Rim toshi | `05-rim-toshi` | 5–8 | Rim raqamlari, Rimliklar usulida hisob, pozitsion tizim, al-Xorazmiy |
| Qabila choʻti | `17-qabila-choti` | 5–8 | Sanoq tizimi nima: asos, raqamlar 0 … n−1 va A–F, 101₂ yozuvi, xona qiymatlari |
| Tangalar bozori | `18-tangalar-bozori` | 5–8 | Istalgan tizimdan oʻnlikka: raqam × xona qiymati |
| Qoplarga joylash | `19-qoplarga-joylash` | 5–8 | Oʻnlikdan istalgan tizimga: kattadan boshlab, boʻlib-boʻlib, tekshirish |
| Ikkilik hisobchi | `20-ikkilik-hisobchi` | 5–8 | Ikkilikda qoʻshish, ayirish (qarz), koʻpaytirish (surish) |
| Oʻn oltilik ranglar | `21-on-oltilik-ranglar` | 5–8 | A–F, 2 ↔ 16, rang kodlari, 16-likda amallar |
| Sayyoralar sanogʻi | `22-sayyoralar-sanogi` | 5–8 | n-lik tizimda amallar, "qaysi tizimda 3 + 4 = 10?", Bobil va Mayya |
| **Axborot oʻlchovi** | | | |
| Bayt sandigʻi | `13-bayt-sandigi` | 5–8 | Nega 8 bit = 1 bayt, matn hajmi (1 belgi = 1 bayt), 1 Kbayt = 1024 bayt |
| Piksel ustaxonasi | `14-piksel-ustaxonasi` | 5–8 | Rasm hajmi: piksel, ranglar va bitlar, rangli piksel 3 bayt, Mbayt, siqish |
| Multfilm daftari | `15-multfilm-daftari` | 5–8 | Video: kadrlar, kadr/soniya, video hajmi, Gbayt, faqat oʻzgargani |
| Xotira ombori | `16-xotira-ombori` | 5–8 | Bitdan Tbaytgacha zinapoya, solishtirish, nechta sigʻadi, 1 Tbayt = 931 Gbayt |
| **Sunʼiy intellekt: qanday oʻrganadi** | | | |
| Robotni oʻrgatamiz | `06-robotni-orgatamiz` | 5–8 | Mashina misollardan oʻrganadi: eng yaqin misol, chegara chizigʻi, sinov |
| Keyingi soʻz | `07-keyingi-soz` | 5–8 | Til modeli: soʻz juftliklarini sanash, keyingi soʻzni tanlash |
| Sehrli qutilar | `08-sehrli-qutilar` | 5–8 | Mukofot bilan oʻrganish (MENACE) |
| Qoida yoki misol? | `09-qoida-yoki-misol` | 5–8 | Qoida yozilgan dastur va misoldan oʻrganish |
| **Koʻrish, tarmoqlar va xarita** | | | |
| Robot nimani koʻradi? | `10-robot-korishi` | 5–8 | Kompyuter koʻrish: piksellar, shablon, belgi |
| Koʻp qatlamli tarmoq | `11-kop-qatlamli-tarmoq` | 5–8 | Neyron, qatlamlar, chuqur oʻrganish |
| AI xaritasi | `12-ai-xaritasi` | 5–8 | Oddiy dastur ⊃ AI ⊃ ML ⊃ DL; usul va vazifa |
| **Mantiq** | | | |
| Mantiq kalitlari | `24-mantiq-kalitlari` | 5–8 | Rost va yolgʻon, VA (ketma-ket kalitlar), YOKI (parallel), EMAS (teskari kalit), rostlik jadvali, hayotiy qoidalar, Jorj Bul |
| Zinapoya chirogʻi | `25-zinapoya-chirogi` | 5–8 | XOR (faqat bittasi), amallar zanjiri (sxema), yarim qoʻshuvchi: kompyuter qanday qoʻshadi |
| Mantiq kodda | `48-mantiq-kodda` | 5–8 💻 | `True`/`False`, `and` `or` `not`, rostlik jadvalini Python hisoblaydi, shart yozish |

**Musobaqalar** (bosh sahifa tepasida, oʻyin emas — bosqichi yoʻq):

*Bitta ekranda* (internetsiz, ikki oʻyinchi yonma-yon):
- **Savol-javob** (`oyinlar/musobaqa/`): navbat bilan savolga javob berishadi, har raundda birinchi javob beradigan almashadi. Har kimning oʻz soati (shaxmat soatidek), 3 ta yuragi va bitta oʻtkazishi bor; savollar tanlangan mavzu va qiyinlikdan tasodifiy yasaladi.
- **Tank dueli** (`oyinlar/tank-duel/`, 💻): ikki oʻquvchi navbat bilan oʻz tankiga Python buyruqlarini yozadi (`move(50)`, `if scan() > 0: fire()`); maydon simmetrik, gʻolib — raqibning jonini tugatgan.
- **Tez yozish poygasi** (`oyinlar/poyga/`, 💻): navbat bilan bir xil matnni yozishadi; aniqligi 90% dan past boʻlgan yuta olmaydi, keyin — kim tezroq.

*Onlayn* (har kim oʻz qurilmasida, 4 xonali xona kodi bilan):
- **Aloqa sinovi** (`oyinlar/onlayn/`): ikki qurilmani ulab koʻrish.
- **Togʻga chiqish** (`oyinlar/tog/`): oʻqituvchi xona ochadi, 2–12 bola qoʻshiladi. Savolga toʻgʻri javob — bir pogʻona yuqoriga; qolib ketgan chiqib ketadi, choʻqqiga birinchi chiqqan yutadi. Robotlar bilan mashq internetsiz ham ishlaydi.
- **Yozuv poygasi** (`oyinlar/yozuv-poygasi/`, 💻): oʻqituvchi xona ochadi, hamma bir xil matnni yozadi. Yozgan sari qahramon togʻga koʻtariladi; xato tugma oʻtkazmaydi, jarima yoʻq. Oʻyin hamma choʻqqiga chiqquncha davom etadi, oxirida oʻrin, tezlik va aniqlik koʻrsatiladi.

Tugagan bosqichlar brauzer xotirasida (`localStorage`) saqlanadi — sahifa yangilansa ham yoʻqolmaydi.

## Oʻqituvchi uchun test

`oqituvchi/test-yasa.py` — savollar bankidan **chop etiladigan test** yasaydi (A4, javoblar kaliti
va qisqa yechimlar bilan). 10 ta blok, 224 ta savol (python, algoritm va kombinatorikada «xatoni top», «qadamlarni yurgiz» kabi tahlil savollari ham bor); faqat `python3` kerak.

```bash
python3 oqituvchi/test-yasa.py --royxat                    # bloklar va savollar soni
python3 oqituvchi/test-yasa.py --blok python --soni 20     # 20 ta savollik test
python3 oqituvchi/test-yasa.py --variant 2                 # A va B variantlar
```

Batafsil: [`oqituvchi/README.md`](oqituvchi/README.md).

## Papkalar

```
index.html          bosh sahifa: barcha oʻyinlarga kirish
bosh/               bosh sahifa fayllari (uslub, ikonkalar, roʻyxat, test)
oyinlar/umumiy/     umumiy kod: qahramonlar (SVG), ekran qismlari, tovush (Web Audio), shrift
oyinlar/umumiy/js/python/  kichik Python: brauzerda kod ishga tushiradigan talqinchi
oyinlar/NN-nomi/    har bir oʻyin: DIZAYN.md, REJA.md, index.html, js/, css/, tests/
oyinlar/musobaqa/   savol-javob musobaqasi: savollar oʻyinlar mantiqidan yasaladi
oyinlar/poyga/      tez yozish poygasi (yozish qismi 23-on-barmoq dan)
oyinlar/tog/        onlayn musobaqa: togʻga chiqish (oʻqituvchi xona ochadi)
oyinlar/yozuv-poygasi/  onlayn yozuv poygasi (togʻ sahnasi tog/ dan, yozish 23-on-barmoq dan)
QOIDALAR.md         barcha oʻyinlar uchun umumiy qoidalar (toifalar, til, qurilmalar, xato javob, ranglar)
```

## Texnologiya

Oddiy HTML + CSS + JavaScript, grafika — SVG (kod bilan chiziladi). Kutubxona ham, yigʻish (build) ham yoʻq: skriptlar oddiy `<script>` bilan ulanadi. Hisob-kitob mantiqi ekran kodidan alohida faylda turadi va Node testlari bilan tekshiriladi.

Python bloki uchun **kichik Python** yozilgan ([`oyinlar/umumiy/js/python/`](oyinlar/umumiy/js/python/)) — bolaning kodi shu talqinchida bajariladi. Internetsiz ishlaydi, kutubxona emas; bolaning kodi hech qachon `eval` bilan bajarilmaydi. Talqinchi haqiqiy `python3` bilan solishtirib testlanadi.

## Testlar

```bash
node --test bosh/tests/*.test.js                        # bosh sahifa roʻyxati
node --test oyinlar/umumiy/tests/*.test.js              # umumiy kod va kichik Python
cd oyinlar/05-rim-toshi && node --test tests/*.test.js   # bitta oʻyin
```

**Masalalar** (`oyinlar/masalalar/`): bosh sahifada **Mashqlar** qatorida — oʻyin emas, masalalar roʻyxati. Qidiruv, filtr (daraja, mavzu, qiyinlik, holati) va sahifalash (10 tadan). Har masalada qiyinlik (reyting), teglar, koʻrinadigan namuna va yashirin testlar bor. Yechim **har bir testda** tekshiriladi: `6 ta testdan 2 tasi oʻtdi — 33%` va qaysi test yiqilgani koʻrsatiladi; masala faqat 100% da yechilgan hisoblanadi. Masalalarning 10 tasi — **Codeforces** reyting 800 gʻoyalari asosida: shart matni oʻzimizniki, kartada asl masalaga havola bor. **71 ta masala, 5 daraja** (Oson, Oʻrta, Qiyin, Codeforces, **Olimpiada** — reyting 700–1400). Roʻyxat standart holatda 500+ reytingdan boshlanadi. Har masalada kamida 6 ta yashirin test; javob faqat namunada va bola yiqilgan dastlabki 2 ta testda ochiladi. Ayrim masalalarda **tezlik ham sinaladi** (`qadam` maydoni): toʻgʻri, lekin sekin yechim katta testda yiqiladi.

Kichik Pythonning testlari orasida `python3` bilan solishtirish ham bor: korpusdagi dasturlar va tasodifiy yasalgan dasturlar ikkalasida bajarilib, chiqishi belgi-belgi tekshiriladi. `python3` topilmasa, shu ikki test oʻtkazib yuboriladi.

## Yangi oʻyin qoʻshish

1. [`QOIDALAR.md`](QOIDALAR.md) ni oʻqing — matn, oʻlcham, xato javob va rang qoidalari shu yerda.
2. `oyinlar/NN-oyin-nomi/` papkasini oching: `DIZAYN.md` → `REJA.md` → kod → testlar.
3. Oʻyinni [`bosh/js/bosh.js`](bosh/js/bosh.js) dagi `GAMES` roʻyxatiga qoʻshing (`bosh/tests/bosh.test.js` buni tekshiradi).
4. Fayllarni [`sw.js`](sw.js) roʻyxatiga qoʻshing va `VERSION` ni oshiring (`bosh/tests/offline.test.js` tekshiradi).
5. Oʻyinga `toifa` qoʻying (`boshlangich`, `orta` yoki `yuqori` — har oʻyin faqat bitta toifada) va `node bosh/tools/toifa-yoz.js` ni ishga tushiring: u sahifaga `data-toifa` ni yozadi. Boshqa oʻyinga havola **nom bilan** yoziladi («Izlash» oʻyinida koʻrgan eding), raqam bilan emas.

# C++ bloki — reja

**Holat (2026-10-02):** muallif **3-yoʻlni (aralash)** tanladi. Blok yozilishga tushdi.

| Savol | Qaror |
|---|---|
| Qaysi yoʻl | **3 — aralash**: kichik ishlaydigan yadro + qolgani oʻqish (muallif, 2026-10-02) |
| Tartib | 1-qadam (oʻqish qismi) tayyor boʻlishi bilan saytga chiqadi; yadro keyin qoʻshiladi |
| Oʻyinlar | 4 ta, yoshi **12–16** (Python bloki bilan bir xil), hammasida 💻 |
| Masalalar banki | mavjud bankka C++ yechimi qoʻshiladi, yangi bank yasalmaydi |

**Yozilgani:** 54 «C++: birinchi dastur» (mavzular 1–2) — oʻqish qismi, `g++` bilan tekshiriladigan
misollar. Umumiy qatlam: `js/cpp.js`, `js/cpp-ui.js`, `css/cpp.css`, `tests/cpp-parity.test.js`.

**Muallif talabi (2026-10-01):** *«Python bor, C++ yoʻq. Shunga ham boʻlib oʻrgatilishi kerak — kamroq oʻyin,
koʻproq amaliyot va nazariya, shu bilan birga olimpiadaga tayyorlashni boshlash.»*
Muallif qarori: **avval reja, keyin talqinchi yoziladimi — hal qilinadi.**

Bogʻliq hujjatlar: [`PYTHON-BLOK.md`](PYTHON-BLOK.md) (27–34, 49), [`PYTHON-DVIGATEL.md`](PYTHON-DVIGATEL.md),
[`ALGORITM-BLOK.md`](ALGORITM-BLOK.md) (36–40), [`KOMBINATORIKA-BLOK.md`](KOMBINATORIKA-BLOK.md) (41–45).
Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

---

## 1. Nega C++

Olimpiadada vaqt chegarasi bor: odatda **1–2 soniya**. Python shu chegaraga `n ≈ 10⁵` da yetib boradi,
C++ esa `n ≈ 10⁷` da ham yetib boradi. Yaʼni bola toʻgʻri algoritm yozsa ham, Pythonda **vaqt tugab**
ball olmasligi mumkin. Bu — tilni almashtirishning asosiy sababi.

Qolgan sabablar:

| Sabab | Nima demoqchi |
|---|---|
| **Tezlik** | kod oldin kompilyatsiya qilinadi (mashina kodiga aylanadi), keyin ishlaydi — har satr qaytadan tahlil qilinmaydi |
| **STL** | `vector`, `sort`, `map`, `set` tayyor va tez — qoʻlda yozish kerak emas |
| **Olimpiada muhiti** | respublika va xalqaro bosqichlarda C++ asosiy til; tekshiruvchi tizimlar uni albatta qabul qiladi |
| **Tur chegarasi dars boʻladi** | Pythonda butun son cheksiz (`2 ** 100` ishlaydi). C++ da `int` toshib ketadi — bu olimpiadada **eng koʻp uchraydigan xato**, bola buni koʻrishi kerak |

### Pythondan farqi (shu jadval blokning asosiy qurolidir)

| Narsa | Python | C++ |
|---|---|---|
| Ishga tushishi | yozdim — ishladi | avval kompilyatsiya; xato boʻlsa **umuman ishlamaydi** |
| Oʻzgaruvchi | `x = 5` | `int x = 5;` — tur **oldin** aytiladi |
| Satr oxiri | hech narsa | `;` majburiy |
| Blok | otstup | `{ }` (otstup faqat koʻzga chiroyli) |
| Chiqish | `print(x)` | `cout << x << "\n";` |
| Kirish | `x = int(input())` | `cin >> x;` — tur allaqachon maʼlum |
| Butun son | cheksiz | `int` ≈ ±2·10⁹, `long long` ≈ ±9·10¹⁸ |
| Boʻlish | `7 / 2 = 3.5`, `7 // 2 = 3` | `7 / 2 = 3` (ikkisi ham butun boʻlsa!), `7.0 / 2 = 3.5` |
| Manfiy boʻlish | `-7 // 2 = -4`, `-7 % 3 = 2` | `-7 / 2 = -3`, `-7 % 3 = -1` — **boshqa javob** |
| Roʻyxat | `list` — oʻsadi | `vector` oʻsadi; `int a[100]` — boʻyi qotirilgan |
| Chegaradan chiqish | `IndexError` — toʻxtaydi | **xato bermaydi**, buzuq javob chiqaradi |
| Xato xabari | bizning oʻzbekcha izohimiz | inglizcha, uzun, koʻp satrli |

Oxirgi uch satr — blokning eng qimmatli qismi: Pythonda bola koʻrmagan narsa.

---

## 2. Mavzular (ajratilgan)

| № | Mavzu | Nima oʻrgatiladi | Python blokidagi mosi | Nimasi yangi |
|---|---|---|---|---|
| 1 | **Dastur qolipi va chiqish** | `#include <iostream>`, `int main()`, `return 0;`, `cout <<`, `"\n"` va `endl`, `;` | 27 Birinchi buyruq | kompilyatsiya nima; qolip nega kerak |
| 2 | **Kirish** | `cin >> a >> b;`, n ta sonni siklda oʻqish | 29 Nomli qutilar (`input()`) | tur eʼlonda aytilgani uchun `int()` kerak emas |
| 3 | **Tiplar va `long long`** | `int`, `long long`, `double`, `char`, `bool`; chegaralar; toshib ketish (overflow) | 28 Sonlar ustaxonasi | son cheksiz emas; qachon `long long` olinadi |
| 4 | **Amallar** | `+ − * / %`, butun boʻlish, `++`, `+=`, manfiy sonlarda `/` va `%` | 28 Sonlar ustaxonasi | `/` butun boʻlishi (eng koʻp tuzoq) |
| 5 | **Shart** | `if / else if / else`, `{}`, `&& \|\| !`, `=` va `==` | 30 Ikki yoʻl, 48 Mantiq kodda | otstup emas, qavs blok yasaydi |
| 6 | **Sikl** | `for (int i = 0; i < n; i++)`, `while`, `break`, `continue` | 31 Takror charxi, 32 Sanoqli takror | `for` ning **uch qismi** (boshi, sharti, qadami) |
| 7 | **Massiv** | `int a[100];`, indeks 0 dan, boʻyi oldin eʼlon qilinadi | 33 Roʻyxat va satr | chegaradan chiqish xato bermaydi |
| 8 | **`vector`** | `vector<int> v;`, `push_back`, `size()`, `v[i]` | 33 Roʻyxat va satr (`list`, `append`) | boʻyi oʻsadi, lekin turi bitta |
| 9 | **`string`** | `s[i]`, `s.size()`, `+`, `cin >> s` bitta soʻz oladi | 33 Roʻyxat va satr | satrda bosh-kesish yoʻq, indeks bilan ishlanadi |
| 10 | **Funksiya** | `int eng_katta(int a, int b)`, qaytish turi, `void`, `main` dan oldin eʼlon | 34 Funksiya ustaxonasi | qaytish turi yoziladi va mos boʻlishi shart |
| 11 | **Saralash** | `sort(v.begin(), v.end())`, teskari saralash | 39 Saralash | tayyor va tez: qoʻlda pufakcha yozish kerak emas |
| 12 | **Minimal STL** | `pair` (juftlikni saralash), `map` (nechta marta uchradi) | 43 Jamoa tanlash, 33 | kalit bilan sanash — qoʻlda massiv bilan uzoq |

### Qaysi STL kerak, qaysi biri ortiqcha

| Vosita | Qaror | Sabab |
|---|---|---|
| `vector` | **majburiy** | massiv oʻrniga hamma joyda ishlatiladi |
| `sort` | **majburiy** | birinchi bosqich masalalarining katta qismi saralashdan boshlanadi |
| `string` | **majburiy** | satr masalalari har bosqichda bor |
| `pair` + `sort` | **kerak** | «ball boʻyicha saralab, ismini chiqar» turidagi masala |
| `map` | **kerak, lekin bitta ish uchun** | «nechta marta uchradi»: kalit → son. Boshqa ishlatilishi koʻrsatilmaydi |
| `set` | **chegarada** | faqat «takrorni olib tashlash». `sort` + qoʻshni solishtirish bilan ham boʻladi — birinchi bosqich uchun yetarli |
| `auto`, `for (int x : v)` | **faqat shu koʻrinishda** | qisqartiradi, lekin `auto` ning oʻzi alohida mavzu boʻlib ketmasligi kerak |
| `struct` | **yoʻq** | `pair` yetadi |
| koʻrsatkich (`*`, `&`), `new/delete` | **yoʻq** | birinchi bosqichda kerak emas, blokni ikki barobar kattalashtiradi |
| `class`, OOP, `template` | **yoʻq** | Python blokida ham OOP yoʻq |
| `#include <bits/stdc++.h>`, `cin` tezlashtirish | **faqat eslatma** | oxirgi oʻyinda bir-ikki jumla: «olimpiadada shunday yoziladi» |

---

## 3. Olimpiada uchun minimal toʻplam (maktab olimpiadasi, birinchi bosqich)

Birinchi bosqichda masalalar kichik: `n ≤ 1000`, bitta-ikkita sikl, formulali hisob.
Shuning uchun **kerak boʻlgani**:

| Kerak | Nimaga |
|---|---|
| `cin`/`cout`, n ta sonni oʻqish | har masalaning birinchi satri |
| `int`, `long long` | yigʻindi 2·10⁹ dan oshsa — `long long` |
| `/`, `%` bilan raqamlarni ajratish | «raqamlar yigʻindisi», «teskari oʻgir» |
| `if`, `for`, `while` | hamma joyda |
| massiv yoki `vector` | roʻyxatni saqlash |
| `sort` | «saralab chiqar», «ikkinchi eng katta» |
| `string` boʻylab yurish | «nechta unli harf», «palindrommi» |
| bitta oʻtishda eng katta/kichik/yigʻindi/sanash | masalalarning yarmi shu naqsh |

**Birinchi bosqichda kerak boʻlmaydi** (shu blokka kirmaydi): rekursiya, graf, dinamik dasturlash,
uzun arifmetika, geometriya, ikkilik izlash bilan optimallashtirish. Bular — keyingi blok mavzusi.

Tipik masala ↔ vosita:

| Masala turi | Nimadan yasaladi |
|---|---|
| «n ta sonning yigʻindisi va oʻrtachasi» | `cin`, `for`, `long long`, `double` |
| «eng katta va eng kichigini top» | `for`, solishtirish |
| «sonni teskari oʻgir» | `while`, `% 10`, `/ 10` |
| «n ta sonni saralab chiqar» | `vector`, `sort` |
| «satrda nechta unli harf» | `string`, `for`, `if` |
| «eng koʻp uchragan son» | `map` yoki `sort` + sanash |

---

## 4. Uch yoʻlning solishtirmasi

Mehnat hajmini taxmin qilish uchun mavjud Python infratuzilmasi **oʻlchandi** (2026-10-01, `wc -l`):

| Nima | Fayllar | Satr |
|---|---|---|
| Dvigatel `js/python/` | tokenizer 244, parser 405, values 342, interpreter 361, builtins 217, errors 155, python 92 | **1 816** (66 KB) |
| Dvigatel testlari | 9 ta `python-*.test.js` + `python-corpus.js` | **757** |
| Ekran qatlami | `kod.js` 173, `kod-ui.js` 339, `kod-mashq.js` 146 | **658** |
| Ekran testi | `kod.test.js` | **108** |
| **Jami** | | **3 339** |

Muhim fakt: **ekran qatlami qayta ishlatiladi.** Muharrir, chiqish paneli, qadam-baqadam panel,
beshta masala turi (`ter`, `natija`, `bosh-joy`, `xato-top`, `kod-yoz`) C++ uchun ham ishlaydi —
faqat dvigatel almashadi. Yaʼni yangi ish faqat til qismida.

Ikkinchi fakt: **`g++` mashinada bor** (oʻlchandi: `/usr/bin/g++`, Apple clang 21). Yaʼni Python
uchun ishlatilgan **parity testi** (bir xil kodni `python3` da ham ishga tushirib, chiqishni solishtirish)
C++ da ham mumkin — talqinchi yoki qotirilgan javob rostligini `g++` tasdiqlaydi.

### Yoʻllar

| Yoʻl | Nima ishlaydi | Nima ishlamaydi | Mehnat (taxmin) | Eng katta xatar | Olimpiadaga foydasi |
|---|---|---|---|---|---|
| **1. Toʻliq kichik C++ talqinchi** | bola C++ yozadi, ▶︎ bosadi, chiqish koʻradi; qadam-baqadam panel ishlaydi; `vector`, `sort`, `map` bor | `class`, koʻrsatkich, `template`, kutubxonalarning qolgani; aniqlanmagan xatti-harakat (massivdan chiqish) — **hech qanday emulyatsiya rost boʻlmaydi** | **≈ 3 300 satr** (quyida yoyilgan) | tur tekshiruvi yarim ishlasa, bola yolgʻon natija koʻradi va olimpiadada boshqa javob oladi | eng katta: bola haqiqiy mashq qiladi |
| **2. Kod ishga tushmaydi — faqat oʻqish** | «natijani top», «xatoni top», Python ↔ C++ yonma-yon; chiqishlar qotirilgan va `g++` bilan tekshirilgan | bola oʻz kodini yoza olmaydi, oʻz xatosini koʻrmaydi; «kod-yoz» masalasi yoʻq | **≈ 600 satr** | muallif talabidagi «koʻproq amaliyot» bajarilmaydi — blok nazariyaga aylanadi | kichik: sintaksisni oʻqishni oʻrgatadi, yozishni emas |
| **3. Aralash: juda kichik ishlaydigan yadro + qolgani oʻqish** | `cin`/`cout`, `int`/`long long`, amallar, `if`, `for`/`while`, massiv — **yoziladi va ishlaydi**; `vector`, `sort`, `string`, funksiya, `map` — oʻqiladi va solishtiriladi | yadro tashqarisidagi narsani bola yozsa — ishga tushmaydi, «bu yerda hali yoʻq» xabari chiqadi | **≈ 1 750 satr** | «oʻrgatildi, lekin yozib boʻlmaydi» chegarasi bolani chalgʻitishi mumkin | yaxshi: birinchi bosqich masalalarining katta qismi aynan yadro ichida yechiladi |

### 1-yoʻlning mehnati qanday chiqdi

| Qism | Satr (taxmin) | Nega Pythondan boshqa |
|---|---|---|
| tokenizer | ~200 | otstup yoʻq — **osonroq**; `<<`, `>>`, `++`, `//` izoh qoʻshiladi |
| parser | ~550 | tur eʼloni, `for` ning uch qismi, massiv eʼloni, funksiya prototipi — Pythondan **kattaroq** |
| tiplar | ~400 | `int`/`long long` ni 32 va 64 bitga **qirqish**, butun boʻlish, `double`, `char`, `bool` |
| STL | ~450 | `vector`, `string`, `sort`, `pair`, `map`, `set` |
| interpretator | ~400 | Python naqshi takrorlanadi (generator, qadam-baqadam) |
| xatolar | ~350 | **yangi va qiyin qism:** C++ xatosi ishga tushishdan **oldin** chiqadi — turlar mosligini oʻzimiz tekshiramiz |
| interfeys | ~80 | `QK.cpp.run` / `QK.cpp.trace` |
| testlar | ~900 | `g++` bilan parity + fuzz + xato turlari |
| **jami** | **≈ 3 300** | |

3-yoʻl shu jadvalning qisqargani: tokenizer 180, parser 300, tiplar 250, interpretator 280,
xatolar 220, interfeys 60, testlar 450 → **≈ 1 750 satr**. STL qismi butunlay tushadi.

---

## 5. Mening tavsiyam

**3-yoʻl (aralash), lekin ikki qadamda yoziladi.**

| Qadam | Nima qilinadi | Natijasi |
|---|---|---|
| **1-qadam** | Blok talqinchisiz yoziladi: nazariya kartalari, Python ↔ C++ jadvallari, «natijani top», «xatoni top», «bu kod nima chiqaradi» masalalari. Har misolning chiqishi `g++` bilan hisoblanadi va testda qotiriladi | Blok **saytda ishlaydi**, bola oʻqishni oʻrganadi. Bu ish keyin ham yoʻqolmaydi |
| **2-qadam** | Kichik yadro qoʻshiladi (`cin`/`cout`, `int`/`long long`, `if`, `for`/`while`, massiv) va «kod-yoz» masalalari yoqiladi | Bola oʻz kodini yozadi va ishga tushiradi |

Sabablari:

1. **Oraliq natija bor.** 1-qadam tugagach blok ishlaydi; 2-qadam kechiksa ham blok yoʻqolmaydi.
   1-yoʻlda esa 3 300 satr yozilmaguncha ekranda hech narsa boʻlmaydi.
2. **Halollik chegarasi tanlab olinadi.** Eng xatarli narsalar — massivdan chiqish, koʻrsatkich,
   `class` — yadroga kirmaydi, demak **yolgʻon natija yoʻq**. `int` toshib ketishi esa aynan
   yadro ichida va aniq emulyatsiya qilinadi (BigInt + 32/64 bitga qirqish — Python dvigatelida
   BigInt allaqachon ishlatilgan).
3. **Muallif talabiga mos.** «Kamroq oʻyin, koʻproq amaliyot va nazariya»: nazariya 1-qadamda,
   amaliyot 2-qadamda, oʻyin esa 4 ta.
4. **Birinchi bosqich yadro ichida.** §3 dagi tipik masalalarning deyarli hammasi `vector` siz,
   massiv bilan yoziladi. `sort` — yadroga qoʻshiladigan birinchi nomzod (~120 satr).

Taklif qilinadigan oʻyinlar. **Papka raqamlari hozir berilmaydi:** 51–53 allaqachon band
([`XAVFSIZLIK-BLOK.md`](XAVFSIZLIK-BLOK.md) va ishdagi `53-xato-ovi`), shuning uchun raqam blok
yozilishga tushgan kunda beriladi; kartadagi raqam baribir avtomatik suriladi (QOIDALAR §9).

| Belgi | Oʻyin | Mavzular (§2) | Qaysi qadamda |
|---|---|---|---|
| C1 | **Birinchi dastur** | 1, 2 | 1-qadam (oʻqish) + 2-qadam (yozish) |
| C2 | **Tur va chegara** | 3, 4 | 2-qadam — toshib ketishni **oʻz koʻzi bilan** koʻradi |
| C3 | **Qavs va takror** | 5, 6 | 2-qadam |
| C4 | **Massiv va saralash** | 7, 8, 9, 11 | massiv — yozadi; `vector`/`sort` — oʻqiydi |

Har oʻyinda **sintaksis kartasi** doim ekranda (Python ↔ C++ bitta jadvalda) — «koʻproq nazariya» shu
yerda beriladi. Blok oxirida bitta sahifa: **shpargalka** (bitta ekranga sigʻadigan toʻliq jadval).

**Masalalar banki:** mavjud bank (`oyinlar/masalalar/`, 51 masala) saqlanadi; har masalaga **ikkinchi
namunali yechim** — C++ da — qoʻshiladi va `g++` bilan tekshiriladi. Yangi bank yasalmaydi.

---

## 6. Men koʻrgan xatarlar (ochiq aytaman)

1. **C++ xato xabari bolani qoʻrqitadi.** Bir dona `;` tushib qolsa, kompilyator 15 satr inglizcha
   matn beradi; `vector` xatosida shablon xabari ekranga sigʻmaydi. Qoida: bizning qatlam xabarni
   **oʻzi yasaydi** — satr raqami, koʻrsatgich, bitta oʻzbekcha jumla. Kompilyatorning asl matni
   «toʻliq xabarni koʻrsat» tugmasi ostida yashirin turadi (katta bolaga kerak boʻladi).
2. **Xotira va koʻrsatkich mavzusiga tushib ketish.** `*`, `&`, `new`, stek va uyum — «asl C++» deb
   oʻylash osti. Bu blokni ikki barobar kattalashtiradi, birinchi bosqichda esa **umuman kerak emas**.
   Qaror: kirmaydi. `vector` boʻyi oʻsishini «ichida nima boʻladi» deb tushuntirmaymiz.
3. **Pythonni takrorlashga aylanib qolishi.** «Shu masalani endi C++ da yoz» — bola zerikadi va
   «C++ — bu qavsli Python» deb oʻylaydi. Qoida: har bosqich **Pythonda boʻlmagan** narsa beradi
   (kompilyatsiya, tur chegarasi, butun boʻlish, massiv chegarasi, `{}`). Bir xil joylar jadvalda
   bitta satrda oʻtiladi, mashq berilmaydi.
4. **Talqinchi yarim ishlasa, bola yolgʻon natija koʻradi.** Eng xatarli toʻrt joy: `int` toshib ketishi,
   `7 / 2`, `-7 % 3`, massiv chegarasidan chiqish (C++ da **aniqlanmagan xatti-harakat** — biz nima
   qilsak ham rost boʻlmaydi). Qoida: har bir qoʻllangan narsa `g++` bilan parity testida solishtiriladi;
   rost emulyatsiya qilib boʻlmaydigan narsa **ishga tushirilmaydi**, oʻqish qismiga oʻtadi va alohida
   xabar beradi: *«Bu yerda ishga tushmaydi: massiv chegarasidan chiqish. Haqiqiy C++ da dastur
   xato bermaydi, lekin javob buzuq chiqadi.»*
5. **Ikki tilni aralashtirib yuborish.** Bola C++ da `print` yozadi yoki Pythonda `cout <<`.
   Qoida: ekranda til yorligʻi doim koʻrinadi va aralash kod uchun alohida xabar boʻladi:
   *«Bu Python satri. C++ da shunday yoziladi: `cout << x << "\n";`»*
6. **«Olimpiadaga tayyorlash» bitta blokka sigʻmaydi.** Bu blok faqat **tilni** beradi. Algoritmlar
   36–40 da, sanash 41–45 da, masalalar banki alohida. Rekursiya, graf, DP — **keyingi blok**.
   Shu chegara yozib qoʻyilmasa, blok tugamaydi.

---

## 7. Qaror kutayotgan savollar

| Savol | Mening taklifim |
|---|---|
| **1. Qaysi yoʻl?** 1 (toʻliq talqinchi, ≈3 300 satr), 2 (faqat oʻqish, ≈600), 3 (aralash, ≈1 750) | **3-yoʻl**, ikki qadamda (§5) |
| **2. Tartib:** 1-qadam (oʻqish qismi) tugagach blok saytga chiqadimi, yoki yadro tayyor boʻlmaguncha chiqmaydimi? | **Chiqadi.** Bola oʻqish masalalarini telefonda ham yechadi; yadro keyin qoʻshiladi |
| **3. Yosh va oʻyinlar soni:** 4 ta oʻyin, yoshi 12–16 (Python bilan bir xil) yoki 13–16 (tur va chegara qiyinroq)? | **4 ta oʻyin, 12–16** — shart: Python bloki tugagan boʻlsin (bir xil yosh toifasi, bir xil 💻 belgisi) |
| **4. Masalalar banki:** mavjud 51 masalaga C++ yechimi qoʻshiladimi, yoki C++ uchun alohida kichik bank yasaladimi? | **Mavjud bankka qoʻshiladi** — masala matni bir xil, til tanlanadi; `g++` bilan tekshiriladi |

**Shart (ALGORITM-BLOK naqshi boʻyicha):** blok Python bloki bolalarda sinalgandan keyin boshlanadi —
[`PYTHON-SINOV.md`](PYTHON-SINOV.md). Sinovdagi kamchiliklar bu blokda ham nusxalanmasligi kerak.

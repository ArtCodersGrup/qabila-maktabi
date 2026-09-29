# Python bloki: reja va umumiy qarorlar

Yangi blok — **"Python: dasturlash"**. Bolalar haqiqiy kod yozadi: `print` dan funksiyagacha.
Bu fayl blokning **umumiy** qarorlari va mavzular taqsimi. Har bir oʻyinning oʻz `DIZAYN.md` fayli boʻladi.
Dvigatel (kodni ishga tushiruvchi) alohida hujjatda: [`PYTHON-DVIGATEL.md`](PYTHON-DVIGATEL.md).

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

**Holati:** dizayn yozildi — muallif tasdiqlashini kutmoqda (2026-09-29).

---

## 1. Kelishilgan qarorlar (2026-09-29)

| Savol | Qaror |
|---|---|
| Yosh | **12–16**. Butun sayt 8–12 boʻlib qoladi, blokka `age: "12–16"` belgisi qoʻyiladi |
| Qurilma | **Kompyuter** (💻, `pc: true`). Telefonda ochilsa — ogohlantirish, lekin oʻqish masalalari ishlaydi |
| Til | **Python** (haqiqiy sintaksis, oʻzgartirilmagan) |
| Qamrov | `print` dan **funksiya**gacha. **OOP yoʻq**, `import` yoʻq, `dict`/`tuple`/`set` yoʻq |
| Kod nima bilan ishlaydi | **Kichik Python** — JSda oʻzimiz yozadigan talqinchi (`umumiy/js/python/`). Internetsiz, `file://` da ham ishlaydi |
| Bosh sahifadagi oʻrni | **"Algoritm va dasturlash" blokidan keyin** (yangi boʻlim `python`). Qolgan bloklarning raqamlari 9 taga suriladi |
| 26-oʻyin rejasidagi 27–29 (vizual sikl, shart, xato ovi) | **Keyinga surildi.** Sikl, shart va xato ovi Pythonda oʻrganiladi; 8–12 yosh uchun vizual variantga keyin qaytamiz |

**Nega Pyodide emas** (haqiqiy Python WebAssembly'da, oʻlchab koʻrildi): 13 MB repoda; `index.html` ni ikki marta bosib ochsa **ishlamaydi** (brauzer `file://` dan modul yuklamaydi); cheksiz siklni toʻxtatish uchun COOP/COEP sarlavhalari kerak, GitHub Pages ularni bermaydi. Eng muhimi — u **qorongʻi quti**: kodni ichida bajarib, oxirida natija beradi. Bizga esa **qadam-baqadam** koʻrsatish kerak (hozirgi satr yonadi, oʻzgaruvchilar jadvali toʻladi) — loyihaning butun uslubi shu. Oʻz talqinchimizda bu tabiiy chiqadi.

**Halollik sharti:** talqinchi Pythonning faqat **oʻrgatilgan qismini** biladi. Bola qolganini yozsa, "xato" deyilmaydi:

> Bu saytda hali yoʻq: f-satr (`f"..."`). Haqiqiy Pythonda bu ishlaydi. Bu yerda: `print("javob:", x)`.

Talqinchi yolgʻon gapirmasligi **testlar bilan** kafolatlanadi: har bir misol `python3` da ham bajariladi va natijalar solishtiriladi (batafsil — dvigatel hujjatida).

---

## 2. Blok rejasi: toʻqqiz oʻyin

Har bir oʻyin — 3 bosqich (QOIDALAR §4.5: bosqichda 3 ta toʻgʻri javob).

| № | Oʻyin | Papka | Mavzu |
|---|---|---|---|
| 27 | **Birinchi buyruq** | `27-birinchi-buyruq` | `print`, qoʻshtirnoq, qavs, bir nechta satr, birinchi xato |
| 28 | **Sonlar ustaxonasi** | `28-sonlar-ustaxonasi` | `+ − * /`, `//`, `%`, `**`, amallar tartibi, butun va kasr |
| 29 | **Nomli qutilar** | `29-nomli-qutilar` | oʻzgaruvchi, `+=`, kuzatuv jadvali, `input()`, `int()`, turlar |
| 30 | **Ikki yoʻl** | `30-ikki-yol` | `if / elif / else`, solishtirish, `and or not`, otstup |
| 31 | **Takror charxi** | `31-takror-charxi` | `while`, hisoblagich, yigʻindi, `% 10` va `// 10`, cheksiz sikl |
| 32 | **Sanoqli takror** | `32-sanoqli-takror` | `for`, `range(a, b, q)`, ichma-ich sikl, naqsh |
| 33 | **Roʻyxat va satr** | `33-royxat-va-satr` | `list`, indeks, `len`, `append`, kesish, satr boʻylab yurish |
| 34 | **Funksiya ustaxonasi** | `34-funksiya-ustaxonasi` | `def`, parametr, `return`, lokal oʻzgaruvchi, masalani boʻlaklash |
| 35 | **Masalalar maydoni** | `35-masalalar-maydoni` | olimpiada uslubidagi masala banki: 3 daraja, yashirin testlar |

### 27. Birinchi buyruq
1. **Ter va ishga tushir** — `print("Salom, qabila!")` koʻchiriladi, ▶︎ bosiladi, chiqish koʻrinadi; keyin oʻz ismi. Nom: "Sen buyruq berdi — `print`".
2. **Natijani top** — bir nechta `print`, boʻsh `print()`, `print(2 + 3)` va `print("2 + 3")` farqi, `print("a", "b")` dagi boʻshliq.
3. **Xato ovi va oʻzing yoz** — yopilmagan qavs/qoʻshtirnoq, `Print`, qoʻshtirnoqsiz soʻz (`NameError`); keyin "shu chiqishni beradigan kodni yoz".
*Hikoya:* Python nomi — Guido van Rossum, 1991, "Monty Python"; nega dunyoda eng koʻp oʻrgatiladigan til.

### 28. Sonlar ustaxonasi
1. **Toʻrt amal va ikki yangisi** — `//` (butun boʻlinma) va `%` (qoldiq) qutilar bilan koʻrsatiladi, `**`.
2. **Natijani top** — amallar tartibi, qavs, `/` doim kasr beradi (`4 / 2 → 2.0`), `7 // 2`, tuzoqlar: `-7 // 2` va `-7 % 3`; katta sonlar (`2 ** 20`).
3. **Kod yoz** — berilgan hisobni chiqarish, `print("javob:", x)`, kichik masalalar (soatni daqiqaga, qoldiq bilan tekshirish).
*Bogʻ:* `%` — soat va hafta kuni; ikkilik bloki (`% 2`).

### 29. Nomli qutilar
1. **Quti va nom** — `x = 5`, qayta oʻzlashtirish, `x = x + 1`, `+=`. Shu yerda **qadam-baqadam panel** va **oʻzgaruvchilar jadvali** tanishtiriladi.
2. **Kuzatuv jadvali** — kod berilgan, bola har satrdan keyin qutilarda nima borligini yozadi (olimpiada mashqi); almashtirish: `c = a; a = b; b = c`, keyin Pythonning qisqa yoʻli `a, b = b, a`.
3. **`input()` va turlar** — `input()` **matn** qaytaradi; `int(input())`; `"5" + 5` → `TypeError` va uni tuzatish; kod yoz: ikki sonni oʻqib qoʻshadigan dastur.

### 30. Ikki yoʻl
1. **`if` / `else`** — solishtirish belgilari, **otstup** (4 boʻshliq) nima uchun kerak.
2. **`elif` va mantiq** — `and`, `or`, `not` (Mantiq blokidagi VA/YOKI/EMASga havola), `elif` tartibi muhim; natijani top.
3. **Kod yoz** — juft/toq, uch sondan eng kattasi, oraliqda ekanini tekshirish, ball → baho. Xato ovi: `=` va `==`, otstup xatosi.

### 31. Takror charxi
1. **`while`** — hisoblagich, 1 dan n gacha; **cheksiz sikl** (qadam chegarasi bilan tutiladi) va uni tuzatish.
2. **Yigʻindi va sanoq** — `s = s + i`, qadam-baqadam kuzatish, `break`.
3. **Raqamlarni ajratish** — `n % 10` va `n // 10`: raqamlar yigʻindisi, raqamlar soni, sonni teskari oʻgirish. Kod yoz.

### 32. Sanoqli takror
1. **`for i in range(n)`** — `range(a, b)`, `range(a, b, q)`; `while` bilan solishtirish.
2. **Natijani top** — nechta marta aylandi, oxirgi qiymat, `range(1, 5)` tuzogʻi; satr boʻylab `for harf in soz`.
3. **Ichma-ich sikl va naqsh** — `"*" * n`, koʻpaytirish jadvali, uchburchak naqsh; kod yoz.

### 33. Roʻyxat va satr
1. **Roʻyxat** — `[…]`, indeks **0 dan**, `len`, `append`, elementni oʻzgartirish, manfiy indeks.
2. **Boʻylab yurish** — `for x in a`, `sum/max/min`, eng kattasini **oʻzi** sikl bilan topish, sanash; kesish `a[1:4]`, `soz[0]`, `soz[-1]`.
3. **Kod yoz** — `input().split()` bilan sonlarni oʻqish, eng katta/kichik, teskari, nechta juft, satrda nechta unli harf.

### 34. Funksiya ustaxonasi
1. **`def` va chaqirish** — parametrsiz, keyin parametrli; **`return` va `print` farqi** (asosiy tuzoq).
2. **Natijani top** — `return` dan keyingi kod bajarilmaydi; ikki parametr; funksiya ichidagi oʻzgaruvchi tashqarida yoʻq (`NameError`).
3. **Kod yoz** — `eng_katta(a, b)`, `juftmi(n)`, `raqamlar_yigindisi(n)`; bitta funksiyani ikkinchisida ishlatish; katta masalani boʻlaklash.

### 35. Masalalar maydoni
Oʻyin emas, mashq maydoni — lekin bosqichlari bor, shuning uchun oddiy oʻyin kabi ishlaydi.
- **3 bosqich = 3 daraja:** oson (shart/sikl) → oʻrta (raqamlar, roʻyxat, satr) → qiyin (bir nechta qadam, funksiya).
- Har darajada bankdan tasodifiy masala beriladi, **3 ta yechilsa** bosqich tugadi. Bank kattaroq (daraja boshiga 8 ta, jami ≈ 24) — bola yana oʻynasa, yangi masala chiqadi.
- Har masala: shart matni, kirish/chiqish formati, **1 ta namunali test koʻrinadi**, 3–5 tasi yashirin.
- Yiqilsa — birinchi yiqilgan test koʻrsatiladi: `kirish: 5 → kutilgan: 12, sendan: 11`.

---

## 3. Masala turlari

Beshta tur. Blok boʻylab oʻsib boradi: boshda koʻchirish va oʻqish, oxirida toʻliq yozish.

| Tur | Nima qiladi | Qanday tekshiriladi | Qayerda |
|---|---|---|---|
| `ter` | Berilgan kodni aynan teradi | Belgi-belgi solishtiriladi, birinchi farq joyi koʻrsatiladi | 27, 28 |
| `natija` | Kod berilgan — chiqishini yozadi | Kutilgan chiqish dvigatel bilan hisoblanadi (testda `python3` bilan tasdiqlangan) | 27–34, asosiy mashq |
| `bosh-joy` | Kodda 1–2 joy `___` — toʻldiradi | Toʻliq kod ishga tushiriladi, chiqishi solishtiriladi (bir nechta toʻgʻri javob qabul qilinadi) | 29 dan |
| `xato-top` | Ishlamaydigan kodni tuzatadi | Xato yoʻqolishi **va** chiqish toʻgʻri boʻlishi kerak | 30 dan |
| `kod-yoz` | Shart berilgan — toʻliq yozadi | 2–5 test holati (kirish → chiqish); birinchi yiqilgani koʻrsatiladi | 30 dan, 33–35 da asosiy |

**Xato javob** (QOIDALAR §4.4 ning kodga moslashtirilgani):
- **Sintaksis xatosi urinish sanalmaydi.** Qavs yopilmagani — javob xatosi emas, terishdagi xato: dvigatel satr raqami va izoh beradi, bola tuzatadi. Bu darsning bir qismi.
- **1-xato** (javob/test yiqildi): maslahat — sintaksis kartasi qayta koʻrsatiladi yoki "qadam-baqadam yurib koʻr" taklif qilinadi.
- **2-xato:** toʻgʻri yechim tushuntirish bilan koʻrsatiladi, keyin **shunga oʻxshash yangi masala**. Xato qilingani 3 ta toʻgʻri javobga qoʻshilmaydi.
- Qizil rang va qoʻrqituvchi ovoz yoʻq: `yana` rangi (`#F08A24`) va ↻ belgisi.

---

## 4. Ekran va umumiy kod

Yangi umumiy fayllar (kamida 2 oʻyin ishlatadi — QOIDALAR §9):

```
oyinlar/umumiy/
├── js/python/        ← kichik Python dvigateli (alohida hujjat)
├── js/kod-ui.js      ← kod muharriri, chiqish paneli, qadam-baqadam panel
├── js/kod-masala.js  ← beshta masala turi va ularni tekshirish
├── js/kod-rang.js    ← oʻqiladigan kodni boʻyash (dvigatel tokenizeridan foydalanadi)
└── css/kod.css       ← muharrir, chiqish, jadval uslublari
```

**Kod muharriri:** oddiy `<textarea>`, monospace shrift, yonida satr raqamlari.
- `Tab` — 4 boʻshliq; `:` dan keyin Enter bosilsa — avtomatik otstup.
- **Qavs va qoʻshtirnoq avtomatik yopilmaydi** — yopishni oʻrganish darsning bir qismi.
- `Ctrl`/`Cmd` + `Enter` — ishga tushirish. `▶︎ Ishga tushir`, `⏭ Qadam`, `↺ Boshidan` tugmalari.
- Bolaning kodi `localStorage` da saqlanadi (faqat qulaylik uchun; ishlamasa ham oʻyin ishlaydi).
- **Boʻyash faqat oʻqiladigan kodda** (masala matnida): kalit soʻz, son, satr, izoh. Muharrirda boʻyash yoʻq — v1 da kerak emas.

**Qadam-baqadam panel** (blokning yuragi, 29-oʻyinda tanishtiriladi):
- hozirgi satr yonadi;
- **oʻzgaruvchilar jadvali**: nom → qiymat, oʻzgargan qiymat qisqa animatsiya bilan (0.2–0.6 s);
- chiqish oynasi toʻlib boradi;
- sikl uchun **aylanish hisoblagichi**.

**Shrift:** kod uchun tizim monospace shrifti (`ui-monospace, Menlo, Consolas, monospace`) — yangi fayl yuklanmaydi, internetsiz ishlaydi. Oʻlchami 18 px (QOIDALAR §5).

**Telefon:** blokda 💻 belgisi. Telefonda ochilsa ogohlantirish: "Kod yozish uchun klaviatura kerak". Oʻqish masalalari (`natija`) baribir 360 px ga sigʻadi.

---

## 5. QOIDALAR.md ga kiritiladigan oʻzgarishlar

Blok tasdiqlansa, **avval** `QOIDALAR.md` oʻzgaradi (§ ning oʻz talabi), keyin kod yoziladi:

1. **§2 Yosh** — "8–12 (asosiy). Ayrim bloklar kattaroq: sanoq va mantiq 10–12, **Python 12–16**; kartada yoziladi."
2. **§3 Qurilmalar** — 💻 istisnosiga Python bloki qoʻshiladi (klaviatura bloki yonida).
3. **§4.3 Tasodifiy misollar** — istisno: **masala banki** qoʻlda yoziladi (olimpiada masalasini generator yasay olmaydi). Tasodifiylik mashq generatorlarida qoladi. Bank masalasi namunali yechim va testlar bilan tekshiriladi.
4. **§4.4 Xato javob** — sintaksis xatosi urinish sanalmasligi qoʻshiladi.
5. **§6 Shrift** — kod uchun tizim monospace shrifti.
6. **§8 Texnologiya** — bola kodi **hech qachon** `eval`/`Function` bilan bajarilmaydi; kichik Python — oʻz kodimiz, kutubxona emas.
7. **§9** — yangi boʻlim `python`, `dastur` dan keyin.

**Bosh sahifadagi raqamlar 9 taga suriladi.** Buning uchun:
- `bosh/js/bosh.js`: `SECTIONS` ga `python`, `GAMES` ga toʻqqiz oʻyin (`age: "12–16"`, `pc: true`);
- `bosh/tests/bosh.test.js`: 💻 va yosh testlari yangilanadi (endi 💻 — klaviatura **va** python bloklari);
- oʻyinlar ichidagi "18-oʻyin" kabi havolalarning raqamlari yangilanadi — `havolalar.json` testi hammasini topib beradi (19 ta havola).

---

## 6. Testlar

- `oyinlar/umumiy/tests/python-*.test.js` — dvigatel (alohida hujjatda batafsil), shu jumladan `python3` bilan solishtirish.
- `oyinlar/umumiy/tests/kod-masala.test.js` — beshta masala turining tekshirishi: toʻgʻri javob oʻtadi, yaqin-lekin-xato oʻtmaydi, bir nechta toʻgʻri yechim qabul qilinadi.
- Har oʻyinda `tests/*.test.js` — mashq generatorlari: chegaralar, takrorlanmaslik, yechimi borligi (QOIDALAR §4.3).
- **35-oʻyin uchun majburiy test:** bankdagi har bir masalaning namunali yechimi barcha testlardan oʻtadi (kichik Pythonda **va** `python3` da).
- `node --test bosh/tests/*.test.js` — roʻyxat, raqamlar, havolalar.

---

## 7. Ish tartibi

1. `QOIDALAR.md` oʻzgarishlari (§5 dagi roʻyxat) + bosh sahifa boʻlimi.
2. **Kichik Python dvigateli** + testlari — blokning eng katta va eng xatarli qismi, birinchi boʻlib tugatiladi.
3. `kod-ui.js`, `kod-masala.js`, `kod-rang.js`, `kod.css`.
4. **27-oʻyin** toʻliq (`DIZAYN.md` → `REJA.md` → kod → testlar) — bu yerda muallif oʻzi koʻrib chiqadi (QOIDALAR §10.5).
5. Keyin 28 → 35, bittadan.

## 8. Keyinga qoldirildi

- `f"..."` satrlar, `dict`, `tuple`, `import`, `class` — dvigatelda yoʻq, "hali yoʻq" xabari beriladi.
- Muharrirda kodni boʻyash (v1 da faqat oʻqiladigan kod boʻyaladi).
- Masalalar maydoni uchun onlayn musobaqa (xona kodi bilan, kim tezroq yechadi).
- 8–12 yosh uchun vizual sikl/shart oʻyinlari (26-oʻyin rejasidagi 27–29) — keyin qaytamiz.

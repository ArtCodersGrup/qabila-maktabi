# Kichik Python: dvigatel dizayni

Bolaning yozgan Python kodini **brauzerda oʻzimiz** bajaradigan talqinchi. Kutubxona yoʻq, internet yoʻq,
`index.html` ni ikki marta bosib ochsa ham ishlaydi. Python bloki shunga tayanadi: [`PYTHON-BLOK.md`](PYTHON-BLOK.md).

**Holati:** dizayn yozildi — muallif tasdiqlashini kutmoqda (2026-09-29).

---

## 1. Nima uchun oʻz talqinchimiz

1. **Oflayn va yengil.** Pyodide 13 MB va `file://` da ishlamaydi (oʻlchandi). Bizniki — bir necha yuz KB JS.
2. **Qadam-baqadam koʻrsatish.** Har buyruqdan keyin toʻxtab, hozirgi satrni yondirib, oʻzgaruvchilar jadvalini chizishimiz kerak. Bu — blokning yuragi.
3. **Toʻxtatib boʻladigan.** `while True:` sahifani muzlatmaydi: qadam hisoblagichi bor.
4. **Bolaga moslangan xato xabari.** Pythonning oʻz xabari + ostida oʻzbekcha izoh va koʻrsatgich.

**Narxi:** Pythonning faqat bir qismi ishlaydi. Shuning uchun quyidagi ikki qoida majburiy:

- **Qoʻllanmagan narsa "xato" deb atalmaydi.** Alohida xabar: *"Bu saytda hali yoʻq: … . Haqiqiy Pythonda bu ishlaydi."*
- **Qoʻllangan narsa `python3` bilan bir xil ishlaydi** — testlar buni har safar tekshiradi (§7).

---

## 2. Qamrov: nima bor

**Turlar:** `int`, `float`, `str`, `bool`, `list`, `None`.

**Ifodalar**
- amallar: `+ − * / // % **`, unar `−`;
- solishtirish: `== != < <= > >=`, zanjir ham (`0 < x < 10`);
- mantiq: `and`, `or`, `not` (qisqa tutashuv bilan);
- `in`, `not in` (satr va roʻyxat uchun);
- indeks `a[i]` (manfiy ham), kesish `a[i:j]` (satr va roʻyxat);
- roʻyxat literali `[1, 2, 3]`, qavslar;
- `str * int` (`"*" * 5`), `str + str`, `list + list`.

**Buyruqlar**
- ifoda-buyruq; `=`; `+= -= *= //= %=`; `a[i] = v`; koʻp oʻzlashtirish `a, b = b, a`;
- `if` / `elif` / `else`; `while`; `for x in …` (`range`, roʻyxat, satr);
- `break`, `continue`, `pass`;
- `def` … `return` (parametrlar, standart qiymatsiz);
- izoh `#`.

**Ichki funksiyalar:** `print` (`end=`, `sep=` bilan), `input`, `int`, `str`, `float`, `bool`, `len`, `range`, `abs`, `min`, `max`, `sum`, `sorted`, `list`, `map`, `ord`, `chr`.
**Metodlar:** `list.append`, `list.pop`, `str.upper`, `str.lower`, `str.count`, `str.split`, `str.join`.

**2026-10-02 qoʻshildi (olimpiada kirish-chiqishi uchun):** `list(map(int, input().split()))`, `a, b = map(int, input().split())`, `print(x, end=" ")`, `" ".join(map(str, a))`, `ord`/`chr`. `map` natijasi — alohida qiymat: ustidan yurish, `list(...)`, `sum(...)`, ochish mumkin; indeks va `len` Python kabi xato beradi. Farq: `print(map(...))` haqiqiy Pythonda manzil bilan chiqadi (`<map object at 0x…>`), bu yerda `<map object>`; `map` bir marta emas, qayta ham oʻqiladi.
**Chegaralar:** qadam — 3 000 000; satr/roʻyxat uzunligi — 1 000 000; daraja koʻrsatkichi — 100 000. Oshsa — `Limit` xabari (tab qulamaydi).

### Nima yoʻq (va nima deyiladi)

`f"..."`, `%` bilan formatlash, `.format`, `dict`, `tuple`, `set`, `import`, `class`, `lambda`, `global`,
`while … else`, `try/except`, `enumerate`, `zip`, `filter`, `print` dan boshqa joyda nomli argumentlar (`f(a=1)`),
qadamli kesish `a[::2]`, `input()` ni faylga yoʻnaltirish.

Har biri uchun aniq xabar tayyorlanadi:

```
Bu saytda hali yoʻq: f-satr  (2-satr)
    print(f"javob {x}")
          ↑
Haqiqiy Pythonda ishlaydi. Bu yerda: print("javob", x)
```

---

## 3. Muhim mayda-chuydalar (aynan Python kabi)

Bular tuzoq: notoʻgʻri qilsak, bola saytdan bir narsa, maktabda boshqa narsa oʻrganadi.

| Holat | Kutilgan natija |
|---|---|
| `7 / 2` | `3.5` — `/` **doim** kasr beradi |
| `4 / 2` | `2.0` (`4`, `2` emas) |
| `7 // 2`, `−7 // 2` | `3`, `−4` — pastga yumaqlash (nolga emas) |
| `−7 % 3` | `2` — natija musbat, Python qoidasi |
| `2 ** 100` | toʻliq aniq son — `int` uchun **BigInt** ishlatiladi |
| `0.1 + 0.2` | `0.30000000000000004` — kasr sonlar JS `number` (ikkisi ham IEEE 754) |
| `print(1, 2)` | `1 2` — orada bitta boʻshliq |
| `print([1, "a"])` | `[1, 'a']` — roʻyxat ichida bitta qoʻshtirnoq |
| `print("a" == "A")` | `False` — katta-kichik harf farqi |
| `int("12abc")` | `ValueError` |
| `"5" + 5` | `TypeError: can only concatenate str (not "int") to str` |
| `range(1, 5)` | `1 2 3 4` — oxiri kirmaydi |
| `a[len(a)]` | `IndexError: list index out of range` |

---

## 4. Tashqi interfeys

```js
// Bir marta bajarish
QK.python.run(kod, { stdin: ["5", "7"], maxSteps: 3000000 });
// → { output: ["12"], error: null, steps: 34, vars: { a: 5, b: 7 } }

// Qadam-baqadam (generator)
const yurish = QK.python.trace(kod, { stdin });
for (const holat of yurish) {
  // { line: 3, vars: { i: 2, s: 3 }, output: ["1", "2"], loop: { line: 2, aylanish: 2 } }
}
```

- `output` — satrlar roʻyxati (`print` chiqishi); xato boʻlsa ham unga qadar chiqqani saqlanadi.
- `error` — `{ type, message, line, col, hint }`. `type` — Pythonning nomi (`SyntaxError`, `NameError`, …) yoki bizning `YoqHali`, `ChegaraXato`.
- `vars` — faqat oddiy qiymatlar (koʻrsatish uchun tayyor matn bilan).
- `stdin` — `input()` navbat bilan shu satrlarni oladi; tugasa `EOFError`.

## 5. Fayllar

```
oyinlar/umumiy/js/python/
├── tokenizer.js     belgilarga ajratish; otstupdan INDENT/DEDENT yasaydi; satr/ustun saqlaydi
├── parser.js        AST: ifoda uchun ustuvorlikli (Pratt) tahlil, buyruq uchun bloklar
├── qiymat.js        turlar, amallar (BigInt/float qoidalari), Python kabi chiqarish (repr va str)
├── builtins.js      ichki funksiyalar va metodlar
├── interpreter.js   generator asosida bajaruvchi: har buyruqdan keyin holat qaytaradi
├── xato.js          xato turlari, oʻzbekcha izohlar, "hali yoʻq" xabarlari
└── python.js        tashqi interfeys (run, trace) → window.QK.python
```

Skriptlar oddiy `<script>` bilan ulanadi (modul emas — QOIDALAR §8). Har biri `QK.python…` ga qoʻshiladi.

## 6. Chegaralar va xavfsizlik

- **Qadam chegarasi** — standart 3 000 000. Oshsa: `ChegaraXato` → *"3 000 000 qadamdan oshdi — sikl juda uzun yoki tugamaydi. Sikldagi shart qachon yolgʻon boʻladi?"* Bu 31-oʻyinda dars sifatida ishlatiladi.
- **Chuqurlik chegarasi** — 200 chaqiriq → `RecursionError`.
- **Chiqish chegarasi** — 2 000 satr (`print` bilan ekranni toʻldirib yuborishdan saqlaydi).
- **`eval` va `new Function` ishlatilmaydi.** Bolaning kodi hech qachon JS sifatida bajarilmaydi. Bu qoida QOIDALAR §8 ga yoziladi.
- Bajarish sinxron (ishchi oqim kerak emas): qadam chegarasi tufayli eng yomon holatda ham tez tugaydi.

## 7. Testlar — talqinchi yolgʻon gapirmasligi kafolati

```
oyinlar/umumiy/tests/
├── python-tokenizer.test.js   otstup, INDENT/DEDENT, satr raqami
├── python-parser.test.js      ustuvorlik, qavs, ichma-ich bloklar
├── python-run.test.js         yuzlab kichik misol: kod → kutilgan chiqish
├── python-xato.test.js        har bir xato turi: tur, satr raqami, izoh matni
├── python-yoq.test.js         qoʻllanmagan sintaksis → "hali yoʻq" xabari (xato emas!)
├── python-parity.test.js      bir xil kod python3 da bajariladi, chiqish solishtiriladi
└── python-fuzz.test.js        tasodifiy dastur generatori → python3 bilan solishtirish
```

**Parity testi:** korpusdagi har bir dastur (oʻyinlardagi hamma misol, mashq generatorlari chiqargan kodlar, masala banki yechimlari) `python3` bilan bajariladi va chiqish belgi-belgi solishtiriladi. Xato holatlarida **xato turi va satr raqami** solishtiriladi (xabar matni har Python versiyasida bir xil boʻlmasligi mumkin — shuning uchun matn faqat oʻz testimizda qotiriladi).

**Fuzz testi:** generator qamrovimiz ichida tasodifiy kichik dasturlar yasaydi (butun sonlar, sikl chegaralari kichik, cheksiz sikl yoʻq) va `python3` bilan solishtiradi. Farq chiqsa — test yiqiladi va kod koʻrsatiladi.

`python3` topilmasa, ikki test **oʻtkazib yuboriladi** (xabar bilan) — boshqa testlar baribir ishlaydi.

## 8. Taxminiy hajm

| Fayl | Satr |
|---|---|
| tokenizer.js | ~220 |
| parser.js | ~420 |
| qiymat.js | ~220 |
| builtins.js | ~180 |
| interpreter.js | ~380 |
| xato.js | ~140 |
| python.js | ~60 |
| **jami** | **≈ 1 600** + testlar |

## 9. Keyin qoʻshilishi mumkin

`f"..."` satrlar (eng koʻp soʻraladigani boʻlsa kerak), `dict`, `tuple` va `a, b = funksiya()`, `enumerate`,
`try/except`, qadamli kesish. Har biri: dvigatelga qoʻshiladi → parity testiga korpus qoʻshiladi → "hali yoʻq" xabari oʻchiriladi.

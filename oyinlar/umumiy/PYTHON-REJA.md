# Python bloki: ish rejasi

**Maqsad:** bolalar brauzerda haqiqiy Python yozadigan blok — `print` dan funksiyagacha, olimpiada uslubidagi masalalar bilan.

**Dizayn:** [`PYTHON-BLOK.md`](PYTHON-BLOK.md) (mavzular, masala turlari, ekran) va [`PYTHON-DVIGATEL.md`](PYTHON-DVIGATEL.md) (talqinchi).

**Yondashuv:** dvigatel → umumiy UI → oʻyinlar. Dvigatel eng xatarli qism, shuning uchun birinchi va testlari bilan tugatiladi.

## Umumiy chegaralar (QOIDALAR.md dan)

- Oddiy HTML + CSS + JS, SVG. Kutubxona yoʻq, build yoʻq, `<script>` oddiy (modul emas).
- Internetsiz ishlaydi, `file://` da ham. `localStorage` faqat qulaylik uchun.
- Kod fayllari va oʻzgaruvchilar — inglizcha; izohlar — oʻzbekcha. Papka nomlari — oʻzbekcha, `'` belgisiz.
- Mantiq ekran kodidan alohida faylda va `node --test` bilan tekshiriladi.
- Ekranda `oʻ`, `gʻ` (U+02BB) va `ʼ` (U+02BC). Bolaga "sen".
- Ranglar: fon `#FFF6E5`, matn `#2B2B3A`, asosiy `#2F6FDE`, toʻgʻri `#1A9E77`, yana `#F08A24`.
- Bolaning kodi **hech qachon** `eval` yoki `new Function` bilan bajarilmaydi.

## Fayl tuzilishi

| Fayl | Vazifasi |
|---|---|
| `oyinlar/umumiy/js/python/errors.js` | xato turlari, oʻzbekcha izohlar, "hali yoʻq" xabarlari |
| `oyinlar/umumiy/js/python/values.js` | turlar, amallar (BigInt/float), Python kabi chiqarish |
| `oyinlar/umumiy/js/python/tokenizer.js` | belgilarga ajratish, INDENT/DEDENT, satr va ustun |
| `oyinlar/umumiy/js/python/parser.js` | AST: ifoda (ustuvorlik) va buyruq (bloklar) |
| `oyinlar/umumiy/js/python/builtins.js` | `print`, `input`, `int`, `range` … va metodlar |
| `oyinlar/umumiy/js/python/interpreter.js` | generator asosida bajaruvchi, qadam chegarasi |
| `oyinlar/umumiy/js/python/python.js` | tashqi interfeys: `QK.python.run`, `.trace` |
| `oyinlar/umumiy/js/kod.js` | masala turlari va ularni tekshirish (sof mantiq) |
| `oyinlar/umumiy/js/kod-ui.js` | kod muharriri, chiqish paneli, qadam paneli, boʻyash |
| `oyinlar/umumiy/css/kod.css` | muharrir va panellar uslubi |
| `bosh/tools/renumber.js` | bosh sahifa tartibi oʻzgarsa, oʻyin matnidagi raqamlarni yangilaydi |

Har fayl UMD quyrugʻi bilan (`module.exports` yoki `root.QK.python.<nom>`) — `umumiy/js/dastur.js` dagidek.

## Vazifalar

- [ ] **1. QOIDALAR.md** — yosh (§2), 💻 (§3), masala banki istisnosi (§4.3), sintaksis xatosi (§4.4), kod shrifti (§6), `eval` taqiqi (§8), `python` boʻlimi (§9).
- [ ] **2. errors.js + values.js** — testlar: `python-values.test.js` (`−7 // 2`, `−7 % 3`, `4 / 2 → 2.0`, `2 ** 100`, float chiqarish, `repr` qoʻshtirnoqlari, `TypeError` matni).
- [ ] **3. tokenizer.js** — testlar: `python-tokenizer.test.js` (otstup, INDENT/DEDENT, izoh, satrlar, `f"` → "hali yoʻq", qavs ichida satr koʻchishi).
- [ ] **4. parser.js** — testlar: `python-parser.test.js` (ustuvorlik `2 + 3 * 4`, `−2 ** 2`, zanjirli solishtirish, ichma-ich bloklar, `elif`, `def`).
- [ ] **5. builtins.js + interpreter.js + python.js** — testlar: `python-run.test.js` (korpus: kod → kutilgan chiqish), `python-errors.test.js` (tur, satr, izoh), `python-notyet.test.js`, `python-trace.test.js` (qadam-baqadam: satr, oʻzgaruvchilar).
- [ ] **6. Parity va fuzz** — `python-parity.test.js` (korpusni `python3` da bajarib solishtirish), `python-fuzz.test.js` (tasodifiy dastur generatori). `python3` boʻlmasa — oʻtkazib yuboriladi.
- [ ] **7. kod.js** — beshta masala turi (`ter`, `natija`, `bosh-joy`, `xato-top`, `kod-yoz`) va tekshirish; testlar: toʻgʻri javob oʻtadi, yaqin-lekin-xato oʻtmaydi, bir nechta toʻgʻri yechim qabul qilinadi, test holati yiqilsa birinchi farq qaytadi.
- [ ] **8. kod-ui.js + kod.css** — muharrir (Tab, avtomatik otstup, `Ctrl+Enter`), chiqish paneli, qadam paneli va oʻzgaruvchilar jadvali, oʻqiladigan kodni boʻyash, telefon ogohlantirishi.
- [ ] **9. 27-oʻyin** — `27-birinchi-buyruq/`: `DIZAYN.md`, `REJA.md`, `index.html`, `js/main.js`, `js/scenes/*`, `tests/*`; `bosh/js/bosh.js` (`python` boʻlimi + oʻyin), `bosh/tests/bosh.test.js` (💻 va yosh testlari), `bosh/tools/renumber.js` bilan havolalarni yangilash, `sw.js` ga yangi fayllar.
- [ ] **10. 28 → 35** — bittadan: `DIZAYN.md` → kod → testlar → bosh sahifa → git.

## Tekshirish

```bash
node --test oyinlar/umumiy/tests/*.test.js     # dvigatel va umumiy mantiq
node --test bosh/tests/*.test.js               # roʻyxat, raqamlar, havolalar
cd oyinlar/27-birinchi-buyruq && node --test tests/*.test.js
```

Har vazifa oxirida: testlar yashil → git commit. Oraliq brauzer tekshiruvlari yoʻq (muallif talabi), oxirida bitta kod koʻrigi.

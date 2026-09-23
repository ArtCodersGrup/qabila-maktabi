# Vibecoding topshiriq generatori: ish rejasi

**Maqsad:** bitta sahifa — ikki g'ildirak (xizmat turi, kompaniya nomi) tasodifiy tanlanadi, natijada "{Kompaniya} uchun {Xizmat} qilish" topshirig'i chiqadi.

**Arxitektura:** sof mantiq alohida faylda — `js/data.js` (ro'yxatlar) va `js/generator.js` (tasodifiy tanlov, jumla yasash), ikkalasi ham Node testlari bilan tekshiriladi (`(function(root){...})` UMD naqshi — `oyinlar/23-on-barmoq/js/typing.js` kabi). Ekran: `index.html` + `style.css` + `js/main.js` (g'ildirak animatsiyasi, DOM).

**Dizayn:** [`DIZAYN.md`](DIZAYN.md).

> Dizayn kelishilgach, ishni to'xtamasdan oxirigacha olib borish.

## Vazifalar

- [x] 1. `js/data.js` + `tests/data.test.js`: `SERVICES` (~50 ta, aniq vazifali qisqa nom) va `COMPANIES` (~30 ta o'ylab topilgan nom) massivlari. Test: ikkalasi ham bo'sh emas, minimal uzunlikka yetadi, ichida takror yo'q, har element bo'sh satr emas.
- [x] 2. `js/generator.js` + `tests/generator.test.js`: `pickService(prev, rng)`, `pickCompany(prev, rng)` — `prev`dan farqli tasodifiy element (RNG tashqaridan beriladi — test uchun oldindan aniqlangan ketma-ketlik), `buildSentence(company, service)` — "{Kompaniya} uchun {Xizmat} qilish" satrini qaytaradi.
- [x] 3. `index.html` + `style.css`: qorong'i fon, neon urg'u, ikki g'ildirak (xizmat, kompaniya) va "Aylantir" tugmasi — statik skelet, hali animatsiyasiz.
- [x] 4. `js/main.js`: tugma bosilganda ikkala g'ildirak bir vaqtda aylana boshlaydi (`data.js`dagi ro'yxatlardan tasodifiy so'z ko'rsatib turadi, sekinlashadi), xizmat ~1.5–2s da, kompaniya ~2.5–3s da to'xtaydi (`generator.js`dan yakuniy qiymat oldindan olinadi), natija jumlasi chiqadi, tugma "Yana ayl"ga o'zgaradi.
- [x] 5. Brauzerda tekshirish (Playwright): tugma ishlaydi, ikkala g'ildirak to'xtaydi, natija to'g'ri formatda, 360px enda gorizontal aylantirish yo'q, qayta bosilganda yangi natija chiqadi.
- [x] 6. Yakuniy kod ko'rigi va git commit.

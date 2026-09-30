# 34 — Funksiya ustaxonasi: dizayn

**Mavzu:** `def` — oʻz buyrugʻingni yasash; parametr, `return`, lokal oʻzgaruvchi
**Yosh:** 12–16 · **Qurilma:** kompyuter (💻) · **Taxminiy davomiyligi:** 25–30 daqiqa
**Holati:** kod yozildi, testlar yashil — muallif koʻrib chiqishini kutmoqda (2026-09-30)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok rejasi: [`../umumiy/PYTHON-BLOK.md`](../umumiy/PYTHON-BLOK.md).
Blokdagi oʻrni: `33` Roʻyxat va satr → **34** → `35` Masalalar maydoni.

> `print` — Python yasagan buyruq. Endi **oʻzing** buyruq yasaysan: unga nom berасan,
> nima olishini (parametr) va nima qaytarishini (`return`) aytasan.

## 1. Oʻquv maqsadlari

Oʻyindan keyin bola:

1. `def nom(parametr):` bilan funksiya yozadi va uni chaqiradi.
2. **`return` va `print` farqini** aytadi: `print` ekranga yozadi, `return` qiymatni **qaytaradi**.
3. `return` dan keyingi satrlar bajarilmasligini biladi.
4. Funksiya ichidagi oʻzgaruvchi tashqarida yoʻqligini (`NameError`) koʻrsatadi.
5. Ikki parametrli funksiya yozadi va argumentlar tartibi muhimligini biladi.
6. Bitta funksiyani ikkinchisining ichida ishlatadi (masalani boʻlaklash).
7. Bir xil kodni takrorlash oʻrniga funksiya yozadi.

## 2. Qahramonlar va rasmlar

Oqsoqol va Shogird. Oʻyinga xos rasm (`js/game-art.js`, matnsiz): **ustaxona dastgohi** — chapdan kiruvchi (parametr), oʻngdan chiquvchi (natija).

## 3. Asboblar

Umumiy asboblar. **Yangi:** kod yozish masalalarida `tail` — bolaning kodidan keyin qoʻshiladigan sinov satri (`umumiy/js/kod.js`). Shu tufayli bola faqat funksiyani yozadi, chaqirishni sayt bajaradi.

## 4. Oʻyin oqimi

```
Bosh ekran
   ├─► 1-bosqich: Oʻz buyrugʻing   [def va chaqiruv → parametr → taʼrif → mashq 3]
   ├─► 2-bosqich: return           [return va print farqi → returndan keyin → lokal → mashq 3]
   └─► 3-bosqich: Boʻlaklab yechish [funksiya ichida funksiya → mashq 3] → tabrik
```

## 5. 1-bosqich: Oʻz buyrugʻing

1. **Koʻrsatish:** `def salom(): print("Salom!")` — yozilgan joyda hech narsa boʻlmaydi, chaqirilganda ishlaydi. Qadam-baqadam koʻrsatiladi (`def` satri bajariladi, keyin chaqiruv ichiga kiriladi).
2. **Parametr:** `def salom(ism): print("Salom,", ism)` — bir xil funksiya har xil qiymat bilan.
3. **Taʼrif:** `def nom(parametr):` — funksiya yoziladi; `nom(qiymat)` — chaqiriladi.
4. **Mashq** (3 ta toʻgʻri): funksiya berilgan, bola chiqishni aytadi.

## 6. 2-bosqich: return

1. **Koʻrsatish:** ikki funksiya yonma-yon — biri `print` qiladi, ikkinchisi `return`. `x = f(3)` da farq koʻrinadi (`None` chiqishi).
2. **`return` toʻxtatadi:** `return` dan keyingi satr bajarilmaydi.
3. **Lokal oʻzgaruvchi:** funksiya ichidagi nom tashqarida yoʻq — `NameError`.
4. **Taʼrif:** `return` qiymatni qaytaradi va funksiyani tugatadi.
5. **Mashq** (3 ta toʻgʻri): natijani top (`return`, `None`, lokal).

## 7. 3-bosqich: Boʻlaklab yechish

1. **Koʻrsatish:** `juftmi(n)` yoziladi, keyin u `nechta_juft(a)` ichida ishlatiladi.
2. **Mashq** (3 ta toʻgʻri): **kod yozish** — faqat funksiya yoziladi, sayt uni sinov satri bilan chaqiradi:
   - `eng_katta(a, b)` — kattasini qaytaradi;
   - `juftmi(n)` — `True`/`False`;
   - `raqamlar_yigindisi(n)`;
   - `kvadrat(n)` va undan foydalanib `kvadratlar_yigindisi(n)`;
   - `unlilar(soz)` — unlilar soni.

**Tabrik:** `def — oʻz buyrugʻing`, `return qiymat qaytaradi, print ekranga yozadi`, `Katta masalani boʻlaklab yechish`.

## 8. Ekran tuzilishi

27–33-oʻyinlardagidek. Kod yozish maydoni 5 qatorli (funksiya uchun).

## 9. Kod tuzilishi

```
34-funksiya-ustaxonasi/
├── js/logic.js     savollar: chaqiruv, return/print, lokal, funksiya yozish (tail bilan)
├── js/game-art.js  dastgoh rasmi
├── js/scenes/…     kirish, uch bosqich, tabrik
└── tests/logic.test.js
```

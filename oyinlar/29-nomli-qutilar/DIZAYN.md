# 29 — Nomli qutilar: dizayn

**Mavzu:** oʻzgaruvchi — nomli quti; kuzatuv jadvali; `input()` va turlar
**Yosh:** 12–16 · **Qurilma:** kompyuter (💻) · **Taxminiy davomiyligi:** 25–30 daqiqa
**Holati:** kod yozildi, testlar yashil — muallif koʻrib chiqishini kutmoqda (2026-09-30)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok rejasi: [`../umumiy/PYTHON-BLOK.md`](../umumiy/PYTHON-BLOK.md).
Oldingi oʻyin: `27` Birinchi buyruq. Blokda birinchi boʻlib shu oʻyin yoziladi, chunki **kuzatuv jadvali** keyingi oltita oʻyinga kerak.

> Qiymatni eslab qolish uchun unga **nom** beriladi. Nom — qutining yorligʻi, ichidagi qiymat esa almashib turadi.

## 1. Oʻquv maqsadlari

Oʻyindan keyin bola:

1. `nom = qiymat` yozib, qutiga qiymat soladi va uni `print` bilan chiqaradi.
2. `=` — tenglik emas, **qoʻyish** ekanini tushuntiradi: `x = x + 1` xato emas.
3. Dasturni satrma-satr kuzatib, **kuzatuv jadvalini** toʻldiradi: har buyruqdan keyin qaysi qutida nima borligini yozadi.
4. Ikki qutining qiymatini almashtiradi: uchinchi quti orqali (`c = a; a = b; b = c`) va Pythonning qisqa yoʻli bilan (`a, b = b, a`).
5. `input()` **matn** qaytarishini biladi va `int(input())` bilan songa oʻgiradi.
6. `"5" + 5` nega `TypeError` berishini va uni qanday tuzatishni aytadi.
7. Kiritilgan ikki sonni oʻqib, ular ustida amal bajaradigan dastur yozadi.

## 2. Qahramonlar va rasmlar

Oqsoqol va Shogird. Oʻyinga xos rasm (`js/game-art.js`, matnsiz): **yorliqli qutilar** — biri ochiq, ichida qiymat.

## 3. Asboblar

Umumiy `kod-ui.js` dan: muharrir, chiqish paneli, **qadam-baqadam panel**, **kirish paneli** (`input()` oladigan satrlar).
Shu oʻyinda yozilgan: **kuzatuv jadvali** (`js/jadval.js`) — satrlar boʻyicha, ustunlar — quti nomlari. Bola har katakka qiymat yozadi; tekshirilganda birinchi xato satr belgilanadi.

Yangi: bola yozgan kod **brauzerda saqlanadi** (`kod-ui` dagi qoralama), sahifa yangilansa yoʻqolmaydi.

## 4. Oʻyin oqimi

```
Bosh ekran
   ├─► 1-bosqich: Quti va nom      [qadam-baqadam koʻrsatish → x = x + 1 → taʼrif → mashq 3]
   ├─► 2-bosqich: Kuzatuv jadvali  [birga toʻldirish → almashtirish → taʼrif → mashq 3]
   └─► 3-bosqich: input va turlar  [input matn qaytaradi → "5" + 5 xatosi → int() → mashq 3] → tabrik
```

## 5. 1-bosqich: Quti va nom

1. **Koʻrsatish:** `a = 2 / b = 3 / a = a * b` qadam-baqadam bajariladi — bola `⏭ Qadam` ni bosadi, qutilar toʻladi, oʻzgargan quti belgilanadi.
2. **`x = x + 1`:** alohida koʻrsatiladi — avval oʻng tomon hisoblanadi, keyin chapdagi qutiga qoʻyiladi. `+=` — shuning qisqa yozuvi.
3. **Taʼrif:** `nom = qiymat` — qutiga qoʻyish. `=` tenglik emas.
4. **Mashq** (3 ta toʻgʻri): 3–5 satrli dastur, oxirida `print`. Bola chiqishni yozadi.
   - 1-xato: "qadam-baqadam yurib koʻr" taklifi.
   - 2-xato: haqiqiy chiqish koʻrsatiladi.

## 6. 2-bosqich: Kuzatuv jadvali

1. **Koʻrsatish:** jadval birga toʻldiriladi — birinchi satr tayyor, qolganini bola yozadi.
2. **Almashtirish:** `c = a; a = b; b = c` jadval bilan koʻrsatiladi; keyin `a, b = b, a` — "Pythonning qisqa yoʻli".
3. **Taʼrif:** dasturni kuzatish — har satrdan keyin qutilarga qarash.
4. **Mashq** (3 ta toʻgʻri): 2 quti, 4–5 satr, faqat butun sonlar (jadvalda qoʻshtirnoq boʻlmasin).
   - 1-xato: birinchi notoʻgʻri satr belgilanadi.
   - 2-xato: toʻgʻri jadval toʻldirib koʻrsatiladi.

## 7. 3-bosqich: input va turlar

1. **Koʻrsatish:** `ism = input()` — kirish panelida qanday satr turgani koʻrinadi; `print("Salom,", ism)`.
2. **Tuzoq:** `yosh = input()` va `yosh + 1` → `TypeError`. Xato xabari oʻqiladi, `int(input())` bilan tuzatiladi.
3. **Taʼrif:** `input()` doim **matn** qaytaradi. Son kerak boʻlsa — `int(...)`.
4. **Mashq** (3 ta toʻgʻri), navbat bilan ikki xil:
   - **Natijani top** — kod va kirish satrlari berilgan, bola chiqishni yozadi.
   - **Kodni yoz** — "ikki son oʻqib, yigʻindisini chiqar" kabi; 3 ta test holatida tekshiriladi.

**Tabrik:** `nom = qiymat — qutiga qoʻyish`, `Kuzatuv jadvali — dasturni satrma-satr tekshirish`, `input() matn qaytaradi, int() songa oʻgiradi`.

## 8. Ekran tuzilishi

27-oʻyindagidek uch zona. Kuzatuv jadvali ish maydonining oʻrtasida, eni ≤ 640 px; ustunlar 2 ta quti + buyruq matni. Kataklar 44 px balandlikda, klaviaturadan `Tab` bilan yuriladi.

## 9. Kod tuzilishi

```
29-nomli-qutilar/
├── js/logic.js        savollarni yasash: dastur, kutilgan jadval, kirishli masalalar
├── js/jadval.js       kuzatuv jadvali (ekran qismi)
├── js/game-art.js     yorliqli qutilar rasmi
├── js/scenes/…        kirish, uch bosqich, tabrik
└── tests/logic.test.js
```

## 10. 2026-10-02 qiyinlik yangilanishi

Sabab: hisobot-5 (C jadvali) — dasturlar 1–3 qadamli, kod yozish masalalari 3 ta (+, ×, −) edi.

- **1-bosqich (natija):** qadamlar soni zina bilan 1–2 → 2–3 → 3–4. **2-bosqich (kuzatuv jadvali):** 2–3 → 3–4 → 4–5.
  Yangi qadam turlari: `a = a - b`, `b -= k`, `a, b = b, a`, `a = a * b` (qiymatlar hamon 0–200 oraligʻida).
- **3-bosqich (kirishli natija):** yangi savollar — `input()` matnlarini qoʻshish va songa aylantirib qoʻshish
  (ikki kirish), `m = n` dan keyin `n` ni oʻzgartirish, `a, b = b, a + b`, `x * 2` (matn) va `int(x) * 2`.
- **Kod yozish 3 → 7:** `almashtir`, `uch-amal`, `daqiqa` (soat × 60 + daqiqa), `yosh` (matn va son birga).
  Test juftliklariga `[0, 0]` va `[-4, 9]` qoʻshildi — ayirmani teskari yozgan yechim yiqiladi.
- Testlar: 10 → 12.

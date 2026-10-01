# 57-oʻyin — «C++: massiv va saralash»

C++ blokining toʻrtinchi (oxirgi) oʻyini: mavzular 7–9 va 11 — massiv, satr, `vector`, `sort`.
Blok rejasi: [`../umumiy/CPP-BLOK.md`](../umumiy/CPP-BLOK.md).

- **Yosh:** 12–16, 💻. Oldin: «C++: qavs va takror».

## Nima yoziladi, nima oʻqiladi

Bu — «aralash» yoʻlning chegarasi aniq koʻrinadigan joyi:

| Mavzu | Bolaga nima |
|---|---|
| Massiv (`int a[100]`) | **yozadi** — yadroda ishlaydi |
| Satr (`s[i]`, `s.size()`) | **yozadi** — yadroda ishlaydi |
| `vector`, `sort` | **oʻqiydi** — yadroda yoʻq, chiqishi `g++` bilan tekshirilgan |

3-bosqich ochiq ogohlantirish bilan boshlanadi: *«Bu dasturlar oʻyin ichida ishga tushmaydi —
ularni oʻqiymiz. Haqiqiy kompilyatorda esa ishlaydi va aynan shu javobni beradi.»*
Bu — yolgʻon natija koʻrsatmaslik qoidasi (CPP-BLOK.md §6.4).

## Bosqichlar

**1. Massiv.** Indeks noldan; sikl bilan toʻldirish va oʻqish; `int a[4] = {5, 3, 9, 1};`.
Soʻng **chegaradan chiqish**: C++ tekshirmaydi, dastur toʻxtamaydi, javob buzilishi mumkin.
Savol tanlov koʻrinishida beriladi, chunki bu — aniqlanmagan xatti-harakat: uni koʻrsatib boʻlmaydi.
Mashqlar: «nima chiqaradi», chegara savoli va **kod yozish** (teskari chiqarish, oʻrtachadan katta).

**2. Satr.** `s.size()`, `s[i]`, harflar boʻylab sikl, bitta tirnoq (`'a'`) va qoʻshtirnoq farqi,
Pythondagi `s[1:4]` yoʻqligi. Mashqlar: «nima chiqaradi» va kod yozish (unlilar soni, teskari soʻz).

**3. `vector` va `sort`.** `push_back`, `size()`; `sort(v.begin(), v.end())` va
`sort(v.rbegin(), v.rend())`. Mashqlar: saralangan chiqishni aytish va toʻgʻri satrni tanlash.

## Qarorlar

- **Chegaradan chiqish misoli namunalarga kirmaydi** — uni `g++` bilan tekshirib boʻlmaydi
  (har kompilyatorda har xil natija). Shuning uchun u faqat savol sifatida beriladi, javobi esa
  «dastur toʻxtamaydi, lekin javob buzilishi mumkin».
- **Yadroga massiv roʻyxati qoʻshildi** (`int a[5] = {3, 1, 4};`, `int b[] = {7, 8};`): qolgan
  kataklar nol boʻlishi ham C++ dagidek, korpusda `g++` bilan tasdiqlangan.
- **«Oʻrtachadan katta» mashqi butun sonda yechiladi** (`a[i] * n > s`) — kasr boʻlish shart emas,
  shuning uchun yechim oddiy va aniq.

## Fayllar

- `js/logic.js` — massiv/satr misollari, chegara savoli, 4 ta yozish mashqi, vector misollari, 4 ta farq savoli.
- `tests/logic.test.js` — 12 test; vector misollari yadroda ishlamasligi ham qulflangan.

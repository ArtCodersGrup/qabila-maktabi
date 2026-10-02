# 33 — Roʻyxat va satr: dizayn

**Mavzu:** `list` va `str` — indeks, `len`, `append`, kesish, boʻylab yurish
**Yosh:** 12–16 · **Qurilma:** kompyuter (💻) · **Taxminiy davomiyligi:** 25–30 daqiqa
**Holati:** kod yozildi, testlar yashil — muallif koʻrib chiqishini kutmoqda (2026-09-30)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok rejasi: [`../umumiy/PYTHON-BLOK.md`](../umumiy/PYTHON-BLOK.md).
Blokdagi oʻrni: `32` Sanoqli takror → **33** → `34` Funksiya ustaxonasi.

> Bitta quti — bitta qiymat. Roʻyxat esa **yonma-yon turgan qutilar**: har birining oʻz raqami bor.

## 1. Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Roʻyxat yasaydi (`a = [5, 2, 9]`), elementini indeks bilan oladi va oʻzgartiradi.
2. **Indekslar 0 dan** boshlanishini biladi; oxirgisi — `len(a) - 1` yoki `a[-1]`.
3. `len`, `append`, `pop`, `sum`, `min`, `max`, `sorted` ni ishlatadi.
4. `IndexError` nima uchun chiqishini tushuntiradi.
5. Roʻyxat boʻylab ikki xil yuradi: `for x in a` va `for i in range(len(a))`.
6. Kesishni (`a[1:4]`, `soʻz[:3]`, `soʻz[-1]`) ishlatadi.
7. `input().split()` bilan bir satrdagi bir nechta sonni oʻqiydi — olimpiada masalalarining odatiy boshlanishi.
8. Eng kattasini, yigʻindini, sanoqni **oʻzi sikl bilan** topadi (tayyor funksiyasiz ham).

## 2. Qahramonlar va rasmlar

Oqsoqol va Shogird. Oʻyinga xos rasm (`js/game-art.js`, matnsiz): **raqamlangan qutilar qatori** — indeks tagida nuqtalar bilan koʻrsatiladi, tanlangani boʻyalgan.

## 3. Asboblar

Umumiy asboblar. Qadam-baqadam panelda roʻyxat qiymati `[1, 2, 3]` koʻrinishida chiqadi.

## 4. Oʻyin oqimi

```
Bosh ekran
   ├─► 1-bosqich: Qutilar qatori   [indeks 0 dan, len, oʻzgartirish, IndexError → mashq 3]
   ├─► 2-bosqich: Boʻylab yurish   [for x in a, yigʻindi/eng katta, kesish → mashq 3]
   └─► 3-bosqich: Satr ham qator   [harflar, split → mashq 3] → tabrik
```

## 5. 1-bosqich: Qutilar qatori

1. **Koʻrsatish:** `a = [5, 2, 9]` va uning indekslari rasmda. `a[0]`, `a[2]`, `a[-1]`, `len(a)`.
2. **Oʻzgartirish va qoʻshish:** `a[1] = 7`, `a.append(4)` — qadam-baqadam.
3. **IndexError:** `a[5]` ishga tushiriladi, xato xabari oʻqiladi.
4. **Taʼrif:** indekslar 0 dan; oxirgisi `len(a) - 1`.
5. **Mashq** (3 ta toʻgʻri): kichik roʻyxat bilan amallar, chiqish soʻraladi.

## 6. 2-bosqich: Boʻylab yurish

1. **Koʻrsatish:** `for x in a` va `for i in range(len(a))` yonma-yon.
2. **Yigʻindi va eng katta:** tayyor `sum`/`max` va sikl bilan yozilgani solishtiriladi.
3. **Kesish:** `a[1:3]`, `a[:2]`, `a[2:]`.
4. **Mashq** (3 ta toʻgʻri): sikl bilan yigʻish, sanash yoki kesish natijasi.

## 7. 3-bosqich: Satr ham qator

1. **Koʻrsatish:** satr ham indekslanadi: `soʻz[0]`, `soʻz[-1]`, `soʻz[1:4]`, `len(soʻz)`.
2. **`split`:** `input().split()` bir satrni soʻzlarga ajratadi; `int(...)` bilan songa oʻgiriladi.
3. **Mashq** (3 ta toʻgʻri), navbat bilan:
   - **Natijani top** — satr kesish yoki harflar boʻylab sanash.
   - **Kodni yoz** — bir satrdagi sonlarning yigʻindisi; eng kattasi; nechta juft; soʻzni teskari oʻqish; ikkinchi eng katta son.

**Tabrik:** `Indekslar 0 dan boshlanadi`, `for x in a — har element navbat bilan`, `input().split() — bir satrdan bir nechta qiymat`.

## 8. Ekran tuzilishi

27–32-oʻyinlardagidek.

## 9. Kod tuzilishi

```
33-royxat-va-satr/
├── js/logic.js     savollar: ro'yxat amallari, bo'ylab yurish, kesish, satr, kod yozish
├── js/game-art.js  raqamlangan qutilar qatori
├── js/scenes/…     kirish, uch bosqich, tabrik
└── tests/logic.test.js
```

## 10. 2026-10-02 qiyinlik yangilanishi

Sabab: hisobot-5 (C jadvali) — roʻyxatlar 3–5 ta musbat son (1–20), kod yozish 5 ta qotirilgan masala edi.

- **Roʻyxat zinasi:** 3–5 ta son (1…20) → 4–6 ta (1…30) → 4–7 ta (−9…30). Manfiy qiymat va manfiy indeks (`a[-1]`)
  birga kelganda bola ikkalasini farqlashi kerak.
- **1-bosqich:** `x = a.pop()`, `a[len(a) - 1] == a[-1]`, **`b = a`** (ikki nom — bitta roʻyxat: `b.append` dan keyin
  `len(a)` ham oʻzgaradi), `a[0], a[-1] = a[-1], a[0]`, `sorted(a)[1]`.
- **2-bosqich:** qoʻshnilarni solishtirish (`a[i] > a[i - 1]`), eng kattasining indeksi, **`best = 0` tuzogʻi**
  (hamma son manfiy — javob 0 boʻlib qoladi; yonida `max(a)` ham chiqadi), yangi roʻyxat yigʻish, `a[1:-1]`.
- **3-bosqich (satr):** `s[-2:]`, `in` / `not in`, `split()` va `sozlar[-1][0]`, harflarni solishtirish, `sorted(s)[0]`.
- **Kod yozish 5 → 9:** `eng-katta-indeks` (`int()` siz solishtirish «1 2 10» da yiqiladi), `qoshni-teng`,
  `anagramma`, `ikkinchi-har-xil` (takrorli roʻyxat — `sorted()[-2]` yiqiladi).
- Testlar: 10 → 14.

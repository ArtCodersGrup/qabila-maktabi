# 32 — Sanoqli takror: dizayn

**Mavzu:** `for` va `range` — aniq sonli takror, ichma-ich sikl, naqsh chizish
**Yosh:** 12–16 · **Qurilma:** kompyuter (💻) · **Taxminiy davomiyligi:** 25–30 daqiqa
**Holati:** kod yozildi, testlar yashil — muallif koʻrib chiqishini kutmoqda (2026-09-30)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok rejasi: [`../umumiy/PYTHON-BLOK.md`](../umumiy/PYTHON-BLOK.md).
Blokdagi oʻrni: `31` Takror charxi → **32** → `33` Roʻyxat va satr.

> `while` da hisoblagichni oʻzing oshirasan. `for` da esa Python sanab beradi —
> sen faqat **qayerdan qayergacha** ekanini aytasan.

## 1. Oʻquv maqsadlari

Oʻyindan keyin bola:

1. `for i in range(n):` yozadi va uni `while` bilan solishtiradi.
2. `range(n)` **0 dan boshlanishini** va `n` ning **oʻzi kirmasligini** aytadi.
3. `range(a, b)` va `range(a, b, qadam)` ni ishlatadi, shu jumladan manfiy qadam bilan.
4. Sikl necha marta aylanishini va oxirgi qiymatni oldindan aytadi.
5. Satr boʻylab yuradi: `for harf in soʻz:`.
6. Ichma-ich sikl yozadi va uning ichki qismi necha marta ishlashini hisoblaydi.
7. `"*" * i` bilan naqsh chizadi va koʻpaytirish jadvalini chiqaradi.

## 2. Qahramonlar va rasmlar

Oqsoqol va Shogird. Oʻyinga xos rasm (`js/game-art.js`, matnsiz): **zinapoya** — `n` ta zina, bosib oʻtilgani boʻyalgan.

## 3. Asboblar

Umumiy asboblar. Qadam-baqadam panel `for` uchun ham ishlaydi: sarlavha satri har aylanishda qayta yonadi va `i` qutisi yangi qiymat oladi.

## 4. Oʻyin oqimi

```
Bosh ekran
   ├─► 1-bosqich: Python sanaydi   [while va for yonma-yon → range chegaralari → taʼrif → mashq 3]
   ├─► 2-bosqich: Qayerdan qayergacha [range(a, b, qadam), satr boʻylab → mashq 3]
   └─► 3-bosqich: Ichma-ich sikl   [naqsh, koʻpaytirish jadvali → mashq 3] → tabrik
```

## 5. 1-bosqich: Python sanaydi

1. **Koʻrsatish:** bir xil ishni bajaradigan ikki kod — `while` va `for` — yonma-yon. `for` qisqaroq va hisoblagichni unutib boʻlmaydi.
2. **Chegaralar:** `range(5)` → 0, 1, 2, 3, 4. Boshi 0, oxiri kirmaydi. Zinapoya rasmida koʻrsatiladi.
3. **Taʼrif:** `for i in range(n):` — n marta aylanadi, `i` 0 dan `n−1` gacha.
4. **Mashq** (3 ta toʻgʻri): `for` sikli nima chiqaradi (chiqish ≤ 8 satr).

## 6. 2-bosqich: Qayerdan qayergacha

1. **Koʻrsatish:** `range(2, 6)`, `range(1, 10, 3)`, `range(10, 0, -2)` — uchalasi ishga tushiriladi.
2. **Satr boʻylab:** `for harf in "qabila": print(harf)`.
3. **Taʼrif:** `range(boshi, oxiri, qadam)` — oxiri **kirmaydi**; qadam manfiy boʻlsa, teskari sanaydi.
4. **Mashq** (3 ta toʻgʻri): chegaralar va qadam bilan savollar; ayrimlarida "nechta marta aylandi" soʻraladi.

## 7. 3-bosqich: Ichma-ich sikl

1. **Koʻrsatish:** ikki qavatli sikl — tashqi 3 marta, ichki 4 marta → ichki qism 12 marta ishlaydi. Qadam-baqadam koʻrsatiladi.
2. **Naqsh:** `print("*" * i)` bilan uchburchak.
3. **Mashq** (3 ta toʻgʻri), navbat bilan:
   - **Natijani top** — ichma-ich sikl yoki naqsh.
   - **Kodni yoz** — koʻpaytirish jadvalining bir qatori; toʻgʻri uchburchak; a dan b gacha yigʻindi; soʻzdagi unlilar soni; nechta juft son bor.

**Tabrik:** `for i in range(n) — n marta, 0 dan n−1 gacha`, `range(a, b) — oxiri kirmaydi`, `Ichma-ich sikl: tashqi × ichki`.

## 8. Ekran tuzilishi

27–31-oʻyinlardagidek.

## 9. Kod tuzilishi

```
32-sanoqli-takror/
├── js/logic.js     savollar: range, chegaralar, satr bo'ylab, ichma-ich sikl, kod yozish
├── js/game-art.js  zinapoya rasmi
├── js/scenes/…     kirish, uch bosqich, tabrik
└── tests/logic.test.js
```

## 10. 2026-10-02 qiyinlik yangilanishi

Sabab: hisobot-5 (C jadvali) — ichma-ich sikllar faqat «n × m», kod yozish 5 ta qotirilgan masala edi.

- **1-bosqich (`range(n)`):** zina 1–2 da — `print(i, i * i)`, sikldan keyin `print(i)` (hisoblagich oxirgi qiymatida
  qoladi), yigʻib boruvchi `s = s + i`, satr yigʻish (`soz + str(i)`).
- **2-bosqich (chegara, qadam):** oxiri qadamga toʻgʻri kelmaydigan `range(4, 13, 4)`, shartli sanash (`i % 3 == 0`),
  manfiy qadam bilan sanash, `break` (toʻxtagan paytdagi `i`), `continue` (undoshlarni sanash).
- **3-bosqich (`NESTED` 4 → 9):** `for j in range(i + 1, n)` — uchburchak juftliklar; `for j in range(i)`;
  `if i == j: continue`; ichki siklda satr yigʻish; yigʻindisi k boʻlgan juftliklar soni.
- **Kod yozish 5 → 9:** `uchga-bolinuvchi` (a..b, ikkala chegara kiradi), `teskari-uchburchak`,
  `jadval` (n × n koʻpaytirish jadvali — satr yigʻib chiqariladi, `print(end=…)` talqinchida yoʻq),
  `juftliklar` (i < j, i + j = k — ikki marta sanash va i = j xatolari testda yiqiladi).
- Zina: 0 — eski sodda shakllar; 1–2 — yangilari ustun. Testlar: 9 → 12.

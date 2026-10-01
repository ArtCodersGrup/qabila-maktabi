# 40 — Qadamlar soni va O(n): ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok rejasi: [`../umumiy/ALGORITM-BLOK.md`](../umumiy/ALGORITM-BLOK.md).

- [x] **1. Mantiq** — `js/logic.js`: yettita kod namunasi (har biri n boʻyicha quriladi), `olcha()` talqinchining qadam sanagichini oʻqiydi, `olchovlar()`, `nisbat()` va `sinfniTop()`; toʻrt sinf (`O(1)`, `O(log n)`, `O(n)`, `O(n²)`) va toʻrt xil savol.
- [x] **2. Testlar** — `tests/logic.test.js` (14 ta): har namunaning **oʻlchangan** nisbati oʻz sinfiga tushishi, O(1) da n oshsa ham qadam oʻzgarmasligi, qadamlarning kamaymasligi, savol javoblarining oʻlchovga mosligi, hisob qoidasining butun son berishi, takrorlanmaslik, tutuq belgisi.
- [x] **3. Ekran** — oʻsish grafigi (gorizontal ustun: nomi, ×nisbat, sinf nomi) va oʻlchov jadvali («oldingidan» ustuni bilan, yopiq qator «?»).
- [x] **4. Sahnalar** — jadval koʻz oldida toʻladi; toʻrt usul yonma-yon qoʻyilib nom oladi; qoida bilan hisoblash (n → 2n) va amaliy tanlov.
- [x] **5. Bosh sahifa va oflayn** — `bosh.js`, ikonka (`osish`), `sw.js` (`v58`), havola raqamlari (`havolalar.json` + `renumber.js`).
- [x] **6. Tekshiruv** — testlar yashil (oʻyin 14 + umumiy 144); brauzerda uch bosqich oxirigacha oʻynaldi, konsol toza, 390px da sahifa yon tomonga siljimaydi.

## Oʻyin davomida topilgan va tuzatilgan xatolar

1. **Kod qutisi oʻngga chiqib ketdi** — namunaning birinchi satri uzun izoh bilan edi (`a = [n, ..., 2, 1]   # n ta son, teskari`). Izoh alohida satrga chiqarildi.
2. **Soxta funksiya** — koʻrsatiladigan kodda `almashtir(a[i], a[i+1])` bor edi; bunday funksiya Pythonda yoʻq. 39-oʻyinda oʻrganilgan uch satrli almashtirishga almashtirildi.
3. **Grafik ustunlari tekis turmadi** — `O(log n)` boshqalardan uzun, ustun kengligi suzardi. `width` qatʼiy qilindi (DOM oʻlchovi bilan tekshirildi).
4. **Hisob savollari takrorlanishi mumkin edi** — `hisobTask` ga oldingi savol berilmagan edi.

## Qoladi

- Muallif oʻyinni va butun blokni (36–40) oʻzi koʻrib chiqadi.
- Keyingi blok — **kombinatorika** (kelishilgan, hali boshlanmagan).

# 43-oʻyin — «Jamoa tanlash»

Kombinatorika blokining markaziy oʻyini: **birikma `C(n,k)`** va asosiy savol — **tartib muhimmi?**

- **Yosh:** 12–16. 💻 Kompyuter uchun.
- **Oldin oʻtilgan:** 41 (× va +), 42 (`n!`, `A(n,k)`).

## Asosiy fikr

`C(n,k)` formulasi yodlatilmaydi — u **takrorni sanashdan** chiqadi:

1. 5 boladan 3 tasini tartib bilan tanlash — 60 ta natija (42-oʻyindagi `A`).
2. Roʻyxatga qaraladi: `Anvar–Dilnoza–Sardor` va `Anvar–Sardor–Dilnoza` — bir xil jamoa.
3. Bitta jamoa necha marta takrorlangan? Uch kishining tartiblari soni — `3! = 6`.
4. Demak `60 ÷ 6 = 10`. Shundan `C(n,k) = A(n,k) ÷ k!`.

Ekranda shu toʻrt qadam ketma-ket koʻrsatiladi, oxirida 10 ta jamoa sanab chiqiladi.
Test `A = C × k!` ni **roʻyxatlar ustida** tekshiradi (n = 1…5, hamma k).

## Eng muhim mashq

Bolaning asosiy xatosi — `A` va `C` ni adashtirish. Shuning uchun 2-bosqich butunlay shunga
ajratilgan: savol beriladi, bola **sonni** yozadi, va har savolning «boshqa qoida» javobi ham
hisoblangan (`task.xato`). Ikkala qoida bir xil javob beradigan savollar (`k = 1`) umuman berilmaydi —
mantiq ularni oʻtkazmaydi.

Ishora bitta savol bilan beriladi: **«ikki bolaning oʻrni almashsa, bu boshqa javobmi?»**

| Holat | Tartib | Qoida |
| --- | --- | --- |
| 5 boladan 3 kishilik jamoa | muhim emas | `C(5,3) = 10` |
| 5 boladan 1-, 2-, 3-oʻrin | muhim | `A(5,3) = 60` |
| 10 nuqtadan chiziq | muhim emas | `C(10,2) = 45` |
| 2 kitob: biri menga, biri senga | muhim | `A(n,2)` |

## 3-bosqich: kod

«Tartib muhim emas» kodda bitta joyda koʻrinadi — **ichki sikl `i + 1` dan boshlanadi**:

```python
for i in range(n):
    for j in range(i + 1, n):
        soni += 1
```

Agar `range(n)` boʻlsa, har juftlik ikki marta sanaladi — test aynan shu xato yechimni rad etadi.
Yozish masalalari: `tanla(n, k)` (avval koʻpaytir, keyin `k!` ga boʻl — BigInt boʻlgani uchun aniq)
va `juftlar(n)`.

## Fayllar

- `js/logic.js` — jamoalar/tartiblar roʻyxati, `bolish()`, savollar, kod masalalari, `C` xossalari.
- `tests/logic.test.js` — 12 test; eng muhimi `A = C × k!` ning roʻyxat ustidagi isboti.

## 2026-10-02 qiyinlik yangilanishi

Hisobot-5 bu oʻyinni «yaxshi» deb baholagan; qoʻshilgani — **ikki qoida birga** keladigan savol va ikki masala.

- **2-bosqich (A mi, C mi):** oxirgi zinada **aralash jamoa** — «q ta qiz va o ta oʻgʻil; 2 qiz VA 1 oʻgʻildan jamoa»:
  C(q, 2) × C(o, 1). Eng koʻp uchraydigan xato — hammadan birga tanlash C(q + o, 3). Javob testda jamoalar
  roʻyxatini sanab tekshirilgan. Maslahat: «har guruhdan alohida tanla, keyin VA». Yana: k katta boʻlgan C
  (9 tadan 7 tasi — simmetriya bilan oson), 4 oʻrinli A.
- **3-bosqich (yozish 2 → 4):** `uchliklar(n)` (uch sikl, k > j > i — `k` ni `i + 1` dan boshlagan yechim yiqiladi)
  va `jamoa(q, o)` (tartibli juftlik deb sanagan yechim yiqiladi).
- Zina: 0 — eski savollar; 2 — aralash savol ustun. Testlar: 12 → 14.

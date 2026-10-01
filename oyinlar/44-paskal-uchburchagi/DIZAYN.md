# 44-oʻyin — «Paskal uchburchagi»

Kombinatorika blokining toʻrtinchi oʻyini: `C(n,k)` ni **faqat qoʻshish bilan** topish.

- **Yosh:** 12–16. 💻 Kompyuter uchun.
- **Oldin oʻtilgan:** 43 (`C(n,k)` = `A ÷ k!`), 33 (roʻyxatlar).

## Asosiy fikr

43-oʻyinda `C(5,3)` ni topish uchun `60 ÷ 6` qilingan edi. Bu uzun. Paskal uchburchagida
xuddi oʻsha son **ikkita sonni qoʻshish** bilan chiqadi — koʻpaytirish ham, boʻlish ham kerak emas.

Oʻyin shu tartibda boradi:

1. Chekkalarga 1 yoziladi, ichkarisi — tepasidagi ikki sonning yigʻindisi.
2. Bola 3-qatorni **oʻzi toʻldiradi** (ikkita katak, raqam klaviaturasi bilan).
3. Uchburchak 8-qatorgacha oʻsadi.
4. Keyin ochiladi: 5-qator, 3-son — bu 10, yaʼni **oʻtgan oʻyindagi 10 ta jamoa**.

Nomi oxirida beriladi (QOIDALAR §4.1): avval qurish, keyin «bu — `C(n,k)`».

## Xossalar (2-bosqich)

| Xossa | Ekranda |
| --- | --- |
| Chekkalari 1 | `C(n,0) = C(n,n) = 1` |
| Simmetriya | ikki qiyshiq qator bir vaqtda belgilanadi |
| Qator yigʻindisi `2ⁿ` | butun qator belgilanadi: `1+4+6+4+1 = 16` |
| Ikkinchi qiyshiq qator | `1, 2, 3, 4 …` = `C(n,1)` |
| Uchinchi qiyshiq qator | `1, 3, 6, 10 …` = juftliklar soni (qoʻl berib koʻrishish) |

## Oʻlchamlar

Uchburchak **0–8-qatorlar** bilan cheklangan: shunda eng katta son 4 xonali (`126`) boʻlib qoladi
va 9 ta qator telefon ekraniga ham sigʻadi (katak 48×36 px, torroq ekranda 36×30). Testda shu
qulflangan: sonlar 4 xonadan oshmaydi.

## 3-bosqich: kod

Roʻyxat bilan qator quriladi (`33-oʻyin` davomi):

```python
a = [1]
for i in range(n):
    yangi = [1]
    for j in range(len(a) - 1):
        yangi.append(a[j] + a[j + 1])
    yangi.append(1)
    a = yangi
```

Yozish masalalari: `qator(n)` va `c(n, k)`. Test oxiriga `1` qoʻshishni unutgan yechimni rad etadi.

## Fayllar

- `js/logic.js` — `JADVAL` (`sanash.paskal`), `tepa()`, savollar, kod masalalari.
- `tests/logic.test.js` — 13 test: har katak `C(n,k)` ga teng, tepasidagi ikkitaning yigʻindisi,
  qator yigʻindisi `2ⁿ`, ekranga sigʻishi, uchinchi diagonal `1, 3, 6, 10`.

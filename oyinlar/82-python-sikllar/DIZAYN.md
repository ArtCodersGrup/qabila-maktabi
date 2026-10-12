# 82 — for va while: dizayn

**Mavzu:** `for` / `range`, roʻyxat boʻylab `for`, `while`, hisoblagich va yigʻindi naqshi — IX sinf «Sunʼiy intellekt», 10-dars
**Toifa:** yuqori (9–11), 14–15 yosh · **Qurilma:** kompyuter (💻, `pc: true`) · **Holati:** kod yozildi, testlar yashil (2026-10-12)

Reja: [`../../docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md`](../../docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md).
Hamma misol maʼlumot va model haqida: yorliqlarni sanash, oʻrtacha, aniqlik, xato kamayguncha oʻqitish.

## Oʻquv maqsadlari

Oʻyindan keyin oʻquvchi:

1. `for` (roʻyxat, `range(n)`, `range(a, b, qadam)`) va `while` sikli necha marta aylanishini hisoblaydi — shu jumladan 0 marta, `break`, `continue`, ichma-ich sikl.
2. Hisoblagich (`soni = 0` → `soni += 1`) va yigʻindi (`jami = 0` → `jami += x`) naqshlarini taniydi va toʻldiradi.
3. Shu naqshlardan oʻrtacha, aniqlik (toʻgʻri / jami), eng katta qiymat va uning indeksini chiqaradi.
4. `while` da davom etish shartini yozadi; cheksiz siklni taniydi va tuzatadi.
5. Kirishdan `n` va `n` ta qiymatni oʻqib, sanash / yigʻindi / oʻrtacha dasturini oʻzi yozadi; toʻxtash belgisi (`-1`) va erta toʻxtatish bilan ishlaydi.
6. Cheklovni tushuntiradi: nomutanosib sinflarda yuqori aniqlik aldashi mumkin — sinflar alohida sanaladi.

## Bosqichlar

| Bosqich | Koʻrsatish | Mashq (`js/logic.js`) |
|---|---|---|
| 1. Necha marta aylanadi | qadam-baqadam: roʻyxat boʻylab `for`; xato yarimlanadigan `while` | `sanoqTask` — 14 shakl (zina 0: 4, 1: 5, 2: 5); belgilangan satr necha marta bajariladi — javob son (ekran klaviaturasi) |
| 2. Sanash va yigʻindi | hisoblagich; yigʻindi → oʻrtacha → aniqlik; nomutanosib sinflar | navbat bilan: `hisobTask` — 12 shakl (3 / 4 / 5), natijani ayt; `naqshTask` — 8 shakl (2 / 3 / 3), `___` ni toʻldir |
| 3. Oʻzing yoz | cheksiz sikl; kirishdan oʻqish | navbat bilan: `tuzatTask` — 9 ta mantiqiy xato (3 / 3 / 3) va `yozTask` — 10 ta masala (3 / 4 / 3) |

1-bosqich javobi mustaqil tekshiriladi: test belgilangan satrni talqinchining qadam izidan (`trace`) sanaydi.
Terish xatosi urinish sanalmaydi (QOIDALAR 4.4). Talqinchi cheklovlari: `round`, `list.count`, `while … else`, `enumerate` yoʻq — misollarda ishlatilmaydi;
kasr natijalar toza chiqadigan qilib tanlangan (generator uzun kasrli chiqishni rad etadi).

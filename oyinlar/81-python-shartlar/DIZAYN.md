# 81 — Shartlar va tarmoqlanish: dizayn

**Mavzu:** `if / elif / else`, solishtirish, `and` `or` `not` — IX sinf «Sunʼiy intellekt», 9-dars
**Toifa:** yuqori (9–11), 14–15 yosh · **Qurilma:** kompyuter (💻, `pc: true`) · **Holati:** kod yozildi, testlar yashil (2026-10-12)

Reja: [`../../docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md`](../../docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md).
Hamma misol maʼlumot va model haqida: chegara boʻyicha qaror (ehtimol ≥ 0.5 → spam), aniqlik toifalari, qoidali tasniflagich.

## Oʻquv maqsadlari

Oʻyindan keyin oʻquvchi:

1. Model chiqishini (son) chegara bilan qarorga aylantiradi; `>=` va `>` chegaraning oʻzida turli natija berishini koʻrsatadi.
2. `elif` zanjiri birinchi rost shartda toʻxtashini biladi va notoʻgʻri tartibdagi zanjirni topadi.
3. Soʻz bilan berilgan qoidani shartga aylantiradi: `and`, `or`, `not`, oraliq (`a <= x < b`), qavs.
4. Tasniflagichdagi mantiqiy xatoni sinovlar jadvali orqali topib tuzatadi (chegara, tartib, ikki alohida `if`, `and`/`or`, qavs, otstup).
5. Qoidali tasniflagichni oʻzi yozadi: uch zonali qaror, koʻpchilik ovozi, TP/TN/FP/FN, qaror daraxti.
6. Ortiqcha signal (FP) va payqalmagan holat (FN) farqini, chegara tanlash masʼuliyatini va qoidadagi noxolislikni (bias) tushuntiradi.

## Bosqichlar

| Bosqich | Koʻrsatish | Mashq (`js/logic.js`) |
|---|---|---|
| 1. Natijani ayt | qadam-baqadam: qaysi tarmoq bajariladi; 0.5 da `>=` va `>` | `natijaTask` — 10 shakl (zina 0: 2, 1: 4, 2: 4); javob — chiqish matni |
| 2. Shartni toʻldir | `elif` zanjiri; `and`/`or`/`not` | `toldirTask` — 10 shakl (2 / 4 / 4); `___` oʻrniga shart yoziladi, 3–7 ta sinov bilan tekshiriladi |
| 3. Qoidali tasniflagich | qaror daraxti; FP/FN va noxolislik | navbat bilan: `tuzatTask` — 9 ta mantiqiy xato (3 / 3 / 3) va `yozTask` — 10 ta masala (3 / 4 / 3) |

Terish xatosi (sintaksis, otstup, saytda yoʻq buyruq) urinish sanalmaydi (QOIDALAR 4.4). Maslahat — qayerga qarash kerakligi va oʻtmagan sinov; yechim emas.
Talqinchi cheklovlari hisobga olingan: `round`, uchlik ifoda (`a if c else b`), f-satr ishlatilmaydi. Bola teradigan chiqishlarda `ʻ ʼ` belgilari yoʻq.

# 71 — Matn yozamiz: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok dizayni:
[`../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md`](../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md).

- [x] **1. Mantiq** — matnlar banki (18 gap, 7 sheʼr, 6 roʻyxat), `teng`/`norm`, `farq` (15 tur), xato generatori, `tuzat`/`qator`/`belgi`/`sarlavha`/`beza` generatorlari (`tier` bilan), HTML tahlili (`htmlBolaklar`, `tozaHtml`), `bezakTekshir`, hujjat nomi.
- [x] **2. Testlar** — 18 ta: tenglik va apostroflar, farqning har turi, bank shakli, `buz`, generatorlar har tierda 150–300 martadan (aynan kerakli xato soni, soʻz chegarasi, bankdagi asl, takror yoʻq), bezak tekshiruvi (toʻgʻri/notoʻgʻri HTML, `strong`/`em`, `&nbsp;`, `<br>`, `<div>`).
- [x] **3. Ekran** — «Matn» oynasi (`js/muharrir.js`): asboblar, nom chiplari, textarea / contenteditable, holat satri; «Hujjatlar» (`js/hujjatlar.js`).
- [x] **4. Sahnalar** — kirish, uch koʻrsatish (bola oʻzi teradi, pufak holatga qarab), mashq ekranlari, saqlash, tabrik, erkin yozish va hujjatlar.
- [ ] **5. Bosh sahifa** — blok oxirida bitta qadam (`GAMES`, `pc: true`, ikonka, `sw.js`, `README.md`).
- [ ] **6. Koʻrik** — brauzerda (Chrome, Safari; 360 px) va bolalarda sinov — muallifda.

## Yoʻl-yoʻlakay tanlangan yechimlar

1. **2-xatodan keyin koʻchirish** urinish sanalmaydi: `practice.tries` vazifani yechim bilan (★) yopadi, keyin bola kutilgan matnni koʻchiradi — teng boʻlishi bilan oʻzi tugaydi, «Oʻtkazib yuborish» ham bor (qotib qolmaslik uchun).
2. **Bezak DOM orqali emas, HTML satri orqali** tekshiriladi — oʻz kichik tahlilchimiz (Node'da test qilinadi). Chrome `<b>`, Safari `<span style>` chiqarsa ham ikkalasi tushuniladi.
3. **Belgilash boʻsh joy bilan birga** boʻlsa ham toʻgʻri (ikki marta bosish Windows'da boʻsh joyni ham oladi) — soʻz harflari boʻyicha tekshiriladi.
4. **Rang palitrasi: koʻk, yashil, binafsha** — qizil yoʻq (QOIDALAR: qizil xato belgisi emas, lekin umuman ishlatilmaydi); toʻq sariq — «yana urin» rangi, chalgʻitmasin.
5. **Tier 0 da xato soʻz chip bilan aytiladi** («Shu soʻzni tuzat: «yashydi»»), lekin gap ichida yoritilmaydi — textarea ichini yoritib boʻlmaydi; bola soʻzni gapdan oʻzi topadi.
6. **2-bosqich mashqi qator → belgi → sarlavha** navbatida; `qator` da namuna koʻrsatiladi (qayerdan boʻlishni bola bilmaydi), `sarlavha` va `belgi` da — yoʻq.
7. **Ctrl+Enter** — 2–3-bosqich va erkin yozishda «Tayyor»; 1-bosqichda hech narsa qilmaydi (matnga qator ham qoʻshmaydi).
8. **Hujjat HTML'i tozalanadi** (`tozaHtml`: faqat `b`, `i`, `font color`, `br`) — saqlash va ochishda; qoʻyilgan (paste) matn oddiy matn boʻlib tushadi.
9. **«Tayyor» va asboblar** — `data-amal` bilan; tugma fokusni olmaydi, belgilash yoʻqolmaydi.
10. **kod.css ulanmaydi** — `.pbox`, `.note`, `.answer` oʻyinning oʻz CSS'ida.

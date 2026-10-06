# 72 — Brauzer va sayt: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok dizayni: `docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md` («72 — Brauzer va sayt»).

- [x] **1. Mantiq** — saytlar banki (10 sayt, 18 sahifa), tarix (`yangi`, `och`, `havola`, `orqaga`, `oldinga`, `qidirOch`, `natija`, `chiq`, `takliflar`), `qidir`, sakkiz vazifa generatori (`tier` bilan), tekshiruvlar.
- [x] **2. Testlar** — 15 ta: bank butunligi, manzil tozalash, tarix, qidiruv (harf/apostrof), xazina banki (natija oʻrni tier ga mos, avtomat yoʻl), har generator har tierda 120–150 marta, tekshiruvlar, takror yoʻq, navbat.
- [x] **3. Brauzer oynasi** (`js/brauzer.js`) — asboblar, manzil satri (input / chiplar), sahifa, «sayt yoʻq», qidiruv, qalqib oyna, soʻrov shakli, yoritish, sinov ilgagi `QK.brauzer`.
- [x] **4. Sahnalar** — kirish, 1-bosqich (manzil → havola → orqaga, oxirida xatchoʻp), 2-bosqich (qidiruv), 3-bosqich (qalqib, soʻrov, qulf), tabrik.
- [ ] **5. Bosh sahifa** — blok oxirida bitta qadamda (`GAMES`, ikonka, `sw.js`, README) — bu oʻyin papkasidan tashqarida.

## Yoʻl-yoʻlakay tanlangan yechimlar

1. **Qidiruv natijasi tarixga yoziladi** — «Orqaga» natijalar roʻyxatiga qaytaradi (bola sahifani ochib, yoqmasa qaytadi).
2. **Xazina tier i bankda qoʻlda** belgilangan va test kalit soʻz boʻyicha natija oʻrnini tekshiradi — matn oʻzgarsa test darrov ushlaydi.
3. **2-xatoda yurish vazifalari boshlangʻich sahifadan qayta bajariladi** — bola qayerga adashgan boʻlmasin, koʻrsatilgan qadamlar toʻgʻri.
4. **Soʻrovchi saytlar** qidiruvda va telefon chiplarida yoʻq — ular faqat 3-bosqichda ochiq holda beriladi.
5. **Soʻrovda «Orqaga» va boshqa saytni ochish ham toʻgʻri** — muhimi yozmaslik va chiqib ketish.
6. **Tor ekranda asbob yozuvlari yashirinadi** (← → ↻ belgisi qoladi, `aria-label` bor) — manzil satriga joy kerak.

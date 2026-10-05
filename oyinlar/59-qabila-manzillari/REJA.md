# 59 — Qabila manzillari: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok rejasi: [`../umumiy/INTERNET-BLOK.md`](../umumiy/INTERNET-BLOK.md).

- [x] **1. Mantiq** — manzil tekshiruvi (`tekshir`: boʻlaklar soni, son emas, > 255, ortiqcha 0, boʻsh boʻlak), ichki tarmoq manzillari, xato manzil turlari (tier bilan), daftarlar (DNS) zanjiri, kesh hisobi (`soniHisob`), sakkiz savol generatori.
- [x] **2. Testlar** — 10 ta: chegaralar (0, 255, 256), tasodifiy manzillar doim toʻgʻri / xatolar doim xato, aynan bitta xato, uylar bitta son bilan farqlanadi, daftarlar takrorlanmaydi, zanjir javobi, kesh hisobi, navbat.
- [x] **3. Ekran** — uy kartasi (rasm + manzil HTML'da), konvert, daftar jadvali, uch daftar zanjiri (telefonda ustun boʻlib), soʻrovlar va javon.
- [x] **4. Sahnalar** — kirish (xarita), 1-bosqich (konvertni uyga eltish → IP, 0–255), 2-bosqich (mahalla → shahar daftari → DNS), 3-bosqich (javon → kesh, eskirgan manzil), tabrik.

## Yoʻl-yoʻlakay tanlangan yechimlar

1. **Cheksiz sikl** — «oʻxshash uylar» generatori chegarada (uchinchi son 0) yetarli farqli uy topolmasdi; sikl 40 urinish bilan cheklandi, topilmasa boshqa asos olinadi.
2. **Toʻgʻri javob — asos uy**: qolgan uylar aynan undan bitta son bilan farq qiladi (aks holda variantlar oʻzaro ikki son bilan farqlanib, savol osonlashardi).
3. **Domenlar faqat lotin harflari** (`toglar.uz`, `oyin.uz`) — haqiqiy domenda `ʻ` boʻlmaydi.
4. **IPv6 va DNS ierarxiyasining haqiqiy nomlari kiritilmadi**; finalda bitta «haqiqatda…» satri.

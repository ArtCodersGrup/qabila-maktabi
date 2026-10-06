# 70 — Kichik rassom: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok dizayni:
[`../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md`](../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md).

- [x] **1. Mantiq** — palitra (12) va asboblar (7); rasterlash: chiziq (Brezenxem, yoʻnalishdan mustaqil), toʻrtburchak, ellips (Zingl, bbox ichida, simmetrik), uchburchak (uchi tepada, koʻzgu-simmetrik); chelak (4-qoʻshni); tarix (bekor/qaytar, 50); kodla/och (run-length, rang — harf); 6 namuna (uy, daraxt, quyosh, mashina, kema, robot); qadam vazifasi va tekshiruvi (85 % / 90 %); 1-bosqich generatorlari (shakl, toʻldir, bekor — tier bilan); harakat jurnali tekshiruvi.
- [x] **2. Testlar** — 18 ta: rasterlash (ikkala yoʻnalish, chegara/ichi, simmetriya, kichik oʻlchamlar), chelak (chegaradan oʻtmaydi, boʻsh maydon, bir xil rang), bajar, tarix (50 chegarasi), kodla/och aylanma va buzuq satrlar, namunalar (6 ta, chegara ichida, boʻsh emas, yarmi koʻrinadi, javob tekshiruvdan oʻtadi), qadam tekshiruvi (85 % chegarasi, ortiqcha, rang, qiyin 90 %), generatorlar har tierda 200–300 marta (takror yoʻq, javob toʻliq), jurnal tekshiruvi (toʻgʻri va notoʻgʻri holatlar).
- [x] **3. Taxta** — ikki canvas, Pointer Events (`setPointerCapture`), preview, soya, panel (asboblar + «ichi toʻla», palitra, amallar), holat satri, tezkor tugmalar (`e.code`, Mac `⌘`, `preventDefault`), tinglovchilar `ui.onCleanup` bilan va yangi taxta yasalganda tozalanadi; `QK.taxta` sinov ilgagi.
- [x] **4. Sahnalar** — kirish; 1-bosqich koʻrsatishi (4 harakat bola oʻzi qiladi) va mashq (jurnal tekshiruvi, maslahatda tugma yonadi, yechim animatsiya bilan); 2-bosqich «uy» (soya, avtomatik tekshiruv, «Tayyor», takror qadam); 3-bosqich (Ctrl+Z koʻrsatishi, namuna tanlash kartalari); tabrik: erkin chizish, «Mening rasmlarim» (ochish, PNG, ikki bosqichli oʻchirish), namunalarni bahosiz chizish.
- [x] **5. Hujjatlar** — `DIZAYN.md`, `REJA.md`.
- [ ] **6. Bosh sahifa** — blok oxirida bitta qadam: `bosh/js/bosh.js` (`GAMES`, `icon: "rassom"`), ikonka, `sw.js`, `README.md`, QOIDALAR §3 (sudrash istisnosi).
- [ ] **7. Koʻrik** — brauzerda (telefon 360 px va kompyuter) va bolalarda sinov — muallifda.

## Yoʻl-yoʻlakay tanlangan yechimlar

1. **Ellips — Zingl algoritmi** (markaz-nuqta testi emas): 3 × 3 — plus, 6 × 6 — haqiqiy doira; juft oʻlchamlarda ham simmetrik. Eni yoki boʻyi 1 — chiziq.
2. **Uchburchakning oʻng qirrasi chap qirraning koʻzgusi** — Brezenxem oʻzi simmetrik emas; chap qirra uchidan boshlab chiziladi (uchi bitta katak).
3. **Chiziq yoʻnalishdan mustaqil**: doim chapdagi uchdan chiziladi — a → b va b → a bir xil.
4. **Qadam tekshiruvida «oldin» taxtasi**: ortiqcha kataklar qadam boshidagi holatga nisbatan sanaladi — oldingi qadamlar ortiqcha emas.
5. **Qalam qadami darhol tekshirilmaydi** (bola koʻp sur bilan chizadi); shakl/chelak — darhol.
6. **2-xatodan keyin qadam takrorlanadi** («Endi oʻzing chiz»), taxta qadam boshiga qaytariladi — `practice.exercises` hisobi bilan mos.
7. **Har qadamda tarix yangidan** — «Bekor» oldingi qadamlarni buzmaydi, yechimga bekor bilan qaytib boʻlmaydi.
8. **Uy — 6 qadam** (moʻri qoʻshildi), robotning qoʻl-oyoqlari — qalam qadamlari.
9. **Bitta taxta bir vaqtda**: `taxtaYasa` oldingi taxtani yopadi — har vazifada yangi taxta yasalganda `keydown` tinglovchilari toʻplanib qolmaydi.
10. **Sudrash boshlanganda asbob/rang qotiriladi** — ikkinchi barmoq bilan tugma bosilsa ham harakat buzilmaydi.
11. **kod.css ulanmaydi** — `.pbox`, `.answer` oʻyinning oʻz CSS'ida.

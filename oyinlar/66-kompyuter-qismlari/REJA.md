# 66 — Kompyuter qismlari: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok dizayni:
[`docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md`](../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md).

- [x] **1. Mantiq** — 9 qism (nom, ish, yoʻnalish, guruh), 16 vaziyat, ikki ketma-ketlik (6 qadamdan, qoʻlda tanlangan toʻplamlar), zararli ishlar va yaxshi odatlar; sakkiz generator (`tier` bilan); `tekshir` (bitta javob / toʻplam / tartib) va `ishora` (maslahat).
- [x] **2. Testlar** — 22 ta: qismlar, bir xil vazifali qurilmalar qoidasi, har generator har tierda yuzlab marta (variantlar soni, takror yoʻq, javob ichida, ketma-ket bir xil `id` yoʻq), toʻplam hajmi, qadamlar soni, bosqich navbatlari, xato bilan toʻliq oʻyin, maslahat javobni aytmasligi, matn belgilari, rasmlar, stoldagi tugmalar ≥ 48 px, qizil rang yoʻqligi, `index.html`.
- [x] **3. Rasmlar** — 9 qism (har biri oʻz shakli va rangi bilan), stol foni, shogird rasmi, tabrik rasmi.
- [x] **4. Ekran** — rasm-tugma, stol ustidagi kompyuter (har qism alohida tugma), koʻp tanlov («Tayyor»), tartiblash kartalari («Tayyor», «Tozalash»), oʻyinchoq ekran.
- [x] **5. Sahnalar** — kirish, 1-bosqich (qismlarni bosib tanishish), 2-bosqich (qurilmalar oʻz tomoniga oʻtadi → kiritish/chiqarish), 3-bosqich (kompyuterni oʻzi oʻchiradi → tartib va ehtiyot), tabrik.
- [ ] **6. Bosh sahifa** — `tanishuv` boʻlimi, `GAMES`, ikonka, `sw.js`, README: blok oxirida bitta qadamda ulanadi (bu oʻyin faqat oʻz papkasiga yozadi).
- [ ] **7. Koʻrik** — muallif telefonda va kompyuterda koʻradi; bolalarda sinov.

## Yoʻl-yoʻlakay tanlangan yechimlar

1. **`vazifa` turi tier 1 da ham chiqadi.** Dizaynda u tier 2 ga yozilgan, lekin 1-bosqichda 4 ta javob kerak — `practice.js` da tier 2 ga yetilmaydi (0, 0, 1, 1). Aks holda bola vazifani faqat qiyin rejimda koʻrardi, oʻquv maqsadi esa «nomi va vazifasi bilan taniydi». Navbat: `nom`, `nom`, `rasm`, `vazifa`.
2. **Tartib toʻplamlari qoʻlda tanlangan**, tasodifiy kesim emas — har toʻplam mustaqil holda ham maʼnoli va tartibi bir xil tushuniladi. Oʻchirishga 6-qadam («Stulni joyiga sur»), yoqishga «Qoʻling quruqligini tekshir» qoʻshildi: 5 qadamli misollar har xil chiqishi uchun.
3. **`ortiqcha` savoli mezonni aytadi** («yoʻnalishi bir xil: yo kiritish, yo chiqarish»), lekin qaysi yoʻnalishligini aytmaydi. Mezonsiz savolda ikkinchi javob chiqardi: «monitor ortiqcha, qolgan uchtasi ovoz bilan ishlaydi».
4. **Tizim bloki `tanla`da chalgʻituvchi** — bola uni koʻrsatishda oʻrtada koʻrgan; «kiritish ham, chiqarish ham emas» degan fikrni mustahkamlaydi.
5. **Bitta javobli savolda tugmalar boshqaruv zonasida, koʻp tanlov va tartiblashda — ish zonasida.** 5–6 ta variant va «Tayyor» telefonda boshqaruv zonasiga sigʻmaydi (savol koʻrinmay qoladi); ish zonasi esa oʻzi aylanadi. Yechim ham shu yerning oʻzida belgilanadi.
6. **6 ta rasm-variant telefonda 2 ustunda** (3 qator): 18 px li «Sichqoncha», «Tizim bloki» 3 ustunga sigʻmaydi. Keng ekranda — 3 ustun.
7. **3-bosqich koʻrsatishida notoʻgʻri yoʻl ham ochiq:** bola saqlamasdan «Oʻchirish»ni bossa, rasm yoʻqoladi va qaytadi. «Saqlanmagan ish yoʻqoladi» degan gapni oʻqimaydi — oʻzi koʻradi. Bu mashq emas, jarima yoʻq.
8. **Qism bosilganda javob oqsoqol pufagida chiqadi** («Bu — monitor. U …»), rasm ostida emas: yotiq telefonda rasm ostidagi yozuv koʻrinmay qoladi, pufak esa har ekranda koʻrinadi. Bu pufaklar «Davom» talab qilmaydi — bolaning bosishiga javob; «Davom»li pufaklar soni mashqgacha 5 / 4 / 6 (QOIDALAR §5: ≤ 6).
9. **«Tozalash» tugmasi** (tartiblashda) — dizaynda yoʻq edi: 5 ta kartani bitta-bitta navbatdan chiqarish bolani charchatadi. Urinish sanalmaydi.
10. **kod.css ulanmaydi** — kerakli uch qoida (`.pbox`, `.note`, `.answer`) oʻyinning oʻz CSS'ida.

# 67 — Chaqqon sichqoncha: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok dizayni:
[`../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md`](../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md).

- [x] **1. Mantiq** — maydon geometriyasi (4:3, foizli koordinata), `joyla` (tasodifiy → panjara → xato), terish, sandiq (`ikki` / `ong`) va sudrash generatorlari (`tier` bilan), ikki marta bosishni aniqlash, «nuqta qaysi savat ustida», menyu joyi.
- [x] **2. Testlar** — 19 ta: joylash (ustma-ust tushmaydi, chetdan chiqmaydi, zich holat va sigʻmaslik), tier sonlari, ketma-ket bir xil vazifa chiqmasligi, sandiq vazifalari (nishon bor, ranglar takrorlanmaydi, menyu ishlari soni), sudrash (har narsaning savati bor), savat ustidami, matn belgilari.
- [x] **3. Rasmlar** — sichqoncha (chap / oʻng tugmasi belgilangan), koʻrsatkich, olma, nok, tosh, uzum, apelsin, sandiq (oltita holat, har rangda oʻz belgisi), savat (yorligʻida meva).
- [x] **4. Ekran** — `.maydon`, terish maydoni, sandiq maydoni (oʻz ikki marta bosishi, `contextmenu` → oʻz menyumiz, tinglovchilarni tozalash), sudrash maydoni (Pointer Events), qurilma tekshiruvi, uch mashq ekrani (`practice.tries`).
- [x] **5. Sahnalar** — kirish, 1-bosqich (bosish → koʻrsatkich va chap tugma), 2-bosqich (ikki marta bosish va oʻng tugma), 3-bosqich (sudrash), tabrik.
- [ ] **6. Ulash** (blok oxirida, bitta qadam) — bosh sahifa (`GAMES`, `pc: true`, ikonka), `sw.js`, `README.md`, QOIDALAR §3 ga sudrash istisnosi.
- [ ] **7. Brauzer koʻrigi** — kompyuterda: ikki marta bosish, oʻng tugma menyusi, sudrash; 360 px da gorizontal aylantirish yoʻqligi.

## Yoʻl-yoʻlakay tanlangan yechimlar

1. **Narsalar joyi burchagidan emas, markazidan beriladi** va CSS'ga `left / top / width / height` foizda yoziladi (`transform` bilan markazlash yoʻq) — shunda silkinish va kattalashish animatsiyalari joyni buzmaydi.
2. **4:3 nisbat `::before { padding-top: 75% }` bilan** (`aspect-ratio` emas): hoshiya ichidagi yuza aynan 4:3 chiqadi — mantiqdagi `y` hisobi shunga tayanadi — va eski brauzerda ham ishlaydi.
3. **Tier 0 da 3 ta sandiq.** Dizaynda «2–4 ta» deyilgan; ikki sandiqda ikki urinish bilan yutqazib boʻlmaydi, shuning uchun ikki sandiq faqat «koʻrsatish» qismida.
4. **Notoʻgʻri usul ham xato javob:** «och» vazifasida menyudan ish tanlash yoki «oʻng tugma» vazifasida sandiqni ikki marta bosish. Aks holda oʻng tugmani bilmagan bola hech qachon maslahat olmasdi. Menyuni ochib-yopishning oʻzi — jarimasiz.
5. **Sekin ikki bosish — jarimasiz eslatma** («Tezroq bos: tiq-tiq!»; oʻng tugma vazifasida — «Bu chap tugma. Oʻng tugmani bos.»), aks holda tez bosa olmagan bola nega hech narsa boʻlmayotganini bilmay qoladi.
6. **Xatodan keyingi 450 ms qulf.** `practice.tries` javobdan keyin 400 ms band boʻladi; maydon shu vaqtda hech narsa qabul qilmaydi, aks holda oxirgi nishon «terilib», javob hisobga kirmay qolardi.
7. **Meva ranglari QOIDALAR palitrasidan** (yashil olma, sariq nok, binafsha uzum, toʻq sariq apelsin tilimi) — qizil olma ishlatilmadi.
8. **Qurilma tekshiruvi har bosqich boshida chaqiriladi**, lekin sahifa ochilgandan beri bir marta soʻraydi — `?bosqich=2` bilan kirilganda ham ishlaydi.
9. **kod.css ulanmaydi** — kerakli ikki qoida (`.pbox`, `.answer`) oʻyinning oʻz CSS'ida.

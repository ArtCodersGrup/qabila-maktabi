# 69 — Fayl va papka: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok dizayni:
[`../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md`](../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md).

- [x] **1. Mantiq** — daraxt va holat (oʻzgarmas uslub), oʻnta amal, yoʻl va «qayerda», nom toʻqnashuvi « (2)», toʻrtta maqsad tekshiruvi, namunali yechimni bajaruvchi (`bajar`), yetti savol generatori (`tier` bilan).
- [x] **2. Testlar** — 29 ta: amallar va chekka holatlar (papkani oʻz ichiga qoʻyish, boʻsh bufer, oʻchirilgan papkadan qaytarish), muzlatilgan holatda oʻzgarmaslik, maqsad tekshiruvlari (toʻgʻri va notoʻgʻri holatlar), generatorlar har tierda 250 martadan (chuqurlik, yagona nishon, 4 variant, yechiladiganlik, takror yoʻq).
- [x] **3. Ekran** — «Fayllar» oynasi: asboblar qatori, nom chiplari, yoʻl satri, belgilar, ochilgan fayl, savat; ikki marta bosish (450 ms); tezkor tugmalar.
- [x] **4. Sahnalar** — kirish, uch bosqichning koʻrsatishi (bola oʻzi bajaradi, matn holatga qarab oʻzgaradi), mashq ekranlari, tabrik.
- [ ] **5. Bosh sahifa** — blok oxirida bitta qadam: `bosh/js/bosh.js` (`tanishuv` boʻlimi, `GAMES`), ikonka, `sw.js`, `README.md`.
- [ ] **6. Koʻrik** — brauzerda (telefon 360 px va kompyuter) va bolalarda sinov — muallifda.

## Yoʻl-yoʻlakay tanlangan yechimlar

1. **Oyna `.stol` ichida emas, yolgʻiz.** `.stol` ning balandligi qotirilgan (4:3), bu oynada esa asboblar ikki qatorga oʻtadi va nom chiplari ochiladi — balandlik ichidagiga qarab oʻsishi kerak. `.oyna`, `.oyna-sarlavha`, `.oyna-ichi`, `.stol-belgi` sinflari ishlatiladi, `position` oʻz CSS'da oʻzgartirilgan.
2. **Koʻrsatish qadamlari holatga qarab gapiradi** (`yolla`): bola boshqa narsani bosib qoʻysa (papkaga kirib ketsa, boshqa nom tanlasa) — pufak keyingi toʻgʻri qadamni aytadi, boshi berk koʻcha yoʻq. Oqsoqol gapirayotganda oyna muzlaydi.
3. **Koʻrsatishda xavfli asbob yoʻq**: 3-bosqich koʻrsatishida «Kesish» yoʻq (fayl joyidan qoʻzgʻalmasin), «Oʻchirish» faqat oʻz qadamida chiqadi.
4. **`yol` savoli 2 qavatli daraxtda** (4 ta faylli papka — 4 variant): 3 qavatli daraxtda 8 papkani titkilash zerikarli, variantlar esa uzun boʻlib ketardi.
5. **`tikla` da «faqat»**: savatda ortiqcha fayl boʻlsa, uni ham qaytarish toʻgʻri emas — aks holda «hammasini qaytar» har doim oʻtib ketardi va qiyinlik oʻsmasdi.
6. **`ochir` tekshiruvi nusxalarni ham koʻradi**: fayl oʻchirilgan, lekin nusxasi qolgan boʻlsa — u hali bor.
7. **Faqat papka nomlanadi**: fayl nomini chip bilan almashtirish maʼnosiz, harf terish esa telefonda ekranni buzadi.
8. **Maslahat va yechim oyna tepasida** chiqadi — telefonda oynaning pasti ekrandan tashqarida qolishi mumkin.
9. **`e.code` bilan tezkor tugmalar**: klaviatura kirillda turgan boʻlsa ham `Ctrl+C` ishlaydi.
10. **kod.css ulanmaydi** — kerakli uch qoida (`.pbox`, `.note`, `.answer`) oʻyinning oʻz CSS'ida.

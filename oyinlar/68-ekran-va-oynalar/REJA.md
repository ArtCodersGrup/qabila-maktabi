# 68 — Ekran va oynalar: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok dizayni:
[`../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md`](../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md).

- [x] **1. Mantiq** — olti dastur, oynalar holati (`och`, `yop`, `kichraytir`, `kattalashtir`, `qaytar`, `oldinga`, `faol`), bosish → amal (`niyat`), ikki marta bosish (`ikkiMarta`), baholash (`baho`: toʻgʻri / urinish / davom), maslahat (`ishora`) va yechim joylari (`nishonlar`), olti generator (`tier` bilan).
- [x] **2. Testlar** — 26 ta: har holat amali (berilgan holat oʻzgarmasligi bilan), `niyat`, 450 ms, "birinchi amal" va «faqat» tekshiruvi, generatorlar har tierda 300 marta (belgilar 3 / 5 / 6, nishon mavjud, `oldinga`da nishon orqada, `pusk`da nishon stolda yoʻq, ketma-ket bir xil `id` yoʻq), har vazifa yechilishi, matn qoidalari, rasmlar.
- [x] **3. Rasmlar** — kirish rasmi (kompyuter, tabrikda ✓ bilan) va olti dastur oynasining ichi (matnsiz SVG).
- [x] **4. Ekran** — oʻyinchoq kompyuter: belgilar, kaskad oynalar, panel, «Pusk» menyusi, yoritish; koʻrsatish qadami (`qildir`); mashq ekranlari (`stolExercise`, `nomExercise`).
- [x] **5. Sahnalar** — kirish, 1-bosqich (belgi → dastur), 2-bosqich (`—` → panel → `□` → `✕`), 3-bosqich (orqadagi oyna, panel, «Pusk»), tabrik.
- [ ] **6. Ulash** — blok oxirida bitta qadam (bu papkadan tashqarida): `bosh/js/bosh.js` (`GAMES`, `SECTIONS`), ikonka, `sw.js`, `README.md`.
- [ ] **7. Koʻrik** — brauzerda (telefon 360 px va kompyuter): bu oʻyin hali brauzerda ochib koʻrilmagan.

## Yoʻl-yoʻlakay tanlangan yechimlar

1. **Oyna joyi — roʻyxatdagi oʻrniga bogʻliq** (oldinga chiqsa, joylar almashadi). Qotib turgan joyda oldinga chiqqan oyna boshqalarning sarlavhasini toʻsardi; 328 px li telefonda bola orqadagi oynaning nomini oʻqiy olmasdi.
2. **Amal taʼsiriga qarab nomlanadi** (`niyat`): ochiq dasturning belgisini ikki marta bosish — `oldinga` yoki `qaytar`. Bola maqsadga boshqa yoʻl bilan yetsa ham toʻgʻri sanaladi.
3. **Tayyorgarlik sanalmaydi**: tugmasini bosishdan oldin kerakli oynani oldinga chiqarish — urinish emas (dizayndagi "birinchi amal" qoidasidan yagona chetlanish).
4. **«Faqat … qolsin»da yangi dastur ochish — urinish**: aks holda oynalar 4 tadan oshib, telefonda kaskad va panelga sigʻmaydi.
5. **Kichraytirib "yashirish" — jarimasiz eslatma**: «Faqat … qolsin»da bola ortiqcha oynani yopmay kichraytirsa, vazifa tugamaydi va u qotib qolishi mumkin edi.
6. **Vazifa — stol ustidagi satrda, maslahat — pufakda**: maslahat vazifa matnini oʻchirib yubormaydi.
7. **`—` belgisi matnda tugmacha ichida** (`.eo-tb`): "Bu — «Rasm» oynasi. Tepasidagi — tugmasini bos" kabi gapda chiziqcha bilan adashmasin.
8. **Belgi eni 88 px** (`stol.css`da 80 px): «Hisoblagich» nomi bir satrga sigʻishi uchun — faqat shu oʻyin CSS'ida.
9. **Brauzer `dblclick`i ishlatilmaydi**; hamma tinglovchi stol elementining oʻzida (bitta `click`), shuning uchun alohida tozalash kerak emas.
10. **Amaldan keyin 450 ms "tinch" oraliq**: bola tugmani ikki marta bosib yuborsa, ikkinchi bosish yangi amal boʻlmaydi (oyna yopilgach uning oʻrniga boshqa oynaning `✕` i surilib keladi).
11. **Brauzersiz sinov**: oʻyin toʻliq (bosh ekran → 3 bosqich → tabrik, qiyin rejim ham) Node'da soxta DOM ustida avtomat oʻynovchi bilan oʻtkazildi — skriptlar, API va holat oqimi tekshirildi; koʻrinish (CSS) tekshirilmagan.

# 37 — Blok-sxema: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok rejasi: [`../umumiy/ALGORITM-BLOK.md`](../umumiy/ALGORITM-BLOK.md).

- [x] **1. Model** — `js/sxema.js`: bloklar, `kodYasa()` (shart → if/else, sikl → for, otstup bilan), `tekshir()` (boʻsh sxema, chiqarishsiz sxema, boʻsh shart), `soni()`. Test: `tests/sxema.test.js` (10 ta) — yasalgan kod har safar bizning Pythonda ishga tushirib koʻriladi.
- [x] **2. Savollar** — `js/logic.js`: beshta belgi savoli, beshta yigʻish masalasi (chalgʻituvchi blok bilan), toʻrtta oʻqish sxemasi. Tekshirish kod orqali: bir nechta toʻgʻri tartib qabul qilinadi. Test: `tests/logic.test.js` (10 ta).
- [x] **3. Ekran** — `js/sxema-ui.js`: chizish (HTML bloklar, CSS shakllar) va bosish bilan yigʻish; faol zona punktir bilan belgilanadi.
- [x] **4. Sahnalar** — kirish, belgilar, sxema → kod, shart → if/else, takror, oʻqish.
- [x] **5. Bosh sahifa va oflayn** — `bosh.js`, ikonka, `sw.js` (`v55`), havola raqamlari.
- [x] **6. Tekshiruv** — testlar yashil; brauzerda yigʻib koʻrildi: kirit → shart → (ha) juft → (yoʻq) toq; sxemadan `if/else` kodi chiqdi va testlardan oʻtdi.

## Qoladi

- Muallif oʻyinni oʻzi koʻrib chiqadi.
- Keyingi oʻyin: **38 — Izlash** (chiziqli va ikkilik izlash; qadam jadvali `kod-ui.js` da tayyor).

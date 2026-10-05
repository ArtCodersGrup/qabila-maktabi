# 58 — Xabar boʻlaklari: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok rejasi: [`../umumiy/INTERNET-BLOK.md`](../umumiy/INTERNET-BLOK.md).

- [x] **1. Mantiq** — xabarlar banki (soʻzlar va iboralar, Oʻ/Gʻ — bitta belgi), boʻlaklash (`konvertlar`), aralashtirish (asl tartibda qolmaydi), yetti savol generatori (`tier` bilan).
- [x] **2. Testlar** — 11 ta: belgilar, boʻlaklash va yigʻish, aralash tartib, tier chegaralari, 4 variant va javob ichida, yoʻqolgan/takror konvert holatlari, navbat.
- [x] **3. Ekran** — xabar qatori (kataklar, boʻsh joy ␣), konvert (burchakda «3/5», ichida belgilar), yoʻq konvert oʻrni, konvert-tugmalar.
- [x] **4. Sahnalar** — kirish (yoʻl), 1-bosqich (qirqish), 2-bosqich (aralash konvertlarni raqam tartibida yigʻish → «paket»), 3-bosqich (yoʻq raqamni topish va qayta soʻrash), tabrik.
- [x] **5. Bosh sahifa** — «Internet qanday ishlaydi» boʻlimi, `GAMES`, ikonka, `sw.js`.

## Yoʻl-yoʻlakay tanlangan yechimlar

1. **Oʻ va Gʻ** — bitta katak (bitta belgi), aks holda «nechta belgi» hisobi bola uchun chalkash.
2. **Aralash tartib asl tartibga teng chiqishi mumkin edi** (4 ta konvertda 1/24 ehtimol) — «aralash keldi» deb yolgʻon gapirmaslik uchun `aralashTartib` bunday holatni qayta aralashtiradi.
3. **Xabar uzunligi savolda aytiladi** — 8–11 yosh uchun 25 belgini sanash asosiy gʻoyadan chalgʻitadi; maqsad — boʻlish va qoldiq.
4. **kod.css ulanmaydi** — kerakli uch qoida (`.pbox`, `.note`, `.answer`) oʻyinning oʻz CSS'ida.

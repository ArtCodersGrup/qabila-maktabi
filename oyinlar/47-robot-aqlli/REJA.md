# 47 — Robot aqlli boʻldi: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md).

- [x] **1. Mantiq** — blok modeli (`yur`, `takror`, `agar`), bajaruvchi, 7 ta daraja, blok sanagichi.
- [x] **2. Testlar** — 9 ta: qadam/tosh/chekka, ichma-ich takror, cheksiz sikl chegarasi,
      `agar` ning ikki shoxi, har darajaning yechimi, shartsiz dasturning rad etilishi.
- [x] **3. Ekran** — blokli quruvchi (faol joy, ichma-ich, oʻchirish), ikki maydon yonma-yon.
- [x] **4. Sahnalar** — takror namoyishi; shartsiz dasturning yiqilishi; ikkisi birga.
- [x] **5. Bosh sahifa va oflayn** — `bosh.js` (8–11), ikonka `robotaql`, `sw.js` (`v67`).
- [x] **6. Tekshiruv** — testlar yashil; brauzerda quruvchi sinaldi: takror + son almashtirish,
      `agar` ning ikki shoxi, ikkala maydonda yurish — qabul qilindi, konsol toza.

## Yoʻl-yoʻlakay tuzatilgan xato

**3-bosqich darajalarining namunali yechimi toshga urilardi:** aylanma yoʻl bitta katak kalta edi
(`yuqori, oʻng, past` — robot toshning ustiga tushardi). `yuqori, oʻng, oʻng, past` ga tuzatildi.
Endi test har darajaning yechimini hamma maydonda ishga tushirib tekshiradi.

## Qoladi

- Blokda uchinchi oʻyin ham boʻlishi mumkin edi («Xato ovi» — tayyor dasturdagi xatoni topish).
  Hozir kiritilmadi; kerak boʻlsa alohida kelishiladi.

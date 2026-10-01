# 46 — Tezkor tugmalar: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md).

- [x] **1. Mantiq** — 16 ta amal, `belgi(hodisa)`, `mos()`, `qaydEtiladi()`, toʻrt xil savol, 5 ta maqsad.
- [x] **2. Testlar** — 12 ta: Mac `⌘`, nomlar takrorlanmasligi, javob tartibining aralashishi,
      maqsadning ikki sharti, bufersiz maqsadlarning borligi.
- [x] **3. Ekran** — tugma qopqoqlari, bosilgan tugma koʻrsatkichi, haqiqiy matn maydoni.
- [x] **4. Sahnalar** — uchlik, yurish/tahrir, amaliy maqsadlar.
- [x] **5. Bosh sahifa va oflayn** — `bosh.js` (yosh 8–16), ikonka `tezkor`, `sw.js` (`v66`).
- [x] **6. Tekshiruv** — testlar yashil; brauzerda uch bosqich oʻynaldi, konsol toza.

## Yoʻl-yoʻlakay qilingan ishlar

1. **`keyboardCheck` umumiy `ui.js` ga koʻchirildi.** Ilgari u `kod-ui.js` da edi va bu oʻyin uchun
   butun Python talqinchisini yuklash kerak boʻlardi. `QK.kodUI.keyboardCheck` nomi joyida qoldi
   (20 dan ortiq oʻyin unga tayanadi), endi u `ui.keyboardCheck()` ni chaqiradi.
2. **Topilgan xato: javob berilgandan keyin ham kartalar bosilaverardi** va klaviatura tinglovchisi
   oʻchmasdi. Endi toʻgʻri javobdan keyin tinglovchi oʻchadi, kartalar bloklanadi.
3. **Topilgan xato: `Home` va `End` bosilgani yozib borilmasdi** — filtr faqat `+` li birikmalarni
   olardi, shuning uchun «gap boshiga oʻt» maqsadi hech qachon qabul qilinmasdi. Qoida mantiqqa
   chiqarildi (`qaydEtiladi`) va test bilan qulflandi.

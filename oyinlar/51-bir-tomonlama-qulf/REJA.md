# 51 — Bir tomonlama qulf: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok rejasi: [`../umumiy/XAVFSIZLIK-BLOK.md`](../umumiy/XAVFSIZLIK-BLOK.md).

- [x] **1. Iz qoidasini tanlash** — qogʻozda hisoblanadigan, toʻqnashuvli, ikki xonali iz:
      `iz = iz × 3 + belgining soni`, oxirgi ikki raqam. Boshlangʻich iz — tuz.
- [x] **2. Mantiq** — `iz`, `izQadamlar`, `izHisob`, `toqnash` (toʻqnashuv juftini izlash),
      raqamlar yigʻindisi va `yigindiJuft`, tuz jadvali, yetti xil savol generatori.
- [x] **3. Testlar** — 17 ta: belgi qiymati, qoʻlda hisoblangan misol, toʻqnashuvlar, tartib,
      qadamlar zanjiri, tuz, savollarning takrorlanmasligi va tutuq belgisi.
- [x] **4. Ekran** — alifbo jadvali, uch qadamli qoida kartasi, hisob jadvali, iz chipi,
      parol/son kartalari, saytlar jadvali; uzun javob tugmalari matnni oʻraydi (360 px).
- [x] **5. Sahnalar** — kirish (voronka), 1-bosqich (yigʻindi va toʻqnashuv), 2-bosqich (iz,
      kirish tekshiruvi, baza), 3-bosqich (bitta parol xavfi, tuz), tabrik.
- [x] **6. Tekshiruv** — `node --test oyinlar/51-bir-tomonlama-qulf/tests/` yashil;
      ekran kodi Node'da quruq ishga tushirilib tekshirildi (qismlar, yetti ekran, sahnalar).

## Yoʻl-yoʻlakay tanlangan yechimlar

1. **Harflarni songa aylantirish** kerak boʻldi — shuning uchun ekranda doim alifbo jadvali turadi
   (`a` = 1 … `z` = 26), bola uni koʻrib hisoblaydi.
2. **«07» muammosi:** iz 10 dan kichik chiqsa, raqam klaviaturasida yozish chalkash. Mashq
   generatorlari bunday misolni tashlab yuboradi.
3. **Toʻqnashuv juftlari «soʻz + harf» koʻrinishida gʻalati chiqardi** (`bosht`) — izlash tartibi
   oʻzgartirildi: avval «soʻz + son» sinaladi, shunda juft haqiqiy parolga oʻxshaydi.
4. **Tuz** avval parolga qoʻshiladigan qilib oʻylandi; boshlangʻich iz sifatida olinsa, qoida
   bitta boʻlib qoladi va bola tuzli izni ham qogʻozda hisoblaydi.
5. **Python talqinchisi kerak emas** — `kod-mashq.js` oʻrniga mashq qutisi shu oʻyinda yozildi,
   `index.html` faqat kerakli skriptlarni ulaydi (`sanash.js` ham kerak emas: hisob kichik).

## Qoladi (muallif oʻzi qiladi)

- Bosh sahifaga qoʻshish (`bosh/js/bosh.js` dagi `GAMES`, «Parol va xavfsizlik» boʻlimi) va `sw.js` versiyasi.
- 52 «Firibgar xat» — soxta xabarni tanish.

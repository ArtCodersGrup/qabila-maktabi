# 52 — Firibgar xat: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok rejasi: [`../umumiy/XAVFSIZLIK-BLOK.md`](../umumiy/XAVFSIZLIK-BLOK.md).

- [x] **1. Mantiq** — 8 belgi, 16 belgi misoli, 14 xat (7 haqiqiy / 7 soxta), 8 vaziyat,
  manzil qoidasi (`ajrat`, `domenFarqi`, `manzilBahosi`) va uch savol generatori.
- [x] **2. Testlar** — 15 ta: xatlar tarkibi, belgi ↔ matn mosligi, domen qoidasining toʻrt
  holati, savollarning takrorlanmasligi, tutuq belgisi, brend nomlari yoʻqligi.
- [x] **3. Ekran** — xat kartasi (manzilning hal qiluvchi qismi ajratilgan), belgi kartalari,
  manzil jadvali, uzun javob tugmalari. Rasm: qarmoqqa ilingan xat va qalqon.
- [x] **4. Tekshiruv** — `node --test oyinlar/52-firibgar-xat/tests/` yashil; sahna fayllari
  soxta DOM bilan sinab koʻrildi (xato yoʻq), `.fx-` sinflari CSS bilan solishtirildi.

## Qoladi (muallif oʻzi ulaydi)

- `bosh/js/bosh.js` dagi `GAMES` ga qoʻshish (`yosh: [10, 16]`, ikonka), `bosh/js/bosh-art.js`.
- `sw.js` keshiga yangi papka va versiya.
- Brauzerda uch bosqichni oxirigacha oʻynab koʻrish (telefon va kompyuter).

## Yoʻl-yoʻlakay qabul qilingan qarorlar

1. **Manzil tekshiruvi faqat zonadan oldingi nomga tayanadi.** Avval butun domenni solishtirish
   oʻylangan edi, lekin unda `kirish.qabilapochta.uz` (haqiqiy boʻlim) soxta deb chiqardi.
2. **Koʻzga oʻxshash belgilar** (`1` = l, `0` = o, `5` = s …) avval tenglashtiriladi, qolgan farq
   tahrir masofasi bilan oʻlchanadi — shunda `qabi1abank` ham, `kitobny` ham tanilaydi.
3. **Manzili toʻgʻri soxta xat** qoʻshildi (`dostlar-notanish`): bola «domen toʻgʻri boʻlsa —
   xat xavfsiz» degan xato qoidani oʻrganmasin.
4. **Belgi ↔ matn mosligi test bilan qulflandi** (`KALIT`): xatda eʼlon qilingan belgi matnda
   haqiqatan koʻrinishi shart, aks holda xato javobdagi izoh yolgʻon boʻlib qolardi.
5. **Python/kod fayllari ulanmadi** — bu oʻyinga talqinchi kerak emas, shuning uchun `index.html`
   faqat `asos.css` va asosiy umumiy skriptlarni ulaydi.

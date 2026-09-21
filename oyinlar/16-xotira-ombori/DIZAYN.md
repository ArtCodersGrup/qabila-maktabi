# 16 — Xotira ombori: dizayn

**Mavzu:** Axborot oʻlchovi — birliklar zinapoyasi (bit → bayt → Kbayt → Mbayt → Gbayt → Tbayt), taqqoslash, "nechta sigʻadi"
**Yosh:** 8–12
**Taxminiy davomiyligi:** 20 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-21)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok: 13 bayt → 14 rasm → 15 video → **16 xotira ombori** (blok yakuni).
Bogʻliq oʻyinlar: `13` (bit, bayt, Kbayt), `14` (Mbayt), `15` (Gbayt).

> Bit, bayt, kilobayt, megabayt, gigabayt… Ularning hammasini bitta omborga — **qutilar ichida qutilarga** joylaymiz.
> Qaysi biri katta? Fleshkaga nechta film sigʻadi?

Blok qarorlari: 1 Kbayt = 1024 bayt (va har keyingi qadam × 1024); birliklar toʻliq soʻz bilan; hisob mashqlarida javob ≤ 100.

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. Birliklarni tartib bilan aytadi: **bit, bayt, Kbayt, Mbayt, Gbayt, Tbayt**; birinchi qadam **× 8**, qolganlari **× 1024**.
2. Kundalik fayllarni (SMS, sahifa, surat, qoʻshiq, film) hajmi boʻyicha tartiblaydi.
3. Turli birlikdagi ikki hajmni solishtiradi: avval birlikka qaraydi, kerak boʻlsa **bir xil birlikka aylantiradi** (2000 Mbayt > 1 Gbayt).
4. Xotiraga nechta fayl sigʻishini hisoblaydi: **xotira : fayl** (bir xil birlikda).
5. Nega doʻkondagi "1 Tbayt" disk kompyuterda **931 Gbayt** koʻrinishini tushuntiradi (doʻkon 1000 bilan, kompyuter 1024 bilan sanaydi).

## 2. Asboblar

- **Zinapoya** — pogʻonalar pastdan yuqoriga: bit, bayt, Kbayt, Mbayt, Gbayt, Tbayt; pogʻonalar orasida "× 8" yoki "× 1024".
- **Birlik tugmalari** — aralash tartibda; bola eng kichigidan boshlab bosadi.
- **Fayl kartochkalari** — ikonka, nomi va hajmi (SMS 100 bayt, sahifa 2 Kbayt, surat 3 Mbayt, qoʻshiq 4 Mbayt, film 2 Gbayt).
- **Xotira chizigʻi** — fleshka hajmi; fayl qoʻshilganda toʻladi.

## 3. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (ombor — qutilar ichida qutilar)
   ├─► 1-bosqich: Oʻlchov zinapoyasi  [birliklarni tartib bilan terish → × 8 va × 1024 → mashq 3]
   ├─► 2-bosqich: Kattasini top       [fayllarni tartiblash → bir xil birlikka aylantirish → mashq 3]
   └─► 3-bosqich: Nechta sigʻadi?     [fleshkani filmlar bilan toʻldirish → turli birlik → mashq 3 → hikoya] → tabrik
```

**Kirish:** "Biz bit, bayt, kilobayt, megabayt va gigabaytni oʻrgandik." / (Shogird) "Ular qanday bogʻlangan?" / "Kel, xotira omborini quramiz — qutilar ichida qutilar!"

## 4. 1-bosqich: Oʻlchov zinapoyasi

1. **Terish:** pastda 6 ta birlik tugmasi aralash. "Eng kichigidan boshla!" Bola bosgan birlik zinapoyaning navbatdagi pogʻonasiga chiqadi, orasida koʻpaytuvchi paydo boʻladi: bit —×8→ bayt —×1024→ Kbayt … Notoʻgʻri tugma: "↻ Hali emas. Qolganlarning eng kichigi qaysi?"
2. **Tbayt — yangi:** "Gbaytdan keyin — Tbayt (terabayt): 1024 Gbayt. Kompyuter disklari shunday oʻlchanadi."
3. **Ta'rif:** `1 bayt = 8 bit`, `1 Kbayt = 1024 bayt`, `1 Mbayt = 1024 Kbayt`, `1 Gbayt = 1024 Mbayt`, `1 Tbayt = 1024 Gbayt`. "Har pogʻona 1024 marta katta. Faqat birinchisi — 8 marta."
4. **Mashq** (3 ta to'g'ri, tanlov tugmalari), tasodifiy uch xil:
   - "1 Mbayt = 1024 ___" — birlikni tanlash.
   - "1 Gbayt = ___ Mbayt" — sonni tanlash (8 / 1000 / 1024); "1 bayt = ___ bit" (8 / 10 / 1024).
   - "Zinapoyada Kbaytdan keyingisi?" — birlikni tanlash.
   - 1-xato: zinapoya koʻrsatiladi. 2-xato: kerakli pogʻona yoritiladi va javob.

## 5. 2-bosqich: Kattasini top

1. **Fayllarni tartiblash:** 5 ta kartochka aralash (SMS 100 bayt, qoʻshiq 4 Mbayt, sahifa 2 Kbayt, film 2 Gbayt, surat 3 Mbayt). Bola eng kichigidan boshlab bosadi; kartochka tartib qatoriga tushadi. Notoʻgʻri: "↻ Birlikka qara: bayt < Kbayt < Mbayt < Gbayt." Surat va qoʻshiq — bir xil birlik, "3 < 4".
2. **Tuzoq:** "Qaysi biri katta: 2000 Mbayt yoki 1 Gbayt?" — "1 Gbayt = 1024 Mbayt. 2000 Mbayt kattaroq!" / "Birlik katta boʻlsa ham, son kichik boʻlsa — aylantirib solishtir."
3. **Ta'rif:** "1) Birlik bir xil — sonni solishtir. 2) Birlik boshqa — bir xil birlikka aylantir."
4. **Mashq** (3 ta to'g'ri) — "Qaysi biri katta?", ikki tugma, tasodifiy uch xil:
   - Bir xil birlik: `700 Mbayt` / `300 Mbayt`.
   - Qoʻshni birliklar, son kichik: `3 Gbayt` / `800 Mbayt` (katta birlik yutadi).
   - Tuzoq: `1 Gbayt` / `1500 Mbayt`, `3 Mbayt` / `3000 Kbayt` (aylantirish kerak).
   - 1-xato: "k Gbayt = k × 1024 Mbayt". 2-xato: ikkalasi bir xil birlikda, `>` bilan.

## 6. 3-bosqich: Nechta sigʻadi?

1. **Fleshka:** xotira chizigʻi "8 Gbayt". Bola "Film qoʻsh (2 Gbayt)"ni bosadi — chiziq toʻladi; 4 ta filmdan keyin: "Toʻldi! 8 : 2 = 4 ta film."
2. **Turli birlik:** "1 Gbaytli fleshkaga 256 Mbaytli video nechta sigʻadi?" — "1 Gbayt = 1024 Mbayt. 1024 : 256 = 4." Chiziq 4 boʻlakka boʻlinadi.
3. **Ta'rif:** `nechta sigʻadi = xotira : fayl` (bir xil birlikda).
4. **Mashq** (3 ta to'g'ri, raqam klaviaturasi), tasodifiy ikki xil:
   - Bir xil birlik: "64 Gbayt telefon, oʻyin 4 Gbayt. Nechta sigʻadi?" (javob ≤ 64). 1-xato: "64 : 4 = ?". 2-xato: javob.
   - Turli birlik: "2 Gbayt, video 512 Mbayt" (xotira 1–2, fayl 128/256/512; javob ≤ 16). 1-xato: "2 Gbayt = 2048 Mbayt. 2048 : 512 = ?". 2-xato: javob.
5. **Hikoya (blok yakuni):**
   1. Disk: "Doʻkonda «1 Tbayt» deb yozilgan disk kompyuterda 931 Gbayt koʻrinadi." / "Doʻkon 1000 bilan sanaydi, kompyuter esa 1024 bilan. Disk kichraymagan!"
   2. Maʼlumot markazi: "Katta maʼlumot markazlarida minglab Tbayt saqlanadi." / "1024 Tbayt — 1 Pbayt (petabayt)!"
   3. Zinapoya: "Hammasi bitta bitdan boshlanadi: yoniq yoki oʻchiq." / "Endi sen axborotni oʻlchay olasan!"

**Tabrik:** "Tabriklayman! Endi sen axborot oʻlchovini bilasan!" — "bit → bayt: × 8", "bayt → Kbayt → Mbayt → Gbayt → Tbayt: × 1024", "Solishtirish — bir xil birlikda", "Nechta sigʻadi = xotira : fayl".

## 7. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `js/units.js` | Sof hisob: birliklar, koʻpaytuvchilar, baytga aylantirish, taqqoslash, fayllar, disk (931), topshiriqlar. Node testlari. |
| `js/game-art.js` | Ombor (kirish), fayl ikonkalari, hikoya rasmlari (disk, maʼlumot markazi, zinapoya) |
| `js/units-ui.js` | Zinapoya, birlik tugmalari, fayl kartochkalari, xotira chizigʻi |
| `js/scenes/*.js` | Bosqichlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `xotira-ombori:v1`) |

## 8. Bu o'yinga kirmaydi

Rasmiy KiB/MiB belgilari (faqat hikoyada "1000 va 1024"), Pbayt dan kattalari, internet tezligi, xotira turlari (RAM, SSD).

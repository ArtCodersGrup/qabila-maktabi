# 17 — Qabila choʻti: dizayn

**Mavzu:** Sanoq tizimi nima: asos, raqamlar (0 … n−1, A–F), yozuv (101₂), turlari (pozitsion / nopozitsion), xona qiymatlari
**Yosh:** 10–12
**Taxminiy davomiyligi:** 20 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-21)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). "Sanoq tizimlari" bloki: **17 tizim nima** → 18 x → 10 → 19 10 → x → 20 ikkilik amallar → 21 oʻn oltilik → 22 n-lik.
Bogʻliq oʻyinlar: `04` (8-4-2-1, ikkilik son), `05` (Rim raqamlari, pozitsion va nopozitsion tizim).

> Qoʻshni qabilalar har xil sanaydi: birida 10 barmoq, birida 5, uchinchisi faqat "bor-yoʻq" — 2.
> Choʻtda koʻramiz: qachon munchoqlar keyingi simga oʻtadi?

**Blok qarorlari** (muallif bilan): blok **10–12 yosh** uchun; atama — "sanoq tizimi" (bir marta "sanoq sistemasi" deb ham aytiladi); asos har doim yoziladi (101₂); umumiy model — **choʻt**: simda n ta munchoq yigʻilsa, ular keyingi simda 1 ta munchoqqa almashadi.
Umumiy kod: `umumiy/js/sanoq.js` (hisob), `umumiy/js/sanoq-ui.js` (choʻt, ustun taxtasi, asosga mos klaviatura), `umumiy/css/sanoq.css`.

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. **Asos** nima ekanini tushuntiradi: nechta birlik keyingi xonada 1 taga almashadi (10-lik, 5-lik, 2-lik).
2. n-lik tizimda raqamlar **0 … n−1** ekanini, 16-likda **A–F** (10–15) ishlatilishini biladi; notoʻgʻri yozuvni topadi (129₈ — yoʻq).
3. Sonning eng kamida qaysi tizimda boʻlishi mumkinligini aytadi (3042 → kamida 5-lik).
4. Asos yozuvini oʻqiydi: 101₂ — "bir-nol-bir, ikkilik"; pozitsion (2, 8, 10, 16) va nopozitsion (Rim, tayoqchalar) tizimlarni ajratadi.
5. **Xona qiymatlarini** yozadi: 1, n, n·n, n·n·n (2-lik: 1, 2, 4, 8, 16; 8-lik: 1, 8, 64; 16-lik: 1, 16, 256).

## 2. Asboblar

- **Choʻt** (umumiy) — 3 ta sim, har simda 0 … n−1 munchoq, ostida raqam; "+1" bosilganda n ta boʻlgan sim boʻshaydi, chapdagiga 1 oʻtadi (animatsiya).
- **Asos tanlagich** — `−` / `+` (2–16), ostida shu tizim raqamlari.
- **Xona qutilari** — oʻngdan chapga 1, n, n², … ; "× n" tugmasi yangi xona qoʻshadi.
- **Asosga mos klaviatura** (umumiy) — faqat 0 … n−1 raqamlari.

## 3. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (qabilalar har xil sanaydi)
   ├─► 1-bosqich: Choʻtda sanash    [10-lik → 5-lik → 2-lik choʻtda +1 → asos → mashq 3]
   ├─► 2-bosqich: Asos va raqamlar  [asosni 2 dan 16 gacha oshirish → A–F → turlari → mashq 3]
   └─► 3-bosqich: Xona qiymatlari   [× 2, × 8, × 16 bilan xonalar → mashq 3 → hikoya] → tabrik
```

**Kirish:** "Qoʻshni qabilalar har xil sanaydi." / (Shogird) "Qanday qilib? Sonlar hammada bir xil-ku!" / "Sonlar bir xil, yozilishi boshqa. Kel, choʻtda koʻramiz."

## 4. 1-bosqich: Choʻtda sanash

1. **10-lik choʻt** (7 dan): "+1" bilan 12 gacha. 10 ga yetganda: "10 ta boʻldi — ular chapdagi simda 1 ta munchoqqa almashdi!"
2. **5-lik choʻt** (3 dan 7 gacha): "Besh barmoqli qabila 5 tadan sanaydi." 5 da oʻtadi. "Yetti bu yerda 12₅ deb yoziladi."
3. **2-lik choʻt** (0 dan 5 gacha): har 2 da oʻtadi. "Besh — 101₂."
4. **Ta'rif:** "Nechta munchoqda keyingi simga oʻtilsa — shu tizimning **asosi**." / "Bu — sanoq tizimlari (sanoq sistemalari)."
5. **Mashq** (3 ta to'g'ri; asos 2–9, asosga mos klaviatura):
   - "Choʻtdagi sonni yoz." 1-xato: "Har sim ostidagi munchoqlarni chapdan oʻngga sana." 2-xato: javob.
   - "Yana 1 qoʻshsak, qanday yoziladi?" (oxirgi simda n−1). 1-xato: "Oxirgi simda n ta boʻladi — u boʻshab, chapdagiga 1 oʻtadi." 2-xato: javob.

## 5. 2-bosqich: Asos va raqamlar

1. **Asosni oshir:** tanlagich 2 dan boshlanadi, bola 16 gacha oshiradi. 11 da: "10 dan katta raqam uchun yangi belgi kerak: A — oʻn!" 16 da: "16-likda 16 ta raqam: 0–9 va A–F (A = 10 … F = 15)."
2. **Yozuv:** "101₂ — «bir-nol-bir, ikkilik». Pastdagi kichik son — asos."
3. **Turlari:** "Pozitsion: 2-, 8-, 10-, 16-lik — raqam qiymati turgan xonasiga bogʻliq." / "Nopozitsion: Rim raqamlari — X har joyda 10 (5-oʻyin)."
4. **Mashq** (3 ta to'g'ri), tasodifiy uch xil:
   - "Bu yozuv toʻgʻrimi: 129₈?" — "Ha" / "Yoʻq". 1-xato: "8-likda raqamlar: 0 … 7". 2-xato: "9 — 8-likda yoʻq" yoki "Hamma raqam 8 dan kichik".
   - "Bu son eng kamida qaysi tizimda boʻlishi mumkin: 3042?" (raqam klaviaturasi). 1-xato: "Eng katta raqamni top." 2-xato: "Eng katta raqam 4 → kamida 5-lik".
   - "16-likda D nechaga teng?" 1-xato: A = 10 … F = 15 qatori. 2-xato: javob.

## 6. 3-bosqich: Xona qiymatlari

1. **Xonalarni yasash:** 2-lik: "1" qutisi, bola "× 2" ni bosadi → 2, 4, 8, 16. 8-lik: 1, 8, 64. 16-lik: 1, 16, 256.
2. **Ta'rif:** "Har keyingi xona — oldingisidan asos marta katta: 1, n, n·n, n·n·n." / "10-likda ham shunday: 1, 10, 100, 1000!"
3. **Mashq** (3 ta to'g'ri), tasodifiy uch xil:
   - "5-likda 3-xonaning qiymati?" (oʻngdan sanaladi; javob ≤ 256). 1-xato: "1, 5, … — har gal 5 ga koʻpaytir." 2-xato: xonalar qatori.
   - "213₈ da 2 turgan xonaning qiymati?" (64). 1-xato: xona qiymatlari son ustida. 2-xato: javob.
   - "Bu yozuv qaysi tizimda?" — XIV, 1011₂, 7E₁₆, tayoqchalar IIII, 2024 … → "Pozitsion" / "Nopozitsion". 1-xato: "Raqam qiymati turgan joyiga bogʻliqmi?" 2-xato: izoh.
4. **Hikoya:** 1) Kompyuter chipi: "Kompyuter 2-likda ishlaydi: har xona — bitta chiroq." 2) Tangalar: "Keyingi oʻyinda xona qiymatlari — tangalar boʻladi va istalgan sonni oʻnlikka aylantiramiz!"

**Tabrik:** "Tabriklayman! Endi sen sanoq tizimlarini taniysan!" — "Asos — nechtada keyingi xonaga oʻtiladi", "n-likda raqamlar 0 … n−1", "Xonalar: 1, n, n·n …".

## 7. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `../umumiy/js/sanoq.js` | Umumiy hisob: toBase, fromBase, valid, places, fmt (Node testlari: `umumiy/tests/sanoq.test.js`) |
| `../umumiy/js/sanoq-ui.js` | Choʻt, ustun taxtasi, asosga mos klaviatura, `digitTries` |
| `js/tizim.js` | Shu oʻyin topshiriqlari: choʻtni oʻqish, yozuv toʻgʻriligi, eng kichik asos, xona qiymati, tizim turi. Node testlari. |
| `js/game-art.js` | Choʻt (kirish), hikoya rasmlari (chip, tangalar) |
| `js/scenes/*.js` | Bosqichlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `qabila-choti:v1`) |

## 8. Bu o'yinga kirmaydi

Sonni boshqa tizimga oʻtkazish (18–19), amallar (20–22), kasr va manfiy sonlar.

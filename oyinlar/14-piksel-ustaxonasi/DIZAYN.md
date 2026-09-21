# 14 — Piksel ustaxonasi: dizayn

**Mavzu:** Axborot oʻlchovi — rasm hajmi: piksel, ranglar va bitlar, rangli piksel, megabayt, siqish
**Yosh:** 8–12
**Taxminiy davomiyligi:** 20 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-21)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok: 13 bayt → **14 rasm** → 15 video → 16 xotira ombori.
Bogʻliq oʻyinlar: `04` (rangli chiroqlar, ekrandagi 3 ta chiroq), `10` (rasm — kataklar va sonlar), `13` (bit, bayt, Kbayt, "eng kamida nechta bit").

> Qabila ustaxonasida kompyuterda rasm chizamiz. Rasm necha bayt joy oladi?
> Rang qoʻshilsa-chi? Telefondagi surat-chi?

Blok qarorlari: 1 Kbayt = 1024 bayt, 1 Mbayt = 1024 Kbayt; birliklar toʻliq soʻz bilan; hisob mashqlarida javob ≤ 100.

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. Rasm kataklardan — **piksellardan** iboratligini, oq-qora rasmda **har piksel 1 bit** ekanini biladi. **Boʻsh (oq) piksel ham joy oladi.**
2. Oq-qora rasm hajmini hisoblaydi: **kenglik × balandlik** bit; 8 ga boʻlib baytga aylantiradi.
3. Ranglar soniga qarab har pikselga nechta bit kerakligini topadi (2 → 1, 4 → 2, 16 → 4, 256 → 8) va rasm hajmini **kenglik × balandlik × bit** bilan hisoblaydi.
4. Ekrandagi har rang **qizil, yashil, koʻk** chiroqlardan yasalishini, rangli piksel **3 bayt** ekanini biladi.
5. **1 Mbayt = 1024 Kbayt**; telefon surati siqilmasa oʻnlab Mbayt boʻlishini va **siqish** (takrorlanuvchi ranglarni qisqa yozish) uni kichraytirishini tushuntiradi.

## 2. Asboblar

- **Toʻr** — W × H katak (oq-qora yoki rangli), bosib boʻyaladi. Kataklar ichida kodlar koʻrsatilishi mumkin (`1/0`, `01`).
- **Palitra** — rang tugmalari (joriy rang tanlanadi).
- **Rang aralashtirgich** — katta piksel va 3 ta chiroq-tugma: qizil, yashil, koʻk (yoqish/oʻchirish). Yonida "Kerak" rangi.
- **Qator** — bir qator piksellar va uning qisqa yozuvi: `6 ■  2 □  2 ■`.

## 3. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (ustaxonada rasm chizamiz)
   ├─► 1-bosqich: Oq-qora rasm       [8×8 chizish → 1/0 → har qator 1 bayt → mashq 3]
   ├─► 2-bosqich: Ranglar va bitlar  [4 rang bilan boʻyash, kodlar 00–11 → jadval → mashq 3]
   └─► 3-bosqich: Haqiqiy surat      [rang aralashtirish → 3 bayt → Mbayt → siqish → mashq 3 → hikoya] → tabrik
```

**Kirish:** "Bugun ustaxonada kompyuterda rasm chizamiz!" / (Shogird) "Rasm necha bayt boʻladi?" / "Kel, oʻzimiz chizib, sanab koʻramiz."

## 4. 1-bosqich: Oq-qora rasm

1. **Chizish:** 8 × 8 toʻr, bola kamida 6 ta katakni boʻyab "Tayyor"ni bosadi.
2. Kataklarda **1 va 0** paydo boʻladi: "Boʻyalgani — 1, boʻshi — 0. Har katak — bitta piksel, yaʼni 1 bit." / "Boʻsh katak ham joy oladi: kompyuter u yerda 0 ni saqlaydi."
3. **Qatorlar:** qatorlar birma-bir yoritiladi, sanagich "1 bayt … 8 bayt": "Har qatorda 8 piksel — 8 bit, yaʼni 1 bayt!" / "8 qator — 8 bayt."
4. **Ta'rif:** `8 × 8 = 64 piksel = 64 bit = 8 bayt`, `oq-qora rasm: kenglik × balandlik (bit)`.
5. **Mashq** (3 ta to'g'ri; kichik tayyor rasm va ostida oʻlchami "W × H piksel" — haqiqiy fayllardagidek, bola sanamasdan koʻpaytiradi; W, H = 3–10, W × H ≤ 100):
   - "Bu oq-qora rasm necha bit?" 1-xato: "Har piksel 1 bit. W × H = ?". 2-xato: "W × H = N bit".
   - "Bu oq-qora rasm necha bayt?" (W × H 8 ga boʻlinadi). 1-xato: "W × H = N bit. N : 8 = ?". 2-xato: javob.

## 5. 2-bosqich: Ranglar va bitlar

1. **Boʻyash:** 4 × 4 toʻr va 4 rang: oq `00`, qizil `01`, yashil `10`, koʻk `11`. Bola rang tanlab kataklarni boʻyaydi (kamida 4 ta rangli katak); har katak ichida uning kodi. "4 xil rang — har piksel 2 bit: 2 × 2 = 4."
2. "16 piksel × 2 bit = 32 bit = 4 bayt."
3. **Ta'rif** (jadval): `2 rang — 1 bit`, `4 rang — 2 bit`, `8 rang — 3 bit`, `16 rang — 4 bit`, `256 rang — 8 bit = 1 bayt`. "Rang qancha koʻp boʻlsa, har pikselga shuncha koʻp bit kerak." Formula: `hajm = kenglik × balandlik × bit`.
4. **Mashq** (3 ta to'g'ri), tasodifiy ikki xil:
   - "N xil rang uchun har pikselga eng kamida nechta bit kerak?" (N: 2, 3, 4, 5, 8, 10, 16, 20, 32, 50, 64, 100, 256). 1-xato: `1 bit — 2`, `2 bit — 4` … jadvali. 2-xato: jadval ✓ bilan.
   - "Bu rasm W × H, N xil rang (2, 4 yoki 16). Necha bit?" (javob ≤ 100). 1-xato: "W × H = P piksel, har piksel b bit". 2-xato: "W × H × b = X bit".

## 6. 3-bosqich: Haqiqiy surat

1. **Rang aralashtirish:** katta piksel va 3 ta chiroq. "Sariq rangni yasa!" — bola chiroqlarni yoqib-oʻchirib topadi (qizil + yashil). Keyin "Oqni yasa!" (uchalasi). "3 ta chiroq — yoniq/oʻchiq — 8 xil rang, yaʼni 3 bit."
2. "Haqiqiy ekranda har chiroq 256 xil yorugʻlikda yonadi — 1 bayt." / "Demak, rangli piksel — 3 bayt. Ranglar 16 milliondan ham koʻp!"
3. **Megabayt:** "Telefon surati: 4000 × 3000 — 12 million piksel." / "Har biri 3 bayt — 36 million bayt!" Zinapoya: `bayt → Kbayt → Mbayt` (har qadam × 1024). "1024 Kbayt = 1 Mbayt. Bu surat — 34 Mbaytga yaqin."
4. **Siqish:** 10 pikselli qator (`6 koʻk, 2 oq, 2 koʻk`), "Qisqa yoz" → `6 ■  2 □  2 ■`: "10 ta piksel oʻrniga 3 ta yozuv!" / "Telefon takrorlanuvchi ranglarni shunday qisqa yozadi."
5. **Mashq** (3 ta to'g'ri), tasodifiy uch xil:
   - "Bu rangli rasm W × H. Necha bayt?" (W × H × 3 ≤ 100). 1-xato: "Har piksel 3 bayt. W × H = P piksel". 2-xato: "P × 3 = X bayt".
   - "Qatorni qisqa yozsak, nechta yozuv chiqadi?" (8–12 piksel, 2–5 boʻlak). 1-xato: boʻlaklar orasi ochiladi. 2-xato: qisqa yozuv koʻrsatiladi.
   - "Qaysi biri katta?" — `k Mbayt` va `m Kbayt` (m = 1000 × k yoki 1000 × (k + 1)). 1-xato: "k Mbayt = k × 1024 Kbayt". 2-xato: ikkalasi Kbaytda.
6. **Hikoya:**
   1. Telefon: "Telefon surati siqilmasa 34 Mbayt, siqilsa — 3–4 Mbayt." / "Telefon koʻz sezmaydigan mayda farqlarni ham tashlab yuboradi."
   2. Lupa: "Rasmni juda kattalashtirsang, kataklar — piksellar koʻrinadi."
   3. Kinolenta: "Rasmlar tez almashsa — video boʻladi. Bu keyingi oʻyinda!"

**Tabrik:** "Tabriklayman! Endi sen rasm hajmini hisoblay olasan!" — "Oq-qora: 1 piksel = 1 bit", "Rang koʻp — bit koʻp", "Rangli piksel = 3 bayt", "1024 Kbayt = 1 Mbayt".

## 7. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `js/pixels.js` | Sof hisob: palitralar, eng kamida nechta bit, qator boʻlaklari (siqish), rang aralashtirish, surat hajmi, topshiriqlar. Node testlari. |
| `js/game-art.js` | Molbert (kirish), hikoya rasmlari (telefon, lupa, kinolenta) |
| `js/pixels-ui.js` | Toʻr (boʻyash, kodlar, qatorni yoritish), palitra, rang aralashtirgich, qator va qisqa yozuv |
| `js/scenes/*.js` | Bosqichlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `piksel-ustaxonasi:v1`) |

## 8. Bu o'yinga kirmaydi

JPEG/PNG ichki tuzilishi (faqat bir gap), vektor grafika, rang chuqurligi atamalari (bpp), piksel zichligi (dpi), 1 Mbayt dan kattalari (15–16-oʻyinlar).

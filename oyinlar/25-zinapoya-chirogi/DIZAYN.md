# 25 — Zinapoya chirogʻi: dizayn

**Mavzu:** Mantiq — "faqat bittasi" (XOR), amallar zanjiri (sxema), kompyuter qanday qoʻshadi (yarim qoʻshuvchi)
**Yosh:** 10–12
**Taxminiy davomiyligi:** 25 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-22)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). "Mantiq" blokining ikkinchi oʻyini: 24 (VA, YOKI, EMAS) → **25**.
Bogʻliq oʻyinlar: `24` (VA, YOKI, EMAS, rostlik jadvali), `20` (ikkilikda 1 + 1 = 10), `11` (bitta neyron XOR ni uddalay olmaydi).

> Zinapoyadagi chiroqni pastdan yoqib, tepada oʻchirish mumkin. Qanday qilib? Ikki kalit — "faqat bittasi" qoidasi.
> Shu qoida bilan kompyuter ikkilik sonlarni qoʻshadi.

**Muallif topshirigʻi:** "mantiq qoʻsh" (2026-09-22). Mazmunni men tanladim.

**Men qabul qilgan qarorlar** (muallif hali koʻrmagan):
- Yosh — **10–12** (20-oʻyindagi ikkilik qoʻshishga tayanadi). 24-oʻyin — 8–12.
- Yangi amal nomi — **XOR**, oʻzbekcha maʼnosi bilan: "faqat bittasi" (istisno YOKI). Qisqa boʻlgani uchun sxemada ham XOR yoziladi.
- Zinapoya sxemasi haqiqiy ulanishdek: har kalit ikki simdan birini tanlaydi. Chiroq kalitlar "har xil" boʻlganda yonadi.
- Sxemada amallar — **nomli qutilar** (VA, YOKI, EMAS, XOR), maxsus darvoza belgilari oʻrgatilmaydi. 1 oʻtayotgan sim — sariq, 0 — kulrang.
- Kompyuter qoʻshishi — **yarim qoʻshuvchi** (2 kirish, 2 chiqish). Ikki xonali qoʻshish faqat mashqda, 20-oʻyindagi ustun usulida.

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. **XOR** (faqat bittasi) — kirishlar har xil boʻlsa 1, bir xil boʻlsa 0 ekanini biladi; jadvalini YOKI jadvalidan farqlaydi (1 va 1 qatori).
2. Zinapoya chirogʻi misolida: har bosish chiroqni almashtiradi; jami bosishlar toq boʻlsa — yoniq, juft boʻlsa — oʻchiq.
3. **Amallar zanjirini** (2–3 amal) hisoblaydi: bitta amalning chiqishi — keyingisining kirishi.
4. Jadvalga qarab yetishmayotgan amalni topadi (VA, YOKI yoki XOR).
5. XOR ni VA, YOKI, EMAS dan yigʻish mumkinligini koʻradi: `(A YOKI B) VA EMAS (A VA B)`.
6. Ikkilikda bir xonali qoʻshishda **yigʻindi = A XOR B**, **koʻchirish = A VA B** ekanini tushuntiradi (yarim qoʻshuvchi) va ikki xonali sonlarni qoʻshadi.

## 2. Qahramonlar

Oqsoqol va Shogird (`umumiy/`).

## 3. Asboblar

- **Zinapoya sxemasi** (SVG, matnsiz): batareya, ikki kalit (har biri yuqori yoki pastki simni tanlaydi), ikki "yoʻl" sim, chiroq. Tok oʻtgan yoʻl sariq.
- **Zinapoya rasmi** (kirish): pastda va tepada kalit, tepada chiroq.
- **Amallar sxemasi** (SVG + HTML yozuvlar): chapda kirishlar `A`, `B` (qiymati bilan), oʻrtada amal qutilari, oʻngda chiqish chirogʻi (yarim qoʻshuvchida — ikkita: koʻchirish va yigʻindi). Sim qiymati 1 — sariq, 0 — kulrang; mashqda — hammasi kulrang, chiqish `?`. Nomaʼlum amal — punktir quti, ichida `?`.
- **Kalit tugmalari va rostlik jadvali** — 24-oʻyindagidek (jadval bola sinaganda toʻladi).

## 4. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (zinapoya chirogʻi)
   ├─► 1-bosqich: Faqat bittasi     [pastdan yoq, tepada oʻchir → 4 holat → XOR → YOKI bilan farqi → mashq 3]
   ├─► 2-bosqich: Amallar zanjiri   [EMAS (A VA B) sxemasi → XOR ni yigʻamiz → taʼrif → mashq 3]
   └─► 3-bosqich: Kompyuter qanday qoʻshadi [1 + 1 = 10 → yigʻindi = XOR, koʻchirish = VA → yarim qoʻshuvchi → mashq 3 → hikoya] → tabrik
```

**Kirish:** (Shogird) "Zinapoya chirogʻini pastda yoqdim, tepaga chiqib oʻchirdim!" / "Qanday qilib? Ikkita kalit bor-ku." / (Oqsoqol) "Bu — yangi mantiq amali. Sinab koʻramiz."

## 5. 1-bosqich: Faqat bittasi (XOR)

1. **Topshiriq:** zinapoya sxemasi, chiroq oʻchiq. "Sen pastdasan. Chiroqni yoq." (bola A ni bosadi) → "✓ Yondi! Endi tepaga chiqding. Chiroqni oʻchir." (B ni bosadi) → "✓ Oʻchdi!"
2. **Sinash:** qolgan holatlar — jadval toʻlguncha (24-oʻyindagidek).
3. **Nom:** "Chiroq faqat bitta kalit bosilganda yondi. Ikkalasi ham bosilsa — oʻchdi!" / "Bu — **XOR**: «faqat bittasi». A va B har xil — 1, bir xil — 0."
4. **Taʼrif:** YOKI va XOR jadvallari yonma-yon, `1 1` qatori belgilangan: "Farqi — shu qatorda: YOKI — 1, XOR — 0."
5. **Mashq** (3 ta to'g'ri), tasodifiy uch xil:
   - **Yonadimi?** Kalitlar holati berilgan, chiroq `?` (Ha / Yoʻq). 1-xato: jadvaldagi qator. 2-xato: "A = 1, B = 1 — bir xil → 0".
   - **Necha marta bosding?** "Chiroq oʻchiq edi. Pastki kalitni 3 marta, tepadagini 2 marta bosding. Chiroq yonadimi?" (0–4 marta). 1-xato: "Har bosish chiroqni almashtiradi. Jami necha marta?" 2-xato: "3 + 2 = 5 — toq → yoniq".
   - **Qaysi amal?** Toʻliq jadval berilgan → VA / YOKI / XOR. 1-xato: "1 1 qatoriga qara". 2-xato: nom va qoidasi.

## 6. 2-bosqich: Amallar zanjiri

1. **Birinchi zanjir:** `A, B → VA → EMAS → chiroq`. "Bitta amalning chiqishi — keyingisining kirishi." Bola kalitlarni bosadi, simlar yonadi, jadval toʻladi → "Bu — EMAS (A VA B)."
2. **XOR ni yigʻamiz:** `(A YOKI B) VA EMAS (A VA B)` sxemasi. Jadval toʻlgach: "Jadval XOR bilan bir xil! «Faqat bittasi»ni VA, YOKI, EMAS dan yigʻdik." / "11-oʻyinni esla: bitta neyron XOR ni uddalay olmagan edi. Bu yerda ham bitta amal yetmaydi — ikki qavat kerak."
3. **Taʼrif:** `Sxema — amallar zanjiri`, `XOR = (A YOKI B) VA EMAS (A VA B)`.
4. **Mashq** (3 ta to'g'ri), tasodifiy ikki xil:
   - **Chiroq yonadimi?** 2 amalli zanjir (VA/YOKI/XOR, keyin EMAS; yoki A ga EMAS, keyin VA/YOKI), kirishlar berilgan, simlar kulrang (Ha / Yoʻq). 1-xato: birinchi amal chiqishi yonadi va yoziladi. 2-xato: hamma simlar va qadamlar.
   - **Qaysi amal yetishmayapti?** Sxemada `?` quti + maqsad jadvali → VA / YOKI / XOR. 1-xato: jadvaldagi bitta qator hisoblab koʻrsatiladi. 2-xato: toʻgʻri amal qoʻyilib, jadval tekshiriladi.

## 7. 3-bosqich: Kompyuter qanday qoʻshadi

1. **Ikkilikda qoʻshish:** kalitlar A, B va "A + B = ?" (ikki xonali: koʻchirish va yigʻindi). Bola 4 holatni sinaydi, jadval toʻladi: `0 + 0 = 00`, `0 + 1 = 01`, `1 + 0 = 01`, `1 + 1 = 10`. "20-oʻyinni esla: 1 + 1 = 10."
2. **Kashfiyot:** jadvaldagi yigʻindi ustuni belgilanadi: "0, 1, 1, 0 — bu XOR!" / koʻchirish ustuni: "0, 0, 0, 1 — bu VA!"
3. **Yarim qoʻshuvchi:** sxema `A, B → XOR → yigʻindi`, `A, B → VA → koʻchirish`. Bola kalitlarni bosadi, ikki chiroq ikkilik sonni koʻrsatadi ("10 = ikki").
4. **Taʼrif:** `yigʻindi = A XOR B`, `koʻchirish = A VA B`. "Kompyuter 1 + 1 = 10 ni shunday topadi."
5. **Mashq** (3 ta to'g'ri), tasodifiy uch xil:
   - **Natija:** "A = 1, B = 1. Yarim qoʻshuvchi nima chiqaradi?" → `00` / `01` / `10` / `11`. 1-xato: yigʻindi va koʻchirish alohida soʻraladi (maslahat). 2-xato: sxema yonadi.
   - **Qaysi amal?** "Yigʻindini qaysi amal beradi?" / "Koʻchirishni?" → VA / YOKI / XOR.
   - **Ikki xonali qoʻshish:** `01 + 11 = ?` (sonlar 0–3) → 4 variant. 1-xato: "Oʻngdagi xonadan boshla: yigʻindi va koʻchirish." 2-xato: ustun qadamlari.
6. **Hikoya:**
   1. "Har xona uchun bitta qoʻshuvchi. Koʻchirish keyingi xonaga oʻtadi — xuddi ustunda qoʻshgandek."
   2. "80 yil oldin birinchi elektron kompyuter bir xonani egallagan." / "Bugun telefoningdagi protsessorda milliardlab shunday sxema bor."

**Tabrik:** "Tabriklayman! Endi sen kompyuter qanday qoʻshishini bilasan!" — `XOR — faqat bittasi`, `Sxema — amallar zanjiri`, `Yigʻindi = XOR, koʻchirish = VA`.

## 8. Ekran tuzilishi

1–2-oʻyindagi 3 zona. Ish maydonida: sxema (kengligi ≤ 380 px) va jadval (keng ekranda yonma-yon). Kalit va javob tugmalari — boshqaruvda. Sxema paytida ixcham rejim.

## 9. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `js/gates.js` | Sof mantiq: amallar (VA, YOKI, XOR, EMAS), zinapoya, sxemalar (tuzilishi, qiymatlari, qadamlari), yarim qoʻshuvchi, ikki xonali qoʻshish, topshiriqlar. Node testlari. |
| `js/game-art.js` | Zinapoya sxemasi, zinapoya rasmi, amallar sxemasi simlari va qutilari, kompyuter xonasi, protsessor — SVG, matnsiz |
| `js/gates-ui.js` | Sxemalar koʻrinishi (yozuvlar rasm ustida), kalit tugmalari, jadval, natija raqamlari |
| `js/scenes/common.js`, `stage1.js` … `stage3.js`, `final.js` | Sinash, mashq, bosqichlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `zinapoya-chirogi:v1`) |

## 10. Bu o'yinga kirmaydi

Toʻliq qoʻshuvchi (3 kirish) va uch xonali qoʻshish sxemasi, NAND/NOR nomlari, mantiqiy darvozalarning maxsus belgilari, xotira (trigger).

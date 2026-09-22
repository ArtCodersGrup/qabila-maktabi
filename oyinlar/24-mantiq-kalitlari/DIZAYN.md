# 24 — Mantiq kalitlari: dizayn

**Mavzu:** Mantiq — rost va yolgʻon, VA, YOKI, EMAS, rostlik jadvali
**Yosh:** 8–12
**Taxminiy davomiyligi:** 25 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-22)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Bu "Mantiq" blokining birinchi oʻyini (24 kalitlar → 25 zinapoya chirogʻi: "faqat bittasi", sxemalar, kompyuter qanday qoʻshadi).
Bogʻliq oʻyinlar: `04` chiroqlar (yoniq — 1, oʻchiq — 0), `11` neyron (bitta neyron VA, YOKI ni uddalaydi).

> Qabilaga chiroq oʻrnatildi. Uni kalitlar bilan yoqishadi. Lekin chiroq qachon yonadi?
> Shogird kalitlarni bosib, qoidani oʻzi topadi. Bu qoidalar — **mantiq**: kompyuter ham xuddi shunday "oʻylaydi".

**Muallif topshirigʻi:** "mantiq qoʻsh" (2026-09-22). Mazmun va tuzilishni men tanladim (birinchi suhbatdagi taklif: ikki kalit — VA, YOKI; ketma-ket va parallel ulash; rostlik jadvali).

**Men qabul qilgan qarorlar** (muallif hali koʻrmagan):
- Asosiy obraz — **elektr sxemasi**: batareya, simlar, kalitlar, chiroq. VA — kalitlar **ketma-ket** (tok ikkalasidan ham oʻtadi), YOKI — **parallel** (ikki yoʻl). Shunda qoida "koʻrinadi": tok qayerdan oʻtishini koʻz bilan kuzatsa boʻladi.
- **1 — rost (kalit ulangan, chiroq yoniq), 0 — yolgʻon (ulanmagan, oʻchiq).** 4-oʻyindagi chiroqlar bilan bir xil.
- **Rostlik jadvali bola kalitlarni bosganda oʻzi toʻladi:** 4 ta holatning hammasini sinab koʻrmaguncha, amal nomi aytilmaydi (avval qildir, keyin nomla).
- YOKI — **kamida bittasi** (ikkalasi ham boʻlsa ham rost). Kundalik "choy yoki kompot"dagi "faqat bittasi" maʼnosi bilan farqi ochiq aytiladi; "faqat bittasi" — 25-oʻyinda.
- Amallar nomi oʻzbekcha katta harf bilan: **VA, YOKI, EMAS**. Inglizcha AND, OR, NOT — faqat hikoyada bir marta.
- Aralash ifodalarda **qavs doim yoziladi**: `A VA (EMAS B)` — qaysi amal oldin bajarilishi haqida qoida oʻrgatilmaydi.
- Mashqda "B qanday boʻlsin?" savoli: javoblar `1`, `0`, `Farqi yoʻq`, `Boʻlmaydi` — bola faqat hisoblamay, mulohaza qiladi.

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. Gap **rost** (1) yoki **yolgʻon** (0) boʻlishini, kalit va chiroq holatini 1 va 0 bilan yozishni biladi.
2. **VA** — ikkalasi ham rost boʻlsa rost; **YOKI** — kamida bittasi rost boʻlsa rost; **EMAS** — teskarisi. Uchalasining rostlik jadvalini toʻldiradi.
3. Ketma-ket ulangan kalitlar — VA, parallel ulangani — YOKI ekanini tushuntiradi.
4. Berilgan qiymatlarda ikki amalli ifodani hisoblaydi: `A VA (EMAS B)`, `EMAS (A YOKI B)`.
5. Kundalik qoidani ("yomgʻir yogʻsa VA soyabon boʻlmasa — hoʻl boʻlasan") mantiqiy ifoda sifatida oʻqiydi va hisoblaydi.
6. "Chiroq yonishi uchun B qanday boʻlsin?" savoliga "farqi yoʻq" yoki "boʻlmaydi" javobi ham boʻlishi mumkinligini biladi.

## 2. Qahramonlar

Oqsoqol va Shogird (`umumiy/`).

## 3. Asboblar

- **Sxema** (SVG, matnsiz): batareya, simlar, 1–2 ta kalit, chiroq. Ulangan kalit — toʻgʻri chiziq, ulanmagan — koʻtarilgan dastak. Tok oʻtayotgan sim sariq, oʻtmayotgani kulrang. Chiroq yoniq — sariq nur, oʻchiq — kulrang, nomaʼlum (mashqda) — oq, ustida `?`.
  - `series` — ikki kalit ketma-ket (VA), `parallel` — ikki kalit parallel (YOKI), `single` — bitta kalit, `inverse` — **teskari kalit** (EMAS): bosilsa, tok uziladi (toʻq sariq rangda).
  - Kalit harflari (`A`, `B`) — HTML, rasm ustida.
- **Kalit tugmalari** (HTML, ≥ 48 px): `A: 1` / `A: 0` — bosilganda almashadi.
- **Rostlik jadvali:** ustunlar `A`, `B`, natija; qatorlar 00, 01, 10, 11. Boshida natija — `?`; bola shu holatni yasaganda toʻladi (✓ bilan). Hozirgi holat qatori belgilanadi.
- **Hayotiy kalitlar** (3-bosqich): ikonkali tugmalar (🌧️ Yomgʻir, ☂️ Soyabon …) va natija ("Hoʻl boʻlasan" / "Quruq qolasan").

## 4. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (qabilaga chiroq oʻrnatildi)
   ├─► 1-bosqich: VA — ikkalasi ham      [ketma-ket sxema → jadval toʻladi → VA → hayotiy misol → taʼrif → mashq 3]
   ├─► 2-bosqich: YOKI — kamida bittasi  [parallel sxema → jadval → YOKI (kundalik "yoki" bilan farqi) → taʼrif → mashq 3]
   └─► 3-bosqich: EMAS va birgalikda     [teskari kalit → yomgʻir va soyabon → uch amal jadvali → mashq 3 → hikoya] → tabrik
```

**Kirish:** (Oqsoqol) "Qabilamizga chiroq oʻrnatdik! U kalitlar bilan yonadi." / (Shogird) "Qaysi kalitni bossam yonadi?" / "Sinab koʻramiz. Kalitlar qoidasi — mantiq deyiladi."

## 5. 1-bosqich: VA — ikkalasi ham

1. **Sinash:** ketma-ket sxema, ikkala kalit ulanmagan. "Kalitlarni bos. Chiroq qachon yonadi?" Har yangi holat jadvalga yoziladi. Birinchi yonganda: "✓ Yondi!" Jadval toʻlmaguncha: "Yana bir holat qoldi — sinab koʻr." 4 holat topilgach:
   - "Chiroq faqat **ikkala kalit ham** ulanganda yondi."
   - "Tok bitta yoʻldan oʻtadi: A dan ham, B dan ham. Bittasi uzilsa — yoʻl yopiq."
2. **Nom:** "Bu — **VA** amali. A VA B — ikkalasi ham 1 boʻlsa, 1."
3. **Hayotiy misol:** "Futbol oʻynaymiz, agar toʻp bor VA havo yaxshi boʻlsa." / "Bittasi boʻlmasa — oʻyin yoʻq."
4. **Taʼrif:** jadval (toʻla) + `1 — rost`, `0 — yolgʻon`, `A VA B = 1 — faqat A = 1 va B = 1 boʻlsa`.
5. **Mashq** (3 ta to'g'ri), tasodifiy ikki xil:
   - **Yonadimi?** Sxemada kalitlar holati, chiroq — `?`. Javob: "Ha, yonadi" / "Yoʻq, oʻchiq". 1-xato: jadvalda shu qator yonadi. 2-xato: chiroq koʻrsatiladi + "A = 1, B = 0 → A VA B = 0".
   - **B qanday boʻlsin?** "A = 1. Chiroq yonsin. B qanday boʻlsin?" (yoki "oʻchiq boʻlsin"). Javob: `1`, `0`, `Farqi yoʻq`, `Boʻlmaydi`. Masalan, A = 0 va "yonsin" — boʻlmaydi; A = 0 va "oʻchiq" — farqi yoʻq. 1-xato: jadvaldagi A = … qatorlari yonadi. 2-xato: tushuntirish.

## 6. 2-bosqich: YOKI — kamida bittasi

1. **Sinash:** parallel sxema (ikki yoʻl). 4 holat → "Chiroq **kamida bitta** kalit ulanganda yondi. Ikkalasi ham ulansa — baribir yonadi."
2. **Nom:** "Bu — **YOKI** amali." / "Diqqat: gapda «choy yoki kompot» — bittasi degani. Mantiqda YOKI — kamida bittasi, ikkalasi ham boʻlsa ham rost."
3. **Hayotiy misol:** "Darvoza ochiladi, agar kaliting bor YOKI qoʻriqchi seni taniydi."
4. **Taʼrif:** jadval + ketma-ket (VA) va parallel (YOKI) sxema yonma-yon.
5. **Mashq** (3 ta to'g'ri): 5-boʻlimdagi ikki xil savol, amal tasodifiy — VA yoki YOKI (sxemasi bilan).

## 7. 3-bosqich: EMAS va birgalikda

1. **Teskari kalit:** bitta kalitli sxema, kalit toʻq sariq. "Bu kalit teskari ishlaydi: bossang — tok uziladi." Bola 2 holatni sinaydi → "Bu — **EMAS**: 1 → 0, 0 → 1." / "Koʻcha chirogʻi shunday: kun EMAS boʻlsa — yonadi."
2. **Yomgʻir va soyabon:** ikki hayotiy kalit — 🌧️ Yomgʻir, ☂️ Soyabon. Qoida: "Yomgʻir yogʻsa VA soyabon boʻlmasa — hoʻl boʻlasan." 4 holatni sinaydi (jadval toʻladi) → "Buni shunday yozamiz: Yomgʻir VA (EMAS Soyabon)."
3. **Taʼrif:** uch amal jadvali yonma-yon (VA, YOKI, EMAS). "Kompyuter hamma narsani shu uch amal bilan hisoblaydi."
4. **Mashq** (3 ta to'g'ri), tasodifiy ikki xil:
   - **Ifoda:** "A = 1, B = 0. A VA (EMAS B) = ?" Ifodalar: `EMAS A`, `A VA (EMAS B)`, `(EMAS A) YOKI B`, `EMAS (A VA B)`, `EMAS (A YOKI B)`, `(EMAS A) VA (EMAS B)`. Javob `1` / `0`. 1-xato: qavs ichidagisi hisoblab koʻrsatiladi ("EMAS B = 1"). 2-xato: toʻliq yechim qadamlari.
   - **Hayotiy qoida:** qoida + holat ("🌧️ Yomgʻir yogʻyapti — 1, ☂️ Soyabon bor — 0. Hoʻl boʻlasanmi?"). Qoidalar: yomgʻir/soyabon, dars tugadi/havo sovuq, kalit/qoʻriqchi, devor/batareya (robot toʻxtaydi), suv qaynadi/piyola bor. Javob "Ha" / "Yoʻq". 1-xato: qoida ifoda sifatida yoziladi. 2-xato: hisob.
5. **Hikoya** (rasm + 1–2 pufak):
   1. Kitob: "170 yildan koʻproq oldin ingliz matematigi Jorj Bul rost va yolgʻon bilan hisoblashni oʻylab topdi." / "Inglizchada VA — AND, YOKI — OR, EMAS — NOT."
   2. Protsessor: "80 yildan keyin bu mantiq elektr kalitlarida ishlatildi." / "Kompyuter ichida milliardlab kichik kalitlar VA, YOKI, EMAS ni bajaradi."
   3. Qidiruv (ikki doira, kesishgani yoniq): "Internetda «mushuk VA it» deb qidirsang — ikkalasi bor sahifalar chiqadi."

**Tabrik:** "Tabriklayman! Endi sen mantiq kalitlarini bilasan!" — `VA — ikkalasi ham`, `YOKI — kamida bittasi`, `EMAS — teskarisi`.

## 8. Ekran tuzilishi

1–2-oʻyindagi 3 zona. Ish maydonida: sxema (kengligi ≤ 360 px), kalit tugmalari, rostlik jadvali (tor ekranda sxema ostida, keng ekranda yonida). Boshqaruvda — javob tugmalari. Jadval va sxema paytida ixcham rejim.

## 9. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `js/logic.js` | Sof mantiq: amallar (VA, YOKI, EMAS), rostlik jadvali, "B qanday boʻlsin", ifodalar va ularning qadamlari, hayotiy qoidalar, topshiriqlar (takrorsiz). Node testlari. |
| `js/game-art.js` | Sxema (series, parallel, single, inverse), kitob, protsessor, ikki doira — SVG, matnsiz |
| `js/logic-ui.js` | Sxema koʻrinishi (harflar ustida), kalit tugmalari, rostlik jadvali, hayotiy kalitlar, ifoda qatori |
| `js/scenes/common.js` | Umumiy sahna qismlari: sinash (jadval toʻlguncha), taʼrif, mashq savollari |
| `js/scenes/stage1.js` … `stage3.js`, `final.js` | Kirish, bosqichlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `mantiq-kalitlari:v1`) |

## 10. Bu o'yinga kirmaydi

"Faqat bittasi" (XOR), amallardan sxema yigʻish va kompyuter qanday qoʻshishi (25-oʻyin), amallar tartibi (qavssiz ifodalar), uch va undan koʻp kirish, mantiqiy sxema belgilari (darvoza shakllari).

# 23 — Oʻn barmoq: dizayn

**Mavzu:** Klaviatura — oʻn barmoq bilan, klaviaturaga qaramay tez yozish
**Yosh:** 8–12
**Taxminiy davomiyligi:** 25 daqiqa (+ poyga)
**Qurilma:** faqat **kompyuter** yoki klaviatura ulangan planshet (QOIDALAR 3 ga istisno — pastda)
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-22)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Bu "Klaviatura" blokining birinchi oʻyini.
Keyingilari (muhokamada): klaviatura xaritasi (qaysi tugma nima qiladi), tezkor tugmalar jumbogʻi, matn muharriri.

> Shogird — qabila xabarchisi. U xabarlarni kompyuterda yozadi, lekin bitta barmoq bilan — juda sekin.
> Oqsoqol uni oʻn barmoq bilan, klaviaturaga qaramay yozishga oʻrgatadi.

**Muallif bilan kelishilgan:**
- Dars tartibi — hamma biladigan usul: asosiy qator → yuqori qator → pastki qator va katta harflar.
- Matnlar oʻzimizniki: oʻzbek maqollari va qabila soʻzlari. Boshqa saytlarning matni va dizayni olinmaydi.
- Doʻst bilan poyga — **bitta kompyuterda navbat bilan**. Server (backend) yoʻq.

**Men qabul qilgan qarorlar** (muallif hali koʻrmagan):
- **Faqat kompyuter.** Telefonda (barmoq bilan boshqariladigan ekran) ogohlantirish chiqadi, lekin klaviatura ulangan boʻlsa davom etsa boʻladi.
- **Avval aniqlik, keyin tezlik.** 1-bosqichda tezlik koʻrsatilmaydi, 2-bosqichdan boshlab — faqat natija sifatida (shoshiltiruvchi soat yoʻq).
- **Qator "toʻgʻri" = aniqlik kamida 90%.** Mashqda shunday 3 ta qator — bosqich tugadi (QOIDALAR 4.5 ga mos).
- **Xato harfda kursor toʻxtaydi:** toʻgʻri tugma bosilguncha oldinga yurmaydi. Backspace kerak emas; har xato bosish aniqlikni kamaytiradi.
- **Poyga gʻolibi:** aniqligi 90% va undan yuqori boʻlganlar ichida tezrogʻi. Ikkinchi oʻyinchi yoʻlakda birinchisining **soyasini** koʻradi (u qanday tezlikda yurgan boʻlsa, shunday yuradi).
- `ʻ` uchun `'`, `` ` ``, `’`, `ʻ`, `ʼ` — hammasi qabul qilinadi. Ekrandagi matnda doim toʻgʻri belgi `ʻ` turadi.
- Klaviatura rus tilida boʻlsa (kirill harfi keldi) — "Tilni EN ga oʻtkaz" ogohlantirishi, xato hisoblanmaydi. Caps Lock yoqilgan boʻlsa — ogohlantirish, xato hisoblanmaydi.
- **Eng yaxshi natija (rekord)** brauzerda saqlanadi va 3-bosqich, hikoya va poygada koʻrsatiladi.
- Oʻyin bosh ekranida 3 ta bosqichdan tashqari **"Poyga"** kartasi bor (umumiy qobiqqa `extras` qoʻshiladi).
- Oy va Quyosh belgilari musobaqa rejimidan olinadi — ikki joyda bir xil.
- "Davom" tugmasini **Enter** bilan ham bosish mumkin (klaviatura oʻyini).

---

## 1. Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Barmoqlarini **asosiy qatorga** qoʻyadi: F va J tugmalaridagi boʻrtiqni koʻrmasdan topadi, chap qoʻl — A S D F, oʻng qoʻl — J K L ;, bosh barmoqlar — Probelda.
2. Har bir harfni **qaysi barmoq** bosishini biladi (klaviaturadagi rang zonalari) va bosgandan keyin barmoq asosiy qatorga qaytadi.
3. Probelni bosh barmoq bilan, **katta harfni Shift** bilan yozadi (Shift ni boshqa qoʻlning jimjilogʻi bosadi).
4. **Oʻ va gʻ** ni ikki tugma bilan yozadi: o + ʻ (klaviaturada `'`).
5. Qisqa maqolni **90% dan yuqori aniqlik** bilan yozadi.
6. **Aniqlik** (nechta bosish toʻgʻri boʻldi) va **tezlik** (1 daqiqada nechta belgi) nima ekanini tushuntiradi va avval aniqlik muhimligini biladi.

## 2. Qahramonlar

Oqsoqol va Shogird (`umumiy/`). Yoʻlakda kichik xabarchi (shogird) yuguradi. Poygada — Oy (koʻk) va Quyosh (binafsha).

## 3. Asboblar

- **Ekran klaviaturasi** (HTML, bosilmaydi — faqat koʻrsatadi): 3 qator harf, ikki Shift va Probel.
  - Har tugma oʻz barmogʻi rangida (och tus): jimjiloq — binafsha, nomsiz barmoq — yashil, oʻrta barmoq — toʻq sariq, koʻrsatkich — koʻk, bosh barmoq — kulrang.
  - F va J da kichik boʻrtiq (chiziqcha).
  - **Navbatdagi tugma** toʻq rangda yonib turadi; katta harfda kerakli Shift ham yonadi.
  - Bosilgan tugma bir lahza "bosiladi": toʻgʻri — yashil, xato — toʻq sariq.
  - Hali oʻrganilmagan tugmalar xira.
- **Qoʻllar** (SVG): ikki kaft, har barmoq oʻz rangida; navbatdagi tugmani bosadigan barmoq yonadi.
- **Yozuv qatori:** matn harflari alohida; yozilgani — yashil, navbatdagisi — tagida chiziq, xato bosilganda — toʻq sariq silkinish. Boʻsh joy — kichik nuqta.
- **Yoʻlak:** har toʻgʻri harfda xabarchi oldinga yuradi, oxirida bayroq. Poygada ikkinchi oʻyinchida — birinchisining soyasi.
- **Natija kartasi:** aniqlik %, tezlik (belgi/daqiqa), vaqt (soniya).

## 4. Klaviatura qoidalari

- Harf `e.key` boʻyicha tekshiriladi, katta-kichik harf farqlanadi. `ʻ` — yuqoridagi 5 belgidan istalgani.
- Ctrl, ⌘ yoki Alt bilan bosilgan tugmalar oʻyinga kirmaydi (brauzerniki boʻlib qoladi).
- Tugmani bosib turish (takror) hisoblanmaydi. Shift, Caps Lock kabi tugmalarning oʻzi — xato emas.
- Yozish paytida Probel, `'`, `/` ning brauzerdagi ishi toʻxtatiladi: sahifa aylanmaydi, Firefox'da tez qidiruv ochilmaydi.
- **Aniqlik** = matndagi belgilar : hamma hisoblangan bosishlar × 100, pastga yaxlitlanadi (89,6% — 89%, oʻtmaydi).
- **Tezlik** = belgilar × 60 : soniyalar (birinchi bosishdan oxirgisigacha), butun son. Birligi — **belgi/daqiqa**.

## 5. Oʻyin oqimi

```
Bosh ekran: 3 ta bosqich + 🏁 Poyga
   ├─► Kirish (xabarchi, klaviatura tekshiruvi)
   ├─► 1-bosqich: Asosiy qator      [boʻrtiqlar → barmoqlar joyi → 6 ta kichik mashq → taʼrif → 3 ta qator]
   ├─► 2-bosqich: Yuqori qator      [5 ta mashq → oʻ, gʻ → taʼrif (tezlik) → 3 ta qator]
   └─► 3-bosqich: Pastki qator va katta harflar [5 ta mashq → Shift → taʼrif → 3 ta maqol → hikoya] → tabrik
```

**Kirish:** (Shogird) "Men qabila xabarchisiman. Xabarlarni kompyuterda yozaman." / "Lekin bitta barmoq bilan — juda sekin!" / (Oqsoqol) "Oʻn barmoq bilan yozishni oʻrganamiz. Klaviaturaga qaramasdan!"
- Telefonda: "Bu oʻyin uchun klaviatura kerak. Uni kompyuterda och." — tugmalar "Klaviaturam bor" va "Barcha oʻyinlar".
- "Klaviaturadagi istalgan harfni bos." — klaviatura borligi tekshiriladi. Kirill harfi kelsa — "Tilni EN ga oʻtkaz" ogohlantirishi.

## 6. 1-bosqich: Asosiy qator

1. **Boʻrtiqlar:** klaviaturada F va J yonadi. "F va J tugmalarida kichik boʻrtiq bor. Barmogʻing ularni koʻrmasdan topadi." → bola F ni, keyin J ni bosadi.
2. **Barmoqlar joyi:** qoʻllar rasmi. "Chap qoʻl barmoqlari: A S D F. Oʻng qoʻl: J K L ;." / "Bosh barmoqlar — Probelda. Qaraganing — ekran, klaviatura emas!"
3. **Kichik mashqlar** (koʻrsatish; aniqlik talab qilinmaydi, bola qatorni oxirigacha yozadi). Har biridan oldin bitta gap:
   - koʻrsatkich barmoqlar — `fff jjj fjfj`;
   - oʻrta barmoqlar — `ddd kkk dkdk`;
   - nomsiz barmoqlar — `sss lll slsl`;
   - jimjiloqlar — `aaa ʻʻʻ aʻaʻ` ("ʻ — ; ning yonidagi tugma, uni ham oʻng jimjiloq bosadi");
   - koʻrsatkich yon tomonga choʻziladi — `fgf jhj fgf jhj`;
   - birinchi soʻzlar — `ha hal sal dala`.
4. **Taʼrif:** "Bu — asosiy qator. Barmoqlar doim shu yerga qaytib keladi." / "Klaviaturaga qaramay yozish — oʻn barmoqli usul." Formula: `Chap qoʻl: A S D F G`, `Oʻng qoʻl: H J K L ;`, `Probel — bosh barmoq`.
5. **Mashq** (3 ta toʻgʻri qator): 4 ta soʻz faqat asosiy qator harflaridan (dala, salla, shakl, gʻalla, shagʻal, hafsala …).
   - Qator tugagach: "Aniqlik 95%" (tezlik koʻrsatilmaydi).
   - 1-xato (< 90%): "↻ Shoshilma — aniqlik muhim. Shu qatorni yana yoz."
   - 2-xato: "Hechqisi yoʻq, yangi qator." — hisobga qoʻshilmaydi.

## 7. 2-bosqich: Yuqori qator

1. "Barmoq yuqoriga chiqadi, bosadi va joyiga qaytadi." Kichik mashqlar: `ded kik ded kik`, `frf juj frf juj`, `ftf jyj ftf jyj`, `sws lol sws lol`, `aqa ppp aqa ppp`.
2. **Oʻ va gʻ:** "Oʻ harfi — ikki tugma: o va ʻ." Mashq: `oʻt toʻp yoʻl togʻ`.
3. **Taʼrif:** "Yuqori qator: Q W E R T — Y U I O P." / "Tezlik — 1 daqiqada nechta belgi yozganing. Aniqlik — nechta bosishing toʻgʻri boʻlgani." Formula: `20 ta belgi, 21 ta bosish → aniqlik 95%`, `1 daqiqada 60 ta belgi → tezlik 60 belgi/daqiqa`. "Avval aniq yoz, tezlik oʻzi keladi."
4. **Mashq** (3 ta toʻgʻri qator): 4 ta soʻz asosiy va yuqori qator harflaridan (quyosh, qishloq, shaftoli, qoʻshiq, daftar …). Qator tugagach: "Aniqlik 96%, tezlik 58 belgi/daqiqa."

## 8. 3-bosqich: Pastki qator va katta harflar

1. "Endi barmoq pastga tushadi." Kichik mashqlar: `fvf jmj fvf jmj`, `fbf jnj fbf jnj`, `dcd k,k dcd k,k`, `sxs l.l sxs l.l`, `aza aza`.
2. **Katta harf:** "Bir qoʻlning jimjilogʻi Shift ni bosib turadi, ikkinchi qoʻl harfni bosadi." Klaviaturada Shift ham yonadi. Mashqlar: `Ali Lola Sanam`, `Salom, Ali.` ("Gap oxirida — nuqta.")
3. **Taʼrif:** "Endi hamma harfni bilasan!" Formula: `Katta harf = Shift + harf`, `Shift — boshqa qoʻlning jimjilogʻi`.
4. **Mashq** (3 ta toʻgʻri qator): bitta maqol (Oʻqigan oʻzar, oʻqimagan toʻzar. / Aql yoshda emas, boshda. …). Natija + "Rekord: 64 belgi/daqiqa" (yangi rekordda — "Yangi rekord!").
5. **Hikoya** (rasm + 1–2 pufak):
   1. Yozuv mashinkasi: "Harflarning bunday tartibi 150 yil oldin yozuv mashinkasi uchun oʻylab topilgan." / "Birinchi qatordagi harflar boʻyicha uni QWERTY deyishadi."
   2. Tezlik: "Koʻp yozadigan kattalar 1 daqiqada 200–300 belgi yozadi." / "Sening rekording — N. Har kuni 10 daqiqa mashq qilsang, tez oʻsadi!"

**Tabrik:** "Tabriklayman! Endi sen oʻn barmoq bilan yozasan!" — `Asosiy qator: A S D F — J K L ;`, `Avval aniq, keyin tez`, `Katta harf: Shift + harf`.

## 9. Poyga (bitta kompyuterda, navbat bilan)

1. **Sozlash:** "Doʻsting bilan poyga! Matn bir xil, navbat bilan yozasizlar." Matn turi: `Asosiy qator` (5 ta soʻz), `Soʻzlar` (5 ta soʻz), `Maqol`.
2. **Navbat:** "Oy navbati. Barmoqlarni asosiy qatorga qoʻy." → "Tayyor" (yoki Enter) → 3, 2, 1 → yozish. Yoʻlakda oʻyinchi rangidagi xabarchi; ikkinchi oʻyinchida birinchisining soyasi.
3. **Natija:** jadval (vaqt, aniqlik, tezlik). Gʻolib — aniqligi ≥ 90% boʻlganlar ichida tezrogʻi. Ikkalasi ham < 90% — "Bu safar hech kim yutmadi: aniqlik 90% dan past." Tezlik teng — durang.
4. "Yana poyga" (endi ikkinchisi boshlaydi, yangi matn) / "Bosh ekran".

## 10. Ekran tuzilishi

1–2-oʻyindagi 3 zona. Yozish paytida ixcham rejim (qahramonlar kichik). Ish maydonida yuqoridan pastga: yoʻlak, yozuv qatori, ekran klaviaturasi, qoʻllar. Past ekranlarda (yotiq telefon) qoʻllar yashiriladi. Klaviatura 360 px kenglikka ham sigʻadi (tugmalar kichrayadi).

## 11. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `js/typing.js` | Sof mantiq: klaviatura qatorlari, qaysi tugmani qaysi barmoq bosadi, `ʻ` belgilarini tenglash, yozish sessiyasi (bosish → toʻgʻri/xato), aniqlik va tezlik, matnlar (soʻzlar, maqollar, kichik mashqlar), qator yasash, poyga gʻolibi, soya. Node testlari. |
| `js/game-art.js` | Qoʻllar, xabarchi, bayroq, yozuv mashinkasi, kubok — SVG, matnsiz |
| `js/typing-ui.js` | Ekran klaviaturasi, qoʻllar, yozuv qatori, yoʻlak, natija kartasi, rekord |
| `js/scenes/common.js` | Umumiy sahna qismlari: `typeLine` (klaviaturani tinglash), qatorlar mashqi, Enter bilan "Davom" |
| `js/scenes/stage1.js` … `stage3.js`, `race.js`, `final.js` | Kirish, bosqichlar, poyga, hikoya va tabrik |
| `js/main.js` | `QK.app.start` (kalit `on-barmoq:v1`, `extras`: poyga) |

Umumiy oʻzgarish: `QK.app.start({ extras })` — oʻyin bosh ekranida bosqichlardan keyin qoʻshimcha kartalar. Boshqa oʻyinlar oʻzgarmaydi.

## 12. Bu oʻyinga kirmaydi

Raqamlar qatori va belgilar (`- = ! ?`), Backspace, Enter, Tab va boshqa tugmalarning vazifasi (keyingi oʻyin — klaviatura xaritasi), tezkor tugmalar (Ctrl + …), kirill yozuvi, xatoni Backspace bilan tuzatish.

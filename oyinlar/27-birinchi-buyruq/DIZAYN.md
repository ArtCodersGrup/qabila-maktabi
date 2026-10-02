# 27 — Birinchi buyruq: dizayn

**Mavzu:** `print` — birinchi Python buyrugʻi, qoʻshtirnoq va xato xabari
**Yosh:** 12–16 · **Qurilma:** kompyuter (💻) · **Taxminiy davomiyligi:** 20–25 daqiqa
**Holati:** kod yozildi, testlar yashil — muallif koʻrib chiqishini kutmoqda (2026-09-29)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok rejasi: [`../umumiy/PYTHON-BLOK.md`](../umumiy/PYTHON-BLOK.md).
Bu — **"Python: dasturlash"** blokining birinchi oʻyini. Oldingi oʻyin: `26` Robot yoʻli (oʻqlar bilan buyruq).

> Robotga oʻqlar bilan buyruq bergan eding. Endi buyruq **soʻz bilan** yoziladi — bu Python tili.

## 1. Oʻquv maqsadlari

Oʻyindan keyin bola:

1. `print("matn")` yozib, matnni ekranga chiqaradi.
2. Har `print` oʻz satrini chiqarishini va buyruqlar **yuqoridan pastga** bajarilishini aytadi.
3. Qoʻshtirnoq ichidagi matn hisoblanmasligini koʻrsatadi: `print(2 + 3)` → `5`, `print("2 + 3")` → `2 + 3`.
4. `print()` boʻsh satr chiqarishini biladi; `print("a", "b")` orasiga boʻshliq qoʻyilishini biladi.
5. Berilgan kodni **oʻqib**, ishga tushirmasdan turib chiqishini aytadi.
6. Xato xabaridan **satr raqamini** topadi va toʻrt xil xatoni tuzatadi: yopilmagan qavs, yopilmagan qoʻshtirnoq, katta harf bilan yozilgan buyruq, qoʻshtirnoqsiz matn.
7. Berilgan chiqishni beradigan kodni **oʻzi yozadi**.

## 2. Qahramonlar va rasmlar

Oqsoqol va Shogird (`umumiy/js/art.js`). Oʻyinga xos ikkita rasm (`js/game-art.js`, ichida matn yoʻq):
**ekran** — kompyuter monitorida rangli kod satrlari; **ilon** — hikoya uchun.

## 3. Asboblar (umumiy `kod-ui.js` dan)

- **Kod muharriri** — satr raqamlari, monospace shrift, `Tab` → 4 boʻshliq, `:` dan keyin avtomatik otstup, `Ctrl`/`Cmd`+`Enter` — ishga tushirish. **Qavs va qoʻshtirnoq avtomatik yopilmaydi** — yopishni oʻrganish darsning bir qismi.
- **Chiqish paneli** — `print` chiqishi; xato boʻlsa: xato matni (satr raqami bilan), xato boʻlgan satr, ostida ↻ oʻq va oʻzbekcha izoh. Qizil rang yoʻq, `yana` rangi (`#F08A24`).
- **Oʻqiladigan kod** — boʻyalgan (kalit soʻz binafsha, matn yashil, son toʻq sariq, ichki funksiya koʻk).
- **Qadam-baqadam panel** — 2-bosqichda: `⏭ Qadam` bosilsa, bajarilayotgan satr yonadi.

Kod **kichik Python** talqinchisida bajariladi (`umumiy/js/python/`): internetsiz, `file://` da ham.

## 4. Oʻyin oqimi

```
Bosh ekran
   ├─► Kirish (oʻqlar → soʻz; Python nima)
   ├─► 1-bosqich: Birinchi buyruq  [koʻchirib ter → oʻz matni → taʼrif → mashq 3]
   ├─► 2-bosqich: Natijani top     [qadam-baqadam → qoʻshtirnoq sinovi → taʼrif → mashq 3]
   └─► 3-bosqich: Xato ovi         [xato xabarini oʻqish → birga tuzatish → mashq 3 → hikoya] → tabrik
```

## 5. 1-bosqich: Birinchi buyruq

1. **Koʻrsatish** (xato sanalmaydi): `print("Salom, qabila!")` berilgan — bola aynan teradi va ▶︎ ni bosadi. Toʻgʻri terilmaguncha maslahat satri almashib turadi.
2. **Oʻzingniki:** qoʻshtirnoq ichiga oʻz matnini yozadi (muharrirda `print("` turadi). Har qanday matn maqbul — kod xatosiz ishlashi va biror narsa chiqishi kifoya.
3. **Nom va taʼrif:** `print("matn")` — qoʻshtirnoq ichidagi matn ekranga chiqadi.
4. **Mashq** (3 ta toʻgʻri): berilgan kodni aynan terish. Matnlar tasodifiy (ismlar va qisqa gaplar).
   - 1-xato: farq qaysi satr va nechanchi belgidan boshlanishi aytiladi.
   - 2-xato: toʻgʻri kod va uning chiqishi koʻrsatiladi.

## 6. 2-bosqich: Natijani top

1. **Koʻrsatish:** uch `print` li dastur qadam-baqadam bajariladi — bola `⏭ Qadam` ni bosadi, yonayotgan satr siljiydi.
2. **Qoʻshtirnoq sinovi:** `print(2 + 3)` va `print("2 + 3")` yonma-yon ishga tushiriladi.
3. **Taʼrif:** qavs ichida qoʻshtirnoq boʻlmasa — hisoblanadi; boʻlsa — matnning oʻzi chiqadi. `print()` — boʻsh satr.
4. **Mashq** (3 ta toʻgʻri): kod berilgan, bola chiqishni satrma-satr yozadi. Besh xil tasodifiy kod: ikki `print`, orasida boʻsh `print()`, son va qoʻshtirnoqli son, vergulli `print("Salom,", ism)`, bir xil matn ikki xil qoʻshtirnoqda.
   - 1-xato: satrlar soni toʻgʻrimi — shu aytiladi.
   - 2-xato: haqiqiy chiqish koʻrsatiladi.

## 7. 3-bosqich: Xato ovi

1. **Koʻrsatish:** `print("Salom qabila!"` ishga tushiriladi, xato xabari birga oʻqiladi: tur, satr raqami, ↻ oʻq va izoh. "Xato — jazo emas, yordam."
2. **Birga tuzatish:** oʻsha kod muharrirda turadi, bola qavsni yopadi.
3. **Mashq** (3 ta toʻgʻri), navbat bilan ikki xil:
   - **Xatoni tuzat** — toʻrt xil buzilish: qavs, qoʻshtirnoq, `Print`, qoʻshtirnoqsiz matn. 1-xato: xato turi aytiladi. 2-xato: toʻgʻri kod.
   - **Kodni oʻzing yoz** — 1–2 satrli chiqish berilgan, bola kodni yozadi. **Har qanday toʻgʻri yechim** qabul qilinadi (kod ishga tushirilib, chiqishi solishtiriladi).
4. **Hikoya** (ilon rasmi): Python 1991-yilda Gvido van Rossum tomonidan yozilgan; nomi ilondan emas, kulgili koʻrsatuvdan olingan; bugun dunyoda eng koʻp oʻrgatiladigan til.

**Tabrik:** `print — matnni ekranga chiqaradi`, `Qoʻshtirnoq ichi — matn, tashqarisi — hisob`, `Xato xabari qayerda xato borligini aytadi`.

## 8. Ekran tuzilishi

Uch zona (`asos.css`). Ish maydonida ustma-ust: yoʻl-yoʻriq satri, oʻqiladigan kod, muharrir, chiqish paneli (eni ≤ 640 px). Boshqaruvda bitta katta tugma: **▶︎ Ishga tushir** yoki **Tekshir**. Kod koʻringanda ixcham rejim (qahramonlar kichrayadi). Telefonda ochilsa — klaviatura kerakligi haqida ogohlantirish, keyin baribir oʻynash mumkin.

## 9. Kod tuzilishi

```
27-birinchi-buyruq/
├── index.html            skriptlar tartibi: python/ → kod.js → logic.js → qobiq → kod-ui.js → sahnalar
├── css/style.css         shu o'yinga xos uslublar (kod uslublari umumiy/css/kod.css da)
├── js/logic.js           mashq savollarini yasash (sof mantiq)
├── js/game-art.js        ekran va ilon rasmlari
├── js/main.js            QK.app.start(...)
├── js/scenes/common.js   ish stoli, besh xil mashq
├── js/scenes/stage1–3.js bosqichlar
├── js/scenes/final.js    bosqich tugashi va tabrik
└── tests/logic.test.js   savollar chegarasi, takrorlanmasligi, yechimning to'g'riligi
```

## 10. 2026-10-02 qiyinlik yangilanishi

Sabab: hisobot-5 (C jadvali) — terish mashqi koʻchirish (osonlik 5), «kod yoz» 1–2 satrli `print`.

- **1-bosqich (terish):** `need: 2` — ikki toʻgʻri javob yetadi. Qiyin rejimda ikki satr teriladi
  (ikkinchisi — vergulli `print("a", "b")`).
- **2-bosqich (natija):** ikki yangi tur — `uch` (uch `print`, biri `print(a, b)` sonlar bilan, biri `print(a * b, "soʻz")`)
  va `qoshish` (`"a" + "b"` yopishadi, `"a", "b"` orasiga boʻshliq tushadi). Zina: 0 — ikki print, boʻsh `print()`,
  vergul; 1 — + son va qoʻshtirnoqli son; 2 — yangi turlar ustun.
- **3-bosqich:** «xatoni tuzat» da dastur 1 → 2 → 3 satr, xato faqat bittasida — bola xato xabaridagi satr raqamini
  oʻqiydi (maslahat qaysi satrligini va xato turini aytadi). «Kodni oʻzing yoz» da 1–2 → 2–3 → 3–4 satr.
- Testlar: 8 → 13.

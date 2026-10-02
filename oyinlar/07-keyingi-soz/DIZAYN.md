# 07 — Keyingi soʻz: dizayn

**Mavzu:** Sunʼiy intellekt — til modeli: chatbot keyingi soʻzni qanday tanlaydi
**Yosh:** 8–12
**Taxminiy davomiyligi:** 20 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-21)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Oldingi o'yin: `06` robotni o'rgatamiz (misollardan o'rganish).

> Robot yong'oqlarni saralashni o'rgandi. Endi u **gapirishni** o'rganmoqchi.
> Qabila unga o'z gaplarini beradi. Robot ma'noni tushunmaydi — u **qaysi so'zdan keyin qaysi so'z kelganini sanaydi**.

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. Til modeli matndan **so'z juftlarini sanashini** tushuntiradi (juftliklar jadvali).
2. Robot keyingi so'zni **eng ko'p uchragani** bo'yicha tanlashini biladi va shunday gap yozib ko'radi.
3. Har doim eng ko'pini tanlasa **bir xil gap** chiqishini, tasodif qo'shilsa gaplar xilma-xil bo'lishini ko'radi.
4. **Ko'proq matn — boyroq jadval**: robot ko'proq gap yoza oladi.
5. Robot **ma'noni bilmasligini** aytadi: uning bor bilgani — jadval.
6. Chatbotlar ham shunday ishlashini va ular **ishonch bilan xato yozishi mumkinligini**, tekshirish kerakligini biladi.

## 2. Asboblar

- **So'z kartochkasi** (chip): oq, dumaloq burchakli; tanlangani — sariq chegara.
- **Gaplar ro'yxati:** qabilaning gaplari (har biri 3 ta so'z).
- **Juftliklar jadvali:** `olov → yoqdi ▮▮▮ 3 / koʻrdi ▮ 1` (ustunchalar uzunligi soniga mos).
- **Robot qatori:** robot yozayotgan gap — so'zlar birma-bir qo'shiladi.
- **Tanga:** tasodifiy tanlashda aylanadi (tanlangan so'z ehtimolga mos).

**Matn (qabila gaplari):** `bola olov yoqdi` · `bola suv ichdi` · `bola olov koʻrdi` · `ovchi olov yoqdi` · `ovchi suv ichdi` · `qabila olov yoqdi` · `qabila suv ichdi`
3-bosqichda qo'shiladi: `ovchi togʻga chiqdi` · `bola togʻga chiqdi` · `qabila ovga chiqdi` · `ovchi ovga chiqdi`

## 3. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (robot gapirishni xohlaydi)
   ├─► 1-bosqich: Juftliklarni sanash  [gaplar → "olov"dan keyingi so'zlarni sanash → jadval → mashq]
   ├─► 2-bosqich: Robot gap yozadi     [eng ko'pini tanlash → bir xil gap → tanga (tasodif) → mashq]
   └─► 3-bosqich: Ko'proq matn         [matn qo'shildi → jadval boyidi → "robot ma'noni bilmaydi" → mashq 3 → hikoya] → tabrik
```

**Kirish:** "Robot gapirishni oʻrganmoqchi!" / (Shogird) "Unga soʻzlarning maʼnosini oʻrgatamizmi?" / "Yoʻq — u maʼnoni bilmaydi. U faqat sanaydi."

## 4. 1-bosqich: Juftliklarni sanash

1. **Gaplar:** qabilaning 7 ta gapi ekranda (so'z kartochkalari). "Robot bu gaplarni oʻqiydi."
2. **Sanaymiz:** `olov` so'zi yonadi. Bola har bir gapda **olovdan keyingi** so'zni bosadi → jadval to'ladi: `yoqdi 3`, `koʻrdi 1`. Boshqa so'z bosilsa — "Bu «olov» dan keyin kelgan soʻz emas" (xato hisoblanmaydi).
3. **Ta'rif:** "Bu — juftliklar jadvali. Robotning bor bilgani shu."
4. **Mashq** (4 / 5 / 6 ta to'g'ri — oxirdagi «qiyinlik yangilanishi»ga qara): "«{soʻz}» dan keyin eng koʻp qaysi soʻz kelgan?" — so'z tugmalari. 1-xato: shu so'z qatnashgan gaplar yonadi. 2-xato: jadval qatori ko'rsatiladi.

## 5. 2-bosqich: Robot gap yozadi

1. **Eng ko'pini tanlash:** boshlang'ich so'z `bola`. Robot jadvalga qaraydi → `olov` (2 marta) → `yoqdi` (3 marta). Gap: "bola olov yoqdi". Har qadamda jadval qatori yonadi.
2. **Muammo:** "Yana yoz" — yana o'sha gap. Va yana. "Robot doim bir xil gap yozadi. Zerikarli!"
3. **Tanga:** "Tasodif qoʻshamiz: koʻp uchragan soʻz koʻproq chiqadi, lekin boshqasi ham chiqishi mumkin." Bola "Yana yoz"ni bosadi — har safar boshqacha gap.
4. **Ta'rif:** "Chatbot ham shunday: keyingi soʻzni ehtimol bilan tanlaydi."
5. **Mashq** (4 / 5 / 6 ta to'g'ri — oxirdagi «qiyinlik yangilanishi»ga qara): jadval ko'rinib turadi. "Robot «{soʻz}» dan keyin qaysi soʻzni yozishi eng ehtimoli katta?" — so'z tugmalari. 1-xato: ustunchalar yonadi. 2-xato: javob.

## 6. 3-bosqich: Ko'proq matn va ma'no

1. **Matn qo'shamiz:** 4 ta yangi gap keladi, jadvalga yangi so'zlar (`togʻga`, `ovga`, `chiqdi`) qo'shiladi. Robot endi yangi gaplar yozadi ("bola togʻga chiqdi").
2. **Robot nimani biladi?** "Robot «olov» nimaligini bilmaydi. U faqat: «olov»dan keyin «yoqdi» koʻp kelgan, deb biladi."
3. **Mashq** (4 / 5 / 6 ta to'g'ri — oxirdagi «qiyinlik yangilanishi»ga qara), ikki xil:
   - **"Qaysi gapni robot yoza oladi?"** — 3 ta gapdan bittasi jadvaldagi juftliklardan yasaladi. 1-xato: mos kelmaydigan juftlik yonadi. 2-xato: to'g'ri gap ko'rsatiladi.
   - **"«{soʻz}» dan keyin nima kelishi mumkin?"** — jadvalda bor so'zni tanlash.
4. **Hikoya:**
   1. (kitoblar) "Chatbotlar millionlab kitob va sahifani oʻqiydi."
   2. (jadval) "Ular ham keyingi soʻzni ehtimol bilan tanlaydi — faqat jadvali juda katta."
   3. (robot savol bilan) "Robot maʼnoni bilmaydi: baʼzan ishonch bilan notoʻgʻri javob yozadi."
   4. (odam tekshiradi) "Shuning uchun uning javobini tekshirish kerak."

**Tabrik:** "Tabriklayman! Endi sen chatbot qanday yozishini bilasan!" — "Robot soʻz juftliklarini sanaydi", "Keyingi soʻz ehtimol bilan tanlanadi", "U maʼnoni bilmaydi — tekshirish kerak".

## 7. Ekran tuzilishi

3 zona. Ish maydonida: gaplar, juftliklar jadvali, robot qatori. Boshqaruvda: so'z tugmalari yoki "Yana yoz". Tanlash paytida ixcham rejim.

## 8. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `js/words.js` | Sof hisob: matn, juftliklar jadvali, eng ko'p uchragan so'z, ehtimol bilan gap yasash, "robot yoza oladimi", topshiriqlar. Node testlari. |
| `js/game-art.js` | Kitoblar, savol, tanga rasmlari (robot — 6-o'yindan nusxa emas, umumiy `QK.art.robot` qayta ishlatiladi... alohida fayl) |
| `js/words-ui.js` | So'z kartochkalari, gaplar ro'yxati, juftliklar jadvali (ustunchalar), robot qatori, so'z tugmalari |
| `js/scenes/*.js` | Bosqichlar, mashqlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `keyingi-soz:v1`) |

Robot rasmi 6-o'yinda `QK.art.robot` sifatida yozilgan — u shu o'yinning `game-art.js` fayliga ko'chiriladi emas, **`umumiy/js/art.js` ga** chiqariladi (ikki o'yin ishlatadi — QOIDALAR 9).

## 9. Bu o'yinga kirmaydi

Haqiqiy neyron tarmoq, tokenlar, "temperature" atamasi, uzun kontekst (ikki so'zli juftliklar), o'zbek tilining grammatikasi.

## 10. 2026-10-02 qiyinlik yangilanishi

Bolalar "o'ta oson" deyishgan: matn 7 ta qattiq gap edi (jadval har safar bir xil — ikkinchi misoldayoq yod bo'lardi), variantlar 2–3 ta, 2-bosqich mashqi esa jadval qatoridan eng katta sonni o'qishdan iborat edi. Yuqoridagi mashq tavsiflari o'rniga endi shu amal qiladi (QOIDALAR §4.3, §4.5):

- **To'g'ri javoblar soni:** 4 / 5 / 6 (1- / 2- / 3-bosqich), qiyin rejimda 7 — `QK.practice.need()`.
- **Gaplar banki** (`words.BANK`): 20 ta gap (eski 11 tasi + 9 ta yangi: baliq, non, ona…). **Har misolda** undan tasodifiy matn olinadi (`makeCorpus`): tier 0 — 7 ta gap, tier 1 — 8, tier 2 — 9. Jadval har safar boshqacha — sanash kerak, eslab qolish yordam bermaydi. Ko'rsatish qismi (BASE / EXTRA) o'zgarmagan.
- **Hamma savolda 4 variant:**
  - 1-bosqich `makeBestTask`: davomlari + chalg'ituvchi so'zlar; tier 1, 2 da so'zning kamida 3 xil davomi bor.
  - **2-bosqich — yangi savol** `makeGreedyTask`: "Robot «bola» dan boshlaydi va har safar eng koʻp uchragan soʻzni tanlaydi. Qaysi gap chiqadi?" — 4 ta gap, hammasi bir so'zdan boshlanadi; bola jadvalda **ikki qadam** yuradi. Chalg'ituvchilar — jadvalda bor, lekin "eng ko'pi" bo'lmagan yo'llar.
  - 3-bosqich `makeSentenceTask`: 4 ta gap; tier 1, 2 da noto'g'ri gaplar "deyarli to'g'ri" (bitta juftligi jadvalda bor, ikkinchisi yo'q — ikkalasini ham tekshirish shart). `makeFollowTask`: 4 ta so'z.
- **Maslahat javobni aytmaydi:** 3-bosqichda "qaysi gap" savolining maslahati endi to'g'ri gap qatorini yoritmaydi — tekshirish usulini eslatadi.
- **Testlar:** `tests/words.test.js` — bank, tasodifiy matn (7/8/9), 4 variant, yagona to'g'ri javob, takrorlanmaslik, qat'iy matnda generator osilib qolmasligi.


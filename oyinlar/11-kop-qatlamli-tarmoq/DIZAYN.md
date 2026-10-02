# 11 — Koʻp qatlamli tarmoq: dizayn

**Mavzu:** Chuqur o'rganish (DL) — neyron, qatlamlar va og'irliklarni o'rganish
**Yosh:** 8–12
**Taxminiy davomiyligi:** 20–25 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-22)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Bog'liq o'yinlar: `04` chiroqlar, `06` xatoni kamaytirib o'rganish, `09` qoida yoki misol, `10` belgilar.

> 10-o'yinda belgini (bo'yalgan kataklar soni) **biz** tanladik. Bugungi dasturlar belgilarni **o'zi** topadi.
> Buning siri — **neyronlar** va ularning **qatlamlari**. Neyron — 4-o'yindagi chiroqqa o'xshaydi.

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. **Neyron** qanday ishlashini tushuntiradi: yoniq kirishlar **og'irlik** bilan qo'shiladi, yig'indi **chegaradan** oshsa — neyron yonadi.
2. **+1** og'irlik yonishga yordam berishini, **−1** xalaqit berishini biladi.
3. **Qatlamlar**ni ko'radi: 1-qatlam kichik belgilarni (chiziqlar) topadi, keyingisi ulardan shakl yasaydi. Ko'p qatlam — **chuqur** tarmoq.
4. Ba'zi ishni **bitta neyron bajara olmasligini**, ikki qatlam esa bajarishini ko'radi.
5. Og'irliklarni tarmoq **misollardan o'zi o'rganishini** biladi: xato bo'lsa — og'irlik oshiriladi yoki kamaytiriladi.
6. Chuqur o'rganish — mashinali o'rganishning ichidagi qism ekanini aytadi (9-o'yindagi doiralar).

## 2. Asboblar

- **Neyron:** chapda kirish chiroqlari (bosiladigan), har birining yonida og'irlik (`+1` yashil / `−1` sariq), o'ngda katta doira — ichida **yig'indi**, ostida **chegara** (`≥ 2`). Yonsa — doira porlaydi.
- **3×3 rasm** (9 piksel) — bosiladigan kataklar.
- **Yashirin qatlam:** 2 ta neyron — **tik chiziq** va **yotiq chiziq** topuvchi.
- **Chiqish:** `krest` · `chiziq` · `boshqa` — yonganlari yoritiladi.

## 3. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (belgini tarmoq o'zi topadi)
   ├─► 1-bosqich: Bitta neyron      [chiroqlarni yoqib ko'rish → yig'indi va chegara → mashq]
   ├─► 2-bosqich: Qatlamlar         [3×3 rasm → chiziq topuvchilar → shakl → mashq]
   └─► 3-bosqich: Nega chuqur?      [bitta neyron uddalay olmaydi → ikki qatlam → o'rganish → mashq 3 → hikoya] → tabrik
```

**Kirish:** "10-oʻyinda belgini biz tanladik." / (Shogird) "Robot oʻzi topa oladimi?" / "Ha — neyronlar yordamida. Neyron chiroqqa oʻxshaydi."

## 4. 1-bosqich: Bitta neyron

1. **Ko'rsatish:** 3 ta kirish chirog'i, og'irliklar `+1, +1, −1`, chegara `≥ 2`. Bola chiroqlarni yoqadi: yig'indi jonli o'zgaradi (`+1 +1 = 2 → yondi`, `+1 −1 = 0 → yonmadi`).
2. **Ta'rif:** "Neyron yoniq kirishlarni ogʻirligi bilan qoʻshadi. Yigʻindi chegaraga yetsa — yonadi."
3. **Mashq** (4 / 5 / 6 ta to'g'ri — oxirdagi «qiyinlik yangilanishi»ga qara): "Bu neyron yonadimi?" — `Yonadi` / `Yonmaydi`. 1-xato: yig'indi qadamlab ko'rsatiladi. 2-xato: javob.

## 5. 2-bosqich: Qatlamlar

1. **3×3 rasm:** bola kataklarni bo'yaydi. **Tik chiziq** neyroni o'rta ustun to'liq bo'lsa yonadi, **yotiq chiziq** neyroni o'rta qator to'liq bo'lsa yonadi.
2. **Chiqish:** ikkalasi yonsa — `krest`, bittasi — `chiziq`, hech biri — `boshqa`.
3. **Ta'rif:** "1-qatlam kichik belgilarni topadi, 2-qatlam ulardan shakl yasaydi. Qatlam koʻp boʻlsa — tarmoq chuqur."
4. **Mashq** (4 / 5 / 6 ta to'g'ri — oxirdagi «qiyinlik yangilanishi»ga qara): rasm ko'rsatiladi — "Qaysi neyronlar yonadi?" (`ikkalasi` / `faqat tik` / `faqat yotiq` / `hech biri`) yoki "Tarmoq nima deydi?" (`krest` / `chiziq` / `boshqa`).

## 6. 3-bosqich: Nega chuqur?

1. **Bitta neyron uddalay olmaydi:** ish — "ikki chiroqdan **faqat bittasi** yoniq bo'lsa yon". Robot barcha og'irlik va chegaralarni sinaydi (9-o'yindagidek) — **hech biri** to'g'ri ishlamaydi.
2. **Ikki qatlam uddalaydi:** 2 ta yashirin neyron + chiqish — hamma holatda to'g'ri.
3. **O'rganish:** "Ogʻirliklarni kim tanlaydi? Tarmoqning oʻzi!" Neyron misollarni ko'radi: yonishi kerak edi-yu yonmasa — yoniq kirishlarning og'irligi **oshiriladi**; yonmasligi kerak edi-yu yonsa — **kamaytiriladi**. Xato qadamba-qadam kamayadi (6-o'yindagi chiziq kabi).
4. **Mashq** (4 / 5 / 6 ta to'g'ri — oxirdagi «qiyinlik yangilanishi»ga qara): neyron xato qildi — "Ogʻirlikni **oshiramizmi** yoki **kamaytiramizmi**?"
5. **Hikoya:**
   1. (qatlamlar) "Rasm taniydigan tarmoqlarda yuzlab qatlam va millionlab ogʻirlik bor."
   2. (miya) "Neyron gʻoyasi miyadan olingan — lekin tarmoq miya emas, u sonlar bilan ishlaydi."
   3. (qora quti) "Tarmoq nega shunday qaror qilganini tushuntirish qiyin — shuning uchun uni tekshirib turish kerak."
   4. (doiralar) "Chuqur oʻrganish — mashinali oʻrganishning ichidagi qism. Keyingi oʻyinda hammasini xaritaga joylaymiz."

**Tabrik:** "Tabriklayman! Endi sen neyron tarmoq qanday ishlashini bilasan!" — "Neyron: yigʻindi chegaraga yetsa — yonadi", "Qatlamlar: chiziq → shakl → javob", "Xato boʻlsa — ogʻirlik oʻzgaradi".

## 7. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `js/neural.js` | Sof hisob: neyron (yig'indi, chegara), 3×3 tarmoq (tik/yotiq topuvchi, chiqish), bitta neyronning chegarasi (barcha og'irliklarni sinash), ikki qatlamli yechim, perseptron o'rganishi, topshiriqlar. Node testlari. |
| `js/game-art.js` | Qatlamlar, miya, qora quti rasmlari |
| `js/neural-ui.js` | Neyron ko'rinishi, 3×3 to'r, qatlamlar sxemasi, javob tugmalari |
| `js/scenes/*.js` | Bosqichlar, mashqlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `kop-qatlamli-tarmoq:v1`) |

## 8. Bu o'yinga kirmaydi

Sigmoid/ReLU, gradient va "backpropagation" atamalari, kasr og'irliklar (faqat butun sonlar), konvolyutsiya, transformer.

## 9. 2026-10-02 qiyinlik yangilanishi

Bolalar "o'ta oson" deyishgan: 1-bosqich "Yonadi / Yonmaydi" va 3-bosqich "Oshiramiz / Kamaytiramiz" 2 variantli edi, buning ustiga neyron doirasi yig'indini (`Σ 2`) va "yondi" holatini mashqda ham ko'rsatib turardi — javob ekranda edi. Yuqoridagi mashq tavsiflari o'rniga endi shu amal qiladi (QOIDALAR §4.3, §4.5):

- **To'g'ri javoblar soni:** 4 / 5 / 6 (1- / 2- / 3-bosqich), qiyin rejimda 7 — `QK.practice.need()`.
- **1-bosqich — ikki qadam** (`common.twoStep`): avval **"Yigʻindi nechchi?"** (4 ta son: to'g'risi + tipik xatolar — hamma og'irlik yig'indisi, yoniq chiroqlar soni, chegara), keyin "Yonadimi?". Mashqda `Σ` va "yondi" yashirin (`neuronView` → `hideSum`, `hideFired`), yig'indi faqat 1-qadam to'g'ri bo'lgach ochiladi.
- **2-bosqich:** birinchi javob — "1-qatlamda qaysi neyronlar yonadi?" (4 variant); keyingilari **ikki qadam**: 1-qatlam (4 variant) → "tarmoq nima deydi?" (3 variant — chiqish qatlamida 3 ta neyron bor, shuning uchun u yolg'iz kelmaydi).
- **3-bosqich — ikki qadam:** "Oshiramiz / Kamaytiramiz", keyin **"Yangi yigʻindi nechchi?"** — har yoniq kirish og'irligi 1 ga o'zgaradi (4 variant: to'g'risi, teskari tomonga, o'zgarmagan, faqat 1 ga). Maqtov endi "endi yonadi" demaydi (bitta qadam yetmasligi mumkin) — yig'indi qanchadan qanchaga o'zgarganini aytadi.
- **Qiyinlik zinasi `tier`** (`neural.js`):

| Generator | tier 0 | tier 1 | tier 2 |
|---|---|---|---|
| `makeFireTask` | 3 kirish, og'irlik ±1, chegara 1..2 | og'irlik −2..2 (0 siz), chegara 1..3, ≥ 2 yoniq | **4 kirish**, chegara 1..4 |
| `makeHiddenTask` / `makeBothTask` | ortiqcha kataklar ulushi 0.6 | 0.8, ≥ 4 katak | 1.0 (chiziqni "shovqin" ichidan topish) |
| `makeUpdateTask` | 3 kirish, og'irlik −1..2, chegara 1..3 | og'irlik −2..3, ≥ 2 yoniq | **4 kirish**, chegara 1..4 |

- **Testlar:** `tests/neural.test.js` (tier chegaralari, 4 variant, yangi yig'indi haqiqiy qoida bilan solishtiriladi), `tests/twostep.test.js`.


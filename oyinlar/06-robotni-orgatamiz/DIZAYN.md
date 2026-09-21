# 06 — Robotni oʻrgatamiz: dizayn

**Mavzu:** Sunʼiy intellekt — mashina misollardan qanday oʻrganadi
**Yosh:** 8–12
**Taxminiy davomiyligi:** 20–25 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-21)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Oldingi o'yinlar: `01`–`05` (kodlash, Morze, Sezar, ikkilik, Rim raqamlari).

> Qabilaga robot keldi. Oldingi o'yinlarda **qoidani biz yozardik** (Morze jadvali, Sezar kaliti, chiroq kodi).
> Yong'oqlar esa har xil — jadval yozib bo'lmaydi. Robotga **misollar** ko'rsatamiz, qoidani u o'zi topadi.

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. Mashinaga qoida yozib berilmasligini, unga **misollar (o'qitish ma'lumoti)** berilishini tushuntiradi.
2. "Eng yaqin misol" qoidasini o'zi qo'llaydi: yangi narsa ko'rilganda, mashina eng o'xshash misolga qaraydi.
3. **Model** nima ekanini biladi (ajratuvchi chiziq) va **xato sonini** o'qiy oladi.
4. **O'qitish** — xatoni kamaytirish uchun modelni qadamba-qadam tuzatish ekanini ko'radi.
5. **Sinov ma'lumoti** nega kerakligini biladi: mashina ko'rmagan misollarda tekshiriladi.
6. Ma'lumot bir tomonlama bo'lsa mashina xato qilishini va muhim ishda odam tekshirishini aytadi.

## 2. Qahramonlar va asboblar

- **Oqsoqol va Shogird** (umumiy) + yangi qahramon **Robot**: gapirmaydi, maslahat bermaydi — faqat ko'rsatgan ishini bajaradi. Uning "miyasi" doim ekranda: nuqtalar va chiziq.
- **Yong'oq kartochkasi:** rasm + ikki o'lchov (`kattaligi: 4`, `ogʻirligi: 7`). Bosilsa — "chaqiladi": ichida mag'iz bor (to'la) yoki yo'q (bo'sh).
- **Maydon** (10×10 SVG): gorizontal o'q — *kattaligi*, vertikal o'q — *ogʻirligi*. Har misol — nuqta: **to'la = to'liq doira**, **bo'sh = ichi bo'sh halqa** (faqat rang bilan emas, shakl bilan ham farqlanadi).
- **Chegara chizig'i** va uni suradigan 4 ta tugma: `▲` `▼` (ko'tarish/tushirish), `⟲` `⟳` (burish). Yonida **"Xato: N"**.
- **Javob tugmalari:** `Toʻla` / `Boʻsh`.

## 3. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (robot keldi)
   ├─► 1-bosqich: Misollardan o'rganish [6 ta misolni chaqish → eng yaqin misol → mashq 3]
   ├─► 2-bosqich: Chegara chizig'i      [chiziqni surish, xato: N → robot o'zi o'rganadi → mashq 3]
   └─► 3-bosqich: Sinov va ma'lumot     [sinov to'plami → nega xato? → yangi misol → mashq 3 → hikoya] → tabrik
```

**Kirish:** "Qabilaga robot keldi!" / (Shogird) "U yongʻoqlarni saralay oladimi?" / "Hozircha yoʻq — u hech narsa bilmaydi. Biz oʻrgatamiz."

## 4. 1-bosqich: Misollardan o'rganish

1. **Misollar yig'amiz:** 6 ta yong'oq birma-bir keladi. Bola yong'oqni bosadi — u chaqiladi: mag'iz bor (to'la) yoki yo'q (bo'sh). Natija maydonga nuqta bo'lib tushadi. "Bu — **oʻqitish maʼlumoti**. Robot shu 6 ta misolni yodda saqlaydi."
2. **Eng yaqin misol:** yangi yong'oq keladi (hali chaqilmagan). "Robot qanday qaror qiladi? U eng oʻxshash misolni qidiradi." Maydonda yangi nuqtadan eng yaqin misolgacha chiziq tortiladi → javob. Keyin yong'oq chaqilib tekshiriladi.
3. **Ta'rif:** "Robot qoidani yozmaydi — u koʻrgan misollariga qaraydi. Eng yaqin misol qanday boʻlsa, javob ham shunday."
4. **Mashq** (3 ta to'g'ri): "Robot bu yongʻoqni nima deydi?" — bola javob tugmasini bosadi (ya'ni eng yaqin misol qoidasini o'zi qo'llaydi). 1-xato: eng yaqin 3 ta misolgacha chiziqlar chiziladi. 2-xato: eng yaqini yoritiladi va javob aytiladi.

## 5. 2-bosqich: Chegara chizig'i (model va o'qitish)

1. "Har safar hamma misolni koʻrib chiqish — sekin. Robot **chegara chizsa** boʻladi." Maydonda 10 ta misol va chiziq paydo bo'ladi (xato bilan).
2. **Bola sozlaydi:** 4 ta tugma bilan chiziqni suradi/buradi, "Xato: 4 → 2 → 0". 0 xatoga yetganda: "Chiziq — robotning **modeli**."
3. **Robot o'zi o'rganadi:** yangi ma'lumot va qiyshiq chiziq. "Endi robot oʻzi topadi." Animatsiya: har qadamda chiziq biroz suriladi, xato kamayadi (5 → 3 → 1 → 0). "Har xatodan keyin chiziqni biroz tuzatadi — bu **oʻqitish**."
4. **Mashq** (3 ta to'g'ri): yangi misollar to'plami, bola chiziqni 0 xatoga keltirib "Tayyor"ni bosadi. Xato qolgan bo'lsa — 1-xato: xato qilingan nuqtalar yonadi ("Bu 2 tasi notoʻgʻri tomonda"). 2-xato: robot o'zi to'g'rilab ko'rsatadi, yangi misol beriladi.

## 6. 3-bosqich: Sinov va ma'lumot sifati

1. **Sinov:** "Robot oʻrgandi. Endi sinaymiz — u hali koʻrmagan yongʻoqlar bilan." 6 ta yangi nuqta chiqadi, robot modeli bo'yicha ajratadi, 2 tasi xato bo'ladi (✗ belgisi bilan).
2. **Nega?** O'qitish misollari maydonning bir chekkasida turibdi, xato nuqtalar esa boshqa chekkada. "Robot faqat katta yongʻoqlarni koʻrgan edi."
3. **Tuzatamiz:** bola 2 ta yangi misolni qo'shadi (xato bo'lgan hududdan) → robot qayta o'qiydi (chiziq suriladi) → sinovda xato 0. "Maʼlumot qanday boʻlsa, robot shunday oʻylaydi."
4. **Mashq** (3 ta to'g'ri), ikki xil:
   - **Bashorat:** "Robot bu yongʻoqni nima deydi?" — chiziqli model bo'yicha (nuqta chiziqning qaysi tomonida).
   - **Qaysi misol foydali?** 3 ta variantdan robotga hozir eng kerakli misol tanlanadi (xato qilayotgan hududdagi). 1-xato: xato hudud yoritiladi. 2-xato: to'g'ri variant ko'rsatiladi.
5. **Hikoya** (rasm + 1–2 pufak):
   1. (ko'p rasm) "Bugungi sunʼiy intellekt ham shunday oʻrganadi — lekin misollari millionlab."
   2. (mushuk rasmlari) "Mushukni tanish uchun unga minglab mushuk rasmi koʻrsatiladi."
   3. (bir tomonlama ma'lumot) "Agar misollarda faqat oq mushuklar boʻlsa, qora mushukni tanimay qolishi mumkin."
   4. (shifokor va odam) "Shuning uchun muhim ishda oxirgi qarorni **odam** qabul qiladi."

**Tabrik:** "Tabriklayman! Endi sen robotni oʻrgata olasan!" — "Mashinaga qoida emas — misollar beriladi", "Model — chegara chizigʻi, oʻqitish — xatoni kamaytirish", "Maʼlumot qanday boʻlsa, javob shunday".

## 7. Ekran tuzilishi

3 zona (qo'llanma yo'q). Ish maydonida: maydon (nuqtalar va chiziq), yong'oq kartochkasi, "Xato: N". Boshqaruvda: javob tugmalari yoki chiziq tugmalari (`▲ ▼ ⟲ ⟳` + "Tayyor"). Chiziq tugmalari paytida ixcham rejim.

## 8. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `js/learn.js` | Sof hisob: nuqtalar, masofa va eng yaqin misol, chiziqli model (burchak + balandlik), xato soni, o'qitish qadamlari, ma'lumot to'plamlari, topshiriqlar. Node testlari. |
| `js/game-art.js` | Robot, yong'oq (to'la/bo'sh/chaqilmagan), hikoya rasmlari |
| `js/learn-ui.js` | Maydon (nuqtalar, chiziq, chiziqchalar), yong'oq kartochkasi, chiziq tugmalari, xato hisoblagichi |
| `js/scenes/*.js` | Bosqichlar, mashqlar, hikoya, tabrik |
| `../umumiy/js/practice.js` | Mashq sikli va ikki urinish (umumiy) |
| `js/main.js` | `QK.app.start` (kalit `robotni-orgatamiz:v1`) |

Bosh sahifada yangi bo'lim: **Sunʼiy intellekt** — "Mashina qanday oʻrganadi" (`bosh/js/bosh.js`).

## 9. Bu o'yinga kirmaydi

Neyron tarmoq tuzilishi va matematikasi (og'irliklar, gradient), k > 1 bo'lgan "eng yaqin k ta", regressiya, matn va rasm bilan ishlash (ular keyingi o'yinlarda: "Keyingi soʻz", "Sehrli qutilar").

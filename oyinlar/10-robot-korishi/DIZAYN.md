# 10 — Robot nimani koʻradi?: dizayn

**Mavzu:** Kompyuter ko'rish (CV) — rasm robot uchun sonlar; tanish va uning qiyinchiligi
**Yosh:** 8–12
**Taxminiy davomiyligi:** 20 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-21)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Bog'liq o'yinlar: `04` piksel va bitlar, `06` misollardan o'rganish, `09` qoida yoki misol.

> Robotga ko'z berdik. Lekin u rasmni biz kabi ko'rmaydi — u faqat **kataklardagi sonlarni** ko'radi.
> Shu sonlar bilan qanday qilib "bu kvadrat" deb aytadi?

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. Rasm kompyuter uchun **kataklar (piksellar) va sonlar** ekanini biladi (4-o'yin: yoniq/o'chiq → 1/0).
2. Robot rasmni **shablon bilan solishtirib** tanishini tushuntiradi: nechta katak mos kelsa — o'sha.
3. Rasm **surilsa yoki o'zgarsa** piksellar butunlay boshqacha bo'lishini va shablon usuli adashishini ko'radi.
4. **Belgi (xususiyat)** nima ekanini biladi: masalan "nechta katak bo'yalgan" — bu surilganda o'zgarmaydi.
5. **Kompyuter ko'rish — vazifa**, uni qoida bilan ham, misol bilan ham yechish mumkinligini aytadi (9-o'yin bilan bog'lanadi).
6. Bugungi kamera va telefonlar shu vazifani bajarishini biladi.

## 2. Asboblar

- **6×6 to'r** — bosiladigan kataklar (bo'yalgan / bo'sh). Har katak ≥ 48 px.
- **Sonlar jadvali** — o'sha to'rning 1/0 ko'rinishi (robot ko'radigan narsa).
- **Shablonlar:** `kvadrat` (32 katak), `uchburchak` (24 katak), `krest` (20 katak) — 6×6 da chiziladi.
- **Moslik chizig'i:** har shablon uchun "36 tadan N ta mos" + ustuncha.
- **Belgi ko'rsatkichi:** "bo'yalgan kataklar: N".

## 3. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (robotga ko'z berdik)
   ├─► 1-bosqich: Rasm — bu sonlar   [bola chizadi → 1/0 jadvali → mashq 3]
   ├─► 2-bosqich: Shablon bilan tanish [3 shablon → moslik sanash → mashq 3]
   └─► 3-bosqich: Surilsa nima bo'ladi? [surish → shablon adashadi → belgi → mashq 3 → hikoya] → tabrik
```

**Kirish:** "Robotga koʻz berdik!" / (Shogird) "U rasmni koʻradimi?" / "Koʻradi, lekin boshqacha: u faqat sonlarni koʻradi."

## 4. 1-bosqich: Rasm — bu sonlar

1. **Chizamiz:** bola 6×6 to'rda kataklarni bosib rasm chizadi. Yonida darhol **1/0 jadvali** paydo bo'ladi: bo'yalgan — 1, bo'sh — 0.
2. **Ta'rif:** "Robot rasmni koʻrmaydi — u shu sonlarni koʻradi. Har katak — bitta piksel (4-oʻyindagi chiroq kabi)."
3. **Mashq** (3 ta to'g'ri): "Robot mana shu sonlarni koʻrdi. Bu qaysi rasm?" — 3 ta rasmdan bittasi tanlanadi. 1-xato: birinchi qator taqqoslanadi. 2-xato: to'g'ri rasm ko'rsatiladi.

## 5. 2-bosqich: Shablon bilan tanish

1. **Shablonlar:** robot xotirasida 3 ta shakl bor (kvadrat, uchburchak, krest).
2. **Solishtirish:** yangi rasm keladi; robot har shablon bilan **nechta katak mos kelishini** sanaydi (36 tadan). Eng ko'p mos kelgani — javob. Bola ustunchalarni ko'radi.
3. **Ta'rif:** "Robot «tanish» degani — eng oʻxshash shablonni topish."
4. **Mashq** (3 ta to'g'ri): biroz shovqinli rasm ko'rsatiladi, bola "robot nima deydi?" degan savolga javob beradi (3 ta shakl tugmasi). 1-xato: moslik ustunchalari ochiladi. 2-xato: javob.

## 6. 3-bosqich: Surilsa nima bo'ladi?

1. **Surish:** o'sha rasm 1 katak o'ngga suriladi. Ko'zga deyarli bir xil, lekin **mosliklar keskin tushadi** va robot adashishi mumkin. "Robot uchun bu butunlay boshqa sonlar."
2. **Belgi:** "Sonlarni emas, **belgini** sanaymiz: nechta katak boʻyalgan?" — bu son surilganda **deyarli o'zgarmaydi**. Robot belgiga qarab to'g'ri javob beradi.
3. **Ta'rif:** "Belgi — rasmdagi muhim xususiyat. Bugungi dasturlar minglab belgini oʻzi topadi (11-oʻyin)."
4. **Mashq** (3 ta to'g'ri): surilgan yoki shovqinli rasm beriladi: **"Qaysi usul toʻgʻri javob beradi?"** — `Shablon (piksel)` yoki `Belgi (boʻyalgan kataklar)`. 1-xato: ikkala usul natijasi ko'rsatiladi. 2-xato: javob va sababi.
5. **Hikoya:**
   1. (kamera) "Telefon kamerasi yuzni shunday topadi: kataklar, belgilar, taqqoslash."
   2. (yo'l belgisi) "Mashina yoʻl belgisini oʻqiydi — lekin qor yoki soya tushsa adashishi mumkin."
   3. (rentgen) "Shifokorga rasmda kasallikni koʻrsatib beradi — oxirgi qarorni shifokor qabul qiladi."
   4. (doiralar) "Koʻrish — **vazifa**. Uni qoida bilan ham, misol bilan ham yechsa boʻladi."

**Tabrik:** "Tabriklayman! Endi sen robot rasmni qanday koʻrishini bilasan!" — "Rasm — kataklar va sonlar", "Tanish — eng oʻxshashini topish", "Belgi surilganda deyarli oʻzgarmaydi".

## 7. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `js/vision.js` | Sof hisob: 6×6 to'r, shablonlar, moslik sanash, surish/shovqin, belgilar, topshiriqlar. Node testlari. |
| `js/game-art.js` | Kamera, yo'l belgisi, rentgen rasmlari |
| `js/vision-ui.js` | To'r (chiziladigan va ko'rsatiladigan), 1/0 jadvali, moslik ustunchalari, shakl tugmalari |
| `js/scenes/*.js` | Bosqichlar, mashqlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `robot-korishi:v1`) |

## 8. Bu o'yinga kirmaydi

Rangli rasm (faqat qora/oq), filtr va konvolyutsiya matematikasi, yuzni aniqlash algoritmi, chuqur tarmoq tuzilishi (11-o'yin).

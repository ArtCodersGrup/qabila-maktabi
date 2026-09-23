# 26 — Robot yoʻli: dizayn

**Mavzu:** Algoritm — aniq va tartibli buyruqlar roʻyxati
**Yosh:** 8–12
**Taxminiy davomiyligi:** 20 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-23)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Bu **"Algoritm va dasturlash"** blokining birinchi oʻyini.
Bogʻliq oʻyinlar: `05` al-Xorazmiy ("algoritm" soʻzi shu nomdan), `06` robotni oʻrgatamiz (u misoldan oʻrganadi — bu yerda biz buyruq beramiz).

> Qabilaga temir yordamchi — robot keldi. U gapni tushunmaydi, faqat toʻrtta buyruqni biladi.
> Shogird unga buyruqlar roʻyxatini tuzib beradi. Bu roʻyxat — **algoritm**.

**Muallif topshirigʻi:** "yana qanaqa mavzular qamrab olamiz?" (2026-09-23) — taklif qilingan toʻrt yoʻnalishdan **"Algoritm va dasturlash"** bloki tanlandi, bosh sahifada **boshiga** (klaviaturadan keyin), avval 26-oʻyin toʻliq.

**Blok rejasi** (kelishilgan):

| № | Oʻyin | Mavzu |
|---|---|---|
| 26 | **Robot yoʻli** | buyruqlar roʻyxati, tartib, dasturni oʻqish |
| 27 | Takror va naqsh | sikl: "4 marta", ichma-ich takror, funksiya |
| 28 | Agar… | shart: sensor, agar/aks holda, "toʻsiqqacha" |
| 29 | Xato ovi | dasturdagi xatoni topish va tuzatish |

**Men qabul qilgan qarorlar** (muallif hali koʻrmagan):

- **Absolut oʻqlar** (⬆ ⬇ ⬅ ➡) — har biri bitta katakka siljitadi. 8 yoshli bola uchun eng oson model: ekranda koʻrgan yoʻnalish — bosgan tugmasi. Robotning **oʻz nuqtai nazari** (oldinga + burilish) 27-oʻyinda, alohida sahna bilan kiritiladi. Shuning uchun bu oʻyinda robot **oldga qarab** chiziladi va burilmaydi, faqat siljiydi.
- **Maydon 5×5 katak.** Tik holatda katak ≈ 62 px — barmoqqa yetarli (QOIDALAR 3). **Yotiq telefonda** (balandligi 360 px) maydon va dastur roʻyxati yonma-yon turadi, katak ≈ 40 px: 5×5 maydon uchun bundan kattasi ekranga sigʻmaydi. Tugmalar (48 px) va boshqa hamma narsa qoidaga mos.
- **Sudrash yoʻq:** buyruq tugmasi bosilsa — roʻyxat oxiriga qoʻshiladi, roʻyxatdagi buyruq bosilsa — oʻchadi (1-oʻyindagi kataklar kabi).
- **Robot toʻsiqqa yoki maydon chekkasiga duch kelsa — oʻsha joyda toʻxtaydi**, dastur tugaydi. Sabab va natija shunda ochiq koʻrinadi. Qizil rang va qoʻrqituvchi ovoz yoʻq: tosh ustida ↻ belgisi, "yana urin" rangi.
- **Gulxanga yetganda robot toʻxtaydi** — ortda qolgan buyruqlar bajarilmaydi. Bola "ortiqcha buyruq yozdim" deb jazolanmaydi.
- **Dastur uzunligi ≤ 8 buyruq**, eng qisqa yechim 2–6 buyruq. Roʻyxat bitta qatorga sigʻadi.
- **Tasodifiy maydon har safar tekshiriladi:** yechimi bor, uzunligi chegarada, oldingisining aynan oʻzi emas. 2–3-bosqichda yoʻl **kamida bitta burilishli** boʻladi — aks holda tartib muhimligi koʻrinmaydi.
- **Hikoyada:** "algoritm" soʻzi al-Xorazmiy nomidan kelib chiqqan (18-oʻyinga havola).

---

## 1. Oʻquv maqsadlari

Oʻyindan keyin bola:

1. **Algoritm** — ishni bajarish uchun aniq, **tartibli** buyruqlar roʻyxati ekanini aytadi.
2. Berilgan maydon uchun 2–6 buyruqli algoritm yozadi va uni ishga tushiradi.
3. Bir xil buyruqlar boshqa tartibda berilsa, natija boshqacha boʻlishini misolda koʻrsatadi.
4. Toʻsiqni aylanib oʻtadigan yoʻl uchun algoritm yozadi.
5. Berilgan buyruqlar roʻyxatini **oʻqib**, robot qaysi katakka borishini oldindan aytadi.
6. Robot yurgan yoʻlga qarab, unga berilgan buyruqlarni tiklaydi.
7. Kompyuter buyruqni oʻzicha toʻgʻrilamasligini, faqat aytilganini bajarishini tushuntiradi.

## 2. Qahramonlar

Oqsoqol va Shogird (`umumiy/`). Uchinchi qahramon — **robot** (maydon ichida, `umumiy/js/dastur-ui.js`).

## 3. Asboblar

- **Maydon** (SVG, matnsiz): 5×5 katak. Ichida — robot, gulxan (maqsad), toshlar (toʻsiq).
  - Katak: oq fon, kulrang chiziq. Robot: koʻk tanasi, ikki koʻzi, oldga qaraydi. Gulxan: toʻq sariq olov va gulxan choʻplari. Tosh: kulrang dumaloq.
  - **Iz** — robot bosib oʻtgan kataklar: kulrang nuqtalar va ularni bogʻlovchi chiziq (3-bosqichda va yechimda).
  - **Toʻxtash belgisi** — tosh yoki chekkaga urilgan joyda ↻ (toʻq sariq).
- **Buyruq tugmalari** (HTML, 64×64): ⬅ ⬆ ⬇ ➡, yonida **▶︎ Ishga tushir** va **⌫**.
- **Dastur roʻyxati** (HTML): qoʻshilgan buyruqlar tartib bilan; boʻsh joy — nuqtali katak. Bajarilayotgan buyruq belgilanadi.
- **Katak tanlash** — 3-bosqichda "robot qayerga boradi?" savoli uchun maydon kataklari bosiladigan boʻladi.

## 4. Oʻyin oqimi

```
Bosh ekran
   ├─► Kirish (robot keldi, u faqat 4 ta buyruqni biladi)
   ├─► 1-bosqich: Buyruqlar roʻyxati   [toʻgʻri yoʻl → nom: algoritm → taʼrif → mashq 3]
   ├─► 2-bosqich: Tartib muhim         [bir xil buyruqlar, ikki tartib → tosh → taʼrif → mashq 3]
   └─► 3-bosqich: Dasturni oʻqish      [robot qayerga boradi? / izdan buyruqni tikla → mashq 3 → hikoya] → tabrik
```

## 5. 1-bosqich: Buyruqlar roʻyxati

1. **Koʻrsatish** (ikki maydon, xato sanalmaydi):
   - **Toʻgʻri chiziq:** robot chap tomonda, gulxan oʻng tomonda (3 katak, toʻsiq yoʻq). Bola ➡ ni bosadi — roʻyxatga qoʻshiladi. **▶︎ Ishga tushir** — robot qadam-baqadam yuradi (har qadam 0.34 s), bajarilayotgan buyruq roʻyxatda yonadi.
   - **Burilishli yoʻl:** gulxan yuqorida va oʻngda — bola ikki yoʻnalishni birga ishlatadi. Gulxanga yetmaguncha qayta urinadi (robot boshiga qaytadi, yozgan dasturi saqlanadi).
2. **Nom:** "Sen hozir **algoritm** yozding! Algoritm — aniq buyruqlar roʻyxati."
3. **Hayotiy misol:** choy damlash: `suv quy → qaynat → choy sol → kut`. "Buyruqlar aniq va tartibda — bu ham algoritm."
4. **Taʼrif:** `Algoritm — ishni bajarish uchun aniq, tartibli buyruqlar roʻyxati.`
5. **Mashq** (3 ta toʻgʻri): toʻsiqsiz tasodifiy maydon, eng qisqa yoʻl 2–4 buyruq, kamida bitta burilish.
   - 1-xato: robot qayerda toʻxtagani koʻrsatiladi + "↻ Robot gulxanga yetmadi. Sanab koʻr: nechta katak yuqoriga, nechta oʻngga?"
   - 2-xato: toʻgʻri dastur roʻyxatda yoziladi va robot uni bajarib koʻrsatadi.

## 6. 2-bosqich: Tartib muhim

1. **Koʻrsatish:** maydonda tosh bor. Ikkita bir xil buyruqlar toʻplami, ikki xil tartibda:
   - `➡ ➡ ⬆` — robot toshga urilib toʻxtaydi (↻).
   - `⬆ ➡ ➡` — robot toshni aylanib oʻtib, gulxanga yetadi (✓).
   - Ikkalasini ham bola oʻzi ishga tushiradi (avval birinchisi, keyin ikkinchisi).
2. **Nom:** "Buyruqlar bir xil edi — faqat **tartibi** boshqa. Natija ham boshqa boʻldi."
3. **Taʼrif:** `Bir xil buyruqlar, boshqa tartib — boshqa natija. Tartib — algoritmning bir qismi.`
4. **Mashq** (3 ta toʻgʻri): 2–4 toshli tasodifiy maydon, eng qisqa yoʻl 3–6 buyruq, kamida bitta burilish.
   - 1-xato: toʻxtagan joy + "↻ Tosh! Robot oʻtolmadi. Uni aylanib oʻt."
   - 2-xato: toʻgʻri dastur + bajarilishi.

## 7. 3-bosqich: Dasturni oʻqish

1. **Koʻrsatish:** endi dastur tayyor, robot hali yurmagan. "Ishga tushirmasdan turib ayt: robot qayerga boradi?" Bola katakni bosadi, keyin robot yuradi va tekshiriladi.
2. **Nom:** "Sen dasturni **oʻqiding** — koʻzing bilan bajarding. Dasturchilar ham shunday qiladi."
3. **Mashq** (3 ta toʻgʻri), tasodifiy ikki xil:
   - **Robot qayerga boradi?** 3–5 buyruqli dastur berilgan, bola maydondan katakni bosadi. Toʻsiq boʻlsa, javob — robot toʻxtagan katak.
     - 1-xato: birinchi buyruq bajarib koʻrsatiladi, robot boshiga qaytadi. "↻ Birinchi qadamni koʻrsatdim. Qolganini oʻzing sana."
     - 2-xato: robot toʻliq yuradi, iz qoladi.
   - **Qaysi buyruqlar berilgan?** Robotning izi koʻrsatiladi (nuqtalar va chiziq), bola buyruqlar roʻyxatini yigʻadi.
     - 1-xato: birinchi qadam yoʻnalishi yonib turadi. "↻ Birinchi qadamga qara: robot qayoqqa yurdi?"
     - 2-xato: toʻgʻri roʻyxat yoziladi.
4. **Hikoya** (rasm + 1–2 pufak):
   1. Kitob va qalam: "Bu soʻzni bilasanmi? **Algoritm** — Muhammad al-Xorazmiy nomidan kelib chiqqan (18-oʻyin)." / "Uning kitobidan Yevropa hisob qoidalarini oʻrgangan."
   2. Robot va telefon: "Kompyuterga yozilgan algoritm — **dastur** deyiladi." / "Telefondagi har bir ilova — kimdir yozgan dastur."
   3. Robot qoʻlida xarita: "Kompyuter oʻzicha toʻgʻrilamaydi. Nima aytsang — shuni bajaradi."

**Tabrik:** "Tabriklayman! Endi sen robotga dastur yoza olasan!" — `Algoritm — aniq buyruqlar roʻyxati`, `Tartib muhim`, `Dasturni oʻqish`.

## 8. Ekran tuzilishi

Uch zona (asos.css). Ish maydonida: maydon (eni ≤ 340 px) va uning ostida dastur roʻyxati. Boshqaruvda: buyruq tugmalari + ▶︎ Ishga tushir. Maydon koʻringanda ixcham rejim (qahramonlar kichrayadi). Yotiq holatda maydon balandlikka moslashadi.

## 9. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `umumiy/js/dastur.js` | **Blok uchun umumiy** sof mantiq: maydon, buyruqlar, bajarish (`run`), eng qisqa yoʻl (`solve`, BFS), tasodifiy maydon. Node testlari. |
| `umumiy/js/dastur-ui.js` | **Blok uchun umumiy** ekran qismlari: maydon SVG, robot animatsiyasi, dastur roʻyxati, buyruq tugmalari |
| `umumiy/css/dastur.css` | **Blok uchun umumiy** uslublar: maydon, roʻyxat, buyruq tugmalari |
| `js/logic.js` | Shu oʻyin topshiriqlari: bosqich chegaralari, 2-bosqich koʻrsatuvi, 3-bosqich savollari (takrorsiz) |
| `js/game-art.js` | Hikoya rasmlari: kitob va qalam, telefon, xarita — SVG, matnsiz |
| `js/scenes/common.js` | Umumiy sahna qismlari: maydon qurish, dastur yigʻish, ishga tushirish, mashq savollari |
| `js/scenes/stage1.js` … `stage3.js`, `final.js` | Kirish, bosqichlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `robot-yoli:v1`) |

## 10. Bu oʻyinga kirmaydi

Takrorlash (sikl) va funksiya — 27-oʻyin. Shart va sensor — 28-oʻyin. Tayyor dasturdagi xatoni topish — 29-oʻyin. Robotning oʻz nuqtai nazari (oldinga + burilish), oʻzgaruvchi, matnli kod yozish, diagonal yurish, bir nechta robot.

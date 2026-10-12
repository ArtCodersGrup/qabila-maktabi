# IX sinf «Sunʼiy intellekt» — I yarim yillik (2026-10-12)

Manba: maktab taqvim-rejasi (IX sinf, 1–14-darslar). Muallif qarorlari: har mavzu — bitta o'yin; kattalarga mos;
Python mavzulari YANGI, AI/ma'lumot ruhida; 3–5-mavzular mazmunini o'zimiz tuzamiz; kamera hozircha kerak emas.
Toifa: `yuqori` (9–11). Har o'yin — oddiy 3 bosqichli o'yin (`umumiy/js/app.js` qobig'i), papka `oyinlar/NN-nom/`.

## Ohang va daraja (14–15 yosh)
`docs/superpowers/specs/2026-10-10-orta-ohang.md` qoidalari + kattaroq daraja: «Maqsad: …», aniq atama; atama birinchi marta
chiqqanda inglizchasi qavsda: «mashinali oʻrganish (machine learning, ML)». Hikoya/qahramon yo'q, faqat `ui.say/bubble("elder")`.
Misollar real: tavsiya tizimi, tarjimon, kamera, bank, tibbiyot. Etika va cheklovlar har o'yinda kamida bir marta
(xato, noxolislik (bias), maxfiylik). Mashq qiyinligi: hisoblash, tahlil, xato topish — "eslab qol" emas.
Faktlar faqat ishonchli va umumiy ma'lum (aniq sana/raqamni bilmasang — yozma).

## O'yinlar

| Papka | Dars | Nom | Bosqichlar (har biri: ko'rsatish → tushuntirish → mashq) |
|---|---|---|---|
| 73-ai-oilasi | 1 | AI oilasi | 1) AI yoki oddiy dastur: qoida qo'lda yozilganmi yoki ma'lumotdan o'rganilganmi (vaziyatlar) 2) AI ⊃ ML ⊃ DL ichma-ich to'plamlar: texnologiyani to'g'ri halqaga joyla; nega DL ko'p ma'lumot talab qiladi 3) CV vazifalari: tasniflash / obyektni topish (detection) / segmentatsiya — rasm (katak) va natijani moslashtir |
| 74-loyiha-sikli | 2 | AI loyiha sikli | 5 bosqich: muammoni belgilash (problem scoping) → ma'lumot yig'ish (data acquisition) → ma'lumotni o'rganish (data exploration) → modellash (modelling) → baholash (evaluation). 1) tartibga qo'y, har bosqich natijasi 2) ish qaysi bosqichga tegishli (tasnif) 3) muvaffaqiyatsiz loyiha tashxisi: qaysi bosqichda xato (kam ma'lumot, noto'g'ri savol, test yo'q) |
| 75-chizmani-tanish | 3 (AI va Drawing) | Chizmani tanish | 8×8 katakli chizma. 1) kompyuter rasmni sonlar jadvali deb ko'radi: ikki chizma farqini (mos kelmagan kataklar soni) hisobla 2) eng yaqin namuna (nearest neighbour): yangi chizma qaysi sinfga — masofalarni solishtir 3) bola o'zi chizadi, model topadi; namunalar kam/ko'p bo'lsa aniqlik qanday o'zgaradi; chalkash sinflar |
| 76-ai-va-tabiat | 4 (AI va atrof-muhit) | AI va tabiat | Chiqindi saralovchi model (plastik/qog'oz/organik; belgilar: rang, shakl, yaltiroqlik — jadval). 1) ma'lumotni belgilash (labeling) va belgi tanlash 2) o'qitish va test to'plami; aniqlik = to'g'ri / jami 3) noxolislik: o'quv to'plamida faqat toza butilkalar → ezilganini tanimaydi; to'plamni tuzat. Qo'shimcha: AI ning energiya narxi (bir gap) |
| 77-ai-va-harakat | 5 (AI va Harakat) | AI va harakat | Tana holatini aniqlash (pose estimation): skelet = tayanch nuqtalar (keypoints) koordinatalari. 1) nuqtalarni tanaga joyla; koordinata (x, y) o'qish 2) qoida: «qo'l ko'tarilgan = bilak y < yelka y» — koordinatalardan holatni aniqla 3) kadrlar ketma-ketligidan o'tirib-turishni sanash (holat almashishi); qayerda ishlatiladi (sport, tibbiyot, o'yin) va xatolari |
| 78-dipfeyk | 6 (AI va DeepFakes) | Dipfeyk | 1) qanday yasaladi (yuz almashtirish, ovoz klonlash — sxema darajasida, yasash yo'riqnomasi YO'Q) va belgilar: chetdagi xiralik, ko'z/tish, yorug'lik, lab-ovoz mosligi (chizilgan sxematik yuzlarda farq top) 2) manbani tekshirish: kim tarqatdi, boshqa manbada bormi, sana — vaziyatlar 3) etika va harakat: ruxsat, zarar, nima qilaman (tarqatmayman, kattalarga/platformaga xabar) |
| 79-python-sintaksis | 7 | Python: sintaksis | Python o'yini (kod yoziladi). print, izoh (#), otstup, satr va son, sintaksis xatolarini o'qish. Misollar AI mavzusida: `print("Aniqlik:", 0.92)`. 1) natijani ayt 2) xatoni tuzat 3) o'zing yoz |
| 80-python-malumot-turlari | 8 | Oʻzgaruvchi va maʼlumot turlari | int, float, str, bool, list; type(); int()/float()/str() o'girish; ro'yxat indeksi, len. Misollar: belgi qiymatlari, yorliqlar ro'yxati. 3 bosqich: tur aniqlash → o'girish xatolari → ro'yxat bilan ishlash |
| 81-python-shartlar | 9 | Shartlar va tarmoqlanish | if/elif/else, solishtirish, and/or/not. Misollar: chegara bo'yicha qaror (ehtimol ≥ 0.5 → "spam"), baho toifalari, qoidali tasniflagich. 3 bosqich: natijani ayt → shartni to'ldir → qoidali tasniflagich yoz |
| 82-python-sikllar | 10 | for va while | for/range, ro'yxat bo'ylab for, while, hisoblagich va yig'indi naqshi. Misollar: yorliqlarni sanash, o'rtacha, xato kamayguncha while. 3 bosqich: necha marta aylanadi → yig'indi/sanash → o'zing yoz |
| 83-python-funksiyalar | 11 | Funksiyalar | def, parametr, return, bir necha marta chaqirish. Misollar: ortacha(royxat), aniqlik(togri, jami), masofa(a, b). 3 bosqich: natijani ayt → funksiyani tuzat → o'zing yoz |
| 84-data-science | 12 | Data science | Metodologiya: savol → ma'lumot yig'ish → tozalash → tahlil → xulosa. 1) bosqichlar va savolni to'g'ri qo'yish (o'lchab bo'ladigan savol) 2) ma'lumot turlari: sonli/toifali; jadval: qator = obyekt, ustun = belgi 3) tozalash: bo'sh katak, takror qator, imkonsiz qiymat (yosh = 250), har xil yozuv («Toshkent»/«toshkent») — jadvalda xatolarni top |
| 85-data-analysis | 13 | Maʼlumot tahlili | 1) o'rtacha, mediana, moda, min/max, oraliq — kichik to'plamda hisobla; chetga chiqqan qiymat o'rtachani buzadi 2) diagramma o'qish: ustunli, chiziqli, nuqtali (SVG, matnsiz o'qlar HTML da); aldamchi diagramma (kesilgan o'q) 3) bog'liqlik ≠ sabab; xulosa tanlash |
| 86-sorovnoma-tahlili | 14 (1-amaliy) | Amaliy: soʻrovnoma tahlili | Python o'yini — mini loyiha: sinf so'rovnomasi ro'yxatlari berilgan. 1) tozalash: noto'g'ri qiymatlarni for+if bilan olib tashlash 2) funksiyalar: ortacha, eng_kop (moda), sanash 3) xulosa: natijalarni chiqarish va savolga javob (bir nechta test bilan tekshiriladi) |

## Texnik qoidalar (agentlar uchun)
- Qolip (oddiy o'yin): `oyinlar/58-xabar-bolaklari/` (index.html skript tartibi, js/logic.js sof + tests/logic.test.js, js/game-art.js, js/scenes/{common,stage1,stage2,stage3,final}.js, js/main.js, css/style.css, DIZAYN.md qisqa).
- Qolip (Python o'yini): `oyinlar/30-ikki-yol/` va `oyinlar/34-funksiya-ustaxonasi/` (umumiy/js/python/*, kod.js, kod-ui.js, kod-mashq.js). Faqat o'z talqinchimiz qo'llaydigan Python (tekshir: `oyinlar/umumiy/tests/python-*.test.js`, `python-notyet.test.js`); kutubxona import yo'q.
- `index.html`: `<html lang="uz" data-toifa="yuqori">`, `<head>` da `../umumiy/js/toifa.js`, theme-color `#FBFAF7`; `data-maskot` YO'Q; qog'oz/baraban/apprentice ishlatilmaydi.
- `main.js`: `QK.app.start({ title, storageKey: "<nom>:v1", stageTitles: [3 ta] })`.
- Generatorlar: `(prev, rng, tier)` — takrorlanmaydi, tier 0/1/2; `practice.exercises/tries/numberTries`; har mashqda ≥ 4 variant; xatoda maslahat, keyin yechim.
- Faqat bosish (sudrash yo'q), 360 px telefonda ishlaydi (Python o'yinlari — kompyuter uchun, `pc: true`). SVG ichida matn yo'q.
- Matn: `oʻ gʻ` (U+02BB), `ʼ` (U+02BC), oddiy `'` matnda yo'q. Boshqa o'yinga havola «Nom» bilan, raqamsiz.
- Agent faqat o'z papkalariga yozadi; `umumiy/`, `bosh/`, `sw.js` ga tegmaydi; git va brauzer yo'q.
- Tekshiruv: `node --check`, `cd oyinlar/NN && node --test tests/*.test.js`.

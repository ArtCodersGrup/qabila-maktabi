# 74-oʻyin — «AI loyiha sikli»

IX sinf «Sunʼiy intellekt», 2-dars. Reja: [`../../docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md`](../../docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md).

- **Toifa:** `yuqori` (9–11), 14–15 yosh. Telefon va kompyuter — faqat bosish va raqam klaviaturasi.
- **Ohang:** «Maqsad: …», aniq atama, birinchi marta inglizchasi qavsda; qahramon yoʻq (`ui.say/bubble("elder")`).

## Asosiy fikr

Model — loyihaning faqat bir qismi. Besh bosqich: muammoni belgilash (problem scoping) → maʼlumot yigʻish (data acquisition) →
maʼlumotni oʻrganish (data exploration) → modellash (modelling) → baholash (evaluation). Baho yomon chiqsa — orqaga qaytiladi (sikl).

## Bosqichlar (har biri: koʻrsatish → nomlash → mashq)

### 1. Besh bosqich
Koʻrsatish: «oshxona — ertaga nechta tushlik» loyihasining besh ishi aralash; oʻquvchi ularni bajarilish tartibida bosadi,
har qadamda bosqich nomi va natijasi chiqadi. Nom: AI loyiha sikli (AI project cycle), besh atama.

Mashq (`bosqich1Task`):
- `natijaTask` — natija qaysi bosqichniki; `keyingiTask` — qoʻshni bosqich.
- `tartibTask` — aralash yozilgan 3 / 4 / 5 ish uchun toʻgʻri tartib (A → B → …).
- `etishmaydiTask` — toʻrt ishli rejada qaysi bosqich tushib qolgan.

### 2. Ish qaysi bosqichda
Koʻrsatish: «barg kasalligi» loyihasining olti ishini besh bosqich tugmasiga ajratish (rozilik olish — maʼlumot yigʻish).
Nom: har bosqichning oʻz savoli; 4W (who, what, where, why).

Mashq (`bosqich2Task`):
- `ishTask` — ish → bosqich (tier 2 — kamroq koʻzga tashlanadigan ishlar: rozilik, noxolislikni tekshirish…).
- `bosqichIshiTask` — bosqich berilgan, toʻrt ishdan mosi (tier 1, 2 — toʻrttasi ham bitta loyihadan).
- `soatTask` — ish daftaridan bitta bosqichga ketgan soatlar yigʻindisi (ikki qator mos keladi).

### 3. Loyiha tashxisi
Koʻrsatish: «sinovda 95 %, dalada 60 %» — oʻquvchi besh bosqich yozuvini ochadi va sababni topadi (hammasi laboratoriya surati).
Nom: aniqlik = toʻgʻri ÷ jami × 100 %, faqat yangi misollarda; noxolislik (bias).

Mashq (`bosqich3Task`):
- `tashxisTask` — muvaffaqiyatsiz loyiha tavsifi → qaysi bosqich xato (notoʻgʻri savol, kam / bir tomonlama maʼlumot, koʻrilmagan maʼlumot, mos boʻlmagan model, sinov yoʻq).
- `testTask` — «oʻquv misollarida 100 %» emas, yangi misollardagi haqiqiy aniqlik (tier 2 — ikki sinf alohida).
- `kamTask` — nomutanosib toʻplamda hech narsa oʻrganmagan model aniqligi (aniqlik aldashi mumkin).

## Qarorlar

- Generatorlar `(prev, rng, tier)`; `prev.tarix` — bir mashq ichida misol takrorlanmaydi, bank tugasa navbatdagi turga oʻtadi.
- Olti loyiha × besh ish — qoʻlda yozilgan; har ish aniq bitta bosqichga tegishli (test buni tekshiradi).
- Tashxis savolida besh variant ham doim sikl tartibida — oʻquvchi roʻyxatni emas, vaziyatni tahlil qiladi.
- Etika: rozilik va maxfiylik (2-bosqich), bir tomonlama toʻplam — noxolislik (3-bosqich).

## Oʻquv maqsadlari

Oʻyindan keyin oʻquvchi:

1. AI loyiha siklining besh bosqichini tartib bilan aytadi va har birining natijasini biladi.
2. Loyihadagi ishni toʻgʻri bosqichga ajratadi.
3. Rejada qaysi bosqich tushib qolganini topadi va bu nimaga olib kelishini tushuntiradi.
4. Muvaffaqiyatsiz loyiha tavsifidan xato qaysi bosqichda yuz berganini aniqlaydi.
5. Aniqlikni (toʻgʻri ÷ jami × 100 %) hisoblaydi va nega u faqat yangi misollarda oʻlchanishini aytadi.
6. Nomutanosib yoki bir tomonlama maʼlumot noxolislikka olib kelishini misol bilan tushuntiradi.

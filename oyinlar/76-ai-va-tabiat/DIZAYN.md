# 76-oʻyin — «AI va tabiat»

IX sinf «Sunʼiy intellekt», 4-dars (AI va atrof-muhit). Reja: [`../../docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md`](../../docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md).

- **Toifa:** `yuqori` (9–11), 14–15 yosh. Telefon va kompyuter — faqat bosish va raqam klaviaturasi.
- **Ohang:** kattalar koʻrinishi, hikoya va qahramon yoʻq (`ui.say/bubble("elder")`).

## Asosiy fikr

Chiqindi saralovchi model: plastik / qogʻoz / organik. Maʼlumot — jadval: qator — buyum, ustunlar — belgilar
(rang, shakl, yaltiroqlik), oxirgi ustun — yorliq. Model faqat shu jadvaldan oʻrganadi: maʼlumot bir yoqlama boʻlsa, model ham xato qiladi.

**Model** (`bashorat`): yangi buyum oʻquv toʻplamining har qatori bilan solishtiriladi (nechta belgi farq qiladi);
eng kam farqli qatorlar ovoz beradi; ovozlar teng boʻlsa — model **ikkilanadi** (xato deb sanaladi).
Katalog — 25 ta buyum (`KATALOG`), ezilgan idishlarning shakli «notekis».

## Bosqichlar

### 1. Yorliq va belgi
Koʻrsatish: oʻquvchi 5 ta buyumga yorliq qoʻyadi (jadval qatorma-qator toʻladi), keyin foydasiz ustunni topadi («topilgan joy»).
Nom: belgilash (labeling), belgi (feature), yorliq (label).

Mashq (`bosqich1Task`, navbat bilan):
- `yorliqTask` — jadvalda bitta yorliq xato, qaysi qator (4 / 6 / 8 qator; tier 2 da xato «ishonarli»: yaltiroq jurnal → plastik).
- `belgiTask` — qaysi bitta ustun yorliqni eng yaxshi ajratadi (4 variant, bittasi — foydasiz «topilgan joy»). Ball `birBelgi` bilan hisoblanadi.

### 2. Oʻqitish va test
Koʻrsatish: 10 ta buyum 6 ta oʻquv + 4 ta testga ajratiladi; testda aniqlik 3/4, oʻquv toʻplamining oʻzida — 100% (yodlab olgan).
Nom: oʻquv toʻplami (training set), test toʻplami (test set), aniqlik (accuracy) = toʻgʻri ÷ jami.

Mashq (`bosqich2Task`):
- `aniqlikTask` — aniqlik necha foiz. tier 0 — 4–5 ta natija; 1 — 10 ta; 2 — 20 ta buyumning chalkashlik jadvali.
- `bashoratTask` — oʻquv toʻplami (5 / 6 / 7 qator) va yangi buyum: model javobi (4 variant: uch sinf + «ikkilanadi»).

### 3. Noxolis toʻplam
Koʻrsatish: oʻquv toʻplamidagi plastiklar — faqat butun silindr idishlar; testda ezilgan idishlar 0/2.
Oʻquvchi 4 nomzoddan qoʻshib-olib, natijani kuzatadi: ezilgan butilka va sabzi poʻchogʻi yordam beradi, yana bitta butun idish — yoʻq.
Nom: noxolislik (bias); hayotiy misol (yuzni tanish, tibbiy tashxis). Yakunda — AI ning energiya narxi.

Mashq (`bosqich3Task`):
- `guruhTask` — 20 ta buyum natijasi shakl boʻyicha guruhlangan: umumiy aniqlik / eng zaif guruh / ular orasidagi farq (son).
- `tuzatTask` — oʻquv toʻplamiga qaysi bitta buyumni qoʻshsak, aniqlik eng koʻp oshadi (4 nomzod; oʻquv, test va nomzodlar kesishmaydi).

## Qarorlar

- Hech bir natija qoʻlda yozilmagan: aniqlik, chalkashlik jadvali, noxolislik taʼsiri — hammasi `bashorat`/`baho` dan chiqadi; testlar mustaqil qayta hisoblaydi.
- Baʼzi buyumlarning belgilari bir xil (gʻijimlangan qogʻoz va tuxum poʻchogʻi) — ataylab: belgilar yetmasa, model ajrata olmaydi.
- «Ikkilanadi» — alohida javob varianti; shu tufayli tanlov savollarida doim 4 variant.
- Jadval 360 px ga sigʻadi (13 px shrift); sigʻmasa, faqat jadvalning oʻzi yon tomonga suriladi.

## Oʻquv maqsadlari

Oʻyindan keyin oʻquvchi:

1. Belgilash (labeling), belgi va yorliq nima ekanini aytadi; xato yorliqni topadi.
2. Qaysi belgi sinflarni farqlashini jadvaldan aniqlaydi.
3. Oʻquv va test toʻplami nega alohida boʻlishini tushuntiradi.
4. Aniqlikni roʻyxat va chalkashlik jadvalidan hisoblaydi.
5. Oʻquv toʻplami va yangi buyum boʻyicha model javobini qoʻlda topadi.
6. Noxolis toʻplam qaysi guruhda xato berishini koʻradi va uni qanday tuzatishni tanlaydi.

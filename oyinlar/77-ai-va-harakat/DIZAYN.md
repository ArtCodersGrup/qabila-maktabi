# «AI va harakat»

IX sinf «Sunʼiy intellekt», 5-dars (AI va Harakat). Reja: [`docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md`](../../docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md).

- **Toifa:** `yuqori` (9–11), 14–15 yosh. Telefon va kompyuter — faqat bosish va raqam klaviaturasi. Kamera ishlatilmaydi.
- **Ohang:** `docs/superpowers/specs/2026-10-10-orta-ohang.md` — «Maqsad: …», aniq atamalar (inglizchasi qavsda), hikoya va qahramon yoʻq.

## Asosiy fikr

Tana holatini aniqlash (pose estimation) modeli odamni emas, **tayanch nuqtalar (keypoints) koordinatalarini** beradi.
Qolgan hamma narsa — «qoʻl koʻtarilgan», «oʻtirgan», «necha marta oʻtirib-turdi» — shu sonlar ustidagi oddiy qoidalar.

## Model

- Rasm maydoni 100 × 120 birlik; **x chapdan oʻngga, y yuqoridan pastga** (rasm koordinatalari).
- Skelet — 15 nuqta: bosh, boʻyin, bel va juft nuqtalar (yelka, tirsak, bilak, son, tizza, toʻpiq). Odam **orqasidan** koʻrinadi:
  uning chapi — rasmning chapi (koʻk), oʻngi — toʻq sariq.
- Skelet `logic.js` dagi `poza({ chap, ong, otir, egil })` dan hisoblanadi, `game-art.js` dagi `skelet()` uni SVG da chizadi
  (matnsiz; oʻq sonlari, nuqta nomlari va jadval — HTML).
- Qoidalar (`logic.js`): qoʻl koʻtarilgan — `bilak y < yelka y`; T-holat — ikkala qoʻlda `|bilak y − yelka y| ≤ 5` va `|bilak x − yelka x| ≥ 25`;
  oʻtirgan — `tizza y − son y ≤ 8`; yonga egilgan — `|boʻyin x − bel x| ≥ 10`. Generatorlar bir vaqtda koʻpi bilan bitta qoida bajariladigan skelet beradi.

## Bosqichlar

### 1. Tayanch nuqtalar
Koʻrsatish: oʻquvchi belgilangan nuqtani nomlaydi (5 ta) — nuqta skeletga qoʻshiladi; keyin setka va jadval: (x, y), y pastga oʻsadi.
Mashq (`nuqtaTask`, `chekkaTask`, `farqTask`): nuqta nomi → belgilangan nuqtaning koordinatasi → toʻrt nuqtadan eng yuqori/past/chap/oʻngdagisi
(yuqori zinada rasm yoʻq) → ikki nuqta orasidagi farq (son).

### 2. Holat qoidalari
Koʻrsatish: oʻquvchi skeletning qoʻlini koʻtaradi va oʻtqazadi, jadvalda qaysi son oʻzgarganini koʻradi. Tushuntirish: toʻrt qoida, chegaralarni odam tanlaydi.
Mashq (`holatTask`, `qolTask`, `qaysiTask`): besh holatdan birini aniqlash; qaysi qoʻl koʻtarilgan; toʻrt skeletdan qaysi biri shartni bajaradi.
Yuqori zinada chegaraga yaqin holatlar (bukik qoʻl, yarim oʻtirish, sust egilish) va rasmsiz, faqat jadval.

### 3. Takrorlarni sanash
Koʻrsatish: 8 kadrni kadrma-kadr oʻtkazish; sanoq «oʻtirgan → oʻtirmagan» almashuvida oshadi, yarim oʻtirish sanalmaydi.
Tushuntirish: holat avtomati; qoʻllanishi (sport, reabilitatsiya, oʻyin), xatolari (toʻsilgan nuqta, yorugʻlik, noxolislik), maxfiylik.
Mashq (`sanashTask`, `nechanchiTask`, `shovqinTask`): necha marta oʻtirib-turdi; hisoblagich N ga qaysi kadrda yetadi; qaysi kadr — shovqin (bitta kadrlik sakrash).

## Qarorlar

- Mashq navbati (`BOSQICH1…3`) zina bilan birga yuradi: asosiy tur ikki-uch marta, har safar qiyinroq zinasi bilan chiqadi.
- Variantli savolda 4–5 variant; maslahat usulni aytadi, yechim — sonlar bilan izoh.
- «Bilak» — bilakuzuk taqiladigan joy (wrist) maʼnosida, reja matnidagidek.
- Kadr ostida 1-zinada `tizza y − son y`, keyin faqat `son y` koʻrsatiladi (tizza y = 85 oʻzgarmaydi) — ayirishni oʻquvchi bajaradi.

## Oʻquv maqsadlari

Oʻyindan keyin oʻquvchi:

1. Tayanch nuqta (keypoint) va skelet nima ekanini aytadi; nuqtani nomi va koordinatasi bilan topadi.
2. Rasm koordinatalarida y pastga oʻsishini tushuntiradi va nuqtalarni koordinata boʻyicha solishtiradi.
3. Koordinatalardan «qoʻl koʻtarilgan», «oʻtirgan», «T-holat», «egilgan» holatini qoida bilan aniqlaydi; chegaraga yaqin holatda sonlarga tayanadi.
4. Kadrlar ketma-ketligidan takrorlarni holat almashuvi orqali sanaydi; yarim va tugallanmagan harakat nega sanalmasligini aytadi.
5. Bitta xato kadr (shovqin) hisobni buzishini koʻrsatadi; texnologiyaning qoʻllanishi, xatolari va maxfiylik masalasini aytadi.

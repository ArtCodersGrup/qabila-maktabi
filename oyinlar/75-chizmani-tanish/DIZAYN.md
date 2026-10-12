# 75-oʻyin — «Chizmani tanish»

IX sinf «Sunʼiy intellekt», 3-dars (AI va Drawing). Reja: [`../../docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md`](../../docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md).

- **Toifa:** `yuqori` (9–11), 14–15 yosh. Telefon va kompyuter — faqat bosish va raqam klaviaturasi.
- **Ohang:** kattalar koʻrinishi, hikoya va qahramon yoʻq (`ui.say/bubble("elder")`).

## Asosiy fikr

Kompyuter chizmani «koʻrmaydi»: 8×8 chizma — 64 ta 0 va 1 dan iborat jadval. Ikki chizmaning oʻxshashligi —
mos kelmagan kataklar soni (**Hamming masofasi**). Model shakl qoidasini bilmaydi: yangi chizmani yorligʻi maʼlum
namunalar bilan solishtiradi va **eng yaqin namunaning** sinfini aytadi (nearest neighbour).

Sinflar: doira, kvadrat, uchburchak, xoch, chiziq — har biridan 3 ta namuna (`logic.js` dagi `RASMLAR`).

## Bosqichlar

### 1. Sonlar jadvali
Koʻrsatish: kvadrat chizmasi «Sonlarga aylantir» bilan 0/1 jadvaliga aylanadi; keyin oʻquvchi B chizmada A dan
farq qilgan 3 ta katakni bosib topadi. Nom: piksel, Hamming masofasi.

Mashq (`bosqich1Task`, navbat bilan):
- `jadvalTask` — sonlar jadvali berilgan, 4 ta chizmadan qaysi biri. tier 0 — boshqa sinflar; 1 — shu sinfning boshqa namunalari; 2 — 2–4 katak farqli nusxalar.
- `farqTask` — ikki chizma nechta katakda farq qiladi (son). tier 0 — 2–4; 1 — 5–8; 2 — 7–11, ikkalasi ham sonlar jadvali koʻrinishida. Maslahat — farq bor qatorlarni belgilaydi.

### 2. Eng yaqin namuna
Koʻrsatish: yangi chizma va 3 ta namuna. Oʻquvchi har namunani bosib masofani oʻlchatadi, keyin eng yaqinini tanlaydi.
Nom: eng yaqin namuna usuli, oʻquv toʻplami, yorliq.

Mashq (`bosqich2Task`):
- `sinfTask` — masofalar yozilgan 4 / 6 / 8 namuna; model qaysi sinfni aytadi (5 variant). Asl namunaning oʻzi toʻplamga kirmaydi, shuning uchun model «notoʻgʻri» sinfni aytishi ham mumkin — javob har doim hisoblangan.
- `zaxiraTask` — model javobi bilan ikkinchi oʻrindagi sinf orasidagi masofa farqi (son). tier 2 — eng yaqin ikki namuna bitta sinfdan (tuzoq).

### 3. Oʻzing chiz
Koʻrsatish: oʻquvchi 8×8 maydonda katak bosib chizadi, «Tekshir» — model javobi va har sinfgacha masofa (ustunchalar).
Keyin tajriba: har sinfdan 1 / 2 / 3 ta namuna bilan 25 ta sinov chizmasidagi aniqlik (`tajriba(k)` hisoblaydi) va eng koʻp chalkashgan juftlik.
Cheklov aytiladi: model har doim beshta sinfdan birini aytadi, «bilmayman» demaydi.

Mashq (`bosqich3Task`):
- `aniqlikTask` — aniqlik necha foiz. tier 0 — 5 ta natija; 1 — 10 ta; 2 — 20 ta chizmaning chalkashlik jadvali (3 sinf).
- `chalkashTask` — chalkashlik jadvalidan eng koʻp chalkashgan juftlik (4–5 variant).

## Qarorlar

- Sinov chizmalari qoʻlda yozilmagan: namunaning 1 katakka surilgan va bir necha katagi oʻzgargan nusxalari (`variant`). Hamma aniqlik va jadvallar tasniflagichdan chiqadi.
- Durang (ikki sinf bir xil masofada) mashqlarda chiqmaydi; oʻquvchi chizmasida chiqsa — «Model ikkilanmoqda».
- Takrorlanmaslik: generator `prev.tarix` orqali shu mashqdagi oldingi vazifalarni ham koʻradi.
- Chizish maydoni kataklari 360 px ekranda ~35 px (8 ta katak 48 px dan sigʻmaydi) — «Piksel ustaxonasi»dagi kabi.

## Oʻquv maqsadlari

Oʻyindan keyin oʻquvchi:

1. Oq-qora rasm kompyuterda 0 va 1 lar jadvali ekanini tushuntiradi.
2. Ikki chizmaning Hamming masofasini hisoblaydi.
3. Eng yaqin namuna usulida model javobini masofalardan aniqlaydi.
4. Aniqlikni (toʻgʻri ÷ jami) roʻyxat va chalkashlik jadvalidan hisoblaydi.
5. Chalkashlik jadvalidan model qaysi sinflarni adashtirishini topadi.
6. Namunalar soni va xilma-xilligi aniqlikka taʼsir qilishini va modelning cheklovini aytadi.

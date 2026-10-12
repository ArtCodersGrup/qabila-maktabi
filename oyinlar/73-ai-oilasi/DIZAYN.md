# 73-oʻyin — «AI oilasi»

IX sinf «Sunʼiy intellekt», 1-dars. Reja: [`../../docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md`](../../docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md).

- **Toifa:** `yuqori` (9–11), 14–15 yosh. Telefon va kompyuter — faqat bosish va raqam klaviaturasi.
- **Ohang:** «Maqsad: …», aniq atama, birinchi marta inglizchasi qavsda; qahramon yoʻq (`ui.say/bubble("elder")`).

## Asosiy fikr

Oddiy dasturda qoidani odam yozadi; mashinali oʻrganishda (ML) qoida maʼlumotdan topiladi. DL ⊂ ML ⊂ AI.
Kompyuter koʻrishi (CV) uch xil natija beradi: yorliq, ramka, maska.

## Bosqichlar (har biri: koʻrsatish → nomlash → mashq)

### 1. Qoida yoki maʼlumot
Koʻrsatish: spam filtri. Oʻquvchi chegarani (N) maʼlumotni koʻrmasdan qoʻlda tanlaydi → 6 ta xatda natijasi koʻrinadi →
«Maʼlumotdan oʻrgatish»: dastur har N ni sinab, eng yaxshisini tanlaydi. Nom: mashinali oʻrganish (machine learning, ML).

Mashq (`bosqich1Task`):
- `tanlaTask` — toʻrt tizimdan bittasi boshqacha (oʻrgangan / qoʻlda yozilgan); tier 2 — nomi chalgʻitadigan tizimlar.
- `qoidaTask` — qoʻlda yozilgan chegara qoidasi nechta holatda toʻgʻri (son); 5 / 6 / 8 qator, tier 2 da biri aynan chegarada.
- `chegaraTask` — toʻrt chegaradan qaysi biri maʼlumotga eng mos (model shunday «oʻrganadi»).

### 2. AI, ML, DL
Koʻrsatish: toʻrt texnologiyani ichma-ich halqalarga joylash; keyin neyron tarmoqni kattalashtirish — vaznlar soni 18 → 72 → 208.
Nom: chuqur oʻrganish (deep learning, DL); vaznlar koʻp → maʼlumot koʻp kerak.

Mashq (`bosqich2Task`):
- `joylaTask` — texnologiyani eng ichki mos halqaga (4 halqa — 4 variant).
- `vaznTask` — toʻliq bogʻlangan tarmoqdagi vaznlar soni (2 / 3 / 4 qatlam).
- `fikrTask` — toʻrt fikrdan toʻgʻrisi (tier 1) yoki xatosi (tier 2).

### 3. Kompyuter koʻrishi
Koʻrsatish: 6×6 katakli rasm; oʻquvchi uch natijani oʻzi beradi — yorliq tanlaydi, ramkaning ikki burchagini bosadi, obyekt kataklarini boʻyaydi.
Nom: kompyuter koʻrishi (computer vision, CV): tasniflash, obyektni topish (object detection), segmentatsiya.

Mashq (`bosqich3Task`):
- `moslaTask` — vazifa berilgan, toʻrt koʻrinishdan qaysi biri uning natijasi.
- `ramkaTask` — eng kichik ramka yuzasi; `maskaTask` — sinf kataklari soni; `ortiqchaTask` — ramka ichidagi fon kataklari.
- `xatoTask` — obyektni topish natijasidagi xato (ramka toʻliq emas / yorliq notoʻgʻri / obyekt topilmagan / xato yoʻq).
- `vaziyatTask` — vaziyatga qaysi CV vazifasi kerak (toʻrtinchi variant — «CV emas»).

## Qarorlar

- Generatorlar `(prev, rng, tier)`; `prev.tarix` — bir mashq ichida misol takrorlanmaydi, bank tugasa navbatdagi turga oʻtadi.
- Rasm — sxema: sinf rang **va** belgi bilan (● mashina, ▲ odam, ■ daraxt). SVG ichida matn yoʻq; ramka yorligʻi — HTML.
- Etika va cheklovlar: bir tomonlama maʼlumot → xato qoida (1-bosqich); model xatolari va roziliksiz kuzatish (3-bosqich).
- «AI, lekin ML emas» halqasi — qoidalari qoʻlda yozilgan ekspert tizimlar va oʻyin dasturlari; chegara ochiq aytiladi.

## Oʻquv maqsadlari

Oʻyindan keyin oʻquvchi:

1. Tizim xulqi qoʻlda yozilgan qoidadanmi yoki maʼlumotdan oʻrganilganmi — ajratadi.
2. Berilgan qoida nechta holatda toʻgʻri ekanini hisoblaydi va maʼlumotga eng mos chegarani tanlaydi.
3. AI, ML, DL munosabatini (DL ⊂ ML ⊂ AI) tushuntiradi va texnologiyani toʻgʻri toʻplamga joylaydi.
4. Tarmoqdagi vaznlar sonini hisoblaydi va nega DL koʻp maʼlumot talab qilishini aytadi.
5. Tasniflash, obyektni topish va segmentatsiya natijalarini farqlaydi, vaziyatga mosini tanlaydi.
6. Obyektni topish natijasidagi xatoni topadi; model xato qilishi va maxfiylik haqida gapira oladi.

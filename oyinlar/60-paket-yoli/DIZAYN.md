# 60-oʻyin — «Paket yoʻli»

«Internet qanday ishlaydi» blokining uchinchi oʻyini. Blok rejasi: [`../umumiy/INTERNET-BLOK.md`](../umumiy/INTERNET-BLOK.md).

- **Yosh:** 10–16. Telefon va kompyuter — tugunlarni bosish.
- **Ulanish:** «Robot yoʻli» (yoʻl va tartib), «Xabar boʻlaklari» (paket), «Qabila manzillari» (manzil).

## Asosiy fikr

- Paket bitta sim bilan toʻgʻri ketmaydi: bir nechta **tugun** (pochta boʻlimi) orqali oʻtadi.
- Har tugun butun xaritani bilmaydi — faqat **qoʻshnilarini** va paketni qaysi biriga berishni biladi. Yoʻl — **marshrut**.
- Sim uzilsa, internet toʻxtamaydi — **boshqa yoʻl** topiladi, faqat uzunroq boʻlishi mumkin.
- «Sayt» — kimningdir kompyuteridagi fayllar. Bola (**mijoz**) soʻraydi, **server** javob beradi: sahifa → rasm → shrift, birma-bir. Bitta server koʻp soʻrovga **navbat** bilan javob beradi.

## Metafora

Tugun — pochta boʻlimi (doira), sim — chiziq, paket — oʻsha raqamlangan konvert. Toʻr **4×3 tugundan
oshmaydi** (360 px ga sigʻadi), tugun nomlari — harf (A, B, C…) HTML'da.

## Bosqichlar

### 1. Qoʻlda uzatish
Koʻrsatish: paket A tugunida, manzil — F. Bola har qadamda faqat **qoʻshni** tugunlarni koʻradi (ular yorishadi) va keyingisini bosadi. Yetib borgach qadamlar sanaladi va eng qisqa yoʻl koʻrsatiladi. Nom: **marshrut**.

Mashq turlari:
- **Eng kamida necha qadam?** — toʻr va ikki tugun berilgan, javob son. tier 0: 2–3 qadam, tier 1: 3–4, tier 2: 4–6 (toʻrda «boshi berk» shoxlar bor).
- **Keyingi qadam qaysi?** — paket C da, manzil F; C ning qoʻshnilari tugma boʻlib turadi (4 ta: 3 qoʻshni + bitta qoʻshni boʻlmagan, uni bosish xato).

### 2. Sim uzildi
Koʻrsatish: eng qisqa yoʻldagi bitta sim uziladi (✕). Paket boshqa yoʻldan ketadi, qadamlar solishtiriladi.

Mashq turlari:
- **Endi eng kamida necha qadam?** — bitta sim uzilgan; tier 2 da ikkitasi.
- **Qaysi sim uzilsa, yoʻl eng koʻp uzayadi?** — 4 ta sim variant boʻlib beriladi (`B–E` kabi), bola har birini hayolan uzib koʻradi. Bitta variant — «Hech qaysi, qadamlar oʻzgarmaydi» boʻlishi mumkin.
- **Yetib boradimi?** (tier 2) — sim uzilgach F ga yoʻl qoladimi: 4 variant (ha — N qadam, ha — N+1 qadam, ha — N+2 qadam, yoʻq).

### 3. Soʻrov va javob
Koʻrsatish: chap tomonda bola (mijoz), oʻngda server. Bola manzilni bosadi → soʻrov ketadi → sahifa keladi, keyin rasm, keyin shrift — sahifa koʻz oldida yigʻiladi. Rasm kelmasa — sahifa ramka bilan, matn bor. Nomlar: **mijoz**, **server**.

Mashq turlari:
- **Nechta soʻrov ketadi?** — sahifa roʻyxati (sahifaning oʻzi + 2–6 fayl), javob son.
- **Bitta fayl kelmadi — sahifa qanday koʻrinadi?** — 4 variant (matnli taʼrif: «matn bor, rasm oʻrnida boʻsh ramka», «sahifa umuman ochilmaydi», …). Qaysi fayl kelmagani tasodifiy (rasm / shrift / uslub / sahifaning oʻzi).
- **Navbat** — server soniyasiga 1 ta soʻrovga javob beradi; N bola bir vaqtda soʻradi; «K-bola necha soniya kutadi?». tier 2: server 2 ta javob beradi.

## Qarorlar

- Toʻrlar **qoʻlda chizilgan 6 ta shakldan** tanlanadi (har birida tugunlar joyi qotirilgan), simlarning bir qismi tasodifiy olib tashlanadi — lekin toʻr doim **bogʻlangan** qoladi (test tekshiradi).
- Eng qisqa yoʻl — kenglik boʻyicha qidiruv (BFS), faqat mantiqda; bolaga algoritm nomi aytilmaydi.
- TCP, port, sarlavhalar **kiritilmaydi**. Bir satr: *«haqiqatda tugunlar — routerlar, yoʻlni ular oʻzaro kelishib tanlaydi»*.
- Variantli savolda doim 4 variant; maslahat — qoʻshnilarni yoritish / uzilgan simni koʻrsatish, javob emas.

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Paket manzilga bir nechta tugun orqali borishini va har tugun faqat qoʻshnilarini bilishini aytadi.
2. Kichik toʻrda eng qisqa yoʻlning qadamlarini sanaydi.
3. Sim uzilganda boshqa yoʻl topilishini va qadamlar qanday oʻzgarishini hisoblaydi.
4. Mijoz va server nima ekanini, sahifa bir nechta fayldan yigʻilishini tushuntiradi.
5. Fayl yetib kelmasa sahifa qanday koʻrinishini taxmin qiladi.
6. Server navbatida kutish vaqtini hisoblaydi.

## Fayllar (reja)

- `js/logic.js` — toʻr shakllari, BFS, sim uzish, bogʻlanganlik, sahifa fayllari, navbat hisobi, generatorlar.
- `tests/logic.test.js` — BFS toʻgʻriligi, uzilgan toʻr bogʻlanganligi, «eng koʻp uzayadigan sim» javobi yagona, navbat formulasi.
- `js/scenes/`, `js/game-art.js` — tugun, sim, mijoz va server rasmlari.

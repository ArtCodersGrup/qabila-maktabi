# «Maʼlumot tahlili»

IX sinf «Sunʼiy intellekt», 13-dars. Reja: [`docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md`](../../docs/superpowers/specs/2026-10-12-ix-sinf-ai-1-yarim-yillik.md).

- **Toifa:** `yuqori` (9–11), 14–15 yosh. Telefon va kompyuter — faqat bosish va raqam klaviaturasi.
- **Ohang:** «Maqsad: …», aniq atama (inglizchasi qavsda), qahramonsiz — faqat `ui.say/bubble("elder")`.
- **Oldingi oʻyin:** «Data science» (savol, jadval, tozalash).

## Asosiy fikr

Toʻplamni bir-ikki son tasvirlaydi (oʻrtacha, mediana, moda, oraliq), diagramma — koʻrsatadi. Ikkalasi ham aldashi mumkin:
chetga chiqqan qiymat oʻrtachani buzadi, kesilgan oʻq farqni kattalashtiradi, bogʻliqlik esa hali sabab emas.

## Bosqichlar

### 1. Oʻrtacha, mediana, moda
Koʻrsatish: besh oylikni tartiblaydi, oʻrtadagi qiymatni (medianani) bosadi; keyin direktor oyligi (35) qoʻshiladi — oʻrtacha 5 dan 10 ga sakraydi, mediana 5 da qoladi.

Mashq (`bosqich1Task`, hamma javob — butun son):
- `ortachaTask` — tier 0–1: oʻrtacha butun chiqadi; tier 2: butun chiqmaydi, «eng yaqin butun songacha yaxlitla» deb aytiladi (aynan ,5 boʻlmaydi).
- `medianaTask` — tier 0: 5 ta qiymat; tier 1: 6–7 ta; tier 2: 8 ta (oʻrtadagi ikki qiymat har xil, yigʻindisi juft).
- `modaTask` — yagona moda; tier 2 da ikkinchi oʻrindagi qiymat bitta kam uchraydi.
- `oraliqTask` — max − min; tier 2 da manfiy haroratlar.
- `chetTask` — tier 0: qaysi qiymat chetga chiqqan; tier 1: usiz oʻrtacha; tier 2: u oʻrtachani nechaga oshirgan.

### 2. Diagramma oʻqish
Koʻrsatish: «2-model ancha aniqroq» reklamasi — oʻq 90 dan boshlangan ustunli diagramma (ustun 3 marta baland); oʻquvchi oʻqni 0 dan boshlatadi — farq 4, xolos.

Mashq (`bosqich2Task`):
- `ustunTask` — tier 0: bitta ustun qiymati; tier 1: eng baland va eng past farqi; tier 2: ustunlar oʻrtachasi.
- `chiziqTask` — tier 0: nuqta qiymati; tier 1: eng katta oʻsish oraligʻi (4 variant); tier 2: eng katta pasayish.
- `aldamchiTask` — kesilgan oʻq. tier 0: haqiqiy farq; tier 1: rasmda necha marta baland chizilgan; tier 2: haqiqatda necha foiz katta.
- `nuqtaTask` — tier 0: x boʻyicha y; tier 1: chegaradan yuqori nuqtalar soni; tier 2: bogʻliqlik turi (musbat / manfiy / yoʻq / egri — 4 variant).

### 3. Bogʻliqlik va sabab
Koʻrsatish: muzqaymoq sotuvi va choʻkish hodisalari (shartli maʼlumot) — oʻquvchi xulosani tanlaydi, keyin uchinchi omilni (issiq havo) ochadi.

Mashq (`bosqich3Task`, hammasi 4 variantli):
- `sababTask` — tier 0: bogʻliqlikni qaysi uchinchi omil tushuntiradi; tier 1–2: toʻrt tushuntirishdan biri (sabab — faqat tajriba bilan, teskari sabab, uchinchi omil, tasodif).
- `diagXulosaTask` — nuqtali diagramma va toʻrt xulosa; «sababi isbotlandi» hech qachon toʻgʻri emas.
- `xulosaTask` — soʻrovnoma natijasi (sonlar yasaladi) va toʻrt xulosa: toʻgʻri, sabab daʼvosi, har bir odamga yoyish, soʻralmaganlarga yoyish.

## Qarorlar

- **Javoblar butun son.** Ekrandagi raqam klaviaturasida vergul yoʻq; yaxlitlash kerak boʻlsa, savolda aniq yoziladi.
- **SVG ichida matn yoʻq:** oʻq sonlari, ustun nomlari va oʻq sarlavhalari — SVG yonidagi HTML (foizli joylashuv), 360 px da sigʻadi.
- **Qiymat koʻz bilan oʻqiladi:** har qiymat tor chizigʻida yoki ikki chiziqning aynan oʻrtasida.
- **Halol diagrammalar 0 dan boshlanadi**; kesilgan oʻq faqat `aldamchiTask` da va rasmda hech qanday ogohlantirish belgisi yoʻq — oʻquvchi oʻqni oʻzi oʻqishi kerak.
- **Bogʻliqlik turi** Pirson koeffitsiyenti bilan nazorat qilinadi: aniq holatlar (|r| ≥ 0,8 yoki ≤ 0,25), oraliq holat chiqarilmaydi.
- **Hamma holatlar shartli** (oʻylab topilgan kuzatuvlar) — real statistika sifatida berilmaydi; diagrammali vazifada «Shartli maʼlumot» deb yoziladi.
- `sababTask` tier 1–2 — qoʻlda yozilgan 18 ta holat (toʻrt turdan kamida 4 tadan); boshqa generatorlar sonlarni yasaydi.
- **Etika:** oʻqni kesish yoki qulay maʼlumotni tanlash — aldash; guruh oʻrtachasini alohida odamga yoyish — noxolislik (bias).

## Oʻquv maqsadlari

Oʻyindan keyin oʻquvchi:

1. Kichik toʻplamning oʻrtachasi, medianasi, modasi va oraligʻini hisoblaydi.
2. Chetga chiqqan qiymatni topadi va u oʻrtachani buzishini, medianani esa deyarli oʻzgartirmasligini tushuntiradi.
3. Ustunli, chiziqli va nuqtali diagrammadan qiymatni oʻqiydi va har biri nima uchun ishlatilishini aytadi.
4. Kesilgan oʻqli diagrammani taniydi va haqiqiy farqni oʻqdan hisoblaydi.
5. Bogʻliqlikni sababdan ajratadi: uchinchi omil, teskari yoʻnalish, tasodif; sababni tajriba isbotlashini aytadi.
6. Maʼlumotdan oshib ketgan xulosani («albatta», «har bir», «barcha») ajratadi.

## Fayllar

- `js/logic.js` — hisob funksiyalari, diagramma maʼlumoti, holatlar banki, oʻn ikki generator `(prev, rng, tier)`.
- `tests/logic.test.js` — har generator har tier da 30 ta har xil misol (qoʻlda yozilgan bankda — hamma holat); javoblar mustaqil qayta hisoblanadi; imlo; SVG da matn yoʻqligi.
- `js/scenes/` — `common.js` (qiymatlar qatori, diagramma, mashq ekranlari), `stage1–3.js`, `final.js`; `js/game-art.js` — matnsiz SVG.

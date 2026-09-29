# Yozuv poygasi: ish rejasi

**Maqsad:** onlayn tez yozish poygasi — oʻqituvchi xona ochadi, 2–12 bola kod bilan kiradi, yozgan sari togʻga koʻtariladi, oʻyin hamma choʻqqiga chiqquncha davom etadi.

**Arxitektura:** togʻ oʻyinidagidek — sof mantiq alohida faylda (Node testlari), ekran qismlari alohida, xona qatlami `umumiy/js/onlayn.js` dagi `xona()`. Togʻ sahnasi `../tog/` dan, yozish `../23-on-barmoq/` dan olinadi (boshqa papkadagi faylga murojaat — loyihada bor usul).

**Dizayn:** [`DIZAYN.md`](DIZAYN.md), qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

> Reja kod bilan birga yozildi (muallif topshirigʻi: dizayn kelishilgach oxirigacha toʻxtamasdan).

## Nomlar va interfeyslar

- `QK.yozuvPoyga` (`js/poyga.js`): `TURLAR` (id, nom, togʻ, daraja), `MIN_ODAM`, `MAX_ODAM`, `holatYarat({tur, urug})`, `qoshil`, `chiqar`, `qadam(s, id, {bel, jami, ms, cpm, aniq}, now)`, `pogonaOf(bel, jami, pogona)`, `tartib(s)`, `hammasiTugadi(s)`, `natija(s)`.
- `QK.yozuvProtokol` (`js/protokol.js`): `TYPES`, `kimlik(rng)`, `urugYasa(rng)`, `seedRng(urug)`, `matnYasa(tur, urug)`, `lobbi`, `paket(s, now)`, `yaxshiPaket(p)`, `holat(p, now)`.
- `QK.yozuvEkran` (`js/ekran.js`): `box`, `buttons`, `sahna(host, togId)`, `yozuv(host, matn, {onStep, onDone})`, `lobbiRoyxat`, `rangTanlash`, `natijaRoyxat`, `sanoq`.
- `QK.yozuvOnlayn` (`js/onlayn-poyga.js`): `host(qayt)`, `guest(qayt)`.

## Vazifalar

- [x] 1. `js/poyga.js` + `tests/poyga.test.js` (TDD): holat, qoʻshilish, qadam va pogʻona hisobi, tartib (tugaganlar oʻrin boʻyicha, qolganlar belgi boʻyicha), hamma tugadimi, natija.
- [x] 2. `js/protokol.js` + `tests/protokol.test.js` (TDD): urugʻdan bir xil matn (deterministik), paket ↔ holat, yomon paket oʻtmaydi.
- [x] 3. `tests/robot.js` + sinov testi: 12 ta robot har xil tezlikda yozadi — poyga tugaydimi, tartib toʻgʻrimi.
- [x] 4. `js/ekran.js`, `css/style.css`, `index.html`: togʻ sahnasi (`togUi.scene`), yozuv maydoni (`typingUi.line` + `keyboard`), lobbi, rang tanlash, natija.
- [x] 5. `js/onlayn-poyga.js` + `js/main.js`: oʻqituvchi va bola oqimi, uzilish, chiqarib yuborish, «Yangi poyga».
- [x] 6. `tests/sahifa.test.js`: `index.html` dagi skriptlar mavjud va tartibi toʻgʻri.
- [x] 7. Bosh sahifa: `CONTESTS` ga onlayn «Yozuv poygasi» (💻), `yozuv` ikonkasi; `bosh/tests/bosh.test.js` va `bosh/tests/offline.test.js` dagi roʻyxatlar, `bosh/sw-royxat.py`.
- [x] 8. `python3 bosh/sw-royxat.py --bump`, README.
- [x] 9. Barcha testlar.
- [x] 10. Brauzerda sinov: oʻqituvchi + ikki bola oynasi, haqiqiy Supabase orqali (1280×800, 1000×700). Sinalgani: xona ochish, kod bilan kirish, rang tanlash, 3-2-1, jonli koʻtarilish, xato tugma oʻtkazmasligi, oʻrinlar, natija jadvali, «Yangi poyga», «Tugatish», bola xonadan chiqib ketishi.

## Sinovda topilgan va tuzatilgan xatolar

1. **`chiqish` eʼlon qilinishidan oldin ishlatilgan** (`lobbi()` da) — xona ochilishida konsolga xato chiqardi, tugmalar birinchi chizishda yoʻq edi.
2. **Rang tanlash ekranida band ranglar koʻrinmasdi** — ikki bola bitta rangni tanlashi mumkin edi va ikkinchisi xonaga kirmay qolardi. Endi lobbi xabari kelganda roʻyxat yangilanadi, rang band boʻlib chiqsa — «Bu rang band, boshqasini tanla».
3. **Klaviatura oʻz ustunidan chiqib ketardi** — `.kb` kengligi `100cqw` bilan hisoblanadi, lekin `.race-yoz` da `container-type` yoʻq edi. Qoʻshildi; 900 px dan tor ekranda qahramonlar zonasi yashiriladi (togʻ va klaviaturaga joy qoladi).
4. **Xonadan chiqib ketgan bola poygani osiltirib qoʻyardi** — «hamma yetib olguncha» qoidasi uni ham kutardi. Endi `hammasiTugadi(s, hozir)` faqat xonada turganlarni kutadi (test bilan qoplangan), lobbi roʻyxati ham presence boʻyicha tozalanadi.

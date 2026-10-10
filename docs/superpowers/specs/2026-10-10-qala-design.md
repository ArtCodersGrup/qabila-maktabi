# Qal'a: hakerlar va himoyachilar — dizayn (2026-10-10)

Jamoaviy xavfsizlik o'yini, 5–8 (asosan 7–8-sinf) va 9–11 uchun; 1–4 ga ko'rinmaydi. Papka: `oyinlar/qala/`.
Bosh sahifada `CONTESTS` da (onlayn guruh, `toifalar: ["orta","yuqori"]`, badge «darslar + robotlar bilan»).
Sahifa Tog' kabi o'z qobig'ida (app.js emas): menyu → Darslar / Robot jamoaga qarshi / Xona ochish / Kod bilan kirish / Lug'at.
Ko'rinish: kattalar (toifa.js `<head>` da; qahramonlar yo'q, `ui.bubble/say("elder")` — oddiy ko'rsatma paneli).
Ohang: 5–8 namunasi (18-o'yin): maqsad → atama → mashq; shogird gaplari yo'q; maqtov qisqa ✓.

Tarmoq qoidasi (umumiy/js/onlayn.js, server/app/xona_qoidalari.py): erkin matn yo'q — faqat sonlar, 0/1,
`[a-z0-9:_-]{0,32}` kalit so'zlar va ularning ≤32 ta ro'yxati; `data` da ≤32 maydon. Parollar — karta id'lari,
bayroq — ro'yxat id'si, shifrlangan matn — lotin harflari (≤32). Erkin matn hech qachon tarmoqqa chiqmaydi.

## 1. Fayllar va egalari

```
oyinlar/qala/
  index.html            (men)   skript tartibi quyida — AGENTLAR O'ZGARTIRMAYDI
  css/style.css         (men)   qobiq, menyu, umumiy tokenlar
  css/dars.css          (agent darslar)
  css/oyin.css          (agent o'yin)
  js/qala.js            (agent mantiq)  QK.qala — sof mantiq, Node'da test
  js/dars-mantiq.js     (agent mantiq)  QK.qalaDarsMantiq — 15 mashq generatori, sof
  js/qala-ui.js         (men)   QK.qalaUi — box, buttons, atama chipi, sarlavha; AGENTLAR O'ZGARTIRMAYDI
  js/dars.js            (agent darslar) QK.qalaDars = { start(qayt, darsId?), holat() }
  js/lugat.js           (agent darslar) QK.qalaLugat = { start(qayt) }
  js/oyin-ui.js         (agent o'yin)   devor/hujum/qorovul/doska ekranlari (solo va onlayn bir xil)
  js/mashq.js           (agent o'yin)   QK.qalaMashq = { start(qayt) } — robot jamoaga qarshi, internetsiz
  js/protokol.js        (agent o'yin)   QK.qalaProtokol — paketlar, sof, Node'da test
  js/onlayn-qala.js     (agent o'yin)   QK.qalaOnlayn = { host(qayt), guest(qayt) }
  js/main.js            (men)   menyu
  tests/*.test.js       har agent o'z faylini: qala.test.js, dars-mantiq.test.js, protokol.test.js, oyin-ui.test.js (sof qismlar)
```

Agent o'z fayllaridan tashqariga yozmaydi. `umumiy/` ga tegilmaydi. Brauzer sinovi — men (agentlar brauzersiz).
Mantiq fayllari ikki muhitda ishlaydi (Tog' naqshi): `module.exports` bo'lsa — require, aks holda `root.QK.*`.
Boshqa o'yinning mantiqi `require("../../50-parol-kuchi/js/logic.js")` / brauzerda `QK.logic` emas — index.html da
50/51/52 logic.js lar `QK.logic` nomini bir-birini bosib yozadi! Shuning uchun **qala.js ulanishdan OLDIN**
index.html quyidagi tartibda yuklaydi va har biri yuklangach `QK.qalaLib.{parol, qulf, xat}` ga ko'chiriladi
(index.html da kichik inline skript — men yozaman). qala.js: `const LIB = module ? { parol: require(...), qulf: require(...),
xat: require(...), caesar: require("../../03-sezar-maktubi/js/caesar.js") } : root.QK.qalaLib`.

Skript tartibi (index.html): umumiy/sanash → 50 logic → (ko'chir) → 51 logic → (ko'chir) → 52 logic → (ko'chir) → 03 caesar →
qala.js → dars-mantiq.js → protokol.js → umumiy: storage, sound, art, ui, practice, onlayn, hisob, sinf-tanlov, offline →
bosh.js → qala-ui.js → oyin-ui.js → dars.js → lugat.js → mashq.js → onlayn-qala.js → main.js.

## 2. Atamalar (uz · en · ru) — `QK.qala.ATAMALAR`

Har atama: `{ id, uz, en, ru, izoh, dars }`. Chip: `qalaUi.atama(id)` → «parol · password · пароль», bosilsa izoh (toast).
Dars ichida atama birinchi marta nomlanganda chip; keyin faqat o'zbekcha. Har darsda ≤ 3 yangi atama.

| id | uz | en | ru | dars |
|---|---|---|---|---|
| parol | parol | password | пароль | 1 |
| qopol | qo'pol kuch | brute force | перебор | 1 |
| lugat | lug'at hujumi | dictionary attack | словарная атака | 1 |
| ibora | parol-ibora | passphrase | парольная фраза | 1 |
| xesh | xesh (iz) | hash | хеш | 2 |
| tuz | tuz | salt | соль | 2 |
| jadval | tayyor jadval | rainbow table | радужная таблица | 2 |
| shifr | shifr | cipher | шифр | 3 |
| kalit | kalit | key | ключ | 3 |
| chastota | chastota tahlili | frequency analysis | частотный анализ | 3 |
| vijener | kalitli shifr | Vigenère cipher | шифр Виженера | 3 |
| fishing | fishing | phishing | фишинг | 4 |
| ijtimoiy | ijtimoiy muhandislik | social engineering | социальная инженерия | 4 |
| domen | domen | domain | домен | 4 |
| ikki | ikki qadamli tekshiruv | two-factor (2FA) | двухфакторная аутентификация | 5 |
| xaker | xaker | hacker | хакер | 5 |
| oqshlyapa | oq shlyapa | white hat | белая шляпа | 5 |
| ruxsat | ruxsat | permission | разрешение | 5 |
| byudjet | himoya byudjeti | security budget | бюджет защиты | 5 |

Izohlar — bir gap, 5–8 ohangida, "siz"siz, buyruq ohangisiz (masalan, xesh: «Paroldan hisoblanadigan son; undan parolni qaytarib bo'lmaydi»).

## 3. O'yin qoidalari

**Ikki jamoa:** `oy` va `quyosh`. Har jamoaning qal'asi **5 devor**: parol, qulf, shifr, xat, ikki (ixtiyoriy).
**Byudjet:** 10 ochko. Narxlar: parol — 0 (kartalardan, ≤ 4 karta), qulf — tuz 3, shifr — sezar 0 / kalitli 4,
xat filtri — 0 (6 xatdan firibgarini belgilash — bu mashq, hujumga ta'siri: belgilanmagan firibgar xat = tayyor "darvoza"),
ikki qadamli — 2 (parol ochilsa ham kod kerak; kod faqat fishing orqali sizadi). Jami hammasi = 9 → hammasini
olsa bo'ladi, LEKIN kalitli shifr (4) + tuz (3) + ikki (2) = 9 — vaqt yetmaydi (himoya 5 daqiqa, har devor ish).
Shuning uchun "byudjet" ham "vaqt" ham cheklov: har devorni qurish vaqt oladi.

**Fazalar (bir raund):** `himoya` 300 s → `hujum` 300 s → `tahlil` 90 s. Ikki raund; 2-raundda jamoalar ichida rollar
almashadi (hujumchi ↔ qorovul). Solo (robot) rejimida: himoya vaqtsiz, hujum 180 s, bitta raund.

**Hujum fazasi:** har jamoa ikkiga bo'linadi: **hujumchilar** (raqib qal'asi) va **qorovullar** (o'z qal'asiga kelgan
xatlarga javob). Hujum qurollari (devorga qarab):

| Devor | Qurol | Natija (sof funksiya) | Mahorat |
|---|---|---|---|
| parol | qo'pol kuch | `qopolKuch(h, qolganSoniya)`: o'yin tezligi 1 000 000 variant/s; variant/tezlik ≤ qolgan vaqt → yiqildi | kuchli parol tanlash |
| parol | taxmin (5 ta) | `parolMaslahat(h)` 3 maslahat (uzunlik, karta turlari, "so'z lug'atda"), hujumchi kartalardan yig'adi, `taxmin(h, kartalar)` | maslahatdan deduksiya |
| qulf | jadval | tuz yo'q bo'lsa `jadvalHujumi(h)`: jadvaldagi iz mos parollar; parol jadvalda bo'lsa yiqildi | tuz nega kerak |
| qulf | iz hisoblash | hujumchi nomzod kartalarini tanlaydi va **izini qo'lda hisoblab** kiritadi: `izTaxmin(h, kartalar, hisob)`; hisob noto'g'ri — urinish kuydi; to'g'ri va nishon iziga teng — yiqildi (to'qnashuv ham hisob). Tuz bo'lsa hisob uzunroq | tez va aniq hisoblash |
| shifr | siljish | Sezar: `chastota(shifrMatn)` ustunlari ko'rsatiladi, hujumchi k ni kiritadi — `shifrTaxmin(h, k)`; xato — 15 s jarima | chastota tahlili |
| shifr | kalit | kalitli: `kalitTaxmin(h, kalit)` — kalit faqat sizgan bo'lsa (fishing) ma'lum; aks holda 17 576 variant — "vaqt yetmaydi" | — |
| xat | fishing | hujumchilar `xatYasa(qismlar)` — raqib qorovullari uni 3 haqiqiy xat orasida ko'radi, har biri «ochaman/o'chiraman»; `fishingNatija(h, xat, ovozlar)`: ko'pchilik ochsa — yiqildi; xat kod so'ragan bo'lsa → `ikki` kodi sizadi; kalitli shifr bo'lsa va havola bosilsa → kalit sizadi | ishonarli yasash / nozik belgini sezish |
| ikki | — | parol yiqilgan + kod sizgan → yiqiladi; aks holda turadi | — |

**Ochko:** yiqilgan devor — 1, bayroq (shifr ochilsa — bayroq so'zi) — +2. 2 raund yig'indisi; teng — durang.
**Tahlil ekrani:** `tahlil(s, jamoa)` → har devor: turdi/yiqildi, sabab (bir gap), qaysi dars (1–5) — doskada ikki ustun.

## 4. `QK.qala` API (js/qala.js, sof) — agent mantiq

```js
ATAMALAR: [{id, uz, en, ru, izoh, dars}]; atama(id)
KARTALAR: { soz: [{id:"s1", matn:"olma"}, … 16 ta: 10 tasi lug'atdagi oddiy so'z, 6 tasi kam uchraydigan],
            raqam: [{id:"r1", matn:"1"}, … 8 ta: 1, 7, 12, 99, 123, 2010, 2024, 0],
            belgi: [{id:"b1", matn:"!"}, … 6 ta: ! ? # _ - @ ] }
karta(id) → {id, matn, tur}
parolYasa(ids) → string (≤4 karta, tartib bilan; noto'g'ri id → null)
parolKuch(parol) → { variant: BigInt, soniya: number, lugatda: bool, daraja: 0|1|2|3, matn: "…" }  // 50-logic: tahlil/kuch/vaqt; TEZLIK = 1e6/s
parolMaslahat(ids) → [string×3]  // "Uzunligi 7", "So'z + raqam", "So'z lug'atda bor" …
iz(parol, tuz), izQadamlar(parol, tuz), izHisob(parol, tuz)  // 51-logic qayta eksport; tuz: 0 (yo'q) yoki 1..99
jadval(tuz) → [{parol, iz}]  // barcha bitta so'z va so'z+raqam juftliklari (16 + 16×8)
jadvaldan(izQiymat, tuz) → [parol…]
BAYROQLAR: [{id:"f1", soz:"qalqon"}, … 12 ta, 5–8 harf, faqat a–z]
ALIFBO; sezar(m,k); sezarOch(m,k)  // caesar.encrypt/decrypt; faqat a–z
vijener(m, kalit); vijenerOch(m, kalit)  // kalit a–z, uzunligi 3; harf i → siljish kalit[i % 3]
chastota(m) → [{harf, soni}] kamayish tartibida (0 bo'lganlar ham, 26 ta)
sezarTaxmin(m) → k  // eng ko'p harf → 'a' deb; qisqa matnda xato bo'lishi mumkin — bu o'yinning bir qismi
KALIT_VARIANT = 17576
XAT_QISMLAR: { kimdan: [{id, matn, shubhali}], mavzu: [{id, matn}], havola: [{id, matn, soxta}], gap: [{id, matn, belgi}], imzo: [{id, matn, shubhali}] }
  // havola: haqiqiy "qabilabank.uz" va o'xshashlari "qabila-bank.uz.xyz", "qabi1abank.uz" (52: domenFarqi/gumonliZona);
  // gap: 52 BELGILAR id'lari bilan (shoshiltirish, qorqitish, parol, yutuq, sir, pul) yoki null (oddiy gap)
xatYasa({kimdan, mavzu, havola, gap, imzo}) → { qismlar, belgilar: [id], ilmoq: "havola"|"kod"|null, ishonch: 0..100 } | null
  // ilmoq yo'q (soxta havola ham, kod so'rash ham yo'q) → bu hujum emas → null
  // ishonch: 100 − 25×(oshkora belgilar: shoshiltirish, qorqitish, yutuq, sir, pul, imlo) − 10×(shubhali kimdan/imzo); soxta havola nozik bo'lsa ayirilmaydi
haqiqiyXat(rng) → xat (belgilar [], ilmoq null, havola haqiqiy)
xatBelgilari(xat) → [{id, nom, izoh}]  // qorovulga tahlil uchun
DIALOGLAR: [{ id, vaziyat, gaplar: [string], javoblar: [{matn, togri, izoh}], hiyla: belgiId }] ≥ 8 ta (telefon "bankdan", "do'stim" chat, "o'qituvchi" soxta, "o'yin sovrini", "texnik yordam", …)
BYUDJET = 10; DEVORLAR: [{id, nom, tanlov:[{id, nom, narx, izoh}]}]
himoyaYasa({ parol: [ids], tuz: 0|1..99, shifr: "sezar"|"kalitli", k?: 1..25, kalit?: "abc", bayroq: "f1", ikki: bool, filtr: [xatId] }) → { …, narx, xato: null | "byudjet" | "parol" | "kalit" }
himoyaNarxi(h)
korinish(h) → { maslahat: [3], iz: n, tuz: bool, shifr: "sezar"|"kalitli", shifrMatn: string, ikki: bool }  // raqibga ko'rinadigan qism — tarmoqqa shu ketadi
qopolKuch(h, qolganSoniya) → { ochildi, soniya }
taxmin(h, ids) → { togri }
jadvalHujumi(h) → { mumkin, ochildi, parollar }
izTaxmin(h, ids, hisob) → { hisobTogri, mos, ochildi }
shifrTaxmin(h, k) → { togri, ochiq }
kalitTaxmin(h, kalit) → { togri, ochiq }
fishingNatija(h, xat, ovozlar: [bool]) → { ochildi, sizdi: ["kod"|"kalit"] }
create({ jamoalar: ["oy","quyosh"], now, vaqt: {himoya, hujum, tahlil}, raundlar: 2 }) → s
  // s = { faza: "lobbi"|"himoya"|"hujum"|"tahlil"|"tugadi", raund, fazaTugaydi, jamoa: { oy: { himoya, devor: {parol: {holat:"turdi"|"yiqildi", sabab}, …}, ochko, urinish: {taxmin: 5, iz: 5, shifr: n}, sizdi: [] }, quyosh: {…} }, voqealar: [{t, jamoa, devor, matn, ok}] }
boshla(s, now); himoyaQoy(s, jamoa, himoya) → { ok, xato }; hujum(s, hujumchiJamoa, amal, now) → { ok, natija, voqea }
  // amal: { tur: "qopol"|"taxmin"|"jadval"|"iz"|"shifr"|"kalit"|"fishing", ids?, hisob?, k?, kalit?, xat? }
qorovulOvoz(s, jamoa, xatNomer, ovozlar) ; tekshir(s, now) → [voqea]  // vaqt tugasa faza almashadi; hujum vaqti tugasa qopolKuch avtomatik hisoblanadi
hisob(s) → { oy, quyosh }; golib(s) → "oy"|"quyosh"|"durang"|null
tahlil(s, jamoa) → [{ devor, holat, sabab, dars }]
robotHimoya(rng, daraja 1|2|3) → himoya (1 — zaif: lug'at paroli, tuzsiz, sezar; 3 — kuchli)
robotHujum(s, jamoa, now, rng, daraja) → amal | null  // 8–15 s da bir amal; daraja 3 chastota bilan to'g'ri topadi
robotQorovul(xat, rng, daraja) → bool  // ishonch yuqori va belgilar kam bo'lsa ochadi
```

Hamma matn `oʻ gʻ ʼ` bilan (test: oddiy ' yo'q). BigInt — `umumiy/js/sanash.js` orqali (50-logic qanday ishlatsa).

## 5. Darslar — `QK.qalaDarsMantiq` (js/dars-mantiq.js, sof) va `QK.qalaDars` (js/dars.js, UI)

5 dars × 3 mashq. Har mashq: generator `dNx(prev, rng, tier)` → task; UI `practice.exercises/tries/numberTries` bilan.
Generatorlar `prev` bilan takrorlanmaydi, `tier` 0/1/2 (practice.js: kattalarda 1-misol oson). Har task `{ tur, savol, …, javob, izoh }`.

| Dars | Mashq | tur | Mazmuni |
|---|---|---|---|
| 1 Parol | d1a | son | parol berilgan → variantlar soni (50: variantTask uslubi) yoki soniya (daraja: 1e6/s) |
| | d1b | tartib | 4 parol → ochilish vaqti bo'yicha tartibla (lug'atdagi 1 s) |
| | d1c | tanlov | 3 maslahat → 6 nomzoddan parolni top (hujumchi fikri); tier 2: nomzodlar yaqinroq |
| 2 Qulf | d2a | son | iz(parol, 0) ni hisobla (3–5 belgi) |
| | d2b | tanlov | 5 foydalanuvchi izlari → kimning paroli bir xil / jadvaldan qaysi parol |
| | d2c | son | iz(parol, tuz) ni hisobla; izoh: tuz bilan jadval ishlamaydi |
| 3 Shifr | d3a | matn-tanlov | Sezar k bilan ochilgan so'z — 4 variantdan |
| | d3b | son | shifrlangan gap (≥ 25 harf) + chastota ustunlari → k ni top |
| | d3c | tanlov/son | vijener: so'z + kalit → shifrlangan 4 variantdan; tier 2: kalit variantlari soni 26³ |
| 4 Xat | d4a | tanlov | 2 manzil — qaysi soxta (domenFarqi: harf, zona, qo'shimcha) |
| | d4b | dialog | DIALOGLAR: gap → to'g'ri javob + hiyla nomi |
| | d4c | tartib | 3 xat → shubha darajasiga qarab tartibla (ishonch) |
| 5 Oq shlyapa | d5a | tanlov | vaziyat → ruxsat bormi / qonuniymi (6 ta vaziyat) |
| | d5b | byudjet | 10 ochko, robot hujumchi profili → devorlar tanlovi; tekshiruv: profilga qarab turadimi (mantiq: `byudjetBaho(tanlov, profil)`) |
| | d5c | tanlov | o'yin qoidalari: faza, qurol → devor mosligi (3 savol) → «Qal'aga tayyor» |

UI (dars.js): `start(qayt, darsId)` — dars ro'yxati (5 karta, bajarilgani ✓, localStorage `qala:dars:v1` done[5]);
dars: kirish (≤ 2 panel: maqsad + atama chiplari) → 3 mashq ketma-ket (`practice.need()` ta to'g'ri javob har birida
— kattalarda 4) → yakun kartasi: shu darsning atamalari (chip) va 2 qoida. `practice.setStage(n)` ishlatiladi.
Butun 5 dars tugasa — `holat().tayyor = true` (menyuda «Qal'aga tayyor ✓»).
Ekranlar `qalaUi.box/buttons` bilan; matn — 5–8 ohangi. Har mashqda xato → maslahat (task.izoh) → 2-urinish → yechim.

## 6. O'yin UI (agent o'yin): js/oyin-ui.js, js/mashq.js, js/protokol.js, js/onlayn-qala.js

**oyin-ui.js** (`QK.qalaOyinUi`): bir xil ekranlar solo va onlayn uchun, holatni tashqaridan oladi:
- `devorlar(el, { himoya, byudjet, onChange, onTayyor, qolgan })` — himoya quruvchi: 5 devor kartasi, narx/byudjet chizig'i,
  parol kartalari (bosib yig'iladi, kuch ko'rsatkichi jonli — `parolKuch`), tuz tugmasi, shifr tanlovi (bayroq ro'yxatdan,
  k yoki kalit — klaviaturasiz: k uchun 1–25 tugmalar, kalit uchun 3 ta harf g'ildiragi), ikki qadamli, xat filtri (6 xat, belgilash).
- `hujum(el, { korinish, urinish, qolgan, onAmal })` — devor tanlash → qurol ekrani (maslahat + kartalar; jadval/iz hisob
  klaviaturasi `ui.askNumber`; chastota ustunlari + k; fishing yasagich — 5 qism ro'yxatdan).
- `qorovul(el, { xatlar, onOvoz })` — kelgan xat (3 haqiqiy + 1 soxta aralash), «Ochaman / O'chiraman»; javobdan keyin belgilar izohi.
- `doska(el, s)` — ikki qal'a (SVG, matnsiz: devorlar, yoriqlar), fazalar, taymer, ochko, voqealar lentasi (oxirgi 6).
- `tahlil(el, s, tugmalar)` — ikki ustun: devor → turdi/yiqildi → sabab → «N-dars».
**mashq.js** — solo: 1) o'yinchi himoya quradi (vaqtsiz) 2) robot himoyasi `robotHimoya(rng, daraja)` (daraja menyuda 1–3)
3) hujum 180 s: o'yinchi raqib devorlariga hujum qiladi, robot ham o'yinchi qal'asiga `robotHujum` bilan — voqealar jonli;
robot fishing xati kelsa o'yinchi qorovul sifatida javob beradi (modal panel) 4) tahlil. Internetsiz, onlayn qatlamga tegmaydi.
**protokol.js** (sof, Node'da test): `TYPES = ["lobbi","rol","holat","himoya","amal","ovoz","xat"]`;
`paket(s, now)` — hammaga: faza, qoldi, raund, ochko, devor holatlari (0/1 ro'yxati 5×2), ko'rinish (maslahat id'lari,
iz, tuz 0/1, shifr turi, shifrMatn, ikki 0/1) har jamoa uchun, urinishlar, oxirgi voqea kodlari; `yaxshiPaket(p)`;
`holat(p, now)` — paketdan ekran holati; `rolPaket(odamlar)` — id → {jam, rol, dev}; o'yinchi → boshlovchi: `himoya` (karta id'lari …),
`amal`, `ovoz`. **Himoya ma'lumoti (parol kartalari, kalit, k) tarmoqqa chiqmaydi** — faqat o'z jamoasining qurilmasidan
boshlovchiga `himoya` xabari bilan boradi; raqibga `korinish(h)` ketadi. Bitta jamoada bir devorni bir kishi quradi (rol).
Boshlovchi 700 ms da `holat` tarqatadi; HOST_JIM 25 s; o'yinchi uzilsa roli 20 s dan keyin bo'sh — jamoadoshi «Men olaman».
**onlayn-qala.js** — Tog' naqshi (`onlayn.xona`, `sinfTanlov`, lobbi, kod, qayta ulanish). Boshlovchi = doska, o'ynamaydi.
Jamoaga bo'lish: server navbat bilan (kirish tartibi), doskada ismni bosib almashtirish; ≤ 15 kishi jamoada (xona 31 = 30 + boshlovchi).
Rollar: himoya fazasida har devorga 1–3 kishi; hujum fazasida yarmi hujumchi (devorlar bo'yicha), yarmi qorovul; 2-raundda almashadi.
Ikki bola bitta telefonda — rol telefonga. Natija: `holat` tugaganda `{ids, jam:[0/1], och:[jamoa ochkosi], dev:[yiqitgan devorlari]}`
(server `xona_natija.MAYDONLAR["qala"]`).

## 7. Server (men)
`xona_qoidalari.py`: KINDS + "qala"; `MAX_ODAM_KIND = {"qala": 31}` (boshqalar 13); `xonalar.py` sinf ro'yxatiga "qala";
`xona_natija.py` MAYDONLAR["qala"] = {"jam": "jamoa", "och": "ochko", "dev": "devor"}, META "golib". Testlar.
`umumiy/js/onlayn.js` KINDS + "qala" (MAX_ODAM ni qala o'zi hisoblaydi).

## 8. Sinov va chiqarish (men)
Node: har agentning testlari + `bosh/tests` + `umumiy/tests`; sahifa testi (skript tartibi, mashq internetsiz, sw keshi).
Brauzer (Playwright): darslar 1–5 oqimi, solo o'yin to'liq, onlayn: doska + 4 telefon (2 jamoa), uzilish.
`python3 bosh/sw-royxat.py --bump`, commit, deploy, xotira.

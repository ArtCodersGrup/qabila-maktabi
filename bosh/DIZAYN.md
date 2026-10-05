# Bosh sahifa: dizayn

**Fayl:** [`../index.html`](../index.html) — loyiha ildizida, ikki marta bosib ochiladi.
**Holati:** yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-21)

Umumiy qoidalar: [`../QOIDALAR.md`](../QOIDALAR.md).

## 1. Vazifasi

Bitta sahifadan barcha o'yinlarga kirish. Bola qaysi o'yinni o'ynaganini va qayergacha yetganini ko'radi.

## 2. Tuzilishi

```
Qabila maktabi
Informatika o'yinlari · 8–12 yosh
(Oqsoqol pufagi) "Salom! Qaysi oʻyinni oʻynaymiz?"   ← Oqsoqol va bola (umumiy/js/art.js)

▸ Kodlash va shifrlash   — Ma'lumotni belgilarga aylantiramiz
   [ikonka] 1. Qabila kodlari    Nechta belgidan nechta so'z yasaladi?   ●●●  8–12
   [ikonka] 2. Qabila Morzesi    Nuqta va chiziq bilan xabar yuborish    ○○○  8–12
   [ikonka] 3. Sezar maktubi     Harflarni surib yozilgan sirli xat      ○○○  8–12
▸ Ikkilik kod            — Kompyuter tili: yoniq va o'chiq
   [ikonka] 4. Qabila chiroqlari Chiroqlar, bitlar va ikkilik sonlar     ○○○  8–12
▸ Sanoq tizimlari        — Sonlarni yozishning har xil usullari
   [ikonka] 5. Rim toshi         Rim raqamlari va pozitsion tizim        ○○○  8–12

O'yinlar telefonda ham, kompyuterda ham ishlaydi — internet kerak emas.
Keyingi mavzu: sun'iy intellekt.
```

- **Bo'limlar mavzu bo'yicha.** Hamma o'yin 8–12 yosh uchun, shuning uchun yosh bo'yicha bo'lish hozir bo'sh bo'lim beradi; yosh kartada belgi sifatida turadi. O'yinlar ko'paygach yosh bo'yicha bo'lish qayta ko'riladi.
- **Nuqtalar** — tugagan bosqichlar (har o'yinning o'z `localStorage` kaliti). Hammasi tugasa nom yonida ✓. Xotira o'qilmasa (masalan `file://` cheklovi) nuqtalar bo'sh turadi, sahifa baribir ishlaydi.
- **Kartalar `<a>` havola** — bosish, klaviatura va "yangi oynada ochish" ishlaydi.
- O'yin ichidagi bosh ekranda **"◀︎ Barcha oʻyinlar"** havolasi shu sahifaga qaytaradi (`umumiy/js/app.js`).
- 🏠 tugmasi: bosqich ichida (hikoya, mashq, tabrik) — o'yinning bosh ekraniga; o'yinning bosh ekranida — shu sahifaga (`umumiy/js/app.js`).

## 3. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `../index.html` | Sahifa: sarlavha, pufak, qahramonlar, ro'yxat joyi |
| `style.css` | Faqat shu sahifaga xos uslublar (ranglar/shrift — `umumiy/css/asos.css`) |
| `js/bosh-art.js` | 5 ta o'yin ikonkasi (SVG, matnsiz) |
| `js/bosh.js` | **O'yinlar ro'yxati (`GAMES`), bo'limlar (`SECTIONS`)** va chizish |
| `tests/bosh.test.js` | Ro'yxat o'yinlarga mos kelishini tekshiradi |

**Yangi o'yin qo'shilganda:** `js/bosh.js` dagi `GAMES` ro'yxatiga bitta satr qo'shiladi (nomi, kaliti, bosqichlar soni o'yinning `main.js` iga mos bo'lishi shart) va kerak bo'lsa yangi bo'lim ochiladi. Test buni tekshiradi: `node --test bosh/tests/*.test.js`.

## 4. Bu sahifaga kirmaydi

Qidiruv, o'qituvchi paneli, bolaning ismi/profili, server — hammasi brauzerda, ro'yxatdan o'tishsiz.

## 2026-10-02: dizayn yangilanishi (tahlil natijasi)

Bolalar "oson va zerikarli" deyishgan; dizayn tanqidi (`hisobotlar/2026-10-02-2-dizayn.md`) bosh sahifada uchta muammoni ko'rsatdi: bitta uzun ustun, "qayerdaman" ko'rinmaydi, musobaqalar yangi bola uchun noto'g'ri joyda.

- **Tepada umumiy progress** ("Tugagan: 5 / 32" + chiziq) va **"Davom et" kartasi**: avval boshlab qo'yilgan o'yin, bo'lmasa birinchi tugallanmagani. Telefonda klaviatura kerak bo'lgan o'yin (💻) taklif qilinmaydi.
- **Kartalar**: ramka + rangli qirra, kompyuterda (≥ 720 px) 2 ustun, raqam — bo'lim rangidagi nishon, tugagan o'yinda ✓ va `★ 7/9` (qiyin rejim o'tilgan bo'lsa 🔥), tugallanmaganida segmentli progress.
- **Bo'limlar**: rang tasmasi (c0…c3 aylanma) va `2/4` hisobi.
- **Musobaqalar va mashqlar** — ixcham gorizontal qator, ro'yxat **oxirida**; "Hammasi" (o'qituvchi) toifasida musobaqalar tepada qoladi.
- Yulduzlar va qiyin rejim holati `QK.storage` dan o'qiladi (`{done, stars, hard}`).

## 2026-10-06: uch toifa (sinf bo'yicha)

7-sinf o'quvchisi "bolacha ekan, o'ta oson ekan" dedi; oldingi yosh toifalari (8–11 / 12–16) kesishar edi — kattalar ro'yxatining yarmi kichiklar bilan umumiy bo'lgan. Spec: `docs/superpowers/specs/2026-10-06-uch-toifa-ramka-design.md`.

- **Toifalar:** 1–4-sinf, 5–8-sinf, 9–11-sinf va "Hammasi" (o'qituvchi). Har o'yin **aynan bitta** toifada (`GAMES` da `toifa`); asbob va musobaqalarda `toifalar: [...]`.
- **Kirish:** tanlov yo'q bo'lsa — "Nechanchi sinfda oʻqiysan?" ekrani (uchta katta tugma + kichik "Hammasi").
- **Almashtirgich** — sarlavha ostida doim ko'rinadi (`1–4-sinf | 5–8-sinf | 9–11-sinf` + "Hammasi"), bir bosishda o'tadi. Tanlov `qabila:toifa:v2` da (`umumiy/js/toifa.js`); akkauntga yozilmaydi, progress esa o'yin bo'yicha saqlanadi.
- **Sarlavha toifaga qarab:** "Qabila maktabi" / "5–8-sinf informatikasi" / "Olimpiada dasturlash".
- **Kartada yosh belgisi yo'q.** Faqat "Hammasi" da kartada toifa yorlig'i (`1–4`, `5–8`, `9–11`) turadi.
- **Kattalar ko'rinishi (5–8, 9–11) — vaqtinchalik:** qahramonlar va pufak yo'q, oq-iliq fon, tizim shrifti; 9–11 da asosiy rang to'q ko'k. Sahifa ko'rinishini `<head>` dagi `toifa.js` chizishdan oldin qo'yadi. Haqiqiy dizayn — 5–8 bosqichida.


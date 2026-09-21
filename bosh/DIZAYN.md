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

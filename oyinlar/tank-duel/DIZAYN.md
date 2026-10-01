# Tank dueli — bitta ekranda ikki oʻquvchi

Musobaqa (oʻyin emas: bosqichi yoʻq). 49-oʻyin «Tank jangi» ning ikki kishilik koʻrinishi.

- **Yosh:** 12–16, 💻 klaviatura kerak. Internet **kerak emas**.
- **Joyi:** bosh sahifada «Musobaqalar → Bitta ekranda».

## Nega shunday

Muallif gʻoyasi: *«bir nechta oʻquvchi kod yozadi va kim yutadi»*. Haqiqiy onlayn xona Supabase
jadvalidagi xona turlari roʻyxatini (`KINDS`) va bazadagi `CHECK` ni oʻzgartirishni talab qiladi —
bu muallif qaroriga qoldirildi. Bitta ekrandagi duel esa **hech qanday infratuzilmasiz** oʻsha
tajribani beradi: ikki bola navbat bilan oʻz tankiga kod yozadi.

## Qoidalar

- Maydon **simmetrik**: ikkala tank bir xil joyda (oyna kabi), bir xil jon (5) va oʻq (3),
  **koʻrish masofasi ham teng** (300) — 49-oʻyindagidek bolaga ustunlik berilmaydi, chunki
  bu yerda raqib ham bola.
- Bir satr — bir navbat (satr ichida koʻpi bilan 8 harakat). Satrda **xato boʻlsa navbat oʻtmaydi**:
  bola tuzatib qayta yozadi.
- Gʻolib — raqibning joni tugaganda. 40 navbatdan keyin — durang.
- Buyruqlar 49-oʻyindagi bilan bir xil: `move`, `back`, `left`, `right`, `fire`, `reload`,
  `scan`, `radar`, `hp`, `ammo`.

## Umumiy kod

- `oyinlar/umumiy/js/jang.js` — jang qoidalari (49-oʻyindan koʻchirildi, endi ikki sahifa ishlatadi).
- `oyinlar/umumiy/js/jang-ui.js` — maydon, jon/oʻq koʻrsatkichi, buyruq paneli.
- `js/duel.js` — faqat navbat va gʻolib mantiqi (9 ta test).

## Keyin

Onlayn xona (oʻqituvchi ochadi, 3–12 oʻquvchi) — muallif qarori kerak: hamma bir vaqtda yozadimi
yoki navbat bilan, yiqilgan oʻquvchi kuzatuvchi boʻladimi, va `KINDS` ga `"tank"` qoʻshish uchun
bazada bitta SQL qatori.

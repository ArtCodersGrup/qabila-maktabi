# Tez yozish poygasi: dizayn

**Nima:** ikki kishi bitta kompyuterda navbat bilan bir xil matnni yozadi (💻 klaviatura kerak).
**Qayerda:** bosh sahifa → **Musobaqalar** → "Tez yozish poygasi" (yonida "Savol-javob").
**Holati:** 2026-09-22 da muallif soʻrovi bilan 23-oʻyin ("Oʻn barmoq") ichidan alohida sahifaga koʻchirildi.

Qoidalar va oqim — [`../23-on-barmoq/DIZAYN.md`](../23-on-barmoq/DIZAYN.md), 9-boʻlim:

1. Matn turi: Asosiy qator / Soʻzlar / Maqol.
2. Navbat: Oy (chap), keyin Quyosh; "Tayyor" → 3, 2, 1 → yozish. Ikkinchi oʻyinchi yoʻlakda birinchisining soyasini koʻradi.
3. Gʻolib — aniqligi 90% va undan yuqori boʻlganlar ichida tezrogʻi. Keyingi poygada ikkinchisi boshlaydi.
4. "Yana poyga" / "Boshqa matn" / "Barcha oʻyinlar".

Bosh ekranda: sarlavha, Oy va Quyosh, qisqa qoida va "Oʻn barmoq" oʻyiniga havola (avval oʻrganish uchun).

## Kod

| Fayl | Vazifasi |
|---|---|
| `js/race.js` | Poyga sahnasi (`QK.poyga.race`) |
| `js/main.js` | Qahramonlar, 🏠 va ovoz tugmalari (kalit `poyga:v1` — faqat ovoz), poyga sikli |
| `css/style.css` | Poygaga xos uslublar; klaviatura, yozuv qatori, yoʻlak — `../23-on-barmoq/css/style.css` |

Ulanadigan fayllar: `../23-on-barmoq/js/typing.js`, `game-art.js`, `typing-ui.js`, `typing-play.js`, `../musobaqa/js/musobaqa-art.js`.

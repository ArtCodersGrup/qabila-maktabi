# 42-oʻyin — «Qatorga terish»

Kombinatorika blokining ikkinchi oʻyini: **oʻrin almashtirish** (`n!`) va **oʻrinlashtirish** (`A(n,k)`).
Ikkalasida ham **tartib muhim** — tartib muhim boʻlmagan holat 43-oʻyinda keladi.

- **Yosh:** 12–16. 💻 Kompyuter uchun.
- **Oldin oʻtilgan:** 41 (koʻpaytirish qoidasi), 32 (ichma-ich sikl), 40 (oʻsish).

## Asosiy fikr

`n!` — bu alohida qoida emas, **oʻsha koʻpaytirish qoidasi**: birinchi oʻringa `n` xil,
ikkinchisiga `n−1` xil … Shuning uchun oʻyin daraxtdan emas, aynan shu savoldan boshlanadi:
«birinchi oʻringa nechta nomzod bor?» Bola oʻzi javob beradi, keyin sonlar chip boʻlib terilади:
`3 × 2 × 1`.

`A(n,k)` esa shu zanjirning **qisqasi**: koʻpaytuvchilar soni — oʻrinlar soniga teng.
`k = n` boʻlsa, u oʻz-oʻzidan `n!` ga aylanadi (testda shu tekshiriladi).

## Bosqichlar

**1. Faktorial.** Uch bolaning 6 ta tartibi yozib chiqiladi, keyin bola ikki savolga javob beradi
(«birinchi oʻringa necha xil?», «ikkinchisiga nechta qoldi?») va qoida chiqadi. Mashq: `n!` savollari (n = 3…7).

**2. Medallar.** 5 yuguruvchi, 3 medal: chiplar bittadan qoʻshiladi (5 → 4 → 3). «Hammasi qatorga
tursa 120 edi, bu yerda 60» — farq koʻrinadi. Mashq: `A(n,k)`, ichida `k = n` holati ham bor.

**3. Kod va oʻsish.** `fakt(n)` sikl bilan hisoblanadi; talqinchimizning `int` i BigInt boʻlgani uchun
`23!` ham aniq chiqadi. Keyin `n!` jadvali: 23! = 25 852 016 738 884 976 640 000 — sonini bilamiz,
lekin yozib chiqolmaymiz (40-oʻyinga ulanish). Mashq: kodni oʻqish + `fakt(n)` va `orin(n, k)` yozish.

## Nega BigInt

JS `number` da `19!` allaqachon `MAX_SAFE_INTEGER` dan katta, `23!` esa **xato** qiymat beradi
(`…976 640 000` oʻrniga `…978 212 864`). Shuning uchun `umumiy/js/sanash.js` butunlay BigInt da ishlaydi
va test buni qulflab qoʻygan.

## Fayllar

- `js/logic.js` — savollar, kod masalalari, `OSISH` jadvali. Hisob — `umumiy/js/sanash.js`.
- `tests/logic.test.js` — 11 test: roʻyxat uzunligi `n!` ga teng, `A` ning koʻpaytuvchilari soni `k` ga teng,
  namunali yechimlar testdan oʻtadi, `n ** k` kabi tipik xato yechim oʻtmaydi.

## 2026-10-02 qiyinlik yangilanishi

Sabab: hisobot-5 (C jadvali) — savollar formulani sonlarga qoʻyish darajasida edi (n!, A(n, k)).

- **1-bosqich (n!):** «bitta oʻrin band» savollari — Anvar doim birinchi; lugʻat doim oxirida; ikki chekka band.
  Javob (n − 1)! yoki (n − 2)!: bola avval nechta narsa terilishini aniqlaydi.
- **2-bosqich (A(n, k)):** **cheklovli terish** — formulaga tushmaydi, har oʻrinni alohida oʻylash kerak:
  raqamlari har xil ikki / uch xonali sonlar (9 × 9 = 81, 9 × 9 × 8 = 648), 4 xonali kod (9 × 9 × 8 × 7 = 4536),
  «Anvar oltin olmagan». Javoblar testda toʻgʻridan-toʻgʻri sanab tekshirilgan.
- **3-bosqich:** oʻqiladigan kodga raqamlari har xil sonlarni sanaydigan sikl (`if a != b`); yozishga
  `takrorli(n, k)` (n! ÷ k! — «ANORA») va `harxil(k)` (9 × 9 × 8 × …; 0 ni unutgan yechim yiqiladi).
- Zina: 0 — eski savollar; 1–2 — yangilari ustun. Testlar: 11 → 14.

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

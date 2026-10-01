# 49-oʻyin — «Tank jangi»

Muallif gʻoyasi (2026-10-01): *«bola robotga kod bilan buyruq yozadi, u esa hujum qiladi.
`move(10)` kabi, burilishlar graduslarda. Bir tarafda kod yozish qismi, ikkinchi tarafda maydon.
Har buyruqdan keyin Enter bosiladi va bajariladi. Bir nechta oʻquvchi yozadi, kim yutadi.»*

- **Yosh:** 12–16, Python bloki ichida (💻). Oʻyin aynan Python sintaksisiga tayanadi
  (`move(50)`, `if scan() > 0: fire()`), shuning uchun blok qoidasi buzilmadi. Kichik toifaga
  ochish kerak boʻlsa — `bosh.js` da bitta qator oʻzgaradi.
- **Birinchi bosqich:** yakka — robot tanklarga qarshi, internetsiz.
- **Ikkinchi bosqich (keyin):** onlayn xona, bir nechta oʻquvchi (`umumiy/js/onlayn.js` va togʻ protokoli).

## Buyruqlar — haqiqiy Python

Yangi til oʻylab topilmaydi: bola Python blokida oʻrgangan sintaksis shu yerda ish beradi.

| Buyruq | Nima qiladi |
| --- | --- |
| `move(n)` | oldinga n qadam (toʻsiqqa tegsa — toʻxtaydi) |
| `back(n)` | orqaga n qadam |
| `left(gradus)` / `right(gradus)` | burilish |
| `fire()` | oʻq uzish (oʻq qolmasa — boʻsh bosiladi) |
| `reload()` | oʻq toʻldirish (bir navbat ketadi) |
| `scan()` | qarshidagi dushmangacha masofa; koʻrinmasa −1 |
| `hp()` / `ammo()` | oʻz joni va oʻqi |

Shuning uchun sikl va shart ham ishlaydi:

```python
for i in range(4): move(10); right(90)
if scan() > 0: fire()
```

## Asosiy qaror: bir satr — bir navbat

Bola satr yozib Enter bosadi. Shu satr **toʻliq bajariladi** (sikl ham), keyin **robotlar bir
harakat qiladi**. Shundan keyin yana bolaning navbati.

Satr ichida koʻpi bilan **8 ta harakat** boʻlishi mumkin — aks holda bitta uzun sikl bilan jangni
yutib olish mumkin boʻlardi. Chegaradan oshsa, qolgani bajarilmaydi va ogohlantirish chiqadi.

**Dastur maydonni oʻzgartirgani sayin natija yozib boriladi** (harakatlar roʻyxati), ekran esa
shu roʻyxatni keyin animatsiya qilib koʻrsatadi. Shuning uchun:

- `scan()` haqiqiy holatni oʻqiydi (dastur bajarilayotgan paytdagi),
- butun jang mantiqi **Node testlarida** tekshiriladi (ekransiz),
- animatsiya mantiqqa taʼsir qilmaydi.

## Maydon va jang qoidalari

- Maydon — tekis tekislik (600 × 400 birlik), chetlari devor; ichida toʻsiq bloklari.
- Tank — radiusi 14 birlik doira; burchak graduslarda, 0° — oʻngga.
- `fire()` — oʻq qarshi tomonga 300 birlikgacha uchadi; tankka tegsa **1 jon** oladi,
  toʻsiqqa tegsa toʻxtaydi.
- Jon: har tankda **3 ta**. Oʻq: **3 ta**, `reload()` bilan toʻldiriladi.
- Gʻolib — dushmanning joni tugaganda. Bola joni tugasa — qaytadan urinadi.

## Bosqichlar

1. **Boshqaruv** — dushman yoʻq: belgilangan nuqtaga borish (`move`, `left`, `right`).
   Toʻsiqni aylanib oʻtish. Bu yerda gradus va masofa tushuniladi.
2. **Nishon** — qimirlamaydigan nishonni urish: `scan()` bilan masofani oʻlchash, burilib otish.
3. **Jang** — harakatlanadigan robot tank bilan jang; keyin ikkitasi bilan.

## Robot tanklar (oddiy AI)

- **Posbon**: joyida turadi, bola koʻrinsa otadi.
- **Ovchi**: bolaga qarab buriladi, yaqinlashadi, oʻqi boʻlsa otadi, boʻlmasa `reload`.

Robotning qarori — sof funksiya (`robotHarakati`), shuning uchun test bilan qulflanadi.

## Dvigatelga kerak boʻlgan kichik kengaytma

Talqinchiga **tashqi funksiya** qoʻshish kerak (`move`, `fire` …). `python.run/trace` ga
`tashqi: { nom: funksiya }` beriladi; `builtins.js` oʻzgarmaydi, shuning uchun boshqa oʻyinlarga
taʼsir qilmaydi. Bu — Python blokidagi talqinchining birinchi kengaytmasi.

## Fayllar

- `js/jang.js` — maydon, tank, oʻq, robot AI (sof mantiq, ekransiz).
- `js/logic.js` — bosqichlar/vazifalar va tekshiruv.
- `js/scenes/*` — ekran: chap tarafda maydon, oʻng tarafda kod satri va tarix.
- `tests/` — jang qoidalari va robot qarorlari.

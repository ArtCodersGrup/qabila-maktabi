# 08 — Sehrli qutilar: dizayn

**Mavzu:** Sunʼiy intellekt — mukofot bilan o'rganish (robot o'ynab o'rganadi)
**Yosh:** 8–12
**Taxminiy davomiyligi:** 20–25 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-21)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Oldingi AI o'yinlari: `06` misollardan o'rganish, `07` til modeli.

> Robot toshlar o'yinini o'ynamoqchi, lekin qoidani bilmaydi. Uning "miyasi" — **munchoqli qutilar**.
> Yutsa — munchoq qo'shamiz, yutqazsa — olamiz. Bir necha o'yindan keyin robot yutqazmay qo'yadi.
> (Bu haqiqiy tajriba: 1961-yilda gugurt qutilari bilan qilingan.)

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. Mashina **o'ynab, xato qilib** o'rganishi mumkinligini biladi (misollarsiz ham).
2. Robotning "miyasi" ochiq ekanini ko'radi: har holat uchun bitta **quti**, har yurish uchun **munchoq**.
3. **Mukofot** qoidasini aytadi: yutsa — munchoq qo'shiladi, yutqazsa — olinadi.
4. Ko'p munchoq — ko'p tanlanadi: robot **ehtimolni o'zgartirib** o'rganadi.
5. O'yindan o'yinga robotning **yutuqlari ko'payishini** grafikda ko'radi.
6. Mukofot noto'g'ri qo'yilsa, robot **noto'g'ri narsani** o'rganishini biladi.

## 2. O'yin qoidasi (toshlar o'yini)

- Stolda **7 ta tosh**. Navbat bilan **1 yoki 2 ta** tosh olinadi.
- **Oxirgi toshni olgan yutadi.**
- **Robot birinchi** yuradi (shuning uchun to'g'ri o'ynasa yuta oladi: 3 ga karrali qoldirish).

## 3. Asboblar

- **O'yin stoli** — tepada **"Navbat: Robot / Navbat: SEN"**, o'rtada stoldagi toshlar (soni yozilgan), pastda ikki taraf: **Robot** va **Sen**. Olingan toshlar o'sha tarafga to'planadi, shuning uchun kim nechta olgani doim ko'rinib turadi.
- O'yin paytida ekranda **faqat bitta quti** (robot hozir ochayotgani) va undan tortilgan munchoq ko'rsatiladi; qutilar to'plami — tushuntirish, mukofot va o'qitish sahnalarida.
- **Qutilar:** har bir holat uchun bitta quti (7, 6, 5, 4, 3, 2, 1 tosh qolganda). Ichida **ko'k munchoq** = "1 ta ol", **sariq munchoq** = "2 ta ol"; sonlari yozilib turadi.
- **Tanlash:** robot qutini "silkitadi" va bitta munchoqni tortadi (ehtimol munchoqlar soniga mos).
- **Mukofot paneli:** o'yin oxirida ishlatilgan qutilar yonadi, munchoq qo'shiladi (+1) yoki olinadi (−1, kamida 1 qoladi).
- **Natija chizig'i:** oxirgi o'yinlar `✓ ✗ ✓ ✓ ✓` ko'rinishida.

## 4. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (robot o'ynashni xohlaydi)
   ├─► 1-bosqich: Oʻyin va qutilar  [qoida → 1 oʻyin (robot tasodifiy) → qutilar qanday ishlaydi → mashq 3]
   ├─► 2-bosqich: Mukofot           [2 oʻyin, har biridan keyin mukofot → munchoqlar oʻzgaradi → mashq 3]
   └─► 3-bosqich: Robot kuchayadi   [20 oʻyin tez oʻtadi → yutuqlar koʻpaydi → bola oʻynab koʻradi → mashq 3 → hikoya] → tabrik
```

**Kirish:** "Robot oʻyin oʻynamoqchi!" / (Shogird) "Unga qoidani aytamizmi?" / "Yoʻq. U oʻynab, xato qilib oʻrganadi."

## 5. 1-bosqich: O'yin va qutilar

1. **Qoida:** 7 ta tosh, navbat bilan 1 yoki 2 ta olinadi, oxirgi toshni olgan yutadi. Robot birinchi yuradi.
2. **Bitta o'yin:** robot har yurishda qutini ochadi — munchoqlar teng, shuning uchun tasodifiy tanlaydi. Bola "1 ta ol" yoki "2 ta ol" tugmasini bosadi.
3. **Ta'rif:** "Har holat uchun bitta quti. Koʻk munchoq — 1 ta ol, sariq — 2 ta ol. Robot qaysi munchoq koʻp boʻlsa, oʻshani koʻproq tanlaydi."
4. **Mashq** (3 ta to'g'ri): "Hozir {5} tosh qoldi — robot qaysi qutini ochadi?" (qutilar tugmasi) yoki "Robot {sariq} munchoq tortdi — nechta tosh oladi?" (1 / 2).

## 6. 2-bosqich: Mukofot

1. **O'yin + mukofot:** o'yin tugagach ishlatilgan qutilar yonadi. Yutsa: "+1 munchoq" (bola "Mukofot ber"ni bosadi). Yutqazsa: "−1 munchoq".
2. Yana bitta o'yin — munchoqlar o'zgargani ko'rinadi.
3. **Ta'rif:** "Yutgan yurishlar koʻpayadi, yutqazgan yurishlar kamayadi. Robot shunday oʻrganadi."
4. **Mashq** (3 ta to'g'ri): "Robot yutdi — ishlatgan munchoqlariga nima boʻladi?" (qoʻshiladi / olinadi / oʻzgarmaydi); "Robot yutqazdi — {5} li qutidan qaysi munchoq olinadi?" (u tanlagani).

## 7. 3-bosqich: Robot kuchayadi

1. **Tez o'qitish:** robot **40 marta** o'ynaydi, raqibi — **o'yinni biladigan murabbiy** (`smartOpponent`). Kuchli raqib har xatoni jazolagani uchun robot tezroq o'rganadi (o'lchandi: 20 o'yin + tasodifiy raqib → ehtiyotkor bola bilan 44% yutuq; 40 o'yin + murabbiy → 80%). O'yinlar tez o'tadi, natija chizig'i to'ladi, munchoqlar o'sib boradi.
2. **Taqqoslash:** boshidagi va oxiridagi 10 o'yin yutuqlari: `3 / 10` → `9 / 10`.
3. **Bola o'ynaydi:** endi robotni yutish qiyin (robot birinchi yurganda deyarli imkonsiz).
4. **Qayta o'yin — bola birinchi yuradi:** Oqsoqol sirni aytadi ("robotga 6, 3 yoki 0 qoldir") va bola uni qo'llab yutadi. Bo'lim bolaning g'alabasi bilan tugaydi.
5. **Mashq** (3 ta to'g'ri): "Qutida koʻk {6} ta, sariq {1} ta — robot koʻpincha nima qiladi?"; "{5} tosh qolganda nechta olsa yutadi?" (3 ga karrali qoldirish).
6. **Hikoya:**
   1. (gugurt qutilari) "1961-yilda olim 304 ta gugurt qutisi bilan shunday mashina yasagan."
   2. (o'yin taxtasi) "Kompyuterlar shaxmat va Go'ni ham shunday — oʻynab, mukofot olib oʻrgangan."
   3. (yuradigan robot) "Robotlar yurishni ham shunday oʻrganadi: har urinishdan keyin mukofot."
   4. (mukofot) "Mukofot notoʻgʻri qoʻyilsa, robot notoʻgʻri narsani oʻrganadi — shuning uchun odam ehtiyot boʻladi."

**Tabrik:** "Tabriklayman! Endi sen robotni mukofot bilan oʻrgata olasan!" — "Har holat uchun quti, har yurish uchun munchoq", "Yutsa — qoʻshiladi, yutqazsa — olinadi", "Mukofot qanday boʻlsa — xulq shunday".

## 8. Ekran tuzilishi

3 zona. Ish maydonida: toshlar qatori, qutilar (faqat keraklilari), natija chizig'i. Boshqaruvda: "1 ta ol" / "2 ta ol", "Mukofot ber", "20 marta oʻyna" yoki javob tugmalari.

## 9. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `js/boxes.js` | Sof hisob: o'yin qoidasi, qutilar va munchoqlar, tanlash, mukofot, avtomatik o'qitish, topshiriqlar. Node testlari. |
| `js/game-art.js` | Quti, munchoq, tosh, hikoya rasmlari |
| `js/boxes-ui.js` | Toshlar qatori, qutilar, munchoqlar, natija chizig'i, tugmalar |
| `js/scenes/*.js` | Bosqichlar, mashqlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `sehrli-qutilar:v1`) |

## 10. Bu o'yinga kirmaydi

Uch qatorli Nim, shaxmat/Go, Q-learning formulalari, "epsilon" va "discount" atamalari, robotning ichki ehtimol jadvali raqamlar bilan (faqat munchoqlar soni).

# 04 — Qabila chiroqlari: dizayn

**Mavzu:** Ikkilik kod — chiroqlar, bitlar, ikkilik sonlar
**Yosh:** 8–12
**Taxminiy davomiyligi:** 20 daqiqa
**Holati:** tasdiqlangan (2026-09-19, muallif dizaynni to'liq menga topshirdi)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Oldingi o'yinlar: `01` kodlash (aⁱ), `02` Morze, `03` Sezar shifri.

> Qabilaga elektr chiroqlari keldi. Tog' ortidagi qo'shni qabilaga tunda uzoqdan xabar yuborish kerak — lekin qanday?

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. n ta oddiy chiroq (o'chiq/yoniq) bilan 2ⁿ ta har xil naqsh yasash mumkinligini biladi va barcha naqshlarni tartib bilan topadi (kichik holatlarda).
2. Naqshlar jadvali (kod) yordamida xabarni o'qiydi va yuboradi.
3. 4-2-1 (8-4-2-1) qiymatlari bilan ikkilik sonni o'nlik songa aylantiradi va aksincha.
4. Chiroq ko'p holatli bo'lsa (rangli), naqshlar soni holatlarⁿ bo'lishini biladi.
5. N ta narsa uchun eng kamida nechta chiroq kerakligini topadi.
6. Kompyuterdagi bit, bayt va ekrandagi rangli nuqtalar chiroqlarga o'xshashini biladi.

## 2. Qahramonlar

Oqsoqol va Shogird (`umumiy/`). Shogird chiroqlarni yoqadi, Oqsoqol tushuntiradi.

## 3. Asboblar

- **Chiroq** — bosiladigan tugma (≥ 64×76 px). Har bosishda keyingi holat: oddiy — o'chiq → yoniq → o'chiq; rangli — o'chiq → sariq → ko'k → o'chiq.
- **Naqsh** — chiroqlar qatori (kichik, faqat ko'rish uchun).
- **Naqshlar devori** — topilgan naqshlar (ostida ma'no yoki son).
- **Kod jadvali** — 8 ta naqsh va ma'nolari (2 ustun). Naqsh ikkilik son sifatida ma'no raqamini beradi: `000` Tinchlik, `001` Suv, `010` Olov, `011` Ov, `100` Yomgʻir, `101` Mehmon, `110` Xavf, `111` Bayram.
- 2-bosqichda chiroqlar ustida **qiymatlar** (4 2 1), ostida **1/0**, pastida jonli yig'indi: "Hozir: 4 + 1 = 5".

## 4. O'yin oqimi

```
Bosh ekran
   ├─► Kirish
   ├─► 1-bosqich: Chiroq naqshlari   [1 chiroq → 2 chiroq (4 naqsh) → 3 chiroq (8 naqsh) → ta'rif → mashq 3]
   ├─► 2-bosqich: Ikkilik sonlar     [4-2-1 → "5 ni yasa" → ta'rif → mashq 3]
   └─► 3-bosqich: Rangli chiroqlar   [2 rangli chiroq (9 naqsh) → ta'rif → mashq 3 → hikoya] → tabrik
```

**Kirish:** "Qabilaga elektr chiroqlari keldi!" / (Shogird) "Qoʻshni qabila togʻ ortida. Tunda ularga qanday xabar yuboramiz?" / "Chiroqlar bilan! Kel, oʻrganamiz."

## 5. 1-bosqich: Chiroq naqshlari

1. **1 chiroq.** Bola chiroqni yoqib-o'chirib ko'radi. Oqsoqol: "Yoniq — «Keling», oʻchiq — «Kelmang». Faqat 2 ta xabar — bu kam!"
2. **2 chiroq.** Bola naqsh yasab "Saqlash"ni bosadi; har yangi naqsh devorga tushadi, takror — "Bu naqsh bor edi!". "Yordam" — yetishmayotgan naqshni chiroqlarga qo'yadi. 4 tasi topilganda: "2 ta chiroq — 4 ta naqsh."
3. **3 chiroq.** Xuddi shunday, har naqsh ostida ma'nosi chiqadi. 8 tasi topilganda: "3 ta chiroq — 8 ta naqsh. Har biriga maʼno berdik!"
4. **Ta'rif:** `1 chiroq: 2`, `2 chiroq: 2 × 2 = 4`, `3 chiroq: 2 × 2 × 2 = 8`; "Har bir chiroq 2 xil boʻladi. Chiroqlar soni qancha boʻlsa, 2 ni shuncha marta koʻpaytiramiz." / "1-oʻyindagi harflarni esla — xuddi shunday!"
5. **Mashq** (3 ta to'g'ri; kod jadvali ko'rinib turadi), tasodifiy ikki xil:
   - **O'qish:** "Qoʻshni qabila chiroq yoqdi. Nima deyapti?" — katta naqsh, pastda 8 ta ma'no tugmasi.
   - **Yuborish:** "Qoʻshni qabilaga «Xavf» deb yubor." — bola 3 ta chiroqni yoqadi, "Yuborish".
   - 1-xato: jadvalda kerakli qator yonadi ("Jadvalga qara."). 2-xato: to'g'ri javob ko'rsatiladi, yangi misol.

## 6. 2-bosqich: Ikkilik sonlar

1. Oqsoqol: "Chiroqlar bilan son ham yuborsa boʻladi!" Chiroqlar ustida 4 2 1.
2. "Har bir chiroqning oʻz qiymati bor. Yoniq chiroqlar qiymatini qoʻshamiz." Topshiriq: "5 ni yasa." — bola to'g'ri naqshni yoqquncha (jonli yig'indi yordam beradi).
3. **Ta'rif:** "Yoniq — 1, oʻchiq — 0. Kompyuter 5 ni 101 deb yozadi — bu ikkilik son." / "Esingdami, «Mehmon» naqshi? U — 101, yaʼni 5!"
4. **Mashq** (3 ta to'g'ri): 1–2-misol 3 ta chiroq (1–7), 3-misol 4 ta chiroq (8 4 2 1, 1–15). Tasodifiy:
   - **Naqsh → son:** raqam klaviaturasida javob. 1-xato: "4 + 1 = ?" ko'rinadi. 2-xato: "4 + 1 = 5".
   - **Son → naqsh:** bola chiroqlarni yoqadi, "Yuborish". 1-xato: "Eng katta qiymatli chiroqdan boshla." 2-xato: to'g'ri naqsh ko'rsatiladi.

## 7. 3-bosqich: Rangli chiroqlar

1. "Qabilaga rangli chiroqlar keldi: oʻchiq, sariq, koʻk — 3 xil!" Bola 2 ta rangli chiroq bilan 9 ta naqsh topadi. "2 ta rangli chiroq — 9 ta naqsh: 3 × 3."
2. **Ta'rif:** jadval — `oddiy: 2, 4, 8, 16` / `rangli: 3, 9, 27, 81` (1–4 chiroq). "Holatlar sonini chiroqlar sonicha koʻpaytiramiz. Holat koʻp boʻlsa — chiroq kam kerak."
3. **Mashq** (3 ta to'g'ri): "{29 ta harf} uchun eng kamida nechta {oddiy / rangli} chiroq kerak?" — raqam klaviaturasi. Narsalar: 29 ta harf, 10 ta raqam, 12 ta oy, 7 ta hafta kuni, 20 ta hayvon, 50 ta soʻz. 1-xato: `1 ta: 2`, `2 ta: 4`… jadvali (belgisiz). 2-xato: jadval ✓/— bilan va yangi misol.
4. **Hikoya** (rasm + 1–2 pufak):
   1. "Kompyuterda millionlab juda kichik «chiroqlar» bor — ular bit deyiladi." / "Yoqilgan — 1, oʻchgan — 0."
   2. "8 ta bit — 1 bayt." / "U 256 xil boʻladi: 2 ni 8 marta koʻpaytiramiz."
   3. "Ekrandagi har bir nuqta — 3 ta kichik chiroq: qizil, yashil va koʻk."
   4. "Har biri 256 xil yorugʻlikda yonadi." / "Shuning uchun ekran millionlab rangni koʻrsata oladi!"

**Tabrik:** "Tabriklayman! Endi sen chiroqlar tilini bilasan!" — "n ta chiroq — 2ⁿ ta naqsh", "Yoniq — 1, oʻchiq — 0: ikkilik son", "Holat koʻp boʻlsa — chiroq kam kerak".

## 8. Ekran tuzilishi

1–2-o'yindagi 3 zona (qo'llanma zonasi yo'q). Ish maydonida chiroqlar va jadval/devor, boshqaruvda tugmalar (Saqlash/Yordam, Yuborish, ma'no tugmalari 4×2, raqam klaviaturasi). Chiroqlar paytida ixcham rejim (qahramonlar kichik).

## 9. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `js/lamps.js` | Sof hisob: naqshlar, ikkilik ↔ son, 4-2-1 qiymatlar, eng kamida nechta chiroq, ma'nolar, topshiriqlar. Node testlari. |
| `js/game-art.js` | Chiroq SVG (holatlar), hikoya rasmlari |
| `js/lamps-ui.js` | Chiroqlar qatori, naqsh, devor, kod jadvali, ma'no tugmalari |
| `js/scenes/common.js` | Naqshlarni topish, mashq sikli, urinishlar |
| `js/scenes/stage1.js`, `stage2.js`, `stage3.js`, `final.js` | Bosqichlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `qabila-chiroqlari:v1`) |

## 10. Tekshiruv

Avtomatik testlar (`lamps.js`, rasmlar, `main.js`), barcha o'yinlar testlari, brauzerda to'liq o'ynab chiqish (telefon tik, yotiq, kompyuter), yakuniy kod ko'rigi.

## 11. Bu o'yinga kirmaydi

Harflarni chiroq bilan yuborish (faqat "nechta chiroq kerak" savolida), sakkizlik/o'n oltilik sanoq, chiroqlarni ketma-ket (vaqt bo'yicha) yuborish.

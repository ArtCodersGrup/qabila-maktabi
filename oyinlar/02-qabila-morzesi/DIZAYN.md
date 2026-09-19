# 02 — Qabila Morzesi: dizayn

**Mavzu:** Ma'lumotlarni kodlash — Morze alifbosi
**Yosh:** 8–12
**Taxminiy davomiyligi:** 20 daqiqa
**Holati:** dizayn — muallif tasdig'ini kutmoqda

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). 1-o'yinning davomi: [`../01-qabila-kodlari/DIZAYN.md`](../01-qabila-kodlari/DIZAYN.md).

> 1-o'yinda qabila 2 ta belgi (tak/dum) bilan so'z yasashni o'rgandi va "so'zlar har xil uzunlikda bo'lsa, orasiga pauza kerak" degan xulosaga keldi.
> 2-o'yinda qabila aynan shunday alifboni — **Morze alifbosini** — o'rgangan va biz bilan gaplashmoqchi.

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. Morze alifbosida har bir harf `·` va `—` dan tuzilgan kod ekanini biladi.
2. Qo'llanma yordamida Morze xabarini (3–6 harfli so'z) o'qiy oladi.
3. Qo'llanma yordamida so'zni Morze bilan yoza oladi, harflar orasiga pauza qo'yib.
4. Harflar orasidagi pauza nega kerakligini tushuntiradi (kodlar har xil uzunlikda).
5. Nega eng ko'p ishlatiladigan harfga eng qisqa kod berilganini tushuntiradi.
6. Morze qayerlarda ishlatilganiga kamida 2 ta misol keltiradi (telegraf, SOS, chiroq, radio).

## 2. Qahramonlar va hikoya

1-o'yindagi **Oqsoqol** va **Shogird**, 1-o'yindagi **baraban**. Shogird xabarlarni barabanda chaladi (qisqa zarb — `·`, uzun zarb — `—`), Oqsoqol tushuntiradi.
Qahramonlar va baraban `oyinlar/umumiy/` dan olinadi (13-bo'lim).

## 3. O'yin oqimi

```
Bosh ekran
   │
   ├─► Kirish sahnasi (1-o'yin bilan bog'lanish, 3 ta pufak)
   │
   ├─► 1-bosqich: O'qish     [ko'rsatish → ta'rif → mashq: 3 ta xabar]
   │
   ├─► 2-bosqich: Yozish     [ko'rsatish → mashq: 3 ta topshiriq → XAYR]   (1-bosqichdan keyin ochiladi)
   │
   └─► 3-bosqich: Hikoya     [6 ta sahna → SOS ni terish → tabrik]          (2-bosqichdan keyin ochiladi)
```

**Bosh ekran** 1-o'yindagidek: o'yin nomi, 3 ta bosqich kartasi (yopiq 🔒 / ochiq / tugagan ✓), "Boshlash", ovoz tugmasi.
Tugagan bosqich kartasini bosish — faqat shu bosqichni qayta o'ynash, keyin bosh ekran.
`?bosqich=N` — shu bosqichdan boshlash (o'qituvchi va sinov uchun).

**Kirish sahnasi:**
1. Oqsoqol: "Esingdami, Shogird barabanda tak-dum chalgan edi?"
2. Oqsoqol: "Endi biz qisqa va uzun zarblar bilan gaplashamiz. Bu — Morze alifbosi."
3. Shogird: "Men xabar chalaman, sen oʻqiysan!"

---

## 4. Harflar to'plamlari va qo'llanma

Qo'llanmada **faqat ochilgan harflar** ko'rinadi. Harflar asta-sekin ochiladi:

| To'plam | Qo'shiladigan harflar | Jami | Qachon ochiladi |
|---|---|---|---|
| 1 | A E I L M N O S T | 9 | 1-bosqich boshida |
| 2 | H K R U | 13 | 1-bosqichdagi 2-to'g'ri javobdan keyin |
| 3 | B D Q V X Y Z | 20 | 2-bosqich boshida |

Yangi harflar ochilganda Oqsoqol aytadi: "Qabila yangi harflarni oʻrgandi!" va ular qo'llanmada qisqa miltillaydi.

**Kodlar** (xalqaro Morze):

| Harf | Kod | Harf | Kod | Harf | Kod | Harf | Kod |
|---|---|---|---|---|---|---|---|
| A | `·—` | H | `····` | O | `———` | V | `···—` |
| B | `—···` | I | `··` | Q | `——·—` | X | `—··—` |
| D | `—··` | K | `—·—` | R | `·—·` | Y | `—·——` |
| E | `·` | L | `·—··` | S | `···` | Z | `——··` |
| | | M | `——` | T | `—` | | |
| | | N | `—·` | U | `··—` | | |

- `oʻ`, `gʻ`, `ng` uchun standart Morze kodi yo'q — so'zlar ro'yxatida ular **ishlatilmaydi**. `sh`, `ch` — ikki harf (S+H, C+H).
- Qo'llanma — jadval: har bir katakda harf va uning kodi. Harflar alifbo tartibida.
- Nuqta va chiziq matn emas, **chizilgan shakl**: nuqta — doira, chiziq — uzun to'rtburchak (telefonda ham aniq ko'rinsin).

---

## 5. 1-bosqich: O'qish

### 5.1. Ko'rsatish
1. Shogird barabanda **qisqa** zarb chaladi → ekranda `·` chiqadi. Oqsoqol: "Qoʻllanmadan shu kodni top va harfini bos."
2. Bola qo'llanmadagi **E** ni bosadi → katakka `E` tushadi. Oqsoqol: "Toʻgʻri! Qisqa zarb — E harfi."
3. Xuddi shunday **uzun** zarb → `—` → bola **T** ni bosadi.
4. Noto'g'ri harf bosilsa: shu katak silkinadi, Oqsoqol: "Kodni diqqat bilan solishtir." Bola yana tanlaydi.

### 5.2. Ta'rif
1. Oqsoqol: "Har bir harfning oʻz kodi bor. Kod nuqta va chiziqlardan tuzilgan."
2. Ekranda `SALOM` misoli: har bir harf ustida uning kodi, guruhlar orasida bo'sh joy.
3. Oqsoqol: "Kodlar har xil uzunlikda. Shuning uchun harflar orasida pauza qoʻyamiz — 1-oʻyinda buni koʻrgan edik!"
4. Oqsoqol: "E va T ning kodi eng qisqa. Nega? Buni hikoyada bilib olasan."
5. Oqsoqol: "Soʻzlar orasida esa uzunroq pauza boʻladi." (Ekranda: `SALOM / OTA` — faqat ko'rsatiladi, mashqda xabarlar bitta so'zdan iborat.)

### 5.3. Mashq
- Qabila xabar yuboradi. Xabar **harflar bo'yicha guruhlarga bo'lingan** holda chiqadi: `···` `·—` `·—··` `———` `——`.
- Har bir guruh ostida bo'sh katak. **Navbatdagi katak** yonib turadi.
- Bola qo'llanmadagi harfni bossa — harf navbatdagi katakka tushadi, navbat keyingi katakka o'tadi.
- To'lgan katakni bossa — shu katak navbatdagi bo'ladi (harfini almashtirish uchun).
- Hamma katak to'lgach — **"Tekshir"** tugmasi faollashadi.
- **"Tinglash"** tugmasi: xabar qisqa/uzun signallar bilan chalinadi (ixtiyoriy yordam).
- **3 ta to'g'ri javob** — bosqich tugaydi. Tepada 3 ta doira.

**Xabarlar:**

| Qaysi xabar | Qayerdan |
|---|---|
| 1-to'g'ri javobgacha | har doim **SALOM** |
| 2-to'g'ri javobgacha | 1-to'plam so'zlaridan tasodifiy |
| 3-to'g'ri javobgacha | 2-to'plam so'zlaridan tasodifiy (2-to'plam harflari shu paytda ochiladi) |

- 1-to'plam so'zlari: OTA, ONA, NON, MEN, NIMA, OLMA, LOLA, ASAL, TAOM, SOAT, ILON, ISM
- 2-to'plam so'zlari (kamida bitta yangi harf bor): KUN, TUN, SUT, RASM, KALIT, KOSA, TOSH, SHER, MUSHUK, RAHMAT
- Bir xil so'z ketma-ket ikki marta chiqmaydi.

**Xato bo'lganda (QOIDALAR 4.4):**
- 1-xato — noto'g'ri katak(lar) `↻` bilan belgilanadi va bo'shatiladi; to'g'ri katak(lar) qoladi. Oqsoqol: "Belgilangan harflarni qaytadan top."
- 2-xato — to'g'ri so'z ko'rsatiladi (har bir guruh ostida to'g'ri harf), keyin **o'sha to'plamdan** yangi xabar. Xato qilingan xabar hisobga olinmaydi.

---

## 6. 2-bosqich: Yozish

### 6.1. Ko'rsatish
1. Oqsoqol: "Endi sen javob yozasan. Qabila yana yangi harflarni oʻrgandi!" — 3-to'plam ochiladi.
2. Morze klaviaturasi tanishtiriladi: `·`, `—`, **"harf oralig'i"**, **⌫**, **"Yuborish"**.
3. Birgalikda misol: "E" ni yoz → bola `·` ni bosadi → "Yuborish" → Shogird: "Men oʻqidim: E!"

### 6.2. Mashq
- Qabila savol beradi va qanday javob berishni aytadi. Pufakda: `Qabila soʻraydi: «{savol}» Javob ber: {JAVOB}.`
- Bola klaviatura bilan teradi. Terilgani ekranda guruhlar bo'lib ko'rinadi (`····` `·—`).
- "harf oralig'i" — joriy harfni yopib, keyingisini boshlaydi. Ketma-ket ikki marta bosilsa ham bitta oraliq hisoblanadi.
- ⌫ — oxirgi belgini (yoki oxirgi oraliqni) o'chiradi.
- "Yuborish" — bo'sh bo'lsa hech narsa qilmaydi. Yuborilgach Shogird terilganni **o'qiydi**: har bir guruh ostida qaysi harf chiqqani ko'rinadi (kodi yo'q guruh — `?`).
- Qo'llanma (20 harf) doim ko'rinib turadi.
- **3 ta to'g'ri javob** — keyin yakun: qabila **XAYR** yuboradi, bola uni 1-bosqichdagidek o'qiydi (baholanmaydi, xato bo'lsa to'g'ri javob ko'rsatiladi).

**Topshiriqlar** (tasodifiy, ketma-ket takrorlanmaydi):

| Savol | Javob |
|---|---|
| Kim Morzeni oʻrganyapti? | MEN |
| Kechasi osmonda nima chiqadi? | OY |
| Morze senga yoqdimi? | HA |
| Tushlikka nima yeding? | OSH |
| Chanqasang nima ichasan? | SUV |
| Mushuk nima ichadi? | SUT |
| Nonvoy nima yopadi? | NON |
| Quyosh chiqsa kun boʻladimi yoki tun? | KUN |
| Sen kimsan? | BOLA |
| Osmonda nima uchadi? | QUSH |
| Qaysi faslda eng issiq? | YOZ |
| Tovuq nima yeydi? | DON |

**Xato bo'lganda:**
- 1-xato — noto'g'ri guruhlar `↻` bilan belgilanadi, qo'llanmada javobdagi harflar yonib turadi. Bola terganini tuzatib, qayta yuboradi (terilgani o'chmaydi).
- 2-xato — to'g'ri kod ko'rsatiladi (har bir harf ustida kodi), keyin yangi topshiriq. Xato qilingan topshiriq hisobga olinmaydi.

---

## 7. 3-bosqich: Hikoya

*(Sahnalar baholanmaydi. Har bir sahnada rasm va 1–2 pufak, bola "Davom" bilan o'tadi.)*

| # | Rasm | Oqsoqol aytadi |
|---|---|---|
| 1 | Telegraf apparati va sim | "Taxminan 180 yil oldin Samuel Morze telegraf uchun shu alifboni oʻylab topdi." / "Xabar sim orqali boshqa shaharga bir zumda yetib borardi." |
| 2 | Harflar va ularning kodlari (E, T — eng qisqa) | "Eng koʻp ishlatiladigan harfga eng qisqa kod berildi. Ingliz tilida bu — E." / "Shunda xabar tezroq yuboriladi. Buni **siqish** deyishadi." |
| 3 | Kema va to'lqinlar | "Kema xavfda qolsa, SOS signalini yuboradi." / "SOS — `··· ——— ···`. Uni hamma taniydi." |
| 4 | Mayoq va chiroq | "Kemalar Morzeni chiroq bilan ham yuboradi: qisqa va uzun yorugʻlik." |
| 5 | Radio va samolyot | "Bugun ham radio havaskorlari Morzeda gaplashadi." / "Samolyotlarga yoʻl koʻrsatadigan radiomayoqlar oʻz nomini Morze bilan aytadi." |
| 6 | Ko'z | "Gapira olmaydigan odamlar koʻz qisib yoki barmoq bilan urib Morzeda gaplasha oladi." |

Sahna 3 va 4 da "Tinglash": SOS signal bo'lib chalinadi / chiroq qisqa-uzun yonadi.

**Yakun:** Oqsoqol: "Endi sen ham SOS ni yoza olasan. Ter!" — 2-bosqichdagi klaviatura bilan **SOS** teriladi (xato qoidasi 6.2 dagidek). Keyin **tabrik ekrani**: 3 ta xulosa —
- "`·` va `—` — Morze alifbosi"
- "Eng koʻp ishlatiladigan harf — eng qisqa kod"
- "SOS — yordam signali"
va "Qayta oʻynash", "Bosh ekran" tugmalari.

---

## 8. Ekran tuzilishi

1-o'yindagi 3 zona (sahna, ish maydoni, boshqaruv) + **qo'llanma**.

| Holat | Qo'llanma qayerda | Qolganlari |
|---|---|---|
| Telefon tik | Ekran pastida, 4–5 ustunli jadval | Sahna ixcham (qahramonlar kichik), ish maydoni o'rtada |
| Telefon yotiq, kompyuter | **O'ng chekkada** alohida ustun | Chapda sahna, o'rtada ish maydoni va boshqaruv |

- 1-bosqichda qo'llanma — **klaviatura** (harflari bosiladi). 2- va 3-bosqichda — faqat ko'rish uchun, pastda Morze klaviaturasi.
- Qo'llanma katagi kamida 48×48 px, harf 20 px dan kichik emas.
- Xabar guruhlari sig'masa, qatorga o'tadi (gorizontal scroll yo'q).

## 9. Tovush

- "Tinglash": xabar Morze signallari bilan chalinadi. Birlik — 120 ms: nuqta 1 birlik, chiziq 3 birlik, belgilar orasida 1, harflar orasida 3 birlik pauza. Chalinayotgan guruh ekranda yonadi.
- Baraban zarblari (kirish, ko'rsatish) — 1-o'yindagi `tak`/`dum` ovozlari.
- Ovoz o'chirilgan bo'lsa, "Tinglash" faqat guruhlarni yondiradi (ovozsiz).

## 10. Kutilmagan holatlar

1-o'yin 11-bo'limidagi hamma holatlar, qo'shimcha:

| Holat | Nima bo'ladi |
|---|---|
| Hamma katak to'la, qo'llanmadan harf bosildi | Hech narsa (avval katakni tanlash kerak) |
| Morze klaviaturasida juda uzun terish | Ko'pi bilan 40 ta belgi qabul qilinadi |
| Kodi yo'q guruh terildi (masalan, `·····`) | O'qishda `?` chiqadi, xato hisoblanadi |
| "Tinglash" chalinayotganda yana bosildi | Avvalgisi to'xtab, qaytadan boshlanadi |
| Bosh ekranga qaytildi | Chalinayotgan signal to'xtaydi |

## 11. Kod tuzilishi

Hammasi `oyinlar/02-qabila-morzesi/` ichida, umumiy qismlar `oyinlar/umumiy/` dan (13-bo'lim):

| Fayl | Vazifasi |
|---|---|
| `index.html` | Sahifa; avval `../umumiy/` skriptlari, keyin o'yinniki |
| `css/style.css` | Faqat shu o'yinga xos uslublar (qo'llanma, guruhlar, Morze klaviaturasi) |
| `js/morse.js` | **Sof hisob:** kodlar jadvali, so'zni kodlash va kodni o'qish, harf to'plamlari, so'zlar va topshiriqlar ro'yxati, tasodifiy xabar/topshiriq tanlash, javobni tekshirish. Node'da test qilinadi. |
| `js/game-art.js` | Hikoya rasmlari (SVG): telegraf, kema, mayoq, radio, ko'z |
| `js/morse-ui.js` | Nuqta/chiziq shakllari, xabar guruhlari + kataklar, qo'llanma jadvali, Morze klaviaturasi, "Tinglash" |
| `js/scenes/common.js` | O'qish va yozish mashqlari sikli (3 ta to'g'ri javob, xato qoidasi) |
| `js/scenes/stage1.js` | Kirish + 1-bosqich |
| `js/scenes/stage2.js` | 2-bosqich + XAYR |
| `js/scenes/stage3.js` | Hikoya + SOS |
| `js/scenes/final.js` | Bosqich tugashi, tabrik |
| `js/main.js` | Umumiy qobiqni (`umumiy/js/app.js`) shu o'yin sozlamalari bilan ishga tushiradi (saqlash kaliti: `qabila-morzesi:v1`) |
| `tests/morse.test.js` | `morse.js` testlari |

## 12. Tekshiruv

Muallif talabiga ko'ra oraliq brauzer tekshiruvlari **yo'q**:
1. **Avtomatik testlar** (`node --test`): `morse.js` — kodlar jadvali xalqaro standartga mos; kodlash↔o'qish teskari; har bir so'z faqat o'z to'plami (va oldingilari) harflaridan; 2-to'plam so'zlarida kamida bitta yangi harf; so'zlarda `oʻ`/`gʻ` yo'q; topshiriq javoblari 2–4 harfli va 3-to'plam harflari hammasi ishlatilgan; tasodifiy tanlashda ketma-ket takror yo'q; terilgan belgilarni guruhlarga ajratish (ortiqcha oraliqlar, oxirgi oraliq).
2. `umumiy/` testlari va **1-o'yin testlari** ham o'tishi shart (umumiy kod o'zgargani uchun).
3. **Yakuniy kod ko'rigi** (butun branch).
4. **Muallif** o'yinni o'zi ko'rib chiqadi (1-o'yin ham ishlashini).

## 13. Umumiy kodni chiqarish (`oyinlar/umumiy/`)

QOIDALAR 9-bo'limi bo'yicha, 2-o'yin boshlanganda ikkala o'yinga kerak kod umumiy papkaga chiqariladi:

| `oyinlar/umumiy/` ga ko'chadi | 1-o'yinda qoladi |
|---|---|
| `fonts/` (Nunito + OFL) | `js/logic.js` va testlari |
| `css/asos.css` — ranglar, shrift, zonalar, pufak, tugmalar, harf kartochkalari, raqam klaviaturasi, qahramonlar animatsiyasi | `css/style.css` — faqat 1-o'yinga xos (daraxt, devor, formula, odamlar) |
| `js/storage.js` — saqlash kaliti har o'yinda o'zi beriladi | — |
| `js/sound.js` — + signal ketma-ketligini chalish (Morze uchun) | — |
| `js/art.js` — Oqsoqol, Shogird, baraban, ikonkalar | `js/game-art.js` — so'zlar daraxti va kichik odam (1-o'yinniki) |
| `js/ui.js` — pufak, tugmalar, kataklar, klaviatura, progress | `js/scenes/` |
| `js/app.js` — bosh ekran, bosqichlar oqimi, ovoz tugmasi, `?bosqich=N` | `js/main.js` — faqat `QK.app.start({...})` |
| `tests/` — storage va rasmlar testlari | `tests/` — logic va daraxt testlari |

- 1-o'yinning saqlangan progressi yo'qolmaydi (kalit o'zgarmaydi: `qabila-kodlari:v1`).
- 1-o'yinning tashqi ko'rinishi va o'yini **o'zgarmaydi** — faqat fayllar joyi o'zgaradi.
- `index.html` ni ikki marta bosib ochish ikkala o'yinda ham ishlaydi (nisbiy yo'llar `../umumiy/...`).

## 14. Bu o'yinga kirmaydi

- Raqamlar va tinish belgilari Morzesi
- Bosib turish davomiyligi bilan terish (qisqa/uzun bosish) — faqat tugmalar
- Erkin (topshiriqsiz) javob yozish
- Diktor ovozi
- Kirill Morzesi, `oʻ`/`gʻ` kodlari
- Bir nechta so'zli xabarlarni o'qish/yozish (faqat ta'rifda ko'rsatiladi)

# Internet bloki — reja

**Holat (2026-10-05):** muallif qarori — 4 oʻyin, ikkala yosh toifasi (A — 8–11, B–D — 10–16), boʻlim «Parol va xavfsizlik» dan oldin.
Papkalar: 58 «Xabar boʻlaklari», 59 «Qabila manzillari», 60 «Paket yoʻli», 61 «Qulfli yoʻl» — har birining `DIZAYN.md` si yozildi.

Muallif tanlagan yoʻnalishlardan biri (2026-10-01): *«Internet qanday ishlaydi»* bloki.

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).
Qoʻshni bloklar: [`XAVFSIZLIK-BLOK.md`](XAVFSIZLIK-BLOK.md) (50–52), «Axborot oʻlchovi» (13–16),
«Kodlash va shifrlash» (01–03).

---

## 1. Nega bu blok kerak

Bola internetni **har kuni** ishlatadi, lekin uning uchun internet — ekranning tepasidagi Wi-Fi belgisi.
«Sayt ochilmadi», «sekin ishlayapti», «qulf yoʻq» — bularning hammasi sehr.

Saytda bu mavzu **umuman yoʻq.** Yaqin keladigan oʻyinlar bor, lekin boshqa savolga javob beradi:

| Bor | Nimani beradi | Nimani bermaydi |
|---|---|---|
| 02 Qabila Morzesi | xabar belgilarga aylanadi | xabar **qanday yetib boradi** |
| 13 Bayt sandigʻi | hajm: bit, bayt, kilobayt | hajm **qanchalik tez** oʻtadi |
| 03 Sezar maktubi | xabarni yashirish | yoʻlda kim oʻqishi mumkin |
| 50 Parol kuchi | parol qanchalik kuchli | parol **qayerga** yuboriladi |

Blok shu boʻshliqni toʻldiradi va bitta zanjir yasaydi: *xabar → boʻlaklar → manzil → yoʻl → server → qulf*.
Oxirgi bugʻin («qulf») toʻgʻridan-toʻgʻri xavfsizlik blokiga ulanadi.

Qoʻshimcha sabab: bu mavzu maktab informatika dasturining katta boʻlimi, lekin darslikda **rasmsiz**
beriladi — aynan shu yerda oʻyin eng koʻp foyda qiladi.

---

## 2. Mavzular (ajratilgan)

| № | Mavzu | Nima oʻrganiladi | Bolaga qanday koʻrsatiladi | Yosh |
|---|---|---|---|---|
| 1 | **Paket** | xabar boʻlaklarga boʻlinadi, har boʻlakda raqam va manzil bor, boʻlaklar alohida ketadi va oxirida yigʻiladi; biri yoʻqolsa — qayta soʻraladi | xat qogʻozga yozilib **qirqiladi**; har boʻlakka raqam va manzil yoziladi; boʻlaklar aralash kelib tushadi, bola raqami boʻyicha tartibga soladi va oʻqiydi | 8–11 |
| 2 | **Manzil (IP)** | har qurilmaning raqamli manzili bor; `192.168.1.5` — toʻrtta son, har biri **0–255** (= 1 bayt) | qabila xaritasida uylar; manzilsiz konvert qaytib keladi, xato manzil boshqa uyga tushadi; `255` qayerdan chiqqani «Bayt sandigʻi» bilan bogʻlanadi | 10–16 |
| 3 | **DNS (nom → manzil)** | odam nomni eslaydi, kompyuter raqamni; nom-manzil daftari bor va u **bitta joyda emas** | bola «daftarchi» boʻladi: nom berilsa manzilni topadi; daftarida yoʻq boʻlsa — kattaroq daftarga soʻraydi; topilgan javobni eslab qoladi | 10–16 |
| 4 | **Yoʻnalish (marshrut)** | xabar bitta sim bilan ketmaydi: bir necha uzel orqali oʻtadi; har uzel faqat **keyingi qadam**ni biladi; yoʻl uzilsa — boshqasi topiladi | tugunlar toʻri; bola paketni qadam-badam uzatadi, faqat qoʻshnilarini koʻradi; bitta sim uzilganda yoʻl qayta topiladi, qadamlar sanaladi | 10–16 |
| 5 | **Server va mijoz** | «sayt» — kimningdir kompyuteridagi fayllar; bola soʻraydi, server javob beradi; bitta server minglab soʻrovga javob beradi — navbat boʻladi | ekranning bir tomoni — bola (mijoz), ikkinchisi — server; soʻrov yuboriladi, fayllar birma-bir keladi (sahifa → rasm → shrift) va sahifa koʻz oldida yigʻiladi | 8–16 |
| 6 | **Kesh** | bir marta olingan narsa saqlanadi va ikkinchi marta soʻralmaydi — tez boʻladi; lekin **eskirib qolishi** mumkin | bir xil sahifa ikki marta yuklanadi, soniyalari solishtiriladi; soʻng serverdagi rasm oʻzgaradi, ekranda esa eski rasm turadi → «yangilash» kerak boʻladi | 10–16 |
| 7 | **HTTPS (qulf)** | qulf ikki narsani aytadi: yoʻldagi uzellar matnni **oʻqiy olmaydi** va manzil **haqiqiy**. Qulf saytning halolligini bildirmaydi | bitta xabar ikki yoʻl bilan yuboriladi: ochiq (bola uzel boʻlib, oʻtayotgan parolni oʻqiydi) va qulflangan (faqat tushunarsiz belgilar); keyin «parol yozamanmi?» qarori | 10–16 |

**Blokka kiritmayman:** OSI ning yetti qatlami va ularning nomlari, TCP va UDP farqi, port raqamlari,
NAT, HTTP sarlavhalari, kalit almashish matematikasi (RSA, Diffie-Hellman), Wi-Fi chastotalari.
Sababi: bularning hammasi **nom yodlashga** aylanadi va ekranda koʻrinadigan narsa bermaydi.
Blokda yangi atama soni **7 ta**: paket, IP, DNS, marshrut, server, kesh, HTTPS.

---

## 3. Oʻyinlar (taklif)

**Papka raqamlari hozir berilmaydi**, oʻyinlar harf bilan belgilandi: 51–53 allaqachon band
([`XAVFSIZLIK-BLOK.md`](XAVFSIZLIK-BLOK.md) va ishdagi `53-xato-ovi`), C++ bloki ham raqam soʻraydi
([`CPP-BLOK.md`](CPP-BLOK.md)). Qaysi blok avval yozilsa — raqamni oʻsha oladi; kartadagi raqam
baribir avtomatik suriladi (QOIDALAR §9).

| Belgi | Oʻyin | Mavzular | Yosh | Qurilma |
|---|---|---|---|---|
| A | **Xabar boʻlaklari** | 1 | 8–11 | telefon + PC |
| B | **Qabila manzillari** | 2, 3, 6 | 10–16 | telefon + PC |
| C | **Paket yoʻli** | 4, 5 | 10–16 | telefon + PC |
| D | **Qulf** | 7 | 10–16 | telefon + PC |

### A. Xabar boʻlaklari (8–11)

| Bosqich | Nima qiladi | Mashq |
|---|---|---|
| 1 | **Boʻlaklash** — uzun xabarni konvertlarga boʻladi, har biriga raqam va manzil qoʻyadi | «Bu xabar nechta konvertga sigʻadi?» — konvert boʻyi berilgan |
| 2 | **Yoʻlda aralashdi** — boʻlaklar boshqa tartibda keladi, bola raqami boʻyicha tiklaydi | aralash boʻlaklardan xabarni oʻqish; keyin nom beriladi: **paket** |
| 3 | **Boʻlak yoʻqoldi** — nechanchisi yoʻq ekanini topadi va qayta soʻraydi | «Qaysi raqam yoʻq?» va «Hammasi keldimi?» — kam yoki ortiq boʻlakli holatlar |

Ulanadi: «Qabila Morzesi» (xabar belgilarga aylanadi), «Bayt sandigʻi» (xabar hajmi).

### B. Qabila manzillari (10–16)

| Bosqich | Nima qiladi | Mashq |
|---|---|---|
| 1 | **Manzil** — xaritadagi uyga konvert yetkazadi; manzil toʻrtta son, har biri 0–255 | «Bu manzil toʻgʻrimi?» (`192.168.300.1` — yoʻq, nega?); manzil → uy |
| 2 | **Daftar (DNS)** — nom berilgan, manzilni daftardan topadi; daftarida yoʻq boʻlsa kattaroq daftarga soʻraydi | nom ↔ manzil; «nechta soʻrov kerak boʻldi?» |
| 3 | **Esda qoldi (kesh)** — ikkinchi soʻrovda daftar kerak emas; keyin manzil oʻzgaradi va eski javob xato uyga olib boradi | «Nega eski sahifa koʻrinadi?» — yangilash kerak boʻlgan holatni tanish |

Ulanadi: «Bayt sandigʻi» (nega 255), «Qabila choʻti» (sonlar va xona qiymatlari).

### C. Paket yoʻli (10–16)

| Bosqich | Nima qiladi | Mashq |
|---|---|---|
| 1 | **Qoʻlda uzatish** — tugunlar toʻrida paketni manzilga olib boradi, har qadamda faqat qoʻshnilarni koʻradi | eng kam qadamda yetib borish; qadamlar sanaladi |
| 2 | **Sim uzildi** — qisqa yoʻl yoʻq, boshqa yoʻl topiladi; ikki yoʻl qadamlari solishtiriladi | «Bu sim uzilsa, necha qadam boʻladi?» |
| 3 | **Soʻrov va javob** — mijoz soʻraydi, server fayllarni birma-bir yuboradi, sahifa yigʻiladi | «Bitta fayl kelmadi — sahifa qanday koʻrinadi?» (rasmsiz, shriftsiz sahifa) |

Ulanadi: «Robot yoʻli» (yoʻl va tartib), «Qadamlar soni» (oʻlchash va solishtirish), «Izlash».

### D. Qulf (10–16)

| Bosqich | Nima qiladi | Mashq |
|---|---|---|
| 1 | **Ochiq yoʻl** — bola uzel boʻlib turadi va oʻtayotgan xabarni oʻqiydi (parol ham koʻrinadi) | «Bu xabarda nima yozilgan?» — ochiq yoʻlda hammasi oʻqiladi |
| 2 | **Qulflangan yoʻl** — bir xil xabar qulf bilan oʻtadi, uzel faqat belgilarni koʻradi | «Uzel nimani koʻrdi?»; qulfning ikki vazifasi: oʻqilmaydi + manzil haqiqiy |
| 3 | **Ishonamanmi?** — ekrandagi belgilarga qarab qaror qabul qiladi | qulf bor/yoʻq, manzil gʻalati (`...uz.xato-sayt.com`) — «parol yozamanmi?». **Qulf bor, lekin sayt firibgar** holati ham bor |

Ulanadi: «Sezar maktubi» (yashirish), «Parol kuchi» (50), rejadagi «Firibgar xat» (52).

---

## 4. Men koʻrgan xatarlar (ochiq aytaman)

1. **Mavzu koʻrinmas — nimani animatsiya qilamiz?** Sim ichida yorugʻlik yuguradi; buni «chiroyli»
   animatsiya qilsak, bola **rasmni** eslab qoladi, mexanizmni emas. Qoida: har mavzu uchun **bitta
   jismoniy metafora** tanlanadi va blok boʻyi oʻzgarmaydi — xabar = raqamlangan konvert, manzil = uy,
   DNS = daftar, uzel = pochta boʻlimi, kesh = javonda turgan nusxa. Metaforani oʻrtada almashtirish
   bolani adashtiradi, shuning uchun roʻyxat shu yerda qotiriladi.
2. **Soddalashtirish qayerda yolgʻonga aylanadi.** Uch joy xatarli:
   - «IP — uy manzili» — yetarli, lekin manzil **oʻzgarib turishini** bir satrda aytish kerak;
   - «DNS — telefon kitobi» — yetarli, daftar bitta joyda emasligi 2-bosqichda koʻrsatiladi;
   - «Qulf bor — sayt xavfsiz» — **bu yolgʻon.** Toʻgʻrisi: qulf yoʻlda oʻqib boʻlmasligini va manzil
     haqiqiyligini bildiradi, saytning **halolligini bildirmaydi**. Shuning uchun D-oʻyinning
     3-bosqichida «qulfi bor firibgar sayt» holati majburiy.

   Qoida: har soddalashtirish yonida bitta satr — *«haqiqatda bundan murakkabroq: …»*.
3. **Nomlar yodlashga aylanib ketishi.** TCP, UDP, OSI, port — bola uchun boʻsh soʻzlar. QOIDALAR §4.1:
   avval qildiriladi, keyin nomlanadi. Blokda yangi atama **7 tadan oshmaydi** (§2), qolgan hammasi
   kiritilmaydi.
4. **Ekranga sigʻmaslik (360 px).** Tugunlar toʻri va uchib yurgan konvertlar telefonda sigʻmaydi.
   Qoida: toʻr **4×3 tugundan** oshmaydi, bir vaqtda **4 ta** konvert koʻrinadi, uzun xabar jadval
   bilan koʻrsatiladi (QOIDALAR §6: SVG ichiga matn yozilmaydi).
5. **Internet bloki internetni talab qilmasligi kerak.** QOIDALAR §8: oʻyin oflayn ishlaydi.
   Demak hammasi **simulyatsiya**: haqiqiy soʻrov yuborilmaydi, `fetch` ishlatilmaydi. Shu sababdan
   jozibali koʻringan «oʻz IP manzilingni koʻr» gʻoyasi **kiritilmaydi** — u internet talab qiladi va
   bolaning shaxsiy maʼlumotini ekranga chiqaradi.

---

## 5. Qaror kutayotgan savollar

| Savol | Mening taklifim |
|---|---|
| **1. Nechta oʻyin?** 4 ta (A paket, B manzil+DNS, C yoʻl+server, D qulf) yoki 3 ta (manzil, yoʻl va server bitta oʻyinga qoʻshiladi)? | **4 ta.** C-oʻyindagi «mijoz va server» 3-bosqich sifatida yetarli joy oladi; 3 taga siqilsa, bosqichlar uzayib ketadi |
| **2. Yosh:** blok ikki toifaga boʻlinadimi (A — 8–11, B–D — 10–16) yoki hammasi bitta yoshda boʻladimi? | **Boʻlinadi.** A — 8–11 (konvertlar, raqamlash — jismoniy ish), B–D — 10–16 (sonlar, daftar, qulf). Bu «Mantiq» blokidagi naqsh (24 — 8–16, 25 — 10–16) |
| **3. Bosh sahifada joyi:** yangi `internet` boʻlimi qayerga qoʻyiladi? | **«Parol va xavfsizlik» dan oldin** — qulf mavzusi parol mavzusiga tabiiy koʻprik boʻladi; «Axborot oʻlchovi» (bayt) esa undan oldin turgani uchun 255 tushunarli boʻladi |

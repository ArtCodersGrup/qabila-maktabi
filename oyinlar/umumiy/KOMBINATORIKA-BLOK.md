# Kombinatorika bloki — reja

**Holat (2026-10-01):** muallif qarori olindi — **12–16 💻 (kod bilan), 5 ta oʻyin, masalalar bankiga ham qoʻshiladi**.
Yozildi: **41 «Tanlov daraxti»** va umumiy modul `js/sanash.js`. Qolgani: 42, 43, 44, 45 va bank masalalari.

Oldingi bloklar: [`ALGORITM-BLOK.md`](ALGORITM-BLOK.md) (36–40, yopildi), Python (27–34).
Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md).

## 1. Nega bu blok kerak

Olimpiada masalalarining katta qismi **sanashga** tayanadi: nechta variant bor, nechta yoʻl bor,
nechta juftlik bor. Bola buni bilmasa, masalani kod bilan ham yecholmaydi — chunki
«hammasini koʻrib chiqaman» deydi va dastur yillab ishlaydi. 40-oʻyin aynan shu yerda ulanadi:
**sanash formulasi — bu tezlik masalasi.**

Saytda allaqachon bor: `01-qabila-kodlari` — `aⁱ` (koʻpaytirish qoidasi, **takrorli**, tartib muhim).
Yoʻq: qoʻshish qoidasi, `n!`, tanlash (`C(n,k)`), Paskal uchburchagi, Dirixle printsipi.

## 2. Mavzular (ajratilgan)

| № | Mavzu | Nima oʻrganiladi | Qaysi savolga javob |
|---|---|---|---|
| 1 | **Koʻpaytirish qoidasi** | har qadamda tanlov → koʻpaytiriladi | «VA»: koʻylak **va** shim |
| 2 | **Qoʻshish qoidasi** | bir-birini istisno qiladigan holatlar → qoʻshiladi | «YOKI»: avtobus **yoki** piyoda |
| 3 | **Oʻrin almashtirish `n!`** | n ta narsani qatorga terish | «Nechta tartib bor?» |
| 4 | **Oʻrinlashtirish `A(n,k)`** | n tadan k tasini **tartib bilan** | «Oltin, kumush, bronza kimga?» |
| 5 | **Birikma `C(n,k)`** | n tadan k tasini **tartibsiz** | «3 kishilik jamoa nechta?» |
| 6 | **Paskal uchburchagi** | `C(n,k) = C(n−1,k−1) + C(n−1,k)`, qatorlar yigʻindisi `2ⁿ` | «Formulasiz qanday topaman?» |
| 7 | **Dirixle printsipi** | n+1 ta narsa, n ta quti → birida ikkitasi bor | «Isbotlash qanday boʻladi?» |
| 8 | **Sanash ↔ tezlik** | `n!` oʻsishi: 10! = 3,6 mln, 20! — kutib boʻlmaydi | «Nega formula kerak?» (40-oʻyin davomi) |

**Blokka kiritmayman:** ehtimollik (alohida blok boʻlishi kerak — kasr, hodisa, mustaqillik),
takrorli birikmalar, binomial yoyilma (`(a+b)ⁿ`) — maktab dasturining yuqori qismi, bu yerda ortiqcha.

## 3. Oʻyinlar (taklif)

| № | Oʻyin | Mavzular | Asosiy mashq |
|---|---|---|---|
| 41 | **Tanlov daraxti** ✅ | 1, 2 | Bola daraxtni oʻzi yigʻadi (bosib), barglarni sanaydi, keyin koʻpaytirish chiqadi. «VA» va «YOKI» farqi — bitta ekranda |
| 42 | **Qatorga terish** | 3, 4 | 3–4 ta narsani barcha tartibda terish (roʻyxat qoʻlda toʻladi) → `n!`; keyin «faqat 3 oʻrin» → `A(n,k)` |
| 43 | **Jamoa tanlash** | 5 | Bir xil jamoa necha marta takrorlandi? Takrorni sanab, `k!` ga boʻlish — `C(n,k)` shundan chiqadi |
| 44 | **Paskal uchburchagi** | 6 | Uchburchakni bosib toʻldiradi; qatorlar yigʻindisi `2ⁿ` (01- va 04-oʻyinlarga ulanadi) |
| 45 | **Kaptarxona** | 7, 8 | Dirixle: kaptarlarni uyalarga joylash — har qanday joylashda ham biri ikkita boʻladi; soʻng `n!` ni oʻlchab koʻrish |

## 4. Men koʻrgan xatarlar (ochiq aytaman)

1. **Eng katta xavf — formulaga ertaroq oʻtish.** Kombinatorikada bola formulani yodlab oladi va
   qaysi holatda qaysi biri ekanini bilmay qoladi. Qoida: **avval sanab chiqish, keyin formula.**
   Har oʻyinda bola kamida bir marta hamma variantni **oʻz qoʻli bilan** yozadi.
2. **Asosiy qiyinchilik — `C` va `A` farqi**, `n!` ni hisoblash emas. Shuning uchun blokning yarmi
   «tartib muhimmi?» degan savolga ajratiladi; hisob — ikkinchi darajali.
3. **Faktorial katta sonlar.** `20! = 2 432 902 008 176 640 000` — JS `number` ga sigʻmaydi.
   Mantiqda **BigInt** ishlatiladi (talqinchimizda `int` allaqachon BigInt).
4. **Daraxt chizish ekranni toʻldiradi.** 3×3×3 daraxtning 27 ta bargi telefonda sigʻmaydi —
   daraxt **2×3 / 3×2** bilan cheklanadi, kattasi jadval bilan koʻrsatiladi (QOIDALAR §6: SVG ichida matn yoʻq).
5. **Dirixle «isbot» boʻlgani uchun qiyin.** Bola uchun u «har qanday urinishda ham» tajribasi orqali
   beriladi: bola oʻzi joylashtirib koʻradi, har safar bittasi ikkita chiqadi.

## 5. Qabul qilingan qarorlar (2026-10-01)

| Savol | Qaror |
|---|---|
| Yosh va qurilma | **12–16, 💻 kod bilan** — har oʻyinning oxirgi bosqichida formula dastur bilan tekshiriladi |
| Oʻyinlar soni | **5 ta**: 41 daraxt, 42 terish, 43 tanlash, 44 Paskal, 45 kaptarxona |
| Masalalar banki | **Ha** — `kombinatorika` tegi bilan masalalar qoʻshiladi |
| Bosh sahifada joyi | «Algoritmlar va samaradorlik» dan keyin (yangi boʻlim) |

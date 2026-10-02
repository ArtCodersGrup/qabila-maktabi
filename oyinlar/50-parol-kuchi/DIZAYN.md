# 50-oʻyin — «Parol kuchi»

«Parol va xavfsizlik» blokining birinchi oʻyini. Blok rejasi:
[`../umumiy/XAVFSIZLIK-BLOK.md`](../umumiy/XAVFSIZLIK-BLOK.md).

- **Yosh:** 10–16 (ikkala toifada). Klaviatura shart emas.
- **Ulanish:** `aⁱ` — «Qabila kodlari» va kombinatorika bloki; oʻsish tezligi — «Qadamlar soni».

## Asosiy fikr

Bolaning parol haqidagi tasavvuri odatda shunday: *«murakkab belgi qoʻshsam — kuchli boʻladi»*.
Hisob boshqa narsani koʻrsatadi:

| Parol | Variantlar | Topish vaqti (1 mln urinish/sek) |
| --- | --- | --- |
| 4 xonali PIN | 10 000 | bir soniyadan kam |
| `Qq1!5z` (6 ta aralash) | 690 milliard | 7 kun |
| `kitobjavonstol` (14 ta kichik harf) | 64 kvintillion | 2 million yil |

Yaʼni **uzunlik murakkablikdan kuchliroq** — buni bola oʻzi hisoblab koʻradi.

## Lekin uzunlikning oʻzi yetarli emas

`Anvar2010` — 9 belgi, uch xil tur, hisob boʻyicha 429 yil. Aslida esa **darhol topiladi**:
ism va tugʻilgan yil hujumchining birinchi roʻyxatida turadi. Shuning uchun mantiq lugʻat
tekshiruvini ham qiladi:

- mashhur parollar (`123456`, `parol`, `qwerty` …),
- ismlar, `19xx`/`20xx` yillari,
- «hiyla» almashtirishlar: `@` = a, `1` = i, `0` = o, `$` = s — `P@ss1` ham mashhur soʻz hisoblanadi.

Bu tekshiruv **uzunlik hisobidan ustun turadi**: lugʻatda topilsa, baho darhol «zaif».

## Bosqichlar

1. **Nechta variant** — `aⁱ` ni oʻzi hisoblaydi (PIN, harflar, yoniq-oʻchiq kataklar).
2. **Qancha vaqt** — variantlar sonini tezlikka boʻlish; «qaysi parol kuchliroq» savollari.
3. **Yaxshi parol** — lugʻat hujumi koʻrsatiladi, keyin bola parollarga baho beradi
   (zaif / oʻrtacha / kuchli) va qoida chiqadi: uzun, lugʻatda yoʻq, har sayt uchun boshqacha.

## Qarorlar

- **Hujum usullari oʻrgatilmaydi** — faqat himoya tomoni; parol sindiradigan dastur yozilmaydi.
- Vaqt eng yomon holat boʻyicha (hamma variant sinab koʻriladi) hisoblanadi.
- Juda katta vaqtlar «koinot yoshidan ham koʻp» deb aytiladi (13,8 milliard yildan oshsa).
- Alifbo: raqam 10, kichik harf 26, katta harf 26, belgi va boʻsh joy 32.

## Fayllar

- `js/logic.js` — `tahlil`, `vaqtMatni`, `baho`, lugʻat tekshiruvi, toʻrt xil savol.
- `tests/logic.test.js` — 12 test; ichida **«uzun oddiy parol qisqa murakkabdan kuchli»** va
  **«ism/yil/mashhur soʻz — uzunligidan qatʼi nazar zaif»** daʼvolari qulflangan.

## 2026-10-02 qiyinlik yangilanishi

Sabab: "qaysi parol kuchliroq?" 2 variantli edi, baho savolida 10 ta qotirilgan parol, variant savolida 5 ta savol; bola hech narsa yasamasdi.

- **1-bosqich:** `VARIANT_SAVOL` 5 → 18 ta, uch darajada (`daraja` = tier): javob ≤ 1 100 → ≤ 20 000 → ≤ 1 000 000 (alifbo 2 / 3 / 5 / 10 / 26 / 36 / 62).
- **2-bosqich, vaqt:** tier 1+ da generator (`ALIFBO` × uzunlik 6–10 → 8–12), chalgʻituvchilar — **qoʻshni birliklar** (× 60, ÷ 60, × 24 …), tier 2 da "kuchli uskuna" (sekundiga 1 milliard) ham chiqadi.
- **2-bosqich, qiyos — 4 variant:** "toʻrtta parol, qaysi biri ENG kuchli?" Parollar yasaladi (`yasaParol`): tier 0 — uchtasi ochiq-oydin zaif; tier 1 — bittasi "oʻrtacha"; tier 2 — murakkab koʻrinadigan qisqa parollar va niqoblangan lugʻat soʻzlari (`P@ssw0rd`, `s@l0m`). Maslahat — usul ("avval lugʻatdagilarini chiqar, keyin uzunlikka qara"), javob emas.
- **3-bosqich, baho — 5 variant:** daraja + **sababi** (`SABABLAR`): "Zaif — mashhur soʻz", "Zaif — ism yoki yil", "Zaif — juda qisqa", "Oʻrtacha", "Kuchli". Parollar yasaladi va har biri `baho()` bilan tasdiqlanadi (yasovchi yolgʻon gapirmaydi).
- **3-bosqich, "oʻzing yasa"** (`yasaTask` / `yasaTekshir`): bola soʻz kartalaridan ibora yigʻadi, "Tekshir" — topish vaqti chiqadi. Shartlar tier boʻyicha: 3 soʻz, kuchli → million yildan koʻp, kartalar ichida 2 ta tuzoq (ism, yil, mashhur soʻz) → 4 soʻz, **koinot yoshidan koʻp**, 3 ta tuzoq. Takror soʻz va tuzoq soʻz rad etiladi, sababi aytiladi. Baho va "yasa" navbatlashadi.
- **Tuzatilgan xato:** `lugatda("123456")` avval `null` qaytarardi (raqamlar "soddalashtirish"da olib tashlanardi) — endi raqamli mashhur parollar ham lugʻatda.

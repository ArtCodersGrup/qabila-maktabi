# 61 — Qulfli yoʻl: ish rejasi

Dizayn: [`DIZAYN.md`](DIZAYN.md). Blok rejasi: [`../umumiy/INTERNET-BLOK.md`](../umumiy/INTERNET-BLOK.md).

- [x] **1. Mantiq** — kirish xabari (login, parol, tier bilan qoʻshimcha maydonlar), «qulflash» (tasodifiy belgilar, haqiqiy shifr emas), manzil egasi (`egasi`: birinchi «/» gacha, oxirgi ikki boʻlak), aldov turlari (`turi`: toʻgʻri / qulfsiz / qulfli-begona / qulfli-oʻxshash), sakkiz savol generatori.
- [x] **2. Testlar** — 9 ta: `egasi` misollari, aldov turlari, oʻxshash domenlar kichik harfda, qulflangan matnda asl matn yoʻq, aynan bitta `https://`, **har «ishonamanmi» mashqida qulfli firibgar bor** (dizayndagi majburiy talab).
- [x] **3. Ekran** — ochiq otkritka, qulfli quti, yoʻl (koʻzli tugunlar), manzil satri (qulf / ogohlantirish belgisi SVG, manzil HTML), satr-tugmalar.
- [x] **4. Sahnalar** — kirish, 1-bosqich (bola tugun boʻlib parolni oʻqiydi), 2-bosqich (qulfli quti → HTTPS, 🔒), 3-bosqich (uch havola: qulfsiz / qulfli firibgar / toʻgʻri), tabrik.

## Yoʻl-yoʻlakay tanlangan yechimlar

1. **Katta `I` bilan oʻxshash domen** (`qabiIa.uz`) olib tashlandi — `egasi()` manzilni kichik harfga oʻtkazadi va u aldov sifatida tanilmay qolardi; oʻrniga `qobila.uz`.
2. **«Egasi kim?» savoli tier 0 da** variantlar takrorlanib qolardi (javob = asl domen) — tier 0 variantlari alohida tanlandi (`kirish`, `https`, nom).
3. **Haqiqiy brend nomlari ishlatilmaydi** — faqat `kelajagim.uz`, `qabila.uz` (bizniki) va oʻylab topilgan «firibgar» domenlar.

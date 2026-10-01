# Masalalar maydoni: dizayn

**Nima:** olimpiada masalalari roʻyxati — qidiruv, filtr, sahifalash; har masala testlar bilan tekshiriladi va **foiz** bilan baholanadi.
**Yosh:** 12–16 · **Qurilma:** kompyuter (💻) · **Qayerda:** bosh sahifa → **Mashqlar** → «Masalalar» (`oyinlar/masalalar/`).
**Holati:** kod yozildi, testlari yashil — muallif koʻrib chiqishini kutmoqda (2026-10-01).

**Muallif topshirigʻi (2026-10-01):** «masalalar maydoni mashqlar qatoriga olish kerak, ularni roʻyxat qilish kerak. Filtrlash joyi va qidiruv oynasi. Masala 10 tadan koʻrinishi, keyingisi — sahifalar. Masalalar uchun shablon testlar boʻlishi va qaysi test xato bersa koʻrsatishi kerak. Yetib kelganiga qarab foiz berish: 4 test boʻlsa, 3 tasidan oʻtsa — 75%.»

---

## 1. Men qabul qilgan qarorlar

1. **Bu oʻyin emas** — bosqichi, qahramoni va hikoyasi yoʻq. Shuning uchun `QK.app.start` qobigʻi ishlatilmaydi va bosh sahifada oʻyinlar orasida emas, yangi **Mashqlar** qatorida turadi.
2. **Foiz — baho, «yechildi» esa boshqa narsa.** 75% olimpiadada ball beradi, lekin masala yechilgan hisoblanmaydi: aks holda bola chala yechimda toʻxtaydi. Kartada eng yaxshi foiz koʻrinadi, ✓ esa faqat **100%** da qoʻyiladi.
3. **Yashirin testlarning maʼlumoti ochilmaydi.** Hamma test raqami bilan ✓/✗ koʻrinadi, faqat **birinchi yiqilganining** kirishi va kutilgan javobi ochiladi. Aks holda bola javoblarni kodga yozib qoʻyishi mumkin.
4. **Maslahat ikkinchi urinishdan keyin** beriladi — avval oʻzi oʻylab koʻrsin.
5. **Qidiruv** nom, shart, teg, daraja va manba kodi (`4A`) boʻyicha ishlaydi; bir nechta soʻz yozilsa, hammasi mos kelishi kerak.
6. **Havola bilan bitta masala:** `…/masalalar/index.html#masala=cf-tarvuz` — oʻqituvchi darsda aniq masalani ochib bera oladi.

## 2. Ekranlar

### 2.1. Roʻyxat
```
Masalalar                                   [🔍 qidiruv]  51 ta masala
[Daraja ▾] [Mavzu ▾] [Qiyinlik ▾] [Holati ▾] [Tozalash]
 1  Kvadrat            oʻzgaruvchi matematika          100
 2  Ikki son yigʻindisi oʻzgaruvchi matematika         100   75%
 …                                                     (10 tadan)
              ◀︎  1  2  3  4  ▶︎
```
Yechilgan masala yashil fonda va ✓ bilan; chala yechilgani foizi bilan koʻrinadi.

### 2.2. Bitta masala
Masala kartasi (sarlavha, qiyinlik va teglar, shart, kirish/chiqish formati, namunaviy kirish/chiqish, manba havolasi) → kod maydoni → **▶︎ Tekshirish**.

Natija paneli:
- `6 ta testdan 2 tasi oʻtdi — 33%` va rangli chiziq;
- har test raqami bilan: `✓ 1-test`, `✗ 2-test` …;
- birinchi yiqilgan test: **Kirish / Kutilgan / Sendan** (yoki xato xabari va izohi);
- ikkinchi urinishdan keyin — maslahat.

## 3. Kod tuzilishi

```
oyinlar/masalalar/
├── js/bank.js      51 ta masala (qo'lda yozilgan; 15 tasi Codeforces g'oyasi asosida —
│                   reyting 800–1100, 8 tasi "kombinatorika" tegi bilan)
├── js/royxat.js    qidiruv, filtr, sahifalash, vazifaga aylantirish (sof mantiq)
├── js/baho.js      har testni alohida bajarish, foiz, birinchi yiqilgan test (sof mantiq)
├── js/holat.js     eng yaxshi foiz va yechilganlar (brauzer xotirasi)
├── js/ekran.js     ro'yxat va masala ekrani
├── js/main.js      sahifani ishga tushirish, ovoz tugmasi, #masala= havolasi
└── tests/          bank.test.js (har yechim hamma testdan o'tadi), royxat.test.js, baho.test.js
```

## 4. Qoladi

- Masalaga **animatsiya** (muallif talabi): har masala uchun alohida kelishiladi, bank formatida `animatsiya` maydoni tayyor turibdi.
- Bankka masala qoʻshish: `js/bank.js` ga yangi yozuv — test uni oʻzi tekshiradi.

# Vibecoding topshiriq generatori — dizayn

**Maqsad:** vibecoding (AI bilan kod yozish) o'rganayotgan o'quvchilarga mashq uchun tasodifiy topshiriq berish.
**Auditoriya:** o'smir/kattalar, IT kursi o'quvchilari (asosiy `Information` saytining 8–12 yosh qoidalariga bog'liq emas — mustaqil loyiha).
**Holati:** dizayn yozildi — muallif tasdiqini kutmoqda (2026-09-23)

Bu loyiha `../QOIDALAR.md`ga bo'ysunmaydi (mustaqil sayt). Faqat shu fayl asos.

---

## 1. G'oya

O'quvchi tugmani bosadi → ikkita "g'ildirak" tasodifiy so'zda to'xtaydi → natijada aniq topshiriq chiqadi: **"{Kompaniya} uchun {Xizmat} qilish"** (masalan: "Red24 uchun sotuvchi bot qilish"). Kompaniya — o'ylab topilgan, haqiqiy emas. O'quvchi shu topshiriqni AI yordamida (vibecoding) bajarishga harakat qiladi.

## 2. Ekran va oqim

Bitta ekran, uchta holat:

1. **Boshlang'ich:** ikki g'ildirak bo'sh/boshlang'ich so'zda turadi, pastda **"Aylantir"** tugmasi.
2. **Aylanish:** tugma bosilganda ikkala g'ildirak **bir vaqtda** aylana boshlaydi (so'z tez-tez almashadi, sekinlashib boradi).
   - **Xizmat turi** g'ildiragi birinchi to'xtaydi (~1.5–2 soniya).
   - **Kompaniya nomi** g'ildiragi biroz keyin to'xtaydi (~2.5–3 soniya).
3. **Natija:** ikkalasi to'xtagach, pastda yakuniy jumla ko'rinadi: **"{Kompaniya} uchun {Xizmat} qilish"**. Tugma matni **"Yana ayl"**ga o'zgaradi.

Natijadan tashqari boshqa hech narsa yo'q — tushuntirish matni, ball, tarix, ovoz, backend yo'q (YAGNI).

## 3. Ma'lumotlar

- **Xizmat turi ro'yxati** — ~50 element. Har biri **aniq vazifali**, umumiy emas:
  - ✅ "Sotuvchi bot", "Buyurtma qabul qiluvchi bot", "CRM tizimi", "Bron qilish tizimi", "Landing sahifa"
  - ❌ shunchaki "Bot", "Sayt", "Tizim" (juda umumiy — nima qilishi noaniq)
- **Kompaniya nomi ro'yxati** — ~30 element, o'ylab topilgan nomlar ("Red24", "NovaTech", "BlueWave" kabi), orqasida haqiqiy kompaniya yo'q.
- Ikkala ro'yxat ham kod ichida oddiy massiv (`services.js` yoki shunga o'xshash), REJA bosqichida men loyihalab yozaman, muallif ko'rib tuzatadi.
- Ikkala g'ildirak **mustaqil** tasodifiy tanlaydi (xizmat va kompaniya orasida moslik/mantiq yo'q — har qanday kombinatsiya to'g'ri).

## 4. Vizual uslub

Zamonaviy/texnologik: qorong'i fon, neon urg'u rang (elektr-yashil yoki moviy), zamonaviy (masalan tizim) shrift. G'ildirak aylanishida tezlik-sekinlik (deceleration) effekti — slot-mashina hissi.

## 5. Texnologiya va fayl tuzilishi

- Oddiy **HTML + CSS + JS**, kutubxona va build tool yo'q — faylni ikki marta bosib ochish kifoya.
- Joylashuv: shu papka (`random idea/`) ichida:
  ```
  random idea/
  ├── DIZAYN.md
  ├── REJA.md
  ├── index.html
  ├── style.css
  └── js/
      ├── data.js      ← xizmat va kompaniya ro'yxatlari
      └── main.js       ← g'ildirak mantig'i va animatsiya
  ```

## 6. Bu loyihaga kirmaydi

- Ball, yutuq, tarix, statistika.
- Backend, ma'lumotlar bazasi, foydalanuvchi hisobi.
- Ovoz effektlari.
- Xizmat va kompaniya orasidagi "moslik" mantiqi (ikkalasi butunlay mustaqil).
- Asosiy `Information` saytiga integratsiya (bosh sahifa, `GAMES` ro'yxati va h.k.).

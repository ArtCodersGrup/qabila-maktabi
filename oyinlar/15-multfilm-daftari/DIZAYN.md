# 15 — Multfilm daftari: dizayn

**Mavzu:** Axborot oʻlchovi — video: kadrlar, kadr/soniya, video hajmi, gigabayt, siqish (faqat oʻzgargani)
**Yosh:** 8–12
**Taxminiy davomiyligi:** 20 daqiqa
**Holati:** kod yozildi — muallif koʻrib chiqishini kutmoqda (2026-09-21)

Umumiy qoidalar: [`../../QOIDALAR.md`](../../QOIDALAR.md). Blok: 13 bayt → 14 rasm → **15 video** → 16 xotira ombori.
Bogʻliq oʻyinlar: `14` (rasm hajmi, rangli piksel 3 bayt, Mbayt, qatorni qisqa yozish), `10` (rasm — kataklar).

> Shogird daftar chetiga koptok chizib, varaqlarni tez aylantirdi — koptok sakray boshladi!
> Kompyuterdagi video ham shunday ishlaydi. U qancha joy oladi?

Blok qarorlari: 1 Gbayt = 1024 Mbayt; birliklar toʻliq soʻz bilan; hisob mashqlarida javob ≤ 100.

---

## 1. O'quv maqsadlari

O'yindan keyin bola:

1. Video **tez almashadigan rasmlar — kadrlardan** iboratligini, 1 soniyada kadr koʻp boʻlsa harakat silliq koʻrinishini biladi (multfilmda 24 ta).
2. Kadrlar sonini topadi: **kadr/soniya × soniya** (va teskarisi: necha soniya).
3. Video hajmini hisoblaydi: **1 kadr hajmi × kadrlar soni**.
4. **1 Gbayt = 1024 Mbayt**; siqilmagan video juda katta (1 daqiqasi — 8 Gbaytdan koʻp) ekanini biladi.
5. Video siqilganda keyingi kadrlarda **faqat oʻzgargan piksellar** saqlanishini tushuntiradi va qaysi video koʻproq siqilishini aytadi.

## 2. Asboblar

- **Kadr** — 6 × 6 toʻr: osmon (oq), yer (yashil), quyosh (sariq), koptok (qizil), qush (koʻk), quti (toʻq sariq).
- **Kadrlar tasmasi** — kichik kadrlar qatori, ustida raqami. Yetishmayotgan kadr — "?".
- **Oʻynatgich** — katta kadr, kadrlar tanlangan tezlikda almashadi; "1 kadr/soniya", "12 kadr/soniya".
- **Kadrlar juftligi** — 1-kadr va 2-kadr yonma-yon (tik telefonda ustma-ust).

## 3. O'yin oqimi

```
Bosh ekran
   ├─► Kirish (daftardagi multfilm)
   ├─► 1-bosqich: Kadrlar            [yetishmayotgan kadrni chizish → sekin/tez oʻynatish → mashq 3]
   ├─► 2-bosqich: Video hajmi        [kadrlar qoʻshib bayt sanash → haqiqiy video → Gbayt → mashq 3]
   └─► 3-bosqich: Faqat oʻzgargani   [farqni top → siqish → mashq 3 → hikoya] → tabrik
```

**Kirish:** (Shogird) "Qarang, daftar chetiga koptok chizdim!" / "Varaqlarni tez aylantirsam, u sakraydi!" / (Oqsoqol) "Bu — multfilm. Kompyuterdagi video ham shunday ishlaydi."

## 4. 1-bosqich: Kadrlar

1. **Yetishmayotgan kadr:** tasmada 6 ta kadr, koptok yoy boʻylab sakraydi; 3-kadr boʻsh. Katta toʻrda 2- va 4-kadrdagi koptok xira koʻrinadi (animatorlar shunday qiladi). Bola koptokni 3-kadrga qoʻyadi — ular orasiga (3-ustun, 2–3-qator). Notoʻgʻri joyda: "↻ Koptok 2- va 4-kadrdagi joylar orasida boʻlsin."
2. **Oʻynatish:** "▶ Sekin: 1 kadr/soniya" — koptok sakrab-sakrab harakatlanadi. "▶ Tez: 12 kadr/soniya" — silliq uchadi. "Kadrlar tez almashsa, koʻz ularni harakat deb koʻradi." / "Multfilmda 1 soniyada 24 ta kadr boʻladi."
3. **Ta'rif:** `video — tez almashadigan kadrlar`, `kadrlar = kadr/soniya × soniya`.
4. **Mashq** (3 ta to'g'ri), tasodifiy ikki xil (K = 2, 4, 5, 10, 12, 24; javob ≤ 100). Sonlar ish maydonida yoziladi (pufak maslahatda almashadi):
   - "Multfilm N soniya, har soniyada K kadr. Jami nechta kadr?" 1-xato: N ta "soniya" qutisi, har birida K. 2-xato: "K × N = …".
   - "Jami T kadr, har soniyada K kadr. Multfilm necha soniya?" 1-xato: "K × ? = T". 2-xato: "T : K = N".

## 5. 2-bosqich: Video hajmi

1. **Kadrlar qoʻshamiz:** kichik ekran 4 × 4, oq-qora: 1 kadr = 16 bit = 2 bayt. Bola "+ kadr"ni 5 marta bosadi, har kadr kartochkasi ostida "2 bayt", jami oʻsadi: "5 kadr × 2 bayt = 10 bayt."
2. **Haqiqiy video** (formula qatorlari birma-bir): `1920 × 1080 × 3 bayt ≈ 6 Mbayt` (1 kadr) → `× 24 kadr ≈ 144 Mbayt` (1 soniya) → `× 60 ≈ 8640 Mbayt` (1 daqiqa). Zinapoya `Kbayt → Mbayt → Gbayt`: "1024 Mbayt = 1 Gbayt (gigabayt). 1 daqiqa video — 8 Gbaytdan koʻp!"
3. **Ta'rif:** `video hajmi = 1 kadr hajmi × kadrlar soni`, `1 Gbayt = 1024 Mbayt`.
4. **Mashq** (3 ta to'g'ri), tasodifiy uch xil:
   - "1 kadr — A bayt. K ta kadr — necha bayt?" (A × K ≤ 100). 1-xato: har kadr ostida "A bayt". 2-xato: "A × K = …".
   - "1 kadr — A bayt, 1 soniyada K kadr. N soniya — necha bayt?" (A × K × N ≤ 100). 1-xato: "1 soniya: A × K = X bayt". 2-xato: "A × K × N = …".
   - "Qaysi biri katta?" — `k Gbayt` va `m Mbayt` (m = 1000 × k yoki 1000 × (k + 1)). 1-xato: "k Gbayt = k × 1024 Mbayt". 2-xato: ikkalasi Mbaytda.

## 6. 3-bosqich: Faqat oʻzgargani

1. **Farqni top:** 1-kadr va 2-kadr (2 × 2 quti bir katak oʻngga surildi). Bola 2-kadrda **oʻzgargan kataklarni** bosadi (4 ta). Oʻzgarmagan katak bosilsa: "Bu katak oʻzgarmagan." Hammasi topilganda: "Butun kadr — 36 piksel. Oʻzgargani — faqat 4 ta!"
2. **Siqish:** "1-kadr toʻliq saqlanadi. Keyingi kadrlarda — faqat oʻzgargan piksellar." / "Siqilmasa 2 soatlik kino 1000 Gbaytga yaqin boʻlardi. Siqilgani — bir necha Gbayt."
3. **Mashq** (3 ta to'g'ri), tasodifiy uch xil:
   - "Nechta katak oʻzgardi?" — kadrlar juftligi (1–3 ta narsa bir katakka suriladi, javob 2–8), 4 ta son tugmasi. 1-xato: oʻzgarish bor qatorlar yoritiladi. 2-xato: oʻzgargan kataklar belgilanadi.
   - "Kadr — 36 piksel, oʻzgargani D ta. Nechta piksel qayta saqlanmaydi?" (36 − D). 1-xato: "36 − D = ?". 2-xato: javob.
   - "Qaysi video koʻproq siqiladi?" — ikki video: tinch va harakatli (diktor / futbol, uxlayotgan mushuk / oʻynayotgan kuchukchalar …). 1-xato: "Qaysi birida kadrdan kadrga kamroq narsa oʻzgaradi?" 2-xato: "Tinch video — oʻzgarish kam — koʻproq siqiladi".
4. **Hikoya:**
   1. Kinolenta: "Siqilmagan film: 1 daqiqasi — 8 Gbaytdan koʻp." / "Siqilgan 2 soatlik kino — 2–4 Gbayt."
   2. Karnay: "Video — kadrlar va ovoz." / "Ovoz ham sonlarga aylantirib saqlanadi."
   3. Telefon: "Internetda video koʻrganingda ham asosan oʻzgargan joylar keladi." / "Shuning uchun tinch video tezroq yuklanadi."

**Tabrik:** "Tabriklayman! Endi sen video qanday saqlanishini bilasan!" — "Video — tez almashadigan kadrlar", "Hajm = kadr × kadrlar soni", "1024 Mbayt = 1 Gbayt", "Siqish: faqat oʻzgargani".

## 7. Kod tuzilishi

| Fayl | Vazifasi |
|---|---|
| `js/video.js` | Sof hisob: ranglar, sakrovchi koptok kadrlari, sahna yasash, kadrlar farqi, haqiqiy video hajmi, topshiriqlar. Node testlari. |
| `js/game-art.js` | Daftar (kirish), kadr ikonkasi, hikoya rasmlari (kinolenta, karnay, telefon) |
| `js/video-ui.js` | Kadr toʻri, tasma, oʻynatgich, kadrlar juftligi, son tugmalari |
| `js/scenes/*.js` | Bosqichlar, hikoya, tabrik |
| `js/main.js` | `QK.app.start` (kalit `multfilm-daftari:v1`) |

## 8. Bu o'yinga kirmaydi

Ovozni raqamlash tafsilotlari (faqat hikoyada bir gap), kodeklar nomlari, internet tezligi (Mbit/s), Tbayt (16-oʻyin).

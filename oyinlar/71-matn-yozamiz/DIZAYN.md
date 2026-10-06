# 71-oʻyin — «Matn yozamiz» (💻)

1–4-sinf «Kompyuter bilan tanishuv» blokining (B qismi) oʻyini. Blok dizayni:
[`../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md`](../../docs/superpowers/specs/2026-10-06-kompyuter-bilan-tanishuv-design.md).

- **Yosh:** 2–4-sinf (bola oʻqiy oladi). **Kompyuter uchun** — haqiqiy klaviatura; boshida `ui.keyboardCheck`
  (sahifada bir marta). Ekran 360 px ga sigʻadi.
- **Ulanish:** «Tezkor tugmalar» Ctrl+C/V/Z ni chuqur oʻrgatadi — bu oʻyin ularni takrorlamaydi, muharrirda
  ishlashni oʻrgatadi.
- **Hikoya:** shogird oqsoqolga kompyuterda xat yozmoqchi.

## Oʻyinchoq muharrir

`stol` qatlamining oynasi («Matn»: `.oyna.faol`, `.oyna-sarlavha`, `.oyna-ichi`), `js/muharrir.js`:

- **asboblar qatori** (faqat 3-bosqich va erkin yozishda): Qalin, Kursiv, Koʻk, Yashil, Binafsha, Saqlash —
  belgi + nom, ≥ 48 px; tugma fokusni olmaydi (`mousedown` → `preventDefault`), belgilash joyida qoladi;
- **matn maydoni**: 1–2-bosqichda `<textarea>` (shrift 21 px, `spellcheck=false`, `autocapitalize/autocorrect=off`),
  3-bosqichda `contenteditable` — `execCommand("bold" | "italic" | "foreColor")`, `styleWithCSS` oʻchiq
  (`<b>`, `<i>`, `<font color>` chiqadi). Balandligi 5 qator (past ekranda 4). Qoʻyilgan matn faqat oddiy matn boʻlib tushadi;
- **Saqlash** → nom chiplari («Sheʼr», «Xat», «Roʻyxat», «Hikoya», «Bekor»).

## Bosqichlar

### 1. Kursor va tuzatish
Koʻrsatish (bola oʻzi qiladi): «makktabga» → ortiqcha harfni Backspace bilan oʻchiradi (nom: *kursor*,
Backspace — chap, Delete — oʻng); «men bugun…» → Shift + M (nom: *katta harf*).

Mashq `tuzat`: bankdagi gapga xato kiritiladi — harf tushdi / ortiqcha harf / qoʻshni harf (QWERTY) / gap boshi
kichik. Har xato alohida soʻzda, `oʻ`/`gʻ` buzilmaydi. tier 0 — 1 xato, buzilgan soʻz koʻrsatiladi; tier 1 —
koʻrsatilmaydi; tier 2 — ikki xil turdagi 2 xato. Ctrl+Enter yoʻq (Enter matnga kiradi).

### 2. Qatorlar va belgilar
Koʻrsatish: «Olma Nok Uzum» → Enter bilan uch qator; «Oyim non yopdi» → nuqta. Nom: Enter, boʻsh joy, nuqta, vergul.

Mashq navbati `qator, belgi, sarlavha, qator, belgi`:
- `qator` — bir qatorga yigʻilgan sheʼr/roʻyxat, namuna koʻrinadi; qatorlar 2 → 3 → 4 (tier);
- `belgi` — qator oxiridagi nuqta/vergul tushgan (sheʼr yoki gaplar), 1 → 2 → 3 ta;
- `sarlavha` — sarlavha birinchi qatorga yopishgan.

### 3. Belgilash va bezash
Koʻrsatish: «Bahor»ni ikki marta bosib → Qalin; «keldi» → Koʻk. Mashq `beza`: tier 0 — bitta soʻz; tier 1 —
sarlavha yoki birinchi/ikkinchi gap; tier 2 — ikki soʻz, ikki xil bezak. Bosqich oxirida **Saqlash**: bezatilgan
sheʼr nom chipi bilan saqlanadi («Saqlamasdan davom» ham bor).

## Tekshirish

- `L.teng` — qator oxiri va oxirgi boʻsh joylar/qatorlar, `\r\n`, `nbsp` eʼtiborsiz; `oʻ`/`gʻ` uchun
  `' ʼ ‘ ’ ʻ \`` qabul, qolgan apostrof — tutuq.
- `L.farq` — maslahat turi: `yetishmaydi`, `ortiqcha`, `notogri`, `katta`, `kichik`, `nuqta`, `vergul`,
  `bosh-joy`, `ortiqcha-bosh-joy`, `ortiqcha-belgi`, `qator`, `ortiqcha-qator`, `qator-joyi`, `bosh`, `boshqa`
  («2 ta joy boshqacha»). Joyini aytmaydi; ikki qatorda farq boʻlsa «Boshqa qatorda ham farq bor».
- `L.bezakTekshir(html, kutilgan, matn)` — HTML satri oʻz tahlilchimizda boʻlaklarga ajraladi (`<b>/<strong>`,
  `<i>/<em>`, `<font color>`, `style="color/font-weight/font-style"`, `&nbsp;`, `<br>`, `<div>`); matn
  oʻzgarmagan, kerakli soʻz(lar) butunlay bezalgan, boshqa soʻzlar shu bezaksiz. Natija turi: `ok`, `matn`,
  `topilmadi`, `yoq`, `qisman`, `ortiqcha` — har biriga maslahat.

## Xato javob

- 1-xato: **matn saqlanadi**, maslahat — xato turi yoki asbob nomi (`↻`).
- 2-xato: kutilgan matn (yoki bezakli namuna) koʻrsatiladi, bola uni **koʻchiradi**: matn kutilganga teng boʻlishi
  bilan oʻzi tugaydi; «Tayyor» farqni aytadi; «Oʻtkazib yuborish» bor. Bu urinish sanalmaydi — vazifa
  `practice.tries` da allaqachon «yechim koʻrsatildi» (★) boʻlib yopilgan.
- «Xato» soʻzi va qizil rang yoʻq.

## Hujjatlar

`localStorage` `matn-yozamiz:hujjatlar:v1`, 10 tagacha, `try/catch` (xotira yopiq — oʻyin baribir ishlaydi).
Roʻyxat: `f-matn` belgisi, nom, birinchi qator; **Ochish** (erkin yozishda, «Saqlash» — yangilaydi) va
ikki bosqichli **Oʻchirish** («Haqiqatan oʻchiraymi?», 4 s; `confirm()` yoʻq). Band nom — «Xat 2».
Tabrikdan va (hamma bosqich tugagach) oʻyin bosh ekranidan: «Erkin yozish», «Hujjatlar».

## Sinov ilgaklari

- `QK.current.javob` — 1–2-bosqichda kutilgan matn, 3-bosqichda `{ soz, bezak }` (tier 2 da roʻyxat).
- `QK.muharrir.matn()`, `yoz(matn)`, `tanla(soz)`, `bezat("qalin" | "kursiv" | "kok" | "yashil" | "binafsha")`,
  `html()`, `joriy()`.
- Tugmalarda `data-amal`: `tayyor`, `qalin`, `kursiv`, `rang` (+ `data-rang`), `saqlash`, `och`, `ochir`;
  nom chiplarida `data-nom`.

## Oʻquv maqsadlari

Oʻyindan keyin bola:

1. Kursorni sichqoncha bilan kerakli joyga qoʻyadi.
2. Backspace (chapdagini) va Delete (oʻngdagini) bilan harf oʻchiradi, tushib qolgan harfni qoʻshadi.
3. Shift bilan katta harf teradi; nuqta va vergulni topib teradi.
4. Enter bilan yangi qator ochadi, sheʼr/roʻyxatni qatorlarga ajratadi.
5. Soʻzni ikki marta bosib yoki sudrab belgilaydi va qalin, kursiv, rangli qiladi.
6. Hujjatni nomlab saqlaydi, keyin ochadi.

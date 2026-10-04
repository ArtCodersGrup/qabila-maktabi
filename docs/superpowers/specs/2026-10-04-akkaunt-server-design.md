# Akkauntlar va o'z serverimiz (FastAPI) — dizayn

Sana: 2026-10-04 · Holat: muallif tasdiqladi; har bo'lak uchun alohida reja (writing-plans) yoziladi.

## Kontekst
Muallif saytga akkaunt tizimini xohlaydi: admin / o'qituvchi / o'quvchi rollari, o'qituvchi sinf ochadi va o'quvchi akkauntlarini yaratadi, o'quvchilarning progressini, rekordlarini va onlayn xona natijalarini kuzatadi. Ikkinchi qaror: **Supabase'dan butunlay voz kechib, o'z VPS'ida FastAPI backend** quriladi va kelajagim.uz shu serverga ko'chiriladi.

Hozirgi holat:
- Sayt statik, GitHub Pages'da turadi.
- Progress faqat `localStorage`da. Hamma o'yinlar uni bitta joydan saqlaydi: `oyinlar/umumiy/js/storage.js` → `app.js` `finishStage`.
- Onlayn xonalar Supabase Realtime'da: `oyinlar/umumiy/js/onlayn.js`, API `join` / `xona` / `ping`. Bu API'ni 3 sahifa ishlatadi: onlayn, tog, yozuv-poygasi.
- Auth yo'q, server kodi yo'q.

Server (188.137.181.107, faqat o'qib tekshirildi):
- Ubuntu 22.04, 1 CPU, 2.4 GB RAM, diskda 9.4 GB bo'sh.
- O'rnatilgan: nginx 1.18, PostgreSQL 14, Redis, certbot, Python 3.10.
- **Shu serverda boshqa loyihalar ishlaydi:** ShifoTop (uvicorn, 8000-port), crm.medpuls.uz, TeamBoard, botqur. Ularga tegilmaydi.

## Kelishilgan qarorlar
- Kirish **ixtiyoriy**: kirmasdan ham hamma o'yin, jumladan offline, avvalgidek ishlaydi.
- Kirish usullari: **Google** yoki **login (user_id) + parol**. Telefon va SMS hozircha yo'q.
- O'qituvchi roli: so'rov yuboriladi → **admin tasdiqlaydi**. Admin rolini serverda CLI buyrug'i beradi.
- O'qituvchi yaratgan o'quvchi: email/telefon tasdiqlash yo'q.
  - Bir martalik parol beriladi va **birinchi kirishda almashtiriladi**.
  - Unutsa, o'qituvchi yangi bir martalik parol beradi.
- Mustaqil (Google) o'quvchi sinfga **6 belgili sinf kodi** bilan so'rov yuboradi, o'qituvchi qabul qiladi.
- Ism: **"Ali K."** (ism + familiya bosh harfi). Uni faqat o'qituvchi ko'radi.
- Eski brauzer progressi: akkauntga birlashtiriladi (done/hard uchun YOKI, stars uchun eng kattasi).
  - Qurilmada mehmon progressi bo'lsa, kirishda bir marta "Bu yulduzlar seniki?" deb so'raladi.
  - Chiqishda shu qurilmadagi progress tozalanadi.
- Onlayn xona natijalari faqat **kirgan o'qituvchi sinf uchun ochgan** xonada saqlanadi.
- Platforma: brauzer (telefon, planshet, kompyuter) + PWA. Mobil ilova yo'q.
- Baza: PostgreSQL (serverdagi 14-versiya, alohida baza va rol).
- Domen: **hammasi bitta serverda**: kelajagim.uz statik fayllari nginx'da, API `/api` ostida.

## Bo'laklar (har biri: spec → writing-plans → kod → test → commit/push)

### 1-bo'lak: server, domen, baza, FastAPI skeleti
- Repoga `server/` papkasi qo'shiladi: FastAPI ilovasi, `requirements.txt`, alembic, `pytest`, `deploy.sh`.
- Serverdagi tuzilish:
  - Linux foydalanuvchi `kelajagim`; `/srv/kelajagim/{sayt,api,zaxira}`.
  - Baza `kelajagim` va rol `kelajagim`, faqat o'z bazasiga huquqi bor.
  - `kelajagim-api.service`: uvicorn, `127.0.0.1:8100`, 1 worker, `MemoryMax=300M`.
  - nginx'ga **faqat yangi** `sites-enabled/kelajagim.uz` fayli qo'shiladi:
    - `/` → statik fayllar;
    - `/api/` → 8100-port;
    - `/api/ws/` → WebSocket upgrade.
  - Har nginx o'zgarishidan oldin `nginx -t`; certbot bilan HTTPS (kelajagim.uz + www).
- `deploy.sh` (Mac'dan): `rsync` (sayt + api) → `pip install` → `alembic upgrade` → `systemctl restart` → `/api/salomat` tekshiruvi.
- Zaxira: kechasi `pg_dump`, 14 kun saqlanadi (cron).
- Ko'chish tartibi:
  1. Server tayyor bo'ladi.
  2. Server IP orqali sinovdan o'tadi.
  3. **Muallif ahost'da A yozuvni almashtiradi** (kelajagim.uz va www → 188.137.181.107).
  4. certbot ishga tushiriladi.
  5. Repodan `CNAME` olib tashlanadi, GitHub Pages o'chiriladi.

### 2-bo'lak: onlayn xonalarni FastAPI WebSocket'ga ko'chirish
- Server tomoni: `/api/ws/xona/{kind}/{code}?key=&role=`.
  - Xonalar xotirada turadi; presence va broadcast server orqali.
  - Limitlar: 2 kishilik xona, tog' xonasi 12+1, kod muddati 10 daqiqa (`CODE_TTL`).
  - Xabarlar serverda ham tekshiriladi: `validMessage` qoidalari Python'ga ko'chiriladi, erkin matn o'tmaydi.
  - Xona yo'q yoki to'la bo'lsa, server darhol javob qaytaradi.
- Mijoz tomoni: `oyinlar/umumiy/js/onlayn.js` ichki qismi native `WebSocket` bilan qayta yoziladi.
  - Tashqi API va status nomlari **o'zgarmaydi**: `join`, `xona`, `ping`, `validMessage`, `makeCode`; statuslar `ready`, `missing`, `full`, `expired`, `peer-left`, `error`.
  - O'yin fayllariga tegilmaydi.
- O'chiriladi:
  - `oyinlar/umumiy/js/supabase.min.js` va 3 sahifadagi `<script>` qatori;
  - `onlayn.test.js` dagi supabase.co tekshiruvi.
  - Testlar yangilanadi: `oyinlar/yozuv-poygasi/tests/sahifa.test.js` dagi "supabase onlayndan oldin" tartib testi.
- QOIDALAR.md §8: Supabase istisnosi o'rniga "o'z serverimiz /api" yoziladi.
- Supabase "qabila-maktabi" yangi xonalar jonli saytda sinalgandan **keyin** to'xtatiladi. "kelajagim" Supabase loyihasiga tegilmaydi.

### 3-bo'lak: akkauntlar
- **Jadvallar:** `users`, `sessiyalar`, `sinflar`, `sinf_azolari`, `progress`, `rekordlar`, `xona_natijalari`.
  - `users` maydonlari: rol, oqituvchi_holati, ism, google_sub, email, login, parol_xesh, parol_almashtirsin, kim_yaratgan.
  - `sinf_azolari`: holat (so'rov/qabul).
  - `progress`: user, o'yin kaliti, done[], stars[], hard[].
  - `rekordlar`: on-barmoq tezligi, masalalar holati.
- **Auth:**
  - Google OAuth code oqimi serverda bajariladi.
  - Parol argon2 bilan xeshlanadi.
  - Sessiya: `httpOnly` + `Secure` + `SameSite=Lax` cookie, 60 kun; tokenning xeshi bazada saqlanadi.
  - POST so'rovlarda `Origin` tekshiriladi.
  - Login urinishlari cheklanadi.
  - Admin: `python -m app.cli make-admin <email>`.
- **Progress sinxroni:** `storage.js` `save()` foydalanuvchi kirgan bo'lsa yozuvni navbatga qo'yadi va `fetch(keepalive)` bilan yuboradi.
  - Bosh sahifa yuklanganda serverdagi progress olinadi va birlashtiriladi.
  - O'yinlar avvalgidek faqat localStorage'ni o'qiydi, shuning uchun offline buzilmaydi.
  - Rekordlar ham shu yo'l bilan sinxronlanadi: `masalalar:holat:v1`, `on-barmoq:rekord`.
- **Sahifalar:**
  - `kirish/`: Google, login+parol, parol almashtirish, ism so'rash, "O'qituvchiman" so'rovi.
  - Bosh sahifa menyusi: Kirish / "Ali K. ▾" → Sinfga qo'shilish, Panel, Admin, Chiqish.
  - `oqituvchi/panel/`:
    - sinflar va sinf kodi, kod bilan kelgan so'rovlar;
    - o'quvchilar jadvali: bo'limlar bo'yicha %, ★, 🔥, rekordlar;
    - o'quvchi qo'shish: bittalab yoki ro'yxat; chop etiladigan kirish kartochkalari;
    - parolni tiklash;
    - "Xonalar" menyusi: sana → natija jadvali.
  - `admin/`: o'qituvchi so'rovlari, statistika, rollar.
- **Onlayn xona + sinf:**
  - Kirgan o'qituvchi xona ochganda sinfni tanlaydi.
  - WebSocket ulanishidagi cookie orqali server o'yinchining kimligini biladi; ekranlarda ism ko'rinmaydi.
  - O'yin oxirida natija `xona_natijalari` ga yoziladi. Kirmagan o'yinchi "Mehmon" bo'lib yoziladi.
- Yangi sahifalar `bosh/sw-royxat.py` va `bosh/tests/offline.test.js` ga qo'shiladi. `/api` keshlanmaydi (sw.js hozir ham faqat same-origin GET'ni keshlaydi, `/api` ni chiqarib tashlash qo'shiladi).
- QOIDALAR.md: ism qoidasi yangilanadi (faqat "Ali K.", faqat akkauntda, faqat o'qituvchi ko'radi).

## Bajarish tartibi
1. Yuqoridagi dizayn `docs/superpowers/specs/2026-10-04-akkaunt-server-design.md` ga yoziladi va commit qilinadi. Muallif ko'rib chiqadi.
2. writing-plans skill bilan **1-bo'lak** rejasi tuziladi, keyin bajariladi. 2- va 3-bo'laklar ham shu tartibda.
3. Har bo'lak oxirida: testlar o'tadi, commit, push, deploy, jonli saytda tekshiruv.

## Muallif qo'lda qiladigan ishlar
- **ahost DNS:** kelajagim.uz va www uchun A yozuv → 188.137.181.107. Kerakli paytda aytaman.
- **Google Cloud Console:** OAuth mijoz ochish; redirect manzili `https://kelajagim.uz/api/auth/google/callback`. Qadamlarini 3-bo'lakda yozib beraman.
- **Xavfsizlik:** serverga Mac SSH kaliti qo'shilgach root paroli almashtiriladi; faqat kalit bilan kirish qoldiriladi. Parollar repoga yozilmaydi.

## Tekshiruv
- `server/`: `pytest` testlari:
  - auth: parol, sessiya, rollar, RLS o'rnidagi ruxsat tekshiruvlari ("o'qituvchi faqat o'z sinfini ko'radi");
  - WebSocket xonalar: limit, TTL, noto'g'ri xabarni tashlab yuborish;
  - progress birlashtirish.
- Front: `node --test` (mavjud testlar + yangi storage sinxroni va onlayn.js testlari).
- Brauzer (Playwright):
  - 2 kishilik va 12 kishilik xona ikkita/bir necha kontekstda;
  - o'qituvchi sinf ochadi → o'quvchi yaratadi → o'quvchi kirib, parol almashtirib o'ynaydi → paneldagi progress va xona natijasi ko'rinadi;
  - offline rejimda o'yin ishlaydi.
- Server: `nginx -t`; boshqa saytlar (crm.medpuls.uz, botqur.uz, shifotop) deploydan oldin ham, keyin ham `curl` bilan javob beradi.

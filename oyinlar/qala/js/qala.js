// Qal'a: xakerlar va himoyachilar — sof mantiq (QK.qala). Ekran va tarmoq bilan ishlamaydi, Node'da test qilinadi.
// Boshqa o'yinlarning mantiqi qayta ishlatiladi: 50 (parol kuchi), 51 (iz/xesh), 52 (firibgar xat), 03 (Sezar).
// Brauzerda index.html ularni QK.qalaLib ga ko'chiradi (QK.logic nomi bir-birini bosib yozadi), Node'da require.
// Tasodif — faqat rng argumenti (0..1 qaytaradigan funksiya). Tarmoqqa chiqadigan narsalar: karta id'lari
// (s1, r2, b3), bayroq id'lari (f1…), shifr matni (faqat a–z, ≤ 32), kalit (a–z, 3 ta).
(function (root) {
  "use strict";

  const LIB = (typeof module !== "undefined" && module.exports)
    ? { parol: require("../../50-parol-kuchi/js/logic.js"), qulf: require("../../51-bir-tomonlama-qulf/js/logic.js"),
        xat: require("../../52-firibgar-xat/js/logic.js"), caesar: require("../../03-sezar-maktubi/js/caesar.js") }
    : root.QK.qalaLib;

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));
  function aralash(list, r) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // ---------- 2. Atamalar (uz · en · ru) ----------
  const ATAMALAR = [
    { id: "parol", uz: "parol", en: "password", ru: "пароль", dars: 1,
      izoh: "Faqat egasi biladigan soʻz yoki belgilar qatori; tizim kirayotgan odamni shu bilan taniydi." },
    { id: "qopol", uz: "qoʻpol kuch", en: "brute force", ru: "перебор", dars: 1,
      izoh: "Hamma variantni ketma-ket sinab koʻrish; variant qancha koʻp boʻlsa, shuncha uzoq davom etadi." },
    { id: "lugat", uz: "lugʻat hujumi", en: "dictionary attack", ru: "словарная атака", dars: 1,
      izoh: "Avval mashhur soʻzlar, ismlar va yillar roʻyxati sinaladi; lugʻatdagi parol bir zumda topiladi." },
    { id: "ibora", uz: "parol-ibora", en: "passphrase", ru: "парольная фраза", dars: 1,
      izoh: "Bir necha soʻzdan tuzilgan uzun parol; esda qoladi, variantlari esa juda koʻp." },
    { id: "xesh", uz: "xesh (iz)", en: "hash", ru: "хеш", dars: 2,
      izoh: "Paroldan hisoblanadigan son; undan parolni qaytarib boʻlmaydi." },
    { id: "tuz", uz: "tuz", en: "salt", ru: "соль", dars: 2,
      izoh: "Izdan oldin parolga qoʻshiladigan saytga xos son; bir xil parol har saytda boshqa iz beradi." },
    { id: "jadval", uz: "tayyor jadval", en: "rainbow table", ru: "радужная таблица", dars: 2,
      izoh: "Mashhur parollarning oldindan hisoblangan izlari; tuz boʻlsa jadval ishlamaydi." },
    { id: "shifr", uz: "shifr", en: "cipher", ru: "шифр", dars: 3,
      izoh: "Matnni oʻqib boʻlmaydigan koʻrinishga oʻtkazish qoidasi; kalitni bilgan odam qaytarib oʻqiydi." },
    { id: "kalit", uz: "kalit", en: "key", ru: "ключ", dars: 3,
      izoh: "Shifrni ochadigan sir: Sezarda — siljish soni, kalitli shifrda — qisqa soʻz." },
    { id: "chastota", uz: "chastota tahlili", en: "frequency analysis", ru: "частотный анализ", dars: 3,
      izoh: "Shifrdagi harflar nechta uchraganini sanash; eng koʻp uchragani odatda «a» harfi boʻladi." },
    { id: "vijener", uz: "kalitli shifr", en: "Vigenère cipher", ru: "шифр Виженера", dars: 3,
      izoh: "Har harf kalitning oʻz harfi bilan siljiydi; bunda chastota tahlili oson ishlamaydi." },
    { id: "fishing", uz: "fishing", en: "phishing", ru: "фишинг", dars: 4,
      izoh: "Haqiqiy tashkilot nomidan yozilgan soxta xat; maqsadi — parol, kod yoki havola bosilishi." },
    { id: "ijtimoiy", uz: "ijtimoiy muhandislik", en: "social engineering", ru: "социальная инженерия", dars: 4,
      izoh: "Texnikani emas, odamni aldash: shoshiltirish, qoʻrqitish, ishonchga kirish." },
    { id: "domen", uz: "domen", en: "domain", ru: "домен", dars: 4,
      izoh: "Manzildagi zonadan oldingi nom; saytning egasini shu nom bildiradi." },
    { id: "ikki", uz: "ikki qadamli tekshiruv", en: "two-factor (2FA)", ru: "двухфакторная аутентификация", dars: 5,
      izoh: "Paroldan tashqari ikkinchi tekshiruv — telefondagi kod; parol oshkor boʻlsa ham kod kerak." },
    { id: "xaker", uz: "xaker", en: "hacker", ru: "хакер", dars: 5,
      izoh: "Tizimning zaif joyini topadigan odam; niyati yaxshi ham, yomon ham boʻlishi mumkin." },
    { id: "oqshlyapa", uz: "oq shlyapa", en: "white hat", ru: "белая шляпа", dars: 5,
      izoh: "Zaif joyni egasining ruxsati bilan topib, unga xabar beradigan xaker." },
    { id: "ruxsat", uz: "ruxsat", en: "permission", ru: "разрешение", dars: 5,
      izoh: "Tizimni tekshirishga egasining yozma roziligi; usiz tekshiruv ham qonunbuzarlik." },
    { id: "byudjet", uz: "himoya byudjeti", en: "security budget", ru: "бюджет защиты", dars: 5,
      izoh: "Himoyaga ajratilgan ochko va vaqt; hammasini birdan qurib boʻlmaydi, eng kerakligi tanlanadi." },
  ];
  const atama = (id) => ATAMALAR.find((a) => a.id === id) || null;

  // ---------- Kartalar: parol shulardan yig'iladi ----------
  // So'zlar faqat a–z (shifr va iz alifbosi shu). Birinchi 10 tasi — lug'atdagi oddiy so'z, 6 tasi kam uchraydigan.
  const LUGAT = ["olma", "kitob", "maktab", "parol", "salom", "futbol", "mushuk", "quyosh", "bahor", "dost"];
  const KAM = ["zumrad", "qaldirgoch", "tuyaqush", "sirtlon", "kaklik", "burgut"];
  const KARTALAR = {
    soz: LUGAT.concat(KAM).map((matn, i) => ({ id: "s" + (i + 1), matn, tur: "soz" })),
    raqam: ["1", "7", "12", "99", "123", "2010", "2024", "0"].map((matn, i) => ({ id: "r" + (i + 1), matn, tur: "raqam" })),
    belgi: ["!", "?", "#", "_", "-", "@"].map((matn, i) => ({ id: "b" + (i + 1), matn, tur: "belgi" })),
  };
  const HAMMA_KARTA = KARTALAR.soz.concat(KARTALAR.raqam, KARTALAR.belgi);
  const karta = (id) => HAMMA_KARTA.find((k) => k.id === id) || null;
  const TUR_NOMI = { soz: "soʻz", raqam: "raqam", belgi: "belgi" };

  // ≤ 4 karta, tartib bilan; noto'g'ri id → null
  function parolYasa(ids) {
    if (!Array.isArray(ids) || !ids.length || ids.length > 4) return null;
    const kartalar = ids.map(karta);
    if (kartalar.some((k) => !k)) return null;
    return kartalar.map((k) => k.matn).join("");
  }

  // ---------- Parol kuchi (50-logic ustida) ----------
  const TEZLIK = 1000000n; // o'yin tezligi: soniyada 1 000 000 variant
  const LUGAT_VARIANT = 1000n; // lug'at hujumi: 10 so'z × 100 qo'shimcha — bir zumda

  // Lug'atda bormi: 50-logic (mashhur, ism, yil) yoki bizning oddiy so'z (oxiridagi raqam va belgilar olib tashlanadi)
  function lugatda(parol) {
    const p = String(parol || "").toLowerCase();
    if (LIB.parol.lugatda(p)) return true;
    return LUGAT.includes(p.replace(/[^a-z]+$/, ""));
  }

  // { variant, soniya, lugatda, daraja 0–3, matn }: 0 — lug'at/bir zumda, 1 — bir daqiqadan kam, 2 — bir kundan kam, 3 — uzoq
  function parolKuch(parol) {
    const p = String(parol || "");
    const lugat = lugatda(p);
    const variant = lugat ? LUGAT_VARIANT : LIB.parol.tahlil(p).variant;
    const sek = variant / TEZLIK;
    const soniya = Number(sek);
    const daraja = lugat || soniya < 1 ? 0 : soniya < 60 ? 1 : soniya < 86400 ? 2 : 3;
    const matn = lugat ? "lugʻatda bor — bir zumda topiladi" : LIB.parol.vaqtMatni(sek);
    return { variant, soniya, lugatda: lugat, daraja, matn };
  }

  // Raqibga ko'rinadigan maslahat kodi: tarmoqqa shu ketadi (son va kalit so'zlar)
  function maslahatKod(ids) {
    const kartalar = (ids || []).map(karta).filter(Boolean);
    const sozlar = kartalar.filter((k) => k.tur === "soz");
    return {
      uzunlik: kartalar.reduce((n, k) => n + k.matn.length, 0),
      turlar: kartalar.map((k) => k.tur),
      lugat: !sozlar.length ? 2 : sozlar.some((k) => LUGAT.includes(k.matn)) ? 1 : 0, // 0 — yo'q, 1 — bor, 2 — so'z yo'q
    };
  }
  // Kod → 3 ta maslahat matni
  function maslahatMatn(kod) {
    const turlar = kod.turlar.map((t) => TUR_NOMI[t] || t).join(" + ");
    const birinchi = turlar ? turlar[0].toUpperCase() + turlar.slice(1) : "Karta yoʻq";
    return ["Uzunligi " + kod.uzunlik, birinchi,
      kod.lugat === 2 ? "Soʻz yoʻq" : kod.lugat === 1 ? "Soʻz lugʻatda bor" : "Soʻz lugʻatda yoʻq"];
  }
  const parolMaslahat = (ids) => maslahatMatn(maslahatKod(ids));

  // ---------- Iz (xesh) — 51-logic qayta eksport; tuz 0 (yo'q) yoki 1..99 ----------
  const iz = (parol, tuz) => LIB.qulf.iz(parol, tuz || 0);
  const izQadamlar = (parol, tuz) => LIB.qulf.izQadamlar(parol, tuz || 0);
  const izHisob = (parol, tuz) => LIB.qulf.izHisob(parol, tuz || 0);

  // Tayyor jadval: barcha bitta so'z va so'z + raqam juftliklari (16 + 16 × 8 = 144)
  function jadval(tuz) {
    const out = [];
    for (const s of KARTALAR.soz) {
      out.push({ parol: s.matn, iz: iz(s.matn, tuz) });
      for (const r of KARTALAR.raqam) out.push({ parol: s.matn + r.matn, iz: iz(s.matn + r.matn, tuz) });
    }
    return out;
  }
  const jadvaldan = (izQiymat, tuz) => jadval(tuz).filter((x) => x.iz === Number(izQiymat)).map((x) => x.parol);

  // ---------- Bayroqlar va shifr (faqat a–z) ----------
  // Har bayroqning o'z gapi bor (≤ 32 harf, bo'shliqsiz): shifr matni shu — chastota tahlili uchun yetarli uzun,
  // «a» har gapda eng ko'p uchraydi (sezarTaxmin ishlashi uchun; test tekshiradi).
  const BAYROQLAR = [
    { id: "f1", soz: "qalqon", gap: "qalaningdarvozasidaqalqonbor" },
    { id: "f2", soz: "bayroq", gap: "qalaustidabayroqhilpiramoqda" },
    { id: "f3", soz: "minora", gap: "baladminoradanqarasaqalakorinadi" },
    { id: "f4", soz: "darvoza", gap: "qalaningdarvozasikechqulflanadi" },
    { id: "f5", soz: "qorovul", gap: "qorovulqalanikechasidaqoriqlaydi" },
    { id: "f6", soz: "qilich", gap: "sarbozqilichinidarvozadasaqlaydi" },
    { id: "f7", soz: "nayza", gap: "nayzaqalaningasosiyquroliedi" },
    { id: "f8", soz: "dubulga", gap: "sarbozboshidadubulgabilanturadi" },
    { id: "f9", soz: "sovut", gap: "sarbozsovutkiyibqalanisaqlaydi" },
    { id: "f10", soz: "kamon", gap: "kamonbilanqalanihimoyaqiladi" },
    { id: "f11", soz: "tulpor", gap: "tulporqalagaxabarnitezolibkeladi" },
    { id: "f12", soz: "lashkar", gap: "lashkarqalaatrofidaqarorgohqurdi" },
  ];
  const bayroq = (id) => BAYROQLAR.find((b) => b.id === id) || null;

  const ALIFBO = "abcdefghijklmnopqrstuvwxyz";
  const KALIT_VARIANT = 17576; // 26 × 26 × 26
  const tozala = (m) => String(m || "").toLowerCase().replace(/[^a-z]/g, "");
  const harfSilji = (ch, k) => ALIFBO[(((ALIFBO.indexOf(ch) + k) % 26) + 26) % 26];

  // Sezar: har harf k ga siljiydi. (03-caesar o'zbek 29 harfli alifboda, c va w yo'q — shu uchun 26 harfli siljish bu yerda)
  const sezar = (m, k) => [...tozala(m)].map((ch) => harfSilji(ch, Number(k) || 0)).join("");
  const sezarOch = (m, k) => sezar(m, -(Number(k) || 0));

  // Kalitli shifr (Vijener): harf i → siljish kalit[i % 3] (a = 0 … z = 25)
  const kalitTogri = (kalit) => /^[a-z]{3}$/.test(String(kalit || ""));
  function vijener(m, kalit, och) {
    if (!kalitTogri(kalit)) return null;
    return [...tozala(m)].map((ch, i) => harfSilji(ch, (och ? -1 : 1) * ALIFBO.indexOf(kalit[i % 3]))).join("");
  }
  const vijenerOch = (m, kalit) => vijener(m, kalit, true);

  // 26 ta harf: soni kamayish tartibida, teng bo'lsa alifbo bo'yicha (0 bo'lganlar ham)
  function chastota(m) {
    const t = tozala(m);
    return [...ALIFBO].map((harf) => ({ harf, soni: [...t].filter((ch) => ch === harf).length }))
      .sort((a, b) => b.soni - a.soni || (a.harf < b.harf ? -1 : 1));
  }
  // Eng ko'p uchragan harf «a» deb olinadi → k. Qisqa matnda xato bo'lishi mumkin — bu o'yinning bir qismi.
  const sezarTaxmin = (m) => ALIFBO.indexOf(chastota(m)[0].harf);

  // ---------- Xat qismlari (fishing yasagich) ----------
  const BELGILAR = LIB.xat.BELGILAR;
  const XAT_QISMLAR = {
    kimdan: [
      { id: "k1", matn: "Qabila bank <xabar@qabilabank.uz>", shubhali: false },
      { id: "k2", matn: "Maktab tizimi <xabar@maktab.uz>", shubhali: false },
      { id: "k3", matn: "Sinf rahbari <rahbar@maktab.uz>", shubhali: false },
      { id: "k4", matn: "Qabila bank <xavfsizlik@tez-pochta.site>", shubhali: true },
      { id: "k5", matn: "Maktab tizimi <admin@qabi1amaktab.uz>", shubhali: true },
      { id: "k6", matn: "Sovgʻa xizmati <sovga@yutuq-markaz.top>", shubhali: true },
    ],
    mavzu: [
      { id: "m1", matn: "Hisobing haqida xabar" },
      { id: "m2", matn: "Dars jadvali oʻzgardi" },
      { id: "m3", matn: "Kartadan xarid: 25 000 soʻm" },
      { id: "m4", matn: "Hisobingni tasdiqla" },
      { id: "m5", matn: "Diqqat: hisobing yopiladi" },
      { id: "m6", matn: "Sen sovrin yutding" },
    ],
    // asl — haqiqiy manzil (52: domenFarqi shu bilan solishtiradi); nozik — ko'zga deyarli bir xil
    havola: [
      { id: "h1", matn: "qabilabank.uz", soxta: false, nozik: false, asl: "qabilabank.uz" },
      { id: "h2", matn: "maktab.uz", soxta: false, nozik: false, asl: "maktab.uz" },
      { id: "h3", matn: "qabi1abank.uz", soxta: true, nozik: true, asl: "qabilabank.uz" },
      { id: "h4", matn: "qabila-bank.uz.xyz", soxta: true, nozik: false, asl: "qabilabank.uz" },
      { id: "h5", matn: "maktab-uz.com", soxta: true, nozik: true, asl: "maktab.uz" },
      { id: "h6", matn: "qabilabank.co", soxta: true, nozik: false, asl: "qabilabank.uz" },
    ],
    // belgi — 52 BELGILAR id'si yoki null (oddiy gap). "parol" — kod so'raladi (ilmoq: kod)
    gap: [
      { id: "g1", matn: "Hisobingda yangi harakat bor, tafsilotlar havolada.", belgi: null },
      { id: "g2", matn: "Yangi jadval havolada turibdi, savol boʻlsa sinf rahbaringga ayt.", belgi: null },
      { id: "g3", matn: "Hisobni tasdiqlash uchun telefoningga kelgan kodni javob xatida yubor.", belgi: "parol" },
      { id: "g4", matn: "Kirish uchun parolingni va SMS kodni shu yerga yoz.", belgi: "parol" },
      { id: "g5", matn: "Bir soat ichida havolani bosmasang, kech boʻladi.", belgi: "shoshiltirish" },
      { id: "g6", matn: "Javob bermasang, hisobing butunlay yopiladi.", belgi: "qorqitish" },
      { id: "g7", matn: "Tabriklaymiz, sening raqaming sovrin uchun tanlandi.", belgi: "yutuq" },
      { id: "g8", matn: "Buni hech kimga, kattalarga ham aytma.", belgi: "sir" },
    ],
    imzo: [
      { id: "i1", matn: "Qabila bank, mijozlar boʻlimi", shubhali: false },
      { id: "i2", matn: "Maktab maʼmuriyati", shubhali: false },
      { id: "i3", matn: "Xavfsizlik boʻlimi — javob tez kerak", shubhali: true },
      { id: "i4", matn: "Admin", shubhali: true },
    ],
  };
  const OSHKORA = ["shoshiltirish", "qorqitish", "yutuq", "sir", "pul", "imlo"];
  const qism = (tur, id) => XAT_QISMLAR[tur].find((q) => q.id === id) || null;

  // Xat yasash: qismlar id'lari → xat. Ilmoq (soxta havola yoki kod so'rash) bo'lmasa — bu hujum emas → null.
  // ishonch: 100 − 25 × oshkora belgi − 10 × shubhali kimdan/imzo − 15 × oshkora soxta havola (nozik soxta ayirilmaydi)
  function xatYasa(ids) {
    if (!ids) return null;
    const q = { kimdan: qism("kimdan", ids.kimdan), mavzu: qism("mavzu", ids.mavzu), havola: qism("havola", ids.havola),
      gap: qism("gap", ids.gap), imzo: qism("imzo", ids.imzo) };
    if (Object.values(q).some((x) => !x)) return null;
    const kod = q.gap.belgi === "parol";
    const ilmoq = kod ? "kod" : q.havola.soxta ? "havola" : null;
    if (!ilmoq) return null;
    const belgilar = [];
    if (q.gap.belgi) belgilar.push(q.gap.belgi);
    if (q.havola.soxta) belgilar.push("manzil");
    let ishonch = 100 - 25 * belgilar.filter((b) => OSHKORA.includes(b)).length
      - 10 * (q.kimdan.shubhali ? 1 : 0) - 10 * (q.imzo.shubhali ? 1 : 0) - 15 * (q.havola.soxta && !q.havola.nozik ? 1 : 0);
    ishonch = Math.max(0, Math.min(100, ishonch));
    return { qismlar: q, ids: { kimdan: ids.kimdan, mavzu: ids.mavzu, havola: ids.havola, gap: ids.gap, imzo: ids.imzo },
      belgilar, ilmoq, ishonch, soxta: true };
  }

  // Haqiqiy xat: ishonchli kimdan, haqiqiy havola, belgisiz gap, ishonchli imzo
  function haqiqiyXat(rng) {
    const r = rng || Math.random;
    const ok = (tur) => XAT_QISMLAR[tur].filter((x) => !x.shubhali);
    const q = { kimdan: pick(ok("kimdan"), r), mavzu: pick(XAT_QISMLAR.mavzu.slice(0, 3), r),
      havola: pick(XAT_QISMLAR.havola.filter((h) => !h.soxta), r), gap: pick(XAT_QISMLAR.gap.filter((g) => !g.belgi), r), imzo: pick(ok("imzo"), r) };
    return { qismlar: q, ids: { kimdan: q.kimdan.id, mavzu: q.mavzu.id, havola: q.havola.id, gap: q.gap.id, imzo: q.imzo.id },
      belgilar: [], ilmoq: null, ishonch: 100, soxta: false };
  }

  // Qorovulga tahlil: xatdagi belgilar nomi va izohi bilan (manzil — 52 domenFarqi izohi bilan)
  function xatBelgilari(xat) {
    if (!xat) return [];
    return xat.belgilar.map((id) => {
      const b = LIB.xat.belgi(id);
      let izoh = b ? b.izoh : "";
      if (id === "manzil" && xat.qismlar && xat.qismlar.havola) {
        const h = xat.qismlar.havola;
        const f = LIB.xat.domenFarqi(h.asl, h.matn);
        izoh = h.matn + " — " + (LIB.xat.gumonliZona(h.matn) ? LIB.xat.FARQ_IZOH.gumonli : f.izoh);
      }
      return { id, nom: b ? b.nom : id, izoh };
    });
  }

  // Xat filtri (himoya fazasi): 6 ta xat, 3 tasi firibgar. Belgilanmagan firibgar xat — tayyor darvoza.
  const FILTR_XATLAR = [
    Object.assign({ id: "x1" }, haqiqiyXatIds({ kimdan: "k1", mavzu: "m1", havola: "h1", gap: "g1", imzo: "i1" })),
    Object.assign({ id: "x2" }, xatYasa({ kimdan: "k4", mavzu: "m4", havola: "h3", gap: "g3", imzo: "i3" })),
    Object.assign({ id: "x3" }, haqiqiyXatIds({ kimdan: "k2", mavzu: "m2", havola: "h2", gap: "g2", imzo: "i2" })),
    Object.assign({ id: "x4" }, xatYasa({ kimdan: "k1", mavzu: "m5", havola: "h4", gap: "g5", imzo: "i1" })),
    Object.assign({ id: "x5" }, haqiqiyXatIds({ kimdan: "k3", mavzu: "m2", havola: "h2", gap: "g2", imzo: "i2" })),
    Object.assign({ id: "x6" }, xatYasa({ kimdan: "k2", mavzu: "m4", havola: "h5", gap: "g4", imzo: "i4" })),
  ];
  function haqiqiyXatIds(ids) {
    const q = { kimdan: qism("kimdan", ids.kimdan), mavzu: qism("mavzu", ids.mavzu), havola: qism("havola", ids.havola),
      gap: qism("gap", ids.gap), imzo: qism("imzo", ids.imzo) };
    return { qismlar: q, ids, belgilar: [], ilmoq: null, ishonch: 100, soxta: false };
  }

  // ---------- Ijtimoiy muhandislik: dialoglar (faqat tanish uchun, hujum yo'riqnomasi emas) ----------
  const DIALOGLAR = [
    { id: "d1", vaziyat: "Telefon qoʻngʻirogʻi: «bank xodimi»", hiyla: "parol",
      gaplar: ["Salom, Qabila bankdanman. Kartangizda shubhali harakat bor.", "Toʻxtatish uchun hozir telefoningizga kelgan kodni ayting."],
      javoblar: [
        { matn: "Kodni aytmayman, bankning oʻz raqamiga oʻzim qoʻngʻiroq qilaman.", togri: true, izoh: "Bank kodni hech qachon soʻramaydi; haqiqiy xodim buni biladi." },
        { matn: "Kodni aytaman, u bank xodimi-ku.", togri: false, izoh: "Kim ekanini tekshirib boʻlmaydi — qoʻngʻiroq qilgan har kim «bankdanman» deydi." },
        { matn: "Kodning faqat yarmini aytaman.", togri: false, izoh: "Kodning yarmi ham kod; soʻraganning oʻzi — belgi." }] },
    { id: "d2", vaziyat: "Chat: doʻstingning hisobidan xabar", hiyla: "pul",
      gaplar: ["Salom, bu men. Telefonim buzildi, boshqa raqamdan yozyapman.", "Menga hozir 50 ming kerak, kechqurun qaytaraman. Tez tashlab yubor."],
      javoblar: [
        { matn: "Doʻstimning oʻziga qoʻngʻiroq qilib soʻrayman.", togri: true, izoh: "Hisob oʻgʻirlangan boʻlishi mumkin; ovozini eshitsang — hammasi ayon." },
        { matn: "Pulni tashlayman, doʻstim qiynalyapti.", togri: false, izoh: "«Tez» va «pul» birga kelsa — bu firibgarlikning odatiy koʻrinishi." },
        { matn: "Kim ekanini chatda soʻrayman.", togri: false, izoh: "Chatda yozgan odam doʻstingning hamma maʼlumotini oʻqib turibdi — javob toʻgʻri chiqadi." }] },
    { id: "d3", vaziyat: "Xabar: «oʻqituvchi» yangi raqamdan", hiyla: "shoshiltirish",
      gaplar: ["Bu sening informatika oʻqituvchingman, yangi raqamim.", "Baholarni tizimga kiritishim kerak, hoziroq tizimdagi loginingni va parolingni yubor."],
      javoblar: [
        { matn: "Parolni yubormayman, ertaga maktabda oʻqituvchining oʻzidan soʻrayman.", togri: true, izoh: "Oʻqituvchi oʻquvchi parolini soʻramaydi; tizimda uning oʻz kirishi bor." },
        { matn: "Yuboraman, baholarim yozilmay qolmasin.", togri: false, izoh: "Shoshiltirish — oʻylashga vaqt bermaslik uchun; bahoni parolsiz ham yozadi." },
        { matn: "Faqat loginni yuboraman, parolni emas.", togri: false, izoh: "Login ham maʼlumot; soʻrovning oʻzi notoʻgʻri — notanish raqamga hech narsa yuborilmaydi." }] },
    { id: "d4", vaziyat: "Oʻyin ichida xabar: «sovrin»", hiyla: "yutuq",
      gaplar: ["Tabriklaymiz, sen oʻyinning haftalik sovrinini yutding: 10 000 tanga.", "Olish uchun oʻyin parolingni shu yerga yoz, 10 daqiqa ichida."],
      javoblar: [
        { matn: "Yozmayman: qatnashmagan tanlovda sovrin boʻlmaydi.", togri: true, izoh: "Sovrin berish uchun parol kerak emas; parol soʻralgan joyda sovrin yoʻq." },
        { matn: "Parolni yozaman, tanga koʻp-ku.", togri: false, izoh: "Parolni bergan odam hisobini beradi; tanga oʻrniga hisob yoʻqoladi." },
        { matn: "Avval tangani bersin, keyin parolni yozaman.", togri: false, izoh: "Savdolashish ham xato: parol hech qachon, hech kimga berilmaydi." }] },
    { id: "d5", vaziyat: "Qoʻngʻiroq: «texnik yordam»", hiyla: "qorqitish",
      gaplar: ["Kompyuteringizda virus topildi, u hamma faylni oʻchirmoqda.", "Hozir aytgan dasturimni oʻrnating va masofadan kirishga ruxsat bering, boʻlmasa hammasi yoʻqoladi."],
      javoblar: [
        { matn: "Hech narsa oʻrnatmayman, kattalarga aytaman.", togri: true, izoh: "Haqiqiy texnik yordam oʻzi qoʻngʻiroq qilmaydi; qoʻrqitish — hiylaning oʻzi." },
        { matn: "Dasturni oʻrnataman, fayllarim yoʻqolmasin.", togri: false, izoh: "Masofadan kirish — kompyuterning kalitini notanish odamga berish." },
        { matn: "Virus bor-yoʻqligini aytib bersin, keyin qaror qilaman.", togri: false, izoh: "Qoʻngʻiroq qilgan odam kompyuteringni koʻrmaydi; «virus» — qoʻrqitish uchun." }] },
    { id: "d6", vaziyat: "SMS: «kuryer»", hiyla: "manzil",
      gaplar: ["Buyurtmangiz omborda. Yetkazishni tasdiqlash uchun havolani bosing: pochta-uz.xyz", "Tasdiqlanmasa, buyurtma ertaga qaytariladi."],
      javoblar: [
        { matn: "Havolani bosmayman, buyurtmani rasmiy ilovadan oʻzim tekshiraman.", togri: true, izoh: "Manzil zonasi .xyz — rasmiy pochta bunday zonada turmaydi." },
        { matn: "Bosaman, buyurtma qaytib ketmasin.", togri: false, izoh: "Havola soxta saytga olib boradi; u yerda karta yoki parol soʻraladi." },
        { matn: "Havolani doʻstimga yuboraman, u tekshirsin.", togri: false, izoh: "Soxta havolani tarqatish — doʻstingni ham xavfga qoʻyish." }] },
    { id: "d7", vaziyat: "Xabar: «ijtimoiy tarmoq admini»", hiyla: "qorqitish",
      gaplar: ["Men tarmoq adminiman. Sahifangizda qoidabuzarlik bor.", "Bloklanmaslik uchun 1 soat ichida parolingizni tasdiqlash uchun yuboring."],
      javoblar: [
        { matn: "Yubormayman: admin parolni soʻramaydi, u tizimda oʻzi koʻradi.", togri: true, izoh: "Haqiqiy admin parolni bilishi shart emas; «1 soat» — shoshiltirish." },
        { matn: "Yuboraman, sahifam bloklanmasin.", togri: false, izoh: "Parol yuborilgan zahoti sahifa haqiqatan oʻzgaga oʻtadi." },
        { matn: "Eski parolimni yuboraman, yangisini emas.", togri: false, izoh: "Soʻrovning oʻzi soxta; qaysi parol ekani muhim emas." }] },
    { id: "d8", vaziyat: "Qoʻngʻiroq: «qarindosh» begona raqamdan", hiyla: "sir",
      gaplar: ["Salom, men amakingning doʻstiman, u hozir gapira olmaydi.", "U uyingizdagi Wi-Fi parolini soʻrayapti. Onangga aytma, uni bezovta qilmaylik."],
      javoblar: [
        { matn: "Parolni aytmayman va darhol onamga aytaman.", togri: true, izoh: "«Kattalarga aytma» — eng aniq belgi; yaxshi niyatli odam buni soʻramaydi." },
        { matn: "Aytaman, amakimning doʻsti-ku.", togri: false, izoh: "Qoʻngʻiroq qilgan odam kim ekanini tekshirib boʻlmaydi." },
        { matn: "Amakim oʻzi qoʻngʻiroq qilsin, deyman, lekin onamga aytmayman.", togri: false, izoh: "Yarim toʻgʻri: tekshirish yaxshi, lekin sir tutish soʻralgan zahoti kattalarga aytiladi." }] },
    { id: "d9", vaziyat: "Chat: «oʻyin doʻsti» kod soʻraydi", hiyla: "parol",
      gaplar: ["Senga sovgʻa yubormoqchiman, lekin tizim tasdiq soʻrayapti.", "Telefoningga kod keladi, uni menga yozib yubor, shunda sovgʻa oʻtadi."],
      javoblar: [
        { matn: "Kodni yubormayman: u mening hisobimga kirish kaliti.", togri: true, izoh: "Kod senga keldi — demak, kimdir sening hisobingga kirmoqchi." },
        { matn: "Yuboraman, sovgʻa oʻtsin.", togri: false, izoh: "Kod bilan hisobga kiradi va parolni oʻzgartiradi." },
        { matn: "Kodni yuboraman, lekin keyin parolni oʻzgartiraman.", togri: false, izoh: "Kod yuborilgan zahoti hisob qoʻldan ketadi; keyin parolni oʻzgartirib boʻlmaydi." }] },
  ];

  // ---------- Devorlar, byudjet va hujumchi profillari (5-dars) ----------
  const BYUDJET = 10;
  const HIMOYA_DAQIQA = 5; // himoya fazasi; har devor qurish vaqt oladi — bu ikkinchi cheklov
  const DEVORLAR = [
    { id: "parol", nom: "Parol", tanlov: [
      { id: "oddiy", nom: "Oddiy parol (bitta soʻz)", narx: 0, daqiqa: 0, izoh: "Lugʻatdagi soʻz — lugʻat hujumi bir zumda topadi." },
      { id: "kuchli", nom: "Kuchli parol (3–4 karta)", narx: 0, daqiqa: 1, izoh: "Uzun va lugʻatda yoʻq — qoʻpol kuchga vaqt yetmaydi." }] },
    { id: "qulf", nom: "Qulf (iz)", tanlov: [
      { id: "tuzsiz", nom: "Tuzsiz iz", narx: 0, daqiqa: 0, izoh: "Iz tayyor jadvalda boʻlsa, parol darhol topiladi." },
      { id: "tuz", nom: "Tuz bilan iz", narx: 3, daqiqa: 2, izoh: "Tuz jadvalni ishdan chiqaradi: izlar boshqa chiqadi." }] },
    { id: "shifr", nom: "Shifr", tanlov: [
      { id: "sezar", nom: "Sezar (siljish)", narx: 0, daqiqa: 1, izoh: "25 ta kalit; chastota tahlili bir urinishda ochadi." },
      { id: "kalitli", nom: "Kalitli shifr", narx: 4, daqiqa: 2, izoh: "17 576 ta kalit; chastota ishlamaydi — faqat kalit sizsa ochiladi." }] },
    { id: "xat", nom: "Xat filtri", tanlov: [
      { id: "filtrsiz", nom: "Filtrsiz", narx: 0, daqiqa: 0, izoh: "Firibgar xat pochtada qoladi — tayyor darvoza." },
      { id: "filtr", nom: "Xatlar tekshirilgan", narx: 0, daqiqa: 1, izoh: "Firibgar xatlar belgilangan; qorovullar ogoh." }] },
    { id: "ikki", nom: "Ikki qadamli tekshiruv", tanlov: [
      { id: "yoq", nom: "Yoʻq", narx: 0, daqiqa: 0, izoh: "Parol ochilsa — qalʼa ochiq." },
      { id: "ikki", nom: "Bor", narx: 2, daqiqa: 1, izoh: "Parol ochilsa ham kod kerak; kod faqat fishing orqali sizadi." }] },
  ];
  // Hujumchi profili: qaysi devorga qaysi qurol bilan keladi
  const PROFILLAR = [
    { id: "lugat", nom: "Lugʻatchi", qurollar: ["lugʻat hujumi", "taxmin", "fishing"], hujum: { parol: "lugat", xat: "fishing" },
      izoh: "Mashhur soʻzlarni va maslahatdan taxminni sinaydi, qorovullarga soxta xat yuboradi. Jadval va chastotani bilmaydi." },
    { id: "jadval", nom: "Jadvalchi", qurollar: ["tayyor jadval", "iz hisoblash", "qoʻpol kuch"], hujum: { parol: "qopol", qulf: "jadval" },
      izoh: "Tuzsiz izni tayyor jadvaldan topadi, parolga qoʻpol kuch bilan keladi. Xat yozmaydi, shifrni ochmaydi." },
    { id: "chastota", nom: "Shifrchi", qurollar: ["chastota tahlili", "fishing"], hujum: { shifr: "chastota", xat: "fishing" },
      izoh: "Sezar shifrini chastota bilan ochadi, kalitni fishing orqali sizdirmoqchi boʻladi. Parol va qulfga tegmaydi." },
  ];
  const profil = (id) => PROFILLAR.find((p) => p.id === id) || null;
  const tanlovNarxi = (tanlov) => DEVORLAR.reduce((acc, d) => {
    const t = d.tanlov.find((x) => x.id === (tanlov || {})[d.id]) || d.tanlov[0];
    return { narx: acc.narx + t.narx, daqiqa: acc.daqiqa + t.daqiqa };
  }, { narx: 0, daqiqa: 0 });

  // tanlov: { devorId: tanlovId }. Natija: har devor turadimi va nega; ok — hammasi turadi, byudjet va vaqt yetadi
  function byudjetBaho(tanlov, prof) {
    const p = typeof prof === "string" ? profil(prof) : prof;
    const t = Object.assign({ parol: "oddiy", qulf: "tuzsiz", shifr: "sezar", xat: "filtrsiz", ikki: "yoq" }, tanlov || {});
    const h = (p && p.hujum) || {};
    const parolTuradi = !h.parol || t.parol === "kuchli";
    const xatTuradi = !h.xat || t.xat === "filtr";
    const devorlar = [
      { id: "parol", turdi: parolTuradi, sabab: !h.parol ? "Bu hujumchi parolga tegmaydi." : parolTuradi ? "Kuchli parol: lugʻatda yoʻq, variantlar koʻp." : "Oddiy soʻz — lugʻat yoki qoʻpol kuch darhol topadi." },
      { id: "qulf", turdi: !h.qulf || t.qulf === "tuz", sabab: !h.qulf ? "Bu hujumchi jadval ishlatmaydi." : t.qulf === "tuz" ? "Tuz bor — tayyor jadval mos kelmaydi." : "Tuzsiz iz jadvalda bor — parol topildi." },
      { id: "shifr", turdi: !h.shifr || t.shifr === "kalitli", sabab: !h.shifr ? "Bu hujumchi shifrga tegmaydi." : t.shifr === "kalitli" ? "Kalitli shifr — chastota ishlamaydi." : "Sezar — chastota tahlili siljishni topdi." },
      { id: "xat", turdi: xatTuradi, sabab: !h.xat ? "Bu hujumchi xat yozmaydi." : xatTuradi ? "Xatlar tekshirilgan — soxtasi ochilmadi." : "Tekshirilmagan pochta — soxta xat ochildi." },
    ];
    if (t.ikki === "ikki") {
      const turdi = parolTuradi || xatTuradi; // kod faqat fishing orqali sizadi
      devorlar.push({ id: "ikki", turdi, sabab: turdi ? "Kod sizmadi — parol ochilsa ham kirish yoʻq." : "Parol ham ochildi, kod ham xat orqali sizdi." });
    }
    const { narx, daqiqa } = tanlovNarxi(t);
    const xato = narx > BYUDJET ? "byudjet" : daqiqa > HIMOYA_DAQIQA ? "vaqt" : null;
    return { ok: !xato && devorlar.every((d) => d.turdi), narx, daqiqa, xato, devorlar };
  }
  // Profilga mos eng arzon tanlov (dars uchun tavsiya)
  function byudjetTavsiya(prof) {
    const p = typeof prof === "string" ? profil(prof) : prof;
    const h = (p && p.hujum) || {};
    return { parol: h.parol ? "kuchli" : "oddiy", qulf: h.qulf ? "tuz" : "tuzsiz", shifr: h.shifr ? "kalitli" : "sezar",
      xat: h.xat ? "filtr" : "filtrsiz", ikki: h.parol && h.xat ? "ikki" : "yoq" };
  }

  // ---------- Himoya: qurish va raqibga ko'rinadigan qismi ----------
  const DEVOR_IDS = ["parol", "qulf", "shifr", "xat", "ikki"];
  const NARX = { tuz: 3, kalitli: 4, ikki: 2 };

  // { parol: [ids], tuz: 0|1..99, shifr: "sezar"|"kalitli", k?: 1..25, kalit?: "abc", bayroq: "f1", ikki: bool, filtr: [xatId] }
  // → himoya. xato: null | "parol" | "kalit" | "byudjet" (obyekt baribir qaytadi — ekran xatoni ko'rsatadi)
  function himoyaYasa(spec) {
    const s = spec || {};
    const parolMatn = parolYasa(s.parol);
    const tuz = Number(s.tuz) || 0;
    const shifr = s.shifr === "kalitli" ? "kalitli" : "sezar";
    const k = shifr === "sezar" ? (s.k == null ? 3 : Number(s.k)) : 0;
    const kalit = shifr === "kalitli" ? String(s.kalit || "") : "";
    const b = bayroq(s.bayroq) || BAYROQLAR[0];
    const filtr = Array.isArray(s.filtr) ? s.filtr.filter((id) => FILTR_XATLAR.some((x) => x.id === id)) : [];
    const h = { parol: Array.isArray(s.parol) ? s.parol.slice() : [], parolMatn, tuz, shifr, k, kalit, bayroq: b.id, ikki: !!s.ikki, filtr,
      iz: parolMatn ? iz(parolMatn, tuz) : null,
      shifrMatn: shifr === "sezar" ? sezar(b.gap, k) : kalitTogri(kalit) ? vijener(b.gap, kalit) : "",
      darvoza: FILTR_XATLAR.filter((x) => x.soxta && !filtr.includes(x.id)).length,
      xato: null };
    h.narx = himoyaNarxi(h);
    if (!parolMatn) h.xato = "parol";
    else if (tuz < 0 || tuz > 99 || !Number.isInteger(tuz)) h.xato = "parol";
    else if (shifr === "sezar" && (!Number.isInteger(k) || k < 1 || k > 25)) h.xato = "kalit";
    else if (shifr === "kalitli" && !kalitTogri(kalit)) h.xato = "kalit";
    else if (h.narx > BYUDJET) h.xato = "byudjet";
    return h;
  }
  const himoyaNarxi = (h) => (h.tuz > 0 ? NARX.tuz : 0) + (h.shifr === "kalitli" ? NARX.kalitli : 0) + (h.ikki ? NARX.ikki : 0);

  // Raqibga ko'rinadigan qism — tarmoqqa shu ketadi (maslahat kodi: sonlar va kalit so'zlar)
  function korinish(h) {
    const kod = maslahatKod(h.parol);
    return { maslahat: maslahatMatn(kod), kod, iz: h.iz, tuz: h.tuz > 0, shifr: h.shifr, shifrMatn: h.shifrMatn, ikki: !!h.ikki, darvoza: h.darvoza || 0 };
  }

  // ---------- Hujum qurollari (sof) ----------
  function qopolKuch(h, qolganSoniya) {
    const kuch = parolKuch(h.parolMatn);
    return { ochildi: kuch.soniya <= Number(qolganSoniya), soniya: kuch.soniya, matn: kuch.matn };
  }
  const taxmin = (h, ids) => ({ togri: !!h.parolMatn && parolYasa(ids) === h.parolMatn });
  function jadvalHujumi(h) {
    if (h.tuz > 0) return { mumkin: false, ochildi: false, parollar: [] };
    const parollar = jadvaldan(h.iz, 0);
    return { mumkin: true, ochildi: parollar.includes(h.parolMatn), parollar };
  }
  // Hujumchi nomzod kartalarini tanlab, izini qo'lda hisoblaydi. Hisob xato — urinish kuydi; to'g'ri va nishonga teng — yiqildi
  function izTaxmin(h, ids, hisob) {
    const p = parolYasa(ids);
    if (!p) return { hisobTogri: false, mos: false, ochildi: false };
    const x = iz(p, h.tuz);
    const hisobTogri = x === Number(hisob);
    const mos = x === h.iz;
    return { hisobTogri, mos, ochildi: hisobTogri && mos };
  }
  function shifrTaxmin(h, k) {
    const b = bayroq(h.bayroq);
    const togri = h.shifr === "sezar" && Number(k) === h.k;
    return { togri, ochiq: togri ? b.gap : sezarOch(h.shifrMatn, Number(k) || 0), bayroq: togri ? b.soz : null };
  }
  function kalitTaxmin(h, kalit) {
    const b = bayroq(h.bayroq);
    const togri = h.shifr === "kalitli" && String(kalit) === h.kalit;
    return { togri, ochiq: togri ? b.gap : (kalitTogri(kalit) ? vijenerOch(h.shifrMatn, kalit) : ""), bayroq: togri ? b.soz : null };
  }
  // Qorovullar ovozi: ko'pchilik ochsa — yiqildi (darvoza ochiq bo'lsa — bittasi ochsa ham). Nima sizdi: kod (xat kod so'ragan), kalit (kalitli shifr va soxta havola)
  function fishingNatija(h, xat, ovozlar) {
    const o = Array.isArray(ovozlar) ? ovozlar : [];
    const ha = o.filter(Boolean).length;
    if (!xat || !o.length) return { ochildi: false, sizdi: [] };
    const ochildi = h.darvoza > 0 ? ha >= 1 : ha * 2 > o.length;
    const sizdi = [];
    if (ochildi && xat.qismlar.gap.belgi === "parol") sizdi.push("kod");
    if (ochildi && xat.qismlar.havola.soxta && h.shifr === "kalitli") sizdi.push("kalit");
    return { ochildi, sizdi };
  }

  // ---------- O'yin holati ----------
  // s.jamoa[X]: himoya, devor, urinish, sizdi, xatlar, jazoGacha — X QAL'ASI haqida (unga qilingan hujumlar);
  // ochko — X jamoasining hujumda yiqitgan devorlari uchun ochkosi. Voqea: jamoa — kim qildi, nishon — kimning qal'asi.
  const JAMOALAR = ["oy", "quyosh"];
  const VAQT = { himoya: 300, hujum: 300, tahlil: 90 };
  const URINISH = { taxmin: 5, iz: 5 };
  const JAZO = 15000; // shifr xatosi — 15 s
  const raqib = (s, jamoa) => s.jamoalar.find((j) => j !== jamoa);

  function create(opts) {
    const o = opts || {};
    const jamoalar = Array.isArray(o.jamoalar) && o.jamoalar.length === 2 ? o.jamoalar.slice() : JAMOALAR.slice();
    const s = { faza: "lobbi", raund: 0, raundlar: o.raundlar || 2, vaqt: Object.assign({}, VAQT, o.vaqt || {}),
      fazaTugaydi: null, jamoalar, jamoa: {}, voqealar: [], golib: null };
    jamoalar.forEach((j) => { s.jamoa[j] = { ochko: 0 }; qalaTozala(s.jamoa[j]); });
    return s;
  }
  const yangiDevor = () => DEVOR_IDS.reduce((d, id) => { d[id] = { holat: "turdi", sabab: null }; return d; }, {});
  function qalaTozala(q) {
    Object.assign(q, { himoya: null, devor: yangiDevor(), urinish: { taxmin: URINISH.taxmin, iz: URINISH.iz, shifr: 0 }, sizdi: [], xatlar: [], jazoGacha: 0, robotKeyingi: 0 });
  }
  function voqea(s, t, jamoa, devor, kod, matn, ok, nishon) {
    const v = { t, jamoa, nishon: nishon || null, devor, kod, matn, ok: !!ok };
    s.voqealar.push(v);
    return v;
  }
  function fazaQoy(s, faza, now) {
    s.faza = faza;
    const sek = s.vaqt[faza] || 0;
    s.fazaTugaydi = faza === "tugadi" || !sek ? null : now + sek * 1000;
  }
  // Eng oddiy himoya: vaqt tugab jamoa hech narsa qo'ymasa
  const bosHimoya = () => himoyaYasa({ parol: ["s1"], tuz: 0, shifr: "sezar", k: 3, bayroq: "f1", ikki: false, filtr: [] });

  function boshla(s, now) {
    if (s.faza !== "lobbi") return s;
    s.raund = 1;
    fazaQoy(s, "himoya", now);
    voqea(s, now, null, null, "faza-himoya", "1-raund: himoya qurish", true);
    return s;
  }
  function himoyaQoy(s, jamoa, himoya) {
    if (s.faza !== "himoya" || !s.jamoa[jamoa]) return { ok: false, xato: "faza" };
    const h = himoya && himoya.parolMatn !== undefined ? himoya : himoyaYasa(himoya);
    if (h.xato) return { ok: false, xato: h.xato };
    s.jamoa[jamoa].himoya = h;
    return { ok: true, xato: null };
  }

  // Devorni yiqitish: ochko hujumchiga; shifr — bayroq +2; parol yiqilsa va kod sizgan bo'lsa — ikki ham
  function yiqit(s, nishon, devor, sabab, now, kod) {
    const q = s.jamoa[nishon];
    const d = q.devor[devor];
    if (d.holat !== "turdi") return null;
    d.holat = "yiqildi";
    d.sabab = sabab;
    const hujumchi = raqib(s, nishon);
    s.jamoa[hujumchi].ochko += devor === "shifr" ? 3 : 1;
    const v = voqea(s, now, hujumchi, devor, kod, sabab, true, nishon);
    if (devor === "parol" || devor === "xat") ikkiTekshir(s, nishon, now);
    return v;
  }
  function ikkiTekshir(s, nishon, now) {
    const q = s.jamoa[nishon];
    if (q.himoya && q.himoya.ikki && q.devor.parol.holat === "yiqildi" && q.sizdi.includes("kod") && q.devor.ikki.holat === "turdi") {
      yiqit(s, nishon, "ikki", "Parol ochildi, kod ham xat orqali sizdi", now, "ikki-ok");
    }
  }
  const hujumMumkin = (s, now) => s.faza === "hujum" && (!s.fazaTugaydi || now < s.fazaTugaydi);

  // amal: { tur: "qopol"|"taxmin"|"jadval"|"iz"|"shifr"|"kalit"|"fishing", ids?, hisob?, k?, kalit?, xat? }
  function hujum(s, hujumchi, amal, now) {
    const nishon = raqib(s, hujumchi);
    if (!nishon || !hujumMumkin(s, now)) return { ok: false, xato: "faza", natija: null, voqea: null };
    const q = s.jamoa[nishon];
    const h = q.himoya;
    const a = amal || {};
    const turdi = (devor) => q.devor[devor].holat === "turdi";
    const javob = (natija, v) => ({ ok: true, xato: null, natija, voqea: v });
    const xato = (kod) => ({ ok: false, xato: kod, natija: null, voqea: null });
    if (a.tur === "qopol") {
      if (!turdi("parol")) return xato("yiqilgan");
      const qolgan = s.fazaTugaydi ? (s.fazaTugaydi - now) / 1000 : s.vaqt.hujum;
      const n = qopolKuch(h, qolgan);
      if (n.ochildi) return javob(n, yiqit(s, nishon, "parol", "Qoʻpol kuch: " + n.matn, now, "qopol-ok"));
      return javob(n, voqea(s, now, hujumchi, "parol", "qopol-yoq", "Qoʻpol kuch: vaqt yetmaydi (" + n.matn + ")", false, nishon));
    }
    if (a.tur === "taxmin") {
      if (!turdi("parol")) return xato("yiqilgan");
      if (q.urinish.taxmin <= 0) return xato("urinish");
      q.urinish.taxmin--;
      const n = taxmin(h, a.ids);
      if (n.togri) return javob(n, yiqit(s, nishon, "parol", "Parol maslahatdan topildi", now, "taxmin-ok"));
      return javob(n, voqea(s, now, hujumchi, "parol", "taxmin-xato", "Taxmin notoʻgʻri, qoldi: " + q.urinish.taxmin, false, nishon));
    }
    if (a.tur === "jadval") {
      if (!turdi("qulf")) return xato("yiqilgan");
      const n = jadvalHujumi(h);
      if (!n.mumkin) return javob(n, voqea(s, now, hujumchi, "qulf", "jadval-tuz", "Tuz bor — tayyor jadval ishlamaydi", false, nishon));
      if (n.ochildi) return javob(n, yiqit(s, nishon, "qulf", "Iz tayyor jadvalda topildi", now, "jadval-ok"));
      return javob(n, voqea(s, now, hujumchi, "qulf", "jadval-yoq", "Jadvalda " + n.parollar.length + " nomzod, parol ular orasida emas", false, nishon));
    }
    if (a.tur === "iz") {
      if (!turdi("qulf")) return xato("yiqilgan");
      if (q.urinish.iz <= 0) return xato("urinish");
      q.urinish.iz--;
      const n = izTaxmin(h, a.ids, a.hisob);
      if (n.ochildi) return javob(n, yiqit(s, nishon, "qulf", "Iz qoʻlda hisoblab topildi", now, "iz-ok"));
      const matn = !n.hisobTogri ? "Iz hisobi xato, qoldi: " + q.urinish.iz : "Hisob toʻgʻri, lekin iz mos emas, qoldi: " + q.urinish.iz;
      return javob(n, voqea(s, now, hujumchi, "qulf", n.hisobTogri ? "iz-mos-emas" : "iz-xato", matn, false, nishon));
    }
    if (a.tur === "shifr" || a.tur === "kalit") {
      if (!turdi("shifr")) return xato("yiqilgan");
      if (now < q.jazoGacha) return xato("jazo");
      q.urinish.shifr++;
      const n = a.tur === "shifr" ? shifrTaxmin(h, a.k) : kalitTaxmin(h, a.kalit);
      if (n.togri) return javob(n, yiqit(s, nishon, "shifr", "Shifr ochildi, bayroq olindi: " + n.bayroq, now, a.tur + "-ok"));
      q.jazoGacha = now + JAZO;
      return javob(n, voqea(s, now, hujumchi, "shifr", a.tur + "-xato", "Shifr ochilmadi — 15 soniya jarima", false, nishon));
    }
    if (a.tur === "fishing") {
      if (!turdi("xat")) return xato("yiqilgan");
      if (q.xatlar.length >= 1) return xato("xat");
      const xat = a.xat && a.xat.qismlar ? a.xat : xatYasa(a.xat);
      if (!xat) return xato("ilmoq");
      q.xatlar.push({ xat, ovozlar: null, natija: null });
      return javob({ nomer: q.xatlar.length - 1 }, voqea(s, now, hujumchi, "xat", "fishing-keldi", "Qorovullarga xat keldi", true, nishon));
    }
    return xato("amal");
  }

  // Qorovullar (jamoa — o'z qal'asi) kelgan xatga ovoz berdi: [true — ochaman, false — o'chiraman]
  function qorovulOvoz(s, jamoa, xatNomer, ovozlar, now) {
    const q = s.jamoa[jamoa];
    const x = q && q.xatlar[xatNomer];
    if (!x || s.faza !== "hujum") return { ok: false, xato: "xat", natija: null, voqea: null };
    if (x.natija) return { ok: false, xato: "ovoz", natija: x.natija, voqea: null };
    const t = now == null ? (s.voqealar.length ? s.voqealar[s.voqealar.length - 1].t : 0) : now;
    x.ovozlar = (ovozlar || []).map(Boolean);
    x.natija = fishingNatija(q.himoya, x.xat, x.ovozlar);
    const hujumchi = raqib(s, jamoa);
    if (!x.natija.ochildi) return { ok: true, xato: null, natija: x.natija, voqea: voqea(s, t, jamoa, "xat", "fishing-ochirildi", "Qorovullar soxta xatni oʻchirdi", false, jamoa) };
    x.natija.sizdi.forEach((z) => { if (!q.sizdi.includes(z)) q.sizdi.push(z); });
    const sizdi = x.natija.sizdi.length ? " — sizdi: " + x.natija.sizdi.join(", ") : "";
    const v = yiqit(s, jamoa, "xat", "Qorovullar soxta xatni ochdi" + sizdi, t, "fishing-ochildi");
    return { ok: true, xato: null, natija: x.natija, voqea: v || s.voqealar[s.voqealar.length - 1], hujumchi };
  }

  // Vaqt tekshiruvi: faza tugasa — keyingisi. Hujum boshlanishida darvoza (belgilanmagan firibgar xat) ishlaydi;
  // hujum tugashida parol devori turgan bo'lsa — qo'pol kuch butun faza vaqti bilan hisoblanadi.
  function tekshir(s, now) {
    const oldin = s.voqealar.length;
    if (s.faza === "himoya") {
      const hammasi = s.jamoalar.every((j) => s.jamoa[j].himoya);
      if (hammasi || (s.fazaTugaydi && now >= s.fazaTugaydi)) {
        s.jamoalar.forEach((j) => { if (!s.jamoa[j].himoya) s.jamoa[j].himoya = bosHimoya(); });
        fazaQoy(s, "hujum", now);
        voqea(s, now, null, null, "faza-hujum", s.raund + "-raund: hujum", true);
        s.jamoalar.forEach((j) => darvozaOch(s, j, now));
      }
    } else if (s.faza === "hujum") {
      if (s.fazaTugaydi && now >= s.fazaTugaydi) {
        s.jamoalar.forEach((j) => {
          const q = s.jamoa[j];
          if (q.devor.parol.holat !== "turdi") return;
          const n = qopolKuch(q.himoya, s.vaqt.hujum);
          if (n.ochildi) yiqit(s, j, "parol", "Qoʻpol kuch faza oxirida topdi: " + n.matn, now, "qopol-ok");
          else q.devor.parol.sabab = "Qoʻpol kuchga vaqt yetmadi: " + n.matn;
        });
        fazaQoy(s, "tahlil", now);
        voqea(s, now, null, null, "faza-tahlil", s.raund + "-raund: tahlil", true);
      }
    } else if (s.faza === "tahlil") {
      if (s.fazaTugaydi && now >= s.fazaTugaydi) keyingiRaund(s, now);
    }
    return s.voqealar.slice(oldin);
  }
  function darvozaOch(s, jamoa, now) {
    const q = s.jamoa[jamoa];
    const h = q.himoya;
    if (!h || !h.darvoza) return;
    const ochiq = FILTR_XATLAR.filter((x) => x.soxta && !h.filtr.includes(x.id));
    ochiq.forEach((x) => fishingNatija(h, x, [true]).sizdi.forEach((z) => { if (!q.sizdi.includes(z)) q.sizdi.push(z); }));
    const sizdi = q.sizdi.length ? " — sizdi: " + q.sizdi.join(", ") : "";
    yiqit(s, jamoa, "xat", "Filtrda " + ochiq.length + " ta firibgar xat belgilanmadi — darvoza ochiq qoldi" + sizdi, now, "darvoza");
  }
  // Tahlil tugadi: keyingi raund (yangi himoya) yoki o'yin tugadi. Ochko yig'ilib boradi, devorlar yangilanadi.
  function keyingiRaund(s, now) {
    if (s.raund >= s.raundlar) {
      fazaQoy(s, "tugadi", now);
      s.golib = golib(s);
      voqea(s, now, s.golib, null, "tugadi", s.golib === "durang" ? "Durang" : "Gʻolib: " + s.golib, true);
      return;
    }
    s.raund++;
    s.jamoalar.forEach((j) => qalaTozala(s.jamoa[j]));
    fazaQoy(s, "himoya", now);
    voqea(s, now, null, null, "faza-himoya", s.raund + "-raund: himoya qurish", true);
  }
  const hisob = (s) => s.jamoalar.reduce((o, j) => { o[j] = s.jamoa[j].ochko; return o; }, {});
  function golib(s) {
    if (s.faza !== "tugadi") return null;
    const [a, b] = s.jamoalar;
    const ha = s.jamoa[a].ochko;
    const hb = s.jamoa[b].ochko;
    return ha === hb ? "durang" : ha > hb ? a : b;
  }

  // ---------- Tahlil doskasi: har devor → turdi/yiqildi, sabab, qaysi dars ----------
  const DARS = { parol: 1, qulf: 2, shifr: 3, xat: 4 };
  function turdiSabab(id, h, q) {
    if (id === "parol") {
      const kuch = parolKuch(h.parolMatn);
      // O'yin vaqtidan oldin to'xtatilgan bo'lsa, zaif parol hujumga uchramay turib qolishi mumkin — buni ochiq aytamiz
      if (kuch.daraja === 0) return "Hujum boʻlmadi, omad: parol lugʻatda — qoʻpol kuch uni bir zumda topardi";
      return "Topilmadi: qoʻpol kuchga " + kuch.matn + " kerak" + (q.urinish.taxmin < URINISH.taxmin ? ", taxminlar ham oʻtmadi" : "");
    }
    if (id === "qulf") return h.tuz > 0 ? "Tuz bor — tayyor jadval ishlamadi, iz topilmadi" : "Iz tayyor jadvaldan topilmadi";
    if (id === "shifr") return h.shifr === "kalitli" ? "Kalitli shifr: 17 576 variant, kalit sizmadi" : "Siljish topilmadi";
    if (id === "xat") return q.xatlar.length ? "Qorovullar soxta xatni oʻchirdi" : "Soxta xat kelmadi";
    return "Kod sizmadi — parol ochilsa ham kirish yoʻq";
  }
  function tahlil(s, jamoa) {
    const q = s.jamoa[jamoa];
    const h = q.himoya;
    return DEVOR_IDS.map((id) => {
      const d = q.devor[id];
      let holat = d.holat;
      let sabab = d.sabab;
      if (id === "ikki" && (!h || !h.ikki)) { holat = "yoq"; sabab = "Qurilmagan — parol ochilsa, qalʼa ochiq"; }
      else if (holat === "turdi") sabab = sabab || (h ? turdiSabab(id, h, q) : "Himoya qoʻyilmadi");
      return { devor: id, holat, sabab, dars: id === "ikki" ? (holat === "yoq" ? 5 : 1) : DARS[id] };
    });
  }

  // ---------- Robotlar (solo rejim). Robot faqat odam bilishi mumkin bo'lgan narsadan foydalanadi ----------
  const sozKarta = (list, r) => { const soz = pick(list, r); return KARTALAR.soz.find((k) => k.matn === soz); };
  const soxtaIds = () => FILTR_XATLAR.filter((x) => x.soxta).map((x) => x.id);
  // daraja 1 — zaif: lug'at paroli, tuzsiz, Sezar; 2 — o'rtacha; 3 — kuchli: 4 karta, tuz, kalitli, ikki (narx 9)
  function robotHimoya(rng, daraja) {
    const r = rng || Math.random;
    const d = Math.max(1, Math.min(3, daraja || 1));
    const b = pick(BAYROQLAR, r).id;
    if (d === 1) return himoyaYasa({ parol: [sozKarta(LUGAT, r).id], tuz: 0, shifr: "sezar", k: int(r, 1, 25), bayroq: b, ikki: false, filtr: [pick(soxtaIds(), r)] });
    if (d === 2) return himoyaYasa({ parol: [sozKarta(KAM, r).id, pick(KARTALAR.raqam, r).id], tuz: int(r, 1, 99), shifr: "sezar", k: int(r, 1, 25), bayroq: b, ikki: false, filtr: soxtaIds() });
    const kalit = ALIFBO[int(r, 0, 25)] + ALIFBO[int(r, 0, 25)] + ALIFBO[int(r, 0, 25)];
    return himoyaYasa({ parol: [sozKarta(KAM, r).id, pick(KARTALAR.raqam, r).id, pick(KARTALAR.belgi, r).id, sozKarta(LUGAT.concat(KAM), r).id],
      tuz: int(r, 1, 99), shifr: "kalitli", kalit, bayroq: b, ikki: true, filtr: soxtaIds() });
  }

  // Parol satrini karta id'lariga qaytarish (jadval nomzodlari uchun): so'z yoki so'z + raqam
  function idsTop(parol) {
    for (const s of KARTALAR.soz) {
      if (parol === s.matn) return [s.id];
      if (parol.startsWith(s.matn)) {
        const r = KARTALAR.raqam.find((x) => s.matn + x.matn === parol);
        if (r) return [s.id, r.id];
      }
    }
    return null;
  }
  // Maslahatdan taxmin: daraja 1 — tasodifiy kartalar; 2 — turlar va lug'at belgisi bo'yicha; 3 — uzunlik ham mos
  function robotTaxmin(kod, r, d) {
    if (d <= 1) return aralash(HAMMA_KARTA, r).slice(0, int(r, 1, 2)).map((k) => k.id);
    const havza = { soz: kod.lugat === 1 ? KARTALAR.soz.filter((k) => LUGAT.includes(k.matn)) : KARTALAR.soz.filter((k) => KAM.includes(k.matn)),
      raqam: KARTALAR.raqam, belgi: KARTALAR.belgi };
    let ids = [];
    for (let k = 0; k < 60; k++) {
      ids = kod.turlar.map((t) => pick(havza[t], r).id);
      if (d < 3 || maslahatKod(ids).uzunlik === kod.uzunlik) break;
    }
    return ids;
  }
  function robotIz(h, kor, r, d) {
    if (d <= 1) return { tur: "iz", ids: [pick(KARTALAR.soz, r).id], hisob: int(r, 0, 99) };
    let ids = r() < 0.5 ? [pick(KARTALAR.soz, r).id] : [pick(KARTALAR.soz, r).id, pick(KARTALAR.raqam, r).id];
    if (d >= 3 && !kor.tuz) {
      const nomzod = jadvaldan(kor.iz, 0).map(idsTop).filter(Boolean);
      if (nomzod.length) ids = pick(nomzod, r);
    }
    return { tur: "iz", ids, hisob: iz(parolYasa(ids), h.tuz) };
  }
  // Robot xati: daraja 1 — oshkora belgilar; 2 — aralash; 3 — nozik havola, kod so'raydi, belgilar yo'q
  function robotXat(r, d) {
    if (d <= 1) return { kimdan: pick(["k4", "k5", "k6"], r), mavzu: "m5", havola: pick(["h4", "h6"], r), gap: pick(["g5", "g6", "g7"], r), imzo: pick(["i3", "i4"], r) };
    if (d === 2) return { kimdan: pick(["k1", "k2", "k4"], r), mavzu: pick(["m1", "m4", "m5"], r), havola: pick(["h3", "h4", "h5"], r), gap: pick(["g3", "g4", "g5", "g6", "g8"], r), imzo: pick(["i1", "i3"], r) };
    return { kimdan: pick(["k1", "k2"], r), mavzu: pick(["m1", "m4"], r), havola: pick(["h3", "h5"], r), gap: pick(["g3", "g4"], r), imzo: pick(["i1", "i2"], r) };
  }
  // 8–15 soniyada bir amal (vaqt s.jamoa[jamoa].robotKeyingi da). daraja 3 — chastota bilan to'g'ri topadi
  function robotHujum(s, jamoa, now, rng, daraja) {
    const r = rng || Math.random;
    const d = Math.max(1, Math.min(3, daraja || 1));
    const q = s.jamoa[jamoa];
    const nishon = raqib(s, jamoa);
    if (!q || !nishon || !hujumMumkin(s, now)) return null;
    // Birinchi amal darhol emas — o'yinchi hujum ekranini ko'rib ulgursin (5–10 s)
    if (!q.robotKeyingi) { q.robotKeyingi = now + int(r, 5, 10) * 1000; return null; }
    if (now < q.robotKeyingi) return null;
    const t = s.jamoa[nishon];
    const h = t.himoya;
    const kor = korinish(h);
    const turdi = (devor) => t.devor[devor].holat === "turdi";
    const amallar = [];
    if (turdi("parol")) {
      if (!q.robotQopol) { q.robotQopol = true; amallar.push({ tur: "qopol" }); }
      else if (t.urinish.taxmin > 0) amallar.push({ tur: "taxmin", ids: robotTaxmin(kor.kod, r, d) });
    }
    if (turdi("qulf")) {
      if (!kor.tuz && !q.robotJadval) { q.robotJadval = true; amallar.push({ tur: "jadval" }); }
      else if (t.urinish.iz > 0) amallar.push(robotIz(h, kor, r, d));
    }
    if (turdi("shifr") && now >= t.jazoGacha) {
      if (kor.shifr === "sezar") amallar.push({ tur: "shifr", k: d >= 3 || (d === 2 && r() < 0.5) ? sezarTaxmin(kor.shifrMatn) : int(r, 1, 25) });
      else if (t.sizdi.includes("kalit")) amallar.push({ tur: "kalit", kalit: h.kalit });
    }
    if (turdi("xat") && !t.xatlar.length) amallar.push({ tur: "fishing", xat: robotXat(r, d) });
    if (!amallar.length) return null; // qiladigan ish yo'q — navbat kuymaydi
    q.robotKeyingi = now + int(r, 8, 15) * 1000;
    return pick(amallar, r);
  }
  // Qorovul robot: ishonch yuqori va belgilar kam bo'lsa ochadi; daraja 3 kod so'ragan xatni hech qachon ochmaydi
  function robotQorovul(xat, rng, daraja) {
    const r = rng || Math.random;
    const d = Math.max(1, Math.min(3, daraja || 1));
    if (!xat) return false;
    if (d >= 3 && xat.belgilar.includes("parol")) return false;
    const p = (xat.ishonch / 100) * Math.pow([0.8, 0.5, 0.3][d - 1], xat.belgilar.length);
    return r() < p;
  }

  const api = {
    LIB, ATAMALAR, atama, KARTALAR, LUGAT, KAM, karta, parolYasa, TEZLIK, lugatda, parolKuch, parolMaslahat, maslahatKod, maslahatMatn,
    iz, izQadamlar, izHisob, jadval, jadvaldan,
    BAYROQLAR, bayroq, ALIFBO, sezar, sezarOch, vijener, vijenerOch, chastota, sezarTaxmin, KALIT_VARIANT, kalitTogri,
    BELGILAR, XAT_QISMLAR, OSHKORA, xatYasa, haqiqiyXat, xatBelgilari, FILTR_XATLAR, DIALOGLAR,
    BYUDJET, HIMOYA_DAQIQA, DEVORLAR, PROFILLAR, profil, byudjetBaho, byudjetTavsiya, tanlovNarxi,
    DEVOR_IDS, NARX, himoyaYasa, himoyaNarxi, korinish, qopolKuch, taxmin, jadvalHujumi, izTaxmin, shifrTaxmin, kalitTaxmin, fishingNatija,
    JAMOALAR, VAQT, URINISH, JAZO, raqib, create, boshla, himoyaQoy, hujum, qorovulOvoz, tekshir, hisob, golib, tahlil,
    robotHimoya, robotHujum, robotQorovul, idsTop,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.qala = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

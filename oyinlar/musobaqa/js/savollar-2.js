// Musobaqa savollari — 2-qism (2026-10-06): saytga keyin qo'shilgan bloklar uchun 5 mavzu.
// savollar.js dan KEYIN ulanadi va uning TOPICS / KINDS ro'yxatiga qo'shadi — Savol-javob ham, Tog' ham
// ularni o'zi oladi. Har mavzu va har qiyinlikda kamida bitta generator bor (takrorsiz 15+ raund).
// Ekran bilan ishlamaydi, Node'da test qilinadi (tests/savollar.test.js).
(function (root) {
  "use strict";

  // Brauzerda (va testdagi loadScript da) bank allaqachon root.QK.savollar da; Node require bilan — fayldan
  const S = (root.QK && root.QK.savollar) || require("./savollar.js");

  // ---------- Yordamchilar (savollar.js dagidek) ----------
  const ri = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
  const pick = (rng, list) => list[Math.floor(rng() * list.length)];
  function shuffle(rng, list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
  function withOptions(rng, answer, wrongs, n = 4) {
    const out = [answer];
    for (const w of shuffle(rng, wrongs)) if (out.length < n && w != null && !out.includes(w)) out.push(w);
    return shuffle(rng, out);
  }
  const num = (maxLen) => ({ type: "num", maxLen });
  const choice = (options) => ({ type: "choice", options });
  const big = (text) => ({ type: "big", text });
  const lines = (items) => ({ type: "lines", items });
  const code = (text) => ({ type: "code", text });

  // Bilim savollari ro'yxatdan: [daraja, savol, javob, [noto'g'ri variantlar], izoh]
  function bilim(topic, ROYXAT) {
    return {
      topic,
      levels: [1, 2, 3],
      make(level, rng, fresh) {
        const pool = ROYXAT.filter((f) => f[0] === level && fresh(f[1]));
        if (!pool.length) return null;
        const [, savol, javob, xato, izoh] = pick(rng, pool);
        return { id: savol, data: {}, text: savol, input: choice(withOptions(rng, javob, xato)), answer: javob, explain: izoh || `${javob}.` };
      },
    };
  }

  const TOPICS = [
    { id: "tanishuv", title: "Kompyuter bilan tanishuv" },
    { id: "dastur", title: "Robot va algoritm" },
    { id: "internet", title: "Internet" },
    { id: "xavfsizlik", title: "Parol va xavfsizlik" },
    { id: "python", title: "Python" },
  ];

  // ======================================================================
  // 1. Kompyuter bilan tanishuv (66–72)
  // ======================================================================
  const TURLAR = [
    { tur: "Rasm", ext: ["jpg", "png"] },
    { tur: "Matn", ext: ["txt", "docx"] },
    { tur: "Musiqa", ext: ["mp3"] },
    { tur: "Video", ext: ["mp4"] },
  ];
  const NOMLAR = ["olma", "xat", "qoʻshiq", "multfilm", "mushuk", "uy", "sheʼr", "bayram", "maktab", "doʻstim", "tabiat", "darslik", "oila", "sayohat"];

  // Fayl turi nom oxiridan. 3-daraja: nom boshqa narsani eslatadi (qoʻshiq.txt — baribir matn)
  const faylTuri = {
    topic: "tanishuv",
    levels: [1, 2, 3],
    make(level, rng) {
      const t = pick(rng, TURLAR);
      const ext = pick(rng, t.ext);
      const nom = level === 3 ? pick(rng, ["qoʻshiq", "rasm", "video", "kino", "musiqa", "surat"]) : pick(rng, NOMLAR);
      const fayl = `${nom}.${ext}`;
      return {
        id: fayl,
        data: { fayl },
        text: level === 1 ? "Bu qanday fayl?" : "Fayl turi nomining oxiridan bilinadi. Bu qanday fayl?",
        blocks: [big(fayl)],
        input: choice(TURLAR.map((x) => x.tur)),
        answer: t.tur,
        explain: level === 3 ? `Nomi chalgʻitadi: turini nuqtadan keyingi «.${ext}» aytadi — ${t.tur.toLowerCase()}.` : `«.${ext}» — ${t.tur.toLowerCase()} fayli.`,
      };
    },
  };

  const PAPKALAR = ["Hujjatlar", "Rasmlar", "Musiqa", "Maktab", "Oʻyinlar", "Darslar", "Bayram", "Sheʼrlar", "Videolar", "Loyiha"];
  // Yo'l: fayl qaysi papkada (2) yoki nechta papkaga kirish kerak (3)
  const yol = {
    topic: "tanishuv",
    levels: [2, 3],
    make(level, rng) {
      const chuqur = level === 2 ? ri(rng, 2, 3) : ri(rng, 3, 5);
      const papkalar = shuffle(rng, PAPKALAR).slice(0, chuqur);
      const t = pick(rng, TURLAR);
      const fayl = `${pick(rng, NOMLAR)}.${t.ext[0]}`;
      const yozuv = ["Kompyuter", ...papkalar, fayl].join(" › ");
      if (level === 2) {
        const javob = papkalar[papkalar.length - 1];
        return {
          id: yozuv,
          data: { papkalar, fayl },
          text: `«${fayl}» qaysi papkaning ichida turibdi?`,
          blocks: [lines([yozuv])],
          input: choice(withOptions(rng, javob, [...papkalar.slice(0, -1), "Kompyuter", ...PAPKALAR])),
          answer: javob,
          explain: `Yoʻlda fayldan oldingi papka — «${javob}».`,
        };
      }
      return {
        id: yozuv,
        data: { papkalar, fayl },
        text: `Faylga yetish uchun «Kompyuter»dan boshlab nechta papkaga kirish kerak?`,
        blocks: [lines([yozuv])],
        input: num(1),
        answer: String(chuqur),
        explain: `${papkalar.join(", ")} — ${chuqur} ta papka.`,
      };
    },
  };

  // Nusxa va kesish: fayllar soni
  const nusxa = {
    topic: "tanishuv",
    levels: [2, 3],
    make(level, rng) {
      const a = ri(rng, 3, 9);
      const b = ri(rng, 1, 7);
      const k = ri(rng, 1, Math.min(a, 4));
      const amal = level === 2 ? "nusxa" : pick(rng, ["nusxa", "kesish"]);
      const qaysi = level === 2 ? "B" : pick(rng, ["A", "B"]);
      const A = amal === "kesish" ? a - k : a;
      const B = b + k;
      const javob = qaysi === "A" ? A : B;
      const ish = amal === "nusxa" ? "nusxa olib («Nusxa»)" : "kesib («Kesish»)";
      return {
        id: `${amal}${qaysi}${a}-${b}-${k}`,
        data: { a, b, k, amal, qaysi },
        text: `«A» papkada ${a} ta, «B» papkada ${b} ta fayl. «A»dan ${k} ta faylni ${ish}, «B»ga qoʻydik. Endi «${qaysi}» papkada nechta fayl?`,
        input: num(2),
        answer: String(javob),
        explain: amal === "nusxa"
          ? `Nusxada asli joyida qoladi: A = ${A}, B = ${b} + ${k} = ${B}.`
          : `Kesishda fayl koʻchadi: A = ${a} − ${k} = ${A}, B = ${b} + ${k} = ${B}.`,
      };
    },
  };

  const TANISHUV_BILIM = [
    [1, "Qaysi qurilma bilan harf yozamiz?", "Klaviatura", ["Monitor", "Kolonka", "Printer"], "Harflar klaviaturadan teriladi."],
    [1, "Rasm va yozuvni qaysi qurilma koʻrsatadi?", "Monitor", ["Sichqoncha", "Mikrofon", "Klaviatura"]],
    [1, "Ovozni hammaga eshittiradigan qurilma?", "Kolonka", ["Mikrofon", "Kamera", "Sichqoncha"]],
    [1, "Ovozni yozib oladigan qurilma?", "Mikrofon", ["Kolonka", "Quloqchin", "Printer"]],
    [1, "Rasmni qogʻozga chiqaradigan qurilma?", "Printer", ["Monitor", "Kamera", "Klaviatura"]],
    [1, "Dasturni ochish uchun belgini nima qilamiz?", "Ikki marta bosamiz", ["Bir marta bosamiz", "Oʻng tugmani bosamiz", "Sudraymiz"], "Belgini ikki marta tez bosish dasturni ochadi."],
    [1, "Oyna burchagidagi ✕ tugmasi nima qiladi?", "Oynani yopadi", ["Oynani kattalashtiradi", "Oynani kichraytiradi", "Faylni saqlaydi"]],
    [1, "Oʻchirilgan fayl avval qayerga tushadi?", "Savatga", ["Monitorga", "Printerga", "Yoʻqolib ketadi"], "Savatdan uni qaytarsa boʻladi."],
    [1, "Sayt manzili qayerga yoziladi?", "Manzil satriga", ["Sahifa pastiga", "Savatga", "Vazifalar paneliga"]],
    [1, "Paintda bir rang bilan ichini toʻldiradigan asbob?", "Chelak", ["Qalam", "Oʻchirgʻich", "Chiziq"]],
    [2, "Kompyuterga maʼlumot KIRITADIGAN qurilma qaysi?", "Sichqoncha", ["Monitor", "Kolonka", "Printer"], "Sichqoncha, klaviatura, mikrofon, kamera — kiritadi."],
    [2, "Kompyuterdan maʼlumot CHIQARADIGAN qurilma qaysi?", "Quloqchin", ["Klaviatura", "Mikrofon", "Kamera"], "Monitor, kolonka, printer, quloqchin — chiqaradi."],
    [2, "Oyna tugmasi «—» nima qiladi?", "Oynani kichraytiradi", ["Oynani yopadi", "Oynani yoyadi", "Faylni oʻchiradi"], "Kichraytirilgan oyna vazifalar panelida qoladi."],
    [2, "Sichqonchaning oʻng tugmasi nima ochadi?", "Menyu", ["Dasturni", "Savatni", "Yangi oynani"]],
    [2, "Faylni saqlaydigan tezkor tugma?", "Ctrl + S", ["Ctrl + Z", "Ctrl + C", "Ctrl + V"]],
    [2, "Oxirgi ishni bekor qiladigan tezkor tugma?", "Ctrl + Z", ["Ctrl + S", "Ctrl + V", "Ctrl + A"]],
    [2, "Havola qanday koʻrinadi?", "Koʻk, tagiga chizilgan", ["Qizil va katta", "Rasm ichida", "Doim qalin"]],
    [2, "«Orqaga» tugmasi brauzerda nima qiladi?", "Avvalgi sahifaga qaytaradi", ["Saytni yopadi", "Sahifani saqlaydi", "Kompyuterni oʻchiradi"]],
    [3, "Kompyuterni toʻgʻri oʻchirishda ENG AVVAL nima qilinadi?", "Ishni saqlash", ["Simni tortish", "Ekranni yopish", "«Pusk»ni bosish"], "Avval saqla, keyin dasturlarni yop, keyin «Oʻchirish»."],
    [3, "Qaysi ish kompyuterga zarar qiladi?", "Klaviatura ustida choy ichish", ["Ishni saqlab oʻchirish", "Quruq qoʻl bilan ishlash", "20 daqiqada koʻzga dam berish"]],
    [3, "Saytda toʻsatdan «Siz yutdingiz! Bosing!» oynasi chiqdi. Nima qilasan?", "✕ bilan yopaman", ["Bosaman", "Parolimni yozaman", "Telefonimni yozaman"]],
    [3, "Matnda soʻzni qalin qilish uchun avval nima qilinadi?", "Soʻzni belgilash", ["Faylni yopish", "Ctrl + Z ni bosish", "Matnni oʻchirish"]],
    [3, "«Kesish» va «Nusxa»ning farqi nimada?", "Kesishda asli joyida qolmaydi", ["Nusxada fayl oʻchadi", "Farqi yoʻq", "Kesishda ikkita boʻladi"]],
    [3, "Qidiruvga qanday yozgan maʼqul?", "Asosiy soʻzni qisqa", ["Uzun gap bilan", "Faqat raqam", "Hech narsa yozmasdan"]],
  ];
  const tanishuvBilim = bilim("tanishuv", TANISHUV_BILIM);

  // ======================================================================
  // 2. Robot va algoritm (26, 47, 53, 62–65)
  // ======================================================================
  const OQ = { "→": [1, 0], "←": [-1, 0], "↑": [0, 1], "↓": [0, -1] };
  const siljish = (buyruqlar) => buyruqlar.reduce(([x, y], b) => [x + OQ[b][0], y + OQ[b][1]], [0, 0]);
  const joyMatni = ([x, y]) => {
    const q = [];
    if (x) q.push(`${Math.abs(x)} ta ${x > 0 ? "oʻngda" : "chapda"}`);
    if (y) q.push(`${Math.abs(y)} ta ${y > 0 ? "yuqorida" : "pastda"}`);
    return q.length ? q.join(", ") : "Joyida";
  };

  // Robot qayerga yetdi: 1 — faqat → ←, nechta katak o'ngda; 2–3 — to'rt yo'nalish, javob so'z bilan
  const robotJoy = {
    topic: "dastur",
    levels: [1, 2, 3],
    make(level, rng) {
      if (level === 1) {
        let b;
        do { b = Array.from({ length: ri(rng, 4, 7) }, () => (rng() < 0.7 ? "→" : "←")); } while (siljish(b)[0] <= 0);
        const x = siljish(b)[0];
        return {
          id: b.join(""),
          data: { b },
          text: "Robot shu buyruqlarni bajardi. U boshlagan joyidan necha katak oʻngda turibdi?",
          blocks: [big(b.join(" "))],
          input: num(1),
          answer: String(x),
          explain: `→ ${b.filter((v) => v === "→").length} ta, ← ${b.filter((v) => v === "←").length} ta: ${x} katak oʻngda.`,
        };
      }
      const yon = Object.keys(OQ);
      let b, j;
      do {
        b = Array.from({ length: level === 2 ? ri(rng, 4, 6) : ri(rng, 7, 9) }, () => pick(rng, yon));
        j = siljish(b);
      } while (!j[0] || !j[1]);
      const javob = joyMatni(j);
      const xato = [joyMatni([-j[0], j[1]]), joyMatni([j[0], -j[1]]), joyMatni([j[1], j[0]]), joyMatni([j[0] + 1, j[1]]), joyMatni([j[0], j[1] - 1])];
      return {
        id: b.join(""),
        data: { b },
        text: "Robot shu buyruqlarni bajardi. Boshlagan joyiga nisbatan qayerda?",
        blocks: [big(b.join(" "))],
        input: choice(withOptions(rng, javob, xato)),
        answer: javob,
        explain: `Oʻng-chap: ${j[0] >= 0 ? "+" : "−"}${Math.abs(j[0])}, yuqori-past: ${j[1] >= 0 ? "+" : "−"}${Math.abs(j[1])} → ${javob}.`,
      };
    },
  };

  // «Takror»: jami nechta qadam
  const takror = {
    topic: "dastur",
    levels: [1, 2, 3],
    make(level, rng) {
      const yon = Object.keys(OQ);
      const n = level === 1 ? ri(rng, 2, 4) : ri(rng, 3, 6);
      const ichi = Array.from({ length: level === 1 ? 1 : ri(rng, 2, 3) }, () => pick(rng, yon));
      const oldin = level === 3 ? ri(rng, 1, 3) : 0;
      const keyin = level === 3 ? ri(rng, 0, 2) : 0;
      const satrlar = [];
      if (oldin) satrlar.push(Array(oldin).fill("→").join(" "));
      satrlar.push(`takror ${n} marta: ${ichi.join(" ")}`);
      if (keyin) satrlar.push(Array(keyin).fill("↑").join(" "));
      const jami = oldin + n * ichi.length + keyin;
      return {
        id: satrlar.join("|"),
        data: { n, ichi, oldin, keyin },
        text: "Robot bu dasturda jami nechta qadam yuradi?",
        blocks: [lines(satrlar)],
        input: num(2),
        answer: String(jami),
        explain: `${oldin ? oldin + " + " : ""}${n} × ${ichi.length}${keyin ? " + " + keyin : ""} = ${jami}.`,
      };
    },
  };

  const DASTUR_BILIM = [
    [1, "Robotga beriladigan buyruqlar ketma-ketligi nima deyiladi?", "Algoritm", ["Rasm", "Fayl", "Sayt"]],
    [1, "Buyruqlar tartibi almashsa nima boʻladi?", "Robot boshqa joyga boradi", ["Hech narsa oʻzgarmaydi", "Robot tezlashadi", "Dastur yoʻqoladi"]],
    [1, "Dasturdagi xatoni topib tuzatish nima deyiladi?", "Xato ovi (tuzatish)", ["Saqlash", "Chop etish", "Oʻchirish"]],
    [1, "«→ → → →» ni qisqa qanday yozamiz?", "takror 4 marta: →", ["takror 1 marta: →", "→ 4", "agar →"]],
    [2, "«agar oldinda toʻsiq boʻlsa — buril» qanday buyruq?", "Shart (agar)", ["Takror", "Oʻzgaruvchi", "Funksiya"]],
    [2, "Bir marta yozib, koʻp marta chaqiriladigan oʻz buyrugʻimiz nima?", "Funksiya", ["Shart", "Xato", "Sikl"], "★ — oʻz buyrugʻimiz: funksiya."],
    [2, "Nechta marta takrorlashni oldindan bilmasak qaysi buyruq?", "…gacha takrorla (while)", ["takror 5 marta", "agar", "funksiya"]],
    [2, "Robot qadamlarini sanab eslab qoladigan «quti» nima?", "Oʻzgaruvchi", ["Funksiya", "Shart", "Algoritm"]],
    [3, "«qadam = 0», keyin 3 marta «qadam = qadam + 1». qadam nechaga teng?", "3", ["0", "1", "4"]],
    [3, "Bloklardagi «takror 3 marta» Pythonda qanday yoziladi?", "for i in range(3):", ["while 3:", "if 3:", "print(3)"]],
    [3, "Algoritm qaysi xossaga ega boʻlishi shart?", "Albatta tugashi", ["Uzun boʻlishi", "Rasmli boʻlishi", "Ingliz tilida boʻlishi"]],
    [3, "Bir xil natija beradigan ikki dasturdan qaysi biri yaxshiroq?", "Qadamlari kamroq", ["Uzunroq", "Rangliroq", "Kechroq yozilgani"]],
  ];
  const dasturBilim = bilim("dastur", DASTUR_BILIM);

  // ======================================================================
  // 3. Internet (58–61)
  // ======================================================================
  // Paketlar soni: 1 — butun bo'linadi, 2 — qoldiq bor, 3 — yetib kelganlardan nechtasi yo'q
  const paket = {
    topic: "internet",
    levels: [1, 2, 3],
    make(level, rng) {
      if (level === 3) {
        const jami = ri(rng, 6, 10);
        const yoq = ri(rng, 1, 3);
        const keldi = shuffle(rng, Array.from({ length: jami }, (_, k) => k + 1)).slice(yoq).sort((a, b) => a - b);
        const yetmadi = Array.from({ length: jami }, (_, k) => k + 1).filter((k) => !keldi.includes(k));
        return {
          id: `${jami}:${keldi.join(",")}`,
          data: { jami, keldi },
          text: `Xabar ${jami} ta paketga boʻlingan. Shu paketlar yetib keldi. Nechtasini qayta soʻrash kerak?`,
          blocks: [big(keldi.map((k) => `${k}/${jami}`).join("  "))],
          input: num(1),
          answer: String(yoq),
          explain: `Yetib kelmagan: ${yetmadi.join(", ")} — ${yoq} ta.`,
        };
      }
      const k = ri(rng, 2, level === 1 ? 6 : 8);
      const p = ri(rng, 2, 9);
      const n = level === 1 ? k * p : k * (p - 1) + ri(rng, 1, k - 1);
      const javob = Math.ceil(n / k);
      return {
        id: `${n}/${k}`,
        data: { n, k },
        text: `Xabarda ${n} ta belgi. Bitta paketga ${k} ta belgi sigʻadi. Nechta paket kerak?`,
        input: num(2),
        answer: String(javob),
        explain: level === 1 ? `${n} : ${k} = ${javob}.` : `${n} : ${k} = ${Math.floor(n / k)}, qoldiq ${n % k} — u ham alohida paket: ${javob}.`,
      };
    },
  };

  // To'g'ri IP manzil: to'rtta son, har biri 0–255
  const ip = {
    topic: "internet",
    levels: [2, 3],
    make(level, rng) {
      const son = () => ri(rng, 0, 255);
      const togri = [son(), son(), son(), son()];
      const buz = () => {
        const x = togri.slice();
        const i = ri(rng, 0, 3);
        const tur = level === 2 ? pick(rng, ["katta", "kam"]) : pick(rng, ["katta", "kam", "ortiq", "manfiy"]);
        if (tur === "katta") x[i] = ri(rng, 256, 999);
        else if (tur === "kam") x.splice(i, 1);
        else if (tur === "ortiq") x.push(son());
        else x[i] = "−" + ri(rng, 1, 99);
        return x.join(".");
      };
      const javob = togri.join(".");
      const xato = [buz(), buz(), buz(), buz(), buz()];
      return {
        id: javob,
        data: { togri },
        text: "Qaysi biri toʻgʻri IP manzil?",
        input: choice(withOptions(rng, javob, xato)),
        answer: javob,
        explain: "IP manzil — nuqta bilan ajratilgan 4 ta son, har biri 0 dan 255 gacha.",
      };
    },
  };

  const INTERNET_BILIM = [
    [1, "Uzun xabar internetda qanday yuboriladi?", "Boʻlaklarga (paketlarga) boʻlinib", ["Bitta katta boʻlib", "Pochta orqali", "Faqat rasm boʻlib"]],
    [1, "Paketda raqam nima uchun yoziladi?", "Toʻgʻri tartibda yigʻish uchun", ["Chiroyli boʻlishi uchun", "Narxi uchun", "Hech nima uchun"]],
    [1, "Saytlar turadigan, kechayu kunduz ishlaydigan kompyuter?", "Server", ["Printer", "Sichqoncha", "Planshet"]],
    [1, "Saytni ochadigan dastur nima deyiladi?", "Brauzer", ["Paint", "Kalkulyator", "Savat"]],
    [2, "Sayt nomini IP manzilga aylantiradigan «daftar»?", "DNS", ["HTTPS", "Kesh", "Paket"]],
    [2, "Bir marta ochilgan sahifani tezroq ochish uchun saqlab qoʻyilgan nusxa?", "Kesh", ["DNS", "Server", "Havola"]],
    [2, "Manzil satridagi qulf belgisi nimani bildiradi?", "Ulanish shifrlangan (HTTPS)", ["Sayt yopiq", "Sayt pullik", "Internet yoʻq"]],
    [2, "Yoʻlda bitta sim uzilsa paket nima qiladi?", "Boshqa yoʻldan boradi", ["Yoʻqolib ketadi", "Toʻxtab turadi", "Orqaga qaytmaydi"]],
    [3, "Qulf belgisi sayt haqida nimani KAFOLATLAMAYDI?", "Sayt firibgar emasligini", ["Yoʻlda oʻqib boʻlmasligini", "Maʼlumot shifrlanganini", "Manzilga ulanganini"], "Firibgar sayt ham qulf olishi mumkin — manzilni tekshir."],
    [3, "Bitta paket yetib kelmasa nima qilinadi?", "Faqat oʻsha paket qayta soʻraladi", ["Butun xabar qaytadan yuboriladi", "Xabar oʻqilmaydi", "Hamma paket oʻchiriladi"]],
    [3, "Paketlar aralash kelsa nima qilinadi?", "Raqami boʻyicha tartiblanadi", ["Hammasi tashlanadi", "Kelgan tartibda oʻqiladi", "Server qayta yoqiladi"]],
    [3, "Qaysi biri toʻliq sayt manzili?", "https://maktab.uz", ["maktab", "@maktab", "maktab@uz"]],
  ];
  const internetBilim = bilim("internet", INTERNET_BILIM);

  // ======================================================================
  // 4. Parol va xavfsizlik (50–52)
  // ======================================================================
  const SOZLAR = ["olma", "mushuk", "bahor", "kitob", "quyosh", "daryo", "tulki", "yulduz"];
  // Qaysi parol kuchliroq: uzunlik va belgilar xilma-xilligi; lug'atdagi so'z va ism-yil zaif
  const kuchli = {
    topic: "xavfsizlik",
    levels: [1, 2, 3],
    make(level, rng) {
      const s = pick(rng, SOZLAR);
      const s2 = pick(rng, SOZLAR.filter((x) => x !== s));
      const yil = ri(rng, 2008, 2016);
      const katta = (w) => w[0].toUpperCase() + w.slice(1);
      let javob, xato;
      if (level === 1) {
        javob = `${katta(s)}${pick(rng, ["!", "#", "?"])}${s2}${ri(rng, 10, 99)}`;
        xato = ["123456", s, `${s}${yil}`, "qwerty", "1111"];
      } else if (level === 2) {
        javob = `${s}-${s2}-${pick(rng, SOZLAR.filter((x) => x !== s && x !== s2))}-${ri(rng, 10, 99)}`;
        xato = [`${katta(s)}1!`, `${s}${yil}`, `${s}${s}`, `${katta(s2)}${ri(rng, 1, 9)}`];
      } else {
        javob = `${katta(s)}${ri(rng, 10, 99)}#${s2.slice(0, 3)}${pick(rng, ["!", "?", "%"])}${ri(rng, 10, 99)}`;
        xato = [`P@r0l${ri(rng, 1, 9)}`, `${katta(s)}${yil}`, `${s.replace(/o/g, "0").replace(/a/g, "@")}`, `Ali${yil}`];
      }
      return {
        id: javob,
        data: { javob },
        text: "Qaysi parol eng kuchli?",
        input: choice(withOptions(rng, javob, xato)),
        answer: javob,
        explain: level === 3
          ? "Uzun, aralash belgili va lugʻatda yoʻq. @=a, 0=o hiylasini kompyuter biladi; ism va yil — zaif."
          : "Uzunlik va har xil belgilar parolni kuchli qiladi; soʻz, yil va 123456 — zaif.",
      };
    },
  };

  // Nechta variant: alifbo^uzunlik
  const variant = {
    topic: "xavfsizlik",
    levels: [1, 2, 3],
    make(level, rng) {
      const [a, nom] = level === 1 ? [10, "raqam (0–9)"] : pick(rng, [[10, "raqam (0–9)"], [2, "belgi (faqat 0 yoki 1)"], [3, "belgi (A, B yoki C)"], [4, "belgi"], [5, "belgi"]]);
      // 10 ta raqam bilan 6 belgi — 1 000 000, raqam klaviaturasiga sig'maydi: 5 tagacha
      const n = level === 1 ? ri(rng, 1, 3) : level === 2 ? ri(rng, 2, 4) : ri(rng, 4, a === 10 ? 5 : 6);
      const javob = a ** n;
      return {
        id: `${a}^${n}`,
        data: { a, n },
        text: `Parol ${n} ta belgidan iborat, har birida ${a} xil ${nom} boʻlishi mumkin. Nechta xil parol bor?`,
        input: num(String(javob).length + 1),
        answer: String(javob),
        explain: `${Array(n).fill(a).join(" × ")} = ${javob}.`,
      };
    },
  };

  // Havola aslida qaysi saytga olib boradi: zonadan oldingi nom
  const SAYTLAR = ["uzbank", "maktab", "kelajagim", "pochta", "oyinlar", "darslik"];
  const XAVF = ["xavf", "sovga-tez", "yutuq24", "bonus-pul", "login-tekshir"];
  const domen = {
    topic: "xavfsizlik",
    levels: [2, 3],
    make(level, rng) {
      const asl = pick(rng, SAYTLAR);
      const xavf = pick(rng, XAVF);
      const zona = pick(rng, [".com", ".net", ".xyz"]);
      const manzil = level === 2 ? `${asl}.uz.${xavf}${zona}` : `kirish.${asl}.uz-${pick(rng, ["tekshiruv", "bonus", "yangilash"])}.${xavf}${zona}`;
      const javob = `${xavf}${zona}`;
      return {
        id: manzil,
        data: { manzil },
        text: "Bu havola aslida qaysi saytga olib boradi?",
        blocks: [lines([manzil])],
        input: choice(withOptions(rng, javob, [`${asl}.uz`, `kirish.${asl}.uz`, asl, `${asl}${zona}`])),
        answer: javob,
        explain: "Saytni oxiridagi zona (.com, .uz …) va undan oldingi nom belgilaydi; boshidagi soʻzlar — aldash uchun.",
      };
    },
  };

  const XAVF_BILIM = [
    [1, "Parolni kimga aytish mumkin?", "Hech kimga (faqat ota-onaga)", ["Doʻstimga", "Sinfdoshimga", "Chatdagi notanish odamga"]],
    [1, "Qaysi parol eng zaif?", "123456", ["Bahor!kitob42", "olma-daryo-tulki", "Yulduz#7quyosh"]],
    [1, "Notanish odam chatda manzilingni soʻradi. Nima qilasan?", "Aytmayman, kattaga aytaman", ["Aytaman", "Rasmini yuboraman", "Parolimni ham aytaman"]],
    [1, "Qaysi biri parolni kuchliroq qiladi?", "Uzunroq qilish", ["Ismimni yozish", "Tugʻilgan yilimni yozish", "Faqat 1 yozish"]],
    [2, "Sayt parolni oʻzida qanday saqlaydi?", "Izini (xeshini) saqlaydi", ["Ochiq yozib qoʻyadi", "Rasm qilib saqlaydi", "Saqlamaydi ham"], "Iz (xesh)dan parolni orqaga tiklab boʻlmaydi."],
    [2, "Firibgar xatning belgisi qaysi?", "«Tezda kiring, aks holda bloklanadi!»", ["Doʻstingning odatiy salomi", "Maktab jadvali", "Ob-havo maʼlumoti"]],
    [2, "«Siz telefon yutdingiz! Kartangiz raqamini yozing» — bu nima?", "Firibgarlik", ["Haqiqiy sovgʻa", "Maktab topshirigʻi", "Oddiy reklama"]],
    [2, "Bitta parolni hamma saytda ishlatish nega xavfli?", "Bittasi oʻgʻirlansa hammasi ochiladi", ["Unutib qoʻyaman", "Sayt sekinlashadi", "Xavfli emas"]],
    [3, "«P@r0l» nega zaif?", "@=a, 0=o hiylasini kompyuter biladi", ["Juda uzun", "Belgisi koʻp", "Kuchli parol"]],
    [3, "Parolni 1 belgiga uzaytirsak (26 harf) variantlar necha marta koʻpayadi?", "26 marta", ["1 marta", "2 marta", "10 marta"]],
    [3, "Ikki bosqichli tekshiruv nima beradi?", "Parol bilsa ham ikkinchi kalit kerak", ["Parol kerak boʻlmaydi", "Sayt tezlashadi", "Hech nima"]],
    [3, "Xesh izidan parolni qanday topishga urinishadi?", "Mashhur parollarni birma-bir sinab", ["Izni orqaga aylantirib", "Saytdan soʻrab", "Hech qanday"], "Shuning uchun lugʻatdagi soʻz zaif — u birinchilardan sinaladi."],
  ];
  const xavfBilim = bilim("xavfsizlik", XAVF_BILIM);

  // ======================================================================
  // 5. Python (27–34)
  // ======================================================================
  // Kod nima chiqaradi: 1 — + − * va print; 2 — // % len va o'zgaruvchi; 3 — for/range yig'indisi va if
  const pyNatija = {
    topic: "python",
    levels: [1, 2, 3],
    make(level, rng) {
      if (level === 1) {
        const a = ri(rng, 2, 20);
        const b = ri(rng, 2, 9);
        const amal = pick(rng, ["+", "-", "*"]);
        const javob = amal === "+" ? a + b : amal === "-" ? Math.abs(a - b) : a * b;
        if (amal === "-" && a < b) return { id: `${b}-${a}`, data: {}, text: "Bu kod ekranga nima chiqaradi?", blocks: [code(`print(${b} - ${a})`)], input: num(3), answer: String(javob), explain: `${b} − ${a} = ${javob}.` };
        return { id: `${a}${amal}${b}`, data: {}, text: "Bu kod ekranga nima chiqaradi?", blocks: [code(`print(${a} ${amal} ${b})`)], input: num(3), answer: String(javob), explain: `${a} ${amal === "*" ? "×" : amal} ${b} = ${javob}.` };
      }
      if (level === 2) {
        const tur = pick(rng, ["bol", "qol", "len", "ozg"]);
        if (tur === "len") {
          const soz = pick(rng, ["salom", "kitob", "python", "maktab", "robot", "kompyuter", "olma", "dastur"]);
          return { id: `len${soz}`, data: {}, text: "Bu kod ekranga nima chiqaradi?", blocks: [code(`print(len("${soz}"))`)], input: num(2), answer: String(soz.length), explain: `«${soz}» da ${soz.length} ta harf.` };
        }
        if (tur === "ozg") {
          const x = ri(rng, 1, 9);
          const k = ri(rng, 2, 5);
          const q = ri(rng, 1, 9);
          return { id: `ozg${x}-${k}-${q}`, data: {}, text: "Bu kod ekranga nima chiqaradi?", blocks: [code(`x = ${x}\nx = x * ${k}\nx = x + ${q}\nprint(x)`)], input: num(3), answer: String(x * k + q), explain: `${x} × ${k} = ${x * k}, + ${q} = ${x * k + q}.` };
        }
        const a = ri(rng, 10, 60);
        const b = ri(rng, 3, 9);
        const javob = tur === "bol" ? Math.floor(a / b) : a % b;
        return { id: `${tur}${a}-${b}`, data: {}, text: "Bu kod ekranga nima chiqaradi?", blocks: [code(`print(${a} ${tur === "bol" ? "//" : "%"} ${b})`)], input: num(2), answer: String(javob), explain: tur === "bol" ? `${a} ni ${b} ga boʻlganda butun qismi ${javob} (// — butun boʻlish).` : `${a} = ${b} × ${Math.floor(a / b)} + ${javob}, qoldiq ${javob} (% — qoldiq).` };
      }
      const tur = pick(rng, ["yigindi", "sana", "if"]);
      if (tur === "if") {
        const x = ri(rng, 1, 30);
        const ch = ri(rng, 5, 25);
        const h = pick(rng, ["katta", "juft"]);
        const shart = h === "katta" ? `x > ${ch}` : "x % 2 == 0";
        const rost = h === "katta" ? x > ch : x % 2 === 0;
        return { id: `if${x}-${shart}`, data: {}, text: "Bu kod ekranga nima chiqaradi?", blocks: [code(`x = ${x}\nif ${shart}:\n    print("ha")\nelse:\n    print("yoʻq")`)], input: choice(["ha", "yoʻq"]), answer: rost ? "ha" : "yoʻq", explain: `${shart.replace("x", String(x))} — ${rost ? "rost" : "yolgʻon"}.` };
      }
      const a = ri(rng, 0, 5);
      const b = a + ri(rng, 2, 6);
      if (tur === "sana") {
        return { id: `sana${a}-${b}`, data: {}, text: "Sikl necha marta «*» chiqaradi?", blocks: [code(`for i in range(${a}, ${b}):\n    print("*")`)], input: num(2), answer: String(b - a), explain: `range(${a}, ${b}) — ${a} dan ${b - 1} gacha: ${b - a} ta (oxiri kirmaydi).` };
      }
      let s = 0;
      for (let i = a; i < b; i++) s += i;
      return { id: `yig${a}-${b}`, data: {}, text: "Bu kod ekranga nima chiqaradi?", blocks: [code(`s = 0\nfor i in range(${a}, ${b}):\n    s = s + i\nprint(s)`)], input: num(3), answer: String(s), explain: `${Array.from({ length: b - a }, (_, k) => a + k).join(" + ")} = ${s} (${b} kirmaydi).` };
    },
  };

  const PYTHON_BILIM = [
    [1, "Pythonda ekranga yozadigan buyruq?", "print", ["input", "len", "range"]],
    [1, "Matn qaysi belgilar ichida yoziladi?", "Qoʻshtirnoq ichida", ["Qavs ichida", "Nuqta bilan", "Hech narsasiz"]],
    [1, "Koddagi xato satr raqamini kim aytadi?", "Xato xabari", ["Monitor", "Klaviatura", "Hech kim"]],
    [1, "«x = 5» nima qiladi?", "x qutisiga 5 ni solib qoʻyadi", ["5 ni ekranga chiqaradi", "x ni oʻchiradi", "Xato beradi"]],
    [2, "Foydalanuvchidan javob oladigan buyruq?", "input", ["print", "len", "if"]],
    [2, "«=» va «==» farqi?", "«=» qiymat beradi, «==» tekshiradi", ["Farqi yoʻq", "«==» qiymat beradi", "Ikkalasi ham tekshiradi"]],
    [2, "if ichidagi satrlar qanday ajratiladi?", "Otstup (surilish) bilan", ["Vergul bilan", "Qavs bilan", "Hech qanday"]],
    [2, "Roʻyxatning birinchi elementi qaysi indeksda?", "0", ["1", "−1", "10"]],
    [3, "range(5) qaysi sonlarni beradi?", "0, 1, 2, 3, 4", ["1, 2, 3, 4, 5", "0, 1, 2, 3, 4, 5", "5"]],
    [3, "Natijani qaytaradigan funksiya qaysi soʻz bilan tugaydi?", "return", ["print", "def", "break"]],
    [3, "while sikli qachon toʻxtaydi?", "Sharti yolgʻon boʻlganda", ["10 martadan keyin", "Hech qachon", "print kelganda"]],
    [3, "Roʻyxat oxiriga element qoʻshish?", "append", ["len", "split", "input"]],
  ];
  const pythonBilim = bilim("python", PYTHON_BILIM);

  // ---------- Bankka qo'shish ----------
  const KINDS = { faylTuri, yol, nusxa, tanishuvBilim, robotJoy, takror, dasturBilim, paket, ip, internetBilim, kuchli, variant, domen, xavfBilim, pyNatija, pythonBilim };
  for (const t of TOPICS) if (!S.TOPICS.some((x) => x.id === t.id)) S.TOPICS.push(t);
  for (const [k, v] of Object.entries(KINDS)) if (!S.KINDS[k]) S.KINDS[k] = v;

  const api = { TOPICS, KINDS, TANISHUV_BILIM, DASTUR_BILIM, INTERNET_BILIM, XAVF_BILIM, PYTHON_BILIM };
  if (root.QK) root.QK.savollar2 = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

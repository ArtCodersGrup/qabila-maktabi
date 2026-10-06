// Musobaqa savollari — 2-qism (2026-10-06): saytga keyin qo'shilgan bloklar uchun 8 mavzu.
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
    { id: "algoritm", title: "Izlash va saralash" },
    { id: "kombinatorika", title: "Kombinatorika" },
    { id: "cpp", title: "C++" },
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

  // Robot qayerga yetdi — o'yindagidek: chapda maydon (robot va harfli kataklar), o'ngda kod.
  // 1 — faqat → ←, javob: necha katak o'ngda; 2–3 — to'rt yo'nalish, javob: qaysi harfli katakka yetdi
  function maydonYasa(rng, b, qoshimcha) {
    // Yo'l maydondan chiqmasin: boshlanish nuqtasini yo'lning eng chap/past nuqtasiga qarab tanlaymiz
    let x = 0, y = 0, minX = 0, maxX = 0, minY = 0, maxY = 0;
    for (const k of b) { x += OQ[k][0]; y += OQ[k][1]; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    const w = Math.max(5, maxX - minX + 1 + qoshimcha);
    const h = Math.max(4, maxY - minY + 1 + qoshimcha);
    const sx = -minX + ri(rng, 0, w - (maxX - minX + 1));
    const sy = -minY + ri(rng, 0, h - (maxY - minY + 1));
    return { w, h, start: [sx, sy], oxiri: [sx + x, sy + y] };
  }

  const robotJoy = {
    topic: "dastur",
    levels: [1, 2, 3],
    make(level, rng) {
      if (level === 1) {
        let b;
        do { b = Array.from({ length: ri(rng, 4, 7) }, () => (rng() < 0.7 ? "→" : "←")); } while (siljish(b)[0] <= 0);
        const x = siljish(b)[0];
        const m = maydonYasa(rng, b, 1);
        return {
          id: b.join(""),
          data: { b, start: m.start },
          text: "Robot shu kodni bajardi. U boshlagan joyidan necha katak oʻngga siljidi?",
          blocks: [{ type: "robot", w: m.w, h: m.h, robot: m.start, belgilar: [], kod: b }],
          input: num(1),
          answer: String(x),
          explain: `→ ${b.filter((v) => v === "→").length} ta, ← ${b.filter((v) => v === "←").length} ta: ${x} katak oʻngga.`,
        };
      }
      const yon = Object.keys(OQ);
      let b, j;
      do {
        b = Array.from({ length: level === 2 ? ri(rng, 3, 5) : ri(rng, 6, 8) }, () => pick(rng, yon));
        j = siljish(b);
      } while (!j[0] && !j[1]);
      const m = maydonYasa(rng, b, 2);
      // Chalg'ituvchi kataklar — tipik xatolar: o'q teskari o'qildi, bitta qadam unutildi, x va y almashdi
      const [ox, oy] = m.oxiri;
      const [sx, sy] = m.start;
      const nomzod = [[sx - j[0], oy], [ox, sy - j[1]], [sx + j[1], sy + j[0]], [ox + 1, oy], [ox - 1, oy], [ox, oy + 1], [ox, oy - 1], [sx - j[0], sy - j[1]]];
      const ichida = ([x, y]) => x >= 0 && y >= 0 && x < m.w && y < m.h;
      const teng = (p, q) => p[0] === q[0] && p[1] === q[1];
      const xatolar = [];
      for (const p of shuffle(rng, nomzod)) {
        if (xatolar.length < 3 && ichida(p) && !teng(p, m.oxiri) && !teng(p, m.start) && !xatolar.some((q) => teng(p, q))) xatolar.push(p);
      }
      const kataklar = shuffle(rng, [m.oxiri, ...xatolar]);
      const HARFLAR = ["A", "B", "C", "D"];
      const belgilar = kataklar.map((p, k) => ({ x: p[0], y: p[1], harf: HARFLAR[k] }));
      const javob = belgilar.find((q) => teng([q.x, q.y], m.oxiri)).harf;
      return {
        id: `${b.join("")}@${sx},${sy}`,
        data: { b, start: m.start, belgilar },
        text: "Robot shu kodni bajarsa, qaysi harfli katakka yetib boradi?",
        blocks: [{ type: "robot", w: m.w, h: m.h, robot: m.start, belgilar, kod: b }],
        input: choice(HARFLAR.slice(0, belgilar.length)),
        answer: javob,
        explain: `Oʻng-chap: ${j[0] >= 0 ? "+" : "−"}${Math.abs(j[0])}, yuqori-past: ${j[1] >= 0 ? "+" : "−"}${Math.abs(j[1])} → ${javob} katak.`,
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
        blocks: [code(satrlar.join("\n"))],
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
      const k = ri(rng, 2, level === 1 ? 9 : 8);
      const p = ri(rng, 2, level === 1 ? 10 : 9);
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
      const [a, nom] = level === 1 ? pick(rng, [[10, "raqam (0–9)"], [2, "belgi (faqat 0 yoki 1)"], [3, "belgi (A, B yoki C)"], [4, "rang"]]) : pick(rng, [[10, "raqam (0–9)"], [2, "belgi (faqat 0 yoki 1)"], [3, "belgi (A, B yoki C)"], [4, "belgi"], [5, "belgi"]]);
      // 10 ta raqam bilan 6 belgi — 1 000 000, raqam klaviaturasiga sig'maydi: 5 tagacha
      const n = level === 1 ? ri(rng, a === 10 ? 1 : 2, a === 10 ? 3 : 4) : level === 2 ? ri(rng, 2, 4) : ri(rng, 4, a === 10 ? 5 : 6);
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


  // Python: ro'yxat va satr — indeks 0 dan, len, kesish
  const pyRoyxat = {
    topic: "python",
    levels: [2, 3],
    make(level, rng) {
      const n = ri(rng, 4, 6);
      const a = Array.from({ length: n }, () => ri(rng, 1, 30));
      const roy = `[${a.join(", ")}]`;
      if (level === 2) {
        const i = ri(rng, 0, n - 1);
        return { id: `i${roy}${i}`, data: { a, i, tur: "indeks" }, text: "Bu kod ekranga nima chiqaradi?", blocks: [code(`a = ${roy}\nprint(a[${i}])`)], input: num(2), answer: String(a[i]), explain: `Indeks 0 dan boshlanadi: a[${i}] — ${i + 1}-element, ${a[i]}.` };
      }
      const tur = pick(rng, ["kesish", "oxirgi", "yigindi"]);
      if (tur === "oxirgi") return { id: `o${roy}`, data: { a, tur }, text: "Bu kod ekranga nima chiqaradi?", blocks: [code(`a = ${roy}\nprint(a[-1] + len(a))`)], input: num(2), answer: String(a[n - 1] + n), explain: `a[-1] — oxirgisi (${a[n - 1]}), len(a) = ${n}: ${a[n - 1] + n}.` };
      if (tur === "yigindi") {
        const j = ri(rng, 1, n - 1);
        return { id: `y${roy}${j}`, data: { a, j, tur }, text: "Bu kod ekranga nima chiqaradi?", blocks: [code(`a = ${roy}\nprint(a[0] + a[${j}])`)], input: num(2), answer: String(a[0] + a[j]), explain: `a[0] = ${a[0]}, a[${j}] = ${a[j]}: ${a[0] + a[j]}.` };
      }
      const i = ri(rng, 0, n - 3);
      const j = ri(rng, i + 2, n);
      const javob = `[${a.slice(i, j).join(", ")}]`;
      const xato = [`[${a.slice(i, j + 1).join(", ")}]`, `[${a.slice(i + 1, j + 1).join(", ")}]`, `[${a.slice(i + 1, j).join(", ")}]`, `[${a.slice(i, j - 1).join(", ")}]`];
      return { id: `k${roy}${i}${j}`, data: { a, i, j, tur }, text: "Bu kod ekranga nima chiqaradi?", blocks: [code(`a = ${roy}\nprint(a[${i}:${j}])`)], input: choice(withOptions(rng, javob, xato)), answer: javob, explain: `a[${i}:${j}] — ${i}-indeksdan ${j}-indeksgacha, ${j} kirmaydi.` };
    },
  };

  // ======================================================================
  // 6. Izlash va saralash (36–40)
  // ======================================================================
  const ikkilikSavollar = (n) => Math.floor(Math.log2(n)) + 1;
  const izlash = {
    topic: "algoritm",
    levels: [1, 2, 3],
    make(level, rng) {
      if (level === 1) {
        const n = ri(rng, 5, 60);
        return { id: `ch${n}`, data: { n, tur: "chiziqli" }, text: `Tartiblanmagan ${n} ta kartochkadan bittasini birma-bir qarab izlaymiz. Eng yomon holatda nechta kartochkani ochamiz?`, input: num(2), answer: String(n), explain: `Chiziqli izlash: kerakli kartochka eng oxirida boʻlishi mumkin — ${n} ta.` };
      }
      const n = level === 2 ? ri(rng, 6, 120) : ri(rng, 121, 5000);
      const javob = ikkilikSavollar(n);
      return { id: `ik${n}`, data: { n, tur: "ikkilik" }, text: `1 dan ${n} gacha son oʻyladim. Har savolga «kattaroq», «kichikroq» yoki «topding» deyman. Har safar yarmini tashlasang, eng koʻpi bilan nechta savolda topasan?`, input: num(2), answer: String(javob), explain: `Har savol oraliqni ikkiga boʻladi: ${2 ** (javob - 1)} ≤ ${n} < ${2 ** javob}, demak ${javob} ta savol.` };
    },
  };

  // Pufakcha saralash: bitta o'tish (2) va almashinuvlar soni (3)
  function birOtish(a) {
    const b = a.slice();
    for (let i = 0; i + 1 < b.length; i++) if (b[i] > b[i + 1]) [b[i], b[i + 1]] = [b[i + 1], b[i]];
    return b;
  }
  function almashinuvlar(a) {
    let n = 0;
    for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) n++;
    return n;
  }
  const saralash = {
    topic: "algoritm",
    levels: [1, 2, 3],
    make(level, rng) {
      const n = level === 1 ? 3 : level === 2 ? 4 : 5;
      let a;
      do { a = shuffle(rng, Array.from({ length: 9 }, (_, k) => k + 1)).slice(0, n); } while (almashinuvlar(a) === 0 || (level === 2 && birOtish(a).join() === a.slice().sort((x, y) => x - y).join()));
      if (level === 3) {
        const javob = almashinuvlar(a);
        return { id: `alm${a.join("")}`, data: { a, tur: "almashinuv" }, text: "Pufakcha saralash qoʻshni sonlarni almashtiradi. Bu roʻyxat tartiblanguncha jami nechta almashinuv boʻladi?", blocks: [big(a.join("  "))], input: num(2), answer: String(javob), explain: `Har «notoʻgʻri juftlik» (kattasi oldinda) bitta almashinuv: ${javob} ta.` };
      }
      if (level === 1) {
        const javob = Math.max(...a);
        return { id: `max${a.join("")}`, data: { a, tur: "oxiri" }, text: "Pufakcha saralashning 1-oʻtishidan keyin roʻyxat oxirida qaysi son turadi?", blocks: [big(a.join("  "))], input: num(1), answer: String(javob), explain: `Har oʻtishda eng kattasi «suzib» oxiriga chiqadi: ${javob}.` };
      }
      const javob = birOtish(a).join(" ");
      const tartib = a.slice().sort((x, y) => x - y).join(" ");
      const xato = [tartib, a.join(" "), birOtish(birOtish(a)).join(" "), a.slice().reverse().join(" ")];
      return { id: `ot${a.join("")}`, data: { a, tur: "otish" }, text: "Pufakcha saralashning 1-oʻtishidan keyin roʻyxat qanday boʻladi?", blocks: [big(a.join("  "))], input: choice(withOptions(rng, javob, xato)), answer: javob, explain: "Chapdan oʻngga: qoʻshni juftlikda kattasi oldinda boʻlsa — almashtiriladi." };
    },
  };

  const ALGORITM_BILIM = [
    [1, "Tartiblangan roʻyxatda tez izlash usuli?", "Ikkilik izlash (yarmiga boʻlish)", ["Tasodifiy tanlash", "Faqat oxiridan qarash", "Hech qanday"]],
    [1, "Saralash nima?", "Narsalarni tartibga keltirish", ["Narsalarni oʻchirish", "Narsalarni sanash", "Narsalarni yashirish"]],
    [1, "Ikkilik izlash qachon ishlaydi?", "Roʻyxat tartiblangan boʻlsa", ["Har doim", "Roʻyxat boʻsh boʻlsa", "Faqat 10 ta son boʻlsa"]],
    [1, "Algoritmning qaysi xossasi «har qadam aniq» degani?", "Aniqlik", ["Tezlik", "Rang", "Uzunlik"]],
    [2, "n 10 marta oshsa, O(n) algoritm qadami necha marta oshadi?", "10 marta", ["100 marta", "1 marta", "2 marta"]],
    [2, "n 10 marta oshsa, O(n²) algoritm qadami necha marta oshadi?", "100 marta", ["10 marta", "20 marta", "1000 marta"]],
    [2, "Qaysi biri tezroq oʻsadi?", "O(n²)", ["O(n)", "O(log n)", "O(1)"]],
    [2, "Pufakcha saralash nimani almashtiradi?", "Qoʻshni ikki elementni", ["Birinchi va oxirgisini", "Tasodifiy ikkitasini", "Hech nimani"]],
    [3, "Ikkilik izlash qadamlari qanday oʻsadi?", "O(log n)", ["O(n)", "O(n²)", "O(1)"]],
    [3, "Tanlash saralashida har oʻtishda nima qilinadi?", "Eng kichigi topilib oldinga qoʻyiladi", ["Qoʻshnilar almashadi", "Roʻyxat ikkiga boʻlinadi", "Hech nima"]],
    [3, "Roʻyxat allaqachon tartiblangan boʻlsa, pufakcha saralash nechta almashinuv qiladi?", "0", ["1", "n", "n²"]],
    [3, "Massivning birinchi elementini olish qanday oʻsadi?", "O(1)", ["O(n)", "O(log n)", "O(n²)"]],
  ];
  const algoritmBilim = bilim("algoritm", ALGORITM_BILIM);

  // ======================================================================
  // 7. Kombinatorika (41–45)
  // ======================================================================
  const fakt = (n) => (n <= 1 ? 1 : n * fakt(n - 1));
  const C = (n, k) => fakt(n) / (fakt(k) * fakt(n - k));
  const sanash = {
    topic: "kombinatorika",
    levels: [1, 2, 3],
    make(level, rng) {
      if (level === 1) {
        const a = ri(rng, 2, 6);
        const b = ri(rng, 2, 6);
        const va = rng() < 0.6;
        const javob = va ? a * b : a + b;
        return {
          id: `${va ? "va" : "yoki"}${a}-${b}`, data: { a, b, va, tur: "qoida" },
          text: va ? `${a} xil koʻylak VA ${b} xil shim bor. Nechta xil kiyinish mumkin?` : `Ichimlikka ${a} xil sharbat YOKI ${b} xil choydan bittasini tanlaysan. Nechta xil tanlov bor?`,
          input: num(2), answer: String(javob), explain: va ? `VA — koʻpaytiramiz: ${a} × ${b} = ${javob}.` : `YOKI — qoʻshamiz: ${a} + ${b} = ${javob}.`,
        };
      }
      if (level === 2) {
        const r = rng();
        if (r < 0.4) {
          const [a, b, c] = [ri(rng, 2, 5), ri(rng, 2, 5), ri(rng, 2, 4)];
          return { id: `uch${a}-${b}-${c}`, data: { a, b, c, tur: "uchVa" }, text: `Nonushtaga ${a} xil non, ${b} xil sharbat VA ${c} xil meva bor. Har biridan bittadan olsang, nechta xil nonushta boʻladi?`, input: num(3), answer: String(a * b * c), explain: `${a} × ${b} × ${c} = ${a * b * c}.` };
        }
        if (r < 0.65) {
          const n = ri(rng, 3, 7);
          return { id: `f${n}`, data: { n, tur: "faktorial" }, text: `${n} ta doʻst qatorga necha xil turishi mumkin?`, input: num(4), answer: String(fakt(n)), explain: `${n}! = ${Array.from({ length: n }, (_, k) => n - k).join(" × ")} = ${fakt(n)}.` };
        }
        const n = ri(rng, 4, 10);
        const k = pick(rng, [2, 3]);
        const javob = fakt(n) / fakt(n - k);
        const yozuv = Array.from({ length: k }, (_, i) => n - i).join(" × ");
        return { id: `a${n}-${k}`, data: { n, k, tur: "joylash" }, text: k === 2 ? `${n} kishidan 1-oʻrin va 2-oʻrin necha xil berilishi mumkin?` : `${n} kishidan oltin, kumush va bronza medallar necha xil berilishi mumkin?`, input: num(3), answer: String(javob), explain: `Tartib muhim: ${yozuv} = ${javob}.` };
      }
      const tur = pick(rng, ["jamoa", "kaptar"]);
      if (tur === "jamoa") {
        const n = ri(rng, 5, 10);
        const k = ri(rng, 2, 3);
        return { id: `c${n}-${k}`, data: { n, k, tur }, text: `${n} oʻquvchidan ${k} kishilik jamoa necha xil tanlanadi? (tartib muhim emas)`, input: num(3), answer: String(C(n, k)), explain: `C(${n}, ${k}) = ${n}${k === 3 ? ` × ${n - 1} × ${n - 2}` : ` × ${n - 1}`} : ${fakt(k)} = ${C(n, k)}.` };
      }
      const k = ri(rng, 3, 9);
      const n = k * ri(rng, 1, 4) + ri(rng, 1, k - 1);
      const javob = Math.ceil(n / k);
      return { id: `k${n}-${k}`, data: { n, k, tur }, text: `${n} ta kaptar ${k} ta uyaga kirdi. Qaysidir uyada KAMIDA nechta kaptar bor?`, input: num(2), answer: String(javob), explain: `Dirixle: ${n} : ${k} = ${Math.floor(n / k)}, qoldiq ${n % k} — demak kamida ${javob}.` };
    },
  };

  const KOMB_BILIM = [
    [1, "«VA» boʻlsa variantlar qanday hisoblanadi?", "Koʻpaytiriladi", ["Qoʻshiladi", "Ayiriladi", "Boʻlinadi"]],
    [1, "«YOKI» boʻlsa variantlar qanday hisoblanadi?", "Qoʻshiladi", ["Koʻpaytiriladi", "Ayiriladi", "Boʻlinadi"]],
    [1, "Tanga 2 marta tashlansa nechta natija boʻladi?", "4", ["2", "3", "6"]],
    [1, "Kubik 1 marta tashlansa nechta natija boʻladi?", "6", ["2", "4", "12"]],
    [2, "3! nechaga teng?", "6", ["3", "9", "1"]],
    [2, "Qachon tartib muhim?", "Oʻrinlar taqsimlanganda", ["Jamoa tanlanganda", "Savatga meva solganda", "Hech qachon"]],
    [2, "Paskal uchburchagidagi son qanday topiladi?", "Ustidagi ikki son qoʻshiladi", ["Ustidagi son ikkiga koʻpaytiriladi", "Tasodifiy", "Doim 1"]],
    [2, "0! nechaga teng?", "1", ["0", "10", "Yoʻq"]],
    [3, "C(5, 2) nechaga teng?", "10", ["20", "5", "25"]],
    [3, "Paskal uchburchagining n-qatoridagi sonlar yigʻindisi?", "2ⁿ", ["n²", "n!", "2n"]],
    [3, "13 kishi boʻlsa, tugʻilgan oyi bir xil ikki kishi bormi?", "Albatta bor", ["Albatta yoʻq", "Balki", "Faqat 12 boʻlsa"], "12 oy — 12 uya, 13 kishi — kaptar: Dirixle."],
    [3, "C(n, k) va C(n, n − k) qanday bogʻliq?", "Teng", ["Birinchisi katta", "Ikkinchisi katta", "Bogʻliq emas"]],
  ];
  const kombBilim = bilim("kombinatorika", KOMB_BILIM);

  // ======================================================================
  // 8. C++ (54–57)
  // ======================================================================
  const cppNatija = {
    topic: "cpp",
    levels: [1, 2, 3],
    make(level, rng) {
      if (level === 1) {
        const a = ri(rng, 2, 30);
        const b = ri(rng, 2, 9);
        const amal = pick(rng, ["+", "*"]);
        const javob = amal === "+" ? a + b : a * b;
        return { id: `${a}${amal}${b}`, data: { a, b, amal }, text: "Bu C++ kodi ekranga nima chiqaradi?", blocks: [code(`int a = ${a}, b = ${b};\ncout << a ${amal} b;`)], input: num(3), answer: String(javob), explain: `${a} ${amal === "*" ? "×" : "+"} ${b} = ${javob}.` };
      }
      if (level === 2) {
        const a = ri(rng, 7, 60);
        const b = ri(rng, 2, 9);
        const amal = pick(rng, ["/", "%"]);
        const javob = amal === "/" ? Math.trunc(a / b) : a % b;
        return { id: `${a}${amal}${b}`, data: { a, b, amal }, text: "Bu C++ kodi ekranga nima chiqaradi?", blocks: [code(`int a = ${a}, b = ${b};\ncout << a ${amal} b;`)], input: num(2), answer: String(javob), explain: amal === "/" ? `Ikkalasi int — butun boʻlish: ${a} / ${b} = ${javob} (kasr tashlanadi).` : `Qoldiq: ${a} = ${b} × ${Math.trunc(a / b)} + ${javob}.` };
      }
      const shakl = rng();
      if (shakl < 0.3) { // while: x chegaraga yetguncha ikki/uch baravar
        const x = ri(rng, 1, 5);
        const k = pick(rng, [2, 3]);
        const ch = ri(rng, 20, 300);
        let v = x;
        while (v < ch) v *= k;
        return { id: `w${x}-${k}-${ch}`, data: {}, text: "Bu C++ kodi ekranga nima chiqaradi?", blocks: [code(`int x = ${x};\nwhile (x < ${ch}) x *= ${k};\ncout << x;`)], input: num(4), answer: String(v), explain: `x ${ch} dan kichik ekan ${k} ga koʻpaytiramiz: oxirida ${v}.` };
      }
      if (shakl < 0.55) { // qadamli for: necha marta ishlaydi
        const a = ri(rng, 0, 5);
        const k = ri(rng, 2, 4);
        const b = a + ri(rng, 6, 20);
        let n = 0;
        for (let i = a; i <= b; i += k) n++;
        return { id: `q${a}-${b}-${k}`, data: {}, text: "Bu C++ kodi ekranga nima chiqaradi?", blocks: [code(`int n = 0;\nfor (int i = ${a}; i <= ${b}; i += ${k}) n++;\ncout << n;`)], input: num(2), answer: String(n), explain: `i: ${Array.from({ length: n }, (_, t) => a + t * k).join(", ")} — ${n} marta.` };
      }
      const kop = rng() < 0.4; // ko'paytma 1 dan boshlanadi — 0 ga ko'paytirib yubormaslik uchun
      const a = ri(rng, kop ? 1 : 0, 4);
      const b = a + ri(rng, 2, kop ? 4 : 6);
      let s = kop ? 1 : 0;
      for (let i = a; i < b; i++) s = kop ? s * i : s + i;
      return { id: `${kop ? "k" : "y"}${a}-${b}`, data: { a, b, amal: kop ? "*" : "+" }, text: "Bu C++ kodi ekranga nima chiqaradi?", blocks: [code(`int s = ${kop ? 1 : 0};\nfor (int i = ${a}; i < ${b}; i++) s ${kop ? "*=" : "+="} i;\ncout << s;`)], input: num(4), answer: String(s), explain: `${Array.from({ length: b - a }, (_, k) => a + k).join(kop ? " × " : " + ")} = ${s} (${b} kirmaydi).` };
    },
  };

  const CPP_BILIM = [
    [1, "C++ da ekranga chiqaradigan buyruq?", "cout", ["cin", "print", "int"]],
    [1, "C++ da har buyruq oxiriga nima qoʻyiladi?", "Nuqtali vergul (;)", ["Nuqta (.)", "Vergul (,)", "Hech narsa"]],
    [1, "C++ da klaviaturadan son oʻqiydigan buyruq?", "cin", ["cout", "input", "read"]],
    [1, "Butun son turi qaysi?", "int", ["string", "char", "bool"]],
    [2, "C++ da blok nima bilan belgilanadi?", "Jingalak qavs { }", ["Otstup", "Kvadrat qavs [ ]", "Qoʻshtirnoq"]],
    [2, "int ga sigʻmaydigan katta son uchun qaysi tur?", "long long", ["char", "bool", "short"]],
    [2, "C++ da 7 / 2 (ikkalasi int) nechaga teng?", "3", ["3.5", "4", "2"]],
    [2, "«==» C++ da nima qiladi?", "Tengligini tekshiradi", ["Qiymat beradi", "Qoʻshadi", "Chiqaradi"]],
    [3, "int ning eng katta qiymati taxminan qancha?", "2 milliard", ["1 million", "65 ming", "10 milliard"], "2 147 483 647 — undan oshsa «toshib ketadi»."],
    [3, "for (int i = 0; i < n; i++) — sikl necha marta ishlaydi?", "n marta", ["n + 1 marta", "n − 1 marta", "1 marta"]],
    [3, "Massivni tartiblaydigan tayyor funksiya?", "sort", ["order", "len", "append"]],
    [3, "Nega olimpiadada C++ ishlatiladi?", "Tez ishlaydi", ["Qisqa yoziladi", "Rangli", "Faqat u bor"]],
  ];
  const cppBilim = bilim("cpp", CPP_BILIM);


  // Python: mantiq (48) — True/False, and/or/not
  const pyMantiq = {
    topic: "python",
    levels: [1, 2, 3],
    make(level, rng) {
      const tak = () => {
        const a = ri(rng, 1, 20);
        const b = ri(rng, 1, 20);
        const op = pick(rng, [">", "<", "=="]);
        const v = op === ">" ? a > b : op === "<" ? a < b : a === b;
        return { t: `${a} ${op} ${b}`, v };
      };
      const p1 = tak();
      if (level === 1) return { id: p1.t, data: { qism: [p1.t], ops: [], qiymat: [p1.v] }, text: "Bu kod ekranga nima chiqaradi?", blocks: [code(`print(${p1.t})`)], input: choice(["True", "False"]), answer: p1.v ? "True" : "False", explain: `${p1.t} — ${p1.v ? "rost (True)" : "yolgʻon (False)"}.` };
      const p2 = tak();
      const op = pick(rng, ["and", "or"]);
      const not = level === 3 && rng() < 0.6;
      let v = op === "and" ? p1.v && p2.v : p1.v || p2.v;
      if (not) v = !v;
      const ifoda = `${not ? "not (" : ""}${p1.t} ${op} ${p2.t}${not ? ")" : ""}`;
      return {
        id: ifoda, data: { qism: [p1.t, p2.t], ops: [op], not, qiymat: [p1.v, p2.v] },
        text: "Bu kod ekranga nima chiqaradi?", blocks: [code(`print(${ifoda})`)],
        input: choice(["True", "False"]), answer: v ? "True" : "False",
        explain: `${p1.v} ${op} ${p2.v} = ${not ? !v : v}${not ? `; not → ${v}` : ""}. and — ikkalasi True boʻlsa; or — bittasi yetadi.`,
      };
    },
  };

  // Python: funksiya (34) — def, parametr, return
  const pyFunksiya = {
    topic: "python",
    levels: [2, 3],
    make(level, rng) {
      const k = ri(rng, 2, 5);
      const q = ri(rng, 0, 9);
      const x = ri(rng, 1, 9);
      if (level === 2) {
        return { id: `f${k}-${q}-${x}`, data: { k, q, x, tur: "bir" }, text: "Bu kod ekranga nima chiqaradi?", blocks: [code(`def f(x):\n    return x * ${k} + ${q}\n\nprint(f(${x}))`)], input: num(3), answer: String(x * k + q), explain: `f(${x}) = ${x} × ${k} + ${q} = ${x * k + q}.` };
      }
      const y = ri(rng, 1, 9);
      const fx = x * k + q;
      const fy = y * k + q;
      return { id: `ff${k}-${q}-${x}-${y}`, data: { k, q, x, y, tur: "ikki" }, text: "Bu kod ekranga nima chiqaradi?", blocks: [code(`def f(x):\n    return x * ${k} + ${q}\n\nprint(f(${x}) + f(${y}))`)], input: num(3), answer: String(fx + fy), explain: `f(${x}) = ${fx}, f(${y}) = ${fy}; ${fx} + ${fy} = ${fx + fy}.` };
    },
  };

  // Blok-sxema (37): son boshlang'ich qiymatdan shart bajarilguncha o'zgaradi — nima chiqadi
  const blokSxema = {
    topic: "algoritm",
    levels: [1, 2, 3],
    make(level, rng) {
      if (level === 1) {
        const x = ri(rng, 1, 9);
        const a = ri(rng, 2, 9);
        const b = ri(rng, 2, 5);
        return { id: `c${x}-${a}-${b}`, data: { x, a, b, tur: "chiziqli" }, text: "Blok-sxema boʻyicha yur. Oxirida nima chiqadi?", blocks: [lines([`⬭ Boshlash`, `▭ x = ${x}`, `▭ x = x + ${a}`, `▭ x = x × ${b}`, `▱ x ni chiqar`, `⬭ Tugash`])], input: num(3), answer: String((x + a) * b), explain: `${x} + ${a} = ${x + a}, × ${b} = ${(x + a) * b}.` };
      }
      const x = ri(rng, 1, 5);
      const k = level === 2 ? ri(rng, 2, 4) : ri(rng, 2, 3);
      const ch = level === 2 ? ri(rng, 10, 40) : ri(rng, 50, 200);
      const amal = level === 2 ? "+" : "×";
      let v = x, n = 0;
      while (v < ch) { v = amal === "+" ? v + k : v * k; n++; }
      const soraydi = level === 3 && rng() < 0.5 ? "takror" : "qiymat";
      return {
        id: `s${x}${amal}${k}<${ch}${soraydi}`, data: { x, k, ch, amal, soraydi },
        text: soraydi === "takror" ? "Blok-sxemada «x < …?» savoli necha marta «Ha» javobini oladi?" : "Blok-sxema boʻyicha yur. Oxirida nima chiqadi?",
        blocks: [lines([`⬭ Boshlash`, `▭ x = ${x}`, `◇ x < ${ch} ?  Ha → ▭ x = x ${amal} ${k}, yana ◇ ga qayt`, `  Yoʻq → ▱ x ni chiqar → ⬭ Tugash`])],
        input: num(3), answer: String(soraydi === "takror" ? n : v),
        explain: soraydi === "takror" ? `x ${n} marta oʻzgardi, keyin x = ${v} va shart yolgʻon.` : `x ${ch} dan kichik ekan, ${amal === "+" ? "qoʻshamiz" : "koʻpaytiramiz"}: oxirida ${v}.`,
      };
    },
  };


  // ---------- Qo'shimcha bilim savollari (2026-10-06: «savollar ko'paysin, takror kamaysin») ----------
  TANISHUV_BILIM.push(
    [1, "Kompyuterning «miyasi» — hamma hisob-kitob qayerda boʻladi?", "Tizim blokida", ["Monitorda", "Sichqonchada", "Kolonkada"]],
    [1, "Kamera nima qiladi?", "Rasm va video oladi", ["Ovoz chiqaradi", "Harf yozadi", "Qogʻozga chiqaradi"]],
    [1, "Sichqoncha bilan narsani bir joydan boshqasiga oʻtkazish nima deyiladi?", "Sudrab olib borish", ["Ikki marta bosish", "Oʻng tugma", "Gʻildirakni aylantirish"]],
    [1, "Sichqoncha gʻildiragi nima qiladi?", "Sahifani yuqori-pastga suradi", ["Kompyuterni oʻchiradi", "Faylni oʻchiradi", "Ovozni yozadi"]],
    [1, "«□» tugmasi oynani nima qiladi?", "Butun ekranga yoyadi", ["Yopadi", "Kichraytiradi", "Saqlaydi"]],
    [1, "Rasm chizadigan dastur qaysi?", "Paint", ["Kalkulyator", "Brauzer", "Savat"]],
    [1, "Matn yozadigan dasturda yangi qatorga oʻtish tugmasi?", "Enter", ["Backspace", "Shift", "Ctrl"]],
    [2, "Fayllar turadigan «quti» nima deyiladi?", "Papka", ["Oyna", "Belgi", "Brauzer"]],
    [2, "Faylga nom berish nima deyiladi?", "Nomlash", ["Kesish", "Oʻchirish", "Ochish"]],
    [2, "Belgilangan matnni nusxalash tezkor tugmasi?", "Ctrl + C", ["Ctrl + V", "Ctrl + X", "Ctrl + Z"]],
    [2, "Nusxani qoʻyish tezkor tugmasi?", "Ctrl + V", ["Ctrl + C", "Ctrl + S", "Ctrl + Z"]],
    [2, "Paintʼdagi oʻchirgʻich nima qiladi?", "Boʻyalgan joyni oqartiradi", ["Faylni oʻchiradi", "Rangni almashtiradi", "Rasmni saqlaydi"]],
    [2, "Kursor nima?", "Matnda yozish joyini koʻrsatuvchi chiziqcha", ["Sichqonchaning tugmasi", "Fayl turi", "Brauzer nomi"]],
    [2, "Vazifalar paneli odatda ekranning qayerida?", "Pastda", ["Tepada", "Oʻrtada", "Monitor orqasida"]],
    [3, "Faylni boshqa papkaga KOʻCHIRISH uchun qaysi juftlik?", "Kesish, keyin Qoʻyish", ["Nusxa, keyin Oʻchirish", "Ochish, keyin Yopish", "Saqlash, keyin Nomlash"]],
    [3, "Savatdagi faylni nima qilsa boʻladi?", "Qaytarish yoki butunlay oʻchirish", ["Faqat ochish", "Faqat nomlash", "Hech nima"]],
    [3, "«Kompyuter › Hujjatlar › xat.txt» — bu nima?", "Faylning yoʻli", ["Sayt manzili", "Parol", "Dastur nomi"]],
    [3, "Bir nechta oyna ochiq. Qaysi biri faol?", "Eng oldindagisi", ["Eng kichigi", "Eng birinchi ochilgani", "Hammasi"]],
    [3, "Matndagi soʻzni ikki marta tez bossak nima boʻladi?", "Soʻz belgilanadi", ["Soʻz oʻchadi", "Fayl yopiladi", "Soʻz qalin boʻladi"]],
    [3, "Paintʼda xato chizdingiz. Eng tez tuzatish?", "Ctrl + Z", ["Ctrl + S", "Kompyuterni oʻchirish", "Yangi fayl ochish"]],
    [3, "Sayt «Yuklab olish uchun parolingizni yozing» dedi. Nima qilasiz?", "Yozmayman, kattaga aytaman", ["Yozaman", "Doʻstimning parolini yozaman", "Telefonimni yozaman"]],
  );
  DASTUR_BILIM.push(
    [1, "Robot «→» buyrugʻini olsa nima qiladi?", "Bir katak oʻngga yuradi", ["Bir katak chapga yuradi", "Toʻxtaydi", "Aylanadi"]],
    [1, "Dastur — bu nima?", "Kompyuter bajaradigan buyruqlar", ["Kompyuter qismi", "Rasm", "Sayt"]],
    [1, "Robot devorga qarab yursa nima boʻladi?", "Oʻtolmaydi — dastur xato", ["Devordan oʻtadi", "Uchib ketadi", "Hech narsa"]],
    [1, "«→ → ↑» va «↑ → →» bir xil joyga olib boradimi?", "Ha, yoʻl boshqa, joy bir xil", ["Yoʻq, hech qachon", "Faqat robot katta boʻlsa", "Bilib boʻlmaydi"]],
    [1, "Buyruqlar qaysi tartibda bajariladi?", "Yuqoridan pastga, birma-bir", ["Pastdan yuqoriga", "Hammasi birdan", "Tasodifiy"]],
    [1, "Dasturdagi xato nima deyiladi?", "Bag (bug)", ["Bayt", "Bit", "Belgi"]],
    [1, "Robotga «takror 2 marta: → ↑» desak nechta buyruq bajariladi?", "4", ["2", "3", "6"]],
    [2, "«Toʻsiqqacha yur» buyrugʻi qachon toʻxtaydi?", "Oldinda toʻsiq paydo boʻlganda", ["5 qadamdan keyin", "Hech qachon", "Boshida"]],
    [2, "Bitta dastur har xil maydonda ishlashi uchun nima kerak?", "Shart va takror", ["Koʻproq oʻq", "Rangli robot", "Uzun dastur"]],
    [2, "★ buyrugʻi ichida «→ ↑». Dastur «★ ★». Robot nechta qadam yuradi?", "4", ["2", "3", "1"]],
    [2, "Oʻzgaruvchi qiymati nima uchun kerak?", "Sonni eslab qolish uchun", ["Robotni boʻyash uchun", "Dasturni oʻchirish uchun", "Hech nima"]],
    [2, "«qadam = qadam + 1» nima qiladi?", "qadamni bittaga oshiradi", ["qadamni nolga tenglaydi", "Robotni toʻxtatadi", "Hech nima"]],
    [2, "Dasturni qisqartirishning eng yaxshi yoʻli?", "Takrorlanadigan qismni takrorga solish", ["Buyruqlarni oʻchirish", "Robotni almashtirish", "Maydonni kichraytirish"]],
    [2, "Xatoni topishda nima yordam beradi?", "Dasturni qadam-baqadam yurib chiqish", ["Dasturni tezroq ishlatish", "Kompyuterni oʻchirish", "Rangni almashtirish"]],
    [3, "Bloklardagi «agar … aks holda …» Pythonʼda qanday?", "if … else", ["for … in", "while … do", "def … return"]],
    [3, "Pythonʼda «…gacha takrorla» qaysi soʻz bilan?", "while", ["for", "if", "def"]],
    [3, "Pythonʼda oʻz buyrugʻimizni (funksiya) yasash soʻzi?", "def", ["if", "for", "print"]],
    [3, "«x = 0; takror 4 marta: x = x + 3». Oxirida x nechaga teng?", "12", ["4", "7", "3"]],
    [3, "Ikki dastur bir xil ishni qiladi: biri 12, biri 7 buyruq. Qaysi yaxshiroq?", "7 buyruqlisi", ["12 buyruqlisi", "Farqi yoʻq", "Ikkalasi ham yomon"]],
    [3, "Algoritmning «tugashi shart» degani nima?", "Cheksiz aylanib qolmasligi", ["Tez ishlashi", "Qisqa boʻlishi", "Rangli boʻlishi"]],
    [3, "while sikli toʻxtamasa nima deyiladi?", "Cheksiz sikl", ["Funksiya", "Shart", "Oʻzgaruvchi"]],
  );
  INTERNET_BILIM.push(
    [1, "Internet nima?", "Dunyodagi kompyuterlarni bogʻlagan tarmoq", ["Bitta katta kompyuter", "Telefon dasturi", "Kitob"]],
    [1, "Bir saytdan boshqasiga oʻtkazadigan koʻk soʻz?", "Havola", ["Manzil", "Paket", "Server"]],
    [1, "Maʼlumot qidirish uchun qaysi sayt?", "Qidiruv sayti", ["Oʻyin sayti", "Rasm dasturi", "Savat"]],
    [1, "Sahifani qayta yuklash tugmasi?", "↻ Yangilash", ["← Orqaga", "✕ Yopish", "⭐ Xatchoʻp"]],
    [1, "Sevimli saytni tez ochish uchun nima qilinadi?", "Xatchoʻpga qoʻshiladi", ["Oʻchiriladi", "Nusxalanadi", "Savatga tashlanadi"]],
    [1, "Sayt manzilida «.uz» nimani bildiradi?", "Oʻzbekiston sayti", ["Rasm fayli", "Parol", "Server nomi"]],
    [1, "Xabar yuborilganda paketlar qayerga boradi?", "Manzildagi kompyuterga", ["Hamma kompyuterga", "Hech qayerga", "Printerga"]],
    [2, "IP manzil nima?", "Internetdagi kompyuter raqami", ["Sayt nomi", "Parol", "Fayl turi"]],
    [2, "IP manzildagi har bir son qaysi oraliqda?", "0 dan 255 gacha", ["1 dan 100 gacha", "0 dan 999 gacha", "Istalgan"]],
    [2, "Paketlar yoʻlda nimalar orqali oʻtadi?", "Tugunlar (routerlar) orqali", ["Printerlar orqali", "Faqat bitta sim orqali", "Monitorlar orqali"]],
    [2, "Nega kesh sahifani tezroq ochadi?", "Nusxa yaqinda, uzoqdan olib kelinmaydi", ["Internet tezlashadi", "Sayt kichrayadi", "Kompyuter yangilanadi"]],
    [2, "Brauzer saytni qanday topadi?", "DNS dan IP manzilini soʻraydi", ["Tasodifiy qidiradi", "Printerdan soʻraydi", "Faylni ochadi"]],
    [2, "«https» dagi «s» nimani bildiradi?", "Xavfsiz (shifrlangan)", ["Sayt", "Server", "Sekin"]],
    [2, "Paket ichida nima boʻladi?", "Xabar boʻlagi, raqam va manzil", ["Butun kitob", "Faqat rasm", "Hech narsa"]],
    [3, "Bir paket 5 belgi sigʻdiradi, xabar 23 belgi. Nechta paket?", "5", ["4", "23", "6"]],
    [3, "Server javob bermayapti. Nima boʻlishi mumkin?", "Server oʻchiq yoki band", ["Brauzer rangi oʻzgargan", "Klaviatura buzilgan", "Monitor kichik"]],
    [3, "Bir xil sayt nomi ikki xil IP ga olib bordi. Bu nimaning belgisi boʻlishi mumkin?", "DNS aldangan — xavf", ["Hamma narsa joyida", "Internet tezlashdi", "Kesh ishladi"]],
    [3, "Ochiq Wi-Fiʼda parol yozish nega xavfli?", "Boshqalar tinglashi mumkin", ["Wi-Fi sekinlashadi", "Telefon oʻchadi", "Xavfli emas"]],
    [3, "Qaysi manzil xavfliroq koʻrinadi?", "maktab.uz-kirish.xyz", ["maktab.uz", "https://maktab.uz", "www.maktab.uz"]],
    [3, "Paketlar har xil yoʻldan kelsa, qabul qiluvchi qanday biladi?", "Raqamiga qarab tartiblaydi", ["Kelgan tartibda oʻqiydi", "Bilmaydi", "Serverdan soʻraydi"]],
    [3, "Kesh eski sahifani koʻrsatsa nima qilinadi?", "Sahifa yangilanadi", ["Kompyuter oʻchiriladi", "Sayt oʻchiriladi", "Hech nima qilib boʻlmaydi"]],
  );
  XAVF_BILIM.push(
    [1, "Parolni qayerda saqlash xavfli?", "Stikerga yozib monitorga yopishtirish", ["Yodda saqlash", "Ota-onaga aytish", "Parol saqlovchida"]],
    [1, "Notanish odamdan kelgan havolani nima qilasiz?", "Bosmayman", ["Darhol bosaman", "Doʻstlarimga yuboraman", "Parolimni yozaman"]],
    [1, "Internetda oʻzing haqingda nimani yozmaslik kerak?", "Uy manzili va telefon", ["Sevimli rang", "Sevimli hayvon", "Sevimli fan"]],
    [1, "Kompyuterdan ketayotganda akkauntdan nima qilish kerak?", "Chiqish", ["Ochiq qoldirish", "Parolni yozib qoldirish", "Hech nima"]],
    [1, "Qaysi parol yaxshiroq?", "Uzun va yodda qoladigan gap", ["Ismim", "Tugʻilgan yilim", "123"]],
    [1, "Kimdir chatda seni xafa qilyapti. Nima qilasan?", "Kattaga aytaman, bloklayman", ["Javob qaytaraman", "Parolimni aytaman", "Hech kimga aytmayman"]],
    [1, "Oʻyin «bepul tanga» uchun parol soʻradi. Bu nima?", "Firibgarlik", ["Sovgʻa", "Yangi daraja", "Oddiy savol"]],
    [2, "Firibgar xatda koʻpincha nima boʻladi?", "Shoshiltirish va qoʻrqitish", ["Doʻstona salom", "Uy vazifasi", "Hech narsa"]],
    [2, "Xat «pochta.uz» dan kelganga oʻxshaydi, manzil esa «pochta-uz.top». Bu nima?", "Soxta manzil", ["Haqiqiy pochta", "Yangi sayt", "Xavfsiz"]],
    [2, "Parolni oʻzgartirish qachon kerak?", "Kimdir bilib qolgan boʻlsa", ["Har kuni 10 marta", "Hech qachon", "Kompyuter yoqilganda"]],
    [2, "Nega har saytda boshqa parol kerak?", "Bittasi oʻgʻirlansa, qolganlari xavfsiz qoladi", ["Chiroyli boʻlishi uchun", "Sayt talab qilgani uchun", "Kerak emas"]],
    [2, "4 xonali PIN koddan nechta variant bor?", "10 000", ["4", "40", "1000"]],
    [2, "Parolga 1 ta raqam qoʻshsak variantlar necha marta koʻpayadi?", "10 marta", ["1 marta", "2 marta", "100 marta"]],
    [2, "Nega «parol123» zaif?", "Lugʻatda bor, birinchilardan sinaladi", ["Juda uzun", "Raqam bor", "Kuchli parol"]],
    [3, "Xesh (iz) qanday ishlaydi?", "Paroldan iz yasaladi, izdan parol tiklanmaydi", ["Parol shifrlanib, keyin ochiladi", "Parol rasmga aylanadi", "Parol oʻchiriladi"]],
    [3, "Ikki foydalanuvchining paroli bir xil. Tuz qoʻshilsa izlari qanday?", "Har xil", ["Bir xil", "Ikkalasi ham boʻsh", "Parolga teng"]],
    [3, "Sayt bazasi oʻgʻirlandi, unda faqat izlar bor. Qaysi parollar xavf ostida?", "Oddiy, lugʻatdagi parollar", ["Uzun tasodifiy parollar", "Hech qaysi", "Hammasi birdek"]],
    [3, "26 harfdan 3 harfli parol nechta?", "17 576", ["78", "2 600", "676"]],
    [3, "Kompyuter soniyada 1 million parol sinaydi. 1 000 000 variantli parol qancha chidaydi?", "1 soniya", ["1 kun", "1 yil", "Abadiy"]],
    [3, "Firibgar saytni tanishning eng ishonchli yoʻli?", "Manzildagi zonadan oldingi nomni tekshirish", ["Rangiga qarash", "Rasmlariga qarash", "Qulf belgisiga qarash"]],
    [3, "Ikki bosqichli tekshiruvda ikkinchi kalit odatda nima?", "Telefonga kelgan kod", ["Ismingiz", "Tugʻilgan kuningiz", "Sayt nomi"]],
  );
  PYTHON_BILIM.push(
    [1, "print(\"Salom\") ekranga nima chiqaradi?", "Salom", ["\"Salom\"", "print", "Hech narsa"]],
    [1, "Pythonʼda 3 * 4 nechaga teng?", "12", ["7", "34", "1"]],
    [1, "Qoʻshtirnoq yopilmasa nima boʻladi?", "Xato xabari chiqadi", ["Kod ishlayveradi", "Kompyuter oʻchadi", "Hech narsa"]],
    [1, "Izoh (kompyuter oʻqimaydigan yozuv) qaysi belgi bilan boshlanadi?", "#", ["//", "*", "!"]],
    [1, "Pythonʼda 10 / 4 nechaga teng?", "2.5", ["2", "3", "2,5"]],
    [1, "Oʻzgaruvchi nomi qaysi biri toʻgʻri?", "yosh", ["2yosh", "yosh bola", "if"]],
    [1, "print(2 + 3) nima chiqaradi?", "5", ["2 + 3", "23", "Xato"]],
    [2, "17 // 5 nechaga teng?", "3", ["2", "3.4", "12"]],
    [2, "17 % 5 nechaga teng?", "2", ["3", "12", "0"]],
    [2, "input() har doim qanday turdagi qiymat qaytaradi?", "Matn (str)", ["Son (int)", "Roʻyxat", "True"]],
    [2, "Matnni songa aylantirish?", "int()", ["str()", "len()", "print()"]],
    [2, "len(\"olma\") nechaga teng?", "4", ["5", "3", "1"]],
    [2, "x = 5 dan keyin x = x + 2. x nechaga teng?", "7", ["5", "2", "52"]],
    [2, "if dan keyin qanday belgi qoʻyiladi?", "Ikki nuqta (:)", ["Nuqtali vergul (;)", "Qavs", "Hech narsa"]],
    [3, "range(2, 8, 2) qaysi sonlarni beradi?", "2, 4, 6", ["2, 4, 6, 8", "2, 8", "4, 6, 8"]],
    [3, "\"salom\"[1] nimaga teng?", "a", ["s", "l", "Xato"]],
    [3, "\"a,b,c\".split(\",\") nima beradi?", "[\"a\", \"b\", \"c\"]", ["\"abc\"", "3", "[\"a,b,c\"]"]],
    [3, "Funksiya ichida yaratilgan oʻzgaruvchi tashqarida koʻrinadimi?", "Yoʻq (lokal)", ["Ha", "Faqat print bilan", "Faqat sonlar"]],
    [3, "break nima qiladi?", "Siklni toʻxtatadi", ["Dasturni oʻchiradi", "Keyingi qadamga oʻtadi", "Xato beradi"]],
    [3, "a = [1, 2, 3]; a.append(4); len(a) nechaga teng?", "4", ["3", "5", "1"]],
    [3, "print va return farqi?", "return natijani qaytaradi, print faqat koʻrsatadi", ["Farqi yoʻq", "print natijani qaytaradi", "return ekranga yozadi"]],
  );
  ALGORITM_BILIM.push(
    [1, "Lugʻatda soʻzni tez topish qaysi usulga oʻxshaydi?", "Ikkilik izlash", ["Chiziqli izlash", "Pufakcha saralash", "Tasodifiy tanlash"]],
    [1, "Tartiblanmagan roʻyxatda izlashning yagona yoʻli?", "Birma-bir qarash", ["Yarmiga boʻlish", "Oxiridan sakrash", "Izlab boʻlmaydi"]],
    [1, "Blok-sxemada romb (◇) nimani bildiradi?", "Shart (savol)", ["Boshlash", "Amal", "Chiqarish"]],
    [1, "Blok-sxemada toʻrtburchak (▭) nimani bildiradi?", "Amal (hisoblash)", ["Shart", "Boshlash", "Tugash"]],
    [1, "Blok-sxemada oval (⬭) nimani bildiradi?", "Boshlash yoki tugash", ["Shart", "Amal", "Takror"]],
    [1, "Sinf oʻquvchilarini boʻyi boʻyicha tizish — bu?", "Saralash", ["Izlash", "Oʻchirish", "Nusxalash"]],
    [1, "100 ta kitobdan birini birma-bir izlasak, eng yomon holatda nechta qaraymiz?", "100", ["1", "7", "50"]],
    [2, "1024 ta sondan ikkilik izlash eng koʻpi bilan nechta qadamda topadi?", "11", ["10", "512", "1024"]],
    [2, "Pufakcha saralashda birinchi oʻtishdan keyin qaysi element joyida?", "Eng kattasi — oxirida", ["Eng kichigi — boshida", "Hech qaysi", "Oʻrtadagisi"]],
    [2, "Tanlash saralashida birinchi oʻtishdan keyin qaysi element joyida?", "Eng kichigi — boshida", ["Eng kattasi — boshida", "Hech qaysi", "Oʻrtadagisi"]],
    [2, "O(1) nima degani?", "Qadamlar soni n ga bogʻliq emas", ["Bitta n", "n ta qadam", "n² qadam"]],
    [2, "Ikkita ichma-ich sikl (har biri n marta) nechta qadam?", "n²", ["n", "2n", "log n"]],
    [2, "Qaysi algoritm katta n da eng sekin?", "O(n²)", ["O(n)", "O(log n)", "O(1)"]],
    [2, "Blok-sxemada «Ha»/«Yoʻq» chiqadigan shakl?", "Romb", ["Oval", "Toʻrtburchak", "Parallelogramm"]],
    [3, "n = 1 000 000 boʻlsa, O(log n) taxminan nechta qadam?", "20", ["1 000 000", "1000", "2"]],
    [3, "Ikkilik izlashdan oldin roʻyxatni saralash kerak. Bu qachon foydali?", "Koʻp marta izlanganda", ["Bir marta izlanganda", "Hech qachon", "Roʻyxat boʻsh boʻlsa"]],
    [3, "Pufakcha saralash teskari tartibdagi n ta sonda nechta almashinuv qiladi?", "n(n − 1)/2", ["n", "n²", "1"]],
    [3, "«Ishlaydi ≠ yaxshi» degani nima?", "Toʻgʻri natija bersa ham sekin boʻlishi mumkin", ["Ishlamaydi", "Har doim yaxshi", "Faqat rangli yaxshi"]],
    [3, "Saralash algoritmini nima bilan solishtiramiz?", "Taqqoslash va almashinuvlar soni bilan", ["Rangi bilan", "Nomi bilan", "Satrlar soni bilan"]],
    [3, "Blok-sxemadan Pythonʼga oʻtganda romb nimaga aylanadi?", "if yoki while", ["print", "def", "input"]],
    [3, "Algoritm har safar bir xil kirishga bir xil javob berishi — qaysi xossa?", "Aniqlik", ["Tezlik", "Ommaviylik", "Uzunlik"]],
  );
  KOMB_BILIM.push(
    [1, "2 xil shapka va 3 xil sharf. Nechta xil juftlik?", "6", ["5", "3", "2"]],
    [1, "3 ta oʻyinchoqdan bittasini tanlash usullari?", "3", ["1", "6", "9"]],
    [1, "Tanga 3 marta tashlansa nechta natija?", "8", ["6", "3", "9"]],
    [1, "Choʻntakda 4 ta har xil konfet. Bittasini olish usullari?", "4", ["1", "8", "16"]],
    [1, "Daraxt chizmasida har shoxcha nimani bildiradi?", "Bitta tanlovni", ["Bitta xatoni", "Bitta raqamni", "Hech nimani"]],
    [1, "2 xil non VA 2 xil sut. Nechta nonushta?", "4", ["2", "3", "8"]],
    [1, "3 ta kitob YOKI 2 ta jurnal — bittasini tanlash usullari?", "5", ["6", "3", "2"]],
    [2, "4! nechaga teng?", "24", ["16", "10", "4"]],
    [2, "5 kishidan sardor va oʻrinbosar necha xil tanlanadi?", "20", ["10", "25", "5"]],
    [2, "«ABC» harflaridan nechta har xil soʻz (hamma harf bir martadan)?", "6", ["3", "9", "27"]],
    [2, "3 xonali son 1, 2, 3 raqamlaridan (takrorlanmasdan) nechta?", "6", ["3", "9", "27"]],
    [2, "Raqamlar takrorlanishi mumkin: 1, 2, 3 dan nechta ikki xonali son?", "9", ["6", "3", "12"]],
    [2, "Paskal uchburchagining 4-qatori (1 3 3 1 dan keyingi)?", "1 4 6 4 1", ["1 4 4 1", "1 3 6 3 1", "1 5 10 5 1"]],
    [2, "Qaysi holatda tartib muhim EMAS?", "Sinfdan 3 kishilik jamoa tanlash", ["Poygada oʻrinlar", "Telefon raqami", "Parol"]],
    [3, "C(6, 2) nechaga teng?", "15", ["30", "12", "36"]],
    [3, "C(10, 9) nechaga teng?", "10", ["1", "90", "9"]],
    [3, "5 ta nuqtadan nechta kesma oʻtkazish mumkin (har ikkisi orqali)?", "10", ["5", "20", "25"]],
    [3, "4 ta jamoa — har biri har biri bilan bir marta oʻynaydi. Nechta oʻyin?", "6", ["4", "8", "12"]],
    [3, "Sinfda 30 oʻquvchi. Bir kunda tugʻilgan 2 kishi borligiga kafolat bormi?", "Yoʻq, kafolat yoʻq", ["Ha, albatta", "Faqat 31 kunlik oyda", "Ha, 30 > 12"]],
    [3, "Qopda 3 xil rangli paypoq. Bir juft bir xil rang kafolati uchun eng kamida nechta olish kerak?", "4", ["3", "2", "6"]],
    [3, "A(5, 3) (5 tadan 3 tasini tartib bilan) nechaga teng?", "60", ["10", "15", "125"]],
  );
  CPP_BILIM.push(
    [1, "C++ dasturi qaysi funksiyadan boshlanadi?", "main", ["start", "print", "begin"]],
    [1, "Satr (matn) turi qaysi?", "string", ["int", "bool", "double"]],
    [1, "Kasr son turi qaysi?", "double", ["int", "char", "bool"]],
    [1, "Rost/yolgʻon turi qaysi?", "bool", ["int", "string", "char"]],
    [1, "cout bilan yangi qatorga oʻtish?", "endl", ["next", "enter", "line"]],
    [1, "C++ kodni bajarishdan oldin nima qilinadi?", "Kompilyatsiya", ["Chizish", "Saralash", "Yuklab olish"]],
    [1, "#include <iostream> nima uchun kerak?", "cin va cout ishlashi uchun", ["Rasm chizish uchun", "Internet uchun", "Kerak emas"]],
    [2, "int x = 7; x++; x nechaga teng?", "8", ["7", "6", "14"]],
    [2, "int x = 10; x += 5; x nechaga teng?", "15", ["10", "5", "105"]],
    [2, "C++ da 7.0 / 2 nechaga teng?", "3.5", ["3", "4", "Xato"]],
    [2, "Ozgaruvchini eʼlon qilmay ishlatsak nima boʻladi?", "Kompilyatsiya xatosi", ["0 boʻladi", "Ishlayveradi", "Kompyuter oʻchadi"]],
    [2, "if (x = 5) — bu yerda qanday xato bor?", "= oʻrniga == boʻlishi kerak", ["Xato yoʻq", "Nuqtali vergul yoʻq", "Qavs ortiqcha"]],
    [2, "for (int i = 1; i <= 5; i++) necha marta ishlaydi?", "5", ["4", "6", "1"]],
    [2, "Massiv int a[5] nechta element saqlaydi?", "5", ["4", "6", "Cheksiz"]],
    [3, "int a[5] da oxirgi element indeksi?", "4", ["5", "0", "6"]],
    [3, "int ga 2 147 483 647 + 1 qoʻshilsa nima boʻladi?", "Toshib, manfiy son chiqadi", ["2 147 483 648", "Xato xabari", "0"]],
    [3, "vector qaysi jihati bilan massivdan farq qiladi?", "Oʻlchami oʻsadi (push_back)", ["Sekinroq ishlaydi", "Faqat matn saqlaydi", "Farqi yoʻq"]],
    [3, "sort(a, a + n) nima qiladi?", "Massivni oʻsish tartibida saralaydi", ["Massivni oʻchiradi", "Teskari qiladi", "Yigʻindini topadi"]],
    [3, "while (true) {} — bu nima?", "Cheksiz sikl", ["Bir martalik sikl", "Xato", "Funksiya"]],
    [3, "Olimpiadada katta yigʻindi uchun qaysi tur xavfsiz?", "long long", ["int", "char", "bool"]],
    [3, "cin >> n; — bu nima qiladi?", "Klaviaturadan n ni oʻqiydi", ["n ni chiqaradi", "n ni oʻchiradi", "n ni saralaydi"]],
  );

  // ---------- Saqlangan mavzu tanlovi ----------
  // Bola/o'qituvchi tanlagan mavzular qurilmada saqlanadi. Keyin bankka qo'shilgan mavzu o'sha ro'yxatda yo'q —
  // u o'chiq qolmasligi uchun saqlashda «o'shanda bor edi» ro'yxati ham yoziladi (bilgan). Eski yozuvda bilgan yo'q:
  // asl 7 mavzu + saqlanganlar bilgan hisoblanadi, qolgani yangi — yoqib qo'yiladi.
  const ASL_MAVZULAR = ["kod", "ikkilik", "olchov", "sanoq", "ai", "klaviatura", "mantiq"];
  function tanlovniTikla(saqlangan, bilgan, barcha) {
    const ids = barcha.map((t) => t.id);
    const tanlov = (Array.isArray(saqlangan) ? saqlangan : []).filter((id) => ids.includes(id));
    if (!tanlov.length) return null;
    const eski = new Set(Array.isArray(bilgan) ? bilgan : ASL_MAVZULAR.concat(tanlov));
    return tanlov.concat(ids.filter((id) => !eski.has(id) && !tanlov.includes(id)));
  }

  // ---------- Bankka qo'shish ----------
  const KINDS = { faylTuri, yol, nusxa, tanishuvBilim, robotJoy, takror, dasturBilim, paket, ip, internetBilim, kuchli, variant, domen, xavfBilim, pyNatija, pythonBilim, pyRoyxat, izlash, saralash, algoritmBilim, sanash, kombBilim, cppNatija, cppBilim, pyMantiq, pyFunksiya, blokSxema };
  for (const t of TOPICS) if (!S.TOPICS.some((x) => x.id === t.id)) S.TOPICS.push(t);
  for (const [k, v] of Object.entries(KINDS)) if (!S.KINDS[k]) S.KINDS[k] = v;

  const api = { TOPICS, KINDS, ASL_MAVZULAR, tanlovniTikla, TANISHUV_BILIM, DASTUR_BILIM, INTERNET_BILIM, XAVF_BILIM, PYTHON_BILIM, ALGORITM_BILIM, KOMB_BILIM, CPP_BILIM };
  if (root.QK) root.QK.savollar2 = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

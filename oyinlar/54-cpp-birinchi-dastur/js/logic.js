// 54-o'yin: C++ bloki, birinchi o'yin — dastur qolipi, chiqish, o'zgaruvchi va kirish.
// Sof mantiq, ekransiz. Node'da test qilinadi: tests/logic.test.js
//
// MUHIM: bu o'yinda C++ kodi ishga tushmaydi — har misolning chiqishi shu yerda hisoblanadi.
// Hisob to'g'riligini haqiqiy g++ tekshiradi: oyinlar/umumiy/tests/cpp-parity.test.js
(function (root) {
  "use strict";

  const C = root.QK && root.QK.cpp ? root.QK.cpp : require("../../umumiy/js/cpp.js");

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

  // Bir xil savol ketma-ket ikki marta chiqmaydi (QOIDALAR 4.3)
  function pickNew(make, prev, r) {
    for (let k = 0; k < 60; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // Qiyinlik zinasi (QOIDALAR 4.3): 0 — birinchi javoblar, 1 — o'rta, 2 — oxirgi va qiyin rejim.
  // Zina berilmasa (testlar, parity namunalari) — hammasidan teng.
  function zinadan(list, tier, rnd) {
    if (tier == null) return pick(list, rnd);
    const t = Math.max(0, Math.min(2, tier));
    const mos = list.filter((x) => (x.tier || 0) <= t);
    const ayni = mos.filter((x) => (x.tier || 0) === t);
    return ayni.length && rnd() < 0.6 ? pick(ayni, rnd) : pick(mos, rnd);
  }

  // ---------- Matnlar ----------
  const MATNLAR = ["Salom, qabila!", "Salom, dunyo!", "Birinchi dastur", "Kod tayyor",
    "C++ oʻrganamiz", "Olimpiada boshlandi", "Mashina kodi", "Dastur ishladi"];
  const ISMLAR = ["Anvar", "Dilnoza", "Sardor", "Malika", "Jasur", "Zilola"];

  // ---------- 1-bosqich: qolip va chiqish ----------

  // Dastur tanasi va uning chiqishi birga yasaladi — ikkisi hech qachon ajralmaydi
  const NATIJA_TURLARI = ["ikki", "qoshma", "hisob", "ketma", "yopishgan", "qayta"];
  // 2026-10-02: ikki yangi tur — "yopishgan" (sonlar orasida bo'shliq yo'q: cout hech narsa qo'shmaydi)
  // va "qayta" (o'zgaruvchi qayta tayinlanadi: satrlar yuqoridan pastga bajariladi)
  const NATIJA_ZINA = [{ id: "ikki", tier: 0 }, { id: "qoshma", tier: 0 }, { id: "hisob", tier: 0 }, { id: "ketma", tier: 0 },
    { id: "yopishgan", tier: 1 }, { id: "qayta", tier: 2 }];

  function natijaTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const tur = zinadan(NATIJA_ZINA, tier, rnd).id;
      let tana = [];
      let chiqish = [];
      if (tur === "yopishgan") {
        const a = int(rnd, 2, 9);
        const b = int(rnd, 2, 9);
        tana = ["int a = " + a + ";", "int b = " + b + ";", "cout << a << b;", 'cout << "\\n";', C.chiqar('a + b << " " << a * b')];
        chiqish = [String(a) + String(b), (a + b) + " " + (a * b)];
      } else if (tur === "qayta") {
        const a = int(rnd, 2, 9);
        const k = int(rnd, 2, 5);
        tana = ["int a = " + a + ";", "int b = a + " + k + ";", "a = b * 2;", C.chiqar('a << " " << b'), "b = a - b;", C.chiqar("b")];
        chiqish = [((a + k) * 2) + " " + (a + k), String((a + k) * 2 - (a + k))];
      } else if (tur === "ikki") {
        const a = pick(MATNLAR, rnd);
        const b = "Men " + pick(ISMLAR, rnd);
        tana = [C.chiqar('"' + a + '"'), C.chiqar('"' + b + '"')];
        chiqish = [a, b];
      } else if (tur === "qoshma") {
        const a = int(rnd, 2, 9);
        const b = int(rnd, 2, 9);
        tana = ["int a = " + a + ";", "int b = " + b + ";", C.chiqar('a << " + " << b << " = " << a + b')];
        chiqish = [a + " + " + b + " = " + (a + b)];
      } else if (tur === "hisob") {
        const a = int(rnd, 3, 12);
        const b = int(rnd, 2, 9);
        tana = ["int a = " + a + ";", "int b = " + b + ";", C.chiqar("a * b")];
        chiqish = [String(a * b)];
      } else {
        const a = pick(ISMLAR, rnd);
        tana = ['cout << "Salom, ";', 'cout << "' + a + '";', 'cout << "!\\n";'];
        chiqish = ["Salom, " + a + "!"];
      }
      const kod = C.dastur(tana);
      return {
        id: "natija:" + tur + ":" + chiqish.join("|"), tur: "natija", kind: tur, kod, chiqish,
        savol: "Bu dastur nima chiqaradi? Har satrni alohida qatorga yoz.",
        nega: tur === "ketma"
          ? "cout oʻzidan keyin yangi satr qoʻshmaydi: uchala cout bitta satrga yozdi."
          : tur === "yopishgan"
            ? "cout sonlar orasiga boʻshliq ham qoʻymaydi: a << b — ikki raqam yonma-yon chiqadi. Boʻshliq kerak boʻlsa, uni oʻzing yozasan: \" \"."
            : tur === "qayta"
              ? "Satrlar yuqoridan pastga bajariladi: a yangi qiymat olgach, b eski qiymatida qoladi — toki oʻzi qayta tayinlanmaguncha."
              : "Har cout <<  … << \"\\n\"; bitta satr chiqaradi.",
      };
    }, prev, rr);
  }

  // Qolipdan bitta narsa olib tashlanadi — bola nimasi yetishmayotganini aytadi
  const YETMAYDI = [
    { id: "nuqta", javob: "Nuqtali vergul (;) yoʻq", yolYoriq: "C++ da har buyruq nima bilan tugaydi?" },
    { id: "qavs", javob: "Yopuvchi qavs (}) yoʻq", yolYoriq: "main() ning bloki ochilgan — u qayerda yopiladi?" },
    { id: "include", javob: "#include <iostream> yoʻq", yolYoriq: "cout qayerdan keladi? Dasturning birinchi satriga qara." },
    { id: "tirnoq", javob: "Qoʻshtirnoq (\") yopilmagan", yolYoriq: "Matn ikki tomondan qoʻshtirnoq ichida boʻlishi kerak." },
  ];

  function yetmaydiTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const xato = pick(YETMAYDI, rnd);
      const matn = pick(MATNLAR, rnd);
      let kod = C.dastur([C.chiqar('"' + matn + '"')]);
      if (xato.id === "nuqta") kod = kod.replace('<< "\\n";', '<< "\\n"');
      else if (xato.id === "qavs") kod = kod.replace(/\n}$/, "");
      else if (xato.id === "include") kod = kod.replace("#include <iostream>\n", "");
      else kod = kod.replace('"' + matn + '"', '"' + matn);
      return {
        id: "yetmaydi:" + xato.id + ":" + matn, tur: "yetmaydi", kod,
        savol: "Bu dastur ishga tushmaydi. Nimasi yetishmayapti?",
        javob: xato.javob,
        variantlar: aralash(YETMAYDI.map((x) => x.javob), rnd),
        yolYoriq: xato.yolYoriq,
        nega: "Kompilyator dasturni ishga tushirishdan oldin tekshiradi — shuning uchun bitta belgi ham muhim.",
      };
    }, prev, rr);
  }

  // Qolipning qismi nima qiladi
  function qismTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const q = pick(C.QISMLAR, rnd);
      const boshqa = aralash(C.QISMLAR.filter((x) => x.qism !== q.qism), rnd).slice(0, 3);
      return {
        id: "qism:" + q.qism, tur: "qism", kod: C.dastur([C.chiqar('"Salom!"')]),
        savol: "Bu satr nima qiladi:  " + q.qism,
        javob: q.izoh,
        variantlar: aralash([q.izoh, ...boshqa.map((x) => x.izoh)], rnd),
        yolYoriq: "Qolipning har satri bitta ish qiladi. Qaysi biri shu satrga mos?",
        nega: q.qism + " — " + q.izoh + ".",
      };
    }, prev, rr);
  }

  const bosqich1Task = (prev, correct, tier) => {
    const n = (correct || 0) % 3;
    if (n === 0) return natijaTask(null, prev, tier);
    if (n === 1) return yetmaydiTask(null, prev);
    return qismTask(null, prev);
  };

  // ---------- 2-bosqich: o'zgaruvchi va kirish ----------

  // E'londa tur oldin aytiladi — Pythonda bunday emas
  const ELONLAR = [
    {
      id: "int", savol: "Butun son oʻzgaruvchisini qanday eʼlon qilamiz?", javob: "int x = 5;",
      soxta: ["x = 5;", "int x = 5", "int 5 = x;"],
      nega: "Avval tur (int), keyin nom, keyin qiymat — va oxirida nuqtali vergul.",
    },
    {
      id: "double", savol: "Kasr sonni qanday eʼlon qilamiz?", javob: "double x = 2.5;",
      soxta: ["int x = 2.5;", "double x = 2,5;", "x = 2.5;"],
      nega: "Kasr son uchun double olinadi; int kasr qismini tashlab yuboradi.",
    },
    {
      id: "string", savol: "Matn oʻzgaruvchisini qanday eʼlon qilamiz?", javob: 'string s = "olma";',
      soxta: ['str s = "olma";', "string s = olma;", 's = "olma";'],
      nega: "Matn turi — string, qiymati qoʻshtirnoq ichida.",
    },
    {
      id: "ikki", savol: "Bitta satrda ikkita butun sonni qanday eʼlon qilamiz?", javob: "int a, b;",
      soxta: ["int a; int b", "int a and b;", "a, b: int;"],
      nega: "Bitta tur, vergul bilan sanaladi: int a, b;",
    },
  ];

  function elonTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const e = pick(ELONLAR, rnd);
      return {
        id: "elon:" + e.id, tur: "elon", savol: e.savol, javob: e.javob,
        variantlar: aralash([e.javob, ...e.soxta], rnd),
        yolYoriq: "C++ da oʻzgaruvchining turi oldin aytiladi va satr ; bilan tugaydi.",
        nega: e.nega,
      };
    }, prev, rr);
  }

  // cin: tur allaqachon ma'lum, shuning uchun int() kerak emas
  const KIRISH_TURLARI = ["yigindi", "kopaytma", "ikkilantir", "ism", "uch-satr", "ism-yosh"];
  // 2026-10-02: "uch-satr" — kirish ikki satrda keladi (cin bo'shliq va yangi satrni bir xil ko'radi);
  // "ism-yosh" — bitta cin bilan matn va son o'qiladi
  const KIRISH_ZINA = [{ id: "yigindi", tier: 0 }, { id: "kopaytma", tier: 0 }, { id: "ikkilantir", tier: 0 }, { id: "ism", tier: 0 },
    { id: "uch-satr", tier: 1 }, { id: "ism-yosh", tier: 2 }];

  function kirishTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const tur = zinadan(KIRISH_ZINA, tier, rnd).id;
      let tana = [];
      let kirish = [];
      let chiqish = [];
      if (tur === "uch-satr") {
        const a = int(rnd, 2, 20);
        const b = int(rnd, 2, 20);
        const c = int(rnd, 2, 9);
        tana = ["int a, b, c;", "cin >> a >> b >> c;", C.chiqar("a + b"), C.chiqar("(a + b) * c")];
        kirish = [a + " " + b, String(c)];
        chiqish = [String(a + b), String((a + b) * c)];
      } else if (tur === "ism-yosh") {
        const ism = pick(ISMLAR, rnd);
        const yosh = int(rnd, 10, 16);
        tana = ["string ism;", "int yosh;", "cin >> ism >> yosh;", C.chiqar('ism << " " << yosh + 1'), C.chiqar("yosh * 2 << ism")];
        kirish = [ism + " " + yosh];
        chiqish = [ism + " " + (yosh + 1), (yosh * 2) + ism];
      } else if (tur === "yigindi") {
        const a = int(rnd, 3, 40);
        const b = int(rnd, 3, 40);
        tana = ["int a, b;", "cin >> a >> b;", C.chiqar("a + b")];
        kirish = [a + " " + b];
        chiqish = [String(a + b)];
      } else if (tur === "kopaytma") {
        const a = int(rnd, 2, 12);
        const b = int(rnd, 2, 12);
        tana = ["int a, b;", "cin >> a >> b;", C.chiqar('a << " x " << b << " = " << a * b')];
        kirish = [a + " " + b];
        chiqish = [a + " x " + b + " = " + a * b];
      } else if (tur === "ikkilantir") {
        const a = int(rnd, 5, 60);
        tana = ["int n;", "cin >> n;", C.chiqar("n * 2")];
        kirish = [String(a)];
        chiqish = [String(a * 2)];
      } else {
        const ism = pick(ISMLAR, rnd);
        tana = ["string ism;", "cin >> ism;", C.chiqar('"Salom, " << ism << "!"')];
        kirish = [ism];
        chiqish = ["Salom, " + ism + "!"];
      }
      return {
        id: "kirish:" + tur + ":" + kirish.join("|"), tur: "natija", kind: "kirish",
        kod: C.dastur(tana, { string: tur === "ism" || tur === "ism-yosh" }), kirish, chiqish,
        savol: "Dasturga shu maʼlumot beriladi. Nima chiqadi?",
        nega: "cin oʻzgaruvchining turini biladi, shuning uchun int() kerak emas.",
      };
    }, prev, rr);
  }


  // ---------- Kodni o'zi yozish (yadro qo'shilgandan keyin) ----------
  // Qolip tayyor beriladi — bola faqat tanani yozadi. Yechim g++ bilan tekshirilgan
  // (namunalar() orqali parity testiga tushadi).
  const QOLIP = C.BOSH + "\n    \n" + C.OXIR;

  const YOZISHLAR = [
    {
      id: "salom", savol: "Ekranga «Salom, qabila!» chiqaradigan dastur yoz.",
      sinovlar: [{ kirish: [], chiqish: ["Salom, qabila!"] }],
      yechim: C.dastur([C.chiqar('"Salom, qabila!"')]),
      yolYoriq: "Matn qoʻshtirnoq ichida boʻladi, satr oxirida \"\\n\" turadi.",
    },
    {
      id: "yigindi", savol: "Ikki butun sonni oʻqib, yigʻindisini chiqar.",
      sinovlar: [{ kirish: ["3 4"], chiqish: ["7"] }, { kirish: ["25 17"], chiqish: ["42"] }],
      yechim: C.dastur(["int a, b;", "cin >> a >> b;", C.chiqar("a + b")]),
      yolYoriq: "Avval ikkita int eʼlon qil, keyin cin >> a >> b; bilan oʻqi.",
    },
    {
      id: "kvadrat", savol: "Bitta sonni oʻqib, uning kvadratini chiqar.",
      sinovlar: [{ kirish: ["7"], chiqish: ["49"] }, { kirish: ["12"], chiqish: ["144"] }],
      yechim: C.dastur(["int n;", "cin >> n;", C.chiqar("n * n")]),
      yolYoriq: "Kvadrat — sonning oʻziga koʻpaytirilgani: n * n.",
    },
    {
      id: "ikki-satr", savol: "Ikki satr chiqar: birinchisida oʻqilgan son, ikkinchisida uning ikki barobari.",
      sinovlar: [{ kirish: ["8"], chiqish: ["8", "16"] }, { kirish: ["15"], chiqish: ["15", "30"] }],
      yechim: C.dastur(["int n;", "cin >> n;", C.chiqar("n"), C.chiqar("n * 2")]),
      yolYoriq: "Har satr uchun alohida cout yoz.",
    },
    // ---- 2026-10-02: to'rt yangi masala (zina 1–2). Hammasi yadroda ham, g++ da ham tekshirilgan ----
    {
      id: "tortburchak", tier: 1,
      savol: "Toʻgʻri toʻrtburchakning ikki tomoni oʻqiladi. Birinchi satrda perimetrini, ikkinchi satrda yuzini chiqar.",
      sinovlar: [{ kirish: ["3 4"], chiqish: ["14", "12"] }, { kirish: ["5 5"], chiqish: ["20", "25"] }, { kirish: ["1 10"], chiqish: ["22", "10"] }],
      yechim: C.dastur(["int a, b;", "cin >> a >> b;", C.chiqar("2 * (a + b)"), C.chiqar("a * b")]),
      yolYoriq: "Perimetr — hamma tomonlar yigʻindisi: ikkita a va ikkita b. Yuz — tomonlar koʻpaytmasi.",
    },
    {
      id: "almashtir", tier: 1,
      savol: "Ikki sonni oʻqib, ularni teskari tartibda bitta satrda chiqar (orasida bitta boʻshliq).",
      sinovlar: [{ kirish: ["3 8"], chiqish: ["8 3"] }, { kirish: ["10 10"], chiqish: ["10 10"] }, { kirish: ["-1 5"], chiqish: ["5 -1"] }],
      yechim: C.dastur(["int a, b;", "cin >> a >> b;", C.chiqar('b << " " << a')]),
      yolYoriq: "cout sonlar orasiga boʻshliq qoʻymaydi — uni oʻzing qoʻsh: << \" \" <<.",
    },
    {
      id: "ism-yosh", tier: 2,
      savol: "Ism va yosh oʻqiladi (orasida boʻshliq). Shunday chiqar: «Salom, ISM! Kelasi yil N yosh.» — N bu yoshdan bitta katta son.",
      sinovlar: [{ kirish: ["Anvar 13"], chiqish: ["Salom, Anvar! Kelasi yil 14 yosh."] },
        { kirish: ["Dilnoza 9"], chiqish: ["Salom, Dilnoza! Kelasi yil 10 yosh."] }],
      yechim: C.dastur(["string ism;", "int yosh;", "cin >> ism >> yosh;",
        'cout << "Salom, " << ism << "! Kelasi yil " << yosh + 1 << " yosh.\\n";'], { string: true }),
      yolYoriq: "Ism — string, yosh — int. Bitta cout ichida matn va oʻzgaruvchilar navbat bilan yoziladi; boʻshliqlar qoʻshtirnoq ichida turadi.",
    },
    {
      id: "uch-son", tier: 2,
      savol: "Uchta son oʻqiladi. Birinchi satrda yigʻindisini, ikkinchi satrda oʻrtachasini (kasri bilan) chiqar.",
      sinovlar: [{ kirish: ["2 3 6"], chiqish: ["11", "3.66667"] }, { kirish: ["3 4 5"], chiqish: ["12", "4"] },
        { kirish: ["1 2 2"], chiqish: ["5", "1.66667"] }],
      yechim: C.dastur(["double a, b, c;", "cin >> a >> b >> c;", C.chiqar("a + b + c"), C.chiqar("(a + b + c) / 3")]),
      yolYoriq: "Oʻrtacha kasr son boʻlishi mumkin — oʻzgaruvchilarning turiga qara: int kasrni saqlamaydi.",
    },
  ];

  function yozTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const y = zinadan(YOZISHLAR, tier, rnd);
      return Object.assign({ tur: "yoz", qolip: QOLIP, rows: 7 }, y, { id: "yoz:" + y.id });
    }, prev, rr);
  }

  const bosqich2Task = (prev, correct, tier) => {
    const n = (correct || 0) % 3;
    if (n === 0) return elonTask(null, prev);
    if (n === 1) return kirishTask(null, prev, tier);
    return yozTask(null, prev, tier);
  };

  // ---------- 3-bosqich: Python ↔ C++ ----------

  const JUFTLAR = [
    {
      id: "print", python: "print(x)", javob: 'cout << x << "\\n";',
      soxta: ["cout >> x;", "cout << x;", "print(x);"],
      nega: "print oxirida yangi satrga oʻtadi — C++ da buni \"\\n\" qiladi.",
    },
    {
      id: "input", python: "x = int(input())", javob: "cin >> x;",
      soxta: ["cin << x;", "x = cin;", "int x = input();"],
      nega: "cin oʻqiydi, cout yozadi: strelkalar maʼlumot qayerga ketayotganini koʻrsatadi.",
    },
    {
      id: "qiymat", python: "n = 5", javob: "int n = 5;",
      soxta: ["n = 5;", "int n := 5;", "n int = 5;"],
      nega: "Pythonda tur oʻzi topiladi, C++ da esa yoziladi.",
    },
    {
      id: "izoh", python: "# bu izoh", javob: "// bu izoh",
      soxta: ["# bu izoh", "-- bu izoh", "/ bu izoh"],
      nega: "C++ da bir qatorli izoh ikkita qiya chiziq bilan boshlanadi.",
    },
    {
      id: "matn", python: 'print("Salom")', javob: 'cout << "Salom" << "\\n";',
      soxta: ['cout << Salom << "\\n";', "cout << 'Salom';", 'print << "Salom";'],
      nega: "Matn qoʻshtirnoq ichida boʻladi — aks holda kompilyator uni oʻzgaruvchi nomi deb oʻylaydi.",
    },
  ];

  function juftTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const j = pick(JUFTLAR, rnd);
      return {
        id: "juft:" + j.id, tur: "juft", savol: "Python: " + j.python + "   —   C++ da qanday yoziladi?",
        javob: j.javob, variantlar: aralash([j.javob, ...j.soxta], rnd),
        yolYoriq: "Ikki narsaga qara: maʼlumot qaysi tomonga ketyapti va satr ; bilan tugadimi.",
        nega: j.nega,
      };
    }, prev, rr);
  }

  // C++ dasturga Python satri kirib qolgan — qaysi satr?
  const ARALASH_SATRLAR = [
    { python: "print(n)", togri: 'cout << n << "\\n";' },
    { python: "n = int(input())", togri: "cin >> n;" },
    { python: "n = 7", togri: "int n = 7;" },
    { python: "# natija", togri: "// natija" },
  ];

  function aralashTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const a = pick(ARALASH_SATRLAR, rnd);
      const tana = ["int n = 4;", C.chiqar("n"), "cout << \"tayyor\\n\";"];
      const orin = int(rnd, 0, tana.length - 1);
      const buzuq = tana.slice();
      buzuq[orin] = a.python;
      const kod = C.dastur(buzuq);
      const satrRaqam = kod.split("\n").findIndex((s) => s.trim() === a.python) + 1;
      const hammasi = kod.split("\n").map((s, k) => k + 1).filter((n) => n >= 5 && n <= kod.split("\n").length - 1);
      const soxta = aralash(hammasi.filter((n) => n !== satrRaqam), rnd).slice(0, 3);
      return {
        id: "aralash:" + a.python + ":" + satrRaqam, tur: "aralash", kod,
        savol: "Bu C++ dasturga Python satri kirib qolgan. Qaysi satr?",
        javob: satrRaqam + "-satr",
        variantlar: aralash([satrRaqam, ...soxta], rnd).map((n) => n + "-satr"),
        yolYoriq: "Har satrga qara: C++ satri ; bilan tugaydi va chiqish cout bilan yoziladi.",
        nega: "C++ da bu satr shunday yoziladi: " + a.togri,
      };
    }, prev, rr);
  }

  const bosqich3Task = (prev, correct) => ((correct || 0) % 2 === 0 ? juftTask(null, prev) : aralashTask(null, prev));

  // ---------- Parity testi uchun namunalar ----------
  // Chiqishi bor hamma misol turidan namuna yig'adi: g++ shu ro'yxatni tekshiradi.
  function namunalar(soni) {
    let seed = 12345;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    const out = [];
    const korilgan = new Set();
    // "Kodni o'zing yoz" mashqlarining namunali yechimlari ham tekshiriladi
    for (const y of YOZISHLAR) {
      for (const sinov of y.sinovlar) {
        out.push({ id: "yechim:" + y.id + ":" + (sinov.kirish.join("|") || "-"), kod: y.yechim, kirish: sinov.kirish, chiqish: sinov.chiqish });
        korilgan.add("yechim:" + y.id);
      }
    }
    // Yechimlardan TASHQARI yana `soni` ta yasalgan misol (yechimlar ko'paygani uchun alohida sanaladi)
    const kerak = out.length + (soni || 24);
    let prev = null;
    for (let k = 0; k < (soni || 24) * 8 && out.length < kerak; k++) {
      const task = k % 2 === 0 ? natijaTask(rnd, prev) : kirishTask(rnd, prev);
      prev = task;
      if (korilgan.has(task.id)) continue;
      korilgan.add(task.id);
      out.push({ id: task.id, kod: task.kod, kirish: task.kirish || [], chiqish: task.chiqish });
    }
    return out;
  }

  const api = {
    MATNLAR, ISMLAR, YETMAYDI, ELONLAR, JUFTLAR, ARALASH_SATRLAR, YOZISHLAR, QOLIP,
    natijaTask, yetmaydiTask, qismTask, elonTask, kirishTask, juftTask, aralashTask, yozTask,
    bosqich1Task, bosqich2Task, bosqich3Task, namunalar,
  };
  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

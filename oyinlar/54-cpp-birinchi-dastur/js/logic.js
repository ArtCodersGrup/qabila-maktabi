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

  // ---------- Matnlar ----------
  const MATNLAR = ["Salom, qabila!", "Salom, dunyo!", "Birinchi dastur", "Kod tayyor",
    "C++ oʻrganamiz", "Olimpiada boshlandi", "Mashina kodi", "Dastur ishladi"];
  const ISMLAR = ["Anvar", "Dilnoza", "Sardor", "Malika", "Jasur", "Zilola"];

  // ---------- 1-bosqich: qolip va chiqish ----------

  // Dastur tanasi va uning chiqishi birga yasaladi — ikkisi hech qachon ajralmaydi
  const NATIJA_TURLARI = ["ikki", "qoshma", "hisob", "ketma"];

  function natijaTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const tur = pick(NATIJA_TURLARI, rnd);
      let tana = [];
      let chiqish = [];
      if (tur === "ikki") {
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

  const bosqich1Task = (prev, correct) => {
    const n = (correct || 0) % 3;
    if (n === 0) return natijaTask(null, prev);
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
  const KIRISH_TURLARI = ["yigindi", "kopaytma", "ikkilantir", "ism"];

  function kirishTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const tur = pick(KIRISH_TURLARI, rnd);
      let tana = [];
      let kirish = [];
      let chiqish = [];
      if (tur === "yigindi") {
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
        kod: C.dastur(tana, { string: tur === "ism" }), kirish, chiqish,
        savol: "Dasturga shu maʼlumot beriladi. Nima chiqadi?",
        nega: "cin oʻzgaruvchining turini biladi, shuning uchun int() kerak emas.",
      };
    }, prev, rr);
  }

  const bosqich2Task = (prev, correct) => {
    const n = (correct || 0) % 3;
    if (n === 0) return elonTask(null, prev);
    return kirishTask(null, prev);
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
    let prev = null;
    for (let k = 0; k < (soni || 24) * 8 && out.length < (soni || 24); k++) {
      const task = k % 2 === 0 ? natijaTask(rnd, prev) : kirishTask(rnd, prev);
      prev = task;
      if (korilgan.has(task.id)) continue;
      korilgan.add(task.id);
      out.push({ id: task.id, kod: task.kod, kirish: task.kirish || [], chiqish: task.chiqish });
    }
    return out;
  }

  const api = {
    MATNLAR, ISMLAR, YETMAYDI, ELONLAR, JUFTLAR, ARALASH_SATRLAR,
    natijaTask, yetmaydiTask, qismTask, elonTask, kirishTask, juftTask, aralashTask,
    bosqich1Task, bosqich2Task, bosqich3Task, namunalar,
  };
  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

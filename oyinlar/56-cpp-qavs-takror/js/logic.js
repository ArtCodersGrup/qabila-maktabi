// 56-o'yin: C++ bloki — shart va sikl (CPP-BLOK.md, mavzular 5 va 6).
// Sof mantiq, ekransiz. Node'da test qilinadi: tests/logic.test.js
//
// Har misolning chiqishi shu yerda hisoblanadi, yadroda va haqiqiy g++ da tekshiriladi.
(function (root) {
  "use strict";

  const C = root.QK && root.QK.cpp && root.QK.cpp.dastur ? root.QK.cpp : require("../../umumiy/js/cpp.js");

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

  function pickNew(make, prev, r) {
    for (let k = 0; k < 60; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // ---------- 1-bosqich: qavs blok yasaydi ----------

  // Qavssiz if: faqat KEYINGI BITTA satr shartga tegishli bo'ladi.
  // Otstup chiroyli ko'rinadi, lekin C++ uni hisobga olmaydi.
  function qavsTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const x = int(rnd, 1, 10);
      const chegara = int(rnd, 3, 8);
      const katta = x > chegara;
      const tana = [
        "int x = " + x + ";",
        "if (x > " + chegara + ")",
        '    cout << "katta\\n";',
        '    cout << "tekshirdim\\n";',
      ];
      const chiqish = katta ? ["katta", "tekshirdim"] : ["tekshirdim"];
      return {
        id: "qavs:" + x + ":" + chegara, tur: "natija", kod: C.dastur(tana), chiqish,
        savol: "Bu dastur nima chiqaradi? Har satrni alohida qatorga yoz.",
        nega: "Qavs yoʻq boʻlsa, if ga faqat KEYINGI BITTA satr tegishli boʻladi. "
          + "Ikkinchi cout — sikldan tashqarida, u har doim bajariladi. Otstup C++ uchun hech narsa anglatmaydi.",
      };
    }, prev, rr);
  }

  // "=" va "==" farqi: tayinlash shart sifatida ham ishlaydi va hamisha rost bo'ladi
  function tengTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const x = int(rnd, 1, 9);
      const nishon = int(rnd, 1, 9);
      if (x === nishon) return null; // farqi ko'rinmaydi
      const bitta = rnd() < 0.5;
      const shart = bitta ? "x = " + nishon : "x == " + nishon;
      const kod = C.dastur(["int x = " + x + ";", "if (" + shart + ") {", '    cout << "rost\\n";', "} else {",
        '    cout << "yolgʻon\\n";', "}", C.chiqar("x")]);
      // "=" — tayinlash: shart doim rost (nishon != 0), x ham o'zgaradi
      const chiqish = bitta ? ["rost", String(nishon)] : ["yolgʻon", String(x)];
      return {
        id: "teng:" + (bitta ? "bir" : "ikki") + ":" + x + ":" + nishon, tur: "natija", kod, chiqish,
        savol: "Bu dastur nima chiqaradi?",
        nega: bitta
          ? "Bitta = — bu solishtirish emas, TAYINLASH. x ga " + nishon + " yozildi va shart rost boʻlib qoldi."
          : "Ikkita == — solishtirish. " + x + " va " + nishon + " teng emas, shuning uchun else bajarildi.",
      };
    }, prev, rr);
  }

  const bosqich1Task = (prev, correct) => ((correct || 0) % 2 === 0 ? qavsTask(null, prev) : tengTask(null, prev));

  // ---------- 2-bosqich: sikl ----------

  // for ning uch qismi: boshi, sharti, qadami
  const SIKLLAR = [
    { id: "osha", yasa: (a, b) => ({ bosh: "int i = " + a, shart: "i <= " + b, qadam: "i++", sonlar: ket(a, b, 1) }) },
    { id: "kamay", yasa: (a, b) => ({ bosh: "int i = " + b, shart: "i >= " + a, qadam: "i--", sonlar: ket(b, a, -1) }) },
    { id: "ikki", yasa: (a, b) => ({ bosh: "int i = " + a, shart: "i <= " + b, qadam: "i += 2", sonlar: ket(a, b, 2) }) },
  ];

  function ket(a, b, qadam) {
    const out = [];
    if (qadam > 0) for (let i = a; i <= b; i += qadam) out.push(i);
    else for (let i = a; i >= b; i += qadam) out.push(i);
    return out;
  }

  function siklTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const t = pick(SIKLLAR, rnd);
      const a = int(rnd, 1, 4);
      const b = int(rnd, a + 2, a + 6);
      const s = t.yasa(a, b);
      if (!s.sonlar.length) return null;
      const kod = C.dastur(["for (" + s.bosh + "; " + s.shart + "; " + s.qadam + ") {",
        '    cout << i << " ";', "}", 'cout << "\\n";']);
      return {
        id: "sikl:" + t.id + ":" + a + ":" + b, tur: "natija", kod, chiqish: [s.sonlar.join(" ") + " "],
        savol: "Bu sikl nima chiqaradi?",
        nega: "for ning uch qismi: boshi (" + s.bosh + "), sharti (" + s.shart + ") va qadami (" + s.qadam + "). "
          + "Shart rost boʻlguncha tana bajariladi.",
      };
    }, prev, rr);
  }

  // Sikl ichida yig'ish — olimpiadadagi eng ko'p uchraydigan naqsh
  function yigindiTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const n = int(rnd, 4, 9);
      const tur = pick(["yigindi", "kopaytma", "juft"], rnd);
      let tana;
      let javob;
      if (tur === "yigindi") {
        tana = ["int s = 0;", "for (int i = 1; i <= " + n + "; i++) s += i;", C.chiqar("s")];
        javob = (n * (n + 1)) / 2;
      } else if (tur === "kopaytma") {
        tana = ["int p = 1;", "for (int i = 1; i <= " + n + "; i++) p *= i;", C.chiqar("p")];
        javob = ket(1, n, 1).reduce((a, b) => a * b, 1);
      } else {
        tana = ["int k = 0;", "for (int i = 1; i <= " + n + "; i++) if (i % 2 == 0) k++;", C.chiqar("k")];
        javob = Math.floor(n / 2);
      }
      return {
        id: "yig:" + tur + ":" + n, tur: "natija", kod: C.dastur(tana), chiqish: [String(javob)],
        savol: "Bu dastur nima chiqaradi?",
        nega: "Sikl ichida bitta oʻzgaruvchi toʻplanib boradi — yigʻindi, koʻpaytma yoki sanoq shunday hisoblanadi.",
      };
    }, prev, rr);
  }

  const bosqich2Task = (prev, correct) => ((correct || 0) % 2 === 0 ? siklTask(null, prev) : yigindiTask(null, prev));

  // ---------- 3-bosqich: sikldagi xatolar va kod yozish ----------

  const XATOLAR = [
    {
      id: "nuqta-vergul", kod: ["for (int i = 1; i <= 3; i++);", '    cout << i << " ";'],
      javob: "Sikl tanasi boʻsh qolgan",
      nega: "for dan keyin darhol ; qoʻyilgan — sikl boʻsh aylanadi, cout esa sikldan tashqarida qoladi "
        + "(va i tanilmaydi).",
    },
    {
      id: "kam", kod: ["int n = 5;", "for (int i = 1; i < n; i++)", '    cout << i << " ";'],
      javob: "Bir marta kam aylanadi",
      nega: "1 dan n gacha kerak boʻlsa, shart i <= n boʻladi. i < n bilan oxirgi qadam tushib qoladi.",
    },
    {
      id: "toxtamaydi", kod: ["int i = 1;", "while (i <= 5) {", '    cout << i << " ";', "}"],
      javob: "Sikl hech qachon tugamaydi",
      nega: "i hech qayerda oshmayapti — shart doim rost. while ichida qadamni oʻzing yozishing kerak.",
    },
    {
      id: "qavssiz", kod: ["for (int i = 1; i <= 3; i++)", '    cout << i;', '    cout << " ";'],
      javob: "Faqat birinchi satr sikl ichida",
      nega: "Qavs yoʻq: siklga faqat keyingi bitta satr tegishli. Ikkinchi cout sikl tugagach bir marta ishlaydi.",
    },
  ];

  function xatoTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const x = pick(XATOLAR, rnd);
      return {
        id: "xato:" + x.id, tur: "xato", kod: C.dastur(x.kod),
        savol: "Bu siklda xato bor. Qanaqa xato?",
        javob: x.javob,
        variantlar: aralash(XATOLAR.map((y) => y.javob), rnd),
        yolYoriq: "Siklni xayolan bir marta aylantir: i qanday oʻzgaradi va tanaga nima kiradi?",
        nega: x.nega,
      };
    }, prev, rr);
  }

  const QOLIP = C.BOSH + "\n    \n" + C.OXIR;

  const YOZISHLAR = [
    {
      id: "yigindi", savol: "n ni oʻqib, 1 dan n gacha sonlar yigʻindisini chiqar.",
      sinovlar: [{ kirish: ["5"], chiqish: ["15"] }, { kirish: ["100"], chiqish: ["5050"] }],
      yechim: C.dastur(["int n;", "cin >> n;", "int s = 0;", "for (int i = 1; i <= n; i++) {", "    s += i;", "}", C.chiqar("s")]),
      yolYoriq: "Yigʻindini 0 dan boshla, sikl ichida s += i deb qoʻsh.",
    },
    {
      id: "eng-katta", savol: "n ta sonni oʻqib, eng kattasini chiqar.",
      sinovlar: [{ kirish: ["5", "3 9 2 7 5"], chiqish: ["9"] }, { kirish: ["3", "-4 -9 -1"], chiqish: ["-1"] }],
      yechim: C.dastur(["int n;", "cin >> n;", "int eng;", "cin >> eng;", "for (int i = 1; i < n; i++) {",
        "    int x;", "    cin >> x;", "    if (x > eng) eng = x;", "}", C.chiqar("eng")]),
      yolYoriq: "Birinchi sonni «eng katta» deb ol, keyingilarini u bilan solishtir. Nolni boshlangʻich qilib olma — manfiy sonlar bor.",
    },
    {
      id: "juftlar", savol: "n ta sonni oʻqib, nechtasi juft ekanini chiqar.",
      sinovlar: [{ kirish: ["6", "1 2 3 4 5 6"], chiqish: ["3"] }, { kirish: ["4", "7 7 7 8"], chiqish: ["1"] }],
      yechim: C.dastur(["int n;", "cin >> n;", "int k = 0;", "for (int i = 0; i < n; i++) {", "    int x;",
        "    cin >> x;", "    if (x % 2 == 0) k++;", "}", C.chiqar("k")]),
      yolYoriq: "Juftlik sharti: x % 2 == 0.",
    },
    {
      id: "jadval", savol: "n ni oʻqib, koʻpaytirish jadvalining n-qatorini chiqar: har satrda «n x i = natija».",
      sinovlar: [{ kirish: ["3"], chiqish: ["3 x 1 = 3", "3 x 2 = 6", "3 x 3 = 9", "3 x 4 = 12", "3 x 5 = 15"] }],
      yechim: C.dastur(["int n;", "cin >> n;", "for (int i = 1; i <= 5; i++) {",
        '    cout << n << " x " << i << " = " << n * i << "\\n";', "}"]),
      yolYoriq: "Bitta cout ichida matn va sonlar navbat bilan yoziladi: n << \" x \" << i << …",
    },
  ];

  function yozTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const y = pick(YOZISHLAR, rnd);
      return Object.assign({ tur: "yoz", qolip: QOLIP, rows: 9 }, y, { id: "yoz:" + y.id });
    }, prev, rr);
  }

  const bosqich3Task = (prev, correct) => ((correct || 0) % 2 === 0 ? xatoTask(null, prev) : yozTask(null, prev));

  // ---------- Parity testi uchun namunalar ----------
  function namunalar(soni) {
    let seed = 20261002;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    const out = [];
    const korilgan = new Set();
    for (const y of YOZISHLAR) {
      for (const sinov of y.sinovlar) {
        out.push({ id: "yechim:" + y.id + ":" + sinov.kirish.join("|"), kod: y.yechim, kirish: sinov.kirish, chiqish: sinov.chiqish });
      }
    }
    const yasovchilar = [qavsTask, tengTask, siklTask, yigindiTask];
    let prev = null;
    for (let k = 0; out.length < (soni || 24) && k < (soni || 24) * 10; k++) {
      const task = yasovchilar[k % yasovchilar.length](rnd, prev);
      prev = task;
      if (!task || korilgan.has(task.id)) continue;
      korilgan.add(task.id);
      out.push({ id: task.id, kod: task.kod, kirish: [], chiqish: task.chiqish });
    }
    return out;
  }

  const api = {
    SIKLLAR, XATOLAR, YOZISHLAR, QOLIP, ket,
    qavsTask, tengTask, siklTask, yigindiTask, xatoTask, yozTask,
    bosqich1Task, bosqich2Task, bosqich3Task, namunalar,
  };
  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

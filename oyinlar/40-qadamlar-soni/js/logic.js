// 40-o'yin: qadamlar soni va O(n) (sof mantiq).
// Qoida: har ta'rif O'LCHOVDAN KEYIN keladi — qadamlarni talqinchi sanaydi (py.run().steps).
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // O'sish sinflari. nisbat — n ikki barobar oshganda qadamlar necha barobar oshadi.
  const SINFLAR = [
    { id: "1", nom: "O(1)", qisqa: "oʻzgarmas", izoh: "n qancha katta boʻlsa ham, qadam deyarli oʻzgarmaydi", nisbat: 1 },
    { id: "log", nom: "O(log n)", qisqa: "logarifmik", izoh: "n ikki barobar oshsa, bir necha qadam qoʻshiladi", nisbat: 1.2 },
    { id: "n", nom: "O(n)", qisqa: "chiziqli", izoh: "n ikki barobar oshsa, qadam ham ikki barobar", nisbat: 2 },
    { id: "n2", nom: "O(n²)", qisqa: "kvadratik", izoh: "n ikki barobar oshsa, qadam toʻrt barobar", nisbat: 4 },
  ];
  const sinfById = (id) => SINFLAR.find((s) => s.id === id) || SINFLAR[0];

  const literal = (n) => {
    const out = [];
    for (let k = 0; k < n; k++) out.push(k);
    return "a = [" + out.join(", ") + "]\n";
  };
  const teskari = (n) => {
    const out = [];
    for (let k = n; k >= 1; k--) out.push(k);
    return "a = [" + out.join(", ") + "]\n";
  };

  // Kod namunalari: har birining sinfi oldindan ma'lum, lekin bolaga O'LCHOVDAN KEYIN aytiladi
  const NAMUNALAR = [
    {
      korsat: "print(n * (n + 1) // 2)",
      id: "formula", sinf: "1", nom: "Formula bilan yigʻindi",
      kod: (n) => "n = " + n + "\nprint(n * (n + 1) // 2)",
    },
    {
      korsat: "# a — n ta son\nprint(a[len(a) - 1])",
      id: "oxirgi", sinf: "1", nom: "Roʻyxatning oxirgi elementi",
      kod: (n) => literal(n) + "print(a[len(a) - 1])",
    },
    {
      korsat: "# a — n ta tartiblangan son\nx = n - 1\nchap = 0\nong = len(a) - 1\nwhile chap <= ong:\n    orta = (chap + ong) // 2\n    if a[orta] == x:\n        chap = ong + 1\n    elif a[orta] < x:\n        chap = orta + 1\n    else:\n        ong = orta - 1",
      id: "ikkilik", sinf: "log", nom: "Ikkilik izlash",
      kod: (n) => literal(n) + "x = " + (n - 1) + "\nchap = 0\nong = len(a) - 1\njoy = -1\nwhile chap <= ong:\n    orta = (chap + ong) // 2\n    if a[orta] == x:\n        joy = orta\n        chap = ong + 1\n    elif a[orta] < x:\n        chap = orta + 1\n    else:\n        ong = orta - 1\nprint(joy)",
    },
    {
      korsat: "s = 0\nfor i in range(1, n + 1):\n    s += i\nprint(s)",
      id: "yigindi", sinf: "n", nom: "Sikl bilan yigʻindi",
      kod: (n) => "s = 0\nfor i in range(1, " + (n + 1) + "):\n    s += i\nprint(s)",
    },
    {
      korsat: "# a — n ta son\nx = n - 1\njoy = -1\nfor i in range(len(a)):\n    if a[i] == x:\n        joy = i\nprint(joy)",
      id: "chiziqli", sinf: "n", nom: "Chiziqli izlash",
      kod: (n) => literal(n) + "x = " + (n - 1) + "\njoy = -1\nfor i in range(len(a)):\n    if a[i] == x:\n        joy = i\nprint(joy)",
    },
    {
      korsat: "# a — n ta son, teskari tartibda\nfor oxir in range(len(a) - 1, 0, -1):\n    for i in range(oxir):\n        if a[i] > a[i + 1]:\n            b = a[i]\n            a[i] = a[i + 1]\n            a[i + 1] = b",
      id: "pufak", sinf: "n2", nom: "Pufakcha saralash",
      kod: (n) => teskari(n) + "for oxir in range(len(a) - 1, 0, -1):\n    for i in range(oxir):\n        if a[i] > a[i + 1]:\n            b = a[i]\n            a[i] = a[i + 1]\n            a[i + 1] = b\nprint(a[0])",
    },
    {
      korsat: "soni = 0\nfor i in range(n):\n    for j in range(n):\n        soni += 1\nprint(soni)",
      id: "juftlar", sinf: "n2", nom: "Hamma juftlikni koʻrish",
      kod: (n) => "soni = 0\nfor i in range(" + n + "):\n    for j in range(" + n + "):\n        soni += 1\nprint(soni)",
    },
  ];
  const namunaById = (id) => NAMUNALAR.find((x) => x.id === id) || NAMUNALAR[0];

  const olcha = (kod) => {
    const r = py.run(kod, { maxSteps: 3000000 });
    return { qadam: r.steps, chiqish: r.output, xato: r.error };
  };

  // n bo'yicha o'lchov: [{ n, qadam }]
  const olchovlar = (namuna, olchamlar) => (olchamlar || [10, 20, 40, 80]).map((n) => ({ n, qadam: olcha(namuna.kod(n)).qadam }));

  // n ikki barobar oshganda qadam necha barobar oshdi (oxirgi ikki o'lchov bo'yicha)
  function nisbat(list) {
    if (list.length < 2) return 1;
    const oxirgi = list[list.length - 1];
    const oldingi = list[list.length - 2];
    return oldingi.qadam ? oxirgi.qadam / oldingi.qadam : 1;
  }

  // O'lchangan nisbatdan sinfni aniqlash — bola ham shu qoida bilan topadi
  function sinfniTop(r) {
    if (r < 1.1) return "1";
    if (r < 1.6) return "log";
    if (r < 3) return "n";
    return "n2";
  }

  // ---------- 1-bosqich: o'sishni bashorat qilish ----------
  function bashoratTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const namuna = pick(NAMUNALAR, rnd);
      const list = olchovlar(namuna, [10, 20, 40]);
      const s = sinfById(namuna.sinf);
      return {
        id: "bashorat:" + namuna.id, tur: "bashorat", namuna,
        korinadigan: list.slice(0, 2), yashirin: list[2],
        javob: s.nisbat <= 1.05 ? "teng" : s.nisbat < 1.6 ? "ozgina" : s.nisbat < 3 ? "ikki" : "tort",
      };
    }, prev, rr);
  }
  const BASHORAT = [
    { id: "teng", nom: "Deyarli oʻzgarmaydi" },
    { id: "ozgina", nom: "Bir necha qadamga koʻpayadi" },
    { id: "ikki", nom: "Ikki barobar koʻpayadi" },
    { id: "tort", nom: "Toʻrt barobar koʻpayadi" },
  ];

  // ---------- 2-bosqich: sinfga nom berish ----------
  function sinfTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const namuna = pick(NAMUNALAR, rnd);
      const list = olchovlar(namuna, [10, 20, 40, 80]);
      return { id: "sinf:" + namuna.id, tur: "sinf", namuna, olchov: list, javob: namuna.sinf, nisbat: nisbat(list) };
    }, prev, rr);
  }

  // ---------- 3-bosqich: amaliy tanlov ----------
  // Katta n da qaysi usul yaraydi: taxminiy qadamlar soni hisoblanadi
  const VAZIFALAR = [
    {
      id: "izlash", savol: "1 000 000 ta tartiblangan son ichidan bittasini topish kerak. Qaysi usul?",
      tanlovlar: [{ id: "chiziqli", nom: "Chiziqli izlash" }, { id: "ikkilik", nom: "Ikkilik izlash" }],
      javob: "ikkilik", n: 1000000,
      nega: "Chiziqli izlash 1 000 000 ta qadam qiladi, ikkilik izlash — 20 ta.",
    },
    {
      id: "saralash", savol: "100 000 ta sonni saralash kerak. Pufakcha saralash yaraydimi?",
      tanlovlar: [{ id: "ha", nom: "Ha, yaraydi" }, { id: "yoq", nom: "Yoʻq, juda sekin" }],
      javob: "yoq", n: 100000,
      nega: "Pufakcha saralash n² qadam qiladi: 100 000² = 10 000 000 000. Bu juda koʻp.",
    },
    {
      id: "yigindi", savol: "1 dan 1 000 000 gacha yigʻindi kerak. Sikl bilan hisoblaymizmi?",
      tanlovlar: [{ id: "sikl", nom: "Sikl bilan" }, { id: "formula", nom: "Formula bilan" }],
      javob: "formula", n: 1000000,
      nega: "Sikl 1 000 000 marta aylanadi, formula esa bitta amalda javob beradi.",
    },
    {
      id: "juftlik", savol: "10 000 ta oʻquvchidan har juftligini tekshirish kerak. Bu qancha ish?",
      tanlovlar: [{ id: "oz", nom: "Oz — tez bitadi" }, { id: "kop", nom: "Juda koʻp — n² ta juftlik" }],
      javob: "kop", n: 10000,
      nega: "Har juftlik — n² ta: 10 000² = 100 000 000 ta tekshiruv.",
    },
  ];

  function amaliyTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => Object.assign({ tur: "amaliy" }, pick(VAZIFALAR, rnd)), prev, rr);
  }


  // ---------- 3-bosqich: qoida bilan hisoblash (2n uchun qadam) ----------
  // Faqat sinflari arifmetikaga qulay bo'lganlar: O(1), O(n), O(n^2)
  const HISOB = [
    { sinf: "1", nom: "Formula bilan yigʻindi" },
    { sinf: "n", nom: "Chiziqli izlash" },
    { sinf: "n", nom: "Sikl bilan yigʻindi" },
    { sinf: "n2", nom: "Pufakcha saralash" },
    { sinf: "n2", nom: "Hamma juftlikni koʻrish" },
  ];
  const HISOB_N = [10, 25, 50, 100, 200];
  const HISOB_QADAM = [20, 50, 100, 300, 1000];

  function hisobTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const usul = pick(HISOB, rnd);
      const s = sinfById(usul.sinf);
      const n = pick(HISOB_N, rnd);
      const qadam = pick(HISOB_QADAM, rnd);
      return {
        id: "hisob:" + usul.nom + ":" + n + ":" + qadam, tur: "hisob",
        usul, sinf: s, n, qadam, yangiN: n * 2, javob: qadam * s.nisbat,
      };
    }, prev, rr);
  }

  const api = {
    SINFLAR, sinfById, NAMUNALAR, namunaById, BASHORAT, VAZIFALAR,
    HISOB, HISOB_N, HISOB_QADAM,
    olcha, olchovlar, nisbat, sinfniTop, bashoratTask, sinfTask, amaliyTask, hisobTask,
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

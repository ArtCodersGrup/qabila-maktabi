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
  // 2026-10-02: har savolda TO'RT tanlov (oldin ikkita edi — 50% taxmin; QOIDALAR 4.3).
  // Tanlovlar qadamlar sonini ham aytadi: bola usulni emas, O'SISHNI tanlaydi.
  // tier — savol qaysi qiyinlik zinasidan boshlab chiqadi.
  const VAZIFALAR = [
    {
      id: "izlash", savol: "1 000 000 ta tartiblangan son ichidan bittasini topish kerak. Qaysi usul eng kam qadam qiladi?",
      tanlovlar: [
        { id: "chiziqli", nom: "Chiziqli izlash" },
        { id: "ikkilik", nom: "Ikkilik izlash" },
        { id: "saralab", nom: "Avval pufakcha bilan saralab, keyin chiziqli" },
        { id: "farqsiz", nom: "Farqi yoʻq — hammasi bir xil" },
      ],
      javob: "ikkilik", n: 1000000,
      nega: "Chiziqli izlash 1 000 000 tagacha qadam qiladi, ikkilik izlash — 20 ta. Roʻyxat allaqachon tartiblangan — qayta saralash ortiqcha ish.",
    },
    {
      id: "saralash", savol: "100 000 ta sonni pufakcha usulida saralasak, taxminan nechta qadam boʻladi?",
      tanlovlar: [
        { id: "n", nom: "100 000 — n ta" },
        { id: "2n", nom: "200 000 — 2 × n ta" },
        { id: "n2", nom: "10 000 000 000 — n² ta" },
        { id: "log", nom: "17 ta — log n" },
      ],
      javob: "n2", n: 100000,
      nega: "Pufakcha saralash — ikki qavat sikl, n² qadam: 100 000² = 10 000 000 000. Bu juda koʻp.",
    },
    {
      id: "yigindi", savol: "1 dan 1 000 000 gacha sonlar yigʻindisi kerak. Qaysi yoʻl eng kam qadam qiladi?",
      tanlovlar: [
        { id: "sikl", nom: "Sikl bilan qoʻshib chiqish" },
        { id: "formula", nom: "Formula: n × (n + 1) ÷ 2" },
        { id: "royxat", nom: "Roʻyxatga yigʻib, keyin qoʻshish" },
        { id: "ikkilik", nom: "Ikkilik izlash" },
      ],
      javob: "formula", n: 1000000,
      nega: "Sikl 1 000 000 marta aylanadi, formula esa bitta amalda javob beradi — O(1).",
    },
    {
      id: "juftlik", savol: "10 000 ta oʻquvchining har juftligini tekshirish kerak. Bu taxminan qancha ish?",
      tanlovlar: [
        { id: "n", nom: "10 000 ta — n" },
        { id: "2n", nom: "20 000 ta — 2 × n" },
        { id: "n2", nom: "100 000 000 ta — n²" },
        { id: "log", nom: "14 ta — log n" },
      ],
      javob: "n2", n: 10000,
      nega: "Har oʻquvchi har biri bilan — n² tartibida: 10 000² = 100 000 000 ta tekshiruv.",
    },
    {
      id: "kichik", tier: 1, savol: "10 ta son ichidan bittasini topish kerak, roʻyxat tartiblanmagan. Nima qilamiz?",
      tanlovlar: [
        { id: "chiziqli", nom: "Chiziqli izlash — koʻpi bilan 10 qadam" },
        { id: "ikkilik", nom: "Ikkilik izlash — tartiblanmagan boʻlsa ham" },
        { id: "saralab", nom: "Avval saralab, keyin ikkilik izlash" },
        { id: "bolmaydi", nom: "Topib boʻlmaydi" },
      ],
      javob: "chiziqli", n: 10,
      nega: "Kichik n da oddiy usul yetadi: 10 qadam. Ikkilik izlash tartibsiz roʻyxatda ishlamaydi, saralash esa izlashning oʻzidan qimmat.",
    },
    {
      id: "kop-izlash", tier: 1, savol: "1 000 000 ta tartibsiz son bor. Ular ichidan 1 000 000 marta har xil son izlanadi. Qaysi reja yaxshi?",
      tanlovlar: [
        { id: "chiziqli", nom: "Har safar chiziqli izlash" },
        { id: "saralab", nom: "Bir marta saralab, har safar ikkilik izlash" },
        { id: "ikkilik", nom: "Saralamasdan ikkilik izlash" },
        { id: "farqsiz", nom: "Farqi yoʻq" },
      ],
      javob: "saralab", n: 1000000,
      nega: "Har safar chiziqli — n × n = 10¹² qadam. Bir marta saralash qimmat, lekin keyin har izlash 20 qadam: jami ancha kam.",
    },
    {
      id: "ikki-barobar", tier: 2, savol: "Dastur n = 1000 da 1 soniya ishlaydi va uning oʻsishi O(n²). n = 10 000 da taxminan qancha ishlaydi?",
      tanlovlar: [
        { id: "10", nom: "10 soniya" },
        { id: "20", nom: "20 soniya" },
        { id: "100", nom: "100 soniya" },
        { id: "1000", nom: "1000 soniya" },
      ],
      javob: "100", n: 10000,
      nega: "n oʻn barobar oshdi — O(n²) da qadam 10 × 10 = 100 barobar oshadi: 100 soniya.",
    },
    {
      id: "log-osish", tier: 2, savol: "Ikkilik izlash 1 000 ta sonda 10 qadam qiladi. 1 000 000 ta sonda nechta qadam qiladi?",
      tanlovlar: [
        { id: "20", nom: "20 ta" },
        { id: "100", nom: "100 ta" },
        { id: "10000", nom: "10 000 ta" },
        { id: "1000000", nom: "1 000 000 ta" },
      ],
      javob: "20", n: 1000000,
      nega: "Har ikkilanish bitta qadam qoʻshadi. 1 000 → 1 000 000 — ming barobar, yaʼni yana 10 marta ikkilanish: 10 + 10 = 20.",
    },
  ];

  const zina = (tier) => (tier == null ? 2 : Math.max(0, Math.min(2, tier)));

  // Tanlovlar har safar boshqa tartibda (to'g'ri javob bir joyda turib qolmasin)
  function aralash(list, rnd) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function amaliyTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const mos = VAZIFALAR.filter((v) => (v.tier || 0) <= zina(tier));
      const v = pick(mos, rnd);
      return Object.assign({ tur: "amaliy" }, v, { tanlovlar: aralash(v.tanlovlar, rnd) });
    }, prev, rr);
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

  // karra — n necha barobar oshadi: 2 (qoida to'g'ridan-to'g'ri) yoki 4 (qoida ikki marta qo'llanadi).
  // 2026-10-02: 4 barobar holati qo'shildi — O(n²) da 4 × 4 = 16 barobar; yoddan "×4" deb bo'lmaydi.
  function hisobTask(r, prev, tier) {
    const rr = r || Math.random;
    const t = zina(tier);
    return pickNew((rnd) => {
      const usul = pick(HISOB, rnd);
      const s = sinfById(usul.sinf);
      const n = pick(HISOB_N, rnd);
      const qadam = pick(HISOB_QADAM, rnd);
      const karra = t === 0 ? 2 : pick([2, 4], rnd);
      const marta = karra === 4 ? 2 : 1; // n necha marta ikkilandi
      return {
        id: "hisob:" + usul.nom + ":" + n + ":" + qadam + ":" + karra, tur: "hisob",
        usul, sinf: s, n, qadam, karra, yangiN: n * karra, javob: qadam * s.nisbat ** marta,
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

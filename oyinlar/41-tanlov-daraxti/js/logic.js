// 41-o'yin: ko'paytirish va qo'shish qoidasi (sof mantiq, ekransiz).
// Har holat uchun variantlar RO'YXATI ham bor — formula ro'yxatni sanaydi, aksincha emas.
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const S = (root.QK && root.QK.sanash) || require("../../umumiy/js/sanash.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // ---------- Daraxt chiziladigan holatlar: har qadamda tanlov (VA) ----------
  // Elementlar nomi qisqa — ekranda daraxt bo'lib chiziladi (3×2 va 2×3×2 dan katta emas)
  const DARAXTLAR = [
    {
      id: "kiyim", savol: "Bayramga kiyim tanlaymiz.",
      qadamlar: [{ nom: "Koʻylak", elementlar: ["qizil", "koʻk", "yashil"] }, { nom: "Shim", elementlar: ["qora", "jins"] }],
    },
    {
      id: "taom", savol: "Nonushta: non va ichimlik.",
      qadamlar: [{ nom: "Non", elementlar: ["patir", "lavash"] }, { nom: "Ichimlik", elementlar: ["choy", "sut", "suv"] }],
    },
    {
      id: "yol", savol: "Toshkentdan Buxoroga Samarqand orqali boramiz.",
      qadamlar: [
        { nom: "Toshkent → Samarqand", elementlar: ["poyezd", "avtobus"] },
        { nom: "Samarqand → Buxoro", elementlar: ["poyezd", "avtobus", "mashina"] },
      ],
    },
    {
      id: "bayroq", savol: "Qabila bayrogʻi: rang, shakl va chekka.",
      qadamlar: [
        { nom: "Rang", elementlar: ["qizil", "koʻk"] },
        { nom: "Shakl", elementlar: ["doira", "uchburchak", "kvadrat"] },
        { nom: "Chekka", elementlar: ["oq", "sariq"] },
      ],
    },
  ];
  const daraxtById = (id) => DARAXTLAR.find((d) => d.id === id) || DARAXTLAR[0];
  const barglar = (holat) => S.variantlar(holat.qadamlar.map((q) => q.elementlar));
  const daraxtSoni = (holat) => S.kopaytir(holat.qadamlar.map((q) => q.elementlar.length));

  // ---------- Hisob savollari: faqat ko'paytirish ----------
  const VA_SAVOL = [
    (r) => { const a = int(r, 3, 9), b = int(r, 2, 8);
      return { matn: a + " ta koʻylak va " + b + " ta shim bor. Nechta kiyinish usuli bor?", qiymat: [a, b] }; },
    (r) => { const a = int(r, 2, 6), b = int(r, 3, 8);
      return { matn: a + " xil non va " + b + " xil ichimlik bor. Nechta nonushta yigʻiladi?", qiymat: [a, b] }; },
    (r) => { const a = int(r, 2, 5), b = int(r, 2, 5), c = int(r, 2, 4);
      return { matn: "Qalpoqcha " + a + " xil, koʻylak " + b + " xil, kamar " + c + " xil. Nechta usul?", qiymat: [a, b, c] }; },
    (r) => { const a = int(r, 2, 6);
      return { matn: "Tanga " + a + " marta tashlandi. Nechta xil natija chiqishi mumkin?", qiymat: Array(a).fill(2) }; },
    (r) => { const a = int(r, 2, 4);
      return { matn: a + " xonali raqamli kod (har xonada 0 dan 9 gacha). Nechta kod bor?", qiymat: Array(a).fill(10) }; },
  ];

  function vaTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = pick(VA_SAVOL, rnd)(rnd);
      const javob = S.kopaytir(s.qiymat);
      return { id: "va:" + s.matn, tur: "va", matn: s.matn, qiymat: s.qiymat, javob,
        hisob: s.qiymat.join(" × ") + " = " + javob };
    }, prev, rr);
  }

  // ---------- VA / YOKI: qaysi qoida? ----------
  // Har savolda ikkala javob ham beriladi: to'g'risi va "noto'g'ri qoida" natijasi
  const ARALASH_SAVOL = [
    (r) => { const a = int(r, 2, 6), b = int(r, 2, 6);
      return { qoida: "yoki", matn: "Maktabga " + a + " ta avtobus yoki " + b + " ta piyoda yoʻl bilan borish mumkin. Nechta yoʻl bor?", qiymat: [a, b] }; },
    (r) => { const a = int(r, 3, 8), b = int(r, 3, 8);
      return { qoida: "yoki", matn: "Sovgʻaga " + a + " ta kitobdan yoki " + b + " ta oʻyinchoqdan bittasi olinadi. Nechta tanlov?", qiymat: [a, b] }; },
    (r) => { const a = int(r, 2, 5), b = int(r, 2, 5);
      return { qoida: "va", matn: a + " xil muzqaymoq va " + b + " xil stakan bor. Nechta usulda muzqaymoq olinadi?", qiymat: [a, b] }; },
    (r) => { const a = int(r, 2, 6), b = int(r, 2, 6);
      return { qoida: "va", matn: "Ertalab " + a + " xil mashq, kechqurun " + b + " xil mashq qilinadi. Bir kunlik reja nechta xil boʻladi?", qiymat: [a, b] }; },
    (r) => { const a = int(r, 2, 5), b = int(r, 2, 5);
      return { qoida: "yoki", matn: "Bugun " + a + " ta film yoki " + b + " ta multfilmdan bittasi koʻriladi. Nechta tanlov?", qiymat: [a, b] }; },
    (r) => { const a = int(r, 2, 5), b = int(r, 2, 5);
      return { qoida: "va", matn: "Birinchi savolga " + a + " xil, ikkinchisiga " + b + " xil javob berish mumkin. Nechta xil javoblar varaqasi?", qiymat: [a, b] }; },
  ];

  function qoidaTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = pick(ARALASH_SAVOL, rnd)(rnd);
      const kopaytma = S.kopaytir(s.qiymat);
      const yigindi = S.qosh(s.qiymat);
      if (kopaytma === yigindi) return null; // 2+2 = 2×2: savol farqni ko'rsatmaydi
      const javob = s.qoida === "va" ? kopaytma : yigindi;
      const xato = s.qoida === "va" ? yigindi : kopaytma;
      return {
        id: "qoida:" + s.matn, tur: "qoida", matn: s.matn, qiymat: s.qiymat, qoida: s.qoida, javob, xato,
        hisob: s.qiymat.join(s.qoida === "va" ? " × " : " + ") + " = " + javob,
        nega: s.qoida === "va"
          ? "Ikkala tanlov ham qilinadi (VA) — qadamlar koʻpaytiriladi."
          : "Faqat bittasi tanlanadi (YOKI) — holatlar qoʻshiladi.",
      };
    }, prev, rr);
  }

  // ---------- 3-bosqich: kod ----------
  // Sikl hamma juftlikni sanaydi — formula bilan bir xil chiqishi kerak
  const sanaKod = (a, b) => "soni = 0\nfor i in range(" + a + "):\n    for j in range(" + b + "):\n        soni += 1\nprint(soni)";

  function kodTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const a = int(rnd, 2, 6);
      const b = int(rnd, 2, 6);
      const code = sanaKod(a, b);
      return { id: "natija:" + a + "x" + b, tur: "natija", type: "natija", code, solution: code,
        qiymat: [a, b], javob: S.kopaytir([a, b]) };
    }, prev, rr);
  }

  const WRITE = [
    {
      id: "sana2",
      what: "sana(a, b) — a ta koʻylak va b ta shim. Koʻpaytirmasdan, ikki sikl bilan sanab, sonini qaytar.",
      solution: "def sana(a, b):\n    soni = 0\n    for i in range(a):\n        for j in range(b):\n            soni += 1\n    return soni",
      tail: "print(sana(int(input()), int(input())))",
      tests: [["3", "4"], ["5", "2"], ["1", "1"], ["6", "6"]],
    },
    {
      id: "sana3",
      what: "sana3(a, b, c) — uch qadamli tanlov. Uchta sikl bilan sanab, variantlar sonini qaytar.",
      solution: "def sana3(a, b, c):\n    soni = 0\n    for i in range(a):\n        for j in range(b):\n            for k in range(c):\n                soni += 1\n    return soni",
      tail: "print(sana3(int(input()), int(input()), int(input())))",
      tests: [["2", "3", "4"], ["5", "1", "2"], ["3", "3", "3"]],
    },
  ];

  function writeTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const w = pick(WRITE, rnd);
      return { id: "yoz:" + w.id, tur: "yoz", type: "kod-yoz", what: w.what, solution: w.solution, tail: w.tail,
        tests: w.tests.map((stdin) => ({ stdin })) };
    }, prev, rr);
  }

  const api = {
    DARAXTLAR, daraxtById, barglar, daraxtSoni,
    VA_SAVOL, ARALASH_SAVOL, WRITE, sanaKod,
    vaTask, qoidaTask, kodTask, writeTask,
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

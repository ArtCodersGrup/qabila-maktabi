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

  // Qiyinlik zinasi (QOIDALAR 4.3): 0 — birinchi javoblar, 1 — o'rta, 2 — oxirgi va qiyin rejim.
  // Zina berilmasa (testlar) — hammasidan teng.
  function zinadan(list, tier, rnd) {
    if (tier == null) return pick(list, rnd);
    const t = Math.max(0, Math.min(2, tier));
    const mos = list.filter((x) => (x.tier || 0) <= t);
    const ayni = mos.filter((x) => (x.tier || 0) === t);
    return ayni.length && rnd() < 0.6 ? pick(ayni, rnd) : pick(mos, rnd);
  }
  const zinali = (tier, fn) => Object.assign(fn, { tier });

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
    // ---- 2026-10-02 (zina 1–2): qadamdagi tanlovlar soni oldingi qadamga bog'liq yoki cheklangan ----
    zinali(1, (r) => { const a = int(r, 2, 3);
      return { matn: (a + 1) + " xonali sonlar nechta? (Birinchi raqam 0 boʻlmaydi, raqamlar takrorlanishi mumkin.)", qiymat: [9].concat(Array(a).fill(10)) }; }),
    zinali(1, (r) => { const a = int(r, 3, 6), b = int(r, 2, 5), c = int(r, 2, 4), d = int(r, 2, 3);
      return { matn: "Tushlik: " + a + " xil shoʻrva, " + b + " xil ovqat, " + c + " xil ichimlik va " + d + " xil shirinlik. Toʻliq tushlik nechta xil?", qiymat: [a, b, c, d] }; }),
    zinali(2, () => ({ matn: "Raqamlari har xil ikki xonali sonlar nechta? (Birinchi raqam 0 boʻlmaydi.)", qiymat: [9, 9] })),
    zinali(2, (r) => { const a = int(r, 3, 6);
      return { matn: a + " ta bola bor. Sardor va uning oʻrinbosari saylanadi (bir bola ikki vazifani olmaydi). Nechta usul?", qiymat: [a, a - 1] }; }),
    zinali(2, (r) => { const a = int(r, 3, 5);
      return { matn: a + " xonali kod: har xonada faqat juft raqam (0, 2, 4, 6, 8). Nechta kod bor?", qiymat: Array(a).fill(5) }; }),
  ];

  function vaTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = zinadan(VA_SAVOL, tier, rnd)(rnd);
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
    // ---- 2026-10-02 (zina 1–2): IKKI QOIDA BIRGA — (a yoki b) va c. qiymat: [a, b, c] ----
    zinali(1, (r) => { const a = int(r, 2, 5), b = int(r, 2, 5), c = int(r, 2, 4);
      return { qoida: "aralash", matn: "Nonushtaga " + a + " xil non yoki " + b + " xil pishiriqdan bittasi olinadi, yoniga " + c + " xil ichimlikdan bittasi. Nechta nonushta?", qiymat: [a, b, c] }; }),
    zinali(2, (r) => { const a = int(r, 2, 4), b = int(r, 2, 4), c = int(r, 2, 5);
      return { qoida: "aralash", matn: "Shaharga " + a + " ta avtobus yoki " + b + " ta poyezd bilan boriladi, qaytishda esa " + c + " ta taksidan biri olinadi. Borish-qaytish nechta usulda?", qiymat: [a, b, c] }; }),
    zinali(2, (r) => { const a = int(r, 3, 6), b = int(r, 2, 5), c = int(r, 2, 4);
      return { qoida: "aralash", matn: "Sovgʻa: " + a + " ta kitobdan yoki " + b + " ta oʻyindan bittasi, va albatta " + c + " xil qogʻozdan biriga oʻraladi. Nechta sovgʻa?", qiymat: [a, b, c] }; }),
  ];

  function qoidaTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = zinadan(ARALASH_SAVOL, tier, rnd)(rnd);
      if (s.qoida === "aralash") {
        // (a + b) × c. Xato javob — hammasini ko'paytirish (eng ko'p uchraydigan yanglishish)
        const [a, b, c] = s.qiymat.map(BigInt);
        if (a + b === a * b) return null; // 2 va 2: qo'shish ham, ko'paytirish ham 4 — savol farqni ko'rsatmaydi
        return {
          id: "qoida:" + s.matn, tur: "qoida", matn: s.matn, qiymat: s.qiymat, qoida: "aralash",
          javob: (a + b) * c, xato: a * b * c,
          hisob: "(" + a + " + " + b + ") × " + c + " = " + (a + b) * c,
          nega: "Avval YOKI: ikkitadan faqat bittasi olinadi — qoʻshiladi. Keyin VA: unga yana bir tanlov qoʻshiladi — koʻpaytiriladi.",
        };
      }
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

  // 2026-10-02: uch qavat sikl (zina 1) va "i != j" sharti (zina 2: n × (n − 1) — o'zi bilan juftlik yo'q)
  const sanaKod3 = (a, b, c) => "soni = 0\nfor i in range(" + a + "):\n    for j in range(" + b + "):\n        for k in range(" + c + "):\n            soni += 1\nprint(soni)";
  const farqliKod = (n) => "soni = 0\nfor i in range(" + n + "):\n    for j in range(" + n + "):\n        if i != j:\n            soni += 1\nprint(soni)";

  function kodTask(r, prev, tier) {
    const rr = r || Math.random;
    const t = tier == null ? Math.floor(rr() * 3) : Math.max(0, Math.min(2, tier));
    return pickNew((rnd) => {
      const tur = t === 0 ? 0 : int(rnd, 0, t);
      if (tur === 2) {
        const n = int(rnd, 3, 7);
        const code = farqliKod(n);
        return { id: "natija:farqli:" + n, tur: "natija", type: "natija", code, solution: code,
          qiymat: [n, n - 1], javob: S.kopaytir([n, n - 1]) };
      }
      if (tur === 1) {
        const a = int(rnd, 2, 4), b = int(rnd, 2, 4), c = int(rnd, 2, 3);
        const code = sanaKod3(a, b, c);
        return { id: "natija:" + a + "x" + b + "x" + c, tur: "natija", type: "natija", code, solution: code,
          qiymat: [a, b, c], javob: S.kopaytir([a, b, c]) };
      }
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
    // ---- 2026-10-02: ikki yangi masala (zina 1–2) ----
    {
      id: "farqli", tier: 1,
      what: "farqli(n) — n ta boladan sardor va oʻrinbosar saylanadi (bir bola ikki vazifani olmaydi). Ikki sikl bilan sanab, usullar sonini qaytar.",
      solution: "def farqli(n):\n    soni = 0\n    for i in range(n):\n        for j in range(n):\n            if i != j:\n                soni += 1\n    return soni",
      tail: "print(farqli(int(input())))",
      tests: [["5"], ["2"], ["1"], ["10"]],
    },
    {
      id: "kamida-bitta", tier: 2,
      what: "kamida_bitta(n, k) — n xonali kod, har xonada k xil belgidan biri turadi. Ichida KAMIDA BITTA marta birinchi belgi qatnashgan kodlar sonini qaytar. (Yoʻl-yoʻriq: hamma kodlardan birinchi belgi umuman qatnashmaganlarini ayir.)",
      solution: "def kamida_bitta(n, k):\n    return k ** n - (k - 1) ** n",
      tail: "print(kamida_bitta(int(input()), int(input())))",
      tests: [["3", "10"], ["1", "2"], ["2", "2"], ["4", "3"], ["2", "10"]],
    },
  ];

  function writeTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const w = zinadan(WRITE, tier, rnd);
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

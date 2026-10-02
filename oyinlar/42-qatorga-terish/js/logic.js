// 42-o'yin: o'rin almashtirish (n!) va o'rinlashtirish (A(n,k)) — sof mantiq.
// Tartib MUHIM bo'lgan holatlar. Tartib muhim bo'lmagani — 43-o'yinda.
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const S = (root.QK && root.QK.sanash) || require("../../umumiy/js/sanash.js");
  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  const BOLALAR = ["Anvar", "Dilnoza", "Sardor", "Malika", "Jasur"];

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

  // ---------- 1-bosqich: n! ----------
  // Qatorga terish: birinchi o'ringa n xil, keyingisiga n−1 xil … — ko'paytirish qoidasi
  const qadamlar = (n) => Array.from({ length: n }, (_, k) => n - k);
  const tartiblar = (n) => S.tartiblar(BOLALAR.slice(0, n));

  const FAKT_SAVOL = [
    (r) => { const n = int(r, 3, 7); return { n, matn: n + " ta bola bitta qatorga turadi. Nechta xil tartib bor?" }; },
    (r) => { const n = int(r, 3, 6); return { n, matn: n + " ta kitobni javonga terish kerak. Nechta usul bor?" }; },
    (r) => { const n = int(r, 3, 6); return { n, matn: n + " ta rasm devorga yonma-yon osiladi. Nechta tartib bor?" }; },
    (r) => { const n = int(r, 4, 7); return { n, matn: n + " ta harfdan (hammasi har xil) nechta soʻz yasash mumkin?" }; },
    // ---- 2026-10-02 (zina 1–2): bitta oʻrin band — qolganlari teriladi. n — TERILADIGANLAR soni ----
    zinali(1, (r) => { const n = int(r, 3, 6);
      return { n, matn: (n + 1) + " ta bola qatorga turadi, lekin Anvar doim birinchi boʻlib turadi. Nechta xil tartib bor?",
        nega: "Anvarning oʻrni band — faqat qolgan " + n + " ta bola teriladi." }; }),
    zinali(2, (r) => { const n = int(r, 3, 6);
      return { n, matn: (n + 1) + " ta kitob javonga teriladi, lugʻat esa doim eng oxirida turishi shart. Nechta usul bor?",
        nega: "Lugʻatning joyi oldindan maʼlum — qolgan " + n + " ta kitob " + n + "! usulda teriladi." }; }),
    zinali(2, (r) => { const n = int(r, 3, 5);
      return { n, matn: (n + 2) + " ta bola qatorga turadi: Anvar doim birinchi, Dilnoza doim oxirgi. Nechta xil tartib bor?",
        nega: "Ikki oʻrin band — oʻrtadagi " + n + " ta bola teriladi." }; }),
  ];

  function faktTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = zinadan(FAKT_SAVOL, tier, rnd)(rnd);
      return { id: "fakt:" + s.matn, tur: "fakt", n: s.n, matn: s.matn, javob: S.fakt(s.n),
        hisob: qadamlar(s.n).join(" × ") + " = " + s.n + "! = " + S.fakt(s.n),
        nega: s.nega || "Birinchi oʻringa " + s.n + " xil, keyingisiga " + (s.n - 1) + " xil … oxirgisiga 1 xil." };
    }, prev, rr);
  }

  // ---------- 2-bosqich: A(n,k) ----------
  const ORIN_SAVOL = [
    (r) => { const n = int(r, 5, 9); return { n, k: 3, matn: n + " ta yuguruvchidan oltin, kumush va bronza medal kimga tegadi? Nechta xil natija?" }; },
    (r) => { const n = int(r, 4, 8), k = int(r, 2, 3); return { n, k, matn: n + " ta boladan " + k + " tasi sahnaga " + (k === 2 ? "birinchi va ikkinchi" : "birinchi, ikkinchi va uchinchi") + " boʻlib chiqadi. Nechta usul?" }; },
    (r) => { const n = int(r, 5, 9), k = 2; return { n, k, matn: n + " ta kitobdan 2 tasi tanlanib, biri yuqoriga, biri pastga qoʻyiladi. Nechta usul?" }; },
    (r) => { const n = int(r, 4, 7); return { n, k: n, matn: n + " ta bolaning hammasi qatorga turadi. Nechta tartib?" }; },
    // ---- 2026-10-02 (zina 1–2): CHEKLOVLI terish — birinchi oʻrinda hamma narsa turolmaydi.
    // kopaytuvchilar — har oʻrin uchun nechta tanlov borligi (A(n, k) formulasiga tushmaydi)
    zinali(1, () => ({ cheklov: true, kopaytuvchilar: [9, 9],
      matn: "Raqamlari har xil ikki xonali sonlar nechta? (0 bilan boshlanmaydi.)",
      nega: "Birinchi oʻringa 9 xil raqam (0 siz), ikkinchisiga yana 9 xil: 0 endi mumkin, lekin birinchi raqam — yoʻq." })),
    zinali(2, () => ({ cheklov: true, kopaytuvchilar: [9, 9, 8],
      matn: "Raqamlari har xil uch xonali sonlar nechta? (0 bilan boshlanmaydi.)",
      nega: "Birinchi oʻringa 9 xil (0 siz), ikkinchisiga 9 xil (0 qoʻshiladi, birinchisi chiqadi), uchinchisiga 8 xil." })),
    zinali(2, () => ({ cheklov: true, kopaytuvchilar: [9, 9, 8, 7],
      matn: "4 xonali kod: raqamlar takrorlanmaydi va 0 bilan boshlanmaydi. Nechta kod bor?",
      nega: "9 × 9 × 8 × 7: birinchi xonada 0 boʻlmaydi, keyingilarida ishlatilgan raqamlar chiqib boradi." })),
    zinali(2, (r) => { const n = int(r, 5, 8);
      return { cheklov: true, kopaytuvchilar: [n - 1, n - 1, n - 2],
        matn: n + " ta yuguruvchidan uchtasi medal oladi. Anvar oltin medal olmagani aniq. Nechta xil natija boʻlishi mumkin?",
        nega: "Oltinga Anvardan boshqa " + (n - 1) + " kishi; kumushga qolgan " + (n - 1) + " kishi (Anvar ham); bronzaga " + (n - 2) + " kishi." }; }),
  ];

  function orinTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = zinadan(ORIN_SAVOL, tier, rnd)(rnd);
      if (s.cheklov) {
        const javob = S.kopaytir(s.kopaytuvchilar);
        return { id: "orin:" + s.matn, tur: "orin", cheklov: true, kopaytuvchilar: s.kopaytuvchilar, matn: s.matn, javob,
          hisob: s.kopaytuvchilar.join(" × ") + " = " + javob, nega: s.nega };
      }
      const javob = S.A(s.n, s.k);
      const list = Array.from({ length: s.k }, (_, i) => s.n - i);
      return { id: "orin:" + s.matn, tur: "orin", n: s.n, k: s.k, matn: s.matn, javob,
        hisob: list.join(" × ") + " = " + javob,
        nega: s.k === s.n
          ? "Hammasi ishlatiladi — bu " + s.n + "!"
          : "Birinchi oʻringa " + s.n + " xil, keyingisiga " + (s.n - 1) + " xil … " + s.k + " ta oʻrin uchun " + s.k + " ta koʻpaytuvchi." };
    }, prev, rr);
  }

  // ---------- 3-bosqich: kod ----------
  const faktKod = (n) => "n = " + n + "\nk = 1\nfor i in range(1, n + 1):\n    k = k * i\nprint(k)";
  const orinKod = (n, k) => "n = " + n + "\nk = " + k + "\nnatija = 1\nfor i in range(k):\n    natija = natija * (n - i)\nprint(natija)";

  // 2026-10-02 (zina 2): raqamlari har xil sonlarni sanaydigan kod — cheklovli terishning dasturdagi koʻrinishi
  const harXilKod = (n) => "soni = 0\nfor a in range(1, " + n + "):\n    for b in range(" + n + "):\n        if a != b:\n            soni += 1\nprint(soni)";

  function kodTask(r, prev, tier) {
    const rr = r || Math.random;
    const t = tier == null ? 2 : Math.max(0, Math.min(2, tier));
    return pickNew((rnd) => {
      if (t === 2 && rnd() < 0.4) {
        // a — birinchi raqam (0 emas): n − 1 xil; b — ikkinchi (a dan boshqa): n − 1 xil
        const n = int(rnd, 4, 10);
        const javob = S.kopaytir([n - 1, n - 1]);
        return { id: "kod:harxil:" + n, tur: "natija", type: "natija", code: harXilKod(n), solution: harXilKod(n),
          javob, hisob: (n - 1) + " × " + (n - 1) + " = " + javob };
      }
      if (rnd() < 0.5) {
        const n = int(rnd, 3, 7);
        return { id: "kod:fakt:" + n, tur: "natija", type: "natija", code: faktKod(n), solution: faktKod(n),
          javob: S.fakt(n), hisob: n + "! = " + S.fakt(n) };
      }
      const n = int(rnd, 4, 8);
      const k = int(rnd, 2, 3);
      return { id: "kod:orin:" + n + ":" + k, tur: "natija", type: "natija", code: orinKod(n, k), solution: orinKod(n, k),
        javob: S.A(n, k), hisob: "A(" + n + "," + k + ") = " + S.A(n, k) };
    }, prev, rr);
  }

  const WRITE = [
    {
      id: "fakt",
      what: "fakt(n) — n! ni qaytar (1 × 2 × … × n). n = 0 uchun 1.",
      solution: "def fakt(n):\n    k = 1\n    for i in range(1, n + 1):\n        k = k * i\n    return k",
      tail: "print(fakt(int(input())))",
      tests: [["5"], ["0"], ["1"], ["10"], ["20"]],
    },
    {
      id: "orin",
      what: "orin(n, k) — n tadan k tasini tartib bilan tanlash usullari soni: n × (n−1) × … (k ta koʻpaytuvchi).",
      solution: "def orin(n, k):\n    natija = 1\n    for i in range(k):\n        natija = natija * (n - i)\n    return natija",
      tail: "print(orin(int(input()), int(input())))",
      tests: [["5", "3"], ["9", "2"], ["4", "4"], ["7", "1"], ["6", "0"]],
    },
    // ---- 2026-10-02: ikki yangi masala (zina 1–2) ----
    {
      id: "takrorli", tier: 1,
      what: "takrorli(n, k) — n ta harfli soʻzda bitta harf k marta uchraydi, qolgan harflari har xil (masalan «ANORA»: n = 5, A harfi k = 2 marta). Harflar oʻrnini almashtirib nechta HAR XIL yozuv chiqadi? Javob: n! ÷ k! — shuni qaytar.",
      solution: "def takrorli(n, k):\n    natija = 1\n    for i in range(k + 1, n + 1):\n        natija = natija * i\n    return natija",
      tail: "print(takrorli(int(input()), int(input())))",
      tests: [["4", "2"], ["5", "1"], ["3", "3"], ["6", "2"], ["10", "4"], ["20", "18"]],
    },
    {
      id: "harxil-sonlar", tier: 2,
      what: "harxil(k) — raqamlari har xil boʻlgan k xonali sonlar nechta (0 bilan boshlanmaydi; 1 ≤ k ≤ 10)? Birinchi oʻringa 9 xil, keyin 9, 8, 7 …",
      solution: "def harxil(k):\n    natija = 9\n    for i in range(k - 1):\n        natija = natija * (9 - i)\n    return natija",
      tail: "print(harxil(int(input())))",
      tests: [["1"], ["2"], ["3"], ["4"], ["10"]],
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

  // n! juda tez o'sadi — 40-o'yindagi o'lchov shu yerda davom etadi
  const OSISH = [3, 5, 8, 10, 15, 20, 23].map((n) => ({ n, qiymat: S.fakt(n) }));

  // Hamma tartibni yozib chiqadigan dastur necha qadam qiladi (kichik n da o'lchanadi)
  function olchaTartib(n) {
    const kod = "a = [" + Array.from({ length: n }, (_, i) => i + 1).join(", ") + "]\nsoni = 0\n"
      + Array.from({ length: n }, (_, i) => "    ".repeat(i) + "for i" + i + " in range(" + n + "):").join("\n") + "\n"
      + "    ".repeat(n) + "soni += 1\nprint(soni)";
    const r = py.run(kod, { maxSteps: 3000000 });
    return { qadam: r.steps, xato: r.error };
  }

  const api = { BOLALAR, qadamlar, tartiblar, FAKT_SAVOL, ORIN_SAVOL, WRITE, OSISH,
    faktKod, orinKod, harXilKod, faktTask, orinTask, kodTask, writeTask, olchaTartib };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

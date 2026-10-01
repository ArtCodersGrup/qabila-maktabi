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

  // ---------- 1-bosqich: n! ----------
  // Qatorga terish: birinchi o'ringa n xil, keyingisiga n−1 xil … — ko'paytirish qoidasi
  const qadamlar = (n) => Array.from({ length: n }, (_, k) => n - k);
  const tartiblar = (n) => S.tartiblar(BOLALAR.slice(0, n));

  const FAKT_SAVOL = [
    (r) => { const n = int(r, 3, 7); return { n, matn: n + " ta bola bitta qatorga turadi. Nechta xil tartib bor?" }; },
    (r) => { const n = int(r, 3, 6); return { n, matn: n + " ta kitobni javonga terish kerak. Nechta usul bor?" }; },
    (r) => { const n = int(r, 3, 6); return { n, matn: n + " ta rasm devorga yonma-yon osiladi. Nechta tartib bor?" }; },
    (r) => { const n = int(r, 4, 7); return { n, matn: n + " ta harfdan (hammasi har xil) nechta soʻz yasash mumkin?" }; },
  ];

  function faktTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = pick(FAKT_SAVOL, rnd)(rnd);
      return { id: "fakt:" + s.matn, tur: "fakt", n: s.n, matn: s.matn, javob: S.fakt(s.n),
        hisob: qadamlar(s.n).join(" × ") + " = " + s.n + "! = " + S.fakt(s.n),
        nega: "Birinchi oʻringa " + s.n + " xil, keyingisiga " + (s.n - 1) + " xil … oxirgisiga 1 xil." };
    }, prev, rr);
  }

  // ---------- 2-bosqich: A(n,k) ----------
  const ORIN_SAVOL = [
    (r) => { const n = int(r, 5, 9); return { n, k: 3, matn: n + " ta yuguruvchidan oltin, kumush va bronza medal kimga tegadi? Nechta xil natija?" }; },
    (r) => { const n = int(r, 4, 8), k = int(r, 2, 3); return { n, k, matn: n + " ta boladan " + k + " tasi sahnaga " + (k === 2 ? "birinchi va ikkinchi" : "birinchi, ikkinchi va uchinchi") + " boʻlib chiqadi. Nechta usul?" }; },
    (r) => { const n = int(r, 5, 9), k = 2; return { n, k, matn: n + " ta kitobdan 2 tasi tanlanib, biri yuqoriga, biri pastga qoʻyiladi. Nechta usul?" }; },
    (r) => { const n = int(r, 4, 7); return { n, k: n, matn: n + " ta bolaning hammasi qatorga turadi. Nechta tartib?" }; },
  ];

  function orinTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const s = pick(ORIN_SAVOL, rnd)(rnd);
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

  function kodTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
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
  ];

  function writeTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const w = pick(WRITE, rnd);
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
    faktKod, orinKod, faktTask, orinTask, kodTask, writeTask, olchaTartib };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

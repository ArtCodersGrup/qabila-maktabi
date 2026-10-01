// 43-o'yin: birikma C(n,k) — tartib MUHIM EMAS. Blokning eng muhim savoli: A mi, C mi?
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

  const BOLALAR = ["Anvar", "Dilnoza", "Sardor", "Malika", "Jasur"];

  // ---------- 1-bosqich: bir xil jamoa necha marta takrorlandi ----------
  // A(n,k) ta tartib ichida har jamoa k! marta uchraydi — shundan C = A / k!
  const jamoalar = (n, k) => S.tanlovlar(BOLALAR.slice(0, n), k);
  const tartiblar = (n, k) => S.orinlar(BOLALAR.slice(0, n), k);

  // Bitta jamoaning hamma tartiblari (nega k! ga bo'linishini ko'rsatadi)
  const takrorlar = (jamoa) => S.tartiblar(jamoa);

  function bolish(n, k) {
    return { a: S.A(n, k), kfakt: S.fakt(k), c: S.C(n, k) };
  }

  // ---------- 2-bosqich: tartib muhimmi? ----------
  // Har savolda ikkala javob ham bor: to'g'risi va "boshqa qoida" natijasi
  const HOLATLAR = [
    { tur: "c", matn: (n, k) => n + " ta boladan " + k + " kishilik jamoa tuziladi. Nechta xil jamoa?", nk: [[5, 3], [6, 3], [7, 2], [8, 3]] },
    { tur: "a", matn: (n, k) => n + " ta boladan " + k + " tasi birinchi, ikkinchi va uchinchi oʻrinni egalladi. Nechta natija?", nk: [[5, 3], [6, 3], [7, 3]] },
    { tur: "c", matn: (n, k) => n + " ta nuqtadan " + k + " tasi chiziq bilan tutashtiriladi. Nechta chiziq?", nk: [[5, 2], [6, 2], [8, 2], [10, 2]] },
    { tur: "a", matn: (n, k) => n + " ta kitobdan " + k + " tasi olinib, biri menga, biri senga beriladi. Nechta usul?", nk: [[5, 2], [7, 2], [9, 2]] },
    { tur: "c", matn: (n, k) => n + " xil mevadan " + k + " tasi bitta likopchaga solinadi. Nechta xil likopcha?", nk: [[6, 2], [6, 3], [7, 3]] },
    { tur: "a", matn: (n, k) => n + " ta bayroqdan " + k + " tasi ustunga yuqoridan pastga osiladi. Nechta koʻrinish?", nk: [[5, 2], [6, 3], [7, 2]] },
    { tur: "c", matn: (n, k) => n + " ta oʻquvchidan " + k + " tasi navbatchilikka tanlanadi (hammasi teng). Nechta usul?", nk: [[6, 2], [7, 3], [9, 2]] },
  ];

  function tartibTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const h = pick(HOLATLAR, rnd);
      const [n, k] = pick(h.nk, rnd);
      const c = S.C(n, k);
      const a = S.A(n, k);
      if (a === c) return null; // k = 1: ikki qoida bir xil javob beradi, savolning maʼnosi yoʻq
      return {
        id: "tartib:" + h.tur + ":" + n + ":" + k, tur: "tartib", qoida: h.tur, n, k,
        matn: h.matn(n, k), javob: h.tur === "c" ? c : a, xato: h.tur === "c" ? a : c,
        hisob: h.tur === "c"
          ? "C(" + n + "," + k + ") = " + a + " ÷ " + S.fakt(k) + " = " + c
          : "A(" + n + "," + k + ") = " + a,
        nega: h.tur === "c"
          ? "Tartib muhim emas: bir xil tanlovning " + k + "! = " + S.fakt(k) + " ta tartibi — bitta javob."
          : "Tartib muhim: oʻrinlar har xil, shuning uchun boʻlinmaydi.",
      };
    }, prev, rr);
  }

  // ---------- 3-bosqich: kod ----------
  // i < j < k — "tartib muhim emas" ni kod shunday yozadi
  const juftKod = (n) => "soni = 0\nfor i in range(" + n + "):\n    for j in range(i + 1, " + n + "):\n        soni += 1\nprint(soni)";
  const uchKod = (n) => "soni = 0\nfor i in range(" + n + "):\n    for j in range(i + 1, " + n + "):\n        for k in range(j + 1, " + n + "):\n            soni += 1\nprint(soni)";

  function kodTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      if (rnd() < 0.5) {
        const n = int(rnd, 4, 9);
        return { id: "kod:juft:" + n, tur: "natija", type: "natija", code: juftKod(n), solution: juftKod(n),
          n, k: 2, javob: S.C(n, 2), hisob: "C(" + n + ",2) = " + S.C(n, 2) };
      }
      const n = int(rnd, 4, 7);
      return { id: "kod:uch:" + n, tur: "natija", type: "natija", code: uchKod(n), solution: uchKod(n),
        n, k: 3, javob: S.C(n, 3), hisob: "C(" + n + ",3) = " + S.C(n, 3) };
    }, prev, rr);
  }

  const WRITE = [
    {
      id: "tanla",
      what: "tanla(n, k) — n tadan k tasini tanlash usullari soni. Avval n × (n−1) × … (k ta), keyin k! ga boʻl.",
      solution: "def tanla(n, k):\n    natija = 1\n    for i in range(k):\n        natija = natija * (n - i)\n    for i in range(1, k + 1):\n        natija = natija // i\n    return natija",
      tail: "print(tanla(int(input()), int(input())))",
      tests: [["5", "3"], ["10", "2"], ["6", "0"], ["7", "7"], ["20", "10"]],
    },
    {
      id: "juftlar",
      what: "juftlar(n) — n ta nuqtadan nechta chiziq chiqadi? Ikki sikl bilan sana (j har doim i dan katta).",
      solution: "def juftlar(n):\n    soni = 0\n    for i in range(n):\n        for j in range(i + 1, n):\n            soni += 1\n    return soni",
      tail: "print(juftlar(int(input())))",
      tests: [["5"], ["2"], ["1"], ["10"]],
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

  // C(n,k) xossalari — 44-o'yindagi Paskal uchburchagiga tayyorgarlik
  const XOSSALAR = [
    { id: "simmetriya", matn: "C(n, k) = C(n, n−k)", izoh: "Tanlaganing ham, qolgani ham bitta jamoa" },
    { id: "chekka", matn: "C(n, 0) = C(n, n) = 1", izoh: "Hech kimni tanlamaslik ham — bitta usul" },
    { id: "bitta", matn: "C(n, 1) = n", izoh: "Bittasini tanlash — n xil" },
  ];

  const api = { BOLALAR, jamoalar, tartiblar, takrorlar, bolish, HOLATLAR, XOSSALAR, WRITE,
    juftKod, uchKod, tartibTask, kodTask, writeTask };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

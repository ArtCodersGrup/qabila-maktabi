// 48-o'yin: mantiq kodda — True/False, and, or, not (sof mantiq).
// Hamma qiymat talqinchining o'zida hisoblanadi (qo'lda yozilmaydi): tests/logic.test.js
(function (root) {
  "use strict";

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

  // Ifodaning qiymati — Pythonning o'zi hisoblaydi
  function qiymat(ifoda, ozgaruvchilar) {
    const bosh = Object.entries(ozgaruvchilar || {}).map(([k, v]) => k + " = " + v).join("\n");
    const r = py.run((bosh ? bosh + "\n" : "") + "print(" + ifoda + ")", { maxSteps: 20000 });
    if (r.error) return { xato: r.error.text };
    return { qiymat: r.out.trim() };
  }

  // Rostlik jadvali: a va b ning to'rt holati uchun ifoda qiymati
  function jadval(ifoda, nomlar) {
    const [a, b] = nomlar || ["a", "b"];
    const qatorlar = [];
    for (const av of [true, false]) {
      for (const bv of [true, false]) {
        const vars = {};
        vars[a] = av ? "True" : "False";
        if (ifoda.includes(b)) vars[b] = bv ? "True" : "False";
        const q = qiymat(ifoda, vars);
        qatorlar.push({ a: av, b: bv, natija: q.qiymat === "True" });
        if (!ifoda.includes(b)) break;
      }
    }
    return qatorlar;
  }

  // ---------- 1-bosqich: solishtirish True yoki False beradi ----------
  const AMALLAR = [">", "<", ">=", "<=", "==", "!="];

  function solishtirTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const a = int(rnd, 1, 20);
      const b = int(rnd, 1, 20);
      const amal = pick(AMALLAR, rnd);
      const ifoda = a + " " + amal + " " + b;
      const q = qiymat(ifoda);
      return { id: "sol:" + ifoda, tur: "solishtir", ifoda, javob: q.qiymat,
        matn: "print(" + ifoda + ") nima chiqaradi?",
        nega: amal === "==" ? "== — teng ekanini soʻraydi, qiymat bermaydi."
          : amal === "!=" ? "!= — teng emasligini soʻraydi."
          : "Solishtirish natijasi — har doim True yoki False." };
    }, prev, rr);
  }

  // ---------- 2-bosqich: and, or, not ----------
  const IFODALAR = [
    "a and b", "a or b", "not a", "a and not b", "not a or b", "not (a and b)", "not a and not b",
  ];

  function ifodaTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const ifoda = pick(IFODALAR, rnd);
      const av = rnd() < 0.5;
      const bv = rnd() < 0.5;
      const vars = { a: av ? "True" : "False" };
      if (ifoda.includes("b")) vars.b = bv ? "True" : "False";
      const q = qiymat(ifoda, vars);
      return { id: "if:" + ifoda + ":" + av + ":" + bv, tur: "ifoda", ifoda, vars, javob: q.qiymat,
        matn: ifoda + " — nimaga teng?",
        nega: "VA (and) — ikkalasi ham rost boʻlsa; YOKI (or) — kamida bittasi; EMAS (not) — teskarisi." };
    }, prev, rr);
  }

  // Hayotiy gap → qaysi amal kerak
  const GAPLAR = [
    { matn: "Kinoga kirish uchun yosh 12 dan katta BOʻLISHI va bilet boʻlishi kerak.", javob: "and" },
    { matn: "Chegirma bor: oʻquvchiga YOKI nafaqaxoʻrga.", javob: "or" },
    { matn: "Ertaga dam olish: shanba YOKI yakshanba.", javob: "or" },
    { matn: "Parol toʻgʻri boʻlsa VA hisob bloklanmagan boʻlsa — kirasan.", javob: "and" },
    { matn: "Yomgʻir yogʻmasa — sayrga chiqamiz.", javob: "not" },
    { matn: "Joy band EMAS boʻlsa, oʻtirish mumkin.", javob: "not" },
    { matn: "Oʻyinga kirish: aʼzo boʻlish va taklif boʻlishi shart.", javob: "and" },
  ];

  function gapTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const g = pick(GAPLAR, rnd);
      return Object.assign({ tur: "gap", id: "gap:" + g.matn }, g);
    }, prev, rr);
  }

  // ---------- 3-bosqich: shartni kodda yozish ----------
  const KOD = [
    { id: "ikki-shart", kod: "yosh = 14\nbilet = True\nprint(yosh >= 12 and bilet)" },
    { id: "oraliq", kod: "x = 7\nprint(x > 5 and x < 10)" },
    { id: "teskari", kod: "band = False\nprint(not band)" },
    { id: "yoki", kod: "kun = \"shanba\"\nprint(kun == \"shanba\" or kun == \"yakshanba\")" },
    { id: "juft", kod: "n = 9\nprint(n % 2 == 0 or n > 5)" },
  ];

  function kodTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const k = pick(KOD, rnd);
      return { id: "kod:" + k.id, tur: "natija", type: "natija", code: k.kod, solution: k.kod };
    }, prev, rr);
  }

  const WRITE = [
    {
      id: "mumkin",
      what: "mumkin(yosh, bilet) — yosh 12 dan kichik boʻlmasa VA bilet bor boʻlsa True qaytar.",
      solution: "def mumkin(yosh, bilet):\n    return yosh >= 12 and bilet",
      tail: "print(mumkin(int(input()), input() == \"ha\"))",
      tests: [["14", "ha"], ["11", "ha"], ["14", "yoq"], ["12", "ha"]],
    },
    {
      id: "oraliqda",
      what: "oraliqda(x) — x 10 dan katta VA 20 dan kichik boʻlsa True qaytar.",
      solution: "def oraliqda(x):\n    return x > 10 and x < 20",
      tail: "print(oraliqda(int(input())))",
      tests: [["15"], ["10"], ["20"], ["3"], ["19"]],
    },
    {
      id: "dam",
      what: "dam(kun) — kun «shanba» YOKI «yakshanba» boʻlsa True qaytar.",
      solution: "def dam(kun):\n    return kun == \"shanba\" or kun == \"yakshanba\"",
      tail: "print(dam(input()))",
      tests: [["shanba"], ["yakshanba"], ["dushanba"], ["juma"]],
    },
    {
      id: "toq",
      what: "toq(n) — n juft EMAS boʻlsa True qaytar (not bilan yoz).",
      solution: "def toq(n):\n    return not n % 2 == 0",
      tail: "print(toq(int(input())))",
      tests: [["7"], ["8"], ["0"], ["13"]],
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

  const api = { AMALLAR, IFODALAR, GAPLAR, KOD, WRITE, qiymat, jadval,
    solishtirTask, ifodaTask, gapTask, kodTask, writeTask };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

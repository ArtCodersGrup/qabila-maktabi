// 28-o'yin: savollarni yasash (sof mantiq, ekransiz).
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  const MAX = 200; // javob shundan oshmasin (QOIDALAR 4.3: bola yoddan hisoblay olsin)

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  const codeTask = (type, code, extra) => Object.assign({ id: type + ":" + code, type, code, solution: code }, extra);

  // ---------- 1-bosqich: //, % va / ----------
  function divisionTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const b = int(rnd, 2, 9);
      const a = int(rnd, b + 1, 99);
      const op = pick(["//", "%", "/"], rnd);
      // "/" da javob juda uzun kasr bo'lmasin: bir xonali kasrgacha
      if (op === "/" && (a * 10) % b !== 0) return null;
      return codeTask("natija", "print(" + a + " " + op + " " + b + ")", { op, a, b });
    }, prev, rr);
  }

  // ---------- 2-bosqich: amallar tartibi ----------
  const SHAPES = [
    (rnd) => {
      const a = int(rnd, 2, 9), b = int(rnd, 2, 9), c = int(rnd, 2, 9);
      return { text: a + " + " + b + " * " + c, hint: "avval koʻpaytirish" };
    },
    (rnd) => {
      const a = int(rnd, 2, 9), b = int(rnd, 2, 9), c = int(rnd, 2, 9);
      return { text: "(" + a + " + " + b + ") * " + c, hint: "avval qavs" };
    },
    (rnd) => {
      const a = int(rnd, 20, 99), b = int(rnd, 2, 9), c = int(rnd, 2, 9);
      return { text: a + " - " + b + " * " + c, hint: "avval koʻpaytirish" };
    },
    (rnd) => {
      const a = int(rnd, 20, 99), b = int(rnd, 2, 9), c = int(rnd, 2, 9);
      return { text: a + " // " + b + " + " + c, hint: "avval butun boʻlinma" };
    },
    (rnd) => {
      const a = int(rnd, 20, 99), b = int(rnd, 2, 9), c = int(rnd, 2, 9);
      return { text: a + " % " + b + " * " + c, hint: "% va * chapdan oʻngga" };
    },
    (rnd) => {
      const a = int(rnd, 2, 5), b = int(rnd, 2, 3), c = int(rnd, 2, 9);
      return { text: a + " ** " + b + " + " + c, hint: "avval daraja" };
    },
    (rnd) => {
      const a = int(rnd, 2, 9), b = int(rnd, 2, 9), c = int(rnd, 2, 9);
      return { text: a + " * " + b + " - " + c + " * " + int(rnd, 2, 9), hint: "ikkala koʻpaytirish avval" };
    },
  ];

  function orderTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const shape = pick(SHAPES, rnd)(rnd);
      const code = "print(" + shape.text + ")";
      const result = py.run(code);
      if (result.error) return null;
      const value = Number(result.output[0]);
      if (!Number.isInteger(value) || value < 0 || value > MAX) return null;
      return codeTask("natija", code, { hint: shape.hint });
    }, prev, rr);
  }

  // ---------- 3-bosqich: hisoblaydigan dastur ----------
  // Matn va sonni + bilan qo'shish — eng ko'p uchraydigan xato
  function fixTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const a = int(rnd, 20, 99);
      const b = int(rnd, 2, 9);
      const op = pick(["//", "%"], rnd);
      const label = op === "//" ? "nechtadan" : "ortgani";
      const good = "x = " + a + " " + op + " " + b + '\nprint("' + label + ':", x)';
      const bad = "x = " + a + " " + op + " " + b + '\nprint("' + label + ': " + x)';
      return { id: "xato:" + bad, type: "xato-top", code: bad, solution: good, why: "matn va sonni + bilan qoʻshib boʻlmaydi" };
    }, prev, rr);
  }

  const WRITE_KINDS = [
    {
      id: "oxirgi-raqam",
      what: "Bitta son kiritiladi. Uning oxirgi raqamini chiqar.",
      solution: "n = int(input())\nprint(n % 10)",
      tests: [["7"], ["42"], ["1305"]],
    },
    {
      id: "soat-daqiqa",
      what: "Daqiqalar soni kiritiladi. Necha soat va necha daqiqa ekanini shu tartibda ikki satrda chiqar.",
      solution: "n = int(input())\nprint(n // 60)\nprint(n % 60)",
      tests: [["135"], ["59"], ["600"]],
    },
    {
      id: "bolinma-qoldiq",
      what: "Ikkita son kiritiladi. Birinchisini ikkinchisiga boʻlgandagi butun qismini va qoldigʻini shu tartibda chiqar.",
      solution: "a = int(input())\nb = int(input())\nprint(a // b)\nprint(a % b)",
      tests: [["17", "5"], ["100", "7"], ["9", "3"]],
    },
    {
      id: "kvadrat",
      what: "Bitta son kiritiladi. Uning kvadratini va kubini shu tartibda chiqar.",
      solution: "n = int(input())\nprint(n ** 2)\nprint(n ** 3)",
      tests: [["3"], ["12"], ["25"]],
    },
  ];

  function writeTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const kind = pick(WRITE_KINDS, rnd);
      return {
        id: "yoz:" + kind.id,
        type: "kod-yoz",
        what: kind.what,
        solution: kind.solution,
        tests: kind.tests.map((stdin) => ({ stdin })),
      };
    }, prev, rr);
  }

  function stage3Task(r, prev) {
    const rr = r || Math.random;
    const wantWrite = prev ? prev.type !== "kod-yoz" : rr() < 0.5;
    return wantWrite ? writeTask(rr, prev) : fixTask(rr, prev);
  }

  const api = { MAX, SHAPES, WRITE_KINDS, divisionTask, orderTask, fixTask, writeTask, stage3Task };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

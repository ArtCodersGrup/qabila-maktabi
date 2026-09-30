// 29-o'yin: savollarni yasash (sof mantiq, ekransiz).
// Dasturlar faqat butun sonlar bilan ishlaydi — kuzatuv jadvalida qo'shtirnoq chiqmasin.
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const NAMES = ["Anvar", "Dilnoza", "Sardor", "Malika", "Jasur", "Zilola"];
  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  // Qiymatlar shu oraliqdan chiqmasin — bola yoddan hisoblay olsin (QOIDALAR 4.3)
  const LOW = 0;
  const HIGH = 200;

  // Bir xil savol ketma-ket ikki marta chiqmaydi
  function pickNew(make, prev, r) {
    for (let k = 0; k < 30; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  // Ikki qutili dastur: a va b butun sonlar
  const STEPS = [
    (r) => ({ code: "a = a + " + int(r, 2, 9) }),
    (r) => ({ code: "a += " + int(r, 2, 9) }),
    (r) => ({ code: "b = b + " + int(r, 2, 9) }),
    (r) => ({ code: "a = a * " + int(r, 2, 3) }),
    (r) => ({ code: "b = b * " + int(r, 2, 3) }),
    (r) => ({ code: "a = a + b" }),
    (r) => ({ code: "b = a + b" }),
    (r) => ({ code: "b = a - b" }),
    (r) => ({ code: "a = b" }),
  ];

  // Dastur yasaydi va uni bajarib, qiymatlar chegaradan chiqmaganini tekshiradi
  function program(r, stepCount) {
    const lines = ["a = " + int(r, 2, 9), "b = " + int(r, 2, 9)];
    for (let k = 0; k < stepCount; k++) lines.push(pick(STEPS, r)(r).code);
    const code = lines.join("\n");
    const trace = py.trace(code);
    if (trace.error) return null;
    for (const state of trace.states) {
      for (const value of Object.values(state.vars)) {
        const n = Number(value);
        if (!Number.isInteger(n) || n < LOW || n > HIGH) return null;
      }
    }
    // Oxirgi qadamda hech nima o'zgarmasa (a = b kabi), savol zerikarli bo'ladi
    const last = trace.states[trace.states.length - 1].vars;
    const before = trace.states[trace.states.length - 2].vars;
    if (last.a === before.a && last.b === before.b) return null;
    return { code, trace };
  }

  // ---------- 1-bosqich: dastur nima chiqaradi ----------
  function resultTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const made = program(rnd, int(rnd, 1, 3));
      if (!made) return null;
      const tail = rnd() < 0.5 ? "print(a)" : "print(a, b)";
      const code = made.code + "\n" + tail;
      return { id: "natija:" + code, type: "natija", code, solution: code };
    }, prev, rr);
  }

  // ---------- 2-bosqich: kuzatuv jadvali ----------
  // rows: har bajarilgan satr uchun bir qator — buyruq matni va qutilardagi qiymatlar
  function traceRows(code) {
    const lines = code.split("\n");
    const states = py.trace(code).states;
    return states.map((state) => ({
      line: state.line,
      text: lines[state.line - 1],
      values: { a: state.vars.a === undefined ? null : state.vars.a, b: state.vars.b === undefined ? null : state.vars.b },
    }));
  }

  function traceTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const made = program(rnd, int(rnd, 2, 3));
      if (!made) return null;
      return { id: "kuzatuv:" + made.code, type: "kuzatuv", code: made.code, vars: ["a", "b"], rows: traceRows(made.code) };
    }, prev, rr);
  }

  // Almashtirish: uchinchi quti orqali va Pythonning qisqa yo'li
  const SWAP_LONG = "a = 3\nb = 8\nc = a\na = b\nb = c";
  const SWAP_SHORT = "a = 3\nb = 8\na, b = b, a";

  // ---------- 3-bosqich: input va turlar ----------
  const INPUT_KINDS = [
    (rnd) => {
      const name = pick(NAMES, rnd);
      return { code: 'ism = input()\nprint("Salom,", ism)\nprint(len(ism))', stdin: [name] };
    },
    (rnd) => {
      const n = int(rnd, 3, 20);
      return { code: "n = int(input())\nn = n * 2\nprint(n)", stdin: [String(n)] };
    },
    (rnd) => {
      const a = int(rnd, 2, 30);
      const b = int(rnd, 2, 30);
      return { code: "a = int(input())\nb = int(input())\nprint(a + b, a * b)", stdin: [String(a), String(b)] };
    },
    (rnd) => {
      const s = String(int(rnd, 2, 9));
      return { code: 'x = input()\nprint(x + x)\nprint(int(x) + int(x))', stdin: [s] };
    },
  ];

  function inputResultTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const made = pick(INPUT_KINDS, rnd)(rnd);
      return { id: "kirish:" + made.code + "|" + made.stdin.join(","), type: "natija", code: made.code, stdin: made.stdin, solution: made.code };
    }, prev, rr);
  }

  // Kod yozish: ikki sonni o'qib, amal bajarish
  const WRITE_KINDS = [
    { what: "yigʻindisini", op: "+" },
    { what: "koʻpaytmasini", op: "*" },
    { what: "ayirmasini (birinchidan ikkinchisini)", op: "-" },
  ];

  function writeTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const kind = pick(WRITE_KINDS, rnd);
      const pairs = [[7, 3], [12, 5], [20, 8]];
      return {
        id: "yoz:" + kind.op,
        type: "kod-yoz",
        what: "Ikkita son kiritiladi. Ularning " + kind.what + " chiqar.",
        solution: "a = int(input())\nb = int(input())\nprint(a " + kind.op + " b)",
        tests: pairs.map(([a, b]) => ({ stdin: [String(a), String(b)] })),
      };
    }, prev, rr);
  }

  // 3-bosqichda ikki xil savol navbat bilan
  function stage3Task(r, prev) {
    const rr = r || Math.random;
    const wantWrite = prev ? prev.type !== "kod-yoz" : rr() < 0.5;
    return wantWrite ? writeTask(rr, prev) : inputResultTask(rr, prev);
  }

  const api = {
    NAMES, STEPS, SWAP_LONG, SWAP_SHORT, LOW, HIGH,
    program, traceRows, resultTask, traceTask, inputResultTask, writeTask, stage3Task,
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

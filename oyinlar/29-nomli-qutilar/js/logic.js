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

  // Qiyinlik zinasi (QOIDALAR 4.3): 0 — birinchi javoblar, 1 — o'rta, 2 — oxirgi va qiyin rejim.
  // Zina berilmasa (testlar) — eng qiyini.
  const zina = (tier) => (tier == null ? 2 : Math.max(0, Math.min(2, tier)));

  function zinadan(list, tier, rnd) {
    if (tier == null) return pick(list, rnd);
    const t = zina(tier);
    const mos = list.filter((x) => (x.tier || 0) <= t);
    const ayni = mos.filter((x) => (x.tier || 0) === t);
    return ayni.length && rnd() < 0.6 ? pick(ayni, rnd) : pick(mos, rnd);
  }

  // Dasturdagi qadamlar soni zina bilan o'sadi (2026-10-02; oldin 1–3 va 2–3 edi)
  const NATIJA_QADAM = [[1, 2], [2, 3], [3, 4]];
  const KUZATUV_QADAM = [[2, 3], [3, 4], [4, 5]];

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
    // 2026-10-02: ayirish, kamaytirish va almashtirish — kuzatuvda eng ko'p adashiladigan qadamlar
    (r) => ({ code: "a = a - b" }),
    (r) => ({ code: "b -= " + int(r, 1, 3) }),
    (r) => ({ code: "a, b = b, a" }),
    (r) => ({ code: "a = a * b" }),
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
  function resultTask(r, prev, tier) {
    const rr = r || Math.random;
    const [kam, kop] = NATIJA_QADAM[zina(tier)];
    return pickNew((rnd) => {
      const made = program(rnd, int(rnd, kam, kop));
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

  function traceTask(r, prev, tier) {
    const rr = r || Math.random;
    const [kam, kop] = KUZATUV_QADAM[zina(tier)];
    return pickNew((rnd) => {
      const made = program(rnd, int(rnd, kam, kop));
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
  // ---- 2026-10-02: ikki kirishli, tur aralash savollar (zina 1–2) ----
  const kirish = (tier, fn) => Object.assign(fn, { tier });
  INPUT_KINDS.push(
    kirish(1, (rnd) => {
      const a = String(int(rnd, 2, 30));
      const b = String(int(rnd, 2, 30));
      return { code: "a = input()\nb = input()\nprint(a + b)\nprint(int(a) + int(b))", stdin: [a, b] };
    }),
    kirish(1, (rnd) => {
      const n = int(rnd, 3, 12);
      return { code: "n = int(input())\nm = n\nn = n + 5\nprint(m, n)", stdin: [String(n)] };
    }),
    kirish(2, (rnd) => {
      const a = int(rnd, 2, 9);
      const b = int(rnd, 2, 9);
      return { code: "a = int(input())\nb = int(input())\na, b = b, a + b\nprint(a, b)\nprint(str(a) + str(b))", stdin: [String(a), String(b)] };
    }),
    kirish(2, (rnd) => {
      const s = String(int(rnd, 11, 99));
      return { code: "x = input()\ny = int(x) * 2\nprint(x * 2)\nprint(y)\nprint(len(x) + len(str(y)))", stdin: [s] };
    }),
  );

  function inputResultTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const made = zinadan(INPUT_KINDS, tier, rnd)(rnd);
      return { id: "kirish:" + made.code + "|" + made.stdin.join(","), type: "natija", code: made.code, stdin: made.stdin, solution: made.code };
    }, prev, rr);
  }

  // Kod yozish: ikki sonni o'qib, amal bajarish.
  // 2026-10-02: test juftliklariga nol va manfiy son qo'shildi ([0, 0], [-4, 9]); yangi masalalar (zina 1–2).
  const PAIRS = [[7, 3], [12, 5], [20, 8], [0, 0], [-4, 9]];
  const juftTest = PAIRS.map(([a, b]) => [String(a), String(b)]);
  const amal = (id, what, op) => ({
    id, tier: 0, what: "Ikkita son kiritiladi. Ularning " + what + " chiqar.",
    solution: "a = int(input())\nb = int(input())\nprint(a " + op + " b)", tests: juftTest,
  });
  const WRITE_KINDS = [
    amal("+", "yigʻindisini", "+"),
    amal("*", "koʻpaytmasini", "*"),
    amal("-", "ayirmasini (birinchidan ikkinchisini)", "-"),
    {
      id: "almashtir", tier: 1,
      what: "Ikkita son kiritiladi. Ularni teskari tartibda chiqar: avval ikkinchisini, keyin birinchisini (har biri alohida satrda).",
      solution: "a = int(input())\nb = int(input())\na, b = b, a\nprint(a)\nprint(b)",
      tests: juftTest,
    },
    {
      id: "uch-amal", tier: 1,
      what: "Ikkita son kiritiladi. Uch satrda chiqar: yigʻindisi, ayirmasi (birinchidan ikkinchisini) va koʻpaytmasi.",
      solution: "a = int(input())\nb = int(input())\nprint(a + b)\nprint(a - b)\nprint(a * b)",
      tests: juftTest,
    },
    {
      id: "daqiqa", tier: 2,
      what: "Ikkita son kiritiladi: soat va daqiqa. Jami necha daqiqa ekanini chiqar (masalan 2 soat 15 daqiqa → 135).",
      solution: "soat = int(input())\ndaqiqa = int(input())\nprint(soat * 60 + daqiqa)",
      tests: [["2", "15"], ["0", "45"], ["1", "0"], ["10", "59"]],
    },
    {
      id: "yosh", tier: 2,
      what: "Ism va tugʻilgan yil kiritiladi (ikki satrda). «Ism 2026-yilda N yoshda» koʻrinishida chiqar (masalan: Anvar 2026-yilda 13 yoshda).",
      solution: "ism = input()\nyil = int(input())\nprint(ism, \"2026-yilda\", 2026 - yil, \"yoshda\")",
      tests: [["Anvar", "2013"], ["Dilnoza", "2010"], ["Jasur", "2026"], ["Malika", "1999"]],
    },
  ];

  function writeTask(r, prev, tier) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const kind = zinadan(WRITE_KINDS, tier, rnd);
      return {
        id: "yoz:" + kind.id,
        type: "kod-yoz",
        what: kind.what,
        solution: kind.solution,
        tests: kind.tests.map((stdin) => ({ stdin })),
      };
    }, prev, rr);
  }

  // 3-bosqichda ikki xil savol navbat bilan
  function stage3Task(r, prev, tier) {
    const rr = r || Math.random;
    const wantWrite = prev ? prev.type !== "kod-yoz" : rr() < 0.5;
    return wantWrite ? writeTask(rr, prev, tier) : inputResultTask(rr, prev, tier);
  }

  const api = {
    NAMES, STEPS, SWAP_LONG, SWAP_SHORT, LOW, HIGH, INPUT_KINDS, WRITE_KINDS, NATIJA_QADAM, KUZATUV_QADAM,
    program, traceRows, resultTask, traceTask, inputResultTask, writeTask, stage3Task,
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

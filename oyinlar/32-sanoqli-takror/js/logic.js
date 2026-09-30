// 32-o'yin: savollarni yasash (sof mantiq, ekransiz).
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  const MAX_LINES = 8;
  const WORDS = ["qabila", "python", "maktab", "daftar", "quyosh", "kitob"];

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  const codeTask = (type, code, extra) => Object.assign({ id: type + ":" + code, type, code, solution: code }, extra);

  function safe(code, maxLines) {
    const r = py.run(code, { maxSteps: 100000 });
    if (r.error) return null;
    if (r.output.length === 0 || r.output.length > (maxLines || MAX_LINES)) return null;
    return r;
  }

  // ---------- 1-bosqich: range(n) ----------
  const SIMPLE = [
    (rnd) => "for i in range(" + int(rnd, 3, 6) + "):\n    print(i)",
    (rnd) => "for i in range(" + int(rnd, 3, 5) + "):\n    print(i * " + int(rnd, 2, 5) + ")",
    (rnd) => "for i in range(" + int(rnd, 3, 5) + "):\n    print(i + " + int(rnd, 1, 9) + ")",
    (rnd) => 'for i in range(' + int(rnd, 2, 4) + '):\n    print("' + pick(WORDS, rnd) + '")',
  ];

  function rangeTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const code = pick(SIMPLE, rnd)(rnd);
      return safe(code) ? codeTask("natija", code, { kind: "range" }) : null;
    }, prev, rr);
  }

  // ---------- 2-bosqich: chegaralar, qadam va satr bo'ylab ----------
  const BOUNDS = [
    (rnd) => {
      const a = int(rnd, 1, 4);
      return "for i in range(" + a + ", " + (a + int(rnd, 3, 5)) + "):\n    print(i)";
    },
    (rnd) => {
      const a = int(rnd, 0, 3);
      const step = int(rnd, 2, 3);
      return "for i in range(" + a + ", " + (a + step * int(rnd, 3, 5)) + ", " + step + "):\n    print(i)";
    },
    (rnd) => {
      const a = int(rnd, 6, 12);
      return "for i in range(" + a + ", 0, -" + int(rnd, 2, 3) + "):\n    print(i)";
    },
    (rnd) => {
      const word = pick(WORDS, rnd);
      return 'for harf in "' + word + '":\n    print(harf)';
    },
    (rnd) => {
      const n = int(rnd, 4, 9);
      return "soni = 0\nfor i in range(" + n + "):\n    soni += 1\nprint(soni)";
    },
  ];

  function boundTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const code = pick(BOUNDS, rnd)(rnd);
      return safe(code) ? codeTask("natija", code, { kind: "chegara" }) : null;
    }, prev, rr);
  }

  // ---------- 3-bosqich: ichma-ich sikl va naqsh ----------
  const NESTED = [
    (rnd) => {
      const n = int(rnd, 3, 5);
      return "for i in range(1, " + n + "):\n    print(\"*\" * i)";
    },
    (rnd) => {
      const n = int(rnd, 2, 4);
      const m = int(rnd, 2, 3);
      return "soni = 0\nfor i in range(" + n + "):\n    for j in range(" + m + "):\n        soni += 1\nprint(soni)";
    },
    (rnd) => {
      const n = int(rnd, 2, 4);
      return "for i in range(1, " + n + "):\n    for j in range(1, 3):\n        print(i, j)";
    },
    (rnd) => {
      const n = int(rnd, 3, 5);
      const k = int(rnd, 2, 4);
      return "for i in range(1, " + n + "):\n    print(" + k + " * i)";
    },
  ];

  function nestedTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const code = pick(NESTED, rnd)(rnd);
      return safe(code) ? codeTask("natija", code, { kind: "ichma-ich" }) : null;
    }, prev, rr);
  }

  const WRITE_KINDS = [
    {
      id: "jadval-qatori",
      what: "Bitta son kiritiladi. Shu sonning 1 dan 5 gacha koʻpaytmalarini har satrda bittadan chiqar.",
      solution: "n = int(input())\nfor i in range(1, 6):\n    print(n * i)",
      tests: [["3"], ["7"], ["1"], ["10"]],
    },
    {
      id: "uchburchak",
      what: "Bitta son kiritiladi. Shuncha satrli uchburchak chiz: birinchi satrda 1 ta yulduzcha, keyingisida 2 ta va hokazo.",
      solution: 'n = int(input())\nfor i in range(1, n + 1):\n    print("*" * i)',
      tests: [["4"], ["1"], ["6"], ["2"]],
    },
    {
      id: "oraliq-yigindi",
      what: "Ikkita son kiritiladi: a va b. a dan b gacha (ikkalasi ham kiradi) sonlar yigʻindisini chiqar.",
      solution: "a = int(input())\nb = int(input())\ns = 0\nfor i in range(a, b + 1):\n    s += i\nprint(s)",
      tests: [["1", "5"], ["3", "3"], ["10", "20"], ["0", "1"]],
    },
    {
      id: "unlilar",
      what: "Bitta soʻz kiritiladi. Unda nechta unli harf (a, e, i, o, u) borligini chiqar.",
      solution: 'soz = input()\nsoni = 0\nfor harf in soz:\n    if harf in "aeiou":\n        soni += 1\nprint(soni)',
      tests: [["qabila"], ["python"], ["aeiou"], ["kkk"]],
    },
    {
      id: "juftlar-soni",
      what: "Bitta son kiritiladi. 1 dan shu songacha (uning oʻzi ham kiradi) nechta juft son borligini chiqar.",
      solution: "n = int(input())\nsoni = 0\nfor i in range(1, n + 1):\n    if i % 2 == 0:\n        soni += 1\nprint(soni)",
      tests: [["10"], ["1"], ["7"], ["100"]],
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
    return wantWrite ? writeTask(rr, prev) : nestedTask(rr, prev);
  }

  const api = { MAX_LINES, WORDS, SIMPLE, BOUNDS, NESTED, WRITE_KINDS, rangeTask, boundTask, nestedTask, writeTask, stage3Task };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

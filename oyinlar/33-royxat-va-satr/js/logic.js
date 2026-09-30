// 33-o'yin: savollarni yasash (sof mantiq, ekransiz).
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  const MAX_LINES = 6;
  const WORDS = ["qabila", "python", "maktab", "daftar", "quyosh", "kitob", "dastur"];

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  const codeTask = (type, code, extra) => Object.assign({ id: type + ":" + code, type, code, solution: code }, extra);

  function safe(code, stdin, maxLines) {
    const r = py.run(code, { stdin, maxSteps: 100000 });
    if (r.error) return null;
    if (r.output.length === 0 || r.output.length > (maxLines || MAX_LINES)) return null;
    return r;
  }

  // Tasodifiy kichik ro'yxat: 3–5 ta son, 1–20 oralig'ida, takrorlanmaydi
  function numbers(rnd, count) {
    const n = count || int(rnd, 3, 5);
    const out = [];
    while (out.length < n) {
      const v = int(rnd, 1, 20);
      if (!out.includes(v)) out.push(v);
    }
    return out;
  }

  const listLiteral = (nums) => "[" + nums.join(", ") + "]";

  // ---------- 1-bosqich: indeks, len, append ----------
  const BASIC = [
    (rnd) => {
      const nums = numbers(rnd);
      return "a = " + listLiteral(nums) + "\nprint(a[0], a[" + (nums.length - 1) + "], len(a))";
    },
    (rnd) => {
      const nums = numbers(rnd);
      return "a = " + listLiteral(nums) + "\nprint(a[-1], a[-2])";
    },
    (rnd) => {
      const nums = numbers(rnd);
      const k = int(rnd, 0, nums.length - 1);
      return "a = " + listLiteral(nums) + "\na[" + k + "] = " + int(rnd, 21, 40) + "\nprint(a)";
    },
    (rnd) => {
      const nums = numbers(rnd, 3);
      return "a = " + listLiteral(nums) + "\na.append(" + int(rnd, 21, 40) + ")\nprint(a, len(a))";
    },
    (rnd) => {
      const nums = numbers(rnd);
      return "a = " + listLiteral(nums) + "\nprint(sum(a), max(a), min(a))";
    },
  ];

  function listTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const code = pick(BASIC, rnd)(rnd);
      return safe(code) ? codeTask("natija", code, { kind: "royxat" }) : null;
    }, prev, rr);
  }

  // ---------- 2-bosqich: bo'ylab yurish va kesish ----------
  const WALK = [
    (rnd) => {
      const nums = numbers(rnd);
      return "a = " + listLiteral(nums) + "\ns = 0\nfor x in a:\n    s += x\nprint(s)";
    },
    (rnd) => {
      const nums = numbers(rnd);
      return "a = " + listLiteral(nums) + "\nbest = a[0]\nfor x in a:\n    if x > best:\n        best = x\nprint(best)";
    },
    (rnd) => {
      const nums = numbers(rnd);
      return "a = " + listLiteral(nums) + "\nsoni = 0\nfor x in a:\n    if x % 2 == 0:\n        soni += 1\nprint(soni)";
    },
    (rnd) => {
      const nums = numbers(rnd, 5);
      const from = int(rnd, 0, 2);
      return "a = " + listLiteral(nums) + "\nprint(a[" + from + ":" + (from + 2) + "])";
    },
    (rnd) => {
      const nums = numbers(rnd, 4);
      return "a = " + listLiteral(nums) + "\nprint(a[:2], a[2:])";
    },
    (rnd) => {
      const nums = numbers(rnd, 4);
      return "a = " + listLiteral(nums) + "\nfor i in range(len(a)):\n    print(i, a[i])";
    },
  ];

  function walkTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const code = pick(WALK, rnd)(rnd);
      return safe(code) ? codeTask("natija", code, { kind: "boylab" }) : null;
    }, prev, rr);
  }

  // ---------- 3-bosqich: satr ----------
  const STRINGS = [
    (rnd) => {
      const w = pick(WORDS, rnd);
      return 's = "' + w + '"\nprint(s[0], s[-1], len(s))';
    },
    (rnd) => {
      const w = pick(WORDS, rnd);
      return 's = "' + w + '"\nprint(s[1:4], s[:3], s[3:])';
    },
    (rnd) => {
      const w = pick(WORDS, rnd);
      return 's = "' + w + '"\nsoni = 0\nfor harf in s:\n    if harf in "aeiou":\n        soni += 1\nprint(soni)';
    },
    (rnd) => {
      const w = pick(WORDS, rnd);
      return 's = "' + w + '"\nt = ""\nfor harf in s:\n    t = harf + t\nprint(t)';
    },
    (rnd) => {
      const w = pick(WORDS, rnd);
      return 's = "' + w + '"\nprint(s.upper(), s.count("a"))';
    },
  ];

  function stringTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const code = pick(STRINGS, rnd)(rnd);
      return safe(code) ? codeTask("natija", code, { kind: "satr" }) : null;
    }, prev, rr);
  }

  const WRITE_KINDS = [
    {
      id: "yigindi",
      what: "Bitta satrda bir nechta son kiritiladi (orasi boʻsh joy bilan). Ularning yigʻindisini chiqar.",
      solution: "a = input().split()\ns = 0\nfor x in a:\n    s += int(x)\nprint(s)",
      tests: [["3 5 7"], ["10"], ["1 1 1 1 1"], ["100 200"]],
    },
    {
      id: "eng-katta",
      what: "Bitta satrda bir nechta son kiritiladi. Eng kattasini chiqar.",
      solution: "a = input().split()\nbest = int(a[0])\nfor x in a:\n    if int(x) > best:\n        best = int(x)\nprint(best)",
      tests: [["3 9 5"], ["7"], ["10 2 8 4"], ["5 5 5"]],
    },
    {
      id: "juftlar",
      what: "Bitta satrda bir nechta son kiritiladi. Nechtasi juft ekanini chiqar.",
      solution: "a = input().split()\nsoni = 0\nfor x in a:\n    if int(x) % 2 == 0:\n        soni += 1\nprint(soni)",
      tests: [["1 2 3 4"], ["7"], ["2 4 6"], ["1 3 5"]],
    },
    {
      id: "teskari-soz",
      what: "Bitta soʻz kiritiladi. Uni teskari yozib chiqar.",
      solution: 'soz = input()\nt = ""\nfor harf in soz:\n    t = harf + t\nprint(t)',
      tests: [["qabila"], ["a"], ["python"], ["abba"]],
    },
    {
      id: "ikkinchi-katta",
      what: "Bitta satrda bir nechta har xil son kiritiladi. Ikkinchi eng kattasini chiqar.",
      solution: "a = input().split()\nb = []\nfor x in a:\n    b.append(int(x))\nb = sorted(b)\nprint(b[len(b) - 2])",
      tests: [["3 9 5"], ["10 2"], ["1 7 4 9 2"], ["100 50 75"]],
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
    return wantWrite ? writeTask(rr, prev) : stringTask(rr, prev);
  }

  const api = { MAX_LINES, WORDS, BASIC, WALK, STRINGS, WRITE_KINDS, numbers, listTask, walkTask, stringTask, writeTask, stage3Task };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

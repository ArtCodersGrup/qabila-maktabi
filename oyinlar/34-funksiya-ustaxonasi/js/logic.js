// 34-o'yin: savollarni yasash (sof mantiq, ekransiz).
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  const NAMES = ["Anvar", "Dilnoza", "Sardor", "Malika"];
  const MAX_LINES = 6;

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

  // ---------- 1-bosqich: chaqiruv va parametr ----------
  const CALLS = [
    (rnd) => {
      const n = int(rnd, 2, 4);
      return "def salom():\n    print(\"Salom!\")\n\n" + Array.from({ length: n }, () => "salom()").join("\n");
    },
    (rnd) => {
      const a = pick(NAMES, rnd);
      const b = pick(NAMES, rnd);
      return 'def salom(ism):\n    print("Salom,", ism)\n\nsalom("' + a + '")\nsalom("' + b + '")';
    },
    (rnd) => {
      const k = int(rnd, 2, 9);
      return "def kvadrat(n):\n    print(n * n)\n\nkvadrat(" + k + ")\nkvadrat(" + (k + 1) + ")";
    },
    (rnd) => {
      const a = int(rnd, 2, 9);
      const b = int(rnd, 2, 9);
      return "def qosh(a, b):\n    print(a + b)\n\nqosh(" + a + ", " + b + ")\nqosh(" + b + ", " + a + ")";
    },
  ];

  function callTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const code = pick(CALLS, rnd)(rnd);
      return safe(code) ? codeTask("natija", code, { kind: "chaqiruv" }) : null;
    }, prev, rr);
  }

  // ---------- 2-bosqich: return, None va lokal o'zgaruvchi ----------
  const RETURNS = [
    (rnd) => {
      const k = int(rnd, 2, 9);
      return "def kvadrat(n):\n    return n * n\n\nx = kvadrat(" + k + ")\nprint(x)\nprint(kvadrat(x))";
    },
    (rnd) => {
      const k = int(rnd, 2, 9);
      return "def kvadrat(n):\n    print(n * n)\n\nx = kvadrat(" + k + ")\nprint(x)";
    },
    (rnd) => {
      const k = int(rnd, 2, 9);
      return "def sinov(n):\n    return n + 1\n    print(\"bu satr bajarilmaydi\")\n\nprint(sinov(" + k + "))";
    },
    (rnd) => {
      const a = int(rnd, 2, 9);
      const b = int(rnd, 10, 20);
      return "def kattasi(a, b):\n    if a > b:\n        return a\n    return b\n\nprint(kattasi(" + a + ", " + b + "), kattasi(" + b + ", " + a + "))";
    },
    (rnd) => {
      const k = int(rnd, 2, 9);
      return "x = " + k + "\n\ndef oshir(x):\n    x = x + 1\n    return x\n\nprint(oshir(x), x)";
    },
  ];

  function returnTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const code = pick(RETURNS, rnd)(rnd);
      return safe(code) ? codeTask("natija", code, { kind: "return" }) : null;
    }, prev, rr);
  }

  // ---------- 3-bosqich: funksiya yozish (sinov satri bilan) ----------
  const WRITE_KINDS = [
    {
      id: "eng-katta",
      what: "eng_katta(a, b) funksiyasini yoz: ikki sondan kattasini qaytarsin. Chaqirishni sayt oʻzi bajaradi.",
      solution: "def eng_katta(a, b):\n    if a > b:\n        return a\n    return b",
      tail: "a = int(input())\nb = int(input())\nprint(eng_katta(a, b))",
      tests: [["3", "9"], ["10", "2"], ["5", "5"], ["-3", "-8"]],
    },
    {
      id: "juftmi",
      what: "juftmi(n) funksiyasini yoz: son juft boʻlsa True, aks holda False qaytarsin.",
      solution: "def juftmi(n):\n    return n % 2 == 0",
      tail: "print(juftmi(int(input())))",
      tests: [["4"], ["7"], ["0"], ["15"]],
    },
    {
      id: "raqamlar-yigindisi",
      what: "raqamlar_yigindisi(n) funksiyasini yoz: sonning raqamlari yigʻindisini qaytarsin.",
      solution: "def raqamlar_yigindisi(n):\n    s = 0\n    while n > 0:\n        s += n % 10\n        n = n // 10\n    return s",
      tail: "print(raqamlar_yigindisi(int(input())))",
      tests: [["5382"], ["7"], ["100"], ["999"]],
    },
    {
      id: "kvadratlar",
      what: "kvadrat(n) va kvadratlar_yigindisi(n) funksiyalarini yoz: ikkinchisi 1 dan n gacha kvadratlar yigʻindisini qaytarsin va kvadrat(n) dan foydalansin.",
      solution: "def kvadrat(n):\n    return n * n\n\ndef kvadratlar_yigindisi(n):\n    s = 0\n    for i in range(1, n + 1):\n        s += kvadrat(i)\n    return s",
      tail: "print(kvadratlar_yigindisi(int(input())))",
      tests: [["3"], ["1"], ["5"], ["10"]],
    },
    {
      id: "unlilar",
      what: "unlilar(soz) funksiyasini yoz: soʻzdagi unli harflar (a, e, i, o, u) sonini qaytarsin.",
      solution: 'def unlilar(soz):\n    soni = 0\n    for harf in soz:\n        if harf in "aeiou":\n            soni += 1\n    return soni',
      tail: "print(unlilar(input()))",
      tests: [["qabila"], ["python"], ["aeiou"], ["kkk"]],
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
        tail: kind.tail,
        tests: kind.tests.map((stdin) => ({ stdin })),
      };
    }, prev, rr);
  }

  const api = { NAMES, MAX_LINES, CALLS, RETURNS, WRITE_KINDS, callTask, returnTask, writeTask };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

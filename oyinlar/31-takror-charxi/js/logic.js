// 31-o'yin: savollarni yasash (sof mantiq, ekransiz).
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("../../umumiy/js/python/python.js");

  const pick = (list, r) => list[Math.floor(r() * list.length)];
  const int = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  const MAX_LINES = 8;   // chiqish shundan uzun bo'lmasin
  const MAX_VALUE = 500; // javob shundan oshmasin

  function pickNew(make, prev, r) {
    for (let k = 0; k < 40; k++) {
      const task = make(r);
      if (task && (!prev || task.id !== prev.id)) return task;
    }
    return make(r);
  }

  const codeTask = (type, code, extra) => Object.assign({ id: type + ":" + code, type, code, solution: code }, extra);

  // Kod xatosiz ishlashini va javob chegarada ekanini tekshiradi
  function safe(code, maxLines, maxValue) {
    const r = py.run(code, { maxSteps: 100000 });
    if (r.error) return null;
    if (r.output.length === 0 || r.output.length > (maxLines || MAX_LINES)) return null;
    for (const line of r.output) {
      const n = Number(line);
      if (Number.isFinite(n) && Math.abs(n) > (maxValue || MAX_VALUE)) return null;
    }
    return r;
  }

  // ---------- 1-bosqich: hisoblagichli sikl ----------
  const COUNTERS = [
    (rnd) => {
      const n = int(rnd, 3, 6);
      return "i = 1\nwhile i <= " + n + ":\n    print(i)\n    i += 1";
    },
    (rnd) => {
      const n = int(rnd, 3, 6);
      return "i = " + n + "\nwhile i > 0:\n    print(i)\n    i -= 1";
    },
    (rnd) => {
      const step = int(rnd, 2, 3);
      const n = int(rnd, 8, 14);
      return "i = 0\nwhile i < " + n + ":\n    print(i)\n    i += " + step;
    },
    (rnd) => {
      const n = int(rnd, 2, 5);
      return "i = 1\nwhile i <= " + n + ":\n    print(i * i)\n    i += 1";
    },
  ];

  function countTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const code = pick(COUNTERS, rnd)(rnd);
      return safe(code) ? codeTask("natija", code, { kind: "sanoq" }) : null;
    }, prev, rr);
  }

  // ---------- 2-bosqich: yig'indi, ko'paytma, sanoq, break ----------
  const COLLECTORS = [
    (rnd) => {
      const n = int(rnd, 4, 10);
      return "s = 0\ni = 1\nwhile i <= " + n + ":\n    s = s + i\n    i += 1\nprint(s)";
    },
    (rnd) => {
      const n = int(rnd, 3, 5);
      return "s = 1\ni = 1\nwhile i <= " + n + ":\n    s = s * i\n    i += 1\nprint(s)";
    },
    (rnd) => {
      const n = int(rnd, 6, 14);
      return "s = 0\ni = 1\nwhile i <= " + n + ":\n    if i % 2 == 0:\n        s += i\n    i += 1\nprint(s)";
    },
    (rnd) => {
      const limit = int(rnd, 20, 60);
      return "i = 1\nwhile True:\n    if i * i > " + limit + ":\n        break\n    i += 1\nprint(i)";
    },
    (rnd) => {
      const n = int(rnd, 5, 12);
      return "soni = 0\ni = 1\nwhile i <= " + n + ":\n    if i % 3 == 0:\n        soni += 1\n    i += 1\nprint(soni)";
    },
  ];

  function sumTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const code = pick(COLLECTORS, rnd)(rnd);
      return safe(code, 1) ? codeTask("natija", code, { kind: "yigindi" }) : null;
    }, prev, rr);
  }

  // ---------- 3-bosqich: raqamlarni ajratish ----------
  // Ko'rsatish uchun: sonning raqamlari qanday ajraladi
  function digitSteps(n) {
    const rows = [];
    let left = n;
    while (left > 0) {
      rows.push({ son: left, oxirgi: left % 10, qolgan: Math.floor(left / 10) });
      left = Math.floor(left / 10);
    }
    return rows;
  }

  const BROKEN = [
    {
      kind: "cheksiz",
      why: "hisoblagich oʻzgarmayapti — sikl toʻxtamaydi",
      good: "i = 1\nwhile i <= 5:\n    print(i)\n    i += 1",
      make: (good) => good.replace("\n    i += 1", ""),
    },
    {
      kind: "almashgan",
      why: "oxirgi raqam uchun % 10, qolgani uchun // 10 kerak",
      good: "n = 472\nwhile n > 0:\n    print(n % 10)\n    n = n // 10",
      make: (good) => good.replace("n % 10", "n // 10").replace("n = n // 10", "n = n % 10"),
    },
    {
      kind: "shart",
      why: "shart hech qachon yolgʻon boʻlmaydi",
      good: "i = 1\nwhile i <= 5:\n    print(i)\n    i += 1",
      make: (good) => good.replace("i <= 5", "i >= 1"),
    },
  ];

  function fixTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const broken = pick(BROKEN, rnd);
      const code = broken.make(broken.good);
      if (code === broken.good) return null;
      return { id: "xato:" + broken.kind, type: "xato-top", kind: broken.kind, why: broken.why, code, solution: broken.good };
    }, prev, rr);
  }

  const WRITE_KINDS = [
    {
      id: "raqamlar-yigindisi",
      what: "Bitta musbat son kiritiladi. Uning raqamlari yigʻindisini chiqar.",
      solution: "n = int(input())\ns = 0\nwhile n > 0:\n    s += n % 10\n    n = n // 10\nprint(s)",
      tests: [["5382"], ["7"], ["100"], ["999"]],
    },
    {
      id: "raqamlar-soni",
      what: "Bitta musbat son kiritiladi. Unda nechta raqam borligini chiqar.",
      solution: "n = int(input())\nsoni = 0\nwhile n > 0:\n    soni += 1\n    n = n // 10\nprint(soni)",
      tests: [["5382"], ["7"], ["100"], ["60000"]],
    },
    {
      id: "teskari",
      what: "Bitta musbat son kiritiladi. Uni teskari oʻgirib chiqar (masalan 1234 → 4321).",
      solution: "n = int(input())\nt = 0\nwhile n > 0:\n    t = t * 10 + n % 10\n    n = n // 10\nprint(t)",
      tests: [["1234"], ["7"], ["100"], ["9081"]],
    },
    {
      id: "eng-katta-raqam",
      what: "Bitta musbat son kiritiladi. Undagi eng katta raqamni chiqar.",
      solution: "n = int(input())\nbest = 0\nwhile n > 0:\n    r = n % 10\n    if r > best:\n        best = r\n    n = n // 10\nprint(best)",
      tests: [["5382"], ["7"], ["1111"], ["9081"], ["100"]],
    },
    {
      id: "yigindi-n",
      what: "Bitta son kiritiladi. 1 dan shu songacha boʻlgan sonlar yigʻindisini chiqar.",
      solution: "n = int(input())\ns = 0\ni = 1\nwhile i <= n:\n    s += i\n    i += 1\nprint(s)",
      tests: [["10"], ["1"], ["100"], ["7"]],
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

  const api = {
    MAX_LINES, MAX_VALUE, COUNTERS, COLLECTORS, BROKEN, WRITE_KINDS,
    countTask, sumTask, digitSteps, fixTask, writeTask, stage3Task,
  };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

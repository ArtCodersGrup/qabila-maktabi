// 30-o'yin: savollarni yasash (sof mantiq, ekransiz).
// Node'da test qilinadi: tests/logic.test.js
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

  const codeTask = (type, code, extra) => Object.assign({ id: type + ":" + code, type, code, solution: code }, extra);

  // ---------- 1-bosqich: if / else va otstup ----------
  const CASES = [
    { name: "yosh", low: "kichik", high: "katta", min: 5, max: 20 },
    { name: "ball", low: "oʻtmadi", high: "oʻtdi", min: 20, max: 100 },
    { name: "narx", low: "arzon", high: "qimmat", min: 10, max: 90 },
    { name: "bulut", low: "quyoshli", high: "bulutli", min: 0, max: 10 },
  ];

  function ifTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const c = pick(CASES, rnd);
      const limit = int(rnd, c.min + 2, c.max - 2);
      const value = int(rnd, c.min, c.max);
      const op = pick([">=", ">", "<", "<=", "==", "!="], rnd);
      // Blokdan keyin doim bajariladigan satr — otstup darsi
      const tail = rnd() < 0.5 ? '\nprint("tamom")' : "";
      const code = c.name + " = " + value + "\nif " + c.name + " " + op + " " + limit + ":\n"
        + '    print("' + c.high + '")\nelse:\n    print("' + c.low + '")' + tail;
      return codeTask("natija", code, { kind: "if" });
    }, prev, rr);
  }

  // ---------- 2-bosqich: elif zanjiri va mantiqiy ifoda ----------
  function elifTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const ball = int(rnd, 0, 100);
      const a = int(rnd, 80, 92);
      const b = int(rnd, 60, 75);
      const c = int(rnd, 35, 55);
      const code = "ball = " + ball + "\nif ball >= " + a + ":\n    print(5)\nelif ball >= " + b
        + ":\n    print(4)\nelif ball >= " + c + ":\n    print(3)\nelse:\n    print(2)";
      return codeTask("natija", code, { kind: "elif" });
    }, prev, rr);
  }

  const BOOL_SHAPES = [
    (rnd, x) => ({ text: "x > " + int(rnd, 2, 9) + " and x < " + int(rnd, 10, 20) }),
    (rnd, x) => ({ text: "x < " + int(rnd, 2, 9) + " or x > " + int(rnd, 10, 20) }),
    (rnd, x) => ({ text: "not x == " + int(rnd, 2, 20) }),
    (rnd, x) => ({ text: int(rnd, 0, 5) + " < x < " + int(rnd, 10, 20) }),
    (rnd, x) => ({ text: "x % 2 == 0 and x > " + int(rnd, 2, 9) }),
  ];

  function boolTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const x = int(rnd, 1, 20);
      const shape = pick(BOOL_SHAPES, rnd)(rnd, x);
      const code = "x = " + x + "\nprint(" + shape.text + ")";
      const result = py.run(code);
      if (result.error) return null;
      return codeTask("natija", code, { kind: "bool" });
    }, prev, rr);
  }

  // 2-bosqichda ikki xil savol aralash keladi
  function stage2Task(r, prev) {
    const rr = r || Math.random;
    const wantBool = prev ? prev.kind !== "bool" : rr() < 0.5;
    return wantBool ? boolTask(rr, prev) : elifTask(rr, prev);
  }

  // ---------- 3-bosqich: xato ovi va kod yozish ----------
  const BROKEN = [
    {
      kind: "teng",
      why: "solishtirish uchun ikkita teng kerak (==)",
      make: (good) => good.replace(" == ", " = "),
      need: (good) => good.includes(" == "),
    },
    {
      kind: "ikki-nuqta",
      why: "shart satri ikki nuqta bilan tugaydi",
      make: (good) => good.replace(/:\n/, "\n"),
      need: () => true,
    },
    {
      kind: "otstup",
      why: "shartga tegishli satr ichkariga suriladi",
      make: (good) => good.replace(/\n {4}/, "\n"),
      need: () => true,
    },
    {
      kind: "else-shart",
      why: "else ga shart yozilmaydi",
      make: (good) => good.replace("else:", "else x > 0:"),
      need: (good) => good.includes("else:"),
    },
  ];

  function fixTask(r, prev) {
    const rr = r || Math.random;
    return pickNew((rnd) => {
      const x = int(rnd, 2, 20);
      const limit = int(rnd, 2, 20);
      const good = "x = " + x + "\nif x == " + limit + ':\n    print("teng")\nelse:\n    print("teng emas")';
      const broken = pick(BROKEN, rnd);
      if (!broken.need(good)) return null;
      const code = broken.make(good);
      if (code === good) return null;
      return { id: "xato:" + broken.kind + ":" + x + ":" + limit, type: "xato-top", kind: broken.kind, why: broken.why, code, solution: good };
    }, prev, rr);
  }

  const WRITE_KINDS = [
    {
      id: "juft-toq",
      what: "Bitta son kiritiladi. Juft boʻlsa juft, aks holda toq deb yoz.",
      solution: 'n = int(input())\nif n % 2 == 0:\n    print("juft")\nelse:\n    print("toq")',
      tests: [["4"], ["7"], ["0"], ["15"]],
    },
    {
      id: "eng-katta",
      what: "Uchta son kiritiladi. Eng kattasini chiqar.",
      solution: "a = int(input())\nb = int(input())\nc = int(input())\nbest = a\nif b > best:\n    best = b\nif c > best:\n    best = c\nprint(best)",
      tests: [["3", "9", "5"], ["10", "2", "7"], ["4", "4", "1"], ["1", "2", "3"]],
    },
    {
      id: "oraliq",
      what: "Bitta son kiritiladi. 10 dan 20 gacha boʻlsa (10 va 20 ham kiradi) ha, aks holda yoʻq deb yoz.",
      solution: 'n = int(input())\nif 10 <= n <= 20:\n    print("ha")\nelse:\n    print("yoʻq")',
      tests: [["15"], ["10"], ["20"], ["9"], ["21"]],
    },
    {
      id: "baho",
      what: "Ball kiritiladi. 90 dan boshlab 5, 70 dan boshlab 4, 50 dan boshlab 3, aks holda 2 chiqar.",
      solution: "ball = int(input())\nif ball >= 90:\n    print(5)\nelif ball >= 70:\n    print(4)\nelif ball >= 50:\n    print(3)\nelse:\n    print(2)",
      tests: [["95"], ["70"], ["55"], ["20"], ["89"]],
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

  const api = { CASES, BOOL_SHAPES, BROKEN, WRITE_KINDS, ifTask, elifTask, boolTask, stage2Task, fixTask, writeTask, stage3Task };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

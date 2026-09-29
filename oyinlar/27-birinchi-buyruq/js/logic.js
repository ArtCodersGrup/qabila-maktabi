// 27-o'yin: mashq savollarini yasash (sof mantiq, ekransiz).
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  // Ekranda ko'rinadigan matnlar: to'g'ri belgilar bilan, qo'shtirnoqsiz
  const TEXTS = [
    "Salom, qabila!", "Salom, dunyo!", "Men dasturchiman", "Python oʻrganamiz",
    "Bugun dars bor", "Kompyuter tayyor", "Kod yozamiz", "Birinchi buyruq",
  ];
  const NAMES = ["Anvar", "Dilnoza", "Sardor", "Malika", "Jasur", "Zilola", "Bekzod", "Nigora"];
  const WORDS = ["olma", "kitob", "quyosh", "daryo", "tosh", "qalam", "gulxan", "yoʻl"];

  const pick = (list, r) => list[Math.floor(r() * list.length)];

  // Bir xil savol ketma-ket ikki marta chiqmaydi (QOIDALAR 4.3)
  function pickNew(make, prev, r) {
    for (let k = 0; k < 20; k++) {
      const task = make(r);
      if (!prev || task.id !== prev.id) return task;
    }
    return make(r);
  }

  // ---------- 1-bosqich: berilgan matnni chiqaradigan kodni terish ----------
  function typeTask(r, prev) {
    return pickNew((rr) => {
      const text = pick(TEXTS.concat(NAMES.map((n) => "Salom, " + n + "!")), rr);
      const code = 'print("' + text + '")';
      return { id: "ter:" + text, type: "ter", text, code };
    }, prev, r || Math.random);
  }

  // ---------- 2-bosqich: kod berilgan — chiqishini ayt ----------
  const RESULT_KINDS = ["ikki", "bosh", "son", "vergul", "tirnoq"];

  function resultTask(r, prev) {
    return pickNew((rr) => {
      const kind = pick(RESULT_KINDS, rr);
      let code;
      if (kind === "ikki") {
        const a = pick(TEXTS, rr);
        const b = pick(NAMES, rr);
        code = 'print("' + a + '")\nprint("' + b + '")';
      } else if (kind === "bosh") {
        const a = pick(WORDS, rr);
        const b = pick(WORDS, rr);
        code = 'print("' + a + '")\nprint()\nprint("' + b + '")';
      } else if (kind === "son") {
        const a = 2 + Math.floor(rr() * 8);
        const b = 2 + Math.floor(rr() * 8);
        code = "print(" + a + " + " + b + ')\nprint("' + a + " + " + b + '")';
      } else if (kind === "vergul") {
        const name = pick(NAMES, rr);
        code = 'print("Salom,", "' + name + '")';
      } else {
        const w = pick(WORDS, rr);
        code = "print('" + w + "')\nprint(\"" + w + "\")";
      }
      return { id: "natija:" + code, type: "natija", kind, code, solution: code };
    }, prev, r || Math.random);
  }

  // ---------- 3-bosqich: xatoni top / o'zing yoz ----------
  const BROKEN = [
    { kind: "qavs", break: (code) => code.slice(0, -1), why: "qavs yopilmagan" },
    { kind: "tirnoq", break: (code) => code.replace(/"([^"]*)"\)$/, '"$1)'), why: "qoʻshtirnoq yopilmagan" },
    { kind: "bosh-harf", break: (code) => code.replace(/^print/, "Print"), why: "buyruq katta harf bilan yozilgan" },
    { kind: "tirnoqsiz", break: (code) => code.replace(/"/g, ""), why: "matn qoʻshtirnoqsiz yozilgan" },
  ];

  function fixTask(r, prev) {
    return pickNew((rr) => {
      const text = pick(WORDS.concat(NAMES), rr);
      const solution = 'print("' + text + '")';
      const broken = pick(BROKEN, rr);
      return {
        id: "xato:" + broken.kind + ":" + text,
        type: "xato-top", kind: broken.kind, why: broken.why,
        code: broken.break(solution), solution,
      };
    }, prev, r || Math.random);
  }

  function writeTask(r, prev) {
    return pickNew((rr) => {
      const count = 1 + Math.floor(rr() * 2); // 1 yoki 2 satr
      const lines = [];
      while (lines.length < count) {
        const line = rr() < 0.5 ? pick(NAMES, rr) : pick(WORDS, rr);
        if (!lines.includes(line)) lines.push(line);
      }
      return {
        id: "yoz:" + lines.join("|"),
        type: "kod-yoz", lines,
        solution: lines.map((line) => 'print("' + line + '")').join("\n"),
        tests: [{ stdin: [], out: lines }],
      };
    }, prev, r || Math.random);
  }

  // 3-bosqichda ikki xil savol navbat bilan keladi
  function stage3Task(r, prev) {
    const rr = r || Math.random;
    const wantFix = prev ? prev.type !== "xato-top" : rr() < 0.5;
    return wantFix ? fixTask(rr, prev) : writeTask(rr, prev);
  }

  const api = { TEXTS, NAMES, WORDS, BROKEN, typeTask, resultTask, fixTask, writeTask, stage3Task, pickNew };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

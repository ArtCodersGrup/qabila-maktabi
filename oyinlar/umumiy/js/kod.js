// Python bloki (27–35-o'yinlar) uchun masala turlari va ularni tekshirish — sof mantiq.
// Ekran bilan ishlamaydi, Node'da test qilinadi: umumiy/tests/kod.test.js
//   ter       — berilgan kodni aynan terish
//   natija    — kod berilgan, chiqishini aytish
//   bosh-joy  — kodda yashirilgan joylarni to'ldirish
//   xato-top  — ishlamaydigan kodni tuzatish
//   kod-yoz   — shartga ko'ra kodni to'liq yozish (test holatlari bilan tekshiriladi)
(function (root) {
  "use strict";

  const py = (root.QK && root.QK.python) || require("./python/python.js");

  const TYPES = ["ter", "natija", "bosh-joy", "xato-top", "kod-yoz"];
  const BLANK = "___";
  const LIMITS = { maxSteps: 200000, maxOutput: 2000 };

  // Chiqishni solishtirishdan oldin tozalash: satr oxiridagi bo'shliqlar va oxirgi bo'sh satrlar hisobga olinmaydi
  function normalize(text) {
    const lines = (Array.isArray(text) ? text : String(text == null ? "" : text).split("\n")).map((s) => String(s).replace(/[ \t]+$/, ""));
    while (lines.length && lines[lines.length - 1] === "") lines.pop();
    return lines;
  }

  const sameOutput = (a, b) => {
    const x = normalize(a), y = normalize(b);
    return x.length === y.length && x.every((line, k) => line === y[k]);
  };

  // Ikki matn qayerdan farq qilishini topadi (ter turida "shu yerda farq bor" deb ko'rsatiladi)
  function firstDiff(expected, got) {
    const a = String(expected).split("\n");
    const b = String(got).split("\n");
    for (let k = 0; k < Math.max(a.length, b.length); k++) {
      const left = a[k] === undefined ? null : a[k].replace(/[ \t]+$/, "");
      const right = b[k] === undefined ? null : b[k].replace(/[ \t]+$/, "");
      if (left === right) continue;
      if (left === null) return { line: k + 1, col: 1, expected: "", got: b[k] };
      if (right === null) return { line: k + 1, col: 1, expected: a[k], got: "" };
      let col = 0;
      while (col < left.length && col < right.length && left[col] === right[col]) col++;
      return { line: k + 1, col: col + 1, expected: left, got: right };
    }
    return null;
  }

  const run = (code, testCase) => py.run(code, Object.assign({}, LIMITS, { stdin: (testCase && testCase.stdin) || [] }));

  // Funksiya yozish masalalarida bolaning kodidan keyin sinov satri qo'shiladi:
  //   task.tail = "print(juftmi(int(input())))"
  const withTail = (code, task) => (task && task.tail ? String(code).replace(/\s*$/, "") + "\n" + task.tail : code);

  // Masalaning to'g'ri javobi: yozilgan bo'lsa o'sha, bo'lmasa namunali yechimdan hisoblanadi
  function expectedFor(task, testCase) {
    if (testCase && testCase.out) return normalize(testCase.out);
    if (task.expected) return normalize(task.expected);
    if (!task.solution) throw new Error("masalada na expected, na solution bor: " + (task.name || task.type));
    const r = run(withTail(task.solution, task), testCase);
    if (r.error) throw new Error("namunali yechim xato berdi: " + r.error.text);
    return normalize(r.output);
  }

  // Bo'sh joylarni to'ldirib, to'liq kod yasash
  function fill(template, answers) {
    const parts = String(template).split(BLANK);
    let out = parts[0];
    for (let k = 1; k < parts.length; k++) {
      out += String((answers && answers[k - 1]) !== undefined ? answers[k - 1] : "") + parts[k];
    }
    return out;
  }

  const blanksIn = (template) => String(template).split(BLANK).length - 1;

  // — Tekshirish —

  function checkTer(task, answer) {
    const diff = firstDiff(task.code, answer);
    if (!diff) return { ok: true };
    return { ok: false, kind: "terish", diff, hint: "Farq " + diff.line + "-satrda. Har belgini diqqat bilan solishtir." };
  }

  function checkNatija(task, answer) {
    // Kirish satrlari bo'lsa, kutilgan chiqish ham o'shalar bilan hisoblanadi
    const expected = expectedFor(task, { stdin: task.stdin || [] });
    const got = normalize(answer);
    if (sameOutput(expected, got)) return { ok: true };
    return {
      ok: false, kind: "chiqish", expected, got,
      hint: expected.length !== got.length
        ? "Satrlar soni boshqacha: kutilgani — " + expected.length + " ta, sendan — " + got.length + " ta."
        : "Satrlar soni toʻgʻri, lekin ichidagi matn boshqacha.",
    };
  }

  // Kodni bajarib, chiqishini kutilgan bilan solishtiradigan turlar uchun umumiy tekshiruv
  function checkByRunning(task, code, cases) {
    for (const testCase of cases) {
      const r = run(withTail(code, task), testCase);
      if (r.error) {
        return { ok: false, kind: "xato", error: r.error, testCase, hint: r.error.hint };
      }
      const expected = expectedFor(task, testCase);
      if (!sameOutput(expected, r.output)) {
        return {
          ok: false, kind: "chiqish", expected, got: normalize(r.output), testCase,
          hint: (testCase && testCase.stdin && testCase.stdin.length)
            ? "Kirish: " + testCase.stdin.join(", ") + " → kutilgan: " + expected.join(" / ") + ", sendan: " + normalize(r.output).join(" / ")
            : "Chiqish kutilganidek emas.",
        };
      }
    }
    return { ok: true };
  }

  const casesOf = (task) => (task.tests && task.tests.length ? task.tests : [{ stdin: task.stdin || [] }]);

  function checkBoshJoy(task, answer) {
    const answers = Array.isArray(answer) ? answer : [answer];
    if (answers.some((a) => a === undefined || String(a).trim() === "")) {
      return { ok: false, kind: "bosh", hint: "Hamma boʻsh joyni toʻldir." };
    }
    const code = fill(task.template, answers);
    return Object.assign(checkByRunning(task, code, casesOf(task)), { code });
  }

  function checkXatoTop(task, answer) {
    return Object.assign(checkByRunning(task, answer, casesOf(task)), { code: answer });
  }

  function checkKodYoz(task, answer) {
    if (!String(answer).trim()) return { ok: false, kind: "bosh", hint: "Avval kodni yoz, keyin ishga tushir." };
    return Object.assign(checkByRunning(task, answer, casesOf(task)), { code: answer });
  }

  function check(task, answer) {
    if (task.type === "ter") return checkTer(task, answer);
    if (task.type === "natija") return checkNatija(task, answer);
    if (task.type === "bosh-joy") return checkBoshJoy(task, answer);
    if (task.type === "xato-top") return checkXatoTop(task, answer);
    if (task.type === "kod-yoz") return checkKodYoz(task, answer);
    throw new Error("notanish masala turi: " + task.type);
  }

  // Masala banki to'g'ri yozilganini tekshirish (35-o'yin testi shuni chaqiradi)
  function validate(task) {
    const problems = [];
    if (!TYPES.includes(task.type)) problems.push("notanish tur: " + task.type);
    if (task.type === "ter" && !task.code) problems.push("ter uchun code kerak");
    if (task.type === "bosh-joy") {
      if (!task.template) problems.push("bosh-joy uchun template kerak");
      else if (blanksIn(task.template) === 0) problems.push("template ichida " + BLANK + " yo'q");
    }
    if (task.type !== "ter" && task.type !== "natija" && !task.solution && !(task.tests || []).every((t) => t.out)) {
      problems.push("solution yoki har testda out kerak");
    }
    if (task.solution) {
      for (const testCase of casesOf(task)) {
        const r = run(withTail(task.solution, task), testCase);
        if (r.error) problems.push("namunali yechim xato berdi: " + r.error.text);
        else if (testCase.out && !sameOutput(testCase.out, r.output)) {
          problems.push("namunali yechim testdan o'tmadi: " + JSON.stringify(testCase));
        }
      }
    }
    return problems;
  }

  const api = { TYPES, BLANK, LIMITS, check, validate, withTail, normalize, sameOutput, firstDiff, fill, blanksIn, expectedFor, run };

  root.QK = root.QK || {};
  root.QK.kod = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

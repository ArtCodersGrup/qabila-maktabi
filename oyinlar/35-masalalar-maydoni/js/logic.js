// 35-o'yin: masalani tanlash mantiqi (bank — js/bank.js da).
// Node'da test qilinadi: tests/logic.test.js
(function (root) {
  "use strict";

  const bank = (root.QK && root.QK.bank) || require("./bank.js");

  const LEVELS = bank.LEVELS;

  // Masaladan kod.js tushunadigan vazifa yasaydi: ko'rinadigan namuna + yashirin testlar
  function toTask(problem) {
    return {
      id: problem.id,
      type: "kod-yoz",
      title: problem.title,
      what: problem.what,
      kirish: problem.kirish,
      chiqish: problem.chiqish,
      namuna: problem.namuna,
      hint: problem.hint,
      solution: problem.solution,
      // Namuna ham tekshiriladi: uning kutilgan javobi bankda yozilgan
      tests: [{ stdin: problem.namuna.stdin, out: problem.namuna.out }]
        .concat(problem.tests.map((stdin) => ({ stdin }))),
    };
  }

  const levelByIndex = (stage) => LEVELS[Math.max(0, Math.min(LEVELS.length - 1, stage - 1))];

  // Yechilgan masalalar qayta chiqmaydi (bank tugasa — boshidan)
  function pickProblem(stage, used, r) {
    const rnd = r || Math.random;
    const level = levelByIndex(stage);
    const left = level.problems.filter((p) => !used.includes(p.id));
    const pool = left.length ? left : level.problems;
    return toTask(pool[Math.floor(rnd() * pool.length)]);
  }

  const api = { LEVELS, toTask, levelByIndex, pickProblem };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

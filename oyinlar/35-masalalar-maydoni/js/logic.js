// 35-o'yin: masalani tanlash mantiqi (bank — js/bank.js da).
// Masalalar daraja ichida qiyinchilik (rating) bo'yicha tartiblangan: oson'idan boshlanadi.
// Node'da test qilinadi: tests/bank.test.js
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
      rating: problem.rating,
      tartib: problem.tartib || null,
      tags: problem.tags || [],
      manba: problem.manba || null,
      animatsiya: problem.animatsiya || null,
      // Namuna ham tekshiriladi: uning kutilgan javobi bankda yozilgan
      tests: [{ stdin: problem.namuna.stdin, out: problem.namuna.out }]
        .concat(problem.tests.map((stdin) => ({ stdin }))),
    };
  }

  const levelByIndex = (stage) => LEVELS[Math.max(0, Math.min(LEVELS.length - 1, stage - 1))];

  // Daraja ichidagi masalalar: oson'idan qiyiniga.
  // Avval rating (Codeforces reytingi yoki bizniki), keyin qo'lda qo'yilgan tartib.
  function ordered(level) {
    return level.problems.slice().sort((a, b) =>
      (a.rating - b.rating) || ((a.tartib || 99) - (b.tartib || 99)) || (a.id < b.id ? -1 : 1));
  }

  // Keyingi masala — yechilmaganlarning eng osoni. Bank tugasa, boshidan.
  function pickProblem(stage, used) {
    const list = ordered(levelByIndex(stage));
    const left = list.filter((p) => !used.includes(p.id));
    return toTask((left.length ? left : list)[0]);
  }

  // ---------- Yechilgan masalalar (brauzer xotirasida) ----------
  // Bolaning zinapoyasi: qayta o'ynaganda keyingi masalalar beriladi, o'sha uchtasi emas.
  // Xotira ishlamasa ham o'yin to'liq ishlaydi (QOIDALAR §8).
  const KEY = "masalalar-yechilgan:v1";

  function loadSolved() {
    try {
      const raw = root.localStorage && root.localStorage.getItem(KEY);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === "object" ? data : {};
    } catch (e) {
      return {};
    }
  }

  function saveSolved(data) {
    try {
      if (root.localStorage) root.localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      // Saqlanmadi — o'yin baribir ishlaydi
    }
  }

  const solvedIn = (levelId) => {
    const list = loadSolved()[levelId];
    return Array.isArray(list) ? list.slice() : [];
  };

  // Masala yechildi. Daraja to'liq yechilgan bo'lsa, ro'yxat tozalanadi — bank boshidan beriladi.
  function markSolved(levelId, id) {
    const data = loadSolved();
    const list = Array.isArray(data[levelId]) ? data[levelId] : [];
    if (!list.includes(id)) list.push(id);
    const level = LEVELS.find((l) => l.id === levelId);
    data[levelId] = level && list.length >= level.problems.length ? [] : list;
    saveSolved(data);
    return data[levelId];
  }

  const forgetSolved = () => saveSolved({});

  const api = { LEVELS, toTask, levelByIndex, ordered, pickProblem, solvedIn, markSolved, forgetSolved, KEY };

  root.QK = root.QK || {};
  root.QK.logic = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

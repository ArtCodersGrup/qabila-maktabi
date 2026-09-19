// Qabila kodlari — sof hisob-kitob. Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  // Tasodifiy misollar uchun harflar. "O" yo'q — finaldagi 0 bilan chalkashmasin.
  const LETTER_POOL = ["A", "U", "F", "K", "M", "S", "T", "R"];
  // 1- va 2-bosqich juftliklari (a, i): aⁱ ≤ 64 va a + … + aⁱ ≤ 84
  const STAGE_PAIRS = [[2, 2], [2, 3], [2, 4], [2, 5], [3, 2], [3, 3], [4, 2], [4, 3]];
  const MAX_PEOPLE = 30;

  function countExact(a, i) {
    return Math.pow(a, i);
  }

  function countUpTo(a, i) {
    let sum = 0;
    for (let k = 1; k <= i; k++) sum += Math.pow(a, k);
    return sum;
  }

  function countWords(a, i, type) {
    return type === "exact" ? countExact(a, i) : countUpTo(a, i);
  }

  // Barcha so'zlar. Tartib: avval qisqalari, bir xil uzunlikda — alifbo tartibida.
  function listWords(letters, i, type) {
    let result = [];
    for (let len = type === "exact" ? i : 1; len <= i; len++) {
      let level = [""];
      for (let k = 0; k < len; k++) {
        const next = [];
        for (const w of level) for (const l of letters) next.push(w + l);
        level = next;
      }
      result = result.concat(level);
    }
    return result;
  }

  // Eng kamida nechta harf kerak: so'zlar soni odamlar sonidan kam bo'lmasligi uchun
  function minLetters(people, i, type) {
    let a = 1;
    while (countWords(a, i, type) < people) a++;
    return a;
  }

  // 3-bosqich tushuntirishi: 1 dan javobgacha har bir harflar soni uchun so'zlar soni
  function stage3Steps(people, i, type) {
    const answer = minLetters(people, i, type);
    const steps = [];
    for (let a = 1; a <= answer; a++) {
      const count = countWords(a, i, type);
      steps.push({ a, count, enough: count >= people });
    }
    return steps;
  }

  // Javob aynan `a` bo'lishi uchun odamlar soni oralig'i: (a−1) ta harf yetmaydi, a ta yetadi
  function stage3Range(type, i, a) {
    const lo = Math.max(2, countWords(a - 1, i, type) + 1);
    const hi = Math.min(MAX_PEOPLE, countWords(a, i, type));
    return lo <= hi ? [lo, hi] : null;
  }

  // Urug'li tasodifiy sonlar (mulberry32) — testlarda bir xil natija olish uchun
  function makeRng(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const randInt = (rng, lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

  function pickLetters(a, rng) {
    const pool = LETTER_POOL.slice();
    const out = [];
    for (let k = 0; k < a; k++) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
    return out;
  }

  // Ikki misol "bir xil"mi — harflar hisobga olinmaydi
  function exerciseKey(ex) {
    return [ex.stage, ex.type, ex.a, ex.i, ex.people].join("|");
  }

  function makeOne(stage, rng) {
    if (stage === 1 || stage === 2) {
      const [a, i] = pick(rng, STAGE_PAIRS);
      const type = stage === 1 ? "exact" : "upto";
      return { stage, type, a, i, letters: pickLetters(a, rng), answer: countWords(a, i, type) };
    }
    for (;;) {
      const type = rng() < 0.5 ? "exact" : "upto";
      const i = randInt(rng, 2, 3);
      const answer = randInt(rng, 2, 4);
      const range = stage3Range(type, i, answer);
      if (range) return { stage: 3, type, i, people: randInt(rng, range[0], range[1]), answer };
    }
  }

  function makeExercise(stage, prev, rng) {
    rng = rng || Math.random;
    let ex;
    do {
      ex = makeOne(stage, rng);
    } while (prev && exerciseKey(ex) === exerciseKey(prev));
    return ex;
  }

  function checkAnswer(ex, value) {
    return Number(value) === ex.answer;
  }

  function productText(a, i) {
    return Array(i).fill(a).join(" × ");
  }

  function sumText(a, i) {
    const parts = [];
    for (let k = 1; k <= i; k++) parts.push(productText(a, k));
    return parts.join(" + ");
  }

  const api = {
    LETTER_POOL, STAGE_PAIRS, MAX_PEOPLE,
    countExact, countUpTo, countWords, listWords, minLetters, stage3Steps, stage3Range,
    makeRng, pickLetters, exerciseKey, makeExercise, checkAnswer, productText, sumText,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.logic = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

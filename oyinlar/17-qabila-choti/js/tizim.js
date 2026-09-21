// Qabila cho'ti — shu o'yin topshiriqlari: cho'tni o'qish, yozuv to'g'riligi, eng kichik asos,
// harf qiymati, xona qiymati va tizim turi. Umumiy hisob — umumiy/js/sanoq.js. Node'da test qilinadi.
(function (root) {
  "use strict";

  const node = typeof module !== "undefined" && module.exports;
  const S = node ? require("../../umumiy/js/sanoq.js") : root.QK.sanoq;

  const randInt = (a, b, rng) => a + Math.floor(rng() * (b - a + 1));
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];
  const same = (a, b) => !!a && JSON.stringify(a) === JSON.stringify(b);

  // Tasodifiy n-lik son: len xonali, birinchi raqam 0 emas
  function randomNumber(base, len, rng) {
    let s = S.digitChar(randInt(1, base - 1, rng));
    for (let k = 1; k < len; k++) s += S.digitChar(randInt(0, base - 1, rng));
    return s;
  }

  // 1-bosqich: cho'tdagi son (3 sim) / yana 1 qo'shilsa
  function makeChotiTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const base = randInt(2, 9, rng);
      let task;
      if (rng() < 0.5) {
        const value = randInt(base ** 2, base ** 3 - 1, rng);
        task = { type: "read", base, value, answer: S.toBase(value, base) };
      } else {
        // oxirgi raqam n−1: v = n·k + (n−1), v + 1 hali 3 simga sig'adi
        const k = randInt(1, base ** 2 - 2, rng);
        const value = base * k + base - 1;
        task = { type: "next", base, value, answer: S.toBase(value + 1, base) };
      }
      if (!same(prev, task)) return task;
    }
  }

  // 2-bosqich: yozuv to'g'rimi / eng kamida qaysi tizim / 16-likdagi harf qiymati
  function makeDigitTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const r = rng();
      let task;
      if (r < 0.4) {
        const good = rng() < 0.5;
        const base = good ? pick([2, 3, 5, 8, 16], rng) : pick([2, 3, 5, 8, 10], rng);
        const len = randInt(2, 4, rng);
        let number = randomNumber(base, len, rng);
        if (!good) {
          // bitta raqamni asosdan katta yoki teng raqamga almashtiramiz
          const pos = randInt(0, len - 1, rng);
          const bad = S.digitChar(randInt(base, Math.min(base + 3, 15), rng));
          number = number.slice(0, pos) + bad + number.slice(pos + 1);
        }
        task = { type: "valid", base, number, answer: S.valid(number, base) ? "ha" : "yoq" };
      } else if (r < 0.75) {
        const top = randInt(2, 15, rng); // eng katta raqam
        const len = randInt(3, 4, rng);
        let number = randomNumber(top + 1, len, rng);
        if (![...number].some((ch) => S.digitValue(ch) === top)) {
          const pos = randInt(0, len - 1, rng);
          number = number.slice(0, pos) + S.digitChar(top) + number.slice(pos + 1);
        }
        const max = Math.max(...[...number].map(S.digitValue));
        task = { type: "minBase", number, answer: Math.max(2, max + 1) };
      } else {
        const digit = pick([..."ABCDEF"], rng);
        task = { type: "digitVal", digit, answer: S.digitValue(digit) };
      }
      if (!same(prev, task)) return task;
    }
  }

  // 3-bosqich: tizim turlari
  const KINDS = [
    { text: "XIV", kind: "nopoz", why: "Rim raqamlari: X har joyda 10, V har joyda 5" },
    { text: "CXX", kind: "nopoz", why: "Rim raqamlari: C doim 100, X doim 10" },
    { text: "IIII (tayoqchalar)", kind: "nopoz", why: "Har tayoqcha — 1, joyi ahamiyatsiz" },
    { text: "1011₂", kind: "poz", why: "Ikkilik: xonalar 8, 4, 2, 1 — joyi muhim" },
    { text: "7E₁₆", kind: "poz", why: "Oʻn oltilik: 7 — oʻn oltilar xonasida" },
    { text: "305₈", kind: "poz", why: "Sakkizlik: 3 — 64 lar xonasida" },
    { text: "2024", kind: "poz", why: "Oʻnlik: birinchi 2 — ming, oxirgi 4 — birlar" },
  ];

  // Xona qiymati / raqam turgan xona / tizim turi
  function makePlaceTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const r = rng();
      let task;
      if (r < 0.4) {
        const base = pick([2, 3, 4, 5, 8, 10, 16], rng);
        const ks = [2, 3, 4, 5, 6, 7, 8, 9].filter((k) => base ** (k - 1) <= 256);
        const k = pick(ks, rng);
        task = { type: "place", base, k, answer: base ** (k - 1) };
      } else if (r < 0.75) {
        const base = pick([2, 3, 5, 8, 16], rng);
        const len = base === 2 ? randInt(3, 5, rng) : 3;
        const number = randomNumber(base, len, rng);
        const once = [...number].filter((ch) => number.split(ch).length === 2);
        if (!once.length) continue;
        const digit = pick(once, rng);
        task = { type: "digitPlace", base, number, digit, answer: base ** (len - 1 - number.indexOf(digit)) };
      } else {
        const item = pick(KINDS, rng);
        task = { type: "kind", text: item.text, why: item.why, answer: item.kind };
      }
      if (!same(prev, task)) return task;
    }
  }

  const api = { KINDS, randomNumber, makeChotiTask, makeDigitTask, makePlaceTask };

  if (node) module.exports = api;
  else root.QK.tizim = api;
})(typeof window !== "undefined" ? window : globalThis);

// Robot nimani ko'radi? — sof hisob: 6×6 to'r, shablonlar, moslik, belgilar va topshiriqlar.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const SIZE = 6;
  const CELLS = SIZE * SIZE;

  // Shablonlar 6×6: "#" — bo'yalgan katak
  const PATTERNS = {
    kvadrat: [
      ".####.",
      "######",
      "######",
      "######",
      "######",
      ".####.",
    ],
    uchburchak: [
      "..##..",
      "..##..",
      ".####.",
      ".####.",
      "######",
      "######",
    ],
    krest: [
      "..##..",
      "..##..",
      "######",
      "######",
      "..##..",
      "..##..",
    ],
  };

  const gridFrom = (rows) => rows.join("").split("").map((ch) => (ch === "#" ? 1 : 0));

  const NAMES = Object.keys(PATTERNS);
  const TEMPLATES = {};
  for (const name of NAMES) TEMPLATES[name] = gridFrom(PATTERNS[name]);

  const empty = () => new Array(CELLS).fill(0);
  const filled = (grid) => grid.reduce((sum, cell) => sum + cell, 0);

  // Nechta katak mos keladi (36 tadan)
  const matchScore = (a, b) => a.reduce((sum, cell, i) => sum + (cell === b[i] ? 1 : 0), 0);

  // Eng ko'p mos kelgan shablon va barcha mosliklar
  function bestMatch(grid) {
    const list = NAMES.map((name) => ({ name, score: matchScore(grid, TEMPLATES[name]) }))
      .sort((a, b) => b.score - a.score);
    return { name: list[0].name, score: list[0].score, list };
  }

  // Belgi bo'yicha: bo'yalgan kataklar soni eng yaqin shablon (surilganda o'zgarmaydi)
  function byFeature(grid) {
    const n = filled(grid);
    let best = null;
    for (const name of NAMES) {
      const diff = Math.abs(filled(TEMPLATES[name]) - n);
      if (!best || diff < best.diff) best = { name, diff };
    }
    return best.name;
  }

  // Rasmni surish: chetdan chiqqan kataklar yo'qoladi
  function shift(grid, dx, dy) {
    const out = empty();
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= SIZE || ny < 0 || ny >= SIZE) continue;
        out[ny * SIZE + nx] = grid[y * SIZE + x];
      }
    }
    return out;
  }

  const randInt = (lo, hi, rng) => lo + Math.floor(rng() * (hi - lo + 1));
  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

  // n ta tasodifiy katakni almashtirish
  function addNoise(grid, n, rng) {
    rng = rng || Math.random;
    const out = grid.slice();
    const spots = [];
    while (spots.length < n) {
      const i = randInt(0, CELLS - 1, rng);
      if (!spots.includes(i)) spots.push(i);
    }
    for (const i of spots) out[i] = out[i] ? 0 : 1;
    return out;
  }

  // Faqat bo'sh kataklarni bo'yash (belgi — bo'yalgan kataklar soni — ortadi)
  function addCells(grid, n, rng) {
    rng = rng || Math.random;
    const out = grid.slice();
    const free = [];
    out.forEach((cell, i) => {
      if (!cell) free.push(i);
    });
    for (let k = 0; k < n && free.length; k++) out[free.splice(Math.floor(rng() * free.length), 1)[0]] = 1;
    return out;
  }

  // 1-bosqich: "Robot shu sonlarni ko'rdi — bu qaysi rasm?"
  function makeReadTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const name = pick(NAMES, rng);
      const image = addNoise(TEMPLATES[name], randInt(1, 3, rng), rng);
      const others = NAMES.filter((n) => n !== name).map((n) => addNoise(TEMPLATES[n], randInt(1, 3, rng), rng));
      const options = [image].concat(others);
      const keys = options.map((g) => g.join(""));
      if (new Set(keys).size !== 3) continue;
      if (prev && prev.image.join("") === image.join("")) continue;
      // tasodifiy tartib
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const tmp = options[i];
        options[i] = options[j];
        options[j] = tmp;
      }
      return { type: "read", image, options, answer: options.findIndex((g) => g.join("") === image.join("")), truth: name };
    }
  }

  // 2-bosqich: "Robot nima deydi?" — shablon bilan aniq javob bo'lsin
  function makeMatchTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const name = pick(NAMES, rng);
      const image = addNoise(TEMPLATES[name], randInt(2, 4, rng), rng);
      const best = bestMatch(image);
      if (best.name !== name) continue;
      if (best.list[0].score - best.list[1].score < 3) continue;
      if (prev && prev.answer === name && prev.image.join("") === image.join("")) continue;
      return { type: "match", image, answer: name, truth: name };
    }
  }

  // 3-bosqich: "Qaysi usul to'g'ri javob beradi?" — faqat bittasi to'g'ri bo'lsin
  function makeMethodTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const name = pick(NAMES, rng);
      const useShift = rng() < 0.5;
      const image = useShift
        ? shift(TEMPLATES[name], pick([1, -1], rng), pick([0, 1, -1], rng))
        : addCells(TEMPLATES[name], randInt(3, 5, rng), rng);
      const byPixels = bestMatch(image).name === name;
      const byFeatureOk = byFeature(image) === name;
      if (byPixels === byFeatureOk) continue; // faqat bitta usul to'g'ri bo'lsin
      const answer = byPixels ? "shablon" : "belgi";
      if (prev && prev.answer === answer && prev.image.join("") === image.join("")) continue;
      return { type: "method", image, truth: name, answer, changed: useShift ? "surildi" : "kataklar qoʻshildi" };
    }
  }

  const api = {
    SIZE, CELLS, NAMES, TEMPLATES, PATTERNS,
    gridFrom, empty, filled, matchScore, bestMatch, byFeature, shift, addNoise, addCells,
    makeReadTask, makeMatchTask, makeMethodTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.vision = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

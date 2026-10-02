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
    // 2026-10-02: yana uchta shablon. Bo'yalgan kataklar soni hammasida har xil (32, 24, 20, 16, 12, 8) —
    // "belgi" usuli (kataklar soni) shunga tayanadi.
    T: [
      "######",
      "..##..",
      "..##..",
      "..##..",
      "..##..",
      "..##..",
    ],
    doira: [
      "..##..",
      ".#..#.",
      "#....#",
      "#....#",
      ".#..#.",
      "..##..",
    ],
    chiziq: [
      "......",
      "..##..",
      "..##..",
      "..##..",
      "..##..",
      "......",
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

  const tierOf = (tier) => Math.max(0, Math.min(2, tier || 0));
  const keyOf = (grid) => grid.join("");

  function shuffle(arr, rng) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  // Shovqin (almashtirilgan kataklar soni) qiyinlik zinasi bo'yicha
  const READ_NOISE = [[1, 3], [2, 4], [3, 5]];
  const MATCH_NOISE = [[2, 4], [3, 6], [4, 7]];

  // 1-bosqich: "Robot shu sonlarni ko'rdi — bu qaysi rasm?" — 4 variant.
  // tier 0, 1: boshqa shablonlar; tier 2: bittasi — shu shablonning boshqacha buzilgani (katakma-katak solishtirish kerak).
  function makeReadTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    const [lo, hi] = READ_NOISE[t];
    for (;;) {
      const name = pick(NAMES, rng);
      const image = addNoise(TEMPLATES[name], randInt(lo, hi, rng), rng);
      const otherNames = shuffle(NAMES.filter((n) => n !== name), rng).slice(0, t >= 2 ? 2 : 3);
      if (t >= 2) otherNames.push(name);
      const list = shuffle([{ name, grid: image }].concat(
        otherNames.map((n) => ({ name: n, grid: addNoise(TEMPLATES[n], randInt(lo, hi, rng), rng) }))), rng);
      const options = list.map((x) => x.grid);
      if (new Set(options.map(keyOf)).size !== 4) continue;
      if (prev && keyOf(prev.image) === keyOf(image)) continue;
      return {
        type: "read", image, options, answer: options.findIndex((g) => keyOf(g) === keyOf(image)),
        truth: name, sources: list.map((x) => x.name), tier: t, // sources — har variant qaysi shablondan yasalgan
      };
    }
  }

  // 2-bosqich: "Robot nima deydi?" — shablon bilan aniq javob bo'lsin.
  // Variantlar: tier 0, 1 — 4 ta (to'g'risi + eng o'xshash 3 ta shablon), tier 2 — oltitasi ham.
  function makeMatchTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    const [lo, hi] = MATCH_NOISE[t];
    const margin = t >= 2 ? 2 : 3;
    for (;;) {
      const name = pick(NAMES, rng);
      const image = addNoise(TEMPLATES[name], randInt(lo, hi, rng), rng);
      const best = bestMatch(image);
      if (best.name !== name) continue;
      if (best.list[0].score - best.list[1].score < margin) continue;
      if (prev && prev.answer === name) continue; // ketma-ket bir xil shakl chiqmaydi
      const options = t >= 2
        ? NAMES.slice()
        : NAMES.filter((n) => n === name || best.list.slice(1, 4).some((item) => item.name === n));
      return { type: "match", image, answer: name, truth: name, options, tier: t };
    }
  }

  // 3-bosqich: "Qaysi usul to'g'ri javob beradi?" — 4 javob: faqat shablon, faqat belgi, ikkalasi, hech biri.
  // Rasm suriladi va/yoki unga kataklar qo'shiladi. Mulohaza bir xil ishlashi uchun:
  // surilgan rasmda shablon doim adashadi, surilmaganda doim topadi; belgi — kataklar soniga qarab.
  const METHOD_ANSWERS = ["shablon", "belgi", "ikkalasi", "hech"];
  const CHANGES = {
    shift: "surildi",
    add: "kataklar qoʻshildi",
    both: "surildi va kataklar qoʻshildi",
    blur: "1–2 katagi oʻzgardi",
  };

  // Surishlar: 1 yoki 2 katak, istalgan tomonga (yo'g'on shakllar 1 katakka surilganda ham taniladi —
  // bunday holatlar pastdagi shart bilan tashlab yuboriladi)
  const SHIFTS = [];
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) if (dx || dy) SHIFTS.push([dx, dy]);
  }

  // 3-bosqich namoyishi: doira bir katak o'ngga surilsa, shablon adashadi, belgi (12 ta katak) esa saqlanadi
  const DEMO_SHIFT = { name: "doira", dx: 1, dy: 0 };

  function makeMethodTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    const wants = t === 0 ? ["shablon", "belgi"] : METHOD_ANSWERS;
    const maxAdd = t >= 2 ? 8 : 5;
    for (;;) {
      const want = pick(wants, rng);
      for (let attempt = 0; attempt < 200; attempt++) {
        const name = pick(NAMES, rng);
        const shifted = want === "belgi" || want === "hech";
        let image = TEMPLATES[name];
        let change;
        if (shifted) {
          const move = pick(SHIFTS, rng);
          image = shift(image, move[0], move[1]);
          if (want === "hech") image = addCells(image, randInt(3, maxAdd, rng), rng);
          change = want === "hech" ? "both" : "shift";
        } else if (want === "shablon") {
          image = addCells(image, randInt(3, maxAdd, rng), rng);
          change = "add";
        } else {
          image = addNoise(image, randInt(1, 2, rng), rng);
          change = "blur";
        }
        const byPixels = bestMatch(image).name === name;
        const byFeatureOk = byFeature(image) === name;
        if (byPixels === shifted) continue; // surilgan — shablon adashsin; surilmagan — topsin
        const answer = byPixels && byFeatureOk ? "ikkalasi" : byPixels ? "shablon" : byFeatureOk ? "belgi" : "hech";
        if (answer !== want) continue;
        if (prev && prev.answer === answer && keyOf(prev.image) === keyOf(image)) continue;
        if (prev && prev.truth === name && prev.answer === answer) continue;
        return {
          type: "method", image, truth: name, answer, options: METHOD_ANSWERS,
          byPixels: bestMatch(image).name, byFeature: byFeature(image), filled: filled(image),
          changed: CHANGES[change], tier: t,
        };
      }
    }
  }

  const api = {
    SIZE, CELLS, NAMES, TEMPLATES, PATTERNS, METHOD_ANSWERS, DEMO_SHIFT,
    gridFrom, empty, filled, matchScore, bestMatch, byFeature, shift, addNoise, addCells,
    makeReadTask, makeMatchTask, makeMethodTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.vision = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

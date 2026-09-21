// Ko'p qatlamli tarmoq — sof hisob: neyron, 3×3 tarmoq, bitta neyron chegarasi, o'rganish, topshiriqlar.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const weightedSum = (inputs, weights) => inputs.reduce((sum, x, i) => sum + x * weights[i], 0);
  const fire = (inputs, weights, threshold) => weightedSum(inputs, weights) >= threshold;

  // 1-bosqich namoyishi
  const DEMO = { weights: [1, 1, -1], threshold: 2 };

  // 3×3 tarmoq: yashirin neyronlar og'irliklari (o'rta ustun / o'rta qator), chegara 3
  const TIK = [0, 1, 0, 0, 1, 0, 0, 1, 0];
  const YOTIQ = [0, 0, 0, 1, 1, 1, 0, 0, 0];
  const LINE_THRESHOLD = 3;

  const hidden = (image) => ({
    tik: fire(image, TIK, LINE_THRESHOLD),
    yotiq: fire(image, YOTIQ, LINE_THRESHOLD),
  });

  // Chiqish qatlami: ikkalasi — krest, bittasi — chiziq, hech biri — boshqa
  function output(image) {
    const h = hidden(image);
    const on = (h.tik ? 1 : 0) + (h.yotiq ? 1 : 0);
    return on === 2 ? "krest" : on === 1 ? "chiziq" : "boshqa";
  }

  function hiddenLabel(image) {
    const h = hidden(image);
    if (h.tik && h.yotiq) return "ikkalasi";
    if (h.tik) return "faqat tik";
    if (h.yotiq) return "faqat yotiq";
    return "hech biri";
  }

  // Ikki kirishli ishlar: [a, b, kerakli javob]
  const TABLES = {
    va: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]],
    yoki: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]],
    faqatBittasi: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 0]],
  };
  const THRESHOLDS = { va: 2, yoki: 1 };

  const tableErrors = (table, weights, threshold) =>
    table.filter(([a, b, want]) => fire([a, b], weights, threshold) !== (want === 1)).length;

  // Bitta neyron: barcha butun og'irlik (−2..2) va chegaralarni (−2..3) sinash
  function bestOneNeuron(table) {
    let best = null;
    for (let w1 = -2; w1 <= 2; w1++) {
      for (let w2 = -2; w2 <= 2; w2++) {
        for (let t = -2; t <= 3; t++) {
          const errors = tableErrors(table, [w1, w2], t);
          if (!best || errors < best.errors) best = { weights: [w1, w2], threshold: t, errors };
        }
      }
    }
    return best;
  }
  const canOneNeuron = (table) => bestOneNeuron(table).errors === 0;

  // Ikki qatlam: "faqat a" va "faqat b" neyronlari, chiqish — "yoki"
  function twoLayer(x) {
    const h1 = fire(x, [1, -1], 1);
    const h2 = fire(x, [-1, 1], 1);
    return { h1, h2, out: fire([h1 ? 1 : 0, h2 ? 1 : 0], [1, 1], 1) };
  }

  // O'rganish qoidasi: yonishi kerak edi-yu yonmadi — oshir; yonmasligi kerak edi-yu yondi — kamaytir
  const updateRule = (target, out) => (target === out ? "tegma" : target ? "oshir" : "kamaytir");

  // Perseptron: chegara o'zgarmaydi, faqat yoniq kirishlarning og'irligi o'zgaradi.
  // Qaytaradi: [{ weights, errors }] — har aylanadan keyin.
  function trainNeuron(table, start, threshold, maxRounds) {
    let weights = start.slice();
    const steps = [{ weights: weights.slice(), errors: tableErrors(table, weights, threshold) }];
    for (let round = 0; round < (maxRounds || 20) && steps[steps.length - 1].errors > 0; round++) {
      for (const [a, b, want] of table) {
        const x = [a, b];
        const rule = updateRule(want === 1, fire(x, weights, threshold));
        if (rule === "tegma") continue;
        weights = weights.map((w, i) => w + (rule === "oshir" ? x[i] : -x[i]));
      }
      steps.push({ weights: weights.slice(), errors: tableErrors(table, weights, threshold) });
    }
    return steps;
  }

  const randInt = (lo, hi, rng) => lo + Math.floor(rng() * (hi - lo + 1));
  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];
  const bits = (n, rng) => Array.from({ length: n }, () => (rng() < 0.5 ? 1 : 0));

  // 1-bosqich: "Bu neyron yonadimi?"
  function makeFireTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const inputs = bits(3, rng);
      const weights = Array.from({ length: 3 }, () => (rng() < 0.65 ? 1 : -1));
      const threshold = pick([1, 2], rng);
      if (!inputs.some((x) => x)) continue;
      if (!weights.some((w) => w > 0)) continue;
      const answer = fire(inputs, weights, threshold);
      if (prev && prev.answer === answer && rng() < 0.5) continue; // javoblar aralash chiqsin
      if (prev && prev.inputs.join() === inputs.join() && prev.weights.join() === weights.join() && prev.threshold === threshold) continue;
      return { type: "fire", inputs, weights, threshold, answer };
    }
  }

  // 3×3 rasm: kerakli yashirin holat bilan
  function makeImage(label, rng) {
    for (;;) {
      const image = bits(9, rng).map((x) => (x && rng() < 0.6 ? 1 : 0));
      if (label === "ikkalasi" || label === "faqat tik") [1, 4, 7].forEach((i) => { image[i] = 1; });
      if (label === "ikkalasi" || label === "faqat yotiq") [3, 4, 5].forEach((i) => { image[i] = 1; });
      if (hiddenLabel(image) === label) return image;
    }
  }

  const LABELS = ["ikkalasi", "faqat tik", "faqat yotiq", "hech biri"];

  // 2-bosqich: "Qaysi neyronlar yonadi?"
  function makeHiddenTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const label = pick(LABELS, rng);
      const image = makeImage(label, rng);
      if (prev && prev.image && prev.image.join() === image.join()) continue;
      return { type: "hidden", image, answer: label, options: LABELS };
    }
  }

  // 2-bosqich: "Tarmoq nima deydi?"
  function makeOutputTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const image = makeImage(pick(LABELS, rng), rng);
      if (prev && prev.image && prev.image.join() === image.join()) continue;
      return { type: "output", image, answer: output(image), options: ["krest", "chiziq", "boshqa"] };
    }
  }

  const makeStage2Task = (k, prev, rng) => {
    rng = rng || Math.random;
    const useHidden = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return useHidden ? makeHiddenTask(prev, rng) : makeOutputTask(prev, rng);
  };

  // 3-bosqich: neyron xato qildi — og'irlikni oshiramizmi yoki kamaytiramizmi?
  function makeUpdateTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const inputs = bits(3, rng);
      if (!inputs.some((x) => x)) continue;
      const weights = Array.from({ length: 3 }, () => randInt(-1, 2, rng));
      const threshold = randInt(1, 3, rng);
      const out = fire(inputs, weights, threshold);
      const target = !out; // xato bo'lishi uchun kerakli javob — teskarisi
      const answer = updateRule(target, out);
      if (prev && prev.answer === answer && rng() < 0.5) continue;
      if (prev && prev.inputs.join() === inputs.join() && prev.weights.join() === weights.join()) continue;
      return { type: "update", inputs, weights, threshold, target, output: out, answer };
    }
  }

  const api = {
    DEMO, TIK, YOTIQ, LINE_THRESHOLD, TABLES, THRESHOLDS, LABELS,
    weightedSum, fire, hidden, output, hiddenLabel,
    tableErrors, bestOneNeuron, canOneNeuron, twoLayer, updateRule, trainNeuron,
    makeFireTask, makeHiddenTask, makeOutputTask, makeStage2Task, makeUpdateTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.neural = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

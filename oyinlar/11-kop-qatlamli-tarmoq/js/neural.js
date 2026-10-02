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

  const tierOf = (tier) => Math.max(0, Math.min(2, tier || 0));

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

  // To'g'ri son + chalg'ituvchilar (avval berilgan nomzodlar, keyin qo'shni sonlar) — jami `count` ta, takrorsiz
  function numberOptions(answer, candidates, rng, count) {
    const out = [answer];
    const add = (v) => { if (out.length < (count || 4) && !out.includes(v)) out.push(v); };
    candidates.forEach(add);
    for (let d = 1; out.length < (count || 4); d++) {
      add(answer + d);
      add(answer - d);
    }
    return shuffle(out, rng);
  }

  // Og'irlik: tier 0 — faqat +1 / −1; tier 1, 2 — −2..2 (0 bo'lmaydi)
  const weightFor = (t, rng) => (t === 0 ? (rng() < 0.65 ? 1 : -1) : pick([-2, -1, 1, 2], rng));

  // 1-bosqich: ikki qadam — avval yig'indi (4 variant), keyin "yonadimi?".
  // tier 0: 3 kirish, og'irlik ±1, chegara 1..2; tier 1: og'irlik −2..2, chegara 1..3; tier 2: 4 kirish, chegara 1..4.
  function makeFireTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    const n = t >= 2 ? 4 : 3;
    for (;;) {
      const inputs = bits(n, rng);
      const weights = Array.from({ length: n }, () => weightFor(t, rng));
      const threshold = randInt(1, [2, 3, 4][t], rng);
      if (!inputs.some((x) => x)) continue;
      if (!weights.some((w) => w > 0)) continue;
      if (t >= 1 && inputs.filter((x) => x).length < 2) continue; // bitta chiroq — qo'shadigan narsa yo'q
      const sum = weightedSum(inputs, weights);
      const answer = sum >= threshold;
      if (prev && prev.answer === answer && rng() < 0.5) continue; // javoblar aralash chiqsin
      if (prev && prev.inputs.join() === inputs.join() && prev.weights.join() === weights.join() && prev.threshold === threshold) continue;
      // Chalg'ituvchilar — tipik xatolar: hamma og'irlikni qo'shish, yoniq chiroqlarni sanash, chegarani aytish
      const all = weights.reduce((a, b) => a + b, 0);
      const lit = inputs.filter((x) => x).length;
      const sumOptions = numberOptions(sum, [all, lit, threshold], rng, 4);
      return { type: "fire", inputs, weights, threshold, answer, sum, sumOptions, sumIndex: sumOptions.indexOf(sum), tier: t };
    }
  }

  // 3×3 rasm: kerakli yashirin holat bilan. density — ortiqcha bo'yalgan kataklar ulushi (ko'p bo'lsa chiziqni ko'rish qiyin)
  function makeImage(label, rng, density) {
    const keep = density || 0.6;
    for (;;) {
      const image = bits(9, rng).map((x) => (x && rng() < keep ? 1 : 0));
      if (label === "ikkalasi" || label === "faqat tik") [1, 4, 7].forEach((i) => { image[i] = 1; });
      if (label === "ikkalasi" || label === "faqat yotiq") [3, 4, 5].forEach((i) => { image[i] = 1; });
      if (hiddenLabel(image) === label) return image;
    }
  }

  const LABELS = ["ikkalasi", "faqat tik", "faqat yotiq", "hech biri"];
  const OUTPUTS = ["krest", "chiziq", "boshqa"];
  const DENSITY = [0.6, 0.8, 1]; // tier bo'yicha: rasm "shovqini" ortadi
  const filledCount = (image) => image.reduce((a, b) => a + b, 0);

  // 2-bosqich: "Qaysi neyronlar yonadi?" (4 variant)
  function makeHiddenTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    for (;;) {
      const label = pick(LABELS, rng);
      const image = makeImage(label, rng, DENSITY[t]);
      if (t >= 1 && filledCount(image) < 4) continue; // yuqori zinada deyarli bo'sh rasm chiqmaydi
      if (prev && prev.image && prev.image.join() === image.join()) continue;
      return { type: "hidden", image, answer: label, options: LABELS, tier: t };
    }
  }

  // 2-bosqich: "Tarmoq nima deydi?" — chiqish qatlamida 3 ta neyron bor, shuning uchun bu savol yolg'iz kelmaydi:
  // makeBothTask da avval 1-qatlam (4 variant), keyin chiqish so'raladi.
  function makeOutputTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    for (;;) {
      const image = makeImage(pick(LABELS, rng), rng, DENSITY[t]);
      if (prev && prev.image && prev.image.join() === image.join()) continue;
      return { type: "output", image, answer: output(image), options: OUTPUTS, tier: t };
    }
  }

  // 2-bosqich: ikki qadam — "1-qatlamda qaysi neyronlar yonadi?" (4 variant) → "tarmoq nima deydi?" (3 variant)
  function makeBothTask(prev, rng, tier) {
    const h = makeHiddenTask(prev, rng, tier);
    return { type: "both", image: h.image, hidden: h.answer, hiddenOptions: LABELS, answer: output(h.image), options: OUTPUTS, tier: h.tier };
  }

  // Mashq tartibi: avval faqat 1-qatlam, keyin ikki qadamli (1-qatlam → chiqish)
  const makeStage2Task = (k, prev, rng, tier) => {
    rng = rng || Math.random;
    return k === 0 ? makeHiddenTask(prev, rng, tier) : makeBothTask(prev, rng, tier);
  };

  // 3-bosqich: neyron xato qildi — ikki qadam: "oshiramizmi / kamaytiramizmi?" va
  // "yoniq kirishlarning og'irligi 1 ga o'zgarsa, yangi yig'indi nechchi?" (4 variant).
  // tier 0: 3 kirish, og'irlik −1..2, chegara 1..3; tier 1: og'irlik −2..3; tier 2: 4 kirish, chegara 1..4.
  function makeUpdateTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    const n = t >= 2 ? 4 : 3;
    for (;;) {
      const inputs = bits(n, rng);
      if (!inputs.some((x) => x)) continue;
      const weights = Array.from({ length: n }, () => (t === 0 ? randInt(-1, 2, rng) : randInt(-2, 3, rng)));
      const threshold = randInt(1, t >= 2 ? 4 : 3, rng);
      const lit = inputs.filter((x) => x).length;
      if (t >= 1 && lit < 2) continue;
      const out = fire(inputs, weights, threshold);
      const target = !out; // xato bo'lishi uchun kerakli javob — teskarisi
      const answer = updateRule(target, out);
      if (prev && prev.answer === answer && rng() < 0.5) continue;
      if (prev && prev.inputs.join() === inputs.join() && prev.weights.join() === weights.join()) continue;
      const sum = weightedSum(inputs, weights);
      const step = answer === "oshir" ? lit : -lit; // har yoniq kirish og'irligi 1 ga o'zgaradi
      const newSum = sum + step;
      // Chalg'ituvchilar: teskari tomonga, o'zgarmagan, faqat 1 ga o'zgargan, hamma kirish o'zgargan
      const newSumOptions = numberOptions(newSum, [sum - step, sum, sum + Math.sign(step), sum + Math.sign(step) * n], rng, 4);
      return {
        type: "update", inputs, weights, threshold, target, output: out, answer,
        sum, lit, newSum, newSumOptions, newSumIndex: newSumOptions.indexOf(newSum), tier: t,
      };
    }
  }

  const api = {
    DEMO, TIK, YOTIQ, LINE_THRESHOLD, TABLES, THRESHOLDS, LABELS, OUTPUTS,
    weightedSum, fire, hidden, output, hiddenLabel,
    tableErrors, bestOneNeuron, canOneNeuron, twoLayer, updateRule, trainNeuron,
    numberOptions, makeFireTask, makeHiddenTask, makeOutputTask, makeBothTask, makeStage2Task, makeUpdateTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.neural = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

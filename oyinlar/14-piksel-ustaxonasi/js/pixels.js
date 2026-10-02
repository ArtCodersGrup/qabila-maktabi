// Piksel ustaxonasi — sof hisob: palitralar, eng kamida nechta bit, qator bo'laklari (siqish),
// rang aralashtirish, surat hajmi va topshiriqlar. Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  // 2-bosqich: 4 rang va ularning 2 bitli kodlari
  const PALETTE4 = [
    { name: "oq", color: "#FFFFFF", code: "00" },
    { name: "qizil", color: "#E0524A", code: "01" },
    { name: "yashil", color: "#1A9E77", code: "10" },
    { name: "koʻk", color: "#2F6FDE", code: "11" },
  ];

  // Mashqdagi rasmlar uchun 16 ta rang (birinchi 2 tasi — oq-qora, birinchi 4 tasi — PALETTE4)
  const PALETTE16 = [
    "#FFFFFF", "#2B2B3A", "#1A9E77", "#2F6FDE", "#E0524A", "#F0C040", "#8E5BD0", "#F08A24",
    "#9FC6E8", "#C98B5E", "#7ED3A8", "#F4A6B8", "#8A929A", "#5A3A1E", "#C8E06A", "#1E3A5F",
  ];

  // Ta'rif jadvali: ranglar soni → bit
  const COLOR_TABLE = [[2, 1], [4, 2], [8, 3], [16, 4], [256, 8]];
  const BPP_COLORS = [2, 3, 4, 5, 8, 10, 16, 20, 32, 50, 64, 100, 256];

  // Rang aralashtirish: [qizil, yashil, ko'k], har biri 0 yoki 1
  const MIX_NAMES = {
    "000": "qora", "100": "qizil", "010": "yashil", "001": "koʻk",
    "110": "sariq", "101": "pushti", "011": "havorang", "111": "oq",
  };
  const TARGETS = [[1, 1, 0], [1, 1, 1]];

  // 3-bosqich: siqish namunasi — 6 ko'k, 2 oq, 2 ko'k (1 — ko'k, 0 — oq)
  const DEMO_ROW = [1, 1, 1, 1, 1, 1, 0, 0, 1, 1];

  // Telefon surati: 4000 × 3000, har piksel 3 bayt
  const PHOTO = { w: 4000, h: 3000, pixels: 12000000, bytes: 36000000, mb: Math.round(36000000 / 1024 / 1024) };

  function minBits(n) {
    let k = 0;
    while (2 ** k < n) k++;
    return k;
  }

  const code = (index, bits) => index.toString(2).padStart(bits, "0");
  const mixName = (rgb) => MIX_NAMES[rgb.join("")];
  const mixCss = (rgb) => `rgb(${rgb.map((v) => v * 255).join(", ")})`;

  // Qatorni bo'laklarga ajratish: [1,1,0] → [{value:1,count:2},{value:0,count:1}]
  function runs(row) {
    const out = [];
    for (const value of row) {
      const last = out[out.length - 1];
      if (last && last.value === value) last.count++;
      else out.push({ value, count: 1 });
    }
    return out;
  }

  const randInt = (a, b, rng) => a + Math.floor(rng() * (b - a + 1));
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];

  // Tasodifiy rasm: kamida 2 xil rang bo'lsin
  function randomCells(n, colors, rng) {
    for (;;) {
      const cells = Array.from({ length: n }, () => (colors === 2 ? (rng() < 0.4 ? 1 : 0) : Math.floor(rng() * colors)));
      if (new Set(cells).size >= 2) return cells;
    }
  }

  // Takrorni tekshirish uchun savolning o'zi (rasmdagi tasodifiy kataklarsiz)
  const taskKey = (t) => ({ type: t.type, w: t.w, h: t.h, colors: t.colors, row: t.row && t.row.join(""), mb: t.mb, kb: t.kb, n: t.n, each: t.each });
  const same = (a, b) => !!a && JSON.stringify(taskKey(a)) === JSON.stringify(taskKey(b));

  // Kenglik va balandlik: a..b oralig'ida, maydon limit ichida, ixtiyoriy shart bilan
  function size(a, b, maxArea, rng, ok) {
    for (;;) {
      const w = randInt(a, b, rng);
      const h = randInt(a, b, rng);
      if (w * h <= maxArea && w * h >= 4 && (!ok || ok(w * h))) return { w, h };
    }
  }

  // Qiyinlik zinasi (QOIDALAR 4.3): chegaralar tier 0 / 1 / 2 bo'yicha
  const BW_SIZE = [{ a: 3, b: 10, area: 100 }, { a: 5, b: 12, area: 144 }, { a: 4, b: 16, area: 256 }]; // 1-bosqich
  const BPP_TIER = [[2, 3, 4, 5, 8, 10, 16], BPP_COLORS, [20, 32, 50, 64, 100, 200, 256, 500, 1000]]; // 2-bosqich: ranglar soni
  const COLOR_SIZE = [{ b: 8, bits: 100 }, { b: 10, bits: 160 }, { b: 12, bits: 256 }]; // 2-bosqich: rasm (bitda)
  const RGB_SIZE = [{ a: 2, b: 6, area: 33 }, { a: 3, b: 8, area: 50 }, { a: 4, b: 10, area: 80 }]; // 3-bosqich: × 3 bayt
  const RUNS = [{ r: [2, 5], len: [8, 12] }, { r: [3, 6], len: [10, 14] }, { r: [4, 8], len: [12, 16] }]; // qisqa yozuv
  const CMP_MB = [[1, 5], [2, 9], [6, 20]]; // taqqoslashdagi Mbayt

  // 1-bosqich mashqi: oq-qora rasm necha bit / necha bayt
  function makeBwTask(prev, rng, tier) {
    rng = rng || Math.random;
    const lim = BW_SIZE[tier || 0];
    for (;;) {
      const type = rng() < 0.5 ? "bits" : "bytes";
      const { w, h } = size(lim.a, lim.b, lim.area, rng, type === "bytes" ? (area) => area % 8 === 0 : null);
      const task = { type, w, h, cells: randomCells(w * h, 2, rng), answer: type === "bits" ? w * h : (w * h) / 8 };
      if (!same(prev, task)) return task;
    }
  }

  // 2-bosqich mashqi: N rangga nechta bit / rasm necha bit
  function makeColorTask(prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (;;) {
      let task;
      if (rng() < 0.5) {
        const colors = pick(BPP_TIER[tier], rng);
        task = { type: "bpp", colors, answer: minBits(colors) };
      } else {
        const colors = pick([2, 4, 16], rng);
        const bpp = minBits(colors);
        const lim = COLOR_SIZE[tier];
        const { w, h } = size(2, lim.b, Math.floor(lim.bits / bpp), rng);
        task = { type: "size", colors, bpp, w, h, cells: randomCells(w * h, colors, rng), answer: w * h * bpp };
      }
      if (!same(prev, task)) return task;
    }
  }

  // Tasodifiy qator: L piksel, r bo'lak
  function randomRow(rng, tier) {
    const lim = RUNS[tier || 0];
    const r = randInt(lim.r[0], lim.r[1], rng);
    const len = randInt(Math.max(lim.len[0], r), lim.len[1], rng);
    const parts = Array(r).fill(1);
    for (let k = r; k < len; k++) parts[Math.floor(rng() * r)]++;
    let value = rng() < 0.5 ? 1 : 0;
    const row = [];
    for (const n of parts) {
      for (let k = 0; k < n; k++) row.push(value);
      value = 1 - value;
    }
    return row;
  }

  // "Qaysi biri eng katta?" — uch karta: m Mbayt, k Kbayt, n ta surat × s Mbayt — va "Uchalasi teng" (4 variant).
  // Qiymatlar Kbaytda: m × 1024, k, n × s × 1024. Yo bitta eng katta, yo uchalasi teng.
  const cmpSizes = (t) => ({ mb: t.mb * 1024, kb: t.kb, photos: t.n * t.each * 1024 });
  function cmpAnswer(t) {
    const v = cmpSizes(t);
    if (v.mb === v.kb && v.mb === v.photos) return "teng";
    const max = Math.max(v.mb, v.kb, v.photos);
    return ["mb", "kb", "photos"].find((k) => v[k] === max);
  }
  const CMP_OPTIONS = ["mb", "kb", "photos", "teng"];
  // total Mbayt ni "n ta surat × s Mbayt" ga yoyish (n ≥ 2 bo'lsa — yaxshi)
  function split(total, rng) {
    const ns = [2, 3, 4, 5].filter((n) => total % n === 0 && total / n >= 1);
    const n = ns.length ? pick(ns, rng) : 1;
    return { n, each: total / n };
  }
  function makeCompareTask(rng, tier) {
    const [lo, hi] = CMP_MB[tier];
    for (;;) {
      const mb = randInt(lo, hi, rng);
      const equal = rng() < 0.2;
      const total = equal ? mb : mb + pick([-2, -1, 1, 2], rng);
      if (total < 1) continue;
      // 1000 ≠ 1024 tuzog'i: 1000·m Kbayt < m Mbayt < 1000·(m + 1) Kbayt
      const kb = equal ? mb * 1024 : 1000 * (mb + (rng() < 0.5 ? 0 : 1));
      const task = Object.assign({ type: "compare", mb, kb }, split(total, rng));
      const v = cmpSizes(task);
      const top = Math.max(v.mb, v.kb, v.photos);
      if ([v.mb, v.kb, v.photos].filter((x) => x === top).length === 2) continue; // ikkitasi teng — savol noaniq
      task.answer = cmpAnswer(task);
      return task;
    }
  }

  // 3-bosqich mashqi: rangli rasm necha bayt, qisqa yozuv, Mbayt va Kbayt;
  // tier 1+ da yana: kam rangli rasm necha BAYT (kenglik × balandlik × bit : 8)
  function makePhotoTask(prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (;;) {
      const r = rng();
      let task;
      if (tier > 0 && r < 0.25) {
        const colors = pick([4, 16], rng);
        const bpp = minBits(colors);
        const lim = COLOR_SIZE[tier];
        const { w, h } = size(2, lim.b, Math.floor(lim.bits / bpp), rng, (area) => (area * bpp) % 8 === 0);
        task = { type: "cbytes", colors, bpp, w, h, cells: randomCells(w * h, colors, rng), answer: (w * h * bpp) / 8 };
      } else if (r < 0.5) {
        const lim = RGB_SIZE[tier];
        const { w, h } = size(lim.a, lim.b, lim.area, rng);
        task = { type: "rgb", w, h, cells: randomCells(w * h, 16, rng), answer: w * h * 3 };
      } else if (r < 0.75) {
        const row = randomRow(rng, tier);
        task = { type: "runs", row, answer: runs(row).length };
      } else {
        task = makeCompareTask(rng, tier);
      }
      if (!same(prev, task)) return task;
    }
  }

  const api = {
    PALETTE4, PALETTE16, COLOR_TABLE, BPP_COLORS, MIX_NAMES, TARGETS, DEMO_ROW, PHOTO,
    minBits, code, mixName, mixCss, runs, taskKey,
    makeBwTask, makeColorTask, makePhotoTask,
    BW_SIZE, BPP_TIER, COLOR_SIZE, RGB_SIZE, RUNS, CMP_MB, CMP_OPTIONS, cmpSizes, cmpAnswer,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.pixels = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

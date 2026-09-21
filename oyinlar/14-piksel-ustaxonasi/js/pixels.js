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
  const taskKey = (t) => ({ type: t.type, w: t.w, h: t.h, colors: t.colors, row: t.row && t.row.join(""), mb: t.mb, kb: t.kb });
  const same = (a, b) => !!a && JSON.stringify(taskKey(a)) === JSON.stringify(taskKey(b));

  // Kenglik va balandlik: a..b oralig'ida, maydon limit ichida, ixtiyoriy shart bilan
  function size(a, b, maxArea, rng, ok) {
    for (;;) {
      const w = randInt(a, b, rng);
      const h = randInt(a, b, rng);
      if (w * h <= maxArea && w * h >= 4 && (!ok || ok(w * h))) return { w, h };
    }
  }

  // 1-bosqich mashqi: oq-qora rasm necha bit / necha bayt
  function makeBwTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const type = rng() < 0.5 ? "bits" : "bytes";
      const { w, h } = size(3, 10, 100, rng, type === "bytes" ? (area) => area % 8 === 0 : null);
      const task = { type, w, h, cells: randomCells(w * h, 2, rng), answer: type === "bits" ? w * h : (w * h) / 8 };
      if (!same(prev, task)) return task;
    }
  }

  // 2-bosqich mashqi: N rangga nechta bit / rasm necha bit
  function makeColorTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      let task;
      if (rng() < 0.5) {
        const colors = pick(BPP_COLORS, rng);
        task = { type: "bpp", colors, answer: minBits(colors) };
      } else {
        const colors = pick([2, 4, 16], rng);
        const bpp = minBits(colors);
        const { w, h } = size(2, 8, Math.floor(100 / bpp), rng);
        task = { type: "size", colors, bpp, w, h, cells: randomCells(w * h, colors, rng), answer: w * h * bpp };
      }
      if (!same(prev, task)) return task;
    }
  }

  // Tasodifiy qator: L piksel, r bo'lak
  function randomRow(rng) {
    const r = randInt(2, 5, rng);
    const len = randInt(Math.max(8, r), 12, rng);
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

  // 3-bosqich mashqi: rangli rasm necha bayt, qisqa yozuv, Mbayt va Kbayt
  function makePhotoTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const r = rng();
      let task;
      if (r < 1 / 3) {
        const { w, h } = size(2, 6, 33, rng);
        task = { type: "rgb", w, h, cells: randomCells(w * h, 16, rng), answer: w * h * 3 };
      } else if (r < 2 / 3) {
        const row = randomRow(rng);
        task = { type: "runs", row, answer: runs(row).length };
      } else {
        const mb = randInt(1, 5, rng);
        const kb = 1000 * (mb + (rng() < 0.5 ? 0 : 1));
        task = { type: "compare", mb, kb, answer: mb * 1024 > kb ? "mb" : "kb" };
      }
      if (!same(prev, task)) return task;
    }
  }

  const api = {
    PALETTE4, PALETTE16, COLOR_TABLE, BPP_COLORS, MIX_NAMES, TARGETS, DEMO_ROW, PHOTO,
    minBits, code, mixName, mixCss, runs, taskKey,
    makeBwTask, makeColorTask, makePhotoTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.pixels = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

// Xotira ombori — sof hisob: birliklar zinapoyasi, bitga aylantirish, taqqoslash, fayllar,
// disk (1000 va 1024) va topshiriqlar. Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const UNITS = ["bit", "bayt", "Kbayt", "Mbayt", "Gbayt", "Tbayt"];

  // UNITS[i] dan UNITS[i + 1] ga: 8 bit = 1 bayt, qolganlari 1024
  const factor = (i) => (i === 0 ? 8 : 1024);

  function toBits(n, unit) {
    let bits = n;
    for (let i = 0; i < UNITS.indexOf(unit); i++) bits *= factor(i);
    return bits;
  }

  // 1 — a katta, -1 — b katta, 0 — teng
  const compare = (a, b) => Math.sign(toBits(a.n, a.unit) - toBits(b.n, b.unit));

  // 2-bosqich: kundalik fayllar (aralash tartibda ko'rsatiladi)
  const ITEMS = [
    { id: "sms", name: "SMS", n: 100, unit: "bayt" },
    { id: "song", name: "Qoʻshiq", n: 4, unit: "Mbayt" },
    { id: "page", name: "Kitob sahifasi", n: 2, unit: "Kbayt" },
    { id: "film", name: "Film", n: 2, unit: "Gbayt" },
    { id: "photo", name: "Telefon surati", n: 3, unit: "Mbayt" },
  ];
  const ORDER = ["sms", "page", "photo", "song", "film"];

  // Do'kondagi "1 Tbayt" = 10¹² bayt; kompyuter 1024 bilan sanaydi
  const DISK = { tb: 1, bytes: 1e12, gb: Math.floor(1e12 / 1024 ** 3) };
  // 3-bosqich namunalari: 8 Gbayt fleshka va 2 Gbayt film; 1 Gbayt va 256 Mbayt video
  const FLASH = { gb: 8, film: 2 };
  const CROSS = { gb: 1, mb: 256 };

  const randInt = (a, b, rng) => a + Math.floor(rng() * (b - a + 1));
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];
  const shuffle = (list, rng) => {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const same = (a, b) => !!a && JSON.stringify(a) === JSON.stringify(b);

  // To'g'ri birlik va yana 3 ta boshqasi (savoldagi birlikdan tashqari)
  function unitOptions(answer, exclude, rng) {
    const others = shuffle(UNITS.filter((u) => u !== answer && u !== exclude), rng).slice(0, 3);
    return shuffle([answer, ...others], rng);
  }

  // Qiyinlik zinasi (QOIDALAR 4.3): tier 0 — bir pog'ona, tier 1 — ikki pog'ona, tier 2 — pog'onalar soni ham.
  const NUMBER_OPTIONS = ["8", "10", "1000", "1024"];
  const STEP_OPTIONS = ["1", "2", "3", "4"];

  // 1-bosqich mashqi: "1 Mbayt = 1024 ___", "1 Gbayt = ___ Mbayt", "Kbaytdan keyingisi?" (hammasi 4 variant);
  // tier 1+: ikki pog'ona ("1 Gbayt = 1024 × 1024 ___", "ikki pog'ona keyin"); tier 2: "necha marta × 1024?"
  function makeLadderTask(prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (;;) {
      const r = rng();
      const hard = tier > 0 && rng() < (tier === 2 ? 0.75 : 0.5);
      let task;
      if (hard && tier === 2 && r < 1 / 3) {
        // baytdan yuqorida hamma qadam × 1024: i dan j gacha nechta qadam
        const i = randInt(1, 4, rng);
        const j = randInt(i + 1, 5, rng);
        task = { type: "steps", i, j, text: `${UNITS[i]} → ${UNITS[j]}: necha marta × 1024?`, answer: String(j - i), options: STEP_OPTIONS };
      } else if (hard && r < 2 / 3) {
        const i = randInt(2, 5, rng);
        task = {
          type: "unit2", i, text: `1 ${UNITS[i]} = ${factor(i - 1)} × ${factor(i - 2)} ___`,
          answer: UNITS[i - 2], options: unitOptions(UNITS[i - 2], UNITS[i], rng),
        };
      } else if (hard) {
        const i = randInt(0, 3, rng);
        task = { type: "next2", i, text: `${UNITS[i]}dan ikki pogʻona keyin?`, answer: UNITS[i + 2], options: unitOptions(UNITS[i + 2], UNITS[i], rng) };
      } else if (r < 1 / 3) {
        const i = randInt(1, 5, rng);
        task = { type: "unit", i, text: `1 ${UNITS[i]} = ${factor(i - 1)} ___`, answer: UNITS[i - 1], options: unitOptions(UNITS[i - 1], UNITS[i], rng) };
      } else if (r < 2 / 3) {
        const i = randInt(1, 5, rng);
        task = { type: "number", i, text: `1 ${UNITS[i]} = ___ ${UNITS[i - 1]}`, answer: String(factor(i - 1)), options: NUMBER_OPTIONS };
      } else {
        const i = randInt(0, 4, rng);
        task = { type: "next", i, text: `${UNITS[i]}dan keyingisi?`, answer: UNITS[i + 1], options: unitOptions(UNITS[i + 1], UNITS[i], rng) };
      }
      if (!same(prev, task)) return task;
    }
  }

  // 2-bosqich mashqi: "Qaysi biri eng katta?" — uch karta va "Uchalasi teng" (4 variant).
  // Kartalar: k U (katta birlik), m u (kichik birlik; 1000 ≠ 1024 tuzog'i), a U + b u (yig'indi).
  // value — kichik birlikda. Yo bitta eng katta, yo uchalasi teng (2 Gbayt = 2048 Mbayt = 1 Gbayt + 1024 Mbayt).
  const HUNDREDS = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  const CMP_K = [[1, 3], [2, 6], [4, 9]];
  const TENG = 3; // javob indeksi: 0–2 — karta, 3 — "Uchalasi teng"
  function makeCompareTask(prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (;;) {
      const bi = randInt(2, 5, rng); // katta birlik: Kbayt … Tbayt
      const U = UNITS[bi];
      const u = UNITS[bi - 1];
      const k = randInt(CMP_K[tier][0], CMP_K[tier][1], rng);
      const equal = rng() < 0.2;
      if (equal && k < 2) continue;
      const big = { label: `${k} ${U}`, value: k * 1024 };
      const m = equal ? k * 1024 : 1000 * k + pick([0, 500, 1000], rng);
      const small = { label: `${m} ${u}`, value: m };
      const a = equal ? k - 1 : k - (k > 1 && rng() < 0.5 ? 1 : 0);
      const b2 = equal ? 1024 : pick(a < k ? [500, 900, 1000, 1100] : HUNDREDS.slice(0, 5), rng);
      const sum = { label: `${a} ${U} + ${b2} ${u}`, value: a * 1024 + b2 };
      const cards = shuffle([big, small, sum], rng);
      const top = Math.max(...cards.map((c) => c.value));
      const tops = cards.filter((c) => c.value === top).length;
      if (tops === 2) continue; // ikkitasi teng — savol noaniq
      const task = { type: equal ? "equal" : "mixed", unit: U, small: u, cards, answer: tops === 3 ? TENG : cards.findIndex((c) => c.value === top) };
      if (!same(prev, task)) return task;
    }
  }

  const SAME = [
    { device: "Fleshka", file: "film", unit: "Gbayt" },
    { device: "Telefon", file: "oʻyin", unit: "Gbayt" },
    { device: "Pleyer", file: "qoʻshiq", unit: "Mbayt" },
    { device: "Xotira kartasi", file: "surat", unit: "Mbayt" },
  ];
  const CROSS_CTX = [
    { device: "Fleshka", file: "video", unit: "Gbayt" },
    { device: "Xotira", file: "surat", unit: "Mbayt" },
  ];
  const CROSS_CAP = [[1, 2], [1, 4], [2, 4]]; // turli birlik: xotira (katta birlikda)
  const CROSS_SIZE = [[128, 256, 512], [64, 128, 256, 512], [64, 128, 256, 512]];

  // 3-bosqich mashqi: nechta sig'adi (bir xil / turli birlik); tier 1+: "yana nechta sig'adi?" (ikki amal)
  function makeFitTask(prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (;;) {
      let task;
      const r = rng();
      if (tier > 0 && r < 1 / 3) {
        // Xotiraga used ta fayl yozilgan — yana nechta sig'adi
        const ctx = pick(SAME, rng);
        const cap = pick([16, 32, 64, 128], rng);
        const size = pick([1, 2, 4, 8, 16].filter((f) => cap / f >= 4 && cap / f <= 64), rng);
        const used = randInt(1, cap / size - 2, rng);
        task = { type: "left", device: ctx.device, file: ctx.file, cap, capUnit: ctx.unit, size, sizeUnit: ctx.unit, used, answer: cap / size - used };
      } else if (tier < 2 && r < 2 / 3) {
        const ctx = pick(SAME, rng);
        const cap = pick([8, 16, 32, 64, 128], rng);
        const size = pick([1, 2, 4, 8, 16, 32].filter((f) => cap / f >= 2 && cap / f <= 64), rng);
        task = { type: "same", device: ctx.device, file: ctx.file, cap, capUnit: ctx.unit, size, sizeUnit: ctx.unit, answer: cap / size };
      } else {
        const ctx = pick(CROSS_CTX, rng);
        const cap = randInt(CROSS_CAP[tier][0], CROSS_CAP[tier][1], rng);
        const size = pick(CROSS_SIZE[tier], rng);
        const small = UNITS[UNITS.indexOf(ctx.unit) - 1];
        task = { type: "cross", device: ctx.device, file: ctx.file, cap, capUnit: ctx.unit, size, sizeUnit: small, answer: (cap * 1024) / size };
      }
      if (!same(prev, task)) return task;
    }
  }

  const api = {
    UNITS, factor, toBits, compare, ITEMS, ORDER, DISK, FLASH, CROSS,
    makeLadderTask, makeCompareTask, makeFitTask,
    NUMBER_OPTIONS, STEP_OPTIONS, CMP_K, TENG, CROSS_CAP, CROSS_SIZE,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.units = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

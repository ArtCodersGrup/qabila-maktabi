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

  // 1-bosqich mashqi: "1 Mbayt = 1024 ___", "1 Gbayt = ___ Mbayt", "Kbaytdan keyingisi?"
  function makeLadderTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const r = rng();
      let task;
      if (r < 1 / 3) {
        const i = randInt(1, 5, rng);
        task = { type: "unit", i, text: `1 ${UNITS[i]} = ${factor(i - 1)} ___`, answer: UNITS[i - 1], options: unitOptions(UNITS[i - 1], UNITS[i], rng) };
      } else if (r < 2 / 3) {
        const i = randInt(1, 5, rng);
        const options = i === 1 ? ["8", "10", "1024"] : ["8", "1000", "1024"];
        task = { type: "number", i, text: `1 ${UNITS[i]} = ___ ${UNITS[i - 1]}`, answer: String(factor(i - 1)), options };
      } else {
        const i = randInt(0, 4, rng);
        task = { type: "next", i, text: `${UNITS[i]}dan keyingisi?`, answer: UNITS[i + 1], options: unitOptions(UNITS[i + 1], UNITS[i], rng) };
      }
      if (!same(prev, task)) return task;
    }
  }

  // 2-bosqich mashqi: "Qaysi biri katta?" — a yoki b (answer: 0 yoki 1)
  const HUNDREDS = [100, 200, 300, 400, 500, 600, 700, 800, 900];
  function makeCompareTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const r = rng();
      let type;
      let big;
      let small;
      if (r < 1 / 3) {
        type = "same";
        const unit = pick(["Kbayt", "Mbayt", "Gbayt"], rng);
        const [x, y] = shuffle(HUNDREDS, rng);
        big = { n: Math.max(x, y), unit };
        small = { n: Math.min(x, y), unit };
      } else {
        const bi = randInt(2, 5, rng); // katta birlik: Kbayt … Tbayt
        if (r < 2 / 3) {
          type = "adjacent";
          big = { n: randInt(1, 9, rng), unit: UNITS[bi] };
          small = { n: pick(HUNDREDS, rng), unit: UNITS[bi - 1] };
        } else {
          type = "trap";
          const k = randInt(1, 3, rng);
          const bigger = { n: k, unit: UNITS[bi] };
          const other = { n: 1000 * k + (rng() < 0.5 ? 0 : 500), unit: UNITS[bi - 1] };
          [big, small] = compare(bigger, other) > 0 ? [bigger, other] : [other, bigger];
        }
      }
      const bigFirst = rng() < 0.5;
      const task = { type, a: bigFirst ? big : small, b: bigFirst ? small : big, answer: bigFirst ? 0 : 1 };
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

  // 3-bosqich mashqi: nechta sig'adi (bir xil / turli birlik)
  function makeFitTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      let task;
      if (rng() < 0.5) {
        const ctx = pick(SAME, rng);
        const cap = pick([8, 16, 32, 64, 128], rng);
        const size = pick([1, 2, 4, 8, 16, 32].filter((f) => cap / f >= 2 && cap / f <= 64), rng);
        task = { type: "same", device: ctx.device, file: ctx.file, cap, capUnit: ctx.unit, size, sizeUnit: ctx.unit, answer: cap / size };
      } else {
        const ctx = pick(CROSS_CTX, rng);
        const cap = randInt(1, 2, rng);
        const size = pick([128, 256, 512], rng);
        const small = UNITS[UNITS.indexOf(ctx.unit) - 1];
        task = { type: "cross", device: ctx.device, file: ctx.file, cap, capUnit: ctx.unit, size, sizeUnit: small, answer: (cap * 1024) / size };
      }
      if (!same(prev, task)) return task;
    }
  }

  const api = {
    UNITS, factor, toBits, compare, ITEMS, ORDER, DISK, FLASH, CROSS,
    makeLadderTask, makeCompareTask, makeFitTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.units = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

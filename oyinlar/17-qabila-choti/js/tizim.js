// Qabila cho'ti — shu o'yin topshiriqlari: cho'tni o'qish, noto'g'ri raqamni topish, eng kichik asos,
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

  function shuffle(list, rng) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // Qiyinlik zinasi (QOIDALAR 4.3): tier 0 — birinchi javoblar, 1 — o'rta, 2 — oxirgi va qiyin rejim.

  // 1-bosqich: cho'tdagi son / yana 1 qo'shilsa.
  // tier 0 — 3 sim; tier 1 — 3 sim, "+1" da ko'chish ikki simdan o'tishi mumkin; tier 2 — 4 sim (asos 2…6, son ≤ 255)
  function makeChotiTask(prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (;;) {
      const rods = tier === 2 ? 4 : 3;
      const base = randInt(2, tier === 2 ? 6 : 9, rng);
      const top = Math.min(base ** rods - 1, tier === 2 ? 255 : base ** 3 - 1); // eng katta son
      let task;
      if (rng() < 0.5) {
        const value = randInt(base ** (rods - 1), top, rng);
        task = { type: "read", base, rods, value, answer: S.toBase(value, base) };
      } else {
        // oxirgi raqam n−1 (tier 1+ da ba'zan oxirgi ikki raqam ham): v + 1 hali simlarga sig'adi
        const step = tier >= 1 && rng() < 0.5 ? base ** 2 : base;
        const kMax = Math.floor((top - step) / step); // step·k + step − 1 + 1 ≤ top
        if (kMax < 1) continue;
        const value = step * randInt(1, kMax, rng) + step - 1;
        task = { type: "next", base, rods, value, answer: S.toBase(value + 1, base) };
      }
      if (!same(prev, task)) return task;
    }
  }

  // 2-bosqich: noto'g'ri raqamni top / eng kamida qaysi tizim / 16-likdagi harf qiymati
  // valid: javob — xato raqamning o'rni (0 dan) yoki −1 ("hammasi to'g'ri"). Uzunlik tier bo'yicha 3 / 4 / 5 —
  // ya'ni 4 / 5 / 6 variant (2 variantli "ha / yo'q" emas).
  function makeDigitTask(prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (;;) {
      const r = rng();
      const letterShare = tier === 0 ? 0.25 : 0.1;
      let task;
      if (r < 0.45) {
        const good = rng() < 0.3;
        const len = 3 + tier;
        // tier 2: harfli tizimlar (12-lik, 16-lik) — "harf — xato" degan taxminni sinaydi
        const base = good
          ? pick(tier === 2 ? [5, 8, 12, 16] : [2, 3, 5, 8, 16], rng)
          : pick(tier === 2 ? [2, 5, 8, 12] : [2, 3, 5, 8, 10], rng);
        let number = randomNumber(base, len, rng);
        let answer = -1;
        if (!good) {
          // bitta raqamni asosdan katta yoki teng raqamga almashtiramiz (tier 2 da — aynan asosga teng: 8-likda 8)
          answer = randInt(0, len - 1, rng);
          const bad = S.digitChar(tier === 2 ? base : randInt(base, Math.min(base + 3, 15), rng));
          number = number.slice(0, answer) + bad + number.slice(answer + 1);
        }
        task = { type: "valid", base, number, answer };
      } else if (r < 1 - letterShare) {
        const top = randInt(tier === 2 ? 5 : 2, 15, rng); // eng katta raqam
        const len = tier === 2 ? randInt(4, 5, rng) : randInt(3, 4, rng);
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
    { text: "XXVII", kind: "nopoz", why: "Rim raqamlari: X doim 10, V doim 5, I doim 1" },
    { text: "MDC", kind: "nopoz", why: "Rim raqamlari: M doim 1000, D doim 500, C doim 100" },
    { text: "1011₂", kind: "poz", why: "Ikkilik: xonalar 8, 4, 2, 1 — joyi muhim" },
    { text: "7E₁₆", kind: "poz", why: "Oʻn oltilik: 7 — oʻn oltilar xonasida" },
    { text: "305₈", kind: "poz", why: "Sakkizlik: 3 — 64 lar xonasida" },
    { text: "2024", kind: "poz", why: "Oʻnlik: birinchi 2 — ming, oxirgi 4 — birlar" },
    { text: "212₃", kind: "poz", why: "Uchlik: birinchi 2 — toʻqqizlar, oxirgi 2 — birlar xonasida" },
    { text: "444₅", kind: "poz", why: "Beshlik: uchta 4 — uch xil qiymat (100, 20, 4)" },
  ];
  const PLACE_MAX = [64, 256, 1024]; // xona qiymati chegarasi (tier bo'yicha)
  // "Raqam turgan xona": asos → son uzunligi (tier bo'yicha)
  const DIGIT_PLACE = [
    { 2: [3, 4], 3: [3, 3], 5: [3, 3] },
    { 2: [3, 5], 3: [3, 3], 5: [3, 3], 8: [3, 3], 16: [3, 3] },
    { 3: [4, 5], 4: [4, 4], 5: [4, 4], 8: [3, 3], 16: [3, 3] },
  ];

  // Xona qiymati / raqam turgan xona / tizim turi (4 yozuvdan bittasini tanlash)
  function makePlaceTask(prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (;;) {
      const r = rng();
      let task;
      if (r < 0.4) {
        const base = pick([2, 3, 4, 5, 8, 10, 16], rng);
        const lo = tier === 2 ? 3 : 2;
        const ks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11].filter((k) => k >= lo && base ** (k - 1) <= PLACE_MAX[tier]);
        if (!ks.length) continue;
        const k = pick(ks, rng);
        task = { type: "place", base, k, answer: base ** (k - 1) };
      } else if (r < 0.75) {
        const table = DIGIT_PLACE[tier];
        const base = Number(pick(Object.keys(table), rng));
        const len = randInt(table[base][0], table[base][1], rng);
        const number = randomNumber(base, len, rng);
        const once = [...number].filter((ch) => number.split(ch).length === 2);
        if (!once.length) continue;
        const digit = pick(once, rng);
        task = { type: "digitPlace", base, number, digit, answer: base ** (len - 1 - number.indexOf(digit)) };
      } else {
        // 4 yozuv: uchtasi bir turda, bittasi boshqa turda — o'shani topish
        const ask = rng() < 0.5 ? "nopoz" : "poz";
        const item = pick(KINDS.filter((x) => x.kind === ask), rng);
        const others = shuffle(KINDS.filter((x) => x.kind !== ask), rng).slice(0, 3);
        const options = shuffle([item, ...others], rng).map((x) => x.text);
        task = { type: "kind", ask, options, why: item.why, answer: item.text };
      }
      if (!same(prev, task)) return task;
    }
  }

  const api = { KINDS, PLACE_MAX, DIGIT_PLACE, randomNumber, makeChotiTask, makeDigitTask, makePlaceTask };

  if (node) module.exports = api;
  else root.QK.tizim = api;
})(typeof window !== "undefined" ? window : globalThis);

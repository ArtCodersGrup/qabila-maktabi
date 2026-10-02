// Rim toshi — sof hisob: Rim yozuvi ↔ son, lagan qoidalari, xonalar, topshiriqlar.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const VALUES = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  const KEYS = ["I", "V", "X", "L", "C"]; // Rim klaviaturasi (1–100 uchun yetarli)
  const PAIRS = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"],
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  // Lagan qoidalari: `count` ta `from` belgisi o'rniga bitta `to`
  const RULES = [
    { from: "I", count: 5, to: "V" },
    { from: "V", count: 2, to: "X" },
    { from: "X", count: 5, to: "L" },
    { from: "L", count: 2, to: "C" },
  ];
  const ruleLabel = (r) => `${r.from.repeat(r.count)} → ${r.to}`;

  // Son → standart Rim yozuvi. toRoman(42) → "XLII"
  function toRoman(n) {
    let out = "";
    for (const [value, sym] of PAIRS) {
      while (n >= value) {
        out += sym;
        n -= value;
      }
    }
    return out;
  }

  // Rim yozuvi → son: belgi keyingisidan kichik bo'lsa — ayiriladi. fromRoman("XLII") → 42
  function fromRoman(str) {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      const v = VALUES[str[i]];
      sum += VALUES[str[i + 1]] > v ? -v : v;
    }
    return sum;
  }

  // Rimliklar shunday yozganmi (IIII, VV, IL — yo'q)
  const isStandard = (str) => str.length > 0 && toRoman(fromRoman(str)) === str;

  // Nostandart yozuvdagi xato turi: "repeat" — IIII, "twice" — VV, "subtract" — IL kabi
  function mistake(str) {
    if (/IIII|XXXX|CCCC|MMMM/.test(str)) return "repeat";
    if (/V.*V|L.*L|D.*D/.test(str)) return "twice";
    return "subtract";
  }

  // Belgilar guruhlari: ayiriladigan juftlik — bitta guruh. tokens("XLII") → XL 40, I 1, I 1
  function tokens(str) {
    const out = [];
    for (let i = 0; i < str.length; i++) {
      const v = VALUES[str[i]];
      const next = VALUES[str[i + 1]];
      if (next > v) {
        out.push({ text: str[i] + str[i + 1], value: next - v });
        i++;
      } else {
        out.push({ text: str[i], value: v });
      }
    }
    return out;
  }

  // Har belgining qiymati. symbolValues("XXVII") → [10, 10, 5, 1, 1]
  const symbolValues = (str) => [...str].map((ch) => VALUES[ch]);

  // Laganda belgilar kattadan kichikka turadi
  const sortSymbols = (str) => [...str].sort((a, b) => VALUES[b] - VALUES[a]).join("");

  // Ikki yozuvni bitta laganga to'plash (faqat qo'shish qoidasidagi yozuvlar uchun)
  const merge = (a, b) => sortSymbols(a + b);

  // Qoidani qo'llash: yangi yozuv yoki null (belgilar yetarli emas)
  function applyRule(str, rule) {
    const have = [...str].filter((ch) => ch === rule.from).length;
    if (have < rule.count) return null;
    let removed = 0;
    const rest = [...str].filter((ch) => {
      if (ch === rule.from && removed < rule.count) {
        removed++;
        return false;
      }
      return true;
    });
    return sortSymbols(rest.join("") + rule.to);
  }

  const canTidy = (str) => RULES.some((r) => applyRule(str, r) !== null);

  // Qoidalar tugaguncha tartibga solish (yechimni ko'rsatish uchun)
  function tidy(str) {
    for (let changed = true; changed; ) {
      changed = false;
      for (const rule of RULES) {
        const next = applyRule(str, rule);
        if (next) {
          str = next;
          changed = true;
        }
      }
    }
    return str;
  }

  // Xonalarga ajratish (yozish maslahati uchun): 42 → [40, 2]; 100 → [100]
  function partsOf(n) {
    const out = [];
    for (let unit = 100; unit >= 1; unit /= 10) {
      const part = (Math.floor(n / unit) % 10) * unit;
      if (part) out.push(part);
    }
    return out;
  }

  // Raqamlar va ularning xonadagi qiymati. places(352) → 3/300, 5/50, 2/2
  function places(n) {
    const digits = String(n).split("").map(Number);
    return digits.map((digit, i) => {
      const place = digits.length - 1 - i;
      return { digit, place, value: digit * Math.pow(10, place) };
    });
  }

  // Sonda 4 yoki 9 raqami yo'qmi (faqat qo'shish qoidasidagi yozuv chiqadi)
  const hasNo49 = (n) => !/[49]/.test(String(n));

  const randInt = (lo, hi, rng) => lo + Math.floor(rng() * (hi - lo + 1));

  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];
  const tierOf = (tier) => Math.max(0, Math.min(2, tier || 0));
  // Zina berilmasa, to'g'ri javoblar sonidan (k) olinadi: 0–1 → 0, 2–3 → 1, 4+ → 2
  const tierFrom = (k, tier) => (tier === undefined || tier === null ? (k >= 4 ? 2 : k >= 2 ? 1 : 0) : tierOf(tier));

  const MAX_SYMBOLS = 8;  // Rim klaviaturasi va tosh shuncha belgini sig'diradi (LXXXVIII)
  const MAX_TRAY = 14;    // lagandagi belgilar soni chegarasi

  // Laganni to'liq tartibga solish uchun nechta qoida qo'llanadi (qiyinlik o'lchovi)
  function tidySteps(str) {
    let steps = 0;
    for (let guard = 0; guard < 50; guard++) {
      const rule = RULES.find((r) => applyRule(str, r));
      if (!rule) break;
      str = applyRule(str, rule);
      steps++;
    }
    return steps;
  }

  // 1-bosqich mashqi: k — nechanchi to'g'ri javob (0 — o'qish, 1 — yozish, keyin tasodifiy).
  // Sonlar zina bo'yicha: tier 0 — 3..39, tier 1 — 40..100, tier 2 — 101..399 (C gacha; yozuvi 8 belgidan oshmaydi).
  const READ_RANGES = [[3, 39], [40, 100], [101, 399]];
  function makeReadWriteTask(k, prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierFrom(k, tier);
    const type = k === 0 ? "read" : k === 1 ? "write" : rng() < 0.5 ? "read" : "write";
    const [lo, hi] = READ_RANGES[t];
    let n;
    do {
      n = randInt(lo, hi, rng);
    } while ((prev && n === prev.n) || toRoman(n).length > MAX_SYMBOLS);
    return { type, n, roman: toRoman(n), tier: t };
  }

  // 2-bosqich: Rimliklar usulida qo'shish — 4/9 raqamisiz, kamida bitta qoida kerak.
  // tier 0: qo'shiluvchilar 2..60, yig'indi ≤ 80; tier 1: 2..75, ≤ 100, kamida 2 ta qoida;
  // tier 2: 2..90, ≤ 150, kamida 3 ta qoida (LL → C ham kerak bo'ladi).
  const TIDY = [{ max: 60, sum: 80, steps: 1 }, { max: 75, sum: 100, steps: 2 }, { max: 90, sum: 150, steps: 3 }];
  function makeTidyTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    const lim = TIDY[t];
    for (;;) {
      const a = randInt(2, lim.max, rng);
      const b = randInt(2, lim.max, rng);
      const answer = a + b;
      if (answer > lim.sum || !hasNo49(a) || !hasNo49(b) || !hasNo49(answer)) continue;
      const tray = merge(toRoman(a), toRoman(b));
      if (tray.length > MAX_TRAY || tidySteps(tray) < lim.steps) continue;
      if (prev && prev.type === "tidy" && prev.a === a && prev.b === b) continue;
      return { type: "tidy", op: "+", a, b, answer, tier: t };
    }
  }

  // 2-bosqich: aylantirib hisoblash. "+" va "−"; natija ≥ 1. Sonlar zina bo'yicha:
  // tier 0 — 100 gacha, tier 1 — 200 gacha, tier 2 — 399 gacha (yozuvi 8 belgidan oshmaydi).
  const ARITH = [
    { plus: [[5, 70], [2, 40], 100], minus: [12, 100] },
    { plus: [[30, 120], [15, 80], 200], minus: [60, 200] },
    { plus: [[60, 250], [30, 149], 399], minus: [120, 399] },
  ];
  function makeArithTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    const lim = ARITH[t];
    for (;;) {
      const op = rng() < 0.5 ? "+" : "−";
      let a;
      let b;
      if (op === "+") {
        a = randInt(lim.plus[0][0], lim.plus[0][1], rng);
        b = randInt(lim.plus[1][0], lim.plus[1][1], rng);
        if (a + b > lim.plus[2]) continue;
      } else {
        a = randInt(lim.minus[0], lim.minus[1], rng);
        b = randInt(t === 0 ? 2 : 11, a - 1, rng);
      }
      const answer = op === "+" ? a + b : a - b;
      if ([a, b, answer].some((n) => toRoman(n).length > MAX_SYMBOLS)) continue;
      if (t > 0 && toRoman(a).length + toRoman(b).length > 12) continue; // misol satri ekranga sig'sin
      if (prev && prev.type === "arith" && prev.op === op && prev.a === a && prev.b === b) continue;
      return { type: "arith", op, a, b, answer, tier: t };
    }
  }

  // 2-bosqich mashqi: avval lagan, keyin aylantirish, keyin tasodifiy
  function makeCalcTask(k, prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierFrom(k, tier);
    const useTidy = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return useTidy ? makeTidyTask(prev, rng, t) : makeArithTask(prev, rng, t);
  }

  // ---------- 3-bosqich mashqlari ----------
  // len ta har xil raqam; withZero — bittasi (birinchisi emas) 0 bo'ladi
  function randomDigits(len, withZero, rng) {
    const digits = [];
    while (digits.length < len) {
      const d = randInt(1, 9, rng);
      if (!digits.includes(d)) digits.push(d);
    }
    if (withZero) digits[randInt(1, len - 1, rng)] = 0;
    return digits;
  }
  const sameNumber = (prev, type, number) => !!prev && prev.type === type && prev.number === number;

  // "352 sonidagi 5 raqami nechaga teng?" — raqamlar har xil; so'ralgan raqam noldan farqli.
  // tier 0: 2–3 xonali, nolsiz; tier 1: 3–4 xonali, 0 bo'lishi mumkin; tier 2: 4 xonali, ichida 0 bor.
  function makePlaceTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    for (;;) {
      const len = t === 0 ? (rng() < 0.7 ? 3 : 2) : t === 1 ? (rng() < 0.5 ? 3 : 4) : 4;
      const digits = randomDigits(len, t === 2 || (t === 1 && rng() < 0.5), rng);
      const number = Number(digits.join(""));
      if (sameNumber(prev, "place", number)) continue;
      const index = randInt(0, len - 1, rng);
      if (digits[index] === 0) continue;
      const part = places(number)[index];
      return { type: "place", number, index, digit: part.digit, place: part.place, answer: part.value, tier: t };
    }
  }

  // "3052 sonidan 0 ni olib tashlasak, qaysi son chiqadi?" — nol xonani band qilib turishini his qilish uchun.
  // tier 0, 1: 3 xonali; tier 2: 4 xonali.
  function makeZeroTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    for (;;) {
      const digits = randomDigits(t === 2 ? 4 : 3, true, rng);
      const number = Number(digits.join(""));
      if (sameNumber(prev, "zero", number)) continue;
      const answer = Number(digits.filter((d) => d !== 0).join(""));
      return { type: "zero", number, index: digits.indexOf(0), answer, tier: t };
    }
  }

  // "352 sonida 5 va 2 joy almashdi. Endi 5 nechaga teng?" — raqam qiymati xonaga bog'liq.
  // tier 0, 1: 3 xonali; tier 2: 4 xonali.
  function makeSwapTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    for (;;) {
      const len = t === 2 ? 4 : 3;
      const digits = randomDigits(len, false, rng);
      const number = Number(digits.join(""));
      if (sameNumber(prev, "swap", number)) continue;
      const i = randInt(0, len - 1, rng);
      const j = randInt(0, len - 1, rng);
      if (i === j) continue;
      const moved = digits.slice();
      moved[i] = digits[j];
      moved[j] = digits[i];
      const swapped = Number(moved.join(""));
      const part = places(swapped)[j]; // digits[i] endi j-o'rinda
      return {
        type: "swap", number, swapped, digit: digits[i], other: digits[j], index: j,
        place: part.place, before: places(number)[i].value, answer: part.value, tier: t,
      };
    }
  }

  // "XIV + 26 = ?" — Rim soni va oddiy son: avval aylantirish kerak (pozitsion tizim qulayligi).
  // tier 0, 1: Rim soni 4..39, qo'shiluvchi 11..40; tier 2: Rim soni 14..89, qo'shiluvchi 11..60.
  function makeMixedTask(prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierOf(tier);
    for (;;) {
      const n = t === 2 ? randInt(14, 89, rng) : randInt(4, 39, rng);
      const b = randInt(11, t === 2 ? 60 : 40, rng);
      if (prev && prev.type === "mixed" && prev.n === n && prev.b === b) continue;
      return { type: "mixed", n, roman: toRoman(n), b, answer: n + b, tier: t };
    }
  }

  // 3-bosqich mashqi tartibi: tier 0 — xona qiymati; tier 1 — "0 ni olib tashla" va "joy almashdi" navbat bilan;
  // tier 2 — to'rt tur aylanib keladi (Rim + oddiy son, 4 xonali xona qiymati, nol, almashish).
  const STAGE3_ORDER = [["place"], ["zero", "swap"], ["mixed", "place", "zero", "swap"]];
  const STAGE3_MAKERS = { place: makePlaceTask, zero: makeZeroTask, swap: makeSwapTask, mixed: makeMixedTask };
  function makeStage3Task(k, prev, rng, tier) {
    rng = rng || Math.random;
    const t = tierFrom(k, tier);
    const order = STAGE3_ORDER[t];
    return STAGE3_MAKERS[order[k % order.length]](prev, rng, t);
  }

  const api = {
    VALUES, KEYS, RULES, ruleLabel,
    toRoman, fromRoman, isStandard, mistake, tokens, symbolValues,
    sortSymbols, merge, applyRule, canTidy, tidy,
    partsOf, places, hasNo49,
    MAX_SYMBOLS, MAX_TRAY, READ_RANGES, tidySteps,
    makeReadWriteTask, makeTidyTask, makeArithTask, makeCalcTask,
    makePlaceTask, makeZeroTask, makeSwapTask, makeMixedTask, makeStage3Task,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.roman = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

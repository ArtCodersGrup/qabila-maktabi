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

  // 1-bosqich mashqi: k — nechanchi to'g'ri javob (0 — o'qish, 1 — yozish, keyin tasodifiy)
  function makeReadWriteTask(k, prev, rng) {
    rng = rng || Math.random;
    const type = k === 0 ? "read" : k === 1 ? "write" : rng() < 0.5 ? "read" : "write";
    const max = k === 0 ? 39 : 100; // birinchi misol yengilroq
    let n;
    do {
      n = randInt(3, max, rng);
    } while (prev && n === prev.n);
    return { type, n, roman: toRoman(n) };
  }

  // 2-bosqich: Rimliklar usulida qo'shish — 4/9 raqamisiz, yig'indi ≤ 80, kamida bitta qoida kerak
  function makeTidyTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const a = randInt(2, 60, rng);
      const b = randInt(2, 60, rng);
      const answer = a + b;
      if (answer > 80 || !hasNo49(a) || !hasNo49(b) || !hasNo49(answer)) continue;
      if (!canTidy(merge(toRoman(a), toRoman(b)))) continue;
      if (prev && prev.type === "tidy" && prev.a === a && prev.b === b) continue;
      return { type: "tidy", op: "+", a, b, answer };
    }
  }

  // 2-bosqich: aylantirib hisoblash. "+": yig'indi ≤ 100; "−": natija ≥ 1
  function makeArithTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const op = rng() < 0.5 ? "+" : "−";
      let a;
      let b;
      if (op === "+") {
        a = randInt(5, 70, rng);
        b = randInt(2, 40, rng);
        if (a + b > 100) continue;
      } else {
        a = randInt(12, 100, rng);
        b = randInt(2, a - 1, rng);
      }
      if (prev && prev.type === "arith" && prev.op === op && prev.a === a && prev.b === b) continue;
      return { type: "arith", op, a, b, answer: op === "+" ? a + b : a - b };
    }
  }

  // 2-bosqich mashqi: avval lagan, keyin aylantirish, keyin tasodifiy
  function makeCalcTask(k, prev, rng) {
    rng = rng || Math.random;
    const useTidy = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    return useTidy ? makeTidyTask(prev, rng) : makeArithTask(prev, rng);
  }

  // 3-bosqich: "352 sonidagi 5 raqami nechaga teng?" — raqamlar har xil va noldan farqli
  function makePlaceTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const len = rng() < 0.7 ? 3 : 2;
      const digits = [];
      while (digits.length < len) {
        const d = randInt(1, 9, rng);
        if (!digits.includes(d)) digits.push(d);
      }
      const number = Number(digits.join(""));
      if (prev && prev.number === number) continue;
      const index = randInt(0, len - 1, rng);
      const part = places(number)[index];
      return { number, index, digit: part.digit, place: part.place, answer: part.value };
    }
  }

  const api = {
    VALUES, KEYS, RULES, ruleLabel,
    toRoman, fromRoman, isStandard, mistake, tokens, symbolValues,
    sortSymbols, merge, applyRule, canTidy, tidy,
    partsOf, places, hasNo49,
    makeReadWriteTask, makeTidyTask, makeArithTask, makeCalcTask, makePlaceTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.roman = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

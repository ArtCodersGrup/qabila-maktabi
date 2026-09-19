// Qabila chiroqlari — sof hisob: naqshlar, ikkilik sonlar, nechta chiroq kerak, topshiriqlar.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const PLAIN = 2; // oddiy chiroq: o'chiq / yoniq
  const COLOR = 3; // rangli chiroq: o'chiq / sariq / ko'k

  // 3 ta oddiy chiroq naqshlarining ma'nosi: naqsh ikkilik son (o'chiq = 0, yoniq = 1) → shu indeks
  const MEANINGS = ["Tinchlik", "Suv", "Olov", "Ov", "Yomgʻir", "Mehmon", "Xavf", "Bayram"];

  // "Nechta chiroq kerak?" savollari
  const THINGS = [
    { text: "29 ta harf", n: 29 },
    { text: "10 ta raqam", n: 10 },
    { text: "12 ta oy", n: 12 },
    { text: "7 ta hafta kuni", n: 7 },
    { text: "20 ta hayvon", n: 20 },
    { text: "50 ta soʻz", n: 50 },
  ];

  const count = (states, lamps) => Math.pow(states, lamps);

  // Son → chiroqlar holati (chapdagi chiroq — eng katta xona). fromNumber(5, 3) → [1, 0, 1]
  function fromNumber(value, lamps, states) {
    states = states || PLAIN;
    const out = [];
    for (let k = lamps - 1; k >= 0; k--) out.push(Math.floor(value / Math.pow(states, k)) % states);
    return out;
  }

  // Chiroqlar holati → son. toNumber([1, 0, 1]) → 5
  const toNumber = (pattern, states) => pattern.reduce((acc, s) => acc * (states || PLAIN) + s, 0);

  // Hamma naqshlar tartib bilan: 0, 1, 2, …
  function allPatterns(states, lamps) {
    const out = [];
    for (let v = 0; v < count(states, lamps); v++) out.push(fromNumber(v, lamps, states));
    return out;
  }

  const patternKey = (p) => p.join("");

  // Oddiy chiroqlar qiymatlari (chapdan): 3 ta → [4, 2, 1]
  function placeValues(lamps) {
    const out = [];
    for (let k = lamps - 1; k >= 0; k--) out.push(Math.pow(2, k));
    return out;
  }

  // Yoniq chiroqlar qiymatlari yig'indisi matni: [1, 0, 1] → "4 + 1"; hammasi o'chiq → "0"
  function sumText(bits) {
    const vals = placeValues(bits.length).filter((_, k) => bits[k] === 1);
    return vals.length ? vals.join(" + ") : "0";
  }

  // Eng kamida nechta chiroq: holatlar^n ≥ narsalar soni
  function minLamps(items, states) {
    let n = 1;
    while (count(states, n) < items) n++;
    return n;
  }

  // Yechim qadamlari: 1 dan javobgacha
  function lampSteps(items, states) {
    const steps = [];
    for (let n = 1; n <= minLamps(items, states); n++) {
      steps.push({ lamps: n, count: count(states, n), enough: count(states, n) >= items });
    }
    return steps;
  }

  const pickIndex = (len, rng) => Math.floor(rng() * len);

  // 1-bosqich mashqi: naqshni o'qish (decode) yoki yuborish (encode); ma'no oldingisidan boshqa
  function makeCodeTask(prev, rng) {
    rng = rng || Math.random;
    let meaning;
    do {
      meaning = pickIndex(MEANINGS.length, rng);
    } while (prev && meaning === prev.meaning);
    return { type: rng() < 0.5 ? "decode" : "encode", meaning };
  }

  // 2-bosqich mashqi: k — nechanchi misol (0, 1 → 3 chiroq, 1–7; 2 → 4 chiroq, 8–15 — yangi 8 lik chiroq doim kerak).
  // Oldingisidan boshqa.
  function makeBinaryTask(k, prev, rng) {
    rng = rng || Math.random;
    const lamps = k >= 2 ? 4 : 3;
    const lo = lamps === 4 ? 8 : 1;
    let value;
    do {
      value = lo + pickIndex(count(PLAIN, lamps) - lo, rng);
    } while (prev && value === prev.value);
    return { type: rng() < 0.5 ? "toNumber" : "toLamps", lamps, value };
  }

  // 3-bosqich mashqi: narsalar va chiroq turi (oldingi savoldan boshqa)
  function makeLampsQuestion(prev, rng) {
    rng = rng || Math.random;
    let thing;
    let states;
    do {
      thing = pickIndex(THINGS.length, rng);
      states = rng() < 0.5 ? PLAIN : COLOR;
    } while (prev && thing === prev.thing && states === prev.states);
    const items = THINGS[thing].n;
    return { thing, text: THINGS[thing].text, items, states, answer: minLamps(items, states) };
  }

  const api = {
    PLAIN, COLOR, MEANINGS, THINGS,
    count, allPatterns, fromNumber, toNumber, patternKey, placeValues, sumText, minLamps, lampSteps,
    makeCodeTask, makeBinaryTask, makeLampsQuestion,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.lamps = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

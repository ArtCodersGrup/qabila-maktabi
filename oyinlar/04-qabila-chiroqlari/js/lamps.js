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
    // 2026-10-02: 6 → 12 ta narsa; kattalari uchun 7–9 ta oddiy chiroq kerak
    { text: "4 ta fasl", n: 4 },
    { text: "32 ta tish", n: 32 },
    { text: "64 ta shaxmat katagi", n: 64 },
    { text: "100 ta oʻquvchi", n: 100 },
    { text: "256 ta rang", n: 256 },
    { text: "365 ta kun", n: 365 },
  ];
  // Qiyinlik zinasi (QOIDALAR 4.3): narsalar soni bo'yicha — tier 0: 20 gacha, tier 1: 21..64, tier 2: 65 dan
  const tierOf = (tier) => Math.max(0, Math.min(2, tier || 0));
  const thingTier = (n) => (n <= 20 ? 0 : n <= 64 ? 1 : 2);
  const thingsFor = (tier) => THINGS.map((t, index) => index).filter((index) => thingTier(THINGS[index].n) === tierOf(tier));

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

  // 1-bosqich mashqi: naqshni o'qish (decode) yoki yuborish (encode); ma'no oldingisidan boshqa.
  // showTable — kod jadvali ko'rinib turadimi: faqat tier 0 da (birinchi 2 javob). Keyin yoddan; maslahat jadvalni qaytaradi.
  function makeCodeTask(prev, rng, tier) {
    rng = rng || Math.random;
    let meaning;
    do {
      meaning = pickIndex(MEANINGS.length, rng);
    } while (prev && meaning === prev.meaning);
    return { type: rng() < 0.5 ? "decode" : "encode", meaning, showTable: tierOf(tier) === 0, tier: tierOf(tier) };
  }

  // 1-bosqich maslahati (jadval ko'rinib turganda): javobni aytmaydi — ikki qo'shni qatorni yoritadi,
  // biri to'g'ri. Qaytaradi: o'sish tartibidagi ikki indeks.
  function hintPair(meaning, rng) {
    rng = rng || Math.random;
    const last = MEANINGS.length - 1;
    const other = meaning === 0 ? 1 : meaning === last ? last - 1 : meaning + (rng() < 0.5 ? -1 : 1);
    return [meaning, other].sort((a, b) => a - b);
  }

  // 2-bosqich mashqi. Chiroqlar soni zina bo'yicha: tier 0 → 3 chiroq (1–7), tier 1 → 4 chiroq (8–15),
  // tier 2 → 5 chiroq (16–31) — yangi qo'shilgan eng katta chiroq doim kerak bo'ladi.
  // tier berilmasa, k (nechanchi to'g'ri javob) dan olinadi: 0–1 → 3, 2–3 → 4, 4+ → 5. Oldingisidan boshqa son.
  function makeBinaryTask(k, prev, rng, tier) {
    rng = rng || Math.random;
    const t = tier === undefined || tier === null ? (k >= 4 ? 2 : k >= 2 ? 1 : 0) : tierOf(tier);
    const lamps = 3 + t;
    const lo = lamps === 3 ? 1 : count(PLAIN, lamps - 1);
    let value;
    do {
      value = lo + pickIndex(count(PLAIN, lamps) - lo, rng);
    } while (prev && value === prev.value);
    return { type: rng() < 0.5 ? "toNumber" : "toLamps", lamps, value, tier: t };
  }

  // 3-bosqich mashqi: narsalar va chiroq turi (oldingi savoldan boshqa). Narsalar zina bo'yicha kattalashadi.
  function makeLampsQuestion(prev, rng, tier) {
    rng = rng || Math.random;
    const pool = thingsFor(tier);
    let thing;
    let states;
    do {
      thing = pool[pickIndex(pool.length, rng)];
      states = rng() < 0.5 ? PLAIN : COLOR;
    } while (prev && thing === prev.thing && states === prev.states);
    const items = THINGS[thing].n;
    return { thing, text: THINGS[thing].text, items, states, answer: minLamps(items, states), tier: tierOf(tier) };
  }

  const api = {
    PLAIN, COLOR, MEANINGS, THINGS,
    count, allPatterns, fromNumber, toNumber, patternKey, placeValues, sumText, minLamps, lampSteps,
    thingTier, thingsFor, hintPair, makeCodeTask, makeBinaryTask, makeLampsQuestion,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.lamps = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

// Qoida yoki misol? — sof hisob: narsalar, qoidalar, qoidani baholash va topshiriqlar.
// Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const FEATURES = ["size", "dots"];      // kattaligi va dog'lari soni
  const OPS = [">", "<"];
  const FEATURE_NAMES = { size: "kattaligi", dots: "dogʻlari" };

  // Hayotdan misollar: qoida yozib bo'ladimi yoki misol kerakmi
  const CASES = [
    { text: "Kalkulyator: 7 + 5 ni hisoblash", kind: "qoida", why: "Qoʻshish qoidasi aniq: hamma vaqt bir xil ishlaydi." },
    { text: "Budilnik: soat 7:00 boʻlsa jiringlash", kind: "qoida", why: "Shart aniq: soat 7:00 boʻldimi yoki yoʻqmi." },
    { text: "Narxning 20 foiz chegirmasini hisoblash", kind: "qoida", why: "Formula aniq, oʻrganish kerak emas." },
    { text: "Sonning juftligini aniqlash", kind: "qoida", why: "Ikkiga boʻlinsa — juft. Bu aniq qoida." },
    { text: "Parol toʻgʻri kiritilganini tekshirish", kind: "qoida", why: "Ikki yozuvni solishtirish — aniq amal." },
    { text: "Svetofor: 30 soniyadan keyin yashil yonishi", kind: "qoida", why: "Vaqt boʻyicha aniq shart." },
    { text: "Doʻstingning yuzini rasmdan tanish", kind: "misol", why: "Yuzni qoida bilan yozib boʻlmaydi — misollar kerak." },
    { text: "Ovozni matnga aylantirish", kind: "misol", why: "Har kim boshqacha gapiradi — koʻp misol kerak." },
    { text: "Qoʻlda yozilgan raqamni oʻqish", kind: "misol", why: "Har kimning qoʻl yozuvi boshqacha." },
    { text: "Rasmda mushuk bor-yoʻqligini aytish", kind: "misol", why: "Mushuklar har xil: rang, holat, yorugʻlik." },
    { text: "Gapni boshqa tilga tarjima qilish", kind: "misol", why: "Til qoidalari juda koʻp va istisnoli — misollardan oʻrganiladi." },
    { text: "Rentgen rasmidan kasallikni topish", kind: "misol", why: "Belgilar mayin va har xil — shifokor misollari kerak." },
  ];

  const test = (rule, item) => (rule.op === ">" ? item[rule.feature] > rule.value : item[rule.feature] < rule.value);

  const wrongOnes = (items, rule) => items.filter((item) => test(rule, item) !== item.yes);
  const errorsOf = (items, rule) => wrongOnes(items, rule).length;

  // Barcha mumkin bo'lgan qoidalar (belgi × amal × son)
  function allRules() {
    const out = [];
    for (const feature of FEATURES) {
      for (const op of OPS) {
        for (let value = 1; value <= 9; value++) out.push({ feature, op, value });
      }
    }
    return out;
  }

  // Eng kam xato qiladigan qoida
  function bestRule(items) {
    let best = null;
    for (const rule of allRules()) {
      const errors = errorsOf(items, rule);
      if (!best || errors < best.errors) best = { rule, errors };
    }
    return best;
  }

  const dist = (a, b) => Math.hypot(a.size - b.size, a.dots - b.dots);
  const nearest = (examples, q) => examples.slice().sort((a, b) => dist(a, q) - dist(b, q))[0];
  const nnErrors = (examples, items) => items.filter((item) => nearest(examples, item).yes !== item.yes).length;

  const randInt = (lo, hi, rng) => lo + Math.floor(rng() * (hi - lo + 1));
  const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

  function take(arr, k, rng) {
    const rest = arr.slice();
    const out = [];
    while (out.length < k && rest.length) out.push(rest.splice(Math.floor(rng() * rest.length), 1)[0]);
    return out;
  }

  const key = (item) => `${item.size}:${item.dots}`;

  // 1-bosqich: aniq qoida bilan yechiladigan to'plam
  function makeRuleTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const rule = { feature: pick(FEATURES, rng), op: pick(OPS, rng), value: randInt(3, 7, rng) };
      const other = rule.feature === "size" ? "dots" : "size";
      const pool = [];
      for (let a = 1; a <= 9; a++) {
        for (let b = 1; b <= 9; b++) {
          const item = { size: rule.feature === "size" ? a : b, dots: rule.feature === "size" ? b : a };
          if (item[rule.feature] === rule.value) continue; // chegaradagi narsa chalkashtiradi
          pool.push({ size: item.size, dots: item.dots, yes: test(rule, item) });
        }
      }
      const yes = pool.filter((x) => x.yes);
      const no = pool.filter((x) => !x.yes);
      if (yes.length < 4 || no.length < 4) continue;
      const items = take(yes, 4, rng).concat(take(no, 4, rng));
      if (new Set(items.map(key)).size !== 8) continue;
      if (bestRule(items).errors !== 0) continue;
      const last = prev && prev.type === "rule" ? prev.answer : null; // oldingi vazifa boshqa turdan boʻlishi mumkin
      if (last && last.feature === rule.feature && last.op === rule.op && last.value === rule.value) continue;
      return { type: "rule", items: take(items, items.length, rng), answer: rule, other };
    }
  }

  // 2-bosqich: hech bir qoida yechmaydigan, lekin misollar bilan yechiladigan to'plam
  function makeFuzzyTask(rng) {
    rng = rng || Math.random;
    for (;;) {
      const band = randInt(9, 11, rng); // yashirin qoida: kattaligi + dogʻlari yigʻindisi
      const pool = [];
      for (let size = 1; size <= 9; size++) {
        for (let dots = 1; dots <= 9; dots++) {
          const sum = size + dots;
          if (Math.abs(sum - band) < 2) continue;
          pool.push({ size, dots, yes: sum > band });
        }
      }
      const yes = pool.filter((x) => x.yes);
      const no = pool.filter((x) => !x.yes);
      if (yes.length < 7 || no.length < 7) continue;
      const items = take(yes, 4, rng).concat(take(no, 4, rng));
      const rest = pool.filter((p) => !items.some((i) => key(i) === key(p)));
      const examples = take(rest.filter((x) => x.yes), 3, rng).concat(take(rest.filter((x) => !x.yes), 3, rng));
      if (examples.length < 6) continue;
      if (bestRule(items).errors < 2) continue;
      if (nnErrors(examples, items) !== 0) continue;
      return { type: "fuzzy", items: take(items, items.length, rng), examples, band };
    }
  }

  // 2-bosqich mashqi: to'plamga qarab "qoida" yoki "misol"
  function makeSetKindTask(k, prev, rng) {
    rng = rng || Math.random;
    const useRule = k === 0 ? true : k === 1 ? false : rng() < 0.5;
    const task = useRule ? makeRuleTask(prev && prev.base, rng) : makeFuzzyTask(rng); // makeRuleTask tur nomini oʻzi tekshiradi
    return { type: "setKind", items: task.items, answer: useRule ? "qoida" : "misol", base: task };
  }

  // 3-bosqich mashqi: hayotdan misol
  function makeKindTask(prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const item = pick(CASES, rng);
      if (prev && prev.text === item.text) continue;
      return { type: "kind", text: item.text, answer: item.kind, why: item.why };
    }
  }

  const api = {
    FEATURES, OPS, FEATURE_NAMES, CASES,
    test, wrongOnes, errorsOf, allRules, bestRule, dist, nearest, nnErrors,
    makeRuleTask, makeFuzzyTask, makeSetKindTask, makeKindTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.rules = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

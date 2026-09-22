// Mantiq kalitlari — sof mantiq: VA, YOKI, EMAS, rostlik jadvali, "B qanday bo'lsin", ifodalar,
// hayotiy qoidalar va mashq topshiriqlari. Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  // 1 — rost (kalit ulangan, chiroq yoniq), 0 — yolg'on
  const OPS = {
    and: { name: "VA", circuit: "series", f: (a, b) => a & b },
    or: { name: "YOKI", circuit: "parallel", f: (a, b) => a | b },
    not: { name: "EMAS", circuit: "inverse", unary: true, f: (a) => 1 - a },
  };

  const PAIRS = [[0, 0], [0, 1], [1, 0], [1, 1]];

  const apply = (op, a, b) => OPS[op].f(a, b);
  const rowIndex = (a, b) => (b == null ? a : a * 2 + b);

  function table(op) {
    if (OPS[op].unary) return [0, 1].map((a) => ({ a, out: apply(op, a) }));
    return PAIRS.map(([a, b]) => ({ a, b, out: apply(op, a, b) }));
  }

  // Natija want bo'lishi uchun B qanday bo'lsin: "1", "0", "any" (farqi yo'q), "none" (bo'lmaydi)
  function needB(op, a, want) {
    const ok = [0, 1].filter((b) => apply(op, a, b) === want);
    if (ok.length === 2) return "any";
    if (ok.length === 0) return "none";
    return String(ok[0]);
  }

  const NEED_LABELS = { 1: "1", 0: "0", any: "Farqi yoʻq", none: "Boʻlmaydi" };
  // Object.keys tartibi: raqamli kalitlar oldin o'sib boradi — "1", "0" tartibini saqlash uchun aniq ro'yxat
  const NEED_ORDER = ["1", "0", "any", "none"];

  // ---------- Ifodalar (3-bosqich): qavs doim yoziladi ----------
  const not = (x) => 1 - x;
  const EXPRS = [
    { id: "notA", text: "EMAS A", f: (a) => not(a),
      steps: (a) => [`EMAS ${a} = ${not(a)}`] },
    { id: "aAndNotB", text: "A VA (EMAS B)", f: (a, b) => a & not(b),
      steps: (a, b) => [`EMAS B = EMAS ${b} = ${not(b)}`, `${a} VA ${not(b)} = ${a & not(b)}`] },
    { id: "notAOrB", text: "(EMAS A) YOKI B", f: (a, b) => not(a) | b,
      steps: (a, b) => [`EMAS A = EMAS ${a} = ${not(a)}`, `${not(a)} YOKI ${b} = ${not(a) | b}`] },
    { id: "notAnd", text: "EMAS (A VA B)", f: (a, b) => not(a & b),
      steps: (a, b) => [`A VA B = ${a} VA ${b} = ${a & b}`, `EMAS ${a & b} = ${not(a & b)}`] },
    { id: "notOr", text: "EMAS (A YOKI B)", f: (a, b) => not(a | b),
      steps: (a, b) => [`A YOKI B = ${a} YOKI ${b} = ${a | b}`, `EMAS ${a | b} = ${not(a | b)}`] },
    { id: "notAAndNotB", text: "(EMAS A) VA (EMAS B)", f: (a, b) => not(a) & not(b),
      steps: (a, b) => [`EMAS A = ${not(a)}, EMAS B = ${not(b)}`, `${not(a)} VA ${not(b)} = ${not(a) & not(b)}`] },
  ];
  const evalExpr = (e, a, b) => e.f(a, b);
  const exprSteps = (e, a, b) => e.steps(a, b);

  // ---------- Hayotiy qoidalar: a va b — gap (1 — rost), f — qoida ----------
  const LIFE = [
    {
      id: "rain",
      a: { icon: "🌧️", name: "Yomgʻir", on: "Yomgʻir yogʻyapti", off: "Yomgʻir yoʻq" },
      b: { icon: "☂️", name: "Soyabon", on: "Soyabon bor", off: "Soyabon yoʻq" },
      rule: "Yomgʻir yogʻsa VA soyabon boʻlmasa — hoʻl boʻlasan.",
      expr: "Yomgʻir VA (EMAS Soyabon)",
      q: "Hoʻl boʻlasanmi?", yes: "Hoʻl boʻlasan", no: "Quruq qolasan",
      f: (a, b) => a & not(b),
    },
    {
      id: "walk",
      a: { icon: "📚", name: "Dars", on: "Dars tugadi", off: "Dars hali bor" },
      b: { icon: "❄️", name: "Sovuq", on: "Havo sovuq", off: "Havo iliq" },
      rule: "Dars tugasa VA havo sovuq boʻlmasa — sayrga chiqamiz.",
      expr: "Dars VA (EMAS Sovuq)",
      q: "Sayrga chiqamizmi?", yes: "Sayrga chiqamiz", no: "Uyda qolamiz",
      f: (a, b) => a & not(b),
    },
    {
      id: "gate",
      a: { icon: "🔑", name: "Kalit", on: "Kaliting bor", off: "Kaliting yoʻq" },
      b: { icon: "🛡️", name: "Qoʻriqchi", on: "Qoʻriqchi seni taniydi", off: "Qoʻriqchi seni tanimaydi" },
      rule: "Kaliting boʻlsa YOKI qoʻriqchi seni tanisa — darvoza ochiladi.",
      expr: "Kalit YOKI Qoʻriqchi",
      q: "Darvoza ochiladimi?", yes: "Darvoza ochiladi", no: "Darvoza yopiq",
      f: (a, b) => a | b,
    },
    {
      id: "robot",
      a: { icon: "🧱", name: "Devor", on: "Oldinda devor bor", off: "Oldinda devor yoʻq" },
      b: { icon: "🔋", name: "Batareya", on: "Batareya toʻla", off: "Batareya tugagan" },
      rule: "Oldinda devor boʻlsa YOKI batareya toʻla boʻlmasa — robot toʻxtaydi.",
      expr: "Devor YOKI (EMAS Batareya)",
      q: "Robot toʻxtaydimi?", yes: "Robot toʻxtaydi", no: "Robot yuradi",
      f: (a, b) => a | not(b),
    },
    {
      id: "tea",
      a: { icon: "🔥", name: "Suv", on: "Suv qaynadi", off: "Suv hali qaynamadi" },
      b: { icon: "🍵", name: "Piyola", on: "Piyola bor", off: "Piyola yoʻq" },
      rule: "Suv qaynasa VA piyola boʻlsa — choy ichamiz.",
      expr: "Suv VA Piyola",
      q: "Choy ichamizmi?", yes: "Choy ichamiz", no: "Hali choy yoʻq",
      f: (a, b) => a & b,
    },
  ];
  const evalLife = (l, a, b) => l.f(a, b);
  // Qoidaga qiymatlarni qo'yib hisoblash: "1 VA (EMAS 0) = 1"
  const lifeSteps = (l, a, b) => [`${l.expr.replace(l.a.name, String(a)).replace(l.b.name, String(b))} = ${l.f(a, b)}`];

  // ---------- Mashq topshiriqlari ----------
  const bit = (rng) => (rng() < 0.5 ? 0 : 1);
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];

  // 1–2-bosqich: "yonadimi?" (out) yoki "B qanday bo'lsin?" (need); 3-bosqich: ifoda (expr) yoki hayotiy qoida (life)
  function makeTask(stage, prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      let t;
      const a = bit(rng);
      const b = bit(rng);
      if (stage < 3) {
        const op = stage === 1 ? "and" : rng() < 0.6 ? "or" : "and";
        if (rng() < 0.5) {
          t = { type: "out", op, a, b, answer: apply(op, a, b), id: `out:${op}:${a}${b}` };
        } else {
          const want = bit(rng);
          t = { type: "need", op, a, want, answer: needB(op, a, want), id: `need:${op}:${a}:${want}` };
        }
      } else if (rng() < 0.5) {
        const expr = pick(EXPRS, rng);
        t = { type: "expr", expr, a, b, answer: evalExpr(expr, a, b), id: `expr:${expr.id}:${a}${b}` };
      } else {
        const life = pick(LIFE, rng);
        t = { type: "life", life, a, b, answer: evalLife(life, a, b), id: `life:${life.id}:${a}${b}` };
      }
      if (!prev || prev.id !== t.id) return t;
    }
  }

  const api = {
    OPS, PAIRS, NEED_LABELS, NEED_ORDER, EXPRS, LIFE,
    apply, rowIndex, table, needB, evalExpr, exprSteps, evalLife, lifeSteps, makeTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.logic = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

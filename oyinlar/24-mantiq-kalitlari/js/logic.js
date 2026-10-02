// Mantiq kalitlari — sof mantiq: VA, YOKI, EMAS, rostlik jadvali, "B qanday bo'lsin", ifodalar,
// hayotiy qoidalar va mashq topshiriqlari (tier bilan qiyinlashadi, 2026-10-02). Ekran bilan ishlamaydi, Node'da test qilinadi.
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
  // level: 0 — bitta amal, 1 — ikki amal (tier 0–1), 2 — uch amal, qavs ichida qavs (tier 2)
  const EXPRS = [
    { id: "notA", level: 0, text: "EMAS A", f: (a) => not(a),
      hint: "EMAS — teskarisi: 1 → 0, 0 → 1.",
      steps: (a) => [`EMAS ${a} = ${not(a)}`] },
    { id: "aAndNotB", level: 1, text: "A VA (EMAS B)", f: (a, b) => a & not(b),
      hint: "Avval har qatorga EMAS B ni yoz, keyin A bilan VA.",
      steps: (a, b) => [`EMAS B = EMAS ${b} = ${not(b)}`, `${a} VA ${not(b)} = ${a & not(b)}`] },
    { id: "notAOrB", level: 1, text: "(EMAS A) YOKI B", f: (a, b) => not(a) | b,
      hint: "Avval har qatorga EMAS A ni yoz, keyin B bilan YOKI.",
      steps: (a, b) => [`EMAS A = EMAS ${a} = ${not(a)}`, `${not(a)} YOKI ${b} = ${not(a) | b}`] },
    { id: "notAnd", level: 1, text: "EMAS (A VA B)", f: (a, b) => not(a & b),
      hint: "Avval A VA B jadvalini esla, keyin har qatorni teskari qil.",
      steps: (a, b) => [`A VA B = ${a} VA ${b} = ${a & b}`, `EMAS ${a & b} = ${not(a & b)}`] },
    { id: "notOr", level: 1, text: "EMAS (A YOKI B)", f: (a, b) => not(a | b),
      hint: "Avval A YOKI B jadvalini esla, keyin har qatorni teskari qil.",
      steps: (a, b) => [`A YOKI B = ${a} YOKI ${b} = ${a | b}`, `EMAS ${a | b} = ${not(a | b)}`] },
    { id: "notAAndNotB", level: 1, text: "(EMAS A) VA (EMAS B)", f: (a, b) => not(a) & not(b),
      hint: "Har qatorda A ni ham, B ni ham teskari qil, keyin VA.",
      steps: (a, b) => [`EMAS A = ${not(a)}, EMAS B = ${not(b)}`, `${not(a)} VA ${not(b)} = ${not(a) & not(b)}`] },
    { id: "notAOrNotB", level: 2, text: "(EMAS A) YOKI (EMAS B)", f: (a, b) => not(a) | not(b),
      hint: "Har qatorda A ni ham, B ni ham teskari qil, keyin YOKI.",
      steps: (a, b) => [`EMAS A = ${not(a)}, EMAS B = ${not(b)}`, `${not(a)} YOKI ${not(b)} = ${not(a) | not(b)}`] },
    { id: "notAAndNotB2", level: 2, text: "EMAS (A VA (EMAS B))", f: (a, b) => not(a & not(b)),
      hint: "Ichkaridan boshla: EMAS B, keyin A VA …, oxirida hammasini teskari qil.",
      steps: (a, b) => [`EMAS B = ${not(b)}`, `${a} VA ${not(b)} = ${a & not(b)}`, `EMAS ${a & not(b)} = ${not(a & not(b))}`] },
    { id: "orAndNotA", level: 2, text: "(A YOKI B) VA (EMAS A)", f: (a, b) => (a | b) & not(a),
      hint: "Ikki qavsni alohida hisobla: A YOKI B va EMAS A. Keyin VA.",
      steps: (a, b) => [`A YOKI B = ${a | b}`, `EMAS A = ${not(a)}`, `${a | b} VA ${not(a)} = ${(a | b) & not(a)}`] },
    { id: "andOrNotB", level: 2, text: "(A VA B) YOKI (EMAS B)", f: (a, b) => (a & b) | not(b),
      hint: "Ikki qavsni alohida hisobla: A VA B va EMAS B. Keyin YOKI.",
      steps: (a, b) => [`A VA B = ${a & b}`, `EMAS B = ${not(b)}`, `${a & b} YOKI ${not(b)} = ${(a & b) | not(b)}`] },
    { id: "notNotAOrB", level: 2, text: "EMAS ((EMAS A) YOKI B)", f: (a, b) => not(not(a) | b),
      hint: "Ichkaridan boshla: EMAS A, keyin … YOKI B, oxirida hammasini teskari qil.",
      steps: (a, b) => [`EMAS A = ${not(a)}`, `${not(a)} YOKI ${b} = ${not(a) | b}`, `EMAS ${not(a) | b} = ${not(not(a) | b)}`] },
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
    {
      id: "bike",
      a: { icon: "🚲", name: "Velosiped", on: "Velosiped soz", off: "Velosiped buzuq" },
      b: { icon: "⛑️", name: "Dubulgʻa", on: "Dubulgʻa bor", off: "Dubulgʻa yoʻq" },
      rule: "Velosiped soz boʻlsa VA dubulgʻa boʻlsa — yoʻlga chiqamiz.",
      expr: "Velosiped VA Dubulgʻa",
      q: "Yoʻlga chiqamizmi?", yes: "Yoʻlga chiqamiz", no: "Hozircha chiqmaymiz",
      f: (a, b) => a & b,
    },
    {
      id: "film",
      a: { icon: "🍿", name: "Dars", on: "Darslar tayyor", off: "Darslar tayyor emas" },
      b: { icon: "🕗", name: "Vaqt", on: "Soat hali erta", off: "Soat kech boʻldi" },
      rule: "Darslar tayyor boʻlsa VA soat erta boʻlsa — multfilm koʻramiz.",
      expr: "Dars VA Vaqt",
      q: "Multfilm koʻramizmi?", yes: "Multfilm koʻramiz", no: "Bugun boʻlmaydi",
      f: (a, b) => a & b,
    },
    {
      id: "lift",
      a: { icon: "🛗", name: "Lift", on: "Lift ishlayapti", off: "Lift buzuq" },
      b: { icon: "🧳", name: "Yuk", on: "Yuking ogʻir", off: "Yuking yengil" },
      rule: "Lift buzuq boʻlsa YOKI yuking yengil boʻlsa — zinadan chiqasan.",
      expr: "(EMAS Lift) YOKI (EMAS Yuk)",
      q: "Zinadan chiqasanmi?", yes: "Zinadan chiqasan", no: "Liftda chiqasan",
      f: (a, b) => not(a) | not(b),
    },
    {
      id: "alarm",
      a: { icon: "🚨", name: "Tutun", on: "Tutun bor", off: "Tutun yoʻq" },
      b: { icon: "🔇", name: "Oʻchirgich", on: "Signal oʻchirilgan", off: "Signal yoqilgan" },
      rule: "Tutun boʻlsa VA signal oʻchirilmagan boʻlsa — qoʻngʻiroq chalinadi.",
      expr: "Tutun VA (EMAS Oʻchirgich)",
      q: "Qoʻngʻiroq chalinadimi?", yes: "Qoʻngʻiroq chalinadi", no: "Jim turadi",
      f: (a, b) => a & not(b),
    },
    {
      id: "garden",
      a: { icon: "💧", name: "Yomgʻir", on: "Kecha yomgʻir yogʻdi", off: "Yomgʻir yogʻmadi" },
      b: { icon: "🚿", name: "Shlang", on: "Shlang ishlayapti", off: "Shlang buzuq" },
      rule: "Kecha yomgʻir yogʻgan boʻlsa YOKI shlang ishlasa — bogʻ sugʻoriladi.",
      expr: "Yomgʻir YOKI Shlang",
      q: "Bogʻ sugʻoriladimi?", yes: "Bogʻ sugʻoriladi", no: "Bogʻ quruq qoladi",
      f: (a, b) => a | b,
    },
    {
      id: "game",
      a: { icon: "📶", name: "Internet", on: "Internet bor", off: "Internet yoʻq" },
      b: { icon: "🔌", name: "Quvvat", on: "Quvvat tugagan", off: "Quvvat yetarli" },
      rule: "Internet boʻlsa VA quvvat tugamagan boʻlsa — onlayn oʻynaymiz.",
      expr: "Internet VA (EMAS Quvvat)",
      q: "Onlayn oʻynaymizmi?", yes: "Onlayn oʻynaymiz", no: "Hozir boʻlmaydi",
      f: (a, b) => a & not(b),
    },
  ];
  const evalLife = (l, a, b) => l.f(a, b);
  // Qoidaga qiymatlarni qo'yib hisoblash: "1 VA (EMAS 0) = 1"
  const lifeSteps = (l, a, b) => [`${l.expr.replace(l.a.name, String(a)).replace(l.b.name, String(b))} = ${l.f(a, b)}`];

  // ---------- Hayotiy qoida: 4 ta ifoda varianti (bittasi to'g'ri) ----------
  // Shakllar: A VA B, A YOKI B, A VA (EMAS B), (EMAS A) VA B, A YOKI (EMAS B), (EMAS A) YOKI B, (EMAS A) VA (EMAS B), (EMAS A) YOKI (EMAS B)
  function lifeExprForms(life) {
    const A = life.a.name;
    const B = life.b.name;
    return [
      `${A} VA ${B}`, `${A} YOKI ${B}`, `${A} VA (EMAS ${B})`, `(EMAS ${A}) VA ${B}`,
      `${A} YOKI (EMAS ${B})`, `(EMAS ${A}) YOKI ${B}`, `(EMAS ${A}) VA (EMAS ${B})`, `(EMAS ${A}) YOKI (EMAS ${B})`,
    ];
  }
  function lifeExprOptions(life, rng) {
    rng = rng || Math.random;
    const rest = shuffle(lifeExprForms(life).filter((t) => t !== life.expr), rng).slice(0, 3);
    return shuffle([life.expr, ...rest], rng);
  }

  // ---------- Jadval to'ldirish: javob — natijalar ro'yxati ----------
  const fillRows = (unary) => (unary ? [[0], [1]] : PAIRS);
  // Nechta qator xato (to'ldirilmagan katak ham xato)
  const wrongRows = (answer, values) => answer.filter((v, i) => !values || values[i] !== v).length;
  const fillOk = (answer, values) => wrongRows(answer, values) === 0;

  // ---------- Mashq topshiriqlari ----------
  const bit = (rng) => (rng() < 0.5 ? 0 : 1);
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];
  function shuffle(list, rng) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  // Bosqich va qiyinlik zinasi (tier 0 / 1 / 2, QOIDALAR 4.3):
  // 1–2-bosqich: "B qanday bo'lsin?" (need, 4 variant) va amal jadvalini to'ldirish (fill, 4 qator — 16 kombinatsiya);
  //   tier 2 da jadval amal nomisiz — faqat sxema (ketma-ket — VA, parallel — YOKI).
  // 3-bosqich: ifoda jadvali (fillExpr; tier 0 — 1–2 amal, tier 1 — 2 amal, tier 2 — 3 amal),
  //   hayotiy qoida (life: avval 4 ifodadan to'g'risi, keyin holat — ikkalasi to'g'ri bo'lsagina),
  //   tier 2 da hayotiy qoida jadvali (fillLife).
  function makeTask(stage, prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (;;) {
      let t;
      const a = bit(rng);
      const b = bit(rng);
      const r = rng();
      if (stage < 3) {
        const op = stage === 1 ? "and" : rng() < 0.6 ? "or" : "and";
        const needShare = tier === 0 ? 0.6 : tier === 1 ? 0.5 : 0.4;
        if (r < needShare) {
          const want = bit(rng);
          t = { type: "need", op, a, want, answer: needB(op, a, want), id: `need:${op}:${a}:${want}` };
        } else {
          const named = tier < 2;
          t = { type: "fill", op, named, rows: PAIRS, answer: table(op).map((row) => row.out), id: `fill:${op}:${named ? 1 : 0}` };
        }
      } else if (r < 0.5 || (tier < 2 && r < 0.6)) {
        const pool = EXPRS.filter((e) => (tier === 0 ? e.level <= 1 : tier === 1 ? e.level === 1 : e.level === 2));
        const expr = pick(pool, rng);
        const unary = expr.id === "notA";
        const rows = fillRows(unary);
        t = { type: "fillExpr", expr, rows, answer: rows.map(([x, y]) => evalExpr(expr, x, y)), id: `fillExpr:${expr.id}` };
      } else if (tier === 2 && r < 0.75) {
        const life = pick(LIFE, rng);
        t = { type: "fillLife", life, rows: PAIRS, answer: PAIRS.map(([x, y]) => evalLife(life, x, y)), id: `fillLife:${life.id}` };
      } else {
        const life = pick(LIFE, rng);
        t = {
          type: "life", life, a, b, options: lifeExprOptions(life, rng),
          answer: { expr: life.expr, out: evalLife(life, a, b) }, id: `life:${life.id}:${a}${b}`,
        };
      }
      if (!prev || prev.id !== t.id) return t;
    }
  }

  // Javob tekshiruvi (ekran kodi shuni chaqiradi)
  function checkTask(task, value) {
    if (task.type === "need") return value === task.answer;
    if (task.type === "life") return !!value && value.expr === task.answer.expr && value.out === task.answer.out;
    return fillOk(task.answer, value);
  }

  const api = {
    OPS, PAIRS, NEED_LABELS, NEED_ORDER, EXPRS, LIFE,
    apply, rowIndex, table, needB, evalExpr, exprSteps, evalLife, lifeSteps,
    lifeExprForms, lifeExprOptions, fillRows, wrongRows, fillOk, makeTask, checkTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.logic = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

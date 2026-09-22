// Zinapoya chirog'i — sof mantiq: VA, YOKI, XOR, EMAS; amallar sxemasi (zanjir), yarim qo'shuvchi,
// ikki xonali ikkilik qo'shish va mashq topshiriqlari. Ekran bilan ishlamaydi, Node'da test qilinadi.
(function (root) {
  "use strict";

  const OPS = {
    and: { name: "VA", f: (a, b) => a & b },
    or: { name: "YOKI", f: (a, b) => a | b },
    xor: { name: "XOR", f: (a, b) => a ^ b },
    not: { name: "EMAS", unary: true, f: (a) => 1 - a },
  };
  const PAIRS = [[0, 0], [0, 1], [1, 0], [1, 1]];
  const BINARY = ["and", "or", "xor"]; // "qaysi amal?" javoblari

  const apply = (op, a, b) => OPS[op].f(a, b);
  const table = (op) => PAIRS.map(([a, b]) => apply(op, a, b));
  const rowIndex = (a, b) => a * 2 + b;

  // ---------- Sxemalar: kirishlar a, b; amallar tartib bilan (har biri oldingilaridan oladi) ----------
  // gate: { id, op, in: [manba, manba?], col, row } — col/row faqat chizish uchun; outs: [{ id, name }]
  const TEMPLATES = {
    // A, B → amal → chiroq
    single: (op) => ({ gates: [{ id: "g1", op, in: ["a", "b"], col: 1, row: 0.5 }], outs: [{ id: "g1" }] }),
    // A, B → amal → EMAS → chiroq
    thenNot: (op) => ({
      gates: [{ id: "g1", op, in: ["a", "b"], col: 1, row: 0.5 }, { id: "g2", op: "not", in: ["g1"], col: 2, row: 0.5 }],
      outs: [{ id: "g2" }],
    }),
    // A → EMAS; (EMAS A), B → amal → chiroq
    notFirst: (op) => ({
      gates: [{ id: "g1", op: "not", in: ["a"], col: 1, row: 0 }, { id: "g2", op, in: ["g1", "b"], col: 2, row: 0.5 }],
      outs: [{ id: "g2" }],
    }),
    // XOR ni yig'amiz: (A YOKI B) VA EMAS (A VA B)
    xorBuild: () => ({
      gates: [
        { id: "g1", op: "or", in: ["a", "b"], col: 1, row: 0 },
        { id: "g2", op: "and", in: ["a", "b"], col: 1, row: 1 },
        { id: "g3", op: "not", in: ["g2"], col: 2, row: 1 },
        { id: "g4", op: "and", in: ["g1", "g3"], col: 3, row: 0.5 },
      ],
      outs: [{ id: "g4" }],
    }),
    // Yarim qo'shuvchi: yig'indi = A XOR B, ko'chirish = A VA B
    halfAdder: () => ({
      gates: [{ id: "g1", op: "xor", in: ["a", "b"], col: 1, row: 0 }, { id: "g2", op: "and", in: ["a", "b"], col: 1, row: 1 }],
      outs: [{ id: "g2", name: "Koʻchirish" }, { id: "g1", name: "Yigʻindi" }],
    }),
  };

  function circuit(tpl, op) {
    return Object.assign({ tpl, op: op || null }, TEMPLATES[tpl](op));
  }

  // Har sim qiymati: { a, b, g1, g2, ... }
  function evaluate(c, a, b) {
    const v = { a, b };
    for (const g of c.gates) v[g.id] = apply(g.op, v[g.in[0]], g.in[1] == null ? undefined : v[g.in[1]]);
    return v;
  }
  const outputs = (c, a, b) => {
    const v = evaluate(c, a, b);
    return c.outs.map((o) => v[o.id]);
  };
  const output = (c, a, b) => outputs(c, a, b)[0];

  // Ifoda matni: "EMAS (A VA B)", "(A YOKI B) VA (EMAS (A VA B))"
  function exprText(c, id) {
    const byId = Object.fromEntries(c.gates.map((g) => [g.id, g]));
    const wrap = (src) => (src === "a" || src === "b" ? src.toUpperCase() : `(${text(byId[src])})`);
    const text = (g) => (OPS[g.op].unary ? `EMAS ${wrap(g.in[0])}` : `${wrap(g.in[0])} ${OPS[g.op].name} ${wrap(g.in[1])}`);
    return text(byId[id || c.outs[0].id]);
  }

  // Qadamlar: har amal uchun "1 VA 0 = 0", "EMAS 0 = 1"
  function steps(c, a, b) {
    const v = evaluate(c, a, b);
    return c.gates.map((g) => (OPS[g.op].unary
      ? `EMAS ${v[g.in[0]]} = ${v[g.id]}`
      : `${v[g.in[0]]} ${OPS[g.op].name} ${v[g.in[1]]} = ${v[g.id]}`));
  }

  // ---------- Qo'shish ----------
  const halfAdd = (a, b) => ({ carry: a & b, sum: a ^ b });
  const bin = (n, width) => n.toString(2).padStart(width || 1, "0");

  // Ikki xonali ikkilik sonlarni ustunda qo'shish: qadamlar va natija
  function add2(x, y) {
    const [x1, x0] = [x >> 1, x & 1];
    const [y1, y0] = [y >> 1, y & 1];
    const r = halfAdd(x0, y0);
    const t = x1 + y1 + r.carry;
    const lines = [
      `Oʻng xona: ${x0} + ${y0} = ${bin(x0 + y0)}${r.carry ? " — 0 yoz, 1 ni koʻchir" : ""}`,
      `Chap xona: ${x1} + ${y1}${r.carry ? " + 1" : ""} = ${bin(t)}`,
      `${bin(x, 2)} + ${bin(y, 2)} = ${bin(x + y)}`,
    ];
    return { result: bin(x + y), lines };
  }

  // Ko'chirishni unutish xatosi (x XOR y) va qo'shni sonlar — chalg'ituvchi variantlar
  function add2Options(x, y, rng) {
    const s = x + y;
    const out = [bin(s)];
    for (const w of [x ^ y, s + 1, s - 1, s + 2, s - 2, 1, 2, 3, 4, 5, 6]) {
      if (out.length < 4 && w >= 1 && w <= 7 && !out.includes(bin(w))) out.push(bin(w));
    }
    return shuffle(out, rng);
  }

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

  function makeTask(stage, prev, rng) {
    rng = rng || Math.random;
    for (;;) {
      const a = bit(rng);
      const b = bit(rng);
      const r = rng();
      let t;
      if (stage === 1) {
        if (r < 0.4) t = { type: "out", a, b, answer: a ^ b, id: `out:${a}${b}` };
        else if (r < 0.75) {
          const m = Math.floor(rng() * 5);
          const n = Math.floor(rng() * 5);
          if (m + n === 0) continue;
          t = { type: "clicks", m, n, answer: (m + n) % 2, id: `clicks:${m}:${n}` };
        } else {
          const op = pick(BINARY, rng);
          t = { type: "which", op, answer: op, id: `which:${op}` };
        }
      } else if (stage === 2) {
        if (r < 0.55) {
          const tpl = rng() < 0.6 ? "thenNot" : "notFirst";
          const op = pick(tpl === "thenNot" ? BINARY : ["and", "or"], rng);
          const c = circuit(tpl, op);
          t = { type: "eval", c, a, b, answer: output(c, a, b), id: `eval:${tpl}:${op}:${a}${b}` };
        } else {
          const tpl = rng() < 0.5 ? "single" : "thenNot";
          const op = pick(BINARY, rng);
          const c = circuit(tpl, op);
          t = { type: "fill", c, target: PAIRS.map(([x, y]) => output(c, x, y)), answer: op, id: `fill:${tpl}:${op}` };
        }
      } else if (r < 0.4) {
        const h = halfAdd(a, b);
        t = { type: "half", a, b, answer: `${h.carry}${h.sum}`, id: `half:${a}${b}` };
      } else if (r < 0.6) {
        const ask = rng() < 0.5 ? "sum" : "carry";
        t = { type: "whichOut", ask, answer: ask === "sum" ? "xor" : "and", id: `whichOut:${ask}` };
      } else {
        const x = Math.floor(rng() * 4);
        const y = Math.floor(rng() * 4);
        if (x + y === 0) continue;
        t = { type: "add2", x, y, answer: bin(x + y), options: add2Options(x, y, rng), id: `add2:${x}:${y}` };
      }
      if (!prev || prev.id !== t.id) return t;
    }
  }

  const api = {
    OPS, PAIRS, BINARY, TEMPLATES,
    apply, table, rowIndex, circuit, evaluate, outputs, output, exprText, steps,
    halfAdd, bin, add2, add2Options, makeTask,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.gates = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

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
    // A → EMAS, B → EMAS; ikkalasi → amal → chiroq (tier 2)
    bothNot: (op) => ({
      gates: [
        { id: "g1", op: "not", in: ["a"], col: 1, row: 0 },
        { id: "g2", op: "not", in: ["b"], col: 1, row: 1 },
        { id: "g3", op, in: ["g1", "g2"], col: 2, row: 0.5 },
      ],
      outs: [{ id: "g3" }],
    }),
    // A → EMAS; (EMAS A), B → amal → EMAS → chiroq (tier 2)
    notBothEnds: (op) => ({
      gates: [
        { id: "g1", op: "not", in: ["a"], col: 1, row: 0 },
        { id: "g2", op, in: ["g1", "b"], col: 2, row: 0.5 },
        { id: "g3", op: "not", in: ["g2"], col: 3, row: 0.5 },
      ],
      outs: [{ id: "g3" }],
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

  // Ikkilik sonlarni ustunda qo'shish (width xonali): har xona uchun qadam va natija
  function addCols(x, y, width) {
    const lines = [];
    let carry = 0;
    for (let k = 0; k < width; k++) {
      const xb = (x >> k) & 1;
      const yb = (y >> k) & 1;
      const t = xb + yb + carry;
      const name = width === 2 ? (k === 0 ? "Oʻng xona" : "Chap xona") : `${k + 1}-xona (oʻngdan)`;
      const moves = k < width - 1 && t > 1;
      lines.push(`${name}: ${xb} + ${yb}${carry ? " + 1" : ""} = ${bin(t)}${moves ? ` — ${t & 1} yoz, 1 ni koʻchir` : ""}`);
      carry = t >> 1;
    }
    lines.push(`${bin(x, width)} + ${bin(y, width)} = ${bin(x + y)}`);
    return { result: bin(x + y), lines };
  }
  const add2 = (x, y) => addCols(x, y, 2);

  // Ko'chirishni unutish xatosi (x XOR y) va qo'shni sonlar — chalg'ituvchi variantlar (jami 4 ta)
  function add2Options(x, y, rng, width) {
    const s = x + y;
    const max = (1 << ((width || 2) + 1)) - 1;
    const out = [bin(s)];
    for (const w of [x ^ y, s + 1, s - 1, s + 2, s - 2, 1, 2, 3, 4, 5, 6]) {
      if (out.length < 4 && w >= 1 && w <= max && !out.includes(bin(w))) out.push(bin(w));
    }
    return shuffle(out, rng);
  }

  // ---------- Mashq topshiriqlari ----------
  const bit = (rng) => (rng() < 0.5 ? 0 : 1);
  const pick = (list, rng) => list[Math.floor(rng() * list.length)];
  const randInt = (lo, hi, rng) => lo + Math.floor(rng() * (hi - lo + 1));
  function shuffle(list, rng) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
  const same = (x, y) => x.length === y.length && x.every((v, i) => v === y[i]);

  const NONE = "none"; // "Hech biri" — 4-variant
  // "Zinapoya chirog'i yonadimi?" — javob sabab bilan birga (4 variant): bir xil/har xil + yoniq/o'chiq
  const OUT_OPTIONS = ["diff:1", "diff:0", "same:1", "same:0"];
  const outAnswer = (a, b) => (a === b ? "same:0" : "diff:1");
  // Chiroq o'chiq edi, kalitlar jami k marta bosildi — chiroq necha marta yondi (1-, 3-, 5-… bosishda)
  const litCount = (k) => Math.ceil(k / 2);
  // VA, YOKI, XOR — hech biriniki bo'lmagan jadvallar ("qaysi amal?" savolida "Hech biri" javobi uchun)
  const ODD_TABLES = [[1, 0, 0, 1], [1, 1, 1, 0], [1, 0, 0, 0]];
  const CLICK_MAX = [3, 5, 7]; // bitta kalitni eng ko'pi bilan necha marta bosish (tier bo'yicha)
  const NONE_SHARE = [0, 0.2, 0.3]; // "Hech biri" to'g'ri javob bo'lish ulushi

  // Sxemada "?" quti: hech bir amal bermaydigan maqsad jadvali
  function oddTarget(tpl, rng) {
    const reach = BINARY.map((op) => PAIRS.map(([x, y]) => output(circuit(tpl, op), x, y)));
    const pool = [[0, 0, 0, 1], [0, 1, 1, 1], [0, 1, 1, 0], [1, 1, 1, 0], [1, 0, 0, 0], [1, 0, 0, 1], [0, 1, 0, 0], [0, 0, 1, 0], [1, 1, 0, 1], [1, 0, 1, 1]]
      .filter((t) => !reach.some((r) => same(r, t)));
    return pick(pool, rng);
  }

  // Bosqich va qiyinlik zinasi (tier 0 / 1 / 2, QOIDALAR 4.3). 0/1 javobli savol yo'q:
  // 1-bosqich: out (4 variant: sabab + holat), clicks (sonli), which (VA/YOKI/XOR/Hech biri), table (jadvalni to'ldirish);
  // 2-bosqich: evalTable (sxema jadvalini to'ldirish — 16 kombinatsiya), fill ("?" quti — 4 variant);
  // 3-bosqich: half (4 variant), whichOut (4 variant), add2 (4 variant; tier 2 — uch xonali).
  function makeTask(stage, prev, rng, tier) {
    rng = rng || Math.random;
    tier = tier || 0;
    for (;;) {
      const a = bit(rng);
      const b = bit(rng);
      const r = rng();
      let t;
      if (stage === 1) {
        const tableShare = tier === 0 ? 0.1 : 0.25;
        if (r < 0.15) t = { type: "out", a, b, answer: outAnswer(a, b), id: `out:${a}${b}` };
        else if (r < 0.45) {
          const max = CLICK_MAX[tier];
          const m = randInt(0, max, rng);
          const n = randInt(0, max, rng);
          if (m + n < (tier === 2 ? 7 : 3)) continue;
          t = { type: "clicks", m, n, answer: litCount(m + n), lit: (m + n) % 2, id: `clicks:${m}:${n}` };
        } else if (r < 0.45 + tableShare) {
          const op = tier === 2 ? pick(BINARY, rng) : "xor";
          t = { type: "table", op, rows: PAIRS, answer: table(op), id: `table:${op}` };
        } else if (rng() < NONE_SHARE[tier]) {
          const tb = pick(ODD_TABLES, rng);
          t = { type: "which", op: null, table: tb, answer: NONE, id: `which:${tb.join("")}` };
        } else {
          const op = pick(BINARY, rng);
          t = { type: "which", op, table: table(op), answer: op, id: `which:${op}` };
        }
      } else if (stage === 2) {
        if (r < 0.5) {
          const tpl = tier === 2 ? pick(["bothNot", "notBothEnds", "xorBuild"], rng) : rng() < 0.6 ? "thenNot" : "notFirst";
          const ops = tpl === "notFirst" || tpl === "notBothEnds" ? ["and", "or"] : tier === 0 ? ["and", "or"] : BINARY;
          const op = tpl === "xorBuild" ? null : pick(ops, rng);
          const c = circuit(tpl, op);
          t = { type: "evalTable", c, rows: PAIRS, answer: PAIRS.map(([x, y]) => output(c, x, y)), id: `evalTable:${tpl}:${op}` };
        } else {
          const tpl = tier === 2 ? pick(["thenNot", "notFirst"], rng) : rng() < 0.5 ? "single" : "thenNot";
          const unknown = tpl === "notFirst" ? "g2" : "g1";
          if (rng() < NONE_SHARE[tier]) {
            const target = oddTarget(tpl, rng);
            t = { type: "fill", c: circuit(tpl, "and"), unknown, target, answer: NONE, id: `fill:${tpl}:${target.join("")}` };
          } else {
            const op = pick(BINARY, rng);
            const c = circuit(tpl, op);
            t = { type: "fill", c, unknown, target: PAIRS.map(([x, y]) => output(c, x, y)), answer: op, id: `fill:${tpl}:${op}` };
          }
        }
      } else if (r < 0.35) {
        const h = halfAdd(a, b);
        t = { type: "half", a, b, answer: `${h.carry}${h.sum}`, id: `half:${a}${b}` };
      } else if (r < 0.5) {
        const ask = rng() < 0.5 ? "sum" : "carry";
        t = { type: "whichOut", ask, answer: ask === "sum" ? "xor" : "and", id: `whichOut:${ask}` };
      } else {
        // tier 0 — ikki xonali; tier 1 — ikki xonali, ko'chirish albatta bor; tier 2 — uch xonali, ko'chirish bor
        const width = tier === 2 ? 3 : 2;
        const top = (1 << width) - 1;
        const x = randInt(tier ? 1 : 0, top, rng);
        const y = randInt(tier ? 1 : 0, top, rng);
        if (x + y === 0 || (tier && !(x & y))) continue;
        t = { type: "add2", x, y, width, answer: bin(x + y), options: add2Options(x, y, rng, width), id: `add2:${width}:${x}:${y}` };
      }
      if (!prev || prev.id !== t.id) return t;
    }
  }

  // Javob tekshiruvi; jadvalda — nechta qator xato
  const wrongRows = (answer, values) => answer.filter((v, i) => !values || values[i] !== v).length;
  function checkTask(task, value) {
    if (task.type === "table" || task.type === "evalTable") return wrongRows(task.answer, value) === 0;
    return value === task.answer;
  }

  const api = {
    OPS, PAIRS, BINARY, TEMPLATES,
    apply, table, rowIndex, circuit, evaluate, outputs, output, exprText, steps,
    halfAdd, bin, add2, addCols, add2Options, makeTask, checkTask, wrongRows,
    NONE, OUT_OPTIONS, outAnswer, litCount, ODD_TABLES, CLICK_MAX, oddTarget,
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else {
    root.QK = root.QK || {};
    root.QK.gates = api;
  }
})(typeof window !== "undefined" ? window : globalThis);

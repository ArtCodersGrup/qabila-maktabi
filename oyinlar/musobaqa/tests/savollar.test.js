// Musobaqa savollari: har tur × qiyinlik uchun javob to'g'riligi, javob tugmalari, matn va juft savollar.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

const win = {};
for (const f of [
  "../../umumiy/js/sanoq.js", "../../05-rim-toshi/js/roman.js", "../../03-sezar-maktubi/js/caesar.js",
  "../../02-qabila-morzesi/js/morse.js", "../../11-kop-qatlamli-tarmoq/js/neural.js", "../../12-ai-xaritasi/js/atlas.js",
  "../../13-bayt-sandigi/js/bytes.js", "../../16-xotira-ombori/js/units.js", "../../23-on-barmoq/js/typing.js", "../js/savollar.js",
]) loadScript(path.join(__dirname, f), win);
const { savollar: S, sanoq, roman, caesar, morse, neural, units, typing } = win.QK;

// Urug'li tasodif (mulberry32) — natija har safar bir xil
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Har tur × qiyinlik uchun ko'p savol (ro'yxatli turlarda takrorlar ham chiqadi — bu yerda muhim emas)
function* allQuestions(count = 150) {
  for (const kind of Object.keys(S.KINDS)) {
    for (const level of S.KINDS[kind].levels) {
      const r = rng(kind.length * 100 + level);
      for (let k = 0; k < count; k++) yield S.make(kind, level, r);
    }
  }
}

test("har mavzu va har qiyinlikda kamida bitta tur bor", () => {
  for (const t of S.TOPICS) for (const l of S.LEVELS) assert.ok(S.kindsOf(t.id, l.id).length > 0, `${t.id}/${l.id}`);
});

test("savol shakli: matn, javob, javob tugmalari javobni yoza oladi", () => {
  for (const q of allQuestions()) {
    const where = q.key;
    assert.ok(q.text.length > 5, where);
    assert.ok(q.answer.length > 0, where);
    assert.ok(q.explain.length > 0, where);
    assert.ok(Array.isArray(q.blocks), where);
    const inp = q.input;
    if (inp.type === "num") {
      assert.match(q.answer, /^\d+$/, where);
      assert.ok(q.answer.length <= inp.maxLen, `${where}: ${q.answer} > ${inp.maxLen} xona`);
    } else if (inp.type === "keys") {
      for (const ch of q.answer) assert.ok(inp.keys.includes(ch), `${where}: ${ch} tugmasi yo'q`);
      assert.ok(q.answer.length <= inp.maxLen, where);
      assert.ok(inp.keys.length >= 2 && inp.keys.length <= 16, where);
    } else {
      assert.equal(inp.type, "choice", where);
      assert.ok(inp.options.length >= 2 && inp.options.length <= 4, where);
      assert.equal(new Set(inp.options).size, inp.options.length, `${where}: takror variant`);
      assert.ok(inp.options.includes(q.answer), `${where}: javob variantlarda yo'q`);
    }
    assert.equal(S.check(q, q.answer), true, where);
    assert.equal(S.check(q, "Z9"), false, where);
  }
});

test("matnda oddiy apostrof yo'q (ʻ va ʼ ishlatiladi)", () => {
  for (const q of allQuestions(40)) {
    const all = [q.text, q.explain, ...(q.input.options || [])].join(" ");
    assert.ok(!/['`’]/.test(all), `${q.key}: ${all}`);
  }
});

test("tekshirish: son — bosh nolsiz, n-lik — bosh nollar e'tiborsiz, katta-kichik harf farqsiz", () => {
  const n = S.make("rimOqish", 1, rng(1));
  assert.equal(S.check(n, "0" + n.answer), true);
  assert.equal(S.check(n, ""), false);
  const b = S.make("ikkilikka", 2, rng(2));
  assert.equal(S.check(b, "0" + b.answer), true);
  const h = S.make("onlikdan", 3, rng(3));
  assert.equal(S.check(h, h.answer.toLowerCase()), true);
  const c = S.make("togri", 1, rng(4));
  assert.equal(S.check(c, c.answer), true);
  assert.equal(S.check(c, c.input.options.find((o) => o !== c.answer)), false);
});

// Har tur uchun javobni mustaqil qayta hisoblash
const ANSWER = {
  sozlar: (q) => {
    const d = q.data;
    if (d.type === "exact") return d.a ** d.i;
    if (d.type === "upto") { let s = 0; for (let k = 1; k <= d.i; k++) s += d.a ** k; return s; }
    let a = 1; while (a ** d.i < d.p) a++; return a;
  },
  morze: (q) => {
    const inv = Object.fromEntries(Object.entries(morse.CODES).map(([l, c]) => [c, l]));
    const word = q.blocks[0].groups.map((c) => inv[c]).join("");
    const guide = new Map(q.blocks[1].items);
    for (const opt of q.input.options) for (const ch of opt) assert.equal(guide.get(ch), morse.CODES[ch], `${q.key}: qo'llanmada ${ch}`);
    return word;
  },
  sezar: (q) => {
    const d = q.data;
    if (d.dir) return caesar.shift(d.letter, d.dir * d.k);
    if (d.plain) { let k = 0; while (caesar.shift(d.plain, k) !== d.enc) k++; return k; }
    assert.deepEqual(caesar.encrypt(caesar.tokenize(q.answer), d.k), d.enc);
    return caesar.decrypt(d.enc, d.k).join("").toUpperCase();
  },
  naqsh: (q) => {
    const d = q.data;
    if (d.type === "count") return d.states ** d.n;
    let k = 0; while (d.states ** k < d.n) k++; return k;
  },
  ikkilikdan: (q) => parseInt(q.data.s, 2),
  ikkilikka: (q) => q.data.n.toString(2),
  bayt: (q) => {
    const d = q.data;
    if (d.msg) return d.msg.length;
    return { bayt: d.n * 8, bit: d.n, Kbayt: d.n * 1024, Mbayt: d.n * 1024, "bayt→Kbayt": d.n, "bit→bayt": d.n }[d.from];
  },
  piksel: (q) => {
    const d = q.data;
    if (d.colors) return Math.log2(d.colors);
    const bits = d.w * d.h * d.bpp;
    return d.unit === "bit" ? bits : bits / 8;
  },
  kadr: (q) => {
    const d = q.data;
    if (d.ask === "frames") return d.fps * d.s;
    if (d.ask === "seconds") return d.s;
    if (d.fps) return d.fps * d.k * d.s;
    return d.k * d.n;
  },
  birlik: (q) => {
    const d = q.data;
    if (d.type === "next") return units.UNITS[d.i + 1];
    if (d.type === "factor") return d.i === 1 ? "8" : "1024";
    if (d.type === "largest") return q.input.options.slice().sort((a, b) => units.UNITS.indexOf(b) - units.UNITS.indexOf(a))[0];
    const [bx, by] = [units.toBits(d.x.n, d.x.unit), units.toBits(d.y.n, d.y.unit)];
    return bx === by ? "Teng" : bx > by ? `${d.x.n} ${d.x.unit}` : `${d.y.n} ${d.y.unit}`;
  },
  rimOqish: (q) => roman.fromRoman(q.blocks[0].text),
  rimYozish: (q) => { assert.equal(roman.fromRoman(q.answer), q.data.n); return roman.toRoman(q.data.n); },
  onlikka: (q) => parseInt(q.data.s, q.data.b),
  onlikdan: (q) => q.data.n.toString(q.data.b).toUpperCase(),
  tizim: (q) => {
    const d = q.data;
    if (d.s) return Math.max(...[...d.s].map(Number)) + 1;
    if (d.X) return (parseInt(d.X, d.b) + parseInt(d.Y, d.b)).toString(d.b);
    return d.x + d.y - d.r; // x + y = asos + r
  },
  togri: (q) => (q.data.ok ? "Toʻgʻri" : "Notoʻgʻri"),
  aimi: (q) => (q.data.zone === "plain" ? "Yoʻq" : "Ha"),
  neyron: (q) => {
    const d = q.data;
    const sum = d.inputs.reduce((s, x, i) => s + x * d.weights[i], 0);
    if (d.threshold == null) return sum;
    return sum >= d.threshold ? "Ha" : "Yoʻq";
  },
  xarita: (q) => {
    const { atlas } = win.QK;
    return q.data.task ? atlas.taskName(q.data.task) : atlas.zoneName(q.data.zone);
  },
  keyingi: (q) => {
    const d = q.data;
    const pairs = d.sentences.flatMap((s) => s.slice(0, -1).map((w, j) => [w, s[j + 1]]));
    if (d.a) return pairs.filter(([x, y]) => x === d.a && y === d.b).length;
    const counts = {};
    for (const [x, y] of pairs) if (x === d.w) counts[y] = (counts[y] || 0) + 1;
    const list = Object.entries(counts).sort((p, r) => r[1] - p[1]);
    assert.ok(list.length >= 2 && list[0][1] > list[1][1], `${q.key}: eng ko'pi yagona emas`);
    assert.deepEqual(q.input.options.slice().sort(), Object.keys(counts).sort());
    return list[0][0];
  },
  // Klaviatura: 23-o'yin mantiqi bilan qayta hisoblanadi
  barmoq: (q) => S.FINGER_NAMES[typing.fingerOf(q.data.key)],
  qator: (q) => ({ top: "Yuqori qator", home: "Asosiy qator", bottom: "Pastki qator" })[Object.keys(typing.ROWS).find((r) => typing.ROWS[r].includes(q.data.key))],
  ikkiTugma: (q) => S.TWO_KEYS.find((t) => t.letter === q.data.letter).answer,
  shiftQaysi: (q) => (typing.shiftFor(q.data.key.toUpperCase()) === "shift-l" ? "Chap Shift" : "Oʻng Shift"),
  aniqlik: (q) => Math.floor((q.data.c * 100) / q.data.s),
  tezlik: (q) => (q.data.c * 60) / q.data.sec,
  poyga: (q) => ({ left: "Oy", right: "Quyosh" })[typing.raceResult(q.data.a, q.data.b).winner] || "Hech kim",
  tezkorNima: (q) => S.SHORTCUTS.find((s) => s.keys === q.data.keys).act,
  tezkorQaysi: (q) => S.SHORTCUTS.find((s) => s.act === q.data.act).keys,
  vaziyat: (q) => S.SITUATIONS.find((s) => s.text === q.data.text).answer,
};

test("har turdagi javob mustaqil hisobga mos", () => {
  assert.deepEqual(Object.keys(ANSWER).sort(), Object.keys(S.KINDS).sort(), "har tur uchun tekshiruv bor");
  for (const q of allQuestions()) assert.equal(q.answer, String(ANSWER[q.kind](q)), `${q.key}: ${q.text}`);
});

test("qiyinlik chegaralari: sonlar va xonalar DIZAYN jadvaliga mos", () => {
  for (const q of allQuestions()) {
    const v = Number(q.answer);
    if (q.kind === "sozlar" && q.level === 1) assert.ok(v <= 27, q.key);
    if (q.kind === "sozlar" && q.level === 2) assert.ok(v <= 100, q.key);
    if (q.kind === "ikkilikdan") assert.ok(v <= [0, 15, 31, 63][q.level] && v >= [0, 1, 8, 16][q.level], q.key);
    if (q.kind === "ikkilikdan" && q.level === 1) assert.deepEqual(q.blocks[1].items, [8, 4, 2, 1].slice(4 - q.data.s.length), q.key);
    if (q.kind === "rimOqish") assert.ok(v <= [0, 20, 50, 100][q.level] && v >= [0, 2, 21, 51][q.level], q.key);
    if (q.kind === "onlikdan" && q.level === 3) assert.match(q.key, /_16$/);
    if (q.kind === "sezar" && q.level === 1) assert.ok(caesar.ALPHABET.indexOf(q.data.letter) + q.data.k < caesar.ALPHABET.length, `${q.key}: aylanmasin`);
    if (q.kind === "neyron" && q.level === 1) assert.ok(q.data.weights.every((w) => w === 1), q.key);
    if (q.kind === "neyron" && q.level === 2) assert.ok(q.data.weights.includes(-1), q.key);
    if (q.kind === "tizim" && q.level === 2) assert.ok(v >= 3 && v <= 9, q.key);
  }
});

test("neyron qoidasi 11-o'yindagidek (yig'indi ≥ chegara)", () => {
  const r = rng(7);
  for (let k = 0; k < 100; k++) {
    const q = S.make("neyron", 2, r);
    assert.equal(q.answer === "Ha", neural.fire(q.data.inputs, q.data.weights, q.data.threshold), q.key);
  }
});

test("dasta: juft savol — bir xil tur va qiyinlik, kalitlar har xil, takror yo'q", () => {
  const d = S.deck({ topics: ["kod", "ikkilik", "olchov", "sanoq", "ai"], levels: [1, 2, 3], rng: rng(11) });
  const seen = new Set();
  const topics = new Set();
  let prev = null;
  let repeats = 0;
  for (let round = 0; round < 150; round++) {
    const pair = d.next();
    assert.ok(pair, `raund ${round}`);
    const [a, b] = pair;
    assert.equal(a.kind, b.kind);
    assert.equal(a.level, b.level);
    assert.notEqual(a.key, b.key);
    for (const q of pair) {
      assert.ok(!seen.has(q.key), `takror: ${q.key}`);
      seen.add(q.key);
    }
    topics.add(a.topic);
    if (prev === a.kind) repeats++;
    prev = a.kind;
  }
  assert.equal(topics.size, 5, "hamma mavzudan savol chiqdi");
  assert.equal(repeats, 0, "ketma-ket bir xil tur chiqmaydi");
});

test("dasta faqat tanlangan mavzu va qiyinlikdan beradi", () => {
  const d = S.deck({ topics: ["sanoq"], levels: [2], rng: rng(5) });
  for (let k = 0; k < 40; k++) {
    const [a] = d.next();
    assert.equal(a.topic, "sanoq");
    assert.equal(a.level, 2);
  }
});

// Birinchi takrorgacha nechta raund o'tadi
function roundsUntilRepeat(d, limit) {
  const seen = new Set();
  for (let rounds = 0; rounds < limit; rounds++) {
    const pair = d.next();
    assert.ok(pair, "dasta hech qachon tugamaydi");
    if (pair.some((q) => seen.has(q.key))) return { rounds, seen };
    pair.forEach((q) => seen.add(q.key));
  }
  return { rounds: limit, seen };
}

test("takror faqat hamma savol ishlatilgandan keyin; dasta qaytadan aralashib davom etadi", () => {
  // AI, Oson: tasdiqlar va misollar ro'yxati + neyron (sanoqli holatlar)
  const d = S.deck({ topics: ["ai"], levels: [1], rng: rng(3) });
  const { rounds, seen } = roundsUntilRepeat(d, 500);
  const facts = [...seen].filter((k) => k.startsWith("togri:")).length;
  assert.ok(facts >= S.FACTS.length - 1, `takrorgacha tasdiqlarning deyarli hammasi ishlatildi: ${facts}`);
  assert.ok(rounds >= 40, `takrorgacha raundlar: ${rounds}`);
  for (let k = 0; k < 200; k++) assert.ok(d.next(), "qaytadan aralashgandan keyin ham davom etadi");
});

test("har mavzu va qiyinlikda takrorsiz kamida 15 raund, 10 daqiqaga ham yetadi (150 raund)", () => {
  for (const t of S.TOPICS) {
    for (const l of S.LEVELS) {
      const d = S.deck({ topics: [t.id], levels: [l.id], rng: rng(t.id.length + l.id) });
      const { rounds } = roundsUntilRepeat(d, 15);
      assert.equal(rounds, 15, `${t.id}/${l.id}: ${rounds}-raundda takror`);
      for (let k = 0; k < 135; k++) assert.ok(d.next(), `${t.id}/${l.id}`);
    }
  }
});

test("klaviatura: barmoq va Shift 23-o'yindagidek, tezkor tugmalar takrorsiz, sonlar butun", () => {
  assert.equal(new Set(S.SHORTCUTS.map((s) => s.keys)).size, S.SHORTCUTS.length);
  assert.equal(new Set(S.SHORTCUTS.map((s) => s.act)).size, S.SHORTCUTS.length);
  for (const l of [1, 2, 3]) assert.ok(S.SHORTCUTS.filter((s) => s.level === l).length >= 4, `${l}-daraja`);
  const r = rng(23);
  for (let k = 0; k < 100; k++) {
    const b = S.make("barmoq", 1, r);
    assert.ok(typing.ROWS.home.includes(b.data.key), b.key);
    const a = S.make("aniqlik", 3, r);
    assert.ok(Number(a.answer) >= 70 && Number(a.answer) <= 100 && a.data.c <= a.data.s, a.key);
    const t = S.make("tezlik", 3, r);
    assert.ok(Number.isInteger(Number(t.answer)) && Number(t.answer) <= 180, t.key);
  }
  assert.equal(S.make("shiftQaysi", 2, () => 0).answer, "Oʻng Shift"); // Q — chap qo'l → o'ng Shift
});

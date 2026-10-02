// bytes.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const B = require("../js/bytes.js");

// Takrorlanadigan tasodif: har chaqiruvda ro'yxatdagi keyingi son
const seq = (...values) => { let k = 0; return () => values[k++ % values.length]; };

test("minBits: eng kamida nechta bit", () => {
  assert.equal(B.minBits(2), 1);
  assert.equal(B.minBits(26), 5);
  assert.equal(B.minBits(32), 5);
  assert.equal(B.minBits(33), 6);
  assert.equal(B.minBits(62), 6);
  assert.equal(B.minBits(95), 7);
  assert.equal(B.minBits(256), 8);
  assert.equal(B.pow2(8), 256);
});

test("to'plamlar: 26, 52, 62, 95 va kerakli bitlar 5, 6, 6, 7", () => {
  assert.deepEqual(B.SETS.map((s) => s.total), [26, 52, 62, 95]);
  assert.deepEqual(B.SETS.map((s) => B.minBits(s.total)), [5, 6, 6, 7]);
  let sum = 0;
  for (const s of B.SETS) {
    sum += s.add;
    assert.equal(s.total, sum, s.name);
    assert.ok(s.name && s.sample, s.name);
  }
});

test("checkBits: kam, ko'p va aynan", () => {
  assert.equal(B.checkBits(5, 52), "few");
  assert.equal(B.checkBits(7, 52), "many");
  assert.equal(B.checkBits(6, 52), "ok");
});

test("charBits: belgining 8 bitli kodi (ASCII)", () => {
  assert.equal(B.charBits("A"), "01000001");
  assert.equal(B.charBits(" "), "00100000");
  assert.equal(B.charBits("!"), "00100001");
  assert.equal(B.charBits("0"), "00110000");
});

test("xabarlar: faqat ASCII, 6–16 belgi, bosh harflar", () => {
  assert.ok(B.MESSAGES.length >= 12);
  for (const m of B.MESSAGES) {
    assert.match(m, /^[A-Z0-9 .,!?+=]+$/, m);
    assert.ok(m.length >= 6 && m.length <= 16, m);
    assert.ok(m.includes(" ") || /[.,!?]/.test(m), `${m}: bo'sh joy yoki belgi bo'lsin`);
  }
  assert.equal(B.DEMO, "SALOM, ALI!");
  assert.equal(B.DEMO.length, 11);
});

test("doublings: 1 dan 1024 gacha, 10 qadam", () => {
  const d = B.doublings();
  assert.equal(d.length, 11);
  assert.equal(d[0], 1);
  assert.equal(d[8], 256);
  assert.equal(d[10], 1024);
  assert.equal(B.KB, 1024);
});

test("makeBitTask: bayt → bit va bit → bayt, chegaralar tier bilan o'sadi", () => {
  assert.deepEqual(B.BIT_BYTES, [[2, 6], [7, 12], [10, 15]]);
  for (const tier of [0, 1, 2]) {
    const types = new Set();
    for (let k = 0; k < 300; k++) {
      const t = B.makeBitTask(null, Math.random, tier);
      types.add(t.type);
      assert.equal(t.bits, t.bytes * 8);
      assert.ok(t.bytes >= B.BIT_BYTES[tier][0] && t.bytes <= B.BIT_BYTES[tier][1]);
      assert.equal(t.answer, t.type === "toBits" ? t.bits : t.bytes);
      assert.ok(t.answer <= 96, "javob yoddan hisoblanadigan chegarada");
    }
    assert.deepEqual([...types].sort(), tier === 2 ? ["toBytes"] : ["toBits", "toBytes"]);
  }
  const t = B.makeBitTask(null, seq(0.1, 0.0));
  assert.deepEqual(t, { type: "toBits", bytes: 2, bits: 16, answer: 16 });
});

test("makeBitTask: bir xil misol ketma-ket chiqmaydi", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    for (let k = 0; k < 200; k++) {
      const t = B.makeBitTask(prev, Math.random, tier);
      if (prev) assert.ok(!(prev.type === t.type && prev.bytes === t.bytes));
      prev = t;
    }
  }
});

test("makeTextTask: bayt — belgilar soni, bit — × 8 va ≤ 96; uzunlik tier bilan o'sadi", () => {
  for (const tier of [0, 1, 2]) {
    let prev = null;
    const [lo, hi] = B.TEXT_LEN[tier];
    for (let k = 0; k < 300; k++) {
      const t = B.makeTextTask(prev, Math.random, tier);
      const n = t.message.length;
      if (t.type === "bytes") {
        assert.equal(t.answer, n);
        assert.ok(n >= lo && n <= hi, `${tier}: ${t.message}`);
      } else {
        assert.equal(t.answer, n * 8);
        assert.ok(n <= 12 && t.answer <= 96, t.message);
        assert.ok(n >= Math.min(lo, 10), `${tier}: ${t.message}`);
      }
      if (prev) assert.ok(!(prev.type === t.type && prev.message === t.message));
      prev = t;
    }
  }
  // Har tier va turda kamida 2 ta xabar bor (takrorlanmaslik uchun)
  for (const [lo, hi] of B.TEXT_LEN) {
    assert.ok(B.MESSAGES.filter((m) => m.length >= lo && m.length <= hi).length >= 2);
    assert.ok(B.MESSAGES.filter((m) => m.length >= Math.min(lo, 10) && m.length <= Math.min(hi, 12)).length >= 2);
  }
});

test("makeKbTask: sahifalar, baytdan Kbaytga, 4 variantli taqqoslash (teng ham bor)", () => {
  for (const tier of [0, 1, 2]) {
    const seen = new Set();
    const answers = new Set();
    let prev = null;
    for (let k = 0; k < 800; k++) {
      const t = B.makeKbTask(prev, Math.random, tier);
      seen.add(t.type);
      if (t.type === "pages") {
        assert.ok(t.pages >= B.PAGES[tier][0] && t.pages <= B.PAGES[tier][1]);
        assert.equal(t.answer, t.pages * 2);
        assert.ok(t.answer <= 50);
      } else if (t.type === "toKb") {
        assert.equal(t.bytes, t.answer * 1024);
        assert.ok(t.answer >= B.TO_KB[tier][0] && t.answer <= B.TO_KB[tier][1]);
      } else {
        assert.equal(t.type, "compare");
        assert.ok(t.kb >= B.CMP_KB[tier][0] && t.kb <= B.CMP_KB[tier][1]);
        assert.ok(t.pages >= 1);
        // Mustaqil hisob: baytda
        const v = { kb: t.kb * 1024, bytes: t.bytes, pages: t.pages * 2048 };
        const max = Math.max(v.kb, v.bytes, v.pages);
        const tops = Object.keys(v).filter((key) => v[key] === max);
        if (t.answer === "teng") assert.equal(tops.length, 3);
        else assert.deepEqual(tops, [t.answer], "bitta eng katta");
        assert.ok(B.CMP_OPTIONS.includes(t.answer));
        answers.add(t.answer);
      }
      if (prev) assert.ok(JSON.stringify(prev) !== JSON.stringify(t), "takror");
      prev = t;
    }
    assert.deepEqual([...seen].sort(), ["compare", "pages", "toKb"]);
    assert.deepEqual([...answers].sort(), ["bytes", "kb", "pages", "teng"], `tier ${tier}: 4 javobning hammasi uchraydi`);
  }
  assert.equal(B.CMP_OPTIONS.length, 4);
  assert.equal(B.cmpAnswer({ kb: 2, bytes: 2048, pages: 1 }), "teng");
  assert.equal(B.cmpAnswer({ kb: 3, bytes: 3000, pages: 1 }), "kb");
  assert.equal(B.cmpAnswer({ kb: 3, bytes: 4000, pages: 1 }), "bytes");
  assert.equal(B.cmpAnswer({ kb: 3, bytes: 3000, pages: 2 }), "pages");
});

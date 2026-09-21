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

test("makeBitTask: bayt → bit va bit → bayt, javob ≤ 72", () => {
  for (let k = 0; k < 200; k++) {
    const t = B.makeBitTask(null);
    assert.equal(t.bits, t.bytes * 8);
    assert.ok(t.bytes >= 2 && t.bytes <= 9);
    assert.equal(t.answer, t.type === "toBits" ? t.bits : t.bytes);
    assert.ok(t.answer <= 72);
  }
  const t = B.makeBitTask(null, seq(0.1, 0.0));
  assert.deepEqual(t, { type: "toBits", bytes: 2, bits: 16, answer: 16 });
});

test("makeBitTask: bir xil misol ketma-ket chiqmaydi", () => {
  let prev = null;
  for (let k = 0; k < 200; k++) {
    const t = B.makeBitTask(prev);
    if (prev) assert.ok(!(prev.type === t.type && prev.bytes === t.bytes));
    prev = t;
  }
});

test("makeTextTask: bayt — belgilar soni, bit — × 8 va ≤ 96", () => {
  let prev = null;
  for (let k = 0; k < 300; k++) {
    const t = B.makeTextTask(prev);
    const n = t.message.length;
    if (t.type === "bytes") assert.equal(t.answer, n);
    else {
      assert.equal(t.answer, n * 8);
      assert.ok(n <= 12 && t.answer <= 96, t.message);
    }
    if (prev) assert.ok(!(prev.type === t.type && prev.message === t.message));
    prev = t;
  }
});

test("makeKbTask: sahifalar, baytdan Kbaytga, taqqoslash", () => {
  const seen = new Set();
  let prev = null;
  for (let k = 0; k < 400; k++) {
    const t = B.makeKbTask(prev);
    seen.add(t.type);
    if (t.type === "pages") {
      assert.ok(t.pages >= 2 && t.pages <= 10);
      assert.equal(t.answer, t.pages * 2);
    } else if (t.type === "toKb") {
      assert.equal(t.bytes, t.answer * 1024);
      assert.ok(t.answer >= 2 && t.answer <= 6);
    } else {
      assert.equal(t.type, "compare");
      assert.ok(t.bytes === 1000 * t.kb || t.bytes === 1000 * (t.kb + 1));
      assert.equal(t.answer, t.kb * 1024 > t.bytes ? "kb" : "bytes");
    }
    if (prev) assert.ok(JSON.stringify(prev) !== JSON.stringify(t), "takror");
    prev = t;
  }
  assert.deepEqual([...seen].sort(), ["compare", "pages", "toKb"]);
});

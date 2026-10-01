// 42-o'yin mantiqi: n! va A(n,k) — formula ro'yxatni sanashi kerak.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const S = require("../../umumiy/js/sanash.js");
const K = require("../../umumiy/js/kod.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const each = (make, n, seed) => {
  const r = rngFrom(seed || 42);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("ekranda ko'rsatiladigan tartiblar ro'yxati n! ga teng", () => {
  for (let n = 1; n <= 5; n++) {
    const list = L.tartiblar(n);
    assert.equal(BigInt(list.length), S.fakt(n), "n=" + n);
    const kalit = list.map((x) => x.join("|"));
    assert.equal(new Set(kalit).size, kalit.length, "takror tartib bor, n=" + n);
    for (const t of list) assert.equal(new Set(t).size, n, "bitta bola ikki marta turibdi");
  }
  // 3 ta bolaning 6 ta tartibi ekranga sig'adi
  assert.equal(L.tartiblar(3).length, 6);
});

test("qadamlar: n, n−1, …, 1 — ko'paytmasi n!", () => {
  for (let n = 1; n <= 8; n++) {
    const q = L.qadamlar(n);
    assert.deepEqual(q, Array.from({ length: n }, (_, k) => n - k));
    assert.equal(S.kopaytir(q), S.fakt(n), "n=" + n);
  }
});

test("n! savollari: javob va hisob mos", () => {
  for (const t of each(L.faktTask, 30, 3)) {
    assert.equal(t.tur, "fakt");
    assert.equal(t.javob, S.fakt(t.n));
    assert.ok(t.n >= 3 && t.n <= 7, "n = " + t.n);
    assert.ok(t.hisob.endsWith(String(t.javob)), t.hisob);
    assert.ok(t.hisob.includes(t.n + "!"), t.hisob);
  }
});

test("A(n,k) savollari: javob A ga teng, k = n bo'lsa n! ga aylanadi", () => {
  for (const t of each(L.orinTask, 40, 7)) {
    assert.equal(t.javob, S.A(t.n, t.k), t.matn);
    assert.ok(t.k >= 1 && t.k <= t.n, t.matn);
    if (t.k === t.n) assert.equal(t.javob, S.fakt(t.n), t.matn);
    const kopaytuvchilar = t.hisob.split(" = ")[0].split(" × ").map(Number);
    assert.equal(kopaytuvchilar.length, t.k, t.hisob);
    assert.equal(kopaytuvchilar[0], t.n, t.hisob);
  }
});

test("kod masalalari: dastur javobi formulaga teng", () => {
  for (const t of each(L.kodTask, 24, 5)) {
    assert.equal(t.type, "natija");
    assert.deepEqual(K.expectedFor(t), [String(t.javob)], t.id);
  }
});

test("namunali yechimlar hamma testdan o'tadi (20! ham)", () => {
  for (const w of L.WRITE) {
    const task = { type: "kod-yoz", what: w.what, solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
    assert.equal(K.check(task, w.solution).ok, true, w.id);
  }
  // Talqinchi int'i BigInt: 23! ni ham aniq hisoblaydi (JS number bu yerda xato beradi)
  const fakt = { type: "kod-yoz", solution: L.WRITE[0].solution, tail: L.WRITE[0].tail, tests: [{ stdin: ["23"] }] };
  assert.deepEqual(K.expectedFor(fakt, { stdin: ["23"] }), ["25852016738884976640000"]);
});

test("xato yechimlar o'tmaydi", () => {
  const w = L.WRITE[0];
  const task = { type: "kod-yoz", what: w.what, solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
  // n = 0 uchun 0 qaytaradi — chegara holati
  assert.equal(K.check(task, "def fakt(n):\n    k = n\n    for i in range(1, n):\n        k = k * i\n    return k").ok, false);
  const o = L.WRITE[1];
  const t2 = { type: "kod-yoz", what: o.what, solution: o.solution, tail: o.tail, tests: o.tests.map((stdin) => ({ stdin })) };
  // A o'rniga n^k — ko'p uchraydigan xato
  assert.equal(K.check(t2, "def orin(n, k):\n    return n ** k").ok, false);
});

test("n! o'sishi: 23! JS number'da xato, BigInt aniq beradi", () => {
  const oxirgi = L.OSISH[L.OSISH.length - 1];
  assert.equal(oxirgi.n, 23);
  assert.equal(oxirgi.qiymat, 25852016738884976640000n);
  // 19! allaqachon MAX_SAFE_INTEGER dan katta; 23! esa number'da boshqa son bo'lib qoladi
  assert.ok(S.fakt(18) < BigInt(Number.MAX_SAFE_INTEGER));
  assert.ok(S.fakt(19) > BigInt(Number.MAX_SAFE_INTEGER));
  assert.notEqual(BigInt(Number(oxirgi.qiymat)), oxirgi.qiymat, "number aniq emas — BigInt kerak");
  for (let k = 1; k < L.OSISH.length; k++) assert.ok(L.OSISH[k].qiymat > L.OSISH[k - 1].qiymat);
});

test("tartiblarni sanash qadami o'lchanadi va n bilan keskin o'sadi", () => {
  const uch = L.olchaTartib(3);
  const tort = L.olchaTartib(4);
  assert.equal(uch.xato, null);
  assert.equal(tort.xato, null);
  assert.ok(tort.qadam > uch.qadam * 3, uch.qadam + " → " + tort.qadam);
});

test("ketma-ket savollar takrorlanmaydi", () => {
  for (const make of [L.faktTask, L.orinTask, L.kodTask, L.writeTask]) {
    const list = each(make, 12, 19);
    for (let k = 1; k < list.length; k++) assert.notEqual(list[k].id, list[k - 1].id);
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  const matnlar = [...L.BOLALAR];
  const r = rngFrom(4);
  for (let k = 0; k < 25; k++) {
    const f = L.faktTask(r, null);
    const o = L.orinTask(r, null);
    matnlar.push(f.matn, f.nega, o.matn, o.nega);
  }
  for (const w of L.WRITE) matnlar.push(w.what);
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "notoʻgʻri belgi: " + m);
});

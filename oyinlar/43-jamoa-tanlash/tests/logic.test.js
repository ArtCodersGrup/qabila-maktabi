// 43-o'yin mantiqi: C(n,k) — tartib muhim emas. Formula ro'yxatni sanashi kerak.
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
  const r = rngFrom(seed || 43);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

// O'yinning asosiy da'vosi: A(n,k) ichida har jamoa k! marta takrorlanadi
test("A = C × k! — ro'yxatlar ustida tekshiriladi", () => {
  for (let n = 1; n <= 5; n++) {
    for (let k = 0; k <= n; k++) {
      const jamoa = L.jamoalar(n, k);
      const tartib = L.tartiblar(n, k);
      assert.equal(BigInt(jamoa.length), S.C(n, k), `C(${n},${k})`);
      assert.equal(BigInt(tartib.length), S.A(n, k), `A(${n},${k})`);
      assert.equal(tartib.length, jamoa.length * Number(S.fakt(k)), `${n},${k}: A = C × k!`);
    }
  }
});

test("bitta jamoaning hamma tartiblari k! ta va hammasi har xil", () => {
  for (const jamoa of L.jamoalar(5, 3)) {
    const t = L.takrorlar(jamoa);
    assert.equal(t.length, 6, jamoa.join("+"));
    assert.equal(new Set(t.map((x) => x.join("|"))).size, 6);
    // Har tartibda o'sha uch bolaning o'zi
    for (const x of t) assert.deepEqual([...x].sort(), [...jamoa].sort());
  }
});

test("bolish: A, k! va C bir-biriga mos", () => {
  for (const [n, k] of [[5, 3], [10, 2], [7, 4], [9, 1]]) {
    const b = L.bolish(n, k);
    assert.equal(b.a / b.kfakt, b.c, `${n},${k}`);
    assert.equal(b.a % b.kfakt, 0n, "A k! ga butun bo'linishi kerak");
  }
});

test("tartib savollari: javob qoidaga mos, xato javob — boshqa qoidadan", () => {
  for (const t of each(L.tartibTask, 40, 5)) {
    const c = S.C(t.n, t.k);
    const a = S.A(t.n, t.k);
    assert.equal(t.javob, t.qoida === "c" ? c : a, t.matn);
    assert.equal(t.xato, t.qoida === "c" ? a : c, t.matn);
    assert.notEqual(t.javob, t.xato, "ikki javob bir xil — savol farqni koʻrsatmaydi: " + t.matn);
    assert.ok(t.javob > 0n, t.matn);
    assert.ok(t.nega.length > 20, t.id);
  }
});

test("har ikki qoidadan ham savol chiqadi", () => {
  const turlar = new Set(each(L.tartibTask, 40, 11).map((t) => t.qoida));
  assert.ok(turlar.has("c") && turlar.has("a"), [...turlar].join(","));
});

test("kod masalalari: i < j sikli aynan C ni sanaydi", () => {
  for (const t of each(L.kodTask, 24, 7)) {
    assert.deepEqual(K.expectedFor(t), [String(t.javob)], t.id);
    assert.equal(t.javob, S.C(t.n, t.k));
  }
});

test("namunali yechimlar hamma testdan o'tadi, C(20,10) ham", () => {
  for (const w of L.WRITE) {
    const task = { type: "kod-yoz", what: w.what, solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
    assert.equal(K.check(task, w.solution).ok, true, w.id);
  }
  const t = { type: "kod-yoz", solution: L.WRITE[0].solution, tail: L.WRITE[0].tail, tests: [{ stdin: ["20", "10"] }] };
  assert.deepEqual(K.expectedFor(t, { stdin: ["20", "10"] }), [String(S.C(20, 10))]);
  assert.equal(S.C(20, 10), 184756n);
});

test("tipik xato yechimlar o'tmaydi", () => {
  const w = L.WRITE[0];
  const task = { type: "kod-yoz", what: w.what, solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
  // k! ga bo'lishni unutish — A ni qaytaradi
  assert.equal(K.check(task, "def tanla(n, k):\n    natija = 1\n    for i in range(k):\n        natija = natija * (n - i)\n    return natija").ok, false);
  // j = i dan boshlash — o'zini o'ziga tutashtiradi
  const j = L.WRITE[1];
  const t2 = { type: "kod-yoz", solution: j.solution, tail: j.tail, tests: j.tests.map((stdin) => ({ stdin })) };
  assert.equal(K.check(t2, "def juftlar(n):\n    soni = 0\n    for i in range(n):\n        for j in range(i, n):\n            soni += 1\n    return soni").ok, false);
});

test("C xossalari to'g'ri yozilgan", () => {
  for (let n = 0; n <= 12; n++) {
    assert.equal(S.C(n, 0), 1n);
    assert.equal(S.C(n, n), 1n);
    if (n >= 1) assert.equal(S.C(n, 1), BigInt(n));
    for (let k = 0; k <= n; k++) assert.equal(S.C(n, k), S.C(n, n - k));
  }
  assert.equal(L.XOSSALAR.length, 3);
  for (const x of L.XOSSALAR) assert.ok(x.matn.includes("C(") && x.izoh.length > 10, x.id);
});

test("ketma-ket savollar takrorlanmaydi", () => {
  for (const make of [L.tartibTask, L.kodTask, L.writeTask]) {
    const list = each(make, 12, 17);
    for (let k = 1; k < list.length; k++) assert.notEqual(list[k].id, list[k - 1].id);
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  const matnlar = [...L.BOLALAR];
  const r = rngFrom(6);
  for (let k = 0; k < 30; k++) {
    const t = L.tartibTask(r, null);
    matnlar.push(t.matn, t.nega);
  }
  for (const w of L.WRITE) matnlar.push(w.what);
  for (const x of L.XOSSALAR) matnlar.push(x.izoh);
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "notoʻgʻri belgi: " + m);
});

// Ekranda "belgilangan ikki qatorga qara" deyiladi — birinchi 12 qator ichida
// haqiqatan ham o'sha jamoaning ikkita tartibi turishi kerak
test("birinchi 12 tartib ichida birinchi jamoaning aynan 2 tasi bor", () => {
  const hamma = L.tartiblar(5, 3);
  const kalit = [...hamma[0]].sort().join("|");
  const belgi = hamma.slice(0, 12).filter((t) => [...t].sort().join("|") === kalit);
  assert.equal(belgi.length, 2, "ekrandagi matn «ikki qator» deydi");
  assert.equal(L.takrorlar(hamma[0]).length, 6);
});

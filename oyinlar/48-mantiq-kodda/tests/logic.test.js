// 48-o'yin mantiqi: True/False, and/or/not. Qiymatlarni talqinchining o'zi hisoblaydi.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const K = require("../../umumiy/js/kod.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const each = (make, n, seed) => {
  const r = rngFrom(seed || 48);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("qiymat(): ifodani Python hisoblaydi", () => {
  assert.equal(L.qiymat("5 > 3").qiymat, "True");
  assert.equal(L.qiymat("5 == 3").qiymat, "False");
  assert.equal(L.qiymat("a and b", { a: "True", b: "False" }).qiymat, "False");
  assert.equal(L.qiymat("not a", { a: "False" }).qiymat, "True");
  assert.ok(L.qiymat("5 >").xato, "sintaksis xatosi tutilishi kerak");
});

// Rostlik jadvali qo'lda yozilmaydi — Pythonning o'zidan chiqadi
test("jadval(): and, or, not uchun to'g'ri rostlik jadvali", () => {
  const and = L.jadval("a and b");
  assert.deepEqual(and.map((q) => q.natija), [true, false, false, false]);
  const or = L.jadval("a or b");
  assert.deepEqual(or.map((q) => q.natija), [true, true, true, false]);
  const not = L.jadval("not a");
  assert.equal(not.length, 2, "bitta o'zgaruvchi — ikki qator");
  assert.deepEqual(not.map((q) => q.natija), [false, true]);
  // De Morgan: not (a and b) = not a or not b
  assert.deepEqual(L.jadval("not (a and b)").map((q) => q.natija), L.jadval("not a or not b").map((q) => q.natija));
});

test("solishtirish savollari: javob True yoki False", () => {
  for (const t of each(L.solishtirTask, 30, 3)) {
    assert.ok(["True", "False"].includes(t.javob), t.ifoda + " → " + t.javob);
    assert.equal(t.javob, L.qiymat(t.ifoda).qiymat);
    assert.ok(t.matn.includes("print("), t.matn);
  }
  // Ikkala javob ham uchrashi kerak (savollar bir tomonlama bo'lib qolmasin)
  const javoblar = new Set(each(L.solishtirTask, 30, 11).map((t) => t.javob));
  assert.equal(javoblar.size, 2, [...javoblar].join(","));
});

test("ifoda savollari: javob o'zgaruvchilar bilan hisoblanadi", () => {
  for (const t of each(L.ifodaTask, 40, 7)) {
    assert.equal(t.javob, L.qiymat(t.ifoda, t.vars).qiymat, t.ifoda + " " + JSON.stringify(t.vars));
    assert.ok(["True", "False"].includes(t.javob));
    if (!t.ifoda.includes("b")) assert.equal(t.vars.b, undefined, "kerak bo'lmagan o'zgaruvchi berilmasin");
  }
});

test("hayotiy gaplar: har uch amal uchun ham misol bor", () => {
  const turlar = new Set(L.GAPLAR.map((g) => g.javob));
  assert.deepEqual([...turlar].sort(), ["and", "not", "or"]);
  for (const g of L.GAPLAR) assert.ok(g.matn.length > 20, g.matn);
  for (const t of each(L.gapTask, 20, 13)) {
    // id va matn bitta gapdan olinishi kerak
    assert.equal(t.id, "gap:" + t.matn, "id boshqa gapdan olingan");
    assert.ok(["and", "or", "not"].includes(t.javob));
  }
});

test("kod masalalari xatosiz ishlaydi va True/False chiqaradi", () => {
  for (const k of L.KOD) {
    const kutilgan = K.expectedFor({ type: "natija", code: k.kod, solution: k.kod });
    assert.equal(kutilgan.length, 1, k.id);
    assert.ok(["True", "False"].includes(kutilgan[0]), k.id + " → " + kutilgan[0]);
  }
});

test("namunali yechimlar hamma testdan o'tadi", () => {
  for (const w of L.WRITE) {
    const task = { type: "kod-yoz", what: w.what, solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
    assert.equal(K.check(task, w.solution).ok, true, w.id);
  }
});

test("chegara xatolari o'tmaydi (> va >= farqi)", () => {
  const w = L.WRITE[1]; // oraliqda: x > 10 and x < 20
  const task = { type: "kod-yoz", solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
  assert.equal(K.check(task, "def oraliqda(x):\n    return x >= 10 and x <= 20").ok, false, "chegara noto'g'ri");
  const m = L.WRITE[0]; // mumkin: yosh >= 12
  const t2 = { type: "kod-yoz", solution: m.solution, tail: m.tail, tests: m.tests.map((stdin) => ({ stdin })) };
  assert.equal(K.check(t2, "def mumkin(yosh, bilet):\n    return yosh > 12 and bilet").ok, false, "12 yosh ham kirishi kerak");
  // "or" o'rniga "and" yozish
  const d = L.WRITE[2];
  const t3 = { type: "kod-yoz", solution: d.solution, tail: d.tail, tests: d.tests.map((stdin) => ({ stdin })) };
  assert.equal(K.check(t3, 'def dam(kun):\n    return kun == "shanba" and kun == "yakshanba"').ok, false);
});

test("ketma-ket savollar takrorlanmaydi", () => {
  for (const make of [L.solishtirTask, L.ifodaTask, L.gapTask, L.kodTask, L.writeTask]) {
    const list = each(make, 10, 29);
    for (let k = 1; k < list.length; k++) assert.notEqual(list[k].id, list[k - 1].id);
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  const matnlar = L.GAPLAR.map((g) => g.matn).concat(L.WRITE.map((w) => w.what));
  const r = rngFrom(5);
  for (let k = 0; k < 15; k++) matnlar.push(L.solishtirTask(r, null).nega, L.ifodaTask(r, null).nega);
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "notoʻgʻri belgi: " + m);
});

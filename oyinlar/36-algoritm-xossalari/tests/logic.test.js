// 36-o'yin mantiqi: xossalar, buzuq algoritmlar, ikki yechim va qadam o'lchovi.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const K = require("../../umumiy/js/kod.js");
const py = require("../../umumiy/js/python/python.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const each = (make, n, seed) => {
  const r = rngFrom(seed || 31);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("beshta xossa bor, har birining nomi va izohi bilan", () => {
  assert.deepEqual(L.XOSSALAR.map((x) => x.id),
    ["tushunarlilik", "aniqlik", "diskretlik", "natijaviylik", "ommaviylik"]);
  for (const x of L.XOSSALAR) {
    assert.ok(x.nom.length > 3, x.id);
    assert.ok(x.izoh.length > 25, x.id + ": izoh qisqa");
  }
});

test("buzuq algoritmlar: har birining buzilgan qatori va xossasi to'g'ri", () => {
  assert.ok(L.BUZUQ.length >= 5);
  for (const b of L.BUZUQ) {
    assert.ok(Array.isArray(b.qadamlar) && b.qadamlar.length >= 2, b.id);
    assert.ok(b.buzuq >= 0 && b.buzuq < b.qadamlar.length, b.id + ": buzilgan qator chegaradan tashqarida");
    assert.ok(L.XOSSALAR.some((x) => x.id === b.xossa), b.id + ": notanish xossa");
    assert.ok(b.nega.length > 25, b.id + ": nega qisqa");
    assert.ok(b.tuzatilgan.length > 5, b.id + ": tuzatilgani yo'q");
  }
});

test("hamma xossa uchun kamida bitta misol bor", () => {
  const bor = new Set(L.BUZUQ.map((b) => b.xossa));
  for (const x of L.XOSSALAR) assert.ok(bor.has(x.id), x.id + " uchun misol yo'q");
});

test("ikki yechim: javob bir xil, qadamlar soni boshqa", () => {
  for (const j of L.JUFTLAR) {
    const a = L.olcha(j.a.kod);
    const b = L.olcha(j.b.kod);
    assert.equal(a.xato, null, j.id + " (a)");
    assert.equal(b.xato, null, j.id + " (b)");
    assert.deepEqual(a.chiqish, b.chiqish, j.id + ": javoblar bir xil bo'lishi kerak");
    assert.notEqual(a.qadam, b.qadam, j.id + ": qadamlar bir xil bo'lib qoldi");
    assert.ok(b.qadam < a.qadam, j.id + ": ikkinchi yechim tejamli bo'lishi kerak");
  }
});

test("qadam o'lchovi haqiqiy: sikl uzunligi bilan o'sadi", () => {
  const kam = L.olcha("s = 0\nfor i in range(10):\n    s += i\nprint(s)").qadam;
  const kop = L.olcha("s = 0\nfor i in range(100):\n    s += i\nprint(s)").qadam;
  assert.ok(kop > kam * 5, `10 va 100: ${kam} va ${kop}`);
  assert.ok(L.olcha("print(1)").qadam <= 2);
});

test("juft savollari: javob har doim tejamli yechimni ko'rsatadi", () => {
  for (const task of each(L.juftTask, 20)) {
    assert.equal(task.tur, "juft");
    const tanlangan = task.javob === "b" ? task.olchov.b : task.olchov.a;
    const boshqa = task.javob === "b" ? task.olchov.a : task.olchov.b;
    assert.ok(tanlangan < boshqa, task.id);
    assert.ok(task.natija, task.id + ": natija yo'q");
  }
});

test("kodda buzilgan xossa: kod haqiqatan buzuq, yechimi ishlaydi", () => {
  for (const k of L.KODLAR) {
    assert.ok(L.XOSSALAR.some((x) => x.id === k.xossa), k.id);
    const task = { type: "kod-yoz", solution: k.yechim, tests: k.tests };
    assert.deepEqual(K.validate(task), [], k.id + ": yechim testdan o'tmadi");
    assert.equal(K.check(task, k.yechim).ok, true, k.id);
    assert.equal(K.check(task, k.kod).ok, false, k.id + ": buzuq kod o'tib ketdi");
    assert.ok(k.what.length > 25, k.id + ": shart qisqa");
  }
});

test("cheksiz sikl qadam chegarasi bilan tutiladi (sahifa qotmaydi)", () => {
  const cheksiz = L.KODLAR.find((k) => k.id === "cheksiz");
  const r = py.run(cheksiz.kod, { maxSteps: 5000 });
  assert.equal(r.error.type, "Limit");
});

test("savollar ketma-ket takrorlanmaydi", () => {
  for (const make of [L.xossaTask, L.juftTask, L.kodTask]) {
    const tasks = each(make, 30, 20261001);
    for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
  }
});

test("3-bosqich: ikki xil savol navbat bilan", () => {
  const turlar = each(L.stage3Task, 12).map((t) => t.tur);
  assert.ok(turlar.includes("kod") && turlar.includes("tuzat"));
  for (let k = 1; k < turlar.length; k++) assert.notEqual(turlar[k], turlar[k - 1]);
});

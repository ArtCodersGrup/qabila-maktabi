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

test("hamma xossa uchun kamida ikkita misol bor, jami 14 ta", () => {
  assert.equal(L.BUZUQ.length, 14);
  assert.equal(new Set(L.BUZUQ.map((b) => b.id)).size, 14, "id lar takrorlanmasin");
  for (const x of L.XOSSALAR) {
    assert.ok(L.BUZUQ.filter((b) => b.xossa === x.id).length >= 2, x.id + " uchun misol kam");
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  const matnlar = [];
  for (const b of L.BUZUQ) matnlar.push(b.nom, b.nega, b.tuzatilgan, ...b.qadamlar);
  for (const j of L.JUFTLAR) matnlar.push(j.savol, j.a.nom, j.b.nom);
  for (const k of L.KODLAR) matnlar.push(k.nega, k.what);
  for (const x of L.XOSSALAR) matnlar.push(x.nom, x.izoh);
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "notoʻgʻri belgi: " + m);
});

test("ikki yechim: javob bir xil; qadamlar soni boshqa (yoki 'teng' juftlikda aynan teng)", () => {
  assert.ok(L.JUFTLAR.length >= 9, "juftliklar: " + L.JUFTLAR.length);
  for (const j of L.JUFTLAR) {
    const a = L.olcha(j.a.kod);
    const b = L.olcha(j.b.kod);
    assert.equal(a.xato, null, j.id + " (a)");
    assert.equal(b.xato, null, j.id + " (b)");
    assert.deepEqual(a.chiqish, b.chiqish, j.id + ": javoblar bir xil bo'lishi kerak");
    if (j.teng) {
      assert.equal(a.qadam, b.qadam, j.id + ": 'teng' juftlikda qadamlar teng bo'lishi kerak");
      assert.equal(L.aylanish(j.a.kod), L.aylanish(j.b.kod), j.id);
    } else {
      assert.ok(b.qadam < a.qadam, j.id + ": bankda ikkinchi yechim tejamli bo'lishi kerak");
    }
  }
  assert.ok(L.JUFTLAR.filter((j) => j.teng).length >= 2, "teng juftliklar kamida ikkita");
});

test("aylanish(): sikl tanasi necha marta bajarilganini kuzatuvdan sanaydi", () => {
  assert.equal(L.aylanish("s = 0\nfor i in range(1, 101):\n    s += i\nprint(s)"), 100);
  assert.equal(L.aylanish("n = 100\nprint(n * (n + 1) // 2)"), 0, "formulada sikl yo'q");
  assert.equal(L.aylanish("s = 0\nfor i in range(2, 41, 2):\n    s += i\nprint(s)"), 20);
  const top = (id) => L.JUFTLAR.find((j) => j.id === id);
  // break: 7 uchinchi o'rinda — sikl 3 marta aylanadi; break siz — 12 marta
  assert.equal(L.aylanish(top("izlash-break").b.kod), 3);
  assert.equal(L.aylanish(top("izlash-break").a.kod), 12);
  // 97: hamma sonni sinash — 95 marta, ildizgacha — 8 marta (2 … 9)
  assert.equal(L.aylanish(top("tub").a.kod), 95);
  assert.equal(L.aylanish(top("tub").b.kod), 8);
});

test("qadam o'lchovi haqiqiy: sikl uzunligi bilan o'sadi", () => {
  const kam = L.olcha("s = 0\nfor i in range(10):\n    s += i\nprint(s)").qadam;
  const kop = L.olcha("s = 0\nfor i in range(100):\n    s += i\nprint(s)").qadam;
  assert.ok(kop > kam * 5, `10 va 100: ${kam} va ${kop}`);
  assert.ok(L.olcha("print(1)").qadam <= 2);
});

// 2026-10-02: tejamli yechim endi doim ikkinchi tugmada emas; uchinchi javob — "teng"; juft savol — son
test("juft savollari: javob o'lchovdan chiqadi, uch xil javob ham uchraydi", () => {
  const javoblar = new Set();
  for (const task of each(L.juftTask, 80)) {
    assert.equal(task.tur, "juft");
    javoblar.add(task.javob);
    if (task.javob === "teng") {
      assert.equal(task.olchov.a, task.olchov.b, task.id);
    } else {
      const tanlangan = task.olchov[task.javob];
      const boshqa = task.olchov[task.javob === "a" ? "b" : "a"];
      assert.ok(tanlangan < boshqa, task.id);
    }
    // Juft savol: ko'proq aylanadigan sikl — ekrandagi ikki koddan sanab topiladi
    assert.equal(task.sekin, Math.max(L.aylanish(task.a.kod), L.aylanish(task.b.kod)), task.id);
    assert.ok(task.sekin >= 5, task.id + ": sikl juda qisqa");
    assert.ok(task.natija, task.id + ": natija yo'q");
  }
  assert.deepEqual([...javoblar].sort(), ["a", "b", "teng"], "a, b va teng — uchalasi ham uchrasin");
});

test("juft savollari: birinchi zinada faqat 'sikl va formula', keyin ikkalasi ham sikl", () => {
  const idlar = (tier) => {
    const r = rngFrom(17);
    let prev = null;
    const out = new Set();
    for (let k = 0; k < 60; k++) { prev = L.juftTask(r, prev, tier); out.add(prev.id); }
    return out;
  };
  assert.deepEqual([...idlar(0)].sort(), ["juftlar", "kopaytma", "kvadratlar", "yigindi"]);
  for (const id of ["tub", "teng-qadam", "izlash-break"]) assert.ok(idlar(2).has(id), id);
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

test("yangi kodlar: xato turi aytilganidek", () => {
  const top = (id) => L.KODLAR.find((k) => k.id === id);
  assert.ok(L.KODLAR.length >= 6);
  // matn + son — TypeError (natija chiqmaydi)
  assert.equal(py.run(top("matn-son").kod, { stdin: ["5"] }).error.type, "TypeError");
  // toq son — sikl to'xtamaydi; juft son — to'xtaydi
  assert.equal(py.run(top("toq-cheksiz").kod, { stdin: ["7"], maxSteps: 5000 }).error.type, "Limit");
  assert.deepEqual(py.run(top("toq-cheksiz").kod, { stdin: ["6"] }).output, ["tamom"]);
  // o'rtacha: // bilan 3 va 4 uchun 3 chiqadi (3.5 emas)
  assert.deepEqual(py.run(top("ortacha").kod, { stdin: ["3", "4"] }).output, ["3"]);
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

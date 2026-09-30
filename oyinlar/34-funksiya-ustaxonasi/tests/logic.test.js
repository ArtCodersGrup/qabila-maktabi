// 34-o'yin mantiqi: funksiya chaqirish, return va funksiya yozish masalalari.
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
  const r = rngFrom(seed || 23);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("1- va 2-bosqich savollari xatosiz ishlaydi", () => {
  for (const make of [L.callTask, L.returnTask]) {
    for (const task of each(make, 30)) {
      const r = py.run(task.code, { maxSteps: 100000 });
      assert.equal(r.error, null, task.code);
      assert.ok(r.output.length >= 1 && r.output.length <= L.MAX_LINES, task.code);
      assert.equal(K.check(task, r.output.join("\n")).ok, true);
    }
  }
});

test("2-bosqichda print qiladigan funksiya None qaytarishi ko'rinadi", () => {
  const task = each(L.returnTask, 50).find((t) => t.code.includes("def kvadrat(n):\n    print"));
  assert.ok(task, "print li funksiya savoli chiqmadi");
  const out = py.run(task.code).output;
  assert.equal(out[out.length - 1], "None", task.code);
});

test("2-bosqichda return'dan keyingi satr bajarilmasligi ko'rinadi", () => {
  const task = each(L.returnTask, 50).find((t) => t.code.includes("bajarilmaydi"));
  assert.ok(task, "return'dan keyingi satr savoli chiqmadi");
  const out = py.run(task.code).output;
  assert.ok(!out.some((line) => line.includes("bajarilmaydi")), task.code);
  assert.equal(out.length, 1);
});

test("2-bosqichda parametr tashqaridagi qutini o'zgartirmasligi ko'rinadi", () => {
  const task = each(L.returnTask, 60).find((t) => t.code.includes("def oshir(x):"));
  assert.ok(task, "lokal o'zgaruvchi savoli chiqmadi");
  const out = py.run(task.code).output[0].split(" ");
  assert.equal(Number(out[0]), Number(out[1]) + 1, task.code + " → " + out.join(" "));
});

test("funksiya yozish masalalari sinov satri bilan tekshiriladi", () => {
  for (const kind of L.WRITE_KINDS) {
    const task = {
      type: "kod-yoz", solution: kind.solution, tail: kind.tail,
      tests: kind.tests.map((stdin) => ({ stdin })),
    };
    assert.deepEqual(K.validate(task), [], kind.id);
    assert.equal(K.check(task, kind.solution).ok, true, kind.id);
    assert.ok(kind.tests.length >= 4, kind.id);
    assert.ok(kind.tail.includes("("), kind.id + ": sinov satri funksiyani chaqirishi kerak");
  }
});

test("return o'rniga print yozilgan yechim o'tmaydi", () => {
  const juft = L.WRITE_KINDS.find((k) => k.id === "juftmi");
  const task = { type: "kod-yoz", solution: juft.solution, tail: juft.tail, tests: juft.tests.map((stdin) => ({ stdin })) };
  assert.equal(K.check(task, "def juftmi(n):\n    print(n % 2 == 0)").ok, false);
});

test("funksiya nomi noto'g'ri bo'lsa, tushunarli xato chiqadi", () => {
  const juft = L.WRITE_KINDS.find((k) => k.id === "juftmi");
  const task = { type: "kod-yoz", solution: juft.solution, tail: juft.tail, tests: juft.tests.map((stdin) => ({ stdin })) };
  const bad = K.check(task, "def juft(n):\n    return n % 2 == 0");
  assert.equal(bad.kind, "xato");
  assert.equal(bad.error.type, "NameError");
});

test("chegaradagi holatlar test qilinadi (teng sonlar, manfiy, bir xonali)", () => {
  const eng = L.WRITE_KINDS.find((k) => k.id === "eng-katta");
  assert.ok(eng.tests.some((t) => t[0] === t[1]), "teng sonlar holati yo'q");
  assert.ok(eng.tests.some((t) => t[0].startsWith("-")), "manfiy son holati yo'q");
  const raqam = L.WRITE_KINDS.find((k) => k.id === "raqamlar-yigindisi");
  assert.ok(raqam.tests.some((t) => t[0].length === 1), "bir xonali son holati yo'q");
});

test("savollar ketma-ket takrorlanmaydi", () => {
  for (const make of [L.callTask, L.returnTask]) {
    const tasks = each(make, 30, 20260930);
    for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
  }
});

// 30-o'yin mantiqi: shart, elif zanjiri, mantiqiy ifoda, xato ovi va kod yozish.
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
  const r = rngFrom(seed || 3);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("1-bosqich: har kod xatosiz ishlaydi va javobi to'g'ri tekshiriladi", () => {
  for (const task of each(L.ifTask, 40)) {
    const r = py.run(task.code);
    assert.equal(r.error, null, task.code);
    assert.ok(r.output.length >= 1 && r.output.length <= 2, task.code);
    assert.equal(K.check(task, r.output.join("\n")).ok, true);
  }
});

test("1-bosqich: ikkala yo'l ham chiqadi (hamma savol bir xil javobli emas)", () => {
  const outs = each(L.ifTask, 40).map((t) => py.run(t.code).output[0]);
  assert.ok(new Set(outs).size >= 4, "javoblar xilma-xil: " + [...new Set(outs)].join(", "));
});

test("1-bosqich: blokdan keyingi satr doim bajariladi", () => {
  const withTail = each(L.ifTask, 40).filter((t) => t.code.includes('print("tamom")'));
  assert.ok(withTail.length > 0, "otstup darsi uchun savol chiqmadi");
  for (const task of withTail) {
    const out = py.run(task.code).output;
    assert.equal(out[out.length - 1], "tamom", task.code);
  }
});

// 2026-10-02: ichma-ich if va "and" li shart, chegaradagi qiymatlar
test("1-bosqich: uch shakl — oddiy, and, ichma-ich; zina bilan ochiladi", () => {
  const shakllar = (tier) => {
    const r = rngFrom(9);
    let prev = null;
    const out = new Set();
    for (let k = 0; k < 60; k++) { prev = L.ifTask(r, prev, tier); out.add(prev.shakl); }
    return out;
  };
  assert.deepEqual([...shakllar(0)], ["oddiy"]);
  assert.deepEqual([...shakllar(1)].sort(), ["and", "oddiy"]);
  assert.deepEqual([...shakllar(2)].sort(), ["and", "ichma-ich", "oddiy"]);
  // Ichma-ich shakl uch xil javob beradi (uchala tarmoq ham uchraydi)
  const r = rngFrom(2);
  let prev = null;
  const javoblar = { "ichma-ich": new Set(), and: new Set() };
  for (let k = 0; k < 200; k++) {
    prev = L.ifTask(r, prev, 2);
    if (javoblar[prev.shakl]) {
      const out = py.run(prev.code).output[0];
      javoblar[prev.shakl].add(out === "oʻrtacha" || out === "oʻrtada" || out === "chetda" ? out : (CASE_HIGH.has(out) ? "yuqori" : "past"));
    }
    if (prev.shakl === "ichma-ich") assert.equal((prev.code.match(/\bif /g) || []).length, 2, prev.code);
    if (prev.shakl === "and") assert.match(prev.code, / and /);
  }
  assert.deepEqual([...javoblar["ichma-ich"]].sort(), ["oʻrtacha", "past", "yuqori"]);
  assert.deepEqual([...javoblar.and].sort(), ["chetda", "oʻrtada"]);
});
const CASE_HIGH = new Set(L.CASES.map((c) => c.high));

test("2-bosqich: yuqori zinada ball ko'pincha chegaraning o'zida", () => {
  const r = rngFrom(6);
  let prev = null;
  let chegarada = 0;
  for (let k = 0; k < 60; k++) {
    prev = L.elifTask(r, prev, 2);
    const ball = Number(/ball = (\d+)/.exec(prev.code)[1]);
    const chegaralar = [...prev.code.matchAll(/ball >= (\d+)/g)].map((m) => Number(m[1]));
    if (chegaralar.some((c) => ball === c || ball === c - 1)) chegarada++;
  }
  assert.ok(chegarada >= 25, "chegaradagi holatlar kam: " + chegarada);
});

test("2-bosqich: murakkab mantiqiy ifodalar faqat yuqori zinalarda", () => {
  const r = rngFrom(8);
  let prev = null;
  for (let k = 0; k < 40; k++) {
    prev = L.boolTask(r, prev, 0);
    assert.ok(!prev.code.includes("not (") && !/ or .* and /.test(prev.code), prev.code);
  }
  const kodlar = [];
  for (let k = 0; k < 80; k++) { prev = L.boolTask(r, prev, 2); kodlar.push(prev.code); }
  assert.ok(kodlar.some((c) => / or .* and /.test(c)), "or ichida and chiqmadi");
  assert.ok(kodlar.some((c) => c.includes("not x % 2")), "not + qoldiq chiqmadi");
});

test("2-bosqich: elif zanjiri to'rt javobning birini beradi", () => {
  const seen = new Set();
  for (const task of each(L.elifTask, 60)) {
    const out = py.run(task.code).output;
    assert.equal(out.length, 1);
    assert.match(out[0], /^[2345]$/, task.code);
    seen.add(out[0]);
  }
  assert.ok(seen.size >= 3, "bahoning bir nechta xili chiqadi: " + [...seen].join(","));
});

test("2-bosqich: mantiqiy ifoda True yoki False beradi, ikkalasi ham uchraydi", () => {
  const outs = [];
  for (const task of each(L.boolTask, 50)) {
    const out = py.run(task.code).output;
    assert.equal(out.length, 1);
    assert.ok(out[0] === "True" || out[0] === "False", task.code + " → " + out[0]);
    outs.push(out[0]);
  }
  assert.ok(outs.includes("True") && outs.includes("False"));
});

test("3-bosqich: har buzilish xato beradi, sababi yozilgan, yechimi ishlaydi", () => {
  const kinds = new Set();
  for (const task of each(L.fixTask, 50)) {
    kinds.add(task.kind);
    const broken = py.run(task.code);
    assert.ok(broken.error, task.code);
    assert.ok(["SyntaxError", "IndentationError"].includes(broken.error.type), task.kind + " → " + broken.error.type);
    assert.ok(task.why && task.why.length > 10);
    assert.equal(py.run(task.solution).error, null);
    assert.equal(K.check(task, task.solution).ok, true);
  }
  assert.equal(kinds.size, L.BROKEN.length, "hamma buzilish turi uchraydi");
  assert.ok(L.BROKEN.length >= 6);
});

// 2026-10-02: bitta shablon o'rniga uchta
test("3-bosqich: xato ovi uch xil dasturda; zina bilan ochiladi", () => {
  const shablonlar = (tier) => {
    const r = rngFrom(14);
    let prev = null;
    const out = new Set();
    for (let k = 0; k < 60; k++) {
      prev = L.fixTask(r, prev, tier);
      out.add(prev.shablon);
      assert.ok(py.run(prev.code).error, prev.code);
      assert.equal(py.run(prev.solution).error, null, prev.solution);
    }
    return out;
  };
  assert.deepEqual([...shablonlar(0)], [0]);
  assert.deepEqual([...shablonlar(2)].sort(), [0, 1, 2]);
});

test("3-bosqich: yangi masalalar — tipik xato yechimlar o'tmaydi", () => {
  assert.ok(L.WRITE_KINDS.length >= 8);
  const vazifa = (id) => {
    const kind = L.WRITE_KINDS.find((k) => k.id === id);
    assert.ok(kind.tests.length >= 6, id + ": kamida 6 ta test");
    return { type: "kod-yoz", solution: kind.solution, tests: kind.tests.map((stdin) => ({ stdin })) };
  };
  // "va" o'rniga "yoki"
  assert.equal(K.check(vazifa("uch-besh"), 'n = int(input())\nif n % 3 == 0 or n % 5 == 0:\n    print("ha")\nelse:\n    print("yoʻq")').ok, false);
  // 15 ga bo'linish bilan yozilgan yechim ham to'g'ri
  assert.equal(K.check(vazifa("uch-besh"), 'n = int(input())\nif n % 15 == 0:\n    print("ha")\nelse:\n    print("yoʻq")').ok, true);
  // Qat'iy emas (<=) solishtirish: teng sonlarda yiqiladi
  assert.equal(K.check(vazifa("osish"), 'a = int(input())\nb = int(input())\nc = int(input())\nif a <= b and b <= c:\n    print("ha")\nelse:\n    print("yoʻq")').ok, false);
  // Zanjirli solishtirish ham to'g'ri yo'l
  assert.equal(K.check(vazifa("osish"), 'a = int(input())\nb = int(input())\nc = int(input())\nif a < b < c:\n    print("ha")\nelse:\n    print("yoʻq")').ok, true);
  // Faqat bitta tengsizlik: uzun kesma boshqa o'rinda bo'lsa yiqiladi
  assert.equal(K.check(vazifa("uchburchak"), 'a = int(input())\nb = int(input())\nc = int(input())\nif a + b > c:\n    print("ha")\nelse:\n    print("yoʻq")').ok, false);
  // Faqat "4 ga bo'linadi": 1900 va 2100 da yiqiladi
  assert.equal(K.check(vazifa("kabisa"), 'y = int(input())\nif y % 4 == 0:\n    print("kabisa")\nelse:\n    print("oddiy")').ok, false);
  // Bitta shart bilan (and/or) yozilgan yechim ham to'g'ri
  assert.equal(K.check(vazifa("kabisa"), 'y = int(input())\nif y % 4 == 0 and y % 100 != 0 or y % 400 == 0:\n    print("kabisa")\nelse:\n    print("oddiy")').ok, true);
});

test("3-bosqich: kod yozish masalalari namunali yechim bilan o'tadi", () => {
  for (const kind of L.WRITE_KINDS) {
    const task = { type: "kod-yoz", solution: kind.solution, tests: kind.tests.map((stdin) => ({ stdin })) };
    assert.deepEqual(K.validate(task), [], kind.id);
    assert.equal(K.check(task, kind.solution).ok, true, kind.id);
    assert.ok(kind.tests.length >= 4, kind.id + ": kamida 4 ta test holati");
  }
});

test("3-bosqich: chegaradagi holatlar tekshiriladi (10 va 20 kiradi)", () => {
  const oraliq = L.WRITE_KINDS.find((k) => k.id === "oraliq");
  const task = { type: "kod-yoz", solution: oraliq.solution, tests: oraliq.tests.map((stdin) => ({ stdin })) };
  // faqat qat'iy kichik/katta yozilgan yechim o'tmasligi kerak
  const wrong = 'n = int(input())\nif 10 < n < 20:\n    print("ha")\nelse:\n    print("yoʻq")';
  assert.equal(K.check(task, wrong).ok, false);
});

test("savollar ketma-ket takrorlanmaydi", () => {
  for (const make of [L.ifTask, L.elifTask, L.boolTask, L.fixTask]) {
    const tasks = each(make, 40, 20260930);
    for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
  }
});

test("2- va 3-bosqichda savol turlari navbat bilan almashadi", () => {
  const kinds = each(L.stage2Task, 12).map((t) => t.kind);
  for (let k = 1; k < kinds.length; k++) assert.notEqual(kinds[k], kinds[k - 1]);
  const types = each(L.stage3Task, 12).map((t) => t.type);
  for (let k = 1; k < types.length; k++) assert.notEqual(types[k], types[k - 1]);
});

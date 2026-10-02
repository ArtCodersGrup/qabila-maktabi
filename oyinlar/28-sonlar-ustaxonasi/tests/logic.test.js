// 28-o'yin mantiqi: bo'lish, amallar tartibi va kod yozish masalalari.
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
  const r = rngFrom(seed || 5);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("1-bosqich: uchala amal ham uchraydi, javob bitta satr", () => {
  const ops = new Set();
  for (const task of each(L.divisionTask, 60)) {
    ops.add(task.op);
    const r = py.run(task.code);
    assert.equal(r.error, null, task.code);
    assert.equal(r.output.length, 1);
    assert.equal(K.check(task, r.output[0]).ok, true);
  }
  assert.deepEqual([...ops].sort(), ["%", "/", "//"]);
});

test("1-bosqich: / javobi uzun kasr bo'lmaydi", () => {
  for (const task of each(L.divisionTask, 60)) {
    if (task.op !== "/") continue;
    const out = py.run(task.code).output[0];
    assert.match(out, /^\d+\.\d$/, task.code + " → " + out);
  }
});

// 2026-10-02: bo'linuvchi zina bilan o'sadi — 99 → 299 → 999 (uch xonali sonlar)
test("1-bosqich: bo'luvchi 2–9, bo'linuvchi zina chegarasida", () => {
  for (const tier of [0, 1, 2]) {
    const r = rngFrom(5 + tier);
    let prev = null;
    let katta = 0;
    for (let k = 0; k < 60; k++) {
      const task = L.divisionTask(r, prev, tier);
      prev = task;
      assert.ok(task.b >= 2 && task.b <= 9, task.code);
      assert.ok(task.a > task.b && task.a <= L.BOLINUVCHI_ZINA[tier], task.code);
      if (task.a > 99) katta++;
    }
    if (tier === 0) assert.equal(katta, 0, "birinchi zinada faqat ikki xonali sonlar");
    else assert.ok(katta >= 10, "zina " + tier + ": uch xonali sonlar kam (" + katta + ")");
  }
});

test("2-bosqich: javob butun son va zina chegarasida (200 → 350 → 500)", () => {
  assert.deepEqual(L.MAX_ZINA, [200, 350, 500]);
  assert.equal(L.MAX, 500);
  for (const tier of [0, 1, 2]) {
    const r = rngFrom(7 + tier);
    let prev = null;
    for (let k = 0; k < 60; k++) {
      const task = L.orderTask(r, prev, tier);
      prev = task;
      const out = py.run(task.code).output;
      assert.equal(out.length, 1);
      const value = Number(out[0]);
      assert.ok(Number.isInteger(value), task.code + " → " + out[0]);
      assert.ok(Math.abs(value) <= L.MAX_ZINA[tier], task.code + " → " + out[0]);
      // Manfiy javob faqat manfiy sonli shakllarda (oxirgi zina)
      if (value < 0) assert.ok(task.manfiy && tier === 2, task.code + " → " + out[0]);
      if (tier === 0) assert.ok(!task.code.includes("-") || / - /.test(task.code), "birinchi zinada manfiy son yo'q: " + task.code);
      assert.equal(K.check(task, out[0]).ok, true);
    }
  }
});

test("2-bosqich: oxirgi zinada to'rt amalli va manfiy sonli ifodalar chiqadi", () => {
  const r = rngFrom(31);
  let prev = null;
  const kodlar = [];
  for (let k = 0; k < 120; k++) { prev = L.orderTask(r, prev, 2); kodlar.push(prev.code); }
  assert.ok(kodlar.some((c) => /^print\(-\d+ \/\/ \d+\)$/.test(c)), "manfiy // chiqmadi");
  assert.ok(kodlar.some((c) => /^print\(-\d+ % \d+\)$/.test(c)), "manfiy % chiqmadi");
  assert.ok(kodlar.some((c) => (c.match(/ (\+|-|\*\*?|\/\/|%) /g) || []).length >= 3), "to'rt amalli ifoda chiqmadi");
  // Python qoidasi: // pastga yumalaydi, % manfiy bo'lmaydi
  assert.deepEqual(py.run("print(-7 // 2)\nprint(-7 % 3)").output, ["-4", "2"]);
  for (const c of kodlar.filter((x) => /^print\(-\d+ % \d+\)$/.test(x))) assert.ok(Number(py.run(c).output[0]) > 0, c);
});

test("2-bosqich: tartib muhim bo'lgan ifodalar chiqadi", () => {
  const tasks = each(L.orderTask, 80);
  assert.ok(tasks.some((t) => t.code.includes("(")), "qavsli ifoda");
  assert.ok(tasks.some((t) => t.code.includes("**")), "darajali ifoda");
  assert.ok(tasks.some((t) => t.code.includes("//") || t.code.includes("%")), "butun bo'linma yoki qoldiq");
});

test("3-bosqich: buzuq kod TypeError beradi, yechimi ishlaydi", () => {
  for (const task of each(L.fixTask, 30)) {
    const broken = py.run(task.code);
    assert.equal(broken.error.type, "TypeError", task.code);
    assert.equal(py.run(task.solution).error, null, task.solution);
    assert.equal(K.check(task, task.solution).ok, true);
    // Ikkala to'g'ri yo'l ham qabul qilinadi: vergul bilan ham, str() bilan ham
    const other = task.solution.replace(/print\("([^"]*):", x\)/, 'print("$1: " + str(x))');
    assert.notEqual(other, task.solution);
    assert.equal(K.check(task, other).ok, true, "str() bilan yozilgani ham to'g'ri");
  }
});

test("3-bosqich: kod yozish masalalari kamida uch test holatidan o'tadi", () => {
  assert.ok(L.WRITE_KINDS.length >= 8, "masalalar: " + L.WRITE_KINDS.length);
  for (const kind of L.WRITE_KINDS) {
    const task = { type: "kod-yoz", solution: kind.solution, tests: kind.tests.map((stdin) => ({ stdin })) };
    assert.ok(kind.tests.length >= 3, kind.id);
    assert.deepEqual(K.validate(task), [], kind.id);
    assert.equal(K.check(task, kind.solution).ok, true, kind.id);
  }
});

// 2026-10-02: yangi masalalar — tipik xato yechimlar o'tmasligi kerak
test("3-bosqich: yangi masalalar chekka holatlar bilan tekshiriladi", () => {
  const vazifa = (id) => {
    const kind = L.WRITE_KINDS.find((k) => k.id === id);
    return { type: "kod-yoz", solution: kind.solution, tests: kind.tests.map((stdin) => ({ stdin })) };
  };
  // O'rta raqam: "n % 100 // 10" ham to'g'ri yo'l; "n // 10" esa noto'g'ri
  assert.equal(K.check(vazifa("orta-raqam"), "n = int(input())\nprint(n % 100 // 10)").ok, true);
  assert.equal(K.check(vazifa("orta-raqam"), "n = int(input())\nprint(n // 10)").ok, false);
  // Sekund: daqiqani "n // 60" deb olgan yechim (soatni ayirmagan) o'tmaydi
  assert.equal(K.check(vazifa("sekund"), "n = int(input())\nprint(n // 3600)\nprint(n // 60)\nprint(n % 60)").ok, false);
  assert.deepEqual(K.expectedFor(vazifa("sekund"), { stdin: ["3725"] }), ["1", "2", "5"]);
  // Tosh bo'lish: toshdan bola ko'p bo'lgan holat ham bor (3 tosh, 7 bola → 0 va 3)
  assert.deepEqual(K.expectedFor(vazifa("tosh-bolish"), { stdin: ["3", "7"] }), ["0", "3"]);
  // Zina: birinchi javoblarda faqat eski to'rt masala
  const r = rngFrom(4);
  let prev = null;
  for (let k = 0; k < 30; k++) {
    prev = L.writeTask(r, prev, 0);
    assert.ok(["yoz:oxirgi-raqam", "yoz:soat-daqiqa", "yoz:bolinma-qoldiq", "yoz:kvadrat"].includes(prev.id), prev.id);
  }
});

test("3-bosqich: bitta holatga moslangan yechim o'tmaydi", () => {
  const task = each(L.writeTask, 1)[0];
  const firstOut = py.run(task.solution, { stdin: task.tests[0].stdin }).output;
  const cheat = firstOut.map((line) => "print(" + line + ")").join("\n");
  assert.equal(K.check(task, cheat).ok, false);
});

test("savollar ketma-ket takrorlanmaydi", () => {
  for (const make of [L.divisionTask, L.orderTask, L.fixTask]) {
    const tasks = each(make, 40, 20260930);
    for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
  }
});

test("3-bosqich: ikki xil savol navbat bilan", () => {
  const types = each(L.stage3Task, 12).map((t) => t.type);
  assert.ok(types.includes("xato-top") && types.includes("kod-yoz"));
  for (let k = 1; k < types.length; k++) assert.notEqual(types[k], types[k - 1]);
});

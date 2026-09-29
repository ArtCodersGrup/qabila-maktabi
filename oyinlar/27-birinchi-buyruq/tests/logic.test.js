// 27-o'yin mantiqi: mashq savollari to'g'ri yasaladimi.
// Ishga tushirish (o'yin papkasida): node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const K = require("../../umumiy/js/kod.js");

// Takrorlanadigan tasodif
function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const each = (make, n, seed) => {
  const r = rngFrom(seed || 7);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("ter: kod aynan print(\"matn\") ko'rinishida", () => {
  for (const task of each(L.typeTask, 30)) {
    assert.equal(task.type, "ter");
    assert.match(task.code, /^print\("[^"]+"\)$/);
    assert.equal(K.check(task, task.code).ok, true);
    assert.equal(K.check(task, task.code.replace("print", "Print")).ok, false);
  }
});

test("natija: har bir kod xatosiz ishlaydi va chiqishi bor", () => {
  for (const task of each(L.resultTask, 40)) {
    const r = K.run(task.code);
    assert.equal(r.error, null, task.code + " → " + (r.error && r.error.text));
    assert.ok(r.output.length >= 1, task.code);
    assert.equal(K.check(task, r.output.join("\n")).ok, true);
  }
});

test("natija: qo'shtirnoq ichidagi amal hisoblanmasligi ham chiqadi", () => {
  const task = each(L.resultTask, 60).find((t) => t.kind === "son");
  assert.ok(task, "son turidagi savol chiqmadi");
  const out = K.run(task.code).output;
  assert.match(out[0], /^\d+$/, "birinchi satr — hisoblangan son");
  assert.match(out[1], /\+/, "ikkinchi satr — matnning o'zi");
});

test("xato-top: buzuq kod haqiqatan xato beradi, yechimi ishlaydi", () => {
  const kinds = new Set();
  for (const task of each(L.fixTask, 40)) {
    kinds.add(task.kind);
    const broken = K.run(task.code);
    assert.ok(broken.error, task.code + " — xato kutilgan edi");
    const fixed = K.run(task.solution);
    assert.equal(fixed.error, null, task.solution);
    assert.equal(K.check(task, task.solution).ok, true);
    assert.equal(K.check(task, task.code).ok, false);
  }
  assert.equal(kinds.size, L.BROKEN.length, "hamma xato turi uchraydi");
});

test("kod-yoz: kutilgan chiqish 1–2 satr, boshqacha yozilgan yechim ham o'tadi", () => {
  for (const task of each(L.writeTask, 30)) {
    assert.ok(task.lines.length >= 1 && task.lines.length <= 2);
    assert.equal(K.check(task, task.solution).ok, true);
    const other = task.lines.map((line) => "s = \"" + line + "\"\nprint(s)").join("\n");
    assert.equal(K.check(task, other).ok, true, "boshqa yo'l bilan yozilgani ham to'g'ri");
    assert.equal(K.check(task, 'print("boshqa")').ok, false);
  }
});

test("bir xil savol ketma-ket ikki marta chiqmaydi", () => {
  for (const make of [L.typeTask, L.resultTask, L.fixTask, L.writeTask]) {
    const tasks = each(make, 50, 20260929);
    for (let k = 1; k < tasks.length; k++) {
      assert.notEqual(tasks[k].id, tasks[k - 1].id, make.name);
    }
  }
});

test("3-bosqich: ikki xil savol navbat bilan keladi", () => {
  const tasks = each(L.stage3Task, 20);
  const types = tasks.map((t) => t.type);
  assert.ok(types.includes("xato-top") && types.includes("kod-yoz"));
  for (let k = 1; k < types.length; k++) assert.notEqual(types[k], types[k - 1], "navbat almashadi");
});

test("barcha savollar masala qoidasiga mos (validate)", () => {
  for (const make of [L.typeTask, L.resultTask, L.fixTask, L.writeTask]) {
    for (const task of each(make, 12)) assert.deepEqual(K.validate(task), [], make.name + ": " + task.id);
  }
});

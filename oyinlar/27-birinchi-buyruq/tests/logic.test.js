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

// 2026-10-02: yangi turlar va qiyinlik zinasi
test("natija: yetti tur ham uchraydi; zina bilan qiyinlashadi", () => {
  const turlar = new Set(each(L.resultTask, 120).map((t) => t.kind));
  assert.deepEqual([...turlar].sort(), [...L.RESULT_KINDS].sort());
  const zinada = (tier) => {
    const r = rngFrom(3);
    let prev = null;
    const out = new Set();
    for (let k = 0; k < 60; k++) { prev = L.resultTask(r, prev, tier); out.add(prev.kind); }
    return out;
  };
  assert.ok(!zinada(0).has("uch") && !zinada(0).has("qoshish") && !zinada(0).has("son"));
  assert.ok(zinada(2).has("uch") && zinada(2).has("qoshish"));
});

test("natija: vergul bo'shliq qo'yadi, + yopishtiradi", () => {
  const q = each(L.resultTask, 120).find((t) => t.kind === "qoshish");
  const out = K.run(q.code).output;
  assert.equal(out.length, 2);
  assert.ok(!out[0].includes(" ") && out[1].includes(" "), out.join(" / "));
  assert.equal(out[0], out[1].replace(" ", ""));
  const u = each(L.resultTask, 120).find((t) => t.kind === "uch");
  const uo = K.run(u.code).output;
  assert.equal(uo.length, 3);
  assert.match(uo[1], /^\d+ \d+$/, "print(a, b) — ikki son bo'shliq bilan");
  assert.match(uo[2], /^\d+ \S+$/, "print(a * b, \"so'z\") — hisoblangan son va matn");
});

test("xato-top: zina bilan dastur uzayadi, xato faqat bitta satrda", () => {
  for (const [tier, satrlar] of [[0, 1], [1, 2], [2, 3]]) {
    const r = rngFrom(11 + tier);
    let prev = null;
    for (let k = 0; k < 30; k++) {
      const task = L.fixTask(r, prev, tier);
      prev = task;
      const bad = task.code.split("\n");
      const good = task.solution.split("\n");
      assert.equal(good.length, satrlar, task.id);
      assert.equal(bad.length, satrlar, task.id);
      assert.equal(bad.filter((s, i) => s !== good[i]).length, 1, "aynan bitta satr buzilgan: " + task.code);
      assert.notEqual(bad[task.line - 1], good[task.line - 1], task.id);
      assert.ok(K.run(task.code).error, task.code);
      assert.equal(K.check(task, task.solution).ok, true);
    }
  }
});

test("kod-yoz: satrlar soni zina bilan o'sadi (1–2 → 2–3 → 3–4)", () => {
  for (const [tier, kam, kop] of [[0, 1, 2], [1, 2, 3], [2, 3, 4]]) {
    const r = rngFrom(5 + tier);
    let prev = null;
    const uzunliklar = new Set();
    for (let k = 0; k < 40; k++) {
      prev = L.writeTask(r, prev, tier);
      uzunliklar.add(prev.lines.length);
      assert.equal(new Set(prev.lines).size, prev.lines.length, "satrlar takrorlanmaydi");
    }
    assert.deepEqual([...uzunliklar].sort(), [kam, kop], "zina " + tier);
  }
});

test("ter: oddiy rejimda bitta satr, qiyin rejimda ikki satr", () => {
  for (const task of each(L.typeTask, 20)) assert.equal(task.code.split("\n").length, 1);
  const r = rngFrom(2);
  let prev = null;
  for (let k = 0; k < 20; k++) {
    prev = L.typeTask(r, prev, 2);
    assert.equal(prev.code.split("\n").length, 2, prev.code);
    assert.equal(K.run(prev.code).error, null, prev.code);
    assert.equal(K.check(prev, prev.code).ok, true);
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

test("kod-yoz: kutilgan chiqish 1–4 satr, boshqacha yozilgan yechim ham o'tadi", () => {
  for (const task of each(L.writeTask, 30)) {
    assert.ok(task.lines.length >= 1 && task.lines.length <= 4);
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

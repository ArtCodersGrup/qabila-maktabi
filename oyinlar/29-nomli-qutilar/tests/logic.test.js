// 29-o'yin mantiqi: dasturlar, kuzatuv jadvali va kirishli masalalar.
// Ishga tushirish (o'yin papkasida): node --test tests/*.test.js
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
  const r = rngFrom(seed || 11);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("dasturlar xatosiz ishlaydi va qiymatlar chegarada qoladi", () => {
  for (const task of each(L.resultTask, 40)) {
    const r = py.run(task.code);
    assert.equal(r.error, null, task.code);
    for (const value of Object.values(r.vars)) {
      const n = Number(value);
      assert.ok(Number.isInteger(n), task.code + " → " + value);
      assert.ok(n >= L.LOW && n <= L.HIGH, task.code + " → " + value);
    }
  }
});

test("1-bosqich: har dastur print bilan tugaydi va javobi bitta satr", () => {
  for (const task of each(L.resultTask, 30)) {
    assert.match(task.code, /\nprint\(a(, b)?\)$/);
    const out = py.run(task.code).output;
    assert.equal(out.length, 1);
    assert.equal(K.check(task, out[0]).ok, true);
    // Qiymatlar 0–200 oralig'ida (ayirish qo'shilgach 0 ham chiqishi mumkin) — manfiy javob doim noto'g'ri
    assert.equal(K.check(task, "-1").ok, false);
  }
});

test("kuzatuv jadvali: har bajarilgan satr uchun bitta qator", () => {
  for (const task of each(L.traceTask, 30)) {
    const lines = task.code.split("\n");
    assert.equal(task.rows.length, lines.length, task.code);
    task.rows.forEach((row, k) => {
      assert.equal(row.text, lines[k]);
      assert.equal(row.line, k + 1);
    });
  }
});

test("kuzatuv jadvali: birinchi qatorda b hali yo'q, qiymatlar butun son", () => {
  for (const task of each(L.traceTask, 30)) {
    assert.equal(task.rows[0].values.b, null, "b hali yaratilmagan");
    assert.match(task.rows[0].values.a, /^\d+$/);
    for (const row of task.rows.slice(1)) {
      for (const name of task.vars) {
        if (row.values[name] !== null) assert.match(row.values[name], /^-?\d+$/, task.code);
      }
    }
  }
});

test("kuzatuv jadvali: oxirgi qatorda qiymat haqiqatan o'zgargan", () => {
  for (const task of each(L.traceTask, 30)) {
    const last = task.rows[task.rows.length - 1].values;
    const before = task.rows[task.rows.length - 2].values;
    assert.notDeepEqual(last, before, task.code);
  }
});

test("almashtirish: ikki yo'l ham bir xil natija beradi", () => {
  const long = py.run(L.SWAP_LONG + "\nprint(a, b)").output;
  const short = py.run(L.SWAP_SHORT + "\nprint(a, b)").output;
  assert.deepEqual(long, ["8 3"]);
  assert.deepEqual(short, ["8 3"]);
});

test("3-bosqich: kirishli savollar kirish satrlari bilan ishlaydi", () => {
  for (const task of each(L.inputResultTask, 30)) {
    assert.ok(task.stdin.length >= 1);
    const r = py.run(task.code, { stdin: task.stdin });
    assert.equal(r.error, null, task.code);
    assert.ok(r.output.length >= 1);
    assert.equal(K.check(task, r.output.join("\n")).ok, true);
  }
});

test("3-bosqich: kod yozish masalasi kamida to'rt test holatida tekshiriladi", () => {
  for (const task of each(L.writeTask, 30)) {
    assert.ok(task.tests.length >= 4, task.id);
    assert.equal(K.check(task, task.solution).ok, true);
    // faqat bitta holatga moslangan yechim o'tmaydi
    assert.equal(K.check(task, "print(10)").ok, false);
    assert.deepEqual(K.validate(task), []);
  }
});

// 2026-10-02: nol va manfiy son test holatlarida bor; yangi masalalar
test("3-bosqich: nol va manfiy son bilan ham tekshiriladi, yangi masalalar ishlaydi", () => {
  assert.ok(L.WRITE_KINDS.length >= 7);
  for (const op of ["+", "*", "-"]) {
    const kind = L.WRITE_KINDS.find((k) => k.id === op);
    assert.ok(kind.tests.some((t) => t[0] === "0" && t[1] === "0"), op + ": [0, 0] yo'q");
    assert.ok(kind.tests.some((t) => t[0].startsWith("-")), op + ": manfiy son yo'q");
  }
  const vazifa = (id) => {
    const kind = L.WRITE_KINDS.find((k) => k.id === id);
    return { type: "kod-yoz", solution: kind.solution, tests: kind.tests.map((stdin) => ({ stdin })) };
  };
  // Ayirmani teskari yozgan yechim ([-4, 9] va [7, 3] da yiqiladi)
  assert.equal(K.check(vazifa("-"), "a = int(input())\nb = int(input())\nprint(b - a)").ok, false);
  // Almashtirmasdan chiqargan yechim o'tmaydi; uchinchi quti bilan almashtirgan — o'tadi
  assert.equal(K.check(vazifa("almashtir"), "a = int(input())\nb = int(input())\nprint(a)\nprint(b)").ok, false);
  assert.equal(K.check(vazifa("almashtir"), "a = int(input())\nb = int(input())\nc = a\na = b\nb = c\nprint(a)\nprint(b)").ok, true);
  // Daqiqa: 60 ga ko'paytirishni unutgan yechim
  assert.equal(K.check(vazifa("daqiqa"), "s = int(input())\nd = int(input())\nprint(s + d)").ok, false);
  assert.deepEqual(K.expectedFor(vazifa("yosh"), { stdin: ["Anvar", "2013"] }), ["Anvar 2026-yilda 13 yoshda"]);
});

test("qiyinlik zinasi: qadamlar soni o'sadi, kirishli savollar murakkablashadi", () => {
  for (const tier of [0, 1, 2]) {
    const r = rngFrom(13 + tier);
    let prev = null;
    for (let k = 0; k < 25; k++) {
      prev = L.resultTask(r, prev, tier);
      const qadam = prev.code.split("\n").length - 3; // a = …, b = …, print(…) dan tashqari
      assert.ok(qadam >= L.NATIJA_QADAM[tier][0] && qadam <= L.NATIJA_QADAM[tier][1], "natija, zina " + tier + ": " + qadam);
    }
    prev = null;
    for (let k = 0; k < 25; k++) {
      prev = L.traceTask(r, prev, tier);
      const qadam = prev.code.split("\n").length - 2;
      assert.ok(qadam >= L.KUZATUV_QADAM[tier][0] && qadam <= L.KUZATUV_QADAM[tier][1], "kuzatuv, zina " + tier + ": " + qadam);
      assert.equal(prev.rows.length, prev.code.split("\n").length);
    }
  }
  // Birinchi zinada kirishli savollar — bitta amalli; oxirgisida ikki kirish va tur aralash
  const r = rngFrom(3);
  let prev = null;
  for (let k = 0; k < 30; k++) { prev = L.inputResultTask(r, prev, 0); assert.ok(prev.code.split("\n").length <= 3, prev.code); }
  const kodlar = [];
  for (let k = 0; k < 60; k++) { prev = L.inputResultTask(r, prev, 2); kodlar.push(prev.code); }
  assert.ok(kodlar.some((c) => c.includes("a, b = b, a + b")), "almashtirishli savol chiqmadi");
  assert.ok(kodlar.some((c) => c.includes("x * 2")), "matnni ko'paytirish savoli chiqmadi");
});

test("bir xil savol ketma-ket ikki marta chiqmaydi", () => {
  for (const make of [L.resultTask, L.traceTask, L.inputResultTask]) {
    const tasks = each(make, 40, 20260930);
    for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
  }
});

test("3-bosqich: ikki xil savol navbat bilan keladi", () => {
  const types = each(L.stage3Task, 16).map((t) => t.type);
  assert.ok(types.includes("natija") && types.includes("kod-yoz"));
  for (let k = 1; k < types.length; k++) assert.notEqual(types[k], types[k - 1]);
});

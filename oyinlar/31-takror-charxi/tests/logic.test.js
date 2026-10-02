// 31-o'yin mantiqi: sanoq sikli, yig'indi, raqamlarni ajratish va xato ovi.
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
  const r = rngFrom(seed || 13);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("1-bosqich: sikl tugaydi, chiqish 8 satrdan oshmaydi", () => {
  for (const task of each(L.countTask, 40)) {
    const r = py.run(task.code, { maxSteps: 100000 });
    assert.equal(r.error, null, task.code);
    assert.ok(r.output.length >= 1 && r.output.length <= L.MAX_LINES, task.code + " → " + r.output.length + " satr");
    assert.equal(K.check(task, r.output.join("\n")).ok, true);
  }
});

test("2-bosqich: javob bitta satr va chegarada", () => {
  for (const task of each(L.sumTask, 50)) {
    const r = py.run(task.code, { maxSteps: 100000 });
    assert.equal(r.error, null, task.code);
    assert.equal(r.output.length, 1, task.code);
    // Bir satrda bir nechta son bo'lishi mumkin (print(soni, n)) — har biri chegarada
    for (const soz of r.output[0].split(" ")) {
      assert.match(soz, /^-?\d+$/, task.code + " → " + r.output[0]);
      assert.ok(Math.abs(Number(soz)) <= L.MAX_VALUE, task.code + " → " + r.output[0]);
    }
    assert.equal(K.check(task, r.output[0]).ok, true);
  }
});

// 2026-10-02: qiyinlik zinasi va yangi sikl turlari
test("zina: birinchi javoblarda eski sodda sikllar, oxirgisida yangilari", () => {
  const kodlar = (make, tier) => {
    const r = rngFrom(21);
    let prev = null;
    const out = [];
    for (let k = 0; k < 60; k++) { prev = make(r, prev, tier); out.push(prev.code); }
    return out;
  };
  // Zina 0: hisoblagich faqat +1/−1/+qadam bilan, bitta o'zgaruvchi
  for (const c of kodlar(L.countTask, 0)) assert.ok(!c.includes("i * 2") && !c.includes("// 2") && !c.includes("b -="), c);
  const qiyin = kodlar(L.countTask, 2);
  assert.ok(qiyin.some((c) => c.includes("n = n // 2")), "yarimlash sikli chiqmadi");
  assert.ok(qiyin.some((c) => c.includes("b -= 1")), "ikki o'zgaruvchili sikl chiqmadi");
  assert.ok(qiyin.some((c) => /i \+= 1\n {4}print/.test(c)), "print hisoblagichdan keyin turgan sikl chiqmadi");
  for (const c of kodlar(L.sumTask, 0)) assert.ok(!c.includes("continue") && !c.includes("n % 10"), c);
  const yig = kodlar(L.sumTask, 2);
  assert.ok(yig.some((c) => c.includes("continue")), "continue li savol chiqmadi");
  assert.ok(yig.some((c) => c.includes("3 * n + 1")), "Kollats savoli chiqmadi");
  assert.ok(yig.some((c) => c.includes("while s <")), "yig'indi chegaragacha savoli chiqmadi");
});

test("yangi sikllar aniq tugaydi va kutilgan javobni beradi", () => {
  assert.deepEqual(py.run("i = 1\nwhile i < 20:\n    print(i)\n    i = i * 2").output, ["1", "2", "4", "8", "16"]);
  assert.deepEqual(py.run("n = 40\nsoni = 0\nwhile n % 2 == 0:\n    n = n // 2\n    soni += 1\nprint(soni, n)").output, ["3 5"]);
  assert.deepEqual(py.run("s = 0\ni = 0\nwhile s < 20:\n    i += 1\n    s += i\nprint(i, s)").output, ["6 21"]);
  // continue: hisoblagich continue dan OLDIN oshiriladi — aks holda sikl to'xtamas edi
  for (const f of L.COLLECTORS) {
    const c = f(rngFrom(1));
    if (c.includes("continue")) assert.match(c, /i \+= 1\n {8}continue/, c);
  }
});

test("2-bosqich: break ishlatilgan savol ham chiqadi", () => {
  const tasks = each(L.sumTask, 60);
  assert.ok(tasks.some((t) => t.code.includes("break")), "break li savol chiqmadi");
});

test("raqam ajratish qadamlari to'g'ri hisoblanadi", () => {
  assert.deepEqual(L.digitSteps(472), [
    { son: 472, oxirgi: 2, qolgan: 47 },
    { son: 47, oxirgi: 7, qolgan: 4 },
    { son: 4, oxirgi: 4, qolgan: 0 },
  ]);
  assert.equal(L.digitSteps(5).length, 1);
});

test("3-bosqich: cheksiz sikl xatosi qadam chegarasi bilan tutiladi", () => {
  const task = each(L.fixTask, 40).find((t) => t.kind === "cheksiz");
  assert.ok(task, "cheksiz sikl savoli chiqmadi");
  const broken = py.run(task.code, { maxSteps: 5000 });
  assert.equal(broken.error.type, "Limit", task.code);
  assert.equal(py.run(task.solution).error, null);
  assert.equal(K.check(task, task.solution).ok, true);
});

test("3-bosqich: yangi buzilishlar — ikkitasi cheksiz sikl, ikkitasi noto'g'ri javob", () => {
  assert.ok(L.BROKEN.length >= 7);
  const top = (kind) => L.BROKEN.find((b) => b.kind === kind);
  for (const kind of ["raqam-cheksiz", "otstup"]) {
    const b = top(kind);
    assert.equal(py.run(b.make(b.good), { maxSteps: 20000 }).error.type, "Limit", kind);
  }
  assert.deepEqual(py.run(top("bir-ortiq").make(top("bir-ortiq").good)).output, ["5", "4", "3", "2", "1", "0"]);
  assert.deepEqual(py.run(top("boshlangich").make(top("boshlangich").good)).output, ["22"]);
  assert.deepEqual(py.run(top("boshlangich").good).output, ["21"]);
  // Cheksiz sikllar tez tutiladi (chiqish chegarasi) — sahifa qotmaydi
  const boshi = Date.now();
  for (const b of L.BROKEN) K.check({ type: "xato-top", solution: b.good }, b.make(b.good));
  assert.ok(Date.now() - boshi < 1500, "buzuq kodlarni tekshirish sekin: " + (Date.now() - boshi) + " ms");
  // Zina 0 da faqat eski uch buzilish
  const r = rngFrom(3);
  let prev = null;
  for (let k = 0; k < 30; k++) { prev = L.fixTask(r, prev, 0); assert.ok(["cheksiz", "almashgan", "shart"].includes(prev.kind), prev.kind); }
});

test("3-bosqich: yangi masalalar — tipik xato yechimlar o'tmaydi", () => {
  assert.ok(L.WRITE_KINDS.length >= 10);
  const vazifa = (id) => {
    const kind = L.WRITE_KINDS.find((k) => k.id === id);
    return { type: "kod-yoz", solution: kind.solution, tests: kind.tests.map((stdin) => ({ stdin })) };
  };
  // Ko'paytmani 0 dan boshlagan yechim
  assert.equal(K.check(vazifa("raqamlar-kopaytmasi"), "n = int(input())\nk = 0\nwhile n > 0:\n    k = k * (n % 10)\n    n = n // 10\nprint(k)").ok, false);
  // Eng kichik raqamni 0 dan boshlagan yechim
  assert.equal(K.check(vazifa("eng-kichik-raqam"), "n = int(input())\nbest = 0\nwhile n > 0:\n    r = n % 10\n    if r < best:\n        best = r\n    n = n // 10\nprint(best)").ok, false);
  // Kollats: 1 uchun 0 qadam; 27 uchun 111 qadam (uzun zanjir ham sig'adi)
  assert.deepEqual(K.expectedFor(vazifa("kollats"), { stdin: ["1"] }), ["0"]);
  assert.deepEqual(K.expectedFor(vazifa("kollats"), { stdin: ["27"] }), ["111"]);
  // O'suvchi raqamlar: teng qo'shni raqamlar (1123) — yo'q; "<=" bilan yozilgan yechim yiqiladi
  assert.deepEqual(K.expectedFor(vazifa("osuvchi-raqamlar"), { stdin: ["1123"] }), ["yoʻq"]);
  assert.equal(K.check(vazifa("osuvchi-raqamlar"), 'n = int(input())\njavob = "ha"\nong = n % 10\nn = n // 10\nwhile n > 0:\n    r = n % 10\n    if r > ong:\n        javob = "yoʻq"\n    ong = r\n    n = n // 10\nprint(javob)').ok, false);
});

test("3-bosqich: har buzilish turi noto'g'ri natija beradi", () => {
  const kinds = new Set();
  for (const task of each(L.fixTask, 40)) {
    kinds.add(task.kind);
    assert.equal(K.check(task, task.code).ok, false, task.kind + ": buzuq kod o'tib ketdi");
    assert.equal(K.check(task, task.solution).ok, true, task.kind);
    assert.ok(task.why.length > 10);
  }
  assert.equal(kinds.size, L.BROKEN.length);
});

test("3-bosqich: kod yozish masalalari namunali yechim bilan o'tadi", () => {
  for (const kind of L.WRITE_KINDS) {
    const task = { type: "kod-yoz", solution: kind.solution, tests: kind.tests.map((stdin) => ({ stdin })) };
    assert.deepEqual(K.validate(task), [], kind.id);
    assert.equal(K.check(task, kind.solution).ok, true, kind.id);
    assert.ok(kind.tests.length >= 4, kind.id);
  }
});

test("3-bosqich: bir xonali son va nol bilan tugaydigan son ham tekshiriladi", () => {
  for (const kind of L.WRITE_KINDS) {
    const stdins = kind.tests.map((t) => t[0]);
    assert.ok(stdins.some((s) => s.length === 1), kind.id + ": bir xonali son yo'q");
    assert.ok(stdins.some((s) => s.endsWith("0")), kind.id + ": nol bilan tugaydigan son yo'q");
  }
});

test("savollar ketma-ket takrorlanmaydi", () => {
  for (const make of [L.countTask, L.sumTask]) {
    const tasks = each(make, 30, 20260930);
    for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
  }
});

test("3-bosqich: ikki xil savol navbat bilan", () => {
  const types = each(L.stage3Task, 12).map((t) => t.type);
  assert.ok(types.includes("xato-top") && types.includes("kod-yoz"));
  for (let k = 1; k < types.length; k++) assert.notEqual(types[k], types[k - 1]);
});

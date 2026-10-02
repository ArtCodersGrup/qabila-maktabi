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

// 2026-10-02: rekursiya, ro'yxatni o'zgartirish, erta return
test("2-bosqich: rekursiya va ro'yxatni o'zgartirish savollari — javob Pythonning haqiqiy xulqi", () => {
  const r = rngFrom(31);
  let prev = null;
  const kodlar = [];
  for (let k = 0; k < 100; k++) { prev = L.returnTask(r, prev, 2); kodlar.push(prev.code); }
  const fakt = kodlar.find((c) => c.includes("return n * fakt(n - 1)"));
  assert.ok(fakt, "rekursiv fakt chiqmadi");
  const n = Number(/print\(fakt\((\d)\)\)/.exec(fakt)[1]);
  assert.ok(n >= 3 && n <= 5, "chuqurlik 5 dan oshmasin: " + n);
  assert.deepEqual(py.run(fakt).output, [String([0, 1, 2, 6, 24, 120][n])]);
  const qosh = kodlar.find((c) => c.includes("r.append("));
  assert.ok(qosh, "ro'yxatni o'zgartiradigan funksiya chiqmadi");
  assert.match(py.run(qosh).output[0], /^\[1, 2, \d, \d\] 4$/, "ro'yxat funksiya ichida o'zgaradi");
  const erta = kodlar.find((c) => c.includes("birinchi_juft"));
  assert.ok(erta, "erta return savoli chiqmadi");
  assert.match(py.run(erta).output[0], /^\d+ -1$/);
  assert.equal(Number(py.run(erta).output[0].split(" ")[0]) % 2, 0);
  // Rekursiv sanash: n, n−1, …, 1, keyin "tamom"
  assert.deepEqual(py.run("def sana(n):\n    if n > 0:\n        print(n)\n        sana(n - 1)\n\nsana(3)\nprint(\"tamom\")").output, ["3", "2", "1", "tamom"]);
});

test("zina: birinchi javoblarda eski sodda savollar", () => {
  const r = rngFrom(5);
  let prev = null;
  for (let k = 0; k < 40; k++) {
    prev = L.returnTask(r, prev, 0);
    assert.ok(!prev.code.includes("fakt") && !prev.code.includes("append") && !prev.code.includes("ikkilantir"), prev.code);
    const c = L.callTask(r, null, 0);
    assert.ok(!c.code.includes("def bosh") && !c.code.includes("for i in range"), c.code);
  }
  const idlar = new Set();
  for (let k = 0; k < 40; k++) { prev = L.writeTask(r, prev.type === "kod-yoz" ? prev : null, 0); idlar.add(prev.id); }
  assert.ok(![...idlar].some((id) => ["yoz:tub", "yoz:ekub", "yoz:nechta-tub", "yoz:daraja", "yoz:palindrom"].includes(id)), [...idlar].join(","));
});

test("yangi funksiya masalalari: tipik xato yechimlar o'tmaydi", () => {
  assert.ok(L.WRITE_KINDS.length >= 10);
  const vazifa = (id) => {
    const kind = L.WRITE_KINDS.find((k) => k.id === id);
    assert.ok(kind.tests.length >= 5, id + ": kamida 5 ta test");
    return { type: "kod-yoz", solution: kind.solution, tail: kind.tail, tests: kind.tests.map((stdin) => ({ stdin })) };
  };
  // tub: 1 ni tub deb hisoblagan yechim; d * d < n (kvadratlarni o'tkazib yuboradi: 25, 49)
  assert.equal(K.check(vazifa("tub"), "def tub(n):\n    for d in range(2, n):\n        if n % d == 0:\n            return False\n    return True").ok, false);
  assert.equal(K.check(vazifa("tub"), "def tub(n):\n    if n < 2:\n        return False\n    d = 2\n    while d * d < n:\n        if n % d == 0:\n            return False\n        d += 1\n    return True").ok, false);
  // Sodda (lekin to'g'ri) yechim ham o'tadi
  assert.equal(K.check(vazifa("tub"), "def tub(n):\n    if n < 2:\n        return False\n    for d in range(2, n):\n        if n % d == 0:\n            return False\n    return True").ok, true);
  // ekub: kichigini qaytargan yechim
  assert.equal(K.check(vazifa("ekub"), "def ekub(a, b):\n    if a < b:\n        return a\n    return b").ok, false);
  // Qo'pol usul (sanab chiqish) ham to'g'ri
  assert.equal(K.check(vazifa("ekub"), "def ekub(a, b):\n    eng = 1\n    for d in range(1, a + 1):\n        if a % d == 0 and b % d == 0:\n            eng = d\n    return eng").ok, true);
  // palindrom: faqat chetdagi harflarni solishtirgan yechim "abca" da yiqiladi
  assert.equal(K.check(vazifa("palindrom"), "def palindrom(s):\n    return s[0] == s[len(s) - 1]").ok, false);
  // nechta_tub: 1 ni tub deb sanagan yechim
  assert.equal(K.check(vazifa("nechta-tub"), "def tub(n):\n    for d in range(2, n):\n        if n % d == 0:\n            return False\n    return True\n\ndef nechta_tub(a):\n    soni = 0\n    for x in a:\n        if tub(x):\n            soni += 1\n    return soni").ok, false);
  // daraja: sikl bilan yozilgani ham to'g'ri; manfiy asos va n = 0 testda bor
  assert.equal(K.check(vazifa("daraja"), "def daraja(a, n):\n    k = 1\n    for i in range(n):\n        k = k * a\n    return k").ok, true);
  assert.deepEqual(K.expectedFor(vazifa("daraja"), { stdin: ["-2", "3"] }), ["-8"]);
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

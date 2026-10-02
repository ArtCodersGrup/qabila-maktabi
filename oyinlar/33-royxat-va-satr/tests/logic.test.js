// 33-o'yin mantiqi: ro'yxat amallari, bo'ylab yurish, satr va kod yozish.
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
  const r = rngFrom(seed || 19);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("hamma savol xatosiz ishlaydi va javobi tekshiriladi", () => {
  for (const make of [L.listTask, L.walkTask, L.stringTask]) {
    for (const task of each(make, 30)) {
      const r = py.run(task.code, { maxSteps: 100000 });
      assert.equal(r.error, null, task.code);
      assert.ok(r.output.length >= 1 && r.output.length <= L.MAX_LINES, task.code);
      assert.equal(K.check(task, r.output.join("\n")).ok, true);
    }
  }
});

test("ro'yxatdagi sonlar takrorlanmaydi va 1–20 oralig'ida", () => {
  const r = rngFrom(4);
  for (let k = 0; k < 30; k++) {
    const nums = L.numbers(r);
    assert.equal(new Set(nums).size, nums.length);
    assert.ok(nums.every((n) => n >= 1 && n <= 20));
    assert.ok(nums.length >= 3 && nums.length <= 5);
  }
});

// 2026-10-02: ro'yxat zina bilan uzayadi, oxirgi zinada manfiy sonlar ham bor
test("ro'yxat zinasi: 3–5 ta (1…20) → 4–6 ta (1…30) → 4–7 ta (−9…30)", () => {
  const r = rngFrom(6);
  for (const [tier, z] of L.ROYXAT_ZINA.entries()) {
    let manfiy = 0;
    for (let k = 0; k < 60; k++) {
      const nums = L.numbers(r, 0, tier);
      assert.equal(new Set(nums).size, nums.length);
      assert.ok(nums.length >= z.soni[0] && nums.length <= z.soni[1], "zina " + tier + ": " + nums.length);
      assert.ok(nums.every((n) => n >= z.qiymat[0] && n <= z.qiymat[1]), "zina " + tier + ": " + nums);
      if (nums.some((n) => n < 0)) manfiy++;
    }
    if (tier < 2) assert.equal(manfiy, 0); else assert.ok(manfiy > 20, "manfiy sonli ro'yxatlar kam: " + manfiy);
  }
});

test("zina: yangi shakllar faqat yuqori zinalarda, oxirgisida albatta uchraydi", () => {
  const kodlar = (make, tier) => {
    const r = rngFrom(27);
    let prev = null;
    const out = [];
    for (let k = 0; k < 80; k++) { prev = make(r, prev, tier); out.push(prev.code); }
    return out;
  };
  // Birinchi zinada: yangi shakllar yo'q va ro'yxat literalida manfiy son yo'q (a[-1] indeksi — bor)
  for (const c of kodlar(L.listTask, 0)) assert.ok(!c.includes("b = a") && !c.includes("pop()") && !/-\d/.test(c.split("\n")[0]), c);
  for (const c of kodlar(L.walkTask, 0)) assert.ok(!c.includes("best = 0") && !c.includes("a[i - 1]"), c);
  for (const c of kodlar(L.stringTask, 0)) assert.ok(!c.includes("split()") && !c.includes("sorted("), c);
  const l = kodlar(L.listTask, 2);
  assert.ok(l.some((c) => c.includes("b = a\nb.append")), "b = a (ikki nom — bitta ro'yxat)");
  assert.ok(l.some((c) => c.includes("a[0], a[-1] = a[-1], a[0]")), "chetlarni almashtirish");
  const w = kodlar(L.walkTask, 2);
  assert.ok(w.some((c) => c.includes("best = 0")), "best = 0 tuzog'i");
  assert.ok(w.some((c) => c.includes("a[1:-1]")), "manfiy chegarali kesish");
  const s = kodlar(L.stringTask, 2);
  assert.ok(s.some((c) => c.includes("split()")) && s.some((c) => c.includes("s[i] > s[i - 1]")));
});

test("tahlil savollari: javob Pythonning haqiqiy xulqiga mos", () => {
  // b = a nusxa olmaydi
  assert.deepEqual(py.run("a = [4, 22, 28]\nb = a\nb.append(40)\nb[0] = 0\nprint(a, len(a))").output, ["[0, 22, 28, 40] 4"]);
  // Hamma son manfiy: best = 0 dan boshlansa, javob 0 bo'lib qoladi (haqiqiy eng kattasi — −4)
  assert.deepEqual(py.run("a = [-16, -7, -4, -5]\nbest = 0\nfor x in a:\n    if x > best:\n        best = x\nprint(best, max(a))").output, ["0 -4"]);
  // "best = 0" savolida ro'yxat doim to'liq manfiy
  const r = rngFrom(2);
  let prev = null;
  for (let k = 0; k < 120; k++) {
    prev = L.walkTask(r, prev, 2);
    if (!prev.code.includes("best = 0")) continue;
    const sonlar = /\[([^\]]+)\]/.exec(prev.code)[1].split(", ").map(Number);
    assert.ok(sonlar.every((n) => n < 0), prev.code);
    assert.equal(py.run(prev.code).output[0].split(" ")[0], "0");
  }
});

test("yangi kod yozish masalalari: tipik xato yechimlar o'tmaydi", () => {
  assert.ok(L.WRITE_KINDS.length >= 9);
  const vazifa = (id) => {
    const kind = L.WRITE_KINDS.find((k) => k.id === id);
    return { type: "kod-yoz", solution: kind.solution, tests: kind.tests.map((stdin) => ({ stdin })) };
  };
  // int() siz solishtirish: "10" < "2" (matn sifatida) — "1 2 10" da yiqiladi
  assert.equal(K.check(vazifa("eng-katta-indeks"), "a = input().split()\neng = 0\nfor i in range(len(a)):\n    if a[i] > a[eng]:\n        eng = i\nprint(eng)").ok, false);
  // ">=" bilan: teng sonlarda oxirgisini beradi — "4 4 2" da yiqiladi
  assert.equal(K.check(vazifa("eng-katta-indeks"), "a = input().split()\neng = 0\nfor i in range(len(a)):\n    if int(a[i]) >= int(a[eng]):\n        eng = i\nprint(eng)").ok, false);
  // Qo'shni emas, istalgan takrorni izlagan yechim "1 2 1 2" da yiqiladi
  assert.equal(K.check(vazifa("qoshni-teng"), 'a = input().split()\njavob = "yoʻq"\nfor i in range(len(a)):\n    for j in range(i + 1, len(a)):\n        if a[i] == a[j]:\n            javob = "ha"\nprint(javob)').ok, false);
  // Anagramma: faqat uzunlikni solishtirgan yechim "qalam / qalin" da; harflar to'plamini ("aab"/"abb") — sanamasdan
  assert.equal(K.check(vazifa("anagramma"), 'a = input()\nb = input()\nif len(a) == len(b):\n    print("ha")\nelse:\n    print("yoʻq")').ok, false);
  assert.equal(K.check(vazifa("anagramma"), 'a = input()\nb = input()\njavob = "ha"\nfor h in a:\n    if h not in b:\n        javob = "yoʻq"\nfor h in b:\n    if h not in a:\n        javob = "yoʻq"\nprint(javob)').ok, false);
  // Ikkinchi (har xil): sorted()[-2] takrorli ro'yxatda yiqiladi
  assert.equal(K.check(vazifa("ikkinchi-har-xil"), "a = input().split()\nb = []\nfor x in a:\n    b.append(int(x))\nb = sorted(b)\nprint(b[len(b) - 2])").ok, false);
  assert.deepEqual(K.expectedFor(vazifa("ikkinchi-har-xil"), { stdin: ["1 7 7 4 9 9"] }), ["7"]);
});

test("1-bosqichda manfiy indeks, o'zgartirish va append savollari chiqadi", () => {
  const codes = each(L.listTask, 50).map((t) => t.code);
  assert.ok(codes.some((c) => c.includes("a[-1]")), "manfiy indeks");
  assert.ok(codes.some((c) => c.includes("append")), "append");
  assert.ok(codes.some((c) => /a\[\d\] = /.test(c)), "o'zgartirish");
  assert.ok(codes.some((c) => c.includes("sum(a)")), "sum/max/min");
});

test("2-bosqichda ikkala yurish usuli va kesish chiqadi", () => {
  const codes = each(L.walkTask, 50).map((t) => t.code);
  assert.ok(codes.some((c) => c.includes("for x in a")), "for x in a");
  assert.ok(codes.some((c) => c.includes("range(len(a))")), "range(len(a))");
  assert.ok(codes.some((c) => /a\[\d:\d\]/.test(c) || c.includes("a[:2]")), "kesish");
});

test("3-bosqichda satr kesish va harflar bo'ylab yurish chiqadi", () => {
  const codes = each(L.stringTask, 50).map((t) => t.code);
  assert.ok(codes.some((c) => c.includes("s[1:4]")), "kesish");
  assert.ok(codes.some((c) => c.includes("for harf in s")), "harflar bo'ylab");
  assert.ok(codes.some((c) => c.includes("s[-1]")), "oxirgi harf");
});

test("kod yozish masalalari namunali yechim bilan o'tadi", () => {
  for (const kind of L.WRITE_KINDS) {
    const task = { type: "kod-yoz", solution: kind.solution, tests: kind.tests.map((stdin) => ({ stdin })) };
    assert.deepEqual(K.validate(task), [], kind.id);
    assert.equal(K.check(task, kind.solution).ok, true, kind.id);
    assert.ok(kind.tests.length >= 4, kind.id);
  }
});

test("bitta qiymatli holat ham tekshiriladi (sikl umuman aylanmasligi mumkin)", () => {
  for (const kind of L.WRITE_KINDS) {
    if (kind.id === "ikkinchi-katta" || kind.id === "ikkinchi-har-xil") continue; // kamida ikkita son kerak
    assert.ok(kind.tests.some((t) => t[0].split(" ").length === 1), kind.id + ": bitta qiymatli holat yo'q");
  }
});

test("bir xil sonlar bo'lgan holat eng katta masalasida tekshiriladi", () => {
  const eng = L.WRITE_KINDS.find((k) => k.id === "eng-katta");
  assert.ok(eng.tests.some((t) => new Set(t[0].split(" ")).size === 1), "bir xil sonlar holati yo'q");
});

test("input().split() ishlatadigan yechim haqiqatan ishlaydi", () => {
  const out = py.run("a = input().split()\nprint(len(a), a[0], a[-1])", { stdin: ["3 5 7"] });
  assert.equal(out.error, null);
  assert.deepEqual(out.output, ["3 3 7"]);
});

test("savollar ketma-ket takrorlanmaydi", () => {
  for (const make of [L.listTask, L.walkTask, L.stringTask]) {
    const tasks = each(make, 30, 20260930);
    for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
  }
});

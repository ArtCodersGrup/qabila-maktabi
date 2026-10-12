// «for va while» mantiqi: har kod namunasi va har namunali yechim o'z talqinchimizda bajariladi.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
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
const each = (make, n, seed, tier) => {
  const r = rngFrom(seed || 3);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev, tier);
    out.push(prev);
  }
  return out;
};
const shakllar = (make, tier, n) => new Set(each(make, n || 300, 11, tier).map((t) => t.shakl || t.kind));
const zinadagi = (list, t) => list.filter((x) => (x.tier || 0) <= t).map((x) => x.id).sort();
const TERISH = ["SyntaxError", "IndentationError", "NotYet"];

// Mustaqil tekshiruv: belgilangan satr necha marta bajarilganini qadam-baqadam izdan sanaymiz
function izdanSana(task) {
  const tr = py.trace(task.code, { maxStates: 5000 });
  assert.equal(tr.error, null, task.code);
  return tr.states.filter((s) => s.line === task.mark).length;
}

test("1-bosqich: kod xatosiz ishlaydi, javob izdan sanalgan songa teng", () => {
  for (const tier of [0, 1, 2, undefined]) {
    for (const task of each(L.sanoqTask, 200, 5, tier)) {
      assert.equal(task.type, "sanoq");
      assert.equal(py.run(task.code).error, null, task.code);
      assert.ok(Number.isInteger(task.answer) && task.answer >= 0 && task.answer <= 16, task.code + " → " + task.answer);
      assert.equal(task.answer, izdanSana(task), task.code);
      assert.equal(task.qiymatlar.length, task.answer);
      const satr = task.code.split("\n")[task.mark - 1];
      assert.ok(/^ {4,}\S/.test(satr), "belgilangan satr sikl tanasida: " + satr);
      assert.ok(task.why.length > 15 && !task.why.includes(String(task.answer) + " marta"), "maslahat javobni aytmaydi");
      assert.ok(task.izoh.includes(task.answer + " marta"), task.izoh);
    }
  }
});

test("1-bosqich: shakllar zina bilan ochiladi; javoblar xilma-xil, 0 ham uchraydi", () => {
  for (const t of [0, 1, 2]) assert.deepEqual([...shakllar(L.sanoqTask, t, 400)].sort(), zinadagi(L.S1, t));
  assert.ok(L.S1.length >= 12);
  const tasks = each(L.sanoqTask, 400, 17, 2);
  const javoblar = new Set(tasks.map((t) => t.answer));
  assert.ok(javoblar.size >= 8, "javoblar: " + [...javoblar].join(","));
  assert.ok(javoblar.has(0), "0 marta bajariladigan holat uchramadi");
  for (const t of tasks) if (t.answer === 0) assert.equal(t.shakl, "nol", t.code);
});

test("1-bosqich: tuzoqlar — break, continue, ichma-ich va ikki shartli while", () => {
  const tasks = each(L.sanoqTask, 600, 23, 2);
  const by = (shakl) => tasks.filter((t) => t.shakl === shakl);
  for (const t of by("break")) {
    const jami = /\[(.*)\]/.exec(t.code)[1].split(",").length;
    assert.ok(t.answer < jami, "break siklni muddatidan oldin to'xtatadi: " + t.code);
  }
  for (const t of by("continue")) {
    const bosh = (t.code.split("\n")[0].match(/"bosh"/g) || []).length;
    const jami = /\[(.*)\]/.exec(t.code)[1].split(",").length;
    assert.equal(t.answer, jami - bosh, t.code);
  }
  assert.ok(by("ichma-ich").some((t) => t.code.includes("range(i)")) && by("ichma-ich").some((t) => !t.code.includes("range(i)")));
  // Ikki shart: ba'zan xato, ba'zan davrlar soni to'xtatadi
  const sabab = new Set(by("ikki-shart").map((t) => {
    const max = Number(/davr < (\d+)/.exec(t.code)[1]);
    return t.answer === max ? "davr" : "xato";
  }));
  assert.deepEqual([...sabab].sort(), ["davr", "xato"]);
  // Yarimlash: chegaraning o'zida > va >= turli javob beradi
  const y = by("yarimlash");
  assert.ok(y.some((t) => t.code.includes(">=")) && y.some((t) => !t.code.includes(">=")));
});

test("2-bosqich (natija): kod ishlaydi, chiqish 1–2 satr va toza sonlar", () => {
  for (const tier of [0, 1, 2, undefined]) {
    for (const task of each(L.hisobTask, 200, 7, tier)) {
      const r = py.run(task.code);
      assert.equal(r.error, null, task.code);
      assert.ok(r.output.length >= 1 && r.output.length <= 2, task.code);
      for (const line of r.output) assert.match(line, /^-?\d+(\.\d{1,2})?( -?\d+(\.\d{1,2})?)?$/, task.code + " → " + line);
      assert.equal(K.check(task, r.output.join("\n")).ok, true);
      assert.equal(K.check(task, "9999").ok, false);
      assert.match(task.code, /\b(for|while)\b/);
    }
  }
  for (const t of [0, 1, 2]) assert.deepEqual([...shakllar(L.hisobTask, t, 400)].sort(), zinadagi(L.HISOB, t));
  assert.ok(L.HISOB.length >= 10);
});

test("2-bosqich (natija): o'rtacha kasr son chiqaradi, javoblar xilma-xil", () => {
  const tasks = each(L.hisobTask, 400, 19, 2);
  const ort = tasks.filter((t) => t.shakl === "ortacha").map((t) => py.run(t.code).output[0]);
  assert.ok(ort.length > 5 && ort.every((x) => x.includes(".")), "/ har doim kasr son beradi");
  assert.ok(ort.some((x) => x.endsWith(".0")), "butun chiqadigan o'rtacha (7.0) ham uchraydi");
  assert.ok(new Set(tasks.map((t) => py.run(t.code).output.join("/"))).size >= 60);
});

test("2-bosqich (naqsh): namunali javob o'tadi, bo'sh qoldirilgani va tipik xatolar o'tmaydi", () => {
  for (const tier of [0, 1, 2, undefined]) {
    for (const task of each(L.naqshTask, 200, 9, tier)) {
      assert.equal(task.type, "bosh-joy");
      assert.equal(K.blanksIn(task.template), task.answers.length);
      assert.equal(K.fill(task.template, task.answers), task.solution);
      assert.deepEqual(K.validate(task), [], task.template);
      assert.equal(K.check(task, task.answers).ok, true, task.solution);
      assert.deepEqual(K.normalize(py.run(task.solution).output), task.lines);
      assert.equal(K.check(task, task.answers.map(() => "")).ok, false);
      assert.ok(task.what.length > 20 && task.why.length > 15);
    }
  }
  for (const t of [0, 1, 2]) assert.deepEqual([...shakllar(L.naqshTask, t, 400)].sort(), zinadagi(L.NAQSH, t));
  assert.ok(L.NAQSH.length >= 8);
  const topish = (shakl, seed) => {
    const r = rngFrom(seed || 31);
    let prev = null;
    for (let k = 0; k < 800; k++) { prev = L.naqshTask(r, prev, 2); if (prev.shakl === shakl) return prev; }
    throw new Error(shakl + " chiqmadi");
  };
  assert.equal(K.check(topish("hisoblagich"), ["1", "1"]).ok, false);
  assert.equal(K.check(topish("hisoblagich"), ["0", "2"]).ok, false);
  assert.equal(K.check(topish("ortacha"), ["1", "len(ballar)"]).ok, false);
  assert.equal(K.check(topish("while-shart"), [topish("while-shart").answers[0].replace(">", "<")]).ok, false);
  assert.equal(K.check(topish("eng-katta"), ["aniqliklar[0]", "<"]).ok, false);
  assert.equal(K.check(topish("eng-katta"), ["0", ">"]).ok, true, "0 dan boshlash ham shu ma'lumotda to'g'ri natija beradi");
  assert.equal(K.check(topish("break"), [topish("break").answers[0], "continue"]).ok, false);
  assert.equal(K.check(topish("indeks"), ["i", "eng"]).ok, false);
  assert.equal(K.check(topish("aniqlik"), ["len(bashorat)", "bashorat[i]"]).ok, true);
});

test("2-bosqich: natija va naqsh navbat bilan keladi", () => {
  const kinds = each(L.stage2Task, 14).map((t) => t.kind);
  for (let k = 1; k < kinds.length; k++) assert.notEqual(kinds[k], kinds[k - 1]);
});

test("3-bosqich (tuzatish): buzuq kod kamida bitta sinovdan o'tmaydi, yechim hammasidan o'tadi", () => {
  assert.ok(L.FIX.length >= 9);
  for (const f of L.FIX) {
    const task = { type: "xato-top", solution: f.solution, tests: f.tests.map((stdin) => ({ stdin })) };
    assert.deepEqual(K.validate(task), [], f.id);
    assert.equal(K.check(task, f.solution).ok, true, f.id);
    assert.equal(K.check(task, f.code).ok, false, f.id + ": buzuq kod o'tib ketdi");
    assert.ok(f.tests.length >= 4, f.id);
    assert.ok(f.what.startsWith("Kirish") && f.why.length > 15, f.id);
    // Mantiqiy xato: terish xatosi emas
    const r = py.run(f.code, { stdin: f.tests[0], maxSteps: 50000 });
    assert.ok(!r.error || !TERISH.includes(r.error.type), f.id);
  }
  // Cheksiz sikl to'xtatiladi va xato turi — Limit
  const cheksiz = L.FIX.find((f) => f.id === "cheksiz");
  assert.equal(py.run(cheksiz.code, { stdin: ["0.8"], maxSteps: 50000 }).error.type, "Limit");
  assert.equal(py.run(L.FIX.find((f) => f.id === "nolga-bolish").code, { stdin: ["2", "5", "6"] }).error.type, "ZeroDivisionError");
  assert.equal(py.run(L.FIX.find((f) => f.id === "indeks").code, { stdin: ["1", "50"] }).error.type, "IndexError");
});

test("3-bosqich (yozish): namunali yechim o'tadi, tipik xato yechimlar o'tmaydi", () => {
  assert.ok(L.WRITE.length >= 10);
  for (const w of L.WRITE) {
    const task = { type: "kod-yoz", solution: w.solution, tests: w.tests.map((stdin) => ({ stdin })) };
    assert.deepEqual(K.validate(task), [], w.id);
    assert.equal(K.check(task, w.solution).ok, true, w.id);
    assert.ok(w.tests.length >= 4, w.id + ": kamida 4 ta sinov");
    assert.ok(w.wrong && w.wrong.length >= 1, w.id);
    for (const bad of w.wrong) assert.equal(K.check(task, bad).ok, false, w.id + ": xato yechim o'tib ketdi\n" + bad);
    assert.equal(K.check(task, "").ok, false);
    assert.equal(K.check(task, "print(0)").ok, false, w.id + ": doimiy javob o'tmasligi kerak");
    assert.match(w.solution, /\b(for|while)\b/, w.id + ": yechim sikl ishlatadi");
    for (const stdin of w.tests) {
      for (const line of py.run(w.solution, { stdin }).output) assert.ok(!/[ʻʼ']|\.\d{3,}/.test(line), w.id + " → " + line);
    }
  }
});

test("3-bosqich (yozish): boshqacha, lekin to'g'ri yechimlar ham o'tadi", () => {
  const vazifa = (id) => {
    const w = L.WRITE.find((x) => x.id === id);
    return { type: "kod-yoz", solution: w.solution, tests: w.tests.map((stdin) => ({ stdin })) };
  };
  // Ro'yxatga yig'ib, sum bilan
  assert.equal(K.check(vazifa("yigindi"), "n = int(input())\na = []\nfor i in range(n):\n    a.append(int(input()))\nprint(sum(a))").ok, true);
  assert.equal(K.check(vazifa("ortacha"), "n = int(input())\ni = 0\ns = 0\nwhile i < n:\n    s = s + int(input())\n    i += 1\nprint(s / n)").ok, true);
  assert.equal(K.check(vazifa("yarimlash"), "x = float(input())\nc = float(input())\nd = 0\nwhile not x < c:\n    x = x * 0.5\n    d = d + 1\nprint(d)").ok, true);
  assert.equal(K.check(vazifa("toxtash-belgisi"), "s = 0\nj = 0\nwhile True:\n    x = int(input())\n    if x == -1:\n        break\n    s += 1\n    j += x\nprint(s, j)").ok, true);
  assert.equal(K.check(vazifa("erta-toxtash"), "n = int(input())\na = []\nfor i in range(n):\n    a.append(int(input()))\nj = 0\nfor i in range(1, n):\n    if a[i] > a[i - 1]:\n        j = i + 1\n        break\nprint(j)").ok, true);
  assert.equal(K.check(vazifa("eng-yaxshi"), "n = int(input())\na = []\nfor i in range(n):\n    a.append(int(input()))\nq = 0\nfor i in range(n):\n    if a[i] > a[q]:\n        q = i\nprint(a[q], q + 1)").ok, true);
});

test("3-bosqich: bank zina bo'yicha taqsimlangan, generator zinaga amal qiladi", () => {
  for (const bank of [L.FIX, L.WRITE]) {
    for (const t of [0, 1, 2]) assert.ok(bank.filter((x) => (x.tier || 0) === t).length >= 3, "zina " + t);
    assert.equal(new Set(bank.map((x) => x.id)).size, bank.length, "id takrorlangan");
  }
  for (const t of [0, 1, 2]) {
    assert.deepEqual([...shakllar(L.tuzatTask, t)].sort(), zinadagi(L.FIX, t));
    assert.deepEqual([...shakllar(L.yozTask, t)].sort(), zinadagi(L.WRITE, t));
  }
});

test("topshiriqlar ketma-ket takrorlanmaydi; 3-bosqichda turlar navbat bilan almashadi", () => {
  for (const make of [L.sanoqTask, L.hisobTask, L.naqshTask, L.stage2Task, L.tuzatTask, L.yozTask, L.stage3Task]) {
    for (const tier of [0, 1, 2]) {
      const tasks = each(make, 60, 20261012, tier);
      for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
    }
  }
  const types = each(L.stage3Task, 14).map((t) => t.type);
  for (let k = 1; k < types.length; k++) assert.notEqual(types[k], types[k - 1]);
});

// Sahnalardagi ko'rsatish kodlari ham talqinchida bajariladi: fayllardan ajratib olamiz
test("sahnalardagi hamma kod namunasi ishlaydi (cheksiz sikl namunasi — Limit bilan to'xtaydi)", () => {
  const dir = path.join(__dirname, "../js/scenes");
  let soni = 0;
  let cheksiz = 0;
  for (const file of ["stage1.js", "stage2.js", "stage3.js"]) {
    const src = fs.readFileSync(path.join(dir, file), "utf8");
    for (const m of src.matchAll(/'((?:[^'\\\n]|\\.)*\\n(?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*\\n(?:[^"\\\n]|\\.)*)"/g)) {
      const code = (m[1] !== undefined ? m[1] : m[2]).replace(/\\n/g, "\n").replace(/\\(["'])/g, "$1");
      const r = py.run(code, { stdin: ["3", "8", "6", "10"], maxSteps: 20000 });
      soni++;
      if (r.error) { assert.equal(r.error.type, "Limit", file + ":\n" + code + "\n" + r.error.text); cheksiz++; continue; }
      assert.ok(r.output.length >= 1, code);
    }
  }
  assert.ok(soni >= 6, "namunalar topilmadi: " + soni);
  assert.equal(cheksiz, 1);
});

test("sahnalar matnida aytilgan chiqishlar haqiqatga mos", () => {
  const out = (code, stdin) => py.run(code, { stdin }).output;
  assert.deepEqual(out('yorliqlar = ["spam", "oddiy", "spam"]\nsoni = 0\nfor y in yorliqlar:\n    soni += 1\nprint(soni)'), ["3"]);
  assert.deepEqual(out("xato = 0.8\ndavr = 0\nwhile xato > 0.1:\n    xato = xato / 2\n    davr += 1\nprint(davr)"), ["3"]);
  assert.deepEqual(out("xato = 0.8\nprint(xato / 2, xato / 4, xato / 8, xato / 8 > 0.1)"), ["0.4 0.2 0.1 False"]);
  assert.deepEqual(out('yorliqlar = ["spam", "oddiy", "spam", "spam"]\nsoni = 0\nfor y in yorliqlar:\n    if y == "spam":\n        soni += 1\nprint(soni)'), ["3"]);
  assert.deepEqual(out("ballar = [8, 6, 7, 9]\njami = 0\nfor b in ballar:\n    jami += b\nprint(jami, jami / len(ballar))"), ["30 7.5"]);
  assert.deepEqual(out("n = int(input())\njami = 0\nfor i in range(n):\n    jami += int(input())\nprint(jami / n)", ["3", "8", "6", "10"]), ["8.0"]);
  // Nomutanosib sinflar misoli: 100 xatdan 95 tasi oddiy — «hammasi oddiy» modeli 95 % aniq, spamdan 0 ta topadi
  assert.deepEqual(out('togri = 0\ntopildi = 0\nfor i in range(100):\n    haqiqiy = "oddiy"\n    if i < 5:\n        haqiqiy = "spam"\n    bashorat = "oddiy"\n    if haqiqiy == bashorat:\n        togri += 1\n    if haqiqiy == "spam" and bashorat == "spam":\n        topildi += 1\nprint(togri, topildi)'), ["95 0"]);
});

test("ekran matnida oddiy ' belgisi yo'q (oʻ gʻ — U+02BB, tutuq — U+02BC)", () => {
  const files = ["js/main.js", "js/scenes/stage1.js", "js/scenes/stage2.js", "js/scenes/stage3.js", "js/scenes/final.js", "js/scenes/common.js"];
  for (const file of files) {
    const src = fs.readFileSync(path.join(__dirname, "..", file), "utf8").replace(/^\s*\/\/.*$/gm, "");
    assert.ok(!/[a-zA-Z]'[a-zA-Z]/.test(src), file + ": matnda oddiy ' bor");
  }
  const r = rngFrom(1);
  for (const list of [L.NAQSH.map((s) => s.make(r)), L.FIX, L.WRITE, L.S1]) {
    for (const x of list) assert.ok(!/'/.test((x.what || "") + (x.why || "")), "what/why: " + x.what);
  }
});

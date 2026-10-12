// «Shartlar va tarmoqlanish» mantiqi: har kod namunasi va har namunali yechim o'z talqinchimizda bajariladi.
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
const shakllar = (make, tier, n) => new Set(each(make, n || 200, 11, tier).map((t) => t.shakl || t.kind));
const zinadagi = (list, t) => list.filter((x) => (x.tier || 0) <= t).map((x) => x.id).sort();

test("1-bosqich: har kod xatosiz ishlaydi, javobi 1–3 satr va to'g'ri tekshiriladi", () => {
  for (const tier of [0, 1, 2, undefined]) {
    for (const task of each(L.natijaTask, 150, 5, tier)) {
      const r = py.run(task.code);
      assert.equal(r.error, null, task.code);
      assert.ok(r.output.length >= 1 && r.output.length <= 3, task.code);
      assert.equal(K.check(task, r.output.join("\n")).ok, true, task.code);
      assert.equal(K.check(task, "notogri javob").ok, false);
      // Javobni bola teradi: chiqishda o'zbekcha maxsus belgi (ʻ ʼ) bo'lmasin
      assert.ok(!/[ʻʼ']/.test(r.output.join("")), task.code);
    }
  }
});

test("1-bosqich: shakllar zina bilan ochiladi", () => {
  for (const t of [0, 1, 2]) assert.deepEqual([...shakllar(L.natijaTask, t, 300)].sort(), zinadagi(L.S1, t));
  assert.ok(L.S1.length >= 10);
});

test("1-bosqich: ikkala tarmoq ham uchraydi, chegaradagi qiymatlar ko'p", () => {
  const tasks = each(L.natijaTask, 300, 7, 2);
  const chiqishlar = new Set(tasks.map((t) => py.run(t.code).output.join("/")));
  assert.ok(chiqishlar.size >= 12, "javoblar xilma-xil emas: " + chiqishlar.size);
  const chegara = tasks.filter((t) => t.shakl === "chegara");
  const ayni = chegara.filter((t) => {
    const m = /= ([\d.]+)\nif \w+ \S+ ([\d.]+):/.exec(t.code);
    return m && m[1] === m[2];
  });
  assert.ok(ayni.length >= 3, "chegaraning o'zi kam uchradi: " + ayni.length + " / " + chegara.length);
});

test("1-bosqich: tuzoq shakllar — noto'g'ri tartib va ikki alohida if", () => {
  const tasks = each(L.natijaTask, 400, 13, 2);
  const tartib = tasks.filter((t) => t.shakl === "tartib").map((t) => py.run(t.code).output[0]);
  assert.ok(tartib.length > 5);
  assert.ok(!tartib.includes("sinov") && !tartib.includes("tayyor"), "o'sish tartibidagi zanjirda keyingi tarmoqlar yetib bo'lmaydi");
  assert.ok(tartib.includes("qayta") && tartib.includes("rad"));
  const ikki = tasks.filter((t) => t.shakl === "ikki-if").map((t) => py.run(t.code).output.length);
  assert.ok(ikki.includes(2), "ikki satr chiqadigan holat uchramadi");
  const daraxt = new Set(tasks.filter((t) => t.shakl === "daraxt").map((t) => py.run(t.code).output[0]));
  assert.deepEqual([...daraxt].sort(), ["setosa", "versicolor", "virginica"]);
});

test("2-bosqich: namunali javob hamma sinovdan o'tadi, bo'sh joylar soni mos", () => {
  for (const tier of [0, 1, 2, undefined]) {
    for (const task of each(L.toldirTask, 150, 9, tier)) {
      assert.equal(task.type, "bosh-joy");
      assert.equal(K.blanksIn(task.template), task.answers.length, task.template);
      assert.equal(K.fill(task.template, task.answers), task.solution);
      assert.deepEqual(K.validate(task), [], task.template);
      assert.equal(K.check(task, task.answers).ok, true, task.solution);
      assert.ok(task.tests.length >= 3, task.shakl);
      assert.ok(task.what.length > 20 && task.why.length > 10);
      // Har sinovda aynan bitta satr chiqadi va sinovlar ikkala tarmoqni ham qamraydi
      const outs = task.tests.map((c) => py.run(task.solution, { stdin: c.stdin }));
      for (const r of outs) { assert.equal(r.error, null, task.solution); assert.equal(r.output.length, 1); }
      assert.ok(new Set(outs.map((r) => r.output[0])).size >= 2, task.solution);
    }
  }
});

test("2-bosqich: shakllar zina bilan ochiladi", () => {
  for (const t of [0, 1, 2]) assert.deepEqual([...shakllar(L.toldirTask, t, 300)].sort(), zinadagi(L.S2, t));
  assert.ok(L.S2.length >= 10);
});

test("2-bosqich: tipik xato shartlar o'tmaydi, teng kuchli yozuvlar o'tadi", () => {
  const topish = (shakl, seed) => {
    const r = rngFrom(seed || 21);
    let prev = null;
    for (let k = 0; k < 500; k++) { prev = L.toldirTask(r, prev, 2); if (prev.shakl === shakl) return prev; }
    throw new Error(shakl + " chiqmadi");
  };
  // Chegara: qat'iy va noqat'iy solishtirish almashtirilsa — o'tmaydi
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const t = topish("chegara", seed);
    const a = t.answers[0];
    const almash = a.includes(">=") ? a.replace(">=", ">") : a.includes("<=") ? a.replace("<=", "<") : a.includes(">") ? a.replace(">", ">=") : a.replace("<", "<=");
    assert.equal(K.check(t, [almash]).ok, false, a + " → " + almash);
  }
  const va = topish("va");
  assert.equal(K.check(va, [va.answers[0].replace(" and ", " or ")]).ok, false);
  assert.equal(K.check(va, [va.answers[0].replace("havolalar > ", "havolalar >= ")]).ok, false);
  const yoki = topish("yoki");
  assert.equal(K.check(yoki, [yoki.answers[0].replace(" or ", " and ")]).ok, false);
  assert.equal(K.check(yoki, [yoki.answers[0].replace(">= 38", "> 38")]).ok, false);
  const oraliq = topish("oraliq");
  const [, a, b] = /(\d+) <= ishonch < (\d+)/.exec(oraliq.answers[0]);
  assert.equal(K.check(oraliq, ["ishonch >= " + a + " and ishonch < " + b]).ok, true);
  assert.equal(K.check(oraliq, [a + " < ishonch <= " + b]).ok, false);
  const qavs = topish("qavs");
  assert.equal(K.check(qavs, [qavs.answers[0].replace(/[()]/g, "")]).ok, false, "qavssiz yozuv o'tmasligi kerak");
  const zanjir = topish("zanjir");
  assert.equal(K.check(zanjir, [zanjir.answers[1], zanjir.answers[0]]).ok, false, "teskari tartib o'tmasligi kerak");
  const emas = topish("emas");
  assert.equal(K.check(emas, [emas.answers[0].replace("tanish == 0", "not tanish == 1")]).ok, true);
  assert.equal(K.check(emas, [emas.answers[0].replace("tanish == 0 and ", "")]).ok, false);
  const matritsa = topish("matritsa");
  assert.equal(K.check(matritsa, ["haqiqiy == bashorat", "bashorat == 1 and haqiqiy == 0"]).ok, true);
  assert.equal(K.check(matritsa, ["haqiqiy == bashorat", "haqiqiy == 1"]).ok, false);
  // Bo'sh joy to'ldirilmagan
  assert.equal(K.check(va, [""]).ok, false);
});

test("3-bosqich (tuzatish): buzuq kod kamida bitta sinovdan o'tmaydi, yechim hammasidan o'tadi", () => {
  assert.ok(L.FIX.length >= 9);
  for (const f of L.FIX) {
    const task = { type: "xato-top", solution: f.solution, tests: f.tests.map((stdin) => ({ stdin })) };
    assert.deepEqual(K.validate(task), [], f.id);
    assert.equal(K.check(task, f.solution).ok, true, f.id);
    assert.equal(K.check(task, f.code).ok, false, f.id + ": buzuq kod o'tib ketdi");
    assert.notEqual(f.code, f.solution);
    assert.ok(f.tests.length >= 4, f.id);
    assert.ok(f.what.startsWith("Qoida") && f.why.length > 10, f.id);
    // Mantiqiy xato: kod terish xatosisiz ishga tushadi (sintaksis xatosi emas)
    const r = py.run(f.code, { stdin: f.tests[0] });
    assert.ok(!r.error || !["SyntaxError", "IndentationError", "NotYet"].includes(r.error.type), f.id);
    // Yechimda har sinov bitta satr chiqaradi
    for (const stdin of f.tests) assert.equal(py.run(f.solution, { stdin }).output.length, 1, f.id);
  }
});

test("3-bosqich (yozish): namunali yechim o'tadi, tipik xato yechimlar o'tmaydi", () => {
  assert.ok(L.WRITE.length >= 10);
  for (const w of L.WRITE) {
    const task = { type: "kod-yoz", solution: w.solution, tests: w.tests.map((stdin) => ({ stdin })) };
    assert.deepEqual(K.validate(task), [], w.id);
    assert.equal(K.check(task, w.solution).ok, true, w.id);
    assert.ok(w.tests.length >= 4, w.id + ": kamida 4 ta sinov");
    assert.ok(w.wrong && w.wrong.length >= 1, w.id);
    for (const bad of w.wrong) {
      assert.equal(py.run(bad, { stdin: w.tests[0] }).error, null, w.id + ": xato yechim ishga tushishi kerak");
      assert.equal(K.check(task, bad).ok, false, w.id + ": xato yechim o'tib ketdi\n" + bad);
    }
    assert.equal(K.check(task, "").ok, false);
    assert.equal(K.check(task, 'print("spam")').ok, false, w.id + ": doimiy javob o'tmasligi kerak");
    for (const stdin of w.tests) {
      const out = py.run(w.solution, { stdin }).output;
      assert.equal(out.length, 1, w.id);
      assert.ok(!/[ʻʼ']/.test(out[0]), w.id + ": chiqishda maxsus belgi");
    }
  }
});

test("3-bosqich (yozish): boshqacha, lekin to'g'ri yechimlar ham o'tadi", () => {
  const vazifa = (id) => {
    const w = L.WRITE.find((x) => x.id === id);
    return { type: "kod-yoz", solution: w.solution, tests: w.tests.map((stdin) => ({ stdin })) };
  };
  assert.equal(K.check(vazifa("spam-chegara"), 'p = float(input())\nif p < 0.5:\n    print("oddiy")\nelse:\n    print("spam")').ok, true);
  assert.equal(K.check(vazifa("kopchilik"), "a = int(input())\nb = int(input())\nc = int(input())\nif a == 1 and b == 1 or a == 1 and c == 1 or b == 1 and c == 1:\n    print(1)\nelse:\n    print(0)").ok, true);
  assert.equal(K.check(vazifa("matritsa"), 'h = int(input())\nb = int(input())\nif h == b:\n    if h == 1:\n        print("TP")\n    else:\n        print("TN")\nelse:\n    if b == 1:\n        print("FP")\n    else:\n        print("FN")').ok, true);
  assert.equal(K.check(vazifa("gul"), 'u = float(input())\nk = float(input())\nif u < 2.5:\n    print("setosa")\nelse:\n    if k >= 1.8:\n        print("virginica")\n    else:\n        print("versicolor")').ok, true);
  assert.equal(K.check(vazifa("uch-zona"), 'p = float(input())\nif 0.2 < p < 0.8:\n    print("odamga")\nelif p >= 0.8:\n    print("spam")\nelse:\n    print("oddiy")').ok, true);
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
  for (const task of each(L.stage3Task, 60, 4, 2)) assert.deepEqual(K.validate(task), [], task.id);
});

test("topshiriqlar ketma-ket takrorlanmaydi; 3-bosqichda turlar navbat bilan almashadi", () => {
  for (const make of [L.natijaTask, L.toldirTask, L.tuzatTask, L.yozTask, L.stage3Task]) {
    for (const tier of [0, 1, 2]) {
      const tasks = each(make, 60, 20261012, tier);
      for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
    }
  }
  const types = each(L.stage3Task, 14).map((t) => t.type);
  for (let k = 1; k < types.length; k++) assert.notEqual(types[k], types[k - 1]);
});

// Sahnalardagi ko'rsatish kodlari ham talqinchida ishlashi kerak: fayllardan ajratib olib bajaramiz
test("sahnalardagi hamma kod namunasi xatosiz ishlaydi", () => {
  const dir = path.join(__dirname, "../js/scenes");
  let soni = 0;
  for (const file of ["stage1.js", "stage2.js", "stage3.js"]) {
    const src = fs.readFileSync(path.join(dir, file), "utf8");
    // Kod namunasi — ichida \n bo'lgan satr literali ('…' yoki "…")
    for (const m of src.matchAll(/'((?:[^'\\\n]|\\.)*\\n(?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*\\n(?:[^"\\\n]|\\.)*)"/g)) {
      const code = (m[1] !== undefined ? m[1] : m[2]).replace(/\\n/g, "\n").replace(/\\(["'])/g, "$1");
      const r = py.run(code);
      assert.equal(r.error, null, file + ":\n" + code);
      assert.ok(r.output.length >= 1, code);
      soni++;
    }
  }
  assert.ok(soni >= 6, "namunalar topilmadi: " + soni);
});

test("sahnalar matnida kutilgan chiqishlar haqiqatga mos", () => {
  const out = (code) => py.run(code).output;
  assert.deepEqual(out('ehtimol = 0.62\nif ehtimol >= 0.5:\n    print("spam")\nelse:\n    print("oddiy")\nprint("tekshirildi")'), ["spam", "tekshirildi"]);
  assert.deepEqual(out('ehtimol = 0.5\nif ehtimol >= 0.5:\n    print("spam")\nelse:\n    print("oddiy")'), ["spam"]);
  assert.deepEqual(out('ehtimol = 0.5\nif ehtimol > 0.5:\n    print("spam")\nelse:\n    print("oddiy")'), ["oddiy"]);
  assert.deepEqual(out("ehtimol = 0.7\nhavolalar = 1\nprint(ehtimol >= 0.6 and havolalar > 2)\nprint(ehtimol >= 0.6 or havolalar > 2)\nprint(not ehtimol >= 0.6)"), ["False", "True", "False"]);
  assert.deepEqual(out('aniqlik = 78\nif aniqlik >= 90:\n    print("tayyor")\nelif aniqlik >= 70:\n    print("sinov")\nelse:\n    print("qayta")'), ["sinov"]);
  assert.deepEqual(out('uzunlik = 4.7\nkenglik = 1.4\nif uzunlik < 2.5:\n    print("setosa")\nelif kenglik < 1.8:\n    print("versicolor")\nelse:\n    print("virginica")'), ["versicolor"]);
});

test("ekran matnida oddiy ' belgisi yo'q (oʻ gʻ — U+02BB, tutuq — U+02BC)", () => {
  const files = ["js/main.js", "js/scenes/stage1.js", "js/scenes/stage2.js", "js/scenes/stage3.js", "js/scenes/final.js", "js/scenes/common.js"];
  for (const file of files) {
    const src = fs.readFileSync(path.join(__dirname, "..", file), "utf8").replace(/^\s*\/\/.*$/gm, "");
    assert.ok(!/[a-zA-Z]'[a-zA-Z]/.test(src), file + ": matnda oddiy ' bor");
  }
  for (const list of [L.S2.map((s) => s.make(rngFrom(1))), L.FIX, L.WRITE]) {
    for (const x of list) assert.ok(!/'/.test(x.what + (x.why || "")), "what/why: " + x.what);
  }
});

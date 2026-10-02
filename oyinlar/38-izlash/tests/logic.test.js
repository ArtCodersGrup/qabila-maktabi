// 38-o'yin mantiqi: "son o'yladim" o'yini, izlash kodlari va qadam o'lchovi.
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
  const r = rngFrom(seed || 53);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("javob(): katta, kichik va topdi", () => {
  assert.equal(L.javob(42, 10), "katta");
  assert.equal(L.javob(42, 90), "kichik");
  assert.equal(L.javob(42, 42), "topdi");
});

test("ikkilik strategiya 1–100 oralig'ida 7 savoldan oshmaydi", () => {
  for (let son = 1; son <= 100; son++) {
    let chap = 1;
    let ong = L.CHEK;
    let savol = 0;
    for (;;) {
      const taxmin = L.yarmi(chap, ong);
      savol++;
      const j = L.javob(son, taxmin);
      if (j === "topdi") break;
      const yangi = L.torayt(chap, ong, taxmin, j);
      chap = yangi.chap;
      ong = yangi.ong;
      assert.ok(chap <= ong, "oraliq yo'qoldi: " + son);
      assert.ok(savol < 20, "cheksiz: " + son);
    }
    assert.ok(savol <= 7, son + " uchun " + savol + " savol");
  }
});

test("kerakliSavol(): 100 uchun 7, 1000 uchun 10", () => {
  assert.equal(L.kerakliSavol(1), 1);
  assert.equal(L.kerakliSavol(2), 2);
  assert.equal(L.kerakliSavol(100), 7);
  assert.equal(L.kerakliSavol(1000), 10);
});

test("izlash kodlari to'g'ri javob beradi", () => {
  assert.deepEqual(py.run(L.CHIZIQLI(10, 7)).output, ["7"]);
  assert.deepEqual(py.run(L.IKKILIK(10, 7)).output, ["7"]);
  assert.deepEqual(py.run(L.CHIZIQLI(10, 99)).output, ["-1"]);
  assert.deepEqual(py.run(L.IKKILIK(10, 99)).output, ["-1"]);
});

test("qadam jadvali: chiziqli ikki barobar o'sadi, ikkilik deyarli o'smaydi", () => {
  const j = L.jadval([10, 20, 40, 80]);
  assert.equal(j.length, 4);
  // Chiziqli: n ikki barobar oshsa, qadam ham taxminan ikki barobar
  const nisbat = j[3].chiziqli / j[0].chiziqli;
  assert.ok(nisbat > 5 && nisbat < 10, "chiziqli nisbat: " + nisbat);
  // Ikkilik: 8 barobar kattalashganda ham 3 barobardan kam o'sadi
  assert.ok(j[3].ikkilik < j[0].ikkilik * 3, "ikkilik: " + j[0].ikkilik + " → " + j[3].ikkilik);
  // Katta n da ikkilik aniq tejamli
  assert.ok(j[3].ikkilik < j[3].chiziqli, "80 da ikkilik tejamli bo'lishi kerak");
});

test("o'qish savollari: javob 1–4 satr va tekshiriladi", () => {
  for (const task of each(L.oqishTask, 60)) {
    const r = py.run(task.code);
    assert.equal(r.error, null, task.id);
    // Faqat "qaysi indekslarga qaraydi" savolida bir necha satr; qolganlarida bitta
    if (task.id.startsWith("ikkilik-iz:")) assert.ok(r.output.length >= 2 && r.output.length <= 4, task.id);
    else assert.equal(r.output.length, 1, task.id);
    assert.equal(K.check(task, r.output.join("\n")).ok, true, task.id);
  }
});

// 2026-10-02: qadamlarni yurgizish savollari
test("qadam savollari: sanoq va iz haqiqiy ikkilik izlashga mos", () => {
  const a = "a = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]\n";
  // 23 ni izlash: o'rtalar 4 (16), 7 (56), 5 (23) — uchta solishtirish
  assert.deepEqual(py.run(a + "x = 23\n" + L.IKKILIK_IZ).output, ["4", "7", "5"]);
  assert.deepEqual(py.run(a + "x = 23\n" + L.IKKILIK_SANOQ).output, ["3"]);
  // Chiziqli izlash 23 ni 6-solishtirishda topadi; yo'q sonni izlasa — hammasini ko'radi
  assert.deepEqual(py.run(a + "x = 23\n" + L.CHIZIQLI_SANOQ).output, ["6"]);
  assert.deepEqual(py.run(a + "x = 24\n" + L.CHIZIQLI_SANOQ).output, ["10"]);
  // Yo'q sonni ikkilik izlash 4 qadamdan ko'p qilmaydi (10 ta son)
  for (let x = 0; x <= 95; x++) assert.ok(Number(py.run(a + "x = " + x + "\n" + L.IKKILIK_SANOQ).output[0]) <= 4, "x = " + x);
});

test("zina: qadam savollari yuqori zinalarda, birinchisida — faqat natija", () => {
  const idlar = (tier) => {
    const r = rngFrom(19);
    let prev = null;
    const out = new Set();
    for (let k = 0; k < 80; k++) { prev = L.oqishTask(r, prev, tier); out.add(prev.id.split(":")[0]); }
    return out;
  };
  assert.deepEqual([...idlar(0)].sort(), ["chiziqli", "ikkilik", "yoq"]);
  const qiyin = idlar(2);
  for (const id of ["ikkilik-iz", "ikkilik-sanoq", "chiziqli-sanoq"]) assert.ok(qiyin.has(id), id);
  // Ro'yxatda yo'q son ham izlanadi (yo'l oxirigacha boradi)
  const r = rngFrom(4);
  let prev = null;
  let yoq = 0;
  for (let k = 0; k < 80; k++) {
    prev = L.oqishTask(r, prev, 2);
    const m = /a = \[([^\]]+)\]\nx = (-?\d+)/.exec(prev.code);
    if (!m[1].split(", ").includes(m[2])) yoq++;
  }
  assert.ok(yoq >= 8, "yo'q son kam izlandi: " + yoq);
});

test("yangi kod yozish masalalari: takrorli ro'yxat va chekka holatlar", () => {
  assert.ok(L.WRITE.length >= 4);
  const vazifa = (id) => {
    const w = L.WRITE.find((x) => x.id === id);
    return { type: "kod-yoz", solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
  };
  // "Bormi?" ni qaytargan (0/1) yechim takrorlarda yiqiladi
  assert.equal(K.check(vazifa("necha-marta"), "def sana(a, x):\n    for y in a:\n        if y == x:\n            return 1\n    return 0").ok, false);
  // Birinchi >= x: chiziqli yechim ham to'g'ri
  assert.equal(K.check(vazifa("birinchi"), "def birinchi(a, x):\n    for i in range(len(a)):\n        if a[i] >= x:\n            return i\n    return len(a)").ok, true);
  // "Topilmasa −1" deb yozilgan yechim yiqiladi (shart: ro'yxat uzunligi)
  assert.equal(K.check(vazifa("birinchi"), "def birinchi(a, x):\n    for i in range(len(a)):\n        if a[i] >= x:\n            return i\n    return -1").ok, false);
  // Qat'iy katta (>) ni izlagan yechim "2 2 2 5 / 2" va "5 / 5" da yiqiladi
  assert.equal(K.check(vazifa("birinchi"), "def birinchi(a, x):\n    for i in range(len(a)):\n        if a[i] > x:\n            return i\n    return len(a)").ok, false);
  assert.deepEqual(K.expectedFor(vazifa("birinchi"), { stdin: ["2 2 2 5", "2"] }), ["0"]);
  // Zina 0 da faqat ikki asosiy masala
  const r = rngFrom(7);
  let prev = null;
  for (let k = 0; k < 30; k++) { prev = L.writeTask(r, prev, 0); assert.ok(["yoz:chiziqli", "yoz:ikkilik"].includes(prev.id), prev.id); }
});

test("o'qish: topilmagan holat ham uchraydi (-1)", () => {
  const javoblar = each(L.oqishTask, 30).map((t) => py.run(t.code).output[0]);
  assert.ok(javoblar.includes("-1"), "topilmagan holat chiqmadi");
});

test("kod yozish: ikkala yechim ham testlardan o'tadi", () => {
  for (const w of L.WRITE) {
    const task = { type: "kod-yoz", solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
    assert.deepEqual(K.validate(task), [], w.id);
    assert.equal(K.check(task, w.solution).ok, true, w.id);
    assert.ok(w.tests.length >= 5, w.id + ": kamida 5 ta test");
  }
});

test("kod yozish: topilmagan va bitta elementli holat tekshiriladi", () => {
  for (const w of L.WRITE) {
    const stdins = w.tests.map((t) => t[0] + "|" + t[1]);
    assert.ok(w.tests.some((t) => !t[0].split(" ").includes(t[1])), w.id + ": topilmaydigan holat yo'q");
    assert.ok(w.tests.some((t) => t[0].split(" ").length === 1), w.id + ": bitta elementli ro'yxat yo'q");
  }
});

test("noto'g'ri yechim o'tmaydi", () => {
  const chiziqli = L.WRITE.find((w) => w.id === "chiziqli");
  const task = { type: "kod-yoz", solution: chiziqli.solution, tail: chiziqli.tail, tests: chiziqli.tests.map((stdin) => ({ stdin })) };
  // Topilmasa -1 qaytarmaydigan yechim
  assert.equal(K.check(task, "def izla(a, x):\n    for i in range(len(a)):\n        if a[i] == x:\n            return i").ok, false);
});

test("savollar ketma-ket takrorlanmaydi", () => {
  const tasks = each(L.oqishTask, 30, 20261003);
  for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
});

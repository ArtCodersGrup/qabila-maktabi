// 39-o'yin mantiqi: pufakcha va tanlash saralashi, qadam o'lchovi va savollar.
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
  const r = rngFrom(seed || 61);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};
const saralangan = (a) => a.every((v, k) => k === 0 || a[k - 1] <= v);

test("pufakcha saralash to'g'ri saralaydi va har qadamni yozib boradi", () => {
  const r = rngFrom(7);
  for (let k = 0; k < 20; k++) {
    const n = 2 + Math.floor(r() * 6);
    const a = Array.from({ length: n }, () => Math.floor(r() * 30));
    const { qadamlar, natija } = L.pufakQadamlar(a);
    assert.ok(saralangan(natija), a.join(","));
    assert.deepEqual(natija.slice().sort((x, y) => x - y), natija);
    // Qadamlar soni: n(n-1)/2 ta qiyoslash
    assert.equal(qadamlar.length, (n * (n - 1)) / 2, a.join(","));
    // Asl ro'yxat o'zgarmaydi
    assert.equal(a.length, n);
  }
});

test("pufakcha: har qadamda almashdi belgisi to'g'ri", () => {
  const { qadamlar } = L.pufakQadamlar([5, 2, 9, 1]);
  for (const q of qadamlar) {
    assert.equal(q.almashdi, q.holat[q.i] > q.holat[q.i + 1], q.holat.join(",") + " @" + q.i);
  }
});

test("tanlash saralashi to'g'ri ishlaydi va eng kichigini topadi", () => {
  const r = rngFrom(11);
  for (let k = 0; k < 20; k++) {
    const n = 2 + Math.floor(r() * 6);
    const a = Array.from({ length: n }, () => Math.floor(r() * 30));
    const { qadamlar, natija } = L.tanlashQadamlar(a);
    assert.ok(saralangan(natija), a.join(","));
    assert.equal(qadamlar.length, n - 1);
    for (const q of qadamlar) {
      const qolgan = q.holat.slice(q.boshi);
      assert.equal(q.holat[q.engKichik], Math.min(...qolgan), q.holat.join(","));
    }
  }
});

test("qadam jadvali: n ikki barobar oshsa, qadam ~to'rt barobar", () => {
  const j = L.jadval([5, 10, 20, 40]);
  for (const usul of ["pufak", "tanlash"]) {
    for (let k = 1; k < j.length; k++) {
      const nisbat = j[k][usul] / j[k - 1][usul];
      assert.ok(nisbat > 2.5 && nisbat < 5, usul + " " + j[k - 1].n + "→" + j[k].n + ": " + nisbat.toFixed(1));
    }
  }
  // Ikkalasi ham n² tartibida, lekin tanlash kamroq almashtiradi
  assert.ok(j[3].tanlash < j[3].pufak, "40 da tanlash kamroq qadam qilishi kerak");
});

test("saralash kodlari haqiqatan saralaydi", () => {
  const kod = L.literal([5, 2, 9, 1]) + L.PUFAK_TANA;
  assert.deepEqual(py.run(kod).output, ["1 9"]);
  const kod2 = L.literal([5, 2, 9, 1]) + L.TANLASH_TANA;
  assert.deepEqual(py.run(kod2).output, ["1 9"]);
});

test("1-bosqich: almashtirish savoli — javob chapdagisi kattaligiga bog'liq", () => {
  for (const task of each(L.almashTask, 30)) {
    assert.equal(task.javob, task.holat[task.i] > task.holat[task.i + 1], task.id);
    assert.ok(task.i >= 0 && task.i < task.holat.length - 1, task.id);
    assert.equal(new Set(task.holat).size, task.holat.length, "sonlar takrorlanmaydi");
  }
});

test("1-bosqich: ha va yo'q javoblari ham uchraydi", () => {
  const javoblar = each(L.almashTask, 30).map((t) => t.javob);
  assert.ok(javoblar.includes(true) && javoblar.includes(false));
});

test("2-bosqich: bir o'tishdan keyingi ro'yxat to'g'ri hisoblanadi", () => {
  for (const task of each(L.otishTask, 25)) {
    const a = task.holat.slice();
    for (let i = 0; i < a.length - 1; i++) {
      if (a[i] > a[i + 1]) { const t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; }
    }
    assert.deepEqual(task.javob, a, task.id);
    assert.notDeepEqual(task.javob, task.holat, "o'zgarmagan savol berilmasin");
    // Bir o'tishdan keyin eng kattasi oxirida bo'ladi
    assert.equal(task.javob[task.javob.length - 1], Math.max(...task.holat), task.id);
  }
});

test("3-bosqich: ikkala saralash yechimi ham testlardan o'tadi", () => {
  for (const w of L.WRITE) {
    const task = { type: "kod-yoz", solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
    assert.deepEqual(K.validate(task), [], w.id);
    assert.equal(K.check(task, w.solution).ok, true, w.id);
    assert.ok(w.tests.some((t) => t[0].split(" ").length === 1), w.id + ": bitta elementli ro'yxat yo'q");
    assert.ok(w.tests.some((t) => t[0] === "1 2 3"), w.id + ": allaqachon saralangan ro'yxat yo'q");
  }
});

test("saralamaydigan yechim o'tmaydi", () => {
  const w = L.WRITE[0];
  const task = { type: "kod-yoz", solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
  assert.equal(K.check(task, "def sarala(a):\n    pass").ok, false);
  // Bitta o'tish yetarli emas
  assert.equal(K.check(task, "def sarala(a):\n    for i in range(len(a) - 1):\n        if a[i] > a[i + 1]:\n            b = a[i]\n            a[i] = a[i + 1]\n            a[i + 1] = b").ok, false);
});

test("savollar ketma-ket takrorlanmaydi", () => {
  for (const make of [L.almashTask, L.otishTask]) {
    const tasks = each(make, 30, 20261004);
    for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
  }
});

// Ekran yordamchisidagi 0 holati: birinchi juftlik ham belgilanishi kerak
// (brauzerda topilgan xato: `o.juft && …` nol uchun ishlamasdi)
test("ustunlar(): juft = 0 va tayyor = 0 ham ishlaydi", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const src = fs.readFileSync(path.join(__dirname, "../js/scenes/common.js"), "utf8");
  assert.match(src, /o\.juft != null/, "juft 0 bo'lsa ham belgilanishi kerak");
  assert.match(src, /o\.tayyor != null/, "tayyor 0 bo'lsa ham ishlashi kerak");
});

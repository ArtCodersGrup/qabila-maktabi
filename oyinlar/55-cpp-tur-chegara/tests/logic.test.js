// 55-o'yin mantiqining testlari. Ishga tushirish (loyiha ildizida):
//   node --test oyinlar/55-cpp-tur-chegara/tests/
// Misollar haqiqiy g++ bilan ham solishtiriladi: oyinlar/umumiy/tests/cpp-parity.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const C = require("../../umumiy/js/cpp.js");
const E = require("../../umumiy/js/cpp/cpp-run.js");

const r = () => Math.random();

// Eng muhim qoida: o'yin aytgan javob yadroda ham aynan shunday chiqishi kerak
test("har misolning chiqishi dvigatelniki bilan bir xil", () => {
  const yasovchilar = [L.toshishTask, L.tuzatishTask, L.bolishTask, L.qirqishTask];
  let soni = 0;
  for (let k = 0; k < 120; k++) {
    for (const f of yasovchilar) {
      const t = f(r, null);
      if (!t) continue;
      soni++;
      const natija = E.run(t.kod, { stdin: [] });
      assert.equal(natija.error, null, t.id + ": " + JSON.stringify(natija.error));
      assert.deepEqual(natija.output, t.chiqish, t.id);
    }
  }
  assert.ok(soni > 400, "misollar kam: " + soni);
});

test("toshish: javob matematik javobdan boshqa va qirqilgan son", () => {
  for (let k = 0; k < 100; k++) {
    const t = L.toshishTask(r, null);
    const javob = BigInt(t.javob);
    assert.ok(javob >= L.INT_MIN && javob <= L.INT_MAX, t.id + ": " + t.javob);
    assert.equal(t.variantlar.length, 4, t.id);
    assert.equal(new Set(t.variantlar).size, 4, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    // "Xato beradi" — eng muhim yanglish tasavvur, u har safar variantlar ichida bo'lsin
    assert.ok(t.variantlar.some((v) => /Xato beradi/.test(v)), t.id);
    assert.match(t.nega, /jim buziladi/);
  }
});

test("long long bilan o'sha hisob to'g'ri chiqadi", () => {
  for (let k = 0; k < 60; k++) {
    const t = L.tuzatishTask(r, null);
    assert.ok(t.kod.includes("long long"), t.id);
    const javob = BigInt(t.chiqish[0]);
    assert.ok(javob > L.INT_MAX || javob < L.INT_MIN, t.id + ": toshmaydigan misol " + javob);
  }
});

test("bo'lish tuzoqlari: butun, kasr, qoldiq va manfiy", () => {
  const korilgan = new Set();
  for (let k = 0; k < 300; k++) korilgan.add(L.bolishTask(r, null).id.split(":")[1]);
  assert.deepEqual([...korilgan].sort(), ["butun", "kasr", "manfiy", "manfiy-qoldiq", "qoldiq"]);
});

test("int ga kasr qiymat: kasr qismi tashlanadi, yaxlitlanmaydi", () => {
  for (let k = 0; k < 60; k++) {
    const t = L.qirqishTask(r, null);
    const qiymat = /int a = (-?[0-9.]+);/.exec(t.kod)[1];
    assert.equal(t.chiqish[0], String(Math.trunc(Number(qiymat))), t.id);
  }
});

test("tur tanlash: har vazifada bitta to'g'ri javob va izoh", () => {
  const korilgan = new Set();
  for (let k = 0; k < 200; k++) {
    const t = L.turTask(r, null);
    korilgan.add(t.id);
    assert.deepEqual(t.variantlar, [L.INT_YETADI, L.LL_KERAK, L.DOUBLE_KERAK], t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    assert.ok(t.nega.length > 20, t.id);
  }
  assert.equal(korilgan.size, L.VAZIFALAR.length);
  // Uch xil javob ham uchrasin
  const javoblar = new Set(L.VAZIFALAR.map((v) => v.javob));
  assert.equal(javoblar.size, 3);
});

test("yozish mashqlari: namunali yechim ishlaydi, noto'g'ri tur esa o'tmaydi", () => {
  for (const y of L.YOZISHLAR) {
    assert.equal(C.tekshir(y, y.yechim).ok, true, y.id + ": yechim ishlamadi");
    assert.equal(C.tekshir(y, L.QOLIP).ok, false, y.id + ": bo'sh qolip o'tib ketdi");
  }
  // int bilan yozilgan yig'indi sinovdan o'tmasligi kerak — mashqning butun ma'nosi shu
  const yigindi = L.YOZISHLAR.find((y) => y.id === "yigindi");
  const intBilan = yigindi.yechim.replace(/long long/g, "int");
  assert.equal(C.tekshir(yigindi, intBilan).ok, false, "int bilan o'tib ketdi — mashq ma'nosiz bo'lib qoladi");
  // double o'rniga int: o'rtacha kasri yo'qoladi
  const ortacha = L.YOZISHLAR.find((y) => y.id === "ortacha");
  assert.equal(C.tekshir(ortacha, ortacha.yechim.replace(/double/g, "int")).ok, false);
});

test("bosqichlar: turlar navbat bilan keladi", () => {
  assert.deepEqual([0, 1].map((n) => L.bosqich1Task(null, n).tur), ["toshish", "natija"]);
  assert.deepEqual([0, 1, 2].map((n) => L.bosqich2Task(null, n).tur), ["natija", "natija", "natija"]);
  assert.deepEqual([0, 1].map((n) => L.bosqich3Task(null, n).tur), ["tur", "yoz"]);
});

test("bitta savol ketma-ket ikki marta chiqmaydi", () => {
  for (const next of [L.bosqich1Task, L.bosqich2Task, L.bosqich3Task]) {
    let prev = null;
    for (let k = 0; k < 40; k++) {
      const t = next(prev, k);
      if (prev && prev.tur === t.tur) assert.notEqual(t.id, prev.id);
      prev = t;
    }
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  const matnlar = [];
  for (let k = 0; k < 60; k++) {
    for (const next of [L.bosqich1Task, L.bosqich2Task, L.bosqich3Task]) {
      const t = next(null, k);
      for (const kalit of ["savol", "nega", "yolYoriq"]) if (t[kalit]) matnlar.push(t[kalit]);
    }
  }
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "notoʻgʻri tutuq belgisi: " + m);
});

test("namunalar: yechimlar ham, misollar ham tekshiruvga tushadi", () => {
  const ns = L.namunalar(20);
  assert.ok(ns.length >= 20, ns.length);
  assert.ok(ns.some((n) => n.id.startsWith("yechim:")), "namunali yechimlar");
  assert.ok(ns.some((n) => n.kirish && n.kirish.length), "cin li misol");
  assert.equal(new Set(ns.map((n) => n.id)).size, ns.length, "takrorlanmasin");
});

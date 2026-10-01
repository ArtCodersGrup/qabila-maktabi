// 57-o'yin mantiqining testlari. Ishga tushirish (loyiha ildizida):
//   node --test oyinlar/57-cpp-massiv-saralash/tests/
// vector/sort misollari yadroda ishlamaydi — ular faqat g++ bilan tekshiriladi
// (oyinlar/umumiy/tests/cpp-parity.test.js).
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const C = require("../../umumiy/js/cpp.js");
const E = require("../../umumiy/js/cpp/cpp-run.js");

const r = () => Math.random();

test("massiv va satr misollari yadroda aynan shunday chiqadi", () => {
  let soni = 0;
  for (let k = 0; k < 120; k++) {
    for (const f of [L.massivTask, L.satrTask]) {
      const t = f(r, null);
      soni++;
      const natija = E.run(t.kod, { stdin: [] });
      assert.equal(natija.error, null, t.id + ": " + JSON.stringify(natija.error));
      assert.deepEqual(natija.output, t.chiqish, t.id);
    }
  }
  assert.ok(soni > 200, "misollar kam: " + soni);
});

test("massiv: indeks noldan boshlanadi va to'rt xil misol bor", () => {
  const korilgan = new Set();
  for (let k = 0; k < 200; k++) korilgan.add(L.massivTask(r, null).id.split(":")[1]);
  assert.deepEqual([...korilgan].sort(), ["eng-katta", "indeks", "teskari", "yigindi"]);
});

// Chegaradan chiqish — aniqlanmagan xatti-harakat, shuning uchun savol tanlov ko'rinishida
test("chegara savoli: to'g'ri javob — 'to'xtamaydi, lekin javob buzilishi mumkin'", () => {
  for (let k = 0; k < 60; k++) {
    const t = L.chegaraTask(r, null);
    assert.equal(t.javob, L.CHEGARA_JAVOB, t.id);
    assert.equal(t.variantlar.length, 4, t.id);
    assert.ok(t.variantlar.includes("Dastur xato berib toʻxtaydi"), "eng keng tarqalgan yanglish tasavvur bo'lsin");
    assert.match(t.nega, /aniqlanmagan xatti-harakat/);
  }
  // Yadro bu dasturni ataylab to'xtatadi va buni ochiq aytadi
  const t = L.chegaraTask(r, null);
  const natija = E.run(t.kod, { stdin: [] });
  assert.ok(natija.error && /out of bounds/.test(natija.error.cppMessage), JSON.stringify(natija.error));
  assert.match(natija.error.hint, /javob buzuq chiqadi/);
});

test("satr: uzunlik, belgi, unli va teskari misollari", () => {
  const korilgan = new Set();
  for (let k = 0; k < 200; k++) korilgan.add(L.satrTask(r, null).id.split(":")[1]);
  assert.deepEqual([...korilgan].sort(), ["belgi", "teskari", "unli", "uzunlik"]);
  // string ishlatilgan dasturda kutubxona ham ulanadi
  for (let k = 0; k < 20; k++) assert.ok(L.satrTask(r, null).kod.includes("#include <string>"));
});

test("yozish mashqlari: yechim ishlaydi, bo'sh qolip o'tmaydi", () => {
  for (const y of L.MASSIV_YOZISH.concat(L.SATR_YOZISH)) {
    assert.ok(y.sinovlar.length >= 2, y.id + ": kamida ikki sinov bo'lsin");
    assert.equal(C.tekshir(y, y.yechim).ok, true, y.id + ": " + JSON.stringify(C.tekshir(y, y.yechim)));
    assert.equal(C.tekshir(y, L.QOLIP).ok, false, y.id);
  }
  // "o'rtachadan katta" mashqi: hamma son teng bo'lsa javob 0 — bu sinov qo'shilgan
  const ort = L.MASSIV_YOZISH.find((y) => y.id === "ortachadan-katta");
  assert.ok(ort.sinovlar.some((s) => s.chiqish[0] === "0"), "teng sonlar sinovi bo'lsin");
});

// vector va sort yadroda yo'q: bola yozsa, ochiq xabar chiqadi
test("vector misollari yadroda ishlamaydi va buni ochiq aytadi", () => {
  const t = L.vectorTask(r, null);
  assert.equal(t.yadroda, false, "o'qish uchun ekani belgilansin");
  assert.ok(t.kod.includes("#include <vector>"), t.id);
  const natija = E.run(t.kod, { stdin: [] });
  assert.ok(natija.error && natija.error.kind === "yoq", JSON.stringify(natija.error));
  assert.match(natija.error.hint, /hali ishlamaydi/);
});

test("vector misollarining javobi JSda ham to'g'ri hisoblangan", () => {
  for (let k = 0; k < 120; k++) {
    const t = L.vectorTask(r, null);
    const sonlar = /\{([0-9, ]+)\}/.exec(t.kod);
    if (!sonlar) continue;
    const a = sonlar[1].split(",").map((x) => Number(x.trim()));
    if (t.id.startsWith("vector:sort:")) {
      assert.equal(t.chiqish[0], a.slice().sort((x, y) => x - y).join(" ") + " ", t.id);
    } else if (t.id.startsWith("vector:sort-teskari:")) {
      assert.equal(t.chiqish[0], a.slice().sort((x, y) => y - x).join(" ") + " ", t.id);
    } else if (t.id.startsWith("vector:eng:")) {
      assert.equal(t.chiqish[0], Math.min(...a) + " " + Math.max(...a), t.id);
    }
  }
});

test("farq savollari: to'rt variant, bitta to'g'ri", () => {
  const korilgan = new Set();
  for (let k = 0; k < 200; k++) {
    const t = L.farqTask(r, null);
    korilgan.add(t.id);
    assert.equal(t.variantlar.length, 4, t.id);
    assert.equal(new Set(t.variantlar).size, 4, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
  }
  assert.equal(korilgan.size, L.FARQLAR.length);
});

test("bosqichlar: turlar navbat bilan keladi", () => {
  assert.deepEqual([0, 1, 2].map((n) => L.bosqich1Task(null, n).tur), ["natija", "chegara", "yoz"]);
  assert.deepEqual([0, 1].map((n) => L.bosqich2Task(null, n).tur), ["natija", "yoz"]);
  assert.deepEqual([0, 1].map((n) => L.bosqich3Task(null, n).tur), ["natija", "farq"]);
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
  // C++ belgi literali ('a') — kod, tutuq belgisi emas; tekshiruvdan oldin olib tashlanadi
  for (const m of matnlar) {
    const proza = m.replace(/'.'/g, "");
    assert.ok(!/['’`´]/.test(proza), "notoʻgʻri tutuq belgisi: " + m);
  }
});

test("namunalar: massiv, satr va vector misollari ham tekshiruvga tushadi", () => {
  const ns = L.namunalar(24);
  assert.ok(ns.length >= 24, ns.length);
  assert.ok(ns.some((n) => n.id.startsWith("yechim:")));
  assert.ok(ns.some((n) => n.kod.includes("vector")), "vector misoli g++ ga yuborilsin");
  assert.equal(new Set(ns.map((n) => n.id)).size, ns.length);
});

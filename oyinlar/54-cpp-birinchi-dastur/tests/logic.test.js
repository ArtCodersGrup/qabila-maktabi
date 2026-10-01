// 54-o'yin mantiqining testlari. Ishga tushirish (loyiha ildizida):
//   node --test oyinlar/54-cpp-birinchi-dastur/tests/
// Misollarning chiqishi haqiqiy g++ bilan ham tekshiriladi:
//   node --test oyinlar/umumiy/tests/cpp-parity.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const C = require("../../umumiy/js/cpp.js");

const r = () => Math.random();

test("dastur qolipi: har misolda to'liq C++ dasturi bor", () => {
  for (let k = 0; k < 60; k++) {
    const t = k % 2 === 0 ? L.natijaTask(r, null) : L.kirishTask(r, null);
    assert.ok(t.kod.startsWith("#include <iostream>"), t.id);
    assert.ok(t.kod.includes("int main() {"), t.id);
    assert.ok(t.kod.trimEnd().endsWith("return 0;\n}"), t.id);
    assert.ok(t.chiqish.length > 0 && t.chiqish.every((s) => typeof s === "string"), t.id);
  }
});

test("natija: har tur uchun chiqish aniq hisoblangan", () => {
  const korilgan = new Set();
  for (let k = 0; k < 200; k++) korilgan.add(L.natijaTask(r, null).kind);
  assert.deepEqual([...korilgan].sort(), ["hisob", "ikki", "ketma", "qoshma"]);
});

// cout o'zidan keyin yangi satrga o'tmaydi — "ketma" misoli aynan shuni ko'rsatadi
test("ketma-ket cout bitta satr chiqaradi", () => {
  for (let k = 0; k < 100; k++) {
    const t = L.natijaTask(r, null);
    if (t.kind !== "ketma") continue;
    assert.equal(t.chiqish.length, 1, t.id);
    assert.equal((t.kod.match(/cout/g) || []).length, 3, t.id);
    assert.ok(t.chiqish[0].startsWith("Salom, ") && t.chiqish[0].endsWith("!"), t.chiqish[0]);
  }
});

test("yetmaydi: kod haqiqatan buzilgan va javob variantlar ichida", () => {
  const togri = C.dastur([C.chiqar('"Salom!"')]);
  for (let k = 0; k < 80; k++) {
    const t = L.yetmaydiTask(r, null);
    assert.notEqual(t.kod, togri, t.id);
    assert.equal(t.variantlar.length, 4, t.id);
    assert.equal(new Set(t.variantlar).size, 4, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    // Buzilish aynan nomi aytilgan joyda bo'lsin
    if (t.javob.includes(";")) assert.ok(!t.kod.includes('"\\n";'), t.id);
    if (t.javob.includes("}")) assert.ok(!t.kod.trimEnd().endsWith("}"), t.id);
    if (t.javob.includes("#include")) assert.ok(!t.kod.includes("#include"), t.id);
  }
});

test("qism: qolipning har qismi uchun savol va to'rt izoh", () => {
  const korilgan = new Set();
  for (let k = 0; k < 200; k++) {
    const t = L.qismTask(r, null);
    korilgan.add(t.javob);
    assert.equal(t.variantlar.length, 4, t.id);
    assert.equal(new Set(t.variantlar).size, 4, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
  }
  assert.equal(korilgan.size, C.QISMLAR.length, "hamma qism savolga tushsin");
});

test("e'lon: to'g'ri javob bitta, qolgani haqiqatan xato", () => {
  for (let k = 0; k < 80; k++) {
    const t = L.elonTask(r, null);
    assert.equal(t.variantlar.length, 4, t.id);
    assert.equal(new Set(t.variantlar).size, 4, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    assert.ok(t.javob.endsWith(";"), t.javob + " — ; bilan tugashi kerak");
  }
  // Har e'londa tur oldin yoziladi
  for (const e of L.ELONLAR) assert.match(e.javob, /^(int|double|string)\b/, e.id);
});

test("kirish: cin o'qiydigan ma'lumot berilgan va chiqish shunga mos", () => {
  for (let k = 0; k < 100; k++) {
    const t = L.kirishTask(r, null);
    assert.ok(t.kirish.length > 0, t.id);
    assert.ok(t.kod.includes("cin >>"), t.id);
    assert.ok(!t.kod.includes("int("), t.id + ": C++ da int() kerak emas");
    if (t.id.includes("ism")) assert.ok(t.kod.includes("#include <string>"), t.id + ": string kutubxonasi");
  }
});

test("juft: Python satriga mos C++ satri", () => {
  const korilgan = new Set();
  for (let k = 0; k < 200; k++) {
    const t = L.juftTask(r, null);
    korilgan.add(t.id);
    assert.equal(t.variantlar.length, 4, t.id);
    assert.equal(new Set(t.variantlar).size, 4, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
  }
  assert.equal(korilgan.size, L.JUFTLAR.length);
  // print(x) ning javobi yangi satrni ham chiqarishi kerak
  const p = L.JUFTLAR.find((j) => j.id === "print");
  assert.ok(p.javob.includes('"\\n"'), "print → cout da \\n bo'lsin");
});

test("aralash: kodda haqiqatan Python satri bor va raqami to'g'ri", () => {
  for (let k = 0; k < 100; k++) {
    const t = L.aralashTask(r, null);
    const n = Number(t.javob.split("-")[0]);
    const satr = t.kod.split("\n")[n - 1].trim();
    assert.ok(L.ARALASH_SATRLAR.some((a) => a.python === satr), t.id + ": " + satr);
    assert.ok(!satr.endsWith(";") || satr.startsWith("#"), t.id + ": Python satri ; bilan tugamaydi");
    assert.equal(t.variantlar.length, 4, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
  }
});

test("bosqichlar: har bosqich o'z turlarini navbat bilan beradi", () => {
  assert.deepEqual([0, 1, 2].map((n) => L.bosqich1Task(null, n).tur), ["natija", "yetmaydi", "qism"]);
  assert.deepEqual([0, 1, 2].map((n) => L.bosqich2Task(null, n).tur), ["elon", "natija", "yoz"]);
  assert.deepEqual([0, 1].map((n) => L.bosqich3Task(null, n).tur), ["juft", "aralash"]);
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

test("chiqishni solishtirish: ortiqcha bo'shliq va bo'sh satr kechiriladi", () => {
  assert.ok(C.solishtir(["12"], "12\n").ok);
  assert.ok(C.solishtir(["12"], "12   ").ok);
  assert.ok(C.solishtir(["a", "b"], "a\nb\n\n").ok);
  assert.equal(C.solishtir(["a", "b"], "a").ok, false);
  assert.equal(C.solishtir(["a"], "a\nb").ok, false);
  assert.equal(C.solishtir(["12"], "13").satr, 1);
});

// Bolaga ko'rinadigan o'zbekcha matnlar (kod satrlari emas)
test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  const matnlar = [];
  const yig = (t) => { for (const kalit of ["savol", "nega", "yolYoriq", "izoh"]) if (t[kalit]) matnlar.push(t[kalit]); };
  for (let k = 0; k < 60; k++) {
    for (const next of [L.bosqich1Task, L.bosqich2Task, L.bosqich3Task]) yig(next(null, k));
  }
  for (const q of C.QISMLAR) matnlar.push(q.izoh);
  for (const j of C.JADVAL) matnlar.push(j.nima);
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "notoʻgʻri tutuq belgisi: " + m);
});

// Bola yozadigan mashqlar: namunali yechim haqiqatan ishlashi kerak
test("yoz: har mashqning yechimi dvigatelda ishlaydi va chiqishi mos", () => {
  for (const y of L.YOZISHLAR) {
    assert.ok(y.sinovlar.length >= 1, y.id);
    const r = C.tekshir(y, y.yechim);
    assert.equal(r.ok, true, y.id + ": " + JSON.stringify(r));
    // Bo'sh qolip bilan o'tib ketmasin
    assert.equal(C.tekshir(y, L.QOLIP).ok, false, y.id + ": bo'sh qolip qabul qilinmasin");
  }
  assert.ok(L.QOLIP.includes("int main()"), "qolipda main bo'lsin");
});

test("namunalar: parity testi uchun turli xil misollar", () => {
  const ns = L.namunalar(12);
  assert.ok(ns.length >= 12);
  assert.equal(new Set(ns.map((n) => n.id)).size, ns.length, "takrorlanmasin");
  assert.ok(ns.some((n) => n.id.startsWith("yechim:")), "namunali yechimlar ham tekshirilsin");
  assert.ok(ns.some((n) => n.kirish.length), "cin li misol ham bo'lsin");
  for (const n of ns) assert.ok(n.chiqish.length > 0 && n.kod.includes("main"), n.id);
});

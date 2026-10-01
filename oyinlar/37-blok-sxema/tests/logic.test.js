// 37-o'yin mantiqi: belgilar, sxema yig'ish va o'qish savollari.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const S = require("../js/sxema.js");
const py = require("../../umumiy/js/python/python.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const each = (make, n, seed) => {
  const r = rngFrom(seed || 41);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("belgilar: har shakl uchun bitta savol, javoblar ro'yxati umumiy", () => {
  assert.equal(L.BELGILAR.length, 5);
  for (const b of L.BELGILAR) {
    assert.ok(S.turById(b.tur), b.tur);
    assert.ok(L.JAVOBLAR.includes(b.javob), b.tur);
    assert.ok(b.savol.endsWith("?"), b.tur);
  }
  assert.equal(new Set(L.JAVOBLAR).size, 5, "javoblar takrorlanmaydi");
});

test("yig'ish masalalari: to'g'ri yig'ilgan sxema testlardan o'tadi", () => {
  // Har masala uchun to'g'ri yechimni qo'lda yig'amiz
  const yechimlar = {
    kvadrat: (p) => [p[0], p[1], p[2]],
    "juft-toq": (p) => [p[0], Object.assign({}, p[1], { ha: [p[2]], yoq: [p[3]] })],
    yigindi: (p) => [p[0], Object.assign({}, p[1], { tana: [p[2]] }), p[3]],
    kattasi: (p) => [p[0], p[1], Object.assign({}, p[2], { ha: [p[3]], yoq: [p[4]] })],
    salom: (p) => [Object.assign({}, p[0], { tana: [p[1]] })],
  };
  for (const q of L.QURISH) {
    const sxema = yechimlar[q.id](q.palitra);
    const r = L.tekshir(sxema, q.tests);
    assert.equal(r.ok, true, q.id + ": " + r.sabab);
    assert.ok(q.what.length > 25, q.id + ": shart qisqa");
    assert.ok(q.tests.length >= 1, q.id);
  }
});

test("yig'ish: chalg'ituvchi blok bilan yig'ilgan sxema o'tmaydi", () => {
  const kvadrat = L.QURISH.find((q) => q.id === "kvadrat");
  const notogri = [kvadrat.palitra[0], kvadrat.palitra[3], kvadrat.palitra[2]]; // n + n
  const r = L.tekshir(notogri, kvadrat.tests);
  assert.equal(r.ok, false);
  assert.match(r.sabab, /kutilgan/);
});

test("yig'ish: bo'sh va chiqarishsiz sxema tushunarli sabab beradi", () => {
  const kvadrat = L.QURISH.find((q) => q.id === "kvadrat");
  assert.match(L.tekshir([], kvadrat.tests).sabab, /boʻsh/);
  assert.match(L.tekshir([kvadrat.palitra[0]], kvadrat.tests).sabab, /Chiqarish/);
});

test("yig'ish: shart ichi bo'sh qolsa aytiladi", () => {
  const juft = L.QURISH.find((q) => q.id === "juft-toq");
  const sxema = [juft.palitra[0], Object.assign({}, juft.palitra[1], { ha: [], yoq: [] }), juft.palitra[2]];
  assert.equal(L.tekshir(sxema, juft.tests).ok, false);
});

test("palitra nusxalanadi: bola blok qo'shsa, bank o'zgarmaydi", () => {
  const task = each(L.qurishTask, 1)[0];
  const asl = L.QURISH.find((q) => "qur:" + q.id === task.id);
  const shart = task.palitra.find((b) => b.tur === "shart");
  if (shart) shart.ha.push({ tur: "chiqar", kod: "print(1)" });
  const aslShart = asl.palitra.find((b) => b.tur === "shart");
  if (aslShart) assert.equal(aslShart.ha.length, 0, "bankdagi palitra o'zgarib ketdi");
});

test("o'qish savollari: sxemadan yasalgan kod ishlaydi va javobi bor", () => {
  for (const task of each(L.oqishTask, 20)) {
    assert.equal(task.tur, "oqi");
    const r = py.run(task.kod, { stdin: task.stdin });
    assert.equal(r.error, null, task.id);
    assert.deepEqual(r.output, task.javob, task.id);
    assert.ok(task.javob.length >= 1, task.id);
  }
});

test("o'qish: shart va sikl bo'lgan sxemalar ham uchraydi", () => {
  const idlar = new Set(each(L.oqishTask, 25).map((t) => t.id));
  assert.ok(idlar.has("oqi-shart") || idlar.has("oqi-sikl"), "faqat chiziqli sxemalar chiqdi");
});

test("savollar ketma-ket takrorlanmaydi", () => {
  for (const make of [L.belgiTask, L.qurishTask, L.oqishTask]) {
    const tasks = each(make, 30, 20261002);
    for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
  }
});

test("3-bosqich: ikki xil savol navbat bilan", () => {
  const turlar = each(L.stage3Task, 12).map((t) => t.tur);
  assert.ok(turlar.includes("qur") && turlar.includes("oqi"));
  for (let k = 1; k < turlar.length; k++) assert.notEqual(turlar[k], turlar[k - 1]);
});

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
    // 2026-10-02 masalalari
    modul: (p) => [p[0], Object.assign({}, p[1], { ha: [p[2]], yoq: [] }), p[3]],
    daraja: (p) => [p[0], p[1], Object.assign({}, p[3], { tana: [p[4]] }), p[6]],
    "juftlar-yigindisi": (p) => [p[0], p[1], Object.assign({}, p[3], { tana: [p[4]] }), p[5]],
    "uch-kattasi": (p) => [p[0], p[1], p[2], p[3], Object.assign({}, p[4], { ha: [p[5]], yoq: [] }),
      Object.assign({}, p[6], { ha: [p[7]], yoq: [] }), p[8]],
  };
  assert.deepEqual(Object.keys(yechimlar).sort(), L.QURISH.map((q) => q.id).sort(), "har masalaga yechim yozilgan boʻlsin");
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

// 2026-10-02: yangi masalalarda chalg'ituvchi bloklar haqiqatan noto'g'ri javob berishi kerak
test("yangi yig'ish masalalari: chalg'ituvchi blok va chekka holatlar", () => {
  const top = (id) => L.QURISH.find((q) => q.id === id);
  const ichiga = (b, kalit, ichi) => Object.assign({}, b, { [kalit]: ichi });
  // modul: chiqarish shart ICHIDA qolsa — musbat son uchun hech narsa chiqmaydi
  const m = top("modul").palitra;
  assert.equal(L.tekshir([m[0], ichiga(m[1], "ha", [m[2], m[3]])], top("modul").tests).ok, false);
  // daraja: s ← 0 dan boshlansa yoki qo'shib borilsa — noto'g'ri; n = 0 sinovi bor
  const d = top("daraja").palitra;
  assert.equal(L.tekshir([d[0], d[2], ichiga(d[3], "tana", [d[4]]), d[6]], top("daraja").tests).ok, false);
  assert.equal(L.tekshir([d[0], d[1], ichiga(d[3], "tana", [d[5]]), d[6]], top("daraja").tests).ok, false);
  assert.ok(top("daraja").tests.some((t) => t.stdin[0] === "0"), "n = 0 sinovi");
  // juftlar yig'indisi: hamma sonni qo'shadigan sikl o'tmaydi; toq n va n = 1 sinovi bor
  const j = top("juftlar-yigindisi").palitra;
  assert.equal(L.tekshir([j[0], j[1], ichiga(j[2], "tana", [j[4]]), j[5]], top("juftlar-yigindisi").tests).ok, false);
  assert.ok(top("juftlar-yigindisi").tests.some((t) => Number(t.stdin[0]) % 2 === 1));
  // uch sondan kattasi: faqat bitta shart bilan — uchinchi son katta bo'lganda yiqiladi; manfiy sonlar sinovi bor
  const u = top("uch-kattasi").palitra;
  assert.equal(L.tekshir([u[0], u[1], u[2], u[3], ichiga(u[4], "ha", [u[5]]), u[8]], top("uch-kattasi").tests).ok, false);
  assert.ok(top("uch-kattasi").tests.some((t) => t.stdin.every((s) => s.startsWith("-"))), "manfiy sonlar sinovi");
  // Hamma masalada kamida bitta chalg'ituvchi yoki ortiqcha blok bor (palitra yechimdan uzun yoki teng emas)
  for (const id of ["daraja", "juftlar-yigindisi", "modul"]) assert.ok(top(id).palitra.length >= 5, id);
});

test("qiyinlik zinasi: birinchi zinada sodda masalalar, oxirgisida yangilari", () => {
  const idlar = (make, tier) => {
    const r = rngFrom(12);
    let prev = null;
    const out = new Set();
    for (let k = 0; k < 60; k++) { prev = make(r, prev, tier); out.add(prev.asos || prev.id); }
    return out;
  };
  assert.deepEqual([...idlar(L.qurishTask, 0)].sort(), ["qur:kvadrat", "qur:salom", "qur:yigindi"]);
  const qiyin = idlar(L.qurishTask, 2);
  for (const id of ["qur:daraja", "qur:juftlar-yigindisi", "qur:uch-kattasi"]) assert.ok(qiyin.has(id), id);
  assert.ok(![...idlar(L.oqishTask, 0)].some((id) => ["oqi-daraja", "oqi-yigib", "oqi-ikki-shart"].includes(id)));
  const oqi = idlar(L.oqishTask, 2);
  for (const id of ["oqi-daraja", "oqi-yigib", "oqi-ikki-shart"]) assert.ok(oqi.has(id), id);
});

test("o'qish: bir sxema har xil kirish bilan har xil javob beradi", () => {
  for (const o of L.OQISH.filter((x) => x.kirishlar)) {
    const javoblar = new Set(o.kirishlar.map((stdin) => py.run(S.kodYasa(o.sxema), { stdin }).output.join("|")));
    assert.ok(javoblar.size >= 2, o.id + ": hamma kirishda bir xil javob");
    assert.ok(o.kirishlar.length >= 3, o.id);
  }
  // Chegara qiymati ham so'raladi: n > 10 sxemasida aynan 10
  assert.ok(L.OQISH.find((o) => o.id === "oqi-shart").kirishlar.some((k) => k[0] === "10"));
  // Sikl ichidagi chiqarish bir necha satr beradi
  const yigib = L.OQISH.find((o) => o.id === "oqi-yigib");
  assert.deepEqual(py.run(S.kodYasa(yigib.sxema), { stdin: ["4"] }).output, ["1", "3", "6", "10"]);
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
  const idlar = new Set(each(L.oqishTask, 25).map((t) => t.asos));
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

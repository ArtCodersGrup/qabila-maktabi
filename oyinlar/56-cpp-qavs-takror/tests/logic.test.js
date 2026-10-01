// 56-o'yin mantiqining testlari. Ishga tushirish (loyiha ildizida):
//   node --test oyinlar/56-cpp-qavs-takror/tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const C = require("../../umumiy/js/cpp.js");
const E = require("../../umumiy/js/cpp/cpp-run.js");

const r = () => Math.random();

test("har misolning chiqishi yadroniki bilan bir xil", () => {
  let soni = 0;
  for (let k = 0; k < 100; k++) {
    for (const f of [L.qavsTask, L.tengTask, L.siklTask, L.yigindiTask]) {
      const t = f(r, null);
      if (!t) continue;
      soni++;
      const natija = E.run(t.kod, { stdin: [] });
      assert.equal(natija.error, null, t.id + ": " + JSON.stringify(natija.error));
      assert.deepEqual(natija.output, t.chiqish, t.id);
    }
  }
  assert.ok(soni > 300, "misollar kam: " + soni);
});

// Qavssiz if: ikkinchi satr shartga tegishli emas
test("qavssiz if: ikkinchi satr har doim bajariladi", () => {
  for (let k = 0; k < 60; k++) {
    const t = L.qavsTask(r, null);
    assert.ok(t.chiqish.includes("tekshirdim"), t.id + ": " + JSON.stringify(t.chiqish));
    assert.ok(!t.kod.includes("if (x > " + "0" + ") {"), "qavs qoʻyilmasin");
    assert.match(t.nega, /Otstup C\+\+ uchun hech narsa anglatmaydi/);
  }
  // Shart yolg'on bo'lgan holat ham chiqsin
  const barchasi = [];
  for (let k = 0; k < 120; k++) barchasi.push(L.qavsTask(r, null).chiqish.length);
  assert.ok(barchasi.includes(1) && barchasi.includes(2), "ikkala holat ham uchrasin");
});

// "=" va "==" — eng ko'p uchraydigan yozuv xatosi
test("bitta = shart ichida tayinlash bo'ladi va shart rost chiqadi", () => {
  let bitta = 0;
  for (let k = 0; k < 200; k++) {
    const t = L.tengTask(r, null);
    if (!t.id.startsWith("teng:bir")) continue;
    bitta++;
    assert.equal(t.chiqish[0], "rost", t.id);
    const nishon = t.id.split(":")[3];
    assert.equal(t.chiqish[1], nishon, t.id + ": x ham oʻzgarishi kerak");
  }
  assert.ok(bitta > 20, "«=» holati kam uchradi: " + bitta);
});

test("sikl: uch xil yurish (oshadi, kamayadi, ikkitadan)", () => {
  const korilgan = new Set();
  for (let k = 0; k < 200; k++) korilgan.add(L.siklTask(r, null).id.split(":")[1]);
  assert.deepEqual([...korilgan].sort(), ["ikki", "kamay", "osha"]);
});

test("yig'ish naqshi: yig'indi, ko'paytma va sanoq to'g'ri hisoblanadi", () => {
  for (let k = 0; k < 100; k++) {
    const t = L.yigindiTask(r, null);
    const n = Number(t.id.split(":")[2]);
    const tur = t.id.split(":")[1];
    const kutilgan = tur === "yigindi" ? (n * (n + 1)) / 2
      : tur === "kopaytma" ? L.ket(1, n, 1).reduce((a, b) => a * b, 1)
        : Math.floor(n / 2);
    assert.equal(t.chiqish[0], String(kutilgan), t.id);
  }
});

// Xato dasturlar HAQIQATAN xato qilishi kerak — aks holda savolning ma'nosi yo'q
test("xato savollari: har dastur haqiqatan notoʻgʻri ishlaydi", () => {
  for (const x of L.XATOLAR) {
    const natija = E.run(C.dastur(x.kod), { stdin: [], maxSteps: 3000 });
    if (x.id === "toxtamaydi") {
      assert.ok(natija.error && /too many steps/.test(natija.error.cppMessage), x.id);
    } else if (x.id === "nuqta-vergul") {
      assert.ok(natija.error && /undeclared identifier 'i'/.test(natija.error.cppMessage), x.id);
    } else if (x.id === "kam") {
      assert.deepEqual(natija.output, ["1 2 3 4 "], x.id + ": 5 gacha chiqarmasligi kerak");
    } else {
      assert.deepEqual(natija.output, ["123 "], x.id + ": bo'shliq faqat oxirida");
    }
  }
  for (let k = 0; k < 40; k++) {
    const t = L.xatoTask(r, null);
    assert.equal(t.variantlar.length, 4, t.id);
    assert.equal(new Set(t.variantlar).size, 4, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
  }
});

test("yozish mashqlari: yechim ishlaydi, bo'sh qolip o'tmaydi", () => {
  for (const y of L.YOZISHLAR) {
    assert.ok(y.sinovlar.length >= 1, y.id);
    assert.equal(C.tekshir(y, y.yechim).ok, true, y.id + ": " + JSON.stringify(C.tekshir(y, y.yechim)));
    assert.equal(C.tekshir(y, L.QOLIP).ok, false, y.id);
  }
  // "eng katta" mashqi manfiy sonlar bilan ham sinaladi: eng = 0 deb boshlagan yechim o'tmaydi
  const eng = L.YOZISHLAR.find((y) => y.id === "eng-katta");
  const nolBilan = C.dastur(["int n;", "cin >> n;", "int eng = 0;", "for (int i = 0; i < n; i++) {",
    "    int x;", "    cin >> x;", "    if (x > eng) eng = x;", "}", C.chiqar("eng")]);
  assert.equal(C.tekshir(eng, nolBilan).ok, false, "manfiy sonlar sinovi yo'q — mashq zaif");
  // "bir marta kam" xatosi ham tutilsin
  const yigindi = L.YOZISHLAR.find((y) => y.id === "yigindi");
  assert.equal(C.tekshir(yigindi, yigindi.yechim.replace("i <= n", "i < n")).ok, false);
});

test("bosqichlar: turlar navbat bilan keladi", () => {
  assert.deepEqual([0, 1].map((n) => L.bosqich1Task(null, n).tur), ["natija", "natija"]);
  assert.deepEqual([0, 1].map((n) => L.bosqich2Task(null, n).tur), ["natija", "natija"]);
  assert.deepEqual([0, 1].map((n) => L.bosqich3Task(null, n).tur), ["xato", "yoz"]);
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
  assert.ok(ns.some((n) => n.id.startsWith("yechim:")));
  assert.equal(new Set(ns.map((n) => n.id)).size, ns.length);
});

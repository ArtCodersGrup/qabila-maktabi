// 41-o'yin mantiqi: ko'paytirish va qo'shish qoidasi, daraxt barglari, kod masalalari.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const S = require("../../umumiy/js/sanash.js");
const K = require("../../umumiy/js/kod.js");

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

// Blokning asosiy da'vosi: formula ro'yxatni sanaydi
test("daraxt barglari soni ko'paytmaga teng va hammasi har xil", () => {
  for (const d of L.DARAXTLAR) {
    const list = L.barglar(d);
    assert.equal(BigInt(list.length), L.daraxtSoni(d), d.id);
    const kalit = list.map((x) => x.join("|"));
    assert.equal(new Set(kalit).size, kalit.length, d.id + ": takror barg bor");
    for (const barg of list) assert.equal(barg.length, d.qadamlar.length, d.id);
  }
});

test("daraxtlar ekranga sig'adi: barglari 12 tadan oshmaydi, qadamlari 3 tagacha", () => {
  for (const d of L.DARAXTLAR) {
    assert.ok(d.qadamlar.length >= 2 && d.qadamlar.length <= 3, d.id);
    assert.ok(L.daraxtSoni(d) <= 12n, d.id + ": " + L.daraxtSoni(d) + " ta barg — ekranga sigʻmaydi");
    for (const q of d.qadamlar) assert.ok(q.elementlar.length >= 2, d.id);
  }
  assert.equal(L.daraxtById("kiyim").id, "kiyim");
  assert.equal(L.daraxtById("yoʻq-narsa").id, "kiyim");
});

test("ko'paytirish savollari: javob ko'paytmaga teng", () => {
  for (const t of each(L.vaTask, 30, 3)) {
    assert.equal(t.tur, "va");
    assert.equal(t.javob, S.kopaytir(t.qiymat));
    assert.ok(t.javob > 1n, t.matn);
    assert.ok(t.hisob.includes("×"), t.hisob);
    assert.ok(t.matn.length > 20);
  }
});

test("VA/YOKI savollari: to'g'ri javob qoidadan, xato javob — boshqa qoidadan", () => {
  for (const t of each(L.qoidaTask, 40, 7)) {
    assert.ok(t.qoida === "va" || t.qoida === "yoki", t.id);
    const kopaytma = S.kopaytir(t.qiymat);
    const yigindi = S.qosh(t.qiymat);
    assert.equal(t.javob, t.qoida === "va" ? kopaytma : yigindi);
    assert.equal(t.xato, t.qoida === "va" ? yigindi : kopaytma);
    // Ikki javob bir xil bo'lsa savolning ma'nosi yo'q (2+2 = 2×2)
    assert.notEqual(t.javob, t.xato, t.matn);
    assert.ok(t.nega.length > 20, t.id);
  }
});

test("har ikki qoidadan ham savol chiqadi", () => {
  const list = each(L.qoidaTask, 40, 13);
  const turlar = new Set(list.map((t) => t.qoida));
  assert.ok(turlar.has("va") && turlar.has("yoki"), [...turlar].join(","));
});

test("kod masalasi: sikl natijasi ko'paytmaga teng", () => {
  for (const t of each(L.kodTask, 20, 5)) {
    assert.equal(t.type, "natija");
    const kutilgan = K.expectedFor(t);
    assert.deepEqual(kutilgan, [String(t.javob)], t.id);
    assert.equal(t.javob, S.kopaytir(t.qiymat));
  }
});

test("namunali yechimlar hamma testdan o'tadi", () => {
  for (const w of L.WRITE) {
    const task = { type: "kod-yoz", what: w.what, solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
    const natija = K.check(task, w.solution);
    assert.equal(natija.ok, true, w.id + ": " + JSON.stringify(natija).slice(0, 200));
  }
});

test("tekshiruv natijaga qaraydi: a*b ham o'tadi, shart matnida sikl talab qilingan", () => {
  const task = L.WRITE[0];
  const t = { type: "kod-yoz", what: task.what, solution: task.solution, tail: task.tail, tests: task.tests.map((stdin) => ({ stdin })) };
  // To'g'ri javob beradi, lekin sanamaydi — shart "sikl bilan" edi; tekshiruv natijaga qaraydi,
  // shuning uchun bu yechim o'tadi. Test shuni qayd etadi: shart matnida talab aytilgan.
  const r = K.check(t, "def sana(a, b):\n    return a * b");
  assert.equal(r.ok, true);
  assert.ok(task.what.includes("Koʻpaytirmasdan"), "shartda talab yozilgan boʻlishi kerak");
  // Butunlay noto'g'ri yechim esa o'tmasligi kerak
  assert.equal(K.check(t, "def sana(a, b):\n    return a + b").ok, false);
});

test("ketma-ket savollar takrorlanmaydi", () => {
  for (const make of [L.vaTask, L.qoidaTask, L.kodTask, L.writeTask]) {
    const list = each(make, 12, 29);
    for (let k = 1; k < list.length; k++) assert.notEqual(list[k].id, list[k - 1].id);
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  const matnlar = [];
  for (const d of L.DARAXTLAR) {
    matnlar.push(d.savol);
    for (const q of d.qadamlar) matnlar.push(q.nom, ...q.elementlar);
  }
  const r = rngFrom(2);
  for (let k = 0; k < 20; k++) {
    matnlar.push(L.vaTask(r, null).matn);
    const q = L.qoidaTask(r, null);
    matnlar.push(q.matn, q.nega);
  }
  for (const w of L.WRITE) matnlar.push(w.what);
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "notoʻgʻri belgi: " + m);
});

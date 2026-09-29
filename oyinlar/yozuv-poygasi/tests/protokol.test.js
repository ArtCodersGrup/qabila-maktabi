// protokol.js testlari: urug'dan bir xil matn, paket ↔ holat, tarmoqqa chiqadigan xabar.
const test = require("node:test");
const assert = require("node:assert/strict");
const PR = require("../js/protokol.js");
const P = require("../js/poyga.js");
const onlayn = require("../../umumiy/js/onlayn.js");

function xona(odam = 3) {
  const s = P.holatYarat({ tur: "words", urug: 4242, jami: 30 });
  ["qizil", "kok", "yashil", "sariq"].slice(0, odam).forEach((q, k) => P.qoshil(s, "b" + k, q));
  return s;
}

test("xabar turlari va yashirin raqam", () => {
  assert.deepEqual(PR.TYPES, ["lobbi", "holat", "kirdi", "qadam"]);
  const id = PR.kimlik();
  assert.match(id, /^[a-z0-9]{6}$/);
  assert.notEqual(PR.kimlik(), PR.kimlik());
});

test("urug': bir xil urug' — hamma qurilmada bir xil matn", () => {
  for (const tur of ["home", "words", "proverb"]) {
    const urug = PR.urugYasa();
    const a = PR.matnYasa(tur, urug);
    const b = PR.matnYasa(tur, urug); // boshqa qurilma
    assert.equal(a, b, tur);
    assert.ok(a.length > 5, tur + ": matn bo'sh emas");
  }
});

test("urug': boshqa urug' — odatda boshqa matn", () => {
  const xil = new Set();
  for (let k = 1; k <= 40; k++) xil.add(PR.matnYasa("words", k * 7919));
  assert.ok(xil.size > 20, "matnlar takrorlanib ketmaydi: " + xil.size);
});

test("urug' yasash: 4–7 xonali son, har safar boshqa", () => {
  const list = new Set();
  for (let k = 0; k < 200; k++) {
    const u = PR.urugYasa();
    assert.ok(Number.isInteger(u) && u > 0 && u < 1e7, String(u));
    list.add(u);
  }
  assert.ok(list.size > 150);
});

test("paket: holat to'liq o'tadi va qaytadi", () => {
  const s = xona(3);
  P.boshla(s, 1000);
  P.qadam(s, "b0", { bel: 30, ms: 20000, cpm: 90, aniq: 97 }, 21000);
  P.qadam(s, "b1", { bel: 12 }, 21000);
  const p = PR.paket(s);
  assert.ok(PR.yaxshiPaket(p));
  const h = PR.holat(p, 50000);
  assert.equal(h.tur, "words");
  assert.equal(h.urug, 4242);
  assert.equal(h.jami, 30);
  assert.equal(h.pogona, s.pogona);
  assert.deepEqual(P.tartib(h).map((x) => x.id), P.tartib(s).map((x) => x.id));
  assert.equal(h.oyinchilar.b0.orin, 1);
  assert.equal(h.oyinchilar.b0.cpm, 90);
  assert.equal(h.oyinchilar.b1.bel, 12);
  assert.equal(h.oyinchilar.b1.pogona, s.oyinchilar.b1.pogona);
  assert.equal(h.boshlandi, true);
  // Tog' sahnasi kutgan maydonlar (chiqib ketish va pauza bu o'yinda yo'q)
  assert.equal(h.oyinchilar.b0.chiqdi, false);
  assert.equal(h.oyinchilar.b0.pauzaGacha, 0);
  assert.equal(h.oyinchilar.b0.qahramon, "qizil");
});

test("paket: o'yin tugagani va g'olib o'tadi", () => {
  const s = xona(2);
  P.boshla(s, 1000);
  P.qadam(s, "b1", { bel: 30, ms: 15000, cpm: 120, aniq: 99 }, 16000);
  P.qadam(s, "b0", { bel: 30, ms: 18000, cpm: 100, aniq: 95 }, 19000);
  P.tugat(s, 20000);
  const h = PR.holat(PR.paket(s), 60000);
  assert.equal(h.tugadi, true);
  assert.deepEqual(P.natija(h).map((r) => r.id), ["b1", "b0"]);
  assert.equal(P.natija(h)[0].cpm, 120);
});

test("yomon paket o'tmaydi", () => {
  const s = xona(2);
  P.boshla(s, 1000);
  const ok = PR.paket(s);
  assert.ok(PR.yaxshiPaket(ok));
  assert.equal(PR.yaxshiPaket(null), false);
  assert.equal(PR.yaxshiPaket({}), false);
  assert.equal(PR.yaxshiPaket(Object.assign({}, ok, { ids: [] })), false);
  assert.equal(PR.yaxshiPaket(Object.assign({}, ok, { bel: [1] })), false, "uzunliklar teng emas");
  assert.equal(PR.yaxshiPaket(Object.assign({}, ok, { tur: "yoq" })), false);
  assert.equal(PR.yaxshiPaket(Object.assign({}, ok, { bel: [-1, 2] })), false);
  assert.equal(PR.yaxshiPaket(Object.assign({}, ok, { ids: new Array(13).fill("x") })), false, "12 tadan ko'p");
  assert.equal(PR.yaxshiPaket(Object.assign({}, ok, { jami: "uzun" })), false);
});

test("tarmoqqa chiqadigan xabar loyiha qoidasidan o'tadi (erkin matn yo'q)", () => {
  const s = xona(4);
  P.boshla(s, 1000);
  P.qadam(s, "b0", { bel: 30, ms: 20000, cpm: 90, aniq: 97 }, 21000);
  const holat = { type: "holat", data: PR.paket(s), t: Date.now(), from: "host" };
  assert.ok(onlayn.validMessage(holat, PR.TYPES), "holat paketi");
  const qadam = { type: "qadam", data: { bel: 12, ms: 0, cpm: 0, aniq: 0 }, t: Date.now(), from: "abc123" };
  assert.ok(onlayn.validMessage(qadam, PR.TYPES));
  const kirdi = { type: "kirdi", data: { qah: "qizil" }, t: Date.now(), from: "abc123" };
  assert.ok(onlayn.validMessage(kirdi, PR.TYPES));
  assert.ok(onlayn.validMessage({ type: "lobbi", data: PR.lobbi(s), t: 1, from: "host" }, PR.TYPES));
  // Matn hech qachon yuborilmaydi
  assert.equal(onlayn.validMessage({ type: "holat", data: { matn: "qora qush" }, t: 1, from: "host" }, PR.TYPES), false);
});

test("lobbi: kim kirgani va qaysi rangni tanlagani", () => {
  const s = xona(3);
  const l = PR.lobbi(s);
  assert.deepEqual(l.ids, ["b0", "b1", "b2"]);
  assert.deepEqual(l.qah, ["qizil", "kok", "yashil"]);
});

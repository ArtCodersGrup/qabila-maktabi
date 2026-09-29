// poyga.js testlari: xona holati, qadam va pog'ona hisobi, tartib, natija.
// Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../js/poyga.js");
const T = require("../../tog/js/tog.js");

const JAMI = 40; // matndagi belgilar soni

function xona(odam = 3, jami = JAMI) {
  const s = P.holatYarat({ tur: "words", urug: 777, jami });
  const ranglar = ["qizil", "kok", "yashil", "sariq", "pushti"];
  for (let k = 0; k < odam; k++) P.qoshil(s, "b" + k, ranglar[k]);
  return s;
}

test("turlar: har biriga matn turi va tog' mos keladi", () => {
  assert.equal(P.TURLAR.length, 3);
  for (const t of P.TURLAR) {
    assert.ok(T.TOGLAR.find((x) => x.id === t.tog), t.id + ": tog' bor");
    assert.ok(t.nom && typeof t.nom === "string");
    assert.ok(t.pogona > 0);
  }
  assert.deepEqual(P.TURLAR.map((t) => t.id), ["home", "words", "proverb"]);
});

test("xona: qo'shilish, rang band bo'lishi va joy chegarasi", () => {
  const s = P.holatYarat({ tur: "home", urug: 1, jami: JAMI });
  assert.equal(P.qoshil(s, "a", "qizil"), true);
  assert.equal(P.qoshil(s, "b", "qizil"), false, "band rangni ikkinchi bola ololmaydi");
  assert.equal(P.qoshil(s, "b", "kok"), true);
  assert.deepEqual(P.boshRanglar(s).includes("qizil"), false);
  assert.equal(Object.keys(s.oyinchilar).length, 2);
  // 12 tadan ortiq kirmaydi
  const big = P.holatYarat({ tur: "home", urug: 1, jami: JAMI });
  T.QAHRAMONLAR.forEach((q, k) => P.qoshil(big, "p" + k, q.id));
  assert.equal(Object.keys(big.oyinchilar).length, P.MAX_ODAM);
  assert.equal(P.qoshil(big, "yana", "qizil"), false);
});

test("xona: qayta kirgan bola joyini yo'qotmaydi", () => {
  const s = xona(2);
  P.boshla(s, 1000);
  P.qadam(s, "b0", { bel: 20 }, 2000);
  assert.equal(P.qoshil(s, "b0", "qizil"), true, "o'sha rang bilan qaytadi");
  assert.equal(s.oyinchilar.b0.bel, 20, "yozgani saqlanadi");
});

test("chiqarib yuborish: o'yinchi ro'yxatdan chiqadi, rangi bo'shaydi", () => {
  const s = xona(2);
  assert.equal(P.chiqar(s, "b0"), true);
  assert.equal(s.oyinchilar.b0, undefined);
  assert.ok(P.boshRanglar(s).includes("qizil"));
  assert.equal(P.chiqar(s, "yoq"), false);
});

test("pog'ona: yozilgan ulush pog'onaga aylanadi", () => {
  assert.equal(P.pogonaOf(0, 40, 20), 0);
  assert.equal(P.pogonaOf(20, 40, 20), 10);
  assert.equal(P.pogonaOf(40, 40, 20), 20);
  assert.equal(P.pogonaOf(39, 40, 20), 19, "to'liq yozmaguncha cho'qqiga chiqmaydi");
  assert.equal(P.pogonaOf(0, 0, 20), 0, "matn bo'sh bo'lsa — 0");
});

test("qadam: o'yin boshlanmagan bo'lsa qabul qilinmaydi", () => {
  const s = xona(2);
  assert.equal(P.qadam(s, "b0", { bel: 5 }, 1000), false);
  P.boshla(s, 1000);
  assert.equal(P.qadam(s, "b0", { bel: 5 }, 1100), true);
  assert.equal(s.oyinchilar.b0.bel, 5);
  assert.equal(P.qadam(s, "yoq", { bel: 5 }, 1100), false, "begona o'yinchi");
});

test("qadam: orqaga qaytmaydi (kechikkan xabar hisobga olinmaydi)", () => {
  const s = xona(2);
  P.boshla(s, 1000);
  P.qadam(s, "b0", { bel: 20 }, 1500);
  assert.equal(P.qadam(s, "b0", { bel: 12 }, 1600), false);
  assert.equal(s.oyinchilar.b0.bel, 20);
});

test("cho'qqi: tugaganlarga kelish tartibida o'rin beriladi", () => {
  const s = xona(3);
  P.boshla(s, 1000);
  P.qadam(s, "b1", { bel: JAMI, ms: 30000, cpm: 80, aniq: 96 }, 31000);
  P.qadam(s, "b0", { bel: JAMI, ms: 42000, cpm: 57, aniq: 91 }, 43000);
  assert.equal(s.oyinchilar.b1.orin, 1);
  assert.equal(s.oyinchilar.b0.orin, 2);
  assert.equal(s.oyinchilar.b1.cpm, 80);
  assert.equal(s.oyinchilar.b2.orin, 0);
  assert.equal(s.oyinchilar.b1.pogona, s.pogona, "cho'qqida turadi");
  // Ikkinchi marta tugatib, o'rnini yaxshilay olmaydi
  P.qadam(s, "b1", { bel: JAMI, ms: 1000, cpm: 999, aniq: 100 }, 44000);
  assert.equal(s.oyinchilar.b1.orin, 1);
  assert.equal(s.oyinchilar.b1.cpm, 80);
});

test("tartib: avval tugaganlar (o'rni bo'yicha), keyin qolganlar (belgisi bo'yicha)", () => {
  const s = xona(4);
  P.boshla(s, 1000);
  P.qadam(s, "b2", { bel: JAMI, ms: 20000, cpm: 120, aniq: 98 }, 21000);
  P.qadam(s, "b0", { bel: JAMI, ms: 25000, cpm: 96, aniq: 95 }, 26000);
  P.qadam(s, "b3", { bel: 30 }, 27000);
  P.qadam(s, "b1", { bel: 10 }, 27000);
  assert.deepEqual(P.tartib(s).map((p) => p.id), ["b2", "b0", "b3", "b1"]);
});

test("hamma yetib olguncha: oxiri faqat hamma cho'qqida bo'lganda", () => {
  const s = xona(2);
  P.boshla(s, 1000);
  assert.equal(P.hammasiTugadi(s), false);
  P.qadam(s, "b0", { bel: JAMI, ms: 1000, cpm: 60, aniq: 90 }, 2000);
  assert.equal(P.hammasiTugadi(s), false, "bittasi hali yo'lda");
  P.qadam(s, "b1", { bel: JAMI, ms: 3000, cpm: 40, aniq: 92 }, 4000);
  assert.equal(P.hammasiTugadi(s), true);
  P.tugat(s, 5000);
  assert.equal(s.tugadi, true);
});

test("hamma chiqib ketsa — o'yin tugamagan hisoblanadi", () => {
  const s = P.holatYarat({ tur: "home", urug: 1, jami: JAMI });
  P.boshla(s, 1000);
  assert.equal(P.hammasiTugadi(s), false, "hech kim yo'q — tugadi demaymiz");
});

test("natija: o'rin, tezlik va aniqlik qatorlari", () => {
  const s = xona(3);
  P.boshla(s, 1000);
  P.qadam(s, "b0", { bel: JAMI, ms: 30000, cpm: 80, aniq: 97 }, 31000);
  P.qadam(s, "b1", { bel: 24 }, 32000);
  const rows = P.natija(s);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[0], { id: "b0", qahramon: "qizil", orin: 1, bel: JAMI, ms: 30000, cpm: 80, aniq: 97, tugadi: true });
  assert.equal(rows[1].tugadi, false);
  assert.equal(rows[1].bel, 24);
});

test("yangi poyga: o'yinchilar qoladi, yo'l boshidan boshlanadi", () => {
  const s = xona(3);
  P.boshla(s, 1000);
  P.qadam(s, "b0", { bel: JAMI, ms: 1000, cpm: 60, aniq: 99 }, 2000);
  P.qayta(s, { tur: "proverb", urug: 42, jami: 50 }, 9000);
  assert.equal(s.tur, "proverb");
  assert.equal(s.urug, 42);
  assert.equal(s.jami, 50);
  assert.equal(s.pogona, P.TURLAR.find((t) => t.id === "proverb").pogona);
  assert.equal(Object.keys(s.oyinchilar).length, 3, "bolalar xonada qoladi");
  assert.equal(s.oyinchilar.b0.bel, 0);
  assert.equal(s.oyinchilar.b0.orin, 0);
  assert.equal(s.tugadi, false);
  assert.equal(s.boshlandi, true, "qayta boshlaganda darhol yo'lga chiqadi");
});

test("xonadan chiqib ketgan bola kutilmaydi", () => {
  const s = xona(3);
  P.boshla(s, 1000);
  P.qadam(s, "b0", { bel: JAMI, ms: 9000, cpm: 60, aniq: 98 }, 10000);
  P.qadam(s, "b1", { bel: JAMI, ms: 9500, cpm: 58, aniq: 97 }, 11000);
  // b2 hali yo'lda va xonada bor — kutamiz
  assert.equal(P.hammasiTugadi(s, ["b0", "b1", "b2"]), false);
  assert.equal(P.hammasiTugadi(s), false);
  // b2 xonadan chiqib ketdi — qolganlar uni kutib qolmaydi
  assert.equal(P.hammasiTugadi(s, ["b0", "b1"]), true);
  // Hech kim chiqmagan bo'lsa — hali tugamaydi
  const t = xona(2);
  P.boshla(t, 1000);
  assert.equal(P.hammasiTugadi(t, []), false, "hamma chiqib ketdi, hech kim yetib bormadi");
});

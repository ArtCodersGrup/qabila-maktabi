// generator.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const G = require("../js/generator.js");
const D = require("../js/data.js");

// Takrorlanadigan tasodif: har chaqiruvda ro'yxatdagi keyingi son (0 dan 1 gacha)
const seq = (...values) => { let k = 0; return () => values[k++ % values.length]; };

test("pickFrom: rng bo'yicha ro'yxatdan element tanlaydi", () => {
  const list = ["a", "b", "c", "d"];
  assert.equal(G.pickFrom(list, null, seq(0)), "a");
  assert.equal(G.pickFrom(list, null, seq(0.99)), "d");
  assert.equal(G.pickFrom(list, null, seq(0.5)), "c");
});

test("pickFrom: prev bilan bir xil elementni qaytarmaydi", () => {
  const list = ["a", "b", "c"];
  // rng 0 -> pool ["b","c"] dan 0-indeks -> "b" (a chetlatilgan)
  assert.equal(G.pickFrom(list, "a", seq(0)), "b");
});

test("pickFrom: ro'yxatda bitta element bo'lsa, prev bilan bir xil bo'lsa ham qaytaradi", () => {
  assert.equal(G.pickFrom(["yagona"], "yagona", seq(0)), "yagona");
});

test("pickService / pickCompany: haqiqiy ro'yxatlardan tanlaydi, prevdan farqli", () => {
  const s = G.pickService(null, seq(0));
  assert.ok(D.SERVICES.includes(s));
  const s2 = G.pickService(s, seq(0));
  assert.notEqual(s2, s);

  const c = G.pickCompany(null, seq(0));
  assert.ok(D.COMPANIES.includes(c));
  const c2 = G.pickCompany(c, seq(0));
  assert.notEqual(c2, c);
});

test("buildSentence: '{Kompaniya} uchun {Xizmat} qilish' jumlasini yasaydi", () => {
  assert.equal(G.buildSentence("Red24", "Sotuvchi bot"), "Red24 uchun Sotuvchi bot qilish");
});

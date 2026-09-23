// data.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/data.js");

test("SERVICES: kamida 50 ta, bo'sh emas, takror yo'q", () => {
  assert.ok(D.SERVICES.length >= 50, `${D.SERVICES.length} ta topildi`);
  for (const s of D.SERVICES) {
    assert.equal(typeof s, "string");
    assert.ok(s.trim().length > 0, "bo'sh element bor");
  }
  assert.equal(new Set(D.SERVICES).size, D.SERVICES.length, "takrorlanuvchi element bor");
});

test("COMPANIES: kamida 30 ta, bo'sh emas, takror yo'q", () => {
  assert.ok(D.COMPANIES.length >= 30, `${D.COMPANIES.length} ta topildi`);
  for (const c of D.COMPANIES) {
    assert.equal(typeof c, "string");
    assert.ok(c.trim().length > 0, "bo'sh element bor");
  }
  assert.equal(new Set(D.COMPANIES).size, D.COMPANIES.length, "takrorlanuvchi element bor");
});

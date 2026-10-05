// 58-o'yin: xabar bo'laklari — bo'laklash, aralashtirish, yo'qolgan konvert va mashq savollari.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
// make(r, prev, n, tier) dan ketma-ket vazifalar
function each(make, count, tier, seed) {
  const r = rngFrom(seed || 58);
  const out = [];
  let prev = null;
  for (let k = 0; k < count; k++) {
    prev = make(r, prev, tier);
    out.push(prev);
  }
  return out;
}

test("belgilar: Oʻ va Gʻ — bitta belgi, bo'sh joy ham belgi", () => {
  assert.deepEqual(L.belgilar("DOʻST"), ["D", "Oʻ", "S", "T"]);
  assert.deepEqual(L.belgilar("TOGʻ"), ["T", "O", "Gʻ"]);
  assert.equal(L.uzunlik("SALOM DOʻSTIM"), 12);
  assert.equal(L.korinish("A B"), "A␣B");
});

test("bo'laklash: raqam va jami, qoldiqli holatda oxirgisi to'la emas", () => {
  const k = L.konvertlar("SALOM", 2);
  assert.deepEqual(k, [{ raqam: 1, jami: 3, matn: "SA" }, { raqam: 2, jami: 3, matn: "LO" }, { raqam: 3, jami: 3, matn: "M" }]);
  assert.equal(L.yigish(k), "SALOM");
  assert.equal(L.nechta("MAKTAB", 3), 2);
  assert.equal(L.nechta("MAKTAB", 4), 2);
  assert.equal(L.nechta("SALOM DOʻSTIM", 5), 3);
  assert.equal(L.hisobYoz(12, 5), "12 : 5 = 2, yana 2 ta belgi ortadi → 3 ta konvert");
  assert.equal(L.hisobYoz(6, 3), "6 : 3 = 2 → 2 ta konvert");
  for (const x of L.SOZLAR.concat(L.IBORALAR)) {
    for (const s of [2, 3, 4, 5, 6]) assert.equal(L.yigish(L.konvertlar(x, s)), x, `${x} / ${s}`);
  }
});

test("aralash tartib hech qachon asl tartibda qolmaydi", () => {
  const r = rngFrom(3);
  for (let k = 0; k < 200; k++) {
    const list = [1, 2, 3, 4].slice(0, 2 + (k % 3));
    assert.notDeepEqual(L.aralashTartib(list, r), list);
  }
});

test("nechta konvert: tier 0 qoldiqsiz, tier 1 qoldiqli, tier 2 ibora; javob to'g'ri", () => {
  for (const t of each(L.nechtaTask, 80, 0)) {
    assert.equal(t.L % t.k, 0, t.id);
    assert.equal(t.javob, t.L / t.k);
  }
  for (const t of each(L.nechtaTask, 80, 1)) assert.notEqual(t.L % t.k, 0, t.id);
  for (const t of each(L.nechtaTask, 80, 2)) {
    assert.ok(t.xabar.includes(" "), t.id);
    assert.ok(t.k >= 4 && t.k <= 6);
    assert.equal(t.javob, Math.ceil(t.L / t.k));
    assert.match(t.matn, /boʻsh joy ham belgi/);
  }
});

const variantli = (tasks) => {
  for (const t of tasks) {
    assert.equal(t.variantlar.length, 4, t.id);
    assert.equal(new Set(t.variantlar).size, 4, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    assert.ok(t.ishora && t.ishora !== String(t.javob), "maslahat javobni aytmaydi");
  }
};

test("variantli savollar: 4 ta, takrorlanmaydi, javob ichida", () => {
  for (const tier of [0, 1, 2]) {
    variantli(each(L.ichidaTask, 60, tier));
    variantli(each(L.oqishTask, 60, tier));
    variantli(each(L.nechanchiTask, 60, tier));
    variantli(each(L.holatTask, 60, tier));
  }
});

test("N-konvertda: javob haqiqatan N-chi bo'lak", () => {
  for (const t of each(L.ichidaTask, 100, 1)) {
    assert.equal(t.javob, L.korinish(L.konvertlar(t.xabar, t.k)[t.n - 1].matn));
  }
});

test("xabar nima deydi: kelgan tartib asl emas, raqam bo'yicha yig'ilsa — xabar", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.oqishTask, 60, tier)) {
      const raqamlar = t.keldi.map((x) => x.raqam);
      assert.notDeepEqual(raqamlar, raqamlar.slice().sort((a, b) => a - b), t.id);
      assert.equal(L.yigish(t.keldi.slice().sort((a, b) => a.raqam - b.raqam)), t.xabar);
      assert.equal(t.keldi.length, tier === 0 ? 3 : tier === 1 ? 4 : t.keldi.length);
      if (tier === 2) assert.ok(t.keldi.length >= 5);
    }
  }
});

test("yo'qolgan konvert: javob — haqiqatan kelmagan yagona raqam", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.yoqTask, 80, tier)) {
      assert.equal(t.keldi.length, t.jami - 1);
      assert.ok(!t.keldi.includes(t.javob));
      assert.ok(t.javob >= 1 && t.javob <= t.jami);
      assert.ok(t.jami >= L.JAMI[tier][0] && t.jami <= L.JAMI[tier][1], `tier ${tier}: ${t.jami}`);
      if (tier === 0) assert.deepEqual(t.keldi, t.keldi.slice().sort((a, b) => a - b), "tier 0 — tartibda");
    }
  }
});

test("hammasi keldimi: holat konvertlar ro'yxatiga mos", () => {
  const sanoq = { hammasi: 0, bitta: 0, ikki: 0, takror: 0 };
  for (const t of each(L.holatTask, 200, 1)) {
    sanoq[t.holat]++;
    const xil = new Set(t.keldi);
    const yoq = t.jami - xil.size;
    if (t.holat === "hammasi") assert.ok(yoq === 0 && t.keldi.length === t.jami);
    if (t.holat === "bitta") assert.equal(yoq, 1);
    if (t.holat === "ikki") assert.equal(yoq, 2);
    if (t.holat === "takror") assert.ok(yoq === 0 && t.keldi.length === t.jami + 1);
    assert.equal(t.javob, L.HOLAT[t.holat]);
  }
  for (const [k, n] of Object.entries(sanoq)) assert.ok(n > 20, `${k} holati ham chiqadi`);
});

test("qayta so'rash: ikki marta kelgan konvert sanalmaydi", () => {
  for (const t of each(L.qaytaTask, 60, 2)) {
    assert.equal(t.tur, "qayta");
    assert.equal(new Set(t.keldi).size, t.jami - 2);
    assert.equal(t.keldi.length, t.jami - 1);
    for (const y of t.yoqlar) assert.ok(!t.keldi.includes(y));
  }
  assert.equal(L.qaytaTask(rngFrom(1), null, 1).tur, "yoq", "tier < 2 da oddiy savol");
});

test("ketma-ket bir xil misol chiqmaydi va bosqich navbati aylanadi", () => {
  for (const make of [L.nechtaTask, L.ichidaTask, L.oqishTask, L.yoqTask, L.holatTask]) {
    const list = each(make, 60, 1);
    for (let i = 1; i < list.length; i++) assert.notEqual(list[i].id, list[i - 1].id);
  }
  const r = rngFrom(9);
  assert.deepEqual([0, 1, 2].map((n) => L.bosqich1Task(r, null, n, 0).tur), ["nechta", "ichida", "nechta"]);
  assert.deepEqual([0, 1, 2].map((n) => L.bosqich2Task(r, null, n, 0).tur), ["oqish", "nechanchi", "oqish"]);
  assert.deepEqual([0, 1, 2].map((n) => L.bosqich3Task(r, null, n, 2).tur), ["yoq", "holat", "qayta"]);
});

// 44-o'yin mantiqi: Paskal uchburchagi — har katak C(n,k) ga teng bo'lishi kerak.
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
  const r = rngFrom(seed || 44);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

// O'yinning asosiy da'vosi: uchburchakdagi har son — C(n,k)
test("har katak C(n,k) ga teng, chekkalari 1, simmetrik", () => {
  for (let n = 0; n < L.JADVAL.length; n++) {
    assert.equal(L.JADVAL[n].length, n + 1, "qator " + n);
    assert.equal(L.katak(n, 0), 1n);
    assert.equal(L.katak(n, n), 1n);
    for (let k = 0; k <= n; k++) {
      assert.equal(L.katak(n, k), S.C(n, k), `katak(${n},${k})`);
      assert.equal(L.katak(n, k), L.katak(n, n - k), "simmetriya");
    }
  }
});

test("har katak tepasidagi ikki sonning yig'indisi", () => {
  for (let n = 1; n < L.JADVAL.length; n++) {
    for (let k = 0; k <= n; k++) {
      const [chap, ong] = L.tepa(n, k);
      const yigindi = (chap || 0n) + (ong || 0n);
      assert.equal(L.katak(n, k), yigindi, `${n},${k}: ${chap} + ${ong}`);
    }
  }
  // Chekkada faqat bitta tepa bor
  assert.deepEqual(L.tepa(4, 0), [null, 1n]);
  assert.deepEqual(L.tepa(4, 4), [1n, null]);
});

test("qator yig'indisi 2^n", () => {
  for (let n = 0; n < L.JADVAL.length; n++) assert.equal(L.qatorYigindi(n), 2n ** BigInt(n), "qator " + n);
});

test("uchburchak ekranga sig'adi: 9 ta qator, sonlar 4 xonadan oshmaydi", () => {
  assert.equal(L.JADVAL.length, L.QATOR_SONI + 1);
  for (const qator of L.JADVAL) {
    for (const x of qator) assert.ok(String(x).length <= 4, "juda uzun son: " + x);
  }
});

test("katak savoli: chekka emas, javob tepasidagi ikkitadan chiqadi", () => {
  for (const t of each(L.katakTask, 30, 3)) {
    assert.ok(t.k > 0 && t.k < t.n, `${t.n},${t.k} chekkada`);
    assert.equal(t.chap + t.ong, t.javob, t.hisob);
    assert.equal(t.javob, S.C(t.n, t.k));
  }
});

test("o'qish savoli: javob C(n,k), qator va son 0 dan sanaladi", () => {
  for (const t of each(L.oqishTask, 30, 7)) {
    assert.equal(t.javob, S.C(t.n, t.k), t.matn);
    assert.ok(t.k >= 0 && t.k <= t.n);
    assert.ok(t.matn.includes("C(" + t.n + ", " + t.k + ")"), t.matn);
  }
});

test("yig'indi savoli: javob 2^n", () => {
  for (const t of each(L.yigindiTask, 20, 11)) {
    assert.equal(t.javob, 2n ** BigInt(t.n), t.matn);
    assert.ok(t.hisob.startsWith("2^" + t.n), t.hisob);
  }
});

test("kod masalasi: dastur qatorni ro'yxat qilib chiqaradi", () => {
  for (const t of each(L.kodTask, 16, 5)) {
    assert.deepEqual(K.expectedFor(t), [t.kutilgan], t.id);
    assert.equal(t.kutilgan, "[" + L.JADVAL[t.n].join(", ") + "]");
    // Javob son emas, ro'yxat satri — "javob" maydoni bo'lmasligi kerak
    assert.equal(t.javob, undefined, t.id);
  }
});

test("namunali yechimlar hamma testdan o'tadi", () => {
  for (const w of L.WRITE) {
    const task = { type: "kod-yoz", what: w.what, solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
    assert.equal(K.check(task, w.solution).ok, true, w.id);
  }
});

test("tipik xato yechimlar o'tmaydi", () => {
  const w = L.WRITE[0];
  const task = { type: "kod-yoz", what: w.what, solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
  // Oxiriga 1 qo'shishni unutish
  assert.equal(K.check(task, "def qator(n):\n    a = [1]\n    for i in range(n):\n        yangi = [1]\n        for j in range(len(a) - 1):\n            yangi.append(a[j] + a[j + 1])\n        a = yangi\n    return a").ok, false);
  // Hamma qator uchun [1] qaytarish
  assert.equal(K.check(task, "def qator(n):\n    return [1]").ok, false);
});

test("xossalar ro'yxati to'g'ri va to'liq", () => {
  assert.equal(L.XOSSALAR.length, 5);
  for (const x of L.XOSSALAR) assert.ok(x.nom.length > 5 && x.izoh.length > 5, x.id);
  // Uchinchi qiyshiq qator haqiqatan juftliklar soni (43-o'yinga ulanish)
  for (let n = 2; n <= 8; n++) assert.equal(L.katak(n, 2), S.C(n, 2));
  assert.deepEqual([2, 3, 4, 5].map((n) => Number(L.katak(n, 2))), [1, 3, 6, 10]);
});

test("ketma-ket savollar takrorlanmaydi", () => {
  for (const make of [L.katakTask, L.oqishTask, L.yigindiTask, L.kodTask, L.writeTask]) {
    const list = each(make, 12, 23);
    for (let k = 1; k < list.length; k++) assert.notEqual(list[k].id, list[k - 1].id);
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  const matnlar = [];
  const r = rngFrom(9);
  for (let k = 0; k < 20; k++) {
    matnlar.push(L.katakTask(r, null).nega, L.oqishTask(r, null).matn, L.yigindiTask(r, null).matn, L.yigindiTask(r, null).nega);
  }
  for (const x of L.XOSSALAR) matnlar.push(x.nom, x.izoh);
  for (const w of L.WRITE) matnlar.push(w.what);
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "notoʻgʻri belgi: " + m);
});

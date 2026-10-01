// 40-o'yin mantiqi: qadamlarni o'lchash, o'sish nisbati va O(n) sinflari.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const py = require("../../umumiy/js/python/python.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const each = (make, n, seed) => {
  const r = rngFrom(seed || 40);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("har namuna kodi xatosiz ishlaydi va natija chiqaradi", () => {
  for (const nam of L.NAMUNALAR) {
    for (const n of [10, 20]) {
      const r = py.run(nam.kod(n), { maxSteps: 3000000 });
      assert.equal(r.error, null, nam.nom + " (n=" + n + ") xato berdi: " + (r.error && r.error.message));
      assert.ok(r.out.trim().length > 0, nam.nom + " hech narsa chiqarmadi");
    }
  }
});

// O'yinning asosiy da'vosi: o'lchov sinfni o'zi ko'rsatadi
test("o'lchangan nisbat har namunaning sinfini to'g'ri beradi", () => {
  for (const nam of L.NAMUNALAR) {
    const olchov = L.olchovlar(nam, [10, 20, 40, 80]);
    const topildi = L.sinfniTop(L.nisbat(olchov));
    assert.equal(topildi, nam.sinf, nam.nom + ": nisbat " + L.nisbat(olchov).toFixed(2) + " → " + topildi);
  }
});

test("o'lchov qadamlari n oshgani sari kamaymaydi", () => {
  for (const nam of L.NAMUNALAR) {
    const olchov = L.olchovlar(nam, [10, 20, 40]);
    assert.equal(olchov.length, 3);
    for (let k = 1; k < olchov.length; k++) {
      assert.ok(olchov[k].qadam >= olchov[k - 1].qadam, nam.nom + " qadami kamaydi");
      assert.ok(olchov[k].n > olchov[k - 1].n);
    }
  }
});

test("O(1) namunalarida n o'zgarsa ham qadam o'zgarmaydi", () => {
  for (const nam of L.NAMUNALAR.filter((x) => x.sinf === "1")) {
    const olchov = L.olchovlar(nam, [10, 40, 160]);
    const birinchi = olchov[0].qadam;
    for (const o of olchov) assert.equal(o.qadam, birinchi, nam.nom);
  }
});

test("nisbat oxirgi ikki o'lchovdan hisoblanadi", () => {
  assert.equal(L.nisbat([{ n: 10, qadam: 50 }, { n: 20, qadam: 100 }]), 2);
  assert.equal(L.nisbat([{ n: 10, qadam: 5 }, { n: 20, qadam: 50 }, { n: 40, qadam: 200 }]), 4);
  assert.equal(L.nisbat([{ n: 10, qadam: 7 }]), 1);
  assert.equal(L.nisbat([{ n: 10, qadam: 0 }, { n: 20, qadam: 9 }]), 1);
});

test("sinfniTop chegaralari", () => {
  assert.equal(L.sinfniTop(1), "1");
  assert.equal(L.sinfniTop(1.05), "1");
  assert.equal(L.sinfniTop(1.13), "log");
  assert.equal(L.sinfniTop(1.5), "log");
  assert.equal(L.sinfniTop(1.96), "n");
  assert.equal(L.sinfniTop(2.4), "n");
  assert.equal(L.sinfniTop(3.95), "n2");
  assert.equal(L.sinfniTop(8), "n2");
});

test("har sinfning nisbati o'zi aytgan sinfga qaytadi", () => {
  for (const s of L.SINFLAR) assert.equal(L.sinfniTop(s.nisbat), s.id, s.nom);
});

test("bashorat savoli: ko'rinadigan ikki o'lchov, javob o'lchangan natijaga mos", () => {
  for (const t of each(L.bashoratTask, 24, 3)) {
    assert.equal(t.tur, "bashorat");
    assert.equal(t.korinadigan.length, 2);
    assert.ok(L.BASHORAT.some((b) => b.id === t.javob), t.id + " javobi ro'yxatda yo'q");
    const nisbat = t.yashirin.qadam / t.korinadigan[1].qadam;
    const kutilgan = { teng: "1", ozgina: "log", ikki: "n", tort: "n2" }[t.javob];
    assert.equal(L.sinfniTop(nisbat), kutilgan, t.id + ": nisbat " + nisbat.toFixed(2));
    assert.equal(t.yashirin.n, t.korinadigan[1].n * 2);
  }
});

test("sinf savoli: to'g'ri javob o'lchovdan chiqadi", () => {
  for (const t of each(L.sinfTask, 24, 11)) {
    assert.equal(t.tur, "sinf");
    assert.equal(t.olchov.length, 4);
    assert.ok(L.SINFLAR.some((s) => s.id === t.javob));
    assert.equal(L.sinfniTop(t.nisbat), t.javob, t.id);
    assert.equal(t.javob, t.namuna.sinf);
  }
});

test("hisob savoli: 2n uchun javob qoida bo'yicha", () => {
  for (const t of each(L.hisobTask, 24, 5)) {
    assert.equal(t.tur, "hisob");
    assert.equal(t.yangiN, t.n * 2);
    assert.equal(t.javob, t.qadam * t.sinf.nisbat);
    assert.ok(Number.isInteger(t.javob), t.id + " javobi butun emas");
    if (t.sinf.id === "1") assert.equal(t.javob, t.qadam);
    if (t.sinf.id === "n") assert.equal(t.javob, t.qadam * 2);
    if (t.sinf.id === "n2") assert.equal(t.javob, t.qadam * 4);
  }
});

test("amaliy savol: to'g'ri javob tanlovlar ichida va izoh bor", () => {
  for (const t of each(L.amaliyTask, 20, 7)) {
    assert.equal(t.tur, "amaliy");
    assert.equal(t.tanlovlar.length, 2);
    assert.ok(t.tanlovlar.some((x) => x.id === t.javob), t.id + " javobi tanlovlarda yo'q");
    assert.ok(t.savol.length > 10 && t.nega.length > 10, t.id);
  }
});

test("ketma-ket savollar takrorlanmaydi", () => {
  for (const make of [L.bashoratTask, L.sinfTask, L.hisobTask, L.amaliyTask]) {
    const list = each(make, 12, 23);
    for (let k = 1; k < list.length; k++) assert.notEqual(list[k].id, list[k - 1].id);
  }
});

test("sinflar va namunalar ro'yxati butun", () => {
  const sinfIds = L.SINFLAR.map((s) => s.id);
  assert.equal(new Set(sinfIds).size, sinfIds.length);
  const namIds = L.NAMUNALAR.map((n) => n.id);
  assert.equal(new Set(namIds).size, namIds.length);
  for (const nam of L.NAMUNALAR) {
    assert.ok(sinfIds.includes(nam.sinf), nam.nom);
    // Bolaga ko'rinadigan qisqa kod: "n" belgisi bilan, o'lchov esa haqiqiy kodda
    assert.ok(nam.korsat && nam.korsat.includes("n"), nam.nom + " uchun korsat yo'q");
  }
  for (const s of L.SINFLAR) assert.ok(L.NAMUNALAR.some((n) => n.sinf === s.id), s.nom + " uchun namuna yo'q");
  assert.equal(L.sinfById("n").nom, "O(n)");
  assert.equal(L.namunaById("pufak").sinf, "n2");
});

// QOIDALAR §7: to'g'ri o'zbek harflari — ' va ' emas, ʻ va ʼ
test("ko'rinadigan matnlarda to'g'ri tutuq belgisi ishlatilgan", () => {
  const matnlar = [];
  for (const s of L.SINFLAR) matnlar.push(s.nom, s.qisqa, s.izoh);
  for (const n of L.NAMUNALAR) matnlar.push(n.nom);
  for (const b of L.BASHORAT) matnlar.push(b.nom);
  for (const v of L.VAZIFALAR) {
    matnlar.push(v.savol, v.nega);
    for (const t of v.tanlovlar) matnlar.push(t.nom);
  }
  for (const h of L.HISOB) matnlar.push(h.nom);
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "noto'g'ri belgi: " + m);
});

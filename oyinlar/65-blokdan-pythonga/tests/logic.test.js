// 65-o'yin «Bloklardan Pythonga»: vazifa generatori va bloklar ↔ Python mosligi.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const B = require("../../umumiy/js/blok.js");
const D = require("../../umumiy/js/dastur.js");
const py = require("../../umumiy/js/python/python.js");

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Python matni talqinchimizda bloklar bilan bir xil yo'l yuradi
function pythonMos(f, dastur, fn) {
  const r = B.bajar(f, dastur, { fn });
  const t = B.pyTashqi(f);
  const kod = B.pythonMatn(dastur, fn);
  py.run(kod, { tashqi: t.tashqi, maxSteps: 200000 });
  const n = t.natija(false);
  assert.equal(n.status, r.status, kod);
  assert.deepEqual(n.path, r.path, kod);
  return r;
}

function maydonChegara(f) {
  assert.ok(f.w <= 8 && f.h <= 6, "maydon " + f.w + "x" + f.h);
  assert.ok(D.inside(f, f.robot));
  assert.ok(!D.isWall(f, f.robot) && !D.isWall(f, f.goal));
}

// Har bosqich × tier: 200 ta vazifa ketma-ket (prev bilan)
function har(bosqich, tekshir) {
  for (const tier of [0, 1, 2]) {
    const rng = mulberry(1000 * tier + bosqich.length);
    let prev = null;
    for (let k = 0; k < 200; k++) {
      const level = L.yasa(bosqich, prev, rng, tier);
      assert.ok(level.id, "id bor");
      if (prev) assert.notEqual(level.id, prev.id, "ketma-ket bir xil vazifa");
      assert.ok(!level.id.startsWith("z-"), "zaxiraga tushmasin");
      maydonChegara(level.f);
      tekshir(level, tier);
      prev = level;
    }
  }
}

test("1-bosqich «Oʻqi»: javob — boshlangʻich katak emas, status end, Python bilan bir xil", () => {
  har("oqi", (l) => {
    const r = pythonMos(l.f, l.dastur, l.fn);
    assert.equal(r.status, "end");
    assert.deepEqual(r.at, l.javob);
    assert.ok(!D.sameCell(l.javob, l.f.robot), "javob boshlangʻich katak emas");
  });
});

test("2-bosqich «Tuzat»: buzuq dastur yetmaydi, toʻgʻrisi yetadi, farq — bitta tahrir qismi", () => {
  har("tuzat", (l) => {
    assert.equal(pythonMos(l.f, l.dastur, l.fn).status, "goal");
    const rb = pythonMos(l.f, l.buzuq, l.buzuqFn);
    assert.notEqual(rb.status, "goal");
    assert.notEqual(rb.status, "uzun");
    // Tuzilish bir xil, faqat bitta tahrir qismi farq qiladi
    const qa = B.pythonQatorlar(l.dastur, l.fn);
    const qb = B.pythonQatorlar(l.buzuq, l.buzuqFn);
    assert.equal(qa.length, qb.length);
    const skelet = (q) => q.map((x) => x.chuqur + ":" + x.qismlar.map((p) => (typeof p === "string" ? p : p.tahrir ? "#" : p.m)).join("")).join("\n");
    assert.equal(skelet(qa), skelet(qb));
    const a = L.qismlar(l.dastur, l.fn);
    const b = L.qismlar(l.buzuq, l.buzuqFn);
    assert.equal(a.length, b.length);
    const farq = a.filter((x, i) => x.m !== b[i].m);
    assert.equal(farq.length, 1, B.pythonMatn(l.buzuq, l.buzuqFn));
    const t = farq[0].tahrir.maydon;
    assert.ok(t === "n" || t === "yon");
    // Son 2..9 oralig'ida — tahrirla() bilan qaytarib bo'ladi
    for (const x of b) if (x.tahrir.maydon === "n") assert.ok(L.SONLAR.includes(x.tahrir.blok.n));
  });
});

test("3-bosqich «Tarjima qil»: yechim yetadi, soni ≤ maxBlok, tugmalar yetarli", () => {
  har("tarjima", (l) => {
    assert.equal(pythonMos(l.f, l.yechim, l.yechimFn).status, "goal");
    assert.ok(B.soni(l.yechim, l.yechimFn) <= l.maxBlok);
    assert.equal(B.pythonMatn(l.yechim, l.yechimFn), l.togriMatn);
    // Har kerakli yo'nalish va blok turi tugmalar ichida
    assert.deepEqual(L.kerakliBloklar(l.yechim, l.yechimFn), l.bloklar);
    if (l.yechimFn) assert.deepEqual(l.fn, { yulduz: [] });
    // Takror soni quruvchidagi oraliqda (2..9) — bosib yetib boriladi
    const sonlar = (list) => list.flatMap((x) => [...(x.t === "takror" && x.n !== "qadam" ? [x.n] : []), ...sonlar(x.ichi || []), ...sonlar(x.aks || [])]);
    for (const n of sonlar(l.yechim)) assert.ok(L.SONLAR.includes(n));
  });
});

test("tier bilan yangi bloklar: tier 1 — agar/toki, tier 2 — ★ yoki qadam", () => {
  const rng = mulberry(3);
  for (let k = 0; k < 100; k++) {
    const t0 = JSON.stringify(L.yasa("tarjima", null, rng, 0).yechim);
    assert.ok(!/agar|toki|chaqir|qoy/.test(t0));
    const t1 = JSON.stringify(L.yasa("tarjima", null, rng, 1).yechim);
    assert.ok(/"agar"|"toki"/.test(t1));
    const l2 = L.yasa("tarjima", null, rng, 2);
    assert.ok(l2.yechimFn || JSON.stringify(l2.yechim).includes('"qoy"'));
  }
});

test("koʻrsatuv va zaxira vazifalari toʻgʻri", () => {
  const k = L.KORSATUV;
  assert.equal(B.bajar(k.oqi.f, k.oqi.dastur).status, "end");
  assert.deepEqual(B.bajar(k.oqi.f, k.oqi.dastur).at, k.oqi.javob);
  assert.equal(B.bajar(k.tuzat.f, k.tuzat.dastur).status, "goal");
  assert.notEqual(B.bajar(k.tuzat.f, k.tuzat.buzuq).status, "goal");
  assert.equal(B.bajar(k.tarjima.f, k.tarjima.yechim).status, "goal");
  for (const nom of ["oqi", "tuzat", "tarjima"]) {
    const a = L.zaxira(nom, null);
    const b = L.zaxira(nom, a);
    assert.notEqual(a.id, b.id);
    for (const z of [a, b]) {
      if (nom === "oqi") {
        const r = B.bajar(z.f, z.dastur);
        assert.equal(r.status, "end");
        assert.ok(!D.sameCell(r.at, z.f.robot));
      } else if (nom === "tuzat") {
        assert.equal(B.bajar(z.f, z.dastur).status, "goal");
        assert.notEqual(B.bajar(z.f, z.buzuq).status, "goal");
      } else {
        assert.equal(B.bajar(z.f, z.yechim).status, "goal");
        assert.ok(B.soni(z.yechim) <= z.maxBlok);
      }
    }
  }
});

test("farqQator: birinchi farq qilgan qator", () => {
  assert.equal(L.farqQator("a\nb\nc", "a\nb\nc"), -1);
  assert.equal(L.farqQator("a\nb\nc", "a\nx\nc"), 1);
  assert.equal(L.farqQator("a\nb", "a\nb\nc"), 2);
  assert.equal(L.farqQator("", "a"), 0);
});

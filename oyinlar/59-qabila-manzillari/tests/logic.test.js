// 59-o'yin: qabila manzillari — manzil tekshiruvi, daftarlar zanjiri (DNS), kesh hisobi va savollar.
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
function each(make, count, tier, seed) {
  const r = rngFrom(seed || 59);
  const out = [];
  let prev = null;
  for (let k = 0; k < count; k++) {
    prev = make(r, prev, tier);
    out.push(prev);
  }
  return out;
}

test("manzil tekshiruvi: chegaralar", () => {
  for (const m of ["0.0.0.0", "255.255.255.255", "192.168.1.5", "10.0.12.250"]) assert.ok(L.togrimi(m), m);
  const xato = {
    "192.168.1.256": "256 — 255 dan katta", "10.0.1": "3 ta boʻlak", "10.0.1.2.3": "5 ta boʻlak", "10.0.1.": "boʻsh",
    "10.0.1a.5": "son emas", "10.-1.2.3": "son emas", "10.01.2.3": "ortiqcha 0", "": "1 ta boʻlak",
  };
  for (const [m, sabab] of Object.entries(xato)) {
    assert.ok(!L.togrimi(m), m);
    assert.match(L.tekshir(m).sabab, new RegExp(sabab.split(" ")[0].replace(".", "\\.")), m);
  }
});

test("tasodifiy manzillar doim to'g'ri, xato manzillar doim xato", () => {
  const r = rngFrom(1);
  for (let k = 0; k < 500; k++) {
    assert.ok(L.togrimi(L.manzil(r)));
    for (const t of [0, 1, 2]) assert.ok(!L.togrimi(L.xatoManzil(r, t)), `tier ${t}`);
  }
});

const variantli = (tasks) => {
  for (const t of tasks) {
    assert.equal(t.variantlar.length, 4, t.id);
    assert.equal(new Set(t.variantlar).size, 4, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    assert.ok(t.ishora && !t.ishora.includes(t.javob), "maslahat javobni aytmaydi: " + t.id);
  }
};

test("variantli savollar: 4 ta, takrorlanmaydi, javob ichida", () => {
  for (const tier of [0, 1, 2]) {
    variantli(each(L.xatoTask, 60, tier));
    variantli(each(L.uyTask, 60, tier));
    variantli(each(L.topTask, 60, tier));
    variantli(each(L.eskiTask, 30, tier));
    variantli(each(L.nimaTask, 30, tier));
  }
});

test("qaysi manzil xato: aynan bittasi xato", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.xatoTask, 80, tier)) {
      assert.deepEqual(t.variantlar.filter((m) => !L.togrimi(m)), [t.javob], t.id);
    }
  }
});

test("uylar: hammasi to'g'ri manzil, tier 1–2 da javobdan faqat bitta son farq qiladi", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.uyTask, 80, tier)) {
      for (const m of t.variantlar) assert.ok(L.togrimi(m), m);
      if (tier > 0) {
        const j = t.javob.split(".");
        for (const m of t.variantlar.filter((x) => x !== t.javob)) {
          assert.equal(m.split(".").filter((x, i) => x !== j[i]).length, 1, `${m} vs ${t.javob}`);
        }
      }
    }
  }
});

test("daftar: nomlar va manzillar takrorlanmaydi; jadval o'lchami tier bilan o'sadi", () => {
  for (const [tier, n] of [[0, 6], [1, 8], [2, 10]]) {
    for (const t of each(L.topTask, 40, tier)) {
      assert.equal(t.jadval.length, n);
      assert.equal(new Set(t.jadval.map((x) => x.nom)).size, n);
      assert.equal(new Set(t.jadval.map((x) => x.manzil)).size, n);
      assert.equal(t.jadval.find((x) => x.nom === t.nom).manzil, t.javob);
    }
  }
  for (const nom of L.NOMLAR) assert.match(nom, /^[a-z]+\.uz$/, "domen faqat lotin harflari");
});

test("daftarlar zanjiri: javob — nom birinchi topilgan daftar raqami (yo'q bo'lsa 3)", () => {
  for (const tier of [0, 1, 2]) {
    let yoq = 0;
    for (const t of each(L.zanjirTask, 120, tier)) {
      const i = t.daftarlar.findIndex((d) => d.some((x) => x.nom === t.nom));
      assert.equal(t.javob, i === -1 ? 3 : i + 1, t.id);
      assert.equal(t.topildi, i !== -1);
      if (i === -1) yoq++;
      if (tier === 0) assert.ok(t.javob <= 2);
    }
    if (tier === 2) assert.ok(yoq > 10, "tier 2 da topilmaydigan nom ham chiqadi");
    else assert.equal(yoq, 0);
  }
});

test("kesh hisobi", () => {
  assert.equal(L.soniHisob(["a", "b", "a", "a"], 3, []), 6);
  assert.equal(L.soniHisob(["a", "b", "a"], 2, ["a"]), 2);
  assert.equal(L.soniHisob(["a", "a", "a"], 1, []), 1);
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.keshTask, 60, tier)) {
      assert.equal(t.javob, L.soniHisob(t.ketma, t.narx, t.javon));
      assert.ok(new Set(t.ketma).size < t.ketma.length, "takror bor — kesh ko'rinadi");
      assert.ok(t.javob < t.ketma.length * t.narx, "kesh so'rovlarni kamaytiradi");
      if (tier === 0) assert.equal(t.narx, 1);
    }
  }
});

test("chegara savollari: 255, 0, 256", () => {
  assert.deepEqual(L.CHEGARA.map((c) => c.javob), [255, 0, 256]);
});

test("ketma-ket bir xil misol chiqmaydi va bosqich navbati aylanadi", () => {
  for (const make of [L.xatoTask, L.uyTask, L.topTask, L.zanjirTask, L.keshTask]) {
    const list = each(make, 60, 1);
    for (let i = 1; i < list.length; i++) assert.notEqual(list[i].id, list[i - 1].id);
  }
  const r = rngFrom(9);
  assert.deepEqual([0, 1, 2, 3].map((n) => L.bosqich1Task(r, null, n, 0).tur), ["xato", "uy", "xato", "chegara"]);
  assert.deepEqual([0, 1].map((n) => L.bosqich2Task(r, null, n, 0).tur), ["top", "zanjir"]);
  assert.deepEqual([0, 1, 2, 3].map((n) => L.bosqich3Task(r, null, n, 0).tur), ["kesh", "eski", "kesh", "nima"]);
});

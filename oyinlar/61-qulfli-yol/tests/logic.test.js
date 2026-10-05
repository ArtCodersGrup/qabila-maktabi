// 61-o'yin: qulfli yo'l — xabar va qulf, manzil egasi, aldov turlari va mashq savollari.
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
  const r = rngFrom(seed || 61);
  const out = [];
  let prev = null;
  for (let k = 0; k < count; k++) {
    prev = make(r, prev, tier);
    out.push(prev);
  }
  return out;
}

test("manzil egasi: oxiridan o'qiladi", () => {
  assert.equal(L.egasi("https://kelajagim.uz/kirish"), "kelajagim.uz");
  assert.equal(L.egasi("https://kelajagim.uz.sovga-yutuq.com/kirish"), "sovga-yutuq.com");
  assert.equal(L.egasi("https://kirish.kelajagim.uz.tez-bonus.com/kelajagim"), "tez-bonus.com");
  assert.equal(L.egasi("http://www.qabila.uz/?a=b.c.d"), "qabila.uz");
  assert.equal(L.egasi("https://Kelajagim.UZ"), "kelajagim.uz");
  assert.ok(L.qulflimi("https://x.uz") && !L.qulflimi("http://https.x.uz/"));
});

test("aldov turlari to'g'ri aniqlanadi; o'xshash domenlar asl emas", () => {
  for (const asl of L.ASL) {
    assert.equal(L.turi(`https://${asl}/kirish`, asl), "togri");
    assert.equal(L.turi(`http://${asl}/kirish`, asl), "qulfsiz");
    assert.equal(L.turi(`https://${asl}.sovga-yutuq.com/kirish`, asl), "begona");
    for (const o of L.OXSHASH[asl]) {
      assert.notEqual(o, asl);
      assert.equal(o, o.toLowerCase(), "katta harfli o'xshash — egasi() kichraytiradi");
      assert.equal(L.turi(`https://${o}/`, asl), "oxshash", o);
    }
  }
});

test("qulflash: uzunlik saqlanadi, asl matn ko'rinmaydi, har safar boshqacha", () => {
  const r = rngFrom(4);
  const x = L.xabar(r, 2);
  const a = L.qulfla(x.matn, r);
  const b = L.qulfla(x.matn, r);
  assert.equal(a.length, x.matn.length);
  assert.notEqual(a, b);
  assert.ok(!a.includes(x.parol) && !a.includes("parol"));
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
    for (const make of [L.parolTask, L.korishTask, L.kafolatTask, L.qulfTask, L.ishonchTask, L.nimaXatoTask, L.egasiTask]) {
      variantli(each(make, 50, tier));
    }
  }
});

test("parol savoli: javob xabardagi parol, xabar tier bilan uzayadi", () => {
  for (const [tier, n] of [[0, 2], [1, 3], [2, 4]]) {
    for (const t of each(L.parolTask, 40, tier)) {
      assert.equal(t.xabar.maydonlar.length, n);
      assert.ok(t.xabar.matn.includes("parol: " + t.javob));
    }
  }
});

test("qulf savoli: aynan bitta https:// bilan boshlanadi (tier 2 da «https» so'zi aldov sifatida o'rtada)", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.qulfTask, 40, tier)) {
      assert.deepEqual(t.variantlar.filter(L.qulflimi), [t.javob]);
      if (tier === 2) assert.equal(t.variantlar.filter((v) => v.includes("https")).length, 4);
    }
  }
});

test("ishonch: har mashqda bitta to'g'ri va kamida bitta QULFLI aldov bor", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.ishonchTask, 60, tier)) {
      const turlar = t.variantlar.map((v) => L.turi(v, t.asl));
      assert.equal(turlar.filter((x) => x === "togri").length, 1);
      assert.equal(L.turi(t.javob, t.asl), "togri");
      assert.ok(t.variantlar.filter((v) => L.qulflimi(v) && L.turi(v, t.asl) !== "togri").length >= 1, "qulfli firibgar");
      assert.deepEqual(turlar.slice().sort(), ["begona", "oxshash", "qulfsiz", "togri"]);
    }
  }
});

test("nima xato: javob manzil turiga mos; egasi savoli to'g'ri", () => {
  for (const t of each(L.nimaXatoTask, 120, 1)) assert.equal(t.javob, L.XATO[L.turi(t.url, t.asl)]);
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.egasiTask, 40, tier)) assert.equal(t.javob, L.egasi(t.url));
  }
});

test("yo'ldagi tugunlar soni tier oralig'ida; navbat aylanadi", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.uzelTask, 30, tier)) assert.ok(t.javob >= L.ORTA[tier][0] && t.javob <= L.ORTA[tier][1]);
  }
  const r = rngFrom(9);
  assert.deepEqual([0, 1].map((n) => L.bosqich1Task(r, null, n, 0).tur), ["parol", "uzel"]);
  assert.deepEqual([0, 1, 2].map((n) => L.bosqich2Task(r, null, n, 0).tur), ["korish", "kafolat", "qulf"]);
  assert.deepEqual([0, 1, 2].map((n) => L.bosqich3Task(r, null, n, 0).tur), ["ishonch", "nima-xato", "egasi"]);
});

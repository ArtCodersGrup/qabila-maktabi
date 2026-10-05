// 64-o'yin «Robot sanaydi» mantiqi: vazifa generatori, javoblar va "sanoqsiz yechib bo'lmaydi" qulfi.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const B = require("../../umumiy/js/blok.js");

const { yur, takror, toki, qoy, qosh } = B;
const NECHTA = 200;

// Takrorlanadigan tasodif — test har safar bir xil natija bersin
function urugli(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function vazifalar(bosqich, tier, seed) {
  const rng = urugli(seed);
  const out = [];
  let prev = null;
  for (let i = 0; i < NECHTA; i++) {
    const l = L.yasa(bosqich, prev, rng, tier);
    out.push(l);
    prev = l;
  }
  return out;
}

const sigadi = (f) => f.w <= 8 && f.h <= 6;

test("qadam qutisi: qoy, qosh, takror ichida va takror qadam marta", () => {
  const f = B.maydon({ x: 0, y: 0 }, { x: 4, y: 4 }, [], 5, 5);
  assert.equal(B.bajar(f, [qoy(0), qosh(), takror(3, [qosh()])]).qiymat, 4);
  assert.equal(B.bajar(f, [qoy(0), takror(2, [takror(3, [qosh()])])]).qiymat, 6);
  assert.equal(B.bajar(f, [qosh(), qosh(), qoy(0), qosh()]).qiymat, 1, "qadam = 0 — qayta nol");
  const r = B.bajar(f, [qoy(0), qosh(), qosh(), qosh(), takror("qadam", [yur("right")])]);
  assert.deepEqual(r.at, { x: 3, y: 0 }, "takror qadam marta — 3 qadam");
});

for (const tier of [0, 1, 2]) {
  test(`1-bosqich (kuzat), tier ${tier}: javob = bajar().qiymat, 2..20, dastur yiqilmaydi`, () => {
    const list = vazifalar(1, tier, 11 + tier);
    list.forEach((l, i) => {
      const r = B.bajar(l.f, l.dastur);
      assert.ok(r.status === "goal" || r.status === "end", l.id + " " + r.status);
      assert.equal(l.javob, r.qiymat, l.id);
      assert.ok(l.javob >= 2 && l.javob <= 20, l.id + " javob " + l.javob);
      assert.ok(sigadi(l.f), l.id + ` ${l.f.w}x${l.f.h}`);
      assert.equal(l.dastur[0].t, "qoy", "dastur qadam = 0 bilan boshlanadi");
      // O'qib topilgan javob (gulxanni hisobga olmasdan) ham shu — dastur oxirigacha bajariladi
      assert.equal(L.oddiySanoq(l.dastur).qiymat, l.javob, l.id);
      assert.equal(l.yurgiz, tier === 0, "yurgizish faqat tier 0 da");
      if (i) assert.notEqual(l.id, list[i - 1].id, "ketma-ket bir xil vazifa");
    });
  });
}

test("1-bosqich: tier 2 da ichma-ich takror yoki ikkitalik qo'shish bor", () => {
  const ichmaIch = (d) => d.some((b) => b.t === "takror" && (b.ichi.some((x) => x.t === "takror")
    || b.ichi.filter((x) => x.t === "qosh").length >= 2));
  for (const l of vazifalar(1, 2, 99)) assert.ok(ichmaIch(l.dastur), l.id);
});

for (const bosqich of [2, 3]) {
  for (const tier of [0, 1, 2]) {
    test(`${bosqich}-bosqich, tier ${tier}: yechim ikkala maydonda, bloklar chegarasi, maydon ≤ 8×6, qulf`, () => {
      const list = vazifalar(bosqich, tier, 100 * bosqich + tier);
      list.forEach((l, i) => {
        assert.equal(l.maydonlar.length, 2, l.id);
        assert.ok(l.quti, "qadam qutisi ko'rinadi");
        for (const f of l.maydonlar) {
          assert.ok(sigadi(f), l.id + ` ${f.w}x${f.h}`);
          assert.equal(B.bajar(f, l.yechim).status, "goal", l.id);
        }
        assert.ok(B.soni(l.yechim) <= l.maxBlok, l.id);
        assert.ok(l.yechim.some((b) => b.t === "takror" && b.n === "qadam"), "yechimda takror qadam marta");
        for (const t of ["toki", "takror", "qoy", "qosh", "takrorQadam"]) assert.ok(l.bloklar.includes(t), l.id + " " + t);
        // Ikki maydonda masofa (L) har xil
        const [a, b] = l.id.split(":").pop().split("-").map(Number);
        assert.notEqual(a, b, l.id);
        // Qulf: har "takror qadam" o'rniga aniq son n = 1..9 — ikkala maydondan birdan o'tmaydi
        const qadamJoy = l.yechim.findIndex((x) => x.t === "takror" && x.n === "qadam");
        for (let n = 1; n <= 9; n++) {
          const d = B.nusxa(l.yechim);
          d[qadamJoy].n = n;
          assert.ok(!L.hammasida(l.maydonlar, d), l.id + " takror " + n);
        }
        // Kengroq qulf: aniq son yoki "… boʻsh ekan takrorla" (har tomon), har takror qadam o'rnida
        for (const d of L.aldashlar(l.yechim)) assert.ok(!L.hammasida(l.maydonlar, d), l.id + " " + JSON.stringify(d));
        if (i) assert.notEqual(l.id, list[i - 1].id, "ketma-ket bir xil vazifa");
      });
    });
  }
}

test("3-bosqich: tier bo'yicha shakllar (burchak → zinapoya → ikki barobar)", () => {
  const shakllar = (tier) => new Set(vazifalar(3, tier, 7 + tier).map((l) => l.shakl));
  assert.deepEqual([...shakllar(0)], ["burchak"]);
  assert.ok(shakllar(1).has("zina"));
  const s2 = shakllar(2);
  assert.ok(s2.has("ikki") && s2.has("zina"));
});

test("2-bosqich: yo'nalishlar tier bilan almashadi", () => {
  const yonlar = (tier) => new Set(vazifalar(2, tier, 3 + tier).map((l) => l.yechim[1].yon));
  assert.deepEqual([...yonlar(0)], ["right"]);
  assert.ok(yonlar(1).has("left"));
  assert.ok(yonlar(2).size >= 3);
});

test("ko'rsatuv: aniq son bir maydonda yiqiladi, qadam bilan ikkalasida o'tadi", () => {
  const k = L.KORSATUV.olcha;
  const sonli = k.maydonlar.map((f) => B.bajar(f, k.sonli).status);
  assert.equal(sonli[0], "goal");
  assert.notEqual(sonli[1], "goal");
  assert.ok(L.hammasida(k.maydonlar, k.yechim));
  const kz = L.KORSATUV.kuzat;
  assert.equal(B.bajar(kz.f, kz.dastur).qiymat, kz.javob);
  assert.equal(B.bajar(kz.f, kz.dastur).status, "goal");
});

test("sanoqsiz aldash: ikki toki bilan yechib bo'lmaydi (masalan, 2-bosqich)", () => {
  const l = L.yasa(2, null, urugli(5), 0);
  const d = [toki("right", [yur("right")]), toki("down", [yur("down")]), yur("right")];
  assert.ok(!L.hammasida(l.maydonlar, d));
  assert.ok(L.hammasida(l.maydonlar, [qoy(0), toki("right", [yur("right"), qosh()]), takror("qadam", [yur("down")]), yur("right")]));
});

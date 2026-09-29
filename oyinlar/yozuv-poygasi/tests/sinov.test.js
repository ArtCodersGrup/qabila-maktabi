// Robot yozuvchilar bilan sinov: poyga tugaydimi, qancha davom etadi, tartib to'g'rimi.
const test = require("node:test");
const assert = require("node:assert/strict");
const P = require("../js/poyga.js");
const R = require("./robot.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

test("12 robot: hamma cho'qqiga chiqadi va o'yin tugaydi", () => {
  for (const seed of [3, 17, 91]) {
    const rng = rngFrom(seed);
    const robots = R.robotlar(12, rng);
    const { s, vaqt } = R.poyga({ robots, jami: 30, rng });
    assert.equal(P.hammasiTugadi(s), true, "seed " + seed);
    assert.equal(s.tugadi, true);
    const orinlar = P.tartib(s).map((p) => p.orin);
    assert.deepEqual(orinlar, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], "har kimga o'z o'rni");
    assert.ok(vaqt < 3 * 60000, `poyga uzoq cho'zilmaydi: ${Math.round(vaqt / 1000)} s`);
    assert.ok(vaqt > 8000, "juda tez ham tugamaydi");
  }
});

test("xatosiz robotlarda tartib aynan tezlik bo'yicha", () => {
  const robots = [
    { id: "sekin", qahramon: "qizil", cpm: 60, xato: 0 },
    { id: "orta", qahramon: "kok", cpm: 120, xato: 0 },
    { id: "tez", qahramon: "yashil", cpm: 240, xato: 0 },
  ];
  const { s } = R.poyga({ robots, jami: 40, rng: rngFrom(5) });
  assert.deepEqual(P.tartib(s).map((p) => p.id), ["tez", "orta", "sekin"]);
  assert.ok(s.oyinchilar.tez.cpm > s.oyinchilar.sekin.cpm);
  assert.equal(s.oyinchilar.tez.aniq, 100, "xatosiz robot — 100% aniqlik");
});

test("xabarlar kam: har bola pog'ona sonidan ko'p xabar yubormaydi", () => {
  const rng = rngFrom(23);
  const robots = R.robotlar(12, rng);
  const { s, xabarlar } = R.poyga({ robots, jami: 30, rng });
  assert.ok(xabarlar <= 12 * (s.pogona + 1), `xabarlar: ${xabarlar}`);
  assert.ok(xabarlar >= 12, "har bola kamida bir marta xabar beradi");
});

test("sekin bola poygani to'xtatib qo'ymaydi — kutiladi, chiqarib yuborilmaydi", () => {
  const robots = [
    { id: "tez", qahramon: "qizil", cpm: 300, xato: 0 },
    { id: "juda-sekin", qahramon: "kok", cpm: 25, xato: 0.1 },
  ];
  const { s } = R.poyga({ robots, jami: 30, rng: rngFrom(11) });
  assert.equal(s.oyinchilar["juda-sekin"].orin, 2, "sekini ham cho'qqiga chiqadi");
  assert.equal(s.oyinchilar["juda-sekin"].pogona, s.pogona);
  assert.equal(P.hammasiTugadi(s), true);
});

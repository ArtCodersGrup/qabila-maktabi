// 53-o'yin: xato ovi — har vazifaning xato dasturi haqiqatan yiqilishi,
// to'g'ri dasturi esa qabul qilinishi kerak.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const D = require("../../umumiy/js/dastur.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const each = (make, n, seed) => {
  const r = rngFrom(seed || 53);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};
const hamma = () => Object.entries(L.VAZIFALAR).flatMap(([b, list]) => list.map((v) => [b, v]));

// O'yinning asosiy da'vosi: berilgan dasturda haqiqatan xato bor
test("har vazifaning xato dasturi qabul qilinmaydi", () => {
  for (const [bosqich, v] of hamma()) {
    const f = v.maydon();
    const r = L.tekshir(v, f, v.dastur);
    assert.equal(r.ok, false, bosqich + "/" + v.id + ": xato dastur oʻtib ketdi");
    assert.ok(r.sabab && r.sabab.length > 10, bosqich + "/" + v.id + ": sabab yoʻq");
  }
});

test("har vazifaning to'g'ri dasturi qabul qilinadi", () => {
  for (const [bosqich, v] of hamma()) {
    const f = v.maydon();
    const r = L.tekshir(v, f, v.togri);
    assert.equal(r.ok, true, bosqich + "/" + v.id + ": " + r.sabab);
  }
});

test("xatoIndeks dastur ichida va to'g'ri joyni ko'rsatadi", () => {
  for (const [bosqich, v] of hamma()) {
    assert.ok(v.xatoIndeks >= 0 && v.xatoIndeks <= v.dastur.length, bosqich + "/" + v.id);
    // "top" bosqichida bola aynan shu buyruqni bosadi — u yiqilish joyiga mos bo'lishi kerak
    if (bosqich === "top") {
      const joy = L.xatoJoyi(v.maydon(), v.dastur);
      assert.ok(joy >= 0, v.id);
      if (v.id !== "chekka") assert.equal(joy, v.xatoIndeks, v.id + ": yiqilish joyi xatoIndeks ga mos emas");
    }
  }
});

test("xatoJoyi: urilgan buyruq o'rni, yetib borsa −1", () => {
  const f = L.maydon({ x: 0, y: 0 }, { x: 2, y: 0 }, [{ x: 1, y: 0 }]);
  assert.equal(L.xatoJoyi(f, ["right"]), 0, "birinchi buyruqdayoq toshga uriladi");
  assert.equal(L.xatoJoyi(f, ["down", "right", "right", "up"]), -1, "aylanib oʻtsa — xato yoʻq");
  assert.equal(L.xatoJoyi(f, ["down"]), 1, "buyruq tugasa — dastur oxiri");
});

test("qisqalik talab qilinadigan vazifa: uzun yechim o'tmaydi", () => {
  const v = L.VAZIFALAR.tuzat.find((x) => x.qisqa);
  assert.ok(v, "qisqalik vazifasi boʻlishi kerak");
  const f = v.maydon();
  const eng = D.solve(f);
  assert.equal(L.tekshir(v, f, eng).ok, true);
  // Bir qadam ortiqcha: yuqoriga chiqib qaytish
  const uzun = ["up", "down"].concat(eng);
  assert.equal(L.tekshir(v, f, uzun).ok, false);
  assert.match(L.tekshir(v, f, uzun).sabab, /ortiqcha/);
});

test("maydonlar yaroqli: yo'l bor, robot va gulxan joyida", () => {
  for (const [bosqich, v] of hamma()) {
    const f = v.maydon();
    assert.ok(D.solve(f) !== null, bosqich + "/" + v.id + ": yoʻl yoʻq");
    assert.ok(f.w <= 5 && f.h <= 5, v.id);
    assert.ok(!D.isWall(f, f.robot) && !D.isWall(f, f.goal), v.id);
    assert.ok(v.dastur.length >= 2 && v.dastur.length <= 6, v.id + ": dastur juda uzun");
  }
});

test("har bosqichda kamida uchta vazifa va ishora bor", () => {
  for (const [bosqich, list] of Object.entries(L.VAZIFALAR)) {
    assert.ok(list.length >= 3, bosqich);
    for (const v of list) {
      assert.ok(v.matn.length > 20, v.id);
      assert.ok(v.ishora.length > 20, v.id);
      for (const dir of v.dastur.concat(v.togri)) assert.ok(D.ORDER.includes(dir), v.id + ": " + dir);
    }
  }
});

test("ketma-ket vazifalar takrorlanmaydi", () => {
  for (const make of [L.topTask, L.tuzatTask]) {
    const list = each(make, 8, 11);
    for (let k = 1; k < list.length; k++) assert.notEqual(list[k].id, list[k - 1].id);
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  for (const [, v] of hamma()) {
    assert.ok(!/['’`´]/.test(v.matn), v.matn);
    assert.ok(!/['’`´]/.test(v.ishora), v.ishora);
  }
  for (const m of Object.values(L.XATO_MATNI)) assert.ok(!/['’`´]/.test(m), m);
});

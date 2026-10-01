// Tank dueli: navbat tartibi, g'olib va adolat.
const test = require("node:test");
const assert = require("node:assert/strict");
const D = require("../js/duel.js");
const J = require("../../umumiy/js/jang.js");
const py = require("../../umumiy/js/python/python.js");

test("maydon simmetrik: ikkala tank bir xil sharoitda", () => {
  const m = D.maydon({ a: "Anvar", b: "Dilnoza" });
  const [a, b] = m.tanklar;
  assert.equal(a.jon, b.jon);
  assert.equal(a.oq, b.oq);
  assert.equal(a.uzoq, b.uzoq, "koʻrish masofasi teng boʻlishi kerak");
  assert.equal(a.x, m.en - b.x, "boshlangʻich joylar oyna kabi");
  assert.equal(a.y, b.y);
  // To'siqlar ham simmetrik
  assert.equal(m.tosiqlar.length, 2);
  assert.equal(m.tosiqlar[0].x, m.tosiqlar[1].x);
  assert.equal(m.nomlar.a, "Anvar");
});

test("navbat almashadi, xatodan keyin almashmaydi", () => {
  const m = D.maydon();
  assert.equal(m.navbat, "a");
  const r1 = D.satrniBajar(m, "move(20)", py);
  assert.equal(r1.kim, "a");
  assert.equal(m.navbat, "b", "toʻgʻri satrdan keyin navbat oʻtadi");
  const r2 = D.satrniBajar(m, "move(", py);
  assert.ok(r2.xato, "sintaksis xatosi");
  assert.equal(m.navbat, "b", "xatodan keyin navbat oʻsha oʻyinchida qoladi");
  assert.equal(m.navbatSoni, 1);
});

test("har o'yinchi faqat o'z tankini boshqaradi", () => {
  const m = D.maydon();
  D.satrniBajar(m, "move(30)", py);          // a yuradi
  assert.equal(D.tank(m, "a").x, 120);
  assert.equal(D.tank(m, "b").x, 510, "b qimirlamasligi kerak");
  D.satrniBajar(m, "move(30)", py);          // endi b yuradi
  assert.equal(D.tank(m, "b").x, 480);
  assert.equal(D.tank(m, "a").x, 120);
});

test("g'olib: raqibning joni tugaganda", () => {
  const m = D.maydon({ a: "Anvar", b: "Dilnoza" });
  D.tank(m, "b").jon = 1;
  D.tank(m, "b").x = 300; // a ning qarshisiga qo'yamiz
  let qadam = 0;
  while (!m.tugadi && qadam < 10) {
    D.satrniBajar(m, m.navbat === "a" ? "left(radar())\nfire()" : "reload()", py);
    qadam++;
  }
  assert.equal(m.tugadi, "golib");
  assert.equal(m.golib, "a");
  assert.equal(D.golibNomi(m), "Anvar");
});

test("navbat chegarasi: uzoq cho'zilsa — durang", () => {
  const m = D.maydon();
  for (let k = 0; k < D.MAX_NAVBAT + 2 && !m.tugadi; k++) D.satrniBajar(m, "reload()", py);
  assert.equal(m.tugadi, "durang");
  assert.equal(D.golibNomi(m), null);
});

test("jang tugagach buyruq bajarilmaydi", () => {
  const m = D.maydon();
  D.tank(m, "b").tirik = false;
  D.holatniTekshir(m);
  const r = D.satrniBajar(m, "move(50)", py);
  assert.equal(r.tugagan, true);
  assert.equal(D.tank(m, "a").x, 90);
});

test("bitta satrda harakat chegarasi duelda ham ishlaydi", () => {
  const m = D.maydon();
  const r = D.satrniBajar(m, "for i in range(30):\n    move(5)", py);
  assert.equal(r.chegaraOshdi, true);
  assert.equal(r.yozuv.filter((y) => y.t === "yur").length, J.MAX_HARAKAT);
});

test("kimNavbati va nomlar", () => {
  const m = D.maydon({ a: "Sardor", b: "Malika" });
  assert.equal(D.kimNavbati(m), "Sardor");
  D.satrniBajar(m, "reload()", py);
  assert.equal(D.kimNavbati(m), "Malika");
});

test("scan va radar duelda raqibni ko'rsatadi", () => {
  const m = D.maydon();
  const a = D.tank(m, "a");
  // Raqib to'g'ri qarshisida, lekin uzoqda (420 > 300)
  assert.equal(J.korish(m, a), -1);
  a.x = 250;
  assert.ok(J.korish(m, a) > 0, "yaqinlashgach koʻrinishi kerak");
  assert.equal(Math.abs(J.radarBurchagi(m, a)) <= 1, true);
});

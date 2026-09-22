// tog.js testlari: qoidalar va robot o'yinchilar bilan sinov (o'yin qancha davom etadi, kim qachon chiqib ketadi).
const test = require("node:test");
const assert = require("node:assert/strict");
const T = require("../js/tog.js");
const { simulate, rng } = require("./robot.js");

const players = (n) => Array.from({ length: n }, (_, k) => ({ id: "p" + k, qahramon: T.QAHRAMONLAR[k].id }));

test("tog'lar: nomi, balandligi, pog'ona va chegara", () => {
  assert.deepEqual(T.TOGLAR.map((t) => t.id), ["chimyon", "hazrati", "pomir", "himolay"]);
  assert.deepEqual(T.TOGLAR.map((t) => t.pogona), [15, 20, 25, 30]);
  assert.deepEqual(T.TOGLAR.map((t) => t.chegara), [4, 4, 5, 6]);
  for (const t of T.TOGLAR) {
    assert.ok(t.metr > 1000 && t.nom.length > 3, t.id);
    assert.ok(t.chegara >= 4 && t.chegara <= Math.ceil(t.pogona / 3), `${t.id}: chegara`);
    assert.ok(t.daqiqa >= 10, t.id);
  }
  assert.equal(T.togById("yoq").id, T.DEFAULT_TOG, "noma'lum nom — sozlamadagi tog'");
  assert.equal(T.yarim(T.togById("chimyon")), 8);
  assert.equal(T.yarim(T.togById("himolay")), 15);
});

test("qahramonlar: 12 ta, nomi va rangi takrorlanmaydi", () => {
  assert.equal(T.QAHRAMONLAR.length, T.MAX_PLAYERS);
  assert.equal(new Set(T.QAHRAMONLAR.map((q) => q.id)).size, 12);
  assert.equal(new Set(T.QAHRAMONLAR.map((q) => q.nom)).size, 12);
  assert.equal(new Set(T.QAHRAMONLAR.map((q) => q.rang)).size, 12);
  for (const q of T.QAHRAMONLAR) assert.match(q.rang, /^#[0-9A-F]{6}$/i, q.id);
});

test("qiyinlik balandlikka qarab uchga bo'linadi", () => {
  const t = T.togById("chimyon"); // 15 pog'ona
  assert.deepEqual([0, 4, 5, 9, 10, 14].map((s) => T.daraja(t, s)), [1, 1, 2, 2, 3, 3]);
  const h = T.togById("himolay"); // 30
  assert.deepEqual([0, 9, 10, 19, 20, 29].map((s) => T.daraja(h, s)), [1, 1, 2, 2, 3, 3]);
});

test("to'g'ri javob — bir pog'ona yuqoriga; xato — pauza, pastga tushish yo'q", () => {
  const s = T.create({ tog: "chimyon", players: players(3), now: 0 });
  T.javob(s, "p0", true, 1000);
  assert.equal(s.oyinchilar.p0.pogona, 1);
  T.javob(s, "p0", false, 2000);
  assert.equal(s.oyinchilar.p0.pogona, 1, "xatoda pastga tushmaydi");
  assert.equal(s.oyinchilar.p0.pauzaGacha, 12000, "10 soniya pauza");
  assert.equal(T.javobBeraOladi(s, "p0", 5000), false, "pauzada javob bermaydi");
  assert.equal(T.javob(s, "p0", true, 5000), null);
  assert.equal(T.javobBeraOladi(s, "p0", 12000), true);
  T.javob(s, "p0", false, 12000);
  assert.equal(s.oyinchilar.p0.pauzaGacha, 32000, "ketma-ket ikkinchi xato — 20 soniya");
  T.javob(s, "p0", true, 32000);
  assert.equal(s.oyinchilar.p0.xatoKetma, 0, "to'g'ri javob ketma-ketlikni uzadi");
  T.javob(s, "p0", false, 33000);
  assert.equal(s.oyinchilar.p0.pauzaGacha, 43000, "yana 10 soniya");
  assert.deepEqual([s.oyinchilar.p0.togri, s.oyinchilar.p0.xato], [2, 3]);
});

test("qolib ketish faqat yetakchi yarim yo'lni bosgandan keyin ishlaydi", () => {
  const s = T.create({ tog: "chimyon", players: players(3), now: 0 }); // 15 pog'ona, yarim — 8, chegara — 4
  for (let k = 0; k < 7; k++) T.javob(s, "p0", true, 1000 * (k + 1));
  assert.equal(s.oyinchilar.p0.pogona, 7);
  assert.equal(s.oyinchilar.p1.chiqdi, false, "yarim yo'lgacha hech kim chiqmaydi");
  T.javob(s, "p0", true, 9000); // 8-pog'ona — qoida ishga tushadi
  assert.equal(s.oyinchilar.p1.chiqdi, true);
  assert.equal(s.oyinchilar.p2.chiqdi, true);
  assert.equal(s.tugadi, true);
  assert.equal(s.golib, "p0");
  assert.equal(s.sabab, "uzib-ketdi", "hamma qolib ketdi — yetakchi g'olib");
});

test("chegaradan kam orqada qolgan davom etadi", () => {
  const s = T.create({ tog: "hazrati", players: players(2), now: 0 }); // 20 pog'ona, yarim — 10, chegara — 4
  // Navbat bilan: p0 oldinda, p1 undan 3 pog'ona orqada
  for (let k = 0; k < 10; k++) {
    T.javob(s, "p0", true, 200 * k + 100);
    if (k < 7) T.javob(s, "p1", true, 200 * k + 150);
  }
  assert.deepEqual([s.oyinchilar.p0.pogona, s.oyinchilar.p1.pogona], [10, 7]);
  assert.equal(s.oyinchilar.p1.chiqdi, false, "3 pog'ona orqada — davom etadi");
  T.javob(s, "p0", true, 5000); // 11 : 7 — 4 pog'ona farq
  assert.equal(s.oyinchilar.p1.chiqdi, true);
});

test("cho'qqiga chiqqan g'olib", () => {
  const s = T.create({ tog: "chimyon", players: players(2), now: 0 });
  // p1 orqada, lekin chegaradan kam (2 pog'ona) — o'yin cho'qqigacha boradi
  for (let k = 0; k < 15; k++) {
    T.javob(s, "p0", true, 1000 * (k + 1));
    if (k < 13) T.javob(s, "p1", true, 1000 * (k + 1) + 10);
  }
  assert.equal(s.golib, "p0");
  assert.ok(["chogqi", "uzib-ketdi"].includes(s.sabab));
  assert.equal(s.oyinchilar.p0.pogona, 15);
});

test("vaqt tugasa — eng balanddagi g'olib; teng bo'lsa kim oldin chiqqan bo'lsa", () => {
  const s = T.create({ tog: "himolay", players: players(3), now: 0, daqiqa: 1 });
  T.javob(s, "p0", true, 1000);
  T.javob(s, "p1", true, 500); // bir xil balandlik, lekin oldinroq
  T.javob(s, "p2", true, 2000);
  T.javob(s, "p2", true, 3000); // eng baland
  T.tekshir(s, 60000);
  assert.equal(s.tugadi, true);
  assert.equal(s.sabab, "vaqt");
  assert.equal(s.golib, "p2");
  const r = T.reyting(s).map((p) => p.id);
  assert.deepEqual(r, ["p2", "p1", "p0"], "teng balandlikda oldin chiqqani oldinda");
});

test("o'qituvchi o'yinchini chiqarib yuboradi", () => {
  const s = T.create({ tog: "hazrati", players: players(3), now: 0 });
  T.chiqar(s, "p2", 1000);
  assert.equal(s.oyinchilar.p2.chiqdi, true);
  assert.equal(s.oyinchilar.p2.chiqarilgan, true);
  assert.equal(T.javobBeraOladi(s, "p2", 2000), false);
  assert.equal(s.tugadi, false, "ikki o'yinchi qoldi — o'yin davom etadi");
  T.chiqar(s, "p1", 2000);
  assert.equal(s.golib, "p0", "bitta qolsa — g'olib");
});

test("jim turgan o'yinchi belgilanadi (60 soniya)", () => {
  const s = T.create({ tog: "hazrati", players: players(2), now: 0 });
  assert.equal(T.jim(s, "p0", 59000), false);
  assert.equal(T.jim(s, "p0", 60000), true);
});

// ---------- Robot o'yinchilar bilan sinov (DIZAYN 6) ----------
test("robotlar: o'yin juda tez tugamaydi va cho'zilib ketmaydi", () => {
  const stats = [];
  for (let seed = 1; seed <= 40; seed++) stats.push(simulate({ tog: "hazrati", n: 12, rng: rng(seed) }));
  const median = (list) => list.slice().sort((a, b) => a - b)[Math.floor(list.length / 2)];
  const uzunlik = median(stats.map((x) => x.sekund));
  const birinchiChiqish = median(stats.map((x) => x.birinchiChiqish));
  const daqiqadaQolgan = median(stats.map((x) => x.qolgan60));
  assert.ok(uzunlik >= 90, `o'yin juda tez tugadi: ${uzunlik} s`);
  assert.ok(uzunlik <= 600, `o'yin juda uzoq: ${uzunlik} s`);
  assert.ok(birinchiChiqish >= 60, `birinchi chiqib ketish juda erta: ${birinchiChiqish} s`);
  assert.ok(daqiqadaQolgan >= 10, `1 daqiqada juda ko'p bola chiqib ketdi: ${daqiqadaQolgan}/12`);
  for (const x of stats) assert.ok(x.golib, "har o'yinda g'olib bor");
});

test("robotlar: hamma tog'da o'yin tugaydi va g'olib aniqlanadi", () => {
  for (const tog of T.TOGLAR.map((t) => t.id)) {
    for (let seed = 1; seed <= 5; seed++) {
      const x = simulate({ tog, n: 12, rng: rng(seed * 7) });
      assert.ok(x.golib, `${tog}: g'olib yo'q`);
      assert.ok(x.sekund <= T.togById(tog).daqiqa * 60, `${tog}: vaqtdan oshdi`);
      assert.ok(x.chiqqan <= 11, tog);
    }
  }
});

test("robotlar: birinchi daqiqada hech kim chiqib ketmaydi, eng sekini ham bir necha pog'ona chiqadi", () => {
  const st = [];
  for (let seed = 1; seed <= 20; seed++) st.push(simulate({ tog: "hazrati", n: 12, rng: rng(seed + 100) }));
  const med = (l) => l.slice().sort((a, b) => a - b)[Math.floor(l.length / 2)];
  assert.equal(med(st.map((x) => x.qolgan60)), 12, "1-daqiqada hamma o'ynayapti");
  assert.ok(med(st.map((x) => x.engPastPogona)) >= 2, "eng sekini ham kamida 2 pog'ona chiqadi");
});

test("ikkinchi qoida (oxirgi o'rindagi chiqadi) — zaxira variant sifatida ishlaydi", () => {
  const s = T.create({ tog: "chimyon", players: players(4), now: 0, qoida: "oxirgi", bekat: 2 });
  // p0 yetakchi: yarim yo'l (8) dan o'tganda eng pastdagi bitta o'yinchi chiqadi
  for (let k = 0; k < 8; k++) T.javob(s, "p0", true, 100 * (k + 1));
  for (const id of ["p1", "p2"]) for (let k = 0; k < 3; k++) T.javob(s, id, true, 2000 + 100 * k);
  T.tekshir(s, 3000);
  const chiqqan = Object.values(s.oyinchilar).filter((p) => p.chiqdi);
  assert.equal(chiqqan.length, 1, "bir vaqtda bittadan chiqadi");
  assert.equal(chiqqan[0].id, "p3", "eng pastdagi chiqadi");
  const x = simulate({ tog: "hazrati", n: 12, rng: rng(5), opt: { qoida: "oxirgi", bekat: 2 } });
  assert.ok(x.golib && x.sekund >= 90, "robotlar bilan ham o'yin normal davom etadi");
});

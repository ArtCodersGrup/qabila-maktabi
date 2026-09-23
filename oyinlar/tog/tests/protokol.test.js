// Onlayn xona protokoli: paket to'liq va xavfsiz bo'lsin, ikkinchi qurilmada o'sha manzara chiqsin.
const test = require("node:test");
const assert = require("node:assert/strict");
const T = require("../js/tog.js");
const P = require("../js/protokol.js");
const O = require("../../umumiy/js/onlayn.js");

const now = 1_700_000_000_000;
const oyin = (n = 4, tog = "chimyon") => T.create({
  tog,
  players: T.QAHRAMONLAR.slice(0, n).map((q, k) => ({ id: "o" + k, qahramon: q.id })),
  now,
});

test("kimlik: qisqa yashirin raqam, ism emas", () => {
  const ids = new Set();
  for (let k = 0; k < 500; k++) {
    const id = P.kimlik();
    assert.match(id, /^[a-z2-9]{6}$/);
    ids.add(id);
  }
  assert.ok(ids.size > 480, "takrorlanmaydi");
});

test("paket: aloqa qatlamidan o'tadi va erkin matn yo'q", () => {
  const s = oyin(12);
  T.javob(s, "o1", true, now + 2000);
  T.javob(s, "o2", false, now + 2500);
  const p = P.paket(s, now + 3000);
  const msg = { type: "holat", data: p, t: now, from: "host" };
  assert.ok(O.validMessage(msg, P.TYPES), "xabar tekshiruvidan o'tadi");
  assert.ok(P.yaxshiPaket(p));
  // Ichida faqat son, 0/1 va qisqa kalit so'z
  Object.values(p).forEach((v) => {
    (Array.isArray(v) ? v : [v]).forEach((x) => {
      assert.ok(typeof x === "number" || /^[a-z0-9:_-]{0,32}$/i.test(String(x)), String(x));
    });
  });
});

test("paket → holat: ikkinchi qurilmada o'sha pog'ona, pauza va tartib", () => {
  const s = oyin(5);
  T.javob(s, "o0", true, now + 2000);
  T.javob(s, "o0", true, now + 4000);
  T.javob(s, "o1", true, now + 3000);
  T.javob(s, "o2", false, now + 3500); // pauza
  const t = now + 5000;
  const bola = P.holat(P.paket(s, t), t);

  assert.equal(bola.oyinchilar.o0.pogona, 2);
  assert.equal(bola.oyinchilar.o1.pogona, 1);
  assert.equal(bola.oyinchilar.o1.qahramon, s.oyinchilar.o1.qahramon);
  // Pauza nisbiy yuboriladi (qurilmalar soati har xil), lekin qolgan soniya saqlanadi
  const qolgan = Math.round((bola.oyinchilar.o2.pauzaGacha - t) / 1000);
  assert.equal(qolgan, Math.ceil((s.oyinchilar.o2.pauzaGacha - t) / 1000));
  assert.equal(bola.oyinchilar.o3.pauzaGacha, 0);
  // Reyting tartibi boshlovchinikidek
  assert.deepEqual(T.reyting(bola).map((p) => p.id), T.reyting(s).map((p) => p.id));
  assert.equal(Math.round((bola.tugaydi - t) / 1000), Math.round((s.tugaydi - t) / 1000));
});

test("holat: teng pog'onada boshlovchining tartibi buzilmaydi", () => {
  const s = oyin(4);
  // Hammasi 1-pog'onada, lekin turli vaqtda chiqqan
  T.javob(s, "o2", true, now + 1000);
  T.javob(s, "o0", true, now + 2000);
  T.javob(s, "o3", true, now + 3000);
  T.javob(s, "o1", true, now + 4000);
  const t = now + 5000;
  const kutilgan = T.reyting(s).map((p) => p.id);
  assert.deepEqual(kutilgan, ["o2", "o0", "o3", "o1"]);
  assert.deepEqual(T.reyting(P.holat(P.paket(s, t), t)).map((p) => p.id), kutilgan);
});

test("tugagan o'yin ham to'liq uzatiladi: g'olib va sabab", () => {
  const s = oyin(3, "chimyon");
  for (let k = 0; k < 15; k++) T.javob(s, "o0", true, now + 2000 + k * 1500);
  assert.equal(s.tugadi, true);
  const t = now + 40000;
  const bola = P.holat(P.paket(s, t), t);
  assert.equal(bola.tugadi, true);
  assert.equal(bola.golib, s.golib, "g'olib boshlovchinikidek");
  assert.equal(bola.sabab, s.sabab);
  assert.ok(P.SABABLAR.includes(bola.sabab), bola.sabab);
  // Natija ro'yxati ham to'liq: har kimning to'g'ri va xato javoblari
  assert.equal(bola.oyinchilar.o0.togri, s.oyinchilar.o0.togri);
  assert.deepEqual(T.reyting(bola).map((p) => p.id), T.reyting(s).map((p) => p.id));
});

test("qabul: juda tez kelgan javob va notanish o'yinchi hisobga olinmaydi", () => {
  const s = oyin(3);
  assert.equal(P.qabul(s, "yoq", true, now + 5000), false, "notanish o'yinchi");
  assert.equal(P.qabul(s, "o0", true, now + 500), false, "o'yin boshidanoq bosdi");
  assert.equal(P.qabul(s, "o0", true, now + 2000), true);
  assert.equal(P.qabul(s, "o0", true, now + 2500), false, `${P.MIN_JAVOB} ms ichida ikkinchi javob`);
  assert.equal(P.qabul(s, "o0", true, now + 4000), true);
  assert.equal(s.oyinchilar.o0.pogona, 2, "faqat qabul qilingani sanaladi");
  // Pauzadagi o'yinchi javob bera olmaydi
  P.qabul(s, "o1", false, now + 2000);
  assert.equal(P.qabul(s, "o1", true, now + 5000), false, "pauzada");
});

test("yaxshiPaket: buzuq yoki o'zgartirilgan paket rad etiladi", () => {
  const s = oyin(3);
  const p = P.paket(s, now + 1000);
  assert.ok(P.yaxshiPaket(p));
  assert.equal(P.yaxshiPaket(null), false);
  assert.equal(P.yaxshiPaket({}), false);
  assert.equal(P.yaxshiPaket(Object.assign({}, p, { pog: [1, 2] })), false, "uzunligi mos emas");
  assert.equal(P.yaxshiPaket(Object.assign({}, p, { tog: "oyga" })), false, "bunday tog' yo'q");
  assert.equal(P.yaxshiPaket(Object.assign({}, p, { sabab: "shunchaki" })), false, "notanish sabab");
  assert.equal(P.yaxshiPaket(Object.assign({}, p, { pog: p.pog.map(() => -1) })), false, "manfiy pog'ona");
  assert.equal(P.yaxshiPaket(Object.assign({}, p, { ids: new Array(13).fill("x") })), false, "12 dan ko'p");
});

test("lobbi va bo'sh qahramonlar: bitta qahramon bitta bolaga", () => {
  const l = P.lobbi([{ id: "a", qahramon: "qizil" }, { id: "b", qahramon: "kok" }]);
  assert.deepEqual(l, { ids: ["a", "b"], qah: ["qizil", "kok"] });
  assert.ok(O.validMessage({ type: "lobbi", data: l, t: now, from: "host" }, P.TYPES));
  const bosh = P.bosh(l.qah);
  assert.equal(bosh.length, T.QAHRAMONLAR.length - 2);
  assert.ok(!bosh.some((q) => q.id === "qizil"));
});

test("mavzular ham uzatiladi: bola oʻqituvchi tanlagan mavzudan savol oladi", () => {
  const s = T.create({
    tog: "chimyon",
    players: [{ id: "a", qahramon: "qizil" }, { id: "b", qahramon: "kok" }],
    now,
    mavzular: ["mantiq", "sanoq"],
  });
  const p = P.paket(s, now + 1000);
  assert.deepEqual(p.mav, ["mantiq", "sanoq"]);
  assert.ok(O.validMessage({ type: "holat", data: p, t: now, from: "host" }, P.TYPES), "aloqa qatlamidan oʻtadi");
  assert.ok(P.yaxshiPaket(p));
  assert.deepEqual(P.holat(p, now + 1000).mavzular, ["mantiq", "sanoq"]);
  // Mavzu tanlanmasa — hammasi
  const hammasi = T.create({ tog: "chimyon", players: [{ id: "a", qahramon: "qizil" }], now });
  assert.equal(hammasi.mavzular, null);
  assert.deepEqual(P.paket(hammasi, now).mav, []);
  assert.equal(P.holat(P.paket(hammasi, now), now).mavzular, null);
  // Buzuq mavzu roʻyxati rad etiladi
  assert.equal(P.yaxshiPaket(Object.assign({}, p, { mav: new Array(17).fill("x") })), false);
  assert.equal(P.yaxshiPaket(Object.assign({}, p, { mav: [1, 2] })), false);
});

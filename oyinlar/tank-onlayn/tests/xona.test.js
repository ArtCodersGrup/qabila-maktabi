// Onlayn tank xonasi: tug'ilish joylari, harakatlarni yozib olish, navbatma-navbat raund, reyting va paketlar.
const test = require("node:test");
const assert = require("node:assert/strict");
const X = require("../js/xona-mantiq.js");
const J = require("../../umumiy/js/jang.js");
const py = require("../../umumiy/js/python/python.js");
const O = require("../../umumiy/js/onlayn.js");

const oyinchilar = (n) => Array.from({ length: n }, (_, i) => ({ id: "o" + i, qah: X.QAHRAMONLAR[i % X.QAHRAMONLAR.length].id }));

test("tug'ilish: 2–8 bola, maydon ichida, to'siqqa tushmaydi, bir-biriga tegmaydi, markazga qaragan", () => {
  for (let n = X.MIN_ODAM; n <= X.MAX_ODAM; n++) {
    const m = X.maydon(oyinchilar(n));
    assert.equal(m.tanklar.length, n);
    for (const t of m.tanklar) {
      assert.ok(J.bosh(m, t.x, t.y), `${n}: ${t.id} bo'sh joyda`);
      assert.equal(t.jon, X.JON);
      assert.equal(t.uzoq, X.UZOQ);
      for (const b of m.tanklar) if (b !== t) assert.ok(J.masofa(t, b) > J.R * 2);
    }
  }
  assert.equal(X.markazga(80, 200), 0);
  assert.equal(X.markazga(520, 200), 180);
  assert.equal(X.markazga(300, 50), 270);
  assert.equal(X.markazga(300, 350), 90);
  assert.equal(X.maydon(oyinchilar(9)).tanklar.length, 8, "8 tadan oshmaydi");
});

test("harakatlarni yozib olish: asl maydon o'zgarmaydi, harakatlar va argumentlar to'g'ri", () => {
  const m = X.maydon(oyinchilar(3));
  const oldin = JSON.stringify(m);
  const r = X.yozibOl(m, "o0", "move(50)", py);
  assert.equal(r.xato, null);
  assert.deepEqual(r.harakatlar, [{ h: "move", a: 50 }]);
  assert.equal(JSON.stringify(m), oldin, "asl holat o'zgarmadi");
  // Bir raundda bitta harakat (muallif qarori 2026-10-06): ikkinchisi — xato, hech narsa yuborilmaydi
  const kop = X.yozibOl(m, "o0", "fire()\nfire()\nfire()", py);
  assert.ok(kop.xato && /bitta buyruq/.test(kop.xato.text), kop.xato && kop.xato.text);
  assert.deepEqual(kop.harakatlar, []);
  const sikl = X.yozibOl(m, "o1", "for i in range(20): right(10)", py);
  assert.ok(sikl.xato);
  assert.deepEqual(sikl.harakatlar, []);
  // Ma'lumot buyruqlari cheklanmaydi
  const malumot = X.yozibOl(m, "o0", "print(scan(), radar(), hp(), ammo())\nfire()", py);
  assert.equal(malumot.xato, null);
  assert.deepEqual(malumot.harakatlar, [{ h: "fire", a: 0 }]);
  const xato = X.yozibOl(m, "o2", "move(", py);
  assert.ok(xato.xato);
  assert.deepEqual(xato.harakatlar, []);
  const tur = X.yozibOl(m, "o2", 'move("abc")', py);
  assert.ok(tur.xato, "matn argument — xato");
  const scan = X.yozibOl(m, "o0", "if scan() == -1: left(radar())", py);
  assert.equal(scan.xato, null);
});

test("birinchi tank yiqilgan bo'lsa ham boshqalar harakat yoza oladi", () => {
  const m = X.maydon(oyinchilar(3));
  X.tank(m, "o0").tirik = false;
  assert.deepEqual(X.yozibOl(m, "o1", "move(10)", py).harakatlar, [{ h: "move", a: 10 }]);
});

test("harakatlarni tekshirish: noma'lum nom, uzunlik, son emas — rad etiladi; argument chegaralanadi", () => {
  assert.equal(X.harakatlarToza(["move", "left"], [50, -30]), null, "bir raundda bittadan ko'p — rad");
  assert.deepEqual(X.harakatlarToza(["left"], [-30]), [{ h: "left", a: -30 }]);
  assert.deepEqual(X.harakatlarToza(["back"], [-40]), [{ h: "back", a: 40 }]);
  assert.deepEqual(X.harakatlarToza(["move"], [99999]), [{ h: "move", a: 600 }]);
  assert.equal(X.harakatlarToza(["scan"], [0]), null);
  assert.equal(X.harakatlarToza(["move"], ["50"]), null);
  assert.equal(X.harakatlarToza(["move", "move"], [1]), null);
  assert.equal(X.harakatlarToza(new Array(9).fill("fire"), new Array(9).fill(0)), null);
});

// Ikki tankni y=100 chizig'iga, 260 birlik oraliqda yuzma-yuz qo'yamiz (to'siqlar y 150–250 da)
// Ikki tank yuzma-yuz, ochiq yo'lakda: y = 370 — panalar (y ≤ 310) va uchinchi tankning tug'ilish joyi (300, 50) dan tashqarida
function yuzmaYuz(m, a, b) {
  Object.assign(X.tank(m, a), { x: 100, y: 370, burchak: 0 });
  Object.assign(X.tank(m, b), { x: 360, y: 370, burchak: 180 });
  return m;
}

test("raund navbatma-navbat bajariladi: hammaning 1-harakati, keyin 2-si", () => {
  // Ikki tank bir-biriga qaragan: ikkalasi ham bir xil raundda o'q uzadi — tartibdan qat'i nazar ikkalasiga tegadi
  const m = yuzmaYuz(X.maydon(oyinchilar(2)), "o0", "o1");
  const yozuv = X.raundniBajar(m, ["o1", "o0"], { o0: [{ h: "fire", a: 0 }], o1: [{ h: "fire", a: 0 }] });
  assert.equal(m.raund, 1);
  const oqlar = yozuv.filter((y) => y.t === "oq").map((y) => y.id);
  assert.deepEqual(oqlar, ["o1", "o0"], "tartib bo'yicha");
  assert.equal(X.tank(m, "o0").jon + X.tank(m, "o1").jon, X.JON * 2 - 2);
  assert.deepEqual(m.tg, { o0: 1, o1: 1 });
  // navbatma-navbat: 1-qadamda o0 buriladi, o1 yuradi; 2-qadamda o0 yuradi
  const m2 = X.maydon(oyinchilar(2));
  const y2 = X.raundniBajar(m2, ["o0", "o1"], { o0: [{ h: "left", a: 90 }, { h: "move", a: 10 }], o1: [{ h: "move", a: 10 }] });
  assert.deepEqual(y2.map((y) => y.t + ":" + y.id), ["burul:o0", "yur:o1", "yur:o0"]);
});

test("yiqilish, g'olib, reyting va vaqt tugashi", () => {
  const m = yuzmaYuz(X.maydon(oyinchilar(3)), "o0", "o1");
  for (let k = 0; k < 3 && !m.tugadi; k++) X.raundniBajar(m, ["o0", "o1", "o2"], { o0: [{ h: "fire", a: 0 }] });
  assert.equal(X.tank(m, "o1").tirik, false, "o0 qarshisidagi o1 ni uch marta urdi");
  assert.equal(m.yiqildi.o1, 3);
  assert.equal(m.tg.o0, 3);
  assert.equal(m.tugadi, null, "ikki tank tirik — jang davom etadi");
  assert.deepEqual(X.reyting(m).slice(-1), ["o1"]);
  for (let k = 0; k < 50; k++) X.raundniBajar(m, ["o0", "o2"], {});
  assert.equal(m.tugadi, null, "raundlar soni jangni tugatmaydi");
  X.vaqtTugadi(m);
  assert.equal(m.tugadi, "tugadi");
  assert.equal(X.golib(m), "o0", "joni teng, lekin ko'proq tekkazgan");
  const d = X.maydon(oyinchilar(2));
  X.vaqtTugadi(d);
  assert.equal(X.golib(d), null, "hammasi teng — durang");
});

test("paketlar onlayn xabar tekshiruvidan o'tadi va holat qayta tiklanadi", () => {
  const m = X.maydon(oyinchilar(8));
  const tartib = X.tartibYasa(m, [], () => 0.3);
  // Har bola bitta harakat (bir raundda bitta buyruq)
  const harakat = Object.fromEntries(tartib.map((id, i) => [id, [i % 3 === 0 ? { h: "left", a: 10 * i } : i % 3 === 1 ? { h: "move", a: 20 } : { h: "fire", a: 0 }]]));
  const np = X.natijaPaketi(m, tartib, harakat);
  const hp = X.holatPaketi(m, 30);
  const tur = ["lobbi", "holat", "natija", "kirdi", "harakat"];
  assert.ok(O.validMessage({ type: "natija", data: np, t: 1, from: "host" }, tur), "natija paketi");
  assert.ok(O.validMessage({ type: "holat", data: hp, t: 1, from: "host" }, tur), "holat paketi");
  assert.ok(O.validMessage({ type: "harakat", data: { r: 1, h: ["move"], a: [50] }, t: 1, from: "k7f3a9" }, tur));
  // Bola qurilmasi natija paketidan raundni aynan qayta o'ynaydi
  const nusxa = X.maydon(oyinchilar(8));
  const { tartib: t2, harakatlar } = X.natijaniOch(np);
  X.raundniBajar(m, tartib, harakat);
  X.raundniBajar(nusxa, t2, harakatlar);
  assert.deepEqual(X.holatPaketi(nusxa, 0), X.holatPaketi(m, 0), "deterministik");
  const b = X.holatniQoy(X.maydon(oyinchilar(8)), X.holatPaketi(m, 0));
  assert.deepEqual(X.holatPaketi(b, 0), X.holatPaketi(m, 0));
});

test("oxirgi holat paketida ids reyting tartibida (server natijani shundan yozadi)", () => {
  const m = yuzmaYuz(X.maydon(oyinchilar(3)), "o0", "o1");
  for (let k = 0; k < 3; k++) X.raundniBajar(m, ["o0", "o1", "o2"], { o0: [{ h: "fire", a: 0 }] });
  X.vaqtTugadi(m);
  const p = X.holatPaketi(m, 0);
  assert.equal(p.tugadi, 1);
  assert.deepEqual(p.ids, X.reyting(m));
  assert.equal(p.golib, "o0");
});

test("tartib — kim oldin yuborgan; bittadan jon qolib bir-biriga otsa, birinchi yuborgan yutadi", () => {
  const m = X.maydon(oyinchilar(3));
  assert.deepEqual(X.tartibYasa(m, ["o2", "o0"], () => 0).slice(0, 2), ["o2", "o0"]);
  assert.equal(X.tartibYasa(m, ["o2", "o0"], () => 0).length, 3, "yubormagan ham ro'yxatda (oxirida)");
  for (const [birinchi, ikkinchi] of [["o0", "o1"], ["o1", "o0"]]) {
    const d = yuzmaYuz(X.maydon(oyinchilar(2)), "o0", "o1");
    X.tank(d, "o0").jon = 1;
    X.tank(d, "o1").jon = 1;
    const otish = { o0: [{ h: "fire", a: 0 }], o1: [{ h: "fire", a: 0 }] };
    X.raundniBajar(d, X.tartibYasa(d, [birinchi, ikkinchi]), otish);
    assert.equal(X.tank(d, birinchi).tirik, true, birinchi + " oldin yubordi — tirik");
    assert.equal(X.tank(d, ikkinchi).tirik, false);
    assert.equal(X.golib(d), birinchi);
  }
});

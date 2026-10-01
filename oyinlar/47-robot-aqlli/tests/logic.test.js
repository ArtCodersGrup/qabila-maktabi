// 47-o'yin mantiqi: takror va agar bloklari bilan dastur bajarish.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const D = require("../../umumiy/js/dastur.js");

const { yur, takror, agar } = L;

test("yur: oddiy qadamlar, chekka va tosh", () => {
  const f = L.maydon({ x: 0, y: 0 }, { x: 2, y: 0 }, [{ x: 1, y: 1 }]);
  assert.equal(L.bajar(f, [yur("right"), yur("right")]).status, "goal");
  assert.equal(L.bajar(f, [yur("left")]).status, "edge");
  assert.equal(L.bajar(f, [yur("down"), yur("right")]).status, "wall");
  assert.equal(L.bajar(f, [yur("right")]).status, "end", "buyruq tugadi, lekin gulxanga yetmadi");
  // Gulxanga yetgach qolgan buyruqlar bajarilmaydi
  const r = L.bajar(f, [yur("right"), yur("right"), yur("down"), yur("down")]);
  assert.equal(r.status, "goal");
  assert.deepEqual(r.at, { x: 2, y: 0 });
});

test("takror: ichidagini n marta bajaradi, ichma-ich ham ishlaydi", () => {
  const f = L.maydon({ x: 0, y: 0 }, { x: 4, y: 0 });
  assert.equal(L.bajar(f, [takror(4, [yur("right")])]).status, "goal");
  assert.equal(L.bajar(f, [takror(3, [yur("right")])]).status, "end");
  // Ichma-ich: 2 × 2 = 4 qadam
  assert.equal(L.bajar(f, [takror(2, [takror(2, [yur("right")])])]).status, "goal");
  // Takror ichidagi qadam chekkaga olib borsa — to'xtaydi
  assert.equal(L.bajar(f, [takror(9, [yur("right")])]).status, "goal");
  assert.equal(L.bajar(L.maydon({ x: 0, y: 0 }, { x: 0, y: 4 }), [takror(9, [yur("up")])]).status, "edge");
});

test("agar: yo'l bo'sh bo'lsa ichi, aks holda aks", () => {
  const ochiq = L.maydon({ x: 0, y: 1 }, { x: 2, y: 1 });
  const tosiq = L.maydon({ x: 0, y: 1 }, { x: 2, y: 1 }, [{ x: 1, y: 1 }]);
  const dastur = [agar("right", [yur("right"), yur("right")], [yur("down"), yur("right"), yur("right"), yur("up")])];
  assert.equal(L.bajar(ochiq, dastur).status, "goal", "yo'l bo'sh — to'g'ri yuradi");
  assert.equal(L.bajar(tosiq, dastur).status, "goal", "tosh bor — aylanib o'tadi");
  // bosh(): chekka ham "bo'sh emas" hisoblanadi
  assert.equal(L.bosh(ochiq, { x: 0, y: 1 }, "left"), false);
  assert.equal(L.bosh(ochiq, { x: 0, y: 1 }, "right"), true);
  assert.equal(L.bosh(tosiq, { x: 0, y: 1 }, "right"), false);
});

test("cheksiz takror to'xtatiladi", () => {
  const f = L.maydon({ x: 2, y: 2 }, { x: 4, y: 4 });
  // O'ngga yurib, chapga qaytadigan abadiy sikl — qadam chegarasida to'xtaydi
  const r = L.bajar(f, [takror(1000, [yur("right"), yur("left")])]);
  assert.equal(r.status, "uzun");
  assert.ok(r.qadam <= L.QADAM_CHEGARA + 1);
});

// O'yinning asosiy da'vosi: har darajaning namunali yechimi haqiqatan ishlaydi
test("har darajaning yechimi hamma maydonda gulxanga yetadi va blok chegarasiga sig'adi", () => {
  for (const [nom, list] of Object.entries(L.DARAJALAR)) {
    for (const lvl of list) {
      const t = L.tekshir(lvl, lvl.yechim);
      assert.equal(t.ok, true, nom + "/" + lvl.id + ": " + t.natijalar.map((n) => n.status).join(","));
      assert.equal(t.uzun, false, nom + "/" + lvl.id + ": yechim blok chegarasidan uzun");
      assert.ok(L.soni(lvl.yechim) <= lvl.maxBlok, lvl.id);
    }
  }
});

// 2- va 3-bosqichning butun mazmuni shunda: bitta dastur bir nechta maydonda ishlashi kerak
test("agar/birga darajalarida bitta maydonga moslangan dastur o'tmaydi", () => {
  for (const lvl of [...L.AGAR, ...L.BIRGA]) {
    assert.ok(lvl.maydonlar.length >= 2, lvl.id + ": kamida ikki maydon bo'lishi kerak");
    // Faqat to'g'riga yurish — bir maydonda ishlashi mumkin, hammasida emas
    const sodda = [takror(9, [yur("right")])];
    assert.equal(L.yechdi(lvl.maydonlar, sodda), false, lvl.id + ": shartsiz dastur o'tib ketdi");
  }
});

test("darajalar ekranga sig'adi va bloklar ro'yxati to'g'ri", () => {
  const ruxsat = ["right", "left", "up", "down", "takror", "agar"];
  for (const [nom, list] of Object.entries(L.DARAJALAR)) {
    for (const lvl of list) {
      assert.ok(lvl.matn.length > 15, lvl.id);
      for (const b of lvl.bloklar) assert.ok(ruxsat.includes(b), lvl.id + ": " + b);
      for (const f of lvl.maydonlar) {
        assert.ok(f.w <= 6 && f.h <= 5, lvl.id + ": maydon katta");
        assert.ok(D.solve(f) !== null, lvl.id + ": yo'l yo'q");
      }
      // Yechimda faqat ruxsat etilgan bloklar ishlatilgan
      const ishlatilgan = (list2) => list2.flatMap((b) => b.t === "yur" ? [b.yon]
        : b.t === "takror" ? ["takror"].concat(ishlatilgan(b.ichi))
        : ["agar"].concat(ishlatilgan(b.ichi), ishlatilgan(b.aks)));
      for (const b of ishlatilgan(lvl.yechim)) assert.ok(lvl.bloklar.includes(b), lvl.id + ": yechimda ruxsatsiz blok " + b);
    }
  }
});

test("daraja(): chegaradan oshsa, oxirgisini beradi", () => {
  assert.equal(L.daraja("takror", 0).id, "yolak");
  assert.equal(L.daraja("takror", 99).id, L.TAKROR[L.TAKROR.length - 1].id);
  assert.equal(L.daraja("birga", 1).id, "ikki-tosh");
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  for (const list of Object.values(L.DARAJALAR)) {
    for (const lvl of list) assert.ok(!/['’`´]/.test(lvl.matn), lvl.matn);
  }
});

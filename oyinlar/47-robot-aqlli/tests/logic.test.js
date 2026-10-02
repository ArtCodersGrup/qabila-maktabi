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

// ---------- 2026-10-02: daraja generatori ----------
function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const RUXSAT = ["right", "left", "up", "down", "takror", "agar"];
const ishlatilgan = (list) => list.flatMap((b) => (b.t === "yur" ? [b.yon]
  : b.t === "takror" ? ["takror"].concat(ishlatilgan(b.ichi))
    : ["agar"].concat(ishlatilgan(b.ichi), ishlatilgan(b.aks))));

test("generator: har bosqich va tier da namunali yechim ishlaydi, maydon ekranga sig'adi, takror yo'q", () => {
  for (const bosqich of ["takror", "agar", "birga"]) {
    for (const tier of [0, 1, 2]) {
      const rng = rngFrom(47 + tier * 7 + bosqich.length);
      const idlar = new Set();
      let prev = null;
      for (let k = 0; k < 200; k++) {
        const lvl = L.yasa(bosqich, prev, rng, tier);
        const nom = `${bosqich}/${tier}/${lvl.id}`;
        if (prev) assert.notEqual(lvl.id, prev.id, "ketma-ket bir xil daraja");
        idlar.add(lvl.id);
        const t = L.tekshir(lvl, lvl.yechim);
        assert.equal(t.ok, true, nom + ": " + t.natijalar.map((n) => n.status).join(","));
        assert.equal(t.uzun, false, nom + ": yechim blok chegarasidan uzun");
        assert.ok(lvl.matn.length > 15 && !/['’`´]/.test(lvl.matn), nom);
        for (const b of lvl.bloklar) assert.ok(RUXSAT.includes(b), nom + ": " + b);
        for (const b of ishlatilgan(lvl.yechim)) assert.ok(lvl.bloklar.includes(b), nom + ": yechimda ruxsatsiz blok " + b);
        for (const f of lvl.maydonlar) {
          assert.ok(f.w <= 6 && f.h <= 5, nom + ": maydon katta " + f.w + "×" + f.h);
          assert.ok(D.solve(f) !== null, nom + ": yo'l yo'q");
          assert.ok(!D.sameCell(f.robot, f.goal), nom);
        }
        // Takror soni tugmada bor (2…6)
        const sonlar = (list) => list.flatMap((b) => (b.t === "takror" ? [b.n].concat(sonlar(b.ichi)) : b.t === "agar" ? sonlar(b.ichi).concat(sonlar(b.aks)) : []));
        for (const n of sonlar(lvl.yechim)) assert.ok(n >= 2 && n <= 6, nom + ": takror " + n);
        prev = lvl;
      }
      assert.ok(idlar.size >= 8, `${bosqich}/${tier}: faqat ${idlar.size} xil daraja`);
    }
  }
});

test("generator, takror: takrorsiz (faqat qadamlar bilan) blok chegarasiga sig'maydi", () => {
  for (const tier of [0, 1, 2]) {
    const rng = rngFrom(11 + tier);
    for (let k = 0; k < 200; k++) {
      const lvl = L.yasa("takror", null, rng, tier);
      assert.equal(lvl.maydonlar.length, 1);
      const engQisqa = D.solve(lvl.maydonlar[0]).length;
      assert.ok(engQisqa > lvl.maxBlok, `${lvl.id}: ${engQisqa} qadam ${lvl.maxBlok} blokka sig'adi — takror shart emas`);
      assert.ok(ishlatilgan(lvl.yechim).includes("takror"));
    }
  }
});

test("generator, agar/birga: shartsiz dastur hamma maydondan o'tolmaydi", () => {
  for (const bosqich of ["agar", "birga"]) {
    for (const tier of [0, 1, 2]) {
      const rng = rngFrom(23 + tier);
      for (let k = 0; k < 200; k++) {
        const lvl = L.yasa(bosqich, null, rng, tier);
        assert.equal(lvl.maydonlar.length, 2, lvl.id);
        assert.notEqual(lvl.maydonlar[0].id, lvl.maydonlar[1].id, lvl.id + ": maydonlar bir xil");
        // Ikkala maydonning toshlari birga — hech qanday qotirilgan yo'l qolmaydi
        assert.equal(L.shartsizYolYoq(lvl.maydonlar), true, lvl.id + ": agarsiz yo'l bor");
        // Har maydonning o'z eng qisqa yo'li ikkinchisida ishlamaydi
        const [a, b] = lvl.maydonlar;
        const yolA = D.solve(a).map((yon) => yur(yon));
        const yolB = D.solve(b).map((yon) => yur(yon));
        assert.equal(L.yechdi(lvl.maydonlar, yolA), false, lvl.id);
        assert.equal(L.yechdi(lvl.maydonlar, yolB), false, lvl.id);
        assert.ok(ishlatilgan(lvl.yechim).includes("agar"));
        if (bosqich === "birga") assert.ok(ishlatilgan(lvl.yechim).includes("takror"));
      }
    }
  }
});

test("generator: tier bilan qiyinlashadi", () => {
  const rng = rngFrom(5);
  const namuna = (bosqich, tier) => Array.from({ length: 150 }, () => L.yasa(bosqich, null, rng, tier));
  // takror: tier 0 — yo'lak/burchak, tier 2 — zina/uchlik (takror ichida 2–3 buyruq)
  assert.ok(namuna("takror", 0).every((l) => /^(yolak|burchak)/.test(l.id)));
  assert.ok(namuna("takror", 2).every((l) => /^(zina|uchlik)/.test(l.id)));
  // agar: tier 0 da tosh robot yonida; tier 2 da agar dan oldin 1–2 qadam bor
  assert.ok(namuna("agar", 0).every((l) => l.yechim[0].t === "agar"));
  assert.ok(namuna("agar", 2).every((l) => l.yechim[0].t === "yur"));
  // birga: yo'lak uzayadi, toshlar ko'payadi
  const tosh = (l) => l.maydonlar.reduce((n, f) => n + f.walls.length, 0);
  const ortacha = (list) => list.reduce((n, l) => n + tosh(l), 0) / list.length;
  assert.ok(namuna("birga", 0).every((l) => Math.max(l.maydonlar[0].w, l.maydonlar[0].h) === 5));
  assert.ok(namuna("birga", 2).every((l) => Math.max(l.maydonlar[0].w, l.maydonlar[0].h) === 6));
  assert.ok(ortacha(namuna("birga", 2)) > ortacha(namuna("birga", 0)));
});

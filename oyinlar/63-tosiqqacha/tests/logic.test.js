// 63-o'yin «To'siqqacha» mantiqi: toki (while) va gulxangacha vazifalari generatori.
const test = require("node:test");
const assert = require("node:assert/strict");
const B = require("../../umumiy/js/blok.js");
const D = require("../../umumiy/js/dastur.js");
const L = require("../js/logic.js");

const { yur, takror, toki } = B;

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const BOSQICHLAR = ["tosiq", "gulxan", "birga"];
const RUXSAT = ["right", "left", "up", "down", "takror", "agar", "toki", "gulxangacha"];

// Yechimda ishlatilgan blok turlari (pad tugmalari nomi bilan)
const ishlatilgan = (list) => list.flatMap((b) => (b.t === "yur" ? [b.yon]
  : [b.t].concat(b.yon ? [b.yon] : [], ishlatilgan(b.ichi || []), ishlatilgan(b.aks || []))));

// Har bosqich × tier uchun 200 ta ketma-ket vazifa
function vazifalar(bosqich, tier, seed) {
  const rng = rngFrom(seed);
  const out = [];
  let prev = null;
  for (let k = 0; k < 200; k++) {
    const lvl = L.yasa(bosqich, prev, rng, tier);
    out.push({ lvl, prev });
    prev = lvl;
  }
  return out;
}

test("ko'rsatuv namunalari: yechim ikkala maydonda ishlaydi, sodda dastur bittasida yiqiladi", () => {
  for (const [nom, lvl] of Object.entries(L.KORSATUV)) {
    assert.equal(lvl.maydonlar.length, 2, nom);
    for (const f of lvl.maydonlar) assert.equal(B.bajar(f, lvl.yechim).status, "goal", nom);
    assert.ok(L.qotirilganYolYoq(lvl.maydonlar), nom);
    if (lvl.sodda) {
      const st = lvl.maydonlar.map((f) => B.bajar(f, lvl.sodda).status);
      assert.equal(st[0], "goal", nom + ": sodda dastur birinchi maydonda ishlashi kerak");
      assert.notEqual(st[1], "goal", nom + ": sodda dastur ikkinchi maydonda yiqilishi kerak");
    }
  }
});

test("generator: har bosqich × tier — yechim, blok chegarasi, maydon o'lchami, ketma-ket takror yo'q", () => {
  BOSQICHLAR.forEach((bosqich, bi) => {
    for (const tier of [0, 1, 2]) {
      const idlar = new Set();
      for (const { lvl, prev } of vazifalar(bosqich, tier, 63 + bi * 31 + tier * 7)) {
        const nom = `${bosqich}/${tier}/${lvl.id}`;
        if (prev) assert.notEqual(lvl.id, prev.id, nom + ": ketma-ket bir xil");
        idlar.add(lvl.id);
        assert.equal(lvl.maydonlar.length, 2, nom);
        for (const f of lvl.maydonlar) {
          assert.equal(B.bajar(f, lvl.yechim).status, "goal", nom);
          assert.ok(f.w <= 8 && f.h <= 6, nom + ": maydon katta " + f.w + "×" + f.h);
          assert.ok(!D.sameCell(f.robot, f.goal), nom);
        }
        assert.ok(B.soni(lvl.yechim) <= lvl.maxBlok, nom);
        assert.ok(lvl.matn.length > 15 && !/['’`´]/.test(lvl.matn), nom);
        assert.ok(lvl.maslahat && !/['’`´]/.test(lvl.maslahat), nom);
        for (const b of lvl.bloklar) assert.ok(RUXSAT.includes(b), nom + ": " + b);
        assert.equal(new Set(lvl.bloklar).size, lvl.bloklar.length, nom + ": tugmalar takrorlangan");
        for (const b of ishlatilgan(lvl.yechim)) assert.ok(lvl.bloklar.includes(b), nom + ": yechimda ruxsatsiz blok " + b);
      }
      assert.ok(idlar.size >= 15, `${bosqich}/${tier}: faqat ${idlar.size} xil vazifa`);
    }
  });
});

test("qulf: sezgisiz (yur/takror) dastur ikkala maydonni yecha olmaydi; D.solve yo'llari farq qiladi", () => {
  BOSQICHLAR.forEach((bosqich, bi) => {
    for (const tier of [0, 1, 2]) {
      for (const { lvl } of vazifalar(bosqich, tier, 7 + bi * 13 + tier)) {
        const nom = `${bosqich}/${tier}/${lvl.id}`;
        const [a, b] = lvl.maydonlar;
        assert.ok(L.qotirilganYolYoq(lvl.maydonlar), nom + ": qotirilgan yo'l bor");
        const yolA = D.solve(a);
        const yolB = D.solve(b);
        assert.notDeepEqual(yolA, yolB, nom + ": eng qisqa yo'llar bir xil");
        // Har maydonning eng qisqa yo'li ikkinchisida ishlamaydi
        assert.notEqual(B.bajar(b, yolA.map(yur)).status, "goal", nom);
        assert.notEqual(B.bajar(a, yolB.map(yur)).status, "goal", nom);
        // Rejadagi qulf: har toki / gulxangacha o'rniga takror(n, [yur(d)]) — ikkala maydonda birdan o'tmaydi
        for (let i = 0; i < lvl.yechim.length; i++) {
          if (lvl.yechim[i].t === "yur") continue; // faqat toki / gulxangacha o'rniga
          for (const d of B.YONLAR) {
            for (let n = 1; n <= 9; n++) {
              const v = lvl.yechim.slice();
              v[i] = takror(n, [yur(d)]);
              const ikkalasi = lvl.maydonlar.every((f) => B.bajar(f, v).status === "goal");
              assert.equal(ikkalasi, false, `${nom}: ${i}-blok o'rniga takror ${n} [${d}] o'tdi`);
            }
          }
        }
      }
    }
  });
});

test("qulf: 1-bosqichda birinchi yo'lak uzunligi ikki maydonda har xil", () => {
  for (const tier of [0, 1, 2]) {
    for (const { lvl } of vazifalar("tosiq", tier, 99 + tier)) {
      const d1 = lvl.yechim[0].yon;
      const uzun = (f) => {
        let n = 0;
        let at = f.robot;
        while (B.bosh(f, at, d1)) { at = B.qoshni(at, d1); n++; }
        return n;
      };
      assert.notEqual(uzun(lvl.maydonlar[0]), uzun(lvl.maydonlar[1]), lvl.id);
      assert.equal(lvl.yechim[0].t, "toki", lvl.id);
      assert.ok(lvl.bloklar.includes("takror") && lvl.bloklar.includes("toki"), lvl.id + ": takror chalg'ituvchi sifatida bor");
    }
  }
});

test("qulf: 2–3-bosqichda takror bloki yo'q (takror 9 gulxangacha o'rnini bosmasin)", () => {
  for (const bosqich of ["gulxan", "birga"]) {
    for (const tier of [0, 1, 2]) {
      for (const { lvl } of vazifalar(bosqich, tier, 5 + tier)) {
        assert.ok(!lvl.bloklar.includes("takror"), lvl.id);
        assert.equal(lvl.yechim[0].t, "gulxangacha", lvl.id);
      }
    }
  }
});

test("2-bosqich: gulxangacha [toki, yur] varianti ham ishlaydi; 3-bosqichda agar yo'q, ichida toki bor", () => {
  for (const tier of [0, 1, 2]) {
    for (const { lvl } of vazifalar("gulxan", tier, 41 + tier)) {
      const d1 = lvl.yechim[0].ichi[0].yon;
      const d2 = lvl.yechim[0].ichi[0].aks[0].yon;
      const ikkinchi = [B.gulxangacha([toki(d1, [yur(d1)]), yur(d2)])];
      for (const f of lvl.maydonlar) assert.equal(B.bajar(f, ikkinchi).status, "goal", lvl.id);
    }
    for (const { lvl } of vazifalar("birga", tier, 43 + tier)) {
      assert.ok(!lvl.bloklar.includes("agar"), lvl.id);
      assert.equal(lvl.yechim[0].ichi[0].t, "toki", lvl.id);
    }
  }
});

test("bo'sh toki([]) — uzun (takror to'xtamaydi)", () => {
  for (const bosqich of BOSQICHLAR) {
    for (const { lvl } of vazifalar(bosqich, 1, 17)) {
      for (const f of lvl.maydonlar) {
        // Robot boshida birinchi bo'sh tomon
        const d = B.YONLAR.find((yon) => B.bosh(f, f.robot, yon));
        assert.equal(B.bajar(f, [toki(d, [])]).status, "uzun", lvl.id);
      }
    }
  }
});

test("tier bilan qiyinlashadi", () => {
  const rng = rngFrom(3);
  const namuna = (bosqich, tier) => Array.from({ length: 120 }, () => L.yasa(bosqich, null, rng, tier));
  const tokiSoni = (l) => l.yechim.filter((b) => b.t === "toki").length;
  assert.ok(namuna("tosiq", 0).every((l) => tokiSoni(l) === 1));
  assert.ok(namuna("tosiq", 1).every((l) => tokiSoni(l) === 2));
  assert.ok(namuna("tosiq", 2).every((l) => tokiSoni(l) === 3));
  const qadam = (l) => Math.max(...l.maydonlar.map((f) => D.solve(f).length));
  const ortacha = (list) => list.reduce((s, l) => s + qadam(l), 0) / list.length;
  assert.ok(ortacha(namuna("gulxan", 2)) > ortacha(namuna("gulxan", 0)));
  assert.ok(ortacha(namuna("birga", 2)) > ortacha(namuna("birga", 0)));
});

test("zaxira: tasodif omadsiz kelsa ham oldingisi bilan bir xil emas", () => {
  const omadsiz = () => 0; // har safar bir xil son — generator null yoki bir xil vazifa beradi
  for (const bosqich of BOSQICHLAR) {
    const a = L.yasa(bosqich, null, omadsiz, 0);
    const b = L.yasa(bosqich, a, omadsiz, 0);
    assert.notEqual(a.id, b.id, bosqich);
    for (const f of b.maydonlar) assert.equal(B.bajar(f, b.yechim).status, "goal", bosqich);
  }
});

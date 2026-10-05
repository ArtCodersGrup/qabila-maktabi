// 62-o'yin «Oʻz buyrugʻim» mantiqi: vazifa generatori va "★ siz sig'maydi" qulfi.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const B = require("../../umumiy/js/blok.js");
const D = require("../../umumiy/js/dastur.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const BOSQICHLAR = ["tayyor", "yasa", "ikki"];
const PAD = ["right", "left", "up", "down", "takror", "yulduz", "doira"];

// Yechimda ishlatilgan bloklar (pad nomlari bilan)
const ishlatilgan = (list) => list.flatMap((b) => (b.t === "yur" ? [b.yon]
  : b.t === "takror" ? ["takror"].concat(ishlatilgan(b.ichi))
    : b.t === "chaqir" ? [b.nom] : ["?" + b.t]));
const takrorSonlari = (list) => list.flatMap((b) => (b.t === "takror" ? [b.n].concat(takrorSonlari(b.ichi)) : []));

function tekshirVazifa(lvl, nom) {
  const fn = lvl.yechimFn || lvl.fn;
  // namunali yechim hamma maydonda gulxanga yetadi va chegaraga sig'adi
  for (const f of lvl.maydonlar) {
    const r = B.bajar(f, lvl.yechim, { fn });
    assert.equal(r.status, "goal", nom + ": " + r.status);
    assert.ok(f.w <= 8 && f.h <= 6, nom + ": maydon katta " + f.w + "×" + f.h);
    assert.ok(!D.sameCell(f.robot, f.goal), nom);
  }
  assert.ok(B.soni(lvl.yechim, fn) <= lvl.maxBlok, nom + ": yechim chegaradan uzun");
  assert.equal(B.soni(lvl.yechim, fn), lvl.maxBlok, nom + ": maxBlok = namunali yechim");
  // Qulf: funksiyasiz (o'q + takror) sig'maydi; tor yo'l yagona (yorliq yo'q)
  assert.ok(B.ixchamNarx(lvl.yurishlar) > lvl.maxBlok,
    nom + ": ★ siz " + B.ixchamNarx(lvl.yurishlar) + " blok, chegara " + lvl.maxBlok);
  assert.equal(D.solve(lvl.maydonlar[0]).length, lvl.yurishlar.length, nom + ": yorliq bor");
  assert.equal(B.bajar(lvl.maydonlar[0], lvl.yurishlar.map((y) => B.yur(y))).status, "goal", nom + ": yo'l maydonga mos emas");
  // Ekran: bloklar ro'yxati, matnlar, takror soni tugmada bor (2…9)
  for (const b of lvl.bloklar) assert.ok(PAD.includes(b), nom + ": " + b);
  for (const b of ishlatilgan(lvl.yechim).concat(...Object.values(fn).map(ishlatilgan))) {
    assert.ok(lvl.bloklar.includes(b), nom + ": yechimda ruxsatsiz blok " + b);
  }
  for (const n of takrorSonlari(lvl.yechim)) assert.ok(n >= 2 && n <= 9, nom + ": takror " + n);
  for (const s of [lvl.matn, lvl.maslahat]) {
    assert.ok(s.length > 15 && !/['’`´]/.test(s), nom + ": " + s);
  }
  // Funksiya tanasida faqat o'qlar va takror (chaqiruv yo'q)
  for (const nomFn of Object.keys(fn)) {
    for (const b of ishlatilgan(fn[nomFn])) assert.ok(b !== "yulduz" && b !== "doira", nom + ": funksiya ichida chaqiruv");
    assert.ok(fn[nomFn].length >= 2, nom + ": funksiya juda qisqa");
  }
}

test("generator: har bosqich × tier — 200 vazifa, yechim ishlaydi, qulf bor, ketma-ket takror yo'q", () => {
  for (const bosqich of BOSQICHLAR) {
    for (const tier of [0, 1, 2]) {
      const rng = rngFrom(62 + tier * 13 + bosqich.length);
      const idlar = new Set();
      let prev = null;
      for (let k = 0; k < 200; k++) {
        const lvl = L.yasa(bosqich, prev, rng, tier);
        const nom = `${bosqich}/${tier}/${lvl.id}`;
        if (prev) {
          assert.notEqual(lvl.id, prev.id, nom + ": ketma-ket bir xil vazifa");
          assert.notEqual(lvl.maydonlar[0].id, prev.maydonlar[0].id, nom + ": ketma-ket bir xil maydon");
        }
        idlar.add(lvl.id);
        tekshirVazifa(lvl, nom);
        prev = lvl;
      }
      assert.ok(idlar.size >= 10, `${bosqich}/${tier}: faqat ${idlar.size} xil vazifa`);
    }
  }
});

test("bosqichlar shakli: 1 — ★ tayyor va qulf, 2 — ★ bo'sh, 3 — ★ va ● bo'sh", () => {
  const rng = rngFrom(7);
  for (const tier of [0, 1, 2]) {
    for (let k = 0; k < 40; k++) {
      const a = L.yasa("tayyor", null, rng, tier);
      assert.deepEqual(a.qulf, ["yulduz"]);
      assert.ok(a.fn.yulduz.length >= 2);
      assert.ok(a.bloklar.includes("yulduz") && !a.bloklar.includes("doira"));
      const b = L.yasa("yasa", null, rng, tier);
      assert.deepEqual(b.fn, { yulduz: [] });
      assert.ok(!b.qulf);
      assert.ok(b.yechimFn.yulduz.length >= 2);
      const c = L.yasa("ikki", null, rng, tier);
      assert.deepEqual(c.fn, { yulduz: [], doira: [] });
      assert.ok(c.bloklar.includes("yulduz") && c.bloklar.includes("doira"));
      assert.notEqual(B.pythonMatn(c.yechimFn.yulduz), B.pythonMatn(c.yechimFn.doira), "ikki naqsh bir xil");
      // Har ikki buyruq kamida ikki marta chaqiriladi
      const chaqiruv = (nomFn) => c.tartib.filter((x) => x === nomFn).length;
      assert.ok(chaqiruv("yulduz") >= 2 && chaqiruv("doira") >= 2, c.id);
    }
  }
});

test("tier bilan qiyinlashadi: ★ ko'proq chaqiriladi", () => {
  const rng = rngFrom(5);
  const ortacha = (bosqich, tier) => {
    let s = 0;
    for (let k = 0; k < 120; k++) s += L.yasa(bosqich, null, rng, tier).tartib.length;
    return s / 120;
  };
  for (const bosqich of BOSQICHLAR) {
    assert.ok(ortacha(bosqich, 2) > ortacha(bosqich, 0), bosqich);
  }
  // tier 0 da ★ ikki marta
  for (let k = 0; k < 50; k++) assert.equal(L.yasa("tayyor", null, rng, 0).tartib.length, 2);
});

test("oraliqlar har xil: bitta takror bilan yozib bo'lmaydi", () => {
  const rng = rngFrom(31);
  for (const bosqich of BOSQICHLAR) {
    for (let k = 0; k < 100; k++) {
      const lvl = L.yasa(bosqich, null, rng, k % 3);
      assert.ok(new Set(lvl.oraliqlar).size >= 2, lvl.id);
    }
  }
});

test("ko'rsatuv vazifalari: o'qlar bilan chegaradan oshadi, ★ bilan sig'adi", () => {
  for (const [nom, lvl] of Object.entries(L.KORSATUV)) {
    assert.ok(lvl, nom);
    tekshirVazifa(lvl, "korsatuv/" + nom);
    const oqlar = L.oqlarBilan(lvl);
    assert.ok(B.soni(oqlar) > lvl.maxBlok, nom);
    assert.equal(B.bajar(lvl.maydonlar[0], oqlar).status, "goal", nom);
  }
  // 2-bosqich ko'rsatuvi ham 1-bosqich namunasidan foydalanadi: ★ to'liq bo'lsa yo'l o'tadi, bo'sh bo'lsa — yo'q
  const t = L.KORSATUV.tayyor;
  assert.notEqual(B.bajar(t.maydonlar[0], t.yechim, { fn: { yulduz: [] } }).status, "goal");
});

test("ixcham: B.ixchamNarx bilan bir xil narx va o'sha yo'lni yuradi", () => {
  const rng = rngFrom(99);
  for (let k = 0; k < 300; k++) {
    const n = B.randInt(1, 14, rng);
    const tok = Array.from({ length: n }, () => B.pick(["right", "down", "right", "up"], rng));
    const p = L.ixcham(tok);
    assert.equal(B.soni(p), B.ixchamNarx(tok), tok.join(","));
    const r = B.bajar(B.maydon({ x: 0, y: 20 }, { x: 39, y: 39 }, [], 40, 40), p);
    const iz = B.iz(tok);
    assert.deepEqual(r.at, { x: iz[iz.length - 1].x, y: 20 + iz[iz.length - 1].y }, tok.join(","));
  }
});

test("zaxira vazifalar ham to'g'ri", () => {
  for (const bosqich of BOSQICHLAR) {
    const list = L.zaxiraOl(bosqich);
    assert.ok(list.length >= 2, bosqich);
    assert.notEqual(list[0].id, list[1].id);
    for (const lvl of list) tekshirVazifa(lvl, "zaxira/" + lvl.id);
  }
});

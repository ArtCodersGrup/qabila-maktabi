// 74-o‘yin: AI loyiha sikli — generatorlar (takrorsiz, tier 0/1/2), javoblarni mustaqil qayta hisoblash, imlo.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const L = require("../js/logic.js");

// Urugʻli tasodifiy sonlar (mulberry32) — test har safar bir xil ketma-ketlikni oladi
function rngFrom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// gen(prev, rng, tier) dan ketma-ket misollar
function ketma(gen, soni, tier, seed) {
  const r = rngFrom(seed || 74);
  const out = [];
  let prev = null;
  for (let k = 0; k < soni; k++) {
    prev = gen(prev, r, tier);
    out.push(prev);
  }
  return out;
}

// ---------- Mustaqil maʼlumot: sikl tartibi testning oʻzida yozilgan ----------
const TARTIB = ["Muammoni belgilash", "Maʼlumot yigʻish", "Maʼlumotni oʻrganish", "Modellash", "Baholash"];
const KALIT = { muammo: 0, yigish: 1, organish: 2, model: 3, baho: 4 };
// Ish matni → bosqich nomi (banklardan mustaqil yigʻilgan)
const ISH_BOSQICHI = new Map();
for (const l of L.LOYIHALAR) l.ishlar.forEach((matn, i) => ISH_BOSQICHI.set(matn, TARTIB[i]));
for (const x of L.QOSHIMCHA) ISH_BOSQICHI.set(x.matn, TARTIB[KALIT[x.b]]);

const TEKSHIR = {
  natija(t) {
    const x = L.NATIJALAR.find((y) => y.matn === t.natija);
    assert.equal(t.javob, TARTIB[KALIT[x.b]], t.id);
    assert.equal(t.variantlar.length, 4);
    for (const v of t.variantlar) assert.ok(TARTIB.includes(v), t.id);
  },
  keyingi(t) {
    const i = KALIT[t.bosqich];
    assert.equal(t.javob, TARTIB[t.keyin ? i + 1 : i - 1], t.id);
    assert.ok(!t.variantlar.includes(TARTIB[i]), `${t.id}: bosqichning oʻzi variant emas`);
  },
  tartib(t) {
    // Harflarni har ishning bosqich raqami boʻyicha saralaymiz
    const togri = t.ishlar.slice().sort((a, b) => TARTIB.indexOf(ISH_BOSQICHI.get(a.matn)) - TARTIB.indexOf(ISH_BOSQICHI.get(b.matn))).map((x) => x.harf).join(" → ");
    assert.equal(t.javob, togri, t.id);
    assert.notEqual(t.ishlar.map((x) => x.harf).join(" → "), togri, `${t.id}: ekrandagi tartib — javob emas`);
    assert.deepEqual(t.ishlar.map((x) => x.harf), ["A", "B", "C", "D", "E"].slice(0, t.ishlar.length));
    assert.equal(new Set(t.ishlar.map((x) => ISH_BOSQICHI.get(x.matn))).size, t.ishlar.length, `${t.id}: har ish boshqa bosqichdan`);
    for (const v of t.variantlar) assert.equal(v.split(" → ").slice().sort().join(""), t.ishlar.map((x) => x.harf).join(""), `${t.id}: har variant — oʻrin almashtirish`);
  },
  etishmaydi(t) {
    const bor = new Set(t.ishlar.map((x) => ISH_BOSQICHI.get(x.matn)));
    assert.equal(bor.size, 4, t.id);
    assert.deepEqual(TARTIB.filter((n) => !bor.has(n)), [t.javob], t.id);
    const raqamlar = t.ishlar.map((x) => TARTIB.indexOf(ISH_BOSQICHI.get(x.matn)));
    assert.deepEqual(raqamlar, raqamlar.slice().sort((a, b) => a - b), `${t.id}: reja sikl tartibida`);
  },
  ish(t) {
    assert.equal(t.javob, ISH_BOSQICHI.get(t.ish), t.id);
    assert.deepEqual(t.variantlar, TARTIB);
  },
  bosqichIshi(t) {
    const kerak = TARTIB[KALIT[t.bosqich]];
    assert.equal(ISH_BOSQICHI.get(t.javob), kerak, t.id);
    assert.equal(t.variantlar.filter((v) => ISH_BOSQICHI.get(v) === kerak).length, 1, `${t.id}: faqat bitta toʻgʻri variant`);
  },
  soat(t) {
    const kerak = TARTIB[KALIT[t.bosqich]];
    let s = 0;
    let n = 0;
    for (const q of t.qatorlar) if (ISH_BOSQICHI.get(q.matn) === kerak) { s += q.soat; n++; }
    assert.equal(t.javob, s, t.id);
    assert.equal(n, 2, `${t.id}: soʻralgan bosqichga ikki qator`);
    assert.equal(t.qatorlar.length, 5);
  },
  tashxis(t) {
    const x = L.TASHXISLAR.find((y) => y.matn === t.vaziyat);
    assert.equal(t.javob, TARTIB[KALIT[x.b]], t.id);
    assert.deepEqual(t.variantlar, TARTIB);
  },
  test(t) {
    if (t.guruhlar) {
      const togri = t.guruhlar.reduce((s, g) => s + g.togri, 0);
      const jami = t.guruhlar.reduce((s, g) => s + g.soni, 0);
      for (const g of t.guruhlar) assert.ok(g.togri >= 0 && g.togri <= g.soni, t.id);
      assert.equal(t.javob * jami, togri * 100, t.id);
      assert.ok(t.guruhlar[1].togri * 2 <= t.guruhlar[1].soni, `${t.id}: kam sinfda model yomon`);
    } else {
      assert.equal(t.javob * t.jami, t.togri * 100, t.id);
      assert.ok(t.matn.includes(`${t.jami} ta yangi misol`) && t.matn.includes(`${t.togri} tasida`), t.id);
    }
    assert.ok(t.javob >= 30 && t.javob < 100, `${t.id}: ${t.javob}`);
  },
  kam(t) {
    assert.equal(t.kop + t.kam, t.jami, t.id);
    assert.equal(t.javob * t.jami, t.kop * 100, t.id);
    assert.ok(t.kam * 5 <= t.jami, `${t.id}: kam sinf 20 % dan oshmaydi`);
    assert.ok(t.matn.includes(`${t.kop} tasi`) && t.matn.includes(`${t.kam} tasi`), t.id);
  },
};

function yaroqli(t) {
  assert.ok(typeof t.matn === "string" && t.matn.length > 10, t.id);
  if (t.variantlar) {
    assert.ok(t.variantlar.length >= 4, `${t.id}: kamida 4 variant`);
    assert.equal(new Set(t.variantlar).size, t.variantlar.length, `${t.id}: variantlar takrorlanmaydi`);
    assert.ok(t.variantlar.includes(t.javob), `${t.id}: javob variantlar ichida`);
    assert.ok(t.ishora && !t.ishora.includes(String(t.javob)), `${t.id}: maslahat javobni aytmaydi`);
    assert.ok(t.nega, t.id);
  } else {
    assert.ok(Number.isInteger(t.javob) && t.javob >= 0 && t.javob < 1000, t.id);
    assert.ok(t.nega && t.hisob, t.id);
    assert.ok(t.hisob.includes(`= ${t.javob} `), `${t.id}: yechimda javob bor`);
  }
  TEKSHIR[t.tur](t);
}

const BOSQICHLAR = [["bosqich1Task", L.bosqich1Task], ["bosqich2Task", L.bosqich2Task], ["bosqich3Task", L.bosqich3Task]];

test("bosqich generatorlari: har tier da 30 ta har xil va yaroqli misol", () => {
  for (const [nom, gen] of BOSQICHLAR) {
    for (const tier of [0, 1, 2]) {
      for (const seed of [74, 5, 2026]) {
        const list = ketma(gen, 30, tier, seed);
        assert.equal(new Set(list.map((t) => t.id)).size, 30, `${nom}, tier ${tier}: takror bor`);
        list.forEach(yaroqli);
      }
    }
  }
});

test("har tur alohida: javob mustaqil hisobga teng; katta banklar 30 ta har xil", () => {
  for (const nom of ["tartibTask", "etishmaydiTask", "bosqichIshiTask", "soatTask", "testTask", "kamTask"]) {
    for (const tier of [0, 1, 2]) {
      const list = ketma(L[nom], 30, tier, 11);
      assert.equal(new Set(list.map((t) => t.id)).size, 30, `${nom}, tier ${tier}`);
      list.forEach(yaroqli);
    }
  }
  for (const nom of ["natijaTask", "keyingiTask", "ishTask", "tashxisTask"]) {
    for (const tier of [0, 1, 2]) ketma(L[nom], 40, tier, 11).forEach(yaroqli);
  }
  assert.equal(new Set(ketma(L.ishTask, 30, 0).map((t) => t.id)).size, 30);
  assert.equal(new Set(ketma(L.natijaTask, 15, 0).map((t) => t.id)).size, 15);
});

test("bank tugasa ham ketma-ket bir xil misol chiqmaydi", () => {
  for (const nom of ["natijaTask", "keyingiTask", "ishTask", "tashxisTask"]) {
    for (const tier of [0, 1, 2]) {
      const list = ketma(L[nom], 60, tier, 3);
      for (let i = 1; i < list.length; i++) assert.notEqual(list[i].id, list[i - 1].id, `${nom}, tier ${tier}`);
    }
  }
});

test("tier qiyinlikni oshiradi", () => {
  assert.deepEqual([0, 1, 2].map((tier) => ketma(L.tartibTask, 1, tier)[0].ishlar.length), [3, 4, 5]);
  const loyihaIshi = new Set(L.LOYIHALAR.flatMap((l) => l.ishlar));
  for (const t of ketma(L.ishTask, 30, 0)) assert.ok(loyihaIshi.has(t.ish), "tier 0 — loyiha ishlari");
  for (const t of ketma(L.ishTask, 12, 2)) assert.ok(!loyihaIshi.has(t.ish), "tier 2 — qoʻshimcha ishlar");
  // tier 1, 2: toʻrt variant ham bitta loyihadan
  for (const t of ketma(L.bosqichIshiTask, 30, 1)) {
    const loyihalar = new Set(t.variantlar.map((v) => L.LOYIHALAR.find((l) => l.ishlar.includes(v)).k));
    assert.equal(loyihalar.size, 1, t.id);
  }
  for (const t of ketma(L.testTask, 30, 0)) assert.ok([10, 20].includes(t.jami));
  for (const t of ketma(L.testTask, 30, 1)) assert.ok([25, 40, 50].includes(t.jami));
  for (const t of ketma(L.testTask, 30, 2)) assert.equal(t.guruhlar.length, 2);
  for (const t of ketma(L.tashxisTask, 7, 0)) assert.equal(L.TASHXISLAR.find((x) => x.matn === t.vaziyat).d, 0);
});

test("bosqichda savol turlari aralashadi", () => {
  assert.deepEqual([...new Set(ketma(L.bosqich1Task, 9, 0).map((t) => t.tur))].sort(), ["keyingi", "natija", "tartib"]);
  assert.deepEqual([...new Set(ketma(L.bosqich1Task, 9, 2).map((t) => t.tur))].sort(), ["etishmaydi", "tartib"]);
  assert.deepEqual([...new Set(ketma(L.bosqich2Task, 9, 2).map((t) => t.tur))].sort(), ["bosqichIshi", "ish", "soat"]);
  assert.deepEqual([...new Set(ketma(L.bosqich3Task, 9, 1).map((t) => t.tur))].sort(), ["kam", "tashxis", "test"]);
});

test("banklar: besh bosqich, har loyihada besh ish, tashxislar har bosqich va har tier da", () => {
  assert.deepEqual(L.NOMLAR, TARTIB);
  assert.deepEqual(L.KALITLAR, Object.keys(KALIT));
  for (const l of L.LOYIHALAR) assert.equal(l.ishlar.length, 5, l.k);
  assert.equal(ISH_BOSQICHI.size, L.LOYIHALAR.length * 5 + L.QOSHIMCHA.length, "ish matnlari takrorlanmaydi");
  for (const k of L.KALITLAR) {
    assert.ok(L.QOSHIMCHA.some((x) => x.b === k), `qoʻshimcha: ${k}`);
    assert.ok(L.NATIJALAR.filter((x) => x.b === k).length >= 3, `natija: ${k}`);
    for (const tier of [0, 1, 2]) {
      const mos = (x) => (tier === 0 ? x.d === 0 : tier === 2 ? x.d >= 1 : true);
      assert.ok(L.TASHXISLAR.filter(mos).some((x) => x.b === k), `tashxis: ${k}, tier ${tier}`);
    }
  }
  for (const b of L.BOSQICHLAR) assert.match(b.en, /^[a-z ]+$/);
});

test("imlo: js fayllarda toʻgʻri apostrof yoʻq (oʻ, gʻ — U+02BB, tutuq — U+02BC)", () => {
  const togri = String.fromCharCode(39);
  const fayllar = [];
  const yigish = (dir) => {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) yigish(p);
      else if (f.name.endsWith(".js")) fayllar.push(p);
    }
  };
  yigish(path.join(__dirname, "..", "js"));
  yigish(__dirname);
  assert.ok(fayllar.length >= 8);
  for (const f of fayllar) {
    const matn = fs.readFileSync(f, "utf8");
    assert.ok(!matn.includes(togri), `${path.basename(f)}: toʻgʻri apostrof bor`);
    assert.ok(!/[og]‘|[og]’(?![a-z])|[OG]’/.test(matn.replace(/^\s*\/\/.*$/gm, "")), `${path.basename(f)}: notoʻgʻri tutuq belgisi`);
  }
});

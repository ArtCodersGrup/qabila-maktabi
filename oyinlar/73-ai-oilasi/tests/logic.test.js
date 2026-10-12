// 73-o‘yin: AI oilasi — generatorlar (takrorsiz, tier 0/1/2), javoblarni mustaqil qayta hisoblash, imlo.
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
  const r = rngFrom(seed || 73);
  const out = [];
  let prev = null;
  for (let k = 0; k < soni; k++) {
    prev = gen(prev, r, tier);
    out.push(prev);
  }
  return out;
}

// ---------- Mustaqil tekshiruvlar (logic.js funksiyalarini ishlatmaydi) ----------
function rasmTekshir(rasm, id) {
  const band = new Set();
  for (const o of rasm.obyektlar) {
    assert.ok(L.SINFLAR.some((s) => s.k === o.sinf), id);
    assert.ok(o.kataklar.length >= 3, id);
    for (const [r, c] of o.kataklar) {
      assert.ok(r >= 0 && r < rasm.n && c >= 0 && c < rasm.n, `${id}: katak rasm ichida`);
      assert.ok(!band.has(r * 10 + c), `${id}: kataklar ustma-ust emas`);
      band.add(r * 10 + c);
    }
    assert.deepEqual(o.ramka, chegara(o.kataklar), id);
  }
  assert.equal(new Set(rasm.obyektlar.map((o) => o.sinf)).size, rasm.obyektlar.length, `${id}: sinflar har xil`);
}
function chegara(kataklar) {
  let r0 = 99, c0 = 99, r1 = -1, c1 = -1;
  for (const [r, c] of kataklar) {
    if (r < r0) r0 = r;
    if (r > r1) r1 = r;
    if (c < c0) c0 = c;
    if (c > c1) c1 = c;
  }
  return { r0, c0, r1, c1 };
}
const maydon = (b) => (b.r1 - b.r0 + 1) * (b.c1 - b.c0 + 1);

// Obyektni topish natijasiga mustaqil tashxis
function tashxis(rasm, natija) {
  if (natija.length < rasm.obyektlar.length) return "yoq";
  for (let i = 0; i < rasm.obyektlar.length; i++) {
    const o = rasm.obyektlar[i];
    const b = natija[i].ramka;
    const tashqarida = o.kataklar.some(([r, c]) => r < b.r0 || r > b.r1 || c < b.c0 || c > b.c1);
    if (tashqarida) return "ramka";
    if (natija[i].sinf !== o.sinf) return "yorliq";
  }
  return "togri";
}

const TEKSHIR = {
  tanla(t) {
    const [oz, boshqa] = t.izlanadi === "organgan" ? [L.ORGANGAN, L.QOIDALI] : [L.QOIDALI, L.ORGANGAN];
    assert.ok(oz.some((x) => x.matn === t.javob), t.id);
    for (const v of t.variantlar) if (v !== t.javob) assert.ok(boshqa.some((x) => x.matn === v), t.id);
  },
  qoida(t) {
    let n = 0;
    for (const q of t.qatorlar) if ((q.qiymat > t.n ? 1 : 0) === (q.asl ? 1 : 0)) n++;
    assert.equal(t.javob, n, t.id);
    assert.ok(n >= 2 && n < t.qatorlar.length, `${t.id}: qoida mukammal emas`);
    assert.equal(new Set(t.qatorlar.map((q) => q.qiymat)).size, t.qatorlar.length);
  },
  chegara(t) {
    const ball = (n) => t.qatorlar.reduce((s, q) => s + ((q.qiymat > n) === q.asl ? 1 : 0), 0);
    const ballar = t.chegaralar.map(ball);
    const eng = Math.max(...ballar);
    assert.equal(ballar.filter((b) => b === eng).length, 1, `${t.id}: yagona eng yaxshi`);
    assert.equal(t.javob, `N = ${t.chegaralar[ballar.indexOf(eng)]}`, t.id);
  },
  joyla(t) {
    const x = L.TEXNOLOGIYALAR.find((y) => y.matn === t.texnologiya);
    assert.equal(t.javob, x.z, t.id);
    assert.deepEqual(t.variantlar, ["oddiy", "ai", "ml", "dl"]);
  },
  vazn(t) {
    let s = 0;
    for (let i = 0; i + 1 < t.qatlamlar.length; i++) s += t.qatlamlar[i] * t.qatlamlar[i + 1];
    assert.equal(t.javob, s, t.id);
    assert.ok(t.hisob.includes(`= ${s} `), t.id);
  },
  fikr(t) {
    const xato = L.FIKR_XATO.map((x) => x.matn);
    const [oz, boshqa] = t.xatoIzlanadi ? [xato, L.FIKR_TOGRI] : [L.FIKR_TOGRI, xato];
    assert.ok(oz.includes(t.javob), t.id);
    for (const v of t.variantlar) if (v !== t.javob) assert.ok(boshqa.includes(v), t.id);
  },
  mosla(t) {
    rasmTekshir(t.rasm, t.id);
    assert.equal(t.rasm.obyektlar.length, 1);
    assert.ok(["tasnif", "topish", "segment"].includes(t.javob), t.id);
    assert.deepEqual(t.variantlar.slice().sort(), ["asl", "segment", "tasnif", "topish"]);
  },
  ramka(t) {
    rasmTekshir(t.rasm, t.id);
    assert.equal(t.javob, maydon(chegara(t.rasm.obyektlar[0].kataklar)), t.id);
  },
  maska(t) {
    rasmTekshir(t.rasm, t.id);
    assert.equal(t.rasm.obyektlar.length, 2);
    assert.equal(t.javob, t.rasm.obyektlar.find((o) => o.sinf === t.sinf).kataklar.length, t.id);
  },
  ortiqcha(t) {
    rasmTekshir(t.rasm, t.id);
    const o = t.rasm.obyektlar.find((x) => x.sinf === t.sinf);
    assert.equal(t.javob, maydon(chegara(o.kataklar)) - o.kataklar.length, t.id);
    assert.ok(t.javob >= 1, t.id);
  },
  xato(t) {
    rasmTekshir(t.rasm, t.id);
    assert.equal(t.javob, L.XATO[tashxis(t.rasm, t.natija)], t.id);
    for (const x of t.natija) {
      assert.ok(x.ramka.r0 <= x.ramka.r1 && x.ramka.c0 <= x.ramka.c1, `${t.id}: ramka buzilmagan`);
    }
  },
  vaziyat(t) {
    const x = L.VAZIYATLAR.find((y) => y.matn === t.vaziyat);
    assert.equal(t.javob, L.VAZIFA[x.j], t.id);
  },
};

function yaroqli(t) {
  assert.ok(typeof t.matn === "string" && t.matn.length > 10, t.id);
  if (t.variantlar) {
    assert.ok(t.variantlar.length >= 4, `${t.id}: kamida 4 variant`);
    assert.equal(new Set(t.variantlar).size, t.variantlar.length, `${t.id}: variantlar takrorlanmaydi`);
    assert.ok(t.variantlar.includes(t.javob), `${t.id}: javob variantlar ichida`);
    if (String(t.javob).length > 3) assert.ok(!t.ishora.includes(String(t.javob)), `${t.id}: maslahat javobni aytmaydi`);
    assert.ok(t.ishora, t.id);
    assert.ok(t.nega, t.id);
  } else {
    assert.ok(Number.isInteger(t.javob) && t.javob >= 0 && t.javob < 1000, t.id);
    assert.ok(t.nega && t.hisob, t.id);
  }
  TEKSHIR[t.tur](t);
}

const BOSQICHLAR = [["bosqich1Task", L.bosqich1Task], ["bosqich2Task", L.bosqich2Task], ["bosqich3Task", L.bosqich3Task]];

test("bosqich generatorlari: har tier da 30 ta har xil va yaroqli misol", () => {
  for (const [nom, gen] of BOSQICHLAR) {
    for (const tier of [0, 1, 2]) {
      for (const seed of [73, 5, 2026]) {
        const list = ketma(gen, 30, tier, seed);
        assert.equal(new Set(list.map((t) => t.id)).size, 30, `${nom}, tier ${tier}: takror bor`);
        list.forEach(yaroqli);
      }
    }
  }
});

test("har tur alohida: javob mustaqil hisobga teng; cheksiz turlar 30 ta har xil", () => {
  const cheksiz = ["tanlaTask", "qoidaTask", "chegaraTask", "vaznTask", "fikrTask", "moslaTask", "ramkaTask", "maskaTask", "ortiqchaTask", "xatoTask"];
  for (const nom of cheksiz) {
    for (const tier of [0, 1, 2]) {
      const list = ketma(L[nom], 30, tier, 11);
      assert.equal(new Set(list.map((t) => t.id)).size, 30, `${nom}, tier ${tier}`);
      list.forEach(yaroqli);
    }
  }
  for (const nom of ["joylaTask", "vaziyatTask"]) {
    for (const tier of [0, 1, 2]) ketma(L[nom], 30, tier, 11).forEach(yaroqli);
  }
});

test("bank tugasa ham ketma-ket bir xil misol chiqmaydi", () => {
  for (const nom of ["joylaTask", "vaziyatTask"]) {
    for (const tier of [0, 1, 2]) {
      const list = ketma(L[nom], 60, tier, 3);
      for (let i = 1; i < list.length; i++) assert.notEqual(list[i].id, list[i - 1].id, `${nom}, tier ${tier}`);
    }
  }
  // Bank tugaguncha — hammasi har xil
  assert.equal(new Set(ketma(L.joylaTask, 12, 0).map((t) => t.id)).size, 12);
  assert.equal(new Set(ketma(L.vaziyatTask, 8, 0).map((t) => t.id)).size, 8);
});

test("tier qiyinlikni oshiradi", () => {
  assert.deepEqual([0, 1, 2].map((tier) => ketma(L.qoidaTask, 1, tier)[0].qatorlar.length), [5, 6, 8]);
  for (const t of ketma(L.qoidaTask, 30, 0)) {
    assert.deepEqual(t.qatorlar.map((q) => q.qiymat), t.qatorlar.map((q) => q.qiymat).sort((a, b) => a - b), "tier 0 — tartibda");
  }
  for (const t of ketma(L.qoidaTask, 30, 2)) assert.ok(t.qatorlar.some((q) => q.qiymat === t.n), "tier 2 — biri aynan chegarada");
  assert.deepEqual([0, 1, 2].map((tier) => ketma(L.vaznTask, 1, tier)[0].qatlamlar.length), [2, 3, 4]);
  for (const t of ketma(L.fikrTask, 20, 2)) assert.ok(t.xatoIzlanadi);
  for (const t of ketma(L.fikrTask, 20, 1)) assert.ok(!t.xatoIzlanadi);
  for (const t of ketma(L.joylaTask, 12, 0)) assert.equal(L.TEXNOLOGIYALAR.find((x) => x.matn === t.texnologiya).d, 0);
  for (const t of ketma(L.joylaTask, 16, 2)) assert.ok(L.TEXNOLOGIYALAR.find((x) => x.matn === t.texnologiya).d >= 1);
});

test("bosqichda savol turlari aralashadi, xato turlari hammasi uchraydi", () => {
  assert.deepEqual([...new Set(ketma(L.bosqich1Task, 9, 1).map((t) => t.tur))].sort(), ["chegara", "qoida", "tanla"]);
  assert.deepEqual([...new Set(ketma(L.bosqich2Task, 9, 2).map((t) => t.tur))].sort(), ["fikr", "joyla", "vazn"]);
  assert.deepEqual([...new Set(ketma(L.bosqich3Task, 9, 0).map((t) => t.tur))].sort(), ["mosla", "ramka", "vaziyat"]);
  assert.deepEqual([...new Set(ketma(L.bosqich3Task, 9, 2).map((t) => t.tur))].sort(), ["ortiqcha", "vaziyat", "xato"]);
  const holatlar = new Set(ketma(L.xatoTask, 80, 1).map((t) => t.holat));
  assert.equal(holatlar.size, 4);
});

test("banklar: har halqa va har CV vazifasi har tier da bor", () => {
  for (const tier of [0, 1, 2]) {
    const mos = (x) => (tier === 0 ? x.d === 0 : tier === 2 ? x.d >= 1 : true);
    for (const z of L.ZONALAR) assert.ok(L.TEXNOLOGIYALAR.filter(mos).some((x) => x.z === z), `${z}, tier ${tier}`);
    for (const j of Object.keys(L.VAZIFA)) assert.ok(L.VAZIYATLAR.filter(mos).some((x) => x.j === j), `${j}, tier ${tier}`);
  }
  assert.equal(L.boglanishlar([4, 3, 2]), 18);
  assert.equal(L.boglanishlar([8, 8, 8, 8, 2]), 208);
  assert.equal(L.boglanishYoz([4, 3, 2]), "4·3 + 3·2");
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

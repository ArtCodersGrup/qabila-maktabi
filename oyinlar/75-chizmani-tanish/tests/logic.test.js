// 75-o'yin: chizmani tanish — Hamming masofasi, eng yaqin namuna, aniqlik va mashq generatorlari.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const L = require("../js/logic.js");

function rngFrom(seed) {
  // mulberry32 (32 bitli butun arifmetika — qisqa siklga tushmaydi)
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// make(prev, rng, tier) dan ketma-ket vazifalar
function each(make, count, tier, seed) {
  const r = rngFrom(seed || 75);
  const out = [];
  let prev = null;
  for (let k = 0; k < count; k++) {
    prev = make(prev, r, tier);
    out.push(prev);
  }
  return out;
}
const TIERS = [0, 1, 2];
const harXil = (tasks) => assert.equal(new Set(tasks.map((t) => t.id)).size, tasks.length, "vazifalar takrorlanmasin");
const katakmi = (k) => assert.ok(Array.isArray(k) && k.length === 64 && k.every((v) => v === 0 || v === 1));

// Mustaqil qayta hisob (logic.js funksiyalarisiz)
const masofa = (a, b) => a.reduce((s, v, i) => s + (v !== b[i] ? 1 : 0), 0);
function engYaqinSinf(savol, namunalar) {
  let eng = null;
  for (const n of namunalar) {
    const d = masofa(savol, n.katak);
    if (!eng || d < eng.d) eng = { d, sinf: n.sinf };
  }
  return eng;
}
const sinfEngKichik = (savol, namunalar, sinf) => Math.min(...namunalar.filter((n) => n.sinf === sinf).map((n) => masofa(savol, n.katak)));

test("namunalar: 5 sinf × 3 ta, 8×8, hammasi har xil", () => {
  assert.equal(L.NAMUNALAR.length, 15);
  for (const s of L.SINFLAR) assert.equal(L.NAMUNALAR.filter((n) => n.sinf === s).length, 3, s);
  for (const n of L.NAMUNALAR) {
    katakmi(n.katak);
    assert.ok(L.boyalgan(n.katak) >= 8, n.id);
  }
  assert.equal(new Set(L.NAMUNALAR.map((n) => L.kalit(n.katak))).size, 15);
  assert.equal(L.namunaToplam(1).length, 5);
  assert.equal(L.namunaToplam(2, ["doira", "xoch"]).length, 4);
});

test("Hamming masofasi: 0 — bir xil, simmetrik, farqlar ro'yxati bilan mos", () => {
  const a = L.namuna("doira-1").katak;
  const b = L.namuna("kvadrat-1").katak;
  assert.equal(L.hamming(a, a), 0);
  assert.equal(L.hamming(a, b), L.hamming(b, a));
  assert.equal(L.hamming(a, b), masofa(a, b));
  assert.equal(L.farqlar(a, b).length, masofa(a, b));
  assert.equal(L.qatorFarqlari(a, b).reduce((s, v) => s + v, 0), masofa(a, b));
  // doira-2 va kvadrat-2 faqat 4 burchakda farq qiladi
  assert.equal(L.hamming(L.namuna("doira-2").katak, L.namuna("kvadrat-2").katak), 4);
  assert.deepEqual(L.parse(["#.", ".#"]), [1, 0, 0, 1]);
});

test("buz va siljit: aynan n ta katak o'zgaradi; surilgan chizma chetdan chiqqanini yo'qotadi", () => {
  const r = rngFrom(4);
  for (const n of L.NAMUNALAR) {
    for (const d of [0, 1, 3, 9]) assert.equal(masofa(n.katak, L.buz(n.katak, r, d)), d);
  }
  const chiziq = L.namuna("chiziq-2").katak; // tik chiziq, 4-ustun
  const ong = L.siljit(chiziq, 1, 0);
  assert.equal(L.boyalgan(ong), 8);
  assert.equal(masofa(chiziq, ong), 16);
  assert.equal(L.boyalgan(L.siljit(chiziq, 0, 1)), 7);
  assert.equal(L.boyalgan(L.siljit(chiziq, 4, 0)), 0);
});

test("tasniflagich: namunaning o'zi — masofa 0; 1 katak buzilsa ham sinfi o'zgarmaydi", () => {
  let dmin = Infinity;
  for (const a of L.NAMUNALAR) for (const b of L.NAMUNALAR) if (a.sinf !== b.sinf) dmin = Math.min(dmin, masofa(a.katak, b.katak));
  assert.ok(dmin >= 3, "sinflar orasida kamida 3 katak farq");
  const r = rngFrom(9);
  for (const n of L.NAMUNALAR) {
    const t = L.tasnif(n.katak, L.NAMUNALAR);
    assert.equal(t.sinf, n.sinf);
    assert.equal(t.masofa, 0);
    assert.equal(t.durang, false);
    for (let k = 0; k < 20; k++) {
      const q = L.buz(n.katak, r, 1);
      const tt = L.tasnif(q, L.NAMUNALAR);
      assert.equal(tt.sinf, n.sinf, n.id);
      assert.equal(tt.masofa, 1);
      assert.equal(tt.sinf, engYaqinSinf(q, L.NAMUNALAR).sinf);
    }
  }
});

test("tasniflagich: sinf masofalari o'sish tartibida, zaxira va durang to'g'ri", () => {
  const r = rngFrom(21);
  for (let k = 0; k < 200; k++) {
    const q = L.buz(L.NAMUNALAR[k % 15].katak, r, 2 + (k % 9));
    const t = L.tasnif(q, L.NAMUNALAR);
    assert.equal(t.sinflar.length, 5);
    for (let i = 1; i < 5; i++) assert.ok(t.sinflar[i].masofa >= t.sinflar[i - 1].masofa);
    for (const s of t.sinflar) assert.equal(s.masofa, sinfEngKichik(q, L.NAMUNALAR, s.sinf));
    assert.equal(t.zaxira, t.sinflar[1].masofa - t.sinflar[0].masofa);
    assert.equal(t.durang, t.zaxira === 0);
    assert.equal(t.masofa, engYaqinSinf(q, L.NAMUNALAR).d);
  }
});

test("baho: aniqlik va chalkashlik jadvali natijalardan qayta hisoblanadi", () => {
  const sinov = L.sinovToplam(rngFrom(2), 4, { buzMin: 3, buzMax: 7, siljish: 0.5 });
  assert.equal(sinov.length, 20);
  const b = L.baho(L.namunaToplam(2), sinov);
  const togri = sinov.filter((x) => engYaqinSinf(x.katak, L.namunaToplam(2)).d === sinfEngKichik(x.katak, L.namunaToplam(2), x.sinf)
    && L.tasnif(x.katak, L.namunaToplam(2)).sinf === x.sinf).length;
  assert.equal(b.togri, togri);
  assert.equal(b.jami, 20);
  assert.equal(b.foiz, (togri * 100) / 20);
  let yigindi = 0;
  let diag = 0;
  for (const a of b.sinflar) for (const c of b.sinflar) {
    yigindi += b.jadval[a][c];
    if (a === c) diag += b.jadval[a][c];
  }
  assert.equal(yigindi, 20);
  assert.equal(diag, b.togri);
  const juft = L.chalkashJuftlar(b.jadval, b.sinflar);
  assert.equal(juft.length, 10);
  assert.equal(juft.reduce((s, j) => s + j.soni, 0), 20 - b.togri);
});

test("ko'rsatish ma'lumoti: 3 ta farq; eng yaqin namuna yagona; namuna ko'paysa aniqlik oshadi", () => {
  const d1 = L.demo1();
  assert.equal(d1.farq.length, 3);
  assert.equal(masofa(d1.a, d1.b), 3);
  const d2 = L.demo2();
  assert.equal(d2.natija.durang, false);
  assert.equal(d2.natija.sinf, "doira");
  assert.equal(d2.natija.sinf, engYaqinSinf(d2.savol, d2.namunalar).sinf);
  assert.equal(new Set(d2.namunalar.map((n) => masofa(d2.savol, n.katak))).size, 3, "uchala masofa har xil");
  assert.equal(L.SINOV.length, 25);
  const [bir, ikki, uch] = [1, 2, 3].map(L.tajriba);
  assert.ok(bir.foiz < ikki.foiz && ikki.foiz < uch.foiz, `${bir.foiz} < ${ikki.foiz} < ${uch.foiz}`);
  assert.ok(L.chalkashJuftlar(bir.jadval, bir.sinflar)[0].soni > 0);
});

test("jadvalTask: 4 ta har xil chizma, javob — jadvalning o'zi", () => {
  for (const tier of TIERS) {
    const tasks = each(L.jadvalTask, 30, tier);
    harXil(tasks);
    for (const t of tasks) {
      assert.equal(t.variantlar.length, 4);
      t.variantlar.forEach(katakmi);
      assert.equal(new Set(t.variantlar.map((v) => v.join(""))).size, 4);
      assert.equal(masofa(t.variantlar[t.javob], t.jadval), 0);
      t.variantlar.forEach((v, k) => { if (k !== t.javob) assert.ok(masofa(v, t.jadval) >= 1); });
      if (tier === 2) t.variantlar.forEach((v, k) => { if (k !== t.javob) assert.ok(masofa(v, t.jadval) <= 4); });
    }
  }
});

test("farqTask: javob — mos kelmagan kataklar soni; chegaralar tier bilan o'sadi", () => {
  const chegara = [[2, 4], [5, 8], [7, 11]];
  for (const tier of TIERS) {
    const tasks = each(L.farqTask, 30, tier);
    harXil(tasks);
    for (const t of tasks) {
      katakmi(t.a);
      katakmi(t.b);
      assert.equal(t.javob, masofa(t.a, t.b));
      assert.ok(t.javob >= chegara[tier][0] && t.javob <= chegara[tier][1]);
      assert.equal(t.satrlar.reduce((s, v) => s + v, 0), t.javob);
      assert.ok(t.hisob.endsWith(`= ${t.javob}`));
      assert.equal(t.korinish, tier === 2 ? "son" : "rasm");
    }
  }
});

test("sinfTask: javob — eng yaqin namunaning sinfi (durangsiz), 5 variant", () => {
  const soni = [4, 6, 8];
  for (const tier of TIERS) {
    const tasks = each(L.sinfTask, 30, tier);
    harXil(tasks);
    for (const t of tasks) {
      assert.equal(t.qatorlar.length, soni[tier]);
      assert.equal(new Set(t.qatorlar.map((q) => q.id)).size, soni[tier]);
      for (const q of t.qatorlar) assert.equal(q.masofa, masofa(t.savol, q.katak));
      const eng = engYaqinSinf(t.savol, t.qatorlar);
      assert.equal(t.javob, eng.sinf);
      assert.equal(t.masofa, eng.d);
      // boshqa sinfning hech bir namunasi shu masofada emas
      assert.ok(t.qatorlar.every((q) => q.sinf === t.javob || q.masofa > eng.d));
      assert.ok(t.variantlar.length >= 4 && t.variantlar.includes(t.javob));
      assert.equal(new Set(t.variantlar).size, t.variantlar.length);
    }
  }
});

test("zaxiraTask: javob — ikkinchi sinfgacha farq; tier 2 da eng yaqin ikki namuna bir sinfdan", () => {
  for (const tier of TIERS) {
    const tasks = each(L.zaxiraTask, 30, tier);
    harXil(tasks);
    for (const t of tasks) {
      const sinflar = [...new Set(t.qatorlar.map((q) => q.sinf))];
      const eng = sinflar.map((s) => Math.min(...t.qatorlar.filter((q) => q.sinf === s).map((q) => masofa(t.savol, q.katak)))).sort((a, b) => a - b);
      assert.equal(t.javob, eng[1] - eng[0]);
      assert.ok(t.javob >= 1 && t.javob <= 20);
      assert.ok(t.hisob.endsWith(`= ${t.javob}`));
      if (tier === 2) {
        const tartib = t.qatorlar.slice().sort((a, b) => a.masofa - b.masofa);
        assert.equal(tartib[0].sinf, tartib[1].sinf);
      }
    }
  }
});

test("aniqlikTask: foiz natijalardan qayta hisoblanadi; model javoblari tasniflagichniki", () => {
  const jami = [5, 10, 20];
  for (const tier of TIERS) {
    const tasks = each(L.aniqlikTask, 30, tier);
    harXil(tasks);
    for (const t of tasks) {
      assert.equal(t.natijalar.length, jami[tier]);
      const namunalar = L.NAMUNALAR.filter((n) => n.tartib < t.k && t.sinflar.includes(n.sinf));
      let togri = 0;
      for (const x of t.natijalar) {
        assert.equal(x.model, engYaqinSinf(x.katak, namunalar).sinf);
        if (x.model === x.asl) togri++;
      }
      assert.equal(t.javob, (togri * 100) / jami[tier]);
      assert.ok(Number.isInteger(t.javob) && t.javob >= 0 && t.javob <= 100);
      if (tier === 2) {
        assert.equal(t.sinflar.length, 3);
        assert.equal(t.sinflar.reduce((s, a) => s + t.jadval[a][a], 0), togri);
        assert.ok(t.javob < 100);
      }
    }
  }
});

test("chalkashTask: javob — eng ko'p chalkashgan yagona juftlik, kamida 4 variant", () => {
  for (const tier of TIERS) {
    const tasks = each(L.chalkashTask, 30, tier);
    harXil(tasks);
    for (const t of tasks) {
      assert.equal(t.sinflar.length, tier === 2 ? 5 : 4);
      assert.ok(t.variantlar.length >= 4);
      assert.equal(new Set(t.variantlar).size, t.variantlar.length);
      assert.ok(t.variantlar.includes(t.javob));
      // jadvalni natijalardan qayta yig'amiz
      const soni = {};
      for (const x of t.natijalar) {
        if (x.asl === x.model) continue;
        const juft = [x.asl, x.model].sort((a, b) => L.SINFLAR.indexOf(a) - L.SINFLAR.indexOf(b)).join("|");
        soni[juft] = (soni[juft] || 0) + 1;
      }
      const tartib = Object.entries(soni).sort((a, b) => b[1] - a[1]);
      assert.equal(tartib[0][0], t.javob);
      assert.ok(tartib[0][1] >= 2);
      assert.ok(tartib.length === 1 || tartib[1][1] < tartib[0][1]);
      for (const v of t.variantlar) v.split("|").forEach((s) => assert.ok(t.sinflar.includes(s)));
    }
  }
});

test("bosqich generatorlari: mashq turlari navbat bilan, 30 ta takrorlanmas vazifa", () => {
  const turlar = [["jadval", "farq"], ["sinf", "zaxira"], ["aniqlik", "chalkash"]];
  [L.bosqich1Task, L.bosqich2Task, L.bosqich3Task].forEach((make, s) => {
    for (const tier of TIERS) {
      const tasks = each(make, 30, tier, 7 + s);
      harXil(tasks);
      tasks.forEach((t, k) => assert.equal(t.tur, turlar[s][k % 2]));
    }
  });
});

test("matn: js fayllaridagi satrlarda oddiy apostrof yo'q, oʻ/gʻ — U+02BB bilan", () => {
  const root = path.join(__dirname, "..", "js");
  const files = ["logic.js", "main.js", "game-art.js"].concat(fs.readdirSync(path.join(root, "scenes")).map((f) => "scenes/" + f));
  assert.ok(files.length >= 8);
  for (const f of files) {
    const kod = fs.readFileSync(path.join(root, f), "utf8")
      // izohlar olib tashlanadi (ularda o'yin, bo'lak kabi so'zlar oddiy apostrof bilan yoziladi)
      .split("\n").filter((line) => !line.trim().startsWith("//")).join("\n")
      .replace(/\s\/\/ .*$/gm, "");
    assert.ok(!kod.includes("'"), `${f}: oddiy apostrof`);
    assert.ok(!/[‘’]/.test(kod), `${f}: notoʻgʻri tutuq belgisi`);
  }
  for (const make of [L.bosqich1Task, L.bosqich2Task, L.bosqich3Task]) {
    for (const t of each(make, 6, 2)) assert.ok(!/['‘’`]/.test(t.matn + t.nega + (t.hisob || "") + (t.ishora || "")));
  }
});

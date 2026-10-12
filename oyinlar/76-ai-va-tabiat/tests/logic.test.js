// 76-o'yin: AI va tabiat — belgilar jadvali, model (eng o'xshash qatorlar ovozi), aniqlik, noxolis to'plam va mashq generatorlari.
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
  const r = rngFrom(seed || 76);
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

// ---------- Mustaqil qayta hisob (logic.js funksiyalarisiz) ----------
const B = ["rang", "shakl", "yaltiroq"];
const farq = (a, b) => B.filter((k) => a[k] !== b[k]).length;
// Model: eng kam farqli qatorlar ovozi; teng bo'lsa — "ikkilanadi"
function model(x, oquv) {
  const d = oquv.map((q) => farq(x, q));
  const eng = Math.min(...d);
  const ovoz = {};
  oquv.forEach((q, k) => { if (d[k] === eng) ovoz[q.sinf] = (ovoz[q.sinf] || 0) + 1; });
  const tartib = Object.entries(ovoz).sort((a, b) => b[1] - a[1]);
  return tartib.length > 1 && tartib[0][1] === tartib[1][1] ? "ikkilanadi" : tartib[0][0];
}
const togriSoni = (oquv, sinov) => sinov.filter((x) => model(x, oquv) === x.sinf).length;

test("katalog: uch sinf, belgilar ruxsat etilgan qiymatlarda, id va nomlar har xil", () => {
  assert.equal(L.KATALOG.length, 25);
  assert.equal(new Set(L.KATALOG.map((x) => x.id)).size, 25);
  assert.equal(new Set(L.KATALOG.map((x) => x.nom)).size, 25);
  for (const s of L.SINFLAR) assert.ok(L.KATALOG.filter((x) => x.sinf === s).length >= 8, s);
  for (const x of L.KATALOG) {
    assert.ok(L.SINFLAR.includes(x.sinf), x.id);
    for (const b of L.BELGILAR) assert.ok(b.qiymatlar.includes(x[b.id]), `${x.id}.${b.id}`);
    assert.ok(["butun", "ezilgan"].includes(x.holat));
    if (x.chalkash) assert.ok(L.SINFLAR.includes(x.chalkash) && x.chalkash !== x.sinf, x.id);
    if (x.holat === "ezilgan") assert.equal(x.shakl, "notekis", x.id);
  }
  assert.ok(L.KATALOG.filter((x) => x.chalkash).length >= 6);
});

test("model: farq soni, eng o'xshash qatorlar ovozi, durang", () => {
  const suv = L.buyum("suv");
  assert.equal(L.masofa(suv, suv), 0);
  assert.equal(L.masofa(suv, L.buyum("banan")), 3);
  assert.equal(L.masofa(suv, L.buyum("ezilgan-suv")), 1);
  assert.equal(L.masofa(suv, L.buyum("banan"), ["shakl"]), 1);
  // aynan o'xshash qator bor
  const oquv = L.buyumlar(["suv", "gazeta", "banan"]);
  assert.equal(L.bashorat(L.buyum("varaq"), oquv).sinf, "qogʻoz");
  assert.equal(L.bashorat(L.buyum("varaq"), oquv).masofa, 0);
  // ikki sinf bir xil masofada → model ikkilanadi
  const t = L.bashorat(L.buyum("ezilgan-qatiq"), L.buyumlar(["qatiq", "tuxum"]));
  assert.equal(t.sinf, null);
  assert.equal(t.masofa, 1);
  assert.deepEqual(t.yaqinlar, [0, 1]);
  assert.equal(L.javobYoz(t.sinf), "ikkilanadi");
  // ko'pchilik ovozi
  assert.equal(L.bashorat(L.buyum("ezilgan-qatiq"), L.buyumlar(["qatiq", "tuxum", "ezilgan-suv"])).sinf, "plastik");
  // har qanday to'plamda mustaqil model bilan bir xil javob
  const r = rngFrom(3);
  for (let k = 0; k < 300; k++) {
    const hammasi = L.aralash(L.KATALOG, r);
    const toplam = hammasi.slice(0, 3 + (k % 8));
    assert.equal(L.javobYoz(L.bashorat(hammasi[12], toplam).sinf), model(hammasi[12], toplam));
  }
});

test("baho va guruhBaho: aniqlik, chalkashlik jadvali va guruhlar natijalardan yig'iladi", () => {
  const r = rngFrom(8);
  for (let k = 0; k < 50; k++) {
    const hammasi = L.aralash(L.KATALOG, r);
    const oquv = hammasi.slice(0, 8);
    const sinov = hammasi.slice(8, 18);
    const b = L.baho(oquv, sinov);
    assert.equal(b.togri, togriSoni(oquv, sinov));
    assert.equal(b.jami, 10);
    assert.equal(b.foiz, b.togri * 10);
    let yigindi = 0;
    for (const a of L.SINFLAR) for (const c of L.SINFLAR.concat(L.DURANG)) yigindi += b.jadval[a][c];
    assert.equal(yigindi, 10);
    assert.equal(L.SINFLAR.reduce((s, a) => s + b.jadval[a][a], 0), b.togri);
    const g = L.guruhBaho(b.natijalar, "shakl");
    assert.equal(g.reduce((s, x) => s + x.jami, 0), 10);
    assert.equal(g.reduce((s, x) => s + x.togri, 0), b.togri);
  }
});

test("birBelgi: qiymat bo'yicha guruhlab, har guruhning eng ko'p yorlig'i sanaladi", () => {
  const q = L.buyumlar(["suv", "shampun", "gazeta", "karton", "banan", "choy"]);
  assert.equal(L.birBelgi(q, "yaltiroq"), 2 + 2); // yaltiroq: 2 plastik; xira: 2 qog'oz / 2 organik → 2
  assert.equal(L.birBelgi(q, "shakl"), 6); // silindr — plastik, yassi — qog'oz, notekis — organik
  assert.equal(L.birBelgi(q, "rang"), 4); // shaffof 1, rangli 1 (2 dan), oq 1, jigarrang 1 (2 dan)
});

test("2-bosqich ko'rsatuvi: testda aniqlik 100% dan past, o'quv to'plamining o'zida — 100%", () => {
  const d = L.demo2();
  assert.equal(d.oquv.length + d.test.length, 10);
  assert.ok(d.oquv.every((x) => !d.test.includes(x)));
  assert.equal(d.natija.togri, togriSoni(d.oquv, d.test));
  assert.ok(d.natija.togri < d.natija.jami && d.natija.togri > 0);
  assert.equal(d.natija.foiz, (d.natija.togri * 100) / d.natija.jami);
  assert.equal(d.ozida.togri, d.ozida.jami);
  assert.equal(d.ozida.foiz, 100);
});

test("3-bosqich ko'rsatuvi: noxolis to'plam ezilgan plastikni tanimaydi; to'g'ri buyumlar qo'shilsa tuzaladi", () => {
  const asos = L.demo3([]);
  // o'quv to'plamidagi plastiklar — faqat butun silindr idishlar
  assert.ok(asos.oquv.filter((x) => x.sinf === "plastik").every((x) => x.holat === "butun" && x.shakl === "silindr"));
  assert.ok(asos.oquv.every((x) => !asos.test.includes(x)));
  assert.ok(asos.nomzodlar.every((x) => !asos.test.includes(x) && !asos.oquv.includes(x)));
  assert.equal(asos.natija.togri, togriSoni(asos.oquv, asos.test));
  assert.ok(asos.ezilganJami >= 2);
  assert.equal(asos.ezilganTogri, 0);
  assert.ok(asos.natija.togri < asos.natija.jami);
  // ezilgan idish qo'shilsa — ezilganlar tuzaladi
  const tuzalgan = L.demo3(["ezilgan-suv"]);
  assert.equal(tuzalgan.ezilganTogri, tuzalgan.ezilganJami);
  assert.ok(tuzalgan.natija.togri > asos.natija.togri);
  // yana bitta butun plastik (selofan) hech narsani o'zgartirmaydi
  assert.equal(L.demo3(["selofan"]).natija.togri, asos.natija.togri);
  // foydali nomzodlar va eng yuqori natija — mustaqil hisob bilan
  const yakka = L.DEMO3.nomzodlar.filter((id) => togriSoni(asos.oquv.concat([L.buyum(id)]), asos.test) > asos.natija.togri);
  assert.deepEqual(L.demo3Foydali(), yakka);
  assert.ok(yakka.length >= 1 && yakka.length < L.DEMO3.nomzodlar.length);
  assert.equal(L.demo3Eng(), L.demo3(yakka).natija.togri);
  assert.equal(L.demo3Eng(), asos.natija.jami);
  assert.equal(L.DEMO1.length, 5);
  assert.equal(new Set(L.buyumlar(L.DEMO1).map((x) => x.sinf)).size, 3);
});

test("yorliqTask: aynan bitta qatorda yorliq xato, javob — o'sha qator; kamida 4 qator", () => {
  const soni = [4, 6, 8];
  for (const tier of TIERS) {
    const tasks = each(L.yorliqTask, 30, tier);
    harXil(tasks);
    for (const t of tasks) {
      assert.equal(t.qatorlar.length, soni[tier]);
      assert.equal(t.variantlar.length, soni[tier]);
      assert.equal(new Set(t.qatorlar.map((q) => q.buyum.id)).size, soni[tier]);
      const xato = t.qatorlar.map((q, k) => (q.yorliq !== L.buyum(q.buyum.id).sinf ? k : -1)).filter((k) => k >= 0);
      assert.deepEqual(xato, [t.javob]);
      assert.ok(L.SINFLAR.includes(t.qatorlar[t.javob].yorliq));
      if (tier === 2) assert.equal(t.qatorlar[t.javob].yorliq, t.qatorlar[t.javob].buyum.chalkash);
    }
  }
});

test("belgiTask: javob — yorliqni eng yaxshi ajratadigan yagona ustun (4 variant)", () => {
  for (const tier of TIERS) {
    const tasks = each(L.belgiTask, 30, tier);
    harXil(tasks);
    for (const t of tasks) {
      assert.equal(t.qatorlar.length, tier === 0 ? 6 : 8);
      assert.deepEqual(t.variantlar, ["rang", "shakl", "yaltiroq", "joy"]);
      // mustaqil hisob: har ustun uchun guruhlardagi eng ko'p yorliqlar yig'indisi
      const ball = {};
      for (const u of t.variantlar) {
        const guruh = {};
        for (const q of t.qatorlar) {
          const k = q[u] + "|" + q.sinf;
          guruh[k] = (guruh[k] || 0) + 1;
        }
        const eng = {};
        for (const [k, n] of Object.entries(guruh)) {
          const qiymat = k.split("|")[0];
          eng[qiymat] = Math.max(eng[qiymat] || 0, n);
        }
        ball[u] = Object.values(eng).reduce((s, v) => s + v, 0);
      }
      const tartib = Object.entries(ball).sort((a, b) => b[1] - a[1]);
      assert.equal(tartib[0][0], t.javob);
      assert.ok(tartib[0][1] > tartib[1][1]);
      assert.notEqual(t.javob, "joy");
      if (tier === 0) assert.equal(tartib[0][1], 6);
      if (tier === 2) assert.equal(tartib[0][1] - tartib[1][1], 1);
      for (const b of t.ballar) assert.equal(b.ball, ball[b.id]);
      for (const q of t.qatorlar) assert.ok(L.JOY.qiymatlar.includes(q.joy));
    }
  }
});

test("bashoratTask: javob — model javobi (mustaqil hisob), 4 variant; tier bilan qiyinlashadi", () => {
  for (const tier of TIERS) {
    const tasks = each(L.bashoratTask, 30, tier);
    harXil(tasks);
    const javoblar = new Set();
    for (const t of tasks) {
      assert.equal(t.oquv.length, 5 + tier);
      assert.ok(!t.oquv.includes(t.yangi));
      assert.deepEqual(t.variantlar, ["plastik", "qogʻoz", "organik", "ikkilanadi"]);
      assert.equal(t.javob, model(t.yangi, t.oquv));
      const d = t.oquv.map((q) => farq(t.yangi, q));
      assert.deepEqual(t.farqlar, d);
      assert.equal(t.masofa, Math.min(...d));
      assert.deepEqual(t.yaqinlar, d.map((v, k) => (v === t.masofa ? k : -1)).filter((k) => k >= 0));
      if (tier === 0) assert.equal(t.masofa, 0);
      if (tier === 1) assert.equal(t.masofa, 1);
      if (tier === 2) assert.ok(t.yaqinlar.length >= 2 && new Set(t.yaqinlar.map((k) => t.oquv[k].sinf)).size >= 2);
      if (tier < 2) assert.notEqual(t.javob, "ikkilanadi");
      javoblar.add(t.javob);
    }
    if (tier === 2) assert.ok(javoblar.has("ikkilanadi") && javoblar.size >= 3);
  }
});

test("aniqlikTask: foiz — model natijalaridan (mustaqil hisob), butun son", () => {
  for (const tier of TIERS) {
    const tasks = each(L.aniqlikTask, 30, tier);
    harXil(tasks);
    for (const t of tasks) {
      assert.ok([[4, 5], [10], [20]][tier].includes(t.natijalar.length));
      let togri = 0;
      for (const n of t.natijalar) {
        assert.ok(!t.oquv.includes(n.buyum), "test buyumi oʻquv toʻplamida boʻlmasin");
        assert.equal(n.model, model(n.buyum, t.oquv));
        assert.equal(n.asl, n.buyum.sinf);
        if (n.model === n.asl) togri++;
      }
      assert.equal(t.togri, togri);
      assert.equal(t.javob, (togri * 100) / t.natijalar.length);
      assert.ok(Number.isInteger(t.javob) && t.javob > 0 && t.javob <= 100);
      if (tier > 0) assert.ok(t.javob < 100);
      assert.equal(L.SINFLAR.reduce((s, a) => s + t.jadval[a][a], 0), togri);
      assert.ok(t.hisob.endsWith(`= ${t.javob}%`));
    }
  }
});

test("guruhTask: o'quv to'plami noxolis; umumiy / eng zaif guruh / farq mustaqil hisob bilan mos", () => {
  for (const tier of TIERS) {
    const tasks = each(L.guruhTask, 30, tier);
    harXil(tasks);
    for (const t of tasks) {
      assert.equal(t.natijalar.length, 20);
      const guruh = {};
      let togri = 0;
      for (const n of t.natijalar) {
        assert.ok(!t.oquv.includes(n.buyum));
        const ok = model(n.buyum, t.oquv) === n.buyum.sinf;
        const g = (guruh[n.buyum.shakl] = guruh[n.buyum.shakl] || { jami: 0, togri: 0 });
        g.jami++;
        if (ok) {
          g.togri++;
          togri++;
        }
      }
      assert.deepEqual(Object.values(guruh).map((g) => g.jami).sort((a, b) => a - b), [5, 5, 10]);
      const umumiy = (togri * 100) / 20;
      const foizlar = Object.entries(guruh).map(([shakl, g]) => ({ shakl, foiz: (g.togri * 100) / g.jami })).sort((a, b) => a.foiz - b.foiz);
      assert.ok(foizlar[0].foiz < foizlar[1].foiz, "eng zaif guruh yagona");
      assert.equal(t.zaif, foizlar[0].shakl);
      assert.equal(t.javob, [umumiy, foizlar[0].foiz, umumiy - foizlar[0].foiz][tier]);
      assert.ok(Number.isInteger(t.javob) && t.javob >= 0 && t.javob <= 100);
      for (const g of t.guruhlar) assert.deepEqual([g.jami, g.togri], [guruh[g.qiymat].jami, guruh[g.qiymat].togri]);
      // noxolislik: o'quv to'plamida qaysidir sinfning qaysidir shakli umuman yo'q (katalogda esa bor)
      const bor = new Set(t.oquv.map((x) => x.sinf + "|" + x.shakl));
      assert.ok(L.KATALOG.some((x) => !bor.has(x.sinf + "|" + x.shakl)));
      for (const s of L.SINFLAR) assert.ok(t.oquv.filter((x) => x.sinf === s).length >= 2);
    }
  }
});

test("tuzatTask: javob — qo'shilganda aniqlikni eng ko'p oshiradigan yagona nomzod (4 variant)", () => {
  for (const tier of TIERS) {
    const tasks = each(L.tuzatTask, 30, tier);
    harXil(tasks);
    for (const t of tasks) {
      assert.equal(t.oquv.length, 6 + tier);
      assert.equal(t.test.length, [6, 8, 10][tier]);
      assert.equal(t.nomzodlar.length, 4);
      const hammasi = t.oquv.concat(t.test, t.nomzodlar);
      assert.equal(new Set(hammasi.map((x) => x.id)).size, hammasi.length, "oʻquv, test va nomzodlar kesishmaydi");
      const asos = togriSoni(t.oquv, t.test);
      assert.equal(t.asos, asos);
      const natijalar = t.nomzodlar.map((x) => togriSoni(t.oquv.concat([x]), t.test));
      assert.deepEqual(t.natijalar, natijalar);
      const eng = Math.max(...natijalar);
      assert.ok(eng > asos);
      assert.equal(natijalar.filter((v) => v === eng).length, 1);
      assert.equal(t.javob, natijalar.indexOf(eng));
      assert.equal(t.xatolar.length, t.test.length - asos);
      assert.ok(t.xatolar.length >= 1);
    }
  }
});

test("bosqich generatorlari: mashq turlari navbat bilan, 30 ta takrorlanmas vazifa", () => {
  const turlar = [["yorliq", "belgi"], ["aniqlik", "bashorat"], ["guruh", "tuzat"]];
  [L.bosqich1Task, L.bosqich2Task, L.bosqich3Task].forEach((make, s) => {
    for (const tier of TIERS) {
      const tasks = each(make, 30, tier, 11 + s);
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
    // izohlar olib tashlanadi (ularda o'yin, bo'lak kabi so'zlar oddiy apostrof bilan yoziladi)
    const kod = fs.readFileSync(path.join(root, f), "utf8")
      .split("\n").filter((line) => !line.trim().startsWith("//")).join("\n")
      .replace(/\s\/\/ .*$/gm, "");
    assert.ok(!kod.includes("'"), `${f}: oddiy apostrof`);
    assert.ok(!/[‘’]/.test(kod), `${f}: notoʻgʻri tutuq belgisi`);
  }
  for (const make of [L.bosqich1Task, L.bosqich2Task, L.bosqich3Task]) {
    for (const t of each(make, 6, 2)) assert.ok(!/['‘’`]/.test(t.matn + t.nega + (t.hisob || "") + (t.ishora || "")));
  }
  for (const x of L.KATALOG) assert.ok(!/['‘’`]/.test(x.nom + x.sinf));
});

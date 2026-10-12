// «AI va harakat»: skelet koordinatalari, holat qoidalari, kadrlardan sanash va mashq generatorlari.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const L = require("../js/logic.js");

// Urugʻli tasodifiy sonlar (mulberry32): har ishga tushirishda bir xil ketma-ketlik, davri 2³²
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

// make(prev, rng, tier) dan ketma-ket vazifalar
function each(make, count, tier, seed) {
  const r = rngFrom(seed || 77);
  const out = [];
  let prev = null;
  for (let k = 0; k < count; k++) {
    prev = make(prev, r, tier);
    out.push(prev);
  }
  return out;
}

const GENERATORLAR = ["nuqtaTask", "chekkaTask", "farqTask", "holatTask", "qolTask", "qaysiTask", "sanashTask", "nechanchiTask", "shovqinTask"];

// ---------- Mustaqil qayta hisoblash (logic.js funksiyalarisiz) ----------
const y = (p, id) => p[id][1];
const x = (p, id) => p[id][0];
const kotarilgan = (p, t) => y(p, t + "Bilak") < y(p, t + "Yelka");
const otirgan = (p) => y(p, "chapTizza") - y(p, "chapSon") <= 8 && y(p, "ongTizza") - y(p, "ongSon") <= 8;
const egilgan = (p) => Math.abs(x(p, "boyin") - x(p, "bel")) >= 10;
const tHolat = (p) => ["chap", "ong"].every((t) =>
  Math.abs(y(p, t + "Bilak") - y(p, t + "Yelka")) <= 5 && Math.abs(x(p, t + "Bilak") - x(p, t + "Yelka")) >= 25);
const farq = (d) => 85 - (65 + d);
function sana(kadrlar) {
  let n = 0;
  let oldin = false;
  for (const d of kadrlar) {
    const hozir = farq(d) <= 8;
    if (oldin && !hozir) n++;
    oldin = hozir;
  }
  return n;
}

function pozaToza(p, belgi) {
  assert.equal(Object.keys(p).length, 15, belgi);
  for (const n of L.NUQTALAR) {
    const [px, py] = p[n.id];
    assert.ok(Number.isInteger(px) && Number.isInteger(py), `${belgi}: ${n.id} butun son`);
    assert.ok(px >= 0 && px <= 100 && py >= 0 && py <= 120, `${belgi}: ${n.id} ${px},${py} rasm ichida`);
  }
}

test("skelet: 15 nuqta, 14 suyak, tik turgan holat koordinatalari", () => {
  assert.equal(L.NUQTALAR.length, 15);
  assert.equal(L.SUYAKLAR.length, 14);
  for (const [a, b] of L.SUYAKLAR) assert.ok(L.NOM[a] && L.NOM[b]);
  const p = L.poza({});
  assert.deepEqual(p.bosh, [50, 15]);
  assert.deepEqual(p.chapYelka, [40, 30]);
  assert.deepEqual(p.ongYelka, [60, 30]);
  assert.deepEqual(p.chapSon, [43, 65]);
  assert.deepEqual(p.chapTizza, [43, 85]);
  assert.deepEqual(p.ongTopiq, [57, 105]);
  assert.equal(L.holat(p), "tik");
  assert.equal(L.koord(p, "bosh"), "(50, 15)");
  for (const n of L.NUQTALAR) if (n.juft) assert.equal(L.NUQTALAR.find((m) => m.id === n.juft).juft, n.id);
});

test("qoidalar: qoʻl, T-holat, oʻtirish, egilish — chegaralari bilan", () => {
  assert.equal(L.holat(L.poza({ ong: "tepa" })), "qol");
  assert.equal(L.holat(L.poza({ chap: "salom" })), "qol");
  assert.equal(L.holat(L.poza({ chap: "bukik", ong: "bukik" })), "tik");
  assert.equal(L.holat(L.poza({ chap: "yon", ong: "yon" })), "t");
  assert.equal(L.holat(L.poza({ chap: "yon" })), "tik");
  assert.equal(L.holat(L.poza({ chap: "yarimYon", ong: "yarimYon" })), "tik");
  assert.equal(L.holat(L.poza({ otir: 12 })), "otirgan");
  assert.equal(L.holat(L.poza({ otir: 11 })), "tik");
  assert.equal(L.holat(L.poza({ egil: -10 })), "egilgan");
  assert.equal(L.egilish(L.poza({ egil: -10 })), "chap");
  assert.equal(L.egilish(L.poza({ egil: 12 })), "ong");
  assert.equal(L.egilish(L.poza({ egil: 9 })), null);
  assert.ok(L.kotarilgan(L.poza({ ong: "tepa" }), "ong"));
  assert.ok(!L.kotarilgan(L.poza({ ong: "tepa" }), "chap"));
});

test("tasodifiy skeletlar rasm ichida va holati turiga mos", () => {
  const r = rngFrom(5);
  const kutilgan = {
    tik: "tik", qolChap: "qol", qolOng: "qol", qolIkki: "qol", t: "t", otirgan: "otirgan", egilgan: "egilgan",
    bukik: "tik", yarimT: "tik", yarimOtir: "tik", sustEgil: "tik",
  };
  for (let k = 0; k < 600; k++) {
    const tur = L.POZA_TURLARI[k % L.POZA_TURLARI.length];
    const z = L.tasodifPoza(r, tur, k % 2 === 0);
    pozaToza(z.p, z.kalit);
    assert.equal(L.holat(z.p), kutilgan[tur], `${tur}: ${z.kalit}`);
    // Bir vaqtda koʻpi bilan bitta qoida bajariladi — javob bir xil tushuniladi
    const rost = [otirgan(z.p), egilgan(z.p), tHolat(z.p), kotarilgan(z.p, "chap") || kotarilgan(z.p, "ong")].filter(Boolean).length;
    assert.ok(rost <= 1, `${z.kalit}: ${rost} ta qoida`);
    assert.equal(rost === 0, kutilgan[tur] === "tik");
  }
});

test("har generator har zinada 30 ta har xil toʻgʻri vazifa beradi, ketma-ket takrorlanmaydi", () => {
  for (const nom of GENERATORLAR) {
    for (const tier of [0, 1, 2]) {
      const list = each(L[nom], 120, tier, 7 + tier);
      for (let i = 1; i < list.length; i++) assert.notEqual(list[i].id, list[i - 1].id, `${nom} tier ${tier}`);
      const xil = new Set(list.map((t) => t.id));
      assert.ok(xil.size >= 30, `${nom} tier ${tier}: ${xil.size} ta har xil`);
      for (const t of list) {
        assert.ok(t.tur && t.matn, t.id);
        if (t.variantlar) {
          assert.ok(t.variantlar.length >= 4, `${t.id}: kamida 4 variant`);
          assert.equal(new Set(t.variantlar).size, t.variantlar.length, `${t.id}: variantlar takrorlanmaydi`);
          assert.ok(t.variantlar.includes(t.javob), `${t.id}: javob variantlar ichida`);
          assert.ok(t.ishora && !t.ishora.includes(String(t.javob)), `${t.id}: maslahat javobni aytmaydi`);
          assert.ok(t.nega, t.id);
        } else {
          assert.ok(Number.isInteger(t.javob) && t.javob >= 0 && t.javob <= 999, `${t.id}: son javob`);
          assert.ok(t.nega && t.hisob, t.id);
        }
      }
    }
  }
});

test("1-bosqich: nuqta nomi, koordinatasi va chekka nuqta — mustaqil hisob bilan", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.nuqtaTask, 100, tier)) {
      pozaToza(t.poza, t.id);
      const xy = t.poza[t.nuqta];
      if (t.tur === "koordinata") {
        assert.equal(t.javob, `(${xy[0]}, ${xy[1]})`);
        assert.equal(t.belgi, t.nuqta);
        assert.ok(t.setka);
      } else {
        assert.equal(t.javob, L.NOM[t.nuqta]);
        if (t.tur === "qaysiNuqta") {
          assert.equal(t.belgi, null, "tier 2 da nuqta belgilanmaydi");
          assert.match(t.matn, new RegExp(`\\(${xy[0]}, ${xy[1]}\\)`));
          const shunday = L.NUQTALAR.filter((n) => t.poza[n.id][0] === xy[0] && t.poza[n.id][1] === xy[1]);
          assert.equal(shunday.length, 1, "koordinata yagona nuqtaga tegishli");
        }
      }
      assert.equal(t.tur, ["nuqta", "koordinata", "qaysiNuqta"][tier]);
    }
    for (const t of each(L.chekkaTask, 100, tier)) {
      const oq = t.yonalish === "yuqori" || t.yonalish === "past" ? 1 : 0;
      const qiymat = t.nuqtalar.map((id) => t.poza[id][oq]);
      const chekka = t.yonalish === "yuqori" || t.yonalish === "chap" ? Math.min(...qiymat) : Math.max(...qiymat);
      assert.equal(qiymat.filter((v) => v === chekka).length, 1, `${t.id}: chekka yagona`);
      const id = t.nuqtalar[qiymat.indexOf(chekka)];
      assert.ok(t.javob.startsWith(L.bosh(L.NOM[id]) + " ("), t.id);
      assert.equal(t.rasm, tier === 0);
      if (tier < 2) assert.equal(oq, 1);
    }
    for (const t of each(L.farqTask, 100, tier)) {
      assert.equal(t.javob, Math.abs(t.poza[t.a][t.oq] - t.poza[t.b][t.oq]), t.id);
      assert.ok(t.javob > 0);
      assert.equal(t.rasm, tier < 2);
      if (/yuqorida\?/.test(t.matn)) assert.ok(t.poza[t.b][1] < t.poza[t.a][1], t.id);
      if (/pastda\?/.test(t.matn)) assert.ok(t.poza[t.b][1] > t.poza[t.a][1], t.id);
      if (/chapda\?/.test(t.matn)) assert.ok(t.poza[t.a][0] < t.poza[t.b][0], t.id);
      if (/oʻngda\?/.test(t.matn)) assert.ok(t.poza[t.a][0] > t.poza[t.b][0], t.id);
    }
  }
});

test("2-bosqich: holat va koʻtarilgan qoʻl — koordinatalardan mustaqil hisob bilan", () => {
  const uchradi = new Set();
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.holatTask, 150, tier)) {
      const p = t.poza;
      pozaToza(p, t.id);
      const kutilgan = otirgan(p) ? "Oʻtirgan" : egilgan(p) ? "Yonga egilgan" : tHolat(p) ? "T-holat"
        : kotarilgan(p, "chap") || kotarilgan(p, "ong") ? "Qoʻl koʻtarilgan" : "Tik turibdi";
      assert.equal(t.javob, kutilgan, t.id);
      assert.equal(t.variantlar.length, 5);
      assert.equal(t.rasm, tier < 2);
      uchradi.add(tier + ":" + t.javob);
    }
    for (const t of each(L.qolTask, 150, tier)) {
      const c = kotarilgan(t.poza, "chap");
      const o = kotarilgan(t.poza, "ong");
      assert.equal(t.javob, c && o ? "Ikkalasi" : c ? "Faqat chap" : o ? "Faqat oʻng" : "Hech biri", t.id);
      uchradi.add("qol" + tier + ":" + t.javob);
    }
  }
  // Har zinada hamma javob uchraydi (javob oldindan aniq emas)
  for (const tier of [0, 1, 2]) {
    for (const j of Object.values(L.HOLAT)) assert.ok(uchradi.has(tier + ":" + j), `tier ${tier}: ${j}`);
    for (const j of Object.values(L.QOL)) assert.ok(uchradi.has("qol" + tier + ":" + j), `qol tier ${tier}: ${j}`);
  }
});

test("2-bosqich: toʻrt skeletdan aynan bittasi shartni bajaradi", () => {
  const shart = {
    otirgan: (p) => otirgan(p),
    egilChap: (p) => x(p, "bel") - x(p, "boyin") >= 10,
    egilOng: (p) => x(p, "boyin") - x(p, "bel") >= 10,
    qolChap: (p) => kotarilgan(p, "chap"),
    qolOng: (p) => kotarilgan(p, "ong"),
  };
  const maqsadlar = new Set();
  for (const tier of [0, 1, 2]) {
    for (const t of each(L.qaysiTask, 150, tier)) {
      assert.equal(t.kartalar.length, 4);
      assert.deepEqual(t.kartalar.map((k) => k.harf), ["A", "B", "C", "D"]);
      const mos = t.kartalar.filter((k) => shart[t.maqsad](k.poza));
      assert.equal(mos.length, 1, t.id);
      assert.equal(t.javob, mos[0].harf, t.id);
      for (const k of t.kartalar) {
        pozaToza(k.poza, t.id);
        assert.equal(k.sonlar.length, 2);
      }
      maqsadlar.add(t.maqsad);
    }
  }
  assert.equal(maqsadlar.size, 5);
});

test("3-bosqich: sanoq, almashuv kadri va shovqin — mustaqil hisob bilan", () => {
  assert.equal(L.sanoq([1, 14, 15, 0, 7, 1, 13, 0]), 2);
  assert.deepEqual(L.oshishlar([1, 14, 15, 0, 7, 1, 13, 0]), [4, 8]);
  assert.equal(L.sanoq([0, 13, 14]), 0, "tugallanmagan oʻtirish sanalmaydi");
  assert.equal(L.sanoq([0, 8, 0, 9, 1]), 0, "yarim oʻtirish sanalmaydi");
  for (const d of [0, 2, 6, 9, 11]) assert.ok(!L.otirganD(d));
  for (const d of [12, 17]) assert.ok(L.otirganD(d));
  for (const tier of [0, 1, 2]) {
    let yarim = 0;
    let chala = 0;
    for (const t of each(L.sanashTask, 150, tier)) {
      assert.equal(t.javob, sana(t.kadrlar), t.id);
      assert.ok(t.javob >= 1);
      assert.ok(t.kadrlar.length >= 4 && t.kadrlar.length <= L.UZUNLIK[tier], `${t.id}: uzunlik`);
      for (const d of t.kadrlar) assert.ok((d >= 0 && d <= 2) || (d >= 6 && d <= 9) || (d >= 12 && d <= 17), `${t.id}: ${d}`);
      if (t.kadrlar.some((d) => d >= 6 && d <= 9)) yarim++;
      if (farq(t.kadrlar[t.kadrlar.length - 1]) <= 8) chala++;
      assert.equal(t.korsat, tier === 0 ? "farq" : "son");
    }
    assert.equal(yarim > 0, tier > 0, `tier ${tier}: yarim oʻtirish`);
    assert.equal(chala > 0, tier === 2, `tier ${tier}: tugallanmagan oʻtirish`);

    for (const t of each(L.nechanchiTask, 150, tier)) {
      const k = Number(t.javob.split("-")[0]);
      assert.equal(sana(t.kadrlar.slice(0, k)), t.n, t.id);
      assert.equal(sana(t.kadrlar.slice(0, k - 1)), t.n - 1, t.id);
      for (const v of t.variantlar) {
        const n = Number(v.split("-")[0]);
        assert.ok(n >= 1 && n <= t.kadrlar.length, `${t.id}: ${v}`);
      }
    }
    for (const t of each(L.shovqinTask, 150, tier)) {
      const k = Number(t.javob.split("-")[0]);
      const ot = t.kadrlar.map((d) => farq(d) <= 8);
      // Yolgʻiz "oʻtirgan" kadrlar — aynan bitta va u javob
      const yolgiz = ot.map((v, i) => (v && !ot[i - 1] && !ot[i + 1] ? i + 1 : 0)).filter(Boolean);
      assert.deepEqual(yolgiz, [k], t.id);
      assert.ok(t.kadrlar[k - 2] <= 2 && t.kadrlar[k] <= 2, `${t.id}: shovqin tik kadrlar orasida`);
      assert.match(t.nega, new RegExp(`${sana(t.kadrlar)} chiqadi, aslida ${sana(t.kadrlar) - 1}`));
    }
  }
});

test("bosqich navbati: mashq turlari aylanadi", () => {
  const r = rngFrom(9);
  // Oddiy oʻyin: n-toʻgʻri javobda zina 0, 1, 1, 2, 2, 2 (practice.js, kattalar koʻrinishi)
  const ZINA = [0, 1, 1, 2, 2, 2];
  const oqim = (make, soni) => Array.from({ length: soni }, (x, n) => make(null, r, ZINA[n], n).tur);
  assert.deepEqual(oqim(L.bosqich1Task, 4), ["nuqta", "koordinata", "chekka", "farq"]);
  assert.deepEqual(oqim(L.bosqich2Task, 5), ["holat", "holat", "qol", "qaysi", "holat"]);
  assert.deepEqual(oqim(L.bosqich3Task, 6), ["sanash", "sanash", "nechanchi", "shovqin", "sanash", "nechanchi"]);
  // Qiyin rejim: 7 ta javob, zina doim 2 — hamma mashq turi uchraydi
  const qiyin = (make) => new Set(Array.from({ length: 7 }, (x, n) => make(null, r, 2, n).tur));
  assert.deepEqual([...qiyin(L.bosqich1Task)].sort(), ["chekka", "farq", "qaysiNuqta"]);
  assert.deepEqual([...qiyin(L.bosqich2Task)].sort(), ["holat", "qaysi", "qol"]);
  assert.deepEqual([...qiyin(L.bosqich3Task)].sort(), ["nechanchi", "sanash", "shovqin"]);
});

test("js fayllarida toʻgʻri apostrof (U+0027) yoʻq; oʻ, gʻ — U+02BB bilan", () => {
  const ildiz = path.join(__dirname, "..", "js");
  const fayllar = [];
  (function yur(dir) {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      if (f.isDirectory()) yur(path.join(dir, f.name));
      else if (f.name.endsWith(".js")) fayllar.push(path.join(dir, f.name));
    }
  })(ildiz);
  assert.ok(fayllar.length >= 8, "hamma js fayl topildi");
  for (const f of fayllar) {
    const matn = fs.readFileSync(f, "utf8");
    assert.ok(!matn.includes("'"), `${path.basename(f)}: toʻgʻri apostrof bor`);
    assert.ok(!/[‘’`]\s*[a-z]*[OoGg][‘’]/.test(matn), `${path.basename(f)}: notoʻgʻri tutuq belgisi`);
    assert.ok(!/[OoGg][‘’]/.test(matn), `${path.basename(f)}: oʻ/gʻ U+02BB bilan yozilsin`);
  }
});

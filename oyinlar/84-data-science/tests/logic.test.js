// «Data science»: generatorlar — har tier da 30 ta har xil toʻgʻri misol, javoblar mustaqil qayta hisoblanadi.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const L = require("../js/logic.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

// Generatordan ketma-ket misollar: aynan `soni` ta HAR XIL misol yigʻilguncha (koʻpi bilan `chegara` urinish).
// Yoʻl-yoʻlakay tekshiradi: ketma-ket ikki misol bir xil emas.
function yigish(make, tier, soni, seed, chegara) {
  const r = rngFrom(seed || 84);
  const xil = new Map();
  let prev = null;
  for (let k = 0; k < (chegara || 400) && xil.size < soni; k++) {
    const t = make(prev, r, tier);
    if (prev) assert.notEqual(t.id, prev.id, "ketma-ket bir xil misol: " + t.id);
    xil.set(t.id, t);
    prev = t;
  }
  return [...xil.values()];
}

const TIERLAR = [0, 1, 2];
const BOSQICH_NOMLARI = L.BOSQICHLAR.map((b) => b.nom);

function variantli(t, kamida) {
  assert.ok(t.variantlar.length >= (kamida || 4), t.id + ": kamida 4 variant");
  assert.equal(new Set(t.variantlar).size, t.variantlar.length, t.id + ": variantlar takrorlanmaydi");
  assert.equal(t.variantlar.filter((v) => v === t.javob).length, 1, t.id + ": javob variantlar ichida bir marta");
  assert.ok(t.ishora && !t.ishora.includes(String(t.javob)), t.id + ": maslahat javobni aytmaydi");
  assert.ok(t.nega && t.qisqa && t.matn, t.id + ": matnlar bor");
}

// ---------- 1-bosqich ----------
test("bosqich ishi: har tier da 30 ta har xil misol; javob ishning oʻrnidan qayta hisoblanadi", () => {
  for (const tier of TIERLAR) {
    const list = yigish(L.qadamTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    for (const t of list) {
      variantli(t, 5);
      assert.deepEqual(t.variantlar.slice().sort(), BOSQICH_NOMLARI.slice().sort());
      // Mustaqil: ish matni qaysi loyihaning nechanchi ishi ekanini bankdan izlaymiz
      const loyiha = L.LOYIHALAR.find((l) => l.ishlar.includes(t.ish));
      const k = loyiha.ishlar.indexOf(t.ish);
      const kutilgan = tier === 0 ? k : tier === 1 ? k + 1 : k - 1;
      assert.ok(kutilgan >= 0 && kutilgan <= 4, t.id);
      assert.equal(t.javob, BOSQICH_NOMLARI[kutilgan], t.id);
    }
  }
});

test("loyihalar banki: 5 ta ish, har ish yagona, savollar soʻroq bilan tugaydi", () => {
  const ishlar = L.LOYIHALAR.flatMap((l) => l.ishlar);
  assert.equal(new Set(ishlar).size, ishlar.length);
  for (const l of L.LOYIHALAR) {
    assert.equal(l.ishlar.length, 5, l.kalit);
    assert.equal(l.savollar.length, 2, l.kalit);
    for (const s of l.savollar.concat(l.noaniq)) assert.ok(s.endsWith("?"), s);
    assert.ok(l.ishlar[0].includes("?"), l.kalit + ": birinchi ish — savol");
  }
  assert.equal(new Set(L.NOANIQ).size, L.NOANIQ.length);
});

test("oʻlchanadigan savol: har tier da 30 ta har xil misol; javob bank boʻyicha tekshiriladi", () => {
  const aniq = new Set(L.LOYIHALAR.flatMap((l) => l.savollar));
  const noaniq = new Set(L.NOANIQ);
  for (const tier of TIERLAR) {
    const list = yigish(L.savolTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    for (const t of list) {
      variantli(t);
      assert.equal(t.variantlar.length, 4, t.id);
      if (tier === 0) {
        assert.deepEqual(t.variantlar.filter((v) => aniq.has(v)), [t.javob], t.id);
        assert.equal(t.variantlar.filter((v) => noaniq.has(v)).length, 3, t.id);
      } else if (tier === 1) {
        assert.deepEqual(t.variantlar.filter((v) => noaniq.has(v)), [t.javob], t.id);
        assert.equal(t.variantlar.filter((v) => aniq.has(v)).length, 3, t.id);
      } else {
        const loyiha = L.LOYIHALAR.find((l) => l.savollar[0] === t.savol);
        assert.equal(t.javob, loyiha.malumot, t.id);
        for (const c of loyiha.chalgi) assert.ok(t.variantlar.includes(c), t.id);
      }
    }
  }
});

// ---------- 2-bosqich ----------
// Mustaqil tur aniqlash: qiymatlarga qarab emas, DATASETS tavsifidan (nom → tur, tuzoq)
const USTUN = new Map();
for (const ds of L.DATASETS) {
  for (const u of [ds.asosiy, ...ds.sonli, ...ds.toifali, ...ds.tuzoq]) USTUN.set(ds.nom + "/" + u.nom, u);
}
const ustunTuri = (t, nom) => USTUN.get(t.jadvalNomi + "/" + nom);

function jadvalToʻgʻri(t) {
  const C = t.ustunlar.length;
  assert.ok(t.qatorlar.length >= 3, t.id);
  for (const q of t.qatorlar) assert.equal(q.length, C, t.id + ": har qatorda ustunlar soniga teng qiymat");
  assert.equal(new Set(t.ustunlar.map((u) => u.nom)).size, C, t.id + ": ustun nomlari takrorlanmaydi");
}

test("maʼlumot turi: har tier da 30 ta har xil misol; aynan bitta ustun shartga mos", () => {
  for (const tier of TIERLAR) {
    const list = yigish(L.turTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    for (const t of list) {
      variantli(t);
      jadvalToʻgʻri(t);
      assert.deepEqual(t.variantlar, t.ustunlar.map((u) => u.nom), t.id);
      const turlar = t.variantlar.map((n) => ustunTuri(t, n));
      const izlangan = tier === 0 ? "toifali" : "sonli";
      const mos = turlar.filter((u) => u.tur === izlangan);
      assert.equal(mos.length, 1, t.id + ": yagona toʻgʻri ustun");
      assert.equal(mos[0].nom, t.javob, t.id);
      if (tier === 2) assert.equal(turlar.filter((u) => u.tuzoq).length, 2, t.id + ": ikki raqamli tuzoq");
      else assert.equal(turlar.filter((u) => u.tuzoq).length, 0, t.id);
      // Sonli ustun qiymatlari — son, oʻz oraligʻida
      t.ustunlar.forEach((u, k) => {
        const asl = ustunTuri(t, u.nom);
        if (asl.tur === "sonli") for (const q of t.qatorlar) assert.ok(typeof q[k] === "number" && q[k] >= asl.min && q[k] <= asl.max, t.id);
      });
    }
  }
});

test("jadval tuzilishi: har tier da 30 ta har xil misol; javob jadvaldan qayta sanaladi", () => {
  const turlar = new Set();
  for (const tier of TIERLAR) {
    const list = yigish(L.jadvalTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    for (const t of list) {
      jadvalToʻgʻri(t);
      turlar.add(t.savolTuri);
      const R = t.qatorlar.length;
      const C = t.ustunlar.length;
      const asl = t.ustunlar.map((u) => ustunTuri(t, u.nom));
      const kutilgan = {
        qator: R, ustun: C, katak: R * C,
        sonli: asl.filter((u) => u.tur === "sonli").length,
        toifali: asl.filter((u) => u.tur === "toifali").length,
      }[t.savolTuri];
      assert.equal(t.javob, kutilgan, t.id);
      assert.ok(Number.isInteger(t.javob) && t.javob >= 1 && t.javob <= 30, t.id);
      assert.ok(C >= 3 && C <= 5 && R >= 3 && R <= 6, t.id);
      if (t.savolTuri === "qator" || t.savolTuri === "ustun") assert.notEqual(R, C, t.id + ": qator va ustun soni chalkashmaydi");
      assert.ok(t.hisob.includes(String(t.javob)), t.id);
      assert.ok(t.nega && t.matn, t.id);
    }
  }
  assert.deepEqual([...turlar].sort(), ["katak", "qator", "sonli", "toifali", "ustun"]);
});

// ---------- 3-bosqich ----------
// Mustaqil xato qidiruvchi: jadvalni oʻzi tekshiradi va topilganlarni "tur:q:u" koʻrinishida qaytaradi.
function xatolarniTop(t) {
  const topildi = [];
  t.qatorlar.forEach((qator, q) => {
    const oldingi = t.qatorlar.findIndex((b, k) => k < q && b.every((v, u) => v === qator[u]));
    if (oldingi !== -1) { topildi.push(`takror:${q}:${oldingi}`); return; }
    qator.forEach((v, u) => {
      const ustun = t.ustunlar[u];
      if (v === "") topildi.push(`bosh:${q}:${u}`);
      else if (ustun.tur === "sonli") {
        assert.equal(typeof v, "number", t.id);
        if (v < ustun.chegara[0] || v > ustun.chegara[1]) topildi.push(`imkonsiz:${q}:${u}`);
      } else if (ustun.qiymatlar && !ustun.qiymatlar.includes(v)) {
        assert.ok(ustun.qiymatlar.some((x) => x.toLowerCase() === String(v).toLowerCase()), t.id + ": notanish qiymat " + v);
        topildi.push(`yozuv:${q}:${u}`);
      }
    });
  });
  return topildi.sort();
}
const xatoKalit = (x) => (x.tur === "takror" ? `takror:${x.q}:${x.asl}` : `${x.tur}:${x.q}:${x.u}`);
const belgilar = (t) => t.xatolar.map((x) => (x.tur === "takror" ? `q:${x.q}` : `k:${x.q}:${x.u}`));

function xatoliJadvalToʻgʻri(t, tier) {
  jadvalToʻgʻri(t);
  assert.deepEqual(t.xatolar.map(xatoKalit).sort(), xatolarniTop(t), t.id + ": ekilgan xatolar = jadvaldagi hamma xato");
  // Har xato alohida qatorda
  assert.equal(new Set(t.xatolar.map((x) => x.q)).size, t.xatolar.length, t.id);
  for (const x of t.xatolar) {
    if (x.tur === "yozuv") {
      const toza = t.qatorlar.filter((q) => q[x.u] === x.asl).length;
      assert.ok(toza >= 2, t.id + ": toʻgʻri yozuv kamida ikki qatorda");
      assert.notEqual(x.yomon, x.asl);
    }
    if (x.tur === "takror") {
      assert.ok(x.asl < x.q, t.id);
      if (tier < 2) assert.equal(x.q, x.asl + 1, t.id + ": tier 0–1 da takror yonma-yon");
      assert.ok(!t.xatolar.some((y) => y !== x && y.q === x.asl), t.id + ": takror qilingan qator toza");
    }
  }
  // Asosiy ustun (ism, kun) faqat takror qatorda takrorlanadi
  const nomlar = t.qatorlar.map((q) => q[0]);
  assert.equal(new Set(nomlar).size, nomlar.length - t.xatolar.filter((x) => x.tur === "takror").length, t.id);
}

test("tozalash: har tier da 30 ta har xil jadval; ekilgan xatolar mustaqil qidiruvga teng", () => {
  const SONI = [2, 3, 4];
  for (const tier of TIERLAR) {
    const list = yigish(L.tozalashTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    const uchragan = new Set();
    for (const t of list) {
      xatoliJadvalToʻgʻri(t, tier);
      assert.equal(t.xatolar.length, SONI[tier], t.id);
      assert.equal(new Set(t.xatolar.map((x) => x.tur)).size, SONI[tier], t.id + ": xato turlari har xil");
      assert.equal(t.qatorlar.length, L.QATORLAR[tier] + (tier > 0 ? 1 : 0), t.id);
      assert.equal(t.izohlar.length, t.xatolar.length);
      assert.match(t.matn, new RegExp(`${SONI[tier]} ta xato`));
      t.xatolar.forEach((x) => uchragan.add(x.tur));
      // Toʻgʻri belgilash qabul qilinadi
      assert.equal(L.tekshir(t, belgilar(t)).ok, true, t.id);
    }
    assert.equal(uchragan.size, tier === 0 ? 3 : 4, `tier ${tier}: hamma xato turi uchraydi`);
  }
});

test("tekshir: kam, ortiqcha va takror juftligi", () => {
  const t = yigish(L.tozalashTask, 2, 1, 7)[0];
  const toʻliq = belgilar(t);
  const takror = t.xatolar.find((x) => x.tur === "takror");
  assert.deepEqual(L.tekshir(t, toʻliq), { ok: true, topildi: 4, ortiqcha: 0, jami: 4, ikkalasi: false });
  // Juftlikning ikkinchisi oʻrniga aslini belgilash ham toʻgʻri
  const asli = toʻliq.map((b) => (b === `q:${takror.q}` ? `q:${takror.asl}` : b));
  assert.equal(L.tekshir(t, asli).ok, true);
  // Ikkalasini belgilash — xato (obyekt yoʻqoladi)
  const ikkala = L.tekshir(t, toʻliq.concat(`q:${takror.asl}`));
  assert.equal(ikkala.ok, false);
  assert.equal(ikkala.ikkalasi, true);
  // Bittasi yetishmaydi
  const kam = L.tekshir(t, toʻliq.slice(1));
  assert.deepEqual([kam.ok, kam.topildi, kam.ortiqcha], [false, 3, 0]);
  // Toza katak ortiqcha belgilangan
  const toza = t.xatolar.some((x) => x.q === 0 && x.u === 0) ? "k:1:0" : "k:0:0";
  const ortiq = L.tekshir(t, toʻliq.concat(toza));
  assert.deepEqual([ortiq.ok, ortiq.topildi, ortiq.ortiqcha], [false, 4, 1]);
  assert.equal(L.tekshir(t, []).ok, false);
  // Bir xil belgi ikki marta yuborilsa ham bitta sanaladi
  assert.equal(L.tekshir(t, toʻliq.concat(toʻliq)).ok, true);
});

test("xato turi: har tier da 30 ta har xil misol; javob mustaqil topilgan xato turiga mos", () => {
  for (const tier of TIERLAR) {
    const list = yigish(L.turiTask, tier, 30);
    assert.equal(list.length, 30, `tier ${tier}`);
    const uchragan = new Set();
    for (const t of list) {
      variantli(t);
      assert.equal(t.variantlar.length, 4);
      xatoliJadvalToʻgʻri(t, tier);
      const topilgan = xatolarniTop(t);
      assert.equal(topilgan.length, 1, t.id + ": jadvalda aynan bitta xato");
      const tur = topilgan[0].split(":")[0];
      uchragan.add(tur);
      assert.equal(t.javob, (tier === 2 ? L.TUZATISH : L.XATO_NOMI)[tur], t.id);
      assert.equal(xatoKalit(t.xato), topilgan[0], t.id);
    }
    assert.equal(uchragan.size, 4, `tier ${tier}: toʻrt xato turi ham uchraydi`);
  }
});

test("imkonsiz qiymatlar chegaradan tashqarida, yasaladiganlari — ichida", () => {
  for (const ds of L.DATASETS) {
    assert.ok(ds.sonli.length >= 4 && ds.toifali.length >= 3 && ds.tuzoq.length === 2, ds.kalit);
    assert.ok(ds.asosiy.qiymatlar.length >= 7, ds.kalit);
    for (const u of ds.sonli) {
      assert.ok(u.chegara[0] <= u.min && u.max <= u.chegara[1], u.nom);
      for (const v of u.imkonsiz.concat(u.nozik)) assert.ok(v < u.chegara[0] || v > u.chegara[1], `${u.nom}: ${v}`);
    }
    for (const u of ds.toifali) assert.equal(new Set(u.qiymatlar.map((x) => x.toLowerCase())).size, u.qiymatlar.length, u.nom);
  }
  assert.equal(L.korsat(-3), "−3");
  assert.equal(L.korsat(0), "0");
  assert.equal(L.korsat(""), "");
});

// ---------- Bosqich navbati ----------
test("bosqich generatorlari: navbat aylanadi, har tier da 30 ta har xil misol", () => {
  const r = rngFrom(5);
  assert.deepEqual([0, 1, 2].map((n) => L.bosqich1Task(null, r, 0, n).tur), ["qadam", "savol", "qadam"]);
  assert.deepEqual([0, 1, 2].map((n) => L.bosqich2Task(null, r, 1, n).tur), ["tur", "jadval", "tur"]);
  assert.deepEqual([0, 1, 2, 3].map((n) => L.bosqich3Task(null, r, 2, n).tur), ["tozalash", "turi", "tozalash", "tozalash"]);
  for (const make of [L.bosqich1Task, L.bosqich2Task, L.bosqich3Task]) {
    for (const tier of TIERLAR) {
      let n = 0;
      const list = yigish((prev, rng, t) => make(prev, rng, t, n++), tier, 30);
      assert.equal(list.length, 30);
    }
  }
});

// ---------- Imlo ----------
test("js fayllarida toʻgʻri apostrof (U+0027) yoʻq: oʻ gʻ — U+02BB, tutuq — U+02BC", () => {
  const TOGRI = String.fromCharCode(39);
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : e.name.endsWith(".js") ? [p] : [];
  });
  const fayllar = walk(path.join(__dirname, "..", "js")).concat(walk(__dirname));
  assert.ok(fayllar.length >= 8);
  for (const p of fayllar) {
    const src = fs.readFileSync(p, "utf8");
    const satr = src.split("\n").findIndex((s) => s.includes(TOGRI));
    assert.equal(satr, -1, `${path.basename(p)}: ${satr + 1}-satrda toʻgʻri apostrof`);
    // Notoʻgʻri belgilar: ‘ ’ ` oʻrniga ham faqat ʻ / ʼ
    assert.ok(!/[oOgG][‘’]/.test(src), path.basename(p) + ": oʻ/gʻ da U+2018/2019");
  }
});

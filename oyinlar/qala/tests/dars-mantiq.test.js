// Qal'a darslari — 15 generator: shakl, takrorsizlik, to'g'ri javob tekshiruvi, tier 0/1/2.
const test = require("node:test");
const assert = require("node:assert/strict");
const Q = require("../js/qala.js");
const D = require("../js/dars-mantiq.js");
const X = Q.LIB.xat;

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const IDS = ["d1a", "d1b", "d1c", "d2a", "d2b", "d2c", "d3a", "d3b", "d3c", "d4a", "d4b", "d4c", "d5a", "d5b", "d5c"];
const ATAMA_IDS = Q.ATAMALAR.map((a) => a.id);

// n ta mashq ketma-ket (prev uzatiladi)
function ketma(id, n, tier, seed) {
  const r = rngFrom(seed || 42);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = D[id](prev, r, tier);
    out.push(prev);
  }
  return out;
}

// Umumiy shakl: tur, savol, javob, izoh, atamalar, kalit; tur bo'yicha maydonlar
function shakl(task, id) {
  assert.ok(task, id + " — null");
  assert.ok(["son", "tanlov", "matn-tanlov", "tartib", "dialog", "byudjet"].includes(task.tur), id + " tur: " + task.tur);
  assert.ok(typeof task.savol === "string" && task.savol.length > 10, id + " savol");
  assert.ok(typeof task.izoh === "string" && task.izoh.length > 10, id + " izoh");
  assert.ok(typeof task.kalit === "string" && task.kalit.startsWith(id.split("/")[0] + ":"), id + " kalit");
  assert.ok(Array.isArray(task.atamalar) && task.atamalar.length >= 1 && task.atamalar.length <= 4, id + " atamalar");
  for (const a of task.atamalar) assert.ok(ATAMA_IDS.includes(a), id + " atama: " + a);
  if (task.tur === "son") {
    assert.equal(typeof task.javob, "number", id);
    assert.ok(Number.isFinite(task.javob));
    if (String(task.javob).length > 3) assert.ok(task.maxLen >= String(task.javob).length, id + " maxLen");
  } else if (task.tur === "tanlov" || task.tur === "matn-tanlov") {
    assert.ok(task.variantlar.length >= 4, id + " variantlar: " + task.variantlar.length);
    assert.equal(new Set(task.variantlar).size, task.variantlar.length, id + " variant takror: " + task.variantlar.join("|"));
    assert.ok(task.variantlar.includes(task.javob), id + " javob variantlarda yo'q: " + task.javob);
    assert.ok(task.variantlar.every((v) => typeof v === "string" && v.length > 0), id);
  } else if (task.tur === "tartib") {
    assert.ok(task.elementlar.length >= 3, id);
    const ids = task.elementlar.map((e) => e.id);
    assert.ok(task.elementlar.every((e) => e.id && e.matn), id);
    assert.deepEqual(task.javob.slice().sort(), ids.slice().sort(), id + " javob — id'lar tartibi");
    assert.notDeepEqual(task.javob, []);
  } else if (task.tur === "dialog") {
    assert.ok(task.vaziyat && task.gaplar.length >= 1, id);
    assert.equal(task.javoblar.length, 3, id);
    assert.equal(task.javoblar.filter((j) => j.togri).length, 1, id);
    assert.equal(task.javob, task.javoblar.find((j) => j.togri).matn, id);
    assert.ok(X.belgi(task.hiyla), id + " hiyla");
    assert.equal(task.hiylalar.length, 3, id);
    assert.ok(task.hiylalar.includes(task.hiyla), id);
    assert.ok(task.hiylalar.every((h) => X.belgi(h)), id);
  } else if (task.tur === "byudjet") {
    assert.ok(task.profil.nom && task.profil.izoh && Array.isArray(task.profil.qurollar), id);
    assert.equal(task.devorlar, Q.DEVORLAR);
    assert.equal(task.byudjet, 10);
    assert.equal(typeof task.tekshir, "function");
    assert.equal(task.tekshir(task.javob).ok, true, id + " tavsiya turadi");
    assert.equal(task.tekshir({}).ok, false, id + " bo'sh tanlov yiqiladi");
    const b = task.tekshir(task.javob);
    assert.ok(b.devorlar.every((d) => typeof d.turdi === "boolean" && d.sabab && d.id), id);
    assert.ok(typeof b.narx === "number");
  }
  if (task.yechim !== undefined) assert.equal(typeof task.yechim, "string", id + " yechim");
}

test("15 generator × tier 0/1/2: 20 ta mashq, ketma-ket takrorlanmaydi, shakl to'g'ri", () => {
  for (const id of IDS) {
    for (const tier of [0, 1, 2]) {
      const list = ketma(id, 20, tier, 7 + tier);
      list.forEach((t) => shakl(t, id + "/" + tier));
      for (let k = 1; k < list.length; k++) assert.notEqual(list[k].kalit, list[k - 1].kalit, id + "/" + tier + " takror: " + list[k].kalit);
      // Har xil urug' — boshqa mashq (generator rng ga bog'liq, Math.random emas)
      const a = D[id](null, rngFrom(1), tier);
      const b = D[id](null, rngFrom(1), tier);
      assert.equal(a.kalit, b.kalit, id + " deterministik");
    }
    // rng va tier berilmasa ham ishlaydi
    shakl(D[id](null), id + "/default");
  }
});

test("DARSLAR: 5 dars × 3 mashq, generatorlar mavjud, atamalar to'g'ri", () => {
  assert.equal(D.DARSLAR.length, 5);
  assert.deepEqual(D.DARSLAR.flatMap((d) => d.mashqlar), IDS);
  for (const d of D.DARSLAR) {
    assert.ok(d.nom);
    for (const m of d.mashqlar) assert.equal(typeof D[m], "function", m);
    for (const a of d.atamalar) assert.equal(Q.atama(a).dars, d.id, a);
  }
  assert.deepEqual(new Set(D.DARSLAR.flatMap((d) => d.atamalar)), new Set(ATAMA_IDS), "hamma atama biror darsda");
});

// ---------- 1-dars ----------
test("d1a: javob a^n yoki a^n ÷ 1 000 000; tier 0 faqat variant, tier 2 faqat soniya", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of ketma("d1a", 20, tier)) {
      const s = D.D1A.find((x) => "d1a:" + x.id === t.kalit);
      assert.ok(s && s.t === tier, t.kalit);
      const v = BigInt(s.a) ** BigInt(s.n);
      assert.equal(t.javob, Number(s.sora === "variant" ? v : v / 1000000n));
      if (tier === 0) assert.equal(s.sora, "variant");
      if (tier === 2) assert.equal(s.sora, "soniya");
      assert.ok(t.yechim.includes(s.a + "^" + s.n));
    }
  }
});

test("d1b: 4 parol, tartib — parolKuch soniyasi o'sib boradi; tier 0 da lug'at paroli birinchi", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of ketma("d1b", 20, tier)) {
      assert.equal(t.elementlar.length, 4);
      const matn = (id) => t.elementlar.find((e) => e.id === id).matn;
      const sek = t.javob.map((id) => Q.parolKuch(matn(id)).soniya);
      for (let k = 1; k < 4; k++) assert.ok(sek[k] > sek[k - 1], t.kalit + " " + sek.join(","));
      if (tier === 0) assert.equal(Q.parolKuch(matn(t.javob[0])).lugatda, true);
    }
  }
});

test("d1c: 6 nomzod, faqat javob uchala maslahatga mos", () => {
  // Maslahat satrdan tekshiriladi (bola ham shunday qiladi): uzunlik, belgi turlari qatori (ketma-ket bir xili bitta), lug'at
  const siq = (list) => list.filter((x, i) => i === 0 || x !== list[i - 1]).join("+");
  const mos = (parol, maslahatlar) => {
    if (parol.length !== Number(maslahatlar[0].replace(/\D/g, ""))) return false;
    const turlar = [...parol].map((ch) => (/[a-z]/.test(ch) ? "soʻz" : /[0-9]/.test(ch) ? "raqam" : "belgi"));
    if (siq(turlar) !== siq(maslahatlar[1].toLowerCase().split(" + "))) return false;
    const sozlar = parol.match(/[a-z]+/g) || [];
    const lugat = !sozlar.length ? "Soʻz yoʻq" : sozlar.some((s) => Q.LUGAT.includes(s)) ? "Soʻz lugʻatda bor" : "Soʻz lugʻatda yoʻq";
    return lugat === maslahatlar[2];
  };
  for (const tier of [0, 1, 2]) {
    for (const t of ketma("d1c", 20, tier)) {
      assert.equal(t.variantlar.length, 6);
      assert.equal(t.maslahatlar.length, 3);
      assert.ok(mos(t.javob, t.maslahatlar), t.kalit + " " + t.maslahatlar.join(" | "));
      assert.equal(t.variantlar.filter((v) => mos(v, t.maslahatlar)).length, 1, t.kalit + ": " + t.variantlar.join(", ") + " | " + t.maslahatlar.join(" | "));
    }
  }
});

// ---------- 2-dars ----------
test("d2a / d2c: javob = iz(matn, tuz); qadamlar va yechim bor; tier 2 da raqam qo'shiladi", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of ketma("d2a", 20, tier)) {
      assert.equal(t.javob, Q.iz(t.matn, 0));
      assert.equal(t.qadamlar.length, t.matn.length);
      assert.match(t.matn, tier === 2 ? /^[a-z]+[0-9]+$/ : /^[a-z]{3,5}$/);
    }
    for (const t of ketma("d2c", 20, tier)) {
      const tuz = Number(t.kalit.split(":")[2]);
      assert.ok(tuz >= 1 && tuz <= 99);
      assert.equal(t.javob, Q.iz(t.matn, tuz));
      assert.notEqual(t.javob, Q.iz(t.matn, 0));
      assert.ok(t.savol.includes(String(tuz)));
    }
  }
});

test("d2b: tier 0 — jadvalda aynan ikkita teng iz, javob o'sha ikki ism; tier 1–2 — jadvaldan parol, iz jadvalda yagona", () => {
  for (const t of ketma("d2b", 20, 0)) {
    const izlar = t.jadval.map((x) => x.iz);
    const teng = izlar.filter((x, i) => izlar.indexOf(x) !== i);
    assert.equal(teng.length, 1, t.kalit);
    const ismlar = t.jadval.filter((x) => x.iz === teng[0]).map((x) => x.ism);
    assert.equal(t.javob, ismlar.join(" va "));
  }
  for (const tier of [1, 2]) {
    for (const t of ketma("d2b", 20, tier)) {
      const nishon = Number(t.savol.match(/iz (\d+)/)[1]);
      const qator = t.jadval.filter((x) => x.iz === nishon);
      assert.equal(qator.length, 1, t.kalit);
      assert.equal(t.javob, qator[0].parol);
      assert.equal(Q.iz(t.javob, 0), nishon);
      assert.equal(t.jadval.length, tier === 1 ? 5 : 6);
    }
  }
});

// ---------- 3-dars ----------
test("d3a: sezar(javob, k) = matn, k tier bo'yicha; d3b: sezarTaxmin(matn) = javob, chastota ustunlari; d3c: vijener(matn, kalit) = javob, tier 2 son", () => {
  const K = [[1, 5], [6, 13], [14, 25]];
  for (const tier of [0, 1, 2]) {
    for (const t of ketma("d3a", 20, tier)) {
      assert.equal(Q.sezar(t.javob, t.k), t.matn, t.kalit);
      assert.ok(t.k >= K[tier][0] && t.k <= K[tier][1]);
      for (const v of t.variantlar) if (v !== t.javob) assert.notEqual(Q.sezar(v, t.k), t.matn);
    }
    for (const t of ketma("d3b", 20, tier)) {
      assert.equal(Q.sezarTaxmin(t.matn), t.javob, t.kalit);
      assert.ok(t.matn.length >= 25);
      assert.equal(t.chastota.length, 8);
      assert.equal(t.chastota[0].harf, Q.sezar("a", t.javob));
    }
    let son = 0;
    for (const t of ketma("d3c", 30, tier)) {
      if (t.tur === "son") { son++; assert.equal(t.javob, 17576); continue; }
      assert.match(t.shifrKalit, /^[a-z]{3}$/);
      assert.equal(Q.vijener(t.matn, t.shifrKalit), t.javob, t.kalit);
      assert.ok(t.savol.includes("«" + t.shifrKalit + "»"));
    }
    if (tier < 2) assert.equal(son, 0);
    else assert.ok(son >= 5 && son <= 25, "tier 2 aralash: " + son);
  }
});

// ---------- 4-dars ----------
test("d4a: 4 manzil, faqat javob soxta (52 domenFarqi), tier 2 — nozik (harf/ko'chgan)", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of ketma("d4a", 20, tier)) {
      assert.equal(t.variantlar.length, 4);
      for (const v of t.variantlar) {
        const f = X.domenFarqi(t.asl, v);
        const soxta = f.xil !== null || X.gumonliZona(v);
        assert.equal(soxta, v === t.javob, t.kalit + " → " + v + " " + f.xil);
      }
      if (tier === 2) assert.ok(["harf", "qoshimcha"].includes(X.domenFarqi(t.asl, t.javob).xil), t.kalit);
      assert.ok(t.yechim.includes(t.javob));
    }
  }
});

test("d4b: DIALOGLAR dan, javob to'g'ri javob matni, hiyla izohda nomlanadi; hamma dialog chiqadi", () => {
  const list = ketma("d4b", 60, 1);
  const idlar = new Set(list.map((t) => t.kalit));
  assert.equal(idlar.size, Q.DIALOGLAR.length, "hamma dialog chiqdi");
  for (const t of list) {
    const d = Q.DIALOGLAR.find((x) => "d4b:" + x.id === t.kalit);
    assert.equal(t.hiyla, d.hiyla);
    assert.deepEqual(t.gaplar, d.gaplar);
    assert.ok(t.yechim.includes(X.belgi(d.hiyla).nom));
  }
});

test("d4c: 3 xat, ishonchlar farqli, javob — ishonch o'sish tartibida (eng shubhalisi birinchi); tier 2 da haqiqiy xat yo'q", () => {
  for (const tier of [0, 1, 2]) {
    for (const t of ketma("d4c", 20, tier)) {
      assert.equal(t.elementlar.length, 3);
      const ish = (id) => t.elementlar.find((e) => e.id === id).ishonch;
      assert.ok(ish(t.javob[0]) < ish(t.javob[1]) && ish(t.javob[1]) < ish(t.javob[2]), t.kalit);
      assert.ok(t.elementlar.every((e) => e.matn.startsWith("Kimdan: ")));
      if (tier === 2) assert.ok(t.elementlar.every((e) => e.ishonch < 100), t.kalit);
      else assert.equal(ish(t.javob[2]), 100);
    }
  }
});

// ---------- 5-dars ----------
test("d5a: 6 vaziyat, 4 variant; d5c: qoida savollari, 4 variant; hammasi chiqadi", () => {
  assert.equal(D.D5A.length, 6);
  assert.equal(new Set(ketma("d5a", 60, 0).map((t) => t.kalit)).size, 6);
  assert.ok(D.D5C.length >= 3);
  assert.equal(new Set(ketma("d5c", 80, 0).map((t) => t.kalit)).size, D.D5C.length);
  for (const t of ketma("d5a", 10, 2).concat(ketma("d5c", 10, 2))) assert.equal(t.variantlar.length, 4);
});

test("d5b: profil PROFILLAR dan, tekshir = byudjetBaho, noto'g'ri tanlov yiqiladi, tier 2 da qurollar yashirin", () => {
  for (const tier of [0, 1, 2]) {
    const list = ketma("d5b", 12, tier);
    assert.equal(new Set(list.map((t) => t.kalit)).size, 3);
    for (const t of list) {
      const p = Q.profil(t.profil.id);
      assert.ok(p);
      assert.deepEqual(t.javob, Q.byudjetTavsiya(p));
      const hammasi = t.tekshir({ parol: "kuchli", qulf: "tuz", shifr: "kalitli", xat: "filtr", ikki: "ikki" });
      assert.equal(hammasi.xato, "vaqt");
      assert.equal(hammasi.ok, false);
      assert.equal(t.profil.qurollar.length, tier === 2 ? 0 : p.qurollar.length);
      assert.ok(t.yechim.includes("narx"));
    }
  }
});

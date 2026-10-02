// 53-o'yin: xato ovi — har vazifaning xato dasturi haqiqatan yiqilishi,
// to'g'ri dasturi esa qabul qilinishi kerak.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const D = require("../../umumiy/js/dastur.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const each = (make, n, seed) => {
  const r = rngFrom(seed || 53);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};
const hamma = () => Object.entries(L.VAZIFALAR).flatMap(([b, list]) => list.map((v) => [b, v]));

// O'yinning asosiy da'vosi: berilgan dasturda haqiqatan xato bor
test("har vazifaning xato dasturi qabul qilinmaydi", () => {
  for (const [bosqich, v] of hamma()) {
    const f = v.maydon();
    const r = L.tekshir(v, f, v.dastur);
    assert.equal(r.ok, false, bosqich + "/" + v.id + ": xato dastur oʻtib ketdi");
    assert.ok(r.sabab && r.sabab.length > 10, bosqich + "/" + v.id + ": sabab yoʻq");
  }
});

test("har vazifaning to'g'ri dasturi qabul qilinadi", () => {
  for (const [bosqich, v] of hamma()) {
    const f = v.maydon();
    const r = L.tekshir(v, f, v.togri);
    assert.equal(r.ok, true, bosqich + "/" + v.id + ": " + r.sabab);
  }
});

test("xatoIndeks dastur ichida va to'g'ri joyni ko'rsatadi", () => {
  for (const [bosqich, v] of hamma()) {
    assert.ok(v.xatoIndeks >= 0 && v.xatoIndeks <= v.dastur.length, bosqich + "/" + v.id);
    // "top" bosqichida bola aynan shu buyruqni bosadi — u yiqilish joyiga mos bo'lishi kerak
    if (bosqich === "top") {
      const joy = L.xatoJoyi(v.maydon(), v.dastur);
      assert.ok(joy >= 0, v.id);
      if (v.id !== "chekka") assert.equal(joy, v.xatoIndeks, v.id + ": yiqilish joyi xatoIndeks ga mos emas");
    }
  }
});

test("xatoJoyi: urilgan buyruq o'rni, yetib borsa −1", () => {
  const f = L.maydon({ x: 0, y: 0 }, { x: 2, y: 0 }, [{ x: 1, y: 0 }]);
  assert.equal(L.xatoJoyi(f, ["right"]), 0, "birinchi buyruqdayoq toshga uriladi");
  assert.equal(L.xatoJoyi(f, ["down", "right", "right", "up"]), -1, "aylanib oʻtsa — xato yoʻq");
  assert.equal(L.xatoJoyi(f, ["down"]), 1, "buyruq tugasa — dastur oxiri");
});

test("qisqalik talab qilinadigan vazifa: uzun yechim o'tmaydi", () => {
  const v = L.VAZIFALAR.tuzat.find((x) => x.qisqa);
  assert.ok(v, "qisqalik vazifasi boʻlishi kerak");
  const f = v.maydon();
  const eng = D.solve(f);
  assert.equal(L.tekshir(v, f, eng).ok, true);
  // Bir qadam ortiqcha: yuqoriga chiqib qaytish
  const uzun = ["up", "down"].concat(eng);
  assert.equal(L.tekshir(v, f, uzun).ok, false);
  assert.match(L.tekshir(v, f, uzun).sabab, /ortiqcha/);
});

test("maydonlar yaroqli: yo'l bor, robot va gulxan joyida", () => {
  for (const [bosqich, v] of hamma()) {
    const f = v.maydon();
    assert.ok(D.solve(f) !== null, bosqich + "/" + v.id + ": yoʻl yoʻq");
    assert.ok(f.w <= 5 && f.h <= 5, v.id);
    assert.ok(!D.isWall(f, f.robot) && !D.isWall(f, f.goal), v.id);
    assert.ok(v.dastur.length >= 2 && v.dastur.length <= 6, v.id + ": dastur juda uzun");
  }
});

test("har bosqichda kamida uchta vazifa va ishora bor", () => {
  for (const [bosqich, list] of Object.entries(L.VAZIFALAR)) {
    assert.ok(list.length >= 3, bosqich);
    for (const v of list) {
      assert.ok(v.matn.length > 20, v.id);
      assert.ok(v.ishora.length > 20, v.id);
      for (const dir of v.dastur.concat(v.togri)) assert.ok(D.ORDER.includes(dir), v.id + ": " + dir);
    }
  }
});

test("ketma-ket vazifalar takrorlanmaydi", () => {
  for (const make of [L.topTask, L.tuzatTask]) {
    const list = each(make, 8, 11);
    for (let k = 1; k < list.length; k++) assert.notEqual(list[k].id, list[k - 1].id);
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  for (const [, v] of hamma()) {
    assert.ok(!/['’`´]/.test(v.matn), v.matn);
    assert.ok(!/['’`´]/.test(v.ishora), v.ishora);
  }
  for (const m of Object.values(L.XATO_MATNI)) assert.ok(!/['’`´]/.test(m), m);
});

// ---------- 2026-10-02: vazifa generatori ----------
const yasalganlar = (yasash, tier, n, seed) => {
  const r = rngFrom(seed);
  const out = [];
  while (out.length < n) {
    const t = yasash(r, tier);
    if (t) out.push(t);
  }
  return out;
};

test("generator, xatoni top: xato dastur yiqiladi, xato o'rni YAGONA, kamida 4 variant", () => {
  for (const tier of [0, 1, 2]) {
    const turlar = new Set();
    for (const t of yasalganlar(L.yasaTop, tier, 150, 53 + tier)) {
      const f = t.maydon();
      const nom = `tier ${tier}: ${t.id}`;
      assert.equal(L.togrimi(f, t.dastur), false, nom + " — xato dastur gulxanga yetdi");
      assert.equal(L.togrimi(f, t.togri), true, nom);
      assert.deepEqual(t.togri, D.solve(f), nom + " — to'g'ri dastur eng qisqa yo'l");
      // Bitta tahrir bilan tuzatiladigan yagona o'rin — aynan xatoIndeks
      assert.deepEqual(L.tuzatishJoylari(f, t.dastur), [t.xatoIndeks], nom);
      assert.ok(t.xatoIndeks >= 0 && t.xatoIndeks <= t.dastur.length, nom);
      assert.ok(t.dastur.length + 1 >= 4, nom + " — variantlar 4 tadan kam");
      assert.ok(t.dastur.length <= L.UZUNLIK, nom);
      // Maydon tier chegarasida
      const lim = L.MAYDON[tier];
      assert.equal(f.walls.length, lim.walls);
      assert.ok(t.togri.length >= lim.min && t.togri.length <= lim.max, nom);
      assert.ok(f.w <= 5 && f.h <= 5);
      assert.ok(t.matn.length > 20 && t.ishora.length > 20 && t.izoh.length > 10, nom);
      for (const m of [t.matn, t.ishora, t.izoh]) assert.ok(!/['’`´]/.test(m), m);
      // Maslahat javobni aytmaydi: unda buyruq raqami yo'q
      assert.ok(!/\d/.test(t.ishora), "ishorada raqam bor: " + t.ishora);
      turlar.add(t.xatoIndeks === t.dastur.length ? "ochir" : t.dastur.length > t.togri.length ? "qosh" : "almashtir");
    }
    assert.deepEqual([...turlar].sort(), ["almashtir", "ochir", "qosh"], `tier ${tier}: uchala buzish turi uchraydi`);
  }
});

test("generator, tuzat: berilgan dastur qabul qilinmaydi, eng qisqa yo'l qabul qilinadi", () => {
  for (const tier of [0, 1, 2]) {
    let qisqa = 0;
    for (const t of yasalganlar(L.yasaTuzat, tier, 150, 71 + tier)) {
      const f = t.maydon();
      const nom = `tier ${tier}: ${t.id}`;
      assert.equal(L.tekshir(t, f, t.dastur).ok, false, nom + " — xato dastur o'tib ketdi");
      assert.equal(L.tekshir(t, f, t.togri).ok, true, nom);
      assert.ok(t.dastur.length >= 2 && t.dastur.length <= L.UZUNLIK, nom);
      for (const dir of t.dastur) assert.ok(D.ORDER.includes(dir));
      if (t.qisqa) qisqa++;
      if (tier === 0) assert.ok(!t.qisqa, "tier 0 da qisqalik sharti yo'q");
      if (tier === 2) {
        assert.equal(t.qisqa, true, "tier 2: eng qisqa dastur shart");
        // "Ortiqcha qadam" vazifasidan tashqari — haqiqatan ikkita xato: bitta tahrir yetmaydi
        if (!L.togrimi(f, t.dastur)) assert.deepEqual(L.tuzatishJoylari(f, t.dastur), [], nom);
      }
      if (L.togrimi(f, t.dastur)) {
        // ortiqcha qadamli dastur: ishlaydi, lekin uzun
        assert.equal(t.dastur.length, t.togri.length + 2, nom);
        assert.match(L.tekshir(t, f, t.dastur).sabab, /ortiqcha/);
      }
    }
    if (tier > 0) assert.ok(qisqa > 20, `tier ${tier}: qisqalik vazifalari ${qisqa}`);
  }
});

test("buz va tuzatishJoylari: qo'lda tekshirilgan misollar", () => {
  const f = L.maydon({ x: 0, y: 2 }, { x: 3, y: 2 });
  // ➡ ⬆ ➡ ➡: 2-buyruqni o'chirish tuzatadi — lekin oxiriga ⬇ qo'shish ham! Xato o'rni yagona emas,
  // shuning uchun generator bunday vazifani "xatoni top" ga bermaydi.
  assert.deepEqual(L.tuzatishJoylari(f, ["right", "up", "right", "right"]), [1, 4]);
  // Devor yonida: ⬆ dan keyin pastga qaytib bo'lmaydi (tosh) — xato o'rni yagona
  const g = L.maydon({ x: 0, y: 2 }, { x: 3, y: 2 }, [{ x: 3, y: 1 }]);
  assert.deepEqual(L.tuzatishJoylari(g, ["right", "up", "right", "right"]), [1]);
  // ➡ ➡: oxirida buyruq yetishmaydi
  assert.deepEqual(L.tuzatishJoylari(f, ["right", "right"]), [2]);
  // ➡ ➡ ➡ — to'g'ri dastur: buzilgan nusxalari
  const r = rngFrom(9);
  for (const tur of L.BUZISH) {
    for (let k = 0; k < 30; k++) {
      const b = L.buz(["right", "right", "right"], tur, r);
      assert.equal(b.dastur.length, tur === "ochir" ? 2 : tur === "qosh" ? 4 : 3);
      assert.ok(b.joy >= 0 && b.joy <= b.dastur.length);
      assert.ok(b.izoh.length > 10);
    }
  }
});

test("topTask / tuzatTask: tier bilan ishlaydi, ketma-ket takror yo'q", () => {
  for (const make of [L.topTask, L.tuzatTask]) {
    for (const tier of [0, 1, 2]) {
      const r = rngFrom(101 + tier);
      let prev = null;
      let yasama = 0;
      for (let k = 0; k < 60; k++) {
        const t = make(r, prev, tier);
        assert.ok(t && t.dastur && t.maydon(), "vazifa bo'sh");
        if (prev) assert.notEqual(t.id, prev.id);
        if (t.yasama) yasama++;
        if (t.tur === "top") assert.ok(t.dastur.length + 1 >= 4, "kamida 4 variant");
        prev = t;
      }
      if (tier === 0 && make === L.tuzatTask) assert.ok(yasama > 20 && yasama < 60, "tuzat, tier 0: namunalar ham aralashadi");
      else assert.equal(yasama, 60, "faqat yasalgan vazifalar");
    }
  }
});

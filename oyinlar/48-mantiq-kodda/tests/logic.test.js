// 48-o'yin mantiqi: True/False, and/or/not. Qiymatlarni talqinchining o'zi hisoblaydi.
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const K = require("../../umumiy/js/kod.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const each = (make, n, seed) => {
  const r = rngFrom(seed || 48);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev);
    out.push(prev);
  }
  return out;
};

test("qiymat(): ifodani Python hisoblaydi", () => {
  assert.equal(L.qiymat("5 > 3").qiymat, "True");
  assert.equal(L.qiymat("5 == 3").qiymat, "False");
  assert.equal(L.qiymat("a and b", { a: "True", b: "False" }).qiymat, "False");
  assert.equal(L.qiymat("not a", { a: "False" }).qiymat, "True");
  assert.ok(L.qiymat("5 >").xato, "sintaksis xatosi tutilishi kerak");
});

// Rostlik jadvali qo'lda yozilmaydi — Pythonning o'zidan chiqadi
test("jadval(): and, or, not uchun to'g'ri rostlik jadvali", () => {
  const and = L.jadval("a and b");
  assert.deepEqual(and.map((q) => q.natija), [true, false, false, false]);
  const or = L.jadval("a or b");
  assert.deepEqual(or.map((q) => q.natija), [true, true, true, false]);
  const not = L.jadval("not a");
  assert.equal(not.length, 2, "bitta o'zgaruvchi — ikki qator");
  assert.deepEqual(not.map((q) => q.natija), [false, true]);
  // De Morgan: not (a and b) = not a or not b
  assert.deepEqual(L.jadval("not (a and b)").map((q) => q.natija), L.jadval("not a or not b").map((q) => q.natija));
});

// 2026-10-02: bitta True/False (50% taxmin) o'rniga — bitta print ichida UCHTA solishtirish
test("solishtirish savollari: uchta javob, har biri Pythonning o'zidan", () => {
  for (const tier of [0, 1, 2]) {
    const r = rngFrom(3 + tier);
    let prev = null;
    for (let k = 0; k < 40; k++) {
      const t = L.solishtirTask(r, prev, tier);
      prev = t;
      assert.equal(t.ifodalar.length, 3, t.kod);
      assert.equal(t.javoblar.length, 3, t.kod);
      assert.deepEqual(t.qatorlar, t.ifodalar);
      t.ifodalar.forEach((f, i) => {
        assert.ok(["True", "False"].includes(t.javoblar[i]), f + " → " + t.javoblar[i]);
        assert.equal(t.javoblar[i], L.qiymat(f, { a: t.a, b: t.b }).qiymat, f + " (a=" + t.a + ", b=" + t.b + ")");
      });
      assert.equal(t.javob, t.javoblar.join(" "));
      assert.deepEqual(K.expectedFor({ type: "natija", code: t.kod, solution: t.kod }), [t.javob], t.kod);
      assert.ok(t.kod.includes("print("), t.kod);
      // Ma'nosiz solishtirish chiqmasin: qoldiq faqat == yoki != bilan
      for (const f of t.ifodalar) if (f.includes("%")) assert.match(f, /% 2 (==|!=) [01]$/, f);
      // Birinchi zinada faqat sodda "a amal b"; manfiy sonlar faqat oxirgi zinada
      if (tier === 0) for (const f of t.ifodalar) assert.match(f, /^a (>|<|>=|<=|==|!=) b$/, f);
      if (tier < 2) assert.ok(t.a > 0 && t.b > 0, t.kod);
    }
  }
});

test("solishtirish: 8 xil javob kombinatsiyasining hammasi uchraydi (taxmin 1/8)", () => {
  const javoblar = new Set(each(L.solishtirTask, 300, 11).map((t) => t.javob));
  assert.equal(javoblar.size, 8, [...javoblar].join(" | "));
  // Teng sonlar ham uchraydi (== va >= farqi)
  assert.ok(each(L.solishtirTask, 100, 5).some((t) => t.a === t.b), "a == b holati chiqmadi");
});

// 2026-10-02: bitta holat o'rniga IKKI holat birga so'raladi (4 kombinatsiya)
test("ifoda savollari: ikki holat, javoblar o'zgaruvchilar bilan hisoblanadi", () => {
  for (const tier of [0, 1, 2]) {
    const r = rngFrom(7 + tier);
    let prev = null;
    for (let k = 0; k < 40; k++) {
      const t = L.ifodaTask(r, prev, tier);
      prev = t;
      assert.equal(t.holatlar.length, 2, t.ifoda);
      assert.notDeepEqual(t.holatlar[0].vars, t.holatlar[1].vars, t.ifoda + ": ikki holat bir xil");
      for (const x of t.holatlar) {
        assert.equal(x.javob, L.qiymat(t.ifoda, x.vars).qiymat, t.ifoda + " " + JSON.stringify(x.vars));
        assert.ok(["True", "False"].includes(x.javob));
        if (!/\bb\b/.test(t.ifoda)) assert.equal(x.vars.b, undefined, "kerak bo'lmagan o'zgaruvchi berilmasin");
        if (!/\bc\b/.test(t.ifoda)) assert.equal(x.vars.c, undefined, "kerak bo'lmagan o'zgaruvchi berilmasin");
      }
      assert.deepEqual(t.javoblar, t.holatlar.map((x) => x.javob));
      assert.equal(t.qatorlar.length, 2);
      if (tier < 2) assert.ok(L.IFODALAR.includes(t.ifoda), "murakkab ifoda faqat oxirgi zinada: " + t.ifoda);
    }
  }
  // Oxirgi zinada uch o'zgaruvchili ifoda albatta uchraydi
  const r = rngFrom(21);
  let prev = null;
  let uch = 0;
  for (let k = 0; k < 40; k++) { prev = L.ifodaTask(r, prev, 2); if (L.IFODALAR_UCH.includes(prev.ifoda)) uch++; }
  assert.ok(uch >= 10, "uch o'zgaruvchili ifodalar kam: " + uch);
});

test("uch o'zgaruvchili ifodalar: jadval 8 qator, qiymatlar Pythondan", () => {
  for (const ifoda of L.IFODALAR_UCH) {
    // De Morgan tengligi ikki o'zgaruvchili (4 qator), qolganlari — uch o'zgaruvchili (8 qator)
    const kutilganSoni = /\bc\b/.test(ifoda) ? 8 : 4;
    const hammasi = L.holatlarHammasi(ifoda);
    assert.equal(hammasi.length, kutilganSoni, ifoda);
    const j = L.jadval(ifoda);
    assert.equal(j.length, kutilganSoni, ifoda);
    for (const q of j) {
      const kutilgan = L.qiymat(ifoda, { a: q.a ? "True" : "False", b: q.b ? "True" : "False", c: q.c ? "True" : "False" }).qiymat;
      assert.equal(q.natija, kutilgan === "True", ifoda);
    }
  }
  // and or dan oldin bajariladi: a or b and c = a or (b and c)
  assert.deepEqual(L.jadval("a or b and c").map((q) => q.natija), L.jadval("a or (b and c)").map((q) => q.natija));
  // De Morgan (ikkinchi qonun): not (a or b) = not a and not b — hamma holatda teng
  assert.ok(L.jadval("(not (a or b)) == (not a and not b)").every((q) => q.natija));
  // "and" so'zi ichidagi "a" o'zgaruvchi deb sanalmaydi
  assert.equal(L.holatlarHammasi("not b").length, 2);
});

test("hayotiy gaplar: to'rt variant, har biri uchun misol bor", () => {
  const turlar = new Set(L.GAPLAR.map((g) => g.javob));
  assert.deepEqual([...turlar].sort(), ["and", "and not", "not", "or"]);
  assert.deepEqual([...L.GAP_VARIANTLAR].sort(), [...turlar].sort());
  assert.ok(L.GAP_VARIANTLAR.length >= 4, "QOIDALAR 4.3: kamida 4 variant");
  for (const g of L.GAPLAR) assert.ok(g.matn.length > 20, g.matn);
  for (const t of each(L.gapTask, 20, 13)) {
    // id va matn bitta gapdan olinishi kerak
    assert.equal(t.id, "gap:" + t.matn, "id boshqa gapdan olingan");
    assert.ok(L.GAP_VARIANTLAR.includes(t.javob));
  }
});

test("kod masalalari xatosiz ishlaydi va True/False chiqaradi", () => {
  for (const k of L.KOD) {
    const kutilgan = K.expectedFor({ type: "natija", code: k.kod, solution: k.kod });
    assert.ok(kutilgan.length >= 1 && kutilgan.length <= 2, k.id);
    for (const satr of kutilgan) {
      for (const soz of satr.split(" ")) assert.ok(["True", "False"].includes(soz), k.id + " → " + satr);
    }
  }
  // Birinchi zinada faqat eski (bir satrli) kodlar, oxirgisida yangilari ham
  const idlar = (tier) => {
    const r = rngFrom(4);
    let prev = null;
    const out = new Set();
    for (let k = 0; k < 60; k++) { prev = L.kodTask(r, prev, tier); out.add(prev.id); }
    return out;
  };
  assert.ok(![...idlar(0)].some((id) => ["kod:kabisa", "kod:uch-shart", "kod:tartib"].includes(id)));
  assert.ok(idlar(2).has("kod:kabisa") && idlar(2).has("kod:uch-shart"));
});

test("namunali yechimlar hamma testdan o'tadi", () => {
  for (const w of L.WRITE) {
    const task = { type: "kod-yoz", what: w.what, solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
    assert.equal(K.check(task, w.solution).ok, true, w.id);
  }
});

test("chegara xatolari o'tmaydi (> va >= farqi)", () => {
  const w = L.WRITE[1]; // oraliqda: x > 10 and x < 20
  const task = { type: "kod-yoz", solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
  assert.equal(K.check(task, "def oraliqda(x):\n    return x >= 10 and x <= 20").ok, false, "chegara noto'g'ri");
  const m = L.WRITE[0]; // mumkin: yosh >= 12
  const t2 = { type: "kod-yoz", solution: m.solution, tail: m.tail, tests: m.tests.map((stdin) => ({ stdin })) };
  assert.equal(K.check(t2, "def mumkin(yosh, bilet):\n    return yosh > 12 and bilet").ok, false, "12 yosh ham kirishi kerak");
  // "or" o'rniga "and" yozish
  const d = L.WRITE[2];
  const t3 = { type: "kod-yoz", solution: d.solution, tail: d.tail, tests: d.tests.map((stdin) => ({ stdin })) };
  assert.equal(K.check(t3, 'def dam(kun):\n    return kun == "shanba" and kun == "yakshanba"').ok, false);
});

test("yangi masalalar: kabisa yili, uchburchak, faqat bittasi", () => {
  const vazifa = (id) => {
    const w = L.WRITE.find((x) => x.id === id);
    assert.ok(w.tests.length >= 5, id + ": kamida 5 ta test");
    return { type: "kod-yoz", solution: w.solution, tail: w.tail, tests: w.tests.map((stdin) => ({ stdin })) };
  };
  for (const id of ["kabisa", "uchburchak", "faqat-bittasi"]) assert.deepEqual(K.validate(vazifa(id)), [], id);
  // Faqat "4 ga bo'linadi" deb yozilgan yechim 1900 da yiqiladi
  assert.equal(K.check(vazifa("kabisa"), "def kabisa(yil):\n    return yil % 4 == 0").ok, false);
  // 100 ga bo'linadiganlarning hammasini rad etgan yechim 2000 da yiqiladi
  assert.equal(K.check(vazifa("kabisa"), "def kabisa(yil):\n    return yil % 4 == 0 and yil % 100 != 0").ok, false);
  // Faqat bitta tengsizlikni tekshirgan yechim o'tmaydi
  assert.equal(K.check(vazifa("uchburchak"), "def uchburchak(a, b, c):\n    return a + b > c").ok, false);
  // "or" bilan yozilgan (kamida bittasi) yechim ikkalasi juft holatda yiqiladi
  assert.equal(K.check(vazifa("faqat-bittasi"), "def faqat_bittasi(a, b):\n    return a % 2 == 0 or b % 2 == 0").ok, false);
});

test("ketma-ket savollar takrorlanmaydi", () => {
  for (const make of [L.solishtirTask, L.ifodaTask, L.gapTask, L.kodTask, L.writeTask]) {
    const list = each(make, 10, 29);
    for (let k = 1; k < list.length; k++) assert.notEqual(list[k].id, list[k - 1].id);
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  const matnlar = L.GAPLAR.map((g) => g.matn).concat(L.WRITE.map((w) => w.what));
  const r = rngFrom(5);
  for (let k = 0; k < 15; k++) matnlar.push(L.solishtirTask(r, null).nega, L.ifodaTask(r, null).nega);
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "notoʻgʻri belgi: " + m);
});

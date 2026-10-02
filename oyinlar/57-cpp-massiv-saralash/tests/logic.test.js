// 57-o'yin mantiqining testlari. Ishga tushirish (loyiha ildizida):
//   node --test oyinlar/57-cpp-massiv-saralash/tests/
// vector/sort misollari yadroda ishlamaydi — ular faqat g++ bilan tekshiriladi
// (oyinlar/umumiy/tests/cpp-parity.test.js).
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const C = require("../../umumiy/js/cpp.js");
const E = require("../../umumiy/js/cpp/cpp-run.js");

const r = () => Math.random();

test("massiv va satr misollari yadroda aynan shunday chiqadi", () => {
  let soni = 0;
  for (let k = 0; k < 120; k++) {
    for (const f of [L.massivTask, L.satrTask]) {
      const t = f(r, null);
      soni++;
      const natija = E.run(t.kod, { stdin: [] });
      assert.equal(natija.error, null, t.id + ": " + JSON.stringify(natija.error));
      assert.deepEqual(natija.output, t.chiqish, t.id);
    }
  }
  assert.ok(soni > 200, "misollar kam: " + soni);
});

test("massiv: indeks noldan boshlanadi va yetti xil misol bor", () => {
  const korilgan = new Set();
  for (let k = 0; k < 300; k++) korilgan.add(L.massivTask(r, null).id.split(":")[1]);
  assert.deepEqual([...korilgan].sort(), ["almashtir", "eng-katta", "indeks", "juftlar", "osgan", "teskari", "yigindi"]);
});

test("massiv: zina bilan uzayadi, manfiy sonlar faqat oxirgi zinada", () => {
  const eski = ["eng-katta", "indeks", "teskari", "yigindi"];
  for (let k = 0; k < 80; k++) {
    const t0 = L.massivTask(r, null, 0);
    const a0 = t0.id.split(":")[2];
    assert.ok(eski.includes(t0.id.split(":")[1]), t0.id);
    assert.ok(!a0.includes("--") && !a0.startsWith("-"), "birinchi zinada manfiy son: " + t0.id);
    const n0 = Number(/int a\[(\d+)\]/.exec(t0.kod)[1]);
    assert.ok(n0 >= 4 && n0 <= 5, t0.id);
    const n2 = Number(/int a\[(\d+)\]/.exec(L.massivTask(r, null, 2).kod)[1]);
    assert.ok(n2 >= 6 && n2 <= 8, "oxirgi zinada 6–8 ta katak: " + n2);
  }
});

// Chegaradan chiqish — aniqlanmagan xatti-harakat, shuning uchun savol tanlov ko'rinishida.
// 2026-10-02: javob endi DOIM bir xil emas — dastur ba'zan chegara ichida qoladi.
test("chegara savoli: javob dasturga bog'liq — yadro ham xuddi shuni aytadi", () => {
  const javoblar = new Set();
  const turlar = new Set();
  for (let k = 0; k < 200; k++) {
    const t = L.chegaraTask(r, null);
    javoblar.add(t.javob);
    turlar.add(t.kind);
    assert.equal(t.variantlar.length, 4, t.id);
    assert.equal(new Set(t.variantlar).size, 4, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    assert.ok(t.variantlar.includes("Dastur xato berib toʻxtaydi"), "eng keng tarqalgan yanglish tasavvur bo'lsin");
    assert.equal(t.javob, t.chiqadi ? L.CHEGARA_JAVOB : L.ICHIDA_JAVOB, t.id);
    assert.equal(t.chiqadi, t.oxirgi > t.n - 1, t.id + ": chiqadi belgisi indeksga mos emas");
    // Savol matni javobni aytib qo'ymaydi: unda indeks ham, "chiqadi" so'zi ham yo'q
    assert.ok(!/a\[\d+\]/.test(t.savol) && !/chegaradan/.test(t.savol), t.savol);
    // Yadro: chegaradan chiqsa — ataylab to'xtatadi va ochiq aytadi; chiqmasa — dastur to'liq ishlaydi
    const natija = E.run(t.kod, { stdin: [] });
    if (t.chiqadi) {
      assert.ok(natija.error && /out of bounds/.test(natija.error.cppMessage), t.id + ": " + JSON.stringify(natija.error));
      assert.match(natija.error.hint, /javob buzuq chiqadi/);
      assert.match(t.nega, /aniqlanmagan xatti-harakat/);
    } else {
      assert.equal(natija.error, null, t.id + ": " + JSON.stringify(natija.error));
      assert.deepEqual(natija.output, ["tayyor"], t.id);
    }
  }
  assert.deepEqual([...javoblar].sort(), [L.CHEGARA_JAVOB, L.ICHIDA_JAVOB].sort(), "ikkala javob ham uchrasin");
  assert.deepEqual([...turlar].sort(), ["sikl", "surish", "yozuv"]);
});

test("chegara savoli: ikkala javob taxminan teng uchraydi, birinchi zinada faqat sodda tur", () => {
  let chiqdi = 0;
  for (let k = 0; k < 400; k++) if (L.chegaraTask(r, null).chiqadi) chiqdi++;
  assert.ok(chiqdi > 140 && chiqdi < 260, "400 tadan " + chiqdi + " tasi chegaradan chiqdi");
  for (let k = 0; k < 40; k++) assert.equal(L.chegaraTask(r, null, 0).kind, "yozuv");
});

test("satr: uzunlik, belgi, unli, teskari va uch yangi tur", () => {
  const korilgan = new Set();
  for (let k = 0; k < 300; k++) korilgan.add(L.satrTask(r, null).id.split(":")[1]);
  assert.deepEqual([...korilgan].sort(), ["belgi", "oxirgi", "qoshish", "sanash", "teskari", "unli", "uzunlik"]);
  for (let k = 0; k < 60; k++) {
    assert.ok(["belgi", "teskari", "unli", "uzunlik"].includes(L.satrTask(r, null, 0).id.split(":")[1]), "birinchi zinada faqat sodda turlar");
  }
  // string ishlatilgan dasturda kutubxona ham ulanadi
  for (let k = 0; k < 20; k++) assert.ok(L.satrTask(r, null).kod.includes("#include <string>"));
});

test("yozish mashqlari: yechim ishlaydi, bo'sh qolip o'tmaydi", () => {
  for (const y of L.MASSIV_YOZISH.concat(L.SATR_YOZISH)) {
    assert.ok(y.sinovlar.length >= 2, y.id + ": kamida ikki sinov bo'lsin");
    assert.equal(C.tekshir(y, y.yechim).ok, true, y.id + ": " + JSON.stringify(C.tekshir(y, y.yechim)));
    assert.equal(C.tekshir(y, L.QOLIP).ok, false, y.id);
  }
  // "o'rtachadan katta" mashqi: hamma son teng bo'lsa javob 0 — bu sinov qo'shilgan
  const ort = L.MASSIV_YOZISH.find((y) => y.id === "ortachadan-katta");
  assert.ok(ort.sinovlar.some((s) => s.chiqish[0] === "0"), "teng sonlar sinovi bo'lsin");
});

// 2026-10-02: yangi masalalar — tipik xato yechimlar sinovdan o'tmasligi kerak
test("yangi yozish mashqlari: chekka holatlar sinovda bor, xato yechim yiqiladi", () => {
  const top = (id) => L.MASSIV_YOZISH.concat(L.SATR_YOZISH).find((y) => y.id === id);
  for (const id of ["eng-katta-indeks", "ikkinchi-katta", "pufakcha", "harf-sanash", "palindrom"]) {
    assert.ok(top(id).sinovlar.length >= 4, id + ": kamida 4 sinov");
  }
  // Indeks o'rniga qiymatni chiqargan yechim
  const indeks = top("eng-katta-indeks");
  assert.equal(C.tekshir(indeks, indeks.yechim.replace("eng = i;", "eng = a[i];").replace("a[eng]", "eng")).ok, false);
  // "Oxirgi teng element" ni qaytaradigan yechim (>=) — "birinchisi" sharti buziladi
  assert.equal(C.tekshir(indeks, indeks.yechim.replace("a[i] > a[eng]", "a[i] >= a[eng]")).ok, false);
  // Ikkinchi eng katta: 0 dan boshlagan yechim manfiy sonlarda yiqiladi
  const ikkinchi = top("ikkinchi-katta");
  const nolBilan = C.dastur(["int n;", "cin >> n;", "int bir = 0;", "int ikki = 0;", "for (int i = 0; i < n; i++) {",
    "    int x;", "    cin >> x;", "    if (x > bir) {", "        ikki = bir;", "        bir = x;",
    "    } else if (x > ikki) {", "        ikki = x;", "    }", "}", C.chiqar("ikki")]);
  assert.equal(C.tekshir(ikkinchi, nolBilan).ok, false, "manfiy sonlar sinovi yo'q");
  // Pufakcha: bitta o'tish yetarli emas
  const pufak = top("pufakcha");
  assert.equal(C.tekshir(pufak, pufak.yechim.replace("for (int oxir = n - 1; oxir > 0; oxir--) {", "for (int oxir = n - 1; oxir > n - 2; oxir--) {")).ok, false);
  // Palindrom: faqat birinchi va oxirgi harfni solishtirgan yechim "abca" da yiqiladi
  const pal = top("palindrom");
  const faqatChet = C.dastur(["string s;", "cin >> s;", "int n = s.size();",
    "if (s[0] == s[n - 1]) {", '    cout << "palindrom\\n";', "} else {", '    cout << "palindrom emas\\n";', "}"], { string: true });
  assert.equal(C.tekshir(pal, faqatChet).ok, false);
  // Yozish mashqlari ham zina bilan ochiladi
  for (let k = 0; k < 40; k++) {
    assert.ok(["yoz:teskari", "yoz:ortachadan-katta"].includes(L.massivYozTask(r, null, 0).id));
    assert.ok(["yoz:unlilar", "yoz:teskari-soz"].includes(L.satrYozTask(r, null, 0).id));
  }
  const idlar = new Set();
  for (let k = 0; k < 80; k++) { idlar.add(L.massivYozTask(r, null, 2).id); idlar.add(L.satrYozTask(r, null, 2).id); }
  for (const id of ["yoz:pufakcha", "yoz:ikkinchi-katta", "yoz:palindrom"]) assert.ok(idlar.has(id), id + " oxirgi zinada chiqmadi");
});

// vector va sort yadroda yo'q: bola yozsa, ochiq xabar chiqadi
test("vector misollari yadroda ishlamaydi va buni ochiq aytadi", () => {
  const t = L.vectorTask(r, null);
  assert.equal(t.yadroda, false, "o'qish uchun ekani belgilansin");
  assert.ok(t.kod.includes("#include <vector>"), t.id);
  const natija = E.run(t.kod, { stdin: [] });
  assert.ok(natija.error && natija.error.kind === "yoq", JSON.stringify(natija.error));
  assert.match(natija.error.hint, /hali ishlamaydi/);
});

test("vector misollarining javobi JSda ham to'g'ri hisoblangan", () => {
  for (let k = 0; k < 120; k++) {
    const t = L.vectorTask(r, null);
    const sonlar = /\{([0-9, ]+)\}/.exec(t.kod);
    if (!sonlar) continue;
    const a = sonlar[1].split(",").map((x) => Number(x.trim()));
    if (t.id.startsWith("vector:sort:")) {
      assert.equal(t.chiqish[0], a.slice().sort((x, y) => x - y).join(" ") + " ", t.id);
    } else if (t.id.startsWith("vector:sort-teskari:")) {
      assert.equal(t.chiqish[0], a.slice().sort((x, y) => y - x).join(" ") + " ", t.id);
    } else if (t.id.startsWith("vector:eng:")) {
      assert.equal(t.chiqish[0], Math.min(...a) + " " + Math.max(...a), t.id);
    }
  }
});

test("farq savollari: to'rt variant, bitta to'g'ri", () => {
  const korilgan = new Set();
  for (let k = 0; k < 200; k++) {
    const t = L.farqTask(r, null);
    korilgan.add(t.id);
    assert.equal(t.variantlar.length, 4, t.id);
    assert.equal(new Set(t.variantlar).size, 4, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
  }
  assert.equal(korilgan.size, L.FARQLAR.length);
});

test("bosqichlar: turlar navbat bilan keladi", () => {
  assert.deepEqual([0, 1, 2].map((n) => L.bosqich1Task(null, n).tur), ["natija", "chegara", "yoz"]);
  assert.deepEqual([0, 1].map((n) => L.bosqich2Task(null, n).tur), ["natija", "yoz"]);
  assert.deepEqual([0, 1].map((n) => L.bosqich3Task(null, n).tur), ["natija", "farq"]);
});

test("bitta savol ketma-ket ikki marta chiqmaydi", () => {
  for (const next of [L.bosqich1Task, L.bosqich2Task, L.bosqich3Task]) {
    let prev = null;
    for (let k = 0; k < 40; k++) {
      const t = next(prev, k);
      if (prev && prev.tur === t.tur) assert.notEqual(t.id, prev.id);
      prev = t;
    }
  }
});

test("ko'rinadigan matnlarda to'g'ri tutuq belgisi", () => {
  const matnlar = [];
  for (let k = 0; k < 60; k++) {
    for (const next of [L.bosqich1Task, L.bosqich2Task, L.bosqich3Task]) {
      const t = next(null, k);
      for (const kalit of ["savol", "nega", "yolYoriq"]) if (t[kalit]) matnlar.push(t[kalit]);
    }
  }
  // C++ belgi literali ('a') — kod, tutuq belgisi emas; tekshiruvdan oldin olib tashlanadi
  for (const m of matnlar) {
    const proza = m.replace(/'.'/g, "");
    assert.ok(!/['’`´]/.test(proza), "notoʻgʻri tutuq belgisi: " + m);
  }
});

test("namunalar: massiv, satr va vector misollari ham tekshiruvga tushadi", () => {
  const ns = L.namunalar(24);
  assert.ok(ns.length >= 24, ns.length);
  // Yechimlar ko'paydi — yasalgan misollar ular bilan birga emas, ULARDAN TASHQARI sanaladi
  assert.ok(ns.filter((n) => !n.id.startsWith("yechim:")).length >= 24, "yasalgan misollar kam");
  assert.ok(ns.some((n) => n.id.startsWith("massiv:")) && ns.some((n) => n.id.startsWith("satr:")));
  assert.ok(ns.some((n) => n.id.startsWith("yechim:")));
  assert.ok(ns.some((n) => n.kod.includes("vector")), "vector misoli g++ ga yuborilsin");
  assert.equal(new Set(ns.map((n) => n.id)).size, ns.length);
});

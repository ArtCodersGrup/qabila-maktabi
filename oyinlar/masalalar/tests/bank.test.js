// Masalalar banki. Har masalaning namunali yechimi barcha testlardan o'tishi shart
// (QOIDALAR §4.3 dagi masala banki istisnosi shuni talab qiladi).
const test = require("node:test");
const assert = require("node:assert/strict");
const B = require("../js/bank.js");
const R = require("../js/royxat.js");
const K = require("../../umumiy/js/kod.js");
const py = require("../../umumiy/js/python/python.js");

const allProblems = B.LEVELS.flatMap((level) => level.problems.map((p) => [level, p]));

test("to'rtta daraja bor va har birida kamida 6 ta masala", () => {
  assert.equal(B.LEVELS.length, 4);
  assert.deepEqual(B.LEVELS.map((l) => l.id), ["oson", "orta", "qiyin", "cf"]);
  for (const level of B.LEVELS) {
    assert.ok(level.problems.length >= 6, level.id + ": " + level.problems.length + " ta masala");
  }
});

test("har masalada qiyinlik (rating) va teglar bor, teglar lug'atdan", () => {
  for (const [level, p] of allProblems) {
    const where = level.id + "/" + p.id;
    assert.ok(Number.isInteger(p.rating) && p.rating > 0, where + ": rating");
    assert.ok(Array.isArray(p.tags) && p.tags.length >= 1, where + ": teg yo'q");
    for (const tag of p.tags) assert.ok(B.TAGS.includes(tag), where + ": notanish teg «" + tag + "»");
  }
});


test("Codeforces masalalari: manba havolasi va haqiqiy reyting", () => {
  assert.ok(B.CF.length >= 10);
  for (const p of B.CF) {
    assert.ok(p.rating >= 800 && p.rating <= 1200, p.id + ": Codeforces reytingi " + p.rating);
    assert.ok(p.manba && p.manba.kod && p.manba.nom, p.id + ": manba");
    assert.match(p.manba.url, /^https:\/\/codeforces\.com\/problemset\/problem\/\d+\/[A-Z]\d*$/, p.id + ": havola");
    assert.ok(Array.isArray(p.manba.cfTags) && p.manba.cfTags.length, p.id + ": cfTags");
    assert.ok(Number.isInteger(p.tartib), p.id + ": tartib");
    // Animatsiya uchun joy ajratilgan (keyin to'ldiriladi)
    assert.ok("animatsiya" in p, p.id + ": animatsiya maydoni yo'q");
  }
  const tartiblar = B.CF.map((p) => p.tartib).sort((a, b) => a - b);
  assert.deepEqual(tartiblar, B.CF.map((_, k) => k + 1), "tartib raqamlari 1 dan ketma-ket");
  // Narvon: tartib bo'yicha reyting kamaymasligi kerak (muallif talabi — qiyinlik bo'yicha tartib)
  const narvon = [...B.CF].sort((a, b) => a.tartib - b.tartib).map((p) => p.rating);
  for (let k = 1; k < narvon.length; k++) {
    assert.ok(narvon[k] >= narvon[k - 1], "reyting kamaydi: " + narvon.join(" → "));
  }
});

test("Codeforces shartlari o'zimizniki: matn o'zbekcha va uzun", () => {
  for (const p of B.CF) {
    assert.ok(p.what.length > 60, p.id + ": shart juda qisqa");
    assert.ok(/[a-z]/.test(p.what), p.id);
    // Asl inglizcha nom shart matnida takrorlanmaydi
    assert.ok(!p.what.includes(p.manba.nom), p.id + ": asl nom shartda");
  }
});

test("har masalada shart, format, namuna, testlar, yechim va maslahat bor", () => {
  for (const [level, p] of allProblems) {
    const where = level.id + "/" + p.id;
    for (const field of ["title", "what", "kirish", "chiqish", "solution", "hint"]) {
      assert.ok(p[field] && String(p[field]).length > 5, where + ": " + field);
    }
    assert.ok(p.namuna && p.namuna.stdin && p.namuna.out, where + ": namuna");
    assert.ok(p.tests.length >= 4, where + ": kamida 4 ta yashirin test");
  }
});

test("shart matnida markdown belgilari yo'q (ekranda xom ko'rinadi)", () => {
  for (const [level, p] of allProblems) {
    for (const field of ["what", "kirish", "chiqish", "hint"]) {
      // ** dan keyin darrov harf kelsa — bu markdown (Pythonning darajasi doim bo'shliq bilan yoziladi)
      assert.ok(!/\*\*\S/.test(p[field]), level.id + "/" + p.id + ": " + field + " da markdown qalin matn bor");
      assert.ok(!/\[[^\]]*\]\(/.test(p[field]), level.id + "/" + p.id + ": " + field + " da havola bor");
    }
  }
});

test("masala nomlari takrorlanmaydi", () => {
  const ids = allProblems.map(([, p]) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("namunali yechim namunadagi javobni aynan beradi", () => {
  for (const [level, p] of allProblems) {
    const r = py.run(p.solution, { stdin: p.namuna.stdin, maxSteps: 200000 });
    assert.equal(r.error, null, level.id + "/" + p.id + ": " + (r.error && r.error.text));
    assert.deepEqual(r.output, p.namuna.out, level.id + "/" + p.id);
  }
});

test("namunali yechim barcha yashirin testlarda ham xatosiz ishlaydi", () => {
  for (const [level, p] of allProblems) {
    const task = R.vazifa(p);
    assert.deepEqual(K.validate(task), [], level.id + "/" + p.id);
    assert.equal(K.check(task, p.solution).ok, true, level.id + "/" + p.id);
  }
});

test("bo'sh yoki soxta yechim o'tmaydi", () => {
  for (const [level, p] of allProblems) {
    const task = R.vazifa(p);
    assert.equal(K.check(task, "   ").ok, false, level.id + "/" + p.id);
    // Faqat namunadagi javobni yozib qo'ygan yechim yashirin testda yiqiladi
    const cheat = p.namuna.out.map((line) => "print(" + JSON.stringify(line) + ")").join("\n");
    assert.equal(K.check(task, cheat).ok, false, level.id + "/" + p.id + ": namunani ko'chirgan yechim o'tdi");
  }
});

test("yechimlar faqat o'rgatilgan qismdan foydalanadi", () => {
  const taqiq = [/\bimport\b/, /\bclass\b/, /\blambda\b/, /f"/, /\.format\(/, /\bdict\b/, /\bset\(/, /\bmap\(/, /\bzip\(/, /\benumerate\(/];
  for (const [level, p] of allProblems) {
    for (const re of taqiq) {
      assert.ok(!re.test(p.solution), level.id + "/" + p.id + ": " + re);
    }
  }
});





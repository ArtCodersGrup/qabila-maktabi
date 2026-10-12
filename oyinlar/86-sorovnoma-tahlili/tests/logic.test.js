// «Amaliy: soʻrovnoma tahlili» mantiqi: har namuna, har masala va har namunali yechim o'z talqinchimizda BAJARILADI;
// tekshiruv yashirin ma'lumot to'plamlari bilan ishlashi (matn solishtirish emas) sinaladi.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const L = require("../js/logic.js");
const K = require("../../umumiy/js/kod.js");
const py = require("../../umumiy/js/python/python.js");

function rngFrom(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}
const each = (make, n, seed, tier) => {
  const r = rngFrom(seed || 23);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(prev, r, tier);
    out.push(prev);
  }
  return out;
};
const run = (code) => py.run(code, { maxSteps: 300000 });
const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8];
// Bankdagi har tur — bir necha urug' bilan (tasodifiy to'plamlar ham qamralsin)
const variants = (bank, type) => {
  const out = [];
  for (const kind of bank) {
    for (const seed of SEEDS) {
      const r = rngFrom(seed * 131 + 7);
      let task = null;
      for (let k = 0; k < 400 && !(task && task.kind === kind.id); k++) task = (type === "tozala" ? L.cleanTask : L.reportTask)(null, r);
      assert.equal(task.kind, kind.id, kind.id + " generatordan chiqmadi");
      out.push(task);
    }
  }
  return out;
};
const body = (task) => task.solution.slice(task.starter.length);

test("sahnalardagi namunalar: har biri bajariladi va yozilgan chiqishni beradi", () => {
  assert.ok(Object.keys(L.SAMPLES).length >= 6);
  for (const [nom, s] of Object.entries(L.SAMPLES)) {
    const r = run(s.code);
    assert.equal(r.error, null, nom + ": " + (r.error && r.error.text));
    assert.deepEqual(r.output, s.out, nom);
  }
  // Tozalanmagan o'rtacha haqiqatan buziladi, tozalangani — yo'q
  assert.equal(L.SAMPLES.iflos.out[0], "34.5");
  assert.equal(L.SAMPLES.toza_ortacha.out[1], "15.0");
});

test("swapData: ma'lumot satri almashtiriladi, qolgan kod va satr raqamlari o'zgarmaydi", () => {
  const src = "yoshlar = [1, 2]\nprint(len(yoshlar))\nprint(yoshlar)";
  const yangi = L.swapData(src, { yoshlar: [15, 14, 16] });
  assert.equal(yangi, "yoshlar = [15, 14, 16]\nprint(len(yoshlar))\nprint(yoshlar)");
  assert.deepEqual(run(yangi).output, ["3", "[15, 14, 16]"]);
  assert.equal(L.swapData("yoshlar=[1,2]\nprint(1)", { yoshlar: [3] }), "yoshlar = [3]\nprint(1)");
  assert.equal(L.swapData("a = [1]\nfanlar  =  [\"x\"]", { fanlar: ["tarix", ""] }), 'a = [1]\nfanlar = ["tarix", ""]');
  // Ikki ro'yxat; o'xshash nom chalkashmaydi
  assert.equal(L.swapData("uyqu_a = [1]\nuyqu_b = [2]", { uyqu_a: [7], uyqu_b: [8] }), "uyqu_a = [7]\nuyqu_b = [8]");
  assert.equal(L.swapData("uyqu_a2 = [1]", { uyqu_a: [7] }), null);
  // Satr o'chirilgan yoki ichkariga surilgan — null
  assert.equal(L.swapData("print(1)", { yoshlar: [3] }), null);
  assert.equal(L.swapData("if True:\n    yoshlar = [1]", { yoshlar: [3] }), null);
  // Faqat birinchi uchragan satr almashadi; funksiya ichidagi ro'yxatlarga tegilmaydi
  assert.equal(L.swapData("toza = []\nyoshlar = [1]\ntoza = []", { yoshlar: [3] }), "toza = []\nyoshlar = [3]\ntoza = []");
  assert.equal(L.lit(["a", "", 3, -2, 7.5]), '["a", "", 3, -2, 7.5]');
});

test("1-bosqich: har namunali yechim har to'plamda bajariladi; boshlang'ich kod o'tmaydi", () => {
  assert.ok(L.CLEAN.length >= 8);
  for (const task of variants(L.CLEAN, "tozala")) {
    assert.ok(task.tests.length >= 5, task.kind + ": kamida 5 to'plam (1 ko'rinadigan + yashirinlar)");
    assert.ok(task.what && task.tip, task.kind);
    assert.ok(task.solution.startsWith(task.starter), task.kind);
    for (const data of task.tests) {
      const r = run(L.swapData(task.solution, data));
      assert.equal(r.error, null, task.kind + ": " + (r.error && r.error.text) + " — " + L.dataLines(data));
      assert.ok(r.output.length >= 1 && r.output.length <= 2, task.kind);
    }
    assert.deepEqual(run(task.solution).output, task.lines, task.kind + ": «shunday chiqishi kerak» — haqiqiy chiqish");
    assert.deepEqual(L.check(task, task.solution), { ok: true }, task.kind);
    assert.equal(L.check(task, task.starter).ok, false, task.kind + ": bo'sh kod o'tib ketdi");
    // Javobni qo'lda yozish (ko'rinadigan chiqishni print qilish) yashirin to'plamda yiqiladi
    const qolda = task.starter + task.lines.map((line) => "print(" + JSON.stringify(line) + ")").join("\n");
    assert.deepEqual(run(qolda).output, task.lines);
    const bad = L.check(task, qolda);
    assert.equal(bad.ok, false, task.kind + ": qo'lda yozilgan javob o'tib ketdi");
    assert.equal(bad.hidden, true, task.kind);
    assert.ok(bad.hint.startsWith("Yashirin sinovda"), bad.hint);
    // Tozalamasdan chiqarish — o'tmaydi
    const tozasiz = body(task).replace(/^(\s*)if .*:$/m, "$1if True:");
    assert.notEqual(tozasiz, body(task));
    assert.equal(L.check(task, task.starter + tozasiz).ok, false, task.kind + ": tozalamagan kod o'tib ketdi");
  }
});

test("1-bosqich: chegaradagi qiymatlar sinaladi, boshqacha yozilgan to'g'ri yechim o'tadi", () => {
  const topilgan = new Set();
  for (const task of variants(L.CLEAN, "tozala")) {
    topilgan.add(task.kind);
    const nom = Object.keys(task.tests[0])[0];
    if (task.kind === "oraliq" || task.kind === "sanab") {
      const f = L.FIELDS[nom];
      // «>=» o'rniga «>» — chegaradagi to'plamda yiqiladi
      const qatiy = body(task).replace("x >= " + f.lo, "x > " + f.lo);
      assert.equal(L.check(task, task.starter + qatiy).ok, false, task.kind + " " + nom + ": qat'iy tengsizlik o'tib ketdi");
      const yuqori = body(task).replace("x <= " + f.hi, "x < " + f.hi);
      assert.equal(L.check(task, task.starter + yuqori).ok, false, task.kind + " " + nom);
      // Zanjirli solishtirish va boshqa o'zgaruvchi nomi — to'g'ri
      const boshqa = body(task).replace("x >= " + f.lo + " and x <= " + f.hi, f.lo + " <= x <= " + f.hi);
      assert.equal(L.check(task, task.starter + boshqa).ok, true, task.kind + " " + nom);
      assert.ok(task.tests.some((d) => d[nom].includes(f.lo) && d[nom].includes(f.hi) && d[nom].includes(f.lo - 1) && d[nom].includes(f.hi + 1)));
      assert.ok(task.tests.some((d) => run(L.swapData(task.solution, d)).output[0] === "[]"), task.kind + ": hammasi xato bo'lgan to'plam");
    }
    if (task.kind === "xatolar") {
      const f = L.FIELDS[nom];
      // continue bilan yozilgan yechim ham to'g'ri
      const alt = "xato = []\nfor q in " + nom + ":\n    if q >= " + f.lo + " and q <= " + f.hi + ":\n        continue\n    xato.append(q)\nprint(xato)";
      assert.equal(L.check(task, task.starter + alt).ok, true, nom);
      // «and» bilan yozilgan shart hech narsa topmaydi
      assert.equal(L.check(task, task.starter + body(task).replace(" or ", " and ")).ok, false, nom);
    }
    if (task.kind === "belgi") {
      assert.equal(L.check(task, task.starter + body(task).replace(' and x != "?"', "")).ok, false, "faqat bo'sh satrni olib tashlagan kod");
      assert.equal(L.check(task, task.starter + body(task).replace(" and ", " or ")).ok, false, "or bilan yozilgan shart");
    }
    if (task.kind === "registr") {
      assert.equal(L.check(task, task.starter + body(task).replace("x.lower()", "x")).ok, false, "lower() siz");
    }
    if (task.kind === "juft") {
      // Har ro'yxatni alohida tozalash qatorlarni siljitadi — o'tmaydi
      const alohida = "toza_yosh = []\nfor x in yoshlar:\n    if 10 <= x <= 18:\n        toza_yosh.append(x)\ntoza_uyqu = []\nfor x in uyqu_soatlari:\n    if 1 <= x <= 24:\n        toza_uyqu.append(x)\nprint(toza_yosh)\nprint(toza_uyqu)";
      assert.equal(L.check(task, task.starter + alohida).ok, false, "alohida tozalash o'tib ketdi");
      for (const d of task.tests) assert.equal(d.yoshlar.length, d.uyqu_soatlari.length);
    }
    if (task.kind === "takror") {
      assert.equal(L.check(task, task.starter + "toza = []\nfor x in javob_id:\n    bor = False\n    for y in toza:\n        if y == x:\n            bor = True\n    if not bor:\n        toza.append(x)\nprint(toza)").ok, true);
    }
  }
  assert.equal(topilgan.size, L.CLEAN.length);
});

test("2-bosqich: har funksiya har chaqiruvda bajariladi; bo'sh sarlavha va print li yechim o'tmaydi", () => {
  assert.ok(L.FUNCS.length >= 9);
  for (const id of ["ortacha", "sanash", "eng-kop"]) assert.ok(L.FUNCS.some((k) => k.id === id), id + " bankda bo'lishi shart");
  for (const kind of L.FUNCS) {
    for (const seed of SEEDS) {
      const tests = kind.calls(rngFrom(seed * 53));
      const task = { type: "funksiya", solution: kind.solution, tests };
      assert.ok(tests.length >= 6, kind.id + ": kamida 6 chaqiruv");
      for (const call of tests) {
        const r = run(L.withCalls(kind.solution, [call]));
        assert.equal(r.error, null, kind.id + " " + call + ": " + (r.error && r.error.text));
        assert.equal(r.output.length, 1);
        assert.ok(!/\.\d{5,}/.test(r.output[0]), kind.id + " " + call + " → " + r.output[0]);
      }
      assert.deepEqual(L.check(task, kind.solution), { ok: true }, kind.id);
      assert.equal(L.check(task, kind.starter).ok, false, kind.id);
      assert.equal(L.check(task, "  ").kind, "bosh");
      const printli = kind.solution.replace(/return ([^\n]*)$/, "print($1)");
      assert.notEqual(printli, kind.solution);
      assert.equal(L.check(task, printli).ok, false, kind.id + ": print li yechim o'tib ketdi");
    }
  }
});

test("2-bosqich: tipik xato yechimlar o'tmaydi, boshqacha to'g'ri yechimlar o'tadi", () => {
  const F = (id) => {
    const kind = L.FUNCS.find((k) => k.id === id);
    return { type: "funksiya", solution: kind.solution, tests: kind.calls(rngFrom(77)) };
  };
  const SANASH = "def sanash(royxat, qiymat):\n    n = 0\n    for x in royxat:\n        if x == qiymat:\n            n += 1\n    return n\n\n";
  assert.equal(L.check(F("ortacha"), "def ortacha(royxat):\n    s = 0\n    for x in royxat:\n        s += x\n    return s / len(royxat)").ok, true);
  assert.equal(L.check(F("ortacha"), "def ortacha(royxat):\n    return sum(royxat) / 4").ok, false);
  assert.equal(L.check(F("sanash"), "def sanash(royxat, qiymat):\n    return len(royxat)").ok, false);
  assert.equal(L.check(F("oraliq"), "def oraliq(royxat):\n    a = sorted(royxat)\n    return a[-1] - a[0]").ok, true);
  // tozala: qat'iy tengsizlik chegarada yiqiladi; asl ro'yxatni qaytargan kod ham
  assert.equal(L.check(F("tozala"), "def tozala(royxat, past, yuqori):\n    t = []\n    for x in royxat:\n        if x > past and x < yuqori:\n            t.append(x)\n    return t").ok, false);
  assert.equal(L.check(F("tozala"), "def tozala(royxat, past, yuqori):\n    return royxat").ok, false);
  assert.equal(L.check(F("tozala"), "def tozala(royxat, past, yuqori):\n    t = []\n    for x in royxat:\n        if past <= x <= yuqori:\n            t.append(x)\n    return t").ok, true);
  // ulush: son qaytargan kod; ikki funksiya boshqacha yozilgan — to'g'ri
  assert.equal(L.check(F("ulush"), SANASH + "def ulush(royxat, qiymat):\n    return sanash(royxat, qiymat)").ok, false);
  assert.equal(L.check(F("ulush"), SANASH + "def ulush(royxat, qiymat):\n    k = sanash(royxat, qiymat)\n    return k / len(royxat)").ok, true);
  // nechta_kam: <= — chegaraning o'zi sanalmasligi kerak
  assert.equal(L.check(F("nechta-kam"), "def nechta_kam(royxat, chegara):\n    n = 0\n    for x in royxat:\n        if x <= chegara:\n            n += 1\n    return n").ok, false);
  // eng_kop: sonini qaytargan, birinchi/oxirgi elementni qaytargan, eng kattasini qaytargan — xato
  assert.equal(L.check(F("eng-kop"), SANASH + "def eng_kop(royxat):\n    eng = 0\n    for x in royxat:\n        if sanash(royxat, x) > eng:\n            eng = sanash(royxat, x)\n    return eng").ok, false);
  assert.equal(L.check(F("eng-kop"), SANASH + "def eng_kop(royxat):\n    return royxat[0]").ok, false);
  assert.equal(L.check(F("eng-kop"), SANASH + "def eng_kop(royxat):\n    return royxat[-1]").ok, false);
  assert.equal(L.check(F("eng-kop"), SANASH + "def eng_kop(royxat):\n    return max(royxat)").ok, false);
  // eng_kop: hisoblagichni saqlab yozilgan boshqa yechim — to'g'ri
  assert.equal(L.check(F("eng-kop"), SANASH + "def eng_kop(royxat):\n    eng = royxat[0]\n    soni = 0\n    for x in royxat:\n        k = sanash(royxat, x)\n        if k > soni:\n            soni = k\n            eng = x\n    return eng").ok, true);
  // Bo'sh ro'yxat: himoyasiz ortacha ZeroDivisionError beradi
  const bosh = L.check(F("ortacha-bosh"), "def ortacha(royxat):\n    return sum(royxat) / len(royxat)");
  assert.equal(bosh.kind, "xato");
  assert.equal(bosh.error.type, "ZeroDivisionError");
  assert.equal(bosh.call, "ortacha([])");
  // mediana: saralamasdan o'rtadagini olish; juft uzunlikni unutish
  assert.equal(L.check(F("mediana"), "def mediana(royxat):\n    return royxat[len(royxat) // 2]").ok, false);
  assert.equal(L.check(F("mediana"), "def mediana(royxat):\n    a = sorted(royxat)\n    return a[len(a) // 2]").ok, false);
  assert.equal(L.check(F("ortachadan-past"), "def ortacha(r):\n    return sum(r) / len(r)\n\ndef ortachadan_past(royxat):\n    n = 0\n    for x in royxat:\n        if x <= ortacha(royxat):\n            n += 1\n    return n").ok, false);
  // Xabar: qaysi chaqiruv, nima kutilgan, nima chiqqan
  const bad = L.check(F("ortacha"), "def ortacha(royxat):\n    return sum(royxat)");
  assert.equal(bad.kind, "chiqish");
  assert.equal(bad.call, "ortacha([8, 7, 9, 6])");
  assert.ok(bad.hint.includes("7.5") && bad.hint.includes("30"), bad.hint);
});

test("3-bosqich: har namunali yechim har to'plamda bajariladi; qo'lda yozilgan va tozalanmagan javob o'tmaydi", () => {
  assert.ok(L.REPORT.length >= 9);
  for (const task of variants(L.REPORT, "xulosa")) {
    assert.ok(task.tests.length >= 4, task.kind + ": kamida 4 to'plam");
    assert.ok(task.question.startsWith("Savol:") && task.what && task.tip, task.kind);
    assert.ok(task.solution.startsWith(task.starter), task.kind);
    assert.equal(task.lines.length, 3, task.kind + ": uch satrli hisobot");
    for (const data of task.tests) {
      const r = run(L.swapData(task.solution, data));
      assert.equal(r.error, null, task.kind + ": " + (r.error && r.error.text) + " — " + L.dataLines(data));
      assert.equal(r.output.length, 3, task.kind);
      assert.ok(!r.output.some((line) => /\.\d{5,}/.test(line)), task.kind + " → " + r.output.join(" | ") + " — " + L.dataLines(data));
    }
    assert.deepEqual(run(task.solution).output, task.lines, task.kind);
    assert.deepEqual(L.check(task, task.solution), { ok: true }, task.kind);
    assert.equal(L.check(task, task.starter).ok, false, task.kind);
    // Boshlang'ich kod (ma'lumot + tayyor funksiyalar) o'zi xatosiz bajariladi
    assert.equal(run(task.starter).error, null, task.kind);
    const qolda = task.starter + task.lines.map((line) => "print(" + JSON.stringify(line) + ")").join("\n");
    assert.deepEqual(run(qolda).output, task.lines);
    assert.equal(L.check(task, qolda).ok, false, task.kind + ": qo'lda yozilgan javob o'tib ketdi");
    // Tozalash sharti olib tashlansa — o'tmaydi
    const b = body(task);
    const tozasiz = b.replace(/^(\s*)if [^\n]*(>= \d+ and|!= "")[^\n]*:$/m, "$1if True:");
    assert.notEqual(tozasiz, b, task.kind);
    assert.equal(L.check(task, task.starter + tozasiz).ok, false, task.kind + ": tozalanmagan tahlil o'tib ketdi");
  }
});

test("3-bosqich: xulosaning har ikki javobi sinovlarda uchraydi — doim bitta javob chiqaradigan kod o'tmaydi", () => {
  const ikkili = ["uyqu", "ekran", "kattalar", "boy", "fan-ulush", "ikki-sinf", "uyqu-baho"];
  for (const task of variants(L.REPORT, "xulosa")) {
    if (!ikkili.includes(task.kind)) continue;
    const xulosalar = new Set(task.tests.map((d) => run(L.swapData(task.solution, d)).output[2]));
    assert.ok(xulosalar.size >= 2, task.kind + ": faqat " + [...xulosalar].join(", "));
    const b = body(task);
    // Xulosa sharti (oxirgi ustun boshidagi if) doim rost / doim yolg'on
    const at = b.lastIndexOf("\nif ");
    assert.ok(at > 0, task.kind);
    const end = b.indexOf("\n", at + 1);
    for (const qotgan of ["if True:", "if False:"]) {
      const kod = b.slice(0, at + 1) + qotgan + b.slice(end);
      assert.equal(run(task.starter + kod).error, null, task.kind);
      assert.equal(L.check(task, task.starter + kod).ok, false, task.kind + ": «" + qotgan + "» o'tib ketdi");
    }
  }
  // «teng» holati ham bor
  const ikki = variants(L.REPORT, "xulosa").find((t) => t.kind === "ikki-sinf");
  assert.ok(ikki.tests.some((d) => run(L.swapData(ikki.solution, d)).output[2] === "Xulosa: teng"));
});

test("3-bosqich: boshqacha yozilgan to'g'ri yechimlar o'tadi; oʻ/ʼ va oddiy ' bir xil", () => {
  const all = variants(L.REPORT, "xulosa");
  for (const task of all.filter((t) => t.kind === "uyqu")) {
    const alt = "t = []\nfor soat in uyqu_soatlari:\n    if 1 <= soat <= 24:\n        t.append(soat)\nn = len(t)\ns = 0\nfor soat in t:\n    s += soat\nprint(\"Javoblar:\", n)\nprint(\"Oʻrtacha:\", s / n)\nif s / n < 8:\n    print(\"Xulosa: kam\")\nelse:\n    print(\"Xulosa: yetarli\")";
    assert.equal(L.check(task, task.starter + alt).ok, true, "funksiyasiz, oʻ bilan yozilgan yechim");
    // «>» — aynan 8.0 holatida yiqiladi
    assert.equal(L.check(task, task.starter + body(task).replace("m >= 8", "m > 8")).ok, false);
  }
  for (const task of all.filter((t) => t.kind === "ekran")) {
    assert.equal(L.check(task, task.starter + body(task).replace("m > 3", "m >= 3")).ok, false, "aynan 3.0 — «ko'p» emas");
    assert.equal(L.check(task, task.starter + body(task).replace("yo'q", "yoʻq")).ok, true);
    assert.equal(L.check(task, task.starter + body(task).replace("yo'q", "yoq")).ok, false);
  }
  for (const task of all.filter((t) => t.kind === "kattalar")) {
    assert.equal(L.check(task, task.starter + body(task).replace("katta * 2 > len(toza)", "katta > len(toza) / 2")).ok, true);
    assert.equal(L.check(task, task.starter + body(task).replace("katta * 2 > len(toza)", "katta * 2 >= len(toza)")).ok, false, "aynan yarmi");
    // Hisoblagich tozalanmagan ro'yxat bo'ylab yursa (150 ham «katta») — o'tmaydi
    assert.equal(L.check(task, task.starter + body(task).replace("for x in toza:", "for x in yoshlar:")).ok, false);
  }
  for (const task of all.filter((t) => t.kind === "boy")) {
    assert.equal(L.check(task, task.starter + body(task).replace("farq > 30", "farq >= 30")).ok, false);
  }
  for (const task of all.filter((t) => t.kind === "fan-ulush")) {
    assert.equal(L.check(task, task.starter + body(task).replace("soni * 3 >= len(toza)", "soni * 3 >= len(sevimli_fan)")).ok, false, "bo'sh javoblar jamiga kirib qolgan");
  }
  for (const task of all.filter((t) => t.kind === "ikki-sinf")) {
    const alt = "ta = []\nfor x in uyqu_a:\n    if x >= 1 and x <= 24:\n        ta.append(x)\ntb = []\nfor x in uyqu_b:\n    if x >= 1 and x <= 24:\n        tb.append(x)\na = ortacha(ta)\nb = ortacha(tb)\nprint(\"9-A:\", a)\nprint(\"9-B:\", b)\nif a == b:\n    print(\"Xulosa: teng\")\nelif a > b:\n    print(\"Xulosa: 9-A\")\nelse:\n    print(\"Xulosa: 9-B\")";
    assert.equal(L.check(task, task.starter + alt).ok, true, "funksiyasiz ikki sikl");
    assert.equal(L.check(task, task.starter + body(task).replace("elif b > a:", "elif b >= a:")).ok, false, "teng holati");
  }
  for (const task of all.filter((t) => t.kind === "uyqu-baho")) {
    assert.equal(L.check(task, task.starter + body(task).replace("if u >= 8:", "if u > 8:")).ok, false, "aynan 8 soat");
    for (const d of task.tests) assert.equal(d.uyqu_soatlari.length, d.baholar.length);
  }
  for (const task of all.filter((t) => t.kind === "fan-registr")) {
    assert.equal(L.check(task, task.starter + body(task).replace("x.lower()", "x")).ok, false, "lower() siz");
  }
});

test("tekshiruv xabarlari: ma'lumot satri o'chirilsa — tushunarli xabar; xato turi; terishdagi xato", () => {
  const task = each(L.cleanTask, 1, 9, 0)[0];
  const satrsiz = task.solution.split("\n").slice(1).join("\n");
  const bad = L.check(task, satrsiz);
  assert.equal(bad.kind, "malumot");
  assert.ok(bad.hint.includes("= [...]"));
  assert.equal(L.check(task, "").kind, "bosh");
  const nom = L.check(task, task.starter + "print(tozaa)");
  assert.equal(nom.kind, "xato");
  assert.equal(nom.error.type, "NameError");
  assert.equal(nom.hidden, false);
  // Xato satr raqami bolaning muharriridagi satrga mos (ma'lumot almashganda siljimaydi)
  assert.equal(nom.error.line, task.starter.split("\n").length);
  assert.equal(L.typing(run("for x in [1]\n    print(x)").error), true);
  assert.equal(L.typing(run("for x in [1]:\nprint(x)").error), true);
  assert.equal(L.typing(run("d = {1: 2}").error), true, "«bu saytda hali yo'q» — urinish emas");
  assert.equal(L.typing(run("print(y)").error), false);
  assert.equal(L.typing(null), false);
});

test("zina va takrorlanmaslik: ketma-ket ikki masala bir turda bo'lmaydi; har zinada yetarli tur", () => {
  for (const [bank, make] of [[L.CLEAN, L.cleanTask], [L.FUNCS, L.funcTask], [L.REPORT, L.reportTask]]) {
    for (const t of [0, 1, 2]) assert.ok(bank.filter((k) => k.tier === t).length >= 2, "har zinada kamida 2 tur");
    assert.ok(bank.filter((k) => k.tier === 2).length >= 3);
    for (const tier of [0, 1, 2, undefined]) {
      const tasks = each(make, 40, 20261012 + (tier || 0), tier);
      for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].kind, tasks[k - 1].kind);
      for (const task of tasks) {
        if (tier != null) assert.ok(task.tier <= tier, task.id + " zina " + tier);
        assert.deepEqual(L.check(task, task.solution), { ok: true }, task.id);
      }
    }
    assert.ok(each(make, 40, 5, 0).every((t) => t.tier === 0));
    const qiyin = each(make, 80, 6, 2);
    assert.ok(new Set(qiyin.map((t) => t.kind)).size >= 7, "qiyin rejim uchun xilma-xillik");
    assert.ok(qiyin.filter((t) => t.tier === 2).length > 30);
  }
  // Bir xil tur ham har safar boshqa ma'lumot bilan keladi
  const oraliq = each(L.cleanTask, 60, 3, 0).filter((t) => t.kind === "oraliq");
  assert.ok(new Set(oraliq.map((t) => t.starter)).size >= oraliq.length - 2);
});

test("ma'lumot: har maydonning «xato» qiymatlari haqiqatan oraliqdan tashqarida, odatdagilari — ichida", () => {
  for (const f of Object.values(L.FIELDS)) {
    assert.ok(f.bad.length >= 6, f.name);
    for (const v of f.bad) assert.ok(v < f.lo || v > f.hi, f.name + ": " + v);
    assert.ok(f.gen[0] >= f.lo && f.gen[1] <= f.hi, f.name);
    assert.match(f.name, /^[a-z_]+$/);
  }
  // Har ko'rinadigan to'plamda kamida bitta xato va kamida ikkita to'g'ri qiymat bor (sonli tozalash masalalari)
  for (const task of variants(L.CLEAN, "tozala").filter((t) => ["oraliq", "sanab", "xatolar"].includes(t.kind))) {
    const nom = Object.keys(task.tests[0])[0];
    const f = L.FIELDS[nom];
    const list = task.tests[0][nom];
    assert.ok(list.some((v) => v < f.lo || v > f.hi), task.id);
    assert.ok(list.filter((v) => v >= f.lo && v <= f.hi).length >= 2, task.id);
  }
});

test("matn: oddiy ' ekran matnida yo'q, faqat ui.say/bubble(\"elder\"), SVG ichida matn yo'q", () => {
  const dir = path.join(__dirname, "..", "js");
  const files = ["scenes/common.js", "scenes/stage1.js", "scenes/stage2.js", "scenes/stage3.js", "scenes/final.js", "main.js"];
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), "utf8").split("\n").filter((line) => !line.trim().startsWith("//")).join("\n");
    assert.ok(!/["`][^"`\n]*[A-Za-zʻ]'[a-z][^"`\n]*["`]/.test(src), f + ": matnda oddiy ' bor");
    assert.ok(!/apprentice|paper\(|drum/.test(src), f + ": shogird/qog'oz/baraban ishlatilmaydi");
    for (const m of src.matchAll(/ui\.(say|bubble)\("(\w+)"/g)) assert.equal(m[2], "elder", f);
  }
  const tasks = variants(L.CLEAN, "tozala").concat(variants(L.REPORT, "xulosa"));
  for (const task of tasks) assert.ok(!/[a-z]'[a-z]/i.test(task.what + task.tip + (task.question || "")), task.kind + ": vazifa matnida oddiy '");
  for (const kind of L.FUNCS) assert.ok(!/[a-z]'[a-z]/i.test(kind.what), kind.id);
  assert.ok(!/<text/.test(fs.readFileSync(path.join(dir, "game-art.js"), "utf8")));
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert.ok(html.includes('<html lang="uz" data-toifa="yuqori">'));
  assert.ok(!html.includes("data-maskot"));
  assert.ok(html.indexOf("umumiy/js/toifa.js") < html.indexOf("</head>"));
  assert.ok(fs.readFileSync(path.join(dir, "main.js"), "utf8").includes('storageKey: "sorovnoma-tahlili:v1"'));
});

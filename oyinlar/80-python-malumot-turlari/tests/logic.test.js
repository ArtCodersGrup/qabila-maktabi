// «Oʻzgaruvchi va maʼlumot turlari» mantiqi: har kod namunasi va har namunali yechim o'z talqinchimizda ishga tushiriladi.
const test = require("node:test");
const assert = require("node:assert/strict");
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
  const r = rngFrom(seed || 3);
  const out = [];
  let prev = null;
  for (let k = 0; k < n; k++) {
    prev = make(r, prev, tier);
    out.push(prev);
  }
  return out;
};
const chiqish = (code) => {
  const r = py.run(code);
  assert.equal(r.error, null, code + "\n→ " + (r.error && r.error.text));
  return r.output;
};

test("sahna namunalari: har biri kutilgan chiqishni (yoki kutilgan xatoni) beradi", () => {
  const N = L.NAMUNALAR;
  assert.deepEqual(chiqish(N.ozgaruvchilar), ["spam 0.87"]);
  assert.deepEqual(chiqish(N.turlar), ["<class 'float'>", "<class 'str'>", "<class 'int'> <class 'bool'> <class 'list'>"]);
  assert.deepEqual(chiqish(N.amallar), ["0.92", "5.0 <class 'float'>", "3 <class 'int'>", "<class 'bool'>", "46 <class 'str'>"]);
  assert.deepEqual(chiqish(N.ogirish), ["0.92", "46%", "1.5", "3 4"]);
  assert.deepEqual(chiqish(N.jimXato), ["1515"]);
  assert.deepEqual(chiqish(N.royxat), ["mushuk", "qush", "3", "['mushuk', 'mushuk', 'qush', 'it']"]);
  assert.equal(py.run(N.matnBolish).error.type, "TypeError");
  assert.equal(py.run(N.matnBolish).error.line, 3);
  assert.equal(py.run(N.intKasr).error.type, "ValueError");
  const ix = py.run(N.indeksXato);
  assert.deepEqual(ix.output, ["90.0"]);
  assert.equal(ix.error.type, "IndexError");
  // qadam-baqadam panel: besh o'zgaruvchi ham jadvalda ko'rinadi
  const tr = py.trace(N.ozgaruvchilar, {});
  assert.equal(tr.error, null);
  assert.deepEqual(Object.keys(tr.states[tr.states.length - 1].vars), ["yosh", "ehtimol", "yorliq", "spammi", "ballar"]);
});

test("type() va round(): o'yin tayanadigan xatti-harakat talqinchida bor", () => {
  assert.deepEqual(chiqish('print(type(5))\nprint(type(0.5))\nprint(type("a"))\nprint(type(True))\nprint(type([1]))'),
    ["<class 'int'>", "<class 'float'>", "<class 'str'>", "<class 'bool'>", "<class 'list'>"]);
  assert.deepEqual(chiqish('print(type(3 / 1))\nprint(type("5" + "5"))\nprint(type(int("5")))\nprint(type(len([1, 2])))'),
    ["<class 'float'>", "<class 'str'>", "<class 'int'>", "<class 'int'>"]);
  assert.deepEqual(chiqish("print(type(5) == type(5.0))\nprint(type(10 / 2) == type(0.5))"), ["False", "True"]);
  assert.deepEqual(chiqish("print(round(3.99), round(0.876, 2))\nprint(type(round(87.6)), type(round(0.876, 1)))"),
    ["4 0.88", "<class 'int'> <class 'float'>"]);
});

test("1-bosqich (type chiqishi): har kod ishlaydi, chiqish — <class '…'> yoki True/False; zina bilan ochiladi", () => {
  const kinds = new Set();
  const turlar = new Set();
  for (const tier of [0, 1, 2, undefined]) {
    const ruxsat = new Set(L.TYPE_SHAKLLAR.filter((s) => tier == null || s.tier <= tier).map((s) => s.id));
    for (const task of each(L.typePrintTask, 200, 13, tier)) {
      kinds.add(task.kind);
      assert.ok(ruxsat.has(task.kind), "zina " + tier + ": " + task.kind);
      assert.match(task.code, /type\(/);
      const out = chiqish(task.code);
      assert.ok(out.length >= 2 && out.length <= 3, task.code);
      for (const line of out) {
        assert.match(line, /^(<class '(int|float|str|bool|list)'>|True|False)$/, task.code + " → " + line);
        turlar.add(line);
      }
      assert.equal(K.check(task, out.join("\n")).ok, true);
      // bola klaviaturada qaysi apostrofni yozsa ham qabul qilinadi; qo'shtirnoqsiz — yo'q
      assert.equal(K.check(task, out.join("\n").replace(/'/g, "ʼ")).ok, true);
      assert.equal(K.check(task, out.join("\n").replace(/<class '(\w+)'>/g, "$1")).ok, out.every((l) => !l.startsWith("<")));
    }
  }
  assert.equal(kinds.size, L.TYPE_SHAKLLAR.length, "hamma shakl uchraydi");
  assert.ok(L.TYPE_SHAKLLAR.length >= 10);
  for (const t of L.TURLAR) assert.ok(turlar.has("<class '" + t + "'>"), t);
  // tuzoqlar: bir satrdagi ikki type() har xil javob beradi
  for (const t of each(L.typePrintTask, 200, 2, 2)) {
    const out = chiqish(t.code);
    if (["son-va-matn", "bolish", "matn-ulash", "uzunlik", "shart"].includes(t.kind)) assert.notEqual(out[0], out[1], t.code);
    if (t.kind === "tur-taqqos") assert.deepEqual(out, ["False", "True"]);
    if (t.kind === "yaxlitlash") assert.deepEqual(out, ["<class 'int'>", "<class 'float'>", "<class 'float'>"]);
    if (t.kind === "royxat-ichi") assert.deepEqual(out, ["<class 'list'>", "<class 'int'>", "<class 'float'>"]);
  }
});

test("1-bosqich: tanlov va type() chiqishi navbat bilan; birinchi savol — tanlov", () => {
  const tasks = each(L.stage1Task, 14, 31, 2);
  assert.equal(tasks[0].type, "tur");
  for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].type, tasks[k - 1].type);
});

test("typeOf: turni talqinchining type() chiqishidan oladi", () => {
  const t = (code) => L.typeOf("x = " + code, "x");
  assert.equal(t("5"), "int");
  assert.equal(t("-5"), "int");
  assert.equal(t("5.0"), "float");
  assert.equal(t("0.00001"), "float");
  assert.equal(t('"5"'), "str");
  assert.equal(t('"True"'), "str");
  assert.equal(t('"[1]"'), "str");
  assert.equal(t("True"), "bool");
  assert.equal(t("[1, 2]"), "list");
  assert.equal(t("[]"), "list");
  assert.equal(t("10 / 2"), "float");
  assert.equal(t("7 // 2"), "int");
  assert.equal(t("nomalum"), null);
});

test("1-bosqich: har shaklning javobi talqinchi bergan turga teng", () => {
  const kinds = new Set();
  for (const tier of [0, 1, 2, undefined]) {
    for (const task of each(L.typeTask, 300, 17, tier)) {
      kinds.add(task.kind);
      const shakl = L.TUR_SHAKLLAR.find((s) => s.id === task.kind);
      chiqish(task.code);
      assert.equal(task.answer, shakl.tur, task.code + " → talqinchi: " + task.answer + ", bankda: " + shakl.tur);
      assert.equal(task.answer, L.typeOf(task.code, task.name));
      // yechimda ko'rsatiladigan tasdiq: haqiqiy print(type(x)) chiqishi javobga teng
      const tasdiq = chiqish(task.tekshir);
      assert.equal(tasdiq[tasdiq.length - 1], "<class '" + task.answer + "'>", task.tekshir);
      assert.equal(task.chiqish, tasdiq[tasdiq.length - 1]);
      assert.deepEqual(task.options, ["int", "float", "str", "bool", "list"]);
      assert.ok(task.options.length >= 4 && task.options.includes(task.answer));
      assert.ok(task.why.length > 15 && task.ishora.length > 15);
      // maslahat javobni (aynan shu turni yagona qilib) aytmaydi
      assert.ok(!task.ishora.includes("javob"), task.ishora);
      assert.deepEqual(chiqish(task.code + "\nprint(" + task.name + ")"), [task.qiymat]);
      assert.ok(!L.UZUN_KASR.test(task.qiymat) || task.kind === "bolish", task.code + " → " + task.qiymat);
    }
  }
  assert.equal(kinds.size, L.TUR_SHAKLLAR.length, "hamma shakl uchraydi");
  assert.ok(L.TUR_SHAKLLAR.length >= 30);
});

test("1-bosqich: zina bilan ochiladi; besh turning hammasi har zinada javob bo'ladi", () => {
  for (const tier of [0, 1, 2]) {
    const tasks = each(L.typeTask, 300, 5, tier);
    const ruxsat = new Set(L.TUR_SHAKLLAR.filter((s) => s.tier <= tier).map((s) => s.id));
    for (const t of tasks) assert.ok(ruxsat.has(t.kind), "zina " + tier + ": " + t.kind);
    assert.deepEqual([...new Set(tasks.map((t) => t.answer))].sort(), ["bool", "float", "int", "list", "str"]);
  }
  // har zinada o'z shakllari bor va har tur yuqori zinalarda ham alohida uchraydi
  for (const tier of [1, 2]) {
    const turlar = new Set(L.TUR_SHAKLLAR.filter((s) => s.tier === tier).map((s) => s.tur));
    assert.equal(turlar.size, 5, "zina " + tier);
  }
});

test("2-bosqich (natija): har kod xatosiz, chiqishi toza, tekshiruv to'g'ri", () => {
  const kinds = new Set();
  for (const tier of [0, 1, 2, undefined]) {
    for (const task of each(L.convTask, 150, 9, tier)) {
      kinds.add(task.kind);
      const out = chiqish(task.code);
      assert.ok(out.length >= 1 && out.length <= 4);
      assert.ok(!out.some((line) => L.UZUN_KASR.test(line)), task.code);
      assert.equal(K.check(task, out.join("\n")).ok, true);
    }
  }
  assert.equal(kinds.size, L.OGIRISH_SHAKLLAR.length);
  // tuzoqlar: matn ulanadi, son qo'shiladi; matnlar harfma-harf solishtiriladi
  for (const t of each(L.convTask, 200, 4, 2)) {
    const out = chiqish(t.code);
    if (t.kind === "ikki-marta") assert.equal(Number(out[1]) * 1, Number(out[0].slice(0, out[0].length / 2)) * 2, t.code);
    if (t.kind === "matn-taqqos") assert.deepEqual(out, ["True", "False"], t.code);
    if (t.kind === "bool") assert.deepEqual(out, ["False True", "False True"], t.code);
    if (t.kind === "ichma-ich") assert.match(out[0], /\.5$/, t.code);
  }
});

test("2-bosqich (xato): buzilgan kod TypeError/ValueError beradi yoki jim xato; yechim ishlaydi", () => {
  const kinds = new Set();
  const turlar = new Set();
  for (const tier of [0, 1, 2, undefined]) {
    for (const task of each(L.convFixTask, 200, 12, tier)) {
      kinds.add(task.kind);
      const good = chiqish(task.solution);
      assert.deepEqual(K.normalize(good), task.lines);
      assert.ok(!good.some((line) => L.UZUN_KASR.test(line)), task.solution);
      const bad = py.run(task.code);
      if (bad.error) {
        turlar.add(bad.error.type);
        assert.ok(["TypeError", "ValueError"].includes(bad.error.type), task.code + " → " + bad.error.type);
      } else {
        turlar.add("jim");
        assert.equal(K.sameOutput(bad.output, good), false, task.code);
      }
      assert.ok(task.why.length > 15);
      assert.equal(K.check(task, task.solution).ok, true);
      assert.equal(K.check(task, task.code).ok, false);
    }
  }
  assert.equal(kinds.size, L.XATOLAR.length, "hamma xato turi uchraydi");
  assert.ok(L.XATOLAR.length >= 9);
  assert.deepEqual([...turlar].sort(), ["TypeError", "ValueError", "jim"]);
  // zina 0 da faqat zina 0 xatolari
  const oson = new Set(L.XATOLAR.filter((x) => x.tier === 0).map((x) => x.kind));
  for (const t of each(L.convFixTask, 60, 3, 0)) assert.ok(oson.has(t.kind), t.kind);
});

test("2-bosqich (xato): boshqa to'g'ri tuzatishlar ham qabul qilinadi", () => {
  const bir = (kind) => each(L.convFixTask, 400, 8).find((t) => t.kind === kind);
  // str() o'rniga vergul bilan chiqarish (ortiqcha bo'shliqsiz)
  const a = bir("matn-plyus-son");
  assert.equal(K.check(a, a.code.replace('"Namunalar: " + soni', '"Namunalar:", soni')).ok, true);
  // int() o'rniga float() bilan bo'lish — natija bir xil
  const b = bir("matn-bolish");
  assert.equal(K.check(b, b.code.replace("togri / jami", "float(togri) / float(jami)")).ok, true);
  // faqat bittasini o'girish — yetmaydi
  assert.equal(K.check(b, b.code.replace("togri / jami", "int(togri) / jami")).ok, false);
});

test("3-bosqich (natija): ro'yxat kodlari xatosiz, chiqishi toza, hamma shakl uchraydi", () => {
  const kinds = new Set();
  for (const tier of [0, 1, 2, undefined]) {
    for (const task of each(L.listTask, 200, 6, tier)) {
      kinds.add(task.kind);
      const out = chiqish(task.code);
      assert.ok(out.length >= 1 && out.length <= 4);
      assert.ok(!out.some((line) => L.UZUN_KASR.test(line)), task.code);
      assert.equal(K.check(task, out.join("\n")).ok, true);
    }
  }
  assert.equal(kinds.size, L.ROYXAT_SHAKLLAR.length);
  assert.ok(L.ROYXAT_SHAKLLAR.length >= 10);
  // almashtirish haqiqatan ro'yxatni o'zgartiradi; ulash asl ro'yxatni o'zgartirmaydi
  for (const t of each(L.listTask, 200, 2, 2)) {
    const out = chiqish(t.code);
    if (t.kind === "almashtirish") assert.notEqual(out[0], t.code.split("\n")[0].replace("yorliqlar = ", "").replace(/"/g, "'"), t.code);
    if (t.kind === "ulash") assert.match(out[1], /^\[\d+, \d+\]$/);
    if (t.kind === "qator") assert.match(out[0], /^(True|False)$/);
  }
});

test("3-bosqich (yozish): bank — namunali yechim hamma to'plamda xatosiz, chiqishi toza", () => {
  assert.ok(L.WRITE_KINDS.length >= 9);
  for (const tier of [0, 1, 2]) assert.ok(L.WRITE_KINDS.filter((k) => k.tier === tier).length >= 2, "zina " + tier);
  for (const kind of L.WRITE_KINDS) {
    const task = L.vazifa(kind);
    assert.deepEqual(task.lines, K.normalize(chiqish(kind.solution)), kind.id);
    assert.equal(L.checkWrite(task, kind.solution).ok, true, kind.id);
    assert.equal(L.checkWrite(task, "  \n").kind, "bosh");
    assert.ok(kind.sets.length >= 3, kind.id + ": kamida 3 ta to'plam");
    assert.ok(kind.solution.startsWith(task.starter), kind.id + ": boshlang'ich kod yechim boshiga mos emas");
    const chiqishlar = new Set();
    for (const set of kind.sets) {
      const q = L.qoy(kind.solution, set);
      assert.equal(q.yoq, null, kind.id);
      const out = chiqish(q.code);
      assert.ok(!out.some((line) => L.UZUN_KASR.test(line)), kind.id + " → " + out.join(" / "));
      chiqishlar.add(out.join("|"));
    }
    assert.ok(chiqishlar.size >= 3, kind.id + ": to'plamlar har xil chiqish berishi kerak");
    assert.equal(L.checkWrite(task, task.starter).ok, false, kind.id);
    // javobni qo'lda yozib qo'yish hech bir masalada o'tmaydi
    const qolda = task.starter + task.lines.map((line) => "print(" + JSON.stringify(line) + ")").join("\n");
    assert.deepEqual(K.normalize(chiqish(qolda)), task.lines, kind.id);
    assert.equal(L.checkWrite(task, qolda).ok, false, kind.id + ": qo'lda yozilgan javob o'tib ketdi");
  }
});

test("3-bosqich (yozish): tipik xato yechimlar o'tmaydi, boshqa to'g'ri yo'llar o'tadi", () => {
  const v = (id) => L.vazifa(L.WRITE_KINDS.find((k) => k.id === id));
  // qotirilgan indeks: boshqa uzunlikda yiqiladi
  const qotgan = L.checkWrite(v("chetlar"), 'yorliqlar = ["mushuk", "it", "qush"]\nprint(yorliqlar[0])\nprint(yorliqlar[2])');
  assert.equal(qotgan.ok, false);
  assert.equal(qotgan.kind, "xato");
  assert.match(qotgan.hint, /IndexError/);
  // len - 1 ham to'g'ri yo'l
  assert.equal(L.checkWrite(v("chetlar"), 'yorliqlar = ["mushuk", "it", "qush"]\nprint(yorliqlar[0])\nprint(yorliqlar[len(yorliqlar) - 1])').ok, true);
  assert.equal(L.checkWrite(v("tuzatish"), 'yorliqlar = ["mushuk", "it", "mushk"]\nyorliqlar[2] = "mushuk"\nprint(yorliqlar)').ok, false);
  assert.equal(L.checkWrite(v("tuzatish"), 'yorliqlar = ["mushuk", "it", "mushk"]\nyorliqlar[len(yorliqlar) - 1] = "mushuk"\nprint(yorliqlar)').ok, true);
  // o'rtacha: qo'lda 3 ga bo'lish
  assert.equal(L.checkWrite(v("ortacha"), "ballar = [80, 90, 100]\nprint(sum(ballar) / 3)").ok, false);
  // o'rtacha: sikl bilan yig'ish ham to'g'ri
  assert.equal(L.checkWrite(v("ortacha"), "ballar = [80, 90, 100]\ns = 0\nfor b in ballar:\n    s = s + b\nprint(s / len(ballar))").ok, true);
  // matndan: o'girmasdan bo'lish — TypeError
  assert.match(L.checkWrite(v("matndan"), 'qator = ["46", "50"]\nprint(qator[0] / qator[1])').hint, /TypeError/);
  assert.equal(L.checkWrite(v("matndan"), 'qator = ["46", "50"]\ntogri = float(qator[0])\njami = float(qator[1])\nprint(togri / jami)').ok, true);
  // oraliq: oxirgi − birinchi (tartiblanmagan ro'yxatda yiqiladi)
  assert.equal(L.checkWrite(v("oraliq"), 'yoshlar = [14, 15, 17, 15]\nprint("Oraliq:", yoshlar[-1] - yoshlar[0])').ok, false);
  // qo'shish: append o'rniga + bilan yangi ro'yxat
  assert.equal(L.checkWrite(v("qoshish"), 'yorliqlar = ["mushuk", "it"]\nyangi = "qush"\nyorliqlar = yorliqlar + [yangi]\nprint(yorliqlar)\nprint(len(yorliqlar))').ok, true);
  // o'zgaruvchi satri o'chirilgan
  assert.equal(L.checkWrite(v("soni"), 'print("Namunalar soni:", 3)').kind, "ozgaruvchi");
  // aniqlik: 1 lar sonini sum bilan emas, sikl bilan sanash
  assert.equal(L.checkWrite(v("aniqlik"), 'natijalar = [1, 0, 1, 1]\nt = 0\nfor n in natijalar:\n    if n == 1:\n        t += 1\nprint("Aniqlik:", t / len(natijalar))').ok, true);
});

test("navbat: 2- va 3-bosqichda savol turlari almashadi; yozish masalasi qayta berilmaydi", () => {
  const t2 = each(L.stage2Task, 14, 5, 2).map((t) => t.type);
  for (let k = 1; k < t2.length; k++) assert.notEqual(t2[k], t2[k - 1]);
  const r = rngFrom(77);
  const seen = new Set();
  let prev = null;
  const yozilgan = [];
  for (const tier of [0, 1, 1, 2, 2, 2, 2, 2, 2, 2]) {
    if (prev && prev.type === "kod-yoz") seen.add(prev.id);
    const next = L.stage3Task(r, prev, tier, seen);
    if (prev) assert.notEqual(next.type, prev.type);
    prev = next;
    if (prev.type === "kod-yoz") yozilgan.push(prev.id);
  }
  assert.equal(new Set(yozilgan).size, yozilgan.length, yozilgan.join(", "));
});

test("savollar ketma-ket takrorlanmaydi", () => {
  for (const make of [L.typeTask, L.typePrintTask, L.stage1Task, L.convTask, L.convFixTask, L.stage2Task, L.listTask, L.writeTask, L.stage3Task]) {
    for (const tier of [0, 1, 2]) {
      const tasks = each(make, 60, 20261012, tier);
      for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
    }
  }
});

test("ekran matni: oddiy ' ishlatilmaydi, faqat oqsoqol paneli", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const dir = path.join(__dirname, "..", "js", "scenes");
  for (const f of fs.readdirSync(dir)) {
    const src = fs.readFileSync(path.join(dir, f), "utf8").replace(/^\s*\/\/.*$/gm, "");
    assert.ok(!src.includes("'"), f + ": oddiy ' belgisi bor");
    assert.ok(!/"apprentice"|ui\.paper\(|"drum"/.test(src), f + ": shogird/qogʻoz/baraban ishlatilmaydi");
  }
  for (const k of L.WRITE_KINDS) assert.ok(!k.what.includes("'"), k.id);
  for (const x of L.XATOLAR) assert.ok(!x.why.includes("'"), x.kind);
  for (const s of L.TUR_SHAKLLAR) assert.ok(!s.why.includes("'"), s.id);
});

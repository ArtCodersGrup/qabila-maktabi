// «Python: sintaksis» mantiqi: har kod namunasi va har namunali yechim o'z talqinchimizda ishga tushiriladi.
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
  assert.deepEqual(chiqish(N.birinchi), ["Model: spam filtri", "Aniqlik: 0.92"]);
  assert.deepEqual(chiqish(N.matnSon), ["46 + 4", "50", "464"]);
  assert.deepEqual(chiqish(N.otstup), ["Tamom"]);
  assert.deepEqual(chiqish(N.jimXato), ["Aniqlik: 0 92"]);
  assert.deepEqual(chiqish(N.hisobot), ["Xato: 4", "Aniqlik: 0.92"]);
  const x = py.run(N.xatoXabar);
  assert.equal(x.error.type, "SyntaxError");
  assert.equal(x.error.line, 2);
  assert.deepEqual(x.output, [], "sintaksis xatosida 1-satr ham chiqmaydi");
  // qadam-baqadam panel izohli kodda ham ishlaydi
  const tr = py.trace(N.birinchi, {});
  assert.equal(tr.error, null);
  assert.deepEqual(tr.states[tr.states.length - 1].output, ["Model: spam filtri", "Aniqlik: 0.92"]);
});

test("1-bosqich: har kod xatosiz ishlaydi, javob tekshiruvi to'g'ri, uzun kasr yo'q", () => {
  for (const tier of [0, 1, 2, undefined]) {
    for (const task of each(L.printTask, 80, 5, tier)) {
      const out = chiqish(task.code);
      assert.ok(out.length >= 1 && out.length <= 4, task.code);
      assert.ok(!out.some((line) => L.UZUN_KASR.test(line)), task.code + " → " + out.join(" / "));
      assert.equal(K.check(task, out.join("\n")).ok, true, task.code);
      assert.equal(K.check(task, out.join("\n") + "\nortiqcha").ok, false);
    }
  }
});

test("1-bosqich: shakllar zina bilan ochiladi va hammasi uchraydi", () => {
  const turlar = (tier) => new Set(each(L.printTask, 300, 11, tier).map((t) => t.kind));
  const idlar = (t) => L.PRINT_SHAKLLAR.filter((s) => s.tier <= t).map((s) => s.id).sort();
  assert.deepEqual([...turlar(0)].sort(), idlar(0));
  assert.deepEqual([...turlar(1)].sort(), idlar(1));
  assert.deepEqual([...turlar(2)].sort(), idlar(2));
  assert.ok(idlar(0).length >= 4 && idlar(2).length >= 14);
});

test("1-bosqich: tuzoqlar haqiqatan ishlaydi (matn/son, izoh, otstup)", () => {
  const tasks = each(L.printTask, 400, 21, 2);
  const turi = (kind) => tasks.filter((t) => t.kind === kind);
  for (const t of turi("ulash")) {
    const [a, b] = chiqish(t.code);
    assert.equal(a.length, 2, "matnlar ulanadi: " + t.code);
    assert.equal(Number(b), Number(a[0]) + Number(a[1]), t.code);
  }
  for (const t of turi("izoh")) assert.equal(chiqish(t.code).length, 1, "izohga olingan print chiqmaydi");
  for (const t of turi("izoh-matnda")) assert.match(chiqish(t.code)[0], /^# /, "matn ichidagi # izoh emas");
  // otstup: to'rt xil holat — shart rost/yolg'on × ikkinchi satr surilgan/surilmagan
  const satrlar = new Set(turi("otstup").map((t) => chiqish(t.code).join("|").replace(/0\.\d+/, "N")));
  assert.deepEqual([...satrlar].sort(), ["Model yaxshi|Xato: N|Tamom", "Tamom", "Xato: N|Tamom"]);
  for (const t of turi("uch-amal")) {
    const [a, b, c] = chiqish(t.code);
    assert.match(a, /^\d+\.\d$/, "/ har doim kasr son beradi: " + t.code);
    assert.match(b, /^\d+$/);
    assert.equal(c.length % 2, 0);
  }
  for (const t of turi("foiz")) assert.match(chiqish(t.code)[0], /^Aniqlik: \d+\.\d+ %$/);
});

test("2-bosqich: har buzilgan kod xato beradi yoki chiqishi boshqacha; yechim ishlaydi", () => {
  const kinds = new Set();
  const turlar = new Set();
  for (const task of each(L.fixTask, 300, 7)) {
    kinds.add(task.kind);
    const good = chiqish(task.solution);
    assert.deepEqual(K.normalize(good), task.lines);
    const bad = py.run(task.code);
    if (bad.error) turlar.add(bad.error.type);
    else {
      turlar.add("jim");
      assert.equal(K.sameOutput(bad.output, good), false, task.code);
    }
    assert.notEqual(task.code, task.solution);
    assert.ok(task.why && task.why.length > 15);
    assert.equal(K.check(task, task.solution).ok, true);
    assert.equal(K.check(task, task.code).ok, false, task.code);
  }
  assert.equal(kinds.size, L.BUZISHLAR.length, "hamma buzilish turi uchraydi: " + [...kinds].join(", "));
  assert.ok(L.BUZISHLAR.length >= 10);
  for (const t of ["SyntaxError", "IndentationError", "NameError", "jim"]) assert.ok(turlar.has(t), t + " uchramadi: " + [...turlar].join(", "));
  // faqat tushunarli xato turlari chiqadi
  for (const t of turlar) assert.ok(["SyntaxError", "IndentationError", "NameError", "jim"].includes(t), "kutilmagan tur: " + t);
});

test("2-bosqich: uch dastur zina bilan ochiladi; bitta belgi tuzatilsa yetadi", () => {
  const shablonlar = (tier) => new Set(each(L.fixTask, 80, 14, tier).map((t) => t.shablon));
  assert.deepEqual([...shablonlar(0)], [0]);
  assert.deepEqual([...shablonlar(1)].sort(), [0, 1]);
  assert.deepEqual([...shablonlar(2)].sort(), [0, 1, 2]);
  // buzilgan va to'g'ri kod bir-biridan ozgina farq qiladi (ko'pi bilan 4 belgi)
  for (const task of each(L.fixTask, 120, 2)) {
    assert.ok(Math.abs(task.code.length - task.solution.length) <= 4, task.kind);
    assert.equal(task.code.split("\n").length, task.solution.split("\n").length, task.kind);
  }
});

test("3-bosqich: bank — namunali yechim hamma to'plamda xatosiz, chiqishi toza", () => {
  assert.ok(L.WRITE_KINDS.length >= 9);
  for (const tier of [0, 1, 2]) assert.ok(L.WRITE_KINDS.filter((k) => k.tier === tier).length >= 3, "zina " + tier);
  for (const kind of L.WRITE_KINDS) {
    const task = L.vazifa(kind);
    assert.deepEqual(task.lines, K.normalize(chiqish(kind.solution)), kind.id);
    assert.ok(task.lines.length >= 1, kind.id);
    assert.equal(L.checkWrite(task, kind.solution).ok, true, kind.id);
    assert.equal(L.checkWrite(task, "").kind, "bosh");
    if (!kind.sets) continue;
    assert.ok(kind.sets.length >= 3, kind.id + ": kamida 3 ta to'plam");
    // boshlang'ich satrlar yechimning boshida turadi va birinchi to'plamga teng
    assert.ok(kind.solution.startsWith(task.starter), kind.id + ": boshlang'ich kod yechim boshiga mos emas");
    const chiqishlar = new Set();
    for (const set of kind.sets) {
      const q = L.qoy(kind.solution, set);
      assert.equal(q.yoq, null, kind.id);
      const out = chiqish(q.code);
      assert.ok(!out.some((line) => L.UZUN_KASR.test(line)), kind.id + " → " + out.join(" / "));
      chiqishlar.add(out.join("|"));
    }
    assert.ok(chiqishlar.size >= 2, kind.id + ": to'plamlar har xil chiqish berishi kerak");
    // faqat boshlang'ich kodning o'zi (hech narsa yozilmagan) o'tmaydi
    assert.equal(L.checkWrite(task, task.starter).ok, false, kind.id);
  }
});

test("3-bosqich: javobni qo'lda yozib qo'yish o'tmaydi, boshqa to'g'ri yo'llar o'tadi", () => {
  const v = (id) => L.vazifa(L.WRITE_KINDS.find((k) => k.id === id));
  // sonni qo'lda yozish
  const qolda = L.checkWrite(v("aniqlik"), 'togri = 46\njami = 50\nprint("Aniqlik:", 0.92)');
  assert.equal(qolda.ok, false);
  assert.equal(qolda.kind, "chiqish");
  assert.match(qolda.hint, /togri = 171, jami = 200/);
  // o'zgaruvchi satri o'chirilgan
  assert.equal(L.checkWrite(v("aniqlik"), 'print("Aniqlik:", 46 / 50)').kind, "ozgaruvchi");
  // nom qo'shtirnoqqa olingan
  assert.equal(L.checkWrite(v("ikki-qiymat"), 'sinf = "mushuk"\nishonch = 0.87\nprint("Sinf:", "sinf")\nprint("Ishonch:", ishonch)').ok, false);
  // bitta print bilan ham bo'ladi
  assert.equal(L.checkWrite(v("xato-soni"), 'jami = 50\ntogri = 46\nxato = jami - togri\nprint("Xato javoblar:", xato)').ok, true);
  // foiz: ko'paytirish tartibi boshqa bo'lsa ham bir xil chiqadi
  for (const ifoda of ["togri / jami * 100", "togri * 100 / jami", "100 * togri / jami"]) {
    assert.equal(L.checkWrite(v("foiz"), 'togri = 46\njami = 50\nprint("Natija:", togri, "/", jami)\nprint("Aniqlik (%):", ' + ifoda + ")").ok, true, ifoda);
  }
  // qaror: ikkinchi satr surilmagan — shart yolg'on bo'lganda yiqiladi
  const surilmagan = 'xato = 0.08\nif xato < 0.1:\n    print("Model yaxshi")\nprint("Xato:", xato)\nprint("Tamom")';
  assert.equal(L.checkWrite(v("qaror"), surilmagan).ok, false);
  // qaror: <= yozilsa, chegarada (0.1) yiqiladi
  const chegara = 'xato = 0.08\nif xato <= 0.1:\n    print("Model yaxshi")\n    print("Xato:", xato)\nprint("Tamom")';
  assert.equal(L.checkWrite(v("qaror"), chegara).ok, false);
  // talablar: izoh va * amali
  assert.equal(L.checkWrite(v("izoh"), 'print("Sinf:", "mushuk")\nprint("Ishonch:", 0.87)').kind, "shart");
  assert.equal(L.checkWrite(v("izoh"), '# manba: test\nprint("Sinf: mushuk")\nprint("Ishonch: 0.87")').ok, true);
  assert.equal(L.checkWrite(v("chiziq"), 'print("==========")\nprint("HISOBOT")\nprint("==========")').kind, "shart");
  // boshqa to'plamda yiqiladigan xato (nolga bo'lish emas, NameError) tushunarli xabar beradi
  const xato = L.checkWrite(v("aniqlik"), 'togri = 46\njami = 50\nprint("Aniqlik:", togri / Jami)');
  assert.equal(xato.kind, "xato");
  assert.match(xato.hint, /NameError/);
});

test("3-bosqich: zina, ketma-ket takrorlanmaslik va yechilganini qayta bermaslik", () => {
  for (const t of each(L.writeTask, 40, 4, 0)) assert.equal(L.WRITE_KINDS.find((k) => "yoz:" + k.id === t.id).tier, 0);
  assert.ok(each(L.writeTask, 60, 4, 2).some((t) => L.WRITE_KINDS.find((k) => "yoz:" + k.id === t.id).tier === 2));
  // sahnadagidek: har yechilgan masala seen ga tushadi — 6 ta mashq 6 xil masala
  const r = rngFrom(99);
  const seen = new Set();
  let prev = null;
  const idlar = [];
  for (const tier of [0, 1, 1, 2, 2, 2]) {
    if (prev) seen.add(prev.id);
    prev = L.writeTask(r, prev, tier, seen);
    idlar.push(prev.id);
  }
  assert.equal(new Set(idlar).size, 6, idlar.join(", "));
});

test("savollar ketma-ket takrorlanmaydi", () => {
  for (const make of [L.printTask, L.fixTask, L.writeTask]) {
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
  for (const b of L.BUZISHLAR) assert.ok(!b.why.includes("'"), b.kind);
});

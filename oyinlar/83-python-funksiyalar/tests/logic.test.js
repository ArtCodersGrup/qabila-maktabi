// «Funksiyalar» mantiqi: har namuna, har savol va har namunali yechim o'z talqinchimizda BAJARILADI.
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
const run = (code) => py.run(code, { maxSteps: 200000 });

test("sahnalardagi namunalar: har biri bajariladi va yozilgan chiqishni beradi", () => {
  assert.ok(Object.keys(L.SAMPLES).length >= 6);
  for (const [nom, s] of Object.entries(L.SAMPLES)) {
    const r = run(s.code);
    assert.equal(r.error, null, nom + ": " + (r.error && r.error.text));
    assert.deepEqual(r.output, s.out, nom);
  }
});

test("1-bosqich: har generator xatosiz ishlaydi, chiqish qisqa va uzun kasrsiz", () => {
  for (const tier of [0, 1, 2, undefined]) {
    for (const task of each(L.readTask, 80, 7 + (tier || 0), tier)) {
      const r = run(task.code);
      assert.equal(r.error, null, task.code);
      assert.ok(r.output.length >= 1 && r.output.length <= L.MAX_LINES, task.code);
      assert.ok(!r.output.some((line) => /\.\d{4,}/.test(line)), task.code + " → " + r.output.join(" | "));
      assert.equal(task.type, "natija");
      assert.equal(K.check(task, r.output.join("\n")).ok, true);
      assert.equal(K.check(task, "notogri javob").ok, false);
      assert.ok(task.code.includes("def "), "har savolda funksiya bor");
    }
  }
  // Bankdagi har generator alohida ham bajariladi (zinaga bog'lanmasdan)
  const r = rngFrom(99);
  L.READ.forEach((make, k) => {
    for (let n = 0; n < 15; n++) {
      const res = run(make(r));
      assert.equal(res.error, null, "READ[" + k + "]: " + (res.error && res.error.text));
      assert.ok(res.output.length >= 1 && res.output.length <= L.MAX_LINES, "READ[" + k + "]");
    }
  });
});

test("1-bosqich: Pythonning haqiqiy xulqi — / kasr beradi, print li funksiya None qaytaradi, lokal nom tashqarini o'zgartirmaydi", () => {
  const hammasi = each(L.readTask, 200, 31, 2).concat(each(L.readTask, 60, 5, 1));
  const ortacha = hammasi.find((t) => /^def ortacha[\s\S]*\nprint\(ortacha\(\[/.test(t.code));
  assert.ok(ortacha, "ortacha savoli chiqmadi");
  assert.match(run(ortacha.code).output[0], /^\d+\.\d+$/, "bo'lish natijasi kasr son");
  const none = hammasi.find((t) => t.code.includes("    print(togri / jami)"));
  assert.ok(none, "print li funksiya savoli chiqmadi");
  assert.equal(run(none.code).output[1], "None");
  const lokal = hammasi.find((t) => t.code.startsWith("chegara = 0.5"));
  assert.ok(lokal, "lokal o'zgaruvchi savoli chiqmadi");
  assert.equal(run(lokal.code).output[0], "0 0.5");
  const royxat = hammasi.find((t) => t.code.includes("royxat.append(x)"));
  assert.ok(royxat, "ro'yxat parametri savoli chiqmadi");
  assert.match(run(royxat.code).output[0], /^3 \[\d, \d, \d\]$/);
  const evklid = hammasi.find((t) => t.code.includes("** 0.5"));
  assert.ok(evklid, "Evklid masofasi savoli chiqmadi");
  for (const line of run(evklid.code).output) assert.match(line, /^\d+\.0$/, evklid.code);
});

test("zina: 0 — faqat sodda savollar; 1 va 2 — yangi turlar qo'shiladi", () => {
  assert.ok(L.READ.filter((f) => !f.tier).length >= 4);
  assert.ok(L.READ.filter((f) => f.tier === 1).length >= 4);
  assert.ok(L.READ.filter((f) => f.tier === 2).length >= 4);
  for (const task of each(L.readTask, 60, 3, 0)) {
    assert.ok(!task.code.includes("chegara = 0.8") && !task.code.includes("eng_yaqin") && !task.code.includes("natija = aniqlik"), task.code);
  }
  for (const [bank, make] of [[L.FIX, L.fixTask], [L.WRITE, L.writeTask]]) {
    for (const t of [0, 1, 2]) assert.ok(bank.filter((k) => k.tier === t).length >= 4, "har zinada kamida 4 masala");
    for (const task of each(make, 60, 11, 0)) assert.equal(task.tier, 0, task.id);
    for (const task of each(make, 60, 12, 1)) assert.ok(task.tier <= 1, task.id);
    const qiyin = each(make, 120, 13, 2);
    assert.ok(qiyin.some((t) => t.tier === 2));
    // Qiyin rejim (7 ta javob, zina 2) uchun yetarli xilma-xillik
    assert.ok(new Set(qiyin.map((t) => t.id)).size >= 8);
  }
});

test("savollar ketma-ket takrorlanmaydi", () => {
  for (const make of [L.readTask, L.fixTask, L.writeTask]) {
    for (const tier of [0, 1, 2]) {
      const tasks = each(make, 60, 20261012 + tier, tier);
      for (let k = 1; k < tasks.length; k++) assert.notEqual(tasks[k].id, tasks[k - 1].id);
    }
  }
});

const sinovlar = (kind) => {
  // Tasodifiy chaqiruvlar ham qamralsin: bir necha urug' bilan
  const out = [];
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const tests = kind.calls(rngFrom(seed * 97));
    out.push({ solution: kind.solution, tests, show: tests.slice(0, L.SHOWN) });
  }
  return out;
};

test("2-bosqich: xatoli kod sinovdan o'tmaydi, tuzatilgani — o'tadi; har chaqiruv bajariladi", () => {
  assert.ok(L.FIX.length >= 12);
  for (const kind of L.FIX) {
    assert.notEqual(kind.code, kind.solution, kind.id);
    assert.ok(kind.what && kind.why, kind.id + ": vazifa va maslahat kerak");
    for (const task of sinovlar(kind)) {
      assert.ok(task.tests.length >= 4, kind.id + ": kamida 4 chaqiruv");
      for (const call of task.tests) {
        const r = run(L.withCalls(kind.solution, [call]));
        assert.equal(r.error, null, kind.id + " " + call + ": " + (r.error && r.error.text));
        assert.equal(r.output.length, 1, kind.id + " " + call);
        assert.ok(!/\.\d{6,}/.test(r.output[0]), kind.id + " " + call + " → " + r.output[0]);
      }
      assert.equal(L.check(task, kind.solution).ok, true, kind.id);
      const bad = L.check(task, kind.code);
      assert.equal(bad.ok, false, kind.id + ": xatoli kod o'tib ketdi");
      assert.ok(bad.hint, kind.id);
    }
  }
});

test("2-bosqich: ko'rinadigan chaqiruvlarda xato ko'zga tashlanadi yoki yashirin sinov ushlaydi", () => {
  const xato = (id) => {
    const kind = L.FIX.find((k) => k.id === id);
    return run(L.withCalls(kind.code, kind.calls(rngFrom(5)).slice(0, L.SHOWN)));
  };
  assert.equal(xato("ikki-nuqta").error.type, "SyntaxError");
  assert.equal(xato("otstup").error.type, "IndentationError");
  assert.equal(xato("nom").error.type, "NameError");
  assert.deepEqual(xato("return-yoq").output.slice(0, 1), ["None"]);
  assert.deepEqual(xato("print-return").output.slice(0, 2), ["7", "None"]);
  // "tashqi": birinchi chaqiruv tasodifan to'g'ri, ikkinchisi xatoni ochadi
  assert.deepEqual(xato("tashqi").output, ["4.0", "4.0"]);
  // "eng-nol": manfiy ro'yxatda 0 qaytadi
  assert.deepEqual(xato("eng-nol").output, ["9", "0"]);
  // Terishdagi xato urinish sanalmaydi, ish vaqtidagi xato — sanaladi
  assert.equal(L.typing(xato("ikki-nuqta").error), true);
  assert.equal(L.typing(xato("otstup").error), true);
  assert.equal(L.typing(xato("nom").error), false);
  assert.equal(L.typing(null), false);
  assert.equal(L.typing(run('print(f"{1}")').error), true, "«bu saytda hali yo'q» ham urinish emas");
});

test("3-bosqich: har namunali yechim hamma chaqiruvdan o'tadi; bo'sh sarlavha — o'tmaydi", () => {
  assert.ok(L.WRITE.length >= 12);
  for (const kind of L.WRITE) {
    assert.ok(kind.solution.startsWith(kind.starter.split("\n")[0]), kind.id + ": boshlang'ich sarlavha yechimga mos");
    for (const task of sinovlar(kind)) {
      assert.ok(task.tests.length >= 5, kind.id + ": kamida 5 chaqiruv");
      for (const call of task.tests) {
        const r = run(L.withCalls(kind.solution, [call]));
        assert.equal(r.error, null, kind.id + " " + call + ": " + (r.error && r.error.text));
        assert.ok(!/\.\d{6,}/.test(r.output[0]), kind.id + " " + call + " → " + r.output[0]);
      }
      assert.equal(L.check(task, kind.solution).ok, true, kind.id);
      assert.equal(L.check(task, kind.starter).ok, false, kind.id + ": bo'sh funksiya o'tib ketdi");
      assert.equal(L.check(task, "").kind, "bosh");
      // return o'rniga print — o'tmaydi
      assert.equal(L.check(task, kind.solution.replace(/return (.*)$/, "print($1)")).ok, false, kind.id + ": print li yechim o'tib ketdi");
    }
  }
});

const vazifa = (bank, id, seed) => {
  const kind = bank.find((k) => k.id === id);
  const tests = kind.calls(rngFrom(seed || 41));
  return { solution: kind.solution, tests, show: tests.slice(0, L.SHOWN) };
};

test("3-bosqich: tipik xato yechimlar o'tmaydi, boshqacha yozilgan to'g'ri yechimlar o'tadi", () => {
  const W = (id) => vazifa(L.WRITE, id);
  // aniqlik: o'rni almashgan
  assert.equal(L.check(W("aniqlik"), "def aniqlik(togri, jami):\n    return jami / togri").ok, false);
  // masofa: abs siz; if bilan yozilgani — to'g'ri
  assert.equal(L.check(W("masofa"), "def masofa(a, b):\n    return a - b").ok, false);
  assert.equal(L.check(W("masofa"), "def masofa(a, b):\n    if a > b:\n        return a - b\n    return b - a").ok, true);
  // ortacha: sikl bilan — to'g'ri; qotgan bo'luvchi — xato
  assert.equal(L.check(W("ortacha"), "def ortacha(royxat):\n    s = 0\n    for x in royxat:\n        s += x\n    return s / len(royxat)").ok, true);
  assert.equal(L.check(W("ortacha"), "def ortacha(royxat):\n    return sum(royxat) / 3").ok, false);
  // foiz: ikki xil tartib ham bir xil natija beradi (sinovlar shunga moslab tanlangan)
  assert.equal(L.check(W("foiz"), "def foiz(qism, jami):\n    return qism / jami * 100").ok, true);
  assert.equal(L.check(W("foiz"), "def foiz(qism, jami):\n    return qism / jami").ok, false);
  // kvadrat_xato: ko'paytirish bilan — to'g'ri; kvadratsiz — xato
  assert.equal(L.check(W("kvadrat-xato"), "def kvadrat_xato(bashorat, haqiqiy):\n    d = bashorat - haqiqiy\n    return d * d").ok, true);
  assert.equal(L.check(W("kvadrat-xato"), "def kvadrat_xato(bashorat, haqiqiy):\n    return abs(bashorat - haqiqiy)").ok, false);
  // eng_katta: eng = 0 manfiylarda yiqiladi; max() — to'g'ri
  assert.equal(L.check(W("eng-katta"), "def eng_katta(royxat):\n    eng = 0\n    for x in royxat:\n        if x > eng:\n            eng = x\n    return eng").ok, false);
  assert.equal(L.check(W("eng-katta"), "def eng_katta(royxat):\n    return max(royxat)").ok, true);
  // sanash: bor-yo'qligini qaytargan yechim
  assert.equal(L.check(W("sanash"), "def sanash(royxat, qiymat):\n    if qiymat in royxat:\n        return 1\n    return 0").ok, false);
  // tasnif: > (chegaraning o'zi) — xato; if/else bilan — to'g'ri
  assert.equal(L.check(W("tasnif"), 'def tasnif(ehtimol, chegara):\n    if ehtimol > chegara:\n        return "spam"\n    return "oddiy"').ok, false);
  assert.equal(L.check(W("tasnif"), 'def tasnif(ehtimol, chegara):\n    if ehtimol < chegara:\n        return "oddiy"\n    else:\n        return "spam"').ok, true);
  // oraliq: qo'lda yozilgani — to'g'ri; birinchi − oxirgi — xato
  assert.equal(L.check(W("oraliq"), "def oraliq(royxat):\n    a = sorted(royxat)\n    return a[-1] - a[0]").ok, true);
  assert.equal(L.check(W("oraliq"), "def oraliq(royxat):\n    return royxat[-1] - royxat[0]").ok, false);
  // Evklid: kvadratsiz (Manxetten) — xato
  assert.equal(L.check(W("masofa-2d"), "def masofa(a, b):\n    return abs(a[0] - b[0]) + abs(a[1] - b[1])").ok, false);
  assert.equal(L.check(W("masofa-2d"), "def masofa(a, b):\n    dx = a[0] - b[0]\n    dy = a[1] - b[1]\n    return (dx * dx + dy * dy) ** 0.5").ok, true);
  // eng_yaqin: eng kichik sonni qaytargan yechim
  assert.equal(L.check(W("eng-yaqin"), "def masofa(a, b):\n    return abs(a - b)\n\ndef eng_yaqin(x, namunalar):\n    return min(namunalar)").ok, false);
  // aniqlik (ro'yxat): ulush o'rniga son
  assert.equal(L.check(W("aniqlik-royxat"), "def aniqlik(bashorat, javob):\n    t = 0\n    for i in range(len(javob)):\n        if bashorat[i] == javob[i]:\n            t += 1\n    return t").ok, false);
  // ortachadan_katta: >= — xato (hamma teng bo'lsa 0 chiqishi kerak)
  assert.equal(L.check(W("ortachadan-katta"), "def ortacha(r):\n    return sum(r) / len(r)\n\ndef ortachadan_katta(royxat):\n    n = 0\n    for x in royxat:\n        if x >= ortacha(royxat):\n            n += 1\n    return n").ok, false);
  // ortacha_xato: abs siz — manfiy va musbat xatolar bir-birini yeydi
  assert.equal(L.check(W("ortacha-xato"), "def ortacha_xato(bashorat, haqiqiy):\n    s = 0\n    for i in range(len(haqiqiy)):\n        s += bashorat[i] - haqiqiy[i]\n    return s / len(haqiqiy)").ok, false);
});

test("tekshiruv xabari: qaysi chaqiruv, nima kutilgan, nima chiqqan", () => {
  const task = vazifa(L.WRITE, "masofa");
  const bad = L.check(task, "def masofa(a, b):\n    return a - b");
  assert.equal(bad.kind, "chiqish");
  assert.equal(bad.call, "masofa(3, 10)");
  assert.deepEqual(bad.expected, ["7"]);
  assert.deepEqual(bad.got, ["-7"]);
  assert.ok(bad.hint.includes("masofa(3, 10)") && bad.hint.includes("7"));
  // Nom noto'g'ri — NameError, xabar tushunarli
  const nom = L.check(task, "def masofaa(a, b):\n    return abs(a - b)");
  assert.equal(nom.kind, "xato");
  assert.equal(nom.error.type, "NameError");
  // Cheksiz sikl to'xtatiladi
  const sikl = L.check(task, "def masofa(a, b):\n    while True:\n        a += 1");
  assert.equal(sikl.kind, "xato");
  // Matn qaytaradigan funksiyada oʻ/ʼ va oddiy ' bir xil hisoblanadi (umumiy solishtirgich)
  assert.equal(K.sameOutput(["yoʻq"], ["yo'q"]), true);
});

test("masala tuzilishi: ko'rinadigan chaqiruvlar sinovlarning boshi, muharrirdagi kod — bankdagi", () => {
  for (const make of [L.fixTask, L.writeTask]) {
    for (const task of each(make, 40, 77)) {
      assert.deepEqual(task.show, task.tests.slice(0, L.SHOWN));
      assert.ok(task.what && task.code && task.solution, task.id);
      assert.equal(L.check(task, task.solution).ok, true, task.id);
      assert.equal(L.check(task, task.code).ok, false, task.id);
    }
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
  for (const kind of L.FIX.concat(L.WRITE)) {
    assert.ok(!/[a-z]'[a-z]/i.test(kind.what + (kind.why || "")), kind.id + ": vazifa matnida oddiy '");
  }
  assert.ok(!/<text/.test(fs.readFileSync(path.join(dir, "game-art.js"), "utf8")));
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  assert.ok(html.includes('<html lang="uz" data-toifa="yuqori">'));
  assert.ok(!html.includes("data-maskot"));
  assert.ok(html.indexOf("umumiy/js/toifa.js") < html.indexOf("</head>"));
  assert.ok(fs.readFileSync(path.join(dir, "main.js"), "utf8").includes('storageKey: "python-funksiyalar:v1"'));
});

// 56-o'yin mantiqining testlari. Ishga tushirish (loyiha ildizida):
//   node --test oyinlar/56-cpp-qavs-takror/tests/
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const C = require("../../umumiy/js/cpp.js");
const E = require("../../umumiy/js/cpp/cpp-run.js");

const r = () => Math.random();

test("har misolning chiqishi yadroniki bilan bir xil", () => {
  let soni = 0;
  for (let k = 0; k < 100; k++) {
    for (const f of [L.qavsTask, L.tengTask, L.siklTask, L.yigindiTask]) {
      const t = f(r, null);
      if (!t) continue;
      soni++;
      const natija = E.run(t.kod, { stdin: [] });
      assert.equal(natija.error, null, t.id + ": " + JSON.stringify(natija.error));
      assert.deepEqual(natija.output, t.chiqish, t.id);
    }
  }
  assert.ok(soni > 300, "misollar kam: " + soni);
});

// Qavssiz if: ikkinchi satr shartga tegishli emas
test("qavssiz if: ikkinchi satr har doim bajariladi", () => {
  for (let k = 0; k < 60; k++) {
    const t = L.qavsTask(r, null, 0); // birinchi zina: faqat sodda qavssiz if
    assert.notEqual(t.kind, "osilgan");
    assert.ok(t.chiqish.includes("tekshirdim"), t.id + ": " + JSON.stringify(t.chiqish));
    assert.ok(!t.kod.includes("if (x > " + "0" + ") {"), "qavs qoʻyilmasin");
    assert.match(t.nega, /Otstup C\+\+ uchun hech narsa anglatmaydi/);
  }
  // Shart yolg'on bo'lgan holat ham chiqsin
  const barchasi = [];
  for (let k = 0; k < 120; k++) barchasi.push(L.qavsTask(r, null, 0).chiqish.length);
  assert.ok(barchasi.includes(1) && barchasi.includes(2), "ikkala holat ham uchrasin");
});

// 2026-10-02: "osilgan else" — else eng yaqin if ga tegishli; otstup aldaydi
test("osilgan else: uch xil natija, yadro ham shuni chiqaradi", () => {
  const natijalar = new Set();
  let soni = 0;
  for (let k = 0; k < 300; k++) {
    const t = L.qavsTask(r, null, 2);
    if (t.kind !== "osilgan") continue;
    soni++;
    natijalar.add(t.chiqish.join("|"));
    assert.equal(t.chiqish[t.chiqish.length - 1], "tamom", t.id);
    assert.ok(!t.kod.includes("{\n    if"), "qavs qoʻyilmasin");
    assert.deepEqual(E.run(t.kod, { stdin: [] }).output, t.chiqish, t.id);
    // Eng muhim holat: x tashqi shartdan o'tmasa — "kichik" CHIQMAYDI (else ichki if niki)
    const [, x, past] = t.id.split(":").map(Number);
    if (x <= past) assert.deepEqual(t.chiqish, ["tamom"], t.id);
  }
  assert.ok(soni >= 60, "osilgan else savollari kam: " + soni);
  assert.deepEqual([...natijalar].sort(), ["katta|tamom", "kichik|tamom", "tamom"]);
});

// "=" va "==" — eng ko'p uchraydigan yozuv xatosi
test("bitta = shart ichida tayinlash bo'ladi va shart rost chiqadi", () => {
  let bitta = 0;
  for (let k = 0; k < 200; k++) {
    const t = L.tengTask(r, null);
    if (!t.id.startsWith("teng:bir")) continue;
    bitta++;
    assert.equal(t.chiqish[0], "rost", t.id);
    const nishon = t.id.split(":")[3];
    assert.equal(t.chiqish[1], nishon, t.id + ": x ham oʻzgarishi kerak");
  }
  assert.ok(bitta > 20, "«=» holati kam uchradi: " + bitta);
});

test("sikl: olti xil yurish; birinchi zinada — uchta soddasi", () => {
  const korilgan = new Set();
  for (let k = 0; k < 300; k++) korilgan.add(L.siklTask(r, null).id.split(":")[1]);
  assert.deepEqual([...korilgan].sort(), ["ikki", "ikkilanish", "kamay", "osha", "qatiy", "uchtadan"]);
  const sodda = new Set();
  for (let k = 0; k < 100; k++) sodda.add(L.siklTask(r, null, 0).id.split(":")[1]);
  assert.deepEqual([...sodda].sort(), ["ikki", "kamay", "osha"]);
  // i < b: oxirgi son kirmaydi; i *= 2: 3, 6, 12 …
  assert.deepEqual(E.run(C.dastur(["for (int i = 2; i < 6; i++) {", '    cout << i << " ";', "}", 'cout << "\\n";']), {}).output, ["2 3 4 5 "]);
  assert.deepEqual(E.run(C.dastur(["for (int i = 3; i <= 20; i *= 2) {", '    cout << i << " ";', "}", 'cout << "\\n";']), {}).output, ["3 6 12 "]);
});

test("yig'ish naqshi: yig'indi, ko'paytma va sanoq to'g'ri hisoblanadi", () => {
  for (let k = 0; k < 100; k++) {
    const t = L.yigindiTask(r, null);
    const n = Number(t.id.split(":")[2]);
    const tur = t.id.split(":")[1];
    const kutilgan = tur === "yigindi" ? (n * (n + 1)) / 2
      : tur === "kopaytma" ? L.ket(1, n, 1).reduce((a, b) => a * b, 1)
        : tur === "juft" ? Math.floor(n / 2)
          : tur === "toq" ? Math.ceil(n / 2) ** 2 // 1 + 3 + 5 + … (k ta toq son yig'indisi k²)
            : tur === "continue" ? (n * (n + 1)) / 2 - 3 * (Math.floor(n / 3) * (Math.floor(n / 3) + 1)) / 2
              : null;
    if (kutilgan !== null) assert.equal(t.chiqish[0], String(kutilgan), t.id);
    else {
      // break: yig'indi chegaradan birinchi marta oshgan paytdagi i va s
      const [i, s] = t.chiqish[0].split(" ").map(Number);
      assert.equal(s, (i * (i + 1)) / 2, t.id);
      assert.ok(s > n * 3 && s - i <= n * 3, t.id + ": " + t.chiqish[0]);
    }
  }
  const turlar = new Set();
  for (let k = 0; k < 200; k++) turlar.add(L.yigindiTask(r, null).id.split(":")[1]);
  assert.deepEqual([...turlar].sort(), ["break", "continue", "juft", "kopaytma", "toq", "yigindi"]);
  for (let k = 0; k < 60; k++) assert.ok(["yigindi", "kopaytma", "juft"].includes(L.yigindiTask(r, null, 0).id.split(":")[1]));
});

// Xato dasturlar HAQIQATAN xato qilishi kerak — aks holda savolning ma'nosi yo'q
test("xato savollari: har dastur haqiqatan notoʻgʻri ishlaydi", () => {
  for (const x of L.XATOLAR) {
    const natija = E.run(C.dastur(x.kod), { stdin: [], maxSteps: 3000 });
    if (x.id === "toxtamaydi") {
      assert.ok(natija.error && /too many steps/.test(natija.error.cppMessage), x.id);
    } else if (x.id === "nuqta-vergul") {
      assert.ok(natija.error && /undeclared identifier 'i'/.test(natija.error.cppMessage), x.id);
    } else if (x.id === "kam") {
      assert.deepEqual(natija.output, ["1 2 3 4 "], x.id + ": 5 gacha chiqarmasligi kerak");
    } else if (x.id === "qavssiz") {
      assert.deepEqual(natija.output, ["123 "], x.id + ": bo'shliq faqat oxirida");
    } else if (x.id === "teskari-qadam" || x.id === "shartda-tayinlash") {
      // 2026-10-02: ikkalasi ham cheksiz sikl
      assert.ok(natija.error && /too many steps/.test(natija.error.cppMessage), x.id);
      assert.ok(natija.output[0].startsWith(x.id === "teskari-qadam" ? "1 0 -1 " : "3 3 3 "), x.id + ": " + natija.output[0].slice(0, 20));
    } else if (x.id === "almashtirish") {
      assert.deepEqual(natija.output, ["4"], x.id + ": yig'indi (10) o'rniga oxirgi qiymat");
    } else if (x.id === "boshlanmagan") {
      assert.ok(natija.error && /uninitialized variable 's'/.test(natija.error.cppMessage), x.id + ": " + JSON.stringify(natija.error));
    } else {
      assert.fail("test yozilmagan xato: " + x.id);
    }
  }
  assert.equal(L.XATOLAR.length, 8);
  assert.equal(new Set(L.XATOLAR.map((x) => x.javob)).size, 8, "javob matnlari takrorlanmasin");
  const korilgan = new Set();
  for (let k = 0; k < 200; k++) {
    const t = L.xatoTask(r, null);
    korilgan.add(t.id);
    assert.equal(t.variantlar.length, 4, t.id);
    assert.equal(new Set(t.variantlar).size, 4, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
  }
  assert.equal(korilgan.size, 8, "sakkizala xato ham savolga tushsin");
  for (let k = 0; k < 60; k++) {
    assert.ok(["xato:nuqta-vergul", "xato:kam", "xato:toxtamaydi", "xato:qavssiz"].includes(L.xatoTask(r, null, 0).id), "birinchi zinada eski to'rt xato");
  }
});

test("yozish mashqlari: yechim ishlaydi, bo'sh qolip o'tmaydi", () => {
  for (const y of L.YOZISHLAR) {
    assert.ok(y.sinovlar.length >= 1, y.id);
    assert.equal(C.tekshir(y, y.yechim).ok, true, y.id + ": " + JSON.stringify(C.tekshir(y, y.yechim)));
    assert.equal(C.tekshir(y, L.QOLIP).ok, false, y.id);
  }
  // "eng katta" mashqi manfiy sonlar bilan ham sinaladi: eng = 0 deb boshlagan yechim o'tmaydi
  const eng = L.YOZISHLAR.find((y) => y.id === "eng-katta");
  const nolBilan = C.dastur(["int n;", "cin >> n;", "int eng = 0;", "for (int i = 0; i < n; i++) {",
    "    int x;", "    cin >> x;", "    if (x > eng) eng = x;", "}", C.chiqar("eng")]);
  assert.equal(C.tekshir(eng, nolBilan).ok, false, "manfiy sonlar sinovi yo'q — mashq zaif");
  // "bir marta kam" xatosi ham tutilsin
  const yigindi = L.YOZISHLAR.find((y) => y.id === "yigindi");
  assert.equal(C.tekshir(yigindi, yigindi.yechim.replace("i <= n", "i < n")).ok, false);
});

// 2026-10-02: yangi masalalar — tipik xato yechimlar sinovdan o'tmaydi
test("yangi yozish mashqlari: faktorial, raqamlar, tub, EKUB", () => {
  assert.ok(L.YOZISHLAR.length >= 8);
  const top = (id) => L.YOZISHLAR.find((y) => y.id === id);
  for (const id of ["faktorial", "raqamlar", "tub", "ekub"]) assert.ok(top(id).sinovlar.length >= 4, id + ": kamida 4 sinov");
  // Faktorial: 0 dan boshlangan ko'paytma hammasini nolga aylantiradi
  assert.equal(C.tekshir(top("faktorial"), top("faktorial").yechim.replace("int f = 1;", "int f = 0;")).ok, false);
  // Raqamlar: n / 10 ni unutgan yechim — cheksiz sikl (xato sifatida tutiladi, sahifa qotmaydi)
  const cheksiz = C.tekshir(top("raqamlar"), top("raqamlar").yechim.replace("    n = n / 10;\n", ""));
  assert.equal(cheksiz.ok, false);
  assert.equal(cheksiz.kind, "xato");
  // Tub: 1 ni tub degan yechim; d * d < n (25 va 49 ni o'tkazib yuboradi)
  assert.equal(C.tekshir(top("tub"), top("tub").yechim.replace("bool tub = n >= 2;", "bool tub = true;")).ok, false);
  assert.equal(C.tekshir(top("tub"), top("tub").yechim.replace("d * d <= n", "d * d < n")).ok, false);
  // EKUB: qo'pol usul (sanab chiqish) ham to'g'ri yechim
  const qopol = C.dastur(["int a, b;", "cin >> a >> b;", "int eng = 1;", "for (int d = 1; d <= a; d++) {",
    "    if (a % d == 0 && b % d == 0) eng = d;", "}", C.chiqar("eng")]);
  assert.equal(C.tekshir(top("ekub"), qopol).ok, true);
  // Kichigini chiqargan yechim yiqiladi
  assert.equal(C.tekshir(top("ekub"), C.dastur(["int a, b;", "cin >> a >> b;", "if (a < b) {", C.chiqar("a"), "} else {", C.chiqar("b"), "}"])).ok, false);
  for (let k = 0; k < 40; k++) assert.ok(["yoz:yigindi", "yoz:eng-katta", "yoz:juftlar", "yoz:jadval"].includes(L.yozTask(r, null, 0).id));
});

test("bosqichlar: turlar navbat bilan keladi", () => {
  assert.deepEqual([0, 1].map((n) => L.bosqich1Task(null, n).tur), ["natija", "natija"]);
  assert.deepEqual([0, 1].map((n) => L.bosqich2Task(null, n).tur), ["natija", "natija"]);
  assert.deepEqual([0, 1].map((n) => L.bosqich3Task(null, n).tur), ["xato", "yoz"]);
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
  for (const m of matnlar) assert.ok(!/['’`´]/.test(m), "notoʻgʻri tutuq belgisi: " + m);
});

test("namunalar: yechimlar ham, misollar ham tekshiruvga tushadi", () => {
  const ns = L.namunalar(20);
  assert.ok(ns.length >= 20, ns.length);
  assert.ok(ns.filter((n) => !n.id.startsWith("yechim:")).length >= 20, "yasalgan misollar yechimlardan tashqari sanaladi");
  assert.ok(ns.some((n) => n.id.startsWith("yechim:")));
  assert.equal(new Set(ns.map((n) => n.id)).size, ns.length);
});

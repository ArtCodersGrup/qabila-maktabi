// 55-o'yin mantiqining testlari. Ishga tushirish (loyiha ildizida):
//   node --test oyinlar/55-cpp-tur-chegara/tests/
// Misollar haqiqiy g++ bilan ham solishtiriladi: oyinlar/umumiy/tests/cpp-parity.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../js/logic.js");
const C = require("../../umumiy/js/cpp.js");
const E = require("../../umumiy/js/cpp/cpp-run.js");

const r = () => Math.random();

// Eng muhim qoida: o'yin aytgan javob yadroda ham aynan shunday chiqishi kerak
test("har misolning chiqishi dvigatelniki bilan bir xil", () => {
  const yasovchilar = [L.toshishTask, L.tuzatishTask, L.bolishTask, L.qirqishTask];
  let soni = 0;
  for (let k = 0; k < 120; k++) {
    for (const f of yasovchilar) {
      const t = f(r, null);
      if (!t) continue;
      soni++;
      const natija = E.run(t.kod, { stdin: [] });
      assert.equal(natija.error, null, t.id + ": " + JSON.stringify(natija.error));
      assert.deepEqual(natija.output, t.chiqish, t.id);
    }
  }
  assert.ok(soni > 400, "misollar kam: " + soni);
});

test("toshish: javob matematik javobdan boshqa va qirqilgan son", () => {
  for (let k = 0; k < 100; k++) {
    const t = L.toshishTask(r, null);
    const javob = BigInt(t.javob);
    assert.ok(javob >= L.INT_MIN && javob <= L.INT_MAX, t.id + ": " + t.javob);
    assert.equal(t.variantlar.length, 4, t.id);
    assert.equal(new Set(t.variantlar).size, 4, t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    // "Xato beradi" — eng muhim yanglish tasavvur, u har safar variantlar ichida bo'lsin
    assert.ok(t.variantlar.some((v) => /Xato beradi/.test(v)), t.id);
    assert.match(t.nega, /jim buziladi/);
  }
});

test("long long bilan o'sha hisob to'g'ri chiqadi", () => {
  for (let k = 0; k < 60; k++) {
    const t = L.tuzatishTask(r, null);
    assert.ok(t.kod.includes("long long"), t.id);
    const javob = BigInt(t.chiqish[0]);
    assert.ok(javob > L.INT_MAX || javob < L.INT_MIN, t.id + ": toshmaydigan misol " + javob);
  }
});

test("bo'lish tuzoqlari: butun, kasr, qoldiq va manfiy", () => {
  const korilgan = new Set();
  for (let k = 0; k < 300; k++) korilgan.add(L.bolishTask(r, null).id.split(":")[1]);
  assert.deepEqual([...korilgan].sort(), ["butun", "erta-kasr", "kasr", "kech-kasr", "manfiy", "manfiy-qoldiq", "qaytarib", "qoldiq"]);
});

// 2026-10-02: bo'lish QACHON bajarilishi — amallar chapdan o'ngga
test("bo'lish tartibi: a / b * 1.0 kasrni qaytarmaydi, 1.0 * a / b — beradi", () => {
  assert.deepEqual(E.run(C.dastur([C.chiqar("7 / 2 * 1.0")]), {}).output, ["3"]);
  assert.deepEqual(E.run(C.dastur([C.chiqar("1.0 * 7 / 2")]), {}).output, ["3.5"]);
  assert.deepEqual(E.run(C.dastur([C.chiqar("7 / 2 * 2")]), {}).output, ["6"]);
  // Birinchi zinada faqat eski besh tur
  for (let k = 0; k < 60; k++) {
    assert.ok(["butun", "kasr", "manfiy", "manfiy-qoldiq", "qoldiq"].includes(L.bolishTask(r, null, 0).id.split(":")[1]));
  }
});

test("toshish: manfiy tomonga va uch ko'paytuvchi bilan (zina 1–2)", () => {
  const turlar = new Set();
  for (let k = 0; k < 200; k++) turlar.add(L.toshishTask(r, null).id.split(":")[1]);
  assert.deepEqual([...turlar].sort(), ["ayir", "kopayt", "kub", "max", "qosh"]);
  for (let k = 0; k < 60; k++) assert.ok(["qosh", "kopayt", "max"].includes(L.toshishTask(r, null, 0).id.split(":")[1]));
  // 2000³ = 8·10⁹: a × a (4·10⁶) hali sig'adi, uchinchi ko'paytirishda toshadi
  assert.equal(L.int32(2000n * 2000n * 2000n), -589934592n);
  assert.equal(L.int32(-2000000000n - 2000000000n), 294967296n);
});

test("int ga kasr qiymat: kasr qismi tashlanadi, yaxlitlanmaydi", () => {
  for (let k = 0; k < 60; k++) {
    const t = L.qirqishTask(r, null);
    const qiymat = /int a = (-?[0-9.]+);/.exec(t.kod)[1];
    assert.equal(t.chiqish[0], String(Math.trunc(Number(qiymat))), t.id);
  }
});

test("tur tanlash: har vazifada bitta to'g'ri javob va izoh", () => {
  const korilgan = new Set();
  for (let k = 0; k < 200; k++) {
    const t = L.turTask(r, null);
    korilgan.add(t.id);
    // 2026-10-02: to'rt variant (QOIDALAR 4.3) — to'rtinchisi "string kerak"
    assert.deepEqual(t.variantlar, [L.INT_YETADI, L.LL_KERAK, L.DOUBLE_KERAK, L.STRING_KERAK], t.id);
    assert.ok(t.variantlar.includes(t.javob), t.id);
    assert.ok(t.nega.length > 20, t.id);
  }
  assert.equal(korilgan.size, L.VAZIFALAR.length);
  // To'rt xil javob ham uchrasin, har biri kamida ikki marta
  const javoblar = new Set(L.VAZIFALAR.map((v) => v.javob));
  assert.equal(javoblar.size, 4);
  for (const j of L.TUR_VARIANTLAR) assert.ok(L.VAZIFALAR.filter((v) => v.javob === j).length >= 2, j);
  assert.ok(L.VAZIFALAR.length >= 15);
});

// 2026-10-02: izohlardagi sonlar rost bo'lishi kerak — hisoblab tekshiramiz
test("tur vazifalari: chegaraga yaqin hisoblar to'g'ri baholangan", () => {
  assert.ok(L.sigadi(24n * 60n * 60n), "bir kundagi sekundlar int ga sig'adi");
  assert.equal(100n * 365n * 86400n, 3153600000n);
  assert.ok(!L.sigadi(100n * 365n * 86400n), "100 yildagi sekundlar int ga sig'maydi");
  assert.ok(!L.sigadi(100000n * 99999n / 2n), "juftliklar soni int ga sig'maydi");
  assert.ok(2n ** 60n <= L.LL_MAX && !L.sigadi(2n ** 60n));
  assert.ok(10n ** 49n > L.LL_MAX, "50 xonali son long long ga sig'maydi");
  // 12! sig'adi, 13! — yo'q
  const fakt = (n) => { let f = 1n; for (let i = 2n; i <= n; i++) f *= i; return f; };
  assert.ok(L.sigadi(fakt(12n)) && !L.sigadi(fakt(13n)));
  assert.ok(fakt(20n) <= L.LL_MAX && fakt(21n) > L.LL_MAX);
});

test("yozish mashqlari: namunali yechim ishlaydi, noto'g'ri tur esa o'tmaydi", () => {
  for (const y of L.YOZISHLAR) {
    assert.equal(C.tekshir(y, y.yechim).ok, true, y.id + ": yechim ishlamadi");
    assert.equal(C.tekshir(y, L.QOLIP).ok, false, y.id + ": bo'sh qolip o'tib ketdi");
  }
  // int bilan yozilgan yig'indi sinovdan o'tmasligi kerak — mashqning butun ma'nosi shu
  const yigindi = L.YOZISHLAR.find((y) => y.id === "yigindi");
  const intBilan = yigindi.yechim.replace(/long long/g, "int");
  assert.equal(C.tekshir(yigindi, intBilan).ok, false, "int bilan o'tib ketdi — mashq ma'nosiz bo'lib qoladi");
  // double o'rniga int: o'rtacha kasri yo'qoladi
  const ortacha = L.YOZISHLAR.find((y) => y.id === "ortacha");
  assert.equal(C.tekshir(ortacha, ortacha.yechim.replace(/double/g, "int")).ok, false);
});

// 2026-10-02: yangi masalalar — noto'g'ri tur bilan yozilgan yechim jim buziladi va sinovdan o'tmaydi
test("yangi yozish mashqlari: int bilan yozilsa, katta sinovda yiqiladi", () => {
  assert.ok(L.YOZISHLAR.length >= 6);
  const top = (id) => L.YOZISHLAR.find((y) => y.id === id);
  for (const id of ["faktorial", "ikki-daraja", "kvadratlar"]) {
    const y = top(id);
    assert.ok(y.sinovlar.length >= 3, id);
    const intBilan = y.yechim.replace(/long long/g, "int");
    assert.notEqual(intBilan, y.yechim);
    const natija = C.tekshir(y, intBilan);
    assert.equal(natija.ok, false, id + ": int bilan o'tib ketdi");
    // Kichik sinovdan o'tadi, kattasida yiqiladi — xato "jim": dastur to'xtamaydi
    assert.equal(natija.kind, "chiqish", id + ": " + JSON.stringify(natija).slice(0, 200));
    assert.notDeepEqual(natija.sinov, y.sinovlar[0], id + ": birinchi (kichik) sinovdayoq yiqildi");
  }
  // Kvadratlar: yig'indi long long, lekin hisoblagich int — i * i ning o'zi toshadi
  const kv = top("kvadratlar");
  const yarim = kv.yechim.replace("for (long long i = 1;", "for (int i = 1;");
  assert.notEqual(yarim, kv.yechim);
  assert.equal(C.tekshir(kv, yarim).ok, false, "i * i int da hisoblansa ham yiqilishi kerak");
  // Zina 0 da faqat eski uch masala
  for (let k = 0; k < 40; k++) assert.ok(["yoz:yigindi", "yoz:kopaytma", "yoz:ortacha"].includes(L.yozTask(r, null, 0).id));
});

test("bosqichlar: turlar navbat bilan keladi", () => {
  assert.deepEqual([0, 1].map((n) => L.bosqich1Task(null, n).tur), ["toshish", "natija"]);
  assert.deepEqual([0, 1, 2].map((n) => L.bosqich2Task(null, n).tur), ["natija", "natija", "natija"]);
  assert.deepEqual([0, 1].map((n) => L.bosqich3Task(null, n).tur), ["tur", "yoz"]);
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
  assert.ok(ns.some((n) => n.id.startsWith("yechim:")), "namunali yechimlar");
  assert.ok(ns.some((n) => n.kirish && n.kirish.length), "cin li misol");
  assert.equal(new Set(ns.map((n) => n.id)).size, ns.length, "takrorlanmasin");
});

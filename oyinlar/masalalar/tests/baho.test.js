// Baholash: har test alohida bajariladi, foiz beriladi, yiqilgan test ko'rsatiladi.
const test = require("node:test");
const assert = require("node:assert/strict");
const B = require("../js/baho.js");

const masala = {
  type: "kod-yoz",
  solution: "n = int(input())\nprint(n * 2)",
  tests: [{ stdin: ["3"], out: ["6"] }, { stdin: ["10"] }, { stdin: ["0"] }, { stdin: ["7"] }],
};

test("to'g'ri yechim — hamma test o'tadi, 100%", () => {
  const b = B.baho(masala, masala.solution);
  assert.equal(b.jami, 4);
  assert.equal(b.otgan, 4);
  assert.equal(b.foiz, 100);
  assert.equal(b.toliq, true);
  assert.equal(b.birinchiYiqilgan, null);
  assert.ok(b.testlar.every((t) => t.ok));
});

test("4 ta testdan 3 tasi o'tsa — 75% va qaysi test yiqilgani ko'rinadi", () => {
  // 10 uchun ataylab boshqacha javob beradigan yechim
  const kod = "n = int(input())\nif n == 10:\n    print(0)\nelse:\n    print(n * 2)";
  const b = B.baho(masala, kod);
  assert.equal(b.otgan, 3);
  assert.equal(b.foiz, 75);
  assert.equal(b.toliq, false);
  assert.equal(b.birinchiYiqilgan.n, 2, "2-test yiqilishi kerak");
  assert.deepEqual(b.testlar.map((t) => t.ok), [true, false, true, true]);
  assert.deepEqual(b.birinchiYiqilgan.kirish, ["10"]);
  assert.deepEqual(b.birinchiYiqilgan.kutilgan, ["20"]);
  assert.deepEqual(b.birinchiYiqilgan.chiqqan, ["0"]);
});

test("hech biri o'tmasa — 0%", () => {
  const b = B.baho(masala, "print(999)");
  assert.equal(b.otgan, 0);
  assert.equal(b.foiz, 0);
  assert.equal(b.birinchiYiqilgan.n, 1);
});

test("tasodifan bitta testdan o'tib ketgan yechim — 25%", () => {
  // print(0) faqat kirishi 0 bo'lgan testdan o'tadi — foiz shuni ko'rsatadi
  const b = B.baho(masala, "print(0)");
  assert.equal(b.otgan, 1);
  assert.equal(b.foiz, 25);
  assert.equal(b.toliq, false);
});

test("xato bergan test yiqilgan hisoblanadi va xatosi saqlanadi", () => {
  const b = B.baho(masala, "n = int(input())\nprint(n / 0)");
  assert.equal(b.otgan, 0);
  assert.equal(b.testlar[0].error.type, "ZeroDivisionError");
  assert.ok(B.xulosa(b).includes("0%"));
});

test("cheksiz sikl ham testni yiqitadi, sahifa qotmaydi", () => {
  const b = B.baho(masala, "while True:\n    x = 1");
  assert.equal(b.foiz, 0);
  assert.equal(b.testlar[0].error.type, "Limit");
});

test("bo'sh kod — alohida holat", () => {
  const b = B.baho(masala, "   ");
  assert.equal(b.bosh, true);
  assert.equal(b.foiz, 0);
  assert.ok(B.xulosa(b).includes("Avval kodni yoz"));
});

test("birinchi test — namuna (ochiq), qolganlari yopiq", () => {
  const b = B.baho(masala, masala.solution);
  assert.equal(b.testlar[0].namuna, true);
  assert.ok(b.testlar.slice(1).every((t) => !t.namuna));
});

test("xulosa matni: nechtadan nechtasi", () => {
  const kod = "n = int(input())\nif n == 10:\n    print(0)\nelse:\n    print(n * 2)";
  assert.equal(B.xulosa(B.baho(masala, kod)), "4 ta testdan 3 tasi oʻtdi — 75%");
  assert.equal(B.xulosa(B.baho(masala, masala.solution)), "Hamma test oʻtdi — 100%");
});

test("funksiya yozish masalasida sinov satri (tail) ishlaydi", () => {
  const fn = {
    type: "kod-yoz",
    solution: "def juftmi(n):\n    return n % 2 == 0",
    tail: "print(juftmi(int(input())))",
    tests: [{ stdin: ["4"] }, { stdin: ["7"] }],
  };
  assert.equal(B.baho(fn, fn.solution).foiz, 100);
  assert.equal(B.baho(fn, "def juftmi(n):\n    return True").foiz, 50);
});

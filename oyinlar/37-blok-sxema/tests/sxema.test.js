// Blok-sxema modeli: kod yasash va tekshirish.
const test = require("node:test");
const assert = require("node:assert/strict");
const S = require("../js/sxema.js");
const py = require("../../umumiy/js/python/python.js");

const kirit = { tur: "kirit", nom: "n ni kiritish", kod: "n = int(input())" };
const chiqar = (what) => ({ tur: "chiqar", nom: what + " ni chiqarish", kod: "print(" + what + ")" });

test("blok turlari: shakli va ichiga blok olishi belgilangan", () => {
  assert.deepEqual(S.TURLAR.map((t) => t.id), ["boshla", "kirit", "amal", "chiqar", "shart", "sikl", "tugat"]);
  assert.deepEqual(S.SODDA, ["kirit", "amal", "chiqar"]);
  assert.equal(S.turById("shart").sodda, false);
  assert.equal(S.turById("yoq"), null);
});

test("chiziqli sxemadan kod: boshlash va tugash kodga tushmaydi", () => {
  const kod = S.kodYasa([{ tur: "boshla" }, kirit, { tur: "amal", kod: "n = n * 2" }, chiqar("n"), { tur: "tugat" }]);
  assert.equal(kod, "n = int(input())\nn = n * 2\nprint(n)");
  assert.deepEqual(py.run(kod, { stdin: ["5"] }).output, ["10"]);
});

test("shartdan if/else chiqadi va otstup to'g'ri", () => {
  const kod = S.kodYasa([
    kirit,
    { tur: "shart", kod: "n % 2 == 0", ha: [chiqar('"juft"')], yoq: [chiqar('"toq"')] },
  ]);
  assert.equal(kod, 'n = int(input())\nif n % 2 == 0:\n    print("juft")\nelse:\n    print("toq")');
  assert.deepEqual(py.run(kod, { stdin: ["4"] }).output, ["juft"]);
  assert.deepEqual(py.run(kod, { stdin: ["7"] }).output, ["toq"]);
});

test("yo'q tomoni bo'sh bo'lsa, else yozilmaydi", () => {
  const kod = S.kodYasa([kirit, { tur: "shart", kod: "n > 0", ha: [chiqar('"musbat"')], yoq: [] }]);
  assert.equal(kod, 'n = int(input())\nif n > 0:\n    print("musbat")');
  assert.equal(py.run(kod, { stdin: ["-1"] }).output.length, 0);
});

test("sikldan for chiqadi, ichidagi bloklar suriladi", () => {
  const kod = S.kodYasa([
    { tur: "amal", kod: "s = 0" },
    { tur: "sikl", kod: "for i in range(1, 5)", tana: [{ tur: "amal", kod: "s = s + i" }] },
    chiqar("s"),
  ]);
  assert.equal(kod, "s = 0\nfor i in range(1, 5):\n    s = s + i\nprint(s)");
  assert.deepEqual(py.run(kod).output, ["10"]);
});

test("ichi bo'sh shart va sikl pass bilan yopiladi (kod baribir ishlaydi)", () => {
  const kod = S.kodYasa([{ tur: "shart", kod: "1 > 0", ha: [], yoq: [] }]);
  assert.equal(kod, "if 1 > 0:\n    pass");
  assert.equal(py.run(kod).error, null);
});

test("tekshir: bo'sh sxema, chiqarishsiz sxema va bo'sh shart tutiladi", () => {
  assert.equal(S.tekshir([]).ok, false);
  assert.match(S.tekshir([]).sabab, /boʻsh/);
  assert.equal(S.tekshir([kirit]).ok, false);
  assert.match(S.tekshir([kirit]).sabab, /Chiqarish/);
  assert.equal(S.tekshir([{ tur: "shart", kod: "1 > 0", ha: [], yoq: [] }, chiqar("1")]).ok, false);
  assert.equal(S.tekshir([{ tur: "sikl", kod: "for i in range(3)", tana: [] }, chiqar("1")]).ok, false);
});

test("tekshir: shart ichidagi chiqarish ham hisobga olinadi", () => {
  const sxema = [kirit, { tur: "shart", kod: "n > 0", ha: [chiqar("n")], yoq: [] }];
  assert.equal(S.tekshir(sxema).ok, true);
});

test("soni(): ichidagi bloklar ham sanaladi", () => {
  assert.equal(S.soni([kirit, chiqar("n")]), 2);
  assert.equal(S.soni([{ tur: "shart", kod: "x", ha: [chiqar("1")], yoq: [chiqar("2")] }]), 3);
  assert.equal(S.soni([{ tur: "sikl", kod: "for i in range(3)", tana: [chiqar("i")] }]), 2);
});

test("yasalgan kod har doim bizning Pythonda ishlaydi", () => {
  const sxemalar = [
    [kirit, { tur: "amal", kod: "s = n * n" }, chiqar("s")],
    [kirit, { tur: "shart", kod: "n % 2 == 0", ha: [chiqar('"juft"')], yoq: [chiqar('"toq"')] }],
    [{ tur: "amal", kod: "s = 0" }, { tur: "sikl", kod: "for i in range(1, 6)", tana: [{ tur: "amal", kod: "s = s + i" }] }, chiqar("s")],
  ];
  for (const sx of sxemalar) {
    const r = py.run(S.kodYasa(sx), { stdin: ["6"] });
    assert.equal(r.error, null, S.kodYasa(sx));
    assert.ok(r.output.length >= 1);
  }
});

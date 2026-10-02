// Baholash: har test alohida bajariladi, foiz beriladi, yiqilgan test ko'rsatiladi
// (faqat namuna va birinchi 2 ta yiqilgan yashirin testning ma'lumoti ochiladi).
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

// ---------- Javobni kodga qotirib yozishga qarshi ----------
// 1 ta namuna + 6 ta yashirin test: javob — sonning ikki barobari
const uzun = {
  type: "kod-yoz",
  solution: "n = int(input())\nprint(n * 2)",
  tests: [{ stdin: ["3"], out: ["6"] }, { stdin: ["10"] }, { stdin: ["0"] }, { stdin: ["7"] }, { stdin: ["-4"] }, { stdin: ["50"] }, { stdin: ["9"] }],
};

test("faqat birinchi 2 ta yiqilgan yashirin testning kirishi va javobi ochiladi", () => {
  assert.equal(B.OCHIQ_SONI, 2);
  // Namunani ko'chirgan yechim: namunadan o'tadi, 6 ta yashirin testning hammasida yiqiladi
  const b = B.baho(uzun, "print(6)");
  assert.equal(b.otgan, 1);
  assert.deepEqual(b.ochiqYiqilgan.map((t) => t.n), [2, 3]);
  assert.deepEqual(b.yopiqYiqilgan.map((t) => t.n), [4, 5, 6, 7]);
  assert.deepEqual(b.ochilgan, [2, 3]);
  assert.deepEqual(b.testlar[1].kirish, ["10"]);
  assert.deepEqual(b.testlar[1].kutilgan, ["20"]);
  // Yopiq testda na kirish, na kutilgan javob, na bolaning chiqishi bor — faqat ✓/✗ va hukm
  for (const t of b.yopiqYiqilgan) {
    assert.equal(t.ochiq, false);
    assert.equal(t.kirish, null);
    assert.equal(t.kutilgan, null);
    assert.equal(t.chiqqan, null);
    assert.equal(B.hukm(t), "javob notoʻgʻri");
  }
  // O'tgan testlarning ma'lumoti ham ochilmaydi
  assert.equal(b.testlar[0].kirish, null);
});

test("ochilgan ikki testni kodga qotirib yozgan bolaga yangi test ochilmaydi", () => {
  const birinchi = B.baho(uzun, "print(6)");
  // Bola ochilgan javoblarni if bilan yozib qo'ydi (10 → 20, 0 → 0)
  const qotirilgan = "n = int(input())\nif n == 10:\n    print(20)\nelif n == 0:\n    print(0)\nelse:\n    print(6)";
  const ikkinchi = B.baho(uzun, qotirilgan, "python", birinchi.ochilgan);
  assert.equal(ikkinchi.otgan, 3);
  assert.deepEqual(ikkinchi.ochiqYiqilgan, [], "yangi test ochilmasligi kerak");
  assert.deepEqual(ikkinchi.yopiqYiqilgan.map((t) => t.n), [4, 5, 6, 7]);
  assert.deepEqual(ikkinchi.ochilgan, [2, 3]);
  assert.equal(ikkinchi.birinchiYiqilgan.n, 4);
  assert.equal(ikkinchi.birinchiYiqilgan.kutilgan, null);
  // Eslab qolinmasa (ochilgan berilmasa), xuddi shu kod yangi ikki testni ochib yuborardi
  assert.deepEqual(B.baho(uzun, qotirilgan).ochiqYiqilgan.map((t) => t.n), [4, 5]);
});

test("ilgari ochilgan test yana yiqilsa — yana ochiq ko'rinadi, o'rin band qilmaydi", () => {
  // 2-test ilgari ochilgan; endi 2-, 4- va 5-testlar yiqiladi → 2 va 4 ochiq, 5 yopiq
  const kod = "n = int(input())\nif n == 10 or n == 7 or n == -4:\n    print(1)\nelse:\n    print(n * 2)";
  const b = B.baho(uzun, kod, "python", [2]);
  assert.deepEqual(b.ochiqYiqilgan.map((t) => t.n), [2, 4]);
  assert.deepEqual(b.yopiqYiqilgan.map((t) => t.n), [5]);
  assert.deepEqual(b.ochilgan, [2, 4]);
});

test("namuna yiqilsa — u doim ochiq va yashirin testlar hisobiga kirmaydi", () => {
  const b = B.baho(uzun, "print(999)");
  assert.deepEqual(b.ochiqYiqilgan.map((t) => t.n), [1, 2, 3]);
  assert.deepEqual(b.testlar[0].kutilgan, ["6"]);
  assert.deepEqual(b.ochilgan, [2, 3], "namuna (1-test) ro'yxatga yozilmaydi");
});

test("yopiq testda ham hukm aytiladi: xato yoki juda sekin", () => {
  // 4-testdan boshlab nolga bo'ladi; 2- va 3-o'rinlar allaqachon band
  const xato = B.baho(uzun, "n = int(input())\nif n == 7:\n    print(n // 0)\nelse:\n    print(n * 2)", "python", [2, 3]);
  assert.equal(xato.yopiqYiqilgan.length, 1);
  assert.equal(xato.yopiqYiqilgan[0].error.type, "ZeroDivisionError");
  assert.equal(B.hukm(xato.yopiqYiqilgan[0]), "xato berdi");
  // Masalaning o'z qadam chegarasi (task.qadam): sekin yechim "juda sekin" hukmini oladi
  const tor = Object.assign({}, uzun, { qadam: 300 });
  const sekin = B.baho(tor, "n = int(input())\ns = 0\nfor i in range(n * 100):\n    s += 1\nprint(n * 2)", "python", [2, 3]);
  const yiqilgan = sekin.testlar.filter((t) => !t.ok);
  assert.ok(yiqilgan.length >= 1 && yiqilgan.every((t) => t.sekin && t.error.type === "Limit"));
  assert.equal(B.hukm(yiqilgan[0]), "juda sekin");
  assert.equal(B.baho(tor, uzun.solution).toliq, true, "tez yechim tor chegarada ham o'tadi");
});

test("C++ da ham: qadam chegarasi va yopiq testlar bir xil ishlaydi", () => {
  const bosh = "#include <iostream>\nusing namespace std;\n\nint main() {\n    long long n;\n    cin >> n;\n";
  const oxir = "    return 0;\n}\n";
  const togri = bosh + "    cout << n * 2 << \"\\n\";\n" + oxir;
  assert.equal(B.baho(uzun, togri, "cpp").toliq, true);
  const soxta = B.baho(uzun, bosh + "    cout << 6 << \"\\n\";\n" + oxir, "cpp");
  assert.deepEqual(soxta.ochiqYiqilgan.map((t) => t.n), [2, 3]);
  assert.equal(soxta.yopiqYiqilgan.length, 4);
  const tor = Object.assign({}, uzun, { qadam: 300 });
  const sekin = B.baho(tor, bosh + "    long long s = 0;\n    for (long long i = 0; i < n * 100; i++) s += 1;\n    cout << n * 2 << \"\\n\";\n" + oxir, "cpp");
  assert.equal(sekin.toliq, false);
  assert.ok(sekin.testlar.filter((t) => !t.ok).every((t) => t.sekin), "C++ da ham qadam chegarasi «juda sekin» deb belgilanadi");
});


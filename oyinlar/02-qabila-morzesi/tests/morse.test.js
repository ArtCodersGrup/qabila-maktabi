// morse.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const M = require("../js/morse.js");

// Xalqaro Morze jadvali — koddagi jadvaldan mustaqil yozilgan
const STANDARD = `A .- B -... C -.-. D -.. E . F ..-. G --. H .... I .. J .--- K -.- L .-.. M --
N -. O --- P .--. Q --.- R .-. S ... T - U ..- V ...- W .-- X -..- Y -.-- Z --..`;

const within = (word, letters) => [...word].every((ch) => letters.includes(ch));

test("kodlar xalqaro standartga mos", () => {
  const parts = STANDARD.split(/\s+/);
  const table = {};
  for (let k = 0; k < parts.length; k += 2) table[parts[k]] = parts[k + 1];
  assert.deepEqual(M.CODES, table);
});

test("to'plamlar: 9, 13, 20 harf, alifbo tartibida", () => {
  assert.equal(M.lettersUpTo(1).join(""), "AEILMNOST");
  assert.equal(M.lettersUpTo(2).join(""), "AEHIKLMNORSTU");
  assert.equal(M.lettersUpTo(3).join(""), "ABDEHIKLMNOQRSTUVXYZ");
});

test("SALOM va 1-to'plam so'zlari faqat 1-to'plam harflaridan", () => {
  const set1 = M.lettersUpTo(1);
  assert.ok(within(M.FIRST_WORD, set1));
  for (const w of M.WORDS[0]) assert.ok(within(w, set1), w);
});

test("2-to'plam so'zlarida kamida bitta yangi harf bor", () => {
  const upTo2 = M.lettersUpTo(2);
  for (const w of M.WORDS[1]) {
    assert.ok(within(w, upTo2), w);
    assert.ok([...w].some((ch) => M.SETS[1].includes(ch)), w);
  }
});

test("topshiriqlar: 12 ta, javob 2–4 harf; 3-to'plamning hamma harfi topshiriqlarda yoki XAYR da bor", () => {
  const all = M.lettersUpTo(3);
  const used = new Set();
  for (const t of M.TASKS) {
    assert.ok(t.a.length >= 2 && t.a.length <= 4, t.a);
    assert.ok(within(t.a, all), t.a);
    assert.ok(t.q.length > 0);
    [...t.a].forEach((ch) => used.add(ch));
  }
  [...M.LAST_WORD].forEach((ch) => used.add(ch)); // X faqat XAYR da uchraydi
  for (const ch of M.SETS[2]) assert.ok(used.has(ch), ch);
  assert.equal(M.TASKS.length, 12);
  assert.ok(within(M.LAST_WORD, all));
});

test("so'zlarda faqat A–Z (oʻ, gʻ, tutuq belgisi yo'q)", () => {
  const words = [M.FIRST_WORD, M.LAST_WORD, ...M.WORDS[0], ...M.WORDS[1], ...M.TASKS.map((t) => t.a), "SOS"];
  for (const w of words) assert.match(w, /^[A-Z]+$/, w);
});

test("kodlash va o'qish bir-birining teskarisi", () => {
  assert.deepEqual(M.encodeWord("SALOM"), ["...", ".-", ".-..", "---", "--"]);
  const words = [M.FIRST_WORD, M.LAST_WORD, ...M.WORDS[0], ...M.WORDS[1], ...M.TASKS.map((t) => t.a)];
  for (const w of words) assert.equal(M.encodeWord(w).map(M.decodeCode).join(""), w);
  assert.equal(M.decodeCode("......"), "?");
});

test("parseTyped: ortiqcha oraliqlar hisobga olinmaydi", () => {
  assert.deepEqual(M.parseTyped(".... .-"), ["....", ".-"]);
  assert.deepEqual(M.parseTyped(".... .- "), ["....", ".-"]);
  assert.deepEqual(M.parseTyped(""), []);
});

test("checkTyped: to'g'ri, noto'g'ri, yetishmayotgan va ortiqcha harf", () => {
  assert.deepEqual(M.checkTyped("HA", ".... .-"), { ok: true, groups: ["....", ".-"], read: "HA", wrong: [] });
  assert.deepEqual(M.checkTyped("HA", ".... -."), { ok: false, groups: ["....", "-."], read: "HN", wrong: [1] });
  assert.deepEqual(M.checkTyped("HA", "...."), { ok: false, groups: ["...."], read: "H", wrong: [1] });
  assert.deepEqual(M.checkTyped("HA", ".... .- ."), { ok: false, groups: ["....", ".-", "."], read: "HAE", wrong: [2] });
  assert.equal(M.checkTyped("HA", "......").read, "?");
  assert.equal(M.checkTyped("HA", "....-").ok, false); // harf oralig'isiz terilgan
});

test("checkRead: noto'g'ri kataklar indekslari", () => {
  assert.deepEqual(M.checkRead("SALOM", ["S", "A", "L", "O", "M"]), []);
  assert.deepEqual(M.checkRead("SALOM", ["S", "A", "I", "O", "N"]), [2, 4]);
});

test("addSymbol / removeSymbol: oraliq boshida va ketma-ket yozilmaydi, 40 belgidan oshmaydi", () => {
  assert.equal(M.addSymbol("", " "), "");
  assert.equal(M.addSymbol("....", " "), ".... ");
  assert.equal(M.addSymbol(".... ", " "), ".... ");
  assert.equal(M.addSymbol(".... ", "."), ".... .");
  assert.equal(M.removeSymbol(".... ."), ".... ");
  assert.equal(M.removeSymbol(""), "");
  let s = "";
  for (let k = 0; k < 60; k++) s = M.addSymbol(s, ".");
  assert.equal(s.length, M.MAX_SYMBOLS);
});

test("beepPlan: nuqta 1, chiziq 3 birlik; belgilar orasida 1, harf oxirida 3 birlik", () => {
  assert.deepEqual(M.beepPlan(M.encodeWord("ET"), 100), [
    { on: 100, off: 300, group: 0 },
    { on: 300, off: 300, group: 1 },
  ]);
  assert.deepEqual(M.beepPlan(["..-"], 100), [
    { on: 100, off: 100, group: 0 },
    { on: 100, off: 100, group: 0 },
    { on: 300, off: 300, group: 0 },
  ]);
  assert.equal(M.beepPlan(["."])[0].on, M.UNIT_MS);
});

test("pickMessage: avval SALOM, keyin 1-, so'ng 2-to'plam; ketma-ket takror yo'q", () => {
  assert.equal(M.pickMessage(0, null), "SALOM");
  assert.equal(M.pickMessage(0, "OTA"), "SALOM");
  for (let k = 0; k < 200; k++) assert.ok(M.WORDS[0].includes(M.pickMessage(0, "SALOM")));
  let prev = "SALOM";
  for (let k = 0; k < 500; k++) {
    const w = M.pickMessage(1, prev);
    assert.ok(M.WORDS[0].includes(w));
    assert.notEqual(w, prev);
    prev = w;
  }
  for (let k = 0; k < 500; k++) {
    const w = M.pickMessage(2, prev);
    assert.ok(M.WORDS[1].includes(w));
    assert.notEqual(w, prev);
    prev = w;
  }
});

test("readLevel: 2-to'g'ri javobdan keyin 2-to'plam", () => {
  assert.deepEqual([0, 1, 2].map((c) => M.readLevel(c)), [1, 1, 2]);
});

test("pickTask: ketma-ket bir xil topshiriq yo'q", () => {
  let prev = null;
  for (let k = 0; k < 1000; k++) {
    const t = M.pickTask(prev);
    assert.ok(M.TASKS.includes(t));
    if (prev) assert.notEqual(t.a, prev.a);
    prev = t;
  }
});

test("rng berilsa — natija oldindan ma'lum", () => {
  const first = () => 0;
  assert.equal(M.pickMessage(1, null, first), M.WORDS[0][0]);
  assert.equal(M.pickTask(null, first), M.TASKS[0]);
});

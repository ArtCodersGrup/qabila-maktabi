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

test("topshiriqlar: 21 ta, javob 2–6 harf; 3-to'plamning hamma harfi topshiriqlarda yoki XAYR da bor", () => {
  const all = M.lettersUpTo(3);
  const used = new Set();
  for (const t of M.TASKS) {
    assert.ok(t.a.length >= 2 && t.a.length <= 6, t.a);
    assert.ok(M.encodeWord(t.a).join(" ").length <= M.MAX_SYMBOLS, `${t.a}: kod klaviaturaga sig'maydi`);
    assert.ok(within(t.a, all), t.a);
    assert.ok(t.q.length > 0);
    [...t.a].forEach((ch) => used.add(ch));
  }
  [...M.LAST_WORD].forEach((ch) => used.add(ch)); // X faqat XAYR da uchraydi
  for (const ch of M.SETS[2]) assert.ok(used.has(ch), ch);
  assert.equal(M.TASKS.length, 21);
  assert.equal(new Set(M.TASKS.map((t) => t.a)).size, 21, "javoblar takrorlanmasin");
  assert.equal(new Set(M.TASKS.map((t) => t.q)).size, 21, "savollar takrorlanmasin");
  assert.ok(within(M.LAST_WORD, all));
});

test("so'zlarda faqat A–Z (oʻ, gʻ, tutuq belgisi yo'q)", () => {
  const words = [M.FIRST_WORD, M.LAST_WORD, ...M.WORDS.flat(), ...M.TASKS.map((t) => t.a), "SOS"];
  for (const w of words) assert.match(w, /^[A-Z]+$/, w);
});

test("kodlash va o'qish bir-birining teskarisi", () => {
  assert.deepEqual(M.encodeWord("SALOM"), ["...", ".-", ".-..", "---", "--"]);
  const words = [M.FIRST_WORD, M.LAST_WORD, ...M.WORDS.flat(), ...M.TASKS.map((t) => t.a)];
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

test("missingGap: harf oralig'i unutilganda aniqlanadi", () => {
  assert.equal(M.missingGap("HA", ".....-"), true);
  assert.equal(M.missingGap("HA", ".... .-"), false);
  assert.equal(M.missingGap("HA", "...."), false);
  assert.equal(M.missingGap("MEN", "--.-."), true);
  assert.equal(M.missingGap("OY", "------"), true);
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

test("readLevel: 2-to'g'ri javobdan keyin 2-to'plam, 4-dan keyin 3-to'plam; zina berilsa — undan", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map((c) => M.readLevel(c)), [1, 1, 2, 2, 3, 3, 3]);
  assert.deepEqual([0, 1, 2].map((tier) => M.readLevel(0, tier)), [1, 2, 3]);
});

test("so'z banklari kengaygan: 20 / 18 / 10 ta, takrorsiz; 3-to'plam so'zlarida yangi harf bor", () => {
  assert.deepEqual(M.WORDS.map((list) => list.length), [20, 18, 10]);
  for (const list of M.WORDS) assert.equal(new Set(list).size, list.length);
  assert.ok(!M.WORDS[0].includes(M.FIRST_WORD));
  const upTo3 = M.lettersUpTo(3);
  for (const w of M.WORDS[2]) {
    assert.ok(within(w, upTo3), w);
    assert.ok([...w].some((ch) => M.SETS[2].includes(ch)), w);
    assert.ok(w.length >= 4 && w.length <= 6, w);
  }
  for (const w of M.WORDS.flat()) assert.ok(w.length >= 3 && w.length <= 6, w);
});

test("pickMessage zina bilan: tier 2 (qiyin rejim) — darhol 3-to'plam, SALOM siz", () => {
  let prev = null;
  for (let k = 0; k < 300; k++) {
    const w = M.pickMessage(0, prev, Math.random, 2);
    assert.ok(M.WORDS[2].includes(w), w);
    assert.notEqual(w, prev);
    prev = w;
  }
  assert.equal(M.pickMessage(0, null, Math.random, 0), "SALOM");
  assert.ok(M.WORDS[1].includes(M.pickMessage(2, "KUN", Math.random, 1)));
});

test("unitFor: «Tinglash» har to'g'ri javobda 15 ms tezlashadi, 60 ms dan tushmaydi", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map(M.unitFor), [120, 105, 90, 75, 60, 60, 60]);
  assert.equal(M.unitFor(undefined), M.UNIT_MS);
  const slow = M.beepPlan(M.encodeWord("OTA"), M.unitFor(0)).reduce((t, b) => t + b.on + b.off, 0);
  const fast = M.beepPlan(M.encodeWord("OTA"), M.unitFor(4)).reduce((t, b) => t + b.on + b.off, 0);
  assert.equal(fast * 2, slow, "4-javobda xabar ikki baravar tez chalinadi");
});

test("hiddenSets: 2-javobdan keyin eski kodlar, 3-dan keyin hammasi yashirin; yangi ochilgan to'plam ko'rinadi", () => {
  // Oddiy rejim (tier amaliyotdagidek: 0, 0, 1, 1)
  assert.deepEqual([[0, 0], [1, 0], [2, 1], [3, 1]].map(([c, t]) => M.hiddenSets(c, t)), [0, 0, 1, 2]);
  // 3-javobda 2-to'plam endi ochildi: uning kodlari ko'rinishi shart
  assert.ok(M.hiddenSets(2, 1) < M.readLevel(2, 1));
  // Qiyin rejim: 1–2-javobda hammasi ko'rinadi, keyin uchala to'plam ham yashirin
  assert.deepEqual([0, 1, 2, 3, 6].map((c) => M.hiddenSets(c, 2)), [0, 0, 3, 3, 3]);
});

test("makeReadTask: oddiy rejimdagi 4 ta xabar rejasi", () => {
  const tiers = [0, 0, 1, 1];
  let prev = null;
  const plan = [];
  for (let c = 0; c < 4; c++) {
    prev = M.makeReadTask(c, prev, Math.random, tiers[c]);
    plan.push(prev);
  }
  assert.equal(plan[0].word, "SALOM");
  assert.ok(M.WORDS[0].includes(plan[1].word));
  assert.ok(M.WORDS[1].includes(plan[2].word) && M.WORDS[1].includes(plan[3].word));
  assert.notEqual(plan[2].word, plan[3].word, "ketma-ket bir xil xabar");
  assert.deepEqual(plan.map((t) => t.level), [1, 1, 2, 2]);
  assert.deepEqual(plan.map((t) => t.hidden), [0, 0, 1, 2]);
  assert.deepEqual(plan.map((t) => t.unit), [120, 105, 90, 75]);
  // Xato qilingan SALOM dan keyin: yana 1-to'plam, lekin SALOM emas
  const retry = M.makeReadTask(0, plan[0], Math.random, 0);
  assert.ok(M.WORDS[0].includes(retry.word));
});

test("tasksFor / pickTask: javob uzunligi zina bilan o'sadi (2–3, 4–5, 5–6 harf)", () => {
  assert.deepEqual(M.TASK_LEN, [[2, 3], [4, 5], [5, 6]]);
  for (const tier of [0, 1, 2]) {
    const pool = M.tasksFor(tier);
    assert.ok(pool.length >= 6, `tier ${tier}: topshiriqlar kam (${pool.length})`);
    let prev = null;
    const seen = new Set();
    for (let k = 0; k < 600; k++) {
      const t = M.pickTask(prev, Math.random, tier);
      assert.ok(t.a.length >= M.TASK_LEN[tier][0] && t.a.length <= M.TASK_LEN[tier][1], `tier ${tier}: ${t.a}`);
      if (prev) assert.notEqual(t.a, prev.a);
      seen.add(t.a);
      prev = t;
    }
    assert.equal(seen.size, pool.length, `tier ${tier}: hamma topshiriq chiqishi kerak`);
  }
  assert.deepEqual(M.tasksFor(undefined), M.tasksFor(0));
});

test("makeWriteTask: 2-to'g'ri javobdan keyin qo'llanma kodlari yashirin", () => {
  assert.deepEqual([0, 1, 2, 3, 4].map((c) => M.makeWriteTask(c, null, Math.random, 0).hide), [false, false, true, true, true]);
  const t = M.makeWriteTask(4, { a: "USTOZ" }, Math.random, 2);
  assert.ok(t.q && t.a && t.a !== "USTOZ" && t.a.length >= 5);
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

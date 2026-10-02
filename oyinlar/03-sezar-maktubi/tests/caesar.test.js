// caesar.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../js/caesar.js");

const allWords = () => [...C.LETTERS.flatMap((s) => s.split(" ")), ...C.PRACTICE, C.FIRST_REPLY, ...C.REPLIES, ...C.CRACK];

test("alifbo: 29 ta harf, rasmiy tartibda, takrorsiz", () => {
  assert.equal(C.ALPHABET.join(" "), "A B D E F G H I J K L M N O P Q R S T U V X Y Z Oʻ Gʻ Sh Ch Ng");
  assert.equal(new Set(C.ALPHABET).size, 29);
});

test("tokenize: Oʻ, Gʻ, Sh, Ch, Ng — bitta harf", () => {
  assert.deepEqual(C.tokenize("SHAMOL"), ["Sh", "A", "M", "O", "L"]);
  assert.deepEqual(C.tokenize("OʻQ"), ["Oʻ", "Q"]);
  assert.deepEqual(C.tokenize("TONGDA"), ["T", "O", "Ng", "D", "A"]);
  assert.deepEqual(C.tokenize("CHOY"), ["Ch", "O", "Y"]);
  assert.deepEqual(C.tokenize("GʻOZ"), ["Gʻ", "O", "Z"]);
});

test("ro'yxatlardagi har bir so'z faqat alifbo harflaridan va qayta yig'ilganda o'zi", () => {
  for (const w of allWords()) {
    const t = C.tokenize(w);
    for (const ch of t) assert.ok(C.ALPHABET.includes(ch), `${w}: ${ch}`);
    assert.equal(t.join("").toUpperCase(), w);
  }
});

test("shift: aylana — Ng dan keyin A, A dan orqaga Ng", () => {
  assert.equal(C.shift("A", 3), "E");
  assert.equal(C.shift("Z", 1), "Oʻ");
  assert.equal(C.shift("Ng", 1), "A");
  assert.equal(C.shift("Ng", 3), "D");
  assert.equal(C.shift("A", -1), "Ng");
  assert.equal(C.shift("E", -3), "A");
  assert.equal(C.wrapKey(29), 0);
  assert.equal(C.wrapKey(-1), 28);
});

test("encrypt: XOʻP kalit 3 bilan", () => {
  assert.deepEqual(C.encrypt(C.tokenize("XOʻP"), 3), ["Oʻ", "Ch", "S"]);
});

test("encrypt va decrypt bir-birining teskarisi (hamma so'z, hamma kalit)", () => {
  for (const w of allWords()) {
    const t = C.tokenize(w);
    for (let k = 0; k < 29; k++) assert.deepEqual(C.decrypt(C.encrypt(t, k), k), t, `${w} ${k}`);
  }
});

test("checkLetters: noto'g'ri kataklar", () => {
  assert.deepEqual(C.checkLetters(["A", "Sh"], ["A", "Sh"]), []);
  assert.deepEqual(C.checkLetters(["A", "Sh", "O"], ["A", "S", "Ng"]), [1, 2]);
});

test("ro'yxatlar chegaralari", () => {
  for (const s of C.LETTERS) {
    const words = s.split(" ");
    assert.ok(words.length >= 3 && words.length <= 4, s);
    for (const w of words) assert.ok(C.tokenize(w).length <= 9, w);
  }
  for (const w of C.PRACTICE) assert.ok(C.tokenize(w).length >= 3 && C.tokenize(w).length <= 5, w);
  assert.equal(C.FIRST_REPLY, "XOʻP");
  for (const w of C.REPLIES) assert.ok(C.tokenize(w).length >= 3 && C.tokenize(w).length <= 7, w);
  for (const w of C.CRACK) assert.ok(C.tokenize(w).length >= 4 && C.tokenize(w).length <= 6, w);
  assert.equal(C.FIRST_KEY, 3);
});

test("banklar kengaygan: 15 / 10 / 10 ta so'z, takrorsiz", () => {
  assert.equal(C.PRACTICE.length, 15);
  assert.equal(C.REPLIES.length, 10);
  assert.equal(C.CRACK.length, 10);
  for (const list of [C.PRACTICE, C.REPLIES, C.CRACK]) assert.equal(new Set(list).size, list.length);
  assert.ok(!C.REPLIES.includes(C.FIRST_REPLY), "XOʻP alohida — birinchi javob");
});

test("kalitsiz ochish so'zlari: boshqa hech bir kalitda bankdagi so'z chiqmaydi", () => {
  const bank = new Set(allWords());
  for (const w of C.CRACK) {
    const t = C.tokenize(w);
    for (let k = 1; k < 29; k++) {
      const other = C.encrypt(t, k).join("").toUpperCase();
      assert.ok(!bank.has(other), `${w} kalit ${k} bilan «${other}» bo'lib qoldi`);
    }
  }
});

test("makeExercise: kalit 1–6 (3 emas), so'z ketma-ket takrorlanmaydi", () => {
  let prev = null;
  for (let k = 0; k < 1000; k++) {
    const ex = C.makeExercise(C.PRACTICE, prev);
    assert.ok(C.PRACTICE.includes(ex.word));
    assert.ok(ex.key >= 1 && ex.key <= 6 && ex.key !== 3, String(ex.key));
    assert.equal(ex.blind, false);
    if (prev) assert.notEqual(ex.word, prev.word);
    prev = ex;
  }
});

test("makeExercise: kalit zina bilan o'sadi — 1–6, 7–14, 15–28", () => {
  assert.deepEqual(C.KEY_RANGES, [[1, 6], [7, 14], [15, 28]]);
  for (const tier of [0, 1, 2]) {
    const [lo, hi] = C.KEY_RANGES[tier];
    const keys = new Set();
    let prev = null;
    for (let k = 0; k < 1500; k++) {
      const ex = C.makeExercise(C.REPLIES, prev, Math.random, tier);
      assert.ok(ex.key >= lo && ex.key <= hi, `tier ${tier}: kalit ${ex.key}`);
      assert.equal(ex.tier, tier);
      if (prev) assert.notEqual(ex.word, prev.word);
      keys.add(ex.key);
      prev = ex;
    }
    assert.equal(keys.size, tier === 0 ? 5 : hi - lo + 1, `tier ${tier}: hamma kalitlar chiqishi kerak`);
  }
  // Katta kalitda alifbo aylanadi: kalit 28 — bitta orqaga surish bilan bir xil
  assert.deepEqual(C.encrypt(["B"], 28), ["A"]);
});

test("makeExercise blind: pastki qator yashirin — kalit kichik (1, 2, 4; tier 2 da 5 ham)", () => {
  for (const tier of [0, 1, 2]) {
    const keys = new Set();
    let prev = null;
    for (let k = 0; k < 400; k++) {
      const ex = C.makeExercise(C.PRACTICE, prev, Math.random, tier, true);
      assert.equal(ex.blind, true);
      assert.ok(ex.key !== C.FIRST_KEY && ex.key <= 5, String(ex.key));
      if (prev) assert.notEqual(ex.word, prev.word);
      keys.add(ex.key);
      prev = ex;
    }
    assert.deepEqual([...keys].sort(), tier === 2 ? [1, 2, 4, 5] : [1, 2, 4]);
  }
});

test("makePlanned: avval zina o'sadi, `visible` tadan keyin pastki qator yashirinadi", () => {
  // 1-bosqich (visible = 2): kalit 1–6 → 7–14 → yashirin
  const plan = (correct, tier, visible) => C.makePlanned(C.PRACTICE, null, correct, tier, visible);
  for (let k = 0; k < 200; k++) {
    const a = plan(0, 0, 2);
    assert.ok(!a.blind && a.key <= 6);
    const b = plan(1, 0, 2);
    assert.ok(!b.blind && b.key >= 7 && b.key <= 14);
    const c = plan(2, 1, 2);
    assert.ok(c.blind && [1, 2, 4].includes(c.key));
    // 2-bosqich (visible = 3): uchinchi ko'rinadigan so'z — kalit 15–28
    const d = plan(2, 1, 3);
    assert.ok(!d.blind && d.key >= 15 && d.key <= 28);
    assert.ok(plan(3, 1, 3).blind);
    // Qiyin rejim (tier 2): ko'rinadigan so'zlar darhol eng katta kalitlar bilan
    const e = plan(0, 2, 2);
    assert.ok(!e.blind && e.key >= 15);
    assert.ok(plan(2, 2, 2).blind);
  }
});

test("makeCrack: kalit daraja bilan uzoqlashadi (4–9, 10–15, 16–21, 22–27), so'z takrorlanmaydi", () => {
  assert.deepEqual(C.CRACK_RANGES, [[4, 9], [10, 15], [16, 21], [22, 27]]);
  for (let level = 0; level < 4; level++) {
    const [lo, hi] = C.CRACK_RANGES[level];
    let prev = null;
    const keys = new Set();
    for (let k = 0; k < 600; k++) {
      const ex = C.makeCrack(prev, Math.random, level);
      assert.ok(C.CRACK.includes(ex.word));
      assert.ok(ex.key >= lo && ex.key <= hi, `daraja ${level}: ${ex.key}`);
      if (prev) assert.notEqual(ex.word, prev.word);
      keys.add(ex.key);
      prev = ex;
    }
    assert.equal(keys.size, 6);
  }
  const first = C.makeCrack(null);
  assert.ok(first.key >= 4 && first.key <= 9, "daraja berilmasa — eng oson");
  assert.ok(C.makeCrack(null, Math.random, 9).key >= 22, "daraja chegaradan oshmaydi");
});

test("crackLevel: oddiy rejimda 0, 1, 2, 3; qiyin rejimda darhol 2, 3", () => {
  assert.deepEqual([0, 1, 2, 3, 4].map((c) => C.crackLevel(c, c < 2 ? 0 : c < 4 ? 1 : 2)), [0, 1, 2, 3, 3]);
  assert.deepEqual([0, 1, 2, 3].map((c) => C.crackLevel(c, 2)), [2, 3, 2, 3]);
});

test("pickLetter va rng", () => {
  const first = () => 0;
  assert.equal(C.pickLetter(first), C.LETTERS[0]);
  for (let k = 0; k < 100; k++) assert.ok(C.LETTERS.includes(C.pickLetter()));
  for (let k = 0; k < 200; k++) assert.notEqual(C.pickLetter(null, C.LETTERS[1]), C.LETTERS[1]);
  assert.deepEqual(C.makeExercise(C.PRACTICE, null, first), { word: C.PRACTICE[0], key: 1, blind: false, tier: 0 });
});

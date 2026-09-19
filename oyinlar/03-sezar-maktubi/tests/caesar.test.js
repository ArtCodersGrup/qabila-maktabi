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
  for (const w of C.REPLIES) assert.ok(C.tokenize(w).length >= 3 && C.tokenize(w).length <= 6, w);
  for (const w of C.CRACK) assert.ok(C.tokenize(w).length >= 4 && C.tokenize(w).length <= 6, w);
  assert.equal(C.FIRST_KEY, 3);
});

test("makeExercise: kalit 1–6 (3 emas), so'z ketma-ket takrorlanmaydi", () => {
  let prev = null;
  for (let k = 0; k < 1000; k++) {
    const ex = C.makeExercise(C.PRACTICE, prev);
    assert.ok(C.PRACTICE.includes(ex.word));
    assert.ok(ex.key >= 1 && ex.key <= 6 && ex.key !== 3, String(ex.key));
    if (prev) assert.notEqual(ex.word, prev.word);
    prev = ex;
  }
});

test("makeCrack: kalit 4–9, so'z ketma-ket takrorlanmaydi", () => {
  let prev = null;
  for (let k = 0; k < 1000; k++) {
    const ex = C.makeCrack(prev);
    assert.ok(C.CRACK.includes(ex.word));
    assert.ok(ex.key >= 4 && ex.key <= 9);
    if (prev) assert.notEqual(ex.word, prev.word);
    prev = ex;
  }
});

test("pickLetter va rng", () => {
  const first = () => 0;
  assert.equal(C.pickLetter(first), C.LETTERS[0]);
  for (let k = 0; k < 100; k++) assert.ok(C.LETTERS.includes(C.pickLetter()));
  assert.deepEqual(C.makeExercise(C.PRACTICE, null, first), { word: C.PRACTICE[0], key: 1 });
});

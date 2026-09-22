// typing.js testlari. Ishga tushirish: node --test tests/*.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const T = require("../js/typing.js");

// Takrorlanadigan tasodif: har chaqiruvda ro'yxatdagi keyingi son
const seq = (...values) => { let k = 0; return () => values[k++ % values.length]; };

// Matnni oxirigacha to'g'ri yozish (har belgi oralig'i — step ms)
function typeAll(s, text, t0, step) {
  let t = t0;
  let last = null;
  for (const ch of text) { last = s.press(ch, t); t += step; }
  return last;
}

test("barmoqlar: har tugmani qaysi barmoq bosadi", () => {
  assert.equal(T.fingerOf("f"), "li");
  assert.equal(T.fingerOf("j"), "ri");
  assert.equal(T.fingerOf("a"), "lp");
  assert.equal(T.fingerOf(";"), "rp");
  assert.equal(T.fingerOf("ʻ"), "rp");
  assert.equal(T.fingerOf("'"), "rp");
  assert.equal(T.fingerOf(" "), "th");
  assert.equal(T.fingerOf("A"), "lp");
  assert.equal(T.fingerOf(","), "rm");
  assert.equal(T.fingerOf("."), "rr");
  assert.equal(T.fingerOf("g"), "li");
  assert.equal(T.fingerOf("h"), "ri");
  assert.equal(T.fingerOf("1"), null);
  // Har qatordagi har tugmaning barmog'i bor
  for (const row of Object.values(T.ROWS)) for (const key of row) assert.ok(T.FINGERS.includes(T.fingerOf(key)), key);
});

test("keyOf: ekran klaviaturasidagi tugma (ʻ — ' tugmasi, katta harf — kichigi)", () => {
  assert.equal(T.keyOf("ʻ"), "'");
  assert.equal(T.keyOf("’"), "'");
  assert.equal(T.keyOf("Q"), "q");
  assert.equal(T.keyOf(" "), " ");
  assert.equal(T.keyOf("7"), null);
});

test("shiftFor: katta harfda boshqa qo'lning Shift'i", () => {
  assert.equal(T.shiftFor("A"), "shift-r");
  assert.equal(T.shiftFor("S"), "shift-r");
  assert.equal(T.shiftFor("L"), "shift-l");
  assert.equal(T.shiftFor("Oʻ"[0]), "shift-l");
  assert.equal(T.shiftFor("a"), null);
  assert.equal(T.shiftFor(","), null);
  assert.equal(T.fingerOf("shift-l"), "lp");
  assert.equal(T.fingerOf("shift-r"), "rp");
});

test("ʻ uchun 5 xil belgi qabul qilinadi, harflar aniq", () => {
  for (const k of ["'", "`", "’", "ʻ", "ʼ"]) assert.ok(T.same("ʻ", k), k);
  assert.ok(!T.same("ʻ", "a"));
  assert.ok(T.same("a", "a"));
  assert.ok(!T.same("a", "A"));
  assert.ok(!T.same("A", "a"));
});

test("keyFrom: klaviatura hodisasidan belgi", () => {
  assert.equal(T.keyFrom({ key: "a", code: "KeyA" }), "a");
  assert.equal(T.keyFrom({ key: " ", code: "Space" }), " ");
  assert.equal(T.keyFrom({ key: "Dead", code: "Quote" }), "'"); // US-International klaviatura
  assert.equal(T.keyFrom({ key: "Dead", code: "Backquote" }), "`");
  assert.equal(T.keyFrom({ key: "Dead", code: "KeyE" }), null);
  for (const key of ["Shift", "Enter", "Backspace", "CapsLock", "Tab", "ArrowLeft"]) assert.equal(T.keyFrom({ key }), null, key);
});

test("ogohlantirishlar: rus tili va Caps Lock (xato hisoblanmaydi)", () => {
  assert.ok(T.isCyrillic("а"));
  assert.ok(T.isCyrillic("Ж"));
  assert.ok(!T.isCyrillic("a"));
  assert.equal(T.warning("a", "ф", false), "cyrillic");
  assert.equal(T.warning("a", "A", true), "caps");
  assert.equal(T.warning("A", "a", true), "caps");
  assert.equal(T.warning("a", "A", false), null);
  assert.equal(T.warning("a", "s", true), null);
  assert.equal(T.warning("a", "a", true), null);
});

test("sessiya: to'g'ri harf oldinga yuradi, xatoda kursor turadi", () => {
  const s = T.session("fj f");
  assert.equal(s.next(), "f");
  assert.equal(s.press("f", 100), "ok");
  assert.equal(s.press("x", 200), "wrong");
  assert.equal(s.pos, 1);
  assert.equal(s.next(), "j");
  assert.equal(s.press("j", 300), "ok");
  assert.equal(s.press(" ", 400), "ok");
  assert.equal(s.press("f", 500), "done");
  assert.equal(s.press("f", 600), "skip");
  assert.equal(s.strokes, 5);
  assert.deepEqual(s.times, [0, 200, 300, 400]);
  const st = T.stats(s);
  assert.equal(st.accuracy, 80); // 4 belgi, 5 bosish
  assert.equal(st.ms, 400);
  assert.equal(st.cpm, 600); // 4 × 60000 : 400
  assert.ok(!T.passed(st));
});

test("sessiya: boshlanish vaqti berilsa (poyga), vaqt o'shandan hisoblanadi", () => {
  const s = T.session("ab", 0);
  assert.equal(s.press("a", 500), "ok");
  assert.equal(s.press("b", 1000), "done");
  const st = T.stats(s);
  assert.equal(st.ms, 1000);
  assert.equal(st.cpm, 120);
  assert.equal(st.seconds, 1);
  assert.equal(st.accuracy, 100);
  assert.deepEqual(s.times, [500, 1000]);
});

test("sessiya: ʻ har xil yozilsa ham to'g'ri", () => {
  const s = T.session("oʻt");
  assert.equal(s.press("o", 0), "ok");
  assert.equal(s.press("'", 10), "ok");
  assert.equal(s.press("t", 20), "done");
  assert.equal(T.stats(s).accuracy, 100);
});

test("aniqlik pastga yaxlitlanadi: 89,6% — o'tmaydi, 90% — o'tadi", () => {
  const text = "a".repeat(43);
  const s = T.session(text);
  for (let k = 0; k < 5; k++) s.press("x", k);
  typeAll(s, text, 10, 100);
  assert.equal(s.strokes, 48);
  assert.equal(T.stats(s).accuracy, 89);
  assert.ok(!T.passed(T.stats(s)));

  const s2 = T.session("a".repeat(9));
  s2.press("x", 0);
  typeAll(s2, "a".repeat(9), 10, 100);
  assert.equal(T.stats(s2).accuracy, 90);
  assert.ok(T.passed(T.stats(s2)));
  assert.equal(T.PASS, 90);
});

test("o'rganilgan tugmalar: 1-bosqich — asosiy qator, 2 — yuqori, 3 — hammasi va Shift", () => {
  assert.equal(T.allowed(1).size, 12);
  assert.ok(T.allowed(1).has("'") && T.allowed(1).has(" ") && !T.allowed(1).has("q"));
  assert.equal(T.allowed(2).size, 22);
  assert.ok(T.allowed(2).has("q") && !T.allowed(2).has("z"));
  assert.ok(T.allowed(3).has("z") && T.allowed(3).has("shift-l") && T.allowed(3).has("."));
  assert.ok(T.fits("dala salla", 1));
  assert.ok(!T.fits("ota", 1));
  assert.ok(!T.fits("Dala", 2)); // katta harf — faqat 3-bosqichdan
  assert.ok(T.fits("Oʻqigan oʻzar.", 3));
  assert.ok(!T.fits("bir-ikki", 3)); // chiziqcha o'rganilmaydi
});

test("matnlar faqat o'rganilgan tugmalardan, takrorsiz", () => {
  const unique = (list) => new Set(list).size === list.length;
  assert.ok(T.HOME_WORDS.length >= 15 && unique(T.HOME_WORDS));
  assert.ok(T.TOP_WORDS.length >= 30 && unique(T.TOP_WORDS));
  assert.ok(T.PROVERBS.length >= 12 && unique(T.PROVERBS));
  for (const w of T.HOME_WORDS) assert.ok(T.fits(w, 1), w);
  for (const w of T.TOP_WORDS) {
    assert.ok(T.fits(w, 2), w);
    assert.ok(!T.fits(w, 1), `${w}: yuqori qator harfi yo'q`);
  }
  for (const p of T.PROVERBS) {
    assert.ok(T.fits(p, 3), p);
    assert.match(p, /^[A-Z][^]*\.$/, p);
    assert.ok(p.length <= 52, p);
    assert.ok(!/  /.test(p) && !/'/.test(p), p); // ʻ — to'g'ri belgi
  }
  for (const s of [1, 2, 3]) {
    assert.ok(T.DRILLS[s].length >= 5, `${s}-bosqich`);
    for (const d of T.DRILLS[s]) {
      assert.ok(T.fits(d.text, s), d.text);
      assert.ok(d.say && d.say.length <= 90, d.text);
    }
  }
  // O'zbekcha matnda ʻ faqat o va g dan keyin
  for (const w of [...T.HOME_WORDS, ...T.TOP_WORDS, ...T.PROVERBS]) assert.ok(!/[^OoGg]ʻ/.test(w), w);
});

test("makeLine: 4 ta har xil so'z yoki maqol, oldingisi takrorlanmaydi", () => {
  let prev = null;
  for (let k = 0; k < 200; k++) {
    for (const stage of [1, 2]) {
      const line = T.makeLine(stage, prev);
      const words = line.split(" ");
      assert.equal(words.length, 4);
      assert.equal(new Set(words).size, 4, line);
      assert.ok(T.fits(line, stage), line);
      assert.ok(line.length <= 34, line);
      assert.notEqual(line, prev);
      prev = line;
    }
    const p = T.makeLine(3, prev);
    assert.ok(T.PROVERBS.includes(p));
    assert.notEqual(p, prev);
    prev = p;
  }
  // Bir xil tasodif — bir xil qator; oldingisi bilan bir xil chiqsa, boshqasi tanlanadi
  const a = T.makeLine(3, null, seq(0));
  assert.equal(a, T.PROVERBS[0]);
  assert.equal(T.makeLine(3, a, seq(0, 0.5)), T.PROVERBS[Math.floor(0.5 * T.PROVERBS.length)]);
});

test("raceText: poyga matni tanlangan turdan", () => {
  for (let k = 0; k < 50; k++) {
    const home = T.raceText("home", null);
    assert.equal(home.split(" ").length, 5);
    assert.ok(T.fits(home, 1), home);
    const words = T.raceText("words", null);
    assert.equal(words.split(" ").length, 5);
    assert.ok(T.fits(words, 2), words);
    assert.ok(T.PROVERBS.includes(T.raceText("proverb", null)));
  }
  assert.deepEqual(T.RACE_LEVELS.map((l) => l.id), ["home", "words", "proverb"]);
});

test("raceResult: avval aniqlik 90%, keyin vaqt", () => {
  const st = (accuracy, ms) => ({ accuracy, ms });
  assert.deepEqual(T.raceResult(st(95, 9000), st(92, 8000)), { winner: "right", reason: "faster" });
  assert.deepEqual(T.raceResult(st(95, 7000), st(92, 8000)), { winner: "left", reason: "faster" });
  assert.deepEqual(T.raceResult(st(80, 5000), st(91, 9000)), { winner: "right", reason: "accuracy" });
  assert.deepEqual(T.raceResult(st(95, 9000), st(70, 4000)), { winner: "left", reason: "accuracy" });
  assert.deepEqual(T.raceResult(st(85, 5000), st(70, 4000)), { winner: null, reason: "low" });
  assert.deepEqual(T.raceResult(st(90, 6000), st(99, 6000)), { winner: null, reason: "draw" });
});

test("ghostAt: soya berilgan vaqtgacha nechta belgi yozgan", () => {
  const times = [300, 500, 900, 1200];
  assert.equal(T.ghostAt(times, 0), 0);
  assert.equal(T.ghostAt(times, 300), 1);
  assert.equal(T.ghostAt(times, 899), 2);
  assert.equal(T.ghostAt(times, 5000), 4);
});

// So'zni ochish/shifrlash (scenes/common.js → solveWord) testi: soxta DOM, haqiqiy caesar-ui.js va umumiy practice.js.
// Tekshiradi: ochiq jadval (ochish / shifrlash), yashirin pastki qator (bola harfni o'zi suradi),
// 1-xatoda maslahat javobni aytmasligi, 2-xatoda yechim, qiyin rejimda bitta urinish.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");
const caesar = require("../js/caesar.js");

function fakeNode(tag, props, children) {
  const classes = new Set(String((props && props.class) || "").split(" ").filter(Boolean));
  const node = {
    tag, children: [], textContent: (props && props.text) || "", offsetWidth: 0,
    click: props && props.onClick,
    classList: {
      add: (...c) => c.forEach((x) => classes.add(x)),
      remove: (...c) => c.forEach((x) => classes.delete(x)),
      toggle: (c, on) => ((on === undefined ? !classes.has(c) : on) ? classes.add(c) : classes.delete(c)),
      contains: (c) => classes.has(c),
    },
    append: (...c) => node.children.push(...c),
    setAttribute: () => {},
    scrollIntoView: () => {},
  };
  node.append(...children.filter(Boolean));
  return node;
}

function makeWindow() {
  const bubbles = [];
  const guide = fakeNode("div", null, []);
  const work = fakeNode("div", null, []);
  const ui = {
    h: (tag, props, ...children) => fakeNode(tag, props, children),
    settle: (executor) => new Promise((resolve) => executor(resolve)),
    openGuide: () => guide,
    work: () => work,
    setCompact: () => {}, clearWork: () => { work.children.length = 0; }, clearControl: () => {},
    pose: () => {}, toast: () => {},
    bubble: (who, text) => bubbles.push(text),
  };
  const win = { QK: { caesar, ui, sound: { play: () => {} } } };
  loadScript(path.join(__dirname, "../../umumiy/js/practice.js"), win);
  loadScript(path.join(__dirname, "../js/caesar-ui.js"), win);
  loadScript(path.join(__dirname, "../js/scenes/common.js"), win);
  const tbl = win.QK.caesarUi.table(0, null);
  const cells = guide.children[0].children; // 29 ta jadval katagi
  // Jadvaldagi harf ustunini bosish; pastki qator matni — cells[i].children[1].textContent
  const tap = (letter) => cells[caesar.ALPHABET.indexOf(letter)].click();
  const bottom = (letter) => cells[caesar.ALPHABET.indexOf(letter)].children[1].textContent;
  return { win, tbl, tap, bottom, bubbles };
}

const pause = (ms) => new Promise((r) => setTimeout(r, ms || 480));

test("ochiq jadval, ochish: bola oddiy harf ustunini bosadi — to'g'ri javob hisoblanadi", async () => {
  const { win, tbl, tap, bottom } = makeWindow();
  tbl.setKey(4);
  const plain = caesar.tokenize("QUSH");
  const result = win.QK.common.solveWord({ plain, key: 4, mode: "decode", tbl });
  assert.equal(bottom("A"), caesar.shift("A", 4), "pastki qator ko'rinib turishi kerak");
  plain.forEach(tap);
  assert.equal(await result, true);
  assert.equal(win.QK.practice.stats().mistakes, 0);
});

test("ochiq jadval, shifrlash: oddiy harf ustuni bosilsa, katakka shifr tushadi", async () => {
  const { win, tbl, tap } = makeWindow();
  tbl.setKey(9);
  const plain = caesar.tokenize("SALOM");
  const result = win.QK.common.solveWord({ plain, key: 9, mode: "encode", tbl });
  plain.forEach(tap);
  assert.equal(await result, true);
  assert.equal(win.QK.current.answer, caesar.encrypt(plain, 9).join(" "));
});

test("jadval kaliti noto'g'ri: 1-xato — kalit haqida maslahat, keyin to'g'rilab topsa hisoblanadi", async () => {
  const { win, tbl, tap, bubbles } = makeWindow();
  tbl.setKey(3); // kerakli kalit 5
  const plain = caesar.tokenize("TONG");
  const result = win.QK.common.solveWord({ plain, key: 5, mode: "encode", tbl });
  plain.forEach(tap);
  assert.ok(bubbles[bubbles.length - 1].includes("5 boʻlishi kerak"));
  await pause();
  tbl.setKey(5);
  plain.forEach(tap);
  assert.equal(await result, true);
  assert.equal(win.QK.practice.stats().mistakes, 1);
});

test("yashirin qator, ochish: pastki qator «?», bola javob harfining o'zini bosadi", async () => {
  const { win, tbl, tap, bottom } = makeWindow();
  const plain = caesar.tokenize("BOLA");
  const result = win.QK.common.solveWord({ plain, key: 2, mode: "decode", tbl, blind: true });
  assert.equal(tbl.isBlind(), true);
  assert.equal(bottom("A"), "?", "pastki qator yashirin bo'lishi kerak");
  assert.equal(tbl.getKey(), 2, "kalit oldindan qo'yiladi");
  plain.forEach(tap);
  assert.equal(await result, true);
});

test("yashirin qator, shifrlash: bola shifr harfini o'zi surib topadi va bosadi", async () => {
  const { win, tbl, tap } = makeWindow();
  const plain = caesar.tokenize("XAYR");
  const result = win.QK.common.solveWord({ plain, key: 4, mode: "encode", tbl, blind: true });
  // Oddiy harflarni bosish — xato (ular shifr emas): maslahat qatorni ochadi, javobni emas
  plain.forEach(tap);
  assert.equal(tbl.isBlind(), false, "1-xatodan keyin pastki qator ochiladi");
  await pause();
  // Endi jadval ochiq: oddiy harf ustuni bosilsa, shifr tushadi
  plain.forEach(tap);
  assert.equal(await result, true);
  assert.equal(win.QK.practice.stats().mistakes, 1);
  assert.equal(win.QK.practice.stats().solutions, 0);
});

test("yashirin qator: shifr harflarini to'g'ridan-to'g'ri bossa — birinchi urinishdayoq to'g'ri", async () => {
  const { win, tbl, tap } = makeWindow();
  const plain = caesar.tokenize("MAYLI");
  const result = win.QK.common.solveWord({ plain, key: 1, mode: "encode", tbl, blind: true });
  caesar.encrypt(plain, 1).forEach(tap);
  assert.equal(await result, true);
  assert.equal(win.QK.practice.stats().mistakes, 0);
});

test("ikki marta xato: yechim ko'rsatiladi, javob hisoblanmaydi", async () => {
  const { win, tbl, tap } = makeWindow();
  tbl.setKey(1);
  const plain = caesar.tokenize("ANOR");
  const result = win.QK.common.solveWord({ plain, key: 1, mode: "decode", tbl });
  ["B", "B", "B", "B"].forEach(tap);
  await pause();
  ["B", "B", "B", "B"].forEach(tap); // maslahatdan keyin belgilangan kataklar yana xato to'ldirildi
  assert.equal(await result, false);
  assert.equal(win.QK.practice.stats().solutions, 1);
});

test("qiyin rejim: bitta urinish — birinchi xatodayoq yechim", async () => {
  const { win, tbl, tap } = makeWindow();
  win.QK.practice.setStage(1, true);
  const plain = caesar.tokenize("TOSH");
  const result = win.QK.common.solveWord({ plain, key: 2, mode: "decode", tbl, blind: true });
  ["A", "A", "A"].forEach(tap);
  assert.equal(await result, false);
  assert.equal(tbl.isBlind(), false);
});

// Ikki qadamli savol (scenes/common.js → twoStep) testi: soxta ekran bilan, haqiqiy umumiy/js/practice.js ustida.
// Qoida (QOIDALAR 4.3): 2 variantli savol yolg'iz kelmaydi — ikkala qadam ham to'g'ri bo'lsagina javob hisoblanadi.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("../../umumiy/tests/helpers.js");

function makeWindow() {
  const log = [];
  const ui = {
    settle: (executor) => new Promise((resolve) => executor(resolve)),
    clearControl: () => log.push("clear"),
    pose: () => {},
    toast: () => {},
  };
  const win = { QK: { ui, sound: { play: () => {} }, learn: {}, learnUi: {} } };
  loadScript(path.join(__dirname, "../../umumiy/js/practice.js"), win);
  loadScript(path.join(__dirname, "../js/scenes/common.js"), win);
  return { win, log };
}

const pause = () => new Promise((r) => setTimeout(r, 420)); // practice.tries ikki tez bosishni bitta deb oladi

// Vazifa: 1-qadam javobi 3, 2-qadam javobi true
function run(win, events) {
  const picks = {};
  const result = win.QK.common.twoStep({
    first: { setup: (submit) => { picks.first = submit; }, check: (v) => v === 3 },
    second: { setup: (submit, firstValue) => { picks.second = submit; events.push(`second:${firstValue}`); }, check: (v) => v === true },
    hint: (step) => events.push(`hint:${step}`),
    solution: (step) => events.push(`solution:${step}`),
  });
  return { picks, result };
}

test("twoStep: ikkala qadam to'g'ri — javob hisoblanadi", async () => {
  const { win } = makeWindow();
  const events = [];
  const { picks, result } = run(win, events);
  picks.first(3);
  assert.deepEqual(events, ["second:3"], "1-qadam to'g'ri bo'lsa 2-qadam ochiladi");
  picks.second(true);
  assert.equal(await result, true);
  assert.equal(win.QK.practice.stats().mistakes, 0);
});

test("twoStep: 1-qadam xato — maslahat, 2-qadam ochilmaydi; keyin ikkalasi to'g'ri — hisoblanadi", async () => {
  const { win } = makeWindow();
  const events = [];
  const { picks, result } = run(win, events);
  picks.first(1);
  assert.deepEqual(events, ["hint:1"]);
  assert.equal(picks.second, undefined, "1-qadam xato bo'lsa 2-qadam ochilmasligi kerak");
  await pause();
  picks.first(3);
  picks.second(true);
  assert.equal(await result, true);
  assert.equal(win.QK.practice.stats().mistakes, 1);
});

test("twoStep: 1-qadam to'g'ri, 2-qadam ikki marta xato — yechim, javob hisoblanmaydi", async () => {
  const { win } = makeWindow();
  const events = [];
  const { picks, result } = run(win, events);
  picks.first(3);
  picks.second(false);
  await pause();
  picks.second(false);
  assert.equal(await result, false);
  assert.deepEqual(events, ["second:3", "hint:2", "solution:2"]);
  assert.equal(win.QK.practice.stats().solutions, 1);
});

test("twoStep: 1-qadamda bir xato + 2-qadamda bir xato — taxmin bilan o'tib bo'lmaydi", async () => {
  const { win } = makeWindow();
  const events = [];
  const { picks, result } = run(win, events);
  picks.first(0);
  await pause();
  picks.first(3);
  picks.second(false);
  assert.equal(await result, false);
  assert.deepEqual(events, ["hint:1", "second:3", "solution:2"]);
});

test("twoStep: qiyin rejimda bitta urinish — birinchi xatodayoq yechim", async () => {
  const { win } = makeWindow();
  win.QK.practice.setStage(3, true);
  const events = [];
  const { picks, result } = run(win, events);
  picks.first(2);
  assert.equal(await result, false);
  assert.deepEqual(events, ["solution:1"]);
});

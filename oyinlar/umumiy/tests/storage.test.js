const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("./helpers.js");

const FILE = path.join(__dirname, "../js/storage.js");
const KEY = "sinov-oyin:v1";
const defaults = (n) => ({ done: Array(n).fill(false), muted: false });

function fakeLocalStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
  };
}

const storageFor = (localStorage) => loadScript(FILE, { localStorage }).QK.storage;

test("bo'sh xotira — standart holat", () => {
  assert.deepEqual(storageFor(fakeLocalStorage()).create(KEY, 3).load(), defaults(3));
});

test("saqlash va qayta o'qish", () => {
  const s = storageFor(fakeLocalStorage()).create(KEY, 3);
  s.save({ done: [true, false, false], muted: true });
  assert.deepEqual(s.load(), { done: [true, false, false], muted: true });
});

test("bosqichlar soni o'yinga qarab", () => {
  const s = storageFor(fakeLocalStorage()).create(KEY, 4);
  assert.deepEqual(s.load(), defaults(4));
  s.save({ done: [true, true, false, false], muted: false });
  assert.deepEqual(s.load(), { done: [true, true, false, false], muted: false });
});

test("har bir o'yin o'z kalitida saqlaydi", () => {
  const st = storageFor(fakeLocalStorage());
  const a = st.create("oyin-a:v1", 3);
  const b = st.create("oyin-b:v1", 3);
  a.save({ done: [true, true, true], muted: true });
  assert.deepEqual(b.load(), defaults(3));
  assert.deepEqual(a.load(), { done: [true, true, true], muted: true });
});

test("localStorage xato tashlasa — standart holat, o'yin to'xtamaydi", () => {
  const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  const s = storageFor(broken).create(KEY, 3);
  assert.doesNotThrow(() => s.save({ done: [true, true, true], muted: false }));
  assert.deepEqual(s.load(), defaults(3));
});

test("localStorage umuman yo'q — standart holat", () => {
  const s = loadScript(FILE, {}).QK.storage.create(KEY, 3);
  assert.deepEqual(s.load(), defaults(3));
  assert.doesNotThrow(() => s.save(defaults(3)));
});

test("buzilgan yoki eski ma'lumot — standart holat", () => {
  const ls = fakeLocalStorage();
  const s = storageFor(ls).create(KEY, 3);
  ls.setItem(KEY, "{buzuq");
  assert.deepEqual(s.load(), defaults(3));
  ls.setItem(KEY, JSON.stringify({ done: [true], muted: 1 }));
  assert.deepEqual(s.load(), defaults(3));
  ls.setItem(KEY, JSON.stringify({ done: [true, true, true, true], muted: false }));
  assert.deepEqual(s.load(), defaults(3));
});

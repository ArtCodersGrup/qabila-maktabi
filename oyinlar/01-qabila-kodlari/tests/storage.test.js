const test = require("node:test");
const assert = require("node:assert/strict");
const { loadScript } = require("./helpers.js");

const KEY = "qabila-kodlari:v1";
const DEFAULTS = { done: [false, false, false], muted: false };

function fakeLocalStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
  };
}

const storageWith = (localStorage) => loadScript("js/storage.js", { localStorage }).QK.storage;

test("bo'sh xotira — standart holat", () => {
  assert.deepEqual(storageWith(fakeLocalStorage()).load(), DEFAULTS);
});

test("saqlash va qayta o'qish", () => {
  const s = storageWith(fakeLocalStorage());
  s.save({ done: [true, false, false], muted: true });
  assert.deepEqual(s.load(), { done: [true, false, false], muted: true });
});

test("localStorage xato tashlasa — standart holat, o'yin to'xtamaydi", () => {
  const broken = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  const s = storageWith(broken);
  assert.doesNotThrow(() => s.save({ done: [true, true, true], muted: false }));
  assert.deepEqual(s.load(), DEFAULTS);
});

test("localStorage umuman yo'q — standart holat", () => {
  const s = loadScript("js/storage.js", {}).QK.storage;
  assert.deepEqual(s.load(), DEFAULTS);
  assert.doesNotThrow(() => s.save(DEFAULTS));
});

test("buzilgan yoki eski ma'lumot — standart holat", () => {
  const ls = fakeLocalStorage();
  const s = storageWith(ls);
  ls.setItem(KEY, "{buzuq");
  assert.deepEqual(s.load(), DEFAULTS);
  ls.setItem(KEY, JSON.stringify({ done: [true], muted: 1 }));
  assert.deepEqual(s.load(), DEFAULTS);
});

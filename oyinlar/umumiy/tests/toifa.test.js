// Toifa tanlovi: saqlash, o'qish va <html data-toifa> ga qo'yish.
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { loadScript } = require("./helpers.js");

// Soxta brauzer: localStorage, <html> atributlari va theme-color meta
function yasa({ ls = {}, attrs = {}, yopiq = false, search = "" } = {}) {
  const meta = { content: "#FFF6E5", setAttribute(k, v) { this[k] = v; } };
  const el = {
    hasAttribute: (k) => k in attrs,
    getAttribute: (k) => (k in attrs ? attrs[k] : null),
    setAttribute: (k, v) => { attrs[k] = v; },
    removeAttribute: (k) => { delete attrs[k]; },
  };
  const store = {
    getItem: (k) => (k in ls ? ls[k] : null),
    setItem: (k, v) => { ls[k] = String(v); },
    removeItem: (k) => { delete ls[k]; },
  };
  const win = { document: { documentElement: el, querySelector: () => meta }, location: { search } };
  Object.defineProperty(win, "localStorage", { get() { if (yopiq) throw new Error("yopiq"); return store; } });
  loadScript(path.join(__dirname, "../js/toifa.js"), win);
  return { T: win.QK.toifa, ls, attrs, meta };
}

test("oqi: faqat ma'lum id; yoz → oqi; eski kalit o'chadi", () => {
  const { T, ls } = yasa({ ls: { "qabila:toifa:v1": "katta", "qabila:toifa:v2": "nimadir" } });
  assert.equal(T.KALIT, "qabila:toifa:v2");
  assert.deepEqual(T.IDS, ["boshlangich", "orta", "yuqori", "hammasi"]);
  assert.equal(T.oqi(), null);
  T.yoz("orta");
  assert.equal(T.oqi(), "orta");
  assert.ok(!("qabila:toifa:v1" in ls));
  T.yoz("");
  assert.equal(T.oqi(), null);
});

test("yuklanganda tanlov <html> ga qo'yiladi; kattalarda theme-color almashadi", () => {
  const a = yasa({ ls: { "qabila:toifa:v2": "yuqori" } });
  assert.equal(a.attrs["data-toifa"], "yuqori");
  assert.equal(a.meta.content, "#FBFAF7");
  const b = yasa({ ls: { "qabila:toifa:v2": "boshlangich" } });
  assert.equal(b.attrs["data-toifa"], "boshlangich");
  assert.equal(b.meta.content, "#FFF6E5");
});

test("hammasi va tanlov yo'q — atribut qo'yilmaydi (bolalar ko'rinishi)", () => {
  assert.ok(!("data-toifa" in yasa().attrs));
  const h = yasa({ ls: { "qabila:toifa:v2": "hammasi" } });
  assert.ok(!("data-toifa" in h.attrs));
  h.T.yoz("orta"); h.T.qolla();
  assert.equal(h.attrs["data-toifa"], "orta");
  h.T.yoz("hammasi"); h.T.qolla();
  assert.ok(!("data-toifa" in h.attrs));
  assert.equal(h.meta.content, "#FFF6E5");
});

test("faylda yozilgan data-toifa (o'yin sahifasi) o'zgarmaydi", () => {
  const { T, attrs, meta } = yasa({ ls: { "qabila:toifa:v2": "yuqori" }, attrs: { "data-toifa": "boshlangich" } });
  T.qolla();
  assert.equal(attrs["data-toifa"], "boshlangich");
  assert.equal(meta.content, "#FFF6E5");
});

test("xotira yopiq bo'lsa xato tashlamaydi", () => {
  const { T, attrs } = yasa({ yopiq: true });
  assert.equal(T.oqi(), null);
  T.yoz("orta");
  T.qolla();
  assert.ok(!("data-toifa" in attrs));
});

// ui.js: kattalar ko'rinishi sharti asos.css dagi selektor bilan bir xil
test("ui.kattalar: orta/yuqori va data-maskot yo'q", () => {
  const win = { QK: {} };
  loadScript(path.join(__dirname, "../js/ui.js"), win);
  const el = (attrs) => ({ getAttribute: (k) => (k in attrs ? attrs[k] : null), hasAttribute: (k) => k in attrs });
  assert.equal(win.QK.ui.kattalar(el({})), false);
  assert.equal(win.QK.ui.kattalar(el({ "data-toifa": "boshlangich" })), false);
  assert.equal(win.QK.ui.kattalar(el({ "data-toifa": "orta" })), true);
  assert.equal(win.QK.ui.kattalar(el({ "data-toifa": "yuqori" })), true);
  assert.equal(win.QK.ui.kattalar(el({ "data-toifa": "orta", "data-maskot": "" })), false);
});

// 5–8 ko'rinishi sinovi: URL — faqat shu sahifa, tanlov — localStorage
test("korinish: URL parametri ustun, saqlangan tanlov, asl va noto'g'ri qiymat", () => {
  const a = yasa({ search: "?korinish=doska", ls: { "qabila:korinish:v1": "daftar" } });
  assert.equal(a.attrs["data-korinish"], "doska");
  assert.equal(a.ls["qabila:korinish:v1"], "daftar", "URL tanlovni o'zgartirmaydi");
  const b = yasa({ ls: { "qabila:korinish:v1": "sxema" } });
  assert.equal(b.attrs["data-korinish"], "sxema");
  const c = yasa({ search: "?korinish=asl", ls: { "qabila:korinish:v1": "sxema" } });
  assert.ok(!("data-korinish" in c.attrs));
  const d = yasa({ search: "?korinish=yashil" });
  assert.ok(!("data-korinish" in d.attrs));
  d.T.korinishYoz("daftar"); d.T.qolla();
  assert.equal(d.attrs["data-korinish"], "daftar");
  d.T.korinishYoz("asl"); d.T.qolla();
  assert.ok(!("data-korinish" in d.attrs));
});

test("korinish: o'yin sahifasida (data-toifa yozilgan) ham qo'yiladi", () => {
  const { attrs } = yasa({ attrs: { "data-toifa": "orta" }, ls: { "qabila:korinish:v1": "daftar" } });
  assert.equal(attrs["data-korinish"], "daftar");
  assert.equal(attrs["data-toifa"], "orta");
});

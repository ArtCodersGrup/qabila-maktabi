// umumiy/js/python/tokenizer.js testlari: otstup, satrlar, sonlar va izohlar.
const test = require("node:test");
const assert = require("node:assert/strict");
const T = require("../js/python/tokenizer.js");

const kinds = (src) => T.tokenize(src).map((t) => t.type).join(" ");
const values = (src) => T.tokenize(src).filter((t) => t.type === "num" || t.type === "str").map((t) => t.value);
const boom = (src) => { try { T.tokenize(src); return null; } catch (e) { return e; } };

test("oddiy satr: tokenlar va oxirida newline, eof", () => {
  assert.equal(kinds('print("salom")'), "name op str op newline eof");
});

test("otstup indent va dedent beradi", () => {
  assert.equal(kinds("if x:\n    y = 1\nz = 2"),
    "kw name op newline indent name op num newline dedent name op num newline eof");
});

test("bo'sh satr va izoh e'tiborga olinmaydi", () => {
  assert.equal(kinds("# izoh\n\nx = 1  # yana izoh"), "name op num newline eof");
});

test("qavs ichida satr ko'chishi mumkin", () => {
  assert.equal(kinds("a = [1,\n     2]"), "name op op num op num op newline eof");
});

test("sonlar: butun, kasr, daraja va tagchiziq", () => {
  assert.deepEqual(values("x = 12\ny = 3.5\nz = 2e3\nw = 1_000"), [12n, 3.5, 2000, 1000n]);
});

test("matn: qo'shtirnoqning ikki xili va qochish belgilari", () => {
  assert.deepEqual(values("a = 'bir'\nb = \"ikki\"\nc = 'u\\'ni'\nd = \"yangi\\nsatr\""),
    ["bir", "ikki", "u'ni", "yangi\nsatr"]);
});

test("satr raqami va ustuni saqlanadi", () => {
  const tokens = T.tokenize("x = 1\nprint(x)");
  const print = tokens.find((t) => t.value === "print");
  assert.equal(print.line, 2);
  assert.equal(print.col, 1);
});

test("otstupda Tab — tushunarli xato", () => {
  const e = boom("if x:\n\tprint(1)");
  assert.equal(e.pyType, "IndentationError");
  assert.equal(e.line, 2);
  assert.ok(e.hint.includes("4 boʻshliq"));
});

test("tekislanmagan otstup tutiladi", () => {
  const e = boom("if x:\n    y = 1\n  z = 2");
  assert.equal(e.pyType, "IndentationError");
  assert.equal(e.line, 3);
});

test("yopilmagan qo'shtirnoq va qavs", () => {
  assert.equal(boom('print("salom)').pyMessage, "unterminated string literal (detected at line 1)");
  assert.equal(boom('print("salom"').pyType, "SyntaxError");
});

test("0 bilan boshlanadigan son — Pythonda ham xato", () => {
  const e = boom("x = 07");
  assert.equal(e.pyType, "SyntaxError");
  assert.ok(e.hint.includes("07"));
});

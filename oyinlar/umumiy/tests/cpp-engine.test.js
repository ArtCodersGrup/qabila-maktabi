// Kichik C++ dvigatelining testlari (kompilyatorsiz, tez).
// Haqiqiy g++ bilan solishtirish — cpp-engine-parity.test.js da.
// Ishga tushirish: node --test oyinlar/umumiy/tests/cpp-engine.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../js/cpp/cpp-run.js");
const V = require("../js/cpp/values.js");
const { CORPUS, d, da } = require("./cpp-corpus.js");

const ishga = (kod, kirish) => C.run(kod, { stdin: kirish || [] });
const xato = (tana, kirish) => ishga(d(tana), kirish).error;

test("korpus: har dastur kutilgan javobni beradi", () => {
  for (const t of CORPUS) {
    const r = ishga(t.kod, t.kirish);
    assert.equal(r.error, null, t.id + ": " + JSON.stringify(r.error));
    assert.deepEqual(r.output, t.kutilgan, t.id);
  }
  assert.ok(CORPUS.length >= 40, "korpus kichik: " + CORPUS.length);
});

// ---------- C++ ning tuzoqlari: aynan shu to'rttasi dvigatelda ham rost bo'lishi kerak ----------
test("butun bo'lish kasr qismini tashlaydi", () => {
  assert.deepEqual(ishga(d('cout << 9 / 4 << " " << -9 / 4 << " " << 9 / 4.0 << "\\n";')).output, ["2 -2 2.25"]);
});

test("qoldiqning ishorasi bo'linuvchiniki", () => {
  assert.deepEqual(ishga(d('cout << -9 % 4 << " " << 9 % -4 << "\\n";')).output, ["-1 1"]);
});

test("int 32 bitda toshib ketadi, long long 64 bitda", () => {
  assert.deepEqual(ishga(d('int a = 2147483647;\ncout << a + 1 << "\\n";')).output, ["-2147483648"]);
  assert.deepEqual(ishga(d('long long a = 9223372036854775807;\ncout << a + 1 << "\\n";')).output, ["-9223372036854775808"]);
});

test("int ga kasr qiymat berilsa, kasr qismi tashlanadi", () => {
  assert.deepEqual(ishga(d('int a = 2.9;\ncout << a << "\\n";')).output, ["2"]);
  assert.deepEqual(ishga(d('int a = -2.9;\ncout << a << "\\n";')).output, ["-2"]);
});

// ---------- Xatolar ----------
test("e'lon qilinmagan nom — kompilyatsiya xatosi", () => {
  const e = xato("cout << x << \"\\n\";");
  assert.equal(e.kind, "compile");
  assert.match(e.cppMessage, /undeclared identifier 'x'/);
  assert.match(e.hint, /eʼlon qilinmagan/);
});

test("nuqtali vergul yo'q — kompilyatsiya xatosi va satr raqami", () => {
  const e = xato('cout << 1 << "\\n"\ncout << 2 << "\\n";');
  assert.equal(e.kind, "compile");
  assert.match(e.cppMessage, /expected ';'/);
  assert.ok(e.line >= 5, "satr raqami: " + e.line);
});

test("bitta nom ikki marta e'lon qilinmaydi", () => {
  const e = xato("int a = 1;\nint a = 2;");
  assert.equal(e.kind, "compile");
  assert.match(e.cppMessage, /redefinition/);
});

test("nolga bo'lish — ishlash vaqtidagi xato", () => {
  const e = xato("int a = 5, b = 0;\ncout << a / b;");
  assert.equal(e.kind, "runtime");
  assert.match(e.hint, /nol/);
});

// Qiymat berilmagan o'zgaruvchi: haqiqiy C++ da tasodifiy son chiqadi — taqlid qilmaymiz
test("qiymat berilmagan o'zgaruvchi o'qilsa, ochiq aytiladi", () => {
  const e = xato('int a;\ncout << a << "\\n";');
  assert.equal(e.kind, "runtime");
  assert.match(e.hint, /tasodifiy son/);
  // string esa C++ da ham bo'sh bo'lib boshlanadi
  assert.deepEqual(ishga(d('string s;\ncout << "[" << s << "]\\n";')).output, ["[]"]);
});

// Massiv chegarasidan chiqish — C++ da aniqlanmagan xatti-harakat
test("massiv chegarasidan chiqish taqlid qilinmaydi, to'xtatiladi", () => {
  const e = xato("int a[3];\na[0] = 1;\na[3] = 7;");
  assert.equal(e.kind, "runtime");
  assert.match(e.cppMessage, /out of bounds/);
  assert.match(e.hint, /javob buzuq chiqadi/);
});

test("to'xtamaydigan sikl qadam chegarasida to'xtaydi", () => {
  const r = C.run(d("int i = 0;\nwhile (i < 10) cout << i;"), { maxSteps: 500 });
  assert.equal(r.error.kind, "runtime");
  assert.match(r.error.hint, /sikl toʻxtamayotgan/);
});

test("kirish tugasa, tushunarli xabar", () => {
  const e = xato("int a, b;\ncin >> a >> b;", ["5"]);
  assert.equal(e.kind, "runtime");
  assert.match(e.hint, /maʼlumot tugadi/);
});

test("son kutilgan joyda matn kelsa — xabar aniq", () => {
  const e = xato("int a;\ncin >> a;", ["salom"]);
  assert.match(e.cppMessage, /invalid input/);
});

// ---------- Yadroda yo'q imkoniyatlar: yolg'on natija o'rniga ochiq xabar ----------
test("vector, map, struct va ko'rsatkich — 'bu yerda hali yo'q'", () => {
  for (const [tana, nima] of [
    ["vector<int> v;", "vector"],
    ["map<int, int> m;", "map"],
    ["struct Nuqta { int x; };", "struct"],
    ["int x = 5;\nint* p = &x;", "koʻrsatkich"],
  ]) {
    const e = xato(tana);
    assert.equal(e.kind, "yoq", nima + ": " + JSON.stringify(e));
    assert.match(e.hint, /hali ishlamaydi/);
  }
  // main dan tashqari funksiya
  const e = C.check("#include <iostream>\nusing namespace std;\nint qosh(int a, int b) { return a + b; }\nint main() { return 0; }");
  assert.equal(e.kind, "yoq");
});

// ---------- check / trace ----------
test("check: to'g'ri kodda null, buzuq kodda xato", () => {
  assert.equal(C.check(d('cout << 1 << "\\n";')), null);
  assert.equal(C.check(d("cout << 1")).kind, "compile");
});

test("trace: har qadamda satr va o'zgaruvchilar ko'rinadi", () => {
  const r = C.trace(d("int s = 0;\nfor (int i = 1; i <= 3; i++) s += i;\ncout << s;"));
  assert.equal(r.error, null);
  assert.deepEqual(r.output, ["6"]);
  assert.ok(r.states.length > 5, "qadamlar kam: " + r.states.length);
  assert.ok(r.states.every((s) => typeof s.line === "number" && s.line > 0));
  assert.equal(r.vars.s, "6");
  // massiv ham ko'rinadi
  const r2 = C.trace(d("int a[3];\na[0] = 5;\na[1] = 7;"));
  assert.equal(r2.vars.a, "[5, 7, ?]");
});

// ---------- Qiymatlar ----------
test("double chiqishi C++ ning %g qoidasiga mos", () => {
  const juft = [[0, "0"], [5, "5"], [2.5, "2.5"], [1 / 3, "0.333333"], [100 / 3, "33.3333"],
    [1234567, "1.23457e+06"], [0.0001, "0.0001"], [0.00001, "1e-05"], [-2.5, "-2.5"], [1e20, "1e+20"]];
  for (const [x, kutilgan] of juft) assert.equal(V.yozDouble(x), kutilgan, String(x));
});

test("bool va char chiqishi", () => {
  assert.equal(V.yoz(V.bool(true)), "1");
  assert.equal(V.yoz(V.belgi("A")), "A");
  assert.deepEqual(ishga(d("char c = 'z';\nc = c - 32;\ncout << c;")).output, ["Z"]);
});

// ---------- Tokenizer ----------
test("izohlar, qo'shtirnoq ichidagi belgilar va qavslar", () => {
  const r = ishga(d('// bu izoh\n/* ko\'p\n   qatorli */\ncout << "a\\tb" << "\\n";\ncout << (2 + 3) * 2 << "\\n";'));
  assert.equal(r.error, null, JSON.stringify(r.error));
  assert.deepEqual(r.output, ["a\tb", "10"]);
});

test("yopilmagan qo'shtirnoq — tushunarli xato", () => {
  const e = xato('cout << "salom;');
  assert.equal(e.kind, "compile");
  assert.match(e.cppMessage, /missing terminating/);
});

// Yadroga qo'shilgan tayyor funksiyalar: olimpiada masalalari uchun shular yetadi
test("sort, swap, max, min, abs — massiv bilan ishlaydi", () => {
  // sort — <algorithm> dan: da() shu kutubxonani ham ulaydi (usiz — kompilyatsiya xatosi, cpp-xatolar.test.js)
  assert.deepEqual(ishga(da('int a[5] = {7, 2, 9, 1, 5};\nsort(a, a + 5);\nfor (int i = 0; i < 5; i++) cout << a[i];')).output, ["12579"]);
  assert.deepEqual(ishga(da('int a[4] = {4, 3, 2, 1};\nsort(a, a + 2);\nfor (int i = 0; i < 4; i++) cout << a[i];')).output, ["3421"]);
  assert.deepEqual(ishga(d('cout << max(3, 8) << min(3, 8) << abs(-5);')).output, ["835"]);
  assert.deepEqual(ishga(d('int x = 1, y = 2;\nswap(x, y);\ncout << x << y;')).output, ["21"]);
  // C++ da max(double, int) kompilyatsiya bo'lmaydi — biz ham shunday qilamiz
  const e = xato("cout << max(2.5, 2);");
  assert.match(e.cppMessage, /no matching function for call to 'max'/);
  assert.match(e.hint, /bir xil turda/);
  // sort faqat massiv uchun
  assert.equal(ishga(da("int x = 5;\nsort(x, x + 1);")).error.kind, "yoq");
});

test("while (cin >> x): kirish tugaguncha o'qiydi", () => {
  const kod = d('int x;\nint s = 0, n = 0;\nwhile (cin >> x) {\n    s += x;\n    n++;\n}\ncout << n << " " << s;');
  assert.deepEqual(ishga(kod, ["4 5 6"]).output, ["3 15"]);
  assert.deepEqual(ishga(kod, []).output, ["0 0"]);
  // Son kutilganda matn kelsa ham sikl tugaydi (C++ da oqim "yiqiladi")
  assert.deepEqual(ishga(kod, ["4 5 salom 6"]).output, ["2 9"]);
});

test("massivni ro'yxat bilan e'lon qilish", () => {
  assert.deepEqual(ishga(d('int a[5] = {3, 1, 4};\nfor (int i = 0; i < 5; i++) cout << a[i] << " ";')).output, ["3 1 4 0 0 "]);
  assert.deepEqual(ishga(d('int b[] = {7, 8};\ncout << b[0] + b[1];')).output, ["15"]);
  assert.match(xato("int a[2] = {1, 2, 3};").cppMessage, /excess elements/);
});

// Kichik C++ dvigateli: "yolg'on natija yo'q" qoidasining testlari (kod ko'rigi topilmalari).
// g++ xato beradigan kod bizda ham ishlamasligi, g++ beradigan natija bizda ham bir xil
// bo'lishi kerak. To'g'ri dasturlar cpp-corpus.js ga ham qo'shilgan — ular haqiqiy g++ bilan
// cpp-engine-parity.test.js da solishtiriladi; xato matnlari — shu faylning oxirida (GPP_XATOLAR).
// Ishga tushirish: node --test oyinlar/umumiy/tests/cpp-xatolar.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../js/cpp/cpp-run.js");
const { d } = require("./cpp-corpus.js");
const G = require("./gpp.js");

const ishga = (kod, kirish) => C.run(kod, { stdin: kirish || [] });
const chiqish = (tana, kirish) => {
  const r = ishga(d(tana), kirish);
  assert.equal(r.error, null, tana + " → " + JSON.stringify(r.error));
  return r.output;
};
const xato = (tana, kirish) => {
  const r = ishga(d(tana), kirish);
  assert.ok(r.error, "xato kutilgan edi: " + tana + " → " + JSON.stringify(r.output));
  return r.error;
};

// ---------- M5: s[i] — satrning hozirgi belgisi ----------
test("M5: ++s[0] va (s[0] = 'x') bitta belgini beradi, satr esa yangilanadi", () => {
  assert.deepEqual(chiqish('string s = "a";\ncout << ++s[0] << s;'), ["bb"]);
  assert.deepEqual(chiqish('string s = "abc";\ncout << (s[0] = \'x\');'), ["x"]);
  assert.deepEqual(chiqish('string s = "abc";\ncout << s[1]++ << s[1] << s;'), ["bcacc"]);
  assert.deepEqual(chiqish('string s = "az";\ns[1] -= 1;\ncout << s << (s[0] += 2);'), ["ayc"]);
});

// ---------- M6: inf / nan ----------
test("M6: inf va nan butunga aylantirilmaydi — 'saytning xatosi' emas, aniq xabar", () => {
  for (const tana of [
    "double d = 0;\nint x = d / d;",
    "double d = 0;\nint x = 1 / d;",
    "double d = 0;\nlong long x = -1 / d;",
    "double d = 0;\nint a[3] = {1, 2, 3};\nint i = 0;\ni = 5 / d;",
    "double d = 0;\ncout << (int)(d / d);",
  ]) {
    const e = xato(tana);
    assert.equal(e.kind, "runtime", tana + ": " + JSON.stringify(e));
    assert.match(e.cppMessage, /cannot convert (-?inf|nan) to/);
    assert.match(e.hint, /buzuq son/);
    assert.ok(e.line >= 6, "satr raqami bo'lishi kerak: " + e.line);
  }
  // Turga sig'maydigan kasr son ham xuddi shunday (C++ da aniqlanmagan xatti-harakat)
  assert.match(xato("double d = 5000000000.0;\nint x = d;").cppMessage, /cannot convert 5e\+09 to 'int'/);
  assert.deepEqual(chiqish("double d = 5000000000.0;\nlong long x = d;\ncout << x;"), ["5000000000"]);
  // inf va nan ning o'zi chiqariladi — bu C++ da ham ishlaydi
  assert.deepEqual(chiqish('double d = 0;\ncout << 1 / d << " " << -1 / d;'), ["inf -inf"]);
});

// ---------- O3: string massivi ----------
test("O3: string s[3] elementlari bo'sh satr bilan boshlanadi", () => {
  assert.deepEqual(chiqish('string s[3];\ncout << "[" << s[1] << "]";'), ["[]"]);
  assert.deepEqual(chiqish('string s[2];\ns[0] += "a";\ncout << s[0] << s[0].size() << s[1].size();'), ["a10"]);
  // int massivi esa hali ham "qiymat berilmagan"
  assert.equal(xato("int a[3];\ncout << a[1];").kind, "runtime");
});

// ---------- M4: qo'shtirnoqli matnlar + bilan qo'shilmaydi ----------
test("M4: \"a\" + \"b\" — kompilyatsiya xatosi; string + \"b\" esa ishlaydi", () => {
  const e = xato('cout << "Salom" + " dunyo";');
  assert.equal(e.kind, "compile");
  assert.equal(e.cppMessage, "invalid operands to binary expression ('const char[6]' and 'const char[7]')");
  assert.match(e.hint, /Ikki qoʻshtirnoqli matnni \+ bilan qoʻshib boʻlmaydi/);
  assert.deepEqual([e.line, e.col], [6, 21], "xato + belgisini ko'rsatadi");
  // "x" + 'c' va "abc" + 1 — C++ da ko'rsatkich arifmetikasi: xato emas, lekin natija buzuq.
  // Taqlid qilmaymiz va "ishladi" ham demaymiz.
  for (const tana of ["cout << \"x\" + 'c';", "cout << 'c' + \"x\";", 'cout << "abc" + 1;', 'int n = 2;\ncout << "abc" - n;']) {
    const y = xato(tana);
    assert.equal(y.kind, "yoq", tana);
    assert.match(y.hint, /natija buzuq chiqadi/);
  }
  assert.equal(xato('cout << ("a" == "a");').kind, "yoq", "ikki literalni solishtirish — manzillarni solishtirish");
  // To'g'ri yo'llar ishlayveradi
  assert.deepEqual(chiqish('string s = "Salom";\ncout << s + " dunyo" << "!" + s << s + \'!\' << \'(\' + s;'),
    ["Salom dunyo!SalomSalom!(Salom"]);
  assert.deepEqual(chiqish('string s = "ha";\ncout << (s == "ha") << ("ha" == s) << (s < "hb") << (s != s);'), ["1110"]);
});

// ---------- M7: tur xatosi — ISHDAN OLDIN topiladi, chiqish ko'rsatilmaydi ----------
test("M7: tur xatosi bo'lgan dastur umuman ishlamaydi — chiqish bo'sh", () => {
  for (const tana of [
    'cout << "salom\\n";\nint x = "a";',
    'cout << "salom\\n";\nstring s = "a";\ncout << s + 5;',
    'cout << "salom\\n";\nstring s = 5;',
    'cout << "salom\\n";\nint x = 1;\nx = "a";',
    'cout << "salom\\n";\ncout << 5.5 % 2;',
    'cout << "salom\\n";\nint a[3];\ncout << a;',
    'cout << "salom\\n";\nint n = 3;\ncout << n[0];',
    'cout << "salom\\n";\nint n = 3;\ncout << n.size();',
    'cout << "salom\\n";\ncout << max(2.5, 2);',
    'cout << "salom\\n";\nstring s = "a";\nif (s) cout << 1;',
    // hech qachon bajarilmaydigan shox ichidagi xato ham — kompilyator hammasini o'qiydi
    'cout << "salom\\n";\nif (1 > 2) {\n    int x = "a";\n}',
  ]) {
    const r = ishga(d(tana));
    assert.ok(r.error, tana);
    assert.ok(r.error.kind === "compile" || r.error.kind === "yoq", tana + ": " + JSON.stringify(r.error));
    assert.deepEqual(r.output, [], tana + " — g++ hech narsa chiqarmaydi");
    assert.equal(r.out, "");
    assert.ok(C.check(d(tana)), "check() ham ishdan oldin topadi: " + tana);
    assert.deepEqual(C.trace(d(tana)).states, [], "qadam-baqadam ham boshlanmaydi");
  }
  // Ishlash vaqtidagi xato esa — haqiqatan ishlab turib to'xtaydi: oldingi chiqish ko'rinadi
  const r = ishga(d('cout << "salom\\n";\nint a = 5, b = 0;\ncout << a / b;'));
  assert.equal(r.error.kind, "runtime");
  assert.deepEqual(r.output, ["salom"]);
});

test("M7: xabar kompilyatornikidek, izoh o'zbekcha", () => {
  const e = xato('int x = "a";');
  assert.equal(e.cppMessage, "cannot initialize a variable of type 'int' with an lvalue of type 'const char[2]'");
  assert.match(e.hint, /Turlar mos emas/);
  assert.match(xato("string s = 'a';").cppMessage, /no viable conversion from 'char' to 'string'/);
  assert.match(xato('int x = 1;\nx = "a";').cppMessage, /assigning to 'int' from incompatible type 'const char\[2\]'/);
  assert.match(xato("cout << 5.5 % 2;").hint, /faqat butun sonlar/);
  assert.match(xato("int a[3] = 5;").cppMessage, /array initializer must be an initializer list/);
  assert.match(xato("int a[];").cppMessage, /needs an explicit size or an initializer/);
  assert.equal(xato("int x = {1, 2};").kind, "yoq");
  assert.match(xato("int a = 1, b = 2;\ncout << swap(a, b);").hint, /hech narsa qaytarmaydi/);
});

// C++ ruxsat beradigan (va natijasi aniq) aralash turlar ishlayveradi
test("M7: ruxsat etilgan tur almashtirishlar buzilmadi", () => {
  assert.deepEqual(chiqish("int a = 'A';\nchar c = 66;\ndouble d = 3;\nbool b = 5;\nlong long k = 2.9;\ncout << a << c << d << b << k;"), ["65B312"]);
  assert.deepEqual(chiqish('string s;\ns = \'a\';\ns += \'b\';\ns += "cd";\ncout << s << s.size();'), ["abcd4"]);
  // s = 65 va s += 66 — C++ da ishlaydi: son BELGI bo'lib tushadi (g++ bilan korpusda solishtirilgan)
  assert.deepEqual(chiqish("string s;\ns = 65;\ns += 66;\ncout << s;"), ["AB"]);
  assert.deepEqual(chiqish("int x = 7;\nx += 2.5;\nx %= 4;\ndouble y = x;\ny /= 2;\ncout << x << \" \" << y;"), ["1 0.5"]);
  assert.deepEqual(chiqish('string a = "olma", b = "anor";\ncout << max(a, b) << min(a, b);'), ["olmaanor"]);
  assert.deepEqual(chiqish("if (1 > 2) int x = 1;\nint x = 2;\ncout << x;"), ["2"], "qavssiz if tanasi — alohida doira");
});

// ---------- O9: "o'zing yoz" mashqining izohi farq qilgan satrni ko'rsatadi ----------
test("O9: chiqish farqi izohi aynan farq qilgan satr haqida", () => {
  const K = require("../js/cpp.js");
  const task = { sinovlar: [{ kirish: [], chiqish: ["1", "2", "3"] }] };
  const farq = (tana) => {
    const bad = K.tekshir(task, d(tana));
    assert.equal(bad.ok, false, tana);
    return { bad, izoh: K.farqIzohi(bad) };
  };
  // 1-satr to'g'ri, 2-satr xato: avval izoh ikki bir xil 1-satrni ko'rsatar edi
  const ikkinchi = farq('cout << 1 << "\\n" << 5 << "\\n" << 3 << "\\n";');
  assert.equal(ikkinchi.bad.satr, 2);
  assert.match(ikkinchi.izoh, /^2-satr boshqa: sening dasturing «5» chiqardi, kerakli javob — «2»\.$/);
  assert.match(farq("cout << 9;").izoh, /^1-satr boshqa: .*«9».*«1»/);
  assert.match(farq('cout << 1 << "\\n";').izoh, /1 ta satr chiqardi, kerak — 3 ta: 2-satr \(«2»\) yetishmayapti/);
  assert.match(farq('cout << "1\\n2\\n3\\n4\\n";').izoh, /ortiqcha satr chiqardi: 4 ta, kerak — 3 ta/);
  assert.equal(farq("int x = 1;").izoh, "Dastur hech narsa chiqarmadi.");
  assert.equal(K.tekshir(task, d('cout << "1\\n2\\n3\\n";')).ok, true);
});

// ---------- O4: char — 8 bit ----------
test("O4: char 8 bitga qirqiladi va ishorali", () => {
  assert.deepEqual(chiqish("char c = 300;\ncout << (int)c << c;"), ["44,"]);
  assert.deepEqual(chiqish("char c = 200;\ncout << (int)c;"), ["-56"]);
  assert.deepEqual(chiqish("char c = 127;\nc++;\ncout << (int)c;"), ["-128"]);
  assert.deepEqual(chiqish("char c = 'a';\nc = c - 32;\ncout << c << (int)c;"), ["A65"]);
  // bitta tirnoqda lotin bo'lmagan harf — char ga sig'maydi (kompilyator ham xato beradi)
  const e = xato("char c = 'ʻ';");
  assert.equal(e.kind, "compile");
  assert.match(e.cppMessage, /character too large/);
  assert.match(xato("char c = 'ab';").hint, /BITTA belgi/);
});

test("M7: massiv bo'yi ish paytida noto'g'ri chiqsa — bu ishlash vaqtidagi xato (chiqish saqlanadi)", () => {
  const r = ishga(d('int n;\ncin >> n;\ncout << "boshlandi\\n";\nint a[n];'), ["0"]);
  assert.equal(r.error.kind, "runtime");
  assert.match(r.error.cppMessage, /invalid array size: 0/);
  assert.deepEqual(r.output, ["boshlandi"]);
  const katta = xato("int a[100001];");
  assert.equal(katta.kind, "yoq");
  assert.match(katta.hint, /Haqiqiy kompilyatorda kattaroq massiv ham ishlaydi/);
});

// ---------- O5: const ----------
test("O5: const tanilgan — o'qiladi, o'zgartirilsa kompilyatsiya xatosi", () => {
  assert.deepEqual(chiqish('const int N = 3;\nint const M = 4;\nconst long long K = 10000000000;\nint a[N];\na[0] = N * M;\ncout << a[0] << " " << K;'),
    ["12 10000000000"]);
  for (const tana of ["const int n = 5;\nn = 6;", "const int n = 5;\nn++;", "const int n = 5;\n--n;", "const int n = 5;\nn += 1;"]) {
    const e = xato(tana);
    assert.equal(e.kind, "compile", tana);
    assert.equal(e.cppMessage, "cannot assign to variable 'n' with const-qualified type 'const int'", tana);
    assert.match(e.hint, /const: qiymati eʼlon paytida bir marta beriladi/);
    assert.equal(e.line, 7);
  }
  assert.match(xato("const int n = 5;\ncin >> n;", ["7"]).hint, /cin bilan yangi qiymat oʻqib boʻlmaydi/);
  assert.match(xato("const int a[2] = {1, 2};\na[0] = 5;").cppMessage, /'a' with const-qualified type 'const int\[2\]'/);
  assert.match(xato("const int n;").cppMessage, /default initialization of an object of const type 'const int'/);
  assert.match(xato("const n = 5;").cppMessage, /type specifier is required/);
  // xato ishdan OLDIN topiladi: oldingi cout ham chiqmaydi
  assert.deepEqual(ishga(d('const int n = 5;\ncout << n;\nn = 6;')).output, []);
});

// ---------- O6: sarlavhalar va sikl tashqarisidagi break ----------
test("O6: #include <iostream> yoki using namespace std; bo'lmasa — cout tanilmaydi", () => {
  const tana = "int main() {\n    cout << 1;\n    return 0;\n}\n";
  const yoq = C.run(tana);
  assert.equal(yoq.error.kind, "compile");
  assert.equal(yoq.error.cppMessage, "use of undeclared identifier 'cout'");
  assert.match(yoq.error.hint, /#include <iostream>/);
  assert.deepEqual(yoq.output, []);

  const usingsiz = C.run("#include <iostream>\n" + tana);
  assert.equal(usingsiz.error.cppMessage, "use of undeclared identifier 'cout'");
  assert.match(usingsiz.error.hint, /toʻliq nomi — std::cout/);
  assert.match(usingsiz.error.hint, /using namespace std;/);
  assert.deepEqual([usingsiz.error.line, usingsiz.error.col], [3, 5]);

  assert.match(C.run("using namespace std;\n" + tana).error.hint, /#include <iostream>/);
  assert.match(C.run("#include <iostream>\nusing namespace std;\nint main() {\n    int x;\n    cin >> x;\n    cout << x << endl;\n    return 0;\n}\n", { stdin: ["4"] }).out, /^4\n$/);
  assert.match(C.run("#include <iostream>\nint main() {\n    int x;\n    cin >> x;\n    return 0;\n}\n").error.hint, /std::cin/);
  assert.match(C.run("#include <iostream>\nint main() {\n    string s;\n    return 0;\n}\n").error.cppMessage, /^unknown type name 'string'$/);
  // To'liq nom bilan yozilgan dastur using siz ham ishlaydi
  const toliq = C.run('#include <iostream>\nint main() {\n    std::string s = "ok";\n    std::cout << s << std::endl;\n    return 0;\n}\n');
  assert.equal(toliq.error, null, JSON.stringify(toliq.error));
  assert.deepEqual(toliq.output, ["ok"]);
  // sort — <algorithm> dan
  const sortsiz = xato("int a[2] = {2, 1};\nsort(a, a + 2);");
  assert.equal(sortsiz.cppMessage, "use of undeclared identifier 'sort'");
  assert.match(sortsiz.hint, /#include <algorithm>/);
  // #define va shunga o'xshashlar — "bu yerda hali yo'q"
  assert.equal(C.run("#include <iostream>\n#define N 5\nusing namespace std;\nint main() {\n    return 0;\n}\n").error.kind, "yoq");
});

test("O6: break/continue sikl tashqarisida — kompilyatsiya xatosi (dastur jim tugamaydi)", () => {
  const r = ishga(d("cout << 1;\nbreak;\ncout << 2;"));
  assert.equal(r.error.kind, "compile");
  assert.equal(r.error.cppMessage, "'break' statement not in loop or switch statement");
  assert.match(r.error.hint, /faqat sikl/);
  assert.deepEqual(r.output, [], "g++ hech narsa chiqarmaydi");
  assert.equal(xato("if (1 > 0) {\n    continue;\n}").cppMessage, "'continue' statement not in loop statement");
  // sikldan keyin yozilgan break ham tashqarida
  assert.equal(xato("for (int i = 0; i < 3; i++) cout << i;\nbreak;").kind, "compile");
  // sikl ichida (if ning ichida bo'lsa ham) — ishlaydi
  assert.deepEqual(chiqish("for (int i = 0; i < 9; i++) {\n    if (i == 1) continue;\n    if (i == 4) { break; }\n    cout << i;\n}\nwhile (true) break;\ncout << \"!\";"), ["023!"]);
});

// ---------- k6: son yozuvlari ----------
test("k6: 1e-5, 2., 100000LL o'qiladi; 010 va 0x10 — ochiq xabar", () => {
  assert.deepEqual(chiqish('cout << 1e-5 << " " << 1e5 << " " << 2.5e3 << " " << 2.;'), ["1e-05 100000 2500 2"]);
  assert.deepEqual(chiqish('cout << 100000LL * 100000 << " " << 5L;'), ["10000000000 5"]);
  assert.deepEqual(chiqish("int n = 1e9;\ncout << n + 7;"), ["1000000007"]);
  assert.match(xato("cout << 1e;").cppMessage, /exponent has no digits/);
  assert.match(xato("int 2x = 5;").cppMessage, /invalid suffix 'x' on integer constant/);
  // 010 — C++ da 8: jimgina 10 deb olinmaydi
  const sakkizlik = xato("cout << 010;");
  assert.equal(sakkizlik.kind, "yoq");
  assert.match(sakkizlik.hint, /sakkizlik/);
  assert.equal(xato("cout << 0x1F;").kind, "yoq");
  assert.equal(xato("cout << 5u;").kind, "yoq");
  assert.equal(xato("cout << 2.5f;").kind, "yoq");
  assert.deepEqual(chiqish("cout << 0 << 0.5 << 10;"), ["00.510"]);
});

// ---------- k7: cin >> int ga kasr son ----------
test("k7: cin butun songa sonning boshini oladi, qolgani navbatda qoladi (g++ kabi)", () => {
  assert.deepEqual(chiqish("int a;\ndouble b;\ncin >> a >> b;\ncout << a << \" \" << b;", ["3.7"]), ["3 0.7"]);
  assert.deepEqual(chiqish("int a;\nstring s;\ncin >> a >> s;\ncout << a << s;", ["12abc"]), ["12abc"]);
  assert.deepEqual(chiqish("int a;\ncin >> a;\ncout << a;", ["3.7"]), ["3"], "g++ ham 3 ni oladi");
  // Qolgan «.7» ni yana butun son deb o'qishga urinilsa — sabab tushuntiriladi
  const e = xato("int a, b;\ncin >> a >> b;", ["3.7"]);
  assert.equal(e.kind, "runtime");
  assert.match(e.cppMessage, /invalid input: '\.7'/);
  assert.match(e.hint, /oldingi sonning kasr qismi/);
  assert.match(e.hint, /double ishlat/);
  // int ga sig'maydigan son qirqilib, boshqa songa aylanib qolmaydi
  const katta = xato("int a;\ncin >> a;", ["3000000000"]);
  assert.match(katta.hint, /int ga sigʻmaydi/);
  assert.deepEqual(chiqish("long long a;\ncin >> a;\ncout << a;", ["3000000000"]), ["3000000000"]);
  assert.match(xato("int a;\ncin >> a;", ["salom"]).hint, /Son kutilgan edi/);
});

// ---------- k8: tank buyrug'iga matn berilsa — TypeError ----------
test("k8: move(\"abc\") — Python TypeError, 'saytning xatosi' emas", () => {
  const J = require("../js/jang.js");
  const py = require("../js/python/python.js");
  const m = J.maydon({ tanklar: [J.tank({ id: "bola", x: 100, y: 200, burchak: 0 })] });
  const { fn } = J.tashqiFunksiyalar(m, "bola");
  for (const [kod, nom, tur] of [['move("abc")', "move", "str"], ['x = 1\nleft("90")', "left", "str"], ["back([1])", "back", "list"], ["right(None)", "right", "NoneType"]]) {
    const r = py.run(kod, { tashqi: fn });
    assert.ok(r.error, kod);
    assert.equal(r.error.type, "TypeError", kod + ": " + JSON.stringify(r.error));
    assert.equal(r.error.message, nom + "() argument must be a number, not '" + tur + "'");
    assert.match(r.error.hint, /ga son berish kerak/);
    assert.ok(r.error.line >= 1, "satr raqami bor");
  }
  assert.equal(m.tanklar[0].x, 100, "xato buyruq tankni qimirlatmaydi");
  // son (butun, kasr) bilan avvalgidek ishlaydi
  assert.equal(py.run("move(10)\nmove(2.5)", { tashqi: fn }).error, null);
  assert.equal(m.tanklar[0].x, 113);
});

// ---------- Xato matnlari haqiqiy kompilyator bilan bir xil (satr:ustun: error: xabar) ----------
// Bola saytda ko'rgan xabarni haqiqiy kompilyatorda ham o'sha joyda ko'rishi kerak.
const { da } = require("./cpp-corpus.js");
const GPP_XATOLAR = [
  ["literal+literal", d('cout << "Salom" + " dunyo";')],
  ["string+int", d('string s = "a";\ncout << s + 5;')],
  ["int+string", d('string s = "a";\ncout << 5 + s;')],
  ["string-string", d('string s = "a";\ncout << s - s;')],
  ["int=literal", d('int x = "a";')],
  ["int=string", d('string s = "a";\nint x = s;')],
  ["char=literal", d('char c = "a";')],
  ["string=int", d("string s = 5;")],
  ["string=char", d("string s = 'a';")],
  ["tayin-int-literal", d('int x = 1;\nx = "a";')],
  ["tayin-int-string", d('string s = "a";\nint x = 1;\nx = s;')],
  ["qoshma-int-string", d('string s = "a";\nint x = 1;\nx += s;')],
  ["qoldiq-double", d("cout << 5.5 % 2;")],
  ["qoldiq-teng-double", d("double x = 5;\nx %= 2;")],
  ["string==int", d('string s = "a";\ncout << (s == 5);')],
  ["string==char", d("string s = \"a\";\ncout << (s == 'a');")],
  ["literal.size", d('cout << "abc".size();')],
  ["int.size", d("int n = 5;\ncout << n.size();")],
  ["massiv.size", d("int a[3];\ncout << a.size();")],
  ["int[0]", d("int a = 3;\ncout << a[0];")],
  ["max-aralash", da("cout << max(2.5, 2);")],
  ["swap-aralash", da("int a = 1;\ndouble b = 2;\nswap(a, b);")],
  ["royxat-ortiqcha", d("int a[2] = {1, 2, 3};")],
  ["massiv=son", d("int a[3] = 5;")],
  ["massiv-boyisiz", d("int a[];")],
  ["massiv-element-literal", d('int a[2] = {1, "x"};')],
  ["if-string", d('string s = "a";\nif (s) cout << 1;')],
  ["!string", d('string s = "a";\ncout << !s;')],
  ["string++", d('string s = "a";\ns++;')],
  ["(int)string", d('string s = "5";\ncout << (int)s;')],
  ["massiv[kasr]", d("int a[3] = {1, 2, 3};\ncout << a[1.5];")],
  ["juda-katta-son", d("cout << 99999999999999999999;")],
  ["cin>>ifoda", d("int a = 1;\ncin >> a + 1;")],
  ["const=", d("const int n = 5;\nn = 6;")],
  ["const++", d("const int n = 5;\nn++;")],
  ["--const", d("const int n = 5;\n--n;")],
  ["const+=", d("const long long n = 5;\nn += 1;")],
  ["cin>>const", d("const int n = 5;\ncin >> n;")],
  ["const-qiymatsiz", d("const int n;")],
  ["const-massiv", d("const int a[3] = {1, 2, 3};\na[0] = 5;")],
  ["const-swap", da("const int a = 1;\nint b = 2;\nswap(a, b);")],
  ["const-tursiz", d("const n = 5;")],
  ["break-tashqarida", d("cout << 1;\nbreak;\ncout << 2;")],
  ["continue-tashqarida", d("if (1 > 0) {\n    continue;\n}")],
  // sarlavhasiz: kompilyatorga tayyor <iostream> berilmaydi — dasturning o'zidagi #include tekshiriladi
  ["cout-includesiz", "using namespace std;\nint main() {\n    cout << 1;\n    return 0;\n}\n", { sarlavhasiz: true }],
  ["cout-sarlavhasiz", "int main() {\n    cout << 1;\n    return 0;\n}\n", { sarlavhasiz: true }],
  ["cin-sarlavhasiz", "int main() {\n    int x;\n    cin >> x;\n    return 0;\n}\n", { sarlavhasiz: true }],
  ["string-sarlavhasiz", "int main() {\n    string s;\n    return 0;\n}\n", { sarlavhasiz: true }],
  ["cout-usingsiz", "#include <iostream>\nint main() {\n    cout << 1;\n    return 0;\n}\n"],
  ["cin-usingsiz", "#include <iostream>\nint main() {\n    int x;\n    cin >> x;\n    return 0;\n}\n"],
  ["endl-usingsiz", "#include <iostream>\nint main() {\n    std::cout << 1 << endl;\n    return 0;\n}\n"],
  ["string-usingsiz", "#include <iostream>\nint main() {\n    string s;\n    return 0;\n}\n"],
  ["max-usingsiz", "#include <iostream>\n#include <algorithm>\nint main() {\n    std::cout << max(1, 2);\n    return 0;\n}\n"],
  ["belgi-lotin-emas", d("char c = 'ʻ';")],
  ["eksponent-boʻsh", d("cout << 1e;")],
  ["son-harf", d("cout << 2x;")],
];

test("statik xatolar: har biri ishdan oldin topiladi (kompilyatorsiz ham)", () => {
  for (const [id, kod] of GPP_XATOLAR) {
    const e = C.check(kod);
    assert.ok(e, id + ": xato topilmadi");
    assert.equal(e.kind, "compile", id + ": " + JSON.stringify(e));
    assert.ok(e.hint && e.line, id + ": izoh va satr raqami bo'lsin");
    assert.deepEqual(C.run(kod).output, [], id + ": chiqish bo'lmasligi kerak");
  }
});

if (G.bormi()) {
  test("statik xatolar g++ bilan bir xil matn, satr va ustunda", { timeout: 300000 }, async () => {
    const ust = G.ustaxona();
    const farqlar = [];
    try {
      for (let k = 0; k < GPP_XATOLAR.length; k++) {
        const [id, kod, opts] = GPP_XATOLAR[k];
        const xom = await G.xatoMatni(ust, kod, "x" + k, opts);
        assert.ok(xom, id + ": g++ xato bermadi — biz esa beryapmiz (yolg'on xato)");
        // "; did you mean 'sin'?" — kompilyatorning taxmini (har doim ham to'g'ri emas), solishtirilmaydi
        const gpp = xom.replace(/; did you mean '[^']*'\?$/, "");
        const biz = C.check(kod).text.replace("a.cpp:", "");
        if (biz !== gpp) farqlar.push(id + "\n  g++:      " + gpp + "\n  dvigatel: " + biz);
      }
    } finally {
      ust.tozala();
    }
    assert.deepEqual(farqlar, [], "g++ bilan farq qiladigan xabarlar:\n" + farqlar.join("\n"));
  });

  // Aksincha: g++ QABUL QILADIGAN, lekin natijasi buzuq/aniqlanmagan kodlar — bizda "bu yerda yo'q".
  // Bu ro'yxatdagi har dasturni g++ kompilyatsiya qiladi: biz uni "kompilyatsiya xatosi" deb atamaymiz.
  test("g++ o'tkazadigan, lekin natijasi buzuq kodlar 'kompilyatsiya xatosi' deb atalmaydi", { timeout: 120000 }, async () => {
    const ust = G.ustaxona();
    try {
      const royxat = [
        ["literal+belgi", d("cout << \"x\" + 'c';")],
        ["literal+son", d('cout << "abc" + 1;')],
        ["literal==literal", d('cout << ("a" == "a");')],
      ];
      for (let k = 0; k < royxat.length; k++) {
        const [id, kod] = royxat[k];
        assert.equal(await G.xatoMatni(ust, kod, "y" + k), null, id + ": g++ kompilyatsiya qilishi kerak edi");
        assert.equal(C.check(kod).kind, "yoq", id);
      }
    } finally {
      ust.tozala();
    }
  });
}

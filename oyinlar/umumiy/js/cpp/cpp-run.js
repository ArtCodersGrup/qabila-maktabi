// Kichik C++: tashqi interfeys. Ekran kodi faqat shu fayl bilan gaplashadi.
//   QK.cpp.run(kod, { stdin: ["5"] })  → { out, output, error, steps, vars }
//   QK.cpp.trace(kod, { stdin })       → { states, output, error }   (qadam-baqadam panel uchun)
//   QK.cpp.check(kod)                  → xato (yozilayotganda tekshirish) yoki null
//
// Yadroda nima bor/yo'q: ../CPP-BLOK.md va cpp/parser.js boshidagi izoh.
(function (root) {
  "use strict";

  const EN = (root.QK && root.QK.cppEngine) || {};
  const E = EN.errors || require("./errors.js");
  const T = EN.tokenizer || require("./tokenizer.js");
  const P = EN.parser || require("./parser.js");
  const I = EN.interpreter || require("./interpreter.js");
  const S = EN.semantika || require("./semantika.js");

  // Chiqishni satrlarga ajratish: oxirgi "\n" dan keyingi bo'sh satr hisobga olinmaydi
  function satrlar(out) {
    if (out === "") return [];
    const list = out.split("\n");
    if (list[list.length - 1] === "") list.pop();
    return list;
  }

  // Kutilmagan JS xatosi bolaga "sayt buzildi" bo'lib ko'rinmasligi kerak
  function asCppError(e) {
    if (e instanceof E.CppError) return e;
    if (e instanceof RangeError) return E.ichki("juda chuqur hisob");
    return E.ichki((e && e.message) || e);
  }

  // Parse + nomlarni tekshirish: xato dastur ishga tushmaydi (g++ dagidek)
  const parse = (kod) => S.tekshir(P.parse(T.tokenize(kod)));

  function check(kod) {
    try {
      parse(kod);
      return null;
    } catch (e) {
      return E.describe(asCppError(e));
    }
  }

  function run(kod, opts) {
    const ctx = I.makeContext(opts);
    const env = new I.Env(null);
    let error = null;
    try {
      for (const holat of I.execProgram(parse(kod), env, ctx)) { void holat; }
    } catch (e) {
      error = E.describe(asCppError(e));
    }
    return { out: ctx.out, output: satrlar(ctx.out), error, steps: ctx.steps, vars: I.snapshot(env) };
  }

  function trace(kod, opts) {
    const o = opts || {};
    const ctx = I.makeContext(o);
    const env = new I.Env(null);
    const maxStates = o.maxStates || 500;
    const states = [];
    let error = null;
    let cut = false;
    try {
      for (const holat of I.execProgram(parse(kod), env, ctx)) {
        if (states.length >= maxStates) { cut = true; break; }
        states.push({ line: holat.line, vars: I.snapshot(holat.env), output: satrlar(ctx.out), steps: ctx.steps });
      }
    } catch (e) {
      error = E.describe(asCppError(e));
    }
    return { states, cut, output: satrlar(ctx.out), out: ctx.out, error, steps: ctx.steps, vars: I.snapshot(env) };
  }

  const api = { run, trace, check, parse, tokenize: T.tokenize, errors: E };
  root.QK = root.QK || {};
  root.QK.cpp = Object.assign(root.QK.cpp || {}, api);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

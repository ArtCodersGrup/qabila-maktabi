// Kichik Python: tashqi interfeys. Ekran kodi faqat shu fayl bilan gaplashadi.
//   QK.python.run(kod, { stdin: ["5"] })   → { out, output, error, steps, vars }
//   QK.python.trace(kod, { stdin })        → { states, output, error }  (qadam-baqadam panel uchun)
//   QK.python.check(kod)                   → xato (yozilayotganda tekshirish) yoki null
(function (root) {
  "use strict";

  // Brauzerda skriptlar tartib bilan ulanadi (QK.python.* tayyor), Node'da require ishlaydi
  const P0 = (root.QK && root.QK.python) || null;
  const E = (P0 && P0.errors) || require("./errors.js");
  const T = (P0 && P0.tokenizer) || require("./tokenizer.js");
  const P = (P0 && P0.parser) || require("./parser.js");
  const I = (P0 && P0.interpreter) || require("./interpreter.js");

  // Chiqishni satrlarga ajratish: oxirgi "\n" dan keyingi bo'sh satr hisobga olinmaydi
  function toLines(out) {
    if (out === "") return [];
    const lines = out.split("\n");
    if (lines[lines.length - 1] === "") lines.pop();
    return lines;
  }

  // Kutilmagan JS xatosi bolaga "sayt buzildi" bo'lib ko'rinmasligi kerak
  function asPyError(e) {
    if (e instanceof E.PyError) return e;
    if (e instanceof RangeError) return E.recursionError({});
    return E.err("InternalError", String((e && e.message) || e), {
      hint: "Bu — saytning xatosi, sening kodingniki emas. Iltimos, shu kodni oʻqituvchingga koʻrsat.",
    });
  }

  function parse(code) {
    return P.parse(T.tokenize(code));
  }

  function check(code) {
    try {
      parse(code);
      return null;
    } catch (e) {
      return E.describe(asPyError(e));
    }
  }

  function run(code, opts) {
    const ctx = I.makeContext(opts);
    const env = new I.Env(null);
    let error = null;
    try {
      for (const state of I.execModule(parse(code), env, ctx)) { void state; }
    } catch (e) {
      error = E.describe(asPyError(e));
    }
    return {
      out: ctx.out,
      output: toLines(ctx.out),
      error,
      steps: ctx.steps,
      vars: I.snapshot(env),
    };
  }

  function trace(code, opts) {
    const o = opts || {};
    const ctx = I.makeContext(o);
    const env = new I.Env(null);
    const maxStates = o.maxStates || 500;
    const states = [];
    let error = null;
    let cut = false;
    try {
      for (const state of I.execModule(parse(code), env, ctx)) {
        if (states.length >= maxStates) { cut = true; break; }
        states.push({
          line: state.line,
          vars: I.snapshot(state.env),
          output: toLines(ctx.out),
          steps: ctx.steps,
        });
      }
    } catch (e) {
      error = E.describe(asPyError(e));
    }
    return { states, cut, output: toLines(ctx.out), out: ctx.out, error, steps: ctx.steps, vars: I.snapshot(env) };
  }

  const api = { run, trace, check, parse, tokenize: T.tokenize, errors: E, KEYWORDS: T.KEYWORDS };

  root.QK = root.QK || {};
  root.QK.python = Object.assign(root.QK.python || {}, api);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

// Kichik Python: daraxtni bajaruvchi. Generator bo'lgani uchun har buyruqdan keyin to'xtab,
// hozirgi satr va o'zgaruvchilarni ko'rsatish mumkin (qadam-baqadam panel shunga tayanadi).
(function (root) {
  "use strict";

  // Brauzerda skriptlar tartib bilan ulanadi (QK.python.* tayyor), Node'da require ishlaydi
  const P0 = (root.QK && root.QK.python) || null;
  const E = (P0 && P0.errors) || require("./errors.js");
  const V = (P0 && P0.values) || require("./values.js");
  const B = (P0 && P0.builtins) || require("./builtins.js");

  const MISSING = Symbol("yoq");

  function Env(globals) {
    this.vars = new Map();
    this.globals = globals || null;
  }
  Env.prototype.get = function (name) {
    if (this.vars.has(name)) return this.vars.get(name);
    if (this.globals && this.globals.vars.has(name)) return this.globals.vars.get(name);
    return MISSING;
  };
  Env.prototype.set = function (name, value) { this.vars.set(name, value); };

  // Sikl va funksiyadan chiqish uchun belgilar
  const BREAK = { sig: "break" };
  const CONTINUE = { sig: "continue" };
  function ReturnSignal(value) { this.sig = "return"; this.value = value; }

  function makeContext(opts) {
    const o = opts || {};
    const stdin = (o.stdin || []).map(String);
    const maxSteps = o.maxSteps || 200000;
    const maxLines = o.maxOutput || 2000;
    let out = "";
    let lines = 0;
    const ctx = {
      steps: 0,
      depth: 0,
      get out() { return out; },
      write(text) {
        out += text;
        for (const ch of text) if (ch === "\n") lines++;
        if (lines > maxLines) throw E.outputLimit(maxLines, { line: ctx.line });
      },
      readLine(pos) {
        if (!stdin.length) throw E.eofError(pos);
        return stdin.shift();
      },
      step(st) {
        ctx.line = st && st.line;
        ctx.steps++;
        if (ctx.steps > maxSteps) throw E.stepLimit(maxSteps, { line: st && st.line });
      },
    };
    return ctx;
  }

  const posOf = (n) => ({ line: n.line, col: n.col });

  // O'zgaruvchilar jadvali uchun: nom → ko'rinadigan matn
  function snapshot(env) {
    const out = {};
    const add = (map) => {
      for (const [name, value] of map) {
        if (V.isFunc(value)) continue;
        out[name] = V.repr(value);
      }
    };
    if (env.globals) add(env.globals.vars);
    add(env.vars);
    return out;
  }

  // — Ifodalar —

  function* ev(n, env, ctx) {
    switch (n.t) {
      case "Num": case "Str": case "Const":
        return n.value;

      case "Name": {
        const found = env.get(n.id);
        if (found !== MISSING) return found;
        if (B.has(n.id)) return { t: "builtin", name: n.id };
        throw E.nameError(n.id, posOf(n));
      }

      case "List": {
        const items = [];
        for (const item of n.items) items.push(yield* ev(item, env, ctx));
        return items;
      }

      case "Tuple": {
        const items = [];
        for (const item of n.items) items.push(yield* ev(item, env, ctx));
        return items;
      }

      case "BinOp": {
        const left = yield* ev(n.left, env, ctx);
        const right = yield* ev(n.right, env, ctx);
        return V.binary(n.op, left, right, posOf(n));
      }

      case "UnaryOp": {
        const value = yield* ev(n.operand, env, ctx);
        return V.unary(n.op, value, posOf(n));
      }

      case "BoolOp": {
        let last = null;
        for (const item of n.values) {
          last = yield* ev(item, env, ctx);
          const t = V.truthy(last);
          if (n.op === "and" && !t) return last;
          if (n.op === "or" && t) return last;
        }
        return last;
      }

      case "Compare": {
        let left = yield* ev(n.left, env, ctx);
        for (let k = 0; k < n.ops.length; k++) {
          const right = yield* ev(n.comparators[k], env, ctx);
          const op = n.ops[k];
          const ok = op === "in" ? V.contains(left, right, posOf(n))
            : op === "not in" ? !V.contains(left, right, posOf(n))
            : V.compare(op, left, right, posOf(n));
          if (!ok) return false;
          left = right;
        }
        return true;
      }

      case "Index": {
        const box = yield* ev(n.value, env, ctx);
        const idx = yield* ev(n.index, env, ctx);
        return V.getIndex(box, idx, posOf(n));
      }

      case "Slice": {
        const box = yield* ev(n.value, env, ctx);
        const from = n.from ? yield* ev(n.from, env, ctx) : null;
        const to = n.to ? yield* ev(n.to, env, ctx) : null;
        return V.getSlice(box, from, to, posOf(n));
      }

      case "Attribute":
        throw E.notYet("metodni chaqirmasdan ishlatish (." + n.attr + ")", "a." + n.attr + "(…) — qavs bilan", posOf(n));

      case "Call": {
        const pos = posOf(n);
        const args = [];
        if (n.func.t === "Attribute") {
          const obj = yield* ev(n.func.value, env, ctx);
          for (const a of n.args) args.push(yield* ev(a, env, ctx));
          return B.callMethod(obj, n.func.attr, args, ctx, pos);
        }
        const fn = yield* ev(n.func, env, ctx);
        for (const a of n.args) args.push(yield* ev(a, env, ctx));
        if (fn && fn.t === "builtin") return B.BUILTINS[fn.name](args, ctx, pos);
        if (V.isFunc(fn)) return yield* callUser(fn, args, ctx, pos);
        throw E.typeError("'" + V.typeName(fn) + "' object is not callable", Object.assign(pos, {
          hint: "Bu nom funksiya emas. Qavs faqat funksiyaga qoʻyiladi.",
        }));
      }

      default:
        throw E.syntaxError("invalid syntax", posOf(n));
    }
  }

  function* callUser(fn, args, ctx, pos) {
    if (args.length !== fn.params.length) {
      if (args.length < fn.params.length) {
        const missing = fn.params.slice(args.length);
        throw E.typeError(fn.name + "() missing " + missing.length + " required positional argument"
          + (missing.length > 1 ? "s" : "") + ": " + missing.map((m) => "'" + m + "'").join(" and "),
        Object.assign({}, pos, { hint: "`" + fn.name + "` funksiyasi " + fn.params.length + " ta qiymat kutadi." }));
      }
      throw E.typeError(fn.name + "() takes " + fn.params.length + " positional argument"
        + (fn.params.length === 1 ? "" : "s") + " but " + args.length + " were given",
      Object.assign({}, pos, { hint: "`" + fn.name + "` funksiyasi " + fn.params.length + " ta qiymat kutadi." }));
    }
    ctx.depth++;
    if (ctx.depth > 200) {
      ctx.depth--;
      throw E.recursionError(pos);
    }
    const fenv = new Env(fn.globals);
    fn.params.forEach((p, k) => fenv.set(p, args[k]));
    try {
      yield* execBlock(fn.body, fenv, ctx);
      return null;
    } catch (e) {
      if (e instanceof ReturnSignal) return e.value;
      throw e;
    } finally {
      ctx.depth--;
    }
  }

  // — O'zlashtirish —

  function* assign(target, value, env, ctx, pos) {
    if (target.t === "Name") { env.set(target.id, value); return; }
    if (target.t === "Index") {
      const box = yield* ev(target.value, env, ctx);
      const idx = yield* ev(target.index, env, ctx);
      V.setIndex(box, idx, value, posOf(target));
      return;
    }
    if (target.t === "Tuple") {
      const items = V.isList(value) ? value : [...V.iterate(value, pos)];
      if (items.length !== target.items.length) {
        const message = items.length < target.items.length
          ? "not enough values to unpack (expected " + target.items.length + ", got " + items.length + ")"
          : "too many values to unpack (expected " + target.items.length + ")";
        throw E.valueError(message, Object.assign({}, pos, {
          hint: "Chapda " + target.items.length + " ta nom bor, oʻngda " + items.length + " ta qiymat.",
        }));
      }
      for (let k = 0; k < items.length; k++) yield* assign(target.items[k], items[k], env, ctx, pos);
      return;
    }
    throw E.syntaxError("cannot assign to expression here", posOf(target));
  }

  // — Buyruqlar —

  function* execBlock(body, env, ctx) {
    for (const st of body) yield* execStmt(st, env, ctx);
  }

  function* execStmt(st, env, ctx) {
    ctx.step(st);
    const pos = posOf(st);

    switch (st.t) {
      case "Expr":
        yield* ev(st.value, env, ctx);
        break;

      case "Assign": {
        const simpleTarget = st.targets.every((t) => t.t !== "Tuple");
        if (st.value.t === "Tuple" && simpleTarget) {
          throw E.notYet("vergul bilan bir nechta qiymat (tuple)", "har qiymatni alohida qutiga yoz", pos);
        }
        const value = yield* ev(st.value, env, ctx);
        for (const target of st.targets) yield* assign(target, value, env, ctx, pos);
        break;
      }

      case "AugAssign": {
        const old = yield* ev(st.target, env, ctx);
        const add = yield* ev(st.value, env, ctx);
        yield* assign(st.target, V.binary(st.op, old, add, pos), env, ctx, pos);
        break;
      }

      case "If": {
        const test = V.truthy(yield* ev(st.test, env, ctx));
        yield { line: st.line, env, ctx };
        yield* execBlock(test ? st.body : st.orelse, env, ctx);
        return;
      }

      case "While": {
        for (;;) {
          ctx.step(st);
          const test = V.truthy(yield* ev(st.test, env, ctx));
          yield { line: st.line, env, ctx };
          if (!test) break;
          try {
            yield* execBlock(st.body, env, ctx);
          } catch (e) {
            if (e === BREAK) break;
            if (e !== CONTINUE) throw e;
          }
        }
        return;
      }

      case "For": {
        const box = yield* ev(st.iter, env, ctx);
        let stop = false;
        for (const item of V.iterate(box, pos)) {
          ctx.step(st);
          env.set(st.target.id, item);
          yield { line: st.line, env, ctx };
          try {
            yield* execBlock(st.body, env, ctx);
          } catch (e) {
            if (e === BREAK) { stop = true; }
            else if (e !== CONTINUE) throw e;
          }
          if (stop) break;
        }
        return;
      }

      case "FunctionDef":
        env.set(st.name, { t: "func", name: st.name, params: st.params, body: st.body, globals: env.globals || env });
        break;

      case "Return": {
        if (st.value && st.value.t === "Tuple") {
          throw E.notYet("bir vaqtda bir nechta qiymat qaytarish (tuple)", "roʻyxat qaytar: return [a, b]", pos);
        }
        const value = st.value ? yield* ev(st.value, env, ctx) : null;
        yield { line: st.line, env, ctx };
        throw new ReturnSignal(value);
      }

      case "Break": throw BREAK;
      case "Continue": throw CONTINUE;
      case "Pass": break;

      default:
        throw E.syntaxError("invalid syntax", pos);
    }

    yield { line: st.line, env, ctx };
  }

  function* execModule(ast, env, ctx) {
    try {
      yield* execBlock(ast.body, env, ctx);
    } catch (e) {
      if (e === BREAK || e === CONTINUE) {
        throw E.syntaxError("'break' outside loop", {
          line: ctx.line,
          hint: "`break` va `continue` faqat sikl ichida ishlaydi.",
        });
      }
      if (e instanceof ReturnSignal) {
        throw E.syntaxError("'return' outside function", {
          line: ctx.line,
          hint: "`return` faqat funksiya (`def`) ichida ishlaydi.",
        });
      }
      throw e;
    }
  }

  const api = { Env, makeContext, execModule, execBlock, execStmt, ev, snapshot, ReturnSignal, BREAK, CONTINUE };

  root.QK = root.QK || {};
  root.QK.python = root.QK.python || {};
  root.QK.python.interpreter = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

// Kichik Python: ichki funksiyalar (print, input, int, len, range …) va metodlar (append, upper …).
// Xato xabarlari Pythonning o'zidek: umumiy/tests/python-errors.test.js tekshiradi.
(function (root) {
  "use strict";

  // Brauzerda skriptlar tartib bilan ulanadi (QK.python.* tayyor), Node'da require ishlaydi
  const P0 = (root.QK && root.QK.python) || null;
  const E = (P0 && P0.errors) || require("./errors.js");
  const V = (P0 && P0.values) || require("./values.js");

  const attributeError = (obj, name, pos) => E.err("AttributeError",
    "'" + V.typeName(obj) + "' object has no attribute '" + name + "'",
    Object.assign({}, pos, {
      hint: "Bu turda `" + name + "` metodi yoʻq. Bu saytda bor metodlar: roʻyxat — append, pop; matn — upper, lower, count, split.",
    }));

  function arity(name, args, min, max, pos) {
    if (args.length < min || args.length > max) {
      const want = min === max ? String(min) : min + "–" + max;
      throw E.typeError(name + "() takes " + want + " arguments (" + args.length + " given)",
        Object.assign({}, pos, { hint: "`" + name + "()` qavsi ichida " + want + " ta qiymat boʻlishi kerak." }));
    }
  }

  function wantInt(name, v, pos) {
    if (!V.isIntLike(v)) {
      throw E.typeError("'" + V.typeName(v) + "' object cannot be interpreted as an integer",
        Object.assign({}, pos, { hint: "Bu yerda butun son kerak. `input()` matn qaytaradi — `int(input())` deb oʻgir." }));
    }
    return V.toInt(v);
  }

  function toIntValue(v, base, pos) {
    if (V.isStr(v)) {
      const text = v.trim().replace(/_/g, "");
      const b = base === undefined ? 10 : Number(V.toInt(base));
      const ok = b === 10 ? /^[+-]?\d+$/.test(text) : true;
      if (!ok || text === "") {
        throw E.valueError("invalid literal for int() with base " + b + ": '" + v + "'",
          Object.assign({}, pos, { hint: "`int()` faqat sonli matnni oʻgiradi: \"12\" — mumkin, \"12a\" — yoʻq." }));
      }
      if (b === 10) return BigInt(text);
      const neg = text.startsWith("-");
      const digits = text.replace(/^[+-]/, "").toLowerCase();
      let out = 0n;
      for (const ch of digits) {
        const d = parseInt(ch, 36);
        if (Number.isNaN(d) || d >= b) {
          throw E.valueError("invalid literal for int() with base " + b + ": '" + v + "'",
            Object.assign({}, pos, { hint: b + "-lik tizimda bunday raqam yoʻq." }));
        }
        out = out * BigInt(b) + BigInt(d);
      }
      return neg ? -out : out;
    }
    if (V.isFloat(v)) {
      if (!Number.isFinite(v)) {
        throw E.valueError("cannot convert float infinity to integer", pos);
      }
      return BigInt(Math.trunc(v));
    }
    if (V.isIntLike(v)) return V.toInt(v);
    throw E.typeError("int() argument must be a string or a number, not '" + V.typeName(v) + "'", pos);
  }

  function minMax(name, args, pick, ctx, pos) {
    let items;
    if (args.length === 1) items = [...V.iterate(args[0], pos)];
    else items = args;
    if (!items.length) {
      throw E.valueError(name + "() arg is an empty sequence",
        Object.assign({}, pos, { hint: "Boʻsh roʻyxatning eng kattasi yoʻq. Avval `len(a) > 0` ekanini tekshir." }));
    }
    let best = items[0];
    for (const x of items.slice(1)) {
      const c = V.order(x, best, name === "max" ? ">" : "<", pos);
      if (pick(c)) best = x;
    }
    return best;
  }

  const BUILTINS = {
    // kw — nomli argumentlar: faqat print(…, end=…, sep=…) qo'llanadi (bir satrga chiqarish uchun)
    print(args, ctx, pos, kw) {
      const matn = (nom, standart) => {
        if (!kw || kw[nom] === undefined || kw[nom] === null) return standart;
        if (!V.isStr(kw[nom])) throw E.typeError(nom + " must be None or a string, not " + V.typeName(kw[nom]), pos);
        return kw[nom];
      };
      ctx.write(args.map(V.str).join(matn("sep", " ")) + matn("end", "\n"));
      return null;
    },
    input(args, ctx, pos) {
      arity("input", args, 0, 1, pos);
      if (args.length) ctx.write(V.str(args[0]));
      return ctx.readLine(pos);
    },
    int(args, ctx, pos) {
      arity("int", args, 0, 2, pos);
      if (!args.length) return 0n;
      return toIntValue(args[0], args.length > 1 ? args[1] : undefined, pos);
    },
    str(args, ctx, pos) {
      arity("str", args, 0, 1, pos);
      return args.length ? V.str(args[0]) : "";
    },
    float(args, ctx, pos) {
      arity("float", args, 0, 1, pos);
      if (!args.length) return 0;
      const v = args[0];
      if (V.isStr(v)) {
        const text = v.trim();
        if (!/^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(text)) {
          throw E.valueError("could not convert string to float: '" + v + "'", pos);
        }
        return Number(text);
      }
      if (V.isNum(v)) return V.toNum(v);
      throw E.typeError("float() argument must be a string or a number, not '" + V.typeName(v) + "'", pos);
    },
    bool(args, ctx, pos) {
      arity("bool", args, 0, 1, pos);
      return args.length ? V.truthy(args[0]) : false;
    },
    len(args, ctx, pos) {
      arity("len", args, 1, 1, pos);
      return V.len(args[0], pos);
    },
    abs(args, ctx, pos) {
      arity("abs", args, 1, 1, pos);
      const v = args[0];
      if (!V.isNum(v)) {
        throw E.typeError("bad operand type for abs(): '" + V.typeName(v) + "'", pos);
      }
      if (V.isIntLike(v)) { const n = V.toInt(v); return n < 0n ? -n : n; }
      return Math.abs(v);
    },
    min(args, ctx, pos) { return minMax("min", args, (c) => c < 0, ctx, pos); },
    max(args, ctx, pos) { return minMax("max", args, (c) => c > 0, ctx, pos); },
    sum(args, ctx, pos) {
      arity("sum", args, 1, 2, pos);
      let total = args.length > 1 ? args[1] : 0n;
      for (const x of V.iterate(args[0], pos)) total = V.binary("+", total, x, pos);
      return total;
    },
    sorted(args, ctx, pos) {
      arity("sorted", args, 1, 1, pos);
      const items = [...V.iterate(args[0], pos)];
      return items.sort((a, b) => V.order(a, b, "<", pos));
    },
    range(args, ctx, pos) {
      arity("range", args, 1, 3, pos);
      const nums = args.map((a) => wantInt("range", a, pos));
      const start = args.length > 1 ? nums[0] : 0n;
      const stop = args.length > 1 ? nums[1] : nums[0];
      const step = args.length > 2 ? nums[2] : 1n;
      if (step === 0n) {
        throw E.valueError("range() arg 3 must not be zero",
          Object.assign({}, pos, { hint: "Qadam 0 boʻlsa, sikl hech qachon tugamaydi." }));
      }
      return V.range(start, stop, step);
    },
    // list("abc"), list(range(5)), list(map(int, a)) — ketma-ketlikdan yangi ro'yxat
    list(args, ctx, pos) {
      arity("list", args, 0, 1, pos);
      if (!args.length) return [];
      if (V.isRange(args[0]) && V.rangeLength(args[0]) > BigInt(V.MAX_LEN)) {
        throw E.limitError("roʻyxat juda katta", Object.assign({}, pos, {
          hint: "Bunday uzun roʻyxat xotiraga sigʻmaydi. range ustidan toʻgʻridan-toʻgʻri for bilan yur.",
        }));
      }
      return [...V.iterate(args[0], pos)];
    },
    // map(f, a) ni talqinchi o'zi bajaradi (interpreter.js callMap) — f bolaning funksiyasi ham bo'lishi mumkin.
    // Bu yozuv nom tanilishi uchun turadi.
    map(args, ctx, pos) {
      throw E.typeError("map() must have at least two arguments.", pos);
    },
    ord(args, ctx, pos) {
      arity("ord", args, 1, 1, pos);
      const c = args[0];
      if (!V.isStr(c)) throw E.typeError("ord() expected string of length 1, but " + V.typeName(c) + " found", pos);
      if ([...c].length !== 1) {
        throw E.typeError("ord() expected a character, but string of length " + [...c].length + " found",
          Object.assign({}, pos, { hint: "ord() bitta belgining kodini beradi: ord(\"a\")." }));
      }
      return BigInt(c.codePointAt(0));
    },
    chr(args, ctx, pos) {
      arity("chr", args, 1, 1, pos);
      const n = wantInt("chr", args[0], pos);
      if (n < 0n || n > 0x10ffffn) throw E.valueError("chr() arg not in range(0x110000)", pos);
      return String.fromCodePoint(Number(n));
    },
  };

  const METHODS = {
    list: {
      append(obj, args, ctx, pos) { arity("append", args, 1, 1, pos); obj.push(args[0]); return null; },
      pop(obj, args, ctx, pos) {
        arity("pop", args, 0, 1, pos);
        if (!obj.length) {
          throw E.indexError("pop from empty list",
            Object.assign({}, pos, { hint: "Boʻsh roʻyxatdan olib boʻlmaydi." }));
        }
        if (!args.length) return obj.pop();
        const n = obj.length;
        let k = Number(wantInt("pop", args[0], pos));
        if (k < 0) k += n;
        if (k < 0 || k >= n) throw E.indexError("pop index out of range", pos);
        return obj.splice(k, 1)[0];
      },
    },
    str: {
      upper(obj, args, ctx, pos) { arity("upper", args, 0, 0, pos); return obj.toUpperCase(); },
      lower(obj, args, ctx, pos) { arity("lower", args, 0, 0, pos); return obj.toLowerCase(); },
      count(obj, args, ctx, pos) {
        arity("count", args, 1, 1, pos);
        const sub = args[0];
        if (!V.isStr(sub)) throw E.typeError("must be str, not " + V.typeName(sub), pos);
        if (sub === "") return BigInt(obj.length + 1);
        let n = 0;
        for (let k = 0; k <= obj.length - sub.length; k++) if (obj.startsWith(sub, k)) { n++; k += sub.length - 1; }
        return BigInt(n);
      },
      split(obj, args, ctx, pos) {
        arity("split", args, 0, 1, pos);
        if (!args.length) return obj.split(/\s+/).filter((s) => s !== "");
        const sep = args[0];
        if (!V.isStr(sep)) throw E.typeError("must be str or None, not " + V.typeName(sep), pos);
        if (sep === "") {
          throw E.valueError("empty separator",
            Object.assign({}, pos, { hint: "Ajratuvchi boʻsh boʻlmasligi kerak: `split(\" \")`." }));
        }
        return obj.split(sep);
      },
      // " ".join(["1", "2"]) — satrlarni ajratuvchi bilan birlashtirish (sonlar avval str() qilinadi)
      join(obj, args, ctx, pos) {
        arity("join", args, 1, 1, pos);
        const items = [...V.iterate(args[0], pos)];
        items.forEach((x, k) => {
          if (!V.isStr(x)) {
            throw E.typeError("sequence item " + k + ": expected str instance, " + V.typeName(x) + " found",
              Object.assign({}, pos, { hint: "join faqat satrlarni birlashtiradi. Sonlarni avval satrga aylantir: map(str, a)." }));
          }
        });
        return items.join(obj);
      },
    },
  };

  function callMethod(obj, name, args, ctx, pos) {
    const table = V.isList(obj) ? METHODS.list : V.isStr(obj) ? METHODS.str : null;
    const fn = table && table[name];
    if (!fn) throw attributeError(obj, name, pos);
    return fn(obj, args, ctx, pos);
  }

  const has = (name) => Object.prototype.hasOwnProperty.call(BUILTINS, name);

  const api = { BUILTINS, METHODS, callMethod, has, names: Object.keys(BUILTINS) };

  root.QK = root.QK || {};
  root.QK.python = root.QK.python || {};
  root.QK.python.builtins = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

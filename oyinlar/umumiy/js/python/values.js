// Kichik Python: qiymatlar va ular ustidagi amallar.
// int — BigInt (2 ** 100 aniq chiqadi), float — oddiy son, str — matn, bool, None — null, list — massiv.
// Amallar va chiqarish Pythonning o'zidek bo'lishi kerak: umumiy/tests/python-values.test.js va parity testi tekshiradi.
(function (root) {
  "use strict";

  // Brauzerda skriptlar tartib bilan ulanadi (QK.python.* tayyor), Node'da require ishlaydi
  const E = (root.QK && root.QK.python && root.QK.python.errors) || require("./errors.js");

  const isInt = (v) => typeof v === "bigint";
  const isFloat = (v) => typeof v === "number";
  const isBool = (v) => typeof v === "boolean";
  const isStr = (v) => typeof v === "string";
  const isList = (v) => Array.isArray(v);
  const isNone = (v) => v === null;
  const isRange = (v) => !!v && typeof v === "object" && v.t === "range";
  const isFunc = (v) => !!v && typeof v === "object" && v.t === "func";
  // map(f, a) natijasi: ustidan yurish, list(...), a, b = ... mumkin; indeks va len — Python kabi xato
  const isMap = (v) => !!v && typeof v === "object" && v.t === "map";
  const mapOf = (items) => ({ t: "map", items });
  // bool Pythonda sonning bir turi: True + True = 2
  const isNum = (v) => isInt(v) || isFloat(v) || isBool(v);
  const isIntLike = (v) => isInt(v) || isBool(v);

  function typeName(v) {
    if (isBool(v)) return "bool";
    if (isInt(v)) return "int";
    if (isFloat(v)) return "float";
    if (isStr(v)) return "str";
    if (isNone(v)) return "NoneType";
    if (isList(v)) return "list";
    if (isRange(v)) return "range";
    if (isFunc(v)) return "function";
    if (isMap(v)) return "map";
    return "object";
  }

  const toInt = (v) => (isBool(v) ? (v ? 1n : 0n) : v);
  const toNum = (v) => (isInt(v) ? Number(v) : isBool(v) ? (v ? 1 : 0) : v);

  const range = (start, stop, step) => ({ t: "range", start, stop, step });

  function rangeLength(r) {
    const { start, stop, step } = r;
    const len = step > 0n ? (stop - start + step - 1n) / step : (start - stop - step - 1n) / -step;
    return len > 0n ? len : 0n;
  }

  // — Chiqarish: Python kabi —

  function formatFloat(x) {
    if (Number.isNaN(x)) return "nan";
    if (x === Infinity) return "inf";
    if (x === -Infinity) return "-inf";
    if (x === 0) return Object.is(x, -0) ? "-0.0" : "0.0";
    const ax = Math.abs(x);
    if (ax >= 1e16 || ax < 1e-4) {
      const [m, e] = x.toExponential().split("e");
      const exp = Number(e);
      const digits = String(Math.abs(exp));
      return m + "e" + (exp < 0 ? "-" : "+") + (digits.length < 2 ? "0" + digits : digits);
    }
    const s = String(x);
    return /[.e]/.test(s) ? s : s + ".0";
  }

  function reprStr(s) {
    const q = s.includes("'") && !s.includes('"') ? '"' : "'";
    let out = q;
    for (const ch of s) {
      if (ch === "\\") out += "\\\\";
      else if (ch === q) out += "\\" + q;
      else if (ch === "\n") out += "\\n";
      else if (ch === "\t") out += "\\t";
      else if (ch === "\r") out += "\\r";
      else out += ch;
    }
    return out + q;
  }

  // repr — ro'yxat ichida ko'rinadigan shakl; str — print chiqaradigan shakl
  function repr(v) {
    if (isBool(v)) return v ? "True" : "False";
    if (isInt(v)) return v.toString();
    if (isFloat(v)) return formatFloat(v);
    if (isStr(v)) return reprStr(v);
    if (isNone(v)) return "None";
    if (isList(v)) return "[" + v.map(repr).join(", ") + "]";
    if (isRange(v)) return "range(" + v.start + ", " + v.stop + (v.step === 1n ? "" : ", " + v.step) + ")";
    if (isFunc(v)) return "<function " + v.name + ">";
    if (isMap(v)) return "<map object>";
    return String(v);
  }

  const str = (v) => (isStr(v) ? v : repr(v));

  function truthy(v) {
    if (isBool(v)) return v;
    if (isInt(v)) return v !== 0n;
    if (isFloat(v)) return v !== 0;
    if (isStr(v)) return v.length > 0;
    if (isNone(v)) return false;
    if (isList(v)) return v.length > 0;
    if (isRange(v)) return rangeLength(v) > 0n;
    return true;
  }

  // — Amallar —

  function floorDivInt(a, b, pos) {
    if (b === 0n) throw E.zeroDivisionError("integer division or modulo by zero", pos);
    let q = a / b;
    if (a % b !== 0n && (a < 0n) !== (b < 0n)) q -= 1n;
    return q;
  }

  function floorModInt(a, b, pos) {
    if (b === 0n) throw E.zeroDivisionError("integer division or modulo by zero", pos);
    const r = a % b;
    return r !== 0n && (r < 0n) !== (b < 0n) ? r + b : r;
  }

  // Qiymat hajmi chegarasi: satr/ro'yxat shundan oshsa — Limit xatosi (aks holda brauzer tabi qulaydi)
  const MAX_LEN = 1000000;
  const spaced = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  function hajmTekshir(v, pos) {
    if ((isStr(v) || isList(v)) && v.length > MAX_LEN) {
      throw E.limitError("qiymat juda katta (" + spaced(MAX_LEN) + " dan oshdi)", Object.assign({}, pos || {}, {
        hint: "Satr yoki roʻyxat juda tez oʻsib ketdi. Sikl ichida u har safar ikki baravar boʻlmayaptimi?",
      }));
    }
    return v;
  }

  function repeat(seq, n, pos) {
    if (!isIntLike(n)) {
      throw E.typeError("can't multiply sequence by non-int of type '" + typeName(n) + "'", pos);
    }
    const times = Number(toInt(n));
    if (times <= 0) return isStr(seq) ? "" : [];
    if (seq.length * times > MAX_LEN) hajmTekshir({ length: seq.length * times, [isStr(seq) ? "str" : "list"]: true }, pos);
    if (isStr(seq)) return seq.repeat(times);
    const out = [];
    for (let k = 0; k < times; k++) out.push(...seq);
    return out;
  }

  function binary(op, a, b, pos) {
    if (op === "+") {
      if (isStr(a) || isStr(b)) {
        if (isStr(a) && isStr(b)) return hajmTekshir(a + b, pos);
        if (isStr(a)) throw E.concatError("str", typeName(b), pos);
        throw E.operandError("+", typeName(a), typeName(b), pos);
      }
      if (isList(a) || isList(b)) {
        if (isList(a) && isList(b)) return hajmTekshir(a.concat(b), pos);
        if (isList(a)) throw E.concatError("list", typeName(b), pos);
        throw E.operandError("+", typeName(a), typeName(b), pos);
      }
      if (!isNum(a) || !isNum(b)) throw E.operandError("+", typeName(a), typeName(b), pos);
      return isIntLike(a) && isIntLike(b) ? toInt(a) + toInt(b) : toNum(a) + toNum(b);
    }

    if (op === "*") {
      if (isStr(a) || isList(a)) return repeat(a, b, pos);
      if (isStr(b) || isList(b)) return repeat(b, a, pos);
      if (!isNum(a) || !isNum(b)) throw E.operandError("*", typeName(a), typeName(b), pos);
      return isIntLike(a) && isIntLike(b) ? toInt(a) * toInt(b) : toNum(a) * toNum(b);
    }

    if (!isNum(a) || !isNum(b)) throw E.operandError(op, typeName(a), typeName(b), pos);
    const bothInt = isIntLike(a) && isIntLike(b);

    if (op === "-") return bothInt ? toInt(a) - toInt(b) : toNum(a) - toNum(b);

    if (op === "/") {
      if (toNum(b) === 0) {
        throw E.zeroDivisionError(bothInt ? "division by zero" : "float division by zero", pos);
      }
      return toNum(a) / toNum(b);
    }

    if (op === "//") {
      if (bothInt) return floorDivInt(toInt(a), toInt(b), pos);
      if (toNum(b) === 0) throw E.zeroDivisionError("float floor division by zero", pos);
      return Math.floor(toNum(a) / toNum(b));
    }

    if (op === "%") {
      if (bothInt) return floorModInt(toInt(a), toInt(b), pos);
      if (toNum(b) === 0) throw E.zeroDivisionError("float modulo", pos);
      const x = toNum(a), y = toNum(b);
      return x - Math.floor(x / y) * y;
    }

    if (op === "**") {
      // 10 ** 10 ** 10 kabi daraja JS'ni qulatadi — darajani cheklaymiz (2 ** 100000 hali ham aniq chiqadi)
      if (bothInt && toInt(b) > 100000n && toInt(a) !== 0n && toInt(a) !== 1n && toInt(a) !== -1n) {
        throw E.limitError("daraja juda katta (koʻrsatkich 100 000 dan oshdi)", Object.assign({}, pos || {}, {
          hint: "Bunday katta sonni hisoblab boʻlmaydi. Koʻrsatkich toʻgʻrimi?",
        }));
      }
      if (bothInt && toInt(b) >= 0n) return toInt(a) ** toInt(b);
      return Math.pow(toNum(a), toNum(b));
    }

    throw E.syntaxError("invalid syntax", pos);
  }

  function unary(op, a, pos) {
    if (op === "not") return !truthy(a);
    if (!isNum(a)) throw E.typeError("bad operand type for unary " + op + ": '" + typeName(a) + "'", pos);
    if (op === "-") return isIntLike(a) ? -toInt(a) : -toNum(a);
    return isIntLike(a) ? toInt(a) : toNum(a);
  }

  function eq(a, b) {
    if (isNum(a) && isNum(b)) {
      return isIntLike(a) && isIntLike(b) ? toInt(a) === toInt(b) : toNum(a) === toNum(b);
    }
    if (isStr(a) && isStr(b)) return a === b;
    if (isNone(a) || isNone(b)) return isNone(a) && isNone(b);
    if (isList(a) && isList(b)) return a.length === b.length && a.every((x, k) => eq(x, b[k]));
    if (isRange(a) && isRange(b)) return a.start === b.start && a.stop === b.stop && a.step === b.step;
    return false;
  }

  // -1, 0, 1 qaytaradi; solishtirib bo'lmasa — xato
  function order(a, b, op, pos) {
    if (isNum(a) && isNum(b)) {
      if (isIntLike(a) && isIntLike(b)) {
        const x = toInt(a), y = toInt(b);
        return x < y ? -1 : x > y ? 1 : 0;
      }
      const x = toNum(a), y = toNum(b);
      return x < y ? -1 : x > y ? 1 : 0;
    }
    if (isStr(a) && isStr(b)) return a < b ? -1 : a > b ? 1 : 0;
    if (isList(a) && isList(b)) {
      const n = Math.min(a.length, b.length);
      for (let k = 0; k < n; k++) {
        if (!eq(a[k], b[k])) return order(a[k], b[k], op, pos);
      }
      return a.length < b.length ? -1 : a.length > b.length ? 1 : 0;
    }
    throw E.compareError(op, typeName(a), typeName(b), pos);
  }

  function compare(op, a, b, pos) {
    if (op === "==") return eq(a, b);
    if (op === "!=") return !eq(a, b);
    const c = order(a, b, op, pos);
    if (op === "<") return c < 0;
    if (op === "<=") return c <= 0;
    if (op === ">") return c > 0;
    if (op === ">=") return c >= 0;
    throw E.syntaxError("invalid syntax", pos);
  }

  function contains(item, box, pos) {
    if (isStr(box)) {
      if (!isStr(item)) {
        throw E.typeError("'in <string>' requires string as left operand, not " + typeName(item), pos);
      }
      return box.includes(item);
    }
    if (isList(box)) return box.some((x) => eq(x, item));
    if (isRange(box)) {
      // Python kabi O(1): range ustida yurmaymiz (-1 in range(10**9) bir zumda)
      if (!isIntLike(item)) {
        if (!isNum(item)) return false;
        for (const v of iterate(box, pos)) if (eq(v, item)) return true;
        return false;
      }
      const x = toInt(item);
      const { start, stop, step } = box;
      const ichida = step > 0n ? x >= start && x < stop : x <= start && x > stop;
      return ichida && (x - start) % step === 0n;
    }
    throw E.typeError("argument of type '" + typeName(box) + "' is not iterable", pos);
  }

  function len(v, pos) {
    if (isStr(v)) return BigInt(v.length);
    if (isList(v)) return BigInt(v.length);
    if (isRange(v)) return rangeLength(v);
    throw E.typeError("object of type '" + typeName(v) + "' has no len()", pos);
  }

  function indexNumber(box, idx, pos) {
    if (!isIntLike(idx)) {
      const what = isStr(box)
        ? "string indices must be integers"
        : "list indices must be integers or slices, not " + typeName(idx);
      throw E.typeError(what, pos);
    }
    const n = Number(len(box, pos));
    let k = Number(toInt(idx));
    if (k < 0) k += n;
    if (k < 0 || k >= n) {
      throw E.indexError(isStr(box) ? "string index out of range" : "list index out of range", pos);
    }
    return k;
  }

  function getIndex(box, idx, pos) {
    if (isStr(box)) return box[indexNumber(box, idx, pos)];
    if (isList(box)) return box[indexNumber(box, idx, pos)];
    if (isRange(box)) {
      const k = indexNumber(box, idx, pos);
      return box.start + BigInt(k) * box.step;
    }
    throw E.typeError("'" + typeName(box) + "' object is not subscriptable", pos);
  }

  function setIndex(box, idx, value, pos) {
    if (isList(box)) {
      box[indexNumber(box, idx, pos)] = value;
      return;
    }
    if (isStr(box)) throw E.typeError("'str' object does not support item assignment", pos);
    throw E.typeError("'" + typeName(box) + "' object does not support item assignment", pos);
  }

  // Kesish: a[i:j]. Python kabi chegaralarga bosiladi, xato bermaydi.
  function getSlice(box, from, to, pos) {
    if (!isStr(box) && !isList(box)) {
      throw E.typeError("'" + typeName(box) + "' object is not subscriptable", pos);
    }
    const n = box.length;
    const clamp = (v, def) => {
      if (v === null || v === undefined) return def;
      if (!isIntLike(v)) throw E.typeError("slice indices must be integers or None", pos);
      let k = Number(toInt(v));
      if (k < 0) k += n;
      return Math.min(Math.max(k, 0), n);
    };
    const a = clamp(from, 0);
    const b = clamp(to, n);
    return box.slice(a, Math.max(a, b));
  }

  function* iterate(v, pos) {
    if (isStr(v)) {
      for (const ch of v) yield ch;
      return;
    }
    if (isList(v)) {
      for (const x of v.slice()) yield x;
      return;
    }
    if (isMap(v)) {
      for (const x of v.items) yield x;
      return;
    }
    if (isRange(v)) {
      const { start, stop, step } = v;
      if (step > 0n) for (let k = start; k < stop; k += step) yield k;
      else for (let k = start; k > stop; k += step) yield k;
      return;
    }
    throw E.typeError("'" + typeName(v) + "' object is not iterable", pos);
  }

  const api = {
    isInt, isFloat, isBool, isStr, isList, isNone, isRange, isFunc, isMap, mapOf, isNum, isIntLike,
    typeName, toInt, toNum, range, rangeLength, MAX_LEN,
    formatFloat, reprStr, repr, str, truthy,
    binary, unary, eq, order, compare, contains, len,
    getIndex, setIndex, getSlice, iterate,
  };

  root.QK = root.QK || {};
  root.QK.python = root.QK.python || {};
  root.QK.python.values = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

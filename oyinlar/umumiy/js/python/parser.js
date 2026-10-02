// Kichik Python: tokenlardan daraxt (AST) yasash.
// Ifodalar ustuvorlik bo'yicha: or < and < not < solishtirish < + − < * / // % < unar − < ** < chaqiruv/indeks.
// Buyruqlar indent/dedent bo'yicha bloklarga yig'iladi.
(function (root) {
  "use strict";

  // Brauzerda skriptlar tartib bilan ulanadi (QK.python.* tayyor), Node'da require ishlaydi
  const E = (root.QK && root.QK.python && root.QK.python.errors) || require("./errors.js");

  const COMPARE_OPS = ["==", "!=", "<", "<=", ">", ">="];
  const AUG_OPS = ["+=", "-=", "*=", "/=", "//=", "%=", "**="];
  const ADD_OPS = ["+", "-"];
  const MUL_OPS = ["*", "/", "//", "%"];

  function parse(tokens) {
    let pos = 0;

    const peek = (k) => tokens[Math.min(pos + (k || 0), tokens.length - 1)];
    const here = () => peek(0);
    const at = (type, value) => here().type === type && (value === undefined || here().value === value);
    const atOp = (...ops) => here().type === "op" && ops.includes(here().value);
    const next = () => tokens[pos++];
    const where = (tok) => ({ line: (tok || here()).line, col: (tok || here()).col });

    function expectOp(op, hint) {
      if (!atOp(op)) {
        if (op === ":" && atOp("=")) {
          throw E.syntaxError("invalid syntax. Maybe you meant '==' or ':=' instead of '='?", Object.assign(where(), {
            hint: "Solishtirish uchun **ikkita** teng kerak: `==`. Bitta teng (`=`) — qutiga qiymat berish.",
          }));
        }
        throw E.syntaxError("expected '" + op + "'", Object.assign(where(), { hint: hint || "" }));
      }
      return next();
    }

    function expectName(what) {
      if (!at("name")) {
        throw E.syntaxError("invalid syntax", Object.assign(where(), {
          hint: what || "Bu yerda nom kutilgan edi.",
        }));
      }
      return next();
    }

    function expectNewline() {
      if (at("newline")) { next(); return; }
      if (at("eof") || at("dedent")) return;
      throw E.syntaxError("invalid syntax", Object.assign(where(), {
        hint: "Bitta satrda bitta buyruq yoziladi. Keyingisini yangi satrga yoz.",
      }));
    }

    // — Ifodalar —

    function parseAtom() {
      const tok = here();
      if (tok.type === "num") { next(); return { t: "Num", value: tok.value, ...where(tok) }; }
      if (tok.type === "str") {
        next();
        // Pythonda yonma-yon yozilgan satrlar qo'shilib ketadi: "a" "b" → "ab"
        let text = tok.value;
        while (at("str")) text += next().value;
        return { t: "Str", value: text, ...where(tok) };
      }
      if (tok.type === "name") { next(); return { t: "Name", id: tok.value, ...where(tok) }; }
      if (tok.type === "kw" && (tok.value === "True" || tok.value === "False" || tok.value === "None")) {
        next();
        const value = tok.value === "True" ? true : tok.value === "False" ? false : null;
        return { t: "Const", value, ...where(tok) };
      }
      if (atOp("(")) {
        next();
        const inner = parseExprList();
        if (inner.t === "Tuple") {
          throw E.notYet("qavs ichida vergul bilan yozilgan juftlik (tuple)", "roʻyxat: [1, 2]", where(tok));
        }
        expectOp(")", "Ochilgan `(` yopilmagan.");
        return inner;
      }
      if (atOp("[")) {
        next();
        const items = [];
        while (!atOp("]")) {
          items.push(parseExpr());
          if (atOp(",")) next();
          else break;
        }
        expectOp("]", "Roʻyxat `]` bilan yopiladi.");
        return { t: "List", items, ...where(tok) };
      }
      if (tok.type === "kw") {
        throw E.syntaxError("invalid syntax", Object.assign(where(tok), {
          hint: "`" + tok.value + "` bu yerda kutilmagan edi.",
        }));
      }
      if (tok.type === "newline" || tok.type === "eof") {
        throw E.syntaxError("invalid syntax", Object.assign(where(tok), {
          hint: "Satr tugab qoldi: amaldan keyin qiymat kutilgan edi.",
        }));
      }
      throw E.syntaxError("invalid syntax", Object.assign(where(tok), {
        hint: "`" + tok.value + "` bu yerda tushunarsiz.",
      }));
    }

    // chaqiruv, indeks, kesish va metod: a(1), a[0], a[1:3], a.append(2)
    function parseTrailer() {
      let node = parseAtom();
      for (;;) {
        if (atOp("(")) {
          const open = next();
          const args = [];
          // Nomli argumentlar (end=" ") alohida yig'iladi; qaysi funksiyada ruxsat borligini talqinchi hal qiladi
          const kwargs = [];
          while (!atOp(")")) {
            if (at("name") && peek(1).type === "op" && peek(1).value === "=") {
              const nameTok = next();
              next(); // "="
              kwargs.push({ name: nameTok.value, value: parseExpr(), ...where(nameTok) });
            } else {
              if (kwargs.length) {
                throw E.syntaxError("positional argument follows keyword argument", Object.assign(where(), {
                  hint: "Nomli argument (end=…) oxirida yoziladi: print(a, b, end=\" \").",
                }));
              }
              args.push(parseExpr());
            }
            if (atOp(",")) next();
            else break;
          }
          expectOp(")", "Chaqiruvda ochilgan `(` yopilmagan.");
          node = { t: "Call", func: node, args, kwargs, ...where(open) };
          continue;
        }
        if (atOp("[")) {
          const open = next();
          let from = null;
          if (!atOp(":")) from = parseExpr();
          if (atOp(":")) {
            next();
            let to = null;
            if (!atOp("]")) to = parseExpr();
            expectOp("]", "Kesishda `]` yopilmagan.");
            node = { t: "Slice", value: node, from, to, ...where(open) };
            continue;
          }
          expectOp("]", "Indeksda `]` yopilmagan.");
          node = { t: "Index", value: node, index: from, ...where(open) };
          continue;
        }
        if (atOp(".")) {
          const dot = next();
          const name = expectName("Nuqtadan keyin metod nomi kerak: `a.append(5)`.");
          node = { t: "Attribute", value: node, attr: name.value, ...where(dot) };
          continue;
        }
        return node;
      }
    }

    function parsePower() {
      const base = parseTrailer();
      if (atOp("**")) {
        const op = next();
        // ** o'ngga bog'lanadi va o'ng tomonida unar minus bo'lishi mumkin: 2 ** -1
        const right = parseUnary();
        return { t: "BinOp", op: "**", left: base, right, ...where(op) };
      }
      return base;
    }

    function parseUnary() {
      if (atOp("-") || atOp("+")) {
        const op = next();
        return { t: "UnaryOp", op: op.value, operand: parseUnary(), ...where(op) };
      }
      return parsePower();
    }

    function parseBinary(sub, ops) {
      let left = sub();
      while (here().type === "op" && ops.includes(here().value)) {
        const op = next();
        left = { t: "BinOp", op: op.value, left, right: sub(), ...where(op) };
      }
      return left;
    }

    const parseTerm = () => parseBinary(parseUnary, MUL_OPS);
    const parseArith = () => parseBinary(parseTerm, ADD_OPS);

    function parseComparison() {
      const left = parseArith();
      const ops = [];
      const comparators = [];
      for (;;) {
        let op = null;
        if (here().type === "op" && COMPARE_OPS.includes(here().value)) op = next().value;
        else if (at("kw", "in")) { next(); op = "in"; }
        else if (at("kw", "not") && peek(1).type === "kw" && peek(1).value === "in") { next(); next(); op = "not in"; }
        else break;
        comparators.push(parseArith());
        ops.push(op);
      }
      if (!ops.length) return left;
      return { t: "Compare", left, ops, comparators, line: left.line, col: left.col };
    }

    function parseNot() {
      if (at("kw", "not")) {
        const op = next();
        return { t: "UnaryOp", op: "not", operand: parseNot(), ...where(op) };
      }
      return parseComparison();
    }

    function parseBool(sub, word) {
      let left = sub();
      while (at("kw", word)) {
        const op = next();
        const values = [left, sub()];
        while (at("kw", word)) { next(); values.push(sub()); }
        left = { t: "BoolOp", op: word, values, ...where(op) };
      }
      return left;
    }

    const parseAnd = () => parseBool(parseNot, "and");
    const parseExpr = () => parseBool(parseAnd, "or");

    // vergul bilan ajratilgan ro'yxat: a, b = b, a
    function parseExprList() {
      const first = parseExpr();
      if (!atOp(",")) return first;
      const items = [first];
      while (atOp(",")) {
        next();
        if (atOp("=") || at("newline")) break;
        items.push(parseExpr());
      }
      return { t: "Tuple", items, line: first.line, col: first.col };
    }

    // — Buyruqlar —

    const TARGETS = ["Name", "Index"];

    function checkTarget(node) {
      const items = node.t === "Tuple" ? node.items : [node];
      for (const item of items) {
        if (!TARGETS.includes(item.t)) {
          throw E.syntaxError("cannot assign to expression here. Maybe you meant '==' instead of '='?", {
            line: item.line, col: item.col,
            hint: "Chap tomonda quti nomi turishi kerak: `x = 5`. Solishtirish uchun `==` ishlatiladi.",
          });
        }
      }
      return node;
    }

    function parseSuite(keyword, line) {
      expectOp(":", "`" + keyword + "` satri ikki nuqta bilan tugaydi: `" + keyword + " …:`");
      if (!at("newline")) {
        const single = parseSimpleStatement();
        return [single];
      }
      next();
      if (!at("indent")) {
        throw E.indentationError("expected an indented block after '" + keyword + "' statement on line " + line, Object.assign(where(), {
          hint: "`" + keyword + "` ichidagi satrlar 4 boʻshliq ichkariga suriladi.",
        }));
      }
      next();
      const body = [];
      while (!at("dedent") && !at("eof")) body.push(parseStatement());
      if (at("dedent")) next();
      return body;
    }

    function parseSimpleStatement() {
      const start = here();
      const first = parseExprList();

      if (atOp("=")) {
        const targets = [checkTarget(first)];
        let value = null;
        while (atOp("=")) {
          next();
          value = parseExprList();
          if (atOp("=")) targets.push(checkTarget(value));
        }
        expectNewline();
        return { t: "Assign", targets, value, line: start.line, col: start.col };
      }

      if (here().type === "op" && AUG_OPS.includes(here().value)) {
        const op = next();
        checkTarget(first);
        if (first.t === "Tuple") {
          throw E.syntaxError("invalid syntax", Object.assign(where(op), {
            hint: "`" + op.value + "` bitta quti uchun ishlaydi.",
          }));
        }
        const value = parseExpr();
        expectNewline();
        return { t: "AugAssign", op: op.value.slice(0, -1), target: first, value, line: start.line, col: start.col };
      }

      expectNewline();
      return { t: "Expr", value: first, line: start.line, col: start.col };
    }

    function parseIf(keyword) {
      const tok = next(); // if / elif
      const test = parseExpr();
      const body = parseSuite(keyword, tok.line);
      let orelse = [];
      if (at("kw", "elif")) orelse = [parseIf("elif")];
      else if (at("kw", "else")) {
        const els = next();
        orelse = parseSuite("else", els.line);
      }
      return { t: "If", test, body, orelse, line: tok.line, col: tok.col };
    }

    function parseStatement() {
      if (at("indent")) {
        throw E.indentationError("unexpected indent", Object.assign(where(), {
          hint: "Bu satr keraksiz ichkariga surilgan. Yuqoridagi satr bilan tekislab qoʻy.",
        }));
      }
      if (at("newline")) { next(); return { t: "Pass", ...where() }; }

      if (at("kw", "if")) return parseIf("if");

      if (at("kw", "while")) {
        const tok = next();
        const test = parseExpr();
        const body = parseSuite("while", tok.line);
        return { t: "While", test, body, line: tok.line, col: tok.col };
      }

      if (at("kw", "for")) {
        const tok = next();
        const name = expectName("`for` dan keyin oʻzgaruvchi nomi kerak: `for i in range(5):`");
        if (atOp(",")) {
          throw E.notYet("bir vaqtda ikki oʻzgaruvchili for", "for i in range(len(a)): … a[i] …", where());
        }
        if (!at("kw", "in")) {
          throw E.syntaxError("invalid syntax", Object.assign(where(), {
            hint: "`for` shunday yoziladi: `for i in range(5):`",
          }));
        }
        next();
        const iter = parseExpr();
        const body = parseSuite("for", tok.line);
        return { t: "For", target: { t: "Name", id: name.value, line: name.line, col: name.col }, iter, body, line: tok.line, col: tok.col };
      }

      if (at("kw", "def")) {
        const tok = next();
        const name = expectName("`def` dan keyin funksiya nomi kerak: `def salom():`");
        expectOp("(", "Funksiya nomidan keyin qavs ochiladi: `def salom():`");
        const params = [];
        while (!atOp(")")) {
          const p = expectName("Qavs ichida parametr nomi kutilgan edi.");
          if (atOp("=")) throw E.notYet("standart qiymatli parametr", "qiymatni chaqirganda ber: salom(5)", where());
          params.push(p.value);
          if (atOp(",")) next();
          else break;
        }
        expectOp(")", "Parametrlar qavsi yopilmagan.");
        const body = parseSuite("def", tok.line);
        return { t: "FunctionDef", name: name.value, params, body, line: tok.line, col: tok.col };
      }

      if (at("kw", "return")) {
        const tok = next();
        const value = at("newline") || at("eof") ? null : parseExprList();
        expectNewline();
        return { t: "Return", value, line: tok.line, col: tok.col };
      }

      if (at("kw", "break") || at("kw", "continue") || at("kw", "pass")) {
        const tok = next();
        const kind = tok.value === "break" ? "Break" : tok.value === "continue" ? "Continue" : "Pass";
        expectNewline();
        return { t: kind, line: tok.line, col: tok.col };
      }

      if (at("kw", "elif") || at("kw", "else")) {
        throw E.syntaxError("invalid syntax", Object.assign(where(), {
          hint: "`" + here().value + "` faqat `if` dan keyin keladi va u bilan bir xil otstupda turadi.",
        }));
      }

      return parseSimpleStatement();
    }

    const body = [];
    while (!at("eof")) {
      if (at("newline")) { next(); continue; }
      body.push(parseStatement());
    }
    return { t: "Module", body };
  }

  const api = { parse };

  root.QK = root.QK || {};
  root.QK.python = root.QK.python || {};
  root.QK.python.parser = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

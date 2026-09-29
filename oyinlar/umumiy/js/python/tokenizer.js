// Kichik Python: kodni belgilarga (token) ajratish.
// Otstupdan indent/dedent yasaydi, har tokenda satr va ustun raqami saqlanadi (xato ko'rsatish uchun).
// Qo'llanmagan sintaksis shu yerda tutiladi va "hali yo'q" xabari beriladi.
(function (root) {
  "use strict";

  // Brauzerda skriptlar tartib bilan ulanadi (QK.python.* tayyor), Node'da require ishlaydi
  const E = (root.QK && root.QK.python && root.QK.python.errors) || require("./errors.js");

  const KEYWORDS = [
    "if", "elif", "else", "while", "for", "in", "break", "continue",
    "pass", "def", "return", "and", "or", "not", "True", "False", "None",
  ];

  // Uzunroq belgilar oldin turishi shart: "//=" dan oldin "//" tekshirilmasin
  const OPS = [
    "//=", "**=", "==", "!=", "<=", ">=", "+=", "-=", "*=", "/=", "%=", "//", "**",
    "+", "-", "*", "/", "%", "<", ">", "=", "(", ")", "[", "]", ":", ",", ".",
  ];

  // Pythonda bor, bizda hali yo'q — har biriga tushunarli javob
  const NOT_YET_OPS = {
    "{": ["lugʻat va toʻplam ({ })", "roʻyxat: [1, 2, 3]"],
    "}": ["lugʻat va toʻplam ({ })", "roʻyxat: [1, 2, 3]"],
    ";": ["bitta satrda ikki buyruq (;)", "har buyruqni alohida satrga yoz"],
    "&": ["bitlar ustida amal (&)", "mantiq uchun: and"],
    "|": ["bitlar ustida amal (|)", "mantiq uchun: or"],
    "^": ["bitlar ustida amal (^)", "daraja uchun: 2 ** 3"],
    "~": ["bitni teskari qilish (~)", "mantiq uchun: not"],
    "@": ["dekorator (@)", ""],
    "\\": ["satrni koʻchirish (\\)", "butun ifodani bitta satrda yoz"],
    "!": ["! belgisi", "teng emas: !="],
  };

  // Pythonning kalit so'zlari, lekin bu saytda hali yo'q: nomdek emas, tushunarli xabar beriladi
  const NOT_YET_WORDS = {
    import: ["kutubxona ulash (import)", "kerakli amallarni oʻzing yoz"],
    from: ["kutubxona ulash (from … import)", "kerakli amallarni oʻzing yoz"],
    class: ["sinf (class)", "hozircha funksiya yetarli: def"],
    lambda: ["lambda", "funksiyani def bilan yoz"],
    global: ["global", "qiymatni funksiyadan return bilan qaytar"],
    nonlocal: ["nonlocal", "qiymatni funksiyadan return bilan qaytar"],
    try: ["xatoni ushlash (try/except)", "shart bilan tekshir: if"],
    except: ["xatoni ushlash (try/except)", "shart bilan tekshir: if"],
    finally: ["xatoni ushlash (try/finally)", "shart bilan tekshir: if"],
    raise: ["xato chiqarish (raise)", ""],
    with: ["with", ""],
    as: ["as", ""],
    is: ["is", "tenglikni tekshirish uchun: =="],
    del: ["del", "roʻyxatdan olib tashlash: a.pop()"],
    assert: ["assert", "shart bilan tekshir: if"],
    yield: ["yield", "qiymatni return bilan qaytar"],
    async: ["async", ""],
    await: ["await", ""],
  };

  const isDigit = (ch) => ch >= "0" && ch <= "9";
  const isNameStart = (ch) => !!ch && (/[A-Za-z_]/.test(ch) || ch.charCodeAt(0) > 127);
  const isNameChar = (ch) => !!ch && (isNameStart(ch) || isDigit(ch));
  // f"..." va r"..." kabi old qo'shimchalar
  const STR_PREFIX = /^(f|F|r|R|b|B|u|U|rf|fr|rb|br)$/;

  function tokenize(src) {
    const lines = String(src).split(/\r\n|\r|\n/);
    const tokens = [];
    const indents = [0];
    let depth = 0; // ochiq qavslar soni: ichida satr ko'chishi e'tiborga olinmaydi

    const push = (type, value, line, col) => tokens.push({ type, value, line, col });
    const lastType = () => (tokens.length ? tokens[tokens.length - 1].type : "newline");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNo = i + 1;
      let col = 0;

      while (col < line.length && (line[col] === " " || line[col] === "\t")) {
        if (line[col] === "\t" && depth === 0) {
          throw E.indentationError("tabs are not allowed in indentation", {
            line: lineNo, col: col + 1,
            hint: "Otstup uchun Tab emas, 4 boʻshliq ishlatiladi. Muharrirda Tab bosilsa, 4 boʻshliq qoʻyiladi.",
          });
        }
        col++;
      }

      const rest = line.slice(col);
      if (depth === 0) {
        if (rest === "" || rest.startsWith("#")) continue; // bo'sh satr va izoh e'tiborga olinmaydi
        const width = col;
        const top = () => indents[indents.length - 1];
        if (width > top()) {
          indents.push(width);
          push("indent", width, lineNo, col + 1);
        } else {
          while (width < top()) {
            indents.pop();
            push("dedent", width, lineNo, col + 1);
          }
          if (width !== top()) {
            throw E.indentationError("unindent does not match any outer indentation level", {
              line: lineNo, col: col + 1,
              hint: "Bu satr yuqoridagi bloklarning hech biriga tekislanmadi. Otstupni 4 ning karraliga tenglashtir.",
            });
          }
        }
      }

      const startedAt = tokens.length;

      while (col < line.length) {
        const ch = line[col];
        if (ch === " " || ch === "\t") { col++; continue; }
        if (ch === "#") break;
        const start = col;

        // — son —
        if (isDigit(ch) || (ch === "." && isDigit(line[col + 1]))) {
          if (ch === "0" && (line[col + 1] === "x" || line[col + 1] === "b" || line[col + 1] === "o")) {
            throw E.notYet("boshqa sanoq tizimidagi yozuv (" + line.slice(col, col + 2) + "…)",
              "oddiy oʻnlik son: 10", { line: lineNo, col: col + 1 });
          }
          let j = col;
          while (isDigit(line[j]) || line[j] === "_") j++;
          let isFloatNum = false;
          if (line[j] === "." && !isNameStart(line[j + 1])) {
            isFloatNum = true;
            j++;
            while (isDigit(line[j]) || line[j] === "_") j++;
          }
          if ((line[j] === "e" || line[j] === "E")
              && (isDigit(line[j + 1]) || ((line[j + 1] === "+" || line[j + 1] === "-") && isDigit(line[j + 2])))) {
            isFloatNum = true;
            j += 2;
            while (isDigit(line[j])) j++;
          }
          const text = line.slice(col, j).replace(/_/g, "");
          if (!isFloatNum && text.length > 1 && text[0] === "0" && /^[0-9]+$/.test(text)) {
            throw E.syntaxError("leading zeros in decimal integer literals are not permitted", {
              line: lineNo, col: col + 1,
              hint: "Son 0 bilan boshlanmaydi: 7 deb yoz, 07 emas.",
            });
          }
          push("num", isFloatNum ? Number(text) : BigInt(text), lineNo, start + 1);
          col = j;
          continue;
        }

        // — nom va kalit so'z —
        if (isNameStart(ch)) {
          let j = col;
          while (isNameChar(line[j])) j++;
          const word = line.slice(col, j);
          if (STR_PREFIX.test(word) && (line[j] === '"' || line[j] === "'")) {
            const what = word.toLowerCase().includes("f") ? "f-satr (f\"…\")" : word + "\"…\" koʻrinishidagi satr";
            throw E.notYet(what, "print(\"javob:\", x)", { line: lineNo, col: start + 1 });
          }
          const unknown = Object.prototype.hasOwnProperty.call(NOT_YET_WORDS, word) && NOT_YET_WORDS[word];
          if (unknown) throw E.notYet(unknown[0], unknown[1], { line: lineNo, col: start + 1 });
          push(KEYWORDS.includes(word) ? "kw" : "name", word, lineNo, start + 1);
          col = j;
          continue;
        }

        // — matn —
        if (ch === '"' || ch === "'") {
          if (line[col + 1] === ch && line[col + 2] === ch) {
            throw E.notYet("uch qoʻshtirnoqli satr (\"\"\"…\"\"\")", "oddiy satr: \"matn\"", { line: lineNo, col: start + 1 });
          }
          let j = col + 1;
          let out = "";
          let closed = false;
          while (j < line.length) {
            const c = line[j];
            if (c === "\\") {
              const next = line[j + 1];
              if (next === "n") out += "\n";
              else if (next === "t") out += "\t";
              else if (next === "r") out += "\r";
              else if (next === "\\") out += "\\";
              else if (next === "'" || next === '"') out += next;
              else out += "\\" + (next || "");
              j += 2;
              continue;
            }
            if (c === ch) { closed = true; j++; break; }
            out += c;
            j++;
          }
          if (!closed) {
            throw E.syntaxError("unterminated string literal (detected at line " + lineNo + ")", {
              line: lineNo, col: start + 1,
              hint: "Qoʻshtirnoq yopilmagan. Matn boshida qanday qoʻshtirnoq boʻlsa, oxirida ham shunaqasi boʻlishi kerak.",
            });
          }
          push("str", out, lineNo, start + 1);
          col = j;
          continue;
        }

        // — belgilar —
        const notYet = NOT_YET_OPS[ch];
        if (notYet && !(ch === "!" && line[col + 1] === "=")) {
          throw E.notYet(notYet[0], notYet[1], { line: lineNo, col: start + 1 });
        }
        const op = OPS.find((o) => line.startsWith(o, col));
        if (!op) {
          throw E.syntaxError("invalid syntax", {
            line: lineNo, col: start + 1,
            hint: "`" + ch + "` belgisi bu yerda tushunarsiz.",
          });
        }
        if (op === "(" || op === "[") depth++;
        if (op === ")" || op === "]") depth = Math.max(0, depth - 1);
        push("op", op, lineNo, start + 1);
        col += op.length;
      }

      if (depth === 0 && tokens.length > startedAt) push("newline", "", lineNo, line.length + 1);
    }

    if (depth > 0) {
      throw E.syntaxError("'(' was never closed", {
        line: lines.length, col: 1,
        hint: "Qavs yopilmagan. Har ochilgan `(` yoki `[` uchun yopilgani boʻlishi kerak.",
      });
    }
    const endLine = lines.length;
    if (lastType() !== "newline" && tokens.length) push("newline", "", endLine, 1);
    while (indents.length > 1) {
      indents.pop();
      push("dedent", 0, endLine, 1);
    }
    push("eof", "", endLine, 1);
    return tokens;
  }

  const api = { tokenize, KEYWORDS, OPS, NOT_YET_WORDS };

  root.QK = root.QK || {};
  root.QK.python = root.QK.python || {};
  root.QK.python.tokenizer = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

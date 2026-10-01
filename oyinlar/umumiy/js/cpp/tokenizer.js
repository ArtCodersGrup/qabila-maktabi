// Kichik C++: kodni tokenlarga ajratish.
// C++ da otstup muhim emas (Pythondan farqi) — shuning uchun bu qism Pythonnikidan sodda:
// yangi satr oddiy bo'shliq, blok esa { } bilan belgilanadi.
(function (root) {
  "use strict";

  const E = (root.QK && root.QK.cppEngine && root.QK.cppEngine.errors) || require("./errors.js");

  const KALIT = new Set([
    "int", "long", "double", "float", "char", "bool", "string", "void", "auto", "unsigned", "const",
    "if", "else", "while", "for", "do", "break", "continue", "return",
    "using", "namespace", "true", "false",
    // yadroda yo'q, lekin tanilishi kerak — tushunarli xabar berish uchun
    "vector", "struct", "class", "template", "new", "delete", "map", "set", "pair",
  ]);

  // Uzun belgilar oldin tekshiriladi: "<<=" bo'lmasa ham "<<" "<=" dan oldin turadi
  const BELGILAR = [
    "<<", ">>", "++", "--", "+=", "-=", "*=", "/=", "%=", "==", "!=", "<=", ">=", "&&", "||",
    "+", "-", "*", "/", "%", "=", "<", ">", "!", "(", ")", "{", "}", "[", "]", ";", ",", ".", ":", "?", "&",
  ];

  function tokenize(code) {
    const src = String(code).replace(/\r\n?/g, "\n");
    const tokens = [];
    let i = 0;
    let line = 1;
    let col = 1;
    const joy = () => ({ line, col });
    const push = (type, value, pos) => tokens.push({ type, value, line: pos.line, col: pos.col });
    const olga = (n) => {
      for (let k = 0; k < n; k++) {
        if (src[i] === "\n") { line++; col = 1; } else col++;
        i++;
      }
    };

    while (i < src.length) {
      const ch = src[i];

      // Bo'shliq va yangi satr
      if (ch === " " || ch === "\t" || ch === "\n") { olga(1); continue; }

      // Izohlar
      if (ch === "/" && src[i + 1] === "/") {
        while (i < src.length && src[i] !== "\n") olga(1);
        continue;
      }
      if (ch === "/" && src[i + 1] === "*") {
        const pos = joy();
        olga(2);
        while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) olga(1);
        if (i >= src.length) throw E.sintaksis("unterminated /* comment", pos);
        olga(2);
        continue;
      }

      // Preprotsessor: #include <iostream> — butun satr bitta token
      if (ch === "#") {
        const pos = joy();
        let j = i;
        while (j < src.length && src[j] !== "\n") j++;
        push("pre", src.slice(i, j).trim(), pos);
        olga(j - i);
        continue;
      }

      // Son: 12, 12.5
      if (ch >= "0" && ch <= "9") {
        const pos = joy();
        let j = i;
        while (j < src.length && /[0-9]/.test(src[j])) j++;
        let kasr = false;
        if (src[j] === "." && /[0-9]/.test(src[j + 1] || "")) {
          kasr = true;
          j++;
          while (j < src.length && /[0-9]/.test(src[j])) j++;
        }
        const matn = src.slice(i, j);
        push(kasr ? "double" : "int", matn, pos);
        olga(j - i);
        continue;
      }

      // Matn: "salom\n"
      if (ch === '"') {
        const pos = joy();
        let j = i + 1;
        let qiymat = "";
        while (j < src.length && src[j] !== '"') {
          if (src[j] === "\\") {
            const keyin = src[j + 1];
            qiymat += keyin === "n" ? "\n" : keyin === "t" ? "\t" : keyin === "\\" ? "\\" : keyin === '"' ? '"' : keyin;
            j += 2;
            continue;
          }
          if (src[j] === "\n") throw E.sintaksis("missing terminating '\"' character", pos);
          qiymat += src[j];
          j++;
        }
        if (j >= src.length) throw E.sintaksis("missing terminating '\"' character", pos);
        push("satr", qiymat, pos);
        tokens[tokens.length - 1].uzunlik = j + 1 - i; // manbadagi uzunligi (xato joyini aniq ko'rsatish uchun)
        olga(j + 1 - i);
        continue;
      }

      // Belgi: 'a'
      if (ch === "'") {
        const pos = joy();
        let j = i + 1;
        let qiymat = "";
        if (src[j] === "\\") {
          const keyin = src[j + 1];
          qiymat = keyin === "n" ? "\n" : keyin === "t" ? "\t" : keyin === "0" ? "\0" : keyin;
          j += 2;
        } else {
          qiymat = src[j];
          j++;
        }
        if (src[j] !== "'") throw E.sintaksis("missing terminating ' character", pos);
        push("belgi", qiymat, pos);
        tokens[tokens.length - 1].uzunlik = j + 1 - i;
        olga(j + 1 - i);
        continue;
      }

      // Nom yoki kalit so'z
      if (/[A-Za-z_]/.test(ch)) {
        const pos = joy();
        let j = i;
        while (j < src.length && /[A-Za-z0-9_]/.test(src[j])) j++;
        const word = src.slice(i, j);
        push(KALIT.has(word) ? "kalit" : "nom", word, pos);
        olga(j - i);
        continue;
      }

      // Belgilar
      const pos = joy();
      const belgi = BELGILAR.find((b) => src.startsWith(b, i));
      if (!belgi) throw E.sintaksis("unexpected character '" + ch + "'", pos);
      push("belgi-op", belgi, pos);
      olga(belgi.length);
    }

    tokens.push({ type: "oxir", value: "", line, col });
    return tokens;
  }

  const api = { tokenize, KALIT, BELGILAR };
  root.QK = root.QK || {};
  root.QK.cppEngine = Object.assign(root.QK.cppEngine || {}, { tokenizer: api });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

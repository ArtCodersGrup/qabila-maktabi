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
    "<<", ">>", "++", "--", "+=", "-=", "*=", "/=", "%=", "==", "!=", "<=", ">=", "&&", "||", "::",
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

      // Son: 12, 12.5, 2., 1e-5, 2.5e3, 100000LL
      if (ch >= "0" && ch <= "9") {
        const pos = joy();
        let j = i;
        while (j < src.length && /[0-9]/.test(src[j])) j++;
        let kasr = false;
        if (src[j] === "." && !/[A-Za-z_.]/.test(src[j + 1] || "")) {
          kasr = true;
          j++;
          while (j < src.length && /[0-9]/.test(src[j])) j++;
        }
        // Eksponent: 1e-5 = 0.00001, 2e3 = 2000 (har doim kasr son — double)
        if ((src[j] === "e" || src[j] === "E") && !(src[i] === "0" && /[xX]/.test(src[i + 1] || ""))) {
          const belgi = src[j + 1] === "-" || src[j + 1] === "+" ? 1 : 0;
          if (!/[0-9]/.test(src[j + 1 + belgi] || "")) {
            throw E.sintaksis("exponent has no digits", Object.assign({ line: pos.line, col: pos.col + (j - i) }, {
              hint: "e dan keyin daraja yoziladi: 1e5 — bu 100000, 1e-5 — bu 0.00001.",
            }));
          }
          kasr = true;
          j += 1 + belgi;
          while (j < src.length && /[0-9]/.test(src[j])) j++;
        }
        const matn = src.slice(i, j);
        // Sondan keyin yopishgan harflar: LL (long long), yoki xato
        const qoshimcha = (/^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(j, j + 40)) || [""])[0];
        let tur = kasr ? "double" : "int";
        if (qoshimcha) {
          if (!kasr && /^0[xXbB]/.test(matn + qoshimcha)) {
            throw E.yoq("0x… yoki 0b… koʻrinishidagi son", Object.assign(pos, {
              hint: "Oʻn oltilik (0x1F) va ikkilik (0b101) yozuv bu yerda hali ishlamaydi. Sonni oddiy oʻnlik koʻrinishda yoz.",
            }));
          }
          if (!kasr && /^(ll|LL|l|L)$/.test(qoshimcha)) tur = "ll"; // 100000LL — long long
          else if (!kasr && /^[uU]/.test(qoshimcha)) throw E.yoq("unsigned", pos);
          else if (kasr && /^[fF]$/.test(qoshimcha)) throw E.yoq("float", pos);
          else {
            throw E.sintaksis("invalid suffix '" + qoshimcha + "' on " + (kasr ? "floating" : "integer") + " constant",
              Object.assign({ line: pos.line, col: pos.col + matn.length }, {
                hint: "Son bilan harflar yopishib qolgan: «" + matn + qoshimcha + "». Oʻzgaruvchi nomi raqamdan boshlanmaydi; "
                  + "son va nom orasida amal (masalan *) boʻlishi kerak.",
              }));
          }
          j += qoshimcha.length;
        }
        // 010 — C++ da SAKKIZLIK son (8). Jimgina 10 deb olish yolg'on natija bo'lar edi.
        if (!kasr && matn.length > 1 && matn[0] === "0") {
          throw E.yoq("0 bilan boshlanadigan butun son", Object.assign(pos, {
            hint: "C++ da 0 bilan boshlangan butun son sakkizlik sanoq tizimida oʻqiladi: 010 — bu 8, oʻn emas. "
              + "Oldidagi 0 ni olib tashla.",
          }));
        }
        push(tur, matn, pos);
        tokens[tokens.length - 1].uzunlik = j - i;
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
        if (src[j] !== "'") {
          throw E.sintaksis("missing terminating ' character", Object.assign(pos, {
            hint: "Bir tirnoq ichida faqat BITTA belgi turadi: 'a'. Matn qoʻshtirnoqda yoziladi: \"salom\".",
          }));
        }
        // char — bitta bayt: lotin bo'lmagan harf (ʻ, ё, ş…) unga sig'maydi
        if (qiymat === undefined || qiymat.charCodeAt(0) > 127) {
          throw E.sintaksis("character too large for enclosing character literal type", Object.assign(pos, {
            hint: "char — bitta bayt: unga faqat oddiy lotin harfi, raqam yoki tinish belgisi sigʻadi. "
              + "Boshqa harflarni qoʻshtirnoq ichida, string sifatida yoz.",
          }));
        }
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

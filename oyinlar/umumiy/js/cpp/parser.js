// Kichik C++: tokenlardan daraxt (AST) yasash.
//
// Yadroga nima kiradi: #include, using namespace std;, int main() { … },
// e'lon (int/long long/double/bool/char/string va bir o'lchovli massiv), cin/cout,
// if/else, while, for, break/continue, return, ifodalar.
// Yadroda yo'q narsa (vector, sort, map, struct, funksiya, ko'rsatkich) PARSE paytida
// "bu yerda hali yo'q" xatosi beradi — yolg'on natija chiqishidan ko'ra shu halolroq.
(function (root) {
  "use strict";

  const E = (root.QK && root.QK.cppEngine && root.QK.cppEngine.errors) || require("./errors.js");

  const TURLAR = new Set(["int", "long", "double", "bool", "char", "string"]);
  // Tanilgan, lekin yadroda yo'q narsalar — tushunarli nom bilan
  const YOQ = {
    vector: "vector", sort: "sort", map: "map", set: "set", pair: "pair",
    struct: "struct", class: "class", template: "template", new: "new", delete: "delete",
    auto: "auto", float: "float", unsigned: "unsigned", do: "do-while",
  };

  function parse(tokens) {
    let i = 0;
    const tok = () => tokens[i];
    const turi = () => tokens[i].type;
    const qiymat = () => tokens[i].value;
    const joy = () => ({ line: tokens[i].line, col: tokens[i].col });
    const olga = () => tokens[i++];
    const bormi = (v) => (turi() === "belgi-op" || turi() === "kalit") && qiymat() === v;
    const yedi = (v) => (bormi(v) ? (olga(), true) : false);

    function kut(v) {
      if (!bormi(v)) {
        if (v === ";") throw E.nuqtaliVergul(joy());
        throw E.kutilgan(v, joy());
      }
      return olga();
    }

    function yoqTekshir() {
      if (turi() === "kalit" && YOQ[qiymat()]) throw E.yoq(YOQ[qiymat()], joy());
    }

    // ---------- Ifodalar ----------
    function primary() {
      yoqTekshir();
      const pos = joy();
      const t = tok();
      if (t.type === "int") { olga(); return { k: "son", tur: "int", v: BigInt(t.value), ...pos }; }
      if (t.type === "double") { olga(); return { k: "son", tur: "double", v: Number(t.value), ...pos }; }
      if (t.type === "satr") { olga(); return { k: "matn", v: t.value, ...pos }; }
      if (t.type === "belgi") { olga(); return { k: "belgi", v: t.value, ...pos }; }
      if (bormi("true") || bormi("false")) { const v = qiymat() === "true"; olga(); return { k: "bool", v, ...pos }; }
      if (yedi("(")) {
        const ifoda = expr();
        kut(")");
        return ifoda;
      }
      if (t.type === "nom") {
        olga();
        return { k: "nom", nom: t.value, ...pos };
      }
      throw E.sintaksis("expected expression", pos);
    }

    function postfix() {
      let node = primary();
      for (;;) {
        const pos = joy();
        if (bormi("[")) {
          olga();
          const indeks = expr();
          kut("]");
          node = { k: "indeks", obj: node, indeks, ...pos };
          continue;
        }
        if (bormi(".")) {
          olga();
          if (turi() !== "nom") throw E.sintaksis("expected member name", joy());
          const metod = olga().value;
          kut("(");
          kut(")");
          if (metod !== "size" && metod !== "length") throw E.yoq("." + metod + "()", pos);
          node = { k: "uzunlik", obj: node, ...pos };
          continue;
        }
        if (bormi("++") || bormi("--")) {
          const op = qiymat();
          olga();
          node = { k: "keyin", op, maqsad: node, ...pos };
          continue;
        }
        if (bormi("(")) throw E.yoq("funksiya chaqirish", pos);
        return node;
      }
    }

    function unary() {
      const pos = joy();
      if (bormi("-") || bormi("!") || bormi("+")) {
        const op = qiymat();
        olga();
        return { k: "bir", op, ifoda: unary(), ...pos };
      }
      if (bormi("++") || bormi("--")) {
        const op = qiymat();
        olga();
        return { k: "oldin", op, maqsad: unary(), ...pos };
      }
      if (bormi("&") || bormi("*")) throw E.yoq("koʻrsatkich", pos);
      return postfix();
    }

    const chap = (keyingi, oplar) => () => {
      let node = keyingi();
      for (;;) {
        if (turi() !== "belgi-op" || !oplar.includes(qiymat())) return node;
        const pos = joy();
        const op = olga().value;
        node = { k: "ikki", op, chap: node, ong: keyingi(), ...pos };
      }
    };

    const mul = chap(unary, ["*", "/", "%"]);
    const add = chap(mul, ["+", "-"]);
    const rel = chap(add, ["<", ">", "<=", ">="]);
    const teng = chap(rel, ["==", "!="]);
    const va = chap(teng, ["&&"]);
    const yoki = chap(va, ["||"]);

    function expr() {
      const chapIfoda = yoki();
      const pos = joy();
      if (turi() === "belgi-op" && ["=", "+=", "-=", "*=", "/=", "%="].includes(qiymat())) {
        const op = olga().value;
        const ong = expr();
        if (chapIfoda.k !== "nom" && chapIfoda.k !== "indeks") {
          throw E.sintaksis("expression is not assignable", pos);
        }
        return { k: "tayinlash", op, maqsad: chapIfoda, qiymat: ong, ...pos };
      }
      return chapIfoda;
    }

    // ---------- E'lon ----------
    function turNomi() {
      const pos = joy();
      if (!bormi("long") && !(turi() === "kalit" && TURLAR.has(qiymat()))) return null;
      if (yedi("long")) {
        yedi("long"); // long long
        yedi("int");
        return { tur: "ll", pos };
      }
      const nom = olga().value;
      return { tur: nom === "int" ? "int" : nom, pos };
    }

    function elon(turHolat) {
      const pos = turHolat.pos;
      const elonlar = [];
      do {
        if (bormi("*") || bormi("&")) throw E.yoq("koʻrsatkich", joy());
        if (turi() !== "nom") throw E.sintaksis("expected identifier", joy());
        const nom = olga().value;
        let boyi = null;
        let qiymat = null;
        if (yedi("[")) {
          boyi = expr();
          kut("]");
        }
        if (yedi("=")) qiymat = expr();
        elonlar.push({ nom, boyi, qiymat });
      } while (yedi(","));
      kut(";");
      return { k: "elon", tur: turHolat.tur, elonlar, ...pos };
    }

    // ---------- Buyruqlar ----------
    function block() {
      const pos = joy();
      kut("{");
      const tana = [];
      while (!bormi("}")) {
        if (turi() === "oxir") throw E.kutilgan("}", joy());
        tana.push(stmt());
      }
      kut("}");
      return { k: "blok", tana, ...pos };
    }

    function stmt() {
      yoqTekshir();
      const pos = joy();
      if (bormi("{")) return block();
      if (yedi(";")) return { k: "bosh", ...pos };

      if (bormi("if")) {
        olga();
        kut("(");
        const shart = expr();
        kut(")");
        const tana = stmt();
        let aks = null;
        if (yedi("else")) aks = stmt();
        return { k: "agar", shart, tana, aks, ...pos };
      }
      if (bormi("while")) {
        olga();
        kut("(");
        const shart = expr();
        kut(")");
        return { k: "toki", shart, tana: stmt(), ...pos };
      }
      if (bormi("for")) {
        olga();
        kut("(");
        let bosh = null;
        if (!bormi(";")) {
          const t = turNomi();
          if (t) bosh = elon(t);
          else { bosh = { k: "ifoda", ifoda: expr(), ...pos }; kut(";"); }
        } else kut(";");
        const shart = bormi(";") ? null : expr();
        kut(";");
        const qadam = bormi(")") ? null : expr();
        kut(")");
        return { k: "takror", bosh, shart, qadam, tana: stmt(), ...pos };
      }
      if (bormi("break")) { olga(); kut(";"); return { k: "uz", ...pos }; }
      if (bormi("continue")) { olga(); kut(";"); return { k: "davom", ...pos }; }
      if (bormi("return")) {
        olga();
        const ifoda = bormi(";") ? null : expr();
        kut(";");
        return { k: "qaytar", ifoda, ...pos };
      }

      // cout << … ;   va   cin >> … ;
      if (turi() === "nom" && (qiymat() === "cout" || qiymat() === "cin")) {
        const nomi = olga().value;
        const qismlar = [];
        const strelka = nomi === "cout" ? "<<" : ">>";
        if (!bormi(strelka)) throw E.kutilgan(strelka, joy());
        while (yedi(strelka)) {
          if (nomi === "cout" && turi() === "nom" && qiymat() === "endl") { olga(); qismlar.push({ k: "endl", ...pos }); continue; }
          qismlar.push(add()); // << dan yuqori darajadagi ifoda: a + b ishlaydi, a < b emas
        }
        kut(";");
        return { k: nomi === "cout" ? "chiqar" : "oqi", qismlar, ...pos };
      }

      const t = turNomi();
      if (t) {
        // "int main()" ichida yana funksiya bo'lmaydi
        if (turi() === "nom" && tokens[i + 1] && tokens[i + 1].value === "(") throw E.yoq("funksiya", pos);
        return elon(t);
      }

      const ifoda = expr();
      kut(";");
      return { k: "ifoda", ifoda, ...pos };
    }

    // ---------- Dastur ----------
    const bosh = [];
    while (turi() === "pre" || bormi("using")) {
      if (turi() === "pre") { bosh.push({ k: "pre", v: olga().value }); continue; }
      olga(); // using
      if (!yedi("namespace")) throw E.yoq("using", joy());
      if (turi() !== "nom" || qiymat() !== "std") throw E.yoq("using namespace", joy());
      olga();
      kut(";");
      bosh.push({ k: "using" });
    }

    const mainPos = joy();
    const t = turNomi();
    if (!t || t.tur !== "int") throw E.sintaksis("expected 'int main()'", mainPos);
    if (turi() !== "nom" || qiymat() !== "main") throw E.yoq("funksiya", mainPos);
    olga();
    kut("(");
    if (!bormi(")")) throw E.yoq("main() ning parametrlari", joy());
    kut(")");
    const tana = block();
    if (turi() !== "oxir") throw E.yoq("main() dan keyingi kod", joy());
    return { k: "dastur", bosh, tana, ...mainPos };
  }

  const api = { parse, TURLAR };
  root.QK = root.QK || {};
  root.QK.cppEngine = Object.assign(root.QK.cppEngine || {}, { parser: api });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

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
  // Yadro biladigan tayyor funksiyalar: nomi → nechta argument
  const FUNKSIYALAR = { sort: 2, swap: 2, max: 2, min: 2, abs: 1 };
  // Tanilgan, lekin yadroda yo'q narsalar — tushunarli nom bilan
  const YOQ = {
    vector: "vector", map: "map", set: "set", pair: "pair",
    struct: "struct", class: "class", template: "template", new: "new", delete: "delete",
    auto: "auto", float: "float", unsigned: "unsigned", do: "do-while",
  };

  function parse(xom) {
    // std::cout → cout ("std" belgisi bilan): using namespace std; yozmasdan to'liq nom bilan
    // yozilgan dastur ham ishlaydi. Belgi semantika.js da kerak bo'ladi.
    const tokens = [];
    for (let k = 0; k < xom.length; k++) {
      const t = xom[k];
      const keyingi = xom[k + 1];
      if (t.type === "nom" && t.value === "std" && keyingi && keyingi.type === "belgi-op" && keyingi.value === "::"
          && xom[k + 2] && xom[k + 2].type !== "oxir") {
        tokens.push(Object.assign({}, xom[k + 2], { std: true }));
        k += 2;
        continue;
      }
      tokens.push(t);
    }

    let i = 0;
    let siklda = 0; // nechta sikl ichidamiz: break/continue faqat sikl ichida yoziladi
    const tok = () => tokens[i];
    const turi = () => tokens[i].type;
    const qiymat = () => tokens[i].value;
    const joy = () => ({ line: tokens[i].line, col: tokens[i].col });
    const olga = () => tokens[i++];
    const bormi = (v) => (turi() === "belgi-op" || turi() === "kalit") && qiymat() === v;
    const yedi = (v) => (bormi(v) ? (olga(), true) : false);

    // Tushib qolgan ";" OLDINGI satr oxirida ko'rsatiladi — g++ ham shunday qiladi
    function oxiriJoyi() {
      const oldingi = tokens[i - 1];
      if (!oldingi) return joy();
      const uzunlik = oldingi.uzunlik || String(oldingi.value === undefined ? "" : oldingi.value).length;
      return { line: oldingi.line, col: oldingi.col + uzunlik };
    }

    function kut(v) {
      if (!bormi(v)) {
        if (v === ";") throw E.nuqtaliVergul(oxiriJoyi());
        if (v === "}") throw E.kutilgan(v, oxiriJoyi());
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
      if (t.type === "ll") { olga(); return { k: "son", tur: "ll", v: BigInt(t.value), ...pos }; } // 100000LL
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
        return t.std ? { k: "nom", nom: t.value, std: true, ...pos } : { k: "nom", nom: t.value, ...pos };
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
        if (bormi("(")) {
          // Yadro biladigan bir nechta tayyor funksiya: sort, swap, max, min, abs
          if (node.k !== "nom" || !FUNKSIYALAR[node.nom]) throw E.yoq("funksiya chaqirish", pos);
          olga();
          const args = [];
          if (!bormi(")")) {
            do { args.push(expr()); } while (yedi(","));
          }
          kut(")");
          const kutilganSoni = FUNKSIYALAR[node.nom];
          if (args.length !== kutilganSoni) {
            throw E.sintaksis("no matching function for call to '" + node.nom + "'", { line: node.line, col: node.col });
          }
          node = { k: "chaqiruv", nom: node.nom, std: !!node.std, args, line: node.line, col: node.col };
          continue;
        }
        return node;
      }
    }

    function unary() {
      const pos = joy();
      // (long long)a * b — tur keltirish. Faqat qavsdan keyin tur nomi kelsa.
      if (bormi("(") && tokens[i + 1] && tokens[i + 1].type === "kalit"
          && (TURLAR.has(tokens[i + 1].value) || tokens[i + 1].value === "long")) {
        olga();
        const t = turNomi();
        kut(")");
        return { k: "keltir", tur: t.tur, ifoda: unary(), ...pos };
      }
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
      // const int N = 100; — qiymati o'zgarmaydigan o'zgaruvchi (o'zgartirishga urinishni semantika.js ushlaydi)
      let konst = yedi("const");
      if (!bormi("long") && !(turi() === "kalit" && TURLAR.has(qiymat()))) {
        if (!konst) return null;
        yoqTekshir(); // const auto, const vector<…> — "bu yerda hali yo'q"
        throw E.sintaksis("a type specifier is required for all declarations", Object.assign(joy(), {
          hint: "const dan keyin tur yoziladi: const int n = 5;",
        }));
      }
      let tur;
      let std = false;
      let turJoyi = joy();
      if (yedi("long")) {
        yedi("long"); // long long
        yedi("int");
        tur = "ll";
      } else {
        std = !!tok().std; // std::string
        tur = olga().value;
      }
      if (yedi("const")) konst = true; // int const n — xuddi shu narsa
      return { tur, pos, const: konst, std, turJoyi };
    }

    function elon(turHolat) {
      const pos = turHolat.pos;
      const elonlar = [];
      do {
        if (bormi("*") || bormi("&")) throw E.yoq("koʻrsatkich", joy());
        if (turi() !== "nom") throw E.sintaksis("expected identifier", joy());
        const nomJoyi = joy();
        const nom = olga().value;
        let boyi = null;
        let qiymat = null;
        let massiv = false;
        if (yedi("[")) {
          massiv = true;
          if (!bormi("]")) boyi = expr(); // int a[] = {…} — bo'yi ro'yxatdan olinadi
          kut("]");
        }
        if (yedi("=")) {
          // int a[3] = {1, 2, 3};  — ro'yxat bilan to'ldirish
          if (bormi("{")) {
            const royxatJoyi = joy();
            olga();
            const elementlar = [];
            if (!bormi("}")) {
              do { elementlar.push(expr()); } while (yedi(","));
            }
            kut("}");
            qiymat = { k: "royxat", elementlar, line: royxatJoyi.line, col: royxatJoyi.col };
          } else {
            qiymat = expr();
          }
        }
        elonlar.push({ nom, boyi, massiv, qiymat, line: nomJoyi.line, col: nomJoyi.col });
      } while (yedi(","));
      kut(";");
      return { k: "elon", tur: turHolat.tur, const: !!turHolat.const, std: !!turHolat.std, turJoyi: turHolat.turJoyi, elonlar, ...pos };
    }

    // ---------- Buyruqlar ----------
    function block() {
      const pos = joy();
      kut("{");
      const tana = [];
      while (!bormi("}")) {
        if (turi() === "oxir") throw E.kutilgan("}", oxiriJoyi());
        tana.push(stmt());
      }
      kut("}");
      return { k: "blok", tana, ...pos };
    }

    // Sikl tanasi: ichida break/continue yozsa bo'ladi
    function siklTanasi() {
      siklda++;
      try {
        return stmt();
      } finally {
        siklda--;
      }
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
        // while (cin >> x) — kirish tugaguncha o'qiydigan mashhur naqsh
        if (turi() === "nom" && qiymat() === "cin") {
          const cinJoyi = joy();
          const std = !!olga().std;
          const qismlar = [];
          if (!bormi(">>")) throw E.kutilgan(">>", joy());
          while (bormi(">>")) {
            const strelkaJoyi = joy();
            olga();
            qismlar.push(Object.assign(add(), { strelka: strelkaJoyi }));
          }
          kut(")");
          return { k: "toki", oqiShart: { k: "oqiShart", qismlar, std, ...cinJoyi }, tana: siklTanasi(), ...pos };
        }
        const shart = expr();
        kut(")");
        return { k: "toki", shart, tana: siklTanasi(), ...pos };
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
        return { k: "takror", bosh, shart, qadam, tana: siklTanasi(), ...pos };
      }
      // break va continue faqat sikl ichida: tashqarida — kompilyatsiya xatosi (dastur jim tugab qolmaydi)
      if (bormi("break")) {
        if (!siklda) {
          throw E.sintaksis("'break' statement not in loop or switch statement", Object.assign(pos, {
            hint: "break faqat sikl (for, while) ichida ishlaydi — u siklni toʻxtatadi. Dasturni tugatish uchun: return 0;",
          }));
        }
        olga(); kut(";"); return { k: "uz", ...pos };
      }
      if (bormi("continue")) {
        if (!siklda) {
          throw E.sintaksis("'continue' statement not in loop statement", Object.assign(pos, {
            hint: "continue faqat sikl (for, while) ichida ishlaydi — u keyingi aylanishga oʻtkazadi.",
          }));
        }
        olga(); kut(";"); return { k: "davom", ...pos };
      }
      if (bormi("return")) {
        olga();
        const ifoda = bormi(";") ? null : expr();
        kut(";");
        return { k: "qaytar", ifoda, ...pos };
      }

      // cout << … ;   va   cin >> … ;
      if (turi() === "nom" && (qiymat() === "cout" || qiymat() === "cin")) {
        const std = !!tok().std;
        const nomi = olga().value;
        const qismlar = [];
        const strelka = nomi === "cout" ? "<<" : ">>";
        if (!bormi(strelka)) throw E.kutilgan(strelka, joy());
        while (bormi(strelka)) {
          const strelkaJoyi = joy(); // xato aynan << yoki >> da ko'rsatiladi (kompilyator ham shunday)
          olga();
          if (nomi === "cout" && turi() === "nom" && qiymat() === "endl") {
            const endlJoyi = joy();
            qismlar.push({ k: "endl", std: !!olga().std, ...endlJoyi });
            continue;
          }
          // << dan yuqori darajadagi ifoda: a + b ishlaydi, a < b emas
          qismlar.push(Object.assign(add(), { strelka: strelkaJoyi }));
        }
        kut(";");
        return { k: nomi === "cout" ? "chiqar" : "oqi", qismlar, std, ...pos };
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
      if (turi() === "pre") { const preJoyi = joy(); bosh.push({ k: "pre", v: olga().value, ...preJoyi }); continue; }
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

  const api = { parse, TURLAR, FUNKSIYALAR };
  root.QK = root.QK || {};
  root.QK.cppEngine = Object.assign(root.QK.cppEngine || {}, { parser: api });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

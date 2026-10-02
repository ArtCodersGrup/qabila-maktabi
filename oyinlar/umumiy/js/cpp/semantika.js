// Kichik C++: dasturni ISHGA TUSHIRISHDAN OLDIN tekshirish.
//
// Nega kerak: blokning asosiy darsi — "C++ xatoni ishdan oldin topadi". Agar e'lon qilinmagan
// nom yoki mos kelmagan tur faqat o'sha satrga yetganda xato bersa, bola avval bir necha satr
// chiqishni ko'radi va dars yolg'on bo'lib qoladi (g++ esa hech narsa chiqarmaydi).
// Shuning uchun nomlar HAM, turlar HAM oldindan tekshiriladi — g++ dagidek.
//
// Tekshiriladi: e'lon qilinmagan nom, bitta blokda ikki marta e'lon, har ifodaning turi
// (matn + son, "a" + "b", int x = "a", 5.5 % 2 …), const ni o'zgartirish, massiv nomini
// qiymat sifatida ishlatish, sarlavhalar (#include <iostream>, using namespace std;).
// Xabar matnlari — kompilyatornikidek (clang/g++), izohi o'zbekcha.
(function (root) {
  "use strict";

  const E = (root.QK && root.QK.cppEngine && root.QK.cppEngine.errors) || require("./errors.js");

  // Statik tur: { t: "int" | "ll" | "double" | "bool" | "char" | "string" | "cstr" | "void", const? }
  //   cstr — qo'shtirnoqli matn ("salom"): C++ da bu string EMAS, belgilar massivi (n — bo'yi)
  const SONLAR = new Set(["int", "ll", "double", "bool", "char"]);
  const sonmi = (t) => SONLAR.has(t.t);
  const butunmi = (t) => sonmi(t) && t.t !== "double";
  const matnmi = (t) => t.t === "string" || t.t === "cstr";
  const T = (t) => ({ t });
  const umumiy = (a, b) => (a.t === "double" || b.t === "double" ? "double" : a.t === "ll" || b.t === "ll" ? "ll" : "int");

  const ASOS = { int: "int", ll: "long long", double: "double", bool: "bool", char: "char", void: "void", string: "string" };
  const utf8 = (s) => {
    let n = 0;
    for (const ch of s) { const c = ch.codePointAt(0); n += c < 0x80 ? 1 : c < 0x800 ? 2 : c < 0x10000 ? 3 : 4; }
    return n;
  };
  // Kompilyator turni qanday ataydi: 'int', 'const char[6]', 'string' (aka 'basic_string<char>')
  function nomi(t) {
    const c = t.const ? "const " : "";
    if (t.t === "string") return "'" + c + "string' (aka '" + c + "basic_string<char>')";
    if (t.t === "cstr") return "'const char[" + t.n + "]'";
    if (t.t === "massiv") return "'" + c + ASOS[t.el] + "[" + (t.n == null ? "" : t.n) + "]'";
    return "'" + c + ASOS[t.t] + "'";
  }
  // Bolaga tushunarli nom
  const UZ = { int: "butun son (int)", ll: "butun son (long long)", double: "kasr son (double)", bool: "bool",
    char: "belgi (char)", string: "matn (string)", cstr: "qoʻshtirnoqli matn", void: "hech narsa (void)" };

  const joy = (node, hint) => {
    const j = { line: node.line, col: node.col };
    if (hint) j.hint = hint;
    return j;
  };

  const KORSATKICH = "Haqiqiy C++ bu yerda xato bermaydi, lekin kutilgan ishni ham qilmaydi: qoʻshtirnoqli matn — "
    + "xotiradagi manzil, amal esa shu manzil ustida bajariladi va natija buzuq chiqadi. ";

  function tekshir(dastur) {
    // Sarlavhalar: cout/cin — <iostream> dan, sort — <algorithm> dan; qisqa nom (cout) uchun
    // using namespace std; kerak, aks holda to'liq nom yoziladi (std::cout).
    const bosh = dastur.bosh || [];
    const ulangan = new Set();
    for (const b of bosh) {
      if (b.k !== "pre") continue;
      const m = /^#\s*include\s*[<"]\s*([^>"]+?)\s*[>"]/.exec(b.v);
      if (!m) {
        const soz = (/^#\s*\w*/.exec(b.v) || ["#"])[0].replace(/\s+/g, "");
        throw E.yoq(soz === "#include" ? "#include ning bu koʻrinishi" : soz, joy(b,
          soz === "#include" ? "Kutubxona shunday ulanadi: #include <iostream>" : ""));
      }
      ulangan.add(m[1]);
    }
    const hammasi = ulangan.has("bits/stdc++.h");
    const using = bosh.some((b) => b.k === "using");
    const KUTUBXONA = {
      cout: ["iostream"], cin: ["iostream"], endl: ["iostream"],
      string: ["string", "iostream"], // amalda <iostream> string ni ham olib keladi
      sort: ["algorithm"],
      swap: ["algorithm", "iostream", "string"], max: ["algorithm", "iostream", "string"],
      min: ["algorithm", "iostream", "string"], abs: ["cstdlib", "cmath", "algorithm", "iostream", "string"],
    };
    // std dagi nom ishlatilganda: kutubxona ulanganmi va nom ko'rinadimi
    function stdNomi(nom, node, std) {
      const kerak = KUTUBXONA[nom];
      const turmi = nom === "string";
      // Kompilyator ba'zan "; did you mean 'std::cout'?" deb ham qo'shadi, lekin bu taxmin har doim ham
      // to'g'ri chiqmaydi (cin uchun 'sin' deydi) — shuning uchun maslahat o'zbekcha izohda beriladi.
      const xabar = () => (turmi ? "unknown type name '" + nom + "'" : "use of undeclared identifier '" + nom + "'");
      if (!hammasi && !kerak.some((k) => ulangan.has(k))) {
        const kut = kerak[0];
        throw E.sintaksis(xabar(), joy(node,
          "`" + nom + "` — <" + kut + "> kutubxonasidan keladi. Dastur boshiga shu satrni qoʻsh: #include <" + kut + ">"
          + (nom === "sort" ? " (baʼzi kompilyatorlar usiz ham oʻtkazib yuboradi, olimpiada tekshiruvchisi esa xato beradi)." : "")));
      }
      if (!using && !std) {
        throw E.sintaksis(xabar(), joy(node,
          "`" + nom + "` ning toʻliq nomi — std::" + nom + ". Qisqa yozish uchun #include lardan keyin shu satrni qoʻsh: "
          + "using namespace std;"));
      }
    }

    const stek = [new Map()];
    const top = (nom) => {
      for (let k = stek.length - 1; k >= 0; k--) if (stek[k].has(nom)) return stek[k].get(nom);
      return null;
    };
    const qosh = (nom, yozuv, node) => {
      if (stek[stek.length - 1].has(nom)) throw E.qaytaElon(nom, joy(node));
      stek[stek.length - 1].set(nom, yozuv);
    };
    // O'zgaruvchining to'liq turi (xabarlar uchun): 'const int', 'int[3]'
    const ozTuri = (y) => (y.massiv ? { t: "massiv", el: y.tur, n: y.n, const: y.const } : { t: y.tur, const: y.const });

    const massivNomi = (node) => E.yoq("massiv nomini qiymat sifatida ishlatish", joy(node,
      "`" + node.nom + "` — massiv: uning nomi bitta qiymat emas (haqiqiy C++ da u xotiradagi manzil). "
      + "Katakni indeks bilan ol: " + node.nom + "[0]."));
    const constXato = (l, node) => E.sintaksis(
      "cannot assign to variable '" + l.nom + "' with const-qualified type " + nomi(l.oz), joy(node,
        "`" + l.nom + "` — const: qiymati eʼlon paytida bir marta beriladi va keyin oʻzgarmaydi. "
        + "Oʻzgartirish kerak boʻlsa, const soʻzini olib tashla."));
    const korsatkich = (nima, node, qoshimcha) => E.yoq(nima, joy(node, KORSATKICH + (qoshimcha || "")));

    // Qiymat yoziladigan joy: o'zgaruvchi yoki massiv/satr katagi
    function lvalue(node) {
      if (node.k === "nom") {
        const y = top(node.nom);
        if (!y) throw E.tanilmagan(node.nom, joy(node));
        if (y.massiv) throw massivNomi(node);
        return { tur: { t: y.tur, const: y.const }, nom: node.nom, const: y.const, oz: ozTuri(y) };
      }
      if (node.k === "indeks") {
        if (node.obj.k !== "nom") {
          throw E.yoq("[ ] ni nomdan boshqa narsaga qoʻyish", joy(node,
            "Bu yerda indeks faqat massiv yoki string nomidan keyin ishlaydi: a[0], s[i]."));
        }
        const y = top(node.obj.nom);
        if (!y) throw E.tanilmagan(node.obj.nom, joy(node.obj));
        const it = ifoda(node.indeks);
        const butunEmas = () => E.sintaksis("array subscript is not an integer", joy(node,
          "Indeks — butun son: " + node.obj.nom + "[0], " + node.obj.nom + "[i]."));
        if (y.massiv) {
          if (!butunmi(it)) throw butunEmas();
          return { tur: { t: y.tur, const: y.const }, nom: node.obj.nom, const: y.const, oz: ozTuri(y) };
        }
        if (y.tur === "string") {
          if (!sonmi(it)) throw butunEmas();
          return { tur: { t: "char", const: y.const }, nom: node.obj.nom, const: y.const, oz: ozTuri(y) };
        }
        throw E.sintaksis("subscripted value is not an array, pointer, or vector", joy(node,
          "`" + node.obj.nom + "` — massiv ham, string ham emas, shuning uchun [ ] bilan katagini olib boʻlmaydi."));
      }
      throw E.sintaksis("expression is not assignable", joy(node,
        "Qiymat faqat oʻzgaruvchiga yoki massiv katagiga beriladi."));
    }

    // Ikki tomonli amalning turi (va mosligi)
    function ikkilik(op, a, b, node) {
      const ikkinchi = a.t === "string" && b.t === "string" && !a.const === !b.const ? "'string'" : nomi(b);
      const yaroqsiz = (hint) => E.sintaksis(
        "invalid operands to binary expression (" + nomi(a) + " and " + ikkinchi + ")", joy(node, hint));
      if (a.t === "void" || b.t === "void") {
        throw yaroqsiz("sort va swap hech qanday qiymat qaytarmaydi — ularni ifoda ichida ishlatib boʻlmaydi.");
      }
      if (["==", "!=", "<", ">", "<=", ">="].includes(op)) {
        if (sonmi(a) && sonmi(b)) return T("bool");
        if (a.t === "cstr" && b.t === "cstr") {
          throw korsatkich("ikki qoʻshtirnoqli matnni solishtirish", node,
            "Bittasini string oʻzgaruvchiga ol: string s = \"ha\"; keyin s " + op + " \"ha\".");
        }
        if (matnmi(a) && matnmi(b)) return T("bool");
        if ((a.t === "cstr" && sonmi(b)) || (sonmi(a) && b.t === "cstr")) {
          throw E.sintaksis("comparison between pointer and integer", joy(node,
            "Qoʻshtirnoqli matnni son yoki belgi bilan solishtirib boʻlmaydi. Bitta belgi — bir tirnoqda: 'a'."));
        }
        throw yaroqsiz("Matnni son yoki belgi bilan solishtirib boʻlmaydi. Bitta belgini solishtirish uchun: s[0] == 'a'.");
      }
      // + - * / %
      if (sonmi(a) && sonmi(b)) {
        if (op === "%" && (a.t === "double" || b.t === "double")) {
          throw yaroqsiz("% (qoldiq) faqat butun sonlar bilan ishlaydi — kasr son uchun u yoʻq.");
        }
        return T(umumiy(a, b));
      }
      if (op === "+") {
        if (a.t === "cstr" && b.t === "cstr") {
          throw yaroqsiz("Ikki qoʻshtirnoqli matnni + bilan qoʻshib boʻlmaydi (Pythonda boʻlardi, C++ da yoʻq). "
            + "Kamida bittasi string boʻlishi kerak: string s = \"Salom\"; keyin s + \" dunyo\".");
        }
        if (a.t === "string" && (matnmi(b) || b.t === "char")) return T("string");
        if (b.t === "string" && (matnmi(a) || a.t === "char")) return T("string");
      }
      if ((op === "+" || op === "-") && (a.t === "cstr" || b.t === "cstr") && (sonmi(a) || sonmi(b) || a.t === b.t)) {
        throw korsatkich("qoʻshtirnoqli matnga " + op + " bilan belgi yoki son qoʻshish", node,
          "Matnga belgi qoʻshish uchun string ishlat: string s = \"x\"; keyin s + 'c'.");
      }
      throw yaroqsiz("Matn bilan son aralashib qoldi: + faqat matnni matnga (yoki belgiga) ulaydi; "
        + "-, *, / va % esa matn bilan ishlamaydi.");
    }

    // Boshlang'ich qiymat: int x = …;  (nima — "a variable" yoki "an array element")
    function boshMos(tur, v, node, nima) {
      const hint = "Turlar mos emas: " + UZ[tur] + " oʻrniga " + UZ[v.t] + " berilgan.";
      if (tur === "string") {
        if (matnmi(v)) return;
        throw E.sintaksis("no viable conversion from " + nomi(T(v.t)) + " to " + nomi(T("string")), joy(node,
          hint + " Matn qoʻshtirnoqda yoziladi: string s = \"5\";"));
      }
      if (sonmi(v)) return;
      const qoshimcha = tur === "char" ? " Bitta belgi bir tirnoqda yoziladi: char c = 'a';"
        : " Matn uchun string kerak: string s = \"...\";";
      if (v.t === "cstr") {
        throw E.sintaksis("cannot initialize " + nima + " of type '" + ASOS[tur] + "' with an lvalue of type " + nomi(v),
          joy(node, hint + qoshimcha));
      }
      throw E.sintaksis("no viable conversion from " + nomi(T(v.t)) + " to '" + ASOS[tur] + "'", joy(node, hint + qoshimcha));
    }

    // Tayinlash: x = …;  x += …;
    function tayinMos(l, v, op, node) {
      const tur = l.tur.t;
      if (op === "=") {
        // s = 'a' ham, s = 65 ham C++ da ishlaydi (bitta belgi bo'lib tushadi)
        if (tur === "string" ? (matnmi(v) || sonmi(v)) : sonmi(v)) return;
        throw E.sintaksis("assigning to '" + ASOS[tur] + "' from incompatible type " + nomi(v), joy(node.qiymat,
          "Turlar mos emas: " + UZ[tur] + " ga " + UZ[v.t] + " tushmaydi."
          + (matnmi(v) ? " Matn uchun string kerak: string s = \"...\";" : "")));
      }
      const yaroqsiz = (hint) => E.sintaksis(
        "invalid operands to binary expression (" + nomi(T(tur)) + " and " + nomi(v) + ")", joy(node, hint));
      if (tur === "string") {
        if (op === "+=" && (matnmi(v) || sonmi(v))) return;
        throw yaroqsiz("Matnga faqat += bilan matn yoki belgi qoʻshiladi: s += \"a\";");
      }
      if (!sonmi(v)) throw yaroqsiz("Songa matnni " + op + " bilan qoʻllab boʻlmaydi.");
      if (op === "%=" && (tur === "double" || v.t === "double")) {
        throw yaroqsiz("% (qoldiq) faqat butun sonlar bilan ishlaydi — kasr son uchun u yoʻq.");
      }
    }

    // sort(a, a + n) ning argumenti: massiv nomi yoki "massiv ± butun son"
    function sortArg(x, node) {
      let n = x;
      if (x.k === "ikki" && (x.op === "+" || x.op === "-")) {
        n = x.chap;
        if (!butunmi(ifoda(x.ong))) throw E.yoq("sort — faqat massiv uchun: sort(a, a + n)", joy(node));
      }
      if (n.k !== "nom") throw E.yoq("sort — faqat massiv uchun: sort(a, a + n)", joy(node));
      const y = top(n.nom);
      if (!y) throw E.tanilmagan(n.nom, joy(n));
      if (!y.massiv) throw E.yoq("sort — faqat massiv uchun: sort(a, a + n)", joy(node));
      if (y.const) throw constXato({ nom: n.nom, oz: ozTuri(y) }, node);
    }

    function ifoda(node) {
      switch (node.k) {
        case "son":
          if (node.tur === "double") return T("double");
          if (node.v > 9223372036854775807n) {
            throw E.sintaksis("integer literal is too large to be represented in any integer type", joy(node,
              "Bu son long long ga ham sigʻmaydi: eng katta qiymat — 9223372036854775807."));
          }
          return T(node.tur === "ll" || node.v > 2147483647n ? "ll" : "int");
        case "matn": return { t: "cstr", n: utf8(node.v) + 1 };
        case "belgi": return T("char");
        case "bool": return T("bool");
        case "nom": {
          const y = top(node.nom);
          if (!y) throw E.tanilmagan(node.nom, joy(node));
          if (y.massiv) throw massivNomi(node);
          return { t: y.tur, const: y.const };
        }
        case "indeks": return lvalue(node).tur;
        case "uzunlik": {
          const y = node.obj.k === "nom" ? top(node.obj.nom) : null;
          const t = y && y.massiv ? ozTuri(y) : ifoda(node.obj);
          if (t.t !== "string") {
            throw E.sintaksis("member reference base type " + nomi(t) + " is not a structure or union", joy(node,
              t.t === "massiv" ? "Massivda .size() yoʻq — uning boʻyini oʻzing bilasan (masalan n). .size() faqat string uchun."
                : ".size() faqat string oʻzgaruvchisi uchun ishlaydi: string s = \"salom\"; s.size()"));
          }
          return T("ll");
        }
        case "keltir": {
          const t = ifoda(node.ifoda);
          if (node.tur === "string") {
            if (matnmi(t)) return T("string");
            throw E.sintaksis("no matching conversion for C-style cast from " + nomi(t) + " to " + nomi(T("string")), joy(node,
              "Sonni (string) bilan matnga aylantirib boʻlmaydi."));
          }
          if (t.t === "cstr") throw korsatkich("qoʻshtirnoqli matnni songa aylantirish", node);
          if (!sonmi(t)) {
            throw E.sintaksis("no matching conversion for C-style cast from " + nomi(t) + " to '" + ASOS[node.tur] + "'", joy(node,
              "Matnni (" + ASOS[node.tur] + ") bilan songa aylantirib boʻlmaydi."));
          }
          return T(node.tur);
        }
        case "bir": {
          const t = ifoda(node.ifoda);
          if (t.t === "cstr") throw korsatkich("qoʻshtirnoqli matnga " + node.op + " amali", node);
          if (!sonmi(t)) {
            throw E.sintaksis("invalid argument type " + nomi(t) + " to unary expression", joy(node,
              "`" + node.op + "` amali son bilan ishlaydi, " + UZ[t.t] + " bilan emas."));
          }
          if (node.op === "!") return T("bool");
          return T(t.t === "double" ? "double" : t.t === "ll" ? "ll" : "int");
        }
        case "oldin": case "keyin": {
          const l = lvalue(node.maqsad);
          if (l.const) throw constXato(l, node);
          const soz = node.op === "++" ? "increment" : "decrement";
          if (l.tur.t === "bool") {
            throw E.sintaksis("ISO C++17 does not allow " + soz + "ing expression of type bool", joy(node,
              "bool — faqat rost/yolgʻon: uni ++ yoki -- bilan oʻzgartirib boʻlmaydi."));
          }
          if (!sonmi(l.tur)) {
            throw E.sintaksis("cannot " + soz + " value of type " + nomi(T(l.tur.t)), joy(node,
              "++ va -- faqat son (yoki belgi) uchun."));
          }
          return T(l.tur.t);
        }
        case "ikki": {
          if (node.op === "&&" || node.op === "||") {
            // ikkala tomon ham shart: rost/yolg'on (yoki son)
            shart(node.chap);
            shart(node.ong);
            return T("bool");
          }
          const a = ifoda(node.chap);
          const b = ifoda(node.ong);
          return ikkilik(node.op, a, b, node);
        }
        case "tayinlash": {
          const l = lvalue(node.maqsad);
          const v = ifoda(node.qiymat);
          if (l.const) throw constXato(l, node);
          if (v.t === "void") {
            throw E.sintaksis("assigning to '" + ASOS[l.tur.t] + "' from incompatible type 'void'", joy(node.qiymat,
              "sort va swap hech qanday qiymat qaytarmaydi."));
          }
          tayinMos(l, v, node.op, node);
          return T(l.tur.t);
        }
        case "royxat":
          throw E.sintaksis("initializer list is only allowed in a declaration", joy(node,
            "{ } roʻyxati faqat massivni eʼlon qilishda yoziladi: int a[3] = {1, 2, 3};"));
        case "chaqiruv": {
          stdNomi(node.nom, node, node.std);
          const mosEmas = (hint) => E.sintaksis("no matching function for call to '" + node.nom + "'", joy(node, hint));
          if (node.nom === "sort") {
            for (const x of node.args) sortArg(x, node);
            return T("void");
          }
          if (node.nom === "swap") {
            const a = lvalue(node.args[0]);
            const b = lvalue(node.args[1]);
            for (const l of [a, b]) {
              if (l.const) throw mosEmas("`" + l.nom + "` — const: swap uning qiymatini oʻzgartira olmaydi.");
            }
            if (a.tur.t !== b.tur.t) throw mosEmas("swap ikkita BIR XIL turdagi oʻzgaruvchining qiymatini almashtiradi.");
            return T("void");
          }
          const turlar = node.args.map(ifoda);
          if (turlar.some((t) => t.t === "cstr")) throw korsatkich(node.nom + "() ga qoʻshtirnoqli matn berish", node);
          if (node.nom === "abs") {
            const t = turlar[0];
            if (!sonmi(t)) throw mosEmas("abs() son bilan ishlaydi.");
            return T(t.t === "double" ? "double" : t.t === "ll" ? "ll" : "int");
          }
          // max / min — haqiqiy C++ da ikkala argument BIR XIL turda bo'lishi shart
          const [a, b] = turlar;
          if (a.t !== b.t || a.t === "void") {
            throw mosEmas("max va min ikkala sonni bir xil turda talab qiladi. " + node.nom + "(2.5, 2) ishlamaydi — "
              + node.nom + "(2.5, 2.0) deb yoz.");
          }
          return T(a.t);
        }
        default:
          return T("int");
      }
    }

    // if / while / for sharti: son yoki bool bo'lishi kerak
    function shart(node) {
      const t = ifoda(node);
      if (t.t === "cstr") throw korsatkich("qoʻshtirnoqli matnni shart sifatida ishlatish", node);
      if (!sonmi(t)) {
        throw E.sintaksis("no viable conversion from " + nomi(t) + " to 'bool'", joy(node,
          "Shart rost yoki yolgʻon boʻlishi kerak, " + UZ[t.t] + " esa shart boʻla olmaydi. "
          + "Taqqoslash yoz: n > 0 yoki s == \"ha\"."));
      }
    }

    // cin >> x: x — o'zgartirsa bo'ladigan o'zgaruvchi yoki katak
    function oqiMaqsad(q) {
      const istream = "'istream' (aka 'basic_istream<char>')";
      if (q.k !== "nom" && q.k !== "indeks") {
        throw E.sintaksis("invalid operands to binary expression (" + istream + " and " + nomi(ifoda(q)) + ")", joy(q.strelka || q,
          "cin >> dan keyin oʻzgaruvchi nomi turadi: cin >> n;"));
      }
      const l = lvalue(q);
      if (l.const) {
        throw E.sintaksis("invalid operands to binary expression (" + istream + " and " + nomi(l.tur) + ")", joy(q.strelka || q,
          "`" + l.nom + "` — const: unga cin bilan yangi qiymat oʻqib boʻlmaydi. const soʻzini olib tashla."));
      }
    }

    // Shart yoki sikl tanasi — alohida ko'rinish doirasi (qavssiz bitta buyruq bo'lsa ham)
    function tana(node) {
      stek.push(new Map());
      buyruq(node);
      stek.pop();
    }

    function buyruq(node) {
      switch (node.k) {
        case "blok":
          stek.push(new Map());
          for (const s of node.tana) buyruq(s);
          stek.pop();
          return;
        case "elon":
          if (node.tur === "string") stdNomi("string", node.turJoyi || node, node.std);
          for (const e of node.elonlar) {
            const j = e.line ? e : node;
            const massiv = !!(e.massiv || e.boyi);
            const royxat = e.qiymat && e.qiymat.k === "royxat" ? e.qiymat : null;
            let n = null;
            if (e.boyi) {
              const t = ifoda(e.boyi);
              if (!butunmi(t)) {
                throw E.sintaksis("size of array has non-integer type " + nomi(t), joy(e.boyi,
                  "Massivning boʻyi — butun son: int a[5];"));
              }
              if (e.boyi.k === "son") n = Number(e.boyi.v);
            }
            if (massiv) {
              if (e.qiymat && !royxat) {
                ifoda(e.qiymat);
                throw E.sintaksis("array initializer must be an initializer list", joy(j,
                  "Massivga boshlangʻich qiymatlar { } ichida beriladi: int a[3] = {1, 2, 3};"));
              }
              if (!e.boyi && !royxat) {
                throw E.sintaksis("definition of variable with array type needs an explicit size or an initializer", joy(j,
                  "Massivning boʻyi kerak: int a[5]; yoki int a[] = {1, 2, 3};"));
              }
              if (royxat) {
                royxat.elementlar.forEach((x, k) => {
                  const t = ifoda(x); // o'zidan oldin: int a[2] = {a[0]}; xato beradi
                  if (n != null && k >= n) {
                    throw E.sintaksis("excess elements in array initializer", joy(x,
                      "Massiv " + n + " ta katakdan iborat, roʻyxatda esa " + royxat.elementlar.length + " ta qiymat bor."));
                  }
                  boshMos(node.tur, t, x, "an array element");
                });
                if (!e.boyi) n = royxat.elementlar.length;
              }
            } else if (royxat) {
              throw E.yoq("{ } bilan bitta oʻzgaruvchiga qiymat berish", joy(e.qiymat,
                "Bu yerda { } faqat massiv uchun: int a[3] = {1, 2, 3}; Bitta oʻzgaruvchiga = bilan qiymat ber: int x = 5;"));
            } else if (e.qiymat) {
              boshMos(node.tur, ifoda(e.qiymat), j, "a variable"); // o'zidan oldin: int a = a; xato beradi
            }
            if (node.const && !e.qiymat && !(node.tur === "string" && !massiv)) {
              throw E.sintaksis("default initialization of an object of const type "
                + nomi(ozTuri({ tur: node.tur, massiv, n, const: true })), joy(j,
                "const oʻzgaruvchining qiymati eʼlon paytida beriladi (keyin oʻzgartirib boʻlmaydi): const int "
                + e.nom + " = 5;"));
            }
            qosh(e.nom, { tur: node.tur, massiv, n, const: !!node.const }, j);
          }
          return;
        case "ifoda": ifoda(node.ifoda); return;
        case "chiqar":
          stdNomi("cout", node, node.std);
          for (const q of node.qismlar) {
            if (q.k === "endl") { stdNomi("endl", q, q.std); continue; }
            if (ifoda(q).t === "void") {
              throw E.sintaksis("invalid operands to binary expression ('ostream' (aka 'basic_ostream<char>') and 'void')", joy(q.strelka || q,
                "sort va swap hech narsa qaytarmaydi — ularni cout ga berib boʻlmaydi. Avval alohida satrda chaqir."));
            }
          }
          return;
        case "oqi":
          stdNomi("cin", node, node.std);
          for (const q of node.qismlar) oqiMaqsad(q);
          return;
        case "agar":
          shart(node.shart);
          tana(node.tana);
          if (node.aks) tana(node.aks);
          return;
        case "toki":
          if (node.oqiShart) {
            stdNomi("cin", node.oqiShart, node.oqiShart.std);
            for (const q of node.oqiShart.qismlar) oqiMaqsad(q);
          } else shart(node.shart);
          tana(node.tana);
          return;
        case "takror":
          stek.push(new Map()); // for (int i = …) — i faqat sikl ichida
          if (node.bosh) buyruq(node.bosh);
          if (node.shart) shart(node.shart);
          if (node.qadam) ifoda(node.qadam);
          tana(node.tana);
          stek.pop();
          return;
        case "qaytar":
          if (!node.ifoda) {
            throw E.sintaksis("non-void function 'main' should return a value", joy(node,
              "main() butun son qaytaradi: return 0;"));
          }
          if (!sonmi(ifoda(node.ifoda))) {
            throw E.sintaksis("cannot initialize return object of type 'int' with an expression of another type", joy(node.ifoda,
              "main() butun son qaytaradi: return 0;"));
          }
          return;
        default: return; // bosh, uz, davom
      }
    }

    buyruq(dastur.tana);
    return dastur;
  }

  const api = { tekshir };
  root.QK = root.QK || {};
  root.QK.cppEngine = Object.assign(root.QK.cppEngine || {}, { semantika: api });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

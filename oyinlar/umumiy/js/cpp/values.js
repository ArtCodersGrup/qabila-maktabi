// Kichik C++: qiymatlar va amallar.
//
// Qiymat — { t, v }:
//   int    — BigInt, 32 bitga qirqiladi (toshib ketish aynan C++ dagidek ko'rinadi)
//   ll     — BigInt, 64 bitga qirqiladi (long long)
//   double — oddiy JS soni
//   bool   — true/false ("cout << true" → 1)
//   char   — bitta belgi
//   string — matn
//
// Eslatma: C++ standartida butun sonning toshib ketishi "aniqlanmagan xatti-harakat",
// lekin amaldagi kompilyatorlar (g++ -O0) ikkilik to'ldiruvchi bo'yicha qirqadi — biz ham shunday
// qilamiz va buni haqiqiy g++ bilan tekshiramiz (umumiy/tests/cpp-engine-parity.test.js).
(function (root) {
  "use strict";

  const E = (root.QK && root.QK.cppEngine && root.QK.cppEngine.errors) || require("./errors.js");

  const INT_BIT = 32n;
  const LL_BIT = 64n;
  const qirq = (x, bit) => {
    const mod = 1n << bit;
    let r = ((x % mod) + mod) % mod;
    if (r >= mod / 2n) r -= mod;
    return r;
  };

  const son = (t, v) => ({ t, v: t === "int" ? qirq(v, INT_BIT) : t === "ll" ? qirq(v, LL_BIT) : v });
  const int = (v) => son("int", BigInt(v));
  const ll = (v) => son("ll", BigInt(v));
  const dbl = (v) => ({ t: "double", v: Number(v) });
  const bool = (v) => ({ t: "bool", v: !!v });
  const belgi = (v) => ({ t: "char", v: String(v).slice(0, 1) });
  const matn = (v) => ({ t: "string", v: String(v) });

  const butunmi = (q) => q.t === "int" || q.t === "ll" || q.t === "bool" || q.t === "char";
  const sonmi = (q) => butunmi(q) || q.t === "double";

  // Butun songa aylantirish (bool → 0/1, char → kodi)
  const butun = (q) => {
    if (q.t === "int" || q.t === "ll") return q.v;
    if (q.t === "bool") return q.v ? 1n : 0n;
    if (q.t === "char") return BigInt(q.v.charCodeAt(0));
    if (q.t === "double") return BigInt(Math.trunc(q.v));
    return 0n;
  };
  const kasr = (q) => (q.t === "double" ? q.v : Number(butun(q)));

  // Rost/yolg'on: 0 — yolg'on, qolgani rost
  const rostmi = (q) => {
    if (q.t === "double") return q.v !== 0;
    if (q.t === "string") return q.v.length > 0;
    return butun(q) !== 0n;
  };

  // C++ ning odatdagi tur keltirishi: double > long long > int
  const umumiyTur = (a, b) => {
    if (a.t === "double" || b.t === "double") return "double";
    if (a.t === "ll" || b.t === "ll") return "ll";
    return "int";
  };

  // cout qanday chiqaradi. double uchun C++ ning oddiy ko'rinishi — %g, 6 ta raqam.
  function yoz(q) {
    if (q.t === "bool") return q.v ? "1" : "0";
    if (q.t === "char") return q.v;
    if (q.t === "string") return q.v;
    if (q.t === "double") return yozDouble(q.v);
    return String(q.v);
  }

  // printf("%g") qoidasi: 6 ta ahamiyatli raqam, oxiridagi nollar tashlanadi,
  // daraja -4 dan kichik yoki 6 dan katta bo'lsa — eksponent ko'rinish.
  function yozDouble(x) {
    if (!isFinite(x)) return x > 0 ? "inf" : (x < 0 ? "-inf" : "nan");
    if (x === 0) return "0";
    const daraja = Math.floor(Math.log10(Math.abs(x)));
    if (daraja < -4 || daraja >= 6) {
      let s = x.toExponential(5);
      let [mant, exp] = s.split("e");
      if (mant.includes(".")) mant = mant.replace(/0+$/, "").replace(/\.$/, "");
      const belgi = exp[0] === "-" ? "-" : "+";
      const raqam = Math.abs(Number(exp)).toString().padStart(2, "0");
      return mant + "e" + belgi + raqam;
    }
    let s = x.toFixed(Math.max(0, 5 - daraja));
    if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s;
  }

  // ---------- Amallar ----------
  function arifmetik(op, a, b, pos) {
    const t = umumiyTur(a, b);
    if (t === "double") {
      const x = kasr(a);
      const y = kasr(b);
      if (op === "+") return dbl(x + y);
      if (op === "-") return dbl(x - y);
      if (op === "*") return dbl(x * y);
      if (op === "/") return dbl(x / y);
      throw E.sintaksis("invalid operands to binary expression ('double' and 'double')", pos);
    }
    const x = butun(a);
    const y = butun(b);
    if (op === "+") return son(t, x + y);
    if (op === "-") return son(t, x - y);
    if (op === "*") return son(t, x * y);
    if (op === "/") {
      if (y === 0n) throw E.nolgaBolish(pos);
      return son(t, x / y); // butun bo'lish: kasr qismi tashlanadi (7 / 2 = 3)
    }
    if (op === "%") {
      if (y === 0n) throw E.nolgaBolish(pos);
      return son(t, x % y); // qoldiqning ishorasi bo'linuvchiniki (-7 % 3 = -1)
    }
    throw E.sintaksis("unknown operator '" + op + "'", pos);
  }

  function solishtir(op, a, b, pos) {
    if (a.t === "string" || b.t === "string") {
      if (a.t !== b.t) throw E.turMos(a.t, b.t, pos);
      const x = a.v;
      const y = b.v;
      return bool(op === "==" ? x === y : op === "!=" ? x !== y : op === "<" ? x < y
        : op === ">" ? x > y : op === "<=" ? x <= y : x >= y);
    }
    const kasrmi = a.t === "double" || b.t === "double";
    const x = kasrmi ? kasr(a) : butun(a);
    const y = kasrmi ? kasr(b) : butun(b);
    return bool(op === "==" ? x === y : op === "!=" ? x !== y : op === "<" ? x < y
      : op === ">" ? x > y : op === "<=" ? x <= y : x >= y);
  }

  function amal(op, a, b, pos) {
    if (op === "+" && (a.t === "string" || b.t === "string")) {
      if (a.t === "string" && (b.t === "string" || b.t === "char")) return matn(a.v + b.v);
      if (a.t === "char" && b.t === "string") return matn(a.v + b.v);
      throw E.turMos("string", b.t === "string" ? a.t : b.t, pos);
    }
    if (["+", "-", "*", "/", "%"].includes(op)) {
      if (!sonmi(a) || !sonmi(b)) throw E.turMos(a.t, b.t, pos);
      if (op === "%" && (a.t === "double" || b.t === "double")) {
        throw E.sintaksis("invalid operands to binary expression ('double' and 'double')", pos);
      }
      return arifmetik(op, a, b, pos);
    }
    if (["==", "!=", "<", ">", "<=", ">="].includes(op)) return solishtir(op, a, b, pos);
    throw E.sintaksis("unknown operator '" + op + "'", pos);
  }

  // Qiymatni e'lon qilingan turga moslash: int x = 2.5; → 2
  function turga(t, q, pos) {
    if (t === "string") {
      if (q.t === "string") return matn(q.v);
      if (q.t === "char") return matn(q.v);
      throw E.turMos("string", q.t, pos);
    }
    if (t === "char") {
      if (q.t === "char") return belgi(q.v);
      if (butunmi(q)) return belgi(String.fromCharCode(Number(butun(q))));
      throw E.turMos("char", q.t, pos);
    }
    if (q.t === "string") throw E.turMos(t, "string", pos);
    if (t === "double") return dbl(kasr(q));
    if (t === "bool") return bool(rostmi(q));
    return son(t, butun(q)); // int yoki ll — kasr qismi tashlanadi
  }

  const boshlangich = (t) => (t === "double" ? dbl(0) : t === "string" ? matn("") : t === "bool" ? bool(false)
    : t === "char" ? belgi("\0") : son(t, 0n));

  const api = {
    son, int, ll, dbl, bool, belgi, matn, butun, kasr, rostmi, butunmi, sonmi,
    umumiyTur, yoz, yozDouble, amal, arifmetik, solishtir, turga, boshlangich, qirq,
  };
  root.QK = root.QK || {};
  root.QK.cppEngine = Object.assign(root.QK.cppEngine || {}, { values: api });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

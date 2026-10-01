// C++ bloki (54–57-o'yinlar) uchun umumiy mantiq: dastur qolipi, Python ↔ C++ jadvali,
// chiqishni solishtirish va sintaksis ro'yxatlari.
//
// MUHIM: bu yerda C++ kodi ISHGA TUSHMAYDI. Har bir misolning chiqishi o'yin ichida
// yozib qo'yilgan va `oyinlar/umumiy/tests/cpp-parity.test.js` da haqiqiy g++ bilan
// solishtiriladi (kompilyator bo'lmasa, test o'tkazib yuboriladi).
// Ekran qismlari — umumiy/js/cpp-ui.js da.
(function (root) {
  "use strict";

  // ---------- Dastur qolipi ----------
  const BOSH = "#include <iostream>\nusing namespace std;\n\nint main() {";
  const OXIR = "    return 0;\n}";

  // Tana satrlaridan to'liq dastur yasash (har satr 4 bo'shliq otstup bilan).
  // opts.string — matn bilan ishlaydigan dasturga yana bitta kutubxona qo'shiladi
  const dastur = (satrlar, opts) => {
    const bosh = opts && opts.string ? BOSH.replace("<iostream>\n", "<iostream>\n#include <string>\n") : BOSH;
    return bosh + "\n" + satrlar.map((s) => (s === "" ? "" : "    " + s)).join("\n") + "\n" + OXIR;
  };

  // "x" ni bitta satrda chiqarish
  const chiqar = (ifoda) => "cout << " + ifoda + ' << "\\n";';

  // ---------- Qolipning qismlari (nazariya kartasi uchun) ----------
  const QISMLAR = [
    { qism: "#include <iostream>", izoh: "Kirish-chiqish vositalarini qoʻshadi — cout va cin shundan keladi" },
    { qism: "using namespace std;", izoh: "cout ni std::cout deb yozmaslik uchun" },
    { qism: "int main() {", izoh: "Dastur shu yerdan boshlanadi; { — blokning boshi" },
    { qism: "return 0;", izoh: "«Dastur xatosiz tugadi» degani" },
    { qism: "}", izoh: "Blokning oxiri" },
  ];

  // ---------- Python ↔ C++ (har o'yinda ekranda turadigan sintaksis kartasi) ----------
  const JADVAL = [
    { nima: "Chiqish", python: 'print(x)', cpp: 'cout << x << "\\n";' },
    { nima: "Kirish", python: "x = int(input())", cpp: "cin >> x;" },
    { nima: "Oʻzgaruvchi", python: "x = 5", cpp: "int x = 5;" },
    { nima: "Satr oxiri", python: "hech narsa", cpp: "; majburiy" },
    { nima: "Blok", python: "otstup", cpp: "{ }" },
    { nima: "Izoh", python: "# izoh", cpp: "// izoh" },
  ];

  // ---------- Bo'yash uchun so'z ro'yxatlari ----------
  const KALIT = new Set(["if", "else", "while", "for", "do", "break", "continue", "return",
    "using", "namespace", "struct", "const", "true", "false", "void"]);
  const TUR = new Set(["int", "long", "double", "float", "char", "bool", "string", "vector", "auto"]);
  const ICHKI = new Set(["cout", "cin", "endl", "main", "std", "sort", "size", "push_back",
    "begin", "end", "swap", "abs", "max", "min"]);

  // ---------- Chiqishni solishtirish ----------
  // Bola yozgan javob bilan kutilgan chiqishni solishtiradi: oxiridagi bo'sh satrlar va
  // satr oxiridagi bo'shliqlar hisobga olinmaydi, qolgani aynan bo'lishi kerak.
  const satrlar = (matn) => {
    const xom = Array.isArray(matn) ? matn.join("\n") : String(matn == null ? "" : matn);
    const list = xom.replace(/\r/g, "").split("\n").map((s) => s.replace(/[ \t]+$/, ""));
    while (list.length && list[list.length - 1] === "") list.pop();
    return list;
  };

  function solishtir(kutilgan, berilgan) {
    const a = satrlar(kutilgan);
    const b = satrlar(berilgan);
    for (let k = 0; k < Math.max(a.length, b.length); k++) {
      if (a[k] === b[k]) continue;
      if (b[k] === undefined) return { ok: false, satr: k + 1, izoh: "Yana satr bor: " + (k + 1) + "-satr yetishmayapti." };
      if (a[k] === undefined) return { ok: false, satr: k + 1, izoh: "Ortiqcha satr yozilgan: dastur " + a.length + " ta satr chiqaradi." };
      return { ok: false, satr: k + 1, izoh: (k + 1) + "-satr boshqa. Kodda shu satrni chiqaradigan joyni qayta oʻqi." };
    }
    return { ok: true };
  }


  // ---------- "Kodni oʻzing yoz" mashqini tekshirish ----------
  // task: { sinovlar: [{ kirish: [], chiqish: [satrlar] }], ... }
  // Bola yozgan kod har sinovda ishga tushiriladi va chiqishi solishtiriladi.
  function tekshir(task, kod) {
    const dvigatel = (root.QK && root.QK.cpp && root.QK.cpp.run)
      ? root.QK.cpp.run
      : require("./cpp/cpp-run.js").run;
    const sinovlar = task.sinovlar && task.sinovlar.length ? task.sinovlar : [{ kirish: [], chiqish: task.chiqish || [] }];
    for (const sinov of sinovlar) {
      const natija = dvigatel(kod, { stdin: sinov.kirish || [] });
      if (natija.error) return { ok: false, kind: "xato", error: natija.error, sinov };
      const farq = solishtir(sinov.chiqish, natija.out);
      if (!farq.ok) return { ok: false, kind: "chiqish", izoh: farq.izoh, sinov, olingan: natija.output };
    }
    return { ok: true };
  }

  const api = { BOSH, OXIR, dastur, chiqar, QISMLAR, JADVAL, KALIT, TUR, ICHKI, satrlar, solishtir, tekshir };
  root.QK = root.QK || {};
  root.QK.cpp = Object.assign(root.QK.cpp || {}, api);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);

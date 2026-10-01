// 55-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/cpp-ui.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const U = QK.cppUI;
  const { ui } = QK;

  const mashq = (task) => (task.tur === "natija" ? U.natijaMashq(task)
    : task.tur === "yoz" ? U.yozMashq(task)
      : U.tanlovMashq(task));

  // Turlar jadvali: tur — nimadan nimagacha — qachon olinadi
  const TURLAR = [
    { tur: "int", chegara: "−2 147 483 648 … 2 147 483 647", qachon: "oddiy sanash, 2 milliardgacha" },
    { tur: "long long", chegara: "≈ ±9 · 10¹⁸", qachon: "yigʻindi va koʻpaytma katta boʻlsa" },
    { tur: "double", chegara: "kasr son, ≈ 15 raqam aniq", qachon: "oʻrtacha, boʻlish, oʻlchov" },
  ];

  function turJadval() {
    const el = ui.h("div", { class: "cpp-karta tc-turlar" });
    el.append(ui.h("div", { class: "cpp-karta-bosh" },
      ui.h("span", { text: "Tur" }), ui.h("span", { text: "Nimadan nimagacha" }), ui.h("span", { text: "Qachon" })));
    for (const t of TURLAR) {
      el.append(ui.h("div", { class: "cpp-qator" },
        ui.h("code", { class: "cpp-kod", html: U.paint(t.tur) }),
        ui.h("span", { class: "tc-chegara", text: t.chegara }),
        ui.h("span", { class: "cpp-izoh", text: t.qachon })));
    }
    return el;
  }

  // Dastur va uning haqiqiy chiqishi
  function kodVaChiqish(host, kod, chiqish, kirish) {
    host.append(U.kodBlok(kod));
    if (kirish && kirish.length) host.append(U.kirishPanel(kirish));
    host.append(U.chiqishPanel(chiqish));
  }

  // Python ↔ C++ yonma-yon
  function ikkiTil(pythonKod, cppKod) {
    return ui.h("div", { class: "cpp-ikki" },
      ui.h("div", {},
        ui.h("div", { class: "cpp-til", text: "Python" }),
        ui.h("div", { class: "kod-blok no-num" },
          ...pythonKod.split("\n").map((s) => ui.h("div", { class: "kod-satr" }, ui.h("code", { class: "kod-matn", text: s || " " }))))),
      ui.h("div", {},
        ui.h("div", { class: "cpp-til", text: "C++" }),
        U.kodBlok(cppKod, { numbers: false })));
  }

  QK.common = Object.assign({}, U, { mashq, turJadval, TURLAR, kodVaChiqish, ikkiTil });
})(window);

// 57-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/cpp-ui.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const U = QK.cppUI;
  const { ui } = QK;

  const mashq = (task) => (task.tur === "natija" ? U.natijaMashq(task)
    : task.tur === "yoz" ? U.yozMashq(task)
      : U.tanlovMashq(task));

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

  QK.common = Object.assign({}, U, { mashq, kodVaChiqish, ikkiTil });
})(window);

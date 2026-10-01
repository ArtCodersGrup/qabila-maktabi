// 54-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/cpp-ui.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const U = QK.cppUI;
  const { ui } = QK;

  // Bosqichlarda ikki xil mashq navbat bilan keladi
  const mashq = (task) => (task.tur === "natija" ? U.natijaMashq(task)
    : task.tur === "yoz" ? U.yozMashq(task)
      : U.tanlovMashq(task));

  // Dastur va uning chiqishi yonma-yon: "shu kod — shu natija"
  function kodVaChiqish(host, kod, chiqish, kirish) {
    host.append(U.kodBlok(kod));
    if (kirish && kirish.length) host.append(U.kirishPanel(kirish));
    host.append(U.chiqishPanel(chiqish));
  }

  // Ikki tildagi bir xil dastur
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

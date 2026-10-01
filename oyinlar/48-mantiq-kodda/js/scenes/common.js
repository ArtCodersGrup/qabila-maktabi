// 48-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;
  const { ui, logic: L, practice } = QK;
  const h = ui.h;

  const RY = (v) => (v ? "True" : "False");

  // Rostlik jadvali — qiymatlarni Python hisoblaydi
  function rostlik(ifoda, nomlar) {
    const qatorlar = L.jadval(ifoda, nomlar);
    const bitta = qatorlar.length === 2; // "not a" kabi bitta o'zgaruvchili
    const el = h("table", { class: "mk-jadval" });
    const bosh = h("tr", {}, h("th", { text: "a" }));
    if (!bitta) bosh.append(h("th", { text: "b" }));
    bosh.append(h("th", { class: "ifoda", text: ifoda }));
    const tana = h("tbody");
    for (const q of qatorlar) {
      const tr = h("tr", {}, h("td", { class: q.a ? "rost" : "yolgon", text: RY(q.a) }));
      if (!bitta) tr.append(h("td", { class: q.b ? "rost" : "yolgon", text: RY(q.b) }));
      tr.append(h("td", { class: "natija " + (q.natija ? "rost" : "yolgon"), text: RY(q.natija) }));
      tana.append(tr);
    }
    el.append(h("thead", {}, bosh), tana);
    return el;
  }

  const kodBlok = (kod) => QK.kodUI.codeBlock(kod, { numbers: false });

  // True/False tanlanadigan savol
  function ikkilikExercise(task, opts) {
    const o = opts || {};
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box(true);
        if (o.oldin) o.oldin(host);
        host.append(h("div", { class: "mk-savol", text: task.matn }));
        ui.control().append(
          ui.button("True", () => submit("True"), "big"),
          ui.button("False", () => submit("False"), "big"));
      },
      check: (value) => value === task.javob,
      hint() { host.append(M.note("↻ " + task.nega)); },
      solution() {
        host.append(M.answer(task.javob));
        if (o.keyin) o.keyin(host);
      },
    });
  }

  const solishtirExercise = (task) => ikkilikExercise(task, {
    oldin: (host) => host.append(kodBlok("print(" + task.ifoda + ")")),
  });

  const ifodaExercise = (task) => ikkilikExercise(task, {
    oldin: (host) => {
      const satrlar = Object.entries(task.vars).map(([k, v]) => k + " = " + v);
      host.append(kodBlok(satrlar.concat("print(" + task.ifoda + ")").join("\n")));
    },
    keyin: (host) => host.append(rostlik(task.ifoda)),
  });

  // Hayotiy gap → qaysi amal
  function gapExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box(true);
        host.append(h("div", { class: "mk-gap", text: task.matn }));
        host.append(M.note("Bu gapni kodda yozsak, qaysi amal kerak?"));
        ui.control().append(
          ui.button("and", () => submit("and"), "big"),
          ui.button("or", () => submit("or"), "big"),
          ui.button("not", () => submit("not"), "big"));
      },
      check: (value) => value === task.javob,
      hint() { host.append(M.note("↻ Ikkala shart ham kerakmi (and), bittasi yetadimi (or), yoki teskarisimi (not)?")); },
      solution() {
        host.append(M.answer(task.javob));
        host.append(rostlik(task.javob === "not" ? "not a" : "a " + task.javob + " b"));
      },
    });
  }

  const kodExercise = (task) => M.resultExercise(task);
  const yozishExercise = (task) => M.writeExercise(task);

  QK.common = Object.assign({}, M, { rostlik, kodBlok, ikkilikExercise, solishtirExercise, ifodaExercise, gapExercise, kodExercise, yozishExercise });
})(window);

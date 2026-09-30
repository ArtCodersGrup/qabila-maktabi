// 35-o'yin: masala ekrani — shart, format, namuna va kod maydoni.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;
  const { ui, kod: K, kodUI: U, practice, logic: L } = QK;

  // Masala kartasi: sarlavha, shart, kirish/chiqish formati va namuna
  function card(task) {
    const belgilar = ui.h("div", { class: "masala-belgi" });
    if (task.rating) belgilar.append(ui.h("span", { class: "chip reyting", text: "qiyinlik " + task.rating }));
    for (const tag of task.tags || []) belgilar.append(ui.h("span", { class: "chip", text: tag }));

    const el = ui.h("div", { class: "masala" },
      ui.h("div", { class: "masala-nom", text: task.title }),
      belgilar,
      ui.h("div", { class: "masala-shart", text: task.what }),
      ui.h("div", { class: "masala-format" },
        ui.h("div", {}, ui.h("b", { text: "Kirish: " }), ui.h("span", { text: task.kirish })),
        ui.h("div", {}, ui.h("b", { text: "Chiqish: " }), ui.h("span", { text: task.chiqish }))));

    const box = (title, lines, cls) => {
      const body = ui.h("pre", { class: "kod-natija" });
      for (const line of lines) body.append(ui.h("span", { class: "kod-chiqsatr", text: line }));
      return ui.h("div", { class: "kod-chiqish " + cls }, ui.h("div", { class: "kod-sarlavha", text: title }), body);
    };
    el.append(ui.h("div", { class: "namuna" },
      box("Namunaviy kirish", task.namuna.stdin, "kod-kirish"),
      box("Namunaviy chiqish", task.namuna.out, "kutilgan")));

    // Manba: shart o'zimizniki, g'oya Codeforces'dan — havola o'qituvchi uchun
    if (task.manba) {
      el.append(ui.h("div", { class: "masala-manba" },
        ui.h("span", { text: "Gʻoya manbasi: " }),
        ui.h("a", { href: task.manba.url, target: "_blank", rel: "noopener", text: "Codeforces " + task.manba.kod + " — " + task.manba.nom })));
    }
    return el;
  }

  // Bitta masala: ikki urinish (QOIDALAR §4.4) — 1-xato maslahat, 2-xato yechim
  function problemExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box();
        host.append(card(task));
        M.bench(host, {
          rows: 6,
          stdin: task.namuna.stdin,
          saveKey: "masala:" + task.id,
          onRun: (result, code) => submit(code),
        });
      },
      check: (value) => K.check(task, value).ok,
      hint(value) {
        const bad = K.check(task, value);
        host.append(M.note("↻ " + (bad.kind === "xato" ? bad.error.text : bad.hint)));
        host.append(M.note("Maslahat: " + task.hint));
      },
      solution() {
        M.showSolution(host, task.solution, task.namuna.stdin, "Yechimning bir yoʻli:");
      },
    });
  }

  QK.common = Object.assign({}, M, { card, problemExercise });
})(window);

// «Oʻzgaruvchi va maʼlumot turlari»: shu o'yinga xos mashq ekranlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, practice } = QK;
  const M = QK.kodMashq;

  // Terishdagi xato javob xatosi emas (QOIDALAR 4.4): talqinchi satrni ko'rsatadi, urinish sanalmaydi
  const TERISH = ["SyntaxError", "IndentationError", "NotYet"];

  // Kod va uning haqiqiy chiqishi (xato bo'lsa — xato xabari bilan)
  function withOutput(host, code) {
    host.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.show(K.run(code), code);
    host.append(out.el);
  }

  // Turni aniqlash: besh variantdan biri (klaviatura shart emas)
  function typeExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box();
        host.append(M.note(task.name + " oʻzgaruvchisining turi qaysi?"));
        host.append(U.codeBlock(task.code));
        const row = ui.h("div", { class: "tur-javoblar" });
        for (const t of task.options) row.append(ui.button(t, () => submit(t), "tur-tugma"));
        ui.control().append(row);
      },
      check: (value) => value === task.answer,
      hint() { host.append(M.note("↻ " + task.ishora)); },
      // Javob haqiqiy type() chiqishi bilan tasdiqlanadi
      solution() {
        host.append(M.answer(task.name + " — " + task.answer));
        withOutput(host, task.tekshir);
        host.append(M.note(task.why));
      },
    });
  }

  // Xatoni tuzatish: kutilgan chiqish ko'rinib turadi — "jim" xatoda ("15" * 2) ham nima noto'g'riligi bilinadi
  function fixExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box();
        host.append(M.note("Bu kodda tur bilan bogʻliq bitta xato bor. Tuzat va ishga tushir."));
        host.append(M.wanted(task.lines));
        M.bench(host, { code: task.code, rows: 4, onRun: (result, code) => submit(code) });
      },
      check: (value) => K.check(task, value).ok,
      hint() { host.append(M.note("↻ Qoida: " + task.why + ".")); },
      solution() { M.showSolution(host, task.solution); },
    });
  }

  // O'zing yoz: tekshiruv kodni bir nechta ro'yxat bilan ishga tushiradi (logic.checkWrite)
  function writeExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box();
        host.append(M.note(task.what));
        host.append(M.wanted(task.lines));
        M.bench(host, {
          code: task.starter, rows: 5,
          onRun: (result, code) => {
            if (result.error && TERISH.includes(result.error.type)) return;
            submit(code);
          },
        });
      },
      check: (value) => L.checkWrite(task, value).ok,
      hint(value) { host.append(M.note("↻ " + L.checkWrite(task, value).hint)); },
      solution() { M.showSolution(host, task.solution); },
    });
  }

  const stage1Exercise = (task) => (task.type === "tur" ? typeExercise(task) : M.resultExercise(task));
  const stage2Exercise = (task) => (task.type === "xato-top" ? fixExercise(task) : M.resultExercise(task));
  const stage3Exercise = (task) => (task.type === "kod-yoz" ? writeExercise(task) : M.resultExercise(task));

  QK.common = Object.assign({}, M, { withOutput, typeExercise, fixExercise, writeExercise, stage1Exercise, stage2Exercise, stage3Exercise });
})(window);

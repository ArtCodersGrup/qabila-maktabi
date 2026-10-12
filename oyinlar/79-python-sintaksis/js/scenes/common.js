// «Python: sintaksis»: shu o'yinga xos mashq ekranlari. Umumiylari — umumiy/js/kod-mashq.js da.
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

  // Xatoni tuzatish: kutilgan chiqish ko'rinib turadi — xato "jim" bo'lsa ham (0,92) nima noto'g'riligi bilinadi
  function fixExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box();
        host.append(M.note("Bu kodda bitta xato bor. Tuzat va ishga tushir."));
        host.append(M.wanted(task.lines));
        M.bench(host, { code: task.code, rows: 5, onRun: (result, code) => submit(code) });
      },
      check: (value) => K.check(task, value).ok,
      hint() { host.append(M.note("↻ Qoida: " + task.why + ".")); },
      solution() { M.showSolution(host, task.solution); },
    });
  }

  // O'zing yoz: tekshiruv kodni bir nechta qiymat to'plami bilan ishga tushiradi (logic.checkWrite)
  function writeExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box();
        host.append(M.note(task.what));
        host.append(M.wanted(task.lines));
        M.bench(host, {
          code: task.starter, rows: 6,
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

  QK.common = Object.assign({}, M, { withOutput, fixExercise, writeExercise });
})(window);

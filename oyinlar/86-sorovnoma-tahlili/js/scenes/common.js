// «Amaliy: soʻrovnoma tahlili»: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
// Tekshiruv (js/logic.js → check) matnni solishtirmaydi: kod bir nechta yashirin ma'lumot to'plamida bajariladi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, kod: K, kodUI: U, logic: L, practice } = QK;
  const M = QK.kodMashq;

  const printed = (calls) => calls.map((c) => "print(" + c + ")").join("\n");
  const rowsFor = (text, extra) => Math.min(18, Math.max(6, String(text || "").split("\n").length + extra));

  function withOutput(host, code) {
    host.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.show(K.run(code), code);
    host.append(out.el);
  }

  // ---------- 1- va 3-bosqich: ma'lumot ustida kod ----------
  // Muharrirda ma'lumot satrlari (va 3-bosqichda tayyor funksiyalar) turadi; bola davomini yozadi.
  // Terishdagi xato (SyntaxError, otstup, «bu saytda hali yoʻq») urinish sanalmaydi — QOIDALAR 4.4.
  function dataExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box();
        if (task.question) host.append(ui.h("div", { class: "savol", text: task.question }));
        host.append(M.note(task.what));
        host.append(M.wanted(task.lines));
        M.bench(host, {
          code: task.starter, rows: rowsFor(task.starter, 7),
          onRun: (result, code) => { if (!L.typing(result.error)) submit(code); },
        });
      },
      check: (value) => L.check(task, value).ok,
      hint(value) {
        const bad = L.check(task, value);
        host.append(M.note("↻ " + bad.hint + (bad.kind === "bosh" || bad.kind === "malumot" ? "" : " Maslahat: " + task.tip + ".")));
      },
      solution() { M.showSolution(host, task.solution, undefined, "Namunali yechim:"); },
    });
  }

  // ---------- 2-bosqich: funksiya — chaqiruvlar bilan ----------
  function funcExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box();
        host.append(M.note(task.what));
        host.append(ui.h("div", { class: "sinov-sarlavha", text: "Sinov chaqiruvlari (sayt oʻzi qoʻshadi; yana yashirinlari bor):" }));
        host.append(U.codeBlock(printed(task.show), { numbers: false }));
        const out = U.output({});
        const run = () => {
          const code = ed.get();
          const full = L.withCalls(code, task.show);
          const result = K.run(full);
          out.show(result, full);
          sound.play(result.error ? "retry" : "tap");
          if (L.typing(result.error)) return;
          submit(code);
        };
        const ed = U.editor({ code: task.code, rows: rowsFor(task.code, 3), onRun: run });
        host.append(ui.h("div", { class: "kod-stol" }, ed.el, out.el));
        ui.control().append(ui.button("▶︎ Ishga tushir", run, "big"));
        setTimeout(() => ed.focus(), 50);
      },
      check: (value) => L.check(task, value).ok,
      hint(value) {
        const bad = L.check(task, value);
        host.append(M.note("↻ " + (bad.kind === "bosh" ? bad.hint : "Shu chaqiruvni tekshir: " + bad.hint)));
      },
      solution() {
        host.append(M.answer("Namunali yechim:"), U.codeBlock(task.solution, { numbers: false }));
        const out = U.output({ title: "Sinov chaqiruvlari natijasi" });
        out.lines(K.run(L.withCalls(task.solution, task.show)).output);
        host.append(out.el);
      },
    });
  }

  QK.common = Object.assign({}, M, { withOutput, dataExercise, funcExercise });
})(window);

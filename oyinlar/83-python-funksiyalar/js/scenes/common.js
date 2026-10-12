// «Funksiyalar»: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
// Funksiya masalalari CHAQIRUVLAR bilan tekshiriladi (js/logic.js → check): muharrirdagi koddan keyin
// sayt print(chaqiruv) satrlarini o'zi qo'shadi — ikkitasi ekranda ko'rinadi, qolgani yashirin.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, kod: K, kodUI: U, logic: L, practice } = QK;
  const M = QK.kodMashq;

  const printed = (calls) => calls.map((c) => "print(" + c + ")").join("\n");

  // Kod va uning haqiqiy chiqishi (xato bo'lsa — xato xabari bilan)
  function withOutput(host, code) {
    host.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.show(K.run(code), code);
    host.append(out.el);
  }

  // Muharrir + chiqish paneli. "Ishga tushir": kod + ko'rinadigan chaqiruvlar bajariladi, natija ko'rsatiladi.
  // Terishdagi xato (SyntaxError, otstup, "bu saytda hali yo'q") urinish sanalmaydi — QOIDALAR 4.4.
  function callBench(host, task, submit) {
    host.append(ui.h("div", { class: "sinov-sarlavha", text: "Sinov chaqiruvlari (sayt oʻzi qoʻshadi; yana yashirinlari bor):" }));
    host.append(U.codeBlock(printed(task.show), { numbers: false }));
    const lines = String(task.code || "").split("\n").length;
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
    const ed = U.editor({ code: task.code, rows: Math.min(14, Math.max(5, lines + 2)), onRun: run });
    host.append(ui.h("div", { class: "kod-stol" }, ed.el, out.el));
    ui.control().append(ui.button("▶︎ Ishga tushir", run, "big"));
    setTimeout(() => ed.focus(), 50);
  }

  function showFixed(host, task, text) {
    const full = L.withCalls(task.solution, task.show);
    host.append(M.answer(text), U.codeBlock(task.solution, { numbers: false }));
    const out = U.output({ title: "Sinov chaqiruvlari natijasi" });
    out.lines(K.run(full).output);
    host.append(out.el);
  }

  // ---------- Xatoli funksiyani tuzatish ----------
  function fixExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box();
        host.append(M.note("Vazifa: " + task.what + " Kodda xato bor — tuzat va ishga tushir."));
        callBench(host, task, submit);
      },
      check: (value) => L.check(task, value).ok,
      hint() { host.append(M.note("↻ Maslahat: " + task.why + ".")); },
      solution() { showFixed(host, task, "Tuzatilgan funksiya:"); },
    });
  }

  // ---------- Funksiyani o'zi yozish ----------
  function writeExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box();
        host.append(M.note(task.what));
        callBench(host, task, submit);
      },
      check: (value) => L.check(task, value).ok,
      hint(value) {
        const bad = L.check(task, value);
        host.append(M.note("↻ " + (bad.kind === "bosh" ? bad.hint : "Shu chaqiruvni tekshir: " + bad.hint)));
      },
      solution() { showFixed(host, task, "Namunali yechim:"); },
    });
  }

  QK.common = Object.assign({}, M, { withOutput, fixExercise, writeExercise });
})(window);

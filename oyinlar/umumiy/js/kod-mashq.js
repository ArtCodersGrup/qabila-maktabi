// Python bloki (27–35-o'yinlar) uchun umumiy mashq ekranlari: ish stoli va besh xil mashq.
// Tekshirish mantiqi umumiy/js/kod.js da, ekran qismlari umumiy/js/kod-ui.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, practice } = QK;

  function box(compact) {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = ui.h("div", { class: "pbox" });
    ui.work().append(el);
    return el;
  }

  const note = (text) => ui.h("div", { class: "note", text });
  const answer = (text) => ui.h("div", { class: "answer", text });

  // Yo'l-yo'riq satri: qayta urinilganda matn almashadi, yangi satr qo'shilmaydi
  function liveNote(host) {
    let el = null;
    return (text) => {
      if (!el) {
        el = note(text);
        host.append(el);
      } else {
        el.textContent = text;
      }
    };
  }

  // "Shunday chiqishi kerak" kartasi
  function wanted(lines) {
    const body = ui.h("pre", { class: "kod-natija" });
    for (const line of lines) body.append(ui.h("span", { class: "kod-chiqsatr", text: line }));
    return ui.h("div", { class: "kutilgan" },
      ui.h("div", { class: "kod-sarlavha", text: "Shunday chiqishi kerak" }), body);
  }

  // Muharrir + chiqish paneli + "Ishga tushir" tugmasi
  function bench(host, opts) {
    const o = opts || {};
    const w = U.workbench({ code: o.code, rows: o.rows || 3, stdin: o.stdin, saveKey: o.saveKey, onRun: o.onRun });
    host.append(w.el);
    ui.control().append(ui.button("▶︎ Ishga tushir", () => w.run(), "big"));
    setTimeout(() => w.editor.focus(), 50);
    return w;
  }

  // Xato javobdan keyin to'g'ri kodni va uning chiqishini ko'rsatish
  function showSolution(host, code, stdin, text) {
    host.append(answer(text || "Toʻgʻri javob:"), U.codeBlock(code, { numbers: false }));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code, { stdin }).output);
    host.append(out.el);
  }

  // ---------- Kodni aynan terish ----------
  function typeExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box();
        host.append(note("Shu kodni aynan ter va ishga tushir:"));
        host.append(U.codeBlock(task.code, { numbers: false }));
        bench(host, { onRun: (result, code) => submit(code) });
      },
      check: (value) => K.check(task, value).ok,
      hint(value) {
        const diff = K.check(task, value).diff;
        host.append(note("↻ " + diff.line + "-satrda farq bor. " + diff.col + "-belgidan boshlab solishtir."));
      },
      solution() { showSolution(host, task.code); },
    });
  }

  // ---------- Natijani aytish ----------
  function resultExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box();
        host.append(note("Bu kod nima chiqaradi? Har satrni alohida qatorga yoz."));
        host.append(U.codeBlock(task.code));
        if (task.stdin && task.stdin.length) host.append(U.stdinPanel(task.stdin));
        const area = ui.h("textarea", {
          class: "kod-javob", rows: "3", spellcheck: "false",
          autocapitalize: "off", autocorrect: "off", "aria-label": "Chiqishni yoz",
        });
        area.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(area.value); }
        });
        host.append(area);
        ui.control().append(ui.button("Tekshir", () => submit(area.value), "big"));
        setTimeout(() => area.focus(), 50);
      },
      check: (value) => K.check(task, value).ok,
      hint(value) { host.append(note("↻ " + K.check(task, value).hint)); },
      solution() {
        const out = U.output({ title: "Haqiqiy chiqish" });
        out.lines(K.run(task.code, { stdin: task.stdin }).output);
        host.append(answer("Toʻgʻri javob:"), out.el);
      },
    });
  }

  // ---------- Xatoni tuzatish ----------
  function fixExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box();
        host.append(note("Bu kod ishlamayapti. Tuzat va ishga tushir."));
        bench(host, { code: task.code, stdin: task.stdin, onRun: (result, code) => submit(code) });
      },
      check: (value) => K.check(task, value).ok,
      hint() { host.append(note("↻ Xato joyi: " + (task.why || "xato xabarini oʻqi") + ".")); },
      solution() { showSolution(host, task.solution, task.stdin); },
    });
  }

  // ---------- Kodni o'zi yozish ----------
  function writeExercise(task) {
    let host = null;
    const cases = task.tests && task.tests.length ? task.tests : [{ stdin: task.stdin || [] }];
    return practice.tries({
      setup(submit) {
        host = box();
        host.append(note(task.what || "Shu chiqishni beradigan kodni yoz."));
        if (task.lines) host.append(wanted(task.lines));
        bench(host, { rows: 4, stdin: cases[0].stdin, onRun: (result, code) => submit(code) });
      },
      check: (value) => K.check(task, value).ok,
      hint(value) {
        const bad = K.check(task, value);
        host.append(note("↻ " + (bad.kind === "xato" ? bad.error.text : bad.hint)));
      },
      solution() { showSolution(host, task.solution, cases[0].stdin); },
    });
  }

  QK.kodMashq = { box, note, liveNote, answer, wanted, bench, showSolution, typeExercise, resultExercise, fixExercise, writeExercise };
})(window);

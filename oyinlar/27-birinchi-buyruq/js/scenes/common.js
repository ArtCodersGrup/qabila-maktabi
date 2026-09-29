// 27-o'yin: umumiy sahna qismlari — ish stoli (muharrir + chiqish) va mashq turlari.
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

  // "Shu chiqish kerak" kartasi
  function wanted(lines) {
    const el = ui.h("div", { class: "kutilgan" }, ui.h("div", { class: "kod-sarlavha", text: "Shunday chiqishi kerak" }));
    const body = ui.h("pre", { class: "kod-natija" });
    for (const line of lines) body.append(ui.h("span", { class: "kod-chiqsatr", text: line }));
    el.append(body);
    return el;
  }

  // Muharrir + chiqish paneli + "Ishga tushir" tugmasi
  function bench(host, opts) {
    const o = opts || {};
    const w = U.workbench({ code: o.code, rows: o.rows || 3, stdin: o.stdin, onRun: o.onRun });
    host.append(w.el);
    ui.control().append(ui.button("▶︎ Ishga tushir", () => w.run(), "big"));
    setTimeout(() => w.editor.focus(), 50);
    return w;
  }

  // Yo'l-yo'riq satri: qayta-qayta urinilganda matn almashadi, yangi satr qo'shilmaydi
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

  // Xato javobdan keyin to'g'ri kodni ko'rsatish
  function showSolution(host, code, text) {
    host.append(answer(text || "Toʻgʻri javob:"), U.codeBlock(code, { numbers: false }));
    const r = K.run(code);
    const out = U.output({ title: "Chiqish" });
    out.lines(r.output);
    host.append(out.el);
  }

  // ---------- 1-bosqich mashqi: kodni aynan terish ----------
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

  // ---------- 2-bosqich mashqi: natijani aytish ----------
  function resultExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box();
        host.append(note("Bu kod nima chiqaradi? Har satrni alohida qatorga yoz."));
        host.append(U.codeBlock(task.code));
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
      hint(value) {
        host.append(note("↻ " + K.check(task, value).hint));
      },
      solution() {
        const out = U.output({ title: "Haqiqiy chiqish" });
        out.lines(K.run(task.code).output);
        host.append(answer("Toʻgʻri javob:"), out.el);
      },
    });
  }

  // ---------- 3-bosqich mashqi: xatoni tuzatish yoki kodni yozish ----------
  function fixExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box();
        host.append(note("Bu kod ishlamayapti. Tuzat va ishga tushir."));
        bench(host, { code: task.code, onRun: (result, code) => submit(code) });
      },
      check: (value) => K.check(task, value).ok,
      hint() { host.append(note("↻ Xato joyi: " + task.why + ".")); },
      solution() { showSolution(host, task.solution); },
    });
  }

  function writeExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box();
        host.append(note("Shu chiqishni beradigan kodni yoz."));
        host.append(wanted(task.lines));
        bench(host, { onRun: (result, code) => submit(code) });
      },
      check: (value) => K.check(task, value).ok,
      hint(value) {
        const bad = K.check(task, value);
        host.append(note("↻ " + (bad.kind === "xato" ? bad.error.text : "Chiqish boshqacha. Har satr uchun bitta print kerak.")));
      },
      solution() { showSolution(host, task.solution); },
    });
  }

  const stage3Exercise = (task) => (task.type === "xato-top" ? fixExercise(task) : writeExercise(task));

  QK.common = { box, note, liveNote, answer, wanted, bench, showSolution, typeExercise, resultExercise, fixExercise, writeExercise, stage3Exercise };
})(window);

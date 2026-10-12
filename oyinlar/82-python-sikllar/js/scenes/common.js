// «for va while»: shu o'yinga xos mashq ekranlari. Umumiylari — umumiy/js/kod-mashq.js da.
//   countExercise — belgilangan satr necha marta bajariladi (son bilan javob)
//   fillExercise  — kodda bo'sh joy (___): naqshni to'ldirish
//   fixExercise   — sikldagi mantiqiy xatoni tuzatish
//   writeExercise — dasturni to'liq yozish
// Oxirgi uchtasi bolaning kodini ishga tushirib, chiqishini kutilgan bilan solishtiradi.
// Terish xatosi (sintaksis, otstup, saytda yo'q buyruq) urinish sanalmaydi — QOIDALAR 4.4.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, practice } = QK;
  const M = QK.kodMashq;

  const TERISH = ["SyntaxError", "IndentationError", "NotYet"];
  const terishXatosi = (result) => !!(result && result.error && TERISH.includes(result.error.type));
  const TERISH_MATNI = "↻ Bu terish xatosi — urinish sanalmadi. Xabarni oʻqib tuzat.";

  const casesOf = (task) => (task.tests && task.tests.length ? task.tests : [{ stdin: task.stdin || [] }]);

  // Sinovlar jadvali: kirish → kutilgan chiqish (namunali yechimdan hisoblanadi)
  function sinovJadval(task, limit) {
    const body = ui.h("tbody");
    for (const c of casesOf(task).slice(0, limit || 6)) {
      body.append(ui.h("tr", {},
        ui.h("td", { text: (c.stdin || []).join(", ") }),
        ui.h("td", { text: K.expectedFor(task, c).join(" / ") })));
    }
    return ui.h("table", { class: "sinov-jadval" },
      ui.h("thead", {}, ui.h("tr", {}, ui.h("th", { text: "Kirish" }), ui.h("th", { text: "Chiqishi kerak" }))),
      body);
  }

  const nuqta = (s) => (/[.?!]$/.test(s) ? s : s + ".");
  // Maslahat yechimni aytmaydi: qayerga qarashni (why) va qaysi sinov o'tmaganini ko'rsatadi
  const maslahat = (why, bad) => "↻ " + (why ? nuqta(why) + " " : "") + ((bad.kind === "xato" ? bad.error.text : bad.hint) || "");

  // ---------- Shartni to'ldirish ----------
  function fillExercise(task) {
    let host = null;
    let say = null;
    const first = casesOf(task)[0];
    return practice.tries({
      setup(submit) {
        host = M.box();
        host.append(M.note(task.what));
        host.append(U.codeBlock(task.template));
        host.append(task.tests && task.tests.length ? sinovJadval(task, 7) : M.wanted(task.lines || K.expectedFor(task)));
        const n = K.blanksIn(task.template);
        const inputs = [];
        const row = ui.h("div", { class: "bosh-qator" });
        const out = U.output({ title: "Chiqish" });
        const go = () => {
          const answers = inputs.map((el) => el.value);
          if (answers.some((a) => !a.trim())) { say("↻ Hamma boʻsh joyni toʻldir."); return; }
          const code = K.fill(task.template, answers);
          const result = K.run(code, first);
          out.show(result, code);
          if (terishXatosi(result)) { say(TERISH_MATNI); return; }
          submit(answers);
        };
        for (let k = 0; k < n; k++) {
          const el = ui.h("input", {
            class: "bosh-joy", type: "text", spellcheck: "false", autocapitalize: "off", autocorrect: "off", autocomplete: "off",
            "aria-label": (k + 1) + "-boʻsh joy", placeholder: n > 1 ? (k + 1) + "-boʻsh joy" : "boʻsh joy",
          });
          el.addEventListener("keydown", (e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (k + 1 < n && !inputs[k + 1].value.trim()) inputs[k + 1].focus();
            else go();
          });
          inputs.push(el);
          row.append(ui.h("label", { class: "bosh-yorliq" }, ui.h("span", { text: n > 1 ? (k + 1) + ")" : "___ =" }), el));
        }
        host.append(row, out.el);
        say = M.liveNote(host);
        ui.control().append(ui.button("▶︎ Tekshir", go, "big"));
        setTimeout(() => inputs[0].focus(), 50);
      },
      check: (answers) => K.check(task, answers).ok,
      hint(answers) { say(maslahat(task.why, K.check(task, answers))); },
      solution() { M.showSolution(host, task.solution, first.stdin); },
    });
  }

  // Muharrirli mashq: tuzatish va yozish uchun umumiy qism
  function benchExercise(task, opts) {
    let host = null;
    let say = null;
    const first = casesOf(task)[0];
    return practice.tries({
      setup(submit) {
        host = M.box();
        host.append(M.note(task.what));
        if (opts.izoh) host.append(ui.h("div", { class: "izoh", text: opts.izoh }));
        host.append(sinovJadval(task, opts.sinovlar));
        M.bench(host, {
          code: opts.code, rows: opts.rows, stdin: first.stdin,
          onRun: (result, code) => {
            if (!String(code).trim()) { say("↻ Avval kodni yoz, keyin ishga tushir."); return; }
            if (terishXatosi(result)) { say(TERISH_MATNI); return; }
            submit(code);
          },
        });
        say = M.liveNote(host);
      },
      check: (code) => K.check(task, code).ok,
      hint(code) { say(maslahat(opts.why && task.why, K.check(task, code))); },
      solution() { M.showSolution(host, task.solution, first.stdin); },
    });
  }

  const fixExercise = (task) => benchExercise(task, {
    code: task.code, rows: task.code.split("\n").length + 1, sinovlar: 6, why: true,
    izoh: "Dasturda bitta mantiqiy xato bor: chiqish jadvaldagidan farq qiladi. Topib tuzat.",
  });

  const writeExercise = (task) => benchExercise(task, {
    rows: 9, sinovlar: 3, izoh: "Kirishda har qiymat alohida satrda keladi. Dastur boshqa kirishlarda ham tekshiriladi.",
  });

  const stage2Exercise = (task) => (task.type === "bosh-joy" ? fillExercise(task) : M.resultExercise(task));
  const stage3Exercise = (task) => (task.type === "kod-yoz" ? writeExercise(task) : fixExercise(task));

  // ---------- Belgilangan satr necha marta bajariladi ----------
  // Javob — son (ekran klaviaturasi: telefonda ham ishlaydi). 1-xato — maslahat, 2-xato — qiymatlar ketma-ketligi.
  function countExercise(task) {
    const host = M.box();
    host.append(M.note("Belgilangan satr necha marta bajariladi?"));
    host.append(U.codeBlock(task.code, { mark: task.mark }));
    const say = M.liveNote(host);
    return practice.numberTries({
      answer: task.answer, maxLen: 2,
      hint() { say("↻ " + task.why); },
      solution() { host.append(M.answer(task.izoh)); },
    });
  }

  // Kod va uning chiqishi yonma-yon (ko'rsatish sahnalari uchun)
  function withOutput(host, code, stdin) {
    host.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code, { stdin }).output);
    host.append(out.el);
  }

  // ⏭ Qadam tugmasi bilan kodni satrma-satr yurgizish
  function stepThrough(host, code, bubbleText) {
    const step = U.stepper({ code });
    host.append(step.el);
    ui.bubble("elder", bubbleText);
    return ui.settle((done) => {
      ui.control().append(ui.button("⏭ Qadam", () => {
        if (!step.step()) { ui.clearControl(); done(); }
      }, "big"));
    });
  }

  QK.common = Object.assign({}, M, { sinovJadval, countExercise, fillExercise, fixExercise, writeExercise, stage2Exercise, stage3Exercise, withOutput, stepThrough });
})(window);

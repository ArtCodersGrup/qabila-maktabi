// Robot yo'li: umumiy sahna qismlari — maydon qurish, dasturni bajarish, mashq savollari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, dastur: D, dasturUi: U, logic: L, practice } = QK;

  function box(compact) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = ui.h("div", { class: "rbox" });
    ui.work().append(el);
    return el;
  }

  const answerLine = (text) => ui.h("div", { class: "answer", text });
  const note = (text) => ui.h("div", { class: "note", text });
  const arrows = (program) => program.map((d) => D.DIRS[d].arrow).join(" ");

  function add(host, ...nodes) {
    host.append(...nodes);
    const last = nodes[nodes.length - 1];
    if (last && last.scrollIntoView) last.scrollIntoView({ block: "nearest" });
  }

  // Maydon + dastur ro'yxati
  function board(field, opts) {
    const el = box(true);
    const view = U.fieldView(el, field, opts);
    const list = U.programList(el);
    return { el, view, list };
  }

  // Dasturni bajarish: robot qadam-baqadam yuradi, bajarilayotgan buyruq yonadi,
  // urilgan katakda ↻, gulxanda ✓
  async function execute(view, list, field, program) {
    const r = D.run(field, program);
    list.lock(true);
    await view.walk(r.path, (k) => list.highlight(k));
    list.highlight(-1);
    if (r.blocked) {
      view.mark(r.blocked, "retry");
      sound.play("retry");
    } else if (r.status === "goal") {
      view.mark(field.goal, "ok");
    }
    await ui.sleep(250);
    return r;
  }

  const stopText = (r) => (r.status === "wall"
    ? "↻ Tosh! Robot oʻtolmadi. Uni aylanib oʻt."
    : r.status === "edge"
      ? "↻ Maydon shu yerda tugaydi. Boshqa tomonni sinab koʻr."
      : "↻ Robot gulxanga yetmadi. Sanab koʻr: nechta katak, qaysi tomonga?");

  // Robotni boshiga qaytarish — yozilgan dastur saqlanadi
  function reset(view, list, field) {
    view.set(field.robot, true);
    view.clearMarks();
    view.clearTrail();
    list.lock(false);
    list.highlight(-1);
  }

  // Dastur yig'ish tugmalari. onDone(program, run) — "Ishga tushir" bosilib, robot yurib bo'lgach
  function writing(view, list, field, onDone) {
    const pad = U.commandPad(ui.control(), {
      onAdd: (dir) => { if (!list.add(dir)) ui.toast("Dastur toʻldi. Ortiqchasini oʻchir."); },
      onBack: () => list.removeLast(),
      onRun: async () => {
        const program = list.get();
        if (!program.length) {
          ui.toast("Avval buyruq qoʻsh.");
          return;
        }
        pad.lock(true);
        const r = await execute(view, list, field, program);
        onDone(program, r, pad);
      },
    });
    return pad;
  }

  // ---------- Ko'rsatish: bola o'zi bajaradi, xatosi sanalmaydi ----------
  async function guided(spec, text) {
    const field = D.field(spec);
    const { view, list } = board(field);
    ui.bubble("elder", text);
    await ui.settle((done) => {
      writing(view, list, field, (program, r, pad) => {
        if (r.status === "goal") {
          sound.play("win");
          ui.clearControl();
          done();
          return;
        }
        ui.bubble("elder", stopText(r));
        reset(view, list, field);
        pad.lock(false);
      });
    });
  }

  // ---------- Mashq savollari ----------
  // 1–2-bosqich: dastur yozish
  function writeTask(task) {
    const field = task.field;
    const { el, view, list } = board(field);
    let last = null;
    let pad = null;
    // tier 2: eng qisqa yo'l sharti — buyruqlar soni aytiladi, yo'lni bola o'zi topadi
    ui.bubble("elder", task.shortest
      ? `Robotni gulxangacha ENG QISQA yoʻl bilan olib bor — ${task.shortest} ta buyruq.`
      : "Robotni gulxangacha olib bor.");
    return practice.tries({
      setup: (submit) => {
        pad = writing(view, list, field, (program, r) => {
          last = r;
          submit(program);
        });
      },
      check: (program) => L.checkTask(task, program),
      hint: (program) => {
        ui.bubble("elder", L.tooLong(task, program)
          ? `↻ Robot yetdi, lekin ${program.length} ta buyruq bilan. ${task.shortest} ta buyruq yetadi — qisqaroq yoʻl top.`
          : stopText(last));
        reset(view, list, field);
        pad.lock(false);
      },
      solution: () => {
        const p = D.solve(field);
        const r = D.run(field, p);
        list.set(p);
        list.lock(true);
        view.clearMarks();
        view.trail(r.path);
        view.set(r.at, true);
        view.mark(field.goal, "ok");
        add(el, answerLine(`Toʻgʻri dastur: ${arrows(p)}`));
      },
    });
  }

  // 3-bosqich: dasturni o'qish — robot qayerda to'xtaydi?
  function readTask(task) {
    const field = task.field;
    const { el, view, list } = board(field);
    list.set(task.program);
    list.lock(true);
    const r = D.run(field, task.program);
    let picked = null;
    ui.bubble("elder", "Robot shu dasturni bajaradi. Qaysi katakda toʻxtaydi? Katakni bos.");
    return practice.tries({
      setup: (submit) => {
        view.pickCell((c) => { picked = c; });
        ui.control().append(ui.button("Tayyor ✓", () => {
          if (!picked) {
            ui.toast("Avval katakni bos.");
            return;
          }
          submit(picked);
        }));
      },
      check: (c) => L.checkTask(task, c),
      hint: () => {
        view.clearMarks();
        view.firstStep(r.path);
        ui.bubble("elder", "↻ Birinchi qadamni koʻrsatdim. Qolganini oʻzing sana.");
      },
      solution: () => {
        view.clearMarks();
        view.trail(r.path);
        view.set(r.at, true);
        view.mark(r.at, "ok");
        add(el, answerLine(r.status === "wall" ? "Robot toshga urilib toʻxtadi." : "Robot shu katakda toʻxtaydi."));
      },
    });
  }

  // 3-bosqich: izdan dasturni tiklash
  function traceTask(task) {
    const field = task.field;
    const { el, view, list } = board(field);
    const r = D.run(field, task.program);
    view.trail(r.path);
    let pad = null;
    ui.bubble("elder", "Robot shu yoʻldan gulxanga bordi. Qaysi buyruqlar berilgan edi?");
    return practice.tries({
      setup: (submit) => {
        pad = writing(view, list, field, (program) => submit(program));
      },
      check: (program) => L.checkTask(task, program),
      hint: () => {
        reset(view, list, field);
        view.trail(r.path);
        view.firstStep(r.path);
        pad.lock(false);
        ui.bubble("elder", "↻ Birinchi qadamga qara: robot qayoqqa yurdi?");
      },
      solution: () => {
        list.set(task.program);
        list.lock(true);
        view.clearMarks();
        view.trail(r.path);
        view.set(r.at, true);
        view.mark(field.goal, "ok");
        add(el, answerLine(`Toʻgʻri dastur: ${arrows(task.program)}`));
      },
    });
  }

  const runTask = (task) => (task.type === "read" ? readTask(task) : task.type === "trace" ? traceTask(task) : writeTask(task));

  const praise = (task) => (task.type === "read"
    ? "Robot aynan shu katakda toʻxtaydi."
    : task.type === "trace" ? "Aynan shu buyruqlar!" : task.shortest ? "Robot eng qisqa yoʻldan yetdi." : "Robot gulxanga yetdi.");

  function exercises(stage) {
    return practice.exercises({
      next: (prev, correct, tier) => L.makeTask(stage, prev, undefined, tier),
      run: runTask,
      praise,
    });
  }

  function formula(host, rows) {
    const el = ui.h("div", { class: "formula-box" });
    rows.forEach((text) => el.append(ui.h("div", { class: "formula-row", text })));
    host.append(el);
    return el;
  }

  QK.common = { box, add, note, answerLine, arrows, board, execute, stopText, reset, writing, guided, exercises, formula, runTask };
})(window);

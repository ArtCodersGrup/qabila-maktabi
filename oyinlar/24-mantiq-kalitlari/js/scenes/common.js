// Mantiq kalitlari: umumiy sahna qismlari — sinash (jadval to'lguncha), ta'rif, mashq savollari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, logic: L, logicUi, practice } = QK;

  function box(compact) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = ui.h("div", { class: "lbox" });
    ui.work().append(el);
    return el;
  }

  const answerLine = (text) => ui.h("div", { class: "answer", text });
  const note = (text) => ui.h("div", { class: "note", text });

  // Maslahat/yechim qo'shish: ish maydoni sig'masa, yangi qator ko'rinadigan joyga suriladi
  function add(host, ...nodes) {
    host.append(...nodes);
    const last = nodes[nodes.length - 1];
    if (last && last.scrollIntoView) last.scrollIntoView({ block: "nearest" });
  }

  function formula(host, rows) {
    const el = ui.h("div", { class: "formula-box" });
    rows.forEach((text) => el.append(ui.h("div", { class: "formula-row", text })));
    host.append(el);
    return el;
  }

  // Sxema + jadval yonma-yon (keng ekranda), ustma-ust (tor ekranda)
  const pair = (host) => {
    const el = ui.h("div", { class: "pair" });
    host.append(el);
    return el;
  };

  // ---------- Sinash: bola kalitlarni bosadi, rostlik jadvali o'zi to'ladi ----------
  // op — amal (sxema bilan) yoki life — hayotiy qoida (kartochka bilan). Hamma holat sinalguncha kutadi.
  async function explore({ op, life, intro }) {
    const el = box(true);
    const row = pair(el);
    const kind = life ? null : L.OPS[op].circuit;
    const unary = !life && L.OPS[op].unary;
    const cv = kind ? logicUi.circuitView(row, kind) : null;
    const card = life ? logicUi.ruleCard(row, life) : null;
    const out = (v) => (life ? L.evalLife(life, v.a, v.b) : L.apply(op, v.a, v.b));
    const rows = unary ? [[0], [1]] : L.PAIRS;
    const table = life
      ? logicUi.truthTable(row, {
        heads: [life.a.name, life.b.name, life.q.replace("?", "")],
        rows,
        outs: rows.map(([a, b]) => out({ a, b })),
      })
      : logicUi.opTable(row, op, { result: "Chiroq" });

    let lit = false;
    function show(v) {
      const o = out(v);
      if (cv) cv.set({ a: v.a, b: v.b, lamp: o ? "on" : "off" });
      if (card) card.set(o);
      const i = L.rowIndex(v.a, unary ? null : v.b);
      table.current(i);
      return { o, fresh: table.fill(i) };
    }
    show({ a: 0, b: 0 }); // boshlang'ich holat ham — sinalgan holat
    ui.bubble("elder", intro);

    const items = life
      ? [logicUi.lifeSwitch("a", life.a), logicUi.lifeSwitch("b", life.b)]
      : unary ? [logicUi.letterSwitch("a", true)] : [logicUi.letterSwitch("a"), logicUi.letterSwitch("b")];
    await ui.settle((done) => {
      const sw = logicUi.switches(ui.control(), items, (v) => {
        const { o, fresh } = show(v);
        const left = rows.length - table.count();
        const firstLit = o && !lit && !life;
        if (firstLit) {
          lit = true;
          sound.play("correct");
        }
        if (left === 0) {
          sw.lock();
          ui.bubble("elder", "✓ Hamma holat jadvalda!");
          setTimeout(done, 900);
        } else if (firstLit) {
          ui.bubble("elder", `✓ Yondi! Yana ${left} ta holat qoldi — sinab koʻr.`);
        } else if (fresh) {
          ui.bubble("elder", `Yangi holat jadvalga yozildi. Yana ${left} ta holat qoldi.`);
        } else {
          ui.bubble("elder", "Bu holat jadvalda bor. Boshqasini sinab koʻr.");
        }
      });
    });
    ui.clearControl();
    sound.play("win");
    return el;
  }

  // ---------- Mashq savollari ----------
  const opName = (op) => L.OPS[op].name;
  const outText = (op, a, b) => `A ${opName(op)} B = ${a} ${opName(op)} ${b} = ${L.apply(op, a, b)}`;

  function options(task) {
    if (task.type === "out") return [{ label: "Ha, yonadi", value: 1 }, { label: "Yoʻq, oʻchiq", value: 0 }];
    if (task.type === "need") return L.NEED_ORDER.map((k) => ({ label: L.NEED_LABELS[k], value: k }));
    if (task.type === "expr") return [{ label: "1", value: 1 }, { label: "0", value: 0 }];
    return [{ label: "Ha", value: 1 }, { label: "Yoʻq", value: 0 }];
  }

  // "B qanday bo'lsin?" — ikkala B uchun natija
  const needLines = (t) => [0, 1].map((b) => `B = ${b} → A ${opName(t.op)} B = ${L.apply(t.op, t.a, b)}`);

  function praise(task) {
    if (task.type === "out") return `A ${opName(task.op)} B = ${task.answer}.`;
    if (task.type === "need") {
      if (task.answer === "any") return "B har qanday boʻlsa ham natija bir xil.";
      if (task.answer === "none") return `A = ${task.a} boʻlsa, bunday natija chiqmaydi.`;
      return `B = ${task.answer} boʻlsin.`;
    }
    if (task.type === "expr") return `${task.expr.text} = ${task.answer}.`;
    return `${task.answer ? task.life.yes : task.life.no}.`;
  }

  function runTask(task) {
    const el = box(true);
    let cv = null;
    if (task.type === "out" || task.type === "need") {
      el.append(ui.h("div", { class: "op-tag", text: `A ${opName(task.op)} B` }));
      cv = logicUi.circuitView(el, L.OPS[task.op].circuit);
      if (task.type === "out") {
        cv.set({ a: task.a, b: task.b, lamp: "unknown" });
        ui.bubble("elder", `A = ${task.a}, B = ${task.b}. Chiroq yonadimi?`);
      } else {
        cv.set({ a: task.a, b: null, lamp: task.want ? "on" : "off", wires: false });
        ui.bubble("elder", `A = ${task.a}. Chiroq ${task.want ? "yonsin" : "oʻchiq boʻlsin"}. B qanday boʻlsin?`);
      }
    } else if (task.type === "expr") {
      const values = task.expr.id === "notA" ? { A: task.a } : { A: task.a, B: task.b };
      logicUi.exprView(el, task.expr.text, values);
      ui.bubble("elder", "Ifodani hisobla: natija 1 mi yoki 0?");
    } else {
      logicUi.ruleCard(el, task.life);
      logicUi.lifeFacts(el, task.life, task.a, task.b);
      ui.bubble("elder", task.life.q);
    }

    return practice.tries({
      setup: (submit) => {
        const row = ui.h("div", { class: "choice-row" });
        options(task).forEach((o) => row.append(ui.button(o.label, () => submit(o.value))));
        ui.control().append(row);
      },
      check: (v) => v === task.answer,
      hint: () => {
        if (task.type === "out") {
          const t = logicUi.opTable(el, task.op, { filled: true });
          t.mark([L.rowIndex(task.a, task.b)]);
          add(el, t.el);
          ui.bubble("elder", `↻ Jadvalga qara: A = ${task.a}, B = ${task.b} qatori.`);
        } else if (task.type === "need") {
          const t = logicUi.opTable(el, task.op, { filled: true });
          t.mark([L.rowIndex(task.a, 0), L.rowIndex(task.a, 1)]);
          add(el, t.el);
          ui.bubble("elder", `↻ Jadvalda A = ${task.a} boʻlgan ikki qatorni qara.`);
        } else if (task.type === "expr") {
          const steps = L.exprSteps(task.expr, task.a, task.b);
          if (steps.length > 1) add(el, note(steps.slice(0, -1).join("; ")));
          ui.bubble("elder", steps.length > 1 ? "↻ Avval qavs ichini hisobladim. Endi oxirgisini oʻzing hisobla." : "↻ EMAS — teskarisi: 1 → 0, 0 → 1.");
        } else {
          add(el, note(`${task.life.expr}: ${task.life.a.name} = ${task.a}, ${task.life.b.name} = ${task.b}`));
          ui.bubble("elder", "↻ Qoidani ifoda qilib yozdim. Qiymatlarni qoʻyib hisobla.");
        }
      },
      solution: () => {
        if (task.type === "out") {
          cv.set({ a: task.a, b: task.b, lamp: task.answer ? "on" : "off" });
          add(el, answerLine(outText(task.op, task.a, task.b)));
        } else if (task.type === "need") {
          add(el, note(needLines(task).join("; ")), answerLine(`Javob: ${L.NEED_LABELS[task.answer]}`));
        } else if (task.type === "expr") {
          add(el, answerLine(L.exprSteps(task.expr, task.a, task.b).join("; ")));
        } else {
          add(el, answerLine(`${L.lifeSteps(task.life, task.a, task.b)[0]} — ${task.answer ? task.life.yes : task.life.no}`));
        }
      },
    });
  }

  function exercises(stage) {
    return practice.exercises({
      next: (prev) => L.makeTask(stage, prev),
      run: runTask,
      praise,
    });
  }

  // Tekshirish uchun: to'g'ri javob tugmasining yozuvi
  QK.answerLabel = (task) => options(task).find((o) => o.value === task.answer).label;

  QK.common = { box, add, formula, answerLine, note, pair, explore, runTask, exercises };
})(window);

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
  const RULES = { and: "VA — ikkalasi ham 1 boʻlsa, 1", or: "YOKI — kamida bittasi 1 boʻlsa, 1" };
  const yesNo = () => [{ label: "Ha", value: 1 }, { label: "Yoʻq", value: 0 }];

  // "B qanday bo'lsin?" — ikkala B uchun natija
  const needLines = (t) => [0, 1].map((b) => `B = ${b} → A ${opName(t.op)} B = ${L.apply(t.op, t.a, b)}`);

  function praise(task) {
    if (task.type === "fill") return `${RULES[task.op]}.`;
    if (task.type === "need") {
      if (task.answer === "any") return "B har qanday boʻlsa ham natija bir xil.";
      if (task.answer === "none") return `A = ${task.a} boʻlsa, bunday natija chiqmaydi.`;
      return `B = ${task.answer} boʻlsin.`;
    }
    if (task.type === "fillExpr") return `${task.expr.text} jadvali toʻgʻri.`;
    if (task.type === "fillLife") return `${task.life.expr} — jadval toʻgʻri.`;
    return `${task.life.expr} — ${task.answer.out ? task.life.yes : task.life.no}.`;
  }

  // Jadval sarlavhalari
  function fillHeads(task) {
    if (task.type === "fill") return ["A", "B", task.named ? `A ${opName(task.op)} B` : "Chiroq"];
    if (task.type === "fillExpr") return task.rows[0].length === 1 ? ["A", task.expr.text] : ["A", "B", task.expr.text];
    return [task.life.a.name, task.life.b.name, task.life.q.replace("?", "")];
  }

  function runTask(task) {
    const el = box(true);
    let ft = null; // to'ldiriladigan jadval
    let lifeHost = null; // jadval joyi; hayotiy savolda — qadam yozuvi ("1-savol: …")

    if (task.type === "need") {
      el.append(ui.h("div", { class: "op-tag", text: `A ${opName(task.op)} B` }));
      const cv = logicUi.circuitView(el, L.OPS[task.op].circuit);
      cv.set({ a: task.a, b: null, lamp: task.want ? "on" : "off", wires: false });
      ui.bubble("elder", `A = ${task.a}. Chiroq ${task.want ? "yonsin" : "oʻchiq boʻlsin"}. B qanday boʻlsin?`);
    } else if (task.type === "fill") {
      const row = pair(el);
      if (task.named) el.prepend(ui.h("div", { class: "op-tag", text: `A ${opName(task.op)} B` }));
      logicUi.circuitView(row, L.OPS[task.op].circuit, { small: task.named }).set({ a: 0, b: 0, lamp: "unknown", wires: false });
      lifeHost = row;
      ui.bubble("elder", task.named
        ? `A ${opName(task.op)} B jadvalini toʻldir: har qatorda natijani bos (1 yoki 0).`
        : "Sxemaga qara. Chiroq qaysi qatorlarda yonadi? Jadvalni toʻldir.");
    } else if (task.type === "fillExpr") {
      el.append(ui.h("div", { class: "op-tag", text: task.expr.text }));
      lifeHost = el;
      ui.bubble("elder", "Ifoda jadvalini toʻldir: har qatorda natijani bos (1 yoki 0).");
    } else if (task.type === "fillLife") {
      logicUi.ruleCard(el, task.life);
      lifeHost = el;
      ui.bubble("elder", "Qoida jadvalini toʻldir: 1 — ha, 0 — yoʻq.");
    } else {
      logicUi.ruleCard(el, task.life);
      logicUi.lifeFacts(el, task.life, task.a, task.b);
      lifeHost = ui.h("div", { class: "step-tag" });
      el.append(lifeHost);
      ui.bubble("elder", "Ikki savol: avval javob, keyin ifoda. Ikkalasi ham toʻgʻri boʻlsin!");
    }

    // Hayotiy savol — ikki qadam: 1) holat uchun javob (Ha / Yo'q), 2) qoidaga mos ifoda (4 variant).
    // Ikkalasi birga yuboriladi va ikkalasi to'g'ri bo'lsagina hisoblanadi; qaysi biri xatoligi aytilmaydi —
    // shuning uchun ikkinchi urinishda ham o'ylash kerak (2 variantli savolni taxmin bilan o'tib bo'lmaydi).
    function lifeSteps(submit) {
      let over = false;
      const send = (value) => {
        submit(value);
        if (L.checkTask(task, value)) over = true;
        else step1(); // 2-xatodan keyin solution() over = true qiladi — qayta chizilmaydi
      };
      function step1() {
        if (over || lifeHost.dataset.done) return;
        ui.clearControl();
        lifeHost.textContent = `1-savol: ${task.life.q}`;
        const row = ui.h("div", { class: "choice-row" });
        yesNo().forEach((o) => row.append(ui.button(o.label, () => step2(o.value))));
        ui.control().append(row);
      }
      function step2(out) {
        ui.clearControl();
        lifeHost.textContent = "2-savol: bu qoida qaysi ifodaga mos?";
        const list = ui.h("div", { class: "expr-opts" });
        task.options.forEach((text) => list.append(ui.button(text, () => send({ expr: text, out }))));
        ui.control().append(list);
      }
      step1();
    }

    return practice.tries({
      setup: (submit) => {
        if (task.type === "need") {
          const row = ui.h("div", { class: "choice-row" });
          L.NEED_ORDER.forEach((k) => row.append(ui.button(L.NEED_LABELS[k], () => submit(k))));
          ui.control().append(row);
        } else if (task.type === "life") {
          lifeSteps(submit);
        } else {
          const btn = ui.button("Tekshir ✓", () => submit(ft.values()));
          btn.disabled = true;
          ft = logicUi.fillTable(lifeHost, { heads: fillHeads(task), rows: task.rows, onChange: () => { btn.disabled = !ft.complete(); } });
          ui.control().append(ui.h("div", { class: "choice-row" }, btn));
        }
      },
      check: (v) => L.checkTask(task, v),
      hint: (v) => {
        if (task.type === "need") {
          // Bo'sh jadval: bola A = … bo'lgan ikki qatorni o'zi hisoblaydi (javob ko'rsatilmaydi)
          const t = logicUi.opTable(el, task.op);
          t.mark([L.rowIndex(task.a, 0), L.rowIndex(task.a, 1)]);
          add(el, t.el);
          ui.bubble("elder", `↻ Jadvalda A = ${task.a} boʻlgan ikki qator. Ularni oʻzing hisobla: chiroq qaysi birida ${task.want ? "yonadi" : "oʻchiq"}?`);
        } else if (task.type === "life") {
          add(el, note("«boʻlsa» — oʻzi, «boʻlmasa» — EMAS; «VA» — ikkalasi ham, «YOKI» — kamida bittasi"));
          ui.bubble("elder", "↻ Ikki javobdan kamida bittasi xato. Qoidani qayta oʻqi va ikkala savolga yana javob ber.");
        } else {
          const n = L.wrongRows(task.answer, v);
          const tip = task.type === "fill"
            ? (task.named ? `Qoida: ${RULES[task.op]}.` : "Kalitlar ketma-ketmi (VA) yoki parallelmi (YOKI)? Tok yoʻlini kuzat.")
            : task.type === "fillExpr" ? task.expr.hint : `Ifodasi: ${task.life.expr}. Har qatorga qiymatlarni qoʻy.`;
          ui.bubble("elder", `↻ ${n} ta qator xato — qaysiligini oʻzing top. ${tip}`);
        }
      },
      solution: () => {
        if (task.type === "need") {
          add(el, note(needLines(task).join("; ")), answerLine(`Javob: ${L.NEED_LABELS[task.answer]}`));
        } else if (task.type === "life") {
          lifeHost.dataset.done = "1";
          lifeHost.textContent = task.life.expr;
          add(el, answerLine(`${L.lifeSteps(task.life, task.a, task.b)[0]} — ${task.answer.out ? task.life.yes : task.life.no}`));
        } else {
          ft.reveal(task.answer);
          // To'g'ri jadval ekranda (bola xato qo'ygan kataklar hoshiyali); ostida — qoida
          const text = task.type === "fill" ? RULES[task.op] : task.type === "fillExpr" ? task.expr.hint : task.life.expr;
          add(el, answerLine(text));
        }
      },
    }).then((ok) => {
      if (ft) ft.lock();
      if (lifeHost) lifeHost.dataset.done = "1";
      return ok;
    });
  }

  function exercises(stage) {
    return practice.exercises({
      next: (prev, correct, tier) => L.makeTask(stage, prev, undefined, tier),
      run: runTask,
      praise,
    });
  }

  // Tekshirish uchun: to'g'ri javob (tugma yozuvi yoki jadval natijalari)
  QK.answerLabel = (task) => (task.type === "need" ? L.NEED_LABELS[task.answer]
    : task.type === "life" ? `${task.answer.expr} → ${task.answer.out ? "Ha" : "Yoʻq"}` : task.answer.join(" "));

  QK.common = { box, add, formula, answerLine, note, pair, explore, runTask, exercises };
})(window);

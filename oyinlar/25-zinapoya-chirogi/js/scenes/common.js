// Zinapoya chirog'i: umumiy sahna qismlari — sinash (jadval to'lguncha), mashq savollari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, gates: G, gatesUi, mantiqUi, practice } = QK;

  function box(compact) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = ui.h("div", { class: "gbox" });
    ui.work().append(el);
    return el;
  }

  const answerLine = (text) => ui.h("div", { class: "answer", text });
  const note = (text) => ui.h("div", { class: "note", text });

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

  const pair = (host) => {
    const el = ui.h("div", { class: "pair" });
    host.append(el);
    return el;
  };

  // Amal jadvali (to'la): A, B, natija
  function opTable(host, op, title) {
    return mantiqUi.truthTable(host, {
      heads: ["A", "B", title || `A ${gatesUi.OP_LABEL[op]} B`],
      rows: G.PAIRS,
      outs: G.table(op),
      filled: true,
    });
  }

  // ---------- Sinash: bola kalitlarni bosadi, jadval to'ladi ----------
  // view(host) → { show(a, b) }; out(a, b) — jadvaldagi natija; steps — avval bajariladigan topshiriqlar
  // [{ until(v, prev) → bool, say }]: har biri bajarilganda keyingi gap aytiladi.
  // subs — kalit tugmasi ostidagi so'zlar (zinapoyada "bosilmagan"/"bosilgan", sxemada "o'chiq"/"yoniq")
  async function explore({ view, out, heads, intro, steps = [], subs = ["oʻchiq", "yoniq"] }) {
    const el = box(true);
    const row = pair(el);
    const v = view(row);
    const table = mantiqUi.truthTable(row, { heads, rows: G.PAIRS, outs: G.PAIRS.map(([a, b]) => out(a, b)) });
    let prev = { a: 0, b: 0 };
    let step = 0;
    function show(s) {
      v.show(s.a, s.b);
      const i = G.rowIndex(s.a, s.b);
      table.current(i);
      return table.fill(i);
    }
    show(prev);
    ui.bubble("elder", intro);
    await ui.settle((done) => {
      const sw = mantiqUi.switches(ui.control(), [
        mantiqUi.letterSwitch("a", subs), mantiqUi.letterSwitch("b", subs),
      ], (s) => {
        const fresh = show(s);
        const left = 4 - table.count();
        let msg = null;
        if (step < steps.length) {
          if (steps[step].until(s, prev)) {
            sound.play("correct");
            msg = steps[step].say;
            step++;
          } else {
            msg = steps[step].retry;
          }
        }
        prev = s;
        if (step >= steps.length && left === 0) {
          sw.lock();
          ui.bubble("elder", msg && step === steps.length && steps.length ? `${msg} Hamma holat jadvalda!` : "✓ Hamma holat jadvalda!");
          setTimeout(done, 1200);
        } else if (msg) {
          ui.bubble("elder", msg);
        } else {
          ui.bubble("elder", fresh ? `Yangi holat jadvalga yozildi. Yana ${left} ta holat qoldi.` : "Bu holat jadvalda bor. Boshqasini sinab koʻr.");
        }
      });
    });
    ui.clearControl();
    sound.play("win");
    return el;
  }

  // ---------- Mashq savollari ----------
  const OPS3 = ["and", "or", "xor"];
  const opOptions = () => OPS3.map((op) => ({ label: gatesUi.OP_LABEL[op], value: op }));
  const RULES = { and: "ikkalasi ham 1 boʻlsa — 1", or: "kamida bittasi 1 boʻlsa — 1", xor: "faqat bittasi 1 boʻlsa — 1" };

  function options(task) {
    if (task.type === "out" || task.type === "clicks" || task.type === "eval") {
      return [{ label: "Ha, yonadi", value: 1 }, { label: "Yoʻq, oʻchiq", value: 0 }];
    }
    if (task.type === "half") return ["00", "01", "10", "11"].map((x) => ({ label: x, value: x }));
    if (task.type === "add2") return task.options.map((x) => ({ label: x, value: x }));
    return opOptions(); // which, fill, whichOut
  }

  function praise(task) {
    switch (task.type) {
      case "out": return task.a === task.b ? "Bir xil — chiroq oʻchiq." : "Har xil — chiroq yoniq.";
      case "clicks": return `${task.m} + ${task.n} = ${task.m + task.n} — ${task.answer ? "toq, yoniq" : "juft, oʻchiq"}.`;
      case "which": case "fill": return `Bu — ${gatesUi.OP_LABEL[task.answer]}: ${RULES[task.answer]}.`;
      case "eval": return `${G.exprText(task.c)} = ${task.answer}.`;
      case "half": return `${task.a} + ${task.b} = ${task.answer}.`;
      case "whichOut": return task.ask === "sum" ? "Yigʻindi = A XOR B." : "Koʻchirish = A VA B.";
      default: return `${G.bin(task.x, 2)} + ${G.bin(task.y, 2)} = ${task.answer}.`;
    }
  }

  function runTask(task) {
    const el = box(true);
    let view = null;
    let sum = null;
    const tables = () => {
      const row = ui.h("div", { class: "three" });
      OPS3.forEach((op) => opTable(row, op));
      return row;
    };

    if (task.type === "out") {
      view = gatesUi.stairView(el);
      view.set({ a: task.a, b: task.b, lamp: "unknown" });
      ui.bubble("elder", `A = ${task.a}, B = ${task.b}. Zinapoya chirogʻi yonadimi?`);
    } else if (task.type === "clicks") {
      el.append(ui.h("div", { class: "story-art small", html: QK.art.stairs() }),
        ui.h("div", { class: "clicks" },
          ui.h("div", { text: `Pastki kalit: ${task.m} marta` }),
          ui.h("div", { text: `Tepadagi kalit: ${task.n} marta` })));
      ui.bubble("elder", "Chiroq oʻchiq edi. Kalitlarni shuncha marta bosding. Endi chiroq yonadimi?");
    } else if (task.type === "which") {
      opTable(el, task.op, "Chiroq");
      ui.bubble("elder", "Bu jadval qaysi amalniki?");
    } else if (task.type === "eval") {
      view = gatesUi.gatesView(el, task.c);
      view.set(task.a, task.b, { hide: true });
      ui.bubble("elder", "Simlar boʻylab hisobla: chiroq yonadimi?");
    } else if (task.type === "fill") {
      const row = pair(el);
      view = gatesUi.gatesView(row, task.c, { unknown: "g1" });
      view.set(null);
      mantiqUi.truthTable(row, { heads: ["A", "B", "Chiroq"], rows: G.PAIRS, outs: task.target, filled: true });
      ui.bubble("elder", "Sxema jadvaldagidek ishlashi kerak. «?» oʻrniga qaysi amal?");
    } else if (task.type === "half") {
      view = gatesUi.gatesView(el, G.circuit("halfAdder"));
      view.set(task.a, task.b, { hide: true });
      sum = gatesUi.sumView(el);
      sum.set(task.a, task.b, false);
      ui.bubble("elder", `A = ${task.a}, B = ${task.b}. Yarim qoʻshuvchi nima chiqaradi (koʻchirish va yigʻindi)?`);
    } else if (task.type === "whichOut") {
      view = gatesUi.gatesView(el, G.circuit("halfAdder"), { unknown: task.ask === "sum" ? "g1" : "g2" });
      view.set(null);
      ui.bubble("elder", task.ask === "sum" ? "Yigʻindini qaysi amal beradi?" : "Koʻchirishni qaysi amal beradi?");
    } else {
      gatesUi.columnAdd(el, task.x, task.y);
      ui.bubble("elder", "Ikkilikda qoʻsh. Natija qaysi?");
    }

    return practice.tries({
      setup: (submit) => {
        const row = ui.h("div", { class: "choice-row" });
        options(task).forEach((o) => row.append(ui.button(o.label, () => submit(o.value))));
        ui.control().append(row);
      },
      check: (v) => v === task.answer,
      hint: () => {
        switch (task.type) {
          case "out": {
            const t = opTable(el, "xor", "Chiroq");
            t.mark([G.rowIndex(task.a, task.b)]);
            add(el, t.el);
            ui.bubble("elder", "↻ Jadvalga qara. A va B har xilmi yoki bir xil?");
            break;
          }
          case "clicks":
            ui.bubble("elder", "↻ Har bosish chiroqni almashtiradi. Jami necha marta bosding — toqmi, juftmi?");
            break;
          case "which":
            add(el, note("Avval 1 1 qatoriga, keyin 0 1 qatoriga qara."));
            ui.bubble("elder", "↻ VA, YOKI va XOR ning farqi — shu qatorlarda.");
            break;
          case "eval":
            view.set(task.a, task.b, { hide: true, reveal: [task.c.gates[0].id] });
            add(el, note(G.steps(task.c, task.a, task.b)[0]));
            ui.bubble("elder", "↻ Birinchi amalni hisobladim. Endi keyingisini oʻzing hisobla.");
            break;
          case "fill":
            add(el, tables());
            ui.bubble("elder", task.c.tpl === "thenNot"
              ? "↻ EMAS natijani teskari qiladi. «?» chiqishi — jadvalning teskarisi."
              : "↻ Uchala amal jadvalini solishtir.");
            break;
          case "half":
            ui.bubble("elder", "↻ Yigʻindi — A XOR B, koʻchirish — A VA B. Ikkalasini alohida hisobla.");
            break;
          case "whichOut":
            add(el, gatesUi.addTable(el).el);
            ui.bubble("elder", "↻ Qoʻshish jadvaliga qara: bu ustun qaysi amal jadvaliga oʻxshaydi?");
            break;
          default:
            add(el, note(G.add2(task.x, task.y).lines[0]));
            ui.bubble("elder", "↻ Oʻngdagi xonadan boshla: yigʻindi va koʻchirish.");
        }
      },
      solution: () => {
        switch (task.type) {
          case "out":
            view.set({ a: task.a, b: task.b });
            add(el, answerLine(`A = ${task.a}, B = ${task.b} — ${task.a === task.b ? "bir xil → 0, oʻchiq" : "har xil → 1, yoniq"}`));
            break;
          case "clicks":
            add(el, answerLine(`${task.m} + ${task.n} = ${task.m + task.n} — ${task.answer ? "toq → yoniq" : "juft → oʻchiq"}`));
            break;
          case "which": case "fill": case "whichOut":
            if (view) { view.open(); view.set(null); }
            add(el, answerLine(`${gatesUi.OP_LABEL[task.answer]}: ${RULES[task.answer]}`));
            break;
          case "eval":
            view.set(task.a, task.b);
            add(el, answerLine(G.steps(task.c, task.a, task.b).join("; ")));
            break;
          case "half":
            view.set(task.a, task.b);
            sum.set(task.a, task.b, true);
            add(el, answerLine(`Koʻchirish ${task.answer[0]}, yigʻindi ${task.answer[1]} → ${task.answer}`));
            break;
          default:
            add(el, answerLine(G.add2(task.x, task.y).lines.join("; ")));
        }
      },
    });
  }

  function exercises(stage) {
    return practice.exercises({ next: (prev) => G.makeTask(stage, prev), run: runTask, praise });
  }

  // Tekshirish uchun: to'g'ri javob tugmasining yozuvi
  QK.answerLabel = (task) => (options(Object.assign({ options: [task.answer] }, task)).find((o) => o.value === task.answer) || {}).label;

  QK.common = { box, add, formula, answerLine, note, pair, opTable, explore, runTask, exercises };
})(window);

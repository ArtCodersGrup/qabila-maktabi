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
          ui.bubble("elder", msg && step === steps.length && steps.length ? `${msg} Hamma holat jadvalda.` : "✓ Hamma holat jadvalda.");
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
  const RULES = { and: "ikkalasi ham 1 boʻlsa — 1", or: "kamida bittasi 1 boʻlsa — 1", xor: "faqat bittasi 1 boʻlsa — 1" };
  const OUT_LABEL = { "diff:1": "Har xil — yonadi", "diff:0": "Har xil — oʻchiq", "same:1": "Bir xil — yonadi", "same:0": "Bir xil — oʻchiq" };
  const opLabel = (v) => (v === G.NONE ? "Hech biri" : gatesUi.OP_LABEL[v]);
  const isTable = (task) => task.type === "table" || task.type === "evalTable";

  // Hamma variantli savolda 4 variant (QOIDALAR 4.3)
  function options(task) {
    if (task.type === "out") return G.OUT_OPTIONS.map((v) => ({ label: OUT_LABEL[v], value: v }));
    if (task.type === "half") return ["00", "01", "10", "11"].map((x) => ({ label: x, value: x }));
    if (task.type === "add2") return task.options.map((x) => ({ label: x, value: x }));
    if (task.type === "whichOut") return [...OPS3, "not"].map((op) => ({ label: opLabel(op), value: op }));
    return [...OPS3, G.NONE].map((op) => ({ label: opLabel(op), value: op })); // which, fill
  }

  function praise(task) {
    switch (task.type) {
      case "out": return task.a === task.b ? "Bir xil — chiroq oʻchiq." : "Har xil — chiroq yoniq.";
      case "clicks": {
        const k = task.m + task.n;
        return `${k} marta bosildi — ${k % 2 ? "toq, oxirida yoniq" : "juft, oxirida oʻchiq"}.`;
      }
      case "table": return `${gatesUi.OP_LABEL[task.op]}: ${RULES[task.op]}.`;
      case "which": case "fill":
        return task.answer === G.NONE ? "Bu jadvalni uchala amal ham bermaydi." : `Bu — ${opLabel(task.answer)}: ${RULES[task.answer]}.`;
      case "evalTable": return `${G.exprText(task.c)} — jadval toʻgʻri.`;
      case "half": return `${task.a} + ${task.b} = ${task.answer}.`;
      case "whichOut": return task.ask === "sum" ? "Yigʻindi = A XOR B." : "Koʻchirish = A VA B.";
      default: return `${G.bin(task.x, task.width)} + ${G.bin(task.y, task.width)} = ${task.answer}.`;
    }
  }

  // Yonish tartibi: "yondi, o'chdi, yondi" (k ta bosish)
  const toggles = (k) => Array.from({ length: k }, (_, i) => (i % 2 ? "oʻchdi" : "yondi")).join(", ");

  function runTask(task) {
    const el = box(true);
    let view = null;
    let sum = null;
    let ft = null; // to'ldiriladigan jadval
    let host = el; // jadval joyi
    const tables = () => {
      const row = ui.h("div", { class: "three" });
      OPS3.forEach((op) => opTable(row, op));
      return row;
    };

    if (task.type === "out") {
      view = gatesUi.stairView(el);
      view.set({ a: task.a, b: task.b, lamp: "unknown" });
      ui.bubble("elder", `A = ${task.a}, B = ${task.b}. Kalitlar bir xilmi yoki har xil? Chiroq yonadimi?`);
    } else if (task.type === "clicks") {
      el.append(ui.h("div", { class: "story-art small", html: QK.art.stairs() }),
        ui.h("div", { class: "clicks" },
          ui.h("div", { text: `Pastki kalit: ${task.m} marta` }),
          ui.h("div", { text: `Tepadagi kalit: ${task.n} marta` })));
      ui.bubble("elder", "Chiroq oʻchiq edi. Kalitlar shuncha marta bosildi. Shu orada chiroq necha marta yondi?");
    } else if (task.type === "table") {
      el.append(ui.h("div", { class: "note", text: `A ${gatesUi.OP_LABEL[task.op]} B` }));
      ui.bubble("elder", `A ${gatesUi.OP_LABEL[task.op]} B jadvalini toʻldir: har qatorda natijani bos (1 yoki 0).`);
    } else if (task.type === "which") {
      mantiqUi.truthTable(el, { heads: ["A", "B", "Chiroq"], rows: G.PAIRS, outs: task.table, filled: true });
      ui.bubble("elder", "Bu jadval qaysi amalniki?");
    } else if (task.type === "evalTable") {
      host = pair(el);
      view = gatesUi.gatesView(host, task.c);
      view.set(null);
      ui.bubble("elder", "Simlar boʻylab hisobla: chiroq qaysi qatorlarda yonadi? Jadvalni toʻldir.");
    } else if (task.type === "fill") {
      const row = pair(el);
      view = gatesUi.gatesView(row, task.c, { unknown: task.unknown });
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
      gatesUi.columnAdd(el, task.x, task.y, task.width);
      ui.bubble("elder", "Ikkilikda qoʻsh. Natija qaysi?");
    }

    // Sonli savol: raqam klaviaturasi (taxmin qilib bo'lmaydi)
    if (task.type === "clicks") {
      const k = task.m + task.n;
      return practice.numberTries({
        answer: task.answer,
        maxLen: 2,
        hint: () => ui.bubble("elder", "↻ Har bosish chiroqni almashtiradi: yondi, oʻchdi, yondi… Jami bosishlarni sanab chiq."),
        solution: () => add(el, note(`${task.m} + ${task.n} = ${k} marta bosildi: ${toggles(Math.min(k, 4))}${k > 4 ? "…" : ""}`),
          answerLine(`${task.answer} marta yondi, oxirida ${task.lit ? "yoniq" : "oʻchiq"}`)),
      });
    }

    return practice.tries({
      setup: (submit) => {
        if (isTable(task)) {
          const btn = ui.button("Tekshir ✓", () => submit(ft.values()));
          btn.disabled = true;
          ft = gatesUi.fillTable(host, { heads: ["A", "B", "Chiroq"], rows: task.rows, onChange: () => { btn.disabled = !ft.complete(); } });
          ui.control().append(ui.h("div", { class: "choice-row" }, btn));
          return;
        }
        const row = ui.h("div", { class: "choice-row four" });
        options(task).forEach((o) => row.append(ui.button(o.label, () => submit(o.value))));
        ui.control().append(row);
      },
      check: (v) => G.checkTask(task, v),
      hint: (v) => {
        switch (task.type) {
          case "out": {
            // Bo'sh jadval: qator belgilangan, natijani bola o'zi topadi
            const t = mantiqUi.truthTable(el, { heads: ["A", "B", "Chiroq"], rows: G.PAIRS, outs: G.table("xor") });
            t.mark([G.rowIndex(task.a, task.b)]);
            add(el, t.el);
            ui.bubble("elder", "↻ Jadvaldagi qatoringga qara. XOR — faqat bittasi 1 boʻlsa, yonadi.");
            break;
          }
          case "table":
            ui.bubble("elder", `↻ ${G.wrongRows(task.answer, v)} ta qator xato — qaysiligini oʻzing top. ${gatesUi.OP_LABEL[task.op]}: ${RULES[task.op]}.`);
            break;
          case "evalTable":
            add(el, note(G.exprText(task.c)));
            ui.bubble("elder", `↻ ${G.wrongRows(task.answer, v)} ta qator xato. Har qatorda avval chapdagi amalni hisobla, keyin oʻngdagisini.`);
            break;
          case "which":
            add(el, note("Avval 1 1 qatoriga, keyin 0 1 qatoriga qara."));
            ui.bubble("elder", "↻ VA, YOKI va XOR ning farqi — shu qatorlarda. Hech biriga oʻxshamasa — «Hech biri».");
            break;
          case "fill":
            add(el, tables());
            ui.bubble("elder", task.c.tpl === "single"
              ? "↻ Uchala amal jadvalini solishtir. Hech biri mos kelmasa — «Hech biri»."
              : "↻ EMAS teskari qiladi. Har amalni «?» oʻrniga qoʻyib, bitta qatorni hisoblab koʻr.");
            break;
          case "half":
            ui.bubble("elder", "↻ Yigʻindi — A XOR B, koʻchirish — A VA B. Ikkalasini alohida hisobla.");
            break;
          case "whichOut":
            add(el, gatesUi.addTable(el).el);
            ui.bubble("elder", "↻ Qoʻshish jadvaliga qara: bu ustun qaysi amal jadvaliga oʻxshaydi?");
            break;
          default:
            add(el, note("1 + 1 = 10 — 0 yoz, 1 ni koʻchir; 1 + 1 + 1 = 11 — 1 yoz, 1 ni koʻchir"));
            ui.bubble("elder", "↻ Oʻngdagi xonadan boshla va koʻchirishni hisobga ol.");
        }
      },
      solution: () => {
        switch (task.type) {
          case "out":
            view.set({ a: task.a, b: task.b });
            add(el, answerLine(`A = ${task.a}, B = ${task.b} — ${task.a === task.b ? "bir xil → 0, oʻchiq" : "har xil → 1, yoniq"}`));
            break;
          case "table":
            ft.reveal(task.answer);
            add(el, answerLine(`${gatesUi.OP_LABEL[task.op]}: ${RULES[task.op]}`));
            break;
          case "evalTable":
            ft.reveal(task.answer);
            add(el, answerLine(G.exprText(task.c)));
            break;
          case "which": case "fill": case "whichOut":
            if (task.answer === G.NONE) {
              add(el, answerLine("Hech biri: VA, YOKI, XOR — uchalasi ham boshqa jadval beradi"));
              break;
            }
            if (view) { view.open(); view.set(null); }
            add(el, answerLine(`${opLabel(task.answer)}: ${RULES[task.answer]}`));
            break;
          case "half":
            view.set(task.a, task.b);
            sum.set(task.a, task.b, true);
            add(el, answerLine(`Koʻchirish ${task.answer[0]}, yigʻindi ${task.answer[1]} → ${task.answer}`));
            break;
          default:
            add(el, answerLine(G.addCols(task.x, task.y, task.width).lines.join("; ")));
        }
      },
    }).then((ok) => {
      if (ft) ft.lock();
      return ok;
    });
  }

  function exercises(stage) {
    return practice.exercises({ next: (prev, correct, tier) => G.makeTask(stage, prev, undefined, tier), run: runTask, praise });
  }

  // Tekshirish uchun: to'g'ri javob (tugma yozuvi, son yoki jadval natijalari)
  QK.answerLabel = (task) => (isTable(task) ? task.answer.join(" ")
    : task.type === "clicks" ? String(task.answer)
      : (options(Object.assign({ options: [task.answer] }, task)).find((o) => o.value === task.answer) || {}).label);

  QK.common = { box, add, formula, answerLine, note, pair, opTable, explore, runTask, exercises };
})(window);

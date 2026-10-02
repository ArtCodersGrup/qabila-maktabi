// 48-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;
  const { ui, logic: L, practice } = QK;
  const h = ui.h;

  const RY = (v) => (v ? "True" : "False");

  // Rostlik jadvali — qiymatlarni Python hisoblaydi (2, 4 yoki 8 qator: a, b, c)
  function rostlik(ifoda, nomlar) {
    const qatorlar = L.jadval(ifoda, nomlar);
    const bitta = qatorlar.length === 2; // "not a" kabi bitta o'zgaruvchili
    const uchta = qatorlar.length === 8; // a, b, c
    const el = h("table", { class: "mk-jadval" });
    const bosh = h("tr", {}, h("th", { text: "a" }));
    if (!bitta) bosh.append(h("th", { text: "b" }));
    if (uchta) bosh.append(h("th", { text: "c" }));
    bosh.append(h("th", { class: "ifoda", text: ifoda }));
    const tana = h("tbody");
    for (const q of qatorlar) {
      const tr = h("tr", {}, h("td", { class: q.a ? "rost" : "yolgon", text: RY(q.a) }));
      if (!bitta) tr.append(h("td", { class: q.b ? "rost" : "yolgon", text: RY(q.b) }));
      if (uchta) tr.append(h("td", { class: q.c ? "rost" : "yolgon", text: RY(q.c) }));
      tr.append(h("td", { class: "natija " + (q.natija ? "rost" : "yolgon"), text: RY(q.natija) }));
      tana.append(tr);
    }
    el.append(h("thead", {}, bosh), tana);
    return el;
  }

  const kodBlok = (kod) => QK.kodUI.codeBlock(kod, { numbers: false });

  // True/False tanlanadigan savol
  function ikkilikExercise(task, opts) {
    const o = opts || {};
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box(true);
        if (o.oldin) o.oldin(host);
        host.append(h("div", { class: "mk-savol", text: task.matn }));
        ui.control().append(
          ui.button("True", () => submit("True"), "big"),
          ui.button("False", () => submit("False"), "big"));
      },
      check: (value) => value === task.javob,
      hint() { host.append(M.note("↻ " + task.nega)); },
      solution() {
        host.append(M.answer(task.javob));
        if (o.keyin) o.keyin(host);
      },
    });
  }

  // Bir nechta True/False javobli savol (2026-10-02): task.qatorlar — har qatorning yozuvi,
  // task.javoblar — har qatorning to'g'ri javobi. Hamma qator to'g'ri bo'lsagina hisoblanadi —
  // bitta True/False tugmasidagi 50% taxmin yo'qoladi (QOIDALAR 4.3).
  const QATOR_USLUB = "display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin:8px 0";
  const YOZUV_USLUB = "font-family:var(--kod-shrift);font-size:18px;font-weight:800;min-width:9em;text-align:right";

  function qatorlarExercise(task, opts) {
    const o = opts || {};
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box(true);
        if (o.oldin) o.oldin(host);
        host.append(h("div", { class: "mk-savol", text: task.matn }));
        const tanlangan = task.qatorlar.map(() => null);
        task.qatorlar.forEach((yozuv, k) => {
          const tugmalar = ["True", "False"].map((v) => ui.button(v, () => {
            tanlangan[k] = v;
            tugmalar.forEach((b) => {
              const yoniq = b.textContent === v;
              b.className = "btn sm" + (yoniq ? "" : " secondary");
              b.setAttribute("aria-pressed", String(yoniq));
            });
          }, "sm secondary"));
          tugmalar.forEach((b) => b.setAttribute("aria-pressed", "false"));
          host.append(h("div", { class: "mk-qator", style: QATOR_USLUB },
            h("span", { style: YOZUV_USLUB, text: yozuv }), ...tugmalar));
        });
        ui.control().append(ui.button("Tekshir", () => {
          // Tanlanmagan qator bilan yuborish xato urinish sanalmaydi
          if (tanlangan.includes(null)) { ui.toast("Har qatorga javob tanla."); return; }
          submit(tanlangan.slice());
        }, "big"));
      },
      check: (value) => value.length === task.javoblar.length && value.every((v, k) => v === task.javoblar[k]),
      hint() { host.append(M.note("↻ " + task.nega)); },
      solution() {
        host.append(M.answer(task.hisob || task.javob));
        if (o.keyin) o.keyin(host);
      },
    });
  }

  // 1-bosqich: bitta print — uchta solishtirish
  const solishtirExercise = (task) => qatorlarExercise(task, {
    oldin: (host) => host.append(kodBlok(task.kod)),
  });

  // 2-bosqich: bitta ifoda — ikki holat
  const ifodaExercise = (task) => qatorlarExercise(task, {
    oldin: (host) => host.append(kodBlok("print(" + task.ifoda + ")")),
    keyin: (host) => host.append(rostlik(task.ifoda)),
  });

  // Hayotiy gap → qaysi amal
  function gapExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box(true);
        host.append(h("div", { class: "mk-gap", text: task.matn }));
        host.append(M.note("Bu gapni kodda yozsak, qaysi amal kerak?"));
        ui.control().append(...L.GAP_VARIANTLAR.map((v) => ui.button(v, () => submit(v), "big")));
      },
      check: (value) => value === task.javob,
      hint() { host.append(M.note("↻ Gapda nechta shart bor? Ikkalasi ham kerakmi, bittasi yetadimi? Biror shart «…masa», «emas» bilan aytilganmi?")); },
      solution() {
        host.append(M.answer(task.javob));
        host.append(rostlik(task.javob === "not" ? "not a" : "a " + task.javob + " b"));
      },
    });
  }

  const kodExercise = (task) => M.resultExercise(task);
  const yozishExercise = (task) => M.writeExercise(task);

  QK.common = Object.assign({}, M, { rostlik, kodBlok, ikkilikExercise, qatorlarExercise, solishtirExercise, ifodaExercise, gapExercise, kodExercise, yozishExercise });
})(window);

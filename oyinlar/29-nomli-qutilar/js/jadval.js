// 29-o'yin: kuzatuv jadvali — satrlar bajarilgan buyruqlar, ustunlar quti nomlari.
// Bola har katakka "shu satrdan keyin qutida nima bor" deb yozadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U } = QK;

  function build(task, opts) {
    const o = opts || {};
    const prefill = o.prefill === undefined ? 1 : o.prefill; // nechta qator tayyor turadi
    const rows = [];

    const head = ui.h("tr", {}, ui.h("th", { text: "Buyruq" }));
    for (const name of task.vars) head.append(ui.h("th", { class: "quti", text: name }));
    const body = ui.h("tbody");

    task.rows.forEach((row, k) => {
      const tr = ui.h("tr", {}, ui.h("td", { class: "buyruq" }, ui.h("code", { html: U.paint(row.text) })));
      const inputs = {};
      for (const name of task.vars) {
        const value = row.values[name];
        if (value === null) {
          // Quti hali yaratilmagan
          tr.append(ui.h("td", {}, ui.h("span", { class: "yoq", text: "—" })));
        } else if (k < prefill) {
          tr.append(ui.h("td", {}, ui.h("span", { class: "tayyor", text: value })));
        } else {
          const input = ui.h("input", {
            class: "kat", type: "text", inputmode: "numeric", autocomplete: "off", spellcheck: "false",
            "aria-label": (k + 1) + "-satrdan keyin " + name,
          });
          if (o.onSubmit) {
            input.addEventListener("keydown", (e) => {
              if (e.key === "Enter") { e.preventDefault(); o.onSubmit(); }
            });
          }
          inputs[name] = input;
          tr.append(ui.h("td", {}, input));
        }
      }
      rows.push({ tr, inputs, values: row.values });
      body.append(tr);
    });

    const el = ui.h("table", { class: "kuzatuv" }, ui.h("thead", {}, head), body);

    const clearMarks = () => rows.forEach((row) => row.tr.classList.remove("xato"));

    const api = {
      el,
      focus() {
        const first = rows.map((r) => Object.values(r.inputs)[0]).find(Boolean);
        if (first) first.focus();
      },
      filled() {
        return rows.every((row) => Object.values(row.inputs).every((input) => input.value.trim() !== ""));
      },
      // { ok, badRow } — birinchi noto'g'ri qator belgilanadi
      check() {
        clearMarks();
        for (let k = 0; k < rows.length; k++) {
          const row = rows[k];
          for (const [name, input] of Object.entries(row.inputs)) {
            if (input.value.trim() !== String(row.values[name])) {
              row.tr.classList.add("xato");
              return { ok: false, badRow: k + 1 };
            }
          }
        }
        return { ok: true };
      },
      showAnswer() {
        clearMarks();
        for (const row of rows) {
          for (const [name, input] of Object.entries(row.inputs)) {
            input.value = String(row.values[name]);
            input.disabled = true;
            input.classList.add("tayyor");
          }
        }
      },
      lock() {
        for (const row of rows) for (const input of Object.values(row.inputs)) input.disabled = true;
      },
    };
    return api;
  }

  QK.jadval = { build };
})(window);

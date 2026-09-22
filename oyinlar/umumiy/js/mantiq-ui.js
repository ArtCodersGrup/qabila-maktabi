// Mantiq bloki (24–25-o'yinlar) uchun umumiy ekran qismlari: kalit tugmalari va rostlik jadvali.
// Uslublari: umumiy/css/mantiq.css
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui } = QK;
  const h = ui.h;

  // ---------- Kalit tugmalari (boshqaruv zonasida) ----------
  // items: [{ key, text(v) }]; onChange({ a, b }) — har bosishda
  function switches(host, items, onChange) {
    const values = { a: 0, b: 0 };
    const buttons = {};
    let locked = false;
    const row = h("div", { class: "switches" });
    items.forEach((it) => {
      const b = h("button", { class: "sw-btn", type: "button" });
      b.addEventListener("click", () => {
        if (locked) return;
        values[it.key] = 1 - values[it.key];
        QK.sound.play("tap");
        render();
        onChange(Object.assign({}, values));
      });
      buttons[it.key] = b;
      row.append(b);
    });
    function render() {
      items.forEach((it) => {
        const v = values[it.key];
        const b = buttons[it.key];
        b.classList.toggle("on", v === 1);
        b.innerHTML = "";
        b.append(...it.text(v).map((part, k) => h("span", { class: k ? "sw-sub" : "sw-main", text: part })));
      });
    }
    render();
    host.append(row);
    return { lock() { locked = true; row.classList.add("locked"); } };
  }

  // Harfli kalit: "A = 1" va ostida holati. subs — [0 dagi, 1 dagi] so'z; true — teskari kalit ("bosilmagan", "bosilgan")
  const letterSwitch = (key, subs) => {
    const words = subs === true ? ["bosilmagan", "bosilgan"] : subs || ["uzilgan", "ulangan"];
    return { key, text: (v) => [`${key.toUpperCase()} = ${v}`, words[v]] };
  };
  // ---------- Rostlik jadvali ----------
  // heads — ustun nomlari (oxirgisi — natija); rows — kirishlar ro'yxati ([a, b] yoki [a]); outs — natijalar
  function truthTable(host, { heads, rows, outs, filled }) {
    const cells = [];
    const trs = [];
    const done = rows.map(() => !!filled);
    const body = h("tbody");
    rows.forEach((r, i) => {
      const out = h("td", { class: "out", text: filled ? String(outs[i]) : "?" });
      const tr = h("tr", null, ...r.map((v) => h("td", { text: String(v) })), out);
      if (filled) out.classList.add("v" + outs[i]);
      cells.push(out);
      trs.push(tr);
      body.append(tr);
    });
    const table = h("table", { class: "ttable" }, h("thead", null, h("tr", null, ...heads.map((t) => h("th", { text: t })))), body);
    host.append(table);
    return {
      el: table,
      // Qator to'ldi; yangi bo'lsa — true
      fill(i) {
        if (done[i]) return false;
        done[i] = true;
        cells[i].textContent = String(outs[i]);
        cells[i].classList.add("v" + outs[i], "fresh");
        return true;
      },
      current(i) { trs.forEach((tr, k) => tr.classList.toggle("cur", k === i)); },
      mark(list) { trs.forEach((tr, k) => tr.classList.toggle("mark", list.includes(k))); },
      count: () => done.filter(Boolean).length,
    };
  }

  QK.mantiqUi = { switches, letterSwitch, truthTable };
})(window);

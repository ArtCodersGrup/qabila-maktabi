// Naqshlarni topish. Mashq sikli va urinishlar: ../../umumiy/js/practice.js
(function (root) {
  "use strict";

  const QK = root.QK;
  const { lamps, ui, sound, lampsUi } = QK;

  // Barcha naqshlarni topish: bola chiroqlarni yoqib "Saqlash"ni bosadi; takror — "bor edi".
  // labelFor(pattern) — devorda naqsh ostidagi yozuv (ixtiyoriy).
  function findAll({ count, states, labelFor }) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const total = lamps.count(states, count);
    const found = new Set();
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    const row = lampsUi.lampRow(box, { count, states });
    const counter = ui.h("div", { class: "found-count" });
    box.append(counter);
    const wallEl = lampsUi.wall(box, states);
    const renderCount = () => { counter.textContent = `Topilgan naqshlar: ${found.size}`; };
    renderCount();

    let busy = false; // ikki marta tez bosish bitta bosish hisoblanadi
    return ui.settle((done) => {
      const save = () => {
        if (busy) return;
        busy = true;
        setTimeout(() => { busy = false; }, 400);
        const p = row.get();
        const key = lamps.patternKey(p);
        if (found.has(key)) {
          sound.play("retry");
          row.shake();
          ui.toast("Bu naqsh bor edi! Boshqasini yasa.");
          return;
        }
        found.add(key);
        sound.play("correct");
        wallEl.add(p, labelFor ? labelFor(p) : null);
        renderCount();
        if (found.size === total) {
          row.lock();
          ui.clearControl();
          done();
        }
      };
      const help = () => {
        const missing = lamps.allPatterns(states, count).find((p) => !found.has(lamps.patternKey(p)));
        if (!missing) return;
        row.set(missing);
        ui.toast("Mana bittasi — «Saqlash»ni bos!");
      };
      ui.control().append(ui.h("div", { class: "choice-row" },
        ui.button("Saqlash", save),
        ui.button("Yordam", help, "secondary")));
    });
  }

  QK.common = { findAll };
})(window);

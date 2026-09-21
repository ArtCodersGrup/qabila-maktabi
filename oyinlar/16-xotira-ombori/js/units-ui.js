// Xotira ombori: zinapoya, birlik tugmalari, fayl kartochkalari va xotira chizig'i.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { units, ui, art } = QK;

  // Zinapoya: pog'onalar va orasida "× 8" / "× 1024". DOM tartibi bitdan boshlanadi:
  // tik ekranda CSS uni pastdan yuqoriga (zinapoya), yotiq ekranda chapdan o'ngga chizadi.
  // show — nechta pog'ona ko'rinadi
  function ladder(host, show) {
    const el = ui.h("div", { class: "ladder-v" });
    host.append(el);
    let shown = 0;
    let lit = -1;
    function render() {
      el.innerHTML = "";
      for (let i = 0; i < shown; i++) {
        const indent = `margin-left:${i * 14}px`;
        if (i > 0) {
          const f = units.factor(i - 1);
          el.append(ui.h("div", { class: "rung-x", style: indent },
            ui.h("span", { class: "ax-v", text: `↑ × ${f}` }), ui.h("span", { class: "ax-h", text: `× ${f} →` })));
        }
        el.append(ui.h("div", { class: "rung" + (i === lit ? " lit" : ""), style: indent },
          ui.h("span", { class: "rung-unit", text: units.UNITS[i] })));
      }
    }
    const api = {
      el,
      setShown(n) {
        shown = n;
        render();
      },
      light(i) {
        lit = i;
        render();
      },
    };
    api.setShown(show || 0);
    return api;
  }

  // Aralash birlik tugmalari; onPick(unit, button)
  function unitButtons(list, onPick) {
    const row = ui.h("div", { class: "choice-row units-row" });
    list.forEach((unit) => {
      const b = ui.button(unit, () => onPick(unit, b), "secondary");
      row.append(b);
    });
    ui.clearControl();
    ui.control().append(row);
  }

  // Fayl kartochkasi: ikonka, nomi, hajmi
  function fileCard(item, asButton) {
    const props = { class: "file-card", type: asButton ? "button" : null };
    return ui.h(asButton ? "button" : "div", props,
      ui.h("span", { class: "file-icon", html: art.fileIcon(item.id) }),
      ui.h("span", { class: "file-name", text: item.name }),
      ui.h("span", { class: "file-size", text: `${item.n} ${item.unit}` }));
  }

  // Xotira chizig'i: parts — nechta bo'lakka bo'linadi; fill(k) — k ta bo'lak to'ladi
  function storageBar(host, parts, label) {
    const bar = ui.h("div", { class: "sbar", role: "img", "aria-label": label });
    const cells = [];
    for (let k = 0; k < parts; k++) {
      const c = ui.h("span", { class: "sbar-part" });
      cells.push(c);
      bar.append(c);
    }
    host.append(ui.h("div", { class: "sbar-wrap" }, ui.h("span", { class: "sbar-label", text: label }), bar));
    return { fill: (k) => cells.forEach((c, i) => c.classList.toggle("on", i < k)) };
  }

  // Hajm kartochkasi ("Qaysi biri katta?")
  const sizeCard = (s) => ui.h("div", { class: "cmp-card", text: `${s.n} ${s.unit}` });

  QK.unitsUi = { ladder, unitButtons, fileCard, storageBar, sizeCard };
})(window);

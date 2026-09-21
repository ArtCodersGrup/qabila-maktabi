// AI xaritasi: ichma-ich zonalar (yozuvlar HTML'da), kartochka va javob tugmalari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { atlas, ui, sound } = QK;

  // Xarita: oddiy dastur ⊃ AI ⊃ ML ⊃ DL. Har zonada nomi va kartochkalar joyi.
  function mapView(host) {
    const zones = {};
    let inner = null;
    for (const z of atlas.ZONES.slice().reverse()) {
      const chips = ui.h("div", { class: "zchips" });
      const box = ui.h("div", { class: `zone z-${z.id}` }, ui.h("div", { class: "zname", text: z.name }), chips);
      if (inner) box.append(inner);
      zones[z.id] = { box, chips };
      inner = box;
    }
    const el = ui.h("div", { class: "atlas" }, inner);
    host.append(el);
    return {
      el,
      // Faqat berilgan zonalar ko'rinadi (qolganlari hali "chizilmagan")
      show(ids) {
        for (const id of Object.keys(zones)) zones[id].box.classList.toggle("hidden-zone", !ids.includes(id));
      },
      highlight(id) {
        for (const key of Object.keys(zones)) zones[key].box.classList.toggle("hl", key === id);
      },
      add(id, text) {
        const chip = ui.h("span", { class: "zchip", text });
        zones[id].chips.append(chip);
        return chip;
      },
    };
  }

  // Katta matnli kartochka; key — maslahatda yoritiladigan so'z
  function card(host, text) {
    const el = ui.h("div", { class: "acard", text });
    host.append(el);
    return {
      el,
      mark(key) {
        const at = text.indexOf(key);
        if (at < 0) return;
        el.textContent = "";
        el.append(text.slice(0, at), ui.h("mark", { text: key }), text.slice(at + key.length));
      },
    };
  }

  // Javob tugmalari (ustma-ust, uzun nomlar sig'sin)
  function listButtons(options, labelOf, onPick) {
    const col = ui.h("div", { class: "alist" });
    options.forEach((value, i) => {
      col.append(ui.h("button", {
        class: `btn secondary abtn z-${value}`, type: "button", text: labelOf(value),
        onClick: () => { sound.play("tap"); onPick(i); },
      }));
    });
    ui.clearControl();
    ui.control().append(col);
  }

  const zoneLabel = (id) => {
    const z = atlas.ZONES.find((item) => item.id === id);
    return z.id === "plain" ? z.name : `${z.name} (${z.short})`;
  };

  QK.atlasUi = { mapView, card, listButtons, zoneLabel };
})(window);

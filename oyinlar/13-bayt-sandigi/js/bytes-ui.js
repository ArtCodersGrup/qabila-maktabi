// Bayt sandig'i: bitlar qatori, sandiq, belgi tugmalari, xabar va kilobayt qutisi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { bytes, ui, sound, art } = QK;

  // Bo'sh joy ekranda ko'rinib tursin
  const shown = (ch) => (ch === " " ? "␣" : ch);

  // N ta bit-doira; pattern — "10110" kabi satr (bo'lmasa navbat bilan yonadi)
  function bitDots(count, pattern) {
    const row = ui.h("div", { class: "bits-row", role: "img", "aria-label": `${count} ta bit` });
    for (let k = 0; k < count; k++) {
      const on = pattern ? pattern[k] === "1" : k % 2 === 0;
      row.append(ui.h("span", { class: "bit" + (on ? " on" : "") }));
    }
    return row;
  }

  // Sandiq: tepada belgi (ixtiyoriy), ichida 8 bitli kod
  function chest(ch, opts) {
    const o = opts || {};
    const bits = ch != null ? bytes.charBits(ch) : (o.bits || "00000000");
    const el = ui.h("div", { class: "chest" + (o.size ? " " + o.size : "") });
    if (ch != null) el.append(ui.h("span", { class: "chest-char", text: shown(ch) }));
    el.append(ui.h("span", { class: "chest-art", html: art.chest(bits) }));
    if (o.code) el.append(ui.h("span", { class: "chest-code", text: bits }));
    return el;
  }

  // N ta sandiq qatori (1-bosqich mashqi); har biri boshqa naqsh bilan
  function chests(count) {
    const row = ui.h("div", { class: "chest-row" });
    for (let k = 0; k < count; k++) row.append(chest(null, { size: "sm", bits: bytes.charBits(String.fromCharCode(66 + k * 3)) }));
    return row;
  }

  // Xabar sandiqlarga joylanadi: har belgiga bo'sh o'rin, bosilganda to'ladi
  function packer(host, message) {
    const slots = [...message].map(() => ui.h("div", { class: "chest-slot" }));
    host.append(ui.h("div", { class: "chest-row" }, ...slots));
    return {
      fill(k) {
        slots[k].replaceChildren(chest(message[k], { size: "sm" }));
        slots[k].classList.add("full");
      },
    };
  }

  // Xabar belgilari — tugmalar (boshqaruv zonasida)
  function charButtons(message, onTap) {
    const pad = ui.h("div", { class: "char-pad" });
    [...message].forEach((ch, k) => {
      const b = ui.h("button", {
        class: "char-key" + (ch === " " ? " space" : ""),
        type: "button",
        text: shown(ch),
        "aria-label": ch === " " ? "Boʻsh joy" : ch,
        onClick: () => {
          if (b.disabled) return;
          b.disabled = true;
          sound.play("tap");
          onTap(k, ch);
        },
      });
      pad.append(b);
    });
    ui.clearControl();
    ui.control().append(pad);
  }

  // Xabar: butun holda yoki belgilarga ajratilgan
  function messageView(message, split) {
    if (!split) return ui.h("div", { class: "msg", text: message });
    const row = ui.h("div", { class: "msg-split" });
    for (const ch of message) row.append(ui.h("span", { class: "msg-cell" + (ch === " " ? " space" : ""), text: shown(ch) }));
    return row;
  }

  // Kilobayt qutisi: 32 × 32 = 1024 katak. fill() — tez to'ladi, Promise qaytaradi
  function kbBox(host, onCount) {
    const grid = ui.h("div", { class: "kbgrid", role: "img", "aria-label": "1024 ta katak" });
    const cells = [];
    for (let k = 0; k < bytes.KB; k++) {
      const c = ui.h("span", { class: "kbcell" });
      cells.push(c);
      grid.append(c);
    }
    host.append(grid);
    return {
      fill() {
        let n = 0;
        return ui.settle((done) => {
          const timer = setInterval(() => {
            for (let k = 0; k < 64 && n < cells.length; k++, n++) cells[n].classList.add("on");
            if (onCount) onCount(n);
            if (n >= cells.length) {
              clearInterval(timer);
              done();
            }
          }, 50);
          ui.onCleanup(() => clearInterval(timer));
        });
      },
    };
  }

  // Sahifa ikonkalari; labels — ostida "2" yozuvi
  function pages(count, labels) {
    const row = ui.h("div", { class: "pages" });
    for (let k = 0; k < count; k++) {
      row.append(ui.h("div", { class: "page" },
        ui.h("span", { class: "page-art", html: art.page() }),
        labels ? ui.h("span", { class: "page-label", text: "2" }) : null));
    }
    return row;
  }

  QK.bytesUi = { shown, bitDots, chest, chests, packer, charButtons, messageView, kbBox, pages };
})(window);

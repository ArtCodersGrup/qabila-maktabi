// Keyingi so'z: so'z kartochkalari, gaplar, juftliklar jadvali, robot qatori va tugmalar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { words, ui, sound } = QK;

  const chip = (word, cls) => ui.h("span", { class: "wchip" + (cls ? " " + cls : ""), text: word });

  // Gaplar ro'yxati. onPick(si, wi, word, node) berilsa — so'zlar bosiladigan bo'ladi.
  function corpus(host, sentences, opts) {
    const o = opts || {};
    const el = ui.h("div", { class: "corpus" });
    const chips = [];
    sentences.forEach((sentence, si) => {
      const row = ui.h("div", { class: "wsent" });
      sentence.forEach((word, wi) => {
        const node = o.onPick
          ? ui.h("button", { class: "wchip", type: "button", text: word, onClick: () => o.onPick(si, wi, word, node) })
          : chip(word);
        chips.push({ si, wi, word, node });
        row.append(node);
      });
      el.append(row);
    });
    host.append(el);
    return {
      el,
      add(sentence) {
        const row = ui.h("div", { class: "wsent fresh" });
        sentence.forEach((word) => row.append(chip(word)));
        el.append(row);
      },
      mark(word) { chips.forEach((c) => c.node.classList.toggle("hl", c.word === word)); },
      markSentence(si) { chips.forEach((c) => c.node.classList.toggle("hl", c.si === si)); },
      done(si, wi) {
        const found = chips.find((c) => c.si === si && c.wi === wi);
        if (found) found.node.classList.add("done");
      },
    };
  }

  // Juftliklar jadvali: so'z → keyingilar (ustuncha va soni)
  function pairTable(host) {
    const el = ui.h("div", { class: "ptable" });
    host.append(el);
    const rows = {};
    return {
      el,
      set(table, list) {
        el.innerHTML = "";
        for (const word of list) {
          const nexts = ui.h("div", { class: "pnexts" });
          for (const item of words.nextList(table, word)) {
            nexts.append(ui.h("div", { class: "pnext" },
              chip(item.word, "sm"),
              ui.h("span", { class: "bar", style: `width:${item.n * 16}px` }),
              ui.h("span", { class: "pn", text: String(item.n) })));
          }
          const row = ui.h("div", { class: "prow" }, chip(word), ui.h("span", { class: "parrow", text: "→" }), nexts);
          rows[word] = row;
          el.append(row);
        }
      },
      highlight(word) {
        Object.keys(rows).forEach((w) => rows[w].classList.toggle("hl", w === word));
      },
    };
  }

  // Robot yozayotgan gap
  function robotLine(host) {
    const el = ui.h("div", { class: "rline" });
    host.append(el);
    return {
      el,
      clear() { el.innerHTML = ""; },
      set(list) {
        el.innerHTML = "";
        (list || []).forEach((word) => el.append(chip(word, "big")));
      },
      add(word) { el.append(chip(word, "big fresh")); },
    };
  }

  // So'z tugmalari (boshqaruv zonasida)
  function wordButtons(options, onPick) {
    const row = ui.h("div", { class: "choice-row" });
    options.forEach((word, i) => row.append(ui.button(word, () => onPick(i))));
    ui.clearControl();
    ui.control().append(row);
  }

  // Gap tugmalari: har tugmada 3 ta so'z kartochkasi
  function sentenceButtons(options, onPick) {
    const col = ui.h("div", { class: "sent-choice" });
    options.forEach((sentence, i) => {
      const button = ui.h("button", {
        class: "btn secondary sent-btn", type: "button",
        "aria-label": sentence.join(" "),
        onClick: () => { sound.play("tap"); onPick(i); },
      });
      sentence.forEach((word) => button.append(chip(word, "sm")));
      col.append(button);
    });
    ui.clearControl();
    ui.control().append(col);
  }

  QK.wordsUi = { chip, corpus, pairTable, robotLine, wordButtons, sentenceButtons };
})(window);

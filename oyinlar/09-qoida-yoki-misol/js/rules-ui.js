// Qoida yoki misol?: narsalar taxtasi, qoida yasagich, xato hisoblagichi va tugmalar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { rules, ui, sound, art } = QK;

  const OP_NAMES = { ">": "dan katta", "<": "dan kichik" };

  // Narsa kartochkasi: rasm, belgilari va javobi
  function thingCard(item, opts) {
    const o = opts || {};
    const card = ui.h("div", { class: "thing" + (o.small ? " sm" : "") });
    card.append(ui.h("div", { class: "thing-art", html: art.thing(item.size, item.dots) }));
    card.append(ui.h("div", { class: "thing-nums", text: `${item.size} · ${item.dots}` }));
    const mark = ui.h("div", { class: "thing-mark" });
    card.append(mark);
    const view = {
      el: card,
      // Haqiqiy javob: HA yoki YO'Q
      truth() {
        mark.textContent = item.yes ? "HA" : "YOʻQ";
        mark.className = "thing-mark " + (item.yes ? "yes" : "no");
      },
      // Qoidaning javobi to'g'ri chiqdimi
      check(ok) {
        card.classList.toggle("wrong", !ok);
        card.classList.toggle("right", ok);
        mark.textContent = item.yes ? "HA" : "YOʻQ";
        mark.className = "thing-mark " + (item.yes ? "yes" : "no") + (ok ? "" : " miss");
      },
      // Qoidaning javobini olib tashlaydi, lekin haqiqiy javob (HA/YOʻQ) joyida qoladi
      clear() {
        card.classList.remove("wrong", "right");
        if (o.truth) view.truth();
        else {
          mark.textContent = "";
          mark.className = "thing-mark";
        }
      },
    };
    if (o.truth) view.truth();
    return view;
  }

  // Narsalar taxtasi
  function board(host, items, opts) {
    const el = ui.h("div", { class: "things" });
    host.append(el);
    const cards = items.map((item) => {
      const card = thingCard(item, opts);
      el.append(card.el);
      return card;
    });
    return {
      el,
      cards,
      // Qoidani ishga tushirish: har kartaga ✓ yoki ↻
      run(rule) {
        items.forEach((item, i) => cards[i].check(rules.test(rule, item) === item.yes));
        return rules.errorsOf(items, rule);
      },
      // Misollar bilan (eng yaqin misol) bashorat
      runExamples(examples) {
        items.forEach((item, i) => cards[i].check(rules.nearest(examples, item).yes === item.yes));
        return rules.nnErrors(examples, items);
      },
      clear() { cards.forEach((card) => card.clear()); },
      truth() { cards.forEach((card) => card.truth()); },
    };
  }

  // Qoida yasagich: uch tugma — belgi, amal, son
  function ruleBuilder(host, onChange) {
    let rule = { feature: "size", op: ">", value: 5 };
    const featureBtn = ui.h("button", { class: "key wide", type: "button" });
    const opBtn = ui.h("button", { class: "key", type: "button" });
    const valueBtn = ui.h("button", { class: "key", type: "button" });
    const render = () => {
      featureBtn.textContent = rules.FEATURE_NAMES[rule.feature];
      opBtn.textContent = rule.op;
      valueBtn.textContent = String(rule.value);
      featureBtn.setAttribute("aria-label", `Belgi: ${rules.FEATURE_NAMES[rule.feature]}`);
      opBtn.setAttribute("aria-label", `Amal: ${OP_NAMES[rule.op]}`);
      valueBtn.setAttribute("aria-label", `Son: ${rule.value}`);
      if (onChange) onChange(Object.assign({}, rule));
    };
    const cycle = (what) => {
      sound.play("tap");
      if (what === "feature") rule.feature = rules.FEATURES[(rules.FEATURES.indexOf(rule.feature) + 1) % rules.FEATURES.length];
      else if (what === "op") rule.op = rules.OPS[(rules.OPS.indexOf(rule.op) + 1) % rules.OPS.length];
      else rule.value = (rule.value % 9) + 1;
      render();
    };
    featureBtn.addEventListener("click", () => cycle("feature"));
    opBtn.addEventListener("click", () => cycle("op"));
    valueBtn.addEventListener("click", () => cycle("value"));
    const el = ui.h("div", { class: "rule-line" },
      ui.h("span", { class: "rule-word", text: "Agar" }),
      featureBtn, opBtn, valueBtn,
      ui.h("span", { class: "rule-word", text: "boʻlsa — HA" }));
    host.append(el);
    render();
    return {
      el,
      get: () => Object.assign({}, rule),
      set(next) {
        rule = Object.assign({}, next);
        render();
      },
    };
  }

  // "Xato: N" hisoblagichi
  function errorBadge(host) {
    const badge = ui.h("div", { class: "err-badge", "aria-live": "polite" });
    host.append(badge);
    return {
      el: badge,
      set(n) {
        badge.textContent = n === 0 ? "Xato: 0 ✓" : `Xato: ${n}`;
        badge.classList.toggle("ok", n === 0);
      },
      clear() {
        badge.textContent = "";
        badge.classList.remove("ok");
      },
    };
  }

  // Matnli javob tugmalari
  function choiceButtons(options, onPick) {
    const row = ui.h("div", { class: "choice-row" });
    options.forEach((label, i) => row.append(ui.button(label, () => onPick(i), i % 2 ? "secondary" : "")));
    ui.clearControl();
    ui.control().append(row);
  }

  QK.rulesUi = { OP_NAMES, thingCard, board, ruleBuilder, errorBadge, choiceButtons };
})(window);

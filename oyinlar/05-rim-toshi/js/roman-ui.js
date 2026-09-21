// Rim toshi ekran qismlari: belgi kartochkalari, yoyilma, Rim klaviaturasi, lagan va qoidalar, xonalar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { roman, ui, sound } = QK;

  const PLACE_NAMES = ["birlar", "oʻnlar", "yuzlar"];

  // Bitta Rim belgisi (rangli kartochka); size: "sm" | "lg" | yo'q
  const symbol = (ch, size) => ui.h("span", { class: `rtile r-${ch}${size ? " " + size : ""}`, text: ch });

  // Rim yozuvi kartochkalarda
  function word(str, size) {
    const el = ui.h("span", { class: "rword", role: "img", "aria-label": [...str].join(" ") });
    for (const ch of str) el.append(symbol(ch, size));
    return el;
  }

  // Yoyilma: har guruh ostida qiymati. grouped — ayiriladigan juftlik bitta guruh (XL → 40),
  // aks holda har belgi alohida (X X V I I → 10 10 5 1 1). mark — ajratib ko'rsatiladigan belgi.
  function breakdown(str, opts) {
    const { grouped, mark } = opts || {};
    const parts = grouped ? roman.tokens(str) : [...str].map((ch) => ({ text: ch, value: roman.VALUES[ch] }));
    const el = ui.h("div", { class: "bk" });
    for (const part of parts) {
      el.append(ui.h("div", { class: "bk-col" + (mark && part.text === mark ? " hl" : "") },
        word(part.text),
        ui.h("div", { class: "bk-val", text: String(part.value) })));
    }
    return el;
  }

  // Rim klaviaturasi (boshqaruv zonasida): I V X L C, ⌫, Tayyor.
  // live — yozuv yonida jonli qiymat (= 12). Kompyuterda I V X L C, Backspace, Enter ham ishlaydi.
  function keyboard({ live, onSubmit, maxLen }) {
    const limit = maxLen || 8;
    let value = "";
    let showValue = !!live;
    let busy = false; // ikki marta tez bosish bitta javob bo'lsin
    const text = ui.h("span", { class: "rkb-text" });
    const val = ui.h("span", { class: "rkb-val" });
    const display = ui.h("div", { class: "rkb-display", "aria-live": "polite" }, text, val);

    function render() {
      text.innerHTML = "";
      if (value) text.append(word(value, "sm"));
      val.textContent = showValue && value ? `= ${roman.fromRoman(value)}` : "";
    }

    function press(key) {
      if (key === "ok") {
        if (!value || busy) return;
        busy = true;
        setTimeout(() => { busy = false; }, 400);
        onSubmit(value);
        return;
      }
      if (key === "del") value = value.slice(0, -1);
      else if (value.length < limit) value += key;
      else return;
      sound.play("tap");
      render();
    }

    function onKey(e) {
      if (!wrap.isConnected) { // klaviatura ekrandan olingan — endi tinglamaymiz
        cleanup();
        return;
      }
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      if (roman.KEYS.includes(key)) press(key);
      else if (key === "Backspace") press("del");
      else if (key === "Enter") {
        e.preventDefault();
        press("ok");
      }
    }
    const cleanup = () => document.removeEventListener("keydown", onKey);
    document.addEventListener("keydown", onKey);
    ui.onCleanup(cleanup);

    const keys = ui.h("div", { class: "rkb" });
    roman.KEYS.forEach((k) => keys.append(ui.h("button", { class: "key sym", type: "button", text: k, "aria-label": k, onClick: () => press(k) })));
    keys.append(ui.h("button", { class: "key del", type: "button", text: "⌫", "aria-label": "Oʻchirish", onClick: () => press("del") }));
    keys.append(ui.h("button", { class: "key ok", type: "button", text: "Tayyor", onClick: () => press("ok") }));
    const wrap = ui.h("div", { class: "rkb-wrap" }, display, keys);
    ui.clearControl();
    ui.control().append(wrap);
    render();

    return {
      get: () => value,
      setLive(on) {
        showValue = !!on;
        render();
      },
      shake() {
        display.classList.remove("shake");
        void display.offsetWidth; // animatsiyani qaytadan boshlash
        display.classList.add("shake");
      },
    };
  }

  // Rimliklar lagani: belgilar kattadan kichikka. set(yozuv, yangi) — yangi belgi "sakrab" chiqadi
  // ("*" — hamma belgi yangi).
  function tray(host) {
    let cur = "";
    const el = ui.h("div", { class: "tray", role: "img" });
    host.append(el);
    function set(str, fresh) {
      cur = str;
      el.innerHTML = "";
      let marked = false;
      for (const ch of str) {
        const tile = symbol(ch);
        if (fresh === "*" || (fresh === ch && !marked)) {
          tile.classList.add("fresh");
          marked = true;
        }
        el.append(tile);
      }
      el.setAttribute("aria-label", `Laganda: ${[...str].join(" ")}`);
    }
    set("");
    return {
      get: () => cur,
      set,
      shake() {
        el.classList.remove("shake");
        void el.offsetWidth;
        el.classList.add("shake");
      },
    };
  }

  // Lagan qoidalari tugmalari (boshqaruv zonasida). extra — pastdagi qo'shimcha tugma ("Tayyor").
  // highlight(yozuv) — shu yozuvga qo'llanadigan qoidalar yonadi.
  function ruleButtons(onRule, extra) {
    const grid = ui.h("div", { class: "rules" });
    const buttons = roman.RULES.map((rule) => {
      const b = ui.h("button", {
        class: "key rule",
        type: "button",
        text: roman.ruleLabel(rule),
        onClick: () => onRule(rule),
      });
      grid.append(b);
      return b;
    });
    ui.clearControl();
    ui.control().append(grid);
    if (extra) ui.control().append(extra);
    return {
      highlight(str) {
        buttons.forEach((b, i) => b.classList.toggle("hl", roman.applyRule(str, roman.RULES[i]) !== null));
      },
    };
  }

  // Oddiy son xonalarda: tepada xona nomi, pastda qiymati
  function placeView(host, number, opts) {
    const state = { number, labels: !!(opts && opts.labels), values: !!(opts && opts.values), hl: -1 };
    const el = ui.h("div", { class: "pv" });
    host.append(el);
    function render() {
      el.innerHTML = "";
      roman.places(state.number).forEach((part, i) => {
        el.append(ui.h("div", { class: "pv-col" + (state.hl === i ? " hl" : "") },
          ui.h("div", { class: "pv-label", text: state.labels ? PLACE_NAMES[part.place] : "" }),
          ui.h("div", { class: "pv-digit", text: String(part.digit) }),
          ui.h("div", { class: "pv-val", text: state.values ? String(part.value) : "" })));
      });
    }
    render();
    return {
      set(n) {
        state.number = n;
        render();
      },
      showLabels() {
        state.labels = true;
        render();
      },
      showValues() {
        state.values = true;
        render();
      },
      highlight(i) {
        state.hl = i;
        render();
      },
    };
  }

  QK.romanUi = { PLACE_NAMES, symbol, word, breakdown, keyboard, tray, ruleButtons, placeView };
})(window);

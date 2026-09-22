// Oʻn barmoq — ekran qismlari: ekran klaviaturasi, qo'llar, yozuv qatori, yo'lak, natija kartasi, rekord.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, typing: T, art } = QK;
  const h = ui.h;

  const LABELS = { "shift-l": "Shift", "shift-r": "Shift", " ": "" };
  const label = (k) => (k in LABELS ? LABELS[k] : k.toUpperCase());

  // ---------- Ekran klaviaturasi (faqat ko'rsatadi, bosilmaydi) ----------
  // learned — o'rganilgan tugmalar (qolganlari xira)
  function keyboard(host, { learned }) {
    const keys = {};
    const rows = [
      T.ROWS.top,
      T.ROWS.home,
      ["shift-l", ...T.ROWS.bottom, "shift-r"],
      [" "],
    ];
    const kb = h("div", { class: "kb", "aria-hidden": "true" });
    rows.forEach((row, r) => {
      const line = h("div", { class: `kb-row kb-row${r}` });
      row.forEach((k) => {
        const cls = ["kkey", "f-" + T.fingerOf(k)];
        if (k === "f" || k === "j") cls.push("bump");
        if (k.startsWith("shift")) cls.push("wide");
        if (k === " ") cls.push("space");
        if (!learned.has(k)) cls.push("dim");
        keys[k] = h("div", { class: cls.join(" "), text: label(k) });
        line.append(keys[k]);
      });
      kb.append(line);
    });
    host.append(kb);

    let lit = [];
    function mark(list) {
      lit.forEach((k) => keys[k].classList.remove("next"));
      lit = list.filter((k) => keys[k]);
      lit.forEach((k) => keys[k].classList.add("next"));
    }

    return {
      el: kb,
      // Navbatdagi belgi uchun tugma (va katta harfda Shift) yonadi; qaysi barmoqlar ishlashini qaytaradi
      show(ch) {
        if (ch == null) { mark([]); return []; }
        const list = [T.keyOf(ch), T.shiftFor(ch)].filter(Boolean);
        mark(list);
        return list.map((k) => T.fingerOf(k));
      },
      mark,
      // Bosilgan tugma bir lahza "bosiladi": to'g'ri — yashil, xato — to'q sariq
      press(key, ok) {
        const el = keys[T.keyOf(key)];
        if (!el) return;
        el.classList.remove("hit-ok", "hit-bad");
        void el.offsetWidth;
        el.classList.add(ok ? "hit-ok" : "hit-bad");
      },
    };
  }

  // ---------- Qo'llar ----------
  function hands(host) {
    const el = h("div", { class: "hands", html: art.hands() });
    host.append(el);
    return {
      el,
      show(fingers) {
        el.classList.toggle("active", fingers.length > 0);
        el.querySelectorAll(".finger").forEach((f) => f.classList.toggle("on", fingers.includes(f.dataset.f)));
      },
    };
  }

  // ---------- Yozuv qatori ----------
  // So'zlar qatorga sig'masa, butun so'z bilan keyingi qatorga o'tadi
  function line(host, text) {
    const el = h("div", { class: "tline", "aria-label": text });
    const chars = [];
    let word = h("span", { class: "tword" });
    el.append(word);
    for (const ch of text) {
      const span = h("span", { class: "ch" + (ch === " " ? " sp" : ""), text: ch === " " ? "·" : ch });
      chars.push(span);
      word.append(span);
      if (ch === " ") {
        word = h("span", { class: "tword" });
        el.append(word);
      }
    }
    host.append(el);

    return {
      el,
      at(pos) {
        chars.forEach((c, k) => {
          c.classList.toggle("done", k < pos);
          c.classList.toggle("cur", k === pos);
        });
      },
      wrong() {
        const c = el.querySelector(".ch.cur");
        if (!c) return;
        c.classList.remove("bad");
        void c.offsetWidth;
        c.classList.add("bad");
      },
    };
  }

  // ---------- Yo'lak: xabarchi har to'g'ri harfda yuradi; poygada — soya ----------
  function track(host, { side } = {}) {
    const runner = h("div", { class: "runner" + (side ? " side-" + side : ""), html: art.runner() });
    const el = h("div", { class: "track" }, h("div", { class: "track-line" }), h("div", { class: "track-flag", html: art.flag() }), runner);
    host.append(el);
    let shadow = null;
    return {
      el,
      set(frac) {
        runner.style.setProperty("--p", frac);
        runner.classList.add("moving");
        clearTimeout(runner.stopTimer);
        runner.stopTimer = setTimeout(() => runner.classList.remove("moving"), 350);
      },
      ghost(frac, ghostSide) {
        if (!shadow) {
          shadow = h("div", { class: "runner ghost side-" + ghostSide, html: art.runner() });
          el.insertBefore(shadow, runner);
        }
        shadow.style.setProperty("--p", frac);
      },
    };
  }

  // ---------- Natija kartasi ----------
  const comma = (x) => String(x).replace(".", ",");

  function result(st, { speed }) {
    const ok = T.passed(st);
    const rows = [h("div", { class: "res-row" + (ok ? " ok" : " low") },
      h("span", { text: "Aniqlik" }), h("b", { text: `${st.accuracy}% ${ok ? "✓" : "↻"}` }))];
    if (speed) {
      rows.push(h("div", { class: "res-row" }, h("span", { text: "Tezlik" }), h("b", { text: `${st.cpm} belgi/daqiqa` })));
      rows.push(h("div", { class: "res-row" }, h("span", { text: "Vaqt" }), h("b", { text: `${comma(st.seconds)} soniya` })));
    }
    return h("div", { class: "result" }, ...rows);
  }

  // ---------- Rekord: eng yaxshi tezlik (aniqlik ≥ 90% bo'lgan qatorlarda) ----------
  const BEST_KEY = "on-barmoq:rekord";

  function best() {
    try {
      const n = Number(JSON.parse(root.localStorage.getItem(BEST_KEY) || "0"));
      return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
    } catch (e) {
      return 0;
    }
  }

  // Yangi rekord bo'lsa saqlaydi va true qaytaradi
  function saveBest(cpm) {
    if (!(cpm > best())) return false;
    try {
      root.localStorage.setItem(BEST_KEY, JSON.stringify(cpm));
    } catch (e) {
      // Saqlab bo'lmadi — o'yin baribir ishlaydi
    }
    return true;
  }

  QK.typingUi = { keyboard, hands, line, track, result, comma, best, saveBest };
})(window);

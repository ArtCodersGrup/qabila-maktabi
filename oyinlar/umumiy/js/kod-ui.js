// Python bloki (27–35-o'yinlar) uchun ekran qismlari: kod muharriri, chiqish paneli,
// qadam-baqadam panel va o'qiladigan kodni bo'yash. Mantiq — umumiy/js/kod.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const TAB = "    "; // otstup — 4 bo'shliq (QOIDALAR: Tab emas)
  const SHOW_LINES = 40; // chiqish panelida ko'rsatiladigan eng ko'p satr

  const KEYWORDS = new Set(["if", "elif", "else", "while", "for", "in", "break", "continue",
    "pass", "def", "return", "and", "or", "not", "True", "False", "None"]);
  const BUILTINS = new Set(["print", "input", "int", "str", "float", "bool", "len", "range",
    "abs", "min", "max", "sum", "sorted", "append", "pop", "upper", "lower", "count", "split"]);

  const esc = (s) => String(s).replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));

  // Bitta satrni bo'yash. Buzuq kod ham bo'yalishi kerak, shuning uchun talqinchi emas, oddiy skaner.
  function paint(line) {
    let out = "";
    let k = 0;
    const text = String(line);
    while (k < text.length) {
      const ch = text[k];
      if (ch === "#") {
        out += '<i class="k-izoh">' + esc(text.slice(k)) + "</i>";
        break;
      }
      if (ch === '"' || ch === "'") {
        let j = k + 1;
        while (j < text.length && text[j] !== ch) j += text[j] === "\\" ? 2 : 1;
        out += '<i class="k-satr">' + esc(text.slice(k, Math.min(j + 1, text.length))) + "</i>";
        k = j + 1;
        continue;
      }
      if (ch >= "0" && ch <= "9" && !/[A-Za-z_]/.test(text[k - 1] || "")) {
        let j = k;
        while (j < text.length && /[0-9._]/.test(text[j])) j++;
        out += '<i class="k-son">' + esc(text.slice(k, j)) + "</i>";
        k = j;
        continue;
      }
      if (/[A-Za-z_]/.test(ch)) {
        let j = k;
        while (j < text.length && /[A-Za-z0-9_]/.test(text[j])) j++;
        const word = text.slice(k, j);
        const cls = KEYWORDS.has(word) ? "k-kalit" : BUILTINS.has(word) ? "k-ichki" : "";
        out += cls ? '<i class="' + cls + '">' + esc(word) + "</i>" : esc(word);
        k = j;
        continue;
      }
      out += esc(ch);
      k++;
    }
    return out;
  }

  // O'qiladigan kod: har satr alohida element (satrni yoqib ko'rsatish uchun)
  function codeBlock(code, opts) {
    const o = opts || {};
    const el = ui.h("div", { class: "kod-blok" + (o.numbers === false ? " no-num" : "") });
    const lines = String(code).split("\n");
    lines.forEach((line, k) => {
      const row = ui.h("div", { class: "kod-satr" });
      if (o.numbers !== false) row.append(ui.h("span", { class: "kod-raqam", text: String(k + 1) }));
      row.append(ui.h("code", { class: "kod-matn", html: paint(line) || "&nbsp;" }));
      el.append(row);
    });
    el.markLine = (n) => {
      [...el.children].forEach((row, k) => row.classList.toggle("yonmoqda", k + 1 === n));
    };
    if (o.mark) el.markLine(o.mark);
    return el;
  }

  // Bola kod yozadigan maydon: satr raqamlari, Tab — 4 bo'shliq, ":" dan keyin avtomatik otstup
  function editor(opts) {
    const o = opts || {};
    const area = ui.h("textarea", {
      class: "kod-yozuv",
      spellcheck: "false",
      autocapitalize: "off",
      autocorrect: "off",
      autocomplete: "off",
      rows: String(o.rows || 6),
      "aria-label": o.label || "Kod yoziladigan maydon",
    });
    area.value = o.code || "";
    const nums = ui.h("div", { class: "kod-raqamlar", "aria-hidden": "true" });
    const box = ui.h("div", { class: "kod-muharrir" }, nums, area);

    const syncNumbers = () => {
      const n = area.value.split("\n").length;
      nums.innerHTML = "";
      for (let k = 1; k <= n; k++) nums.append(ui.h("span", { text: String(k) }));
      nums.scrollTop = area.scrollTop;
    };
    const insert = (text, back) => {
      const start = area.selectionStart;
      const end = area.selectionEnd;
      area.value = area.value.slice(0, start) + text + area.value.slice(end);
      const at = start + text.length - (back || 0);
      area.selectionStart = area.selectionEnd = at;
      syncNumbers();
    };

    area.addEventListener("input", syncNumbers);
    area.addEventListener("scroll", () => { nums.scrollTop = area.scrollTop; });
    area.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const start = area.selectionStart;
        const end = area.selectionEnd;
        const chunk = area.value.slice(start, end);
        if (chunk.includes("\n")) {
          const shifted = chunk.split("\n").map((line) => (e.shiftKey ? line.replace(/^ {1,4}/, "") : TAB + line)).join("\n");
          area.value = area.value.slice(0, start) + shifted + area.value.slice(end);
          area.selectionStart = start;
          area.selectionEnd = start + shifted.length;
          syncNumbers();
          return;
        }
        if (e.shiftKey) {
          const lineStart = area.value.lastIndexOf("\n", start - 1) + 1;
          const cut = /^ {1,4}/.exec(area.value.slice(lineStart));
          if (cut) {
            area.value = area.value.slice(0, lineStart) + area.value.slice(lineStart + cut[0].length);
            area.selectionStart = area.selectionEnd = Math.max(lineStart, start - cut[0].length);
            syncNumbers();
          }
          return;
        }
        insert(TAB);
        return;
      }
      if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const start = area.selectionStart;
        const lineStart = area.value.lastIndexOf("\n", start - 1) + 1;
        const line = area.value.slice(lineStart, start);
        const pad = (/^ */.exec(line) || [""])[0];
        insert("\n" + pad + (/:\s*$/.test(line) ? TAB : ""));
        return;
      }
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (o.onRun) o.onRun();
        return;
      }
      if (e.key === "Escape") area.blur();
    });

    syncNumbers();
    return {
      el: box,
      area,
      get: () => area.value,
      set: (text) => { area.value = text; syncNumbers(); },
      focus: () => { area.focus(); area.selectionStart = area.selectionEnd = area.value.length; },
      disable: (on) => { area.disabled = !!on; },
    };
  }

  // Chiqish paneli: print chiqishi va xato (xato — qizil emas, "yana" rangida, ↻ belgisi bilan)
  function output(opts) {
    const o = opts || {};
    const body = ui.h("pre", { class: "kod-natija" });
    const title = ui.h("div", { class: "kod-sarlavha", text: o.title || "Chiqish" });
    const el = ui.h("div", { class: "kod-chiqish" }, title, body);
    const api = {
      el,
      clear() { body.innerHTML = ""; el.classList.remove("xato"); },
      lines(list) {
        api.clear();
        const rows = QK.kod.normalize(list);
        if (!rows.length) body.append(ui.h("span", { class: "kod-bosh", text: "(hech narsa chiqmadi)" }));
        // Cheksiz sikl minglab satr chiqarishi mumkin — ekranni toldirib yubormaydi
        for (const line of rows.slice(0, SHOW_LINES)) body.append(ui.h("span", { class: "kod-chiqsatr", text: line }));
        if (rows.length > SHOW_LINES) {
          body.append(ui.h("span", { class: "kod-bosh", text: "… yana " + (rows.length - SHOW_LINES) + " satr" }));
        }
      },
      error(err, code) {
        el.classList.add("xato");
        const box = ui.h("div", { class: "kod-xato" },
          ui.h("div", { class: "kod-xato-matn", text: "↻ " + err.text }));
        if (err.line && code) {
          const srcLine = String(code).split("\n")[err.line - 1] || "";
          box.append(ui.h("pre", { class: "kod-xato-satr", text: srcLine }));
          if (err.col) box.append(ui.h("pre", { class: "kod-xato-oq", text: QK.python.errors.pointer(srcLine, err.col) }));
        }
        if (err.hint) box.append(ui.h("div", { class: "kod-xato-izoh", text: err.hint }));
        body.append(box);
      },
      show(result, code) {
        api.lines(result.output);
        if (result.error) api.error(result.error, code);
      },
    };
    return api;
  }

  // Yozilayotgan kod brauzerda saqlanadi — sahifa yangilansa yo'qolmaydi (faqat qulaylik uchun)
  const draft = {
    key: (name) => "kod-qoralama:" + name,
    read(name) {
      try { return root.localStorage.getItem(draft.key(name)); } catch (e) { return null; }
    },
    write(name, text) {
      try { root.localStorage.setItem(draft.key(name), text); } catch (e) { /* maxfiy rejim — muhim emas */ }
    },
    clear(name) {
      try { root.localStorage.removeItem(draft.key(name)); } catch (e) { /* muhim emas */ }
    },
  };

  // Kirish paneli: input() shu satrlarni navbat bilan oladi
  function stdinPanel(lines) {
    const body = ui.h("pre", { class: "kod-natija" });
    for (const line of lines) body.append(ui.h("span", { class: "kod-chiqsatr", text: line }));
    return ui.h("div", { class: "kod-chiqish kod-kirish" },
      ui.h("div", { class: "kod-sarlavha", text: "Kirish (input oladigan satrlar)" }), body);
  }

  // O'zgaruvchilar jadvali: nom → qiymat (o'zgargani belgilanadi)
  function varsTable(vars, prev) {
    const el = ui.h("div", { class: "kod-qutilar" });
    const names = Object.keys(vars || {});
    if (!names.length) return el;
    for (const name of names) {
      const changed = prev && prev[name] !== vars[name];
      el.append(ui.h("div", { class: "kod-quti" + (changed ? " ozgardi" : "") },
        ui.h("span", { class: "kod-quti-nom", text: name }),
        ui.h("span", { class: "kod-quti-qiymat", text: vars[name] })));
    }
    return el;
  }

  // Qadam-baqadam panel: hozirgi satr yonadi, qutilar to'ladi, chiqish o'sadi
  function stepper(opts) {
    const o = opts || {};
    const trace = QK.python.trace(o.code, { stdin: o.stdin, maxStates: o.maxStates || 300 });
    const block = codeBlock(o.code);
    const out = output({ title: "Chiqish" });
    const boxes = ui.h("div", { class: "kod-qutilar-host" });
    const el = ui.h("div", { class: "kod-qadam" }, block, ui.h("div", { class: "kod-yon" }, boxes, out.el));

    let at = -1;
    const draw = () => {
      const state = at >= 0 ? trace.states[at] : null;
      block.markLine(state ? state.line : 0);
      boxes.innerHTML = "";
      boxes.append(varsTable(state ? state.vars : {}, at > 0 ? trace.states[at - 1].vars : null));
      out.lines(state ? state.output : []);
      if (!state) return;
      if (at === trace.states.length - 1 && trace.error) out.error(trace.error, o.code);
    };
    draw();

    const api = {
      el,
      step() {
        if (at >= trace.states.length - 1) return false;
        at++;
        draw();
        sound.play("tap");
        return at < trace.states.length - 1;
      },
      all() { at = trace.states.length - 1; draw(); },
      reset() { at = -1; draw(); },
      done: () => at >= trace.states.length - 1,
      trace,
    };
    return api;
  }

  // Ishga tushirish tugmasi bilan birga keladigan yig'ma qism: muharrir + chiqish
  function workbench(opts) {
    const o = opts || {};
    const saved = o.saveKey ? draft.read(o.saveKey) : null;
    const ed = editor({ code: saved != null ? saved : o.code, rows: o.rows, onRun: () => api.run() });
    const out = output({});
    const el = ui.h("div", { class: "kod-stol" });
    if (o.stdin && o.stdin.length) el.append(stdinPanel(o.stdin));
    el.append(ed.el, out.el);
    if (o.saveKey) {
      let timer = null;
      ed.area.addEventListener("input", () => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => draft.write(o.saveKey, ed.get()), 300);
      });
      ui.onCleanup(() => { if (timer) clearTimeout(timer); });
    }
    const api = {
      el, editor: ed, output: out,
      forget() { if (o.saveKey) draft.clear(o.saveKey); },
      run() {
        const code = ed.get();
        const result = QK.kod.run(code, { stdin: o.stdin });
        out.show(result, code);
        sound.play(result.error ? "retry" : "tap");
        if (o.onRun) o.onRun(result, code);
        return result;
      },
    };
    return api;
  }

  // Qadamlar jadvali: bir nechta yechimni qadamlar soni bo'yicha yonma-yon ko'rsatadi.
  // qatorlar: [{ nom, qadam, natija, eng }] — "eng" eng tejamlisini belgilaydi.
  // 36-o'yindan boshlab ishlatiladi (38–40 ham shuni ishlatadi).
  function qadamJadval(qatorlar) {
    const eng = Math.max(1, ...qatorlar.map((q) => q.qadam));
    const el = ui.h("table", { class: "qadam-jadval" });
    const head = ui.h("tr", {},
      ui.h("th", { text: "Yechim" }),
      ui.h("th", { text: "Qadamlar" }),
      ui.h("th", { text: "Natija" }));
    const body = ui.h("tbody");
    for (const q of qatorlar) {
      const ulush = Math.max(4, Math.round((q.qadam / eng) * 100));
      body.append(ui.h("tr", { class: q.eng ? "tejamli" : "" },
        ui.h("td", { class: "qadam-nom", text: q.nom }),
        ui.h("td", { class: "qadam-son" },
          ui.h("span", { class: "qadam-chiziq" }, ui.h("span", { class: "qadam-ich", style: "width:" + ulush + "%" })),
          ui.h("b", { text: String(q.qadam) })),
        ui.h("td", { class: "qadam-natija", text: String(q.natija === undefined ? "" : q.natija) })));
    }
    el.append(ui.h("thead", {}, head), body);
    return el;
  }

  // Barmoq bilan boshqariladigan ekran: klaviatura bo'lmasligi mumkin (QOIDALAR §3)
  const touchOnly = () => !!(root.matchMedia && root.matchMedia("(hover: none) and (pointer: coarse)").matches);

  async function keyboardCheck() {
    if (!touchOnly()) return true;
    ui.bubble("elder", "Bu blokda kod yoziladi — klaviatura kerak. Uni kompyuterda och.");
    const answer = await ui.choice([
      { label: "Klaviaturam bor", value: "go" },
      { label: "Barcha oʻyinlar", value: "back", secondary: true },
    ]);
    if (answer === "back") {
      root.location.href = "../../index.html";
      await new Promise(() => {});
    }
    return true;
  }

  QK.kodUI = { codeBlock, editor, output, varsTable, stepper, workbench, stdinPanel, draft, qadamJadval, keyboardCheck, touchOnly, paint, TAB };
})(window);

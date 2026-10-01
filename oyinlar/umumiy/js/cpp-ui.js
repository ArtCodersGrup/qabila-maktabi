// C++ bloki (54–57-o'yinlar) uchun ekran qismlari: kodni bo'yash, chiqish paneli,
// Python ↔ C++ sintaksis kartasi va "nima chiqaradi" mashqi.
// Mantiq — umumiy/js/cpp.js da. Bu yerda kod ishga tushmaydi: chiqish oldindan ma'lum.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, cpp: C, practice } = QK;

  const esc = (s) => String(s).replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));

  // Bitta satrni bo'yash. Buzuq kod ham bo'yalishi kerak, shuning uchun oddiy skaner.
  function paint(line) {
    const text = String(line);
    let out = "";
    let k = 0;
    // #include <iostream> — butun satr boshida
    const pre = /^(\s*#\s*\w+)(\s*)(<[^>]*>)?/.exec(text);
    if (pre) {
      out += '<i class="k-kalit">' + esc(pre[1]) + "</i>" + esc(pre[2] || "");
      if (pre[3]) out += '<i class="k-satr">' + esc(pre[3]) + "</i>";
      k = pre[0].length;
    }
    while (k < text.length) {
      const ch = text[k];
      if (ch === "/" && text[k + 1] === "/") {
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
        while (j < text.length && /[0-9.]/.test(text[j])) j++;
        out += '<i class="k-son">' + esc(text.slice(k, j)) + "</i>";
        k = j;
        continue;
      }
      if (/[A-Za-z_]/.test(ch)) {
        let j = k;
        while (j < text.length && /[A-Za-z0-9_]/.test(text[j])) j++;
        const word = text.slice(k, j);
        const cls = C.KALIT.has(word) || C.TUR.has(word) ? "k-kalit" : C.ICHKI.has(word) ? "k-ichki" : "";
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
  function kodBlok(code, opts) {
    const o = opts || {};
    const el = ui.h("div", { class: "kod-blok" + (o.numbers === false ? " no-num" : "") });
    String(code).split("\n").forEach((line, k) => {
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

  // Chiqish paneli: dastur nima yozgani
  function chiqishPanel(lines, title) {
    const body = ui.h("pre", { class: "kod-natija" });
    for (const line of C.satrlar(lines)) body.append(ui.h("span", { class: "kod-chiqsatr", text: line || " " }));
    return ui.h("div", { class: "kod-chiqish" },
      ui.h("div", { class: "kod-sarlavha", text: title || "Chiqish" }), body);
  }

  // Kirish ma'lumoti: dasturga nima beriladi (cin shundan o'qiydi)
  function kirishPanel(lines) {
    const body = ui.h("pre", { class: "kod-natija" });
    for (const line of lines) body.append(ui.h("span", { class: "kod-chiqsatr", text: String(line) }));
    return ui.h("div", { class: "kod-chiqish kod-kirish" },
      ui.h("div", { class: "kod-sarlavha", text: "Kiritiladi" }), body);
  }

  // Python ↔ C++ sintaksis kartasi — blokning asosiy nazariya vositasi
  function karta(rows) {
    const el = ui.h("div", { class: "cpp-karta" });
    el.append(ui.h("div", { class: "cpp-karta-bosh" },
      ui.h("span", { text: "" }), ui.h("span", { text: "Python" }), ui.h("span", { text: "C++" })));
    for (const r of rows || C.JADVAL) {
      el.append(ui.h("div", { class: "cpp-qator" },
        ui.h("span", { class: "cpp-nima", text: r.nima }),
        ui.h("code", { class: "cpp-kod py", text: r.python }),
        ui.h("code", { class: "cpp-kod", html: paint(r.cpp) })));
    }
    return el;
  }

  // Qolip qismlari: har satr nima qiladi
  function qolipKarta(qismlar) {
    const el = ui.h("div", { class: "cpp-qolip" });
    for (const q of qismlar || C.QISMLAR) {
      el.append(ui.h("div", { class: "cpp-qolip-qator" },
        ui.h("code", { class: "cpp-kod", html: paint(q.qism) }),
        ui.h("span", { class: "cpp-izoh", text: q.izoh })));
    }
    return el;
  }

  // ---------- Mashq ekranlari ----------
  function box(compact) {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = ui.h("div", { class: "pbox" });
    ui.work().append(el);
    return el;
  }

  const note = (text) => ui.h("div", { class: "note", text });
  const answer = (text) => ui.h("div", { class: "answer", text });

  // "Bu kod nima chiqaradi?" — javob klaviaturada yoziladi
  function natijaMashq(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box();
        host.append(note(task.savol || "Bu kod nima chiqaradi? Har satrni alohida qatorga yoz."));
        host.append(kodBlok(task.kod));
        if (task.kirish && task.kirish.length) host.append(kirishPanel(task.kirish));
        const area = ui.h("textarea", {
          class: "kod-javob", rows: "3", spellcheck: "false",
          autocapitalize: "off", autocorrect: "off", "aria-label": "Chiqishni yoz",
        });
        area.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(area.value); }
        });
        host.append(area);
        ui.control().append(ui.button("Tekshir", () => submit(area.value), "big"));
        setTimeout(() => area.focus(), 50);
      },
      check: (value) => C.solishtir(task.chiqish, value).ok,
      hint(value) { host.append(note("↻ " + C.solishtir(task.chiqish, value).izoh)); },
      solution() { host.append(answer("Toʻgʻri javob:"), chiqishPanel(task.chiqish, "Haqiqiy chiqish")); },
    });
  }

  // Tanlovli mashq: kod ko'rsatiladi, javob tugmalardan tanlanadi
  function tanlovMashq(task, opts) {
    const o = opts || {};
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box();
        host.append(note(task.savol));
        if (task.kod) host.append(kodBlok(task.kod, { numbers: o.numbers !== false, mark: task.belgilangan }));
        if (task.kirish && task.kirish.length) host.append(kirishPanel(task.kirish));
        for (const v of task.variantlar) ui.control().append(ui.button(v, () => submit(v), "wide"));
      },
      check: (value) => value === task.javob,
      hint() { host.append(note("↻ " + task.yolYoriq)); },
      solution() { host.append(answer("Toʻgʻri javob: " + task.javob), note(task.nega)); },
    });
  }


  // ---------- Kod yoziladigan maydon ----------
  const TAB = "    "; // otstup — 4 bo'shliq (QOIDALAR: Tab emas)

  function muharrir(opts) {
    const o = opts || {};
    const area = ui.h("textarea", {
      class: "kod-yozuv", spellcheck: "false", autocapitalize: "off", autocorrect: "off",
      autocomplete: "off", rows: String(o.rows || 6), "aria-label": o.label || "Kod yoziladigan maydon",
    });
    area.value = o.kod || "";
    const nums = ui.h("div", { class: "kod-raqamlar", "aria-hidden": "true" });
    const box = ui.h("div", { class: "kod-muharrir" }, nums, area);

    const yangila = () => {
      const n = area.value.split("\n").length;
      nums.innerHTML = "";
      for (let k = 1; k <= n; k++) nums.append(ui.h("span", { text: String(k) }));
      nums.scrollTop = area.scrollTop;
    };
    const qoy = (matn) => {
      const a = area.selectionStart;
      const b = area.selectionEnd;
      area.value = area.value.slice(0, a) + matn + area.value.slice(b);
      area.selectionStart = area.selectionEnd = a + matn.length;
      yangila();
    };

    area.addEventListener("input", yangila);
    area.addEventListener("scroll", () => { nums.scrollTop = area.scrollTop; });
    area.addEventListener("keydown", (e) => {
      if (e.key === "Tab") { e.preventDefault(); qoy(TAB); return; }
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (o.onRun) o.onRun(); return; }
      if (e.key === "Enter") {
        // Otstupni saqlaymiz; "{" dan keyin bitta daraja ichkariga suriladi
        e.preventDefault();
        const start = area.selectionStart;
        const boshi = area.value.lastIndexOf("\n", start - 1) + 1;
        const satr = area.value.slice(boshi, start);
        const otstup = (/^ */.exec(satr) || [""])[0];
        qoy("\n" + otstup + (/\{\s*$/.test(satr) ? TAB : ""));
        return;
      }
      if (e.key === "Escape") area.blur();
    });

    yangila();
    return {
      el: box, area,
      get: () => area.value,
      set: (matn) => { area.value = matn; yangila(); },
      focus: () => { area.focus(); area.selectionStart = area.selectionEnd = area.value.length; },
      disable: (on) => { area.disabled = !!on; },
    };
  }

  // Xato paneli: kompilyator uslubidagi satr + o'zbekcha izoh
  function xatoPaneli(xato) {
    return ui.h("div", { class: "kod-chiqish xato" },
      ui.h("div", { class: "kod-sarlavha", text: xato.title }),
      ui.h("pre", { class: "kod-natija", text: xato.text }),
      ui.h("div", { class: "kod-xato-izoh", text: xato.hint }));
  }

  // Ish stoli: muharrir + "Ishga tushir" + natija paneli
  function ishStoli(host, opts) {
    const o = opts || {};
    const stol = ui.h("div", { class: "kod-stol" });
    if (o.kirish && o.kirish.length) stol.append(kirishPanel(o.kirish));
    const ed = muharrir({ kod: o.kod, rows: o.rows, onRun: () => api.run() });
    const natija = ui.h("div", { class: "cpp-natija" });
    stol.append(ed.el, natija);
    host.append(stol);

    const api = {
      el: stol, muharrir: ed,
      run() {
        const kod = ed.get();
        const r = QK.cpp.run(kod, { stdin: o.kirish || [] });
        natija.innerHTML = "";
        natija.append(r.error ? xatoPaneli(r.error) : chiqishPanel(r.output.length ? r.output : [""], "Chiqish"));
        QK.sound.play(r.error ? "retry" : "tap");
        if (o.onRun) o.onRun(r, kod);
        return r;
      },
    };
    if (o.tugma !== false) ui.control().append(ui.button("▶︎ Ishga tushir", () => api.run(), "big"));
    setTimeout(() => ed.focus(), 50);
    return api;
  }

  // "Kodni oʻzing yoz" mashqi: bola yozadi, ishga tushiradi, chiqish tekshiriladi
  function yozMashq(task) {
    let host = null;
    const sinov = (task.sinovlar && task.sinovlar[0]) || { kirish: [], chiqish: task.chiqish || [] };
    return practice.tries({
      setup(submit) {
        host = box();
        host.append(note(task.savol));
        if (task.kutilgan !== false) host.append(chiqishPanel(sinov.chiqish, "Shunday chiqishi kerak"));
        ishStoli(host, { kod: task.qolip, kirish: sinov.kirish, rows: task.rows || 7, onRun: (r, kod) => submit(kod) });
      },
      check: (kod) => C.tekshir(task, kod).ok,
      hint(kod) {
        const bad = C.tekshir(task, kod);
        if (bad.kind === "xato") host.append(note("↻ " + bad.error.hint));
        else if (bad.olingan && bad.olingan.length) {
          host.append(note("↻ Sening dasturing «" + bad.olingan[0] + "» chiqardi, kerakli javob — «" + (bad.sinov.chiqish[0] || "") + "». " + (task.yolYoriq || "")));
        } else host.append(note("↻ Dastur hech narsa chiqarmadi. " + (task.yolYoriq || "")));
      },
      solution() {
        host.append(answer("Toʻgʻri javob:"), kodBlok(task.yechim, { numbers: false }));
      },
    });
  }

  QK.cppUI = { paint, kodBlok, chiqishPanel, kirishPanel, karta, qolipKarta, box, note, answer,
    muharrir, xatoPaneli, ishStoli, natijaMashq, tanlovMashq, yozMashq };
})(window);

// Sanoq tizimlari — umumiy ekran qismlari (17–22-o'yinlar): cho't, ustun taxtasi, asosga mos
// raqam klaviaturasi, ikki urinishli javob va ustunda bosqichma-bosqich hisoblash.
// Uslublari: ../css/sanoq.css
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, ui, sound } = QK;
  const ROD_COLORS = ["#8E5BD0", "#1A9E77", "#F08A24", "#2F6FDE"];

  // ---------- Asosga mos klaviatura: faqat 0 … b−1 raqamlari, ⌫ va ✓ ----------
  // Kompyuterda klaviatura ham ishlaydi (0–9, a–f, Backspace, Enter). Natija — satr ("101", "7E")
  function basePad(base, maxLen) {
    const limit = maxLen || 8;
    ui.clearControl();
    let value = "";
    const display = ui.h("div", { class: "num-display bpad-display", "aria-live": "polite" });
    const render = () => { display.textContent = value ? sanoq.fmt(value, base) : " "; };
    render();
    return ui.settle((done) => {
      function press(k) {
        if (k === "ok") {
          if (!value) return;
          cleanup();
          ui.clearControl();
          done(value);
          return;
        }
        if (k === "del") value = value.slice(0, -1);
        else if (value.length < limit) value = (value === "0" ? "" : value) + k;
        sound.play("tap");
        render();
      }
      function onKey(e) {
        const ch = e.key.toUpperCase();
        const v = sanoq.digitValue(ch);
        if (ch.length === 1 && v >= 0 && v < base) press(ch);
        else if (e.key === "Backspace") press("del");
        else if (e.key === "Enter") {
          e.preventDefault();
          press("ok");
        }
      }
      const cleanup = () => document.removeEventListener("keydown", onKey);
      document.addEventListener("keydown", onKey);
      ui.onCleanup(cleanup);

      const keys = [...sanoq.DIGITS.slice(0, base), "del", "ok"];
      const cols = keys.length <= 6 ? keys.length : keys.length <= 12 ? Math.ceil(keys.length / 2) : 6;
      const pad = ui.h("div", { class: "keypad", style: `grid-template-columns: repeat(${cols}, minmax(0, 1fr))` });
      keys.forEach((k) => {
        pad.append(ui.h("button", {
          class: "key" + (k === "ok" ? " ok" : k === "del" ? " del" : ""),
          type: "button",
          text: k === "del" ? "⌫" : k === "ok" ? "✓" : k,
          "aria-label": k === "del" ? "Oʻchirish" : k === "ok" ? "Javob berish" : k,
          onClick: () => press(k),
        }));
      });
      ui.control().append(ui.h("div", { class: "keypad-wrap" }, display, pad));
    });
  }

  // Ikki urinish (QOIDALAR 4.4): javob — satr, bosh nollar hisobga olinmaydi
  async function digitTries({ answer, base, hint, solution, maxLen }) {
    for (let wrong = 0; ; ) {
      const value = await basePad(base, maxLen);
      if (sanoq.clean(value) === sanoq.clean(answer)) {
        sound.play("correct");
        ui.pose("apprentice", "happy", 900);
        return true;
      }
      sound.play("retry");
      ui.pose("apprentice", "think", 1000);
      wrong++;
      if (wrong === 1) hint(value);
      else {
        solution(value);
        return false;
      }
    }
  }

  // ---------- Cho't: har simda 0 … b−1 munchoq; b ta bo'lsa — keyingi simga 1 ----------
  // places — simlar ustida xona qiymatlari (1, b, b², …); hideDigits — sim ostidagi raqamlar
  // yashiriladi (mashqda bola munchoqlarni o'zi sanaydi), showDigits() ochadi
  function choti(host, { base, rods, value, places, hideDigits }) {
    let d = Array(rods).fill(0);
    const el = ui.h("div", { class: "choti" + (hideDigits ? " nodigits" : ""), style: `--beads: ${base}` });
    const rodEls = [];
    for (let i = 0; i < rods; i++) {
      const place = base ** (rods - 1 - i);
      const top = ui.h("span", { class: "rod-place", text: places ? String(place) : "" });
      const stick = ui.h("div", { class: "rod-stick" });
      const digit = ui.h("span", { class: "rod-digit" });
      const rod = ui.h("div", { class: "rod" }, top, stick, digit);
      rodEls.push({ rod, stick, digit });
      el.append(rod);
    }
    host.append(el);

    function renderRod(i, count, cls) {
      const r = rodEls[i];
      r.stick.innerHTML = "";
      r.rod.className = "rod" + (cls ? " " + cls : "");
      for (let k = 0; k < count; k++) {
        r.stick.append(ui.h("span", { class: "bead", style: `background:${ROD_COLORS[(rods - 1 - i) % ROD_COLORS.length]}` }));
      }
      r.digit.textContent = count < base ? sanoq.digitChar(count) : "";
    }
    const render = () => d.forEach((count, i) => renderRod(i, count));

    function set(n) {
      const s = sanoq.toBase(n, base).padStart(rods, "0").slice(-rods);
      d = [...s].map(sanoq.digitValue);
      render();
    }
    set(value || 0);

    return {
      el,
      get: () => d.reduce((acc, v) => acc * base + v, 0),
      set,
      showDigits: () => el.classList.remove("nodigits"),
      // +1: birlar simiga munchoq; b ta bo'lsa — sim bo'shaydi, chapdagiga 1 o'tadi (animatsiya bilan)
      async inc() {
        let i = rods - 1;
        d[i]++;
        renderRod(i, d[i]);
        while (i >= 0 && d[i] === base) {
          renderRod(i, base, "full");
          sound.play("tak");
          await ui.sleep(450);
          d[i] = 0;
          renderRod(i, 0);
          if (i === 0) break;
          i--;
          d[i]++;
          renderRod(i, d[i], "got");
          await ui.sleep(250);
          renderRod(i, d[i]);
        }
      },
      // −1: birlar simi bo'sh bo'lsa, chapdagi simdan 1 munchoq olinib, b taga maydalanadi
      async dec() {
        const i = rods - 1;
        if (d[i] === 0) {
          let j = i;
          while (j >= 0 && d[j] === 0) j--;
          if (j < 0) return;
          for (let k = j; k < i; k++) {
            d[k]--; // k-sim 1 munchoq beradi
            d[k + 1] += base; // u o'ngdagi simda b ta munchoqqa aylanadi
            renderRod(k, d[k], "gave");
            renderRod(k + 1, d[k + 1], "full");
            sound.play("tak");
            await ui.sleep(450);
            renderRod(k, d[k]);
          }
        }
        d[i]--;
        renderRod(i, d[i]);
      },
    };
  }

  // ---------- Ustun taxtasi: ko'chirish/qarz qatori, a, amal va b, chiziq, natija ----------
  // width — ustunlar soni (eng uzun sondan 1 ta ko'p). i — o'ngdan hisoblanadi (0 — birlar)
  function ustun(host, { a, b, op, base, width }) {
    const w = width || Math.max(a.length, b.length) + 1;
    const grid = ui.h("div", { class: "ustun", style: `grid-template-columns: 26px repeat(${w}, var(--ucell))` });
    const cell = (cls, text) => ui.h("span", { class: "ucell " + cls, text: text || "" });
    const rows = { carry: [], a: [], b: [], res: [] };
    const addRow = (name, sign, str, cls) => {
      grid.append(cell("usign", sign));
      for (let c = 0; c < w; c++) {
        const i = w - 1 - c;
        const ch = str != null && i < str.length ? str[str.length - 1 - i] : "";
        const node = cell(cls, ch);
        rows[name][i] = node;
        grid.append(node);
      }
    };
    addRow("carry", "", null, "ucarry");
    addRow("a", "", a, "udigit");
    addRow("b", op, b, "udigit");
    grid.append(ui.h("span", { class: "uline", style: `grid-column: 1 / span ${w + 1}` }));
    addRow("res", "", null, "ures");
    const wrap = ui.h("div", { class: "ustun-wrap" }, grid, ui.h("span", { class: "ubase", text: `${base}-lik` }));
    host.append(wrap);
    return {
      el: wrap,
      width: w,
      setCarry(i, text) { if (rows.carry[i]) rows.carry[i].textContent = text; },
      setResult(i, ch) {
        if (!rows.res[i]) return;
        rows.res[i].textContent = ch;
        rows.res[i].classList.add("filled");
      },
      setResultAll(str) { [...str].reverse().forEach((ch, i) => this.setResult(i, ch)); },
      mark(i) {
        Object.values(rows).forEach((row) => row.forEach((node, k) => node && node.classList.toggle("hl", k === i)));
      },
      markTop(i, cls) { if (rows.a[i]) rows.a[i].classList.add(cls); },
    };
  }

  // Raqam tugmalari (0 … b−1) — ustunda bosqichma-bosqich hisoblash uchun
  function digitButtons(base, onPick) {
    const row = ui.h("div", { class: "dbuttons" + (base > 10 ? " many" : "") });
    for (let v = 0; v < base; v++) {
      const ch = sanoq.digitChar(v);
      row.append(ui.h("button", { class: "key", type: "button", text: ch, onClick: () => onPick(ch) }));
    }
    ui.clearControl();
    ui.control().append(row);
  }

  // Ustunda bosqichma-bosqich: har qadamda bola natija raqamini tanlaydi.
  // steps: [{ i, digit, say, hint, carry: { i, text } }] — o'ngdan chapga
  function guide(board, steps, base) {
    return ui.settle(async (done) => {
      for (const step of steps) {
        board.mark(step.i);
        ui.bubble("elder", step.say);
        await ui.settle((next) => {
          digitButtons(base, (ch) => {
            if (ch !== step.digit) {
              sound.play("retry");
              ui.pose("apprentice", "think", 900);
              ui.bubble("elder", "↻ " + step.hint);
              return;
            }
            sound.play("tap");
            board.setResult(step.i, ch);
            if (step.carry) board.setCarry(step.carry.i, step.carry.text);
            if (step.mark) board.markTop(step.mark, "gave");
            ui.clearControl();
            next();
          });
        });
      }
      board.mark(-1);
      sound.play("correct");
      done();
    });
  }

  QK.sanoqUi = { basePad, digitTries, choti, ustun, digitButtons, guide };
})(window);

// "Algoritm va dasturlash" bloki (26–29-o'yinlar) uchun umumiy ekran qismlari:
// katakli maydon (SVG), robot yurishi, dastur ro'yxati va buyruq tugmalari.
// Uslublari: umumiy/css/dastur.css. Mantiqi: umumiy/js/dastur.js
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, dastur: D } = QK;
  const h = ui.h;

  const S = 64; // bitta katak (SVG birligi)
  const INK = "#2B2B3A";
  const mid = (v) => v * S + S / 2;

  // ---------- Maydon qismlari (matnsiz SVG) ----------
  const stone = (x, y) => `
    <g class="stone" transform="translate(${x * S} ${y * S})">
      <path d="M14 46 Q10 30 24 22 Q38 14 48 26 Q56 36 50 46 Z" fill="#9A8F7E" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M22 40 Q28 32 36 34" stroke="#7C7266" stroke-width="3" stroke-linecap="round" fill="none"/>
    </g>`;

  const fire = (x, y) => `
    <g class="fire" transform="translate(${x * S} ${y * S})">
      <path d="M16 50 L48 42 M16 42 L48 50" stroke="#8A5A2B" stroke-width="6" stroke-linecap="round"/>
      <path d="M32 10 Q42 22 38 30 Q36 34 32 34 Q28 34 26 30 Q22 22 32 10 Z" fill="#FFC83D"/>
      <path d="M32 14 Q46 26 42 36 Q38 44 32 44 Q26 44 22 36 Q18 26 32 14 Z" fill="#F08A24" opacity="0.75"/>
    </g>`;

  const robotBody = `
    <rect x="16" y="20" width="32" height="28" rx="8" fill="#2F6FDE" stroke="${INK}" stroke-width="3"/>
    <rect x="22" y="27" width="20" height="12" rx="5" fill="#FFFFFF"/>
    <circle cx="28" cy="33" r="3" fill="${INK}"/>
    <circle cx="36" cy="33" r="3" fill="${INK}"/>
    <rect x="30" y="10" width="4" height="8" rx="2" fill="${INK}"/>
    <circle cx="32" cy="9" r="4" fill="#F08A24" stroke="${INK}" stroke-width="2.5"/>
    <rect x="10" y="30" width="6" height="10" rx="3" fill="#2F6FDE" stroke="${INK}" stroke-width="2.5"/>
    <rect x="48" y="30" width="6" height="10" rx="3" fill="#2F6FDE" stroke="${INK}" stroke-width="2.5"/>`;

  // ↻ — "yana urin" belgisi (matn emas, chizma): ochiq halqa va uchida uchburchak
  const retryMark = (x, y) => `
    <g class="mark retry" transform="translate(${mid(x)} ${mid(y)})">
      <path d="M0 -15 A15 15 0 1 1 -13 8" stroke="#F08A24" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M0 -22 L8 -15 L0 -8 Z" fill="#F08A24"/>
    </g>`;

  // ✓ — to'g'ri javob belgisi
  const okMark = (x, y) => `
    <g class="mark ok" transform="translate(${mid(x)} ${mid(y)})">
      <circle r="17" fill="#1A9E77" opacity="0.9"/>
      <path d="M-8 0 L-2 7 L9 -7" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`;

  const pickMark = (x, y) => `
    <g class="mark pick" transform="translate(${mid(x)} ${mid(y)})">
      <circle r="18" fill="none" stroke="#2F6FDE" stroke-width="5"/>
      <circle r="6" fill="#2F6FDE"/>
    </g>`;

  // ---------- Maydon ----------
  // opts: { goal: false } — gulxansiz maydon
  function fieldView(host, field, opts) {
    const o = opts || {};
    let body = "";
    for (let y = 0; y < field.h; y++) {
      for (let x = 0; x < field.w; x++) {
        body += `<rect class="cell" data-x="${x}" data-y="${y}" x="${x * S + 3}" y="${y * S + 3}" width="${S - 6}" height="${S - 6}" rx="10"/>`;
      }
    }
    field.walls.forEach((c) => { body += stone(c.x, c.y); });
    if (o.goal !== false) body += fire(field.goal.x, field.goal.y);
    body += `<g class="trail"></g><g class="marks"></g>`;
    body += `<g class="robot">${robotBody}</g>`;

    // Maydon o'lchovi CSS ga beriladi — svg katakcha shaklini saqlaydi (cho'zilmaydi)
    const wrap = h("div", { class: "field-wrap", style: `--fw:${field.w};--fh:${field.h}` });
    wrap.innerHTML = `<svg class="field" viewBox="0 0 ${field.w * S} ${field.h * S}" aria-hidden="true">${body}</svg>`;
    host.append(wrap);

    const svg = wrap.querySelector("svg");
    const robot = svg.querySelector(".robot");
    const trail = svg.querySelector(".trail");
    const marks = svg.querySelector(".marks");
    const cells = [...svg.querySelectorAll(".cell")];

    const place = (c) => robot.setAttribute("transform", `translate(${c.x * S} ${c.y * S})`);
    place(field.robot);

    const api = {
      el: wrap,
      // instant — animatsiyasiz qo'yish (boshiga qaytarish, yechimni ko'rsatish)
      set(c, instant) {
        robot.classList.toggle("jump", !!instant);
        place(c);
      },
      // Robotni yo'l bo'ylab yurgizish; onStep(k) — k-buyruq bajarilayotganda
      async walk(path, onStep) {
        api.clearMarks();
        for (let k = 1; k < path.length; k++) {
          if (onStep) onStep(k - 1);
          api.set(path[k]);
          sound.play("tak");
          await ui.sleep(340);
        }
        robot.classList.remove("jump");
      },
      // Bosib o'tilgan kataklar: nuqtalar va ularni bog'lovchi chiziq
      trail(path) {
        if (!path || path.length < 2) { trail.innerHTML = ""; return; }
        const pts = path.map((c) => `${mid(c.x)},${mid(c.y)}`).join(" ");
        const dots = path.map((c) => `<circle cx="${mid(c.x)}" cy="${mid(c.y)}" r="6" fill="#B9AFA0"/>`).join("");
        trail.innerHTML = `<polyline points="${pts}" fill="none" stroke="#B9AFA0" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>${dots}`;
      },
      // Birinchi qadam yo'nalishi (3-bosqich maslahati) — izni o'chirmaydi
      firstStep(path) {
        if (!path || path.length < 2) return;
        marks.innerHTML = `<polyline points="${mid(path[0].x)},${mid(path[0].y)} ${mid(path[1].x)},${mid(path[1].y)}" fill="none" stroke="#2F6FDE" stroke-width="6" stroke-linecap="round"/>
          <circle cx="${mid(path[1].x)}" cy="${mid(path[1].y)}" r="8" fill="#2F6FDE"/>`;
      },
      mark(cell, kind) {
        const draw = kind === "ok" ? okMark : kind === "pick" ? pickMark : retryMark;
        marks.insertAdjacentHTML("beforeend", draw(cell.x, cell.y));
      },
      clearMarks() { marks.innerHTML = ""; },
      clearTrail() { trail.innerHTML = ""; },
      // Katak tanlash (3-bosqich: "robot qayerga boradi?")
      pickCell(onPick) {
        svg.classList.add("pickable");
        const handler = (e) => {
          const c = { x: Number(e.currentTarget.dataset.x), y: Number(e.currentTarget.dataset.y) };
          sound.play("tap");
          api.clearMarks();
          api.mark(c, "pick");
          onPick(c);
        };
        cells.forEach((cell) => cell.addEventListener("click", handler));
        const stop = () => {
          svg.classList.remove("pickable");
          cells.forEach((cell) => cell.removeEventListener("click", handler));
        };
        ui.onCleanup(stop);
        return stop;
      },
    };
    return api;
  }

  // ---------- Dastur ro'yxati ----------
  // Bo'sh kataklar nuqtali; buyruq bosilsa — o'chadi (sudrash yo'q, QOIDALAR 3)
  function programList(host, opts) {
    const o = opts || {};
    const max = o.max || 8;
    let program = [];
    let locked = false;
    let onChange = null;
    const row = h("div", { class: "prog", "aria-label": "Dastur" });
    host.append(row);

    function render() {
      row.innerHTML = "";
      for (let k = 0; k < max; k++) {
        const dir = program[k];
        const slot = h("button", {
          class: "prog-slot" + (dir ? " filled" : ""),
          type: "button",
          text: dir ? D.DIRS[dir].arrow : "",
          "aria-label": dir ? `${k + 1}: ${D.DIRS[dir].name}` : `${k + 1}: boʻsh`,
          disabled: !dir || locked,
        });
        slot.addEventListener("click", () => {
          if (locked || !program[k]) return;
          sound.play("tap");
          program.splice(k, 1);
          render();
          if (onChange) onChange(api.get());
        });
        row.append(slot);
      }
    }

    const api = {
      el: row,
      get: () => program.slice(),
      full: () => program.length >= max,
      add(dir) {
        if (locked || program.length >= max) return false;
        program.push(dir);
        render();
        if (onChange) onChange(api.get());
        return true;
      },
      removeLast() {
        if (locked || !program.length) return;
        program.pop();
        render();
        if (onChange) onChange(api.get());
      },
      clear() {
        program = [];
        render();
        if (onChange) onChange(api.get());
      },
      set(list) {
        program = list.slice(0, max);
        render();
      },
      // Bajarilayotgan buyruqni belgilash (k < 0 — belgilanmaydi)
      highlight(k) {
        [...row.children].forEach((el, i) => el.classList.toggle("cur", i === k));
      },
      lock(on) {
        locked = on !== false;
        render();
        row.classList.toggle("locked", locked);
      },
      change(fn) { onChange = fn; },
    };
    render();
    return api;
  }

  // ---------- Buyruq tugmalari ----------
  // handlers: { onAdd(dir), onRun(), onBack() }
  function commandPad(host, handlers) {
    const pad = h("div", { class: "cmd-pad" });
    const buttons = {};
    D.ORDER.forEach((dir) => {
      const b = h("button", {
        class: "cmd-btn",
        type: "button",
        text: D.DIRS[dir].arrow,
        "aria-label": D.DIRS[dir].name,
      });
      b.addEventListener("click", () => {
        sound.play("tap");
        handlers.onAdd(dir);
      });
      buttons[dir] = b;
      pad.append(b);
    });

    const back = h("button", { class: "btn secondary cmd-back", type: "button", text: "⌫", "aria-label": "Oxirgi buyruqni oʻchirish" });
    back.addEventListener("click", () => { sound.play("tap"); handlers.onBack(); });
    const run = ui.button("▶︎ Ishga tushir", () => handlers.onRun());
    const extras = h("div", { class: "cmd-extras" }, back, run);
    host.append(pad, extras);

    return {
      lock(on) {
        const off = on !== false;
        Object.values(buttons).forEach((b) => { b.disabled = off; });
        back.disabled = off;
        run.disabled = off;
      },
      runButton: run,
    };
  }

  QK.dasturUi = { fieldView, programList, commandPad, CELL: S };
})(window);

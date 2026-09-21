// Sehrli qutilar: toshlar qatori, munchoqli qutilar, natija chizig'i va tugmalar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { boxes, ui, sound, art } = QK;

  const COLOR_NAME = { kok: "koʻk", sariq: "sariq" };

  // Toshlar qatori
  function stones(host, start) {
    const el = ui.h("div", { class: "stones" });
    host.append(el);
    function set(n) {
      el.innerHTML = "";
      for (let k = 0; k < n; k++) el.append(ui.h("span", { class: "stone", html: art.stone() }));
      el.setAttribute("aria-label", `${n} ta tosh`);
    }
    set(start);
    return { el, set };
  }

  // Bitta quti: sarlavha (nechta tosh) va har yurish uchun munchoqlar
  function boxCard(n, box, opts) {
    const o = opts || {};
    const card = ui.h("div", { class: "mbox" + (o.compact ? " sm" : "") });
    card.append(ui.h("div", { class: "mbox-art", html: art.box(o.open ? "open" : "closed") }));
    card.append(ui.h("div", { class: "mbox-title", text: `${n} tosh` }));
    for (const move of Object.keys(box).map(Number)) {
      const row = ui.h("div", { class: "brow" });
      const dots = ui.h("span", { class: "beads" });
      const shown = Math.min(box[move], 8);
      for (let k = 0; k < shown; k++) dots.append(ui.h("span", { class: `bead ${boxes.COLORS[move]}` }));
      row.append(dots, ui.h("span", { class: "bn", text: String(box[move]) }));
      row.setAttribute("aria-label", `${COLOR_NAME[boxes.COLORS[move]]}: ${box[move]}`);
      card.append(row);
    }
    return card;
  }

  // Toshlarni stoldan tarafga "uchirish" (nusxa yasab, joyidan joyiga suradi)
  async function flyTo(nodes, target) {
    if (!nodes.length) return;
    const quick = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (quick) {
      await ui.sleep(120);
      return;
    }
    const to = target.getBoundingClientRect();
    const clones = nodes.map((node) => {
      const box = node.getBoundingClientRect();
      const clone = node.cloneNode(true);
      clone.className = "stone flying";
      clone.style.left = `${box.left}px`;
      clone.style.top = `${box.top}px`;
      clone.style.width = `${box.width}px`;
      clone.style.height = `${box.height}px`;
      document.body.append(clone);
      node.style.visibility = "hidden";
      return { clone, box };
    });
    await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
    clones.forEach(({ clone, box }, i) => {
      const dx = to.left + to.width / 2 - (box.left + box.width / 2);
      const dy = to.top + Math.min(to.height, 24) / 2 - (box.top + box.height / 2);
      clone.style.transitionDelay = `${i * 130}ms`;
      clone.style.transform = `translate(${dx}px, ${dy}px) scale(0.62)`;
    });
    await ui.sleep(560 + nodes.length * 130);
    clones.forEach(({ clone }) => clone.remove());
  }

  // O'yin stoli: tepada navbat, o'rtada stoldagi toshlar, pastda ikki taraf (robot va bola) olgan toshlari
  function gameTable(host) {
    const turn = ui.h("div", { class: "turn", "aria-live": "polite" });
    const stonesRow = ui.h("div", { class: "stones" });
    const left = ui.h("div", { class: "left-n" });
    const sides = {};
    const makeSide = (who, label, svg) => {
      const mini = ui.h("div", { class: "mini" });
      const count = ui.h("span", { class: "tray-n", text: "0" });
      const win = ui.h("span", { class: "tray-win" });
      const side = ui.h("div", { class: "tray " + who },
        ui.h("div", { class: "tray-head" }, ui.h("span", { class: "tray-art", html: svg }), ui.h("span", { text: label })),
        mini,
        ui.h("div", { class: "tray-foot" }, count, ui.h("span", { class: "tray-lbl", text: "ta tosh" })),
        win);
      sides[who] = { side, mini, count, win, taken: 0, last: null };
      return side;
    };
    const el = ui.h("div", { class: "gtable" },
      turn,
      ui.h("div", { class: "stones-box" }, stonesRow, left),
      ui.h("div", { class: "trays" },
        makeSide("robot", "Robot", art.robot()),
        makeSide("me", "Sen", art.apprentice())));
    host.append(el);

    let onTable = 0;
    const drawStones = () => {
      stonesRow.innerHTML = "";
      for (let k = 0; k < onTable; k++) stonesRow.append(ui.h("span", { class: "stone", html: art.stone() }));
      left.textContent = `Stolda: ${onTable} ta tosh`;
      stonesRow.setAttribute("aria-label", `Stolda ${onTable} ta tosh`);
    };

    return {
      el,
      reset(n) {
        onTable = n;
        drawStones();
        for (const who of Object.keys(sides)) {
          sides[who].taken = 0;
          sides[who].last = null;
          sides[who].mini.innerHTML = "";
          sides[who].count.textContent = "0";
          sides[who].win.textContent = "";
          sides[who].side.classList.remove("winner");
        }
      },
      turn(who) {
        turn.textContent = who === "robot" ? "Navbat: Robot" : who === "me" ? "Navbat: SEN" : "";
        turn.className = "turn" + (who ? " " + who : "");
        sides.robot.side.classList.toggle("active", who === "robot");
        sides.me.side.classList.toggle("active", who === "me");
      },
      // Toshlarni olish: tosh stoldan o'sha tarafga uchib o'tadi
      async take(who, count) {
        const side = sides[who];
        const taken = [...stonesRow.children].slice(-count);
        await flyTo(taken, side.mini);
        onTable -= count;
        drawStones();
        side.taken += count;
        for (let k = 0; k < count; k++) {
          const stone = ui.h("span", { class: "stone mini-stone fresh", html: art.stone() });
          side.mini.append(stone);
          side.last = stone;
        }
        side.count.textContent = String(side.taken);
        sound.play("tap");
        await ui.sleep(260);
      },

      // O'yin tugadi: yutgan taraf va oxirgi tosh belgilanadi
      finish(who) {
        turn.textContent = who === "robot" ? "Robot yutdi!" : "Sen yutding!";
        turn.className = "turn done " + who;
        for (const key of Object.keys(sides)) {
          sides[key].side.classList.remove("active");
          sides[key].side.classList.toggle("winner", key === who);
          sides[key].win.textContent = key === who ? "Yutdi! ✓" : "";
        }
        if (sides[who].last) sides[who].last.classList.add("last");
      },
      left: () => onTable,
    };
  }

  // Qutilar qatori: faqat kerakli holatlar ko'rsatiladi
  function boxRow(host, opts) {
    const o = opts || {};
    const el = ui.h("div", { class: "mboxes" });
    host.append(el);
    const cards = {};
    return {
      el,
      set(state, list) {
        el.innerHTML = "";
        for (const n of list) {
          if (!state[n]) continue;
          const card = boxCard(n, state[n], o);
          cards[n] = card;
          el.append(card);
        }
      },
      highlight(n) {
        Object.keys(cards).forEach((k) => cards[k].classList.toggle("hl", Number(k) === n));
      },
      flash(n) {
        const card = cards[n];
        if (!card) return;
        card.classList.remove("flash");
        void card.offsetWidth;
        card.classList.add("flash");
      },
    };
  }

  // Natija chizig'i: ✓ / ✗
  function resultLine(host) {
    const el = ui.h("div", { class: "results", "aria-live": "polite" });
    host.append(el);
    let list = [];
    const render = () => {
      el.innerHTML = "";
      list.slice(-20).forEach((won) => el.append(ui.h("span", { class: "res " + (won ? "win" : "lose"), text: won ? "✓" : "✗" })));
    };
    return {
      el,
      add(won) { list.push(won); render(); },
      set(next) { list = next.slice(); render(); },
      count: () => list.filter(Boolean).length,
    };
  }

  // "1 ta ol" / "2 ta ol" tugmalari (n ga qarab)
  function moveButtons(n, onPick) {
    const row = ui.h("div", { class: "choice-row" });
    for (const move of boxes.legalMoves(n)) {
      row.append(ui.button(`${move} ta ol`, () => onPick(move), move === 2 ? "secondary" : ""));
    }
    ui.clearControl();
    ui.control().append(row);
  }

  // Javob tugmalari (matnli variantlar)
  function optionButtons(options, onPick, labels) {
    const row = ui.h("div", { class: "choice-row" });
    options.forEach((value, i) => {
      row.append(ui.button(labels ? labels(value) : String(value), () => onPick(i), i % 2 ? "secondary" : ""));
    });
    ui.clearControl();
    ui.control().append(row);
  }

  // Munchoq belgisi (savollarda)
  const beadChip = (move) => ui.h("span", { class: `bead ${boxes.COLORS[move]} big` });

  QK.boxesUi = { COLOR_NAME, stones, gameTable, boxCard, boxRow, resultLine, moveButtons, optionButtons, beadChip };
})(window);

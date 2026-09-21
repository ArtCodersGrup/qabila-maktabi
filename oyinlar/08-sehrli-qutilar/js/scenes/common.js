// Sehrli qutilar: umumiy sahna qismlari — o'yin aylanishi va mukofot.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { boxes, ui, sound, boxesUi } = QK;

  const VISIBLE = [7, 6, 5, 4, 3, 2]; // ko'rsatiladigan qutilar (1 li quti — bittagina yurish)

  function box(compact) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    ui.paper(""); // shogirdning qogʻozi bu oʻyinda kerak emas
    const el = ui.h("div", { class: "qbox" });
    ui.work().append(el);
    return el;
  }

  const answerLine = (text) => ui.h("div", { class: "answer", text });
  const line = (text) => ui.h("div", { class: "count-line", text });

  // O'yin ekrani: stol (navbat, toshlar, taraflar) va hozirgi quti
  function playScreen() {
    const el = box(true);
    const table = boxesUi.gameTable(el);
    const boxHost = ui.h("div", { class: "current-box" });
    el.append(boxHost);
    return { el, table, boxHost };
  }

  // Bitta o'yin: robot birinchi yuradi, keyin bola tanlaydi
  async function playRound(state) {
    const { table, boxHost } = playScreen();
    let n = boxes.START;
    const history = [];
    table.reset(n);
    for (;;) {
      table.turn("robot");
      boxHost.innerHTML = "";
      boxHost.append(boxesUi.boxCard(n, state[n], { open: true }));
      ui.bubble("elder", `Robot ${n} li qutidan munchoq tortmoqda…`);
      await ui.sleep(950);
      const move = boxes.pickMove(state, n, Math.random);
      history.push({ n, move });
      boxHost.innerHTML = "";
      boxHost.append(ui.h("div", { class: "pulled" },
        boxesUi.beadChip(move),
        ui.h("span", { class: "pulled-text", text: `${move} ta ol` })));
      sound.play("correct");
      ui.bubble("elder", `Robot ${boxesUi.COLOR_NAME[boxes.COLORS[move]]} munchoq tortdi — ${move} ta oladi.`);
      await ui.sleep(850);
      await table.take("robot", move);
      n -= move;
      if (n === 0) {
        boxHost.innerHTML = ""; // tortilgan munchoq oʻyin tugagach kerak emas
        table.finish("robot");
        sound.play("retry");
        ui.bubble("elder", "Oxirgi toshni robot oldi — robot yutdi!");
        await ui.sleep(1200);
        return { history, won: true };
      }
      table.turn("me");
      boxHost.innerHTML = "";
      ui.bubble("elder", `Stolda ${n} ta tosh qoldi. Sen nechta olasan?`);
      const mine = await ui.settle((done) => boxesUi.moveButtons(n, (m) => { ui.clearControl(); done(m); }));
      await table.take("me", mine);
      n -= mine;
      if (n === 0) {
        boxHost.innerHTML = ""; // tortilgan munchoq oʻyin tugagach kerak emas
        table.finish("me");
        sound.play("win");
        ui.pose("apprentice", "happy", 900);
        ui.bubble("elder", "Oxirgi toshni sen olding — sen yutding!");
        await ui.sleep(1200);
        return { history, won: false };
      }
    }
  }

  // Mukofot ekrani: qutilar to'plami va ishlatilgan munchoqlarning o'zgarishi
  async function rewardStep(state, history, won) {
    const el = box(true);
    el.append(line(won ? "Robot yutdi ✓" : "Robot yutqazdi ✗"));
    const view = boxesUi.boxRow(el, { compact: true });
    view.set(state, VISIBLE);
    for (const step of history) view.highlight(step.n);
    ui.bubble("elder", won
      ? "Robot yutdi! Ishlatgan munchoqlaridan bittadan qoʻshamiz."
      : "Robot yutqazdi. Ishlatgan munchoqlaridan bittadan olamiz.");
    await ui.settle((done) => {
      ui.control().append(ui.button(won ? "Mukofot ber" : "Munchoq ol", () => { ui.clearControl(); done(); }, "big"));
    });
    for (const step of history) {
      boxes.reward(state, [step], won);
      view.set(state, VISIBLE);
      view.highlight(step.n);
      view.flash(step.n);
      sound.play(won ? "correct" : "retry");
      await ui.sleep(620);
    }
    view.highlight(null);
    await ui.sleep(300);
  }

  QK.common = { VISIBLE, box, answerLine, line, playScreen, playRound, rewardStep };
})(window);

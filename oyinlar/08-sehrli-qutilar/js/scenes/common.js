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
    const el = ui.h("div", { class: "qbox" });
    ui.work().append(el);
    return el;
  }

  const answerLine = (text) => ui.h("div", { class: "answer", text });
  const line = (text) => ui.h("div", { class: "count-line", text });

  // Bitta o'yin: robot birinchi yuradi, keyin bola tugma bosadi
  async function playRound(state, stonesView, boxView) {
    let n = boxes.START;
    const history = [];
    stonesView.set(n);
    for (;;) {
      boxView.highlight(n);
      ui.bubble("elder", `Robot ${n} li qutini ochdi va munchoq tortmoqda…`);
      await ui.sleep(850);
      const move = boxes.pickMove(state, n, Math.random);
      history.push({ n, move });
      boxView.flash(n);
      sound.play("tap");
      n -= move;
      stonesView.set(n);
      await ui.sleep(550);
      if (n === 0) {
        sound.play("retry");
        ui.bubble("elder", `Robot ${move} ta oldi — oxirgi tosh! Robot yutdi.`);
        boxView.highlight(null);
        await ui.sleep(1000);
        return { history, won: true };
      }
      ui.bubble("elder", `Robot ${move} ta oldi. Qoldi: ${n} ta. Endi sen!`);
      boxView.highlight(null);
      const mine = await ui.settle((done) => boxesUi.moveButtons(n, (m) => { ui.clearControl(); done(m); }));
      sound.play("tap");
      n -= mine;
      stonesView.set(n);
      await ui.sleep(450);
      if (n === 0) {
        sound.play("win");
        ui.pose("apprentice", "happy", 900);
        ui.bubble("elder", "Oxirgi toshni sen olding — sen yutding!");
        await ui.sleep(1000);
        return { history, won: false };
      }
    }
  }

  // Mukofot: ishlatilgan qutilarga munchoq qo'shiladi yoki olinadi
  async function rewardStep(state, history, won, boxView) {
    ui.bubble("elder", won
      ? "Robot yutdi! Ishlatgan munchoqlaridan bittadan qoʻshamiz."
      : "Robot yutqazdi. Ishlatgan munchoqlaridan bittadan olamiz.");
    await ui.settle((done) => {
      ui.control().append(ui.button(won ? "Mukofot ber" : "Munchoq ol", () => { ui.clearControl(); done(); }, "big"));
    });
    for (const step of history) {
      boxes.reward(state, [step], won);
      boxView.set(state, VISIBLE);
      boxView.highlight(step.n);
      boxView.flash(step.n);
      sound.play(won ? "correct" : "retry");
      await ui.sleep(560);
    }
    boxView.highlight(null);
  }

  QK.common = { VISIBLE, box, answerLine, line, playRound, rewardStep };
})(window);

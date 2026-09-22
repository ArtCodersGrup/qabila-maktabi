// Oʻn barmoq: umumiy sahna qismlari — kichik mashqlar, qatorlar mashqi. Qator yozdirish — js/typing-play.js.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, typing: T, typingUi, typingPlay } = QK;
  const { box, add, waitButton, touchOnly, warn, keyboardCheck, typeLine } = typingPlay;

  const PRAISE = ["✓ Barakalla!", "✓ Zoʻr!", "✓ Toʻppa-toʻgʻri!"];

  function formula(host, rows) {
    const el = ui.h("div", { class: "formula-box" });
    rows.forEach((text) => el.append(ui.h("div", { class: "formula-row", text })));
    host.append(el);
    return el;
  }

  // Kichik mashq (ko'rsatish): aniqlik talab qilinmaydi, oxirigacha yoziladi
  async function drill(stage, { text, say }) {
    const pending = typeLine({ text, stage });
    ui.bubble("elder", say);
    await pending;
    sound.play("correct");
    ui.pose("apprentice", "happy", 700);
    await ui.sleep(600);
  }

  async function drills(stage) {
    for (const d of T.DRILLS[stage]) await drill(stage, d);
  }

  const praiseText = (st, speed) => (speed ? `Aniqlik ${st.accuracy}%, tezlik ${st.cpm} belgi/daqiqa.` : `Aniqlik ${st.accuracy}%.`);

  // Mashq: aniqligi ≥ 90% bo'lgan 3 ta qator (QOIDALAR 4.4–4.5). 1-xato — shu qator yana, 2-xato — yangi qator.
  // speed — tezlik ko'rsatiladi; record — rekord tekshiriladi
  async function lineExercises({ stage, speed, record }) {
    let correct = 0;
    let prev = null;
    ui.setProgress(3, 0);
    while (correct < 3) {
      const text = T.makeLine(stage, prev);
      prev = text;
      let ok = false;
      for (let attempt = 1; attempt <= 2 && !ok; attempt++) {
        const pending = typeLine({ text, stage });
        ui.bubble("elder", attempt === 1 ? "Yoz! Klaviaturaga emas, ekranga qara." : "Sekin va aniq yoz.");
        const { stats } = await pending;
        const card = typingUi.result(stats, { speed });
        add(ui.work().querySelector(".tbox"), card);
        ok = T.passed(stats);
        if (ok) {
          correct++;
          ui.setProgress(3, correct);
          sound.play("correct");
          ui.pose("apprentice", "happy", 900);
          const fresh = record && typingUi.saveBest(stats.cpm);
          await ui.say("elder", `${PRAISE[(correct - 1) % PRAISE.length]} ${praiseText(stats, speed)}${fresh ? " Yangi rekord!" : ""}`);
        } else {
          sound.play("retry");
          ui.pose("apprentice", "think", 1000);
          await ui.say("elder", attempt === 1
            ? `↻ Aniqlik ${stats.accuracy}% — kerak kamida ${T.PASS}%. Shoshilma, shu qatorni yana yoz.`
            : "Hechqisi yoʻq, yangi qator.");
        }
      }
    }
    ui.hideProgress();
  }

  QK.common = { PRAISE, box, add, formula, waitButton, touchOnly, warn, keyboardCheck, typeLine, drill, drills, lineExercises };
})(window);

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

  // Mashq: QK.practice.need() ta qator (4 / 5 / 6; qiyin rejimda 7). Qator hisoblanadi, agar aniqlik ≥ 90%
  // va tezlik ≥ T.minCpm(bosqich) bo'lsa (1-bosqich — talab yo'q, 2 — 60, 3 — 90 belgi/daqiqa).
  // 1-xato — shu qator yana, 2-xato — yangi qator (QOIDALAR 4.4); urinishlar practice.tries orqali —
  // yulduzlar va seriya umumiy hisobga tushadi. speed — tezlik ko'rsatiladi; record — rekord tekshiriladi
  // va sharpa (rekord tezligida yuguradigan soya) bilan poyga bo'ladi.
  async function lineExercises({ stage, speed, record }) {
    const practice = QK.practice;
    const total = practice.need();
    const min = T.minCpm(stage, practice.isHard());
    let correct = 0;
    let prev = null;
    ui.setProgress(total, 0);
    while (correct < total) {
      const text = T.makeLine(stage, prev, undefined, practice.tier(correct));
      prev = text;
      // Sharpa tezligi: rekord bo'lsa — rekord, bo'lmasa — eng kam tezlik
      const pace = record ? Math.max(typingUi.best(), min) : 0;
      let last = null;
      const ok = await practice.tries({
        setup: (submit) => {
          const go = (attempt) => {
            const pending = typeLine({ text, stage, ghost: pace ? T.ghostTimes([...text].length, pace) : null });
            ui.bubble("elder", attempt > 1 ? (last && last.reason === "speed" ? "Endi tezroq — lekin aniq yoz." : "Sekin va aniq yoz.")
              : pace ? `Yoz! Soya — ${pace} belgi/daqiqa tezlikda. Undan oʻzib ket!` : "Yoz! Klaviaturaga emas, ekranga qara.");
            pending.then(({ stats }) => {
              add(ui.work().querySelector(".tbox"), typingUi.result(stats, { speed }));
              last = Object.assign({ stats, again: () => go(2) }, T.lineResult(stats, min));
              submit(last);
            });
          };
          go(1);
        },
        check: (value) => value.ok,
        hint: (value) => {
          const st = value.stats;
          ui.say("elder", value.reason === "accuracy"
            ? `↻ Aniqlik ${st.accuracy}% — kerak kamida ${T.PASS}%. Shoshilma, shu qatorni yana yoz.`
            : `↻ Aniqlik yetarli, lekin tezlik ${st.cpm} — kerak kamida ${min} belgi/daqiqa. Shu qatorni tezroq yoz.`)
            .then(value.again);
        },
        solution: () => {},
      });
      if (ok) {
        correct++;
        ui.setProgress(total, correct);
        const fresh = record && typingUi.saveBest(last.stats.cpm);
        await ui.say("elder", `${PRAISE[(correct - 1) % PRAISE.length]} ${praiseText(last.stats, speed)}${fresh ? " Yangi rekord!" : ""}`);
      } else {
        await ui.say("elder", "Hechqisi yoʻq, yangi qator.");
      }
    }
    ui.hideProgress();
  }

  QK.common = { PRAISE, box, add, formula, waitButton, touchOnly, warn, keyboardCheck, typeLine, drill, drills, lineExercises };
})(window);

// Robotni o'rgatamiz: umumiy sahna qismlari — maydon, javob tugmalari, chiziq sozlagich, o'qitish animatsiyasi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { learn, ui, sound, learnUi, practice } = QK;

  // Ish maydoni: ixcham rejim + maydon
  function board() {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    return { box, f: learnUi.field(box) };
  }

  const line = (text) => ui.h("div", { class: "count-line", text });
  const answerLine = (text) => ui.h("div", { class: "answer", text });
  const nutName = (full) => (full ? "toʻla" : "boʻsh");

  // "To'la / Bo'sh" javobli vazifa
  const answerTask = ({ answer, hint, solution }) => practice.tries({
    setup: (submit) => learnUi.answerButtons(submit),
    check: (value) => value === answer,
    hint,
    solution,
  });

  // Chiziqni bola sozlaydi. onMove(line) — har surishdan keyin chaqiriladi.
  function lineEditor({ f, points, start, badge, extra, onMove }) {
    let current = start;
    const refresh = () => {
      QK.probe = { line: current, points }; // tekshirish uchun (brauzer sinovi)
      f.set({ points, line: current, glow: [] }); // misollar doim koʻrinib tursin
      if (badge) badge.set(learn.errorsOf(points, current));
      if (onMove) onMove(current);
    };
    learnUi.lineControls((action) => {
      current = learn.move(current, action);
      refresh();
    }, extra);
    refresh();
    return { get: () => current };
  }

  // Robotning o'qitilishi: chiziq qadamba-qadam suriladi, xato kamayadi
  async function trainAnimation(f, points, start, badge) {
    const steps = learn.train(points, start);
    for (const step of steps) {
      f.set({ line: step.line });
      if (badge) badge.set(step.errors);
      sound.play("tap");
      await ui.sleep(280);
    }
    sound.play("correct");
    return steps[steps.length - 1].line;
  }

  QK.common = { board, line, answerLine, nutName, answerTask, lineEditor, trainAnimation };
})(window);

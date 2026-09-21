// Keyingi so'z: umumiy sahna qismlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { words, ui, sound } = QK;

  function box(compact) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    const el = ui.h("div", { class: "wbox" });
    ui.work().append(el);
    return el;
  }

  const answerLine = (text) => ui.h("div", { class: "answer", text });
  const line = (text) => ui.h("div", { class: "count-line", text });

  // Robot gapni so'zma-so'z yozadi; jadvalda tegishli qator yonib turadi
  async function animateWrite(table, start, opts, rline, ptable) {
    const sentence = words.write(table, start, opts);
    rline.set([]);
    for (let i = 0; i < sentence.length; i++) {
      if (ptable) ptable.highlight(i === 0 ? sentence[0] : sentence[i - 1]);
      rline.add(sentence[i]);
      sound.play("tap");
      await ui.sleep(600);
    }
    if (ptable) ptable.highlight(null);
    sound.play("correct");
    return sentence;
  }

  QK.common = { box, answerLine, line, animateWrite };
})(window);

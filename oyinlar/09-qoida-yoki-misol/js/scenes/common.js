// Qoida yoki misol?: umumiy sahna qismlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, rules, rulesUi, practice } = QK;

  function box(compact) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = ui.h("div", { class: "rbox" });
    ui.work().append(el);
    return el;
  }

  const answerLine = (text) => ui.h("div", { class: "answer", text });
  const line = (text) => ui.h("div", { class: "count-line", text });

  // Qoida ekrani: narsalar taxtasi ish maydonida, qoida yasagich — boshqaruv zonasida (doim koʻrinadi)
  function ruleScreen(items) {
    const el = box(true);
    const view = rulesUi.board(el, items, { truth: true });
    const badge = rulesUi.errorBadge(el);
    const builder = rulesUi.ruleBuilder(ui.control(), () => {
      view.clear();
      badge.clear();
    });
    return { el, view, badge, builder };
  }

  // Qoidaning matni: "kattaligi > 5 boʻlsa — HA"
  const ruleText = (rule) => `${rules.FEATURE_NAMES[rule.feature]} ${rule.op} ${rule.value} boʻlsa — HA`;

  // Ikki qadamli vazifa (QOIDALAR 4.3): 1-qadam to'g'ri bo'lsa 2-qadam ochiladi,
  // ikkalasi to'g'ri bo'lsagina javob hisoblanadi. first / second: { setup(submit), check(qiymat) }.
  // hint(qadam, qiymat) va solution(qadam, qiymat) — bola qaysi qadamda adashganini oladi.
  function twoStep({ first, second, hint, solution }) {
    return practice.tries({
      setup: (submit) => first.setup((value) => {
        if (!first.check(value)) {
          submit({ step: 1, value });
          return;
        }
        sound.play("tap");
        ui.clearControl();
        second.setup((value2) => submit({ step: 2, value: value2 }), value);
      }),
      check: (r) => r.step === 2 && second.check(r.value),
      hint: (r) => hint(r.step, r.value),
      solution: (r) => solution(r.step, r.value),
    });
  }

  QK.common = { box, answerLine, line, ruleScreen, ruleText, twoStep };
})(window);

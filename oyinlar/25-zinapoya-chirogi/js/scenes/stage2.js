// 2-bosqich: amallar zanjiri, XOR ni yig'amiz (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, gates: G, gatesUi, common } = QK;

  const circuitView = (c) => (host) => {
    const v = gatesUi.gatesView(host, c);
    return { show: (a, b) => v.set(a, b) };
  };

  async function definition() {
    const el = common.box(false);
    gatesUi.gatesView(el, G.circuit("xorBuild")).set(1, 0);
    common.formula(el, ["Sxema — amallar zanjiri", "XOR = (A YOKI B) VA EMAS (A VA B)"]);
    await ui.say("elder", "Sxema — amallar zanjiri: chiqish — oxirgi amal natijasi.");
    await ui.say("elder", "Protsessordagi barcha sxemalar shunday zanjirlardan yigʻilgan.");
  }

  async function stage2() {
    const first = G.circuit("thenNot", "and");
    await common.explore({
      view: circuitView(first),
      out: (a, b) => G.output(first, a, b),
      heads: ["A", "B", "Chiroq"],
      intro: "Amallar zanjiri: VA ning chiqishi EMAS ga kiradi. Kalitlarni bos va simlarni kuzat.",
    });
    await ui.say("elder", "Bitta amalning chiqishi — keyingisining kirishi.");
    await ui.say("elder", `Ifoda koʻrinishida: ${G.exprText(first)}.`);

    const xor = G.circuit("xorBuild");
    await common.explore({
      view: circuitView(xor),
      out: (a, b) => G.output(xor, a, b),
      heads: ["A", "B", "Chiroq"],
      intro: "Endi YOKI, VA va EMAS dan yigʻilgan sxema. Jadvali qanday chiqadi?",
    });
    await ui.say("elder", "Jadval XOR bilan bir xil: XOR ni VA, YOKI, EMAS dan yigʻish mumkin.");
    await ui.say("elder", "«Koʻp qatlamli tarmoq» oʻyinida bitta neyron XOR ni uddalay olmagan edi. Bu yerda ham bitta amal yetmaydi — ikki qavat kerak.");
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta sxemani hisoblash.`);
    await common.exercises(2);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

// 3-bosqich: kompyuter qanday qo'shadi — yarim qo'shuvchi, hikoya (DIZAYN 7-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, art, gates: G, gatesUi, common } = QK;

  const sumOut = (a, b) => {
    const r = G.halfAdd(a, b);
    return `${r.carry}${r.sum}`;
  };

  // 7.2: qo'shish jadvalida ustunlar — XOR va VA
  async function discovery() {
    const el = common.box(false);
    const t = gatesUi.addTable(el);
    t.mark("sum");
    await ui.say("elder", "Yigʻindi ustuni: 0, 1, 1, 0 — bu XOR jadvali.");
    t.mark("carry");
    await ui.say("elder", "Koʻchirish ustuni: 0, 0, 0, 1 — bu VA jadvali.");
  }

  async function definition() {
    const el = common.box(false);
    gatesUi.gatesView(el, G.circuit("halfAdder")).set(1, 1);
    common.formula(el, ["Yigʻindi = A XOR B", "Koʻchirish = A VA B", "1 + 1 = 10"]);
    await ui.say("elder", "Bu — yarim qoʻshuvchi: ikki bitni qoʻshib, yigʻindi va koʻchirishni beradi.");
  }

  async function story() {
    let el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: art.room() }));
    await ui.say("elder", "Qayerda uchraydi: 80 yil oldingi ENIAC kompyuteri butun xonani egallagan.");
    await ui.say("elder", "Unda kalit vazifasini 17 mingga yaqin elektron lampa bajargan.");
    el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: art.chip() }));
    await ui.say("elder", "Bugun telefondagi protsessorda milliardlab tranzistor shunday sxemalarni tashkil qiladi.");
    await ui.say("elder", "Koʻp xonali sonni qoʻshishda har xonaga bitta qoʻshuvchi; koʻchirish keyingi xonaga oʻtadi — xuddi ustunda qoʻshgandek.");
  }

  async function stage3() {
    await common.explore({
      view: (host) => {
        const s = gatesUi.sumView(host);
        return { show: (a, b) => s.set(a, b) };
      },
      out: sumOut,
      heads: ["A", "B", "A + B"],
      intro: "Ikkilikda qoʻshamiz. A va B ni almashtirib, hamma holatni sinab koʻr.",
    });
    await ui.say("elder", "Ikkilikda 1 + 1 = 10 («Ikkilik hisobchi» oʻyinidagidek). Oʻngdagi raqam — yigʻindi, chapdagisi — koʻchirish.");
    await discovery();
    const adder = G.circuit("halfAdder");
    await common.explore({
      view: (host) => {
        const col = ui.h("div", { class: "col" });
        host.append(col);
        const v = gatesUi.gatesView(col, adder);
        const s = gatesUi.sumView(col);
        return { show: (a, b) => { v.set(a, b); s.set(a, b); } };
      },
      out: sumOut,
      heads: ["A", "B", "A + B"],
      intro: "Sxema: XOR — yigʻindi, VA — koʻchirish. Kalitlarni bos.",
    });
    await ui.say("elder", "Ikki chiroq ikkilik sonni koʻrsatadi: 1 + 1 = 10₂, yaʼni 2₁₀.");
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta — ikkilikda qoʻshish va qoʻshuvchi sxemasi.`);
    await common.exercises(3);
    await story();
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

// Kirish va 1-bosqich: ochiq yo'l — bola yo'ldagi tugun bo'lib, o'tayotgan xabarni o'qiydi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.yolRasm() }));
    await ui.say("elder", "Maqsad: maʼlumot yoʻlda qanday himoyalanishini tushunish — HTTP, HTTPS, 🔒 va manzilni tekshirish.");
    await ui.say("elder", "Kalit gʻoya: paket saytgacha koʻp tugundan oʻtadi va har tugun uni qoʻlga oladi. Hozir sen shu tugunlardan birisan.");
  }

  async function korsat() {
    const x = L.xabar(Math.random, 0);
    const host = common.box(true);
    host.append(common.yol(3), common.otkritka(x));
    await ui.say("elder", `Xabar ochiq koʻrinadi: login — ${x.login}, parol — ${x.parol}.`);
    await ui.say("elder", "Qulfsiz yoʻlda xabar ochiq otkritkadek: uni yoʻldagi har tugun oʻqiydi — sen ham, qolgan uchtasi ham.");
    await ui.say("elder", `Tugunlardan biri firibgar boʻlsa, parol unga ketadi. Mashq: ${QK.practice.need()} ta savol.`);
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich1Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

// Kirish va 1-bosqich: ochiq yo'l — bola yo'ldagi tugun bo'lib, o'tayotgan xabarni o'qiydi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.yolRasm() }));
    await ui.say("elder", "Paket saytga yetguncha koʻp tugundan oʻtadi. Har tugunda kimdir paketni qoʻlga oladi.");
    await ui.say("elder", "Bugun sen ham shunday tugunsan. Oldingdan kimningdir xabari oʻtadi…");
  }

  async function korsat() {
    const x = L.xabar(Math.random, 0);
    const host = common.box(true);
    host.append(common.yol(3), common.otkritka(x));
    await ui.say("apprentice", `Voy, hammasi koʻrinib turibdi! Login — ${x.login}, parol — ${x.parol}.`);
    await ui.say("elder", "Bu ochiq otkritka: qulfsiz yoʻlda yoʻldagi har tugun oʻqiydi. Sen ham, qolgan uchtasi ham.");
    await ui.say("elder", "Endi oʻylab koʻr: shu tugunlardan biri firibgar boʻlsa-chi?");
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

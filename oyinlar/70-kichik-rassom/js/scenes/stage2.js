// 2-bosqich: «Uy chizamiz» — namuna «uy» qadam-qadam: soya, ko'rsatma, avtomatik tekshiruv va «Tayyor».
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function korsat() {
    const el = common.box(false);
    el.append(QK.ui.h("div", { class: "kr-namuna-katta" }, QK.kichikRasm(L.namunaTaxta(L.namunaById("uy")), 6)));
    await ui.say("elder", "Mana shunday uy chizamiz — qadam-qadam. Avval devor, keyin tom, eshik, deraza.");
    await ui.say("elder", "Taxtada soya koʻrinadi. Aytilgan asbob va rang bilan soya ustiga chiz.");
  }

  async function stage2() {
    await korsat();
    const namuna = L.namunaById("uy");
    const qiyin = practice.isHard();
    const { savolEl, t } = common.darsTaxtasi();
    const dars = common.qadamDars(t, savolEl);
    await practice.exercises({
      need: namuna.qadamlar.length,
      next: (prev, togri) => L.qadamTask(namuna, togri, qiyin),
      run: (task) => dars.run(task),
      praise: (task) => dars.praise(task),
    });
    dars.yop();
    ui.bubble("elder", "✓ Uy tayyor! Oʻzing chizding.");
    await ui.choice([{ label: "Davom ▶︎", value: "ok" }]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

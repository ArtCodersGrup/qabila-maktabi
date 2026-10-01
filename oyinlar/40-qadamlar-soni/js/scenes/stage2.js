// 2-bosqich: o'sishga nom berish — O(1), O(log n), O(n), O(n²).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  const VAKIL = ["formula", "ikkilik", "chiziqli", "pufak"];

  // To'rt usul yonma-yon: avval nisbat o'lchanadi, keyin nom qo'yiladi
  async function nomlar() {
    const olchangan = VAKIL.map((id) => {
      const namuna = L.namunaById(id);
      return { namuna, nisbat: L.nisbat(L.olchovlar(namuna, [20, 40, 80])) };
    });
    const host = common.box(false);
    const joy = ui.h("div", {});
    host.append(joy);

    const chiz = (sinfBilan) => {
      joy.innerHTML = "";
      joy.append(common.osishGrafik(olchangan.map((x) => ({
        nom: x.namuna.nom, nisbat: x.nisbat, sinf: sinfBilan ? x.namuna.sinf : null,
      }))));
    };
    chiz(false);
    await ui.say("elder", "Toʻrt usulni oʻlchadim. Oʻsishlari toʻrt xil chiqdi.");
    await ui.say("elder", "Dasturchilar har biriga nom qoʻygan: oʻsishni bir belgida aytish uchun.");
    chiz(true);
    for (const s of L.SINFLAR) {
      ui.bubble("elder", s.nom + " — " + s.izoh + ".");
      await ui.settle((done) => ui.control().append(ui.button("Davom ▶︎", () => { ui.clearControl(); done(); })));
    }
    await ui.say("elder", "Bu belgi aniq sonni emas, oʻsishni aytadi.");
    await ui.say("apprentice", "Yaʼni n qadam ham, 2n qadam ham bir xil nom oladimi?");
    await ui.say("elder", "Ha. Ikkisi ham O(n): n ikki barobar oshsa, ikkalasi ham ikki barobar oshadi.");
  }

  async function qoida() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ...L.SINFLAR.map((s) => ui.h("div", { class: "formula-row" },
        ui.h("span", { class: "formula-nom s-" + s.id, text: s.nom }),
        ui.h("span", { text: " — " + s.izoh })))));
    await ui.say("elder", "Endi oʻzing nom ber: kodni va oʻlchovni koʻrsataman.");
  }

  async function stage2() {
    await nomlar();
    await qoida();
    await practice.exercises({
      next: (prev) => L.sinfTask(Math.random, prev),
      run: (task) => common.sinfExercise(task),
      praise: (task) => L.sinfById(task.javob).nom + " — shunday.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

// Bosqich tugashi va tabrik ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, logic: L, common } = QK;

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    ui.pose("apprentice", "happy", 1200);
    await ui.say("elder", goingOn
      ? `${s}-bosqich tugadi! Barakalla, keyingisiga oʻtamiz.`
      : `${s}-bosqich tugadi! Barakalla!`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tabriklayman! Endi oʻsishni nomi bilan aytasan.");
    // Blokning hamma o'lchovi bir joyda: namunalar o'z sinfi bilan
    const vakil = ["formula", "ikkilik", "chiziqli", "pufak"].map((id) => {
      const namuna = L.namunaById(id);
      return { nom: namuna.nom, sinf: namuna.sinf, nisbat: L.nisbat(L.olchovlar(namuna, [20, 40, 80])) };
    });
    ui.work().append(ui.h("div", { class: "story" },
      common.osishGrafik(vakil),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Qadamni sanaymiz — sekundni emas" }),
        ui.h("div", { text: "Muhimi: n ikki barobar oshsa, qadam necha barobar" }),
        ui.h("div", { text: "O(1) · O(log n) · O(n) · O(n²)" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);

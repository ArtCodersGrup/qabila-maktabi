// Bosqich tugashi va tabrik ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, art } = QK;

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    ui.pose("apprentice", "happy", 1200);
    await ui.say("elder", goingOn ? `${s}-bosqich tugadi. Keyingisi — kattaroq asoslar.` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: istalgan pozitsion tizimdan oʻnlikka oʻtkaza olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.market() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "(aₖ … a₁a₀)ᵦ = aₖ·bᵏ + … + a₀" }),
        ui.h("div", { text: "b-lik tizimda raqam < b" }),
        ui.h("div", { text: "16-lik: A = 10 … F = 15; FF = 255 = 1 bayt" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);

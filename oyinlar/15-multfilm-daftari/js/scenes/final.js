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
    const NEXT = { 1: "video hajmi va gigabayt.", 2: "siqish: faqat oʻzgargan piksellar." };
    await ui.say("elder", goingOn && NEXT[s] ? `${s}-bosqich tugadi. Keyingisi — ${NEXT[s]}` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: video hajmini hisoblay olasan va siqish nimani tejashini bilasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: art.notebook() }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Kadrlar = kadr/soniya × soniya" }),
        ui.h("div", { text: "V = 1 kadr hajmi × kadrlar soni" }),
        ui.h("div", { text: "1024 Mbayt = 1 Gbayt" }),
        ui.h("div", { text: "Siqish: 1-kadr toʻliq, keyin faqat oʻzgargani" }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);

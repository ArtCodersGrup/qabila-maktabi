// Bosqich tugashi va tabrik ekrani. 3-o'yinda finale yo'q. 2026-10-10: 5–8 ohangi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;
  const NEXT = { 1: "javobni shifrlash", 2: "kalitsiz ochish" };

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    ui.pose("apprentice", "happy", 1200);
    const text = goingOn && NEXT[s] ? `${s}-bosqich tugadi. Keyingisi — ${NEXT[s]}.` : `${s}-bosqich tugadi.`;
    await ui.say("elder", text);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    ui.closeGuide();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: Sezar shifrida shifrlay, ochib va kalitsiz buza olasan.");
    ui.work().append(ui.h("div", { class: "summary" },
      ui.h("div", { text: "Shifrlash: harf kalit k ga oldinga siljiydi" }),
      ui.h("div", { text: `Ochish: k ga orqaga; alifbo aylana (${QK.caesar.ALPHABET.length} harf)` }),
      ui.h("div", { text: `Kalitlar faqat ${QK.caesar.ALPHABET.length - 1} ta — hammasini sinab buzish mumkin` })));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);

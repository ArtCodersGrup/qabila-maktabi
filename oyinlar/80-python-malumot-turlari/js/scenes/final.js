// Bosqich tugashi va yakun ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;
  const KEYINGI = { 1: "turni oʻgirish: int(), float(), str()", 2: "roʻyxat: indeks, len(), append()" };

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    await ui.say("elder", goingOn && KEYINGI[s] ? `${s}-bosqich tugadi. Keyingisi — ${KEYINGI[s]}.` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.bubble("elder", "Tayyor: qiymat turini aniqlay olasan, turni oʻgira olasan va roʻyxat bilan ishlay olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art small", html: QK.gameArt.qutilar(true) }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "int · float · str · bool · list" }),
        ui.h("div", { text: "int(\"46\") → 46;  float(\"0.5\") → 0.5;  str(46) → \"46\"" }),
        ui.h("div", { text: "a[0] — birinchi, a[-1] — oxirgi, len(a) — soni" }),
        ui.h("div", { text: "Qayerda uchraydi: jadvaldagi har ustun — bitta belgi va bitta tur; tur notoʻgʻri boʻlsa, tahlil ham notoʻgʻri chiqadi." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);

// Bosqich tugashi va yakun ekrani.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, logic: L, common } = QK;

  const KEYINGI = { 1: "koordinatalardan holatni aniqlash qoidalari.", 2: "kadrlar ketma-ketligidan takrorlarni sanash." };

  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    await ui.say("elder", goingOn && KEYINGI[s] ? `${s}-bosqich tugadi. Keyingisi — ${KEYINGI[s]}` : `${s}-bosqich tugadi.`);
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.bubble("elder", "Tayyor: skelet koordinatalaridan holatni aniqlay olasan va kadrlardan takrorlarni sanay olasan.");
    ui.work().append(ui.h("div", { class: "story" },
      common.rasm(L.poza({ chap: "tepa", ong: "tepa" }), { kichik: true }),
      ui.h("div", { class: "summary" },
        ui.h("div", { text: "Skelet = 15 ta tayanch nuqta (keypoints), har biri (x, y); y pastga oʻsadi" }),
        ui.h("div", { text: "Holat = koordinatalar ustidagi qoida: bilak y < yelka y, tizza y − son y ≤ 8" }),
        ui.h("div", { text: "Takror = «oʻtirgan → oʻtirmagan» almashuvlari soni" }),
        ui.h("div", { class: "ah-haqiqat", text: "Cheklovlar: toʻsilgan nuqta, yorugʻlik va kamera burchagi xato beradi; model oʻquv toʻplamida kam koʻrgan tanalarda yomonroq ishlaydi; tana videosi — shaxsiy maʼlumot." }))));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, congrats });
})(window);

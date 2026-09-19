// Bosqich tugashi, final (kompyuter alifbosi: 0 va 1) va tabrik ekrani (DIZAYN.md, 8-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, art, common } = QK;
  const BITS = ["0", "1"];

  async function stageDone(s) {
    ui.setCompact(false);
    ui.clearWork();
    ui.raisePaper(false);
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    ui.pose("apprentice", "happy", 1200);
    await ui.say("elder", `${s}-bosqich tugadi! Barakalla, keyingisiga oʻtamiz.`);
  }

  async function finale() {
    ui.setCompact(false);
    ui.clearWork();
    ui.hideProgress();
    ui.raisePaper(false);
    ui.paper("");
    await ui.say("elder", "Bizning alifbomizda bir nechta harf bor edi.");
    await ui.say("elder", "Kompyuter alifbosida esa faqat 2 ta belgi bor: 0 va 1.");

    // Baraban: tak — 0, dum — 1
    const box = ui.h("div", { class: "pause-box", html: art.drum() });
    const beats = ui.h("div", { class: "beats" });
    box.append(beats);
    ui.work().append(box);
    await ui.say("apprentice", "Men chalaman: tak — 0, dum — 1. Tingla!");
    for (const b of "101") {
      ui.pose("apprentice", "drum", 200);
      sound.play(b === "0" ? "tak" : "dum");
      beats.append(ui.tile(b, Number(b), "sm"));
      await ui.sleep(450);
    }
    await ui.say("apprentice", "Men hozir «101» degan soʻzni chaldim!");

    // 0 va 1 daraxti: 3 qavat birin-ketin o'sadi (DIZAYN 8.3)
    await common.treeLevels(BITS, 3);
    await ui.say("elder", "0 va 1 dan aynan 3 belgili soʻzlar: 2³ = 8 ta.");
    await ui.say("elder", "Kompyuter koʻpincha har bir harfni 8 ta 0 yoki 1 bilan yozadi.");
    await ui.say("elder", "2⁸ = 256 xil soʻz — hamma harf va raqamlarga yetadi!");
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tabriklayman! Sen kodlash sirlarini oʻrganding!");
    ui.work().append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row", html: "Aynan i harfli: <b>a<sup>i</sup></b>" }),
      ui.h("div", { class: "formula-row", html: "i harfgacha: <b>a<sup>1</sup> + … + a<sup>i</sup></b>" }),
      ui.h("div", { class: "formula-row", text: "Eng kamida nechta harf: 1 dan boshlab sinab koʻr" })));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, finale, congrats });
})(window);

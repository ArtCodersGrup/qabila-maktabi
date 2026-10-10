// 3-bosqich: jang — robot tanklarga qarshi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common } = QK;

  async function kirish() {
    await ui.say("elder", "Robot tank ham otadi, lekin uning koʻrish masofasi 220 birlik, seniki — 300. Uzoqdan otsang, u javob berolmaydi.");
    await ui.say("elder", "radar() eng yaqin dushmangacha burchakni qaytaradi: left(radar()) tankni unga qaratadi.");
    const el = common.box(false);
    el.append(ui.h("div", { class: "tk-qoida" },
      ui.h("div", { class: "tk-qoida-nom", text: "Jangda qoʻl keladi" }),
      ui.h("div", { class: "tk-kod", text: "left(radar())" }),
      ui.h("div", { class: "tk-kod", text: "if scan() > 0: fire()" }),
      ui.h("div", { class: "tk-kod", text: "if ammo() == 0: reload()" })));
    await ui.say("elder", "Shart bitta satrda ham yoziladi: if shart: buyruq.");
  }

  async function stage3() {
    await kirish();
    for (let k = 0; k < L.VAZIFALAR.jang.length; k++) {
      ui.setProgress(L.VAZIFALAR.jang.length, k);
      await common.vazifaEkrani("jang", L.vazifa("jang", k));
      await ui.say("elder", k === 2 ? "Ikkala robot ham yiqildi." : "Dushman yiqildi. Keyingisi kuchliroq.");
    }
    ui.setProgress(L.VAZIFALAR.jang.length, L.VAZIFALAR.jang.length);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

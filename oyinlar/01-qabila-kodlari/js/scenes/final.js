// Bosqich tugashi, final (kompyuter alifbosi: 0 va 1) va tabrik ekrani (DIZAYN.md, 8-bo'lim).
// 2026-10-10: 5–8 ohangi; baraban o'rniga ish zonasida signal qatori (tovushlar o'sha: tak — 0, dum — 1).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, common } = QK;
  const BITS = ["0", "1"];
  const NEXT = { 1: "1 dan i gacha uzunlikdagi soʻzlar", 2: "kerakli harflar sonini topish" };

  // goingOn — o'yin keyingi bosqichga o'tsa true (matn shunga ishora qiladi),
  // faqat shu bosqich qayta o'ynalgan bo'lsa (M3) false — "keyingisiga" deyilmaydi
  async function stageDone(s, goingOn) {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    ui.pose("apprentice", "happy", 1200);
    const text = goingOn && NEXT[s] ? `${s}-bosqich tugadi. Keyingisi — ${NEXT[s]}.` : `${s}-bosqich tugadi.`;
    await ui.say("elder", text);
  }

  async function finale() {
    ui.setCompact(false);
    ui.clearWork();
    ui.hideProgress();
    await ui.say("elder", "Qayerda uchraydi: kompyuter alifbosida faqat 2 ta belgi bor — 0 va 1 (a = 2). Bitta belgi — 1 bit.");

    // Signal: tak — 0, dum — 1
    const box = ui.h("div", { class: "pause-box" }, ui.h("div", { class: "signal-title", text: "Signal: tak — 0, dum — 1" }));
    const beats = ui.h("div", { class: "beats" });
    box.append(beats);
    ui.work().append(box);
    await ui.say("elder", "Ikki xil signal yetarli: qisqa «tak» — 0, uzun «dum» — 1. Tingla.");
    for (const b of "101") {
      sound.play(b === "0" ? "tak" : "dum");
      beats.append(ui.tile(b, Number(b), "sm"));
      await ui.sleep(450);
    }
    await ui.say("elder", "Uzatilgan kod — «101»: uzunligi 3 bit.");

    // 0 va 1 daraxti: 3 qavat birin-ketin o'sadi (DIZAYN 8.3)
    await common.treeLevels(BITS, 3, false);
    await ui.say("elder", "a = 2, i = 3: aynan 3 bitli kodlar 2³ = 8 ta.");
    await ui.say("elder", "Matnda har bir belgi odatda 8 bit (1 bayt) bilan kodlanadi.");
    await ui.say("elder", "2⁸ = 256 xil kod — lotin harflari, raqamlar va tinish belgilariga yetadi.");
  }

  async function congrats() {
    ui.setCompact(false);
    ui.clearWork();
    sound.play("win");
    ui.pose("elder", "happy", 1500);
    ui.pose("apprentice", "happy", 1500);
    ui.bubble("elder", "Tayyor: alifbo va uzunlikdan kodlar sonini, kodlar sonidan esa kerakli harflar sonini hisoblay olasan.");
    ui.work().append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row", html: "Aynan i harfli: <b>N = a<sup>i</sup></b>" }),
      ui.h("div", { class: "formula-row", html: "1 dan i gacha: <b>N = a<sup>1</sup> + … + a<sup>i</sup></b>" }),
      ui.h("div", { class: "formula-row", text: "Kamida nechta harf: N ≥ kerakli kodlar soni boʻlgan eng kichik a" })));
    return ui.choice([
      { label: "Qayta oʻynash", value: "replay" },
      { label: "Bosh ekran", value: "home", secondary: true },
    ]);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stageDone, finale, congrats });
})(window);

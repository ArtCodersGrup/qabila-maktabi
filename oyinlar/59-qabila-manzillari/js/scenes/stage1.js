// Kirish va 1-bosqich: manzil (IP) — to'rtta son, har biri 0–255.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  async function intro() {
    const el = common.box(false);
    el.append(h("div", { class: "story-art wide", html: QK.gameArt.xarita() }));
    await ui.say("elder", "Maqsad: paket kerakli qurilmani qanday topishini tushunish — IP manzil, DNS, kesh.");
    await ui.say("elder", "Kalit gʻoya: internetda har qurilmaning sonli manzili bor — xuddi uy manzilidek. Paket shu manzil boʻyicha yetkaziladi.");
  }

  async function korsat() {
    const el = common.box(true);
    const uylar = ["10.0.3.7", "10.0.3.17", "10.0.7.3", "10.0.3.70"];
    el.append(common.konvert("10.0.3.7"));
    ui.bubble("elder", "Paketda manzil: 10.0.3.7. Qaysi uyga yetkazasan?");
    const tanlov = await ui.settle((resolve) => {
      ui.clearControl();
      ui.control().append(h("div", { class: "qm-javoblar uylar" }, ...uylar.map((m, i) => {
        const b = common.uy(m, { tugma: true, rang: i });
        b.addEventListener("click", () => resolve(m));
        return b;
      })));
    });
    ui.clearControl();
    QK.sound.play(tanlov === uylar[0] ? "correct" : "retry");
    if (tanlov !== uylar[0]) await ui.say("elder", `↻ ${tanlov} — boshqa manzil. Toʻrtala son ham mos kelishi kerak: 10.0.3.7.`);
    else await ui.say("elder", "✓ Toʻrtala son mos keldi.");
    await ui.say("elder", "Atama: IP manzil — nuqta bilan ajratilgan toʻrtta son, masalan 10.0.3.7.");
    await ui.say("elder", "Har son — 1 bayt (8 bit), shuning uchun 0 dan 255 gacha: 2⁸ − 1 = 255.");
    await ui.say("elder", `Demak, 300 yoki 256 IP manzilda boʻlmaydi. Mashq: ${QK.practice.need()} ta savol.`);
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich1Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

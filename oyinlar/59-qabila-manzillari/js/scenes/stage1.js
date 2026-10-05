// Kirish va 1-bosqich: manzil (IP) — to'rtta son, har biri 0–255.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  async function intro() {
    const el = common.box(false);
    el.append(h("div", { class: "story-art wide", html: QK.gameArt.xarita() }));
    await ui.say("elder", "Paket yoʻlga chiqdi. Lekin internetda millionlab uy bor — u qaysi uyga borishini qayerdan biladi?");
    await ui.say("apprentice", "Konvertga manzil yoziladi-ku!");
    await ui.say("elder", "Toʻgʻri. Internetda manzil — sonlar. Keling, pochtachi boʻlib koʻramiz.");
  }

  async function korsat() {
    const el = common.box(true);
    const uylar = ["10.0.3.7", "10.0.3.17", "10.0.7.3", "10.0.3.70"];
    el.append(common.konvert("10.0.3.7"));
    ui.bubble("elder", "Konvertda 10.0.3.7 deb yozilgan. Qaysi uyga eltasan?");
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
    if (tanlov !== uylar[0]) await ui.say("elder", `↻ ${tanlov} — boshqa uy. Toʻrtala son bir xil boʻlishi kerak: 10.0.3.7.`);
    else await ui.say("elder", "✓ Toʻppa-toʻgʻri! Toʻrtala son mos keldi.");
    await ui.say("elder", "Internetdagi har qurilmaning shunday manzili bor: toʻrtta son, nuqta bilan. Bu — IP manzil.");
    await ui.say("elder", "Har son — 1 bayt, shuning uchun 0 dan 255 gacha. «Bayt sandigʻi»ni esla: 8 bitda eng kattasi 255.");
    await ui.say("apprentice", "Demak 300 degan son manzilda boʻlmaydi!");
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

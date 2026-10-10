// 2-bosqich: i harfgacha so'zlar (DIZAYN.md, 5-bo'lim).
// 2026-10-10: 5–8 ohangi; baraban o'rniga ish zonasida signal qatori, qog'oz o'rniga shart kartasi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { logic, ui, sound, common } = QK;
  const AU = ["A", "U"];
  const AUF = ["A", "U", "F"];

  // 2.3: pauzasiz xabarni ikki xil tushunish mumkin (baholanmaydi)
  async function pauseScene() {
    ui.setCompact(false);
    ui.clearWork();
    const box = ui.h("div", { class: "pause-box" }, ui.h("div", { class: "signal-title", text: "Signal: A — tak, U — dum" }));
    const beats = ui.h("div", { class: "beats" });
    box.append(beats);
    ui.work().append(box);
    await ui.say("elder", "Xabarni tovush signali bilan uzatamiz: A — qisqa «tak», U — uzun «dum».");
    sound.play("tak");
    beats.append(ui.tile("A", 0, "sm"));
    await ui.sleep(300);
    sound.play("dum");
    beats.append(ui.tile("U", 1, "sm"));
    await ui.sleep(500);
    box.append(ui.h("div", { class: "pause-options" },
      ui.h("div", { class: "pause-opt" }, ui.wordChip("AU", AU), ui.h("div", { text: "bitta soʻz" })),
      ui.h("div", { class: "pause-or", text: "yoki" }),
      ui.h("div", { class: "pause-opt" },
        ui.h("div", { class: "chip-row" }, ui.wordChip("A", AU), ui.wordChip("U", AU)),
        ui.h("div", { text: "ikkita soʻz" }))));
    await ui.say("elder", "Qabul qilingan signal — «AU» bitta soʻzmi yoki «A» va «U» ikkita soʻzmi? Aniqlab boʻlmaydi.");
    await ui.say("elder", "Uzunligi har xil kodlarda soʻzlar orasiga ajratkich (pauza) kerak. Morze kodida shunday.");
  }

  // 5.2: har bir uzunlik alohida → yig'indi → umumiy formula
  async function formulaUpTo(a, i) {
    ui.setCompact(false);
    ui.clearWork();
    const box = ui.h("div", { class: "formula-box" });
    ui.work().append(box);
    for (let k = 1; k <= i; k++) {
      const text = k === 1
        ? `1 harfli: ${a}`
        : `${k} harfli: ${logic.productText(a, k)} = ${logic.countExact(a, k)}`;
      box.append(ui.h("div", { class: "formula-row", text }));
    }
    await ui.say("elder", "Har bir uzunlik k uchun soʻzlar soni aᵏ — alohida hisoblanadi.");
    const parts = [];
    for (let k = 1; k <= i; k++) parts.push(logic.countExact(a, k));
    box.append(ui.h("div", { class: "formula", text: `${parts.join(" + ")} = ${logic.countUpTo(a, i)}` }));
    await ui.say("elder", "Qoʻshish qoidasi: soʻz bir vaqtda ikki xil uzunlikda boʻlmaydi, shuning uchun sonlar qoʻshiladi.");
    box.append(ui.h("div", { class: "formula big", html: "N = a<sup>1</sup> + a<sup>2</sup> + … + a<sup>i</sup>" }));
    await ui.say("elder", "Formula: 1 dan i gacha harfli soʻzlar soni N = a¹ + a² + … + aⁱ.");
  }

  async function stage2() {
    // 2.1 — qo'lda yasash: A, U, 2 harfgacha
    ui.setCompact(false);
    ui.clearWork();
    ui.work().append(common.condCard({ letters: AU, len: common.lenText("upto", 2) }));
    await ui.say("elder", "Yangi shart: uzunlik 1 dan 2 gacha — soʻz 1 harfli ham, 2 harfli ham boʻlishi mumkin.");
    ui.bubble("elder", "Barcha soʻzlarni yasa. 1 harfli soʻz uchun bitta harf qoʻyib, «Tayyor»ni bos.");
    await common.manualWall(AU, 2, true);
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    await ui.say("elder", "1 harfli — 2 ta, 2 harfli — 4 ta: 2 + 4 = 6 ta soʻz.");

    // 2.2 — daraxtdagi hamma tugunlar
    ui.bubble("elder", "Daraxtda endi har bir tugun — alohida soʻz.");
    ui.pose("elder", "point", 2000);
    await common.treeLevels(AU, 2);
    await ui.say("elder", "1-qavat: 2 ta, 2-qavat: 4 ta. Jami 6 ta.");
    await ui.say("elder", ui.lettersLine("Alifbo (a = 3):", AUF, "Uzunlik 1 dan 3 gacha."));
    ui.bubble("elder", "Har qavatdagi soʻzlar sonini kuzat.");
    await common.treeLevels(AUF, 3);
    ui.bubble("elder", "Jami nechta soʻz?");
    const ok = await common.askUntilCorrect(39, () => {
      ui.bubble("elder", "↻ Har qavat soni tepada yozilgan — ularni qoʻsh.");
    });
    if (ok) await ui.say("elder", "3 + 9 + 27 = 39.");

    // 2.3 va formula
    await pauseScene();
    await formulaUpTo(3, 3);

    await ui.say("elder", `Mashq: ${QK.practice.need()} ta misol. Har uzunlikni aᵏ bilan hisoblab, qoʻsh.`);
    await common.exercises(2, common.stage12Spec("upto"));
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

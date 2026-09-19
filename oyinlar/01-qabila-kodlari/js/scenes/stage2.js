// 2-bosqich: i harfgacha so'zlar (DIZAYN.md, 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { logic, ui, sound, art, common } = QK;
  const AU = ["A", "U"];
  const AUF = ["A", "U", "F"];

  // 2.3: pauzasiz xabarni ikki xil tushunish mumkin (baholanmaydi)
  async function pauseScene() {
    ui.setCompact(false);
    ui.clearWork();
    ui.raisePaper(false);
    const box = ui.h("div", { class: "pause-box", html: art.drum() });
    const beats = ui.h("div", { class: "beats" });
    box.append(beats);
    ui.work().append(box);
    await ui.say("apprentice", "Barabanda xabar chalaman: A — tak, U — dum. Tingla!");
    ui.pose("apprentice", "drum", 200);
    sound.play("tak");
    beats.append(ui.tile("A", 0, "sm"));
    await ui.sleep(300);
    ui.pose("apprentice", "drum", 200);
    sound.play("dum");
    beats.append(ui.tile("U", 1, "sm"));
    await ui.sleep(500);
    box.append(ui.h("div", { class: "pause-options" },
      ui.h("div", { class: "pause-opt" }, ui.wordChip("AU", AU), ui.h("div", { text: "bitta soʻz" })),
      ui.h("div", { class: "pause-or", text: "yoki" }),
      ui.h("div", { class: "pause-opt" },
        ui.h("div", { class: "chip-row" }, ui.wordChip("A", AU), ui.wordChip("U", AU)),
        ui.h("div", { text: "ikkita soʻz" }))));
    await ui.say("elder", "Bu «AU» degan bitta soʻzmi yoki «A» va «U» degan ikkita soʻzmi? Bilib boʻlmaydi!");
    await ui.say("elder", "Soʻzlar har xil uzunlikda boʻlsa, orasiga pauza qoʻyamiz. Morze alifbosida ham shunday.");
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
    await ui.say("elder", "Har bir uzunlikni 1-bosqichdagidek alohida hisoblaymiz.");
    const parts = [];
    for (let k = 1; k <= i; k++) parts.push(logic.countExact(a, k));
    box.append(ui.h("div", { class: "formula", text: `${parts.join(" + ")} = ${logic.countUpTo(a, i)}` }));
    await ui.say("elder", "Keyin hammasini qoʻshamiz.");
    box.append(ui.h("div", { class: "formula big", html: "N = a<sup>1</sup> + a<sup>2</sup> + … + a<sup>i</sup>" }));
    await ui.say("elder", "Qoida: har bir uzunlik uchun 1-bosqichdagidek hisoblaymiz, keyin hammasini qoʻshamiz.");
  }

  async function stage2() {
    // 2.1 — qo'lda yasash: A, U, 2 harfgacha
    ui.setCompact(false);
    ui.clearWork();
    ui.paper("1–2");
    ui.raisePaper(true);
    await ui.say("elder", "Endi soʻz 1 harfli ham, 2 harfli ham boʻlishi mumkin.");
    await ui.say("apprentice", "Qogʻozimda 1–2. Demak, soʻz 2 harfgacha.");
    ui.bubble("elder", "1 harfli soʻz uchun bitta harf qoʻyib, «Tayyor»ni bos. Hammasini top!");
    await common.manualWall(AU, 2, true);
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    await ui.say("elder", "Barakalla! 2 + 4 = 6 ta soʻz.");

    // 2.2 — daraxtdagi hamma tugunlar
    ui.bubble("elder", "Daraxtga qara: endi har bir tugun — soʻz.");
    ui.pose("elder", "point", 2000);
    await common.treeLevels(AU, 2);
    await ui.say("elder", "1-qavatda 2 ta, 2-qavatda 4 ta. Hammasi 6 ta.");
    ui.paper("1–3");
    await ui.say("elder", ui.lettersLine("Endi harflar:", AUF, "Soʻz 3 harfgacha."));
    ui.bubble("elder", "Qavatlarni kuzat!");
    await common.treeLevels(AUF, 3);
    ui.bubble("elder", "Hammasi boʻlib nechta soʻz?");
    const ok = await common.askUntilCorrect(39, () => {
      ui.bubble("elder", "Har bir qavatdagi sonlarni qoʻsh: 3 + 9 + 27.");
    });
    if (ok) await ui.say("elder", "Toʻgʻri, 39 ta!");

    // 2.3 va formula
    await pauseScene();
    await formulaUpTo(3, 3);

    await ui.say("elder", "Endi oʻzing hisobla! 3 ta toʻgʻri javob — bosqich tugaydi.");
    await common.exercises(2, common.stage12Spec("upto"));
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

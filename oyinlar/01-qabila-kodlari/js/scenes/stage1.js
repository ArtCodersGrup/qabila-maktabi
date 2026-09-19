// Kirish sahnasi va 1-bosqich: aynan i harfli so'zlar (DIZAYN.md, 4-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { logic, ui, sound, common } = QK;
  const AU = ["A", "U"];
  const AUF = ["A", "U", "F"];

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.paper("");
    await ui.say("elder", "Salom! Men qabila oqsoqoliman.");
    await ui.say("elder", "Qabilamizda endigina yozuv paydo boʻldi. Lekin alifbomizda bir nechta harf bor, xolos.");
    await ui.say("apprentice", "Har bir narsaga nom kerak. Nechta soʻz yasay olamiz? Keling, bilib olamiz!");
  }

  // 4.2: kataklar → ko'paytma → daraja → ta'rif → umumiy formula
  async function formulaExact(a, i) {
    ui.setCompact(false);
    ui.clearWork();
    const n = logic.countExact(a, i);
    const box = ui.h("div", { class: "formula-box" }, common.variantSlots(a, i));
    ui.work().append(box);
    await ui.say("elder", `Har bir katakka ${a} xil harf qoʻyish mumkin.`);
    box.append(ui.h("div", { class: "formula", text: `${logic.productText(a, i)} = ${n}` }));
    await ui.say("elder", "Shuning uchun ularni koʻpaytiramiz.");
    box.append(ui.h("div", { class: "formula", html: `Qisqacha: ${a}<sup>${i}</sup> = ${n}` }));
    await ui.say("elder", `${a} ni ${i} marta koʻpaytirish qisqacha ${a}${ui.sup(i)} deb yoziladi.`);
    box.append(
      ui.h("div", { class: "formula big", html: "N = a<sup>i</sup>" }),
      ui.h("div", { class: "legend", text: "a — harflar soni, i — soʻz uzunligi, N — soʻzlar soni" }));
    await ui.say("elder", "Qoida: alifboda nechta harf boʻlsa, shu sonni soʻz uzunligicha marta koʻpaytiramiz.");
  }

  async function stage1() {
    // 1.1 — qo'lda yasash: A, U, aynan 2 harfli
    ui.setCompact(false);
    ui.clearWork();
    ui.paper("2");
    ui.raisePaper(true);
    await ui.say("elder", ui.lettersLine("Alifbomizda 2 ta harf bor:", AU));
    await ui.say("apprentice", "Qogʻozimda 2 yozilgan. Demak, soʻz aynan 2 harfli boʻladi.");
    ui.bubble("elder", "Harflarni bosib soʻz yasa. Hammasini top!");
    await common.manualWall(AU, 2, false);
    sound.play("win");
    ui.pose("elder", "happy", 1200);
    await ui.say("elder", "Barakalla! 2 ta harfdan aynan 2 harfli 4 ta soʻz chiqdi.");

    // 1.2 — qo'lda yasash + daraxt: A, U, F
    await ui.say("elder", ui.lettersLine("Endi harflar 3 ta:", AUF));
    ui.bubble("elder", "Soʻz yasagan sari daraxt rangga kiradi. Hammasini top!");
    await common.manualTree(AUF, 2);
    sound.play("win");
    await ui.say("elder", "Ajoyib, 9 ta soʻz! Har bir shox yana 3 taga boʻlinadi.");

    // 1.3 — daraxt o'sadi: aynan 3 harfli
    ui.paper("3");
    await ui.say("apprentice", "Qogʻozimda endi 3. Soʻz aynan 3 harfli!");
    ui.bubble("elder", "Hammasini yasash uzoq. Daraxtga qara!");
    ui.pose("elder", "point", 2000);
    await common.growTree(AUF, 3);
    ui.bubble("elder", "Nechta soʻz boʻldi?");
    const ok = await common.askUntilCorrect(27, () => {
      ui.bubble("elder", "9 ta bargning har biridan 3 ta yangi barg chiqdi. Nechta boʻldi?");
    });
    if (ok) await ui.say("elder", "Toʻgʻri, 27 ta!");

    await formulaExact(3, 3);

    await ui.say("elder", "Endi oʻzing hisobla! 3 ta toʻgʻri javob — bosqich tugaydi.");
    await common.exercises(1, common.stage12Spec("exact"));
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

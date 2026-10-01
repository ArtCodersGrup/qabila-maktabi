// Kirish va 1-bosqich: o'rin almashtirish — n!.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, sanash: S, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.qator() }));
    await ui.say("elder", "Uch bola suratga tushmoqchi. Qatorga turish kerak.");
    await ui.say("apprentice", "Kim oldinda tursa ekan? Nechta tartib bor oʻzi?");
    await ui.say("elder", "Oldingi oʻyindagi qoida shu yerda ham ishlaydi — har oʻrin bitta qadam.");
  }

  // Hamma tartibni yozib chiqamiz: 3 ta bola — 6 ta tartib
  async function uchta() {
    const list = L.tartiblar(3);
    const host = common.box(true);
    host.append(common.note("Uch bolaning hamma tartiblari:"));
    const joy = ui.h("div", {});
    host.append(joy);
    for (let k = 1; k <= list.length; k++) {
      joy.innerHTML = "";
      joy.append(common.tartibRoyxat(list, k));
      if (k === 1 || k === 3 || k === list.length) {
        ui.bubble("elder", k === list.length ? "Boʻldi — " + list.length + " ta tartib." : k + " ta yozildi, davom etamiz.");
        await ui.settle((done) => ui.control().append(ui.button("Davom ▶︎", () => { ui.clearControl(); done(); })));
      } else {
        await ui.sleep(220);
      }
    }
    await ui.say("elder", "Endi sanaymiz: birinchi oʻringa necha xil bola turishi mumkin?");
    const javob = await ui.choice([
      { label: "3 xil", value: 3 },
      { label: "2 xil", value: 2 },
      { label: "1 xil", value: 1 },
    ]);
    if (javob !== 3) ui.toast("Uchala bola ham birinchi turishi mumkin — 3 xil.");
    await ui.say("elder", "Birinchi oʻrin band boʻldi. Ikkinchi oʻringa nechta bola qoldi?");
    const javob2 = await ui.choice([
      { label: "2 ta", value: 2 },
      { label: "3 ta", value: 3 },
    ]);
    if (javob2 !== 2) ui.toast("Bittasi qatorda turibdi — 2 ta qoldi.");
    const el = common.box(true);
    el.append(common.qadamChiplar(L.qadamlar(3)));
    el.append(common.hisobQator("3 × 2 × 1 = 6"));
    await ui.say("elder", "Mana shu — koʻpaytirish qoidasi, faqat har qadamda bittadan kam.");
  }

  async function nomlash() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "n! = n × (n−1) × … × 2 × 1" }),
      ui.h("div", { class: "formula-row", text: "«n faktorial» deb oʻqiladi" }),
      ui.h("div", { class: "formula-row", text: "4! = 4 × 3 × 2 × 1 = 24" })));
    await ui.say("elder", "Bu belgi — undov emas, faktorial. 4 ta bola uchun 24 ta tartib.");
    await ui.say("apprentice", "Bir bola qoʻshilsa, javob 4 barobar koʻpaydi!");
  }

  async function stage1() {
    await uchta();
    await nomlash();
    await practice.exercises({
      next: (prev) => L.faktTask(Math.random, prev),
      run: (task) => common.faktExercise(task),
      praise: (task) => task.hisob,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

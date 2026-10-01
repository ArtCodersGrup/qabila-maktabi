// Kirish va 1-bosqich: qadamni o'lchash, o'sishni bashorat qilish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.osish() }));
    await ui.say("elder", "Ikki kod bitta ishni bajaradi. Qaysi biri yaxshiroq?");
    await ui.say("apprentice", "Soat bilan oʻlchaymiz — qaysi biri tez bitsa, oʻshasi.");
    await ui.say("elder", "Soat aldaydi. Mening kompyuterim tez, seningda sekin — javob har xil chiqadi.");
    await ui.say("elder", "Shuning uchun biz qadamni sanaymiz. «Izlash» va «Saralash» oʻyinlarida shuni qilgan edik.");
    await ui.say("elder", "Bugun esa eng muhim savol: maʼlumot koʻpaysa, qadam qanday oʻsadi?");
  }

  // Bitta kod ko'z oldida o'lchanadi: jadval qator-qator to'ladi
  async function olchovKorsat() {
    const namuna = L.namunaById("yigindi");
    const host = common.box(true);
    host.append(common.kodKorsat(namuna));
    const joy = ui.h("div", {});
    host.append(joy);
    const olchov = [];
    for (const n of [10, 20, 40]) {
      olchov.push({ n, qadam: L.olcha(namuna.kod(n)).qadam });
      joy.innerHTML = "";
      joy.append(common.olchovJadval(olchov));
      const oxirgi = olchov[olchov.length - 1];
      ui.bubble("elder", "n = " + n + " uchun " + oxirgi.qadam + " qadam.");
      await ui.settle((done) => ui.control().append(ui.button(n === 40 ? "Koʻrdim ▶︎" : "Yana oʻlcha ▶︎", () => { ui.clearControl(); done(); })));
    }
    await ui.say("elder", "Sonlarga emas, oʻsishga qara: n ikki barobar oshdi — qadam ham ikki barobar.");
    await ui.say("apprentice", "Demak keyingisini oʻlchamasdan ham aytsam boʻladi!");
    await ui.say("elder", "Shuni sinaymiz. Ikki oʻlchov beraman — uchinchisini oʻzing ayt.");
  }

  async function stage1() {
    await olchovKorsat();
    await practice.exercises({
      next: (prev) => L.bashoratTask(Math.random, prev),
      run: (task) => common.bashoratExercise(task),
      praise: () => "Oʻsishni toʻgʻri koʻrdingiz.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

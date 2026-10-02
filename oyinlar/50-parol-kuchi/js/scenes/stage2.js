// 2-bosqich: qancha vaqt ketadi va qaysi parol kuchli.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, sanash: S, common, practice } = QK;

  async function tezlik() {
    const el = common.box(true);
    el.append(common.note("Oddiy kompyuter sekundiga 1 million parolni sinab koʻradi."));
    el.append(ui.h("div", { class: "pk-jadval" },
      ...[["4 xonali PIN", 10, 4], ["6 ta kichik harf", 26, 6], ["10 ta kichik harf", 26, 10]].map(([nom, a, n]) =>
        ui.h("div", { class: "pk-qator" },
          ui.h("span", { class: "pk-nom", text: nom }),
          ui.h("span", { class: "pk-son", text: S.chiroyli(S.takrorli(a, n)) }),
          ui.h("b", { class: "pk-vaqt-son", text: L.vaqtMatni(L.vaqt(S.takrorli(a, n), 1000000n)) })))));
    await ui.say("elder", "PIN — bir soniyadan kam. Oltita harf — besh daqiqa. Oʻnta harf — toʻrt yil.");
    await ui.say("apprentice", "Demak har qoʻshilgan harf vaqtni 26 barobar koʻpaytiradi!");
    await ui.say("elder", "Toʻppa-toʻgʻri. Shuning uchun uzunlik eng muhim narsa.");
  }

  const keyingi = (prev, togri, tier) => (togri % 2 === 0 ? L.vaqtTask(Math.random, prev, tier) : L.qiyosTask(Math.random, prev, tier));

  async function stage2() {
    await tezlik();
    await practice.exercises({
      next: (prev, togri, tier) => keyingi(prev, togri, tier),
      run: (task) => (task.tur === "qiyos" ? common.qiyosExercise(task) : common.vaqtExercise(task)),
      praise: (task) => (task.tur === "qiyos" ? "Uzun va lugʻatda yoʻq parol — eng kuchlisi." : task.hisob),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

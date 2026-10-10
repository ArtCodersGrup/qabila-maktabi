// 2-bosqich: qancha vaqt ketadi va qaysi parol kuchli.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, sanash: S, common, practice } = QK;

  async function tezlik() {
    const el = common.box(true);
    el.append(common.note("Oddiy kompyuter soniyasiga 1 million parolni sinaydi. Vaqt = variantlar ÷ 1 000 000 s."));
    el.append(ui.h("div", { class: "pk-jadval" },
      ...[["4 xonali PIN", 10, 4], ["6 ta kichik harf", 26, 6], ["10 ta kichik harf", 26, 10]].map(([nom, a, n]) =>
        ui.h("div", { class: "pk-qator" },
          ui.h("span", { class: "pk-nom", text: nom }),
          ui.h("span", { class: "pk-son", text: S.chiroyli(S.takrorli(a, n)) }),
          ui.h("b", { class: "pk-vaqt-son", text: L.vaqtMatni(L.vaqt(S.takrorli(a, n), 1000000n)) })))));
    await ui.say("elder", "PIN — bir soniyadan kam, 6 ta harf — taxminan 5 daqiqa, 10 ta harf — taxminan 4 yil.");
    await ui.say("elder", "Har qoʻshilgan harf variantlarni, demak vaqtni ham, 26 barobar oshiradi: 26ⁿ⁺¹ = 26ⁿ · 26.");
    await ui.say("elder", `Shuning uchun uzunlik — eng muhim omil. Mashq: ${QK.practice.need()} ta savol.`);
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

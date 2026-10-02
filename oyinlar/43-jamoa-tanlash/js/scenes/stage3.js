// 3-bosqich: kod "tartib muhim emas" ni qanday yozadi (i < j < k).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, sanash: S, common, practice } = QK;

  async function kodKorsat() {
    const kod = L.juftKod(5);
    const host = common.box(true);
    host.append(common.note("5 ta nuqtadan nechta chiziq chiqadi? Dastur sanaydi:"));
    host.append(U.codeBlock(kod));
    const chiqish = U.output({ title: "Chiqish" });
    host.append(chiqish.el);
    await ui.say("elder", "Diqqat: ichki sikl «i + 1» dan boshlanadi. Shuning uchun har juftlik bir marta sanaladi.");
    await ui.settle((done) => ui.control().append(ui.button("▶︎ Ishga tushir", () => {
      chiqish.show(QK.kod.run(kod));
      ui.clearControl();
      done();
    }, "big")));
    host.append(common.hisobQator("C(5,2) = 10"));
    await ui.say("apprentice", "Agar «range(n)» deb yozsam nima boʻladi?");
    await ui.say("elder", "Har juftlik ikki marta sanaladi va nuqta oʻzi bilan ham tutashadi — javob xato chiqadi.");
  }

  async function katta() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "jt-misollar" },
      ui.h("div", { class: "jt-misol" }, ui.h("b", { text: String(S.C(36, 6)) }), ui.h("span", { text: "36 tadan 6 ta (lotereya)" })),
      ui.h("div", { class: "jt-misol" }, ui.h("b", { text: String(S.C(52, 5)) }), ui.h("span", { text: "52 ta kartadan 5 ta" })),
      ui.h("div", { class: "jt-misol" }, ui.h("b", { text: String(S.C(20, 10)) }), ui.h("span", { text: "20 boladan 10 kishilik jamoa" }))));
    await ui.say("elder", "Formula katta sonlarda ham darhol javob beradi — sanab chiqishning hojati yoʻq.");
  }

  function keyingi(prev, togri, tier) {
    return togri % 2 === 0 ? L.kodTask(Math.random, prev, tier) : L.writeTask(Math.random, prev, tier);
  }

  async function stage3() {
    await kodKorsat();
    await katta();
    await ui.say("elder", "Endi oʻzing: kodni oʻqiysan, keyin yozasan.");
    await practice.exercises({
      next: (prev, togri, tier) => keyingi(prev, togri, tier),
      run: (task) => (task.tur === "yoz" ? common.yozishExercise(task) : common.kodExercise(task)),
      praise: (task) => (task.tur === "yoz" ? "Funksiya toʻgʻri sanadi." : task.hisob),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

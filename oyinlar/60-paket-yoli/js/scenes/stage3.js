// 3-bosqich: so'rov va javob — mijoz so'raydi, server fayllarni birma-bir yuboradi, sahifa yig'iladi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;
  const kut = (ms) => new Promise((ok) => setTimeout(ok, ms));

  async function korsat() {
    const host = common.box(true);
    host.append(h("div", { class: "py-mijoz-server" },
      h("div", { class: "py-rol" }, h("span", { class: "py-rol-rasm", html: QK.gameArt.noutbuk() }), h("b", { text: "Sen" })),
      h("div", { class: "py-strelka", text: "⇄" }),
      h("div", { class: "py-rol" }, h("span", { class: "py-rol-rasm", html: QK.gameArt.server() }), h("b", { text: "Sayt egasining kompyuteri" }))));
    await ui.say("elder", "Sayt — boshqa kompyuterda saqlangan fayllar. Brauzer ularni soʻraydi, u kompyuter javob beradi.");
    ui.bubble("elder", "Manzilni bos va sahifa qanday yigʻilishini kuzat.");
    await ui.choice([{ label: "kelajagim.uz ni ochish", value: "ok" }]);
    const joy = h("div", {});
    host.append(joy);
    const kelgan = [];
    for (const qism of ["sahifa", "uslub", "shrift", "rasm"]) {
      kelgan.push(qism);
      joy.innerHTML = "";
      joy.append(common.sahifa(kelgan));
      QK.sound.play("tap");
      await kut(650);
    }
    await ui.say("elder", "4 ta soʻrov ketdi: sahifa, uslub, shrift, rasm. Har fayl alohida javob boʻlib keldi.");
    await ui.say("elder", "Atama: soʻrov yuboradigan tomon — mijoz, javob beradigan kompyuter — server.");
    joy.innerHTML = "";
    joy.append(common.sahifa(["sahifa", "uslub", "shrift"]));
    await ui.say("elder", `Bitta fayl (rasm) kelmasa, sahifa baribir ochiladi — faqat oʻsha joy boʻsh qoladi. Mashq: ${QK.practice.need()} ta savol.`);
  }

  async function stage3() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich3Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

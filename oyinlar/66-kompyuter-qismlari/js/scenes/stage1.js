// Kirish va 1-bosqich: qismlar va nomlari — bola stol ustidagi kompyuterning har qismini bosib tanishadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  async function intro() {
    const el = common.box(true);
    el.append(common.stol().el);
    await ui.say("elder", "Qabilamizga yangi narsa keldi. Bu — kompyuter!");
    await ui.say("apprentice", "Voy, uning qismlari koʻp ekan! Qaysi biri nima qiladi?");
  }

  // Bola har qismni bosadi — oqsoqol nomini va ishini aytadi. Hammasi bosilgach «Davom» tugmasi paydo bo'ladi.
  // Javob pufakda chiqadi: u har qanday ekranda ko'rinib turadi (yotiq telefonda rasm osti ko'rinmay qoladi)
  // va «Davom» talab qilmaydi — bu hikoya emas, bolaning bosishiga javob.
  function tanishuv() {
    const el = common.box(true);
    const { el: rasm, joylar } = common.stol({ bosiladi: true });
    const jami = L.QISMLAR.length;
    const sanoq = h("div", { class: "kq-sanoq", "aria-live": "polite", text: `0 / ${jami}` });
    rasm.append(sanoq);
    el.append(rasm);
    const topildi = new Set();
    return ui.settle((done) => {
      for (const q of L.QISMLAR) {
        const joy = joylar[q.id];
        joy.addEventListener("click", () => {
          QK.sound.play("tap");
          Object.values(joylar).forEach((j) => j.classList.remove("tanlangan"));
          joy.classList.add("tanlangan", "topildi");
          joy.setAttribute("aria-label", q.nom);
          ui.bubble("elder", `Bu — ${L.kichik(q.nom)}. U ${q.ish}.`);
          const oldin = topildi.size;
          topildi.add(q.id);
          sanoq.textContent = `${topildi.size} / ${jami}`;
          if (oldin < jami && topildi.size === jami) {
            QK.sound.play("correct");
            ui.control().append(ui.button("Davom ▶︎", done));
          }
        });
      }
    });
  }

  async function korsat() {
    const kutish = tanishuv();
    ui.bubble("elder", "Har bir qismni bosib koʻr. Men nomini va ishini aytaman.");
    await kutish;
    ui.clearControl();
    await ui.say("elder", "✓ Hammasini topding! Kompyuter shu qismlardan yigʻilgan.");
    await ui.say("elder", `Endi sinaymiz. ${QK.practice.need()} ta toʻgʻri javob kerak.`);
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

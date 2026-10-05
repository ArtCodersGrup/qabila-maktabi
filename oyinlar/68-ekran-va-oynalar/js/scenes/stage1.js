// Kirish va 1-bosqich: ish stoli va belgilar — belgini ikki marta bossang, dastur ochiladi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.kompyuter() }));
    await ui.say("elder", "Qabilamizga kompyuter keldi! Kel, ekranini birga koʻramiz.");
    await ui.say("apprentice", "Voy, ekranda kichkina rasmchalar bor ekan!");
  }

  // Avval qildir: bola belgini ikki marta bosib dasturni ochadi. Keyin nomlar: ish stoli, belgi, dastur.
  async function korsat() {
    const el = common.box(true);
    const belgilar = ["rasm", "musiqa", "matn"];
    const st = common.stol({ belgilar });
    el.append(st.el);
    ui.bubble("elder", "Yonib turgan rasmchani ikki marta tez bos.");
    await common.qildir(st, { amal: "och", dastur: "rasm" }, {
      yorit: [{ nima: "belgi", dastur: "rasm" }],
      eslat: "↻ Yonib turgan rasmchani top. Uni ikki marta tez bos.",
    });
    await ui.say("elder", "✓ Dastur ochildi! Uning nomi — «Rasm».");
    // Oyna tor ekranda belgilarni to'sib qo'yadi — nom berishdan oldin ish stoli yana bo'sh ko'rinadi
    st.qoy(L.bosh());
    st.yorit(belgilar.map((d) => ({ nima: "belgi", dastur: d })));
    await ui.say("elder", "Bu ekran — ish stoli. Undagi rasmchalar — belgilar.");
    await ui.say("elder", "Har belgi — bitta dastur. Ikki marta tez bossang, u ochiladi.");
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

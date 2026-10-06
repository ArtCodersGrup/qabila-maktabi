// Kirish va 1-bosqich: asboblar — bola qalam, to'rtburchak, chelak va bekorni o'zi sinab ko'radi, keyin mashq.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice, sound } = QK;
  const h = ui.h;

  async function intro() {
    const el = common.box(false);
    el.append(h("div", { class: "story-art wide", html: QK.gameArt.kompyuter() }));
    await ui.say("elder", "Qabilaga kompyuter keldi. Unda rasm ham chizsa boʻladi!");
    await ui.say("apprentice", "Men uy chizmoqchiman! Qanday chizaman?");
  }

  // Ko'rsatish: 4 harakat, har biri bola o'zi qilgach nomlanadi (QOIDALAR 4.1). Boshqa asbob ishlatilsa — eslatma, jarima yo'q.
  async function korsat() {
    const host = common.box(true);
    host.append(common.savol("Sinab koʻr"));
    let kutilgan = null;
    let done = null;
    const t = common.taxtaQoy(host, {
      amallar: ["bekor", "qaytar"],
      onHarakat(hr) {
        if (!kutilgan) return;
        if (hr.asbob === kutilgan) { done(); return; }
        if (L.TARIX_AMAL.includes(hr.asbob)) return;
        ui.bubble("elder", `↻ Hozir ${L.asbobNomi(kutilgan)} bilan sina.`);
      },
    });
    const kut = (asbob) => ui.settle((d) => { kutilgan = asbob; done = () => { kutilgan = null; d(); }; });

    ui.bubble("elder", "Qalam tanlangan. Taxtada barmogʻing yoki sichqoncha bilan sur.");
    await kut("qalam");
    sound.play("correct");
    t.yorit("asbob", "tortburchak");
    ui.bubble("elder", "✓ Bu — qalam: qayerdan sursang, oʻsha katak boʻyaladi. Endi toʻrtburchakni tanla, rang tanla va bosib sur.");
    await kut("tortburchak");
    sound.play("correct");
    t.yorit("asbob", "chelak");
    ui.bubble("elder", "✓ Toʻrtburchak chiqdi! Endi chelakni tanla va toʻrtburchakning ichini bos.");
    await kut("chelak");
    sound.play("correct");
    t.yorit("amal", "bekor");
    ui.bubble("elder", "✓ Chelak ichini toʻldiradi. Endi «Bekor» tugmasini bos.");
    await kut("bekor");
    sound.play("correct");
    t.qulfla(true);
    await ui.say("elder", "✓ «Bekor» oxirgi ishni qaytaradi. Xato qilsang — qoʻrqma, «Bekor» bor!");
    await ui.say("elder", `Endi mashq: aytilgan shaklni aytilgan rangda chiz. ${practice.need()} ta toʻgʻri boʻlsa — keyingi bosqich.`);
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich1Task(Math.random, prev, togri, tier),
      run: (task) => common.asbobExercise(task),
      praise: (task) => common.asbobPraise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

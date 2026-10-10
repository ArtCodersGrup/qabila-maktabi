// 3-bosqich: xato ovi va o'zing yoz. Oxirida — Python nomi haqida hikoya.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  // Ko'rsatish: xato xabarini birga o'qiymiz
  async function readError() {
    const broken = 'print("Salom qabila!"';
    const el = common.box();
    el.append(common.note("Bu kod ishlamaydi. Nima deyilganini oʻqi:"));
    el.append(U.codeBlock(broken, { numbers: false }));
    const out = U.output({ title: "Chiqish" });
    const result = K.run(broken);
    out.show(result, broken);
    el.append(out.el);
    await ui.say("elder", "Xato xabari joyni koʻrsatadi: satr raqami va belgi.");
    await ui.say("elder", "Xato xabari — maslahat: dasturchilar uni har kuni oʻqiydi.");
  }

  // Birga tuzatamiz
  async function fixTogether() {
    const task = { type: "xato-top", code: 'print("Salom qabila!"', solution: 'print("Salom qabila!")', why: "qavs yopilmagan" };
    const el = common.box();
    el.append(common.note("Yopilmagan qavsni qoʻy va ishga tushir."));
    const say = common.liveNote(el);
    await ui.settle((done) => {
      common.bench(el, {
        code: task.code,
        onRun: (result, code) => {
          if (K.check(task, code).ok) done();
          else say("↻ Hali ishlamadi. Qavs oxirida yopilishi kerak.");
        },
      });
    });
    await ui.say("elder", "Xato bitta belgida edi — yopuvchi qavs yetmagan.");
  }

  // Hikoya: Python nomi qayerdan kelgan
  async function story() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: QK.gameArt.snake() }));
    await ui.say("elder", "Qayerda uchraydi: Python tilini 1991-yilda Gvido van Rossum yaratgan.");
    await ui.say("elder", "Nomi ilondan emas — «Monti Payton» komediya shousidan olingan.");
    await ui.say("elder", "Bugun Python sunʼiy intellekt, maʼlumotlar tahlili va veb-serverlarda keng ishlatiladi.");
  }

  async function stage3() {
    await readError();
    await fixTogether();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta — goh xatoni tuzatasan, goh kodni oʻzing yozasan.`);
    await practice.exercises({
      next: (prev, correct, tier) => L.stage3Task(Math.random, prev, tier),
      run: (task) => common.stage3Exercise(task),
      praise: (task) => (task.type === "xato-top" ? "Xatoni topding." : "Kodni oʻzing yozding."),
    });
    await story();
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

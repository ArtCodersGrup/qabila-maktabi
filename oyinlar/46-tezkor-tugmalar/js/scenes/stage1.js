// Kirish va 1-bosqich: nusxa olish uchligi (Ctrl + C, V, X) va bekor qilish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function intro() {
    await ui.keyboardCheck("Bu oʻyin tugmalar haqida — klaviatura kerak. Uni kompyuterda och.");
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.tugmalar() }));
    await ui.say("elder", "Shogird matnni koʻchirish uchun har harfni qayta terayotgan ekan.");
    await ui.say("apprentice", "Boshqa yoʻli bormi? Uzoq boʻlyapti.");
    await ui.say("elder", "Bor. Ikki tugma — va butun matn koʻchadi. Bular tezkor tugmalar.");
  }

  async function uchlik() {
    const el = common.box(false);
    el.append(common.kartalar(["copy", "paste", "cut"].map(L.amalById)));
    await ui.say("elder", "Uchtasi birga ishlaydi: nusxa ol, keyin qoʻy. Kesib olsang — joyidan oʻchadi.");
    await ui.say("elder", "Harflar inglizcha soʻzdan: C — copy, V — qoʻyish, X — qaychi.");
    const el2 = common.box(false);
    el2.append(common.kartalar(["undo", "all"].map(L.amalById)));
    await ui.say("elder", "Yana ikkitasi: Ctrl + A hammasini belgilaydi, Ctrl + Z esa xatoni qaytaradi.");
    await ui.say("apprentice", "Demak notoʻgʻri oʻchirsam ham qoʻrqmasam boʻladi!");
  }

  async function stage1() {
    await uchlik();
    await ui.say("elder", "Endi oʻzing ayt: bu birikma nima qiladi?");
    await practice.exercises({
      next: (prev, togri, tier) => L.tanishTask(Math.random, prev, tier >= 1 ? undefined : "nusxa"), // 3-javobdan barcha tugmalar aralash
      run: (task) => common.tanishExercise(task),
      praise: (task) => L.yozuv(task.amal) + " — " + task.amal.nom,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

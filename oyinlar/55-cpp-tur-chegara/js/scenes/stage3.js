// 3-bosqich: masalaga qarab turni tanlash — olimpiadaning birinchi qadami.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function qoida() {
    const el = common.box(false);
    el.append(common.note("Turni tanlashdan oldin bitta savol: eng katta javob qancha boʻlishi mumkin?"));
    el.append(ui.h("div", { class: "cpp-qolip" },
      ui.h("div", { class: "cpp-qolip-qator" },
        ui.h("code", { class: "cpp-kod", text: "2 · 10⁹ gacha" }), ui.h("span", { class: "cpp-izoh", text: "int yetadi" })),
      ui.h("div", { class: "cpp-qolip-qator" },
        ui.h("code", { class: "cpp-kod", text: "undan katta" }), ui.h("span", { class: "cpp-izoh", text: "long long kerak" })),
      ui.h("div", { class: "cpp-qolip-qator" },
        ui.h("code", { class: "cpp-kod", text: "kasr kerak" }), ui.h("span", { class: "cpp-izoh", text: "double kerak" }))));
    await ui.say("elder", "Masalaning shartida chegaralar yoziladi: n ≤ 100 000, har bir son ≤ 10⁹.");
    await ui.say("elder", "Eng katta yigʻindi — 10⁵ × 10⁹ = 10¹⁴. Bu 2 milliarddan ancha katta, demak long long.");
    await ui.say("apprentice", "Demak chegaralarni oʻqimasdan kod yozib boʻlmaydi ekan.");
    await ui.say("elder", "Shundan boshlanadi. Keyin kod yoziladi.");
  }

  async function stage3() {
    await qoida();
    await ui.say("elder", "Oxirgi 3 ta vazifa: turni tanlaysan va kod yozasan.");
    await practice.exercises({
      next: (prev, correct, tier) => L.bosqich3Task(prev, correct, tier),
      run: (task) => common.mashq(task),
      praise: (task) => (task.tur === "tur" ? "Chegarani toʻgʻri taxmin qilding." : "Dasturing katta sonlarni ham uddaladi!"),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

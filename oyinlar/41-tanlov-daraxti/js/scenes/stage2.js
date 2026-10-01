// 2-bosqich: VA (ko'paytirish) va YOKI (qo'shish) farqi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, sanash: S, common, practice } = QK;

  // Bir xil sonlar, ikki xil hikoya — javob ham ikki xil
  async function farq() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "dx-ikki" },
      ui.h("div", { class: "dx-karta va" },
        ui.h("div", { class: "dx-karta-nom", text: "VA" }),
        ui.h("div", { text: "3 ta koʻylak va 2 ta shim" }),
        ui.h("div", { class: "dx-karta-izoh", text: "Ikkalasi ham kiyiladi" }),
        ui.h("div", { class: "dx-karta-hisob", text: "3 × 2 = 6" })),
      ui.h("div", { class: "dx-karta yoki" },
        ui.h("div", { class: "dx-karta-nom", text: "YOKI" }),
        ui.h("div", { text: "3 ta avtobus yoki 2 ta piyoda yoʻl" }),
        ui.h("div", { class: "dx-karta-izoh", text: "Faqat bittasi tanlanadi" }),
        ui.h("div", { class: "dx-karta-hisob", text: "3 + 2 = 5" }))));
    await ui.say("elder", "Sonlar bir xil, javob esa boshqa. Farqni soʻz koʻrsatadi.");
    await ui.say("apprentice", "«va» boʻlsa koʻpaytiraman, «yoki» boʻlsa qoʻshaman?");
    await ui.say("elder", "Soʻzga emas, maʼnoga qara: ikkala tanlov ham qilinyaptimi — koʻpaytir. Faqat bittasimi — qoʻsh.");
  }

  async function qoida() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row" },
        ui.h("span", { class: "formula-nom va", text: "VA" }),
        ui.h("span", { text: " — har qadamda tanlov: × koʻpaytiriladi" })),
      ui.h("div", { class: "formula-row" },
        ui.h("span", { class: "formula-nom yoki", text: "YOKI" }),
        ui.h("span", { text: " — bir-birini istisno qiladi: + qoʻshiladi" }))));
    await ui.say("elder", "Endi savollar aralash keladi. Avval qaysi qoida ekanini oʻyla.");
  }

  async function stage2() {
    await farq();
    await qoida();
    await practice.exercises({
      next: (prev) => L.qoidaTask(Math.random, prev),
      run: (task) => common.qoidaExercise(task),
      praise: (task) => (task.qoida === "va" ? "VA — koʻpaytirildi: " : "YOKI — qoʻshildi: ") + task.hisob,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

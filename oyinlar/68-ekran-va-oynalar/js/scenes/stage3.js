// 3-bosqich: bir nechta oyna — orqadagisini oldinga chiqarish (faol oyna), ortiqchalarini yopish, «Pusk» menyusi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  // Uchta oyna ustma-ust: bola orqadagisini bosadi, paneldan almashtiradi va «Pusk»dan yangi dastur ochadi
  async function korsat() {
    const el = common.box(true);
    // «Musiqa» belgisi ish stolida yo'q — uni faqat «Pusk» ro'yxatidan topsa bo'ladi
    const st = common.stol({
      belgilar: ["rasm", "matn", "hisob", "fayllar", "internet"],
      holat: L.holatYasa(["rasm", "matn", "hisob"]),
    });
    el.append(st.el);

    ui.bubble("elder", "Uchta oyna ochiq. Orqadagi «Rasm» oynasini bos.");
    await common.qildir(st, { amal: "oldinga", dastur: "rasm" }, {
      yorit: [{ nima: "sarlavha", dastur: "rasm" }],
      eslat: "↻ «Rasm» oynasining sarlavhasi yonib turibdi. Oʻshani bos.",
    });
    await ui.say("elder", "✓ «Rasm» oldinga chiqdi. Eng oldindagi oyna — faol oyna.");

    ui.bubble("elder", "Paneldagi tugma ham oynani oldinga chiqaradi. Paneldan «Matn»ni bos.");
    await common.qildir(st, { amal: "oldinga", dastur: "matn" }, {
      yorit: [{ nima: "panel", dastur: "matn" }],
      eslat: "↻ Pastdagi panelga qara. Yonib turgan tugmani bos.",
    });

    ui.bubble("elder", "Endi pastdagi «Pusk» tugmasini bos. Roʻyxatdan «Musiqa»ni och.");
    await common.qildir(st, { amal: "och", dastur: "musiqa" }, {
      yorit: [{ nima: "pusk" }],
      eslat: "↻ «Pusk»ni bos. Roʻyxatdan «Musiqa»ni tanla.",
    });
    await ui.say("elder", "✓ «Pusk» menyusida hamma dastur bor. Belgisi stolda boʻlmasa ham topasan.");
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

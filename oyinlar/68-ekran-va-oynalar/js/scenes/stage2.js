// 2-bosqich: oyna tugmalari — kichraytirish (oyna panelda qoladi), paneldan qaytarish, yoyish va yopish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const { tb, gap } = common;

  // Bola bitta oynada to'rt ishni o'zi qiladi: — → paneldan qaytarish → □ → ✕. Nomlar yo'l-yo'lakay beriladi.
  async function korsat() {
    const el = common.box(true);
    const st = common.stol({ belgilar: L.IDLAR, holat: L.holatYasa(["rasm"]) });
    el.append(st.el);
    const tugma = (amal) => [{ nima: "tugma", dastur: "rasm", amal }];

    ui.bubble("elder", gap("Bu — «Rasm» oynasi. Tepasidagi ", tb("—"), " tugmasini bos."));
    await common.qildir(st, { amal: "kichraytir", dastur: "rasm" }, {
      yorit: tugma("kichraytir"),
      eslat: () => gap("↻ Hozir faqat yonib turgan ", tb("—"), " tugmasini bos."),
    });

    ui.bubble("elder", "Oyna yoʻqolmadi — u pastdagi vazifalar panelida. Paneldagi tugmasini bos.");
    await common.qildir(st, { amal: "qaytar", dastur: "rasm" }, {
      yorit: [{ nima: "panel", dastur: "rasm" }],
      eslat: "↻ Pastdagi panelga qara. Yonib turgan tugmani bos.",
    });

    ui.bubble("elder", gap("Oyna qaytdi! Endi ", tb("□"), " tugmasini bos."));
    await common.qildir(st, { amal: "kattalashtir", dastur: "rasm" }, {
      yorit: tugma("kattalashtir"),
      eslat: () => gap("↻ Hozir faqat yonib turgan ", tb("□"), " tugmasini bos."),
    });

    st.yorit([{ nima: "sarlavha", dastur: "rasm" }]);
    await ui.say("elder", "Oyna butun ekranga yoyildi. Uning tepasi — sarlavha: unda nomi yozilgan.");

    ui.bubble("elder", gap("Endi sarlavhadagi ", tb("✕"), " tugmasini bos."));
    await common.qildir(st, { amal: "yop", dastur: "rasm" }, {
      yorit: tugma("yop"),
      eslat: () => gap("↻ Hozir faqat yonib turgan ", tb("✕"), " tugmasini bos."),
    });

    el.insertBefore(common.sxema(), st.el);
    await ui.say("elder", gap("✓ Oyna yopildi. ", tb("—"), " kichraytiradi, ", tb("□"), " yoyadi, ", tb("✕"), " yopadi."));
  }

  async function stage2() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich2Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

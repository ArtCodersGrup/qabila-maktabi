// 3-bosqich: ishonamanmi? — qulf bor, lekin sayt firibgar bo'lishi mumkin. Manzilni oxiridan o'qi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  async function korsat() {
    const host = common.box(true);
    const variantlar = ["http://kelajagim.uz/kirish", "https://kelajagim.uz.sovga-yutuq.com/kirish", "https://kelajagim.uz/kirish"];
    ui.bubble("elder", "Uchta havola keldi. «kelajagim.uz» ga parolni qaysi biriga yozasan?");
    const tanlov = await ui.settle((done) => {
      ui.clearControl();
      ui.control().append(h("div", { class: "qy-javoblar" }, ...variantlar.map((v) => {
        const b = common.satr(v, { tugma: true });
        b.addEventListener("click", () => done(v));
        return b;
      })));
    });
    ui.clearControl();
    host.append(common.satr(tanlov));
    if (tanlov === variantlar[2]) {
      QK.sound.play("correct");
      await ui.say("elder", "✓ Toʻgʻri! Qulf bor va manzil aynan kelajagim.uz.");
    } else if (tanlov === variantlar[1]) {
      QK.sound.play("retry");
      await ui.say("elder", "↻ Qulf bor — lekin bu kelajagim.uz emas! Egasi — sovga-yutuq.com. Firibgar ham qulfli sayt ochadi.");
    } else {
      QK.sound.play("retry");
      await ui.say("elder", "↻ Manzil toʻgʻri, lekin qulf yoʻq — parolingni yoʻlda oʻqishadi.");
    }
    await ui.say("elder", `Qoida ikki qadam: 1) boshida «https://» bormi; 2) birinchi «/» gacha boʻlgan qismni oxiridan oʻqi: ${L.egasi(variantlar[1])} — bu egasi.`);
    await ui.say("apprentice", "Demak qulf — yoʻl xavfsiz degani, sayt halol degani emas!");
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

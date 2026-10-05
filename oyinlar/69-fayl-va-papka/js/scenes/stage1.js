// Kirish va 1-bosqich: fayl, papka va yo'l — papkani ochish, faylni ochish, yo'l satrini o'qish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice, sound } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.sochilgan() }));
    await ui.say("elder", "Qabilamizga kompyuter keldi! Ichida rasmlar, xatlar va qoʻshiqlar bor.");
    await ui.say("apprentice", "Hammasi sochilib yotibdi. Kerakli narsani topa olmayapman!");
  }

  // Bola o'zi qiladi: papkani ochadi → faylni ochadi → yo'lni ko'radi → orqaga qaytadi
  async function korsat() {
    const el = common.box(true);
    const holat = L.holatYasa([L.P("Rasmlar", "olma.jpg", "gul.jpg"), L.P("Musiqa", "kuy.mp3"), "xat.txt"]);
    const rasmlar = L.nomBilan(holat, "Rasmlar").id;
    const olma = L.nomBilan(holat, "olma.jpg").id;
    const oyna = common.fayllar(el, { holat, asboblar: ["orqaga"] });

    await common.yolla(oyna, (h) => (h.joriy === rasmlar ? null : "Bu — «Fayllar» oynasi. «Rasmlar»ni ikki marta tez bos."));
    sound.play("correct");
    await ui.say("elder", "✓ Sen papkani ochding! Papka — fayllar turadigan quti.");

    await common.yolla(oyna, (h, o) => {
      if (o.ochilgan() === olma) return null;
      return h.joriy === rasmlar ? "Endi «olma.jpg»ni ikki marta tez bos." : "«Rasmlar» papkasini och. Keyin «olma.jpg»ni ikki marta bos.";
    });
    sound.play("correct");
    await ui.say("elder", "✓ Bu — fayl. Nomining oxiri «.jpg» — demak, bu rasm.");
    await ui.say("elder", "Tepadagi satrga qara: Kompyuter › Rasmlar. Bu — yoʻl: fayl qayerda turganini aytadi.");

    await common.yolla(oyna, (h) => (h.joriy === h.ildiz.id ? null : "Endi «Orqaga»ni bos — papkadan chiqasan."));
    oyna.toxtat();
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

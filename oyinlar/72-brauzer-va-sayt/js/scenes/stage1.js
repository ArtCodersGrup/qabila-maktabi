// Kirish va 1-bosqich: manzil va havola — saytni manzil bilan ochish, havolani bosish, «Orqaga» qaytish.
// Bosqich oxirida ⭐ xatcho'p ko'rsatiladi (bezak — mashqda tekshirilmaydi).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice, sound, brauzer } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.kelgan() }));
    await ui.say("elder", "Qabilaga internet keldi! Unda minglab sayt bor: hayvonlar, ertaklar, ob-havo…");
    await ui.say("apprentice", "Saytni qanday ochaman? Kompyuterda bitta ham eshik yoʻq-ku!");
  }

  // Bola o'zi qiladi: manzil yozadi (telefonda — tanlaydi) → havolani bosadi → «Orqaga» qaytadi
  async function korsat() {
    const el = common.box(true);
    const br = brauzer.yasa(el, { holat: L.yangi() });
    const touch = ui.touchOnly();

    await common.yolla(br, (h) => (L.joriyId(h) === "hayvonlar" ? null
      : touch ? "Bu — brauzer: saytlarni ochadigan dastur. Yuqoridagi satrni bos va «hayvonlar.uz»ni tanla."
        : "Bu — brauzer: saytlarni ochadigan dastur. Yuqoridagi satrga «hayvonlar.uz» deb yoz va Enter ni bos."));
    sound.play("correct");
    await ui.say("elder", "✓ Sayt ochildi! Yozganing — manzil, har saytning oʻz manzili bor.");

    await common.yolla(br, (h) => (L.joriyId(h) === "tuyalar" ? null
      : L.joriyId(h) === "hayvonlar" ? "Endi sahifadagi «Tuyalar» soʻzini bos — u koʻk va tagiga chizilgan."
        : "Avval «hayvonlar.uz»ga qayt. Keyin «Tuyalar» soʻzini bos."));
    sound.play("correct");
    await ui.say("elder", "✓ Bu — havola. Havola bosilsa, boshqa sahifa ochiladi.");

    await common.yolla(br, (h, api, hodisa) => (hodisa && hodisa.amal === "orqaga" ? null : "Endi «← Orqaga»ni bos."));
    sound.play("correct");
    await ui.say("elder", "✓ Avvalgi sahifaga qaytding. «→ Oldinga» yana olib boradi.");
    br.toxtat();
  }

  // Mashqdan keyin: xatcho'p (bezak)
  async function xatchop() {
    const el = common.box(true);
    const br = brauzer.yasa(el, { holat: L.och(L.yangi(), "hayvonlar.uz") });
    await common.yolla(br, (h, api, hodisa) => (hodisa && hodisa.amal === "xatchop" ? null : "Yana bir narsa: ☆ — xatchoʻp. Uni bos — sayt eslab qolinadi."));
    sound.play("correct");
    await ui.say("elder", "✓ Saytni xatchoʻpga qoʻshsang, manzilni yodlamaysan.");
    br.toxtat();
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich1Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
    await xatchop();
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

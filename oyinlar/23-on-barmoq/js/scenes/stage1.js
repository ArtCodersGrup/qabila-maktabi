// Kirish va 1-bosqich: asosiy qator (DIZAYN 5–6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, typing: T, typingUi, common } = QK;

  async function intro() {
    const el = common.box(false);
    typingUi.keyboard(el, { learned: T.allowed(3) });
    await ui.say("apprentice", "Men qabila xabarchisiman. Xabarlarni kompyuterda yozaman.");
    await ui.say("apprentice", "Lekin bitta barmoq bilan — juda sekin!");
    await ui.say("elder", "Oʻn barmoq bilan yozishni oʻrganamiz. Klaviaturaga qaramasdan!");
    await common.keyboardCheck();
    await ui.say("elder", "✓ Klaviatura bor. Boshladik!");
  }

  // 6.1: F va J dagi bo'rtiqlar
  async function bumps() {
    let pending = common.typeLine({ text: "f", stage: 1 });
    ui.bubble("elder", "F va J tugmalarida kichik boʻrtiq bor. Chap koʻrsatkich barmogʻing bilan F ni top va bos.");
    await pending;
    sound.play("correct");
    pending = common.typeLine({ text: "j", stage: 1 });
    ui.bubble("elder", "Endi oʻng koʻrsatkich barmogʻing bilan J ni bos.");
    await pending;
    sound.play("correct");
    await ui.say("elder", "✓ Boʻrtiqni barmoq koʻrmasdan topadi. Shuning uchun klaviaturaga qarash shart emas!");
  }

  // 6.2: barmoqlar joyi
  async function placement() {
    const el = common.box(true);
    const kb = typingUi.keyboard(el, { learned: T.allowed(1) });
    const hd = typingUi.hands(el);
    kb.mark(["a", "s", "d", "f"]);
    hd.show(["lp", "lr", "lm", "li"]);
    await ui.say("elder", "Chap qoʻl barmoqlari: A S D F.");
    kb.mark(["j", "k", "l", ";"]);
    hd.show(["ri", "rm", "rr", "rp"]);
    await ui.say("elder", "Oʻng qoʻl barmoqlari: J K L ;");
    kb.mark([" "]);
    hd.show(["th"]);
    await ui.say("elder", "Bosh barmoqlar — Probelda. Qaraydigan joying — ekran, klaviatura emas!");
  }

  // 6.4: ta'rif
  async function definition() {
    const el = common.box(false);
    const kb = typingUi.keyboard(el, { learned: T.allowed(1) });
    kb.mark(T.ROWS.home);
    common.formula(el, ["Chap qoʻl: A S D F G", "Oʻng qoʻl: H J K L ;", "Probel — bosh barmoq"]);
    await ui.say("elder", "Bu — asosiy qator. Barmoqlar doim shu yerga qaytib keladi.");
    await ui.say("elder", "Klaviaturaga qaramay yozish — oʻn barmoqli usul deyiladi.");
  }

  async function stage1() {
    await bumps();
    await placement();
    await common.drills(1);
    await definition();
    await ui.say("elder", `Endi soʻzlar yoz. Aniqlik kamida ${T.PASS}% boʻlsin — 3 ta qator!`);
    await common.lineExercises({ stage: 1, speed: false });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

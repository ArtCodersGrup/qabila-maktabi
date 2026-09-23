// Kirish va 1-bosqich: buyruqlar ro'yxati — algoritm (DIZAYN 4–5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, art, dastur: D, dasturUi: U, common } = QK;

  async function intro() {
    const el = common.box(false);
    U.fieldView(el, D.field({ w: 3, h: 2, robot: { x: 0, y: 1 }, goal: { x: 2, y: 1 } }));
    await ui.say("elder", "Qabilaga temir yordamchi keldi — robot.");
    await ui.say("apprentice", "Men bilan gaplashadimi?");
    await ui.say("elder", "Yoʻq. U faqat toʻrtta buyruqni biladi: ⬅ ⬆ ⬇ ➡.");
    await ui.say("elder", "Har buyruq — bitta katak. Qaysi buyruq kerakligini sen oʻylaysan.");
  }

  // 5.3: hayotiy misol — choy damlash
  async function tea() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: art.teaSteps() }));
    await ui.say("elder", "Choy damlash ham algoritm: suv quy → qaynat → choy sol → kut.");
    await ui.say("elder", "Buyruqlar aniq va tartibda beriladi.");
  }

  // 5.4: ta'rif
  async function definition() {
    const el = common.box(false);
    common.formula(el, ["Algoritm — ishni bajarish uchun", "aniq va tartibli buyruqlar roʻyxati"]);
    await ui.say("elder", "Algoritm — aniq va tartibli buyruqlar roʻyxati.");
  }

  async function stage1() {
    await common.guided(
      { robot: { x: 0, y: 4 }, goal: { x: 3, y: 4 } },
      "Robotni gulxangacha olib bor. ➡ ni bosib dastur yoz, keyin ▶︎ ni bos.");
    await ui.say("elder", "Uchta buyruq — uchta qadam. Robot aynan aytganingni bajardi.");
    await common.guided(
      { robot: { x: 0, y: 4 }, goal: { x: 2, y: 2 } },
      "Endi gulxan yuqorida. Yoʻlni oʻzing yoz.");
    await ui.say("elder", "Sen hozir robotga algoritm yozding!");
    await tea();
    await definition();
    await ui.say("elder", "Endi oʻzing yoz. 3 ta toʻgʻri javob — bosqich tugaydi!");
    await common.exercises(1);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

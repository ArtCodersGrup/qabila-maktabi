// Kirish va 1-bosqich: qavs blok yasaydi (CPP-BLOK.md, mavzu 5).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, cpp: C, logic: L, common, practice } = QK;

  async function intro() {
    await ui.keyboardCheck("Bu oʻyinda kod oʻqiymiz va yozamiz — klaviatura kerak.");
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: QK.gameArt.takror() }));
    await ui.say("elder", "Pythonda blokni otstup belgilardi: ichkariga surilgan satrlar — bitta blok.");
    await ui.say("apprentice", "C++ da ham shundaymi?");
    await ui.say("elder", "Yoʻq. C++ da blokni faqat { } yasaydi. Otstup — faqat koʻzga chiroyli.");
  }

  async function qavs() {
    const el = common.box();
    el.append(common.note("Diqqat bilan qara: qavs yoʻq."));
    common.kodVaChiqish(el,
      C.dastur(["int x = 3;", "if (x > 5)", '    cout << "katta\\n";', '    cout << "tekshirdim\\n";']),
      ["tekshirdim"]);
    await ui.say("apprentice", "Ikkala satr ham ichkariga surilgan-ku! Nega ikkinchisi chiqdi?");
    await ui.say("elder", "Chunki qavs yoʻq. Qavssiz if ga faqat keyingi BITTA satr tegishli boʻladi.");
    await ui.say("elder", "Ikkinchi cout — shartdan tashqarida. U har doim ishlaydi.");
    const el2 = common.box();
    el2.append(common.note("Qavs qoʻysak, ikkalasi ham shartga kiradi:"));
    common.kodVaChiqish(el2,
      C.dastur(["int x = 3;", "if (x > 5) {", '    cout << "katta\\n";', '    cout << "tekshirdim\\n";', "}"]),
      []);
    await ui.say("elder", "Endi hech narsa chiqmadi — shart yolgʻon, blok butunlay oʻtkazib yuborildi.");
    await ui.say("elder", "Qoida: ikki va undan koʻp satr boʻlsa, { } doim qoʻyiladi. Bitta satrda ham qoʻysang — xato emas.");
  }

  async function tenglik() {
    const el = common.box(false);
    el.append(common.ikkiTil("if x == 5:\n    ...", "if (x == 5) {\n    ...\n}"));
    await ui.say("elder", "Solishtirish — ikkita teng: ==. Bitta teng esa tayinlash.");
    const el2 = common.box();
    el2.append(common.note("Bitta teng bilan nima boʻladi:"));
    common.kodVaChiqish(el2,
      C.dastur(["int x = 3;", "if (x = 5) {", '    cout << "rost\\n";', "} else {", '    cout << "yolgʻon\\n";', "}", C.chiqar("x")]),
      ["rost", "5"]);
    await ui.say("apprentice", "x uch edi-ku, qanday qilib rost?");
    await ui.say("elder", "x = 5 — bu «x ga 5 ni yoz» degani. Yozildi, natija 5 boʻldi; 5 — nol emas, demak rost.");
    await ui.say("elder", "Shuning uchun C++ da == va = ni adashtirmaslik kerak.");
  }

  async function stage1() {
    await qavs();
    await tenglik();
    await ui.say("elder", "Endi oʻzing ayt: dastur nima chiqaradi? 3 ta toʻgʻri javob kerak.");
    await practice.exercises({
      next: (prev, correct) => L.bosqich1Task(prev, correct),
      run: (task) => common.mashq(task),
      praise: () => "Qavslarni toʻgʻri oʻqiding.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

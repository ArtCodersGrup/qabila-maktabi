// Kirish va 1-bosqich: dastur qolipi, cout va kompilyatsiya (DIZAYN 1-bosqich).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, cpp: C, logic: L, common, practice } = QK;

  // Kompilyatorning haqiqiy xabari (g++ / Apple clang 21 dan ko'chirildi)
  const XATO_XABAR = "a.cpp:5:28: error: expected ';' after expression";

  async function intro() {
    await ui.keyboardCheck("Bu oʻyinda kod oʻqiymiz va javob yozamiz — klaviatura kerak.");
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: QK.gameArt.ikkiTil() }));
    await ui.say("elder", "Pythonda dastur yozishni oʻrgandik. Endi — olimpiada tili, C++.");
    await ui.say("apprentice", "Python bor-ku. Yana bitta til nega kerak?");
    await ui.say("elder", "Olimpiadada vaqt chegarasi bor: odatda 1–2 soniya. Pythonda toʻgʻri yechim ham vaqtga sigʻmay qolishi mumkin.");
    await ui.say("elder", "C++ oldin mashina tiliga aylantiriladi — shuning uchun tez ishlaydi. Shu aylantirish kompilyatsiya deyiladi.");
  }

  // Birinchi dastur: qolip va uning chiqishi
  async function birinchi() {
    const kod = C.dastur([C.chiqar('"Salom, qabila!"')]);
    const el = common.box();
    el.append(common.note("Mana C++ dagi birinchi dastur:"));
    common.kodVaChiqish(el, kod, ["Salom, qabila!"]);
    await ui.say("elder", "Pythonda bu bitta satr edi: print(\"Salom, qabila!\").");
    await ui.say("apprentice", "C++ da esa sakkizta satr!");
    await ui.say("elder", "Toʻgʻri. Lekin bu satrlarning koʻpi — qolip: u har dasturda bir xil.");
  }

  // Qolipning har qismi nima qiladi
  async function qolip() {
    const el = common.box(false);
    el.append(common.note("Qolipning har satri bitta ish qiladi:"));
    el.append(common.qolipKarta());
    await ui.say("elder", "Faqat oʻrtadagi satrlar oʻzgaradi. Qolgani har safar shunday yoziladi.");
    await ui.say("elder", "cout — chiqish. Strelkalar maʼlumot qayerga ketayotganini koʻrsatadi: ekranga.");
    const el2 = common.box();
    el2.append(common.note("cout oʻzidan keyin yangi satrga oʻtmaydi — buni \"\\n\" qiladi:"));
    common.kodVaChiqish(el2,
      C.dastur(['cout << "Salom, ";', 'cout << "qabila";', 'cout << "!\\n";']),
      ["Salom, qabila!"]);
    await ui.say("elder", "Uchta cout — bitta satr. Pythonning printi esa har safar yangi satrga oʻtadi.");
  }

  // Kompilyator xatoni dastur ishlashidan OLDIN topadi
  async function kompilyator() {
    const buzuq = C.dastur([C.chiqar('"Salom"')]).replace('<< "\\n";', '<< "\\n"');
    const el = common.box();
    el.append(common.note("Shu dasturda bitta belgi yetishmayapti:"));
    el.append(common.kodBlok(buzuq, { mark: 5 }));
    el.append(ui.h("div", { class: "kod-chiqish xato" },
      ui.h("div", { class: "kod-sarlavha", text: "g++ shunday deydi" }),
      ui.h("pre", { class: "kod-natija", text: XATO_XABAR })));
    el.append(common.note("Oʻzbekchasi: 5-satr oxirida nuqtali vergul (;) yoʻq."));
    await ui.say("elder", "Dastur umuman ishga tushmadi. C++ xatoni oldin topadi, keyin ishlatadi.");
    await ui.say("elder", "Pythonda esa dastur ishlab turib toʻxtaydi. Farqi shu: C++ da xato — ishdan oldin.");
    await ui.say("apprentice", "Demak bitta nuqtali vergul ham muhim ekan.");
    await ui.say("elder", "Ha. C++ da har buyruq ; bilan tugaydi, blok esa { } ichida turadi.");
  }

  async function stage1() {
    await birinchi();
    await qolip();
    await kompilyator();
    await ui.say("elder", `Endi oʻzing javob ber. ${QK.practice.need()} ta toʻgʻri javob — bosqich tugaydi!`);
    await practice.exercises({
      next: (prev, correct, tier) => L.bosqich1Task(prev, correct, tier),
      run: (task) => common.mashq(task),
      praise: (task) => (task.tur === "natija" ? "Chiqish aynan shunday." : "Qolipni yaxshi oʻqiding."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

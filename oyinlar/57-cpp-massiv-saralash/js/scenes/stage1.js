// Kirish va 1-bosqich: massiv (CPP-BLOK.md, mavzu 7).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, cpp: C, logic: L, common, practice } = QK;

  async function intro() {
    await ui.keyboardCheck("Bu oʻyinda kod oʻqiymiz va yozamiz — klaviatura kerak.");
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: QK.gameArt.massiv() }));
    await ui.say("elder", "Pythonda roʻyxat bor edi: list. C++ da uning oʻrnida massiv turadi.");
    await ui.say("apprentice", "Farqi bormi?");
    await ui.say("elder", "Bor, va u muhim: massivning boʻyi eʼlonda qotiriladi. Keyin oʻsmaydi.");
  }

  async function massiv() {
    const el = common.box();
    el.append(common.note("Massiv — bir xil turdagi kataklar qatori:"));
    common.kodVaChiqish(el,
      C.dastur(["int a[4] = {5, 3, 9, 1};", 'cout << a[0] << " " << a[3] << "\\n";', C.chiqar("a[0] + a[3]")]),
      ["5 1", "6"]);
    await ui.say("elder", "Indeks noldan boshlanadi: birinchi katak a[0], toʻrtinchisi a[3].");
    const el2 = common.box();
    el2.append(common.note("Massivni sikl bilan toʻldirib, sikl bilan oʻqiymiz:"));
    common.kodVaChiqish(el2,
      C.dastur(["int a[5];", "for (int i = 0; i < 5; i++) a[i] = i * i;",
        "for (int i = 0; i < 5; i++) cout << a[i] << \" \";", 'cout << "\\n";']),
      ["0 1 4 9 16 "]);
    await ui.say("elder", "Olimpiadada odatda shunday yoziladi: int a[100005]; — zaxirasi bilan.");
  }

  async function chegara() {
    const el = common.box();
    el.append(common.note("Endi xatarli joy. Massivda 3 ta katak bor, dastur esa toʻrtinchisiga yozyapti:"));
    el.append(common.kodBlok(C.dastur(["int a[3];", "a[0] = 1;", "a[3] = 100;", C.chiqar('"tayyor"')]), { mark: 7 }));
    await ui.say("apprentice", "Kompilyator xato beradi-da?");
    await ui.say("elder", "Yoʻq. C++ massiv chegarasini tekshirmaydi — tezlik uchun. Dastur ishlayveradi.");
    await ui.say("elder", "Begona joyga yoziladi. Javob toʻgʻri ham chiqishi mumkin, buzuq ham. Bu — eng yomon xato turi.");
    el.append(ui.h("div", { class: "ms-oqish", text: "Shu oʻyinda uni ataylab toʻxtatamiz: yolgʻon natija koʻrsatmaymiz." }));
    await ui.say("elder", "Shuning uchun indeksni doim sikl shartida ushlab tur: i < n.");
  }

  async function stage1() {
    await massiv();
    await chegara();
    await ui.say("elder", `Endi oʻzing. ${QK.practice.need()} ta toʻgʻri javob — bosqich tugaydi!`);
    await practice.exercises({
      next: (prev, correct, tier) => L.bosqich1Task(prev, correct, tier),
      run: (task) => common.mashq(task),
      praise: (task) => (task.tur === "yoz" ? "Dasturing ishladi!" : "Massivni toʻgʻri oʻqiding."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

// 2-bosqich: satr (CPP-BLOK.md, mavzu 9).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, cpp: C, logic: L, common, practice } = QK;

  async function satr() {
    const el = common.box();
    el.append(common.note("Satr ham massivga oʻxshaydi — faqat ichida harflar:"));
    common.kodVaChiqish(el,
      C.dastur(['string s = "qabila";', C.chiqar("s.size()"), C.chiqar('s[0] << s[5]')], { string: true }),
      ["6", "qa"]);
    await ui.say("elder", "s.size() — uzunligi, s[0] — birinchi harf. Massivdagidek, indeks noldan.");
    const el2 = common.box(false);
    el2.append(common.ikkiTil('s = "qabila"\nprint(len(s))\nprint(s[1:4])', 'string s = "qabila";\ncout << s.size();\n// s[1:4] — C++ da yoʻq'));
    await ui.say("elder", "Pythondagi kesib olish — s[1:4] — C++ da yoʻq. Harflar siklda bittalab olinadi.");
    const el3 = common.box();
    el3.append(common.note("Masalan, nechta «a» borligini sanaymiz:"));
    common.kodVaChiqish(el3,
      C.dastur(['string s = "qabila";', "int k = 0;", "for (int i = 0; i < s.size(); i++) {",
        "    if (s[i] == 'a') k++;", "}", C.chiqar("k")], { string: true }),
      ["2"]);
    await ui.say("elder", "Bitta harf qoʻshtirnoq emas, bitta tirnoq ichida yoziladi: 'a'.");
  }

  async function stage2() {
    await satr();
    await ui.say("elder", "Endi satr bilan oʻzing ishla.");
    await practice.exercises({
      next: (prev, correct) => L.bosqich2Task(prev, correct),
      run: (task) => common.mashq(task),
      praise: (task) => (task.tur === "yoz" ? "Satrni uddaladding!" : "Toʻgʻri."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

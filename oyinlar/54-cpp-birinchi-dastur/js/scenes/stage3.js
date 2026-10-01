// 3-bosqich: Python ↔ C++ — bir xil dastur, ikki til.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, cpp: C, logic: L, common, practice } = QK;

  const PY = 'n = int(input())\nprint("Javob:")\nprint(n * 3)';
  const CPP = C.dastur(["int n;", "cin >> n;", 'cout << "Javob:" << "\\n";', C.chiqar("n * 3")]);

  async function yonma() {
    const el = common.box(false);
    el.append(common.note("Bir xil dastur, ikki til:"));
    el.append(common.ikkiTil(PY, CPP));
    el.append(common.kirishPanel(["7"]));
    el.append(common.chiqishPanel(["Javob:", "21"], "Ikkalasining chiqishi"));
    await ui.say("elder", "Ikkalasi bir xil ishni qiladi va bir xil javob beradi.");
    await ui.say("apprentice", "C++ niki uzunroq, lekin tanish koʻrinadi.");
    await ui.say("elder", "Toʻgʻri. Fikr bir xil — faqat yozilishi boshqa.");
  }

  async function jadval() {
    const el = common.box(false);
    el.append(common.karta());
    await ui.say("elder", "Shu olti qator — Pythondan C++ ga koʻchishning hammasi.");
    await ui.say("elder", "Esingda tursin: ; har satr oxirida, { } blok yasaydi, izoh // bilan yoziladi.");
  }

  async function stage3() {
    await yonma();
    await jadval();
    await ui.say("elder", "Oxirgi 3 ta savol — va oʻyin tugaydi!");
    await practice.exercises({
      next: (prev, correct) => L.bosqich3Task(prev, correct),
      run: (task) => common.mashq(task),
      praise: (task) => (task.tur === "juft" ? "Ikki tilni ajratyapsan." : "Aralashib ketgan satrni topding."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

// 2-bosqich: bo'lish tuzog'i (CPP-BLOK.md, mavzu 4).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, cpp: C, logic: L, common, practice } = QK;

  async function butunBolish() {
    const el = common.box();
    el.append(common.note("Ikkala son ham butun boʻlsa, boʻlish ham butun boʻladi:"));
    common.kodVaChiqish(el, C.dastur([C.chiqar('7 / 2 << "   " << 7 / 2.0')]), ["3   3.5"]);
    await ui.say("elder", "7 / 2 — uch yarim emas, uch. Kasr qismi tashlanadi.");
    await ui.say("apprentice", "Pythonda 7 / 2 — 3.5 edi!");
    await ui.say("elder", "Ha. Pythondagi // belgisi C++ da oddiy / ning oʻzi. Kasr kerak boʻlsa, bittasini kasr qil: 7 / 2.0.");
  }

  async function manfiy() {
    const el = common.box(false);
    el.append(common.ikkiTil("print(-7 // 2)   # -4\nprint(-7 % 3)    #  2", 'cout << -7 / 2;  // -3\ncout << -7 % 3;  // -1'));
    await ui.say("elder", "Manfiy sonlarda ikki til boshqacha javob beradi.");
    await ui.say("elder", "C++ nolga tomon yaxlitlaydi, qoldiqning ishorasi esa boʻlinuvchiniki boʻladi.");
    const el2 = common.box();
    el2.append(common.note("int ga kasr son tushsa ham kasr qismi tashlanadi:"));
    common.kodVaChiqish(el2, C.dastur(["int a = 2.9;", C.chiqar("a")]), ["2"]);
    await ui.say("elder", "Yaxlitlanmaydi — kesiladi. 2.9 ham, 2.1 ham int ichida 2 boʻladi.");
  }

  async function stage2() {
    await butunBolish();
    await manfiy();
    await ui.say("elder", "Endi oʻzing hisobla. Javobni klaviaturada yoz.");
    await practice.exercises({
      next: (prev, correct, tier) => L.bosqich2Task(prev, correct, tier),
      run: (task) => common.mashq(task),
      praise: () => "Tuzoqqa tushmading.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

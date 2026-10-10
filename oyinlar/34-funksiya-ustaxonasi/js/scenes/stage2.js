// 2-bosqich: return — qiymat qaytarish, print bilan farqi, lokal o'zgaruvchi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  const withOutput = (host, code) => {
    host.append(U.codeBlock(code));
    const out = U.output({ title: "Chiqish" });
    out.show(K.run(code), code);
    host.append(out.el);
  };

  async function difference() {
    const el = common.box();
    el.append(common.note("Ikki funksiya deyarli bir xil. Farqi — print va return:"));
    withOutput(el, "def kvadrat(n):\n    print(n * n)\n\nx = kvadrat(5)\nprint(x)");
    withOutput(el, "def kvadrat(n):\n    return n * n\n\nx = kvadrat(5)\nprint(x)");
    await ui.say("elder", "Birinchisi ekranga yozdi, lekin hech narsa qaytarmadi — x = None.");
    await ui.say("elder", "Ikkinchisi qiymat qaytardi: uni qoʻshish, saqlash, boshqa funksiyaga berish mumkin.");
  }

  async function stops() {
    const el = common.box();
    withOutput(el, 'def sinov(n):\n    return n + 1\n    print("bu satr bajarilmaydi")\n\nprint(sinov(4))');
    await ui.say("elder", "return funksiyani darhol tugatadi — undan keyingi satrlar bajarilmaydi.");
  }

  async function local() {
    const el = common.box();
    withOutput(el, "def hisobla():\n    natija = 42\n    return natija\n\nprint(hisobla())\nprint(natija)");
    await ui.say("elder", "Funksiya ichidagi oʻzgaruvchi lokal: u faqat funksiya ichida mavjud.");
    await ui.say("elder", "Qiymati tashqarida kerak boʻlsa — return bilan qaytariladi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "print — ekranga yozadi" }),
      ui.h("div", { class: "formula-row kod", text: "return — qiymatni qaytaradi" }),
      ui.h("div", { class: "formula-row", text: "return funksiyani tugatadi ham" })));
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta kod. Har biri nima chiqarishini aniqla.`);
  }

  async function stage2() {
    await difference();
    await stops();
    await local();
    await definition();
    await practice.exercises({
      next: (prev, correct, tier) => L.returnTask(Math.random, prev, tier),
      run: (task) => common.resultExercise(task),
      praise: () => "Toʻgʻri.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

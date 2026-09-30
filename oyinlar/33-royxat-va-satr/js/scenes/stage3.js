// 3-bosqich: satr ham qator — harflar, kesish va split.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kod: K, kodUI: U, logic: L, common, practice } = QK;

  const withOutput = (host, code, stdin) => {
    host.append(U.codeBlock(code));
    if (stdin) host.append(U.stdinPanel(stdin));
    const out = U.output({ title: "Chiqish" });
    out.lines(K.run(code, { stdin }).output);
    host.append(out.el);
  };

  async function lettersToo() {
    const el = common.box();
    withOutput(el, 's = "qabila"\nprint(s[0], s[-1], len(s))\nprint(s[1:4])');
    await ui.say("elder", "Satr ham qator: har harfning oʻz indeksi bor.");
    await ui.say("elder", "Kesish ham xuddi roʻyxatdagidek ishlaydi.");
  }

  async function splitting() {
    const el = common.box();
    withOutput(el, "a = input().split()\nprint(len(a))\nprint(a[0], a[1])\nprint(int(a[0]) + int(a[1]))", ["12 30"]);
    await ui.say("elder", "split bir satrni boʻshliqlar boʻyicha boʻlaklarga ajratadi.");
    await ui.say("elder", "Boʻlaklar — matn. Son kerak boʻlsa, int() bilan oʻgiriladi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: 'a = input().split()' }),
      ui.h("div", { class: "formula-row", text: "bir satrdan bir nechta qiymat" }),
      ui.h("div", { class: "formula-row kod", text: "int(a[0]) — boʻlakni songa oʻgirish" })));
    await ui.say("elder", "Olimpiada masalalari koʻpincha aynan shu satr bilan boshlanadi.");
  }

  async function stage3() {
    await lettersToo();
    await splitting();
    await definition();
    await practice.exercises({
      next: (prev) => L.stage3Task(Math.random, prev),
      run: (task) => common.stage3Exercise(task),
      praise: (task) => (task.type === "kod-yoz" ? "Dastur hamma sinovdan oʻtdi." : "Satrni toʻgʻri oʻqiding."),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

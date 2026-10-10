// 2-bosqich: sxemani yig'ish va undan kod olish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, sxema: S, sxemaUi: SU, logic: L, common, practice } = QK;

  async function korsat() {
    const sxema = [
      { tur: "kirit", nom: "n ni kiritish", kod: "n = int(input())" },
      { tur: "amal", nom: "s ← n × n", kod: "s = n * n" },
      { tur: "chiqar", nom: "s ni chiqarish", kod: "print(s)" },
    ];
    const el = common.box(true);
    el.append(common.note("Har sxemadan kod chiqadi. Mana shunday:"));
    el.append(ui.h("div", { class: "sx-namuna" }, SU.chiz(sxema)));
    el.append(ui.h("div", { class: "sx-kod-bosh", text: "Sxemadan chiqqan kod:" }), U.codeBlock(S.kodYasa(sxema), { numbers: false }));
    await ui.say("elder", "Har blok — kodning bitta satri. Ovallar kodga tushmaydi: ular faqat boshi va oxirini belgilaydi.");
  }

  async function korsatShart() {
    const sxema = [
      { tur: "kirit", nom: "n ni kiritish", kod: "n = int(input())" },
      { tur: "shart", nom: "n juftmi?", kod: "n % 2 == 0",
        ha: [{ tur: "chiqar", nom: "“juft” deb yozish", kod: 'print("juft")' }],
        yoq: [{ tur: "chiqar", nom: "“toq” deb yozish", kod: 'print("toq")' }] },
    ];
    const el = common.box(true);
    el.append(common.note("Rombdan ikki yoʻl chiqadi — kodda bu if va else:"));
    el.append(ui.h("div", { class: "sx-namuna" }, SU.chiz(sxema)));
    el.append(ui.h("div", { class: "sx-kod-bosh", text: "Sxemadan chiqqan kod:" }), U.codeBlock(S.kodYasa(sxema), { numbers: false }));
    await ui.say("elder", "“ha” tomoni — if ichiga, “yoʻq” tomoni — else ichiga tushadi.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta sxema yigʻish. Blokni bossang — qoʻyiladi, qoʻyilganini bossang — olib tashlanadi.`);
    await ui.say("elder", "Shart tarmogʻiga blok qoʻyish uchun avval “ha” yoki “yoʻq” yozuvini bos.");
  }

  async function stage2() {
    await korsat();
    await korsatShart();
    await practice.exercises({
      next: (prev, correct, tier) => L.qurishTask(Math.random, prev, tier),
      run: (task) => common.qurishExercise(task),
      praise: () => "Sxema ishladi.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

// Kirish va 1-bosqich: o'lchov zinapoyasi (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { units, ui, sound, art, unitsUi, practice, common } = QK;
  const U = units.UNITS;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.storehouse() }));
    await ui.say("elder", "Biz bit, bayt, kilobayt, megabayt va gigabaytni oʻrgandik.");
    await ui.say("apprentice", "Ular qanday bogʻlangan?");
    await ui.say("elder", "Kel, xotira omborini quramiz — qutilar ichida qutilar!");
  }

  // Har pog'ona qo'yilgandan keyingi izoh
  const AFTER = [
    "Bit — eng kichigi: yoniq yoki oʻchiq.",
    "8 bit = 1 bayt. Birinchi qadam — 8 marta.",
    "1024 bayt = 1 Kbayt. Endi har qadam — 1024 marta.",
    "1024 Kbayt = 1 Mbayt.",
    "1024 Mbayt = 1 Gbayt.",
    "Gbaytdan keyin — Tbayt (terabayt): 1024 Gbayt. Kompyuter disklari shunday oʻlchanadi.",
  ];

  // 4.1–4.2: bola birliklarni eng kichigidan boshlab teradi
  async function build() {
    const el = common.box(true);
    const steps = unitsUi.ladder(el, 0);
    ui.bubble("elder", "Eng kichik birlikdan boshla! Qaysi biri eng kichik?");
    const mixed = ["Mbayt", "bit", "Tbayt", "Kbayt", "bayt", "Gbayt"];
    let next = 0;
    await ui.settle((done) => {
      unitsUi.unitButtons(mixed, (unit, button) => {
        if (unit !== U[next]) {
          sound.play("retry");
          ui.pose("apprentice", "think", 1000);
          ui.bubble("elder", "↻ Hali emas. Qolganlarning eng kichigi qaysi?");
          return;
        }
        button.disabled = true;
        sound.play("correct");
        next++;
        steps.setShown(next);
        ui.bubble("elder", AFTER[next - 1]);
        if (next === U.length) {
          ui.clearControl();
          done();
        }
      });
    });
    await ui.say("elder", AFTER[U.length - 1]);
    await ui.say("elder", "Zinapoya tayyor! Har pogʻona — oldingisini oʻz ichiga oladigan katta quti.");
  }

  async function definition() {
    const el = common.box(false);
    const rows = [`1 bayt = 8 bit`];
    for (let i = 2; i < U.length; i++) rows.push(`1 ${U[i]} = 1024 ${U[i - 1]}`);
    common.formula(el, rows);
    await ui.say("elder", "Har pogʻona 1024 marta katta. Faqat birinchisi — 8 marta.");
    await ui.say("elder", "Ikkita sonni yodda tut: 8 va 1024.");
  }

  // To'liq javob: "1 Mbayt = 1024 Kbayt" yoki "Kbayt → Mbayt"
  const statement = (t) => (t.type === "next" ? `${U[t.i]} → ${t.answer}` : `1 ${U[t.i]} = ${units.factor(t.i - 1)} ${U[t.i - 1]}`);

  // 4.4: mashq — bo'sh joyni to'ldirish
  function ladderTask(task) {
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: task.type === "next" ? `Zinapoyada ${task.text}` : task.text }));
    ui.bubble("elder", task.type === "next" ? "Qaysi birlik keladi?" : "Boʻsh joyga nima keladi?");
    let steps = null;
    return practice.tries({
      setup: (submit) => {
        const row = ui.h("div", { class: "choice-row units-row" });
        task.options.forEach((o) => row.append(ui.button(o, () => submit(o), "secondary")));
        ui.clearControl();
        ui.control().append(row);
      },
      check: (value) => value === task.answer,
      hint: () => {
        steps = unitsUi.ladder(el, U.length);
        common.add(el, steps.el);
        ui.bubble("elder", "↻ Zinapoyaga qara.");
      },
      solution: () => {
        if (!steps) steps = unitsUi.ladder(el, U.length);
        // Javob bo'lgan pog'ona: keyingisi, pastdagi birlik yoki (son savolida) yuqoridagisi
        steps.light(task.type === "next" ? task.i + 1 : task.type === "unit" ? task.i - 1 : task.i);
        common.add(el, common.answerLine(statement(task)));
      },
    });
  }

  async function stage1() {
    await build();
    await definition();
    await ui.say("elder", "Endi oʻzing top: zinapoyadagi boʻsh joylar. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => units.makeLadderTask(prev),
      run: ladderTask,
      praise: (task) => `${statement(task)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

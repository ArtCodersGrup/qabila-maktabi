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
    await ui.say("elder", "Maqsad: axborot birliklarini (bit … Tbayt) bir-biriga oʻtkazish, solishtirish va xotiraga nechta fayl sigʻishini hisoblash.");
    await ui.say("elder", "Kalit gʻoya: har katta birlik kichigini oʻz ichiga oladi — qutilar ichida qutilar. Koʻpaytuvchilar: 8 va 1024.");
  }

  // Har pog'ona qo'yilgandan keyingi izoh
  const AFTER = [
    "Bit — eng kichik birlik: 0 yoki 1.",
    "8 bit = 1 bayt. Birinchi qadam — 8 marta.",
    "1024 bayt = 1 Kbayt. Endi har qadam — 1024 marta.",
    "1024 Kbayt = 1 Mbayt.",
    "1024 Mbayt = 1 Gbayt.",
    "1024 Gbayt = 1 Tbayt (terabayt). Disklar hajmi shunday oʻlchanadi.",
  ];

  // 4.1–4.2: bola birliklarni eng kichigidan boshlab teradi
  async function build() {
    const el = common.box(true);
    const steps = unitsUi.ladder(el, 0);
    ui.bubble("elder", "Birliklarni eng kichigidan boshlab ter: qaysi biri eng kichik?");
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
    await ui.say("elder", "Zinapoya tayyor: har pogʻona oldingisini oʻz ichiga oladi.");
  }

  async function definition() {
    const el = common.box(false);
    const rows = [`1 bayt = 8 bit`];
    for (let i = 2; i < U.length; i++) rows.push(`1 ${U[i]} = 1024 ${U[i - 1]}`);
    common.formula(el, rows);
    await ui.say("elder", "Har pogʻona 1024 = 2¹⁰ marta katta, faqat bit → bayt — 8 marta.");
    await ui.say("elder", "Kattaroq birlikka oʻtishda boʻlamiz, kichigiga oʻtishda koʻpaytiramiz.");
  }

  // To'liq javob: "1 Mbayt = 1024 Kbayt" yoki "Kbayt → Mbayt"
  function statement(t) {
    if (t.type === "next") return `${U[t.i]} → ${t.answer}`;
    if (t.type === "next2") return `${U[t.i]} → ${U[t.i + 1]} → ${t.answer}`;
    if (t.type === "unit2") return `1 ${U[t.i]} = ${units.factor(t.i - 1)} ${U[t.i - 1]} = ${units.factor(t.i - 1)} × ${units.factor(t.i - 2)} ${U[t.i - 2]}`;
    if (t.type === "steps") return `${U.slice(t.i, t.j + 1).join(" → ")}: ${t.answer} marta × 1024`;
    return `1 ${U[t.i]} = ${units.factor(t.i - 1)} ${U[t.i - 1]}`;
  }
  const asksUnit = (t) => t.type === "next" || t.type === "next2";

  // 4.4: mashq — bo'sh joyni to'ldirish
  function ladderTask(task) {
    const el = common.box(true);
    el.append(ui.h("div", { class: "big-value", text: asksUnit(task) ? `Zinapoyada ${task.text}` : task.text }));
    ui.bubble("elder", asksUnit(task) ? "Qaysi birlik keladi?" : task.type === "steps" ? "Zinapoyada nechta pogʻona koʻtarilamiz?" : "Boʻsh joyga nima keladi?");
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
        steps.light({ next: task.i + 1, next2: task.i + 2, unit: task.i - 1, unit2: task.i - 2, steps: task.j }[task.type] ?? task.i);
        common.add(el, common.answerLine(statement(task)));
      },
    });
  }

  async function stage1() {
    await build();
    await definition();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol — zinapoyadagi boʻsh joylar.`);
    await practice.exercises({
      next: (prev, correct, tier) => units.makeLadderTask(prev, undefined, tier),
      run: ladderTask,
      praise: (task) => `${statement(task)}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

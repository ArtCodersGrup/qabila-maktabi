// 2-bosqich: robot gap yozadi — eng ko'pini tanlash va tasodif (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { words, ui, wordsUi, practice, common } = QK;

  const ROWS = ["bola", "olov", "suv"];

  // 5.1–5.2: doim eng ko'p uchraganini tanlash — gap har safar bir xil
  async function greedyDemo(table) {
    const el = common.box(false);
    const ptable = wordsUi.pairTable(el);
    ptable.set(table, ROWS);
    const rline = wordsUi.robotLine(el);
    await ui.say("elder", "Robot gap yozadi. U «bola» dan boshlaydi va jadvalga qaraydi.");
    const first = await common.animateWrite(table, "bola", {}, rline, ptable);
    await ui.say("elder", `«${first.join(" ")}». Har safar eng koʻp uchragan soʻzni tanladi.`);
    for (let k = 0; k < 2; k++) {
      ui.bubble("elder", "«Yana yoz»ni bos.");
      await ui.settle((done) => {
        ui.control().append(ui.button("Yana yoz", () => { ui.clearControl(); done(); }, "big"));
      });
      await common.animateWrite(table, "bola", {}, rline, ptable);
    }
    await ui.say("elder", "Robot doim bir xil gap yozdi. Zerikarli!");
  }

  // 5.3: tasodif qo'shamiz
  async function randomDemo(table) {
    const el = common.box(false);
    const ptable = wordsUi.pairTable(el);
    ptable.set(table, ROWS);
    const rline = wordsUi.robotLine(el);
    await ui.say("elder", "Tasodif qoʻshamiz: koʻp uchragan soʻz koʻproq chiqadi, lekin boshqasi ham chiqishi mumkin.");
    const seen = [];
    for (let k = 0; k < 3; k++) {
      ui.bubble("elder", k === 0 ? "«Yoz»ni bos." : "Yana bos — boshqacha chiqishi mumkin.");
      await ui.settle((done) => {
        ui.control().append(ui.button(k === 0 ? "Yoz" : "Yana yoz", () => { ui.clearControl(); done(); }, "big"));
      });
      const start = words.starters(words.BASE)[k % 3];
      const sentence = await common.animateWrite(table, start, { random: true }, rline, ptable);
      seen.push(sentence.join(" "));
    }
    el.append(common.line(seen.join(" · ")));
    await ui.say("elder", "Gaplar har xil chiqdi! Chatbot ham keyingi soʻzni shunday — ehtimol bilan tanlaydi.");
  }

  // 5.5: mashq — "Robot har safar eng ko'p uchragan so'zni tanlasa, qaysi gap chiqadi?" (4 ta gap).
  // Jadvaldan bitta sonni o'qish yetmaydi: bola ikki qadam yuradi (boshlovchi so'z qatori → keyingi so'z qatori).
  function greedyTask(task) {
    const el = common.box(true);
    const ptable = wordsUi.pairTable(el);
    ptable.set(words.table(task.sentences), task.rows);
    ui.bubble("elder", `Robot «${task.start}» dan boshlaydi va har safar eng koʻp uchragan soʻzni tanlaydi. Qaysi gap chiqadi?`);
    return practice.tries({
      setup: (submit) => wordsUi.sentenceButtons(task.options, submit),
      check: (index) => index === task.answer,
      hint: () => {
        ptable.highlight(task.start);
        ui.bubble("elder", `↻ Avval «${task.start}» qatoriga qara: eng katta son qaysi soʻzda? Keyin oʻsha soʻzning qatoriga oʻt.`);
      },
      solution: () => {
        const good = task.options[task.answer];
        ptable.highlight(good[1]);
        el.append(common.answerLine(good.join(" → ")));
      },
    });
  }

  async function stage2() {
    const table = words.table(words.BASE);
    await greedyDemo(table);
    await randomDemo(table);
    await ui.say("elder", `Endi oʻzing ayt: eng koʻpini tanlaydigan robot qaysi gapni yozadi? ${QK.practice.need()} ta toʻgʻri javob!`);
    await practice.exercises({
      next: (prev, correct, tier) => words.makeGreedyTask(null, prev, null, tier),
      run: greedyTask,
      praise: (task) => `Robot har safar eng koʻpini tanladi: «${task.options[task.answer].join(" ")}».`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

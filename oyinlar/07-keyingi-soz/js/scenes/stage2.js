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

  async function stage2() {
    const table = words.table(words.BASE);
    await greedyDemo(table);
    await randomDemo(table);
    await ui.say("elder", "Endi oʻzing ayt: robot qaysi soʻzni yozishi eng ehtimoli katta? 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => words.makeBestTask(words.BASE, prev),
      run: (task) => QK.scenes.bestTask(task, words.BASE, "table"),
      praise: (task) => `«${task.word}» dan keyin koʻpincha «${task.options[task.answer]}» keladi.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

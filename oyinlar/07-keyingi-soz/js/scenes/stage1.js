// Kirish va 1-bosqich: juftliklarni sanash (DIZAYN 3, 4-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { words, ui, sound, art, wordsUi, practice, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.robot() }));
    await ui.say("elder", "Robot gapirishni oʻrganmoqchi!");
    await ui.say("apprentice", "Unga soʻzlarning maʼnosini oʻrgatamizmi?");
    await ui.say("elder", "Yoʻq — u maʼnoni bilmaydi. U faqat sanaydi: qaysi soʻzdan keyin qaysi soʻz kelgan.");
  }

  // 4.1: qabila gaplari
  async function showCorpus(sentences) {
    const el = common.box(true);
    wordsUi.corpus(el, sentences);
    await ui.say("elder", "Bular — qabilaning gaplari. Robot ularni oʻqiydi.");
    await ui.say("elder", "Endi birgalikda sanaymiz.");
  }

  // 4.2: "olov" dan keyingi so'zlarni sanash
  async function countDemo(sentences) {
    const el = common.box(true); // gaplar koʻp — qahramonlar kichrayadi
    const word = "olov";
    let handler = null;
    const view = wordsUi.corpus(el, sentences, { onPick: (si, wi, w, node) => handler(si, wi, w, node) });
    const table = wordsUi.pairTable(el);
    view.mark(word);
    const counts = {};
    const targets = [];
    sentences.forEach((sentence, si) => {
      sentence.forEach((w, wi) => {
        if (w === word && wi + 1 < sentence.length) targets.push({ si, wi: wi + 1, next: sentence[wi + 1] });
      });
    });
    const render = () => table.set({ [word]: counts }, Object.keys(counts).length ? [word] : []);
    render();
    ui.bubble("elder", "«olov» yonib turibdi. Har gapda undan keyingi soʻzni bos!");
    let left = targets.length;
    await ui.settle((done) => {
      handler = (si, wi, w) => {
        const hit = targets.find((x) => x.si === si && x.wi === wi && !x.taken);
        if (!hit) {
          sound.play("retry");
          ui.toast("Bu «olov» dan keyin kelgan soʻz emas.");
          return;
        }
        hit.taken = true;
        sound.play("correct");
        view.done(si, wi);
        counts[w] = (counts[w] || 0) + 1;
        render();
        left--;
        if (left === 0) done();
      };
    });
    await ui.say("elder", "Mana — juftliklar jadvali: «olov» dan keyin «yoqdi» 3 marta, «koʻrdi» 1 marta kelgan.");
    await ui.say("elder", "Robotning bor bilgani — shu jadval.");
  }

  // 4.4 va 5.5: "{so'z} dan keyin eng ko'p qaysi so'z kelgan?"
  function bestTask(task, sentences, mode) {
    const el = common.box(true);
    const table = words.table(sentences);
    let view = null;
    let ptable = null;
    if (mode === "table") {
      ptable = wordsUi.pairTable(el);
      ptable.set(table, [task.word]);
    } else {
      view = wordsUi.corpus(el, sentences);
    }
    ui.bubble("elder", mode === "table"
      ? `Robot «${task.word}» dan keyin qaysi soʻzni yozishi eng ehtimoli katta?`
      : `«${task.word}» dan keyin eng koʻp qaysi soʻz kelgan?`);
    return practice.tries({
      setup: (submit) => wordsUi.wordButtons(task.options, submit),
      check: (index) => index === task.answer,
      hint: () => {
        if (view) view.mark(task.word);
        if (ptable) ptable.highlight(task.word);
        ui.bubble("elder", `↻ «${task.word}» belgilandi. Undan keyingi soʻzlarni sana.`);
      },
      solution: () => {
        if (!ptable) {
          ptable = wordsUi.pairTable(el);
          ptable.set(table, [task.word]);
        }
        ptable.highlight(task.word);
        el.append(common.answerLine(`Eng koʻp: ${task.options[task.answer]}`));
      },
    });
  }

  async function stage1() {
    await showCorpus(words.BASE);
    await countDemo(words.BASE);
    await ui.say("elder", "Endi oʻzing sana! 3 ta toʻgʻri javob kerak.");
    await practice.exercises({
      next: (prev) => words.makeBestTask(words.BASE, prev),
      run: (task) => bestTask(task, words.BASE, "corpus"),
      praise: (task) => `«${task.word}» dan keyin «${task.options[task.answer]}» eng koʻp kelgan.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1, bestTask });
})(window);

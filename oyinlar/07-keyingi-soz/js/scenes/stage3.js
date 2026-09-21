// 3-bosqich: ko'proq matn, ma'no va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { words, ui, art, wordsUi, practice, common } = QK;

  const SCENES = [
    { art: "books", lines: ["Chatbotlar millionlab kitob va sahifani oʻqiydi.", "Ular ham soʻz juftliklarini sanaydi — faqat jadvali juda katta."] },
    { art: "thinking", lines: ["Robot maʼnoni bilmaydi.", "Shuning uchun baʼzan ishonch bilan notoʻgʻri javob yozadi."] },
    { art: "check", lines: ["Uning javobini doim tekshirish kerak.", "Kitobdan yoki bilgan odamdan soʻra."] },
  ];

  // 6.1: matn qo'shilsa jadval boyiydi
  async function moreText() {
    const el = common.box(false);
    const view = wordsUi.corpus(el, words.BASE);
    const ptable = wordsUi.pairTable(el);
    ptable.set(words.table(words.BASE), ["ovchi", "bola"]);
    await ui.say("elder", "Robotga koʻproq gap beramiz. Jadval qanday oʻzgaradi?");
    ui.bubble("elder", "«Matn qoʻsh»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Matn qoʻsh", () => { ui.clearControl(); done(); }, "big"));
    });
    for (const sentence of words.EXTRA) {
      view.add(sentence);
      await ui.sleep(420);
    }
    ptable.set(words.table(words.ALL), ["ovchi", "bola"]);
    await ui.say("elder", "Jadval boyidi: yangi soʻzlar va yangi juftliklar paydo boʻldi.");
    const rline = wordsUi.robotLine(el);
    await common.animateWrite(words.table(words.ALL), "bola", { random: true }, rline, ptable);
    await ui.say("elder", "Endi robot yangi gaplar ham yoza oladi. Koʻproq matn — koʻproq gap.");
  }

  // 6.2: robot ma'noni bilmaydi
  async function meaning() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story-art", html: art.story("thinking") }));
    await ui.say("elder", "Robot «olov» nimaligini bilmaydi. U olovni koʻrmagan, issiqligini sezmagan.");
    await ui.say("elder", "U faqat shuni biladi: «olov» dan keyin koʻpincha «yoqdi» kelgan.");
  }

  // 6.3: "Qaysi gapni robot yoza oladi?"
  function sentenceTask(task) {
    const el = common.box(true);
    const table = words.table(words.ALL);
    const need = [];
    task.options.forEach((s) => [s[0], s[1]].forEach((w) => { if (!need.includes(w)) need.push(w); }));
    const ptable = wordsUi.pairTable(el);
    ptable.set(table, need);
    ui.bubble("elder", "Jadvalga qara: robot qaysi gapni yoza oladi?");
    return practice.tries({
      setup: (submit) => wordsUi.sentenceButtons(task.options, submit),
      check: (index) => index === task.answer,
      hint: () => {
        ptable.highlight(task.options[task.answer][0]);
        ui.bubble("elder", "↻ Har juftlikni tekshir: birinchi soʻzdan keyin ikkinchisi kelganmi?");
      },
      solution: () => {
        ptable.highlight(task.options[task.answer][0]);
        el.append(common.answerLine(task.options[task.answer].join(" ")));
      },
    });
  }

  // 6.3: "{so'z} dan keyin nima kelishi mumkin?"
  function followTask(task) {
    const el = common.box(true);
    const view = wordsUi.corpus(el, words.ALL);
    ui.bubble("elder", `Gaplarga qara: «${task.word}» dan keyin qaysi soʻz kelishi mumkin?`);
    return practice.tries({
      setup: (submit) => wordsUi.wordButtons(task.options, submit),
      check: (index) => index === task.answer,
      hint: () => {
        view.mark(task.word);
        ui.bubble("elder", `↻ «${task.word}» belgilandi. Undan keyin turgan soʻzlarni qara.`);
      },
      solution: () => {
        const ptable = wordsUi.pairTable(el);
        ptable.set(words.table(words.ALL), [task.word]);
        el.append(common.answerLine(`${task.word} → ${task.options[task.answer]}`));
      },
    });
  }

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" }, ui.h("div", { class: "story-art", html: art.story(scene.art) })));
    for (const text of scene.lines) await ui.say("elder", text);
  }

  async function stage3() {
    await moreText();
    await meaning();
    await ui.say("elder", "Endi oʻzing javob ber. 3 ta toʻgʻri javob kerak!");
    await practice.exercises({
      next: (prev, correct) => words.makeStage3Task(words.ALL, correct, prev),
      run: (task) => (task.type === "sentence" ? sentenceTask(task) : followTask(task)),
      praise: (task) => (task.type === "sentence"
        ? `«${task.options[task.answer].join(" ")}» — juftliklari jadvalda bor.`
        : `«${task.word}» dan keyin «${task.options[task.answer]}» kelgan.`),
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

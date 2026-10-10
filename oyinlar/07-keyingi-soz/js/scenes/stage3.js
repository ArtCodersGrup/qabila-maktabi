// 3-bosqich: ko'proq matn, ma'no va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { words, ui, art, wordsUi, practice, common } = QK;

  const SCENES = [
    { art: "books", lines: ["Qayerda uchraydi: chatbotlar milliardlab soʻzli korpusda oʻqitiladi.", "Ular ham keyingi soʻzni bashorat qiladi, lekin faqat oldingi soʻzga emas — butun matnga qaraydi."] },
    { art: "thinking", lines: ["Model faktni tekshirmaydi — ehtimoli katta matnni yozadi.", "Shuning uchun baʼzan ishonch bilan notoʻgʻri javob beradi."] },
    { art: "check", lines: ["Muhim javobni ishonchli manbadan tekshir: darslik, rasmiy sayt yoki mutaxassis."] },
  ];

  // 6.1: matn qo'shilsa jadval boyiydi
  async function moreText() {
    const el = common.box(false);
    const view = wordsUi.corpus(el, words.BASE);
    const ptable = wordsUi.pairTable(el);
    ptable.set(words.table(words.BASE), ["ovchi", "bola"]);
    await ui.say("elder", "Korpusni kattalashtiramiz. Jadval qanday oʻzgaradi?");
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
    await ui.say("elder", "Model endi yangi gaplar ham yoza oladi: korpus qancha katta boʻlsa, imkoniyat shuncha koʻp.");
  }

  // 6.2: robot ma'noni bilmaydi
  async function meaning() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story-art", html: art.story("thinking") }));
    await ui.say("elder", "Model «olov» nimaligini bilmaydi — u olovni koʻrmagan va issiqligini sezmagan.");
    await ui.say("elder", "U faqat shuni biladi: «olov» dan keyin koʻpincha «yoqdi» kelgan.");
  }

  // 6.3: "Qaysi gapni robot yoza oladi?" — 4 ta gap; matn har misolda bankdan yangidan olinadi
  function sentenceTask(task) {
    const el = common.box(true);
    const table = words.table(task.sentences);
    const need = [];
    // Faqat davomi bor so'zlarning qatorlari (4 ta gapda 8 tagacha so'z bo'lishi mumkin — jadval uzayib ketmasin)
    task.options.forEach((s) => [s[0], s[1]].forEach((w) => { if (table[w] && !need.includes(w)) need.push(w); }));
    const ptable = wordsUi.pairTable(el);
    ptable.set(table, need);
    ui.bubble("elder", "Jadvalga qara: model qaysi gapni yoza oladi?");
    return practice.tries({
      setup: (submit) => wordsUi.sentenceButtons(task.options, submit),
      check: (index) => index === task.answer,
      // Maslahat to'g'ri gap qatorini yoritmaydi (javobni aytib qo'yardi) — tekshirish usulini eslatadi
      hint: () => ui.bubble("elder", "↻ Har gapda ikkita juftlik bor. Ikkalasini ham jadvaldan tekshir: 1-soʻzdan keyin 2-si, 2-sidan keyin 3-si kelganmi?"),
      solution: () => {
        ptable.highlight(task.options[task.answer][0]);
        el.append(common.answerLine(task.options[task.answer].join(" ")));
      },
    });
  }

  // 6.3: "{so'z} dan keyin nima kelishi mumkin?"
  function followTask(task) {
    const el = common.box(true);
    const view = wordsUi.corpus(el, task.sentences);
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
        ptable.set(words.table(task.sentences), [task.word]);
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
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol — jadval boʻyicha model nimani yoza oladi.`);
    await practice.exercises({
      next: (prev, correct, tier) => words.makeStage3Task(null, correct, prev, null, tier),
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

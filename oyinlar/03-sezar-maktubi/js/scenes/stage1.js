// Kirish va 1-bosqich: Sezar xatini ochish (DIZAYN 4, 5-bo'limlar).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { caesar, ui, sound, art, caesarUi, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    ui.paper("");
    ui.work().append(ui.h("div", { class: "story-art", html: art.story("scroll") }));
    await ui.say("elder", "Qabilaga uzoq Rimdan xat keldi!");
    await ui.say("apprentice", "Xat Yuliy Sezardan. Lekin uni oʻqib boʻlmaydi!");
    await ui.say("elder", "Harflari surilgan. Kel, birga ochamiz!");
  }

  // 5.1: g'ildirak — ichki halqa 0 dan 3 gacha birma-bir buriladi
  async function showWheel() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    ui.paper("");
    const box = ui.h("div", { class: "wheel-box", html: art.wheel(caesar.ALPHABET, 0) });
    ui.work().append(box);
    await ui.say("elder", "Bu — Sezar gʻildiragi. Ichki halqani 3 ga buramiz.");
    for (let k = 1; k <= caesar.FIRST_KEY; k++) {
      await ui.sleep(500);
      sound.play("tap");
      box.innerHTML = art.wheel(caesar.ALPHABET, k, new Set([0]));
    }
    await ui.say("elder", "Endi har harf ostida 3 qadam keyingi harf turibdi: A ostida — E.");
  }

  // 5.1 (davomi): jadval ochiladi, bola kalitni 3 ga qo'yadi
  async function setupTable() {
    ui.clearWork();
    const tbl = caesarUi.table(0, null);
    ui.paper(String(caesar.FIRST_KEY)); // qahramonlar ko'rinib turganda qog'oz ko'tariladi
    ui.raisePaper(true);
    await ui.say("elder", "Gʻildirakni yoyib chiqsak — jadval boʻladi.");
    ui.setCompact(true);
    ui.bubble("elder", "Jadval kalitini 3 ga qoʻy.");
    const box = ui.h("div", { class: "cbox" });
    ui.work().append(box);
    await ui.settle((done) => {
      caesarUi.keyControl(box, tbl, (k) => { if (k === caesar.FIRST_KEY) done(); });
    });
    sound.play("correct");
    return tbl;
  }

  // 5.2: xat — so'zlar birma-bir ochiladi, oxirida butun gap o'qiladi
  let lastLetter = null; // qayta o'ynaganda xat ketma-ket takrorlanmasin

  async function readLetter(tbl) {
    const sentence = caesar.pickLetter(null, lastLetter);
    lastLetter = sentence;
    const words = sentence.split(" ");
    const opened = [];
    ui.setProgress(3, 0);
    for (let w = 0; w < words.length; w++) {
      ui.bubble("elder", w === 0 ? "Pastki qatordan shifrlangan harfni top va katakni bos." : `${w + 1}-soʻzni och.`);
      const ok = await common.solveWord({ plain: caesar.tokenize(words[w]), key: caesar.FIRST_KEY, mode: "decode", tbl, opened });
      opened.push(words[w]);
      if (ok) await ui.sleep(700);
      else await ui.say("elder", `Bu soʻz — ${words[w]}. Davom etamiz.`); // 2-xato: yechimni ko'rib olsin
    }
    ui.setProgress(3, 1);
    ui.clearWork();
    ui.work().append(ui.h("div", { class: "opened big", text: sentence }));
    await ui.say("elder", `Sezar yozibdi: «${sentence}»`);
  }

  // 5.3: ta'rif
  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    ui.raisePaper(false);
    const box = ui.h("div", { class: "wheel-box", html: art.wheel(caesar.ALPHABET, caesar.FIRST_KEY) });
    ui.work().append(box);
    await ui.say("elder", "Kalit — har bir harf nechta surilgani. Sezarning kaliti — 3.");
    await ui.say("elder", "Shifrlashda harf oldinga suriladi, ochishda — orqaga.");
    box.innerHTML = art.wheel(caesar.ALPHABET, caesar.FIRST_KEY, new Set([0, caesar.ALPHABET.length - 1]), true);
    await ui.say("elder", "Alifbo aylana: Ng dan keyin yana A keladi.");
  }

  async function stage1() {
    await showWheel();
    const tbl = await setupTable();
    await readLetter(tbl);
    await explain();
    // 5.4: mashq — jadval 3 da ochiladi, bola kalitni o'zi o'zgartiradi
    ui.clearWork();
    const practice = caesarUi.table(caesar.FIRST_KEY, null);
    await ui.say("elder", "Endi boshqa kalitli soʻzlar. Jadvalni oʻzing sozla!");
    await common.exercises({
      count: 2,
      total: 3,
      doneBefore: 1,
      mode: "decode",
      tbl: practice,
      next: (prev) => caesar.makeExercise(caesar.PRACTICE, prev),
      question: (ex) => `Kalit — ${ex.key}. Jadvalni sozla va soʻzni och.`,
      praise: (ex) => `Bu — ${ex.word}.`,
    });
    ui.hideProgress();
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

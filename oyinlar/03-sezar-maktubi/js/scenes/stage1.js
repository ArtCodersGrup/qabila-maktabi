// Kirish va 1-bosqich: Sezar xatini ochish (DIZAYN 4, 5-bo'limlar).
// 2026-10-10: 5–8 ohangi; kalit shogird qog'ozida emas — ish zonasida (common.solveWord) va ko'rsatmada.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { caesar, ui, sound, art, caesarUi, common } = QK;

  async function intro() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    ui.work().append(ui.h("div", { class: "story-art", html: art.story("scroll") }));
    await ui.say("elder", "Maqsad: Sezar shifri bilan matnni shifrlash, ochish va kalitsiz buzish.");
    await ui.say("elder", "Sezar shifrida har harf alifboda bir xil qadamga siljiydi. Qadamlar soni — kalit.");
  }

  // 5.1: g'ildirak — ichki halqa 0 dan 3 gacha birma-bir buriladi
  async function showWheel() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    const box = ui.h("div", { class: "wheel-box", html: art.wheel(caesar.ALPHABET, 0) });
    ui.work().append(box);
    await ui.say("elder", "Sezar gʻildiragi: tashqi halqa — oddiy alifbo, ichki halqa — shifr alifbosi. Ichki halqani 3 ga buramiz.");
    for (let k = 1; k <= caesar.FIRST_KEY; k++) {
      await ui.sleep(500);
      sound.play("tap");
      box.innerHTML = art.wheel(caesar.ALPHABET, k, new Set([0]));
    }
    await ui.say("elder", "Kalit 3: har harf ostida 3 qadam keyingi harf turibdi — A ostida E.");
  }

  // 5.1 (davomi): jadval ochiladi, bola kalitni 3 ga qo'yadi
  async function setupTable() {
    ui.clearWork();
    const tbl = caesarUi.table(0, null);
    await ui.say("elder", "Gʻildirak yoyilsa — siljish jadvali: tepada oddiy harf, pastda uning shifri.");
    ui.setCompact(true);
    ui.bubble("elder", "Xat kaliti — 3. Jadval kalitini 3 ga qoʻy.");
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
    for (let w = 0; w < words.length; w++) {
      ui.bubble("elder", w === 0 ? "Ochish: shifr harfini jadvalning pastki qatoridan top va ustunini bos." : `${w + 1}-soʻzni och.`);
      const ok = await common.solveWord({ plain: caesar.tokenize(words[w]), key: caesar.FIRST_KEY, mode: "decode", tbl, opened });
      opened.push(words[w]);
      if (ok) await ui.sleep(700);
      else await ui.say("elder", `Bu soʻz — ${words[w]}.`); // 2-xato: yechimni ko'rib olsin
    }
    ui.clearWork();
    ui.work().append(ui.h("div", { class: "opened big", text: sentence }));
    await ui.say("elder", `Ochiq matn: «${sentence}»`);
  }

  // 5.3: ta'rif
  async function explain() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    const box = ui.h("div", { class: "wheel-box", html: art.wheel(caesar.ALPHABET, caesar.FIRST_KEY) });
    ui.work().append(box);
    await ui.say("elder", "Kalit k — har harf necha qadam siljishi. Sezar k = 3 ishlatgan.");
    await ui.say("elder", "Shifrlash — k qadam oldinga, ochish — k qadam orqaga.");
    box.innerHTML = art.wheel(caesar.ALPHABET, caesar.FIRST_KEY, new Set([0, caesar.ALPHABET.length - 1]), true);
    await ui.say("elder", `Alifbo aylana (${caesar.ALPHABET.length} harf): Ng dan keyin yana A keladi.`);
  }

  async function stage1() {
    await showWheel();
    const tbl = await setupTable();
    await readLetter(tbl);
    await explain();
    // 5.4: mashq — jadval 3 da ochiladi, bola kalitni o'zi o'zgartiradi
    ui.clearWork();
    const practice = caesarUi.table(caesar.FIRST_KEY, null);
    // Xat — bosqichning birinchi javobi, shuning uchun so'zlar bittaga kam (4 ta javobdan 3 tasi)
    const need = QK.practice.need() - 1;
    await ui.say("elder", `Mashq: boshqa kalitli ${need} ta soʻzni och. Jadval kalitini oʻzing sozla.`);
    await ui.say("elder", "Oxirgi soʻzda jadvalning pastki qatori yashirin — harfni yodda siljitasan.");
    await common.exercises({
      need,
      mode: "decode",
      tbl: practice,
      // Reja: 1-so'z — kalit 1–6, 2-so'z — kalit 7–14 (alifbo aylanadi), keyin pastki qator yashirin
      next: (prev, correct, tier) => caesar.makePlanned(caesar.PRACTICE, prev, correct, tier, 2),
      question: (ex) => (ex.blind
        ? `Kalit — ${ex.key}. Pastki qator yashirin: har harfni ${ex.key} qadam orqaga siljit va tepadagi harfni bos.`
        : `Kalit — ${ex.key}. Jadvalni sozla va soʻzni och.`),
      praise: (ex) => `Bu — ${ex.word}.`,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

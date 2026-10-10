// 3-bosqich: kalitsiz ochish va hikoya (DIZAYN 7-bo'lim). 2026-10-10: 5–8 ohangi, oxirida — real qo'llanish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { caesar, ui, art, caesarUi, practice } = QK;

  const CRACKS = 4; // kalitsiz ochiladigan so'zlar soni (har birida 28 tagacha kalit sinaladi — 6 tasi ko'plik qiladi)

  // Hikoya: art — rasm (QK.art.story), lines — Oqsoqol gaplari (har biri alohida pufak)
  const SCENES = [
    { art: "caesar", lines: ["Tarix: Yuliy Sezar (mil. av. I asr) sarkardalariga xatlarni k = 3 bilan shifrlab yuborgan — buni tarixchi Svetoniy yozib qoldirgan."] },
    { art: "keys", caption: "1, 2, 3 … 28", lines: ["Zaiflik: kalitlar atigi 28 ta. Hammasini sinab chiqish — toʻliq tanlash (brute force) — bir necha daqiqa."] },
    { art: "book", lines: ["IX asrda Al-Kindiy chastotali tahlilni topdi: matnda eng koʻp uchraydigan harf shifrda ham eng koʻp uchraydi.", "Bu usul har qanday oddiy almashtirish shifrini (harf → doim bitta harf) kalitsiz ochadi."] },
    { art: "phone", lines: ["Qayerda uchraydi: messenjer va bank ilovalari ham shifrlaydi, lekin kaliti 128–256 bit.", "2¹²⁸ ta kalitni sinab chiqishga eng tez kompyuterlarga ham milliardlab yil kerak."] },
  ];

  // 7.1: kalitsiz ochish — bola kalitni o'zgartiradi, so'z shu kalit bilan ochilib ko'rinadi.
  // «Topdim!» ma'nosiz so'zda bosilsa — xato: 1-marta maslahat, 2-marta kalit ko'rsatiladi va yangi so'z beriladi.
  function crackWord(ex) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    QK.current = { answer: ex.word, key: ex.key }; // tekshirish uchun
    const cipher = caesar.encrypt(caesar.tokenize(ex.word), ex.key);
    const state = caesarUi.keyState(0);
    const box = ui.h("div", { class: "cbox" });
    ui.work().append(box);
    box.append(caesarUi.tilesRow(cipher, "shown"));
    const guess = ui.h("div", { class: "guess" });
    const draw = () => {
      guess.innerHTML = "";
      guess.append(caesarUi.tilesRow(caesar.decrypt(cipher, state.getKey()), "guess-tile"));
    };
    const ctrl = caesarUi.keyControl(box, state, draw);
    box.append(guess);
    draw();
    ui.bubble("elder", "Kalitni oʻzgartirib sinab koʻr. Maʼnoli soʻz chiqsa — «Topdim!»");
    return practice.tries({
      setup: (submit) => ui.control().append(ui.button("Topdim!", () => submit(state.getKey()))),
      check: (key) => key === ex.key,
      hint: () => ui.bubble("elder", "↻ Bu soʻz maʼnoli emas. Kalitni oʻzgartirishda davom et — «−» bilan orqaga ham yurish mumkin."),
      solution: () => {
        state.setKey(ex.key);
        ctrl.render();
        draw();
        box.append(ui.h("div", { class: "opened", text: `Kalit ${ex.key}: ${ex.word}` }));
      },
    });
  }

  async function showScene(sc) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art", html: art.story(sc.art) }),
      sc.caption ? ui.h("div", { class: "story-caption", text: sc.caption }) : null));
    for (const line of sc.lines) await ui.say("elder", line);
  }

  async function stage3() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.closeGuide();
    await ui.say("elder", "Kriptotahlil: shifr matn bor, kalit nomaʼlum. Usul — kalitlarni ketma-ket sinash.");
    await ui.say("elder", `Mashq: ${CRACKS} ta soʻzni kalitsiz och. Kalitlar borgan sari kattalashadi.`);
    await practice.exercises({
      need: CRACKS,
      next: (prev, correct, tier) => caesar.makeCrack(prev, null, caesar.crackLevel(correct, tier)),
      run: crackWord,
      praise: (ex) => `Kalit ${ex.key} ekan: ${ex.word}.`,
    });
    await ui.say("elder", "Xulosa: kalitlar atigi 28 ta, hammasini sinash oson — shuning uchun Sezar shifri kuchsiz.");
    for (const sc of SCENES) await showScene(sc);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

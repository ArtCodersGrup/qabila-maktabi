// 3-bosqich: kalitsiz ochish va hikoya (DIZAYN 7-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { caesar, ui, art, caesarUi, practice } = QK;

  const CRACKS = 4; // kalitsiz ochiladigan so'zlar soni (har birida 28 tagacha kalit sinaladi — 6 tasi ko'plik qiladi)

  // Hikoya: art — rasm (QK.art.story), lines — Oqsoqol gaplari (har biri alohida pufak)
  const SCENES = [
    { art: "caesar", lines: ["Yuliy Sezar Qadimgi Rimning sarkardasi va hukmdori edi.", "U taxminan 2000 yil oldin yashagan."] },
    { art: "scroll", lines: ["U sarkardalariga maxfiy xatlar yuborgan.", "Xat dushman qoʻliga tushsa ham oʻqib boʻlmasin deb, harflarni 3 ga surgan."] },
    { art: "key", lines: ["Buni Rim tarixchisi Svetoniy yozib qoldirgan.", "Kalit — sir. Kalitni bilgan odam xatni bir zumda ochadi."] },
    { art: "keys", caption: "1, 2, 3 … 28", lines: ["Lekin kalit atigi 28 xil. Sen hozir oʻzing sinab koʻrding!"] },
    { art: "book", lines: ["IX asrda olim Al-Kindiy harflar qanchalik koʻp uchrashiga qarab shifrni ochishni oʻylab topdi.", "Esingdami, Morzeda eng koʻp ishlatiladigan harf eng qisqa edi?"] },
    { art: "phone", lines: ["Bugun telefondagi xabarlar ham shifrlanadi.", "Faqat kalitlar juda uzun — hammasini sinash uchun millionlab yil kerak."] },
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
    ui.bubble("elder", "Kalitni oʻzgartir. Maʼnoli soʻz chiqsa — «Topdim!»");
    return practice.tries({
      setup: (submit) => ui.control().append(ui.button("Topdim!", () => submit(state.getKey()))),
      check: (key) => key === ex.key,
      hint: () => ui.bubble("elder", "↻ Bu soʻz maʼnoli emas. Kalitni yana oʻzgartir — «−» bilan orqaga ham yursa boʻladi."),
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
    ui.paper("");
    ui.raisePaper(false);
    await ui.say("elder", "Dushman xatni tutib oldi. Lekin u kalitni bilmaydi!");
    await ui.say("elder", "Sen ham kalitni bilmaysan. Kalitni oʻzgartirib, maʼnoli soʻz chiqquncha sinab koʻr.");
    await ui.say("elder", `${CRACKS} ta soʻzni och. Kalit borgan sari uzoqlashadi!`);
    await practice.exercises({
      need: CRACKS,
      next: (prev, correct, tier) => caesar.makeCrack(prev, null, caesar.crackLevel(correct, tier)),
      run: crackWord,
      praise: (ex) => `Kalit ${ex.key} ekan: ${ex.word}.`,
    });
    await ui.say("elder", "Kalit atigi 28 xil. Hammasini sinab chiqish oson — shuning uchun Sezar shifri kuchsiz.");
    for (const sc of SCENES) await showScene(sc);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

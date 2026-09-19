// So'zni ochish/shifrlash va mashq sikllari (QOIDALAR 4.4, 4.5).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { caesar, ui, sound, caesarUi } = QK;

  const PRAISE = ["✓ Barakalla!", "✓ Zoʻr!", "✓ Toʻppa-toʻgʻri!"];

  // Bitta so'z. mode "decode": kataklar ustida shifr, bola jadvaldan oddiy harfni tanlaydi;
  // "encode": ustida oddiy harflar, bola shifrni tanlaydi. Hamma katak to'lganda avtomatik tekshiriladi.
  // 1-xato: jadval kaliti noto'g'ri bo'lsa — kalit haqida maslahat, aks holda noto'g'ri kataklar ↻;
  // 2-xato: to'g'ri javob ko'rsatiladi. Natija: true — bola o'zi to'g'ri bajardi.
  function solveWord({ plain, key, mode, tbl, opened }) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const cipher = caesar.encrypt(plain, key);
    const shown = mode === "decode" ? cipher : plain;
    const answer = mode === "decode" ? plain : cipher;
    QK.current = { answer: answer.join(" "), key }; // tekshirish uchun
    const box = ui.h("div", { class: "cbox" });
    if (opened && opened.length) box.append(ui.h("div", { class: "opened", text: opened.join(" ") }));
    ui.work().append(box);
    caesarUi.keyControl(box, tbl);
    const slots = caesarUi.wordSlots(box, shown);
    let wrongCount = 0;

    return ui.settle((finish) => {
      function done(ok) {
        slots.lock();
        tbl.setPick(null);
        finish(ok);
      }
      function check() {
        const wrong = caesar.checkLetters(answer, slots.letters());
        if (!wrong.length) {
          sound.play("correct");
          ui.pose("apprentice", "happy", 900);
          done(true);
          return;
        }
        sound.play("retry");
        ui.pose("apprentice", "think", 1000);
        wrongCount++;
        if (wrongCount === 1) {
          if (tbl.getKey() !== key) {
            slots.clearAll();
            ui.bubble("elder", `Jadval kaliti ${tbl.getKey()} emas, ${key} boʻlishi kerak.`);
          } else {
            slots.markWrong(wrong);
            ui.bubble("elder", "↻ Belgilangan harflarni qaytadan top.");
          }
          return;
        }
        slots.showSolution(answer);
        done(false);
      }
      tbl.setPick((p, c) => {
        if (slots.fill(mode === "decode" ? p : c) && slots.isFull()) check();
      });
    });
  }

  // Mashq: count ta to'g'ri javob; next(prev, correct) → { word, key }.
  // Doiralar: total ta, doneBefore tasi oldindan to'la (1-bosqichda xat birinchisini to'ldiradi).
  // 2-xatodan keyin yangi so'z beriladi, xato qilingani hisoblanmaydi.
  async function exercises({ count, total, doneBefore, mode, tbl, next, question, praise }) {
    let correct = 0;
    let prev = null;
    ui.setProgress(total, doneBefore);
    while (correct < count) {
      const ex = next(prev, correct);
      prev = ex;
      ui.paper(String(ex.key));
      ui.raisePaper(true);
      ui.bubble("elder", question(ex));
      const ok = await solveWord({ plain: caesar.tokenize(ex.word), key: ex.key, mode, tbl });
      if (ok) {
        correct++;
        ui.setProgress(total, doneBefore + correct);
        await ui.say("elder", `${PRAISE[(correct - 1) % PRAISE.length]} ${praise(ex)}`);
      } else {
        await ui.say("elder", "Toʻgʻri javob ekranda. Endi yangi soʻz.");
      }
    }
  }

  QK.common = { PRAISE, solveWord, exercises };
})(window);

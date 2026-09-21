// Rim toshi: umumiy sahna qismlari — xato izohlari, tosh, misol satri, Rim yozuvida javob.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { roman, ui, sound, art, romanUi, practice } = QK;

  // Qiymati to'g'ri, lekin yozuvi nostandart bo'lganda (roman.mistake)
  const MISTAKE = {
    repeat: "Qiymati toʻgʻri! Lekin bir belgi 3 martadan koʻp yozilmaydi: IIII emas — IV.",
    twice: "Qiymati toʻgʻri! Lekin V va L ikki marta yozilmaydi: VV emas — X.",
    subtract: "Qiymati toʻgʻri! Lekin ayirishda faqat IV, IX, XL, XC ishlatiladi.",
  };

  // Tosh lavha va ustidagi yozuv (rasm ichida matn yo'q — yozuv HTML'da)
  const stone = (text) => ui.h("div", { class: "stone" },
    ui.h("div", { class: "stone-art", html: art.stone() }),
    ui.h("div", { class: "stone-text", text }));

  // Misol satri: XII + VIII = ? (natija berilsa — javob bilan)
  const expr = (a, op, b, result) => ui.h("div", { class: "expr" },
    romanUi.word(a),
    ui.h("span", { text: op }),
    romanUi.word(b),
    ui.h("span", { text: "=" }),
    result ? romanUi.word(result) : ui.h("span", { text: "?" }));

  const answerLine = (text) => ui.h("div", { class: "answer", text });

  // Yozish maslahati: 42 = 40 + 2 (bir xonali sonlarda — jonli qiymatga ishora)
  function partsHint(n) {
    const parts = roman.partsOf(n);
    if (parts.length > 1) return `↻ ${n} = ${parts.join(" + ")}. Avval ${parts[0]} ni, keyin ${parts[1]} ni yoz.`;
    return `↻ Yozuving yonida qiymati koʻrinadi. ${n} boʻlguncha tuzat.`;
  }

  // O'rgatish qismi: to'g'ri yozilguncha davom etadi, jonli qiymat yoniq (xato hisoblanmaydi)
  async function buildUntil(target, lead) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const answer = roman.toRoman(target);
    const box = ui.h("div", { class: "rbox" }, ui.h("div", { class: "target", text: String(target) }));
    ui.work().append(box);
    ui.bubble("elder", lead);
    let wrong = 0;
    await ui.settle((done) => {
      romanUi.keyboard({
        live: true,
        onSubmit: (value) => {
          if (value === answer) {
            done();
            return;
          }
          sound.play("retry");
          ui.pose("apprentice", "think", 1000);
          wrong++;
          if (roman.fromRoman(value) === target) ui.bubble("elder", "↻ " + MISTAKE[roman.mistake(value)]);
          else if (wrong === 1) ui.bubble("elder", `↻ Hozir ${roman.fromRoman(value)}. ${target} kerak — kattasidan boshla.`);
          else ui.bubble("elder", `↻ ${target} = ${answer}. Shuni yoz.`);
        },
      });
    });
    sound.play("correct");
    ui.pose("apprentice", "happy", 900);
    ui.clearControl();
    box.append(romanUi.word(answer, "lg"));
  }

  // Mashqda javob Rim yozuvida: 1-xato — jonli qiymat yoqiladi va maslahat beriladi
  // (qiymati to'g'ri, yozuvi nostandart bo'lsa — maxsus izoh), 2-xato — solution(javob).
  function romanAnswer({ target, hint, solution }) {
    const answer = roman.toRoman(target);
    let kb = null;
    return practice.tries({
      setup: (submit) => { kb = romanUi.keyboard({ live: false, onSubmit: submit }); },
      check: (value) => value === answer,
      hint: (value) => {
        kb.setLive(true);
        kb.shake();
        if (roman.fromRoman(value) === target) ui.bubble("elder", "↻ " + MISTAKE[roman.mistake(value)]);
        else hint(value);
      },
      solution: () => solution(answer),
    });
  }

  // O'rgatish qismidagi hisob: to'g'ri javobgacha raqam klaviaturasi
  async function askUntil(answer, hintText) {
    for (;;) {
      const value = await ui.askNumber(3);
      if (value === answer) {
        sound.play("correct");
        ui.pose("apprentice", "happy", 900);
        return;
      }
      sound.play("retry");
      ui.pose("apprentice", "think", 1000);
      ui.bubble("elder", "↻ " + hintText);
    }
  }

  QK.common = { MISTAKE, stone, expr, answerLine, partsHint, buildUntil, romanAnswer, askUntil };
})(window);

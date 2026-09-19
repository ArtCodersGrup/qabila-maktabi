// O'qish va yozish: bitta xabar/topshiriq va 3 ta to'g'ri javob sikllari (QOIDALAR 4.4, 4.5).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { morse, ui, sound, morseUi } = QK;

  const PRAISE = ["✓ Barakalla!", "✓ Zoʻr!", "✓ Toʻppa-toʻgʻri!"];

  // Bitta xabarni o'qish. Natija: true — bola o'zi to'g'ri o'qidi.
  // mode: "demo"   — xato bo'lsa qayta urinadi (ko'rsatish qismi, DIZAYN 5.1);
  //       "graded" — 1-xato: noto'g'ri kataklar belgilanadi, 2-xato: yechim ko'rsatiladi (5.3);
  //       "free"   — baholanmaydi, 1-xatodayoq yechim ko'rsatiladi (XAYR, 6.2).
  // fresh — qo'llanmada miltillaydigan yangi harflar.
  function readMessage(word, letters, mode, fresh) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    QK.current = { answer: word }; // tekshirish uchun
    const box = ui.h("div", { class: "read-box" });
    ui.work().append(box);
    const slots = morseUi.messageSlots(box, word);
    const check = ui.button("Tekshir", () => submit());
    const listen = ui.button("Tinglash", () => morseUi.play(slots.codes, slots.groups), "secondary");
    ui.control().append(ui.h("div", { class: "msg-tools" }, listen, check));
    const update = () => { check.disabled = !slots.isFull(); };
    morseUi.guide(letters, { fresh, onPick: (l) => { if (slots.fill(l)) update(); } });
    update();

    let wrongCount = 0;
    let finish = null;
    const done = ui.settle((resolve) => { finish = resolve; });

    function end(ok) {
      slots.lock();
      ui.clearControl();
      morseUi.stopPlaying();
      finish(ok);
    }

    function submit() {
      if (!slots.isFull()) return;
      const wrong = morse.checkRead(word, slots.letters());
      if (!wrong.length) {
        sound.play("correct");
        ui.pose("apprentice", "happy", 900);
        end(true);
        return;
      }
      sound.play("retry");
      ui.pose("apprentice", "think", 1000);
      wrongCount++;
      if (mode === "demo" || (mode === "graded" && wrongCount === 1)) {
        slots.markWrong(wrong);
        update();
        ui.bubble("elder", mode === "demo" ? "Kodni diqqat bilan solishtir." : "↻ Belgilangan harflarni qaytadan top.");
        return;
      }
      slots.showSolution();
      end(false);
    }

    return done;
  }

  // Bitta so'zni Morze bilan yozish. Natija: true — bola o'zi to'g'ri yozdi.
  // 1-xato: noto'g'ri guruhlar ↻, qo'llanmada kerakli harflar yonadi, terilgani o'chmaydi;
  // 2-xato: to'g'ri kod ko'rsatiladi (DIZAYN 6.2).
  function writeWord(target, letters) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    QK.current = { answer: target, code: morse.encodeWord(target).join(" ") }; // tekshirish uchun
    const box = ui.h("div", { class: "write-box" });
    ui.work().append(box);
    const g = morseUi.guide(letters);
    let wrongCount = 0;
    return ui.settle((finish) => {
      const input = morseUi.morseInput(box, (symbols) => {
        const res = morse.checkTyped(target, symbols);
        input.mark(res.wrong, res.read);
        if (res.ok) {
          sound.play("correct");
          ui.pose("apprentice", "happy", 900);
          ui.clearControl();
          finish(true);
          return;
        }
        sound.play("retry");
        ui.pose("apprentice", "think", 1000);
        wrongCount++;
        if (wrongCount === 1) {
          g.highlight(new Set(target));
          const fix = res.groups.length < target.length ? "Harf yetmayapti — qoʻsh." : "↻ Belgilanganlarini tuzat.";
          ui.bubble("apprentice", `Men oʻqidim: ${res.read}, kerak edi: ${target}. ${fix}`);
          return;
        }
        ui.clearControl();
        box.append(morseUi.wordCodes(target).el);
        finish(false);
      });
    });
  }

  // 1-bosqich mashqi: 3 ta to'g'ri o'qilgan xabar (DIZAYN 5.3). 2-to'g'ri javobdan keyin 2-to'plam ochiladi.
  async function readExercises() {
    let correct = 0;
    let prev = null;
    let shownLevel = 1;
    ui.setProgress(3, 0);
    while (correct < 3) {
      const level = morse.readLevel(correct);
      let fresh = null;
      if (level > shownLevel) {
        shownLevel = level;
        fresh = morse.SETS[level - 1];
        await ui.say("elder", `Qabila yangi harflarni oʻrgandi: ${fresh.join(", ")}!`);
      }
      const word = morse.pickMessage(correct, prev);
      prev = word;
      ui.bubble("apprentice", "Qabila xabar yubordi. Oʻqib ber!");
      const ok = await readMessage(word, morse.lettersUpTo(level), "graded", fresh);
      if (ok) {
        correct++;
        ui.setProgress(3, correct);
        await ui.say("elder", `${PRAISE[(correct - 1) % PRAISE.length]} Bu — ${word}.`);
      } else {
        await ui.say("elder", `Toʻgʻri javob: ${word}. Endi yangi xabar.`);
      }
    }
    ui.hideProgress();
  }

  // 2-bosqich mashqi: 3 ta to'g'ri yozilgan javob (DIZAYN 6.2)
  async function writeExercises() {
    let correct = 0;
    let prev = null;
    const letters = morse.lettersUpTo(3);
    ui.setProgress(3, 0);
    while (correct < 3) {
      const task = morse.pickTask(prev);
      prev = task;
      ui.bubble("elder", `Qabila soʻraydi: «${task.q}» Javob ber: ${task.a}.`);
      const ok = await writeWord(task.a, letters);
      if (ok) {
        correct++;
        ui.setProgress(3, correct);
        await ui.say("apprentice", `Men oʻqidim: ${task.a}! ${PRAISE[(correct - 1) % PRAISE.length]}`);
      } else {
        await ui.say("elder", "Toʻgʻri kod ekranda. Endi yangi topshiriq.");
      }
    }
    ui.hideProgress();
  }

  QK.common = { PRAISE, readMessage, writeWord, readExercises, writeExercises };
})(window);

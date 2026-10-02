// O'qish va yozish: bitta xabar/topshiriq va mashq sikllari (QOIDALAR 4.4, 4.5) — umumiy practice.js ustida:
// bosqichga qarab 4 / 5 ta to'g'ri javob, yulduzlar, seriya, qiyin rejim.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { morse, ui, sound, morseUi, practice } = QK;

  const PRAISE = practice.PRAISE;

  // Ikki urinish, lekin statistikaga (yulduzlar, seriya) kirmaydi — ko'rsatish qismidagi savollar uchun.
  // Mashqdagi savollar practice.tries orqali o'tadi (qiyin rejimda bitta urinish).
  function localTries({ setup, check, hint, solution }) {
    let wrong = 0;
    let finished = false;
    return ui.settle((finish) => setup((value) => {
      if (finished) return;
      if (check(value)) {
        finished = true;
        sound.play("correct");
        ui.pose("apprentice", "happy", 900);
        ui.clearControl();
        finish(true);
        return;
      }
      sound.play("retry");
      ui.pose("apprentice", "think", 1000);
      wrong++;
      if (wrong === 1) {
        hint(value);
      } else {
        finished = true;
        ui.clearControl();
        solution(value);
        finish(false);
      }
    }));
  }

  // Bitta xabarni o'qish. Natija: true — bola o'zi to'g'ri o'qidi.
  // mode: "demo"   — xato bo'lsa qayta urinadi (ko'rsatish qismi, DIZAYN 5.1);
  //       "graded" — 1-xato: noto'g'ri kataklar belgilanadi va yashirin kodlar ochiladi, 2-xato: yechim (5.3);
  //       "free"   — baholanmaydi, 1-xatodayoq yechim ko'rsatiladi (XAYR, 6.2).
  // opts: fresh — qo'llanmada miltillaydigan yangi harflar; hidden — kodi yashirin harflar (yoddan o'qiladi,
  // «Qoʻllanmaga qarash» ularni qisqa vaqtga ochadi); unit — "Tinglash" tezligi (ms).
  function readMessage(word, letters, mode, opts) {
    opts = opts || {};
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    QK.current = { answer: word }; // tekshirish uchun
    const box = ui.h("div", { class: "read-box" });
    ui.work().append(box);
    const slots = morseUi.messageSlots(box, word);
    let send = () => {};
    const listen = ui.button("Tinglash", () => morseUi.play(slots.codes, slots.groups, null, opts.unit), "secondary");
    const check = mode === "demo" ? null : ui.button("Tekshir", () => send());
    const update = () => {
      if (mode === "demo") { if (slots.isFull()) send(); }
      else check.disabled = !slots.isFull();
    };
    const g = morseUi.guide(letters, { fresh: opts.fresh, hidden: opts.hidden, onPick: (l) => { if (slots.fill(l)) update(); } });
    const peek = g.hasHidden() ? ui.button("Qoʻllanmaga qarash", () => g.peek(morse.PEEK_MS), "secondary") : null;
    ui.control().append(ui.h("div", { class: "msg-tools" }, listen, peek, check));

    function end() {
      slots.lock();
      ui.clearControl();
      morseUi.stopPlaying();
      g.showCodes();
    }

    if (mode === "graded") {
      return practice.tries({
        setup: (submit) => {
          send = () => { if (slots.isFull()) submit(slots.letters()); };
          update();
        },
        check: (given) => {
          const ok = !morse.checkRead(word, given).length;
          if (ok) end();
          return ok;
        },
        hint: (given) => {
          const hadHidden = g.hasHidden();
          slots.markWrong(morse.checkRead(word, given));
          g.showCodes(); // maslahat javobni aytmaydi — asbobni (qo'llanma kodlarini) qaytaradi
          update();
          ui.bubble("elder", hadHidden
            ? "↻ Qoʻllanmadagi kodlarni ochdim. Belgilangan harflarni qaytadan top."
            : "↻ Belgilangan harflarni qaytadan top.");
        },
        solution: () => {
          slots.showSolution();
          end();
        },
      });
    }

    // demo / free — statistikaga kirmaydi
    return ui.settle((finish) => {
      send = () => {
        if (!slots.isFull()) return;
        const wrong = morse.checkRead(word, slots.letters());
        if (!wrong.length) {
          sound.play("correct");
          ui.pose("apprentice", "happy", 900);
          end();
          finish(true);
          return;
        }
        sound.play("retry");
        ui.pose("apprentice", "think", 1000);
        if (mode === "demo") {
          slots.markWrong(wrong);
          update();
          ui.bubble("elder", "Kodni diqqat bilan solishtir.");
          return;
        }
        slots.showSolution();
        end();
        finish(false);
      };
      update();
    });
  }

  // Bitta so'zni Morze bilan yozish. Natija: true — bola o'zi to'g'ri yozdi.
  // 1-xato: noto'g'ri guruhlar ↻, qo'llanmada kerakli harflar yonadi (yashirin bo'lsa — ochiladi), terilgani o'chmaydi;
  // 2-xato: to'g'ri kod ko'rsatiladi (DIZAYN 6.2).
  // opts: graded — mashq savoli (practice statistikasi, qiyin rejimda bitta urinish);
  //       hide — qo'llanma kodlari yashirin: bola yoddan yozadi yoki «Qoʻllanmaga qarash»ni bosadi.
  function writeWord(target, letters, opts) {
    opts = opts || {};
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    QK.current = { answer: target, code: morse.encodeWord(target).join(" ") }; // tekshirish uchun
    const box = ui.h("div", { class: "write-box" });
    ui.work().append(box);
    const g = morseUi.guide(letters, { hidden: opts.hide ? letters : null });
    if (g.hasHidden()) box.append(ui.button("Qoʻllanmaga qarash", () => g.peek(morse.PEEK_MS), "secondary sm"));
    let input = null;
    const spec = {
      setup: (submit) => { input = morseUi.morseInput(box, submit); },
      check: (symbols) => {
        const res = morse.checkTyped(target, symbols);
        input.mark(res.wrong, res.read);
        return res.ok;
      },
      hint: (symbols) => {
        const res = morse.checkTyped(target, symbols);
        g.showCodes();
        g.highlight(new Set(target));
        let fix;
        if (morse.missingGap(target, symbols)) fix = "Harflar orasiga «harf oraligʻi» qoʻy.";
        else if (res.groups.length < target.length) fix = "Harf yetmayapti — qoʻsh.";
        else fix = "↻ Belgilanganlarini tuzat.";
        ui.bubble("apprentice", `Men oʻqidim: ${res.read}, kerak edi: ${target}. ${fix}`);
      },
      solution: () => {
        g.showCodes();
        input.showSolution(target);
      },
    };
    return opts.graded ? practice.tries(spec) : localTries(spec);
  }

  // 1-bosqich mashqi (DIZAYN 5.3): bosqichga qarab 4 ta (qiyin rejimda 7) to'g'ri o'qilgan xabar.
  // Reja morse.makeReadTask da: to'plamlar ochilishi, kodlarning yashirilishi, "Tinglash" tezlashishi.
  function readExercises() {
    let shownLevel = 1;
    return practice.exercises({
      next: (prev, correct, tier) => morse.makeReadTask(correct, prev, null, tier),
      run: async (ex) => {
        let fresh = null;
        if (ex.level > shownLevel) {
          fresh = morse.SETS.slice(shownLevel, ex.level).flat();
          shownLevel = ex.level;
          await ui.say("elder", `Qabila yangi harflarni oʻrgandi: ${fresh.join(", ")}!`);
        }
        const hidden = morse.lettersUpTo(ex.hidden);
        ui.bubble("apprentice", hidden.length
          ? "Qabila xabar yubordi. Kodlarning bir qismi yashirin — eslab koʻr yoki qoʻllanmaga qarab ol!"
          : "Qabila xabar yubordi. Oʻqib ber!");
        return readMessage(ex.word, morse.lettersUpTo(ex.level), "graded", { fresh, hidden, unit: ex.unit });
      },
      praise: (ex) => `Bu — ${ex.word}.`,
    });
  }

  // 2-bosqich mashqi (DIZAYN 6.2): 5 ta (qiyin rejimda 7) to'g'ri yozilgan javob; javoblar zina bilan uzayadi,
  // 2-to'g'ri javobdan keyin qo'llanma kodlari yashirinadi
  function writeExercises() {
    const letters = morse.lettersUpTo(3);
    return practice.exercises({
      next: (prev, correct, tier) => morse.makeWriteTask(correct, prev, null, tier),
      run: (task) => {
        ui.bubble("elder", `Qabila soʻraydi: «${task.q}» Javob ber: ${task.a}.`);
        return writeWord(task.a, letters, { graded: true, hide: task.hide });
      },
      praise: (task) => `Shogird oʻqidi: ${task.a}!`,
    });
  }

  QK.common = { PRAISE, readMessage, writeWord, readExercises, writeExercises };
})(window);

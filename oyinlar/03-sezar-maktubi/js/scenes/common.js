// So'zni ochish/shifrlash va mashq sikli (QOIDALAR 4.4, 4.5) — umumiy practice.js ustida:
// bosqichga qarab 4 / 5 / 6 ta to'g'ri javob, yulduzlar, seriya, qiyin rejim.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { caesar, ui, caesarUi, practice } = QK;

  const PRAISE = practice.PRAISE;

  // Bitta so'z. mode "decode": kataklar ustida shifr, bola jadvaldan oddiy harfni tanlaydi;
  // "encode": ustida oddiy harflar, bola shifrni tanlaydi. Hamma katak to'lganda avtomatik tekshiriladi.
  // blind — jadvalning pastki qatori yashirin: jadval oddiy alifbo klaviaturasi, bola harfni o'zi suradi.
  // 1-xato: yashirin qator ochiladi / jadval kaliti noto'g'ri bo'lsa — kalit haqida maslahat / noto'g'ri kataklar ↻;
  // 2-xato: to'g'ri javob ko'rsatiladi. Natija: true — bola o'zi to'g'ri bajardi.
  function solveWord({ plain, key, mode, tbl, opened, blind }) {
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
    let hidden = !!blind;
    tbl.setBlind(hidden);
    if (hidden) {
      // Kalit oldindan qo'yiladi: maslahat qatorni ochganda jadval to'g'ri turadi
      tbl.setKey(key);
      box.append(ui.h("div", { class: "blind-note", text: `Kalit: ${key} · pastki qator yashirin` }));
    } else {
      caesarUi.keyControl(box, tbl);
    }
    const slots = caesarUi.wordSlots(box, shown);
    const done = () => {
      slots.lock();
      tbl.setPick(null);
    };
    let last = 0;

    return practice.tries({
      setup: (submit) => {
        // practice.tries 400 ms ichidagi ikkinchi javobni tashlab yuboradi — shuning uchun oraliq saqlanadi
        const send = () => {
          if (!slots.isFull()) return;
          const wait = 450 - (Date.now() - last);
          if (wait > 0) {
            setTimeout(send, wait);
            return;
          }
          last = Date.now();
          submit(slots.letters());
        };
        tbl.setPick((p, c) => {
          // Yashirin qatorda bola javob harfining o'zini bosadi; ochiq jadvalda — ustunni
          if (slots.fill(hidden || mode === "decode" ? p : c) && slots.isFull()) send();
        });
      },
      check: (given) => {
        const ok = !caesar.checkLetters(answer, given).length;
        if (ok) done();
        return ok;
      },
      hint: (given) => {
        const wrong = caesar.checkLetters(answer, given);
        if (hidden) {
          hidden = false;
          tbl.setBlind(false);
          slots.markWrong(wrong);
          ui.bubble("elder", "↻ Jadvalning pastki qatorini ochdim. Belgilangan harflarni qaytadan top.");
        } else if (tbl.getKey() !== key) {
          slots.clearAll();
          ui.bubble("elder", `Jadval kaliti ${tbl.getKey()} emas, ${key} boʻlishi kerak.`);
        } else {
          slots.markWrong(wrong);
          ui.bubble("elder", "↻ Belgilangan harflarni qaytadan top.");
        }
      },
      solution: () => {
        tbl.setBlind(false);
        slots.showSolution(answer);
        done();
      },
    });
  }

  // Mashq: `need` ta to'g'ri javob (berilmasa — bosqich bo'yicha); next(prev, correct, tier) → { word, key, blind }.
  // 2-xatodan keyin yangi so'z beriladi, xato qilingani hisoblanmaydi.
  function exercises({ need, mode, tbl, next, question, praise }) {
    return practice.exercises({
      need,
      next,
      run: (ex) => {
        ui.paper(String(ex.key));
        ui.raisePaper(true);
        ui.bubble("elder", question(ex));
        return solveWord({ plain: caesar.tokenize(ex.word), key: ex.key, mode, tbl, blind: ex.blind });
      },
      praise,
    });
  }

  QK.common = { PRAISE, solveWord, exercises };
})(window);

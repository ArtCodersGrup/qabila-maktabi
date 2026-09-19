// Naqshlarni topish, urinishlar va mashq sikli (QOIDALAR 4.4, 4.5).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { lamps, ui, sound, lampsUi } = QK;

  const PRAISE = ["✓ Barakalla!", "✓ Zoʻr!", "✓ Toʻppa-toʻgʻri!"];

  // Barcha naqshlarni topish: bola chiroqlarni yoqib "Saqlash"ni bosadi; takror — "bor edi".
  // labelFor(pattern) — devorda naqsh ostidagi yozuv (ixtiyoriy).
  function findAll({ count, states, labelFor }) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const total = lamps.count(states, count);
    const found = new Set();
    const box = ui.h("div", { class: "lbox" });
    ui.work().append(box);
    const row = lampsUi.lampRow(box, { count, states });
    const counter = ui.h("div", { class: "found-count" });
    box.append(counter);
    const wallEl = lampsUi.wall(box, states);
    const renderCount = () => { counter.textContent = `Topilgan naqshlar: ${found.size}`; };
    renderCount();

    return ui.settle((done) => {
      const save = () => {
        const p = row.get();
        const key = lamps.patternKey(p);
        if (found.has(key)) {
          sound.play("retry");
          row.shake();
          ui.toast("Bu naqsh bor edi! Boshqasini yasa.");
          return;
        }
        found.add(key);
        sound.play("correct");
        wallEl.add(p, labelFor ? labelFor(p) : null);
        renderCount();
        if (found.size === total) {
          ui.clearControl();
          done();
        }
      };
      const help = () => {
        const missing = lamps.allPatterns(states, count).find((p) => !found.has(lamps.patternKey(p)));
        if (!missing) return;
        row.set(missing);
        ui.toast("Mana bittasi — «Saqlash»ni bos!");
      };
      ui.control().append(ui.h("div", { class: "choice-row" },
        ui.button("Saqlash", save),
        ui.button("Yordam", help, "secondary")));
    });
  }

  // Bitta vazifaga ikki urinish. setup(submit) — ekranni chizadi; check(qiymat) → bool.
  // 1-xato — hint(), 2-xato — solution(). Natija: true — bola o'zi topdi.
  function tries({ setup, check, hint, solution }) {
    let wrong = 0;
    return ui.settle((finish) => {
      setup((value) => {
        if (check(value)) {
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
          hint();
        } else {
          ui.clearControl();
          solution();
          finish(false);
        }
      });
    });
  }

  // Raqam klaviaturasi bilan javob: 1-xato — hint(), 2-xato — solution()
  async function numberTries({ answer, hint, solution }) {
    for (let wrong = 0; ; ) {
      const value = await ui.askNumber(2);
      if (value === answer) {
        sound.play("correct");
        ui.pose("apprentice", "happy", 900);
        return true;
      }
      sound.play("retry");
      ui.pose("apprentice", "think", 1000);
      wrong++;
      if (wrong === 1) {
        hint();
      } else {
        solution();
        return false;
      }
    }
  }

  // Mashq: 3 ta to'g'ri javob; next(prev, correct) → vazifa; run(vazifa) → Promise<bool>.
  // Xato qilingan vazifa hisoblanmaydi, yangisi beriladi.
  async function exercises({ next, run, praise }) {
    let correct = 0;
    let prev = null;
    ui.setProgress(3, 0);
    while (correct < 3) {
      const task = next(prev, correct);
      prev = task;
      QK.current = task; // tekshirish uchun
      const ok = await run(task);
      if (ok) {
        correct++;
        ui.setProgress(3, correct);
        await ui.say("elder", `${PRAISE[(correct - 1) % PRAISE.length]} ${praise(task)}`);
      } else {
        await ui.say("elder", "Toʻgʻri javob ekranda. Endi yangi misol.");
      }
    }
    ui.hideProgress();
  }

  QK.common = { PRAISE, findAll, tries, numberTries, exercises };
})(window);

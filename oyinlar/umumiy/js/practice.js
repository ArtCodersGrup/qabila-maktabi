// Mashq sikli va bitta vazifaga ikki urinish (QOIDALAR 4.4, 4.5). 4- va 5-o'yin ishlatadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const PRAISE = ["✓ Barakalla!", "✓ Zoʻr!", "✓ Toʻppa-toʻgʻri!"];

  // Bitta vazifaga ikki urinish. setup(submit) — ekranni chizadi; check(qiymat) → bool.
  // 1-xato — hint(qiymat), 2-xato — solution(qiymat). Natija: true — bola o'zi topdi.
  function tries({ setup, check, hint, solution }) {
    let wrong = 0;
    let busy = false; // ikki marta tez bosish ikkita xato bo'lib hisoblanmasin
    return ui.settle((finish) => {
      setup((value) => {
        if (busy) return;
        busy = true;
        setTimeout(() => { busy = false; }, 400);
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
          hint(value);
        } else {
          ui.clearControl();
          solution(value);
          finish(false);
        }
      });
    });
  }

  // Raqam klaviaturasi bilan javob: 1-xato — hint(), 2-xato — solution()
  async function numberTries({ answer, hint, solution, maxLen }) {
    for (let wrong = 0; ; ) {
      const value = await ui.askNumber(maxLen || 3);
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

  QK.practice = { PRAISE, tries, numberTries, exercises };
})(window);

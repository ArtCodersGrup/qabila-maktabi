// Mashq sikli va bitta vazifaga ikki urinish (QOIDALAR 4.4, 4.5). Deyarli barcha o'yinlar ishlatadi.
// 2026-10-02: bosqichga qarab 4 / 5 / 6 ta to'g'ri javob (qiyin rejimda 7 va bitta urinish),
// qiyinlik zinasi tier (generatorga uchinchi argument), ketma-ket to'g'ri javob seriyasi,
// xatolar statistikasi — yulduzlarni app.js shu statistikadan hisoblaydi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound } = QK;

  const PRAISE = ["✓ Barakalla!", "✓ Zoʻr!", "✓ Toʻppa-toʻgʻri!"];
  const NEED = [4, 5, 6]; // 1-, 2-, 3-bosqich; 4+ bosqich — 6
  const HARD_NEED = 7;

  // Joriy bosqich va rejim — app.js har bosqich boshida setStage() bilan qo'yadi
  let stage = 1;
  let hard = false;
  const stats = { mistakes: 0, solutions: 0, streak: 0, bestStreak: 0 };

  function setStage(s, isHard) {
    stage = s || 1;
    hard = !!isHard;
    stats.mistakes = 0;
    stats.solutions = 0;
    stats.streak = 0;
    stats.bestStreak = 0;
  }
  const isHard = () => hard;
  // Bosqich uchun nechta to'g'ri javob kerak (matnlarda ham shu ishlatiladi: `${QK.practice.need()} ta`)
  const need = () => (hard ? HARD_NEED : NEED[Math.min(stage, NEED.length) - 1]);
  // Qiyinlik zinasi: 0 — birinchi javoblar, 1 — o'rta, 2 — oxirgi (qiyin rejimda doim 2)
  const tier = (correct) => (hard ? 2 : correct < 2 ? 0 : correct < 4 ? 1 : 2);
  // Yulduzlar: xatosiz — 3, xato bo'ldi lekin yechim ko'rsatilmadi — 2, yechim ko'rsatildi — 1
  const stars = () => (stats.solutions ? 1 : stats.mistakes ? 2 : 3);

  function onCorrect() {
    stats.streak++;
    if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak;
    if (stats.streak === 3) ui.toast("🔥 3 ta ketma-ket!");
    else if (stats.streak === 5) ui.toast("🔥🔥 5 ta ketma-ket!");
    else if (stats.streak === 7) ui.toast("🔥🔥🔥 7 ta ketma-ket!");
  }

  function onWrong() {
    stats.mistakes++;
    stats.streak = 0;
  }

  // Bitta vazifaga ikki urinish. setup(submit) — ekranni chizadi; check(qiymat) → bool.
  // 1-xato — hint(qiymat), 2-xato — solution(qiymat). Qiyin rejimda — bitta urinish.
  // Natija: true — bola o'zi topdi.
  function tries({ setup, check, hint, solution }) {
    let wrong = 0;
    let busy = false; // ikki marta tez bosish ikkita xato bo'lib hisoblanmasin
    let finished = false; // yakunlangandan keyin (masalan, muharrirda Ctrl+Enter) javob qabul qilinmaydi
    return ui.settle((finish) => {
      setup((value) => {
        if (busy || finished) return;
        busy = true;
        setTimeout(() => { busy = false; }, 400);
        if (check(value)) {
          finished = true;
          sound.play("correct");
          ui.pose("apprentice", "happy", 900);
          onCorrect();
          ui.clearControl();
          finish(true);
          return;
        }
        sound.play("retry");
        ui.pose("apprentice", "think", 1000);
        onWrong();
        wrong++;
        if (wrong === 1 && !hard) {
          hint(value);
        } else {
          finished = true;
          stats.solutions++;
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
        onCorrect();
        return true;
      }
      sound.play("retry");
      ui.pose("apprentice", "think", 1000);
      onWrong();
      wrong++;
      if (wrong === 1 && !hard) {
        hint();
      } else {
        stats.solutions++;
        solution();
        return false;
      }
    }
  }

  // Mashq: need() ta to'g'ri javob; next(prev, correct, tier) → vazifa; run(vazifa) → Promise<bool>.
  // Xato qilingan vazifa hisoblanmaydi, yangisi beriladi. { need: n } bilan sonni o'yin o'zi belgilashi mumkin.
  async function exercises({ next, run, praise, need: n }) {
    const total = n || need();
    let correct = 0;
    let prev = null;
    ui.setProgress(total, 0);
    while (correct < total) {
      const task = next(prev, correct, tier(correct));
      prev = task;
      QK.current = task; // tekshirish uchun
      const ok = await run(task);
      if (ok) {
        correct++;
        ui.setProgress(total, correct);
        await ui.say("elder", `${PRAISE[(correct - 1) % PRAISE.length]} ${praise(task)}`);
      } else {
        await ui.say("elder", "Toʻgʻri javob ekranda. Endi yangi misol.");
      }
    }
    ui.hideProgress();
  }

  QK.practice = {
    PRAISE, NEED, HARD_NEED, tries, numberTries, exercises,
    setStage, need, tier, isHard, stars, stats: () => ({ ...stats }),
  };
})(window);

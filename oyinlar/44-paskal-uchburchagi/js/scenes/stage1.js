// Kirish va 1-bosqich: uchburchakni qurish — har katak tepasidagi ikkitaning yig'indisi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, sanash: S, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.uchburchak() }));
    await ui.say("elder", "Oʻtgan oʻyinda C(5,3) ni hisoblash uchun 60 ni 6 ga boʻlgan eding.");
    await ui.say("apprentice", "Ha, uzun ish. Qisqaroq yoʻl bormi?");
    await ui.say("elder", "Bor. Faqat qoʻshish bilan. Fransuz olimi Blez Paskal yozib qoldirgan uchburchak.");
  }

  // Bola uchinchi qatorni o'zi to'ldiradi
  async function qur() {
    const host = common.box(true);
    host.append(common.note("Chekkalarga 1 yozamiz. Ichkarisi — tepasidagi ikki sonning yigʻindisi."));
    const joy = ui.h("div", {});
    host.append(joy);
    joy.append(common.uchburchak({ chek: 2 }));
    await ui.say("elder", "Uchinchi qatorni oʻzing toʻldir. Chekkalari — 1, ichida ikkita son bor.");
    for (const k of [1, 2]) {
      const [chap, ong] = L.tepa(3, k);
      joy.innerHTML = "";
      joy.append(common.uchburchak({ chek: 3, yashirin: { n: 3, k }, tepa: { n: 3, k } }));
      ui.bubble("elder", "Belgilangan ikki son: " + chap + " va " + ong + ".");
      await practice.numberTries({
        answer: Number(L.katak(3, k)),
        maxLen: 2,
        hint() { ui.toast(chap + " + " + ong + " ni hisobla."); },
        solution() { ui.toast("Javob: " + L.katak(3, k)); },
      });
      joy.innerHTML = "";
      joy.append(common.uchburchak({ chek: 3, belgi: { n: 3, k } }));
      await ui.sleep(300);
    }
    await ui.say("elder", "Shu qoida bilan uchburchak istagancha davom etadi.");
    for (let n = 4; n <= L.QATOR_SONI; n++) {
      joy.innerHTML = "";
      joy.append(common.uchburchak({ chek: n, qator: n }));
      await ui.sleep(260);
    }
    joy.innerHTML = "";
    joy.append(common.uchburchak({}));
    await ui.say("elder", "Faqat qoʻshdik — koʻpaytirish ham, boʻlish ham qilmadik.");
  }

  async function stage1() {
    await qur();
    await ui.say("elder", "Endi oʻzing: belgilangan katakda qaysi son turadi?");
    await practice.exercises({
      next: (prev) => L.katakTask(Math.random, prev),
      run: (task) => common.katakExercise(task),
      praise: (task) => task.hisob,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

// Kirish va 1-bosqich: kaptarlarni uyalarga joylash — kafolat buzilmaydi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.kaptarxona() }));
    await ui.say("elder", "Bu oʻyinda sanamaymiz. Bu safar isbotlaymiz.");
    await ui.say("apprentice", "Isbot? Qanday qilib?");
    await ui.say("elder", "Beshta kaptar, toʻrtta uya. Oʻzing joylab koʻr — hech bir uyada ikkita boʻlmasin.");
  }

  // Bola o'zi joylaydi: har qanday urinishda ham bitta uyada 2 ta bo'lib qoladi
  async function joyla(urinish) {
    const qutilar = L.joyBosh(L.UYA);
    let qoldi = L.KAPTAR;
    const host = common.box(true);
    host.append(common.note(urinish === 1
      ? "Kaptarni qoʻyish uchun uyani bos."
      : "Yana urinib koʻr — boshqacha joylab koʻr."));
    const joy = ui.h("div", {});
    const qol = ui.h("div", {});
    host.append(joy, qol);
    const chiz = (belgi) => {
      joy.innerHTML = "";
      qol.innerHTML = "";
      joy.append(common.uyalar(qutilar, { belgi, onPick: belgi ? null : tanla }));
      if (!belgi) qol.append(common.qolgan(qoldi));
    };
    let tugadi = null;
    const tanla = (k) => {
      if (qoldi <= 0) return;
      qutilar[k] += 1;
      qoldi--;
      QK.sound.play("click");
      chiz(null);
      if (qoldi === 0) {
        chiz(2);
        setTimeout(() => tugadi && tugadi(), 400);
      }
    };
    chiz(null);
    await ui.settle((done) => { tugadi = done; });
    const eng = L.engTola(qutilar);
    ui.clearControl();
    await ui.say("elder", "Eng toʻla uyada " + eng + " ta kaptar. Boshqacha qilib boʻlmadi.");
    return qutilar;
  }

  async function qoida() {
    await ui.say("apprentice", "Balki boshqa tartibda joylasam boʻlar?");
    await ui.say("elder", "Boʻlmaydi. Hisobla: har uyaga bittadan qoʻysang, 4 ta kaptar joylashadi.");
    const el = common.box(true);
    el.append(common.uyalar([1, 1, 1, 1]));
    el.append(common.hisobQator("4 uya × 1 = 4 ta — beshinchisi qayerga?"));
    await ui.say("elder", "Beshinchisi albatta band uyaga tushadi. Bu — Dirixle printsipi.");
    const q = common.box(false);
    q.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "n ta narsa, k ta quti" }),
      ui.h("div", { class: "formula-row", text: "Eng toʻla qutida kamida n ÷ k (yuqoriga yumalatilgan) ta boʻladi" }),
      ui.h("div", { class: "formula-row", text: "5 kaptar, 4 uya → kamida 2 ta" })));
    await ui.say("elder", "Sanamadik, sinab ham koʻrmadik — shunchaki isbotladik.");
  }

  async function stage1() {
    await joyla(1);
    await joyla(2);
    await qoida();
    await ui.say("elder", "Endi oʻzing hisobla.");
    await practice.exercises({
      next: (prev, correct, tier) => L.dirixleTask(Math.random, prev, tier),
      run: (task) => common.dirixleExercise(task),
      praise: (task) => task.hisob,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

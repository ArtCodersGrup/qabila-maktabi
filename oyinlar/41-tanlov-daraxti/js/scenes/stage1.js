// Kirish va 1-bosqich: tanlov daraxti va ko'paytirish qoidasi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, sanash: S, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.daraxt() }));
    await ui.say("elder", "Bayram yaqin. Shogird nima kiyishini bilmay turibdi.");
    await ui.say("apprentice", "Uchta koʻylak va ikkita shimim bor. Nechta xil kiyinaman?");
    await ui.say("elder", "Sanab chiqamiz. Lekin tartib bilan — bittasi ham tushib qolmasin.");
  }

  // Daraxt shox-shox bo'lib o'sadi; har shoxda barglar sanaladi
  async function daraxtQur() {
    const holat = L.daraxtById("kiyim");
    const host = common.box(true);
    host.append(common.sarlavha(holat));
    const joy = ui.h("div", {});
    const sanoq = ui.h("div", { class: "dx-sanoq" });
    host.append(joy, sanoq);
    const bosh = holat.qadamlar[0].elementlar;
    const barg = holat.qadamlar[1].elementlar.length;
    for (let k = 1; k <= bosh.length; k++) {
      joy.innerHTML = "";
      joy.append(common.daraxt(holat, k));
      sanoq.textContent = "Barglar: " + k * barg + " ta";
      ui.bubble("elder", "«" + bosh[k - 1] + "» koʻylakka " + barg + " xil shim mos keladi.");
      await ui.settle((done) => ui.control().append(ui.button(k === bosh.length ? "Hammasi shu ▶︎" : "Keyingi shox ▶︎", () => { ui.clearControl(); done(); })));
    }
    await ui.say("elder", "Har shoxda " + barg + " ta barg, shoxlar " + bosh.length + " ta.");
    await ui.say("apprentice", "Demak " + bosh.length + " marta " + barg + " ta — " + bosh.length * barg + " ta!");
    const list = common.box(true);
    list.append(common.note("Mana hammasi — bittasi ham tushib qolmadi:"));
    list.append(common.royxat(holat));
    list.append(common.hisobQator(bosh.length + " × " + barg + " = " + bosh.length * barg));
    await ui.say("elder", "Koʻpaytirish qoidasi: har qadamdagi tanlovlar soni koʻpaytiriladi.");
  }

  // Uchinchi qadam qo'shilsa — yana ko'paytiriladi
  async function uchQadam() {
    const holat = L.daraxtById("bayroq");
    const el = common.box(false);
    el.append(common.sarlavha(holat));
    el.append(common.royxat(holat, 6));
    el.append(common.note("… va shunga oʻxshash yana 6 ta"));
    el.append(common.hisobQator(holat.qadamlar.map((q) => q.elementlar.length).join(" × ") + " = " + L.daraxtSoni(holat)));
    await ui.say("elder", "Qadam qoʻshilsa, yana koʻpaytiriladi. Daraxt chizishning hojati yoʻq.");
  }

  async function stage1() {
    await daraxtQur();
    await uchQadam();
    await ui.say("elder", "Endi oʻzing hisobla.");
    await practice.exercises({
      next: (prev, correct, tier) => L.vaTask(Math.random, prev, tier),
      run: (task) => common.vaExercise(task),
      praise: (task) => task.hisob,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

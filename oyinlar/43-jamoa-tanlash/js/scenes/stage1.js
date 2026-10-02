// Kirish va 1-bosqich: bir xil jamoa necha marta takrorlanadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, sanash: S, common, practice } = QK;

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.jamoa() }));
    await ui.say("elder", "Besh boladan uch kishilik jamoa tuzamiz.");
    await ui.say("apprentice", "Buni bilaman! Oʻtgan oʻyindagidek: 5 × 4 × 3 = 60.");
    await ui.say("elder", "Shoshma. Avval oʻsha 60 tani koʻrib chiqaylik.");
  }

  // 60 ta tartib ichida bir xil jamoa 6 marta uchraydi
  async function takror() {
    const hamma = L.tartiblar(5, 3);
    const birinchi = [...hamma[0]].sort().join("|");
    const host = common.box(true);
    host.append(common.note("5 boladan 3 tasini tartib bilan tanlash — " + hamma.length + " ta natija:"));
    // Birinchi 12 qator ichida o'sha jamoaning ikkita tartibi belgilanadi (1- va 4-qator)
    host.append(common.tartibRoyxat(hamma.slice(0, 12), birinchi));
    host.append(common.note("… va yana " + (hamma.length - 12) + " ta"));
    await ui.say("elder", "Belgilangan ikki qatorga qara. Ularda qanday farq bor?");
    const javob = await ui.choice([
      { label: "Bir xil bolalar, faqat tartibi boshqa", value: "tartib" },
      { label: "Butunlay boshqa bolalar", value: "boshqa" },
    ]);
    if (javob !== "tartib") ui.toast("Diqqat bilan qara: oʻsha uch bolaning oʻzi, tartibi boshqa.");
    const el = common.box(true);
    el.append(common.note("Bitta jamoa — " + L.takrorlar(hamma[0]).length + " ta tartibda:"));
    el.append(common.tartibRoyxat(L.takrorlar(hamma[0]), birinchi));
    await ui.say("elder", "Jamoa uchun tartib muhim emas. Bu 6 ta qator — bitta jamoa.");
    await ui.say("apprentice", "Demak 60 tani 6 ga boʻlish kerak!");
    const b = common.box(true);
    b.append(common.bolishQator(5, 3));
    b.append(common.hisobQator("60 ÷ 6 = 10 ta jamoa"));
    await ui.say("elder", "Toʻppa-toʻgʻri. 6 — bu 3!, yaʼni uch kishining tartiblari soni.");
  }

  async function jamoalar() {
    const list = L.jamoalar(5, 3);
    const el = common.box(false);
    el.append(common.note("Mana oʻsha 10 ta jamoa:"));
    el.append(common.jamoaRoyxat(list));
    await ui.say("elder", "Sanab chiqdik — haqiqatan 10 ta. Formula ham shuni aytadi.");
  }

  async function nomlash() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row kod", text: "C(n, k) = A(n, k) ÷ k!" }),
      ui.h("div", { class: "formula-row", text: "n tadan k tasi, tartib MUHIM EMAS" }),
      ui.h("div", { class: "formula-row", text: "C(5, 3) = 60 ÷ 6 = 10" })));
    await ui.say("elder", "Endi oʻzing hisobla: tartib muhim emas boʻlgan savollar.");
  }

  async function stage1() {
    await takror();
    await jamoalar();
    await nomlash();
    await practice.exercises({
      next: (prev, correct, tier) => {
        let t = L.tartibTask(Math.random, prev, tier);
        while (t.qoida !== "c") t = L.tartibTask(Math.random, t, tier);
        return t;
      },
      run: (task) => common.tartibExercise(task),
      praise: (task) => task.hisob,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

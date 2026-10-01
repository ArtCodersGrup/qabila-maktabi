// Kirish va 1-bosqich: "son o'yladim" — yarmini tashlab yuborish (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, kodUI: U, logic: L, common, practice } = QK;

  const tasodif = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  async function intro() {
    await U.keyboardCheck();
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art", html: QK.gameArt.izlash() }));
    await ui.say("elder", "Men 1 dan 100 gacha son oʻyladim. Sen topasan, men “kattaroq” yoki “kichikroq” deyman.");
    await ui.say("elder", "Nechta savolda topa olasan deb oʻylaysan?");
  }

  // Birinchi o'yin: cheklovsiz, bola o'z usulini sinaydi
  async function birinchi() {
    const son = tasodif(1, L.CHEK);
    const r = await common.topish(son, 25);
    await ui.say("elder", r.savol + " ta savolda topding.");
    await ui.say("elder", "Endi men topaman. Sen son oʻyla — menga faqat “kattaroq”, “kichikroq” yoki “topding” deb ayt.");
  }

  // Kompyuter topadi: har safar oraliqning o'rtasi
  async function kompyuter() {
    let chap = 1;
    let ong = L.CHEK;
    const tarix = [];
    const host = common.box(true);
    host.append(common.note("Son oʻyla (1–" + L.CHEK + "). Men topaman."));
    const joy = ui.h("div", {});
    host.append(joy);
    for (let k = 0; k < 10; k++) {
      const taxmin = L.yarmi(chap, ong);
      ui.bubble("elder", "Mening taxminim: " + taxmin);
      const javob = await ui.choice([
        { label: "Kattaroq", value: "katta" },
        { label: "Kichikroq", value: "kichik" },
        { label: "Topding!", value: "topdi" },
      ]);
      tarix.push({ taxmin, javob });
      joy.innerHTML = "";
      joy.append(common.tarixEl(tarix));
      if (javob === "topdi") break;
      const yangi = L.torayt(chap, ong, taxmin, javob);
      chap = yangi.chap;
      ong = yangi.ong;
      if (chap > ong) break;
    }
    await ui.say("elder", "Men " + tarix.length + " ta savolda topdim. Sirim oddiy: har safar oraliqning oʻrtasini aytaman.");
    await ui.say("elder", "Shunda har savoldan keyin qolgan sonlarning yarmi tashlab yuboriladi.");
  }

  async function definition() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "formula-box" },
      ui.h("div", { class: "formula-row", text: "100 ta sondan — " + L.kerakliSavol(100) + " ta savolda" }),
      ui.h("div", { class: "formula-row", text: "1000 ta sondan — " + L.kerakliSavol(1000) + " ta savolda" }),
      ui.h("div", { class: "formula-row", text: "Har savol qolganining yarmini tashlaydi" })));
    await ui.say("elder", "Soni 10 barobar oshdi, savol esa faqat 3 taga koʻpaydi. Bu — ikkilik izlash.");
    await ui.say("elder", "Endi oʻzing shunday top: " + L.kerakliSavol(L.CHEK) + " ta savolda topishing kerak.");
  }

  async function stage1() {
    await birinchi();
    await kompyuter();
    await definition();
    const chek = L.kerakliSavol(L.CHEK);
    await practice.exercises({
      next: () => ({ id: "top:" + Math.random(), son: tasodif(1, L.CHEK), chek }),
      run: (task) => common.topishExercise(task),
      praise: () => "Yarmini tashlab bording.",
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

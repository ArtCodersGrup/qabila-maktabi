// Kirish va 1-bosqich: tayanch nuqtalar (keypoints) va koordinatalar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  async function intro() {
    const el = common.box(false);
    el.append(common.rasm(L.poza({ chap: "yon", ong: "yon" }), { kichik: true }));
    await ui.say("elder", "Maqsad: kamera tasviridan tana holatini aniqlash (pose estimation) qanday ishlashini tushunish.");
    await ui.say("elder", "Kalit gʻoya: model odamni emas, tayanch nuqtalar (keypoints) koordinatalarini koʻradi. Qolgani — sonlar ustida qoidalar.");
  }

  // Oʻquvchi skeletni oʻzi yigʻadi: belgilangan nuqtani nomlaydi — nuqta tanaga joylashadi
  async function korsat() {
    const p = L.poza({ ong: "tepa" });
    const el = common.box(true);
    const joy = h("div", { class: "ah-joy" });
    el.append(joy, common.ranglar());
    const bor = [];
    const chiz = (belgi, setka) => {
      joy.innerHTML = "";
      joy.append(common.rasm(p, { bor: belgi ? bor.slice() : null, belgi, setka }));
    };
    ui.bubble("elder", "Model tanadan tayanch nuqtalarni topadi. Belgilangan nuqtani nomla — u skeletga qoʻshiladi.");
    for (const id of ["bosh", "ongYelka", "ongBilak", "chapTirsak", "chapTizza"]) {
      chiz(id, false);
      const variantlar = L.nomVariantlar(id, Math.random);
      for (;;) {
        const v = await ui.choice(variantlar.map((nom) => ({ label: nom, value: nom })));
        if (v === L.NOM[id]) break;
        QK.sound.play("retry");
        ui.bubble("elder", "↻ Chap tomon — koʻk, oʻng tomon — toʻq sariq. Qoʻlda yuqoridan: yelka, tirsak, bilak.");
      }
      QK.sound.play("correct");
      bor.push(id);
    }
    chiz(null, true);
    await ui.say("elder", "✓ Qolganini model oʻzi qoʻydi: jami 15 ta tayanch nuqta (keypoints). Ularni tutashtirsak — skelet.");
    el.append(common.jadval(p, ["bosh", "ongBilak", "chapTopiq"]));
    await ui.say("elder", "Har nuqta — ikki son (x, y): x chapdan oʻngga, y yuqoridan pastga oʻlchanadi. (0, 0) — chap yuqori burchak.");
    ui.bubble("elder", `Bosh y = ${p.bosh[1]}, toʻpiq y = ${p.chapTopiq[1]}. Yuqoridagi nuqtaning y si qanday?`);
    const j = await ui.choice([{ label: "Kichikroq", value: 1 }, { label: "Kattaroq", value: 0 }]);
    QK.sound.play(j ? "correct" : "retry");
    await ui.say("elder", (j ? "✓ " : "↻ ") + "Rasm koordinatalarida y pastga oʻsadi: nuqta qancha yuqorida boʻlsa, y si shuncha kichik.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol — nuqta nomi, koordinata oʻqish va farq hisoblash.`);
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich1Task(prev, Math.random, tier, togri),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

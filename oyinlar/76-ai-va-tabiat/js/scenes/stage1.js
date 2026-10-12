// Kirish va 1-bosqich: ma'lumotni belgilash (labeling) va foydali belgini tanlash.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  async function intro() {
    const el = common.box(false);
    el.append(h("div", { class: "story-art wide", html: QK.gameArt.kirish() }));
    await ui.say("elder", "Maqsad: chiqindini saralovchi model misolida AI qanday oʻqitilishi va tekshirilishini tushunish — yorliq, belgi, aniqlik, noxolislik.");
    await ui.say("elder", "Kalit gʻoya: model faqat oʻziga berilgan maʼlumotdan oʻrganadi. Maʼlumot bir yoqlama boʻlsa, model ham xato qiladi.");
  }

  // Bola har buyumga yorliq qo'yadi — jadval qatorma-qator to'ladi
  async function belgilash() {
    const el = common.box(true);
    const buyumlar = L.buyumlar(L.DEMO1);
    const tayyor = [];
    const joy = h("div", { class: "at-joy" });
    el.append(joy);
    for (let k = 0; k < buyumlar.length; k++) {
      const x = buyumlar[k];
      const chiz = () => {
        joy.textContent = "";
        // joriy qatorda yorliq hali yo'q — "?"
        joy.append(common.jadval(tayyor.concat([{ buyum: x, holat: "joriy", yorliq: "?" }]), { nom: true, yorliq: true }));
      };
      chiz();
      ui.bubble("elder", `Modelga yorliqli misollar kerak. ${k + 1}/${buyumlar.length}: «${x.nom}» — qaysi yorliq?`);
      for (;;) {
        const javob = await ui.choice(L.SINFLAR.map((s) => ({ label: s, value: s })));
        if (javob === x.sinf) break;
        QK.sound.play("retry");
        ui.bubble("elder", x.yaltiroq === "yaltiroq" && x.sinf === "qogʻoz"
          ? `↻ «${x.nom}» yaltiroq, lekin u qanday materialdan?`
          : `↻ «${x.nom}» qanday materialdan yasalgan?`);
      }
      QK.sound.play("correct");
      tayyor.push({ buyum: x });
    }
    joy.textContent = "";
    joy.append(common.jadval(tayyor, { nom: true, yorliq: true }));
    await ui.say("elder", "Atama: maʼlumotni belgilash (labeling) — har misolga yorliq (label) qoʻyish; buni odam qiladi. Jadvalda qator — buyum, ustunlar — belgilar (features).");
  }

  // Qaysi ustun modelga yordam bermaydi?
  async function belgiTanlash() {
    ui.bubble("elder", "Model buyum nomini bilmaydi — faqat belgilar ustunlarini koʻradi. Qaysi ustun saralashga yordam bermaydi?");
    const ustunlar = L.BELGILAR.concat([L.JOY]);
    for (;;) {
      const javob = await ui.choice(ustunlar.map((b) => ({ label: b.nom, value: b.id })));
      if (javob === L.JOY.id) break;
      QK.sound.play("retry");
      ui.bubble("elder", "↻ Jadvalga qara: bu ustunda plastik, qogʻoz va organik buyumlar farq qiladimi? Farq qilsa — belgi foydali.");
    }
    QK.sound.play("correct");
    await ui.say("elder", `✓ Buyum qayerdan topilgani materialiga bogʻliq emas. Foydali belgi — sinflarni farqlaydigan belgi. Mashq: ${QK.practice.need()} ta savol.`);
  }

  async function korsat() {
    await belgilash();
    await belgiTanlash();
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich1Task(prev, Math.random, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

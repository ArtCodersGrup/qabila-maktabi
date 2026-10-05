// Kirish va 1-bosqich: paketni tugunlar orqali qo'lda uzatish — marshrut.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;

  async function intro() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "story-art wide", html: QK.gameArt.pochta() }));
    await ui.say("elder", "Paket manzilga bitta sim bilan toʻgʻri ketmaydi. Yoʻlda pochta boʻlimlari — tugunlar bor.");
    await ui.say("elder", "Har tugun butun xaritani bilmaydi: faqat qoʻshnilarini. Hozir sen pochtachisan!");
  }

  // Bola har qadamda qo'shni tugunni bosadi; yetib borganda qadamlari eng qisqa yo'l bilan solishtiriladi
  function uzat(t, a, b) {
    let joriy = a;
    let qadam = 0;
    const host = common.box(true);
    const savol = ui.h("div", { class: "py-savol" });
    const joy = ui.h("div", {});
    host.append(savol, joy);
    return ui.settle((done) => {
      function chiz() {
        savol.textContent = `Paket ${L.harf(joriy)} tugunida. Manzil — ${L.harf(b)}. Qoʻshni tugunni bos (qadamlar: ${qadam}).`;
        joy.innerHTML = "";
        joy.append(common.tor(t, {
          a: joriy, b, joriy, faol: new Set(L.qoshnilar(t.simlar, joriy)),
          bosiladi: (i) => {
            QK.sound.play("tap");
            joriy = i;
            qadam++;
            if (i === b) done(qadam);
            else chiz();
          },
        }), common.izoh());
      }
      chiz();
    });
  }

  async function korsat() {
    let t; let j;
    do { t = L.tor(Math.random); j = L.juft(t, Math.random, 3, 4); } while (!j);
    const [a, b] = j;
    const eng = L.bfs(t.simlar, a, b);
    ui.bubble("elder", "Paketni manzilga yetkaz! Faqat sim bilan ulangan qoʻshniga oʻtish mumkin.");
    const qadam = await uzat(t, a, b);
    QK.sound.play("correct");
    const host = common.box(true);
    host.append(common.tor(t, { a, b, yol: eng.yol }));
    await ui.say("elder", qadam === eng.masofa
      ? `✓ ${qadam} qadamda yetkazding — bu eng qisqa yoʻl!`
      : `✓ Yetib bordi: ${qadam} qadam. Eng qisqa yoʻl esa ${eng.masofa} qadam — yashil chiziq.`);
    await ui.say("elder", "Paketning tugundan tugunga yurgan yoʻli — marshrut. Tugunlar uni qadam-baqadam tanlaydi.");
  }

  async function stage1() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich1Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

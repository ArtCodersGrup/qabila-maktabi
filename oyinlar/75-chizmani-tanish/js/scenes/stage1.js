// Kirish va 1-bosqich: chizma — sonlar jadvali; ikki chizma farqi (Hamming masofasi).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  async function intro() {
    const el = common.box(false);
    el.append(h("div", { class: "story-art wide", html: QK.gameArt.kirish() }));
    await ui.say("elder", "Maqsad: kompyuter chizilgan shaklni qanday tanishini tushunish — rasm sonlarga aylanadi, sonlar solishtiriladi.");
    await ui.say("elder", "Kalit gʻoya: model shakl qoidasini bilmaydi. U yangi chizmani oʻzi koʻrgan namunalar bilan solishtiradi — bu mashinali oʻrganish (machine learning, ML)ning eng sodda usuli.");
  }

  // Chizma sonlar jadvaliga aylanadi
  async function sonlargaAylantir() {
    const el = common.box(true);
    const kvadrat = L.namuna("kvadrat-2").katak;
    const joy = h("div", { class: "ct-juft" }, common.rasm(kvadrat, "katta"));
    el.append(joy);
    ui.bubble("elder", "Sen kvadratni koʻryapsan. Kompyuter xotirasida esa faqat sonlar turadi.");
    await ui.choice([{ label: "Sonlarga aylantir", value: "ok" }]);
    joy.textContent = "";
    joy.append(common.sonlar(kvadrat));
    await ui.say("elder", "Har katak — piksel: boʻyalgan = 1, boʻsh = 0. 8×8 chizma — 64 ta sondan iborat jadval.");
  }

  // Bola B chizmada A dan farq qilgan kataklarni bosib topadi
  async function farqniTop() {
    const d = L.demo1();
    const el = common.box(true);
    const topilgan = new Set();
    const hisob = h("div", { class: "ct-hisob", "aria-live": "polite", text: `Topildi: 0 / ${d.farq.length}` });
    ui.bubble("elder", "B chizma A dan bir necha katakda farq qiladi. B da shu kataklarni bos.");
    await ui.settle((done) => {
      const m = common.maydon(d.b, (i, tugma) => {
        if (topilgan.has(i)) return;
        if (!d.farq.includes(i)) {
          QK.sound.play("retry");
          ui.bubble("elder", "↻ Bu katak ikkala chizmada bir xil. A bilan qatorma-qator solishtir.");
          return;
        }
        QK.sound.play("tap");
        topilgan.add(i);
        tugma.classList.add("farq");
        hisob.textContent = `Topildi: ${topilgan.size} / ${d.farq.length}`;
        if (topilgan.size === d.farq.length) done();
      });
      el.append(common.yozuvli(common.rasm(d.a, "kichik"), "A"), common.yozuvli(m.el, "B"), hisob);
    });
    QK.sound.play("correct");
    await ui.say("elder", `✓ ${d.farq.length} ta katak mos kelmadi — ikki chizma farqi ${d.farq.length} ga teng.`);
  }

  async function korsat() {
    await sonlargaAylantir();
    await farqniTop();
    await ui.say("elder", "Atama: mos kelmagan kataklar soni — Hamming masofasi (Hamming distance). 0 — chizmalar bir xil; son katta boʻlsa — oʻxshamaydi.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol — jadvalni oʻqish va farqni sanash.`);
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

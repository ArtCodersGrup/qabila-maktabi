// Kirish va 1-bosqich: metodologiya bosqichlari va oʻlchanadigan savol.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  async function intro() {
    const el = common.box(false);
    el.append(h("div", { class: "story-art wide", html: QK.gameArt.yol() }));
    await ui.say("elder", "Maqsad: maʼlumotlar fani (data science) qanday ishlashini tushunish — savoldan xulosagacha.");
    await ui.say("elder", "Kalit gʻoya: maʼlumot oʻzi javob bermaydi. Aniq savol, toza jadval va ehtiyotkor xulosa kerak.");
  }

  const NAMUNA = [
    "«Tushlik navbati oʻrtacha necha daqiqa?»",
    "bir hafta navbat vaqtini oʻlchash",
    "xato yozuvlarni tuzatish",
    "oʻrtacha va diagramma",
    "«Dushanba kuni ikkinchi kassa kerak»",
  ];

  // Oʻquvchi besh bosqichni toʻgʻri tartibda bosadi; har bosqich yonida loyihadagi ishi chiqadi
  function tartibla() {
    const el = common.box(true);
    const royxat = h("ol", { class: "ds-tartib", "aria-live": "polite" });
    el.append(royxat);
    let kutilgan = 0;
    return ui.settle((done) => {
      const tugmalar = L.aralash(L.BOSQICHLAR.map((b, k) => k), Math.random).map((k) => {
        const b = ui.button(L.BOSQICHLAR[k].nom, () => {
          if (k !== kutilgan) {
            QK.sound.play("retry");
            ui.bubble("elder", kutilgan === 0 ? "↻ Hammasi nimadan boshlanadi? Nimani bilmoqchi ekaningni aniqlashdan." : "↻ Hali erta: bu ishdan oldin yana bir bosqich bor.");
            return;
          }
          b.disabled = true;
          royxat.append(h("li", null, h("b", { text: L.BOSQICHLAR[k].nom }), h("span", { text: " — " + NAMUNA[k] })));
          kutilgan++;
          if (kutilgan === L.BOSQICHLAR.length) done();
        }, "secondary");
        return b;
      });
      ui.control().append(h("div", { class: "ds-javoblar qisqa" }, ...tugmalar));
    });
  }

  async function korsat() {
    ui.bubble("elder", "Loyiha: maktab oshxonasidagi navbat. Bosqichlarni bajarilish tartibida bos.");
    await tartibla();
    ui.clearControl();
    QK.sound.play("correct");
    ui.bubble("elder", "✓ Bu — data science metodologiyasi. Birinchi bosqich hal qiluvchi: qaysi savolni oʻlchab boʻladi?");
    const javob = await ui.choice([
      { label: "Oshxona yaxshi ishlayaptimi?", value: "noaniq", secondary: true },
      { label: "Navbat oʻrtacha necha daqiqa?", value: "aniq", secondary: true },
    ]);
    QK.sound.play(javob === "aniq" ? "correct" : "retry");
    await ui.say("elder", (javob === "aniq" ? "✓ " : "↻ ") + "«Yaxshi» — fikr, uni oʻlchab boʻlmaydi. «Necha daqiqa» — oʻlchov: sekundomer bilan yozib borish mumkin.");
    await ui.say("elder", `Oʻlchanadigan savolda nima sanalishi aniq: necha, qancha, qaysi, necha foiz. Mashq: ${practice.need()} ta savol.`);
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

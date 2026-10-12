// Kirish va 1-bosqich: dipfeyk nima va uning belgilari (chizma yuzlarda farq topish, lab-ovoz mosligi).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  const ASL = { teri: 1, soch: 1, sochRang: 1, kiyim: 0, nur: "chap", qarash: 0, chet: null, soya: false, koz: null, tish: null };
  const SOXTA = Object.assign({}, ASL, { chet: "ong", soya: true, koz: "yonalish", tish: "yaxlit" });
  // Tanlanadigan joylar: toʻrttasida farq bor, ikkitasida yoʻq
  const JOYLAR = [["chet", "Yuz cheti"], ["koz", "Koʻzlar"], ["quloq", "Quloqlar"], ["tish", "Tishlar"], ["soya", "Yorugʻlik va soya"], ["soch", "Soch"]];

  async function intro() {
    const el = common.box(false);
    el.append(common.juft(common.yuz(ASL, { kichik: true }), common.yuz(SOXTA, { kichik: true })));
    await ui.say("elder", "Maqsad: dipfeykni (deepfake — AI yasagan soxta video, rasm yoki ovoz) belgilaridan va manbasidan tekshirish, toʻgʻri harakat qilish.");
    await ui.say("elder", "Bu yerdagi hamma yuzlar — chizma, haqiqiy odamlar emas. Dipfeyk yasash oʻrgatilmaydi — faqat undan himoyalanish.");
  }

  // Oʻquvchi asl va oʻzgartirilgan chizmani solishtirib, toʻrt farqni oʻzi topadi
  function farqTop(el) {
    const joy = h("div", { class: "df-joy" });
    const satr = h("div", { class: "df-holat", "aria-live": "polite", text: "Topildi: 0 / 4" });
    el.append(joy, satr);
    const topildi = [];
    const chiz = () => {
      joy.innerHTML = "";
      joy.append(common.juft(
        common.yuz(ASL, { kichik: true, yozuv: "Asl chizma", nom: "Asl chizma" }),
        common.yuz(SOXTA, { kichik: true, yozuv: "Oʻzgartirilgan", nom: "Oʻzgartirilgan chizma", belgila: topildi })));
    };
    chiz();
    return ui.settle((done) => {
      const tugmalar = JOYLAR.map(([id, nom]) => {
        const b = ui.button(nom, () => {
          if (b.disabled) return;
          if (!L.BELGI[id]) {
            QK.sound.play("retry");
            satr.textContent = `↻ ${nom}: ikki chizmada bir xil. Topildi: ${topildi.length} / 4`;
            return;
          }
          QK.sound.play("correct");
          b.disabled = true;
          b.classList.add("df-topildi");
          topildi.push(id);
          chiz();
          satr.textContent = `✓ ${L.belgiIzoh(SOXTA, id)} Topildi: ${topildi.length} / 4`;
          if (topildi.length === 4) {
            ui.clearControl();
            done();
          }
        }, "wide");
        return b;
      });
      ui.control().append(h("div", { class: "df-javoblar ikki" }, ...tugmalar));
    });
  }

  async function korsat() {
    const el = common.box(true);
    ui.bubble("elder", "Chapda — asl chizma, oʻngda — oʻzgartirilgani. 4 ta farqni top: farq bor joyni tanla.");
    await farqTop(el);
    await ui.say("elder", "✓ Toʻrt belgi: xira chet, chiroqqa mos kelmagan soya, gʻalati koʻz va tishlar. Yuz almashtirilganda shunday izlar qolishi mumkin.");

    const el2 = common.box(true);
    el2.append(h("div", { class: "df-art", html: QK.gameArt.sxema() }));
    await ui.say("elder", "Dipfeyk: model bir odamning koʻp surati yoki ovoz yozuvidan oʻrganadi va uni boshqa videoga qoʻyadi — yuz almashtirish (face swap) yoki ovozni klonlash (voice cloning).");

    const el3 = common.box(true);
    el3.append(common.labSxema([1, 1, 0, 0, 1, 1], [1, 0, 0, 1, 1, 1], [2, 4]));
    await ui.say("elder", "Beshinchi belgi — lab va ovoz mosligi. 2-kadrda ovoz bor, ogʻiz yopiq; 4-kadrda jimlik, ogʻiz ochiq — mos emas.");
    await ui.say("elder", "Cheklov: sifatli dipfeykda bu belgilar koʻrinmasligi mumkin. Belgi yoʻqligi — haqiqiylik isboti emas, shuning uchun manba ham tekshiriladi.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol — ikki tasvirni solishtirish, lab-ovoz sxemasi va belgilarni topish.`);
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

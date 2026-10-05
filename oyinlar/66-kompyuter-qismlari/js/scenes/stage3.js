// 3-bosqich: yoqish va ehtiyot qilish — bola o'yinchoq kompyuterni o'zi o'chiradi: saqla → yop → «Oʻchirish» → kut.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  // O'yinchoq ekran: «Rasm» oynasi (shogird chizgan rasm), «Pusk» paneli va menyusi. Yozuvlar — HTML, rasm — SVG.
  function ekran() {
    const holat = h("span", { class: "kq-holat", text: "saqlanmagan" });
    const oyna = h("div", { class: "kq-oyna" },
      h("div", { class: "kq-oyna-sarlavha" }, h("span", { text: "Rasm" }), holat),
      h("div", { class: "kq-oyna-rasm", html: QK.gameArt.rasmcha() }));
    const menyu = h("div", { class: "kq-menyu", hidden: true, text: "Oʻchirish" });
    const yuz = h("div", { class: "kq-ekran-yuz" },
      oyna,
      h("div", { class: "kq-ochmoqda", text: "Oʻchmoqda…" }),
      menyu,
      h("div", { class: "kq-panel" }, h("span", { class: "kq-pusk", text: "Pusk" })));
    const el = h("div", { class: "kq-ekran" }, yuz, h("div", { class: "kq-ekran-oyoq" }));
    return { el, oyna, holat, menyu };
  }

  async function korsat() {
    const el = common.box(true);
    const E = ekran();
    el.append(E.el);

    // Bola o'zi tanlaydi. Saqlamasdan o'chirsa — rasm yo'qoladi (jarimasiz), keyin qaytadan boshlaydi:
    // "saqlanmagan ish yo'qoladi" degan gapni o'qimaydi, o'z ko'zi bilan ko'radi.
    let matn = "Shogird rasm chizdi, endi kompyuterni oʻchiramiz. Nimadan boshlaysan?";
    for (;;) {
      ui.bubble("elder", matn);
      const tanlov = await ui.choice([
        { label: "💾 Rasmni saqlash", value: "saqla" },
        { label: "Oʻchirish", value: "ochir" },
      ]);
      if (tanlov === "saqla") break;
      QK.sound.play("retry");
      E.el.classList.add("ochiq-emas");
      await ui.say("apprentice", "↻ Voy! Rasmim saqlanmagan edi — u yoʻqoldi!");
      E.el.classList.remove("ochiq-emas");
      matn = "Rasm qaytdi — bu faqat mashq edi. Endi nimadan boshlaysan?";
    }
    QK.sound.play("correct");
    E.holat.textContent = "✓ saqlandi";
    E.holat.classList.add("ok");

    ui.bubble("elder", "✓ Rasm saqlandi. Endi dasturni yop.");
    await ui.choice([{ label: "✕ Dasturni yopish", value: "yop" }]);
    E.oyna.hidden = true;

    ui.bubble("elder", "Endi «Pusk»ni bos va «Oʻchirish»ni tanla.");
    await ui.choice([{ label: "Pusk", value: "pusk" }]);
    E.menyu.hidden = false;
    await ui.choice([{ label: "Oʻchirish", value: "ochir" }]);
    E.menyu.hidden = true;
    E.el.classList.add("ochmoqda");
    await ui.sleep(900);
    E.el.classList.remove("ochmoqda");
    E.el.classList.add("ochiq-emas");
    QK.sound.play("correct");

    await ui.say("elder", "✓ Ekran oʻchdi. Tartibni esla: saqla, yop, oʻchir, kut.");
    await ui.say("apprentice", "Saqlamasam, ishim yoʻqolar ekan!");
    await ui.say("elder", "Kompyuterni asra ham. Unga suv, ushoq va qattiq zarba yoqmaydi.");
  }

  async function stage3() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich3Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

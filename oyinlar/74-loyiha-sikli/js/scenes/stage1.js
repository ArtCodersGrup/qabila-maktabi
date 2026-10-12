// Kirish va 1-bosqich: besh bosqich tartibi va har birining natijasi (oshxona loyihasi misolida).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  // Sikl tartibida: bosqich, ish, natija
  const NAMUNA = [
    { b: "muammo", ish: "Savolni aniqlash: ertaga nechta tushlik kerak?", natija: "aniq savol va mezon" },
    { b: "yigish", ish: "Oʻtgan yilgi sotuv yozuvlarini toʻplash", natija: "maʼlumotlar jadvali" },
    { b: "organish", ish: "Sotuvni hafta kunlari boʻyicha diagrammada koʻrish", natija: "qonuniyat va topilgan xatolar" },
    { b: "model", ish: "Jadvalda bashorat modelini oʻqitish", natija: "oʻqitilgan model" },
    { b: "baho", ish: "Modelni u koʻrmagan kunlarda sinash", natija: "xato oʻlchami va qaror" },
  ];

  async function intro() {
    const el = common.box(false);
    el.append(h("div", { class: "story-art", html: QK.gameArt.sikl() }));
    await ui.say("elder", "Maqsad: AI loyiha siklining (AI project cycle) besh bosqichini bilish va loyihadagi xatoni bosqichi boʻyicha topish.");
    await ui.say("elder", "Kalit gʻoya: model — loyihaning faqat bir qismi. Undan oldin savol va maʼlumot, undan keyin sinov turadi.");
  }

  // Bola aralash ishlarni bajarilish tartibida bosadi; har qadamda bosqich nomi va natijasi chiqadi
  async function terdir() {
    const el = common.box(true);
    const zina = h("ol", { class: "ls-zina", "aria-live": "polite" });
    el.append(common.savol("Loyiha: oshxona ertaga nechta tushlik tayyorlasin? Ishlarni bajarilish tartibida bos."), zina);
    ui.bubble("elder", "Qaysi ish birinchi? Har ish oldingisining natijasiga tayanadi.");
    let kutilgan = 0;
    await ui.settle((done) => {
      const tugmalar = L.aralashTartib(NAMUNA, Math.random).map((x) => {
        const b = ui.button(x.ish, () => {
          if (x !== NAMUNA[kutilgan]) {
            QK.sound.play("retry");
            ui.bubble("elder", "↻ Hali erta: bu ishga kerakli narsa tayyor emas. Undan oldin nima boʻlishi kerak?");
            return;
          }
          QK.sound.play("correct");
          b.remove();
          zina.append(h("li", {}, h("b", { text: L.nom(x.b) }), h("span", { text: " → " + x.natija })));
          ui.bubble("elder", `✓ ${kutilgan + 1}-bosqich: ${L.nom(x.b).toLowerCase()}. Natijasi — ${x.natija}.`);
          kutilgan++;
          if (kutilgan === NAMUNA.length) done();
        }, "wide");
        return b;
      });
      ui.control().append(h("div", { class: "ls-javoblar" }, ...tugmalar));
    });
    await ui.say("elder", "✓ Bu tartib — AI loyiha sikli (AI project cycle). Har bosqichning natijasi keyingisiga kirish boʻladi.");
  }

  async function nomla() {
    const el = common.box(true);
    common.formula(el, L.BOSQICHLAR.map((b, i) => `${i + 1}. ${b.nom} (${b.en})`));
    await ui.say("elder", "Atamalar ekranda. Nega «sikl»: baholash natijasi yomon chiqsa, loyiha tugamaydi — oldingi bosqichlardan biriga qaytiladi.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol — natija, ishlar tartibi va tushib qolgan bosqich.`);
  }

  async function stage1() {
    await terdir();
    await nomla();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich1Task(prev, Math.random, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { intro, stage1 });
})(window);

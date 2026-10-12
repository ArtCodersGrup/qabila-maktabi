// 3-bosqich: etika va harakat — ruxsat, zarar, ochiqlik; tarqatmaslik va xabar berish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  // Oʻquvchi "yuborish"ni uch marta bosadi va tarqalish qanday oʻsishini koʻradi: 3 → 9 → 27
  async function korsat() {
    const el = common.box(true);
    const joy = h("div", { class: "df-tarqalish" });
    const satr = h("div", { class: "df-holat", "aria-live": "polite", text: "Bu — hisob modeli: hech narsa yuborilmaydi." });
    el.append(joy, satr);
    const K = 3;
    const qator = (n, cls) => h("div", { class: "df-nuqtalar" }, ...Array.from({ length: n }, () => h("span", { class: "df-nuqta " + (cls || "") })));
    joy.append(qator(1, "men"));
    ui.bubble("elder", "Faraz qil: soxta video senga keldi. Uni 3 kishiga yuborsang va har kim yana 3 kishiga yuborsa, nima boʻlishini hisobla.");
    let jami = 0;
    for (let n = 1; n <= 3; n++) {
      await ui.choice([{ label: n === 1 ? "3 kishiga yuborish" : "Ular ham yuboradi ▶︎", value: n }]);
      const soni = L.qadam(1, K, n);
      jami += soni;
      joy.append(qator(soni));
      satr.textContent = `${n}-qadam: ${soni} ta yangi odam. Jami: ${jami}`;
    }
    await ui.say("elder", `Uch qadamda 3 + 9 + 27 = ${jami} kishi. Har ulashish zararni koʻpaytiradi; sen yubormasang, bu shox birinchi qadamdayoq toʻxtaydi.`);

    const el2 = common.box(true);
    el2.append(common.qoidaKarta("AI bilan yasalgan tasvir — uch shart", [
      "Ruxsat: tasvirlangan odam rozi.",
      "Zarar yoʻq: haqorat, yolgʻon xabar, pul soʻrash yoʻq.",
      "Ochiqlik: yasama ekani aniq yozilgan.",
    ]));
    await ui.say("elder", "Odamning yuzi va ovozi — uning shaxsiy maʼlumoti. Uch shartdan bittasi buzilsa ham, bunday ish yasalmaydi va tarqatilmaydi.");

    const el3 = common.box(true);
    el3.append(h("div", { class: "df-art small", html: QK.gameArt.qalqon() }));
    el3.append(common.qoidaKarta("Soxta videoga duch kelsang", [
      "1. Tarqatma.",
      "2. Dalilni saqla: skrinshot va havola.",
      "3. Kattalarga ayt: ota-ona, oʻqituvchi.",
      "4. Platformaga shikoyat qil.",
    ]));
    await ui.say("elder", "Toʻrt qadam: tarqatma, dalilni saqla, kattalarga ayt, platformaga shikoyat qil. Soxta videoda tasvirlangan odam aybdor emas.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol — toʻgʻri harakat, uch shart va tarqalish hisobi.`);
  }

  async function stage3() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich3Task(prev, Math.random, tier, togri),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

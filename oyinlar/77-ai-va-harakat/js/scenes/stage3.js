// 3-bosqich: kadrlar ketma-ketligidan oʻtirib-turishni sanash (holat almashuvi), qoʻllanishi va xatolari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  const KADRLAR = [1, 14, 15, 0, 7, 1, 13, 0]; // 5-kadr — yarim oʻtirish: sanalmaydi

  // Oʻquvchi videoni kadrma-kadr oʻtkazadi; holat va sanoq har kadrda yangilanadi
  async function korsat() {
    const el = common.box(true);
    const joy = h("div", { class: "ah-joy" });
    const satr = h("div", { class: "ah-holat", "aria-live": "polite" });
    el.append(joy, satr);
    let i = 0;
    let son = 0;
    const chiz = () => {
      const d = KADRLAR[i];
      joy.innerHTML = "";
      joy.append(common.kadrlar(KADRLAR.slice(0, i + 1), { korsat: "farq", joriy: i + 1 }));
      satr.textContent = `${i + 1}-kadr: tizza y − son y = ${L.farq(d)} → ${L.otirganD(d) ? "oʻtirgan" : "oʻtirmagan"}. Sanoq: ${son}`;
    };
    chiz();
    ui.bubble("elder", "Video — kadrlar ketma-ketligi. Kadrma-kadr oʻt va sanoq qaysi paytda oshishini kuzat.");
    while (i < KADRLAR.length - 1) {
      await ui.choice([{ label: "Keyingi kadr ▶︎", value: 1 }]);
      i++;
      if (L.otirganD(KADRLAR[i - 1]) && !L.otirganD(KADRLAR[i])) {
        son++;
        QK.sound.play("correct");
      }
      chiz();
    }
    ui.bubble("elder", "Odam necha marta toʻliq oʻtirib-turdi?");
    const togri = L.sanoq(KADRLAR);
    const j = await ui.choice([1, 2, 3].map((n) => ({ label: String(n), value: n })));
    QK.sound.play(j === togri ? "correct" : "retry");
    joy.innerHTML = "";
    joy.append(common.kadrlar(KADRLAR, { korsat: "farq", belgi: L.oshishlar(KADRLAR) }));
    await ui.say("elder", `${j === togri ? "✓" : "↻"} ${togri} marta. 5-kadrda farq ${L.farq(KADRLAR[4])} — yarim oʻtirish: chegaradan (8) oʻtmadi, shuning uchun sanalmadi.`);

    const el2 = common.box(true);
    el2.append(h("div", { class: "ah-qoida" },
      h("div", { class: "ah-qoida-nom", text: "Hisoblagich" }),
      h("div", { text: "holat = oʻtirgan, agar tizza y − son y ≤ 8" }),
      h("div", { text: "oldingi kadr oʻtirgan, hozirgisi oʻtirmagan → sanoq + 1" }),
      h("div", { class: "ah-izoh", text: "Qoʻllanishi: sport ilovalari, reabilitatsiya mashqlari (tibbiyot), harakatli oʻyinlar." }),
      h("div", { class: "ah-izoh", text: "Xatolari: nuqta toʻsilsa yoki yorugʻlik yomon boʻlsa, koordinata sakraydi; oʻquv toʻplamida kam uchragan tana va kiyimlarda aniqlik pastroq (noxolislik, bias)." })));
    await ui.say("elder", "Bu — holat avtomati: dastur oldingi kadr holatini eslab qoladi va faqat «oʻtirgan → oʻtirmagan» almashuvida sanoqni oshiradi.");
    await ui.say("elder", "Cheklov: bitta notoʻgʻri kadr sanoqni buzadi. Tana videosi — shaxsiy maʼlumot: yaxshi ilova uni qurilmaning oʻzida qayta ishlaydi.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol — sanash, almashuv kadrini topish va shovqinni ajratish.`);
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

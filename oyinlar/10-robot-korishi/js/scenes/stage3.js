// 3-bosqich: surilsa nima bo'ladi, belgi va hikoya (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { vision, ui, sound, art, visionUi, practice, common } = QK;

  const SCENES = [
    { art: "camera", lines: ["Qayerda uchraydi: telefon kamerasi yuzni piksellardan belgilar ajratib, taqqoslab topadi."] },
    { art: "roadsign", lines: ["Avtomobil yoʻl belgisini taniydi. Qor yoki soya tushsa, piksellar oʻzgaradi va u adashishi mumkin."] },
    { art: "xray", lines: ["Tibbiyotda dastur rentgendagi shubhali joyni belgilaydi. Oxirgi qarorni shifokor qabul qiladi."] },
    { art: "robot", lines: ["Zamonaviy dasturlar belgilarni qoʻlda emas, misollardan oʻzi topadi — neyron tarmoq yordamida.", "Bu haqda — «Koʻp qatlamli tarmoq» oʻyinida."] },
  ];

  const TOP = 3; // moslik ustunchalari: eng o'xshash uchtasi (oltitasi telefonda sig'maydi)

  // 6.1–6.2: rasm suriladi, shablon adashadi, belgi qutqaradi
  async function shiftDemo() {
    const demo = vision.DEMO_SHIFT;
    const name = demo.name;
    const original = vision.TEMPLATES[name];
    const el = common.box(true);
    const board = visionUi.grid(el, {});
    board.set(original);
    const feature = visionUi.featureLine(el); // belgi toʻr ostida — ekranda koʻrinib tursin
    const list = visionUi.scores(el);
    list.set(vision.bestMatch(original).list.slice(0, TOP), name);
    feature.set(original);
    await ui.say("elder", `Toza rasm: robot uni ${name} deb tanidi — 36 / 36 katak mos.`);
    ui.bubble("elder", "Endi rasmni bir katak oʻngga sur: «Sur»ni bos.");
    await ui.settle((done) => {
      ui.control().append(ui.button("Sur ▶︎", () => { ui.clearControl(); done(); }, "big"));
    });
    const moved = vision.shift(original, demo.dx, demo.dy);
    board.set(moved);
    board.flash();
    const best = vision.bestMatch(moved);
    list.set(best.list.slice(0, TOP), best.name);
    feature.set(moved);
    sound.play("retry");
    await ui.say("elder", `Koʻzga deyarli bir xil, lekin mosliklar tushib ketdi: eng yaxshisi ${best.score} ta.`);
    await ui.say("elder", best.name === name
      ? "Robot uchun surilgan rasm — butunlay boshqa sonlar."
      : `Robot endi uni ${best.name} deb oʻylayapti. Uning uchun surilgan rasm — butunlay boshqa sonlar.`);
    await ui.say("elder", `Endi belgiga qaraymiz: boʻyalgan kataklar ${vision.filled(original)} ta edi, endi ${vision.filled(moved)} ta — deyarli oʻzgarmadi.`);
    el.append(common.answerLine(`Belgi boʻyicha javob: ${vision.byFeature(moved)}`));
    sound.play("correct");
    await ui.say("elder", "Belgi (xususiyat) — rasmdan hisoblangan son, masalan boʻyalgan kataklar soni. U surilganda ham saqlanadi.");
  }

  const METHOD_LABELS = { shablon: "Faqat shablon", belgi: "Faqat belgi", ikkalasi: "Ikkalasi ham", hech: "Hech biri" };
  const METHOD_WHY = {
    shablon: "Faqat shablon: piksellar joyida, lekin kataklar soni boshqa shaklga yaqinlashdi",
    belgi: "Faqat belgi: rasm surilgan — piksellar mos kelmaydi, kataklar soni esa saqlangan",
    ikkalasi: "Ikkalasi ham: rasm deyarli oʻzgarmagan — piksellar ham, kataklar soni ham mos",
    hech: "Hech biri: rasm surilgan (shablon adashadi) va kataklar soni ham oʻzgargan (belgi adashadi)",
  };
  // Shablonlarning belgisi — bo'yalgan kataklar soni: "kvadrat 32 · uchburchak 24 · …"
  const featureLegend = () => vision.NAMES.map((n) => `${n} ${vision.filled(vision.TEMPLATES[n])}`).join(" · ");

  // 6.4: mashq — qaysi usul to'g'ri javob beradi? 4 javob: faqat shablon, faqat belgi, ikkalasi, hech biri.
  // Ekranda asboblar bor (kataklar soni va shablonlar belgisi), natijani bola o'zi chiqaradi.
  function methodTask(task) {
    const el = common.box(true);
    const board = visionUi.grid(el, {});
    board.set(task.image);
    el.append(common.line(`Haqiqiy shakl: ${task.truth} · rasm ${task.changed}`));
    const feature = visionUi.featureLine(el);
    feature.set(task.image);
    el.append(common.line(`Shablonlarda: ${featureLegend()}`));
    const list = visionUi.scores(el);
    ui.bubble("elder", "Qaysi usul toʻgʻri javob beradi: shablonmi, belgimi, ikkalasimi yoki hech biri?");
    return practice.tries({
      setup: (submit) => {
        const row = ui.h("div", { class: "choice-row" });
        task.options.forEach((key, i) => row.append(ui.button(METHOD_LABELS[key], () => submit(key), i % 2 ? "secondary" : "")));
        ui.clearControl();
        ui.control().append(row);
      },
      check: (key) => key === task.answer,
      hint: () => {
        // Asbob: moslik ustunchalari ochiladi (eng yaxshisi belgilanmaydi) — xulosani bola o'zi chiqaradi
        list.set(vision.bestMatch(task.image).list.slice(0, TOP), null);
        ui.bubble("elder", "↻ Eng oʻxshash uchta shablonni ochdim. Shablon — eng koʻp mos kelgani; belgi — kataklar soni eng yaqini. Ikkalasini haqiqiy shakl bilan solishtir.");
      },
      solution: () => {
        list.set(vision.bestMatch(task.image).list.slice(0, TOP), task.byPixels);
        el.append(common.answerLine(`Shablon: ${task.byPixels} · Belgi: ${task.byFeature}`));
        el.append(common.answerLine(METHOD_WHY[task.answer]));
      },
    });
  }

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art", html: scene.art === "robot" ? art.robot() : art.story(scene.art) })));
    for (const text of scene.lines) await ui.say("elder", text);
  }

  async function stage3() {
    await shiftDemo();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta oʻzgargan rasm — qaysi usul toʻgʻri javob beradi.`);
    await practice.exercises({
      next: (prev, correct, tier) => vision.makeMethodTask(prev, null, tier),
      run: methodTask,
      praise: (task) => ({
        belgi: "Belgi surilishga chidamli.",
        shablon: "Piksellar saqlangan — shablon yetarli, belgi esa adashdi.",
        ikkalasi: "Rasm deyarli oʻzgarmagan — ikkala usul ham topdi.",
        hech: "Surildi va kataklar qoʻshildi — ikkala usul ham adashdi.",
      }[task.answer]),
    });
    for (const scene of SCENES) await showScene(scene);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

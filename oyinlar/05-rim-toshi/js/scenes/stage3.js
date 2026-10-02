// 3-bosqich: pozitsion va nopozitsion tizim, xonalar mashqi, al-Xorazmiy hikoyasi (DIZAYN 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { roman, ui, art, romanUi, practice, common } = QK;

  // Hikoya: art — rasm (QK.art.story), caption — rasm ostidagi yozuv, lines — Oqsoqol gaplari
  const SCENES = [
    { art: "abacus", lines: ["Rimliklar hisobni hisob taxtasida qilgan.", "Rim raqamlari esa asosan yozib qoʻyish uchun edi."] },
    { art: "scroll", caption: "0 1 2 3 4 5 6 7 8 9", lines: ["Hindistonda 0 va oʻnlik pozitsion sonlar paydo boʻldi."] },
    { art: "scholar", caption: "Muhammad al-Xorazmiy", lines: ["Xorazmlik buyuk olim Muhammad al-Xorazmiy bu sonlar haqida kitob yozdi.", "Kitob Yevropaga yetib bordi va dunyo shu sonlarni ishlata boshladi."] },
    { art: "computer", caption: "algoritm", lines: ["«Algoritm» soʻzi al-Xorazmiy nomidan kelib chiqqan.", "Algoritm — ishni qadamma-qadam bajarish tartibi. Kompyuterlar ham shu bilan ishlaydi!"] },
  ];

  // 6.1: yoyilma — 352 va XXVII
  async function expand() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" });
    ui.work().append(box);
    const view = romanUi.placeView(box, 352, { labels: true });
    await ui.say("elder", "352 da 3 ta yuz, 5 ta oʻn va 2 ta bir bor.");
    view.showValues();
    box.append(ui.h("div", { class: "formula-row", text: "352 = 300 + 50 + 2" }));
    await ui.say("elder", "Har bir raqam turgan xonasiga qarab qiymat oladi.");
    box.innerHTML = "";
    box.append(romanUi.breakdown("XXVII"), ui.h("div", { class: "formula-row", text: "XXVII = 10 + 10 + 5 + 1 + 1 = 27" }));
    await ui.say("elder", "Rimda esa har bir belgining oʻz qiymati bor.");
  }

  // 6.2: tajriba — 5 va 2 joy almashadi
  async function swap() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" });
    ui.work().append(box);
    const view = romanUi.placeView(box, 352, { labels: true, values: true });
    view.highlight(1);
    ui.bubble("elder", "«Almashtir»ni bos: 5 va 2 joy almashadi. 5 ga nima boʻladi?");
    await ui.settle((done) => {
      ui.control().append(ui.button("Almashtir", () => {
        ui.clearControl();
        done();
      }));
    });
    view.set(325);
    view.highlight(2);
    await ui.say("elder", "5 raqami oʻnlar xonasida 50 edi, birlar xonasida esa 5!");
    await ui.say("elder", "Raqam qiymati turgan xonasiga bogʻliq — bu pozitsion tizim.");
    box.innerHTML = "";
    const row = ui.h("div", { class: "pairs" });
    for (const w of ["XV", "LX", "XXX"]) row.append(romanUi.breakdown(w, { mark: "X" }));
    box.append(row);
    await ui.say("elder", "Rimda X qayerda tursa ham 10 — bu nopozitsion tizim.");
  }

  // 6.3: nol nega kerak
  async function zero() {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" });
    ui.work().append(box);
    const view = romanUi.placeView(box, 105, { labels: true, values: true });
    view.highlight(1);
    await ui.say("elder", "105 da 0 oʻnlar xonasini band qilib turadi.");
    romanUi.placeView(box, 15, { labels: true, values: true });
    await ui.say("elder", "0 boʻlmasa, 1 va 5 yonma-yon turib, 15 boʻlib qolardi!");
    box.innerHTML = "";
    box.append(romanUi.breakdown("CV"), ui.h("div", { class: "formula-row", text: "CV = 100 + 5 = 105" }));
    await ui.say("elder", "Rimda nol yoʻq: 105 — CV.");
  }

  // 6.4: "{352} sonidagi {5} raqami nechaga teng?"
  function placeTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" });
    ui.work().append(box);
    const view = romanUi.placeView(box, task.number);
    ui.bubble("elder", `${task.number} sonidagi ${task.digit} raqami nechaga teng?`);
    return practice.numberTries({
      maxLen: 4,
      answer: task.answer,
      hint: () => {
        view.showLabels();
        view.highlight(task.index);
        const names = roman.places(task.number).map((p) => romanUi.PLACE_NAMES[p.place] + "mi");
        ui.bubble("elder", `↻ ${task.digit} qaysi xonada turibdi: ${names.join(", ")}?`);
      },
      solution: () => {
        view.showValues();
        view.highlight(task.index);
        box.append(common.answerLine(`${task.digit} — ${romanUi.PLACE_NAMES[task.place]} xonasida: ${task.answer}`));
      },
    });
  }

  // 6.4: "{3052} sonidan 0 ni olib tashlasak, qaysi son chiqadi?" — nol xonani band qilib turadi
  function zeroTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" });
    ui.work().append(box);
    const view = romanUi.placeView(box, task.number);
    ui.bubble("elder", `${task.number} sonidan 0 ni olib tashlasak, qaysi son hosil boʻladi?`);
    return practice.numberTries({
      maxLen: 4,
      answer: task.answer,
      hint: () => {
        view.showLabels();
        view.highlight(task.index);
        ui.bubble("elder", "↻ 0 turgan xona yoʻqoladi. Qolgan raqamlarni oʻz tartibida yonma-yon yoz.");
      },
      solution: () => {
        box.append(common.answerLine(`${task.number} → ${task.answer}: 0 boʻlmasa, raqamlar boshqa xonaga tushib qoladi`));
        romanUi.placeView(box, task.answer, { labels: true, values: true });
      },
    });
  }

  // 6.4: "{352} sonida {5} va {2} joy almashdi. Endi {5} nechaga teng?" — qiymat xonaga bog'liq
  function swapTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" });
    ui.work().append(box);
    const view = romanUi.placeView(box, task.number);
    ui.bubble("elder", `${task.number} sonida ${task.digit} va ${task.other} joy almashdi. Endi ${task.digit} nechaga teng?`);
    return practice.numberTries({
      maxLen: 4,
      answer: task.answer,
      hint: () => {
        // Asbob: almashgan son xona nomlari bilan — qiymatni bola o'zi aytadi
        view.set(task.swapped);
        view.showLabels();
        view.highlight(task.index);
        ui.bubble("elder", `↻ Almashtirdim: ${task.swapped}. Endi ${task.digit} qaysi xonada turibdi?`);
      },
      solution: () => {
        view.set(task.swapped);
        view.showValues();
        view.highlight(task.index);
        box.append(common.answerLine(`${task.digit} avval ${task.before} edi, endi ${romanUi.PLACE_NAMES[task.place]} xonasida: ${task.answer}`));
      },
    });
  }

  // 6.4: "{XIV} + {26} = ?" — Rim soni bilan hisoblash uchun avval uni aylantirish kerak
  function mixedTask(task) {
    ui.setCompact(true);
    ui.clearWork();
    ui.clearControl();
    const box = ui.h("div", { class: "rbox" },
      ui.h("div", { class: "expr" }, romanUi.word(task.roman), ui.h("span", { text: `+ ${task.b} = ?` })));
    ui.work().append(box);
    ui.bubble("elder", `${task.roman} ga ${task.b} ni qoʻsh. Javobni oddiy son bilan yoz.`);
    return practice.numberTries({
      answer: task.answer,
      hint: () => {
        box.append(romanUi.breakdown(task.roman, { grouped: true }));
        ui.bubble("elder", "↻ Avval Rim sonini oʻqi: guruhlar ostidagi qiymatlarni qoʻsh. Keyin hisobla.");
      },
      solution: () => {
        const line = common.answerLine(`${task.roman} = ${task.n}; ${task.n} + ${task.b} = ${task.answer}`);
        box.append(line);
        line.scrollIntoView({ block: "nearest" });
      },
    });
  }

  const TASKS = { place: placeTask, zero: zeroTask, swap: swapTask, mixed: mixedTask };
  const PRAISES = {
    place: (task) => `${task.digit} — ${romanUi.PLACE_NAMES[task.place]} xonasida: ${task.answer}.`,
    zero: (task) => `0 siz ${task.number} — ${task.answer} boʻlib qoladi. Nol xonani band qilib turadi.`,
    swap: (task) => `${task.digit} endi ${romanUi.PLACE_NAMES[task.place]} xonasida: ${task.answer}.`,
    mixed: (task) => `${task.roman} = ${task.n}, ${task.n} + ${task.b} = ${task.answer}.`,
  };

  async function showScene(scene) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" },
      ui.h("div", { class: "story-art", html: art.story(scene.art) }),
      scene.caption ? ui.h("div", { class: "story-caption", text: scene.caption }) : null));
    for (const line of scene.lines) await ui.say("elder", line);
  }

  // Joriy yil Rim raqamida (M — 1000)
  async function yearScene() {
    const year = new Date().getFullYear();
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.work().append(ui.h("div", { class: "story" },
      common.stone(roman.toRoman(year)),
      ui.h("div", { class: "story-caption", text: String(year) })));
    await ui.say("elder", "M — 1000. Bu yil Rim raqamida shunday yoziladi!");
  }

  async function stage3() {
    await expand();
    await swap();
    await zero();
    await ui.say("elder", `Endi oʻzing: raqam qaysi xonada turibdi? ${QK.practice.need()} ta toʻgʻri javob!`);
    await ui.say("elder", "Savollar qiyinlashib boradi: nol, joy almashish va Rim soni bilan hisob ham keladi.");
    await practice.exercises({
      next: (prev, correct, tier) => roman.makeStage3Task(correct, prev, null, tier),
      run: (task) => TASKS[task.type](task),
      praise: (task) => PRAISES[task.type](task),
    });
    for (const scene of SCENES) await showScene(scene);
    await yearScene();
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

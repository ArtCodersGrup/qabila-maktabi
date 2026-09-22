// Poyga: ikki kishi bitta kompyuterda navbat bilan bir xil matnni yozadi (DIZAYN 9-bo'lim).
// Oy va Quyosh belgilari musobaqa rejimidan (../musobaqa/js/musobaqa-art.js).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, typing: T, typingUi, common } = QK;
  const mart = QK.musobaqaArt;

  const NAMES = { left: "Oy", right: "Quyosh" };
  const of = (side) => NAMES[side] + "ning"; // "Oyning", "Quyoshning"
  const other = (side) => (side === "left" ? "right" : "left");

  const who = (side) => ui.h("span", { class: "who side-" + side, html: mart.emblem(side) }, ui.h("span", { text: NAMES[side] }));

  // 3, 2, 1 — keyin "Boshla!" lahzasi (vaqt shundan hisoblanadi)
  async function countdown(el) {
    const num = ui.h("div", { class: "countdown" });
    el.append(num);
    for (const n of ["3", "2", "1"]) {
      num.textContent = n;
      sound.play("tak");
      await ui.sleep(700);
    }
    num.remove();
  }

  async function turn(side, text, ghost) {
    const el = common.box(false);
    el.append(ui.h("div", { class: "turn-head" }, who(side)), ui.h("div", { class: "race-text", text }));
    ui.bubble("elder", `${NAMES[side]} navbati. Barmoqlarni asosiy qatorga qoʻy.`);
    await common.waitButton("Tayyor");
    ui.bubble("elder", "Diqqat…");
    await countdown(el);
    const start = root.performance.now();
    const pending = common.typeLine({ text, stage: 3, side, start, ghost, ghostSide: other(side) });
    ui.bubble("elder", ghost ? `Boshla! Xira xabarchi — ${of(other(side))} tezligi.` : "Boshla!");
    const { stats, session } = await pending;
    sound.play("correct");
    common.add(ui.work().querySelector(".tbox"), typingUi.result(stats, { speed: true }));
    await ui.say("elder", `${NAMES[side]}: aniqlik ${stats.accuracy}%, vaqt ${typingUi.comma(stats.seconds)} soniya.`);
    return { stats, times: session.times };
  }

  function verdict(r) {
    if (r.reason === "low") return `Bu safar hech kim yutmadi: aniqlik ${T.PASS}% dan past. Shoshilmay yozinglar!`;
    if (r.reason === "draw") return "Durang! Ikkalangiz ham bir xil vaqtda yozdingiz.";
    const w = r.winner;
    if (r.reason === "accuracy") return `${NAMES[w]} yutdi! ${of(other(w))} aniqligi ${T.PASS}% dan past.`;
    return `${NAMES[w]} yutdi! Ikkalangiz ham aniq yozdingiz, ${NAMES[w]} tezroq.`;
  }

  function table(results, winner) {
    const rows = ["left", "right"].map((side) => {
      const st = results[side];
      return ui.h("tr", { class: side === winner ? "win" : "" },
        ui.h("td", null, who(side)),
        ui.h("td", { text: `${typingUi.comma(st.seconds)} s` }),
        ui.h("td", { text: `${st.accuracy}%${T.passed(st) ? "" : " ↻"}` }),
        ui.h("td", { text: String(st.cpm) }));
    });
    return ui.h("table", { class: "race-table" },
      ui.h("thead", null, ui.h("tr", null,
        ui.h("th", { text: "" }), ui.h("th", { text: "Vaqt" }), ui.h("th", { text: "Aniqlik" }), ui.h("th", { text: "Belgi/daqiqa" }))),
      ui.h("tbody", null, ...rows));
  }

  async function race() {
    await common.keyboardCheck({ askKey: false });
    let first = "left";
    let prev = null;
    let level = null;
    for (;;) {
      if (!level) {
        const el = common.box(false);
        el.append(ui.h("div", { class: "turn-head" }, who("left"), who("right")));
        ui.bubble("elder", "Doʻsting bilan poyga! Matn bir xil, navbat bilan yozasizlar. Qaysi matn?");
        level = await ui.choice(T.RACE_LEVELS.map((l) => ({ label: l.title, value: l.id })));
      }
      const text = T.raceText(level, prev);
      prev = text;
      const results = {};
      let ghost = null;
      for (const side of [first, other(first)]) {
        const res = await turn(side, text, ghost);
        results[side] = res.stats;
        ghost = res.times;
      }

      const r = T.raceResult(results.left, results.right);
      const el = common.box(false);
      el.append(table(results, r.winner));
      sound.play(r.winner ? "win" : "retry");
      if (r.winner) ui.pose(r.winner === "left" ? "elder" : "apprentice", "happy", 1500);
      ui.bubble("elder", verdict(r));
      const next = await ui.choice([
        { label: "Yana poyga", value: "again" },
        { label: "Boshqa matn", value: "level", secondary: true },
        { label: "Bosh ekran", value: "home", secondary: true },
      ]);
      if (next === "home") return;
      if (next === "level") level = null;
      first = other(first); // keyingi poygada ikkinchisi boshlaydi
    }
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { race });
})(window);

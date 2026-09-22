// Tez yozish poygasi: ikki kishi bitta kompyuterda navbat bilan bir xil matnni yozadi (23-o'yin DIZAYN 9-bo'lim).
// Yozish — 23-o'yindan (typing.js, typing-ui.js, typing-play.js), Oy va Quyosh belgilari — musobaqadan.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, typing: T, typingUi } = QK;
  const common = QK.typingPlay;
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

  // Bosh ekran: sarlavha, qoidalar, matn turini tanlash
  function chooseLevel() {
    const el = common.box(false);
    el.append(
      ui.h("a", { class: "back-link", href: "../../index.html", text: "◀︎ Barcha oʻyinlar" }),
      ui.h("h1", { class: "game-title", text: "Tez yozish poygasi" }),
      ui.h("div", { class: "turn-head" }, who("left"), who("right")),
      ui.h("p", { class: "race-note", text: `Matn bir xil, navbat bilan yozasizlar. Aniqligi ${T.PASS}% dan past boʻlgan yuta olmaydi, keyin — kim tezroq.` }),
      ui.h("a", { class: "learn-link", href: "../23-on-barmoq/index.html", text: "Oʻn barmoq bilan yozishni oʻrganish — «Oʻn barmoq» oʻyini ▶︎" }));
    ui.bubble("elder", "Doʻsting bilan poyga! Qaysi matnni yozasizlar?");
    return ui.choice(T.RACE_LEVELS.map((l) => ({ label: l.title, value: l.id })));
  }

  async function race() {
    await common.keyboardCheck({ askKey: false });
    let first = "left";
    let prev = null;
    let level = null;
    for (;;) {
      if (!level) level = await chooseLevel();
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
        { label: "Barcha oʻyinlar", value: "home", secondary: true },
      ]);
      if (next === "home") return;
      if (next === "level") level = null;
      first = other(first); // keyingi poygada ikkinchisi boshlaydi
    }
  }

  QK.poyga = { race };
})(window);

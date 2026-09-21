// 2-bosqich: asos va raqamlar, yozuv, tizim turlari (DIZAYN 5-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { sanoq, tizim, ui, sound, practice, common } = QK;
  const S = sanoq;

  // Asos tanlagich: "− 5-lik +" va shu tizim raqamlari
  function digitStrip(base) {
    const row = ui.h("div", { class: "digits" });
    for (let v = 0; v < base; v++) {
      row.append(ui.h("span", { class: "digit-tile" + (v >= 10 ? " letter" : "") },
        ui.h("span", { class: "dt-ch", text: S.digitChar(v) }),
        v >= 10 ? ui.h("span", { class: "dt-val", text: `= ${v}` }) : null));
    }
    return row;
  }

  // 5.1: bola asosni 2 dan 16 gacha oshiradi
  async function growBase() {
    const el = common.box(true);
    const title = ui.h("div", { class: "big-value" });
    const strip = ui.h("div", { class: "strip-host" });
    el.append(title, strip);
    let base = 2;
    const render = () => {
      title.textContent = `${base}-lik: ${base} ta raqam`;
      strip.replaceChildren(digitStrip(base));
    };
    render();
    ui.bubble("elder", "Asosni oshirib koʻr: raqamlar qanday oʻzgaradi? 16 gacha bor!");
    let toldA = false;
    await ui.settle((done) => {
      const minus = ui.h("button", { class: "key", type: "button", text: "−", "aria-label": "Asosni kamaytirish" });
      const plus = ui.h("button", { class: "key", type: "button", text: "+", "aria-label": "Asosni oshirish" });
      const sync = () => { minus.disabled = base <= 2; plus.disabled = base >= 16; };
      minus.addEventListener("click", () => { if (base > 2) { base--; sound.play("tap"); render(); sync(); } });
      plus.addEventListener("click", () => {
        if (base >= 16) return;
        base++;
        sound.play("tap");
        render();
        sync();
        if (base === 11 && !toldA) {
          toldA = true;
          ui.bubble("elder", "10 dan katta raqam uchun yangi belgi kerak: A — oʻn! Davom et.");
        }
        if (base === 16) {
          ui.clearControl();
          done();
        }
      });
      sync();
      ui.control().append(ui.h("div", { class: "counter" }, minus, ui.h("div", { class: "counter-val", text: "Asos" }), plus));
    });
    sound.play("correct");
    await ui.say("elder", "16-likda 16 ta raqam: 0–9 va A–F. A = 10, B = 11 … F = 15.");
    await ui.say("elder", "n-lik tizimda raqamlar 0 dan n−1 gacha boʻladi.");
  }

  // 5.2–5.3: yozuv va turlari
  async function kinds() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "big-value", text: "101₂" }));
    await ui.say("elder", "Bu — «bir-nol-bir, ikkilik». Pastdagi kichik son — asos.");
    await ui.say("elder", "Asosni yozish shart: 10 — oʻnlikda «oʻn», ikkilikda esa «bir-nol», yaʼni ikki!");
    el.append(ui.h("div", { class: "kinds" },
      ui.h("div", { class: "kind-card" },
        ui.h("div", { class: "kind-title", text: "Pozitsion" }),
        ui.h("div", { text: "2-lik, 8-lik, 10-lik, 16-lik" }),
        ui.h("div", { class: "kind-ex", text: "352: 5 — ellik" })),
      ui.h("div", { class: "kind-card" },
        ui.h("div", { class: "kind-title", text: "Nopozitsion" }),
        ui.h("div", { text: "Rim raqamlari" }),
        ui.h("div", { class: "kind-ex", text: "XX: X — har joyda 10" }))));
    await ui.say("elder", "Pozitsion tizimda raqam qiymati turgan xonasiga bogʻliq.");
    await ui.say("elder", "Nopozitsion tizimda belgi qiymati oʻzgarmaydi — Rim raqamlarini esla (5-oʻyin).");
  }

  // 5.4: mashq — yozuv to'g'rimi / eng kichik asos / harf qiymati
  function digitTask(task) {
    const el = common.box(true);
    if (task.type === "valid") {
      el.append(ui.h("div", { class: "big-value", text: S.fmt(task.number, task.base) }));
      ui.bubble("elder", "Bu yozuv toʻgʻrimi?");
      return practice.tries({
        setup: (submit) => {
          const row = ui.h("div", { class: "choice-row" });
          row.append(ui.button("Ha", () => submit("ha")), ui.button("Yoʻq", () => submit("yoq"), "secondary"));
          ui.clearControl();
          ui.control().append(row);
        },
        check: (value) => value === task.answer,
        hint: () => {
          common.add(el, common.line(`${task.base}-likda raqamlar: 0 … ${S.digitChar(task.base - 1)}`));
          ui.bubble("elder", "↻ Har bir raqamni tekshir.");
        },
        solution: () => {
          const bad = [...task.number].find((ch) => S.digitValue(ch) >= task.base);
          common.add(el, common.answerLine(bad
            ? `${bad} — ${task.base}-likda bunday raqam yoʻq`
            : `Hamma raqam ${task.base} dan kichik — toʻgʻri`));
        },
      });
    }
    if (task.type === "minBase") {
      el.append(ui.h("div", { class: "big-value", text: task.number }));
      ui.bubble("elder", "Bu son eng kamida qaysi tizimda boʻlishi mumkin?");
      const max = Math.max(...[...task.number].map(S.digitValue));
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          common.add(el, common.line("Eng katta raqamni top: asos undan katta boʻladi"));
          ui.bubble("elder", "↻ Qaysi raqam eng katta?");
        },
        solution: () => common.add(el, common.answerLine(`Eng katta raqam ${S.digitChar(max)}${max >= 10 ? ` (= ${max})` : ""} → kamida ${task.answer}-lik`)),
      });
    }
    el.append(ui.h("div", { class: "big-value", text: S.fmt(task.digit, 16) }));
    ui.bubble("elder", "16-likda bu raqam nechaga teng?");
    return practice.numberTries({
      answer: task.answer,
      hint: () => {
        common.add(el, common.line("A — 10 dan boshlanadi: A, B, C, D, E, F"));
        ui.bubble("elder", "↻ A dan boshlab sana.");
      },
      solution: () => common.add(el, common.answerLine(`${task.digit} = ${task.answer}`)),
    });
  }

  function praise(task) {
    if (task.type === "valid") return task.answer === "ha" ? "Yozuv toʻgʻri." : "Bunday raqam bu tizimda yoʻq.";
    if (task.type === "minBase") return `Kamida ${task.answer}-lik.`;
    return `${task.digit} = ${task.answer}.`;
  }

  async function stage2() {
    await growBase();
    await kinds();
    await ui.say("elder", "Endi oʻzing tekshir: raqamlar va asoslar. 3 ta toʻgʻri javob!");
    await practice.exercises({
      next: (prev) => tizim.makeDigitTask(prev),
      run: digitTask,
      praise,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

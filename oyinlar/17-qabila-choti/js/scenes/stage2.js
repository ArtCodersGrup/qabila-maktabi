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
    ui.bubble("elder", "Asosni 16 gacha oshir va raqamlar toʻplamini kuzat.");
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
          ui.bubble("elder", "10 ga teng raqam uchun yangi belgi kerak: A = 10. Davom et.");
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
    await ui.say("elder", "b-lik tizimda raqamlar 0 dan b−1 gacha — jami b ta.");
  }

  // 5.2–5.3: yozuv va turlari
  async function kinds() {
    const el = common.box(false);
    el.append(ui.h("div", { class: "big-value", text: "101₂" }));
    await ui.say("elder", "Oʻqilishi: «bir-nol-bir, ikkilik». Pastdagi kichik son — asos.");
    await ui.say("elder", "Asos yozilmasa, yozuv ikki xil oʻqiladi: 10₁₀ = oʻn, 10₂ = ikki.");
    el.append(ui.h("div", { class: "kinds" },
      ui.h("div", { class: "kind-card" },
        ui.h("div", { class: "kind-title", text: "Pozitsion" }),
        ui.h("div", { text: "2-lik, 8-lik, 10-lik, 16-lik" }),
        ui.h("div", { class: "kind-ex", text: "352: 5 — ellik" })),
      ui.h("div", { class: "kind-card" },
        ui.h("div", { class: "kind-title", text: "Nopozitsion" }),
        ui.h("div", { text: "Rim raqamlari" }),
        ui.h("div", { class: "kind-ex", text: "XX: X — har joyda 10" }))));
    await ui.say("elder", "Pozitsion tizimda raqam qiymati turgan xonasiga bogʻliq: 352 dagi 5 — ellik.");
    await ui.say("elder", "Nopozitsion tizimda belgi qiymati joyiga bogʻliq emas — masalan, Rim raqamlari («Rim toshi» oʻyini).");
  }

  // 5.4: mashq — noto'g'ri raqamni bos / eng kichik asos / harf qiymati
  function digitTask(task) {
    const el = common.box(true);
    if (task.type === "valid") {
      // Har raqam — tugma; bittasi xato bo'lishi mumkin. Variantlar: raqamlar soni + "Hammasi toʻgʻri"
      el.append(ui.h("div", { class: "count-line", text: `${task.base}-lik son` }));
      const tiles = ui.h("div", { class: "pick-digits" });
      const cells = [];
      let open = true;
      el.append(tiles);
      ui.bubble("elder", "Bu tizimda boʻlmaydigan raqam bormi? Boʻlsa — uni bos.");
      return practice.tries({
        setup: (submit) => {
          [...task.number].forEach((ch, i) => {
            const b = ui.h("button", { class: "pick-digit", type: "button", text: ch, "aria-label": `${i + 1}-raqam: ${ch}` });
            b.addEventListener("click", () => { if (open) { sound.play("tap"); submit(i); } });
            cells.push(b);
            tiles.append(b);
          });
          tiles.append(ui.h("span", { class: "pick-base", text: S.sub(task.base) }));
          ui.clearControl();
          ui.control().append(ui.h("div", { class: "choice-row" }, ui.button("Hammasi toʻgʻri", () => submit(-1), "secondary")));
        },
        check: (value) => value === task.answer,
        hint: () => {
          common.add(el, common.line(`b-lik tizimda raqamlar 0 dan b−1 gacha. Bu yerda b = ${task.base}`));
          ui.bubble("elder", "↻ Har bir raqamni asos bilan solishtir.");
        },
        solution: () => {
          open = false;
          if (task.answer >= 0) cells[task.answer].classList.add("bad");
          common.add(el, common.answerLine(task.answer >= 0
            ? `${task.number[task.answer]} — ${task.base}-likda bunday raqam yoʻq (eng kattasi ${S.digitChar(task.base - 1)})`
            : `Hamma raqam ${task.base} dan kichik — yozuv toʻgʻri`));
        },
      }).then((ok) => {
        open = false;
        if (ok && task.answer >= 0) cells[task.answer].classList.add("bad");
        return ok;
      });
    }
    if (task.type === "minBase") {
      el.append(ui.h("div", { class: "big-value", text: task.number }));
      ui.bubble("elder", "Bu yozuv uchun eng kichik mumkin boʻlgan asos qaysi?");
      const max = Math.max(...[...task.number].map(S.digitValue));
      return practice.numberTries({
        answer: task.answer,
        hint: () => {
          common.add(el, common.line("Eng katta raqamni top: asos undan katta boʻladi"));
          ui.bubble("elder", "↻ Eng katta raqamga qara: asos undan kamida 1 ga katta.");
        },
        solution: () => common.add(el, common.answerLine(`Eng katta raqam ${S.digitChar(max)}${max >= 10 ? ` (= ${max})` : ""} → kamida ${task.answer}-lik`)),
      });
    }
    el.append(ui.h("div", { class: "big-value", text: S.fmt(task.digit, 16) }));
    ui.bubble("elder", "16-likdagi bu raqam oʻnlikda nechaga teng?");
    return practice.numberTries({
      answer: task.answer,
      hint: () => {
        common.add(el, common.line("A — 10 dan boshlanadi: A, B, C, D, E, F"));
        ui.bubble("elder", "↻ A = 10 dan boshlab sana.");
      },
      solution: () => common.add(el, common.answerLine(`${task.digit} = ${task.answer}`)),
    });
  }

  function praise(task) {
    if (task.type === "valid") return task.answer < 0 ? "Yozuv toʻgʻri." : `${task.number[task.answer]} — ${task.base}-likda bunday raqam yoʻq.`;
    if (task.type === "minBase") return `Kamida ${task.answer}-lik.`;
    return `${task.digit} = ${task.answer}.`;
  }

  async function stage2() {
    await growBase();
    await kinds();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta — notoʻgʻri raqam, eng kichik asos, 16-lik harflar.`);
    await practice.exercises({
      next: (prev, correct, tier) => tizim.makeDigitTask(prev, undefined, tier),
      run: digitTask,
      praise,
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

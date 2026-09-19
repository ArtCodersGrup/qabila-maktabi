// Bosqichlar uchun umumiy sahna qismlari: mashq sikli, qo'lda yasash, daraxt sahnalari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { logic, ui, sound, art } = QK;

  const PRAISE = ["✓ Barakalla!", "✓ Zoʻr!", "✓ Toʻppa-toʻgʻri!", "✓ Ofarin!"];

  // Mashq: 3 ta to'g'ri javobgacha tasodifiy misollar (QOIDALAR 4.4, 4.5).
  // 1-xato — maslahat (spec.hint), 2-xato — yechim (spec.solution) va yangi misol;
  // xato qilingan misol to'g'ri javoblar soniga qo'shilmaydi.
  async function exercises(stage, spec) {
    let prev = null;
    let correct = 0;
    ui.setProgress(3, 0);
    while (correct < 3) {
      const ex = logic.makeExercise(stage, prev);
      prev = ex;
      QK.current = ex; // brauzerda tekshirish uchun
      spec.show(ex);
      for (let wrong = 0; ; ) {
        const value = await ui.askNumber();
        if (logic.checkAnswer(ex, value)) {
          correct++;
          ui.setProgress(3, correct);
          sound.play("correct");
          ui.pose("apprentice", "happy", 900);
          await ui.say("elder", PRAISE[(correct - 1) % PRAISE.length]);
          break;
        }
        wrong++;
        sound.play("retry");
        ui.pose("apprentice", "think", 1000);
        if (wrong === 1) {
          spec.hint(ex);
        } else {
          spec.solution(ex);
          await ui.say("elder", `Toʻgʻri javob: ${ex.answer}. Endi yangi misol.`);
          break;
        }
      }
    }
    ui.hideProgress();
  }

  // Ko'rsatish qismidagi bitta savol. true — bola o'zi topdi, false — 2 xatodan keyin javob aytildi.
  async function askUntilCorrect(answer, hint) {
    QK.current = { answer }; // brauzerda tekshirish uchun
    for (let wrong = 0; ; ) {
      const value = await ui.askNumber();
      if (value === answer) {
        sound.play("correct");
        ui.pose("apprentice", "happy", 900);
        return true;
      }
      wrong++;
      sound.play("retry");
      ui.pose("apprentice", "think", 1000);
      if (wrong === 1) {
        hint();
      } else {
        await ui.say("elder", `Toʻgʻri javob: ${answer}.`);
        return false;
      }
    }
  }

  const hintTitle = () => ui.h("div", { class: "hint-title", text: "↻ Maslahat:" });

  // □ □ □ kataklari, har birining tagida variantlar soni
  function variantSlots(a, i) {
    const row = ui.h("div", { class: "slots" });
    const caption = i <= 3 ? `${a} ta variant` : `${a} ta`;
    for (let k = 0; k < i; k++) {
      row.append(ui.h("div", { class: "slot-f" },
        ui.h("div", { class: "slot" }),
        ui.h("div", { class: "slot-cap", text: caption })));
    }
    return row;
  }

  const paperText = (type, i) => (type === "exact" ? String(i) : `1–${i}`);

  // 1- va 2-bosqich mashqlari (DIZAYN 4.3, 5.3)
  function stage12Spec(type) {
    return {
      show(ex) {
        ui.setCompact(false);
        ui.clearWork();
        ui.paper(paperText(type, ex.i));
        ui.raisePaper(true);
        const question = type === "exact"
          ? `Aynan ${ex.i} harfli nechta soʻz bor?`
          : `${ex.i} harfgacha (${logic.upToText(ex.i)} harfli) nechta soʻz bor?`;
        ui.bubble("elder", ui.lettersLine("Harflar:", ex.letters, question));
      },
      hint(ex) {
        ui.clearWork();
        const box = ui.h("div", { class: "formula-box" }, hintTitle());
        if (type === "exact") {
          box.append(
            variantSlots(ex.a, ex.i),
            ui.h("div", { class: "formula", text: `${logic.productText(ex.a, ex.i)} = ?` }));
        } else {
          for (let k = 1; k <= ex.i; k++) {
            box.append(ui.h("div", { class: "formula-row", text: `${k} harfli: ${logic.productText(ex.a, k)}` }));
          }
          box.append(ui.h("div", { class: "formula", text: `${logic.sumText(ex.a, ex.i)} = ?` }));
        }
        ui.work().append(box);
      },
      solution(ex) {
        ui.clearWork();
        const box = ui.h("div", { class: "formula-box" });
        if (type === "exact") {
          box.append(ui.h("div", { class: "formula", text: `${logic.productText(ex.a, ex.i)} = ${ex.answer}` }));
        } else {
          box.append(ui.h("div", { class: "formula", text: `${logic.sumText(ex.a, ex.i)} = ${ex.answer}` }));
          const parts = [];
          for (let k = 1; k <= ex.i; k++) parts.push(logic.countExact(ex.a, k));
          box.append(ui.h("div", { class: "formula-row", text: `${parts.join(" + ")} = ${ex.answer}` }));
        }
        ui.work().append(box);
      },
    };
  }

  // Qo'lda yasash + devor. allowShort — 1..len harfli so'zlar (2-bosqich), devor ikki ustunli
  async function manualWall(letters, len, allowShort) {
    ui.setCompact(false);
    ui.clearWork();
    const slots = ui.h("div", { class: "slots" });
    const wall = ui.h("div", { class: "wall" });
    const cols = {};
    if (allowShort) {
      for (let k = 1; k <= len; k++) {
        cols[k] = ui.h("div", { class: "wall-col" }, ui.h("div", { class: "wall-title", text: `${k} harfli` }));
        wall.append(cols[k]);
      }
    }
    ui.work().append(slots, wall);
    await ui.buildWords({
      letters,
      len,
      allowShort,
      targets: logic.listWords(letters, len, allowShort ? "upto" : "exact"),
      slotsHost: slots,
      onFound: (w) => (allowShort ? cols[w.length] : wall).append(ui.wordChip(w, letters)),
    });
  }

  // Qo'lda yasash + daraxt: topilgan so'zning yo'li rangga kiradi (DIZAYN 1.2)
  async function manualTree(letters, depth) {
    ui.setCompact(true);
    ui.clearWork();
    const slots = ui.h("div", { class: "slots" });
    const box = ui.h("div", { class: "tree-box" });
    ui.work().append(slots, box);
    const lit = new Set();
    const draw = () => { box.innerHTML = art.tree(letters, depth, { lit }); };
    draw();
    await ui.buildWords({
      letters,
      len: depth,
      allowShort: false,
      targets: logic.listWords(letters, depth, "exact"),
      slotsHost: slots,
      onFound: (w) => { lit.add(w); draw(); },
    });
  }

  // Daraxt bir qavat o'sadi: depth−1 dan depth ga (DIZAYN 1.3)
  async function growTree(letters, depth) {
    ui.setCompact(true);
    ui.clearWork();
    const box = ui.h("div", { class: "tree-box" });
    ui.work().append(box);
    box.innerHTML = art.tree(letters, depth - 1, { lit: new Set(logic.listWords(letters, depth - 1, "exact")) });
    await ui.sleep(900);
    box.innerHTML = art.tree(letters, depth, {
      lit: new Set(logic.listWords(letters, depth, "exact")),
      animateLevel: depth,
    });
    await ui.sleep(1200);
  }

  // Har bir tugun — so'z: qavatlar birin-ketin yonadi, tepasida "{n} ta" (DIZAYN 2.2).
  // Qavat sonlari HTML matn sifatida ham chiqadi — daraxt kichik bo'lsa ham o'qiladi (I1).
  async function treeLevels(letters, depth) {
    ui.setCompact(true);
    ui.clearWork();
    const counts = ui.h("div", { class: "level-counts" });
    const box = ui.h("div", { class: "tree-box" });
    ui.work().append(counts, box);
    const levels = [];
    for (let lv = 1; lv <= depth; lv++) {
      levels.push(lv);
      counts.textContent = levels
        .map((L) => `${L}-qavat: ${logic.countExact(letters.length, L)} ta`)
        .join(" · ");
      box.innerHTML = art.tree(letters, depth, {
        lit: new Set(logic.listWords(letters, lv, "upto")),
        levelCounts: levels.slice(),
        animateLevel: lv,
      });
      await ui.sleep(900);
    }
  }

  QK.common = {
    PRAISE, exercises, askUntilCorrect, hintTitle, variantSlots, paperText, stage12Spec,
    manualWall, manualTree, growTree, treeLevels,
  };
})(window);

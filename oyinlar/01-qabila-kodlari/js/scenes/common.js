// Bosqichlar uchun umumiy sahna qismlari: mashq sikli, qo'lda yasash, daraxt sahnalari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { logic, ui, sound, art, practice } = QK;

  const PRAISE = practice.PRAISE;

  // Mashq (QOIDALAR 4.4, 4.5): umumiy practice.exercises — bosqichga qarab 4 / 5 / 6 ta to'g'ri javob,
  // qiyinlik zinasi (tier), yulduzlar va qiyin rejim. 1-xato — maslahat (spec.hint), 2-xato — yechim
  // (spec.solution) va yangi misol; xato qilingan misol to'g'ri javoblar soniga qo'shilmaydi.
  function exercises(stage, spec) {
    return practice.exercises({
      next: (prev, correct, tier) => logic.makeExercise(stage, prev, null, tier),
      run: (ex) => {
        spec.show(ex);
        return practice.numberTries({
          answer: ex.answer,
          hint: () => spec.hint(ex),
          solution: () => spec.solution(ex),
        });
      },
      praise: (ex) => (spec.praise ? spec.praise(ex) : ""),
    });
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

  // Uzunlik sharti: "aynan 3" yoki "1–3"
  const lenText = (type, i) => (type === "exact" ? `aynan ${i}` : `1–${i}`);

  // Shart kartasi (ish zonasida): alifbo, so'z uzunligi, kerak bo'lsa odamlar soni.
  // Avval shogird qog'ozida turgan uzunlik endi shu yerda — kattalar ko'rinishida ham ko'rinadi.
  function condCard({ letters, len, people }) {
    const card = ui.h("div", { class: "cond-card" });
    if (letters) {
      const row = ui.h("div", { class: "cond-row" }, ui.h("span", { text: `Alifbo (a = ${letters.length}):` }));
      letters.forEach((l, k) => row.append(ui.tile(l, k, "xs")));
      card.append(row);
    }
    if (len) card.append(ui.h("div", { class: "cond-row", text: `Uzunlik: ${len}` }));
    if (people) card.append(ui.h("div", { class: "cond-row", text: `Odamlar: ${people}` }));
    return card;
  }

  // 1- va 2-bosqich mashqlari (DIZAYN 4.3, 5.3)
  function stage12Spec(type) {
    return {
      show(ex) {
        ui.setCompact(false);
        ui.clearWork();
        ui.work().append(condCard({ letters: ex.letters, len: lenText(type, ex.i) }));
        const question = type === "exact"
          ? `Aynan ${ex.i} harfli soʻzlar nechta?`
          : `${ex.i} harfgacha (${logic.upToText(ex.i)} harfli) soʻzlar nechta?`;
        ui.bubble("elder", ui.lettersLine("Alifbo:", ex.letters, question));
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
      praise: (ex) => (type === "exact"
        ? `${logic.productText(ex.a, ex.i)} = ${ex.answer}.`
        : `${logic.sumText(ex.a, ex.i)} = ${ex.answer}.`),
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
    ui.work().append(condCard({ letters, len: lenText(allowShort ? "upto" : "exact", len) }));
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
    ui.work().append(condCard({ letters, len: lenText("exact", depth) }));
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
    ui.work().append(condCard({ letters, len: lenText("exact", depth) }));
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
  async function treeLevels(letters, depth, showCond = true) {
    ui.setCompact(true);
    ui.clearWork();
    if (showCond) ui.work().append(condCard({ letters, len: lenText("upto", depth) }));
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
    PRAISE, exercises, askUntilCorrect, hintTitle, variantSlots, lenText, condCard, stage12Spec,
    manualWall, manualTree, growTree, treeLevels,
  };
})(window);

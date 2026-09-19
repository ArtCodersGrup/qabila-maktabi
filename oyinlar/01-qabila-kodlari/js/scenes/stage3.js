// 3-bosqich: eng kamida nechta harf kerak (DIZAYN.md, 6-bo'lim).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { logic, ui, sound, art, common } = QK;

  const condText = (type, i) => (type === "exact" ? `aynan ${i} harfli` : `${i} harfgacha`);

  // a ta harfdan yasalgan ismlar odamlarga birma-bir beriladi. a = 0 — hech kimda ism yo'q.
  // Odam ko'p bo'lsa (12 dan ortiq), ism o'rniga ✓ ko'rsatiladi — ekranga sig'ishi uchun.
  function renderCrowd(crowd, info, people, i, type, a) {
    const letters = logic.LETTER_POOL.slice(0, a);
    const names = logic.listWords(letters, i, type);
    const small = people > 12;
    crowd.innerHTML = "";
    crowd.classList.toggle("small", small);
    for (let p = 0; p < people; p++) {
      const name = names[p];
      let label;
      if (!name) label = ui.h("div", { class: "noname", text: "?" });
      else if (small) label = ui.h("div", { class: "hasname", text: "✓" });
      else label = ui.wordChip(name, letters);
      crowd.append(ui.h("div", { class: "person" }, ui.h("div", { html: art.person(!!name, p) }), label));
    }
    if (info) {
      const n = names.length;
      info.textContent = n >= people
        ? `${a} ta harf → ${n} ta ism. Hammaga yetdi ✓`
        : `${a} ta harf → ${n} ta ism. ${people - n} kishiga yetmadi.`;
    }
  }

  // "1 ta harf → 1 ta soʻz — yetmaydi" qatorlari (qoida va 2-xatodagi yechim uchun)
  function stepsBox(title, people, i, type) {
    const box = ui.h("div", { class: "formula-box" }, ui.h("div", { class: "formula-row", text: title }));
    for (const s of logic.stage3Steps(people, i, type)) {
      box.append(ui.h("div", {
        class: "formula-row",
        text: `${s.a} ta harf → ${s.count} ta soʻz ${s.enough ? "✓ yetadi" : "— yetmaydi"}`,
      }));
    }
    return box;
  }

  // 6.1: bola "+" ni bosib harflar sonini oshiradi; yetgan birinchi son — javob
  async function peopleDemo(people, i, type) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper(common.paperText(type, i));
    ui.raisePaper(true);
    const crowd = ui.h("div", { class: "people" });
    const info = ui.h("div", { class: "people-info" });
    const tools = ui.h("div");
    ui.work().append(crowd, info, tools);
    renderCrowd(crowd, null, people, i, type, 0);
    await ui.say("elder", `Qabilada ${people} ta odam bor. Har biriga boshqa-boshqa ism kerak.`);
    ui.bubble("elder", `Ism ${condText(type, i)}. «+» ni bosib, eng kamida nechta harf kerakligini top.`);
    const answer = await ui.settle((done) => {
      let c = null;
      c = ui.counter(tools, {
        start: 1,
        min: 1,
        max: 4,
        onChange: (a) => {
          renderCrowd(crowd, info, people, i, type, a);
          if (logic.countWords(a, i, type) >= people) {
            if (c) c.disable();
            done(a);
          }
        },
      });
    });
    sound.play("correct");
    ui.pose("apprentice", "happy", 900);
    await ui.say("elder", `${answer - 1} ta harf yetmadi, ${answer} ta yetdi. Demak, eng kamida ${answer} ta.`);
    return answer;
  }

  // 6.2: qoida
  async function ruleStage3() {
    ui.setCompact(false);
    ui.clearWork();
    ui.raisePaper(false);
    ui.work().append(stepsBox("5 ta odam, ism aynan 2 harfli:", 5, 2, "exact"));
    await ui.say("elder", "Qoida: harflar sonini 1 dan boshlab bittadan oshiramiz.");
    await ui.say("elder", "Soʻzlar soni odamlar sonidan kam boʻlmay qolgan birinchi son — javob.");
  }

  // 6.3: mashq
  const stage3Spec = {
    show(ex) {
      ui.setCompact(false);
      ui.clearWork();
      ui.paper(common.paperText(ex.type, ex.i));
      ui.raisePaper(true);
      ui.bubble("elder", `${ex.people} ta odam bor, ism ${condText(ex.type, ex.i)}. Eng kamida nechta harf kerak?`);
      const crowd = ui.h("div", { class: "people" });
      ui.work().append(crowd);
      renderCrowd(crowd, null, ex.people, ex.i, ex.type, 0);
    },
    hint(ex) {
      ui.clearWork();
      const crowd = ui.h("div", { class: "people" });
      const info = ui.h("div", { class: "people-info" });
      const tools = ui.h("div");
      // Hisoblagich tepada — odamlar ko'p bo'lsa ham ko'rinib turadi
      ui.work().append(common.hintTitle(), tools, info, crowd);
      ui.counter(tools, {
        start: 1,
        min: 1,
        max: 4,
        onChange: (a) => renderCrowd(crowd, info, ex.people, ex.i, ex.type, a),
      });
    },
    solution(ex) {
      ui.clearWork();
      ui.work().append(stepsBox(`${ex.people} ta odam, ism ${condText(ex.type, ex.i)}:`, ex.people, ex.i, ex.type));
    },
  };

  async function stage3() {
    await peopleDemo(5, 2, "upto");
    await peopleDemo(5, 2, "exact");
    await ui.say("elder", "Savol deyarli bir xil, lekin javoblar har xil: 2 va 3. «Aynan» va «gacha» soʻzlariga diqqat qil!");
    await ruleStage3();
    await ui.say("elder", "Endi oʻzing top! 3 ta toʻgʻri javob — bosqich tugaydi.");
    await common.exercises(3, stage3Spec);
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

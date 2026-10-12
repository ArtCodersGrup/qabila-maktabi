// 3-bosqich: bola o'zi chizadi, model topadi; namunalar soni va aniqlik; chalkash sinflar.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  // Model javobi: har sinfgacha eng kichik masofa (ustunchalar bilan) va eng yaqin namuna
  function natijaPaneli(t) {
    const eng = Math.max(...t.sinflar.map((s) => s.masofa), 1);
    return h("div", { class: "ct-natija-panel" },
      h("div", { class: "ct-natija-bosh" },
        common.rasm(t.namuna.katak, "mitti", { nom: `Eng yaqin namuna: ${t.sinf}` }),
        h("span", { text: t.durang ? "Model ikkilanmoqda" : `Model javobi: ${t.sinf}` })),
      ...t.sinflar.map((s, k) => h("div", { class: "ct-ustun" + (k === 0 ? " eng" : "") },
        h("span", { class: "nom", text: s.sinf }),
        h("span", { class: "yol" }, h("span", { class: "tola", style: `width:${Math.round((s.masofa * 100) / eng)}%` })),
        h("span", { class: "son", text: String(s.masofa) }))));
  }

  // Bola 8×8 maydonda chizadi; «Tekshir» — model javobi va masofalar. Kamida bir marta tekshirgach «Davom» chiqadi.
  async function chizish() {
    const el = common.box(true);
    const katak = new Array(L.N * L.N).fill(0);
    const joy = h("div", { class: "ct-joy", "aria-live": "polite" });
    const m = common.maydon(katak, (i) => {
      QK.sound.play("tap");
      katak[i] = 1 - katak[i];
      m.render();
    });
    el.append(m.el, joy);
    ui.bubble("elder", "Katakni bosib shakl chiz: doira, kvadrat, uchburchak, xoch yoki chiziq. Keyin «Tekshir»ni bos.");
    await ui.settle((done) => {
      let tekshirildi = false;
      const davom = ui.button("Davom ▶︎", () => done());
      const qator = h("div", { class: "choice-row" });
      const tekshir = ui.button("Tekshir", () => {
        if (L.boyalgan(katak) < 4) {
          ui.bubble("elder", "↻ Kamida 4 ta katakni boʻya.");
          return;
        }
        const t = L.tasnif(katak, L.NAMUNALAR);
        joy.textContent = "";
        joy.append(natijaPaneli(t));
        ui.bubble("elder", t.durang
          ? `Model ikkilanmoqda: «${t.sinflar[0].sinf}» va «${t.sinflar[1].sinf}» bir xil masofada (${t.masofa}).`
          : `Model javobi: ${t.sinf}. Eng yaqin namunagacha masofa — ${t.masofa}. Yana chizib koʻrishing mumkin.`);
        if (!tekshirildi) {
          tekshirildi = true;
          qator.append(davom);
        }
      }, "ok");
      const tozala = ui.button("Tozalash", () => {
        katak.fill(0);
        m.render();
        joy.textContent = "";
      }, "secondary");
      qator.append(tekshir, tozala);
      ui.control().append(qator);
    });
    ui.clearControl();
  }

  // Namunalar soni tajribasi: har sinfdan 1 / 2 / 3 ta namuna bilan 25 ta sinov chizmasidagi aniqlik (mantiq hisoblaydi)
  async function tajriba() {
    const el = common.box(true);
    const jadval = h("div", { class: "ct-tajriba", "aria-live": "polite" });
    el.append(common.savol(`Sinov: ${L.SINOV.length} ta yangi chizma, har sinfdan ${L.SINOV.length / L.SINFLAR.length} ta.`), jadval);
    const korildi = new Set();
    ui.bubble("elder", "Namunalar soni aniqlikka qanday taʼsir qiladi? Uchala modelni sinab koʻr.");
    await ui.settle((done) => {
      const tugmalar = [1, 2, 3].map((k) => ui.button(`${k} ta namuna`, () => {
        if (korildi.has(k)) return;
        korildi.add(k);
        const b = L.tajriba(k);
        const satr = h("div", { class: "ct-ustun eng", style: `order:${k}` },
          h("span", { class: "nom", text: `${k} ta namuna` }),
          h("span", { class: "yol" }, h("span", { class: "tola", style: `width:${b.foiz}%` })),
          h("span", { class: "son", text: `${b.togri}/${b.jami} = ${b.foiz}%` }));
        jadval.append(satr);
        if (korildi.size === 3) done();
      }, "sm"));
      ui.control().append(h("div", { class: "choice-row" }, ...tugmalar));
    });
    ui.clearControl();
    const bir = L.tajriba(1);
    const uch = L.tajriba(3);
    await ui.say("elder", uch.foiz > bir.foiz
      ? `Har sinfdan 1 ta namuna — ${bir.foiz}%, 3 ta namuna — ${uch.foiz}%. Model koʻproq xil chizmani koʻrsa, aniqlik (accuracy) oshadi.`
      : `Har sinfdan 1 ta namuna — ${bir.foiz}%, 3 ta namuna — ${uch.foiz}%. Namuna koʻpaygani har doim ham yordam bermaydi — namunalar xilma-xil boʻlishi kerak.`);
    const juft = L.chalkashJuftlar(bir.jadval, bir.sinflar)[0];
    if (juft.soni > 0) {
      await ui.say("elder", `Chalkash sinflar: 1 ta namunali model «${juft.a}» va «${juft.b}»ni ${juft.soni} marta adashtirdi. Bitta namuna sinfning barcha koʻrinishlarini qamrab ololmaydi.`);
    }
  }

  async function korsat() {
    await chizish();
    await ui.say("elder", "Cheklov: model har doim beshta sinfdan birini aytadi. Yulduz yoki harf chizsang ham «bilmayman» demaydi — javobiga koʻr-koʻrona ishonib boʻlmaydi.");
    await tajriba();
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol — aniqlik va chalkashlik jadvali.`);
  }

  async function stage3() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich3Task(prev, Math.random, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

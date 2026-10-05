// 2-bosqich: kiritish va chiqarish — bola qurilmani bosadi, u "kiradi" yoki "chiqadi" tomoniga o'tadi. Nom keyin beriladi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  // Chapda — kompyuterga kiradiganlar, o'rtada — tizim bloki, o'ngda — kompyuterdan chiqadiganlar.
  // Bola pastdagi qurilmani bosadi: u o'z tomoniga o'tadi va oqsoqol nima qayoqqa yurganini aytadi.
  function saralash() {
    const el = common.box(true);
    const uyalar = { kiritish: [], chiqarish: [] };
    const yozuvlar = {};
    const tomon = (yon, yozuv) => {
      const katak = h("div", { class: "kq-uyalar" });
      for (let k = 0; k < 4; k++) {
        const uya = h("div", { class: "kq-uya" });
        uyalar[yon].push(uya);
        katak.append(uya);
      }
      yozuvlar[yon] = h("div", { class: "kq-tomon-nom", text: yozuv });
      return h("div", { class: "kq-tomon " + yon }, yozuvlar[yon], katak);
    };
    el.append(h("div", { class: "kq-oqim" },
      tomon("kiritish", "kiradi →"),
      h("div", { class: "kq-markaz", role: "img", "aria-label": "Tizim bloki" }, common.surat("blok")),
      tomon("chiqarish", "→ chiqadi")));

    const ids = L.aralash(L.QISMLAR.filter((q) => q.yonalish !== "markaz").map((q) => q.id), Math.random);
    const soni = { kiritish: 0, chiqarish: 0 };
    let qoldi = ids.length;
    return ui.settle((done) => {
      const patnis = h("div", { class: "kq-patnis" });
      for (const id of ids) {
        const q = L.qism(id);
        const b = common.rasmTugma(id, { nomsiz: true });
        b.addEventListener("click", () => {
          if (b.disabled) return;
          QK.sound.play("tap");
          b.disabled = true;
          b.classList.add("olindi");
          const uya = uyalar[q.yonalish][soni[q.yonalish]++];
          uya.classList.add("toldi");
          uya.append(common.surat(id));
          ui.bubble("elder", q.oqim); // nima qayoqqa yurdi — oqsoqol aytadi (pufak har ekranda ko'rinadi)
          qoldi--;
          if (qoldi === 0) {
            ui.clearControl();
            ui.control().append(ui.button("Davom ▶︎", () => done(yozuvlar)));
          }
        });
        patnis.append(b);
      }
      ui.control().append(patnis);
    });
  }

  async function korsat() {
    const kutish = saralash();
    ui.bubble("elder", "Qurilmani bos. U qaysi tomonga oʻtishiga qara.");
    const yozuvlar = await kutish;
    ui.clearControl();
    QK.sound.play("correct");
    yozuvlar.kiritish.textContent = "Kiritish";
    await ui.say("elder", "✓ Chapdagilar sendan kompyuterga olib kiradi. Ular — kiritish qurilmalari.");
    yozuvlar.chiqarish.textContent = "Chiqarish";
    await ui.say("elder", "Oʻngdagilar kompyuterdan senga olib chiqadi. Ular — chiqarish qurilmalari.");
    await ui.say("apprentice", "Tizim bloki esa oʻrtada. U oʻylaydi va hammasini boshqaradi!");
  }

  async function stage2() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich2Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage2 });
})(window);

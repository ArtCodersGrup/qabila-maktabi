// 3-bosqich: muvaffaqiyatsiz loyiha tashxisi — bola har bosqich yozuvini ochadi va xato bosqichni topadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice } = QK;
  const h = ui.h;

  const YOZUVLAR = {
    muammo: "Savol aniq: barg sogʻlommi yoki kasal. Mezon — kamida 90 %.",
    yigish: "400 ta surat toʻplandi — hammasi laboratoriyada, oq fonda olingan.",
    organish: "Sinflar teng: 200 ta sogʻlom, 200 ta kasal; takror suratlar yoʻq.",
    model: "Tasniflash modeli oʻquv suratlarida oʻqitildi.",
    baho: "Ajratib qoʻyilgan 80 ta laboratoriya suratida aniqlik 95 %.",
  };
  const AYBDOR = "yigish";

  // Besh yozuvni ochish
  async function tekshir() {
    const el = common.box(true);
    el.append(common.savol("Barg kasalligi modeli: sinovda 95 %, dalada esa 60 %. Har bosqich yozuvini och."));
    ui.bubble("elder", "Loyiha daftarini koʻrib chiq: besh bosqichning har birini bos.");
    let ochilgan = 0;
    await ui.settle((done) => {
      const royxat = h("div", { class: "ls-yozuvlar" });
      L.BOSQICHLAR.forEach((b, i) => {
        const matn = h("div", { class: "ls-yozuv-matn", text: YOZUVLAR[b.k], hidden: true });
        const tugma = h("button", { class: "ls-yozuv-nom", type: "button", "aria-expanded": "false", text: `${i + 1}. ${b.nom}` });
        tugma.addEventListener("click", () => {
          if (!matn.hidden) return;
          QK.sound.play("tap");
          matn.hidden = false;
          tugma.setAttribute("aria-expanded", "true");
          tugma.classList.add("ochiq");
          ochilgan++;
          if (ochilgan === L.BOSQICHLAR.length) done();
        });
        royxat.append(h("div", { class: "ls-yozuv" }, tugma, matn));
      });
      el.append(royxat);
    });
    for (;;) {
      ui.bubble("elder", "Hamma yozuv ochildi. Dalada aniqlik pasayishiga qaysi bosqich sabab?");
      const javob = await ui.settle((done) => { ui.clearControl(); ui.control().append(common.bosqichTugmalari(done)); });
      ui.clearControl();
      if (javob === AYBDOR) break;
      QK.sound.play("retry");
      await ui.say("elder", "↻ Dalada barg qanday fonda suratga olinadi? Buni yozuvlarning qaysi biri bilan solishtirish kerak?");
    }
    QK.sound.play("correct");
    await ui.say("elder", "✓ Maʼlumot yigʻish: toʻplamda dala sharoiti yoʻq. Sinov ham shu laboratoriya suratlarida oʻtgani uchun xatoni koʻrsatmadi.");
  }

  async function nomla() {
    const el = common.box(true);
    common.formula(el, [
      "Aniqlik = toʻgʻri javoblar ÷ jami misollar × 100 %",
      "Aniqlik faqat model koʻrmagan misollarda oʻlchanadi",
      "Koʻp uchraydigan xatolar: notoʻgʻri savol, kam yoki bir tomonlama maʼlumot, sinov yoʻq",
    ]);
    await ui.say("elder", "Bir tomonlama toʻplam — noxolislik (bias) manbai. Tuzatish: siklda orqaga qaytib, dala suratlarini yigʻish va modelni qayta oʻqitish.");
    await ui.say("elder", `Mashq: ${QK.practice.need()} ta savol — loyiha tashxisi va aniqlikni hisoblash.`);
  }

  async function stage3() {
    await tekshir();
    await nomla();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich3Task(prev, Math.random, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3 });
})(window);

// 2-bosqich: tartibga solamiz — kesish va qo'yish (ko'chirish), yangi papka va unga mos nom.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice, sound } = QK;

  // Bola o'zi qiladi: faylni kesib, papkaga qo'yadi; keyin yo'q papkani yaratib, nom tanlaydi
  async function korsat() {
    const el = common.box(true);
    const holat = L.holatYasa([L.P("Rasmlar", "gul.jpg"), "olma.jpg", "xat.txt"]);
    const rasmlar = L.nomBilan(holat, "Rasmlar").id;
    const olma = L.nomBilan(holat, "olma.jpg").id;
    const oyna = common.fayllar(el, { holat, asboblar: ["orqaga", "kes", "qoy"] });

    await common.yolla(oyna, (h) => {
      if (L.qayerda(h, olma) === rasmlar) return null;
      if (h.bufer && h.bufer.id === olma) return "Endi «Rasmlar»ni ikki marta bosib och. Keyin «Qoʻyish»ni bos.";
      return L.qayerda(h, olma) === h.joriy ? "«olma.jpg»ni bir marta bos. Keyin «Kesish»ni bos." : "Avval «Orqaga» qayt. Keyin «olma.jpg»ni bir marta bos.";
    });
    sound.play("correct");
    await ui.say("elder", "✓ Fayl koʻchdi! Kesish va qoʻyish faylni boshqa joyga koʻchiradi.");

    // Keyingi qadam «Kompyuter»da boshlanadi — matn kam bo'lsin deb oqsoqol o'zi olib chiqadi (QOIDALAR §5)
    oyna.ornat(L.kir(oyna.holat(), L.ILDIZ));
    oyna.asboblar(["orqaga", "yangi", "nomla", "kes", "qoy"]);
    await common.yolla(oyna, (h) => {
      const matnlar = L.nomBilan(h, "Matnlar");
      if (matnlar && matnlar.id !== rasmlar) return null;
      // Bola adashib rasmlar papkasining nomini o'zgartirib qo'ysa
      if (matnlar) return "↻ Bu papkada rasmlar bor. Uni tanlab, «Nomla» bilan «Rasmlar» deb oʻzgartir.";
      // Yangi papka boshqa nom bilan yaratilgan (keyingi — yaratilgan tugunlar sanog'i)
      if (h.keyingi > 1) return "↻ Xat — bu matn. Papkani tanlab, «Nomla» bilan «Matnlar» deb oʻzgartir.";
      return h.joriy === h.ildiz.id ? "Xat uchun papka yoʻq. «Yangi papka»ni bos va mos nom tanla." : "Avval «Orqaga» qayt. Keyin «Yangi papka»ni bos.";
    });
    sound.play("correct");
    await ui.say("elder", "✓ Papka tayyor! Papkaga ichidagi narsaga mos nom beriladi.");
    oyna.toxtat();
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

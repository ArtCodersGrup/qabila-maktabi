// 3-bosqich: belgilash va bezash — so'zni ikki marta bosib yoki sudrab belgilash, Qalin / Kursiv / rang; oxirida Saqlash.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, common, practice, sound, muharrir, hujjatlar: H } = QK;

  // Bola o'zi qiladi: «Bahor»ni belgilab Qalin → «keldi»ni belgilab ko'k
  async function korsat() {
    await common.klaviatura();
    const el = common.box(true);
    const matn = "Bahor keldi.";
    const m = muharrir.yasa(el, { rejim: "bezak", matn, asboblar: common.BEZAK_ASBOBLAR });

    await common.kut(m, (mm) => {
      const t = L.bezakTekshir(mm.html(), { soz: "Bahor", bezak: "qalin" }, matn);
      if (t.ok) return null;
      if (t.tur === "matn" || t.tur === "topilmadi") return "Matn oʻzgarib ketdi. Ctrl + Z bilan qaytar, keyin «Bahor»ni ikki marta tez bos.";
      if (t.tur === "qisman") return "Soʻzning bir qismi belgilandi. «Bahor»ni ikki marta tez bos — butun soʻz belgilanadi, keyin «Qalin».";
      if (t.tur === "ortiqcha") return "Boshqa soʻz ham qalin boʻldi. Ctrl + Z bilan qaytar, faqat «Bahor»ni belgilab «Qalin»ni bos.";
      return "«Bahor» soʻzini ikki marta tez bos — u belgilanadi. Keyin «Qalin» tugmasini bos.";
    });
    sound.play("correct");
    await ui.say("elder", "✓ Belgilangan soʻz qalin boʻldi! Sudrab ham belgilasa boʻladi: bosib turib yurgiz.");

    await common.kut(m, (mm) => {
      const t = L.bezakTekshir(mm.html(), { soz: "keldi", bezak: "kok" }, matn);
      if (t.ok) return null;
      if (t.tur === "matn" || t.tur === "topilmadi") return "Matn oʻzgarib ketdi. Ctrl + Z bilan qaytar, keyin «keldi»ni belgila.";
      if (t.tur === "qisman") return "Soʻzning bir qismi boʻyaldi. Butun «keldi»ni belgilab, «Koʻk»ni yana bos.";
      if (t.tur === "ortiqcha") return "Boshqa soʻz ham koʻk boʻldi. Ctrl + Z bilan qaytar, faqat «keldi»ni belgilab «Koʻk»ni bos.";
      return "Endi «keldi»ni belgila va «Koʻk» tugmasini bos.";
    });
    sound.play("correct");
    await ui.say("elder", "✓ Rang ham bezak. Kursiv — yotiq harflar.");
    await ui.say("elder", "Endi buyruqlarni oʻzing bajarasan.");
    m.toxtat();
  }

  // Oxirida: hujjatni nomlab saqlash (bola «Saqlash»ni bosadi va nom tanlaydi)
  async function saqlash() {
    const el = common.box(true);
    const item = L.MATNLAR.find((x) => x.id === "qor") || L.MATNLAR[0];
    const matn = [item.nom].concat(item.qatorlar).join("\n");
    const html = L.bezakHtml(matn, { soz: item.nom, bezak: "qalin" });
    let m = null;
    let saqlandi = null;
    await ui.settle((done) => {
      m = muharrir.yasa(el, {
        rejim: "bezak", html, asboblar: common.BEZAK_ASBOBLAR.concat(["saqlash"]),
        onSaqlash(nom) {
          const r = H.saqla(nom, m.matn(), m.html());
          if (!r) {
            ui.toast(H.toldimi() ? "Hujjatlar toʻldi (10 ta). Birini oʻchir." : "Saqlab boʻlmadi");
            m.holat("Saqlab boʻlmadi — davom etamiz.");
            done();
            return;
          }
          saqlandi = r;
          m.holat(`Saqlandi: «${r.nom}»`);
          done();
        },
      });
      ui.bubble("elder", "Sheʼr tayyor. Endi uni saqlaymiz: «Saqlash»ni bos va nom tanla.");
      ui.clearControl();
      ui.control().append(ui.button("Saqlamasdan davom", () => { done(); }, "secondary"));
    });
    m.toxtat();
    ui.clearControl();
    if (saqlandi) {
      sound.play("correct");
      await ui.say("elder", `✓ Hujjat saqlandi: «${saqlandi.nom}». Uni «Hujjatlar» roʻyxatida topasan — kompyuter oʻchsa ham yoʻqolmaydi.`);
    } else {
      await ui.say("elder", "Saqlash — hujjatni keyin yana ochish uchun. «Hujjatlar» roʻyxati oʻyin oxirida.");
    }
  }

  async function stage3() {
    await korsat();
    await practice.exercises({
      next: (prev, togri, tier) => L.bosqich3Task(Math.random, prev, togri, tier),
      run: (task) => common.run(task),
      praise: (task) => common.praise(task),
    });
    await saqlash();
  }

  QK.scenes = QK.scenes || {};
  Object.assign(QK.scenes, { stage3, saqlash });
})(window);

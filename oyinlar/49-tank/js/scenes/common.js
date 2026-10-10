// 49-o'yin: ekran qismlari — maydon, buyruq satri, animatsiya.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, jang: J, logic: L, sound, jangUi } = QK;
  const h = ui.h;
  const py = QK.python;
  const { maydonKorinishi, holatPaneli, buyruqPaneli } = jangUi;

  const box = (compact) => {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    const el = h("div", { class: "tk-ekran" });
    ui.work().append(el);
    return el;
  };
  const note = (text) => h("div", { class: "tk-note", text });

  // ---------- Vazifa ekrani ----------
  function vazifaEkrani(bosqich, v) {
    return ui.settle(async (done) => {
      const host = box(true);
      host.append(note(v.matn));
      const ikki = h("div", { class: "tk-ikki" });
      host.append(ikki);
      const chap = h("div", { class: "tk-chap" });
      const ong = h("div", { class: "tk-ong" });
      ikki.append(chap, ong);

      let m = v.maydon();
      let koz = maydonKorinishi(chap, m);
      let holat = holatPaneli(chap, m);
      let urinish = 0;

      const qaytaBoshla = () => {
        m = v.maydon();
        chap.innerHTML = "";
        koz = maydonKorinishi(chap, m);
        holat = holatPaneli(chap, m);
      };

      const panel = buyruqPaneli(ong, {
        buyruqlar: v.buyruqlar,
        onSatr: async (kod, yoz) => {
          const r = L.satrniBajar(m, kod, py);
          if (r.xato) {
            yoz("↻ " + r.xato.text, "xato");
            if (r.xato.hint) yoz(r.xato.hint, "izoh");
            return;
          }
          for (const satr of r.chiqish) yoz(satr, "chiqish");
          if (r.chegaraOshdi) yoz("Bitta satrda " + J.MAX_HARAKAT + " ta harakat bajariladi — qolgani keyingi safar.", "izoh");
          await koz.oyna(r.yozuv);
          holat.chiz();
          if (L.bajarildi(bosqich, m)) {
            sound.play("win");
            ui.pose("apprentice", "happy", 1200);
            done(true);
          } else if (L.yutqazdi(m)) {
            yoz("Tank yiqildi. Maydon tiklandi — kodni oʻzgartirib qayta urin.", "izoh");
            urinish++;
            if (urinish === 1) yoz("↻ " + v.ishora, "izoh");
            await ui.sleep(600);
            qaytaBoshla();
          }
        },
      });

      ui.control().append(
        ui.button("Maydonni tiklash", () => { qaytaBoshla(); panel.yoz("Maydon tiklandi.", "izoh"); }, "small"),
        ui.button("Ishora", () => panel.yoz("↻ " + v.ishora, "izoh"), "small"));
    });
  }

  QK.common = { box, note, maydonKorinishi, holatPaneli, buyruqPaneli, vazifaEkrani };
})(window);

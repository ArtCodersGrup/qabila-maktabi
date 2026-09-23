// Tog'ga chiqish — robotlar bilan mashq (bitta qurilmada, internetsiz).
// Onlayn xona bilan bir xil ekranlardan foydalanadi (ekran.js); farqi: holat shu qurilmada hisoblanadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, tog: T, togEkran: E } = QK;
  const MEN = "men";

  function qahramonTanlash() {
    E.qahramonlar({
      sarlavha: "Togʻga chiqish",
      izoh: "Robotlar bilan mashq: savolga toʻgʻri javob — bir pogʻona yuqoriga. Qolib ketsang — chiqib ketasan.",
      orqaga: true,
      onPick: togTanlash,
    });
    ui.bubble("elder", "Qaysi qahramon boʻlasan?");
  }

  function togTanlash(qahramon) {
    E.toglar({ onPick: (togId) => oyin(qahramon, togId) });
    ui.bubble("elder", "Toʻgʻri javob — bir pogʻona yuqoriga. Baland togʻ — koʻproq savol va koʻproq vaqt.");
    E.buttons([{ label: "Boshqa qahramon", onClick: qahramonTanlash, secondary: true }]);
  }

  function oyin(qahramon, togId) {
    const t = T.togById(togId);
    // Robotlar: bitta savolga 6–20 soniya, 5–40 % xato; tepaga chiqqan sari sekinlashadi
    const botlar = T.QAHRAMONLAR.filter((q) => q.id !== qahramon).slice(0, 11).map((q, k) => ({
      id: "bot" + k,
      qahramon: q.id,
      tezlik: 6000 + Math.random() * 14000,
      xato: 0.05 + Math.random() * 0.35,
      keyingi: 1500 + Math.random() * 4000,
    }));
    const players = [{ id: MEN, qahramon }].concat(botlar.map((b) => ({ id: b.id, qahramon: b.qahramon })));
    const state = T.create({ tog: togId, players, now: Date.now() });
    QK.probe = { state, tog: togId, rejim: "mashq" };

    const el = E.box(true, "tog-oyin");
    const ekran = E.oyin(el, {
      togId,
      meId: MEN,
      holat: () => state,
      javob: (ok) => T.javob(state, MEN, ok, Date.now()),
    });

    let tugadi = false;
    function yakun() {
      if (tugadi) return;
      tugadi = true;
      clearInterval(timer);
      sound.play("win");
      E.natija(state, MEN, [
        { label: "Yana oʻynash", onClick: qahramonTanlash },
        { label: "Barcha oʻyinlar", onClick: () => { root.location.href = E.SITE_HOME; }, secondary: true },
      ]);
      ui.bubble("elder", state.golib === MEN ? "Barakalla! Choʻqqi seniki." : "Yaxshi chiqding. Yana sinab koʻramizmi?");
    }

    const timer = setInterval(() => {
      if (tugadi) return;
      const now = Date.now();
      for (const bot of botlar) {
        if (now < bot.keyingi) continue;
        if (!T.javobBeraOladi(state, bot.id, now)) continue;
        const daraja = T.daraja(t, state.oyinchilar[bot.id].pogona);
        const sekinlik = 1 + (daraja - 1) * 0.35;
        T.javob(state, bot.id, Math.random() > bot.xato * (1 + (daraja - 1) * 0.3), now);
        bot.keyingi = now + bot.tezlik * sekinlik * (0.8 + Math.random() * 0.4);
      }
      T.tekshir(state, now);
      ekran.render(now);
      if (state.tugadi) yakun();
    }, 250);
    ui.onCleanup(() => clearInterval(timer));

    ui.bubble("elder", `${t.nom}! Toʻgʻri javob — bir pogʻona yuqoriga. Yarim yoʻldan keyin qolib ketgan chiqib ketadi.`);
    ekran.render(Date.now());
  }

  QK.togMashq = { start: qahramonTanlash };
})(window);

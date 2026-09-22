// Tog'ga chiqish — robotlar bilan mashq (bitta qurilmada, internetsiz).
// Onlayn xona shu o'yinning ustiga qo'shiladi: qoidalar va ekranlar bir xil, faqat raqiblar robot emas, bolalar bo'ladi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, art, storage, tog: T, togUi, savolUi, savollar } = QK;
  const h = ui.h;
  const SITE_HOME = "../../index.html";
  const $ = (id) => document.getElementById(id);

  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const MEN = "men";

  function box(compact, cls) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    // O'yin paytida telefon ekranida chol-shogird zonasi yashiriladi (ular tog' manzarasi ichida ham bor)
    $("play").classList.toggle("tog-full", cls === "tog-oyin");
    const el = h("div", { class: "tbox" + (cls ? " " + cls : "") });
    ui.work().append(el);
    return el;
  }

  function buttons(list) {
    ui.clearControl();
    const row = h("div", { class: "choice-row" });
    list.forEach((b) => row.append(ui.button(b.label, b.onClick, b.secondary ? "secondary" : "")));
    ui.control().append(row);
  }

  // ---------- Savol tanlash: qiyinlik balandlikka qarab ----------
  function nextQ(level, prev) {
    for (let k = 0; k < 60; k++) {
      const topic = pick(savollar.TOPICS).id;
      const kinds = savollar.kindsOf(topic, level);
      if (!kinds.length) continue;
      const q = savollar.make(pick(kinds), level, Math.random, () => true);
      if (q && (!prev || q.key !== prev.key)) return q;
    }
    return savollar.make("sozlar", 1, Math.random, () => true);
  }

  // ---------- 1. Qahramon tanlash ----------
  function qahramonTanlash(keyin) {
    const el = box(false);
    el.append(
      h("a", { class: "back-link", href: SITE_HOME, text: "◀︎ Barcha oʻyinlar" }),
      h("h1", { class: "game-title", text: "Togʻga chiqish" }),
      h("p", { class: "tog-note", text: "Robotlar bilan mashq: savolga toʻgʻri javob — bir pogʻona yuqoriga. Qolib ketsang — chiqib ketasan." }));
    const grid = h("div", { class: "qahramonlar" });
    T.QAHRAMONLAR.forEach((q) => {
      grid.append(h("button", {
        class: "qahramon", type: "button", "aria-label": q.nom,
        onClick: () => { sound.play("tap"); keyin(q.id); },
      }, h("span", { class: "qahramon-rasm", html: art.hayvon(q.id, q.rang) }), h("span", { class: "qahramon-nom", text: q.nom })));
    });
    el.append(grid);
    ui.bubble("elder", "Qaysi qahramon boʻlasan?");
  }

  // ---------- 2. Tog' tanlash ----------
  function togTanlash(qahramon) {
    const el = box(false);
    el.append(h("h1", { class: "game-title", text: "Qaysi togʻga chiqamiz?" }));
    const list = h("div", { class: "toglar" });
    T.TOGLAR.forEach((t) => {
      list.append(h("button", {
        class: "tog-karta", type: "button",
        onClick: () => { sound.play("tap"); oyin(qahramon, t.id); },
      },
      h("span", { class: "tog-nom", text: t.nom }),
      h("span", { class: "tog-metr", text: `${t.metr.toLocaleString("uz-UZ").replace(/,/g, " ")} m` }),
      h("span", { class: "tog-pogona", text: `${t.pogona} pogʻona · ${t.daqiqa} daqiqa` })));
    });
    el.append(list);
    ui.bubble("elder", "Toʻgʻri javob — bir pogʻona yuqoriga. Baland togʻ — koʻproq savol va koʻproq vaqt.");
    buttons([{ label: "Boshqa qahramon", onClick: () => qahramonTanlash(togTanlash), secondary: true }]);
  }

  // ---------- 3. O'yin ----------
  function oyin(qahramon, togId) {
    const t = T.togById(togId);
    const botlar = T.QAHRAMONLAR.filter((q) => q.id !== qahramon).slice(0, 11).map((q, k) => ({
      id: "bot" + k,
      qahramon: q.id,
      tezlik: 6000 + Math.random() * 14000, // bitta savolga 6–20 soniya
      xato: 0.05 + Math.random() * 0.35,
      keyingi: 1500 + Math.random() * 4000,
    }));
    const players = [{ id: MEN, qahramon }].concat(botlar.map((b) => ({ id: b.id, qahramon: b.qahramon })));
    const state = T.create({ tog: togId, players, now: Date.now() });
    QK.probe = { state, tog: togId };

    const el = box(true, "tog-oyin");
    const soat = h("div", { class: "tog-soat" });
    const maydon = h("div", { class: "tog-maydon" });
    el.append(soat, maydon);
    const sahna = togUi.scene(maydon, togId);
    const royxat = togUi.reyting(maydon);
    const pastki = h("div", { class: "tog-pastki" });
    el.append(pastki);

    let joriy = null; // joriy savol
    let pauzaOyna = null;
    let tugadi = false;

    const render = () => {
      const qolgan = Math.max(0, Math.ceil((state.tugaydi - Date.now()) / 1000));
      soat.textContent = `${t.nom} · ⏱ ${Math.floor(qolgan / 60)}:${String(qolgan % 60).padStart(2, "0")}`;
      sahna.render(state, MEN);
      royxat.render(state, MEN);
    };

    function savolBer() {
      if (tugadi) return;
      const me = state.oyinchilar[MEN];
      if (me.chiqdi) return tomoshabin();
      pastki.innerHTML = "";
      pauzaOyna = null;
      joriy = nextQ(T.daraja(t, me.pogona), joriy);
      QK.probe.savol = joriy;
      togUi.savol(pastki, joriy);
      savolUi.answerPad(joriy, javobBerdi, () => !tugadi && T.javobBeraOladi(state, MEN, Date.now()));
    }

    function javobBerdi(value) {
      if (tugadi) return;
      const ok = savollar.check(joriy, value);
      T.javob(state, MEN, ok, Date.now());
      sound.play(ok ? "correct" : "retry");
      if (ok) ui.pose("apprentice", "happy", 700);
      render();
      if (state.tugadi) return yakun();
      if (ok) return savolBer();
      // Xato: pauza oynasi, keyin yangi savol
      pastki.innerHTML = "";
      ui.clearControl();
      pauzaOyna = togUi.pauza(pastki, { javob: joriy.answer, tugaydi: state.oyinchilar[MEN].pauzaGacha });
    }

    function tomoshabin() {
      pastki.innerHTML = "";
      ui.clearControl();
      pastki.append(h("div", { class: "tomoshabin", text: "Qolib ketding. Endi tomoshabinsan — togʻni kuzatib tur." }));
      sound.play("dum");
    }

    function yakun() {
      if (tugadi) return;
      tugadi = true;
      clearInterval(timer);
      sound.play("win");
      const el2 = box(false);
      togUi.natija(el2, state, MEN);
      ui.bubble("elder", state.golib === MEN ? "Barakalla! Choʻqqi seniki." : "Yaxshi chiqding. Yana sinab koʻramizmi?");
      buttons([
        { label: "Yana oʻynash", onClick: () => qahramonTanlash(togTanlash) },
        { label: "Barcha oʻyinlar", onClick: () => { root.location.href = SITE_HOME; }, secondary: true },
      ]);
    }

    // Robotlar va soat
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
      if (pauzaOyna && pauzaOyna.tick(now)) savolBer();
      const me = state.oyinchilar[MEN];
      if (me.chiqdi && !pauzaOyna && pastki.querySelector(".savol-karta")) tomoshabin();
      render();
      if (state.tugadi) yakun();
    }, 250);
    ui.onCleanup(() => clearInterval(timer));

    ui.bubble("elder", `${t.nom}! Toʻgʻri javob — bir pogʻona yuqoriga. Yarim yoʻldan keyin qolib ketgan chiqib ketadi.`);
    render();
    savolBer();
  }

  // ---------- Sahifa ----------
  const store = storage.create("tog:v1", 0); // faqat ovoz tanlovi
  const state0 = store.load();
  sound.setMuted(state0.muted);
  function updateSoundButton() {
    $("btn-sound").innerHTML = art.icon(state0.muted ? "sound-off" : "sound-on");
    $("btn-sound").setAttribute("aria-label", state0.muted ? "Ovozni yoqish" : "Ovozni oʻchirish");
  }
  $("actor-elder").innerHTML = art.elder();
  $("actor-apprentice").innerHTML = art.apprentice();
  ui.paper("");
  $("btn-home").innerHTML = art.icon("home");
  updateSoundButton();
  $("btn-home").addEventListener("click", () => { sound.play("tap"); root.location.href = SITE_HOME; });
  $("btn-sound").addEventListener("click", () => {
    state0.muted = !state0.muted;
    sound.setMuted(state0.muted);
    store.save(state0);
    updateSoundButton();
    sound.play("tap");
  });
  const unlock = () => sound.unlock();
  ["pointerdown", "pointerup", "touchend", "click", "keydown"].forEach((t) => document.addEventListener(t, unlock, true));

  qahramonTanlash(togTanlash);
})(window);

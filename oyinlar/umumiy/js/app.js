// O'yin qobig'i: qahramonlar, bosh ekran, bosqichlar oqimi, ovoz tugmasi va ?bosqich=N.
// Har bir o'yinning main.js i faqat QK.app.start({ title, storageKey, stageTitles }) ni chaqiradi.
// Sahnalar QK.scenes da: intro(), stage1()..stageN(), stageDone(s, goingOn), finale() (ixtiyoriy), congrats().
(function (root) {
  "use strict";

  function start({ title, storageKey, stageTitles }) {
    const { storage, sound, art, ui } = root.QK;
    const $ = (id) => document.getElementById(id);
    const count = stageTitles.length;
    const store = storage.create(storageKey, count);
    const state = store.load();
    sound.setMuted(state.muted);
    const saveState = () => store.save(state);

    function updateSoundButton() {
      const b = $("btn-sound");
      b.innerHTML = art.icon(state.muted ? "sound-off" : "sound-on");
      b.setAttribute("aria-label", state.muted ? "Ovozni yoqish" : "Ovozni oʻchirish");
    }

    function home() {
      ui.newRun();
      ui.resetPoses();
      ui.setCompact(false);
      ui.hideProgress();
      ui.paper("");
      ui.clearWork();
      ui.clearControl();
      ui.bubble("elder", "Salom! Qaysi bosqichni oʻynaymiz?");

      // "Barcha oʻyinlar" — loyiha bosh sahifasi (Information/index.html); o'yin yolg'iz ochilsa ham ishlaydi
      const back = ui.h("a", { class: "back-link", href: "../../index.html", text: "◀︎ Barcha oʻyinlar" });
      const heading = ui.h("h1", { class: "game-title", text: title });
      const cards = ui.h("div", { class: "cards" });
      stageTitles.forEach((titleText, k) => {
        const open = k === 0 || state.done[k - 1];
        const clickable = open || state.done[k]; // tugagan bosqich, hattoki qulflangan bo'lsa ham, qayta o'ynaladi
        cards.append(ui.h("button", {
          class: "card" + (state.done[k] ? " done" : ""),
          type: "button",
          disabled: !clickable,
          onClick: () => { sound.play("tap"); play(k + 1, state.done[k]); },
        },
        ui.h("span", { class: "card-num", text: String(k + 1) }),
        ui.h("span", { class: "card-title", text: titleText }),
        ui.h("span", { class: "card-state", text: state.done[k] ? "✓" : open ? "" : "🔒" })));
      });
      ui.work().append(back, heading, cards);

      const next = state.done.indexOf(false);
      const first = next === -1 ? 1 : next + 1;
      ui.control().append(ui.button(next === -1 ? "Qayta oʻynash" : "Boshlash", () => play(first), "big"));
    }

    // once — tugagan bosqichni faqat o'zini qayta o'ynash: davom etmaydi, bosh ekranga qaytadi
    async function play(stage, once) {
      const scenes = root.QK.scenes;
      ui.newRun();
      ui.resetPoses();
      ui.hideProgress();
      ui.clearControl();
      if (stage === 1 && !state.done[0]) await scenes.intro();
      if (once) {
        await scenes["stage" + stage]();
        await scenes.stageDone(stage, false); // davom etmaymiz — "keyingisiga oʻtamiz" deyilmaydi
        home();
        return;
      }
      for (let s = stage; s <= count; s++) {
        await scenes["stage" + s]();
        state.done[s - 1] = true;
        saveState();
        if (s < count) await scenes.stageDone(s, true); // keyingi bosqichga o'tamiz
      }
      if (scenes.finale) await scenes.finale();
      const next = await scenes.congrats();
      if (next === "replay") play(1);
      else home();
    }

    $("actor-elder").innerHTML = art.elder();
    $("actor-apprentice").innerHTML = art.apprentice();
    $("btn-home").innerHTML = art.icon("home");
    updateSoundButton();

    $("btn-home").addEventListener("click", () => { sound.play("tap"); home(); });
    $("btn-sound").addEventListener("click", () => {
      state.muted = !state.muted;
      sound.setMuted(state.muted);
      saveState();
      updateSoundButton();
      sound.play("tap");
    });
    // Brauzer talabi: ovoz faqat birinchi bosishdan keyin. Telefonda pointerdown emas,
    // touchend/click orqali ochiladi — shuning uchun bir nechta hodisa tinglanadi.
    const unlock = () => sound.unlock();
    ["pointerdown", "pointerup", "touchend", "click", "keydown"].forEach((t) => document.addEventListener(t, unlock, true));

    // O'qituvchi va sinov uchun: ?bosqich=2 — shu bosqichdan boshlash
    const direct = Number(new URLSearchParams(root.location.search).get("bosqich"));
    if (Number.isInteger(direct) && direct >= 1 && direct <= count) play(direct);
    else home();
  }

  root.QK = root.QK || {};
  root.QK.app = { start };
})(window);

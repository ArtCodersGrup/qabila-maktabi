// Ishga tushirish: qahramonlar, bosh ekran va bosqichlar oqimi.
(function (root) {
  "use strict";

  const { storage, sound, art, ui } = root.QK;
  const $ = (id) => document.getElementById(id);
  const TITLES = ["Aynan i harfli soʻzlar", "i harfgacha soʻzlar", "Nechta harf kerak?"];

  const state = storage.load();
  sound.setMuted(state.muted);
  const saveState = () => storage.save(state);

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
    ui.bubble("elder", "Salom! Bu — «Qabila kodlari». Qaysi bosqichni oʻynaymiz?");

    const cards = ui.h("div", { class: "cards" });
    TITLES.forEach((title, k) => {
      const open = k === 0 || state.done[k - 1];
      cards.append(ui.h("button", {
        class: "card" + (state.done[k] ? " done" : ""),
        type: "button",
        disabled: !open,
        onClick: () => { sound.play("tap"); play(k + 1); },
      },
      ui.h("span", { class: "card-num", text: String(k + 1) }),
      ui.h("span", { class: "card-title", text: title }),
      ui.h("span", { class: "card-state", text: state.done[k] ? "✓" : open ? "" : "🔒" })));
    });
    ui.work().append(cards);

    const next = state.done.indexOf(false);
    const start = next === -1 ? 1 : next + 1;
    ui.control().append(ui.button(next === -1 ? "Qayta oʻynash" : "Boshlash", () => play(start), "big"));
  }

  async function play(stage) {
    const scenes = root.QK.scenes;
    ui.newRun();
    ui.resetPoses();
    ui.hideProgress();
    ui.clearControl();
    if (stage === 1 && !state.done[0]) await scenes.intro();
    for (let s = stage; s <= 3; s++) {
      await scenes["stage" + s]();
      state.done[s - 1] = true;
      saveState();
      if (s < 3) await scenes.stageDone(s);
    }
    await scenes.finale();
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
  // Brauzer talabi: ovoz faqat birinchi bosishdan keyin
  document.addEventListener("pointerdown", () => sound.unlock());
  document.addEventListener("keydown", () => sound.unlock());

  // O'qituvchi va sinov uchun: ?bosqich=2 — shu bosqichdan boshlash
  const direct = Number(new URLSearchParams(root.location.search).get("bosqich"));
  if (direct >= 1 && direct <= 3) play(direct);
  else home();
})(window);

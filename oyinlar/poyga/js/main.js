// Tez yozish poygasi sahifasi: qahramonlar, 🏠 va ovoz tugmalari, poyga sikli.
// Poyga tugasa ("Barcha oʻyinlar") — loyiha bosh sahifasiga qaytiladi.
(function (root) {
  "use strict";

  const { storage, sound, art, ui, poyga } = root.QK;
  const $ = (id) => document.getElementById(id);
  const SITE_HOME = "../../index.html";
  const store = storage.create("poyga:v1", 0); // faqat ovoz tanlovi
  const state = store.load();
  sound.setMuted(state.muted);

  function updateSoundButton() {
    const b = $("btn-sound");
    b.innerHTML = art.icon(state.muted ? "sound-off" : "sound-on");
    b.setAttribute("aria-label", state.muted ? "Ovozni yoqish" : "Ovozni oʻchirish");
  }

  $("actor-elder").innerHTML = art.elder();
  $("actor-apprentice").innerHTML = art.apprentice();
  ui.paper("");
  $("btn-home").innerHTML = art.icon("home");
  updateSoundButton();
  $("btn-home").addEventListener("click", () => {
    sound.play("tap");
    root.location.href = SITE_HOME;
  });
  $("btn-sound").addEventListener("click", () => {
    state.muted = !state.muted;
    sound.setMuted(state.muted);
    store.save(state);
    updateSoundButton();
    sound.play("tap");
  });
  const unlock = () => sound.unlock();
  ["pointerdown", "pointerup", "touchend", "click", "keydown"].forEach((t) => document.addEventListener(t, unlock, true));

  poyga.race().then(() => { root.location.href = SITE_HOME; });
})(window);

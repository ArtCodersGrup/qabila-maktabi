// Masalalar maydoni: sahifani ishga tushirish (o'yin emas — mashqlar ro'yxati).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, art } = QK;
  const $ = (id) => root.document.getElementById(id);
  const KEY = "masalalar:ovoz:v1";

  // Ovoz tanlovi shu sahifada saqlanadi
  let muted = false;
  try { muted = root.localStorage.getItem(KEY) === "1"; } catch (e) { muted = false; }
  sound.setMuted(muted);

  $("btn-home").innerHTML = art.icon("home");

  function ovozTugma() {
    const b = $("btn-sound");
    b.innerHTML = art.icon(muted ? "sound-off" : "sound-on");
    b.setAttribute("aria-label", muted ? "Ovozni yoqish" : "Ovozni oʻchirish");
  }
  $("btn-sound").addEventListener("click", () => {
    muted = !muted;
    sound.setMuted(muted);
    try { root.localStorage.setItem(KEY, muted ? "1" : "0"); } catch (e) { /* muhim emas */ }
    ovozTugma();
  });
  ovozTugma();

  // Havola bilan bitta masalani ochish mumkin: ...#masala=cf-tarvuz
  function hashdan() {
    const m = /masala=([a-z0-9-]+)/i.exec(root.location.hash || "");
    return m ? m[1] : null;
  }

  function boshla() {
    const id = hashdan();
    if (id && QK.masalaRoyxat.bittasi(id)) QK.masalaEkran.masalaEkran(id);
    else QK.masalaEkran.royxatEkran();
  }

  root.addEventListener("hashchange", () => {
    const id = hashdan();
    if (!id) QK.masalaEkran.royxatEkran();
  });

  boshla();
})(window);

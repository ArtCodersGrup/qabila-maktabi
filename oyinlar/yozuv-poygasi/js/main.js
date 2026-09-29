// Yozuv poygasi sahifasi: ovoz, bosh tugma va ikki yo'lli menyu —
// o'qituvchi uchun xona ochish, bola uchun kod bilan kirish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, art, storage, yozuvEkran: E, yozuvOnlayn, onlayn } = QK;
  const h = ui.h;
  const $ = (id) => document.getElementById(id);

  const store = storage.create("yozuv-poygasi:v1", 0);
  const sozlama = store.load();

  function menu() {
    ui.newRun();
    const el = E.box(false);
    const bor = !!(onlayn && onlayn.available()) && root.navigator.onLine !== false;
    el.append(
      h("a", { class: "back-link", href: E.SITE_HOME, text: "◀︎ Barcha oʻyinlar" }),
      h("h1", { class: "game-title", text: "Yozuv poygasi" }),
      h("p", { class: "tog-note", text: "Hamma bir xil matnni yozadi. Yozgan sari togʻga koʻtarilasan — oʻyin hamma choʻqqiga chiqquncha davom etadi." }));
    const menyu = h("div", { class: "tog-menyu" });
    const tugma = (nom, izoh, onClick, ochiq) => {
      const b = h("button", { class: "menyu-karta", type: "button", onClick: () => { if (ochiq) { sound.play("tap"); onClick(); } } },
        h("span", { class: "menyu-nom", text: nom }),
        h("span", { class: "menyu-izoh", text: izoh }));
      b.disabled = !ochiq;
      return b;
    };
    menyu.append(
      tugma("Xona ochish", "Oʻqituvchi uchun: kod chiqadi, bolalar kiradi", () => yozuvOnlayn.host(menu), bor),
      tugma("Kod bilan kirish", "Oʻqituvchi bergan 4 xonali kod", () => yozuvOnlayn.guest(menu), bor));
    el.append(menyu);
    el.append(
      h("a", { class: "learn-link", href: "../23-on-barmoq/index.html", text: "Yozishni oʻrganish — «Oʻn barmoq» oʻyini ▶︎" }),
      h("a", { class: "learn-link", href: "../poyga/index.html", text: "Internetsiz, ikki kishi bitta ekranda — «Tez yozish poygasi» ▶︎" }));
    if (!bor) el.append(h("p", { class: "tog-note", text: "Bu musobaqa uchun internet kerak." }));
    ui.bubble("elder", bor ? "Oʻqituvchimisan yoki oʻyinchi?" : "Internet yoʻq — hozircha poyga boʻlmaydi.");
  }

  // ---------- Sahifa ----------
  sound.setMuted(sozlama.muted);
  function updateSoundButton() {
    $("btn-sound").innerHTML = art.icon(sozlama.muted ? "sound-off" : "sound-on");
    $("btn-sound").setAttribute("aria-label", sozlama.muted ? "Ovozni yoqish" : "Ovozni oʻchirish");
  }
  $("actor-elder").innerHTML = art.elder();
  $("actor-apprentice").innerHTML = art.apprentice();
  ui.paper("");
  $("btn-home").innerHTML = art.icon("home");
  updateSoundButton();
  $("btn-home").addEventListener("click", () => { sound.play("tap"); root.location.href = E.SITE_HOME; });
  $("btn-sound").addEventListener("click", () => {
    sozlama.muted = !sozlama.muted;
    sound.setMuted(sozlama.muted);
    store.save(sozlama);
    updateSoundButton();
    sound.play("tap");
  });
  const unlock = () => sound.unlock();
  ["pointerdown", "pointerup", "touchend", "click", "keydown"].forEach((t) => document.addEventListener(t, unlock, true));

  QK.yozuvMenu = menu;
  menu();
})(window);

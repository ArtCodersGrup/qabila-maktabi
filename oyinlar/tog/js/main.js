// Tog'ga chiqish sahifasi: ovoz, bosh tugma va uch yo'lli menyu —
// robotlar bilan mashq (internetsiz), o'qituvchi uchun xona ochish, bola uchun kod bilan kirish.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, art, storage, togEkran: E, togMashq, togOnlayn, onlayn } = QK;
  const h = ui.h;
  const $ = (id) => document.getElementById(id);

  const store = storage.create("tog:v1", 0);
  QK.togStore = store;
  const sozlama = store.load();

  function menu() {
    ui.newRun();
    const el = E.box(false);
    const bor = !!(onlayn && onlayn.available()) && root.navigator.onLine !== false;
    el.append(
      h("a", { class: "back-link", href: E.SITE_HOME, text: "◀︎ Barcha oʻyinlar" }),
      h("h1", { class: "game-title", text: "Togʻga chiqish" }),
      h("p", { class: "tog-note", text: "Savolga toʻgʻri javob — bir pogʻona yuqoriga. Qolib ketsang — chiqib ketasan." }));
    const menyu = h("div", { class: "tog-menyu" });
    const tugma = (nom, izoh, onClick, ochiq) => {
      const b = h("button", { class: "menyu-karta", type: "button", onClick: () => { if (ochiq) { sound.play("tap"); onClick(); } } },
        h("span", { class: "menyu-nom", text: nom }),
        h("span", { class: "menyu-izoh", text: izoh }));
      b.disabled = !ochiq;
      return b;
    };
    menyu.append(
      tugma("Robotlar bilan mashq", "Bitta qurilmada, internetsiz", () => togMashq.start(), true),
      tugma("Xona ochish", "Oʻqituvchi uchun: kod chiqadi, bolalar kiradi", () => togOnlayn.host(menu), bor),
      tugma("Kod bilan kirish", "Oʻqituvchi bergan 4 xonali kod", () => togOnlayn.guest(menu), bor));
    el.append(menyu);
    if (!bor) el.append(h("p", { class: "tog-note", text: "Onlayn xona uchun internet kerak. Mashq internetsiz ham ishlaydi." }));
    ui.bubble("elder", bor ? "Yolgʻiz mashq qilasanmi yoki doʻstlaring bilan musobaqami?" : "Internet yoʻq — robotlar bilan mashq qilamiz.");
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

  QK.togMenu = menu;
  menu();
})(window);

// Qal'a sahifasi: ovoz, bosh tugma va menyu — darslar, robot jamoaga qarshi mashq, onlayn xona, lug'at.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, art, storage, qalaUi: U, onlayn } = QK;
  const h = ui.h;
  const $ = (id) => document.getElementById(id);

  const store = storage.create("qala:v1", 0);
  const sozlama = store.load();

  function menu() {
    ui.newRun();
    ui.hideProgress && ui.hideProgress();
    const el = U.box(false);
    U.sarlavha(el, { nom: "Qalʼa: xakerlar va himoyachilar", orqaga: true,
      izoh: "Ikki jamoa. Avval har biri oʻz qalʼasini quradi, keyin raqibnikiga hujum qiladi. Oldin darslar — ularsiz qalʼa turmaydi." });
    const bor = !!(onlayn && onlayn.available()) && root.navigator.onLine !== false;
    const dars = QK.qalaDars && QK.qalaDars.holat ? QK.qalaDars.holat() : { bajarildi: 0, jami: 5, tayyor: false };
    const menyu = h("div", { class: "qala-menyu" });
    const tugma = (nom, izoh, onClick, ochiq, belgi) => {
      const b = h("button", { class: "menyu-karta", type: "button", onClick: () => { if (ochiq) { sound.play("tap"); onClick(); } } },
        h("div", { class: "menyu-qator" }, h("span", { class: "menyu-nom", text: nom }), belgi ? h("span", { class: "menyu-belgi", text: belgi }) : null),
        h("span", { class: "menyu-izoh", text: izoh }));
      b.disabled = !ochiq;
      return b;
    };
    menyu.append(
      tugma("Darslar", "5 ta devor: parol, qulf, shifr, xat, oq shlyapa", () => QK.qalaDars.start(menu), !!QK.qalaDars,
        dars.tayyor ? "Qalʼaga tayyor ✓" : `${dars.bajarildi} / ${dars.jami}`),
      tugma("Robot jamoaga qarshi", "Bitta qurilmada, internetsiz: qalʼa qur, hujum qil", () => QK.qalaMashq.start(menu), !!QK.qalaMashq),
      tugma("Xona ochish", "Oʻqituvchi uchun: doska, ikki jamoa, bolalar kod bilan kiradi", () => QK.qalaOnlayn.host(menu), bor && !!QK.qalaOnlayn),
      tugma("Kod bilan kirish", "Oʻqituvchi bergan 4 xonali kod", () => QK.qalaOnlayn.guest(menu), bor && !!QK.qalaOnlayn),
      tugma("Lugʻat", "Atamalar uch tilda: oʻzbek · english · русский", () => QK.qalaLugat.start(menu), !!QK.qalaLugat));
    el.append(menyu);
    if (!bor) el.append(h("p", { class: "qala-note", text: "Onlayn xona uchun internet kerak. Darslar va robotga qarshi mashq internetsiz ishlaydi." }));
    ui.bubble("elder", dars.tayyor ? "Darslar tugagan. Robotga qarshi sinab koʻring yoki sinf bilan oʻynang." : "Avval darslar: har devor — bitta dars.");
  }

  sound.setMuted(sozlama.muted);
  function updateSoundButton() {
    $("btn-sound").innerHTML = art.icon(sozlama.muted ? "sound-off" : "sound-on");
    $("btn-sound").setAttribute("aria-label", sozlama.muted ? "Ovozni yoqish" : "Ovozni oʻchirish");
  }
  $("actor-elder").innerHTML = art.elder();
  $("actor-apprentice").innerHTML = art.apprentice();
  $("btn-home").innerHTML = art.icon("home");
  updateSoundButton();
  $("btn-home").addEventListener("click", () => { sound.play("tap"); root.location.href = U.SITE_HOME; });
  $("btn-sound").addEventListener("click", () => {
    sozlama.muted = !sozlama.muted;
    sound.setMuted(sozlama.muted);
    store.save(sozlama);
    updateSoundButton();
    sound.play("tap");
  });
  const unlock = () => sound.unlock();
  ["pointerdown", "pointerup", "touchend", "click", "keydown"].forEach((t) => document.addEventListener(t, unlock, true));

  QK.qalaMenu = menu;
  menu();
})(window);

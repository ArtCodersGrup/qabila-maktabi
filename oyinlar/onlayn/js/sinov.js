// Aloqa sinovi: server bilan aloqa, xona ochish yoki kod bilan kirish, ikki tomon ulanganini ko'rish,
// "Salom" yuborish va borib-kelish vaqti. Onlayn musobaqalardan oldin maktab tarmog'ini tekshirish uchun.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, art, onlayn, storage } = QK;
  const mart = QK.musobaqaArt;
  const $ = (id) => document.getElementById(id);
  const h = ui.h;
  const SITE_HOME = "../../index.html";
  const TYPES = ["salom", "javob"];
  const NAMES = { left: "Oy", right: "Quyosh" };

  function box() {
    ui.clearWork();
    ui.clearControl();
    const el = h("div", { class: "obox" });
    ui.work().append(el);
    return el;
  }

  const who = (side, state) => h("div", { class: `peer side-${side}${state ? " " + state : ""}` },
    h("span", { class: "peer-emblem", html: mart.emblem(side) }),
    h("span", { class: "peer-name", text: NAMES[side] }),
    h("span", { class: "peer-state", text: state === "on" ? "ulandi ✓" : "kutilmoqda…" }));

  const REASONS = {
    offline: "✗ Internet yoʻq. Qurilmani internetga ulang.",
    timeout: "✗ Server javob bermadi. Maktab tarmogʻi onlayn aloqani toʻsib qoʻygan boʻlishi mumkin.",
    error: "✗ Server bilan ulanib boʻlmadi. Birozdan keyin qayta urinib koʻring.",
    lib: "✗ Onlayn qism yuklanmadi. Sahifani internet bilan qayta oching.",
  };

  // Tugmalar qatori (bir nechta, har biri o'z ishini qiladi)
  function buttons(list) {
    ui.clearControl();
    const row = h("div", { class: "choice-row" });
    list.forEach((b) => row.append(ui.button(b.label, b.onClick, b.secondary ? "secondary" : "")));
    ui.control().append(row);
  }

  async function start() {
    const el = box();
    el.append(
      h("a", { class: "back-link", href: SITE_HOME, text: "◀︎ Barcha oʻyinlar" }),
      h("h1", { class: "game-title", text: "Aloqa sinovi" }),
      h("p", { class: "o-note", text: "Onlayn musobaqalar uchun: ikki qurilma bir-biriga ulanadimi? Har kim oʻz qurilmasida." }));
    const status = h("div", { class: "net-status", text: "⏳ Server bilan aloqa tekshirilmoqda…" });
    el.append(status);
    ui.bubble("elder", "Avval server bilan aloqani tekshiramiz.");
    const r = await onlayn.ping();
    QK.probe = { ping: r }; // tekshirish uchun
    if (!r.ok) {
      status.textContent = REASONS[r.reason] || REASONS.error;
      status.classList.add("bad");
      sound.play("retry");
      ui.bubble("elder", "Aloqa yoʻq. Internetni tekshirib, qayta urinib koʻr.");
      buttons([{ label: "Qayta tekshirish", onClick: start }]);
      return;
    }
    status.textContent = `✓ Server bilan aloqa bor (${r.ms} ms)`;
    status.classList.add("ok");
    sound.play("correct");
    ui.bubble("elder", "Aloqa bor! Bir qurilmada xona och, ikkinchisida — kod bilan kir.");
    buttons([{ label: "Xona ochish", onClick: host }, { label: "Kod bilan kirish", onClick: guest, secondary: true }]);
  }

  // Ulangan xona: ikki tomon, "Salom" va borib-kelish vaqti
  function roomScreen(el, side, code) {
    const peers = h("div", { class: "peers" }, who("left", side === "left" ? "on" : ""), who("right", side === "right" ? "on" : ""));
    const log = h("ul", { class: "o-log" });
    el.append(h("div", { class: "code-small", text: `Xona: ${code}` }), peers, log);
    const say = (text) => {
      log.prepend(h("li", { text }));
      while (log.children.length > 6) log.lastChild.remove();
    };
    const setPeers = (sides) => {
      peers.innerHTML = "";
      peers.append(...onlayn.SIDES.map((s) => who(s, sides.includes(s) ? "on" : "")));
    };
    return { say, setPeers };
  }

  function connect(el, side, code) {
    const view = roomScreen(el, side, code);
    const other = side === "left" ? "right" : "left";
    let room = null;
    const leave = () => { if (room) room.leave(); start(); };
    const ready = () => buttons([
      { label: "👋 Salom yuborish", onClick: () => { room.send("salom", { t0: Date.now() }); view.say("Siz salom yubordingiz…"); sound.play("tap"); } },
      { label: "Chiqish", onClick: leave, secondary: true },
    ]);
    buttons([{ label: "Chiqish", onClick: leave, secondary: true }]);
    room = onlayn.join({
      kind: "sinov", code, side, types: TYPES,
      on: {
        status(s) {
          QK.probe = Object.assign(QK.probe || {}, { status: s, code, side });
          if (s === "connecting" && side === "right") ui.bubble("elder", "Xonaga kirilmoqda…");
          else if (s === "waiting") ui.bubble("elder", side === "left" ? `${NAMES.right} kutilmoqda: ikkinchi qurilmada shu kodni kiriting.` : `${NAMES.left} kutilmoqda…`);
          else if (s === "ready") { sound.play("win"); ui.bubble("elder", "✓ Ikkala qurilma ulandi! «Salom» tugmasini bosib koʻr."); ready(); }
          else if (s === "peer-left") { sound.play("retry"); ui.bubble("elder", `${NAMES[other]} uzildi. U qaytib kirishini kuting yoki chiqing.`); buttons([{ label: "Chiqish", onClick: leave, secondary: true }]); }
          else if (s === "missing" || s === "full" || s === "expired") {
            sound.play("retry");
            ui.bubble("elder", { missing: "Bunday xona topilmadi. Kodni tekshiring.", full: "Bu xonada ikki kishi bor — xona toʻla.", expired: "Bu kod eskirgan (10 daqiqadan oshdi). Yangi xona oching." }[s]);
            buttons([{ label: "Boshidan", onClick: start }]);
          } else if (s === "error") { ui.bubble("elder", "Server bilan aloqa uzildi."); buttons([{ label: "Boshidan", onClick: start }]); }
        },
        peers(info) { view.setPeers(info.sides); },
        message(msg) {
          if (msg.type === "salom") {
            view.say(`${NAMES[msg.from]}dan salom! 👋`);
            sound.play("correct");
            room.send("javob", { t0: msg.data.t0 });
          } else if (msg.type === "javob") {
            const rtt = Date.now() - msg.data.t0;
            view.say(`${NAMES[msg.from]} salomingizni oldi: borib-kelish ${rtt} ms`);
            QK.probe = Object.assign(QK.probe || {}, { rtt });
          }
        },
      },
    });
  }

  function host() {
    const code = onlayn.makeCode();
    const el = box();
    el.append(h("div", { class: "code-lead", text: "Xona kodi:" }), h("div", { class: "code-big", text: code }));
    connect(el, "left", code);
  }

  async function guest() {
    const el = box();
    el.append(h("div", { class: "code-lead", text: "Xona kodini kiriting (4 ta raqam):" }));
    ui.bubble("elder", "Birinchi qurilmadagi kodni kiriting.");
    const n = await ui.askNumber(4);
    const code = String(n);
    if (!onlayn.validCode(code)) {
      ui.bubble("elder", "Kod 4 ta raqamdan iborat boʻladi. Qayta kiriting.");
      buttons([{ label: "Qayta", onClick: guest }, { label: "Orqaga", onClick: start, secondary: true }]);
      return;
    }
    // Holat pufakda ko'rinadi; xona raqami roomScreen ichida ("Xona: NNNN")
    connect(box(), "right", code);
  }

  // ---------- Sahifa ----------
  const store = storage.create("onlayn:v1", 0); // faqat ovoz tanlovi
  const state = store.load();
  sound.setMuted(state.muted);
  function updateSoundButton() {
    $("btn-sound").innerHTML = art.icon(state.muted ? "sound-off" : "sound-on");
    $("btn-sound").setAttribute("aria-label", state.muted ? "Ovozni yoqish" : "Ovozni oʻchirish");
  }
  $("actor-elder").innerHTML = art.elder();
  $("actor-apprentice").innerHTML = art.apprentice();
  ui.paper("");
  $("btn-home").innerHTML = art.icon("home");
  updateSoundButton();
  $("btn-home").addEventListener("click", () => { sound.play("tap"); root.location.href = SITE_HOME; });
  $("btn-sound").addEventListener("click", () => {
    state.muted = !state.muted;
    sound.setMuted(state.muted);
    store.save(state);
    updateSoundButton();
    sound.play("tap");
  });
  const unlock = () => sound.unlock();
  ["pointerdown", "pointerup", "touchend", "click", "keydown"].forEach((t) => document.addEventListener(t, unlock, true));

  start();
})(window);

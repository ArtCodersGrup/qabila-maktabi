// O'yin qobig'i: qahramonlar, bosh ekran, bosqichlar oqimi, ovoz tugmasi va ?bosqich=N.
// Har bir o'yinning main.js i faqat QK.app.start({ title, storageKey, stageTitles }) ni chaqiradi.
// Sahnalar QK.scenes da: intro(), stage1()..stageN(), stageDone(s, goingOn), finale() (ixtiyoriy), congrats().
// 2026-10-02: yulduzlar (practice statistikasi), bosqich/final kartalari, qiyin rejim (hamma bosqich tugagach).
(function (root) {
  "use strict";

  function start({ title, storageKey, stageTitles }) {
    const { storage, sound, art, ui } = root.QK;
    // practice.js ulanmagan o'yinda (o'z mashq sikli bor) qobiq baribir ishlaydi: yulduz 3, qiyin rejim oddiy
    const practice = root.QK.practice || { setStage() {}, stars: () => 3, isHard: () => false, need: () => 3 };
    const $ = (id) => document.getElementById(id);
    const count = stageTitles.length;
    const store = storage.create(storageKey, count);
    const state = store.load();
    sound.setMuted(state.muted);
    const saveState = () => store.save(state);
    const SITE_HOME = "../../index.html"; // loyiha bosh sahifasi — barcha o'yinlar ro'yxati
    const allDone = () => state.done.every(Boolean);

    // 🏠: bosqich ichida — o'yin bosh ekraniga, o'yin bosh ekranida — barcha o'yinlar ro'yxatiga
    let onHome = false;
    function setOnHome(value) {
      onHome = value;
      $("btn-home").setAttribute("aria-label", value ? "Barcha oʻyinlar" : "Oʻyin boshiga");
    }

    function updateSoundButton() {
      const b = $("btn-sound");
      b.innerHTML = art.icon(state.muted ? "sound-off" : "sound-on");
      b.setAttribute("aria-label", state.muted ? "Ovozni yoqish" : "Ovozni oʻchirish");
    }

    function home() {
      setOnHome(true);
      ui.newRun();
      ui.resetPoses();
      ui.setCompact(false);
      ui.hideProgress();
      ui.paper("");
      ui.clearKeep();
      ui.clearWork();
      ui.clearControl();
      ui.bubble("elder", allDone() ? "Hammasini oʻtding! Yulduzlarni toʻldirasanmi yoki qiyin rejimni sinaysanmi?" : "Salom! Qaysi bosqichni oʻynaymiz?");

      // "Barcha oʻyinlar" — loyiha bosh sahifasi (Information/index.html); o'yin yolg'iz ochilsa ham ishlaydi
      const back = ui.h("a", { class: "back-link", href: SITE_HOME, text: "◀︎ Barcha oʻyinlar" });
      const heading = ui.h("h1", { class: "game-title", text: title });
      const jami = state.stars.reduce((a, b) => a + b, 0);
      const note = ui.h("div", { class: "hard-note", text: `★ ${jami} / ${count * 3}` + (state.hard.some(Boolean) ? " · 🔥 qiyin rejim" : "") });
      const cards = ui.h("div", { class: "cards" });
      stageTitles.forEach((titleText, k) => {
        const open = k === 0 || state.done[k - 1];
        const clickable = open || state.done[k]; // tugagan bosqich, hattoki qulflangan bo'lsa ham, qayta o'ynaladi
        const stateEl = state.done[k]
          ? ui.stars(state.stars[k], "card-stars")
          : ui.h("span", { class: "card-state", text: open ? "" : "🔒" });
        cards.append(ui.h("button", {
          class: "card" + (state.done[k] ? " done" : ""),
          type: "button",
          disabled: !clickable,
          onClick: () => { sound.play("tap"); play(k + 1, state.done[k]); },
        },
        ui.h("span", { class: "card-num", text: state.hard[k] ? "🔥" : String(k + 1) }),
        ui.h("span", { class: "card-title", text: titleText }),
        stateEl));
      });
      ui.work().append(back, heading, note, cards);

      const next = state.done.indexOf(false);
      const first = next === -1 ? 1 : next + 1;
      if (next === -1) {
        const row = ui.h("div", { class: "hard-row" },
          ui.button("Qayta oʻynash", () => play(first)),
          ui.button("Qiyin rejim 🔥", () => play(1, false, true), "secondary"));
        ui.control().append(row, ui.h("div", { class: "hard-note", text: "Qiyin rejim: 7 ta javob, bitta urinish" }));
      } else {
        ui.control().append(ui.button(next === -1 ? "Qayta oʻynash" : "Boshlash", () => play(first), "big"));
      }
    }

    // Bosqich tugadi: yulduzlar saqlanadi (eng yaxshisi qoladi), karta chiziladi, keyin o'yinning stageDone pufagi
    function finishStage(s, hard) {
      const stars = practice.stars();
      if (hard) {
        state.hard[s - 1] = true;
      } else {
        state.done[s - 1] = true;
        state.stars[s - 1] = Math.max(state.stars[s - 1], stars);
      }
      saveState();
      return stars;
    }

    // once — tugagan bosqichni faqat o'zini qayta o'ynash: davom etmaydi, bosh ekranga qaytadi
    // hard — qiyin rejim: 7 ta javob, bitta urinish, eng qiyin misollar (hamma bosqich tugagach ochiladi)
    async function play(stage, once, hard) {
      const scenes = root.QK.scenes;
      setOnHome(false);
      ui.newRun();
      ui.resetPoses();
      ui.hideProgress();
      ui.clearKeep();
      ui.clearControl();
      if (stage === 1 && !state.done[0] && !hard) await scenes.intro();
      if (once) {
        practice.setStage(stage, false);
        await scenes["stage" + stage]();
        const stars = finishStage(stage, false);
        ui.stageCard({ num: stage, total: count, title: stageTitles[stage - 1], stars });
        await scenes.stageDone(stage, false); // davom etmaymiz — "keyingisiga oʻtamiz" deyilmaydi
        ui.clearKeep();
        home();
        return;
      }
      const stars = [];
      for (let s = stage; s <= count; s++) {
        practice.setStage(s, hard);
        await scenes["stage" + s]();
        stars[s - 1] = finishStage(s, hard);
        if (s < count) {
          ui.stageCard({ num: s, total: count, title: stageTitles[s - 1], stars: stars[s - 1], hard });
          await scenes.stageDone(s, true); // keyingi bosqichga o'tamiz
          ui.clearKeep();
        }
      }
      if (scenes.finale) await scenes.finale();
      ui.finalCard({ title, stageTitles, stars: hard ? state.stars : state.stars.map((v, k) => stars[k] || v), hard });
      const next = await scenes.congrats();
      ui.clearKeep();
      if (next === "replay") play(1, false, hard);
      else home();
    }

    $("actor-elder").innerHTML = art.elder();
    $("actor-apprentice").innerHTML = art.apprentice();
    $("btn-home").innerHTML = art.icon("home");
    updateSoundButton();

    $("btn-home").addEventListener("click", () => {
      sound.play("tap");
      if (onHome) root.location.href = SITE_HOME;
      else home();
    });
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

    // O'qituvchi va sinov uchun: ?bosqich=2 — shu bosqichdan boshlash; &qiyin=1 — qiyin rejim
    const params = new URLSearchParams(root.location.search);
    const direct = Number(params.get("bosqich"));
    if (Number.isInteger(direct) && direct >= 1 && direct <= count) play(direct, false, params.get("qiyin") === "1");
    else home();
  }

  root.QK = root.QK || {};
  root.QK.app = { start };
})(window);

// Musobaqa oqimi (DIZAYN 3-bo'lim): sozlash → tanga → savollar → natija.
// Soat requestAnimationFrame bilan yuradi, lekin vaqtni faqat musobaqa.js hisoblaydi (tick).
(function (root) {
  "use strict";

  const { ui, sound, art, savollar, musobaqa, maydon } = root.QK;
  const mart = root.QK.musobaqaArt;
  const $ = (id) => document.getElementById(id);

  // ---------- Sozlamalarni saqlash ----------
  const KEY = "musobaqa:v1";
  const MINUTES = [3, 5, 10];
  const defaults = () => ({ topics: savollar.TOPICS.map((t) => t.id), levels: [1], minutes: 5, muted: false });

  function load() {
    const d = defaults();
    try {
      const s = JSON.parse(root.localStorage.getItem(KEY));
      if (!s) return d;
      const topics = Array.isArray(s.topics) ? s.topics.filter((t) => savollar.TOPICS.some((x) => x.id === t)) : [];
      const levels = Array.isArray(s.levels) ? s.levels.filter((l) => savollar.LEVELS.some((x) => x.id === l)) : [];
      return {
        topics: topics.length ? topics : d.topics,
        levels: levels.length ? levels : d.levels,
        minutes: MINUTES.includes(s.minutes) ? s.minutes : d.minutes,
        muted: typeof s.muted === "boolean" ? s.muted : d.muted,
      };
    } catch (e) {
      return d;
    }
  }

  function save() {
    try {
      root.localStorage.setItem(KEY, JSON.stringify(settings));
    } catch (e) {
      // Saqlab bo'lmadi (maxfiy rejim va h.k.) — musobaqa baribir ishlaydi
    }
  }

  let settings = load();
  sound.setMuted(settings.muted);

  // ---------- Holat ----------
  let screen = "setup"; // setup | coin | match | result
  let match = null;
  let paused = false;
  let running = false; // soat yuradimi: savol ko'rsatilgan va javob kutilmoqda
  let card = null; // joriy savol kartasining tanasi
  let lastTak = null;
  let noticeShown = false;

  const PRAISE = ["Barakalla!", "Zoʻr!", "Ofarin!", "Toʻppa-toʻgʻri!", "Qoyil!"];
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  function setScreen(name) {
    screen = name;
    $("play").classList.toggle("playing", name === "match");
    $("btn-pause").hidden = name !== "match";
    $("btn-home").setAttribute("aria-label", name === "setup" ? "Barcha oʻyinlar" : "Musobaqa boshiga");
  }

  function reset() {
    ui.newRun();
    maydon.clearPad();
    maydon.hideOverlay();
    maydon.hideBubbles();
    ui.resetPoses();
    match = null;
    paused = false;
    running = false;
  }

  // ---------- Ekranlar ----------
  function toSetup() {
    reset();
    setScreen("setup");
    maydon.panels("names");
    maydon.setup(settings, (s) => {
      Object.assign(settings, s);
      save();
      toCoin();
    });
  }

  async function toCoin() {
    reset();
    setScreen("coin");
    maydon.panels("names");
    const starter = Math.random() < 0.5 ? "left" : "right";
    await maydon.coin(starter);
    startMatch(starter);
  }

  function startMatch(starter) {
    const deck = savollar.deck({ topics: settings.topics, levels: settings.levels });
    match = musobaqa.create({ seconds: settings.minutes * 60, starter, nextPair: deck.next, check: savollar.check });
    noticeShown = false;
    lastTak = null;
    setScreen("match");
    maydon.panels("match", onSkip);
    ask();
  }

  function ask() {
    if (match.phase === "over") return finish();
    const side = match.turn;
    card = maydon.card(match.question, side);
    maydon.update(match);
    maydon.answerPad(match.question, onAnswer, () => !paused && running);
    if (match.waitingOut && !noticeShown) {
      noticeShown = true;
      ui.toast(`${maydon.of(match.waitingOut)} yuraklari tugadi. ${maydon.NAMES[side]} oxirgi savolga javob beradi.`);
    }
    running = true;
  }

  async function onAnswer(value) {
    if (!match || match.phase !== "ask") return;
    running = false;
    const side = match.turn;
    const q = match.question;
    const ok = match.answer(value);
    maydon.update(match);
    if (ok) {
      sound.play("correct");
      maydon.showResult(card, "ok", q, value);
      maydon.cheer(side, pick(PRAISE), "happy");
      await ui.sleep(1300);
    } else {
      sound.play("retry");
      maydon.showResult(card, "wrong", q, value);
      maydon.cheer(side, match.players[side].hearts ? "Hechqisi yoʻq!" : "Eh, attang!", "sad");
      await maydon.waitButton("Davom ▶︎");
    }
    advance();
  }

  async function onSkip(side) {
    if (!match || paused || !running || match.turn !== side) return;
    const q = match.question;
    if (!match.skip()) return;
    running = false;
    sound.play("tap");
    maydon.clearPad();
    maydon.update(match);
    maydon.showResult(card, "skip", q);
    await maydon.waitButton("Davom ▶︎");
    advance();
  }

  function advance() {
    match.next();
    if (match.phase === "over") finish();
    else ask();
  }

  async function timeUp() {
    running = false;
    maydon.clearPad();
    ui.clearControl();
    sound.play("dum");
    maydon.update(match);
    maydon.showResult(card, "time", match.question);
    await ui.sleep(1800);
    finish();
  }

  function finish() {
    running = false;
    paused = false;
    maydon.hideOverlay(); // vaqt tugagach pauza bosilgan bo'lsa ham natija ko'rinsin
    setScreen("result");
    maydon.update(match);
    sound.play("win");
    const { winner } = match.result;
    if (winner) {
      maydon.cheer(winner, "Tabriklaymiz!", "happy");
      maydon.cheer(musobaqa.other(winner), "Yaxshi oʻynading!", null);
    } else {
      ["left", "right"].forEach((side) => maydon.cheer(side, "Durang!", "happy"));
    }
    maydon.result(match, toCoin, toSetup);
  }

  // ---------- Soat ----------
  let lastT = 0;
  function frame(t) {
    root.requestAnimationFrame(frame);
    const dt = Math.min(t - lastT, 250); // sahifa sekinlashsa ham bir zumda ko'p vaqt ketmasin
    lastT = t;
    if (!match || !running || paused || match.phase !== "ask" || dt <= 0) return;
    const over = match.tick(dt);
    maydon.update(match);
    const sec = Math.ceil(match.players[match.turn].time / 1000);
    if (sec <= 10 && sec > 0 && `${match.turn}${sec}` !== lastTak) {
      lastTak = `${match.turn}${sec}`;
      sound.play("tak");
    }
    if (over) timeUp();
  }

  // ---------- Pauza ----------
  function pause() {
    if (screen !== "match" || paused) return;
    paused = true;
    maydon.overlay("⏸ Pauza",
      ui.button("Davom etish ▶︎", resume, "big"),
      ui.button("Musobaqani tugatish", toSetup, "secondary"));
  }

  function resume() {
    paused = false;
    maydon.hideOverlay();
  }

  // ---------- Tugmalar ----------
  $("btn-home").innerHTML = art.icon("home");
  $("btn-pause").innerHTML = mart.pause();
  function updateSoundButton() {
    $("btn-sound").innerHTML = art.icon(settings.muted ? "sound-off" : "sound-on");
    $("btn-sound").setAttribute("aria-label", settings.muted ? "Ovozni yoqish" : "Ovozni oʻchirish");
  }
  updateSoundButton();

  // 🏠: sozlashda — barcha o'yinlar; musobaqada — pauza (u yerdan chiqish mumkin); tanga va natijada — sozlash
  $("btn-home").addEventListener("click", () => {
    sound.play("tap");
    if (screen === "setup") root.location.href = "../../index.html";
    else if (screen === "match") pause();
    else toSetup();
  });
  $("btn-pause").addEventListener("click", () => {
    sound.play("tap");
    pause();
  });
  $("btn-sound").addEventListener("click", () => {
    settings.muted = !settings.muted;
    sound.setMuted(settings.muted);
    save();
    updateSoundButton();
    sound.play("tap");
  });
  // Sahifa yashirilsa (boshqa ilova, ekran o'chdi) — soatlar to'xtaydi
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
  const unlock = () => sound.unlock();
  ["pointerdown", "pointerup", "touchend", "click", "keydown"].forEach((t) => document.addEventListener(t, unlock, true));

  // Sinov uchun ilgak (brauzerda avtomat o'ynash skripti ishlatadi)
  root.QK.probe = () => ({ screen, paused, running, match });

  maydon.initFans();
  toSetup();
  root.requestAnimationFrame((t) => {
    lastT = t;
    root.requestAnimationFrame(frame);
  });
})(window);

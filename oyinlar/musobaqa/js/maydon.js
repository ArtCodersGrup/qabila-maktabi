// Musobaqa ekrani (DIZAYN 3- va 5-bo'lim): o'yinchi panellari, muxlislar, sozlash, tanga,
// savol kartasi, javob tugmalari, pauza oynasi va natija. Holat va qoidalar — musobaqa.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, art, savollar } = QK;
  const mart = QK.musobaqaArt;
  const $ = (id) => document.getElementById(id);
  const h = ui.h;

  const SIDES = ["left", "right"];
  const NAMES = { left: "Oy", right: "Quyosh" };
  const of = (side) => NAMES[side] + "ning"; // "Oyning", "Quyoshning"
  const FAN = { left: "elder", right: "apprentice" }; // oqsoqol — Oy muxlisi, shogird — Quyosh muxlisi
  const fmtTime = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  // ---------- Muxlislar ----------
  function initFans() {
    $("actor-elder").innerHTML = art.elder();
    $("actor-apprentice").innerHTML = art.apprentice();
    ui.paper(""); // shogird qog'ozi bu yerda kerak emas
    SIDES.forEach((side) => { $("flag-" + side).innerHTML = mart.flag(side); });
  }

  const bubbleTimers = {};
  // mood: "happy" — sakraydi va bayroq silkitadi, "sad" — o'ylanib qoladi
  function cheer(side, text, mood) {
    const b = $("bubble-" + side);
    b.textContent = text;
    b.hidden = false;
    clearTimeout(bubbleTimers[side]);
    bubbleTimers[side] = setTimeout(() => { b.hidden = true; }, 2400);
    const who = FAN[side];
    if (mood === "happy") {
      ui.pose(who, "happy", 900);
      if (who === "apprentice") {
        ui.raisePaper(true);
        setTimeout(() => ui.raisePaper(false), 1000);
      } else {
        ui.pose(who, "point", 1000);
      }
      const f = $("flag-" + side);
      f.classList.remove("wave");
      void f.offsetWidth; // animatsiyani qaytadan boshlash
      f.classList.add("wave");
    } else if (mood === "sad") {
      ui.pose(who, "think", 1200);
    }
  }

  function hideBubbles() {
    SIDES.forEach((side) => {
      clearTimeout(bubbleTimers[side]);
      $("bubble-" + side).hidden = true;
    });
  }

  // ---------- O'yinchi panellari ----------
  const refs = {};

  // mode: "names" — faqat belgi va nom (sozlash, tanga); "match" — soat, yuraklar, o'tkazish
  function panels(mode, onSkip) {
    SIDES.forEach((side) => {
      const p = $("panel-" + side);
      p.innerHTML = "";
      p.classList.remove("active");
      p.append(h("div", { class: "panel-head", html: mart.emblem(side) }, h("span", { text: NAMES[side] })));
      if (mode !== "match") {
        refs[side] = null;
        return;
      }
      const clock = h("div", { class: "clock", role: "timer", "aria-label": `${NAMES[side]} vaqti` });
      const hearts = h("div", { class: "hearts" });
      const skip = h("button", { class: "skip-btn", type: "button", onClick: () => onSkip(side) });
      p.append(clock, hearts, skip);
      refs[side] = { clock, hearts, skip, sec: null, lives: null, skipState: null };
    });
  }

  // Panellarni holatga moslash (soat soniyasi o'zgarganda yoki yurak kamayganda qayta chiziladi)
  function update(m) {
    const active = m.phase === "over" ? null : m.turn;
    SIDES.forEach((side) => {
      const r = refs[side];
      if (!r) return;
      const p = m.players[side];
      const sec = Math.ceil(p.time / 1000);
      if (sec !== r.sec) {
        r.sec = sec;
        r.clock.textContent = fmtTime(sec);
        r.clock.classList.toggle("low", sec <= 30);
      }
      if (p.hearts !== r.lives) {
        const lost = r.lives !== null && p.hearts < r.lives;
        r.lives = p.hearts;
        r.hearts.innerHTML = "";
        r.hearts.setAttribute("aria-label", `${p.hearts} ta yurak`);
        for (let k = 0; k < QK.musobaqa.HEARTS; k++) {
          const span = h("span", { html: mart.heart(k < p.hearts) });
          if (lost && k === p.hearts) span.firstChild.classList.add("breaking");
          r.hearts.append(span);
        }
      }
      const skip = `${p.skipUsed}|${p.skipUsed || active !== side || m.phase !== "ask"}|${active === side}`;
      if (skip !== r.skipState) { // har kadrda DOM qayta yozilmasin
        r.skipState = skip;
        r.skip.textContent = p.skipUsed ? "↷ Ishlatildi" : "↷ Oʻtkazish";
        r.skip.classList.toggle("used", p.skipUsed);
        r.skip.disabled = p.skipUsed || active !== side || m.phase !== "ask";
        $("panel-" + side).classList.toggle("active", active === side);
      }
    });
  }

  // ---------- Sozlash ----------
  // Tugmalar guruhi. multi — bir nechtasi (kamida bittasi qoladi), aks holda bittasi.
  function chips(items, selected, multi, onChange) {
    const box = h("div", { class: "chips" });
    let value = selected.slice();
    const buttons = items.map((it) => {
      const b = h("button", { class: "chip", type: "button", text: it.title, "aria-pressed": String(value.includes(it.id)) });
      b.addEventListener("click", () => {
        sound.play("tap");
        if (!multi) value = [it.id];
        else if (!value.includes(it.id)) value = value.concat(it.id);
        else if (value.length > 1) value = value.filter((v) => v !== it.id);
        else return ui.toast("Kamida bittasini tanla");
        buttons.forEach((x, k) => x.setAttribute("aria-pressed", String(value.includes(items[k].id))));
        onChange(value);
      });
      box.append(b);
      return b;
    });
    return box;
  }

  function setup(settings, onStart) {
    ui.clearWork();
    ui.clearControl();
    hideBubbles();
    const s = { topics: settings.topics.slice(), levels: settings.levels.slice(), minutes: settings.minutes };
    const minutes = [3, 5, 10].map((m) => ({ id: m, title: `${m} daqiqa` }));
    ui.work().append(h("div", { class: "setup" },
      h("a", { class: "back-link", href: "../../index.html", text: "◀︎ Barcha oʻyinlar" }),
      h("h1", { text: "Musobaqa" }),
      h("p", { class: "setup-note", text: "Ikki kishi bitta ekranda bellashadi: chapda — Oy, oʻngda — Quyosh." }),
      h("h2", { text: "Mavzular" }),
      chips(savollar.TOPICS, s.topics, true, (v) => { s.topics = v; }),
      h("h2", { text: "Qiyinlik" }),
      chips(savollar.LEVELS, s.levels, true, (v) => { s.levels = v; }),
      h("h2", { text: "Vaqt (har kimga)" }),
      chips(minutes, [s.minutes], false, (v) => { s.minutes = v[0]; }),
      h("p", { class: "setup-note", text: "Har kimda 3 ta yurak va bitta ↷ oʻtkazish. Xato javob bitta yurakni oladi." })));
    ui.control().append(ui.button("Boshlash", () => onStart(s), "big"));
  }

  // ---------- Tugma bosilishini kutish ----------
  function waitButton(label, cls) {
    ui.clearControl();
    return ui.settle((done) => {
      ui.control().append(ui.button(label, () => { ui.clearControl(); done(); }, cls || "big"));
    });
  }

  // ---------- Tanga: kim boshlaydi ----------
  async function coin(starter) {
    ui.clearWork();
    ui.clearControl();
    hideBubbles();
    const disc = h("div", { class: "coin" },
      h("div", { class: "coin-face front", html: mart.coinFace("right") }),
      h("div", { class: "coin-face back", html: mart.coinFace("left") }));
    const note = h("p", { class: "coin-note" },
      h("span", { class: "right", text: "Quyosh" }), " tushsa — oʻngdagi, ",
      h("span", { class: "left", text: "oy" }), " tushsa — chapdagi boshlaydi.");
    const result = h("p", { class: "coin-result", hidden: true });
    ui.work().append(h("div", { class: "coin-stage" }, h("div", { class: "coin-wrap" }, disc), note, result));

    await waitButton("Tangani tashla");
    sound.play("tap");
    const end = starter === "right" ? 1800 : 1980; // 5 marta aylanadi; oy — orqa tomoni
    if (disc.animate) {
      disc.animate([{ transform: "rotateY(0deg)" }, { transform: `rotateY(${end}deg)` }],
        { duration: 1500, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)", fill: "forwards" });
    } else {
      disc.style.transform = `rotateY(${end}deg)`;
    }
    await ui.sleep(1600);
    result.textContent = starter === "right" ? "Quyosh! Oʻngdagi boshlaydi." : "Oy! Chapdagi boshlaydi.";
    result.hidden = false;
    sound.play("correct");
    cheer(starter, "Birinchi biz!", "happy");
    await waitButton("Boshladik ▶︎");
  }

  // ---------- Savol kartasi ----------
  function morseGroup(code) {
    const g = h("span", { class: "morse-group" });
    for (const s of code) g.append(h("span", { class: s === "." ? "m-dot" : "m-dash" }));
    return g;
  }

  function block(b) {
    switch (b.type) {
      case "big":
        return h("div", { class: "q-big", text: b.text });
      case "places":
        return h("div", { class: "q-places" }, h("span", { text: `Xona qiymatlari: ${b.items.join(" · ")}` }));
      case "strip": {
        const row = h("div", { class: "q-strip", "aria-label": "Alifbo" });
        b.letters.forEach((l) => row.append(h("span", { class: l === b.mark ? "mark" : "", text: l })));
        return row;
      }
      case "tiles": {
        const row = h("div", { class: "q-tiles" });
        b.items.forEach((t) => row.append(h("span", { class: "tile big", text: t })));
        return row;
      }
      case "chars": {
        const row = h("div", { class: "q-chars", "aria-label": b.text });
        [...b.text].forEach((ch) => row.append(h("span", { text: ch === " " ? "" : ch })));
        return row;
      }
      case "grid": {
        const g = h("div", { class: "q-grid", style: `grid-template-columns: repeat(${b.w}, 14px)`, "aria-hidden": "true" });
        for (let k = 0; k < b.w * b.h; k++) g.append(h("span", { class: Math.random() < 0.4 ? "on" : "" }));
        return g;
      }
      case "morse": {
        const row = h("div", { class: "q-morse", "aria-label": "Morze xabari" });
        b.groups.forEach((code) => row.append(morseGroup(code)));
        return row;
      }
      case "guide": {
        const row = h("div", { class: "q-guide", "aria-label": "Qoʻllanma" });
        b.items.forEach(([l, code]) => row.append(h("span", null, h("b", { text: l }), morseGroup(code))));
        return row;
      }
      case "lines": {
        const list = h("ul", { class: "q-lines" });
        b.items.forEach((line) => list.append(h("li", { text: line })));
        return list;
      }
      case "neuron": {
        const row = h("div", { class: "q-neuron" });
        b.inputs.forEach((x, k) => {
          const w = b.weights[k];
          row.append(h("span", { class: "n-in", "aria-label": `${x ? "yoniq" : "oʻchiq"}, ogʻirlik ${w}` },
            h("span", { class: "n-lamp" + (x ? " on" : "") }),
            h("span", { text: `×(${w < 0 ? "−" + -w : "+" + w})` })));
        });
        if (b.threshold != null) row.append(h("span", { class: "n-th", text: `Chegara: ${b.threshold}` }));
        return row;
      }
      default:
        return null;
    }
  }

  // Karta chiziladi; javob natijasi keyinroq shu kartaga qo'shiladi (qaytgan body ga)
  function card(q, side) {
    ui.clearWork();
    const stars = "★".repeat(q.level) + "☆".repeat(3 - q.level);
    const head = h("div", { class: "qcard-head" },
      h("span", { text: `${NAMES[side]} navbati` }),
      h("span", { text: `${savollar.topicTitle(q.topic)} · ${stars}`, "aria-label": `${savollar.topicTitle(q.topic)}, ${savollar.levelTitle(q.level)}` }));
    const body = h("div", { class: "qcard-body" }, h("div", { class: "q-text", text: q.text }));
    q.blocks.forEach((b) => body.append(block(b)));
    ui.work().append(h("div", { class: "qcard", "data-side": side }, head, body));
    return body;
  }

  // kind: "ok" | "wrong" | "skip" | "time"
  function showResult(body, kind, q, given) {
    const box = h("div", { class: "q-result " + (kind === "ok" ? "ok" : "miss") });
    if (kind === "ok") {
      box.textContent = "✓ Toʻgʻri!";
    } else {
      const lead = { wrong: `↻ Sening javobing: ${given}.`, skip: "↷ Oʻtkazildi.", time: "⏱ Vaqt tugadi." }[kind];
      box.append(h("span", { text: `${lead} Toʻgʻri javob: ${q.answer}` }), h("span", { class: "why", text: q.explain }));
    }
    body.append(box);
    if (box.scrollIntoView) box.scrollIntoView({ block: "nearest" });
  }

  // ---------- Javob tugmalari ----------
  let padCleanup = null;
  function clearPad() {
    if (padCleanup) padCleanup();
    padCleanup = null;
  }

  // onSubmit(qiymat) bir marta chaqiriladi; enabled() — hozir javob qabul qilinadimi (pauzada — yo'q)
  function answerPad(q, onSubmit, enabled) {
    clearPad();
    ui.clearControl();
    let sent = false;
    const submit = (v) => {
      if (sent || v === "" || !enabled()) return;
      sent = true;
      clearPad();
      ui.clearControl();
      onSubmit(v);
    };

    const inp = q.input;
    if (inp.type === "choice") {
      const grid = h("div", { class: "choice-grid" });
      inp.options.forEach((o, k) => {
        const b = ui.button(o, () => submit(o));
        if (inp.options.length % 2 === 1 && k === inp.options.length - 1) b.classList.add("single");
        grid.append(b);
      });
      ui.control().append(grid);
      return;
    }

    let value = "";
    const display = h("div", { class: "num-display", "aria-live": "polite" });
    const render = () => { display.textContent = value || " "; };
    render();
    const list = inp.type === "num" ? "1234567890".split("") : inp.keys;
    const all = list.concat("del", "ok");
    const rows = Math.ceil(all.length / 6);
    const cols = Math.ceil(all.length / rows);

    function press(k) {
      if (sent || !enabled()) return;
      if (k === "ok") return submit(value);
      if (k === "del") value = value.slice(0, -1);
      else if (value.length < inp.maxLen) value = (inp.type === "num" && value === "0" ? "" : value) + k;
      sound.play("tap");
      render();
    }

    const keys = h("div", { class: "keypad", style: `--cols: ${cols}` });
    all.forEach((k) => keys.append(h("button", {
      class: "key" + (k === "ok" ? " ok" : k === "del" ? " del" : ""),
      type: "button",
      text: k === "del" ? "⌫" : k === "ok" ? "✓" : k,
      "aria-label": k === "del" ? "Oʻchirish" : k === "ok" ? "Javob berish" : k,
      onClick: () => press(k),
    })));
    ui.control().append(h("div", { class: "answer-pad" }, display, keys));

    // Kompyuterda: raqam/harf tugmalari, Backspace, Enter
    function onKey(e) {
      const k = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      if (list.includes(k)) press(k);
      else if (k === "Backspace") press("del");
      else if (k === "Enter") {
        e.preventDefault();
        press("ok");
      }
    }
    document.addEventListener("keydown", onKey);
    padCleanup = () => document.removeEventListener("keydown", onKey);
    ui.onCleanup(clearPad);
  }

  // ---------- Pauza oynasi ----------
  function overlay(title, ...buttons) {
    const o = $("overlay");
    o.innerHTML = "";
    o.append(h("h2", { text: title }), ...buttons);
    o.hidden = false;
  }

  function hideOverlay() {
    const o = $("overlay");
    o.hidden = true;
    o.innerHTML = "";
  }

  // ---------- Natija ----------
  function reasonText(r) {
    const w = r.winner;
    switch (r.reason) {
      case "time": return `${of(r.loser)} vaqti tugadi.`;
      case "hearts": return `${of(r.loser)} yuraklari tugadi.`;
      case "both": return w ? `Ikkalasi ham chiqdi — ${of(w)} vaqti koʻproq qoldi.` : "Ikkalasi ham chiqdi, vaqt ham teng.";
      default: return w ? "Savollar tugadi — yuragi yoki vaqti koʻproq qolgan yutdi." : "Savollar tugadi — hammasi teng.";
    }
  }

  // Xatolar ro'yxati uchun savolning qisqa matni: matnda son bo'lmasa ("Rim sonini oʻqi."), katta yozuv qo'shiladi
  function questionText(q) {
    const bigBlock = q.blocks.find((b) => b.type === "big" || b.type === "chars");
    return bigBlock && !/\d/.test(q.text) ? `${q.text} ${bigBlock.text}` : q.text;
  }

  function result(m, onAgain, onSettings) {
    ui.clearWork();
    const { winner } = m.result;
    const emblems = winner ? mart.emblem(winner) : mart.emblem("left") + mart.emblem("right");
    const rows = SIDES.map((side) => {
      const s = QK.musobaqa.stats(m, side);
      const p = m.players[side];
      return h("tr", null,
        h("td", null, h("span", { class: "side-name", html: mart.emblem(side) }, h("span", { text: NAMES[side] }))),
        h("td", { text: String(s.correct) }), h("td", { text: String(s.wrong) }), h("td", { text: String(s.skipped) }),
        h("td", { text: fmtTime(Math.ceil(p.time / 1000)) }), h("td", { text: String(p.hearts) }));
    });
    const table = h("table", { class: "score" },
      h("thead", null, h("tr", null, ...["", "✓", "↻", "↷", "⏱", "♥"].map((t, k) => h("th", {
        text: t, "aria-label": ["Oʻyinchi", "Toʻgʻri", "Xato", "Oʻtkazilgan", "Qolgan vaqt", "Qolgan yurak"][k],
      })))),
      h("tbody", null, ...rows));

    const misses = m.history.filter((x) => x.result !== "correct");
    const list = h("div", { class: "mistakes" });
    if (misses.length) {
      list.append(h("h2", { text: "Xatolar ustida ishlaymiz" }));
      misses.forEach((x) => list.append(h("div", { class: "mistake", html: mart.emblem(x.side) },
        h("span", null,
          h("span", { text: questionText(x.question) + " " }),
          h("span", { text: x.result === "skip" ? "Oʻtkazildi. " : `Javob: ${x.given}. ` }),
          h("b", { text: `Toʻgʻri: ${x.question.answer}` })))));
    }

    ui.work().append(h("div", { class: "result" },
      h("div", { html: emblems }),
      h("h1", { text: winner ? `${NAMES[winner]} yutdi!` : "Durang!" }),
      h("p", { class: "result-why", text: reasonText(m.result) }),
      table, list));
    ui.clearControl();
    ui.control().append(h("div", { class: "choice-row" },
      ui.button("Yana oʻynash", onAgain, "big"),
      ui.button("Sozlamalar", onSettings, "secondary")));
  }

  QK.maydon = {
    NAMES, of, initFans, cheer, hideBubbles, panels, update, setup, waitButton, coin,
    card, showResult, answerPad, clearPad, overlay, hideOverlay, result,
  };
})(window);

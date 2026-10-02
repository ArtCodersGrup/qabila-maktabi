// Umumiy ekran elementlari: pufak, tugmalar, kataklar, klaviatura, hisoblagich, progress.
// Kutish funksiyalari Promise qaytaradi. Bosh ekranga qaytilganda (newRun) eski Promise'lar
// hech qachon hal bo'lmaydi — eski sahna shu joyda "muzlaydi" va davom etmaydi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const $ = (id) => document.getElementById(id);

  // ---------- Sahnani to'xtatish ----------
  let runId = 0;
  let cleanups = [];

  function newRun() {
    runId++;
    cleanups.forEach((fn) => fn());
    cleanups = [];
    return runId;
  }

  function onCleanup(fn) {
    cleanups.push(fn);
  }

  // Promise faqat shu sahna hali davom etayotgan bo'lsa hal bo'ladi
  function settle(executor) {
    const id = runId;
    return new Promise((resolve) => executor((value) => {
      if (id === runId) resolve(value);
    }));
  }

  const sleep = (ms) => settle((done) => setTimeout(done, ms));

  // ---------- Element yasash ----------
  function h(tag, props, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(props || {})) {
      if (value === false || value == null) continue;
      if (key === "class") el.className = value;
      else if (key === "text") el.textContent = value;
      else if (key === "html") el.innerHTML = value;
      else if (key === "onClick") el.addEventListener("click", value);
      else el.setAttribute(key, value === true ? "" : value);
    }
    for (const child of children) if (child != null) el.append(child);
    return el;
  }

  function button(label, onClick, cls) {
    return h("button", {
      class: "btn " + (cls || ""),
      type: "button",
      text: label,
      onClick: () => { QK.sound.play("tap"); onClick(); },
    });
  }

  // ---------- Zonalar ----------
  const work = () => $("zone-work");
  const control = () => $("zone-control");
  // data-keep belgili elementlar (bosqich/final kartasi) sahna tozalaganda qoladi; clearKeep() ularni olib tashlaydi
  const clearWork = () => {
    for (const n of [...work().childNodes]) if (!(n.nodeType === 1 && n.hasAttribute("data-keep"))) n.remove();
  };
  const clearKeep = () => { work().querySelectorAll(":scope > [data-keep]").forEach((el) => el.remove()); };
  const clearControl = () => { control().innerHTML = ""; };
  const setCompact = (on) => $("play").classList.toggle("compact", !!on);

  // ---------- Qahramonlar ----------
  const actorSvg = (who) => $("actor-" + who).querySelector("svg");

  function pose(who, name, ms) {
    const svg = actorSvg(who);
    if (!svg) return;
    svg.classList.add("pose-" + name);
    if (ms) setTimeout(() => svg.classList.remove("pose-" + name), ms);
    if (name === "happy") celebrate(who === "elder");
  }

  // Tantana: konfeti (shogird — kichik, oqsoqol — katta + ✓). Ish zonasini to'smaydi (pointer-events: none),
  // reduced-motion da avtomatik o'chadi. Hamma o'yin pose(x, "happy") ni chaqiradi — alohida ulash shart emas.
  let lastParty = 0;
  function celebrate(big) {
    const host = $("play");
    if (!host) return;
    const now = Date.now();
    if (!big && now - lastParty < 400) return; // bir vaqtda ikki chaqiruv — bitta konfeti
    lastParty = now;
    const box = h("div", { class: "tantana", "aria-hidden": "true" });
    const colors = ["var(--c0)", "var(--c1)", "var(--c2)", "var(--c3)", "var(--sariq)"];
    const n = big ? 22 : 10;
    for (let k = 0; k < n; k++) {
      const i = document.createElement("i");
      const a = (k / n) * Math.PI * 2;
      const r = 70 + Math.random() * 110;
      i.style.cssText = "--dx:" + (Math.cos(a) * r).toFixed(0) + "px;--dy:" + (Math.sin(a) * r * 0.7 + 70).toFixed(0)
        + "px;--c:" + colors[k % 5] + ";--d:" + (Math.random() * 0.12).toFixed(2) + "s";
      box.append(i);
    }
    host.append(box);
    if (big && !host.querySelector(".ok-belgi")) host.append(h("div", { class: "ok-belgi", "aria-hidden": "true", text: "✓" }));
    setTimeout(() => { box.remove(); host.querySelectorAll(".ok-belgi").forEach((e) => e.remove()); }, 1000);
  }

  function resetPoses() {
    ["elder", "apprentice"].forEach((who) => {
      const svg = actorSvg(who);
      if (svg) svg.setAttribute("class", "actor-svg");
    });
  }

  // Shogird qog'ozidagi yozuv; bo'sh satr — qog'oz yashiriladi
  function paper(text) {
    const box = $("actor-apprentice");
    const t = box.querySelector(".paper-text");
    const p = box.querySelector(".paper");
    if (t) t.textContent = text;
    if (p) p.style.visibility = text ? "visible" : "hidden";
  }

  function raisePaper(on) {
    const svg = actorSvg("apprentice");
    if (svg) svg.classList.toggle("pose-raise", !!on);
  }

  // ---------- Nutq pufagi ----------
  function bubble(who, content) {
    const b = $("bubble");
    b.hidden = false;
    // Matn ✓ bilan boshlansa — "to'g'ri" holati, ↻ bilan — "yana urin" (rang + belgi, QOIDALAR §6)
    const text = typeof content === "string" ? content : (content && content.textContent) || "";
    const holat = text.startsWith("✓") ? " ok" : text.startsWith("↻") ? " yana" : "";
    b.className = "bubble from-" + who + holat;
    b.onclick = null;
    b.textContent = "";
    if (typeof content === "string") b.textContent = content;
    else b.append(content);
    pose(who, "talk", 900);
  }

  // Gap + "Davom" tugmasi; bola tugmani yoki pufakni bosguncha kutadi
  function say(who, content) {
    bubble(who, content);
    clearControl();
    return settle((done) => {
      let finished = false;
      let ready = false;
      // Tez-tez ikki marta bosilsa, keyingi pufak sakrab ketmasin
      setTimeout(() => { ready = true; }, 300);
      const finish = () => {
        if (finished || !ready) return;
        finished = true;
        $("bubble").onclick = null;
        clearControl();
        done();
      };
      control().append(button("Davom ▶︎", finish));
      $("bubble").onclick = finish;
    });
  }

  // ---------- Harflar ----------
  function tile(letter, colorIndex, size) {
    return h("span", { class: `tile c${colorIndex % 4} ${size || ""}`, text: letter });
  }

  function wordChip(word, letters) {
    const chip = h("span", { class: "word" });
    for (const ch of word) chip.append(tile(ch, letters.indexOf(ch), "xs"));
    return chip;
  }

  // Pufak ichida: matn + rangli harf kartochkalari (+ ixtiyoriy ikkinchi qator)
  function lettersLine(before, letters, after) {
    const line = h("div", { class: "bubble-line" }, h("span", { text: before }));
    letters.forEach((l, k) => line.append(tile(l, k, "sm")));
    return h("div", null, line, after ? h("div", { text: after }) : null);
  }

  function toast(text) {
    const t = h("div", { class: "toast", text });
    $("play").append(t);
    setTimeout(() => t.remove(), 2500);
  }

  const SUP = { 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 8: "⁸" };
  const sup = (n) => SUP[n] || "^" + n;

  // ---------- Qo'lda so'z yasash ----------
  // Harfni bosish → birinchi bo'sh katakka; to'lgan katakni bosish → bo'shatish.
  // Barcha `targets` topilganda hal bo'ladi.
  function buildWords({ letters, len, allowShort, targets, slotsHost, onFound }) {
    const id = runId; // shu run tugagach, kechikkan timer'lar hech narsa qilmasin
    const found = new Set();
    const cells = [];
    let autoTimer = null;

    function setCell(cell, letter) {
      cell.dataset.letter = letter || "";
      cell.textContent = letter || "";
      cell.className = "slot" + (letter ? ` filled c${letters.indexOf(letter) % 4}` : "");
    }
    const current = () => cells.map((c) => c.dataset.letter).join("");
    const clear = () => cells.forEach((c) => setCell(c, null));
    const isFull = () => cells.every((c) => c.dataset.letter);
    const cancelAuto = () => {
      if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    };

    slotsHost.innerHTML = "";
    for (let k = 0; k < len; k++) {
      const cell = h("button", { class: "slot", type: "button", "aria-label": `${k + 1}-katak` });
      cell.addEventListener("click", () => {
        if (!cell.dataset.letter) return;
        QK.sound.play("tap");
        setCell(cell, null);
      });
      setCell(cell, null);
      cells.push(cell);
      slotsHost.append(cell);
    }

    return settle((done) => {
      function submit() {
        cancelAuto(); // qo'lda ("Tayyor") yuborilganda kutilayotgan avtomatik yuborish endi kerak emas
        const word = current();
        if (!word || (!allowShort && word.length !== len)) return;
        if (found.has(word)) {
          QK.sound.play("retry");
          slotsHost.classList.remove("shake");
          void slotsHost.offsetWidth; // animatsiyani qaytadan boshlash
          slotsHost.classList.add("shake");
          toast("Bu soʻz bor edi! Boshqasini yasa.");
          setTimeout(() => { if (id === runId) clear(); }, 400);
          return;
        }
        if (!targets.includes(word)) return;
        found.add(word);
        QK.sound.play("correct");
        onFound(word);
        clear();
        if (found.size === targets.length) {
          clearControl();
          done();
        }
      }

      const pad = h("div", { class: "letter-pad" });
      letters.forEach((l, k) => {
        pad.append(h("button", {
          class: `tile big c${k % 4}`,
          type: "button",
          text: l,
          onClick: () => {
            const empty = cells.find((c) => !c.dataset.letter);
            if (!empty) return;
            QK.sound.play("tap");
            setCell(empty, l);
            if (isFull()) {
              const snap = current();
              cancelAuto();
              autoTimer = setTimeout(() => {
                autoTimer = null;
                if (id === runId && current() === snap) submit();
              }, 250);
            }
          },
        }));
      });

      const extras = h("div", { class: "pad-extras" });
      if (allowShort) extras.append(button("Tayyor", submit));
      extras.append(button("Yordam", () => {
        cancelAuto();
        const missing = targets.find((w) => !found.has(w));
        if (!missing) return;
        clear();
        [...missing].forEach((ch, k) => setCell(cells[k], ch));
        slotsHost.classList.add("hint");
        setTimeout(() => {
          if (id !== runId) return;
          slotsHost.classList.remove("hint");
          clear();
        }, 1200);
      }, "secondary"));

      clearControl();
      control().append(pad, extras);
    });
  }

  // ---------- Raqam klaviaturasi ----------
  // 2 qator × 6 tugma: 1–9, 0, ⌫, ✓. Kompyuterda klaviatura raqamlari, Backspace, Enter ham ishlaydi.
  function askNumber(maxLen = 3) {
    clearControl();
    let value = "";
    const display = h("div", { class: "num-display", "aria-live": "polite" });
    const render = () => { display.textContent = value || " "; };
    render();

    return settle((done) => {
      function press(k) {
        if (k === "ok") {
          if (!value) return;
          cleanup();
          clearControl();
          done(Number(value));
          return;
        }
        if (k === "del") value = value.slice(0, -1);
        else if (value.length < maxLen) value = (value === "0" ? "" : value) + k;
        QK.sound.play("tap");
        render();
      }

      function onKey(e) {
        if (/^[0-9]$/.test(e.key)) press(e.key);
        else if (e.key === "Backspace") press("del");
        else if (e.key === "Enter") {
          e.preventDefault();
          press("ok");
        }
      }
      const cleanup = () => document.removeEventListener("keydown", onKey);
      document.addEventListener("keydown", onKey);
      onCleanup(cleanup);

      const keys = h("div", { class: "keypad" });
      ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "del", "ok"].forEach((k) => {
        keys.append(h("button", {
          class: "key" + (k === "ok" ? " ok" : k === "del" ? " del" : ""),
          type: "button",
          text: k === "del" ? "⌫" : k === "ok" ? "✓" : k,
          "aria-label": k === "del" ? "Oʻchirish" : k === "ok" ? "Javob berish" : k,
          onClick: () => press(k),
        }));
      });
      control().append(h("div", { class: "keypad-wrap" }, display, keys));
    });
  }

  // ---------- Hisoblagich: "5 ta harf" (1-o'yin), "5 ta bit" (13-o'yin) ----------
  function counter(host, { start, min, max, onChange, unit = "harf" }) {
    let a = start;
    const val = h("div", { class: "counter-val" });
    const minus = h("button", { class: "key", type: "button", text: "−", "aria-label": "Bitta kam" });
    const plus = h("button", { class: "key", type: "button", text: "+", "aria-label": "Bitta koʻp" });
    const render = () => {
      val.textContent = `${a} ta ${unit}`;
      minus.disabled = a <= min;
      plus.disabled = a >= max;
    };
    const change = (d) => {
      a += d;
      QK.sound.play("tap");
      render();
      onChange(a);
    };
    minus.addEventListener("click", () => { if (a > min) change(-1); });
    plus.addEventListener("click", () => { if (a < max) change(1); });
    host.append(h("div", { class: "counter" }, minus, val, plus));
    render();
    onChange(a);
    return {
      disable() {
        minus.disabled = true;
        plus.disabled = true;
      },
    };
  }

  // ---------- Tanlov tugmalari ----------
  function choice(options) {
    clearControl();
    return settle((done) => {
      const row = h("div", { class: "choice-row" });
      options.forEach((o) => {
        row.append(button(o.label, () => { clearControl(); done(o.value); }, o.secondary ? "secondary" : ""));
      });
      control().append(row);
    });
  }

  // ---------- Progress ----------
  function setProgress(total, filled) {
    const p = $("progress");
    p.innerHTML = "";
    for (let k = 0; k < total; k++) p.append(h("span", { class: "dot" + (k < filled ? " on" : "") }));
  }

  const hideProgress = () => { $("progress").innerHTML = ""; };

  // ---------- Qo'llanma zonasi (4-zona: 2- va 3-o'yin) ----------
  // Zonani tozalab ochadi; bosh ekranga qaytganda (newRun) o'zi yopiladi. Zona yo'q sahifada — null.
  function openGuide() {
    const zone = $("zone-guide");
    if (!zone) return null;
    zone.innerHTML = "";
    $("play").classList.add("has-guide");
    onCleanup(closeGuide);
    return zone;
  }

  function closeGuide() {
    const zone = $("zone-guide");
    if (zone) zone.innerHTML = "";
    $("play").classList.remove("has-guide");
  }

  // Barmoq bilan boshqariladigan ekran: klaviatura bo'lmasligi mumkin (QOIDALAR §3)
  const touchOnly = () => !!(root.matchMedia && root.matchMedia("(hover: none) and (pointer: coarse)").matches);

  // Klaviatura kerak bo'lgan o'yin boshida: telefon bo'lsa, bolani ogohlantiramiz
  async function keyboardCheck(matn) {
    if (!touchOnly()) return true;
    bubble("elder", matn || "Bu oʻyinga klaviatura kerak. Uni kompyuterda och.");
    const answer = await choice([
      { label: "Klaviaturam bor", value: "go" },
      { label: "Barcha oʻyinlar", value: "back", secondary: true },
    ]);
    if (answer === "back") {
      root.location.href = "../../index.html";
      await new Promise(() => {});
    }
    return true;
  }

  // ---------- Yulduzlar va bosqich/final kartalari ----------
  // ★★☆ — n ta yoniq, qolgani xira
  function stars(n, cls) {
    const el = h("span", { class: cls || "sc-stars", "aria-label": `${n} yulduz` });
    for (let k = 0; k < 3; k++) el.append(h("span", { class: k < n ? "" : "off", text: "★" }));
    return el;
  }

  // Bosqich tugadi kartasi — ish zonasida turadi, o'yinning stageDone pufagi uning ustida gapiradi.
  // data-keep: stageDone ichidagi clearWork() uni o'chirmaydi; app.js stageDone tugagach clearKeep() qiladi.
  function stageCard({ num, total, title, stars: n, hard }) {
    clearWork();
    const card = h("div", { class: "stage-card", "data-keep": true },
      h("div", { class: "sc-num", text: String(num) }),
      h("div", { class: "sc-title", text: title }),
      stars(n),
      h("div", { class: "sc-sub", text: hard ? "Qiyin rejim 🔥 — bosqich oʻtildi!" : `${total} bosqichdan ${num} tasi tugadi` }));
    work().append(card);
    return card;
  }

  // O'yin tugadi kartasi — congrats() dan oldin chiziladi, o'yin o'z xulosasini uning ostiga qo'shadi
  function finalCard({ title, stageTitles, stars: list, hard }) {
    clearWork();
    const jami = list.reduce((a, b) => a + (b || 0), 0);
    const ul = h("ul", { class: "sc-list" });
    stageTitles.forEach((t, k) => ul.append(h("li", {}, h("span", { text: t }), stars(list[k] || 0, "li-stars"))));
    const card = h("div", { class: "stage-card final", "data-keep": true },
      h("div", { class: "sc-num", text: "🏆" }),
      h("div", { class: "sc-title", text: title }),
      h("div", { class: "sc-sub", text: hard ? "Qiyin rejim 🔥 toʻliq oʻtildi!" : `${jami} / ${stageTitles.length * 3} yulduz` }),
      ul);
    work().append(card);
    return card;
  }

  QK.ui = {
    newRun, onCleanup, settle, sleep, h, button,
    work, control, clearWork, clearKeep, clearControl, setCompact,
    celebrate, stars, stageCard, finalCard,
    pose, resetPoses, paper, raisePaper,
    bubble, say, tile, wordChip, lettersLine, toast, sup,
    buildWords, askNumber, counter, choice, setProgress, hideProgress,
    openGuide, closeGuide, touchOnly, keyboardCheck,
  };
})(window);

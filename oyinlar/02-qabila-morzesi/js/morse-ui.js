// Morze ekran qismlari: nuqta/chiziq shakllari, qo'llanma, xabar kataklari, Morze klaviaturasi, "Tinglash".
(function (root) {
  "use strict";

  const QK = root.QK;
  const { morse, ui, sound } = QK;
  const $ = (id) => document.getElementById(id);

  // "." "-" → chizilgan shakllar (nuqta — doira, chiziq — uzun to'rtburchak)
  function codeEl(code, big) {
    const label = [...code].map((s) => (s === "." ? "nuqta" : "chiziq")).join(" ");
    const el = ui.h("span", { class: "code" + (big ? " big" : ""), role: "img", "aria-label": label });
    for (const s of code) el.append(ui.h("span", { class: "sym " + (s === "." ? "dot" : "dash") }));
    return el;
  }

  // Namuna: har bir harf ustida uning kodi. Matndagi bo'sh joy — so'zlar orasidagi "/".
  // groups — harf kodlari elementlari ("Tinglash" ularni yondiradi).
  function wordCodes(text) {
    const el = ui.h("div", { class: "example" });
    const groups = [];
    for (const ch of text) {
      if (ch === " ") {
        el.append(ui.h("span", { class: "example-slash", text: "/" }));
        continue;
      }
      const code = codeEl(morse.CODES[ch], true);
      groups.push(code);
      el.append(ui.h("div", { class: "example-letter" }, code, ui.h("b", { text: ch })));
    }
    return { el, groups };
  }

  // ---------- Qo'llanma ----------
  function clearGuide() {
    $("zone-guide").innerHTML = "";
    $("play").classList.remove("has-guide");
  }

  // letters — ko'rsatiladigan harflar; onPick bo'lsa kataklar tugma (1-bosqich klaviaturasi);
  // fresh — yangi ochilgan harflar (qisqa miltillaydi)
  function guide(letters, opts) {
    opts = opts || {};
    const zone = $("zone-guide");
    zone.innerHTML = "";
    $("play").classList.add("has-guide");
    ui.onCleanup(clearGuide); // bosh ekranga qaytganda qo'llanma yo'qoladi
    const grid = ui.h("div", { class: "guide" });
    const cells = {};
    for (const l of letters) {
      const fresh = !!opts.fresh && opts.fresh.includes(l);
      const cell = ui.h(opts.onPick ? "button" : "div", {
        class: "guide-cell" + (fresh ? " new" : ""),
        type: opts.onPick ? "button" : null,
        "aria-label": opts.onPick ? `${l} harfi` : null,
        onClick: opts.onPick ? () => { sound.play("tap"); opts.onPick(l); } : null,
      }, ui.h("span", { text: l }), codeEl(morse.CODES[l]));
      cells[l] = cell;
      grid.append(cell);
    }
    zone.append(grid);
    return {
      // Maslahat: berilgan harflar kataklari to'q sariq ramka bilan belgilanadi
      highlight(set) {
        for (const [l, c] of Object.entries(cells)) c.classList.toggle("hl", set.has(l));
      },
    };
  }

  // ---------- O'qish: xabar guruhlari va kataklar ----------
  // Harf navbatdagi katakka tushadi; to'lgan katakni bosish — uni navbatdagi qiladi (almashtirish uchun).
  function messageSlots(host, word) {
    const codes = morse.encodeWord(word);
    const letters = codes.map(() => "");
    const groups = [];
    const slots = [];
    let current = 0;
    const wrap = ui.h("div", { class: "message" });
    codes.forEach((code, k) => {
      const codeNode = codeEl(code, true);
      const slot = ui.h("button", {
        class: "rslot",
        type: "button",
        "aria-label": `${k + 1}-harf`,
        onClick: () => { current = k; render(); },
      });
      groups.push(codeNode);
      slots.push(slot);
      wrap.append(ui.h("div", { class: "group" }, codeNode, slot));
    });
    host.append(wrap);

    function render() {
      slots.forEach((s, k) => {
        s.textContent = letters[k];
        s.classList.toggle("current", k === current);
      });
    }
    render();

    return {
      codes,
      groups,
      // Navbatdagi katakka harf qo'yish; navbat keyingi bo'sh katakka o'tadi. Katak tanlanmagan bo'lsa — false
      fill(letter) {
        if (current < 0) return false;
        letters[current] = letter;
        slots[current].classList.remove("wrong");
        const after = letters.findIndex((l, k) => k > current && !l);
        current = after !== -1 ? after : letters.findIndex((l) => !l);
        render();
        return true;
      },
      letters: () => letters.slice(),
      isFull: () => letters.every(Boolean),
      // Xato: noto'g'ri kataklar bo'shatiladi, ↻ bilan belgilanadi va silkinadi
      markWrong(indices) {
        for (const k of indices) {
          letters[k] = "";
          slots[k].classList.add("wrong");
          slots[k].classList.remove("shake");
          void slots[k].offsetWidth; // animatsiyani qaytadan boshlash
          slots[k].classList.add("shake");
        }
        current = indices.length ? indices[0] : -1;
        render();
      },
      // To'g'ri so'zni kataklarda ko'rsatish (2-xato yoki baholanmaydigan xabar)
      showSolution() {
        [...word].forEach((ch, k) => {
          letters[k] = ch;
          slots[k].classList.remove("wrong");
          slots[k].classList.add("solution");
        });
        current = -1;
        render();
      },
      lock() {
        slots.forEach((s) => { s.disabled = true; });
      },
    };
  }

  // ---------- "Tinglash" ----------
  let timers = [];

  function stopPlaying() {
    timers.forEach(clearTimeout);
    timers = [];
    sound.stopBeeps();
    document.querySelectorAll(".code.playing").forEach((el) => el.classList.remove("playing"));
  }

  // Xabarni signal bilan chalish; chalinayotgan harf kodi yonadi.
  // onLight(on) — har bir signal boshida (true) va oxirida (false): mayoq chirog'i uchun.
  // Ovoz o'chiq bo'lsa ham kodlar yonadi.
  function play(codes, groupEls, onLight) {
    stopPlaying();
    const plan = morse.beepPlan(codes);
    sound.beeps(plan);
    let t = 0;
    plan.forEach((b) => {
      const el = groupEls[b.group];
      timers.push(setTimeout(() => {
        el.classList.add("playing");
        if (onLight) onLight(true);
      }, t));
      timers.push(setTimeout(() => { if (onLight) onLight(false); }, t + b.on));
      t += b.on + b.off;
      timers.push(setTimeout(() => el.classList.remove("playing"), t));
    });
    ui.onCleanup(stopPlaying); // bosh ekranga qaytganda to'xtaydi
  }

  // ---------- Yozish: terilganini ko'rsatish + Morze klaviaturasi ----------
  // host — terilgan guruhlar ko'rinadigan joy; klaviatura boshqaruv zonasiga qo'yiladi.
  // onSend(symbols) — "Yuborish" bosilganda (hech narsa terilmagan bo'lsa chaqirilmaydi).
  function morseInput(host, onSend) {
    let symbols = "";
    let marks = { wrong: [], read: "" };
    const view = ui.h("div", { class: "typed", "aria-live": "polite" });
    host.append(view);

    function render() {
      view.innerHTML = "";
      morse.parseTyped(symbols).forEach((g, k) => {
        view.append(ui.h("div", { class: "typed-group" + (marks.wrong.includes(k) ? " wrong" : "") },
          codeEl(g, true),
          ui.h("div", { class: "typed-letter", text: marks.read[k] || "" })));
      });
    }

    function change(next) {
      symbols = next;
      marks = { wrong: [], read: "" }; // tahrir qilinsa belgilar olib tashlanadi
      render();
    }

    const keys = ui.h("div", { class: "mkeys" });
    const key = (label, aria, cls, fn) => keys.append(ui.h("button", {
      class: "key " + cls,
      type: "button",
      text: label,
      "aria-label": aria,
      onClick: () => { sound.play("tap"); fn(); },
    }));
    key("·", "Nuqta", "dot-key", () => change(morse.addSymbol(symbols, ".")));
    key("—", "Chiziq", "dash-key", () => change(morse.addSymbol(symbols, "-")));
    key("harf oraligʻi", "Harf oraligʻi", "gap", () => change(morse.addSymbol(symbols, " ")));
    key("⌫", "Oʻchirish", "del", () => change(morse.removeSymbol(symbols)));
    key("Yuborish", "Yuborish", "send", () => {
      if (morse.parseTyped(symbols).length) onSend(symbols);
    });
    ui.clearControl();
    ui.control().append(keys);
    render();

    return {
      // Yuborilgandan keyin: noto'g'ri guruhlar va Shogird o'qigan harflar
      mark(wrong, read) {
        marks = { wrong, read };
        render();
      },
      symbols: () => symbols,
    };
  }

  QK.morseUi = { codeEl, wordCodes, guide, clearGuide, messageSlots, play, stopPlaying, morseInput };
})(window);

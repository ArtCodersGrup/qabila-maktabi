// Oʻn barmoq — yozish sahnasi: qatorni haqiqiy klaviaturadan yozdirish (typeLine), klaviatura tekshiruvi,
// ogohlantirishlar va Enter bilan "Davom". 23-o'yin va tez yozish poygasi (oyinlar/poyga/) ishlatadi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, typing: T, typingUi } = QK;

  function box(compact) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = ui.h("div", { class: "tbox" });
    ui.work().append(el);
    return el;
  }

  // Maslahat/natija qo'shish: ish maydoni sig'masa, yangi qator ko'rinadigan joyga suriladi
  function add(host, ...nodes) {
    host.append(...nodes);
    const last = nodes[nodes.length - 1];
    if (last && last.scrollIntoView) last.scrollIntoView({ block: "nearest" });
  }

  const waitButton = (label, cls) => ui.settle((done) => {
    ui.control().append(ui.button(label, () => { ui.clearControl(); done(); }, cls || "big"));
  });

  // Barmoq bilan boshqariladigan ekran (telefon, planshet) — klaviatura bo'lmasligi mumkin
  const touchOnly = () => !!(root.matchMedia && root.matchMedia("(hover: none) and (pointer: coarse)").matches);

  // ---------- Enter — "Davom" (yoki boshqaruvdagi yagona tugma) ----------
  let typingNow = false;
  root.document.addEventListener("keydown", (e) => {
    if (typingNow || e.key !== "Enter" || e.repeat) return;
    const buttons = ui.control().querySelectorAll(".btn");
    if (buttons.length !== 1) return;
    e.preventDefault();
    buttons[0].click();
  });

  // Ogohlantirish (rus tili, Caps Lock) — tez-tez takrorlanmasin
  let lastWarn = 0;
  function warn(kind) {
    const now = Date.now();
    if (now - lastWarn < 2600) return;
    lastWarn = now;
    ui.toast(kind === "cyrillic"
      ? "Klaviatura rus tilida. Tilni EN (inglizcha) ga oʻtkaz."
      : "Caps Lock yoqilgan — uni oʻchir.");
  }

  // ---------- Bitta qator yozish ----------
  // stage — o'rganilgan tugmalar (klaviaturada qolganlari xira); side — poygada o'yinchi;
  // start — vaqt boshi (poyga); ghost — birinchi o'yinchining vaqtlari (soya); hands — qo'llarni ko'rsatish.
  // Natija: { stats, session }
  function typeLine({ text, stage, side, start, ghost, ghostSide, hands = true }) {
    const el = box(true);
    const tr = typingUi.track(el, { side });
    const ln = typingUi.line(el, text);
    const kb = typingUi.keyboard(el, { learned: T.allowed(stage) });
    const hd = hands ? typingUi.hands(el) : null;
    const s = T.session(text, start);
    QK.current = s; // tekshirish uchun
    const len = s.chars.length;

    const showNext = () => {
      const fingers = kb.show(s.next());
      if (hd) hd.show(fingers);
    };
    ln.at(0);
    showNext();
    if (root.document.activeElement && root.document.activeElement.blur) root.document.activeElement.blur();

    return ui.settle((done) => {
      let frame = null;
      function stop() {
        typingNow = false;
        root.document.removeEventListener("keydown", onKey, true);
        if (frame) root.cancelAnimationFrame(frame);
        frame = null;
      }

      function onKey(e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return; // brauzer tugmalari o'zida qoladi
        const key = T.keyFrom(e);
        if (key == null) return; // Shift, Caps Lock, Enter...
        e.preventDefault(); // Probel sahifani aylantirmasin, ' va / Firefox qidiruvini ochmasin
        if (e.repeat) return;
        const expected = s.next();
        const w = T.warning(expected, key, e.getModifierState && e.getModifierState("CapsLock"));
        if (w) { warn(w); return; }
        const r = s.press(key, root.performance.now());
        if (r === "skip") return;
        kb.press(key, r !== "wrong");
        if (r === "wrong") {
          ln.wrong();
          sound.play("tak");
          return;
        }
        ln.at(s.pos);
        tr.set(s.pos / len);
        if (r === "done") {
          stop();
          kb.show(null);
          if (hd) hd.show([]);
          done({ stats: T.stats(s), session: s });
          return;
        }
        showNext();
      }

      typingNow = true;
      root.document.addEventListener("keydown", onKey, true);
      ui.onCleanup(stop);

      if (ghost) {
        const tick = () => {
          tr.ghost(T.ghostAt(ghost, root.performance.now() - start) / len, ghostSide);
          frame = root.requestAnimationFrame(tick);
        };
        tick();
      }
    });
  }

  // Telefonda — ogohlantirish; keyin istalgan lotin harfi bosilguncha kutadi (klaviatura bormi, tili to'g'rimi)
  async function keyboardCheck({ askKey = true } = {}) {
    if (touchOnly()) {
      ui.bubble("elder", "Bu oʻyin uchun klaviatura kerak. Uni kompyuterda och.");
      const v = await ui.choice([
        { label: "Klaviaturam bor", value: "go" },
        { label: "Barcha oʻyinlar", value: "back", secondary: true },
      ]);
      if (v === "back") {
        root.location.href = "../../index.html";
        await new Promise(() => {}); // sahifa almashguncha kutamiz
      }
    }
    if (!askKey) return;
    ui.bubble("elder", "Klaviaturadagi istalgan harfni bos.");
    await ui.settle((done) => {
      function onKey(e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const k = T.keyFrom(e);
        if (!k) return;
        if (T.isCyrillic(k)) { warn("cyrillic"); return; }
        if (!/^[a-z]$/i.test(k)) return;
        e.preventDefault();
        cleanup();
        done();
      }
      const cleanup = () => root.document.removeEventListener("keydown", onKey, true);
      root.document.addEventListener("keydown", onKey, true);
      ui.onCleanup(cleanup);
    });
    sound.play("correct");
  }

  QK.typingPlay = { box, add, waitButton, touchOnly, warn, keyboardCheck, typeLine };
})(window);

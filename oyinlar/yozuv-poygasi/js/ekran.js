// Yozuv poygasining ekran qismlari: tog' sahnasi (tog' o'yinidan), yozuv maydoni (23-o'yindan),
// rang va matn turini tanlash, tartib ro'yxati va natija jadvali.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, art, tog: T, togUi, typing: TY, typingUi, typingPlay, yozuvPoyga: P } = QK;
  const h = ui.h;
  const SITE_HOME = "../../index.html";

  function box(full, cls) {
    ui.setCompact(false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    root.document.getElementById("play").classList.toggle("tog-full", !!full);
    const el = h("div", { class: "ybox" + (cls ? " " + cls : "") });
    ui.work().append(el);
    return el;
  }

  function buttons(list) {
    ui.clearControl();
    const row = h("div", { class: "choice-row" });
    list.filter(Boolean).forEach((b) => {
      const el = ui.button(b.label, b.onClick, b.secondary ? "secondary" : "");
      if (b.disabled) el.disabled = true;
      row.append(el);
    });
    ui.control().append(row);
  }

  function xato(matn, qayt) {
    const el = box(false);
    el.append(h("h1", { class: "game-title", text: "Yozuv poygasi" }), h("p", { class: "tog-note", text: matn }));
    sound.play("retry");
    buttons([{ label: "Orqaga", onClick: qayt, secondary: true }]);
  }

  // Qurilmadagi sayt nusxasi boshqalarnikidan eski: matn boshqacha bo'lib, poyga jimgina buziladi.
  // Shuning uchun o'ynashga qo'ymaymiz — yangilashni so'raymiz.
  function eskiNusxa(qayt) {
    const el = box(false);
    el.append(
      h("h1", { class: "game-title", text: "Saytning eski nusxasi" }),
      h("p", { class: "tog-note", text: "Bu qurilmada saytning eski nusxasi ochilgan — matn boshqalarnikidan farq qiladi." }),
      h("p", { class: "tog-note", text: "«Yangilash» ni bos, keyin xonaga qaytadan kir." }));
    sound.play("retry");
    buttons([
      { label: "Yangilash", onClick: () => { try { root.location.reload(); } catch (e) { /* baribir */ } } },
      { label: "Orqaga", onClick: qayt, secondary: true },
    ]);
  }

  const qahramonById = (id) => togUi.qahramonById(id);

  // Matn turi haqida qisqa izoh (tanlash kartasida)
  const IZOH = { home: "asosiy qator soʻzlari", words: "koʻp ishlatiladigan soʻzlar", proverb: "bitta maqol" };

  // ---------- Matn turini tanlash (o'qituvchi) ----------
  function turTanlash({ onPick, orqaga }) {
    const el = box(false);
    el.append(h("h1", { class: "game-title", text: "Qaysi matnni yozamiz?" }));
    const list = h("div", { class: "toglar" });
    P.TURLAR.forEach((tur) => {
      const t = T.togById(tur.tog);
      list.append(h("button", {
        class: "tog-karta", type: "button",
        onClick: () => { sound.play("tap"); onPick(tur.id); },
      },
      h("span", { class: "tog-nom", text: tur.nom }),
      h("span", { class: "tog-metr", text: `${tur.pogona} pogʻona` }),
      h("span", { class: "tog-pogona", text: `${IZOH[tur.id]} · ${t.nom}` })));
    });
    el.append(list);
    buttons([{ label: "Orqaga", onClick: orqaga, secondary: true }]);
    return el;
  }

  // ---------- Rang tanlash (bola) ----------
  function rangTanlash({ band, izoh, onPick, orqaga }) {
    const el = box(false);
    el.append(
      h("h1", { class: "game-title", text: "Qaysi rang sen boʻlasan?" }),
      izoh ? h("p", { class: "tog-note", text: izoh }) : null);
    const grid = h("div", { class: "qahramonlar" });
    T.QAHRAMONLAR.forEach((q) => {
      const olingan = (band || []).includes(q.id);
      grid.append(h("button", {
        class: "qahramon" + (olingan ? " band" : ""), type: "button", disabled: olingan, "aria-label": q.nom,
        onClick: () => { sound.play("tap"); onPick(q.id); },
      },
      h("span", { class: "qahramon-rasm", html: art.odam(q.rang) }),
      h("span", { class: "qahramon-nom", text: q.nom })));
    });
    el.append(grid);
    if (orqaga) buttons([{ label: "Orqaga", onClick: orqaga, secondary: true }]);
    return el;
  }

  // ---------- Tartib ro'yxati ----------
  // Qatorlar qayta yaratilmaydi: mavjud element o'rnini almashtiradi (ekran pirpiramasin).
  function royxat(host) {
    const el = h("div", { class: "reyting" });
    host.append(el);
    const qatorlar = new Map();
    return {
      el,
      render(s, meId) {
        P.tartib(s).forEach((p) => {
          let q = qatorlar.get(p.id);
          if (!q) {
            const qah = qahramonById(p.qahramon);
            const holat = h("span", { class: "reyting-holat" });
            q = {
              el: h("div", { class: "reyting-qator" },
                h("span", { class: "reyting-rasm", html: art.nishon(qah.rang) }),
                h("span", { class: "reyting-nom", text: qah.nom }),
                holat),
              holat,
              matn: "",
            };
            qatorlar.set(p.id, q);
          }
          q.el.classList.toggle("men", p.id === meId);
          q.el.classList.toggle("keldi", p.orin > 0);
          const matn = p.orin ? `${p.orin}-oʻrin ✓` : `${Math.round((p.bel * 100) / (s.jami || 1))}%`;
          if (matn !== q.matn) {
            q.matn = matn;
            q.holat.textContent = matn;
          }
          el.append(q.el); // tartib bo'yicha qayta joylashadi
        });
      },
    };
  }

  // ---------- Tog' sahnasi ----------
  const sahna = (host, togId) => togUi.scene(host, togId);

  // ---------- Yozuv maydoni ----------
  // onStep(bel) — yozilgan belgilar soni o'zgarganda; onDone({bel, ms, cpm, aniq}) — matn tugaganda.
  function yozuv(host, matn, { onStep, onDone }) {
    const wrap = h("div", { class: "race-yoz" });
    host.append(wrap);
    const ln = typingUi.line(wrap, matn);
    const kb = typingUi.keyboard(wrap, { learned: TY.allowed(3) });
    const s = TY.session(matn);
    QK.current = s; // tekshirish uchun
    ln.at(0);
    kb.show(s.next());
    // Uzun matn bir necha qatorga sig'adi — yozilayotgan joy doim ko'rinib tursin
    const korsat = (el2) => { if (el2 && el2.scrollIntoView) el2.scrollIntoView({ block: "nearest" }); };
    if (root.document.activeElement && root.document.activeElement.blur) root.document.activeElement.blur();

    function onKey(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return; // brauzer tugmalari o'zida qoladi
      const key = TY.keyFrom(e);
      if (key == null) return; // Shift, Caps Lock, Enter...
      e.preventDefault(); // Probel sahifani aylantirmasin
      if (e.repeat) return;
      const kutilgan = s.next();
      const ogoh = TY.warning(kutilgan, key, e.getModifierState && e.getModifierState("CapsLock"));
      if (ogoh) { typingPlay.warn(ogoh); return; }
      const r = s.press(key, root.performance.now());
      if (r === "skip") return;
      kb.press(key, r !== "wrong");
      if (r === "wrong") { // xato belgini o'tkazmaydi — jarima yo'q, faqat vaqt ketadi
        ln.wrong();
        sound.play("tak");
        return;
      }
      korsat(ln.at(s.pos));
      if (r === "done") {
        stop();
        kb.show(null);
        const st = TY.stats(s);
        sound.play("win");
        onDone({ bel: s.pos, ms: st.ms, cpm: st.cpm, aniq: st.accuracy });
        return;
      }
      kb.show(s.next());
      onStep(s.pos);
    }

    function stop() {
      root.document.removeEventListener("keydown", onKey, true);
    }
    root.document.addEventListener("keydown", onKey, true);
    ui.onCleanup(stop);
    return { el: wrap, stop, session: s };
  }

  // ---------- Natija ----------
  function natija(host, s, meId) {
    const rows = P.natija(s);
    const body = h("tbody");
    rows.forEach((r) => {
      const q = qahramonById(r.qahramon);
      body.append(h("tr", { class: (r.id === meId ? "men" : "") + (r.orin === 1 ? " win" : "") },
        h("td", { text: r.orin ? `${r.orin}.` : "—" }),
        h("td", null, h("span", { class: "reyting-rasm", html: art.nishon(q.rang) }), h("span", { text: " " + q.nom })),
        h("td", { text: r.tugadi ? `${typingUi.comma(Math.round(r.ms / 100) / 10)} s` : `${Math.round((r.bel * 100) / (s.jami || 1))}%` }),
        h("td", { text: r.tugadi ? String(r.cpm) : "—" }),
        h("td", { text: r.tugadi ? `${r.aniq}%` : "—" })));
    });
    const t = h("table", { class: "natija-jadval" },
      h("thead", null, h("tr", null,
        h("th", { text: "" }), h("th", { text: "" }), h("th", { text: "Vaqt" }),
        h("th", { text: "Belgi/daq" }), h("th", { text: "Aniqlik" }))),
      body);
    host.append(t);
    return t;
  }

  QK.yozuvEkran = { SITE_HOME, box, buttons, xato, eskiNusxa, turTanlash, rangTanlash, royxat, sahna, yozuv, natija, qahramonById };
})(window);

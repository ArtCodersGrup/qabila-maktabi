// Tog' o'yinining umumiy ekranlari: qahramon tanlash, tog' tanlash va o'yin maydoni.
// Mashq (robotlar bilan) ham, onlayn xona ham shu ekranlardan foydalanadi — farqi faqat
// holat qayerdan kelishida: mashqda o'zida hisoblanadi, onlaynda boshlovchidan keladi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, art, tog: T, togUi, savolUi, savollar } = QK;
  const h = ui.h;
  const SITE_HOME = "../../index.html";

  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  function box(compact, cls) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    document.getElementById("play").classList.toggle("tog-full", cls === "tog-oyin");
    const el = h("div", { class: "tbox" + (cls ? " " + cls : "") });
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

  // Savol qiyinligi balandlikka qarab (DIZAYN 2.2). Ketma-ket bir xil savol bermaymiz.
  function nextQ(level, prev) {
    for (let k = 0; k < 60; k++) {
      const topic = pick(savollar.TOPICS).id;
      const kinds = savollar.kindsOf(topic, level);
      if (!kinds.length) continue;
      const q = savollar.make(pick(kinds), level, Math.random, () => true);
      if (q && (!prev || q.key !== prev.key)) return q;
    }
    return savollar.make("sozlar", 1, Math.random, () => true);
  }

  // ---------- Qahramon tanlash ----------
  // band — boshqa bolalar olib bo'lgan qahramonlar (onlaynda: bitta qahramon bitta bolaga)
  function qahramonlar({ sarlavha, izoh, band, orqaga, onPick }) {
    const el = box(false);
    el.append(
      orqaga ? h("a", { class: "back-link", href: SITE_HOME, text: "◀︎ Barcha oʻyinlar" }) : null,
      h("h1", { class: "game-title", text: sarlavha || "Togʻga chiqish" }),
      izoh ? h("p", { class: "tog-note", text: izoh }) : null);
    const grid = h("div", { class: "qahramonlar" });
    T.QAHRAMONLAR.forEach((q) => {
      const olingan = (band || []).includes(q.id);
      const btn = h("button", {
        class: "qahramon" + (olingan ? " band" : ""), type: "button", "aria-label": q.nom,
        onClick: () => { if (!olingan) { sound.play("tap"); onPick(q.id); } },
      }, h("span", { class: "qahramon-rasm", html: art.hayvon(q.id, olingan ? "#C9C4BA" : q.rang) }),
      h("span", { class: "qahramon-nom", text: q.nom }));
      btn.disabled = olingan;
      grid.append(btn);
    });
    el.append(grid);
    return el;
  }

  // ---------- Tog' tanlash ----------
  function toglar({ sarlavha, onPick }) {
    const el = box(false);
    el.append(h("h1", { class: "game-title", text: sarlavha || "Qaysi togʻga chiqamiz?" }));
    const list = h("div", { class: "toglar" });
    T.TOGLAR.forEach((t) => {
      list.append(h("button", {
        class: "tog-karta", type: "button",
        onClick: () => { sound.play("tap"); onPick(t.id); },
      },
      h("span", { class: "tog-nom", text: t.nom }),
      h("span", { class: "tog-metr", text: `${t.metr.toLocaleString("uz-UZ").replace(/,/g, " ")} m` }),
      h("span", { class: "tog-pogona", text: `${t.pogona} pogʻona · ${t.daqiqa} daqiqa` })));
    });
    el.append(list);
    return el;
  }

  // ---------- O'yin maydoni ----------
  // holat() — hozirgi holat (mashqda o'zimiznikidan, onlaynda boshlovchi paketidan).
  // javob(ok) — javobni qayerga berish. meId yo'q bo'lsa — kuzatuvchi ekrani (o'qituvchi doskasi).
  function oyin(el, { togId, meId, holat, javob, kuzatuvchi }) {
    const t = T.togById(togId);
    const soat = h("div", { class: "tog-soat" });
    const maydon = h("div", { class: "tog-maydon" });
    el.append(soat, maydon);
    const sahna = togUi.scene(maydon, togId);
    const royxat = togUi.reyting(maydon);
    const pastki = h("div", { class: "tog-pastki" });
    el.append(pastki);

    let joriy = null; // joriy savol
    let javobi = ""; // joriy savolning to'g'ri javobi (pauzada ko'rsatiladi)
    let kutilgan = null; // javob yuborildi — boshlovchi tasdig'i kutilmoqda
    let kutganVaqt = 0;
    let pauzaOyna = null;
    let rejim = "";
    const hisob = (me) => me.togri + me.xato;

    function savolBer(me) {
      rejim = "savol";
      pastki.innerHTML = "";
      pauzaOyna = null;
      joriy = nextQ(T.daraja(t, me.pogona), joriy);
      QK.probe = Object.assign(QK.probe || {}, { savol: joriy });
      togUi.savol(pastki, joriy);
      savolUi.answerPad(joriy, (value) => {
        const ok = savollar.check(joriy, value);
        javobi = joriy.answer;
        kutilgan = hisob(me);
        kutganVaqt = Date.now();
        sound.play(ok ? "correct" : "retry");
        if (ok) ui.pose("apprentice", "happy", 700);
        pastki.innerHTML = "";
        ui.clearControl();
        pastki.append(h("div", { class: "tog-kutish", text: ok ? "✓ Javob yuborildi…" : "↻ Javob yuborildi…" }));
        rejim = "kutish";
        javob(ok);
      }, () => rejim === "savol");
    }

    function pauzaKorsat(me) {
      rejim = "pauza";
      pastki.innerHTML = "";
      ui.clearControl();
      pauzaOyna = togUi.pauza(pastki, { javob: javobi, tugaydi: me.pauzaGacha });
    }

    function tomoshabin() {
      rejim = "tomoshabin";
      pastki.innerHTML = "";
      ui.clearControl();
      pastki.append(h("div", { class: "tomoshabin", text: "Qolib ketding. Endi tomoshabinsan — togʻni kuzatib tur." }));
      sound.play("dum");
    }

    // Har 250 ms da chaqiriladi
    function render(now) {
      const s = holat();
      if (!s) return;
      const qolgan = Math.max(0, Math.ceil((s.tugaydi - now) / 1000));
      soat.textContent = `${t.nom} · ⏱ ${Math.floor(qolgan / 60)}:${String(qolgan % 60).padStart(2, "0")}`;
      sahna.render(s, meId || null);
      royxat.render(s, meId || null);
      if (kuzatuvchi || s.tugadi) return;
      const me = s.oyinchilar[meId];
      if (!me) return;
      if (kutilgan != null) {
        // Boshlovchi javobni hisobga olganini kutamiz (mashqda — bir zumda)
        if (hisob(me) !== kutilgan) { kutilgan = null; } else if (now - kutganVaqt < 4000) { return; } else { kutilgan = null; rejim = ""; }
      }
      if (me.chiqdi) { if (rejim !== "tomoshabin") tomoshabin(); return; }
      if (me.pauzaGacha > now) {
        if (rejim !== "pauza") pauzaKorsat(me);
        else pauzaOyna.tick(now);
        return;
      }
      if (rejim !== "savol") savolBer(me);
    }

    return { render, pastki, soat, el };
  }

  // ---------- Natija ----------
  function natija(state, meId, tugmalar) {
    const el = box(false);
    togUi.natija(el, state, meId);
    buttons(tugmalar);
    return el;
  }

  QK.togEkran = { SITE_HOME, box, buttons, nextQ, qahramonlar, toglar, oyin, natija };
})(window);

// Tog' o'yinining umumiy ekranlari: qahramon tanlash, tog' tanlash va o'yin maydoni.
// Mashq (robotlar bilan) ham, onlayn xona ham shu ekranlardan foydalanadi — farqi faqat
// holat qayerdan kelishida: mashqda o'zida hisoblanadi, onlaynda boshlovchidan keladi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, sound, art, tog: T, togUi, savolUi, savollar } = QK;
  const h = ui.h;
  const SITE_HOME = "../../index.html";
  const M = QK.mavzular;

  // Har javob mavzu bo'yicha sanaladi (mashqda ham, onlayn xonada ham) — kirgan bo'lsa akkauntga ketadi
  function statYoz(mavzu, ok) {
    if (!M || !mavzu) return;
    try {
      const bor = JSON.parse(root.localStorage.getItem(M.STAT) || "null");
      root.localStorage.setItem(M.STAT, JSON.stringify(M.qosh(bor, mavzu, ok)));
      if (QK.storage && QK.storage.navbatga) QK.storage.navbatga(M.STAT);
    } catch (e) { /* saqlab bo'lmadi — o'yin baribir ishlaydi */ }
  }

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
  // mavzular — tanlangan mavzular roʻyxati (boʻsh boʻlsa — hammasi).
  // rng berilsa (o'qituvchi "savollar hammaga bir xil" ni tanlagan) — savol shu urug'dan aniq hosil bo'ladi;
  // shunda oldingi savol bilan solishtirilmaydi: oldingi savol bolada har xil bo'lishi mumkin, natija esa bir xil bo'lishi kerak
  // tarix — shu o'yinda berilgan savollar kaliti (Set): ular qayta chiqmaydi, oldingi savol turi ketma-ket takrorlanmaydi.
  // Urug'li rejimda (hammaga bir xil savol) tarix ishlatilmaydi — aks holda bolalarda savollar har xil bo'lib qoladi.
  function nextQ(level, prev, mavzular, rng, tarix) {
    const r = rng || Math.random;
    const tanla = (list) => list[Math.floor(r() * list.length)];
    const royxat = (mavzular && mavzular.length ? savollar.TOPICS.filter((t) => mavzular.includes(t.id)) : savollar.TOPICS);
    const ishlatilgan = !rng && tarix ? tarix : null;
    for (let k = 0; k < 120; k++) {
      const topic = tanla(royxat).id;
      let kinds = savollar.kindsOf(topic, level);
      if (!kinds.length) continue;
      if (prev && kinds.length > 1 && k < 60) kinds = kinds.filter((x) => x !== prev.kind); // tur almashsin
      const kind = tanla(kinds);
      const fresh = ishlatilgan ? (id) => !ishlatilgan.has(`${kind}:${level}:${id}`) : () => true;
      const q = savollar.make(kind, level, r, fresh);
      if (!q) continue;
      if (ishlatilgan && ishlatilgan.has(q.key)) continue;
      if (rng || !prev || q.key !== prev.key) return q;
    }
    // Hamma savol ishlatilgan bo'lsa — tarix tozalanadi (uzoq o'yinda ham savol tugamaydi)
    if (ishlatilgan && ishlatilgan.size) {
      ishlatilgan.clear();
      return nextQ(level, prev, mavzular, rng, tarix);
    }
    // Tanlangan mavzuda shu darajada savol topilmadi — boshqa darajadan beramiz
    for (const daraja of [1, 2, 3]) {
      for (const t of royxat) {
        const kinds = savollar.kindsOf(t.id, daraja);
        if (kinds.length) {
          const q = savollar.make(tanla(kinds), daraja, r, () => true);
          if (q) return q;
        }
      }
    }
    return savollar.make("sozlar", 1, r, () => true);
  }

  // ---------- Mavzu tanlash ----------
  // Qiyinlik: 0 — balandlikka qarab (pastda oson, tepada qiyin), 1–3 — butun o'yin bitta qiyinlikda
  const QIYINLIKLAR = [
    { id: 0, title: "Balandlikka qarab" },
    { id: 1, title: "Oson" },
    { id: 2, title: "Oʻrta" },
    { id: 3, title: "Qiyin" },
  ];

  // qulf — bola o'zi o'ynaganda: { mavzu: { holat: "ochiq"|"yopiq"|"yoq", matn } }. "yoq" ko'rsatilmaydi,
  // "yopiq" qulf bilan turadi: bosilsa — qaysi bo'limni tugatish kerakligi aytiladi. Berilmasa — hammasi ochiq.
  function mavzular({ sarlavha, izoh, tanlangan, qiyinlik, onDavom, orqaga, qulf }) {
    const el = box(false);
    el.append(
      h("h1", { class: "game-title", text: sarlavha || "Qaysi mavzudan savol beramiz?" }),
      izoh ? h("p", { class: "tog-note", text: izoh }) : null);
    const korinadi = savollar.TOPICS.filter((t) => !qulf || (qulf[t.id] && qulf[t.id].holat !== "yoq"));
    const ochiqmi = (id) => !qulf || (qulf[id] && qulf[id].holat === "ochiq");
    const ochiqlar = korinadi.filter((t) => ochiqmi(t.id)).map((t) => t.id);
    let tanlov = (tanlangan && tanlangan.length ? tanlangan : ochiqlar).filter(ochiqmi);
    if (!tanlov.length) tanlov = ochiqlar.slice();
    const qulfIzoh = h("p", { class: "tog-qulf-izoh", role: "status" });
    const box2 = h("div", { class: "chips" });
    const tugmalar = korinadi.map((t) => {
      if (!ochiqmi(t.id)) {
        const b = h("button", { class: "chip qulf", type: "button", text: "🔒 " + t.title, "aria-pressed": "false" });
        b.addEventListener("click", () => { sound.play("retry"); qulfIzoh.textContent = qulf[t.id].matn; });
        box2.append(b);
        return b;
      }
      const b = h("button", { class: "chip", type: "button", text: t.title, "aria-pressed": String(tanlov.includes(t.id)) });
      b.addEventListener("click", () => {
        sound.play("tap");
        qulfIzoh.textContent = "";
        if (!tanlov.includes(t.id)) tanlov = tanlov.concat(t.id);
        else if (tanlov.length > 1) tanlov = tanlov.filter((v) => v !== t.id);
        else return ui.toast("Kamida bitta mavzu kerak");
        tugmalar.forEach((x, k) => { if (ochiqmi(korinadi[k].id)) x.setAttribute("aria-pressed", String(tanlov.includes(korinadi[k].id))); });
      });
      box2.append(b);
      return b;
    });
    el.append(box2, qulfIzoh);
    if (ochiqlar.length > 1) {
      const hammasi = h("button", { class: "chip hammasi", type: "button", text: "Hammasi" });
      hammasi.addEventListener("click", () => {
        sound.play("tap");
        tanlov = ochiqlar.slice();
        tugmalar.forEach((x, k) => { if (ochiqmi(korinadi[k].id)) x.setAttribute("aria-pressed", "true"); });
      });
      box2.append(hammasi);
    }
    if (!ochiqlar.length) {
      // Hali birorta bo'lim tugamagan: o'ynash uchun avval o'qish kerak
      qulfIzoh.textContent = "Hali ochiq mavzu yoʻq. Bosh sahifadagi boʻlimlardan birini oʻqib tugat — oʻsha mavzu shu yerda ochiladi. Qulfni bossang, qaysi boʻlim kerakligini koʻrasan.";
      el.append(h("a", { class: "btn secondary", href: SITE_HOME, text: "Boʻlimlarga oʻtish" }));
    }
    let qiy = QIYINLIKLAR.some((q) => q.id === qiyinlik) ? qiyinlik : 0;
    const qatorQiy = h("div", { class: "chips tog-qiyinlik", role: "group", "aria-label": "Qiyinlik" });
    const qTugmalar = QIYINLIKLAR.map((q) => {
      const b = h("button", { class: "chip", type: "button", text: q.title, "aria-pressed": String(q.id === qiy) });
      b.addEventListener("click", () => {
        sound.play("tap");
        qiy = q.id;
        qTugmalar.forEach((x, k) => x.setAttribute("aria-pressed", String(QIYINLIKLAR[k].id === qiy)));
      });
      qatorQiy.append(b);
      return b;
    });
    // Qiyinlik — mavzulardan oldin: mavzular ko'p, ro'yxat ostida ko'rinmay qolmasin
    el.insertBefore(h("h2", { class: "tog-kichik-sarlavha", text: "Qiyinlik" }), box2);
    el.insertBefore(qatorQiy, box2);
    el.insertBefore(h("h2", { class: "tog-kichik-sarlavha", text: "Mavzular" }), box2);
    buttons([
      { label: "Davom etish", onClick: () => onDavom(tanlov.slice(), qiy), disabled: !tanlov.length },
      orqaga ? { label: "Orqaga", onClick: orqaga, secondary: true } : null,
    ]);
    return el;
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
      }, h("span", { class: "qahramon-rasm", html: art.odam(olingan ? "#C9C4BA" : q.rang) }),
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
  function oyin(el, { togId, meId, holat, javob, kuzatuvchi, mavzular: tanlangan, qiyinlik: qiyinlikTanlangan }) {
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

    const tarix = new Set(); // shu o'yinda berilgan savollar — qaytarilmaydi (nextQ)
    const xatolar = []; // shu o'yinda xato javob berilgan savollar — natija ekranida ko'rsatiladi
    let urinishPog = -1; // urinish raqami shu pog'onada (xatodan keyin yangi savol — boshqa urinish)
    let urinish = 0;
    function savolBer(me) {
      rejim = "savol";
      pastki.innerHTML = "";
      pauzaOyna = null;
      if (me.pogona !== urinishPog) { urinishPog = me.pogona; urinish = 0; } else urinish++;
      const s = holat();
      const rng = s && s.urug ? T.urugRng(s.urug, me.pogona, urinish) : null; // bir balandlikda — bir xil savol
      const qiyinlik = (s && s.qiyinlik) || qiyinlikTanlangan || 0; // qat'iy tanlangan bo'lsa — o'sha, aks holda balandlik
      joriy = nextQ(qiyinlik || T.daraja(t, me.pogona), joriy, tanlangan, rng, tarix);
      if (!rng) tarix.add(joriy.key);
      QK.probe = Object.assign(QK.probe || {}, { savol: joriy, savolPog: me.pogona, urinish });
      togUi.savol(pastki, joriy);
      savolUi.answerPad(joriy, (value) => {
        const ok = savollar.check(joriy, value);
        javobi = joriy.answer;
        if (!kuzatuvchi) {
          statYoz(joriy.topic, ok);
          if (!ok) xatolar.push({ q: joriy, sen: value });
        }
        kutilgan = hisob(me);
        kutganVaqt = Date.now();
        sound.play(ok ? "correct" : "retry");
        if (ok) ui.pose("apprentice", "happy", 700);
        pastki.innerHTML = "";
        ui.clearControl();
        pastki.append(h("div", { class: "tog-kutish", text: ok ? "✓ Javob yuborildi…" : "↻ Javob yuborildi…" }));
        rejim = "kutish";
        javob(ok, joriy);
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

    return { render, pastki, soat, el, xatolar };
  }

  // ---------- Natija ----------
  // ismlar — o'qituvchi doskasida (sinf xonasi): { kalit: ism }; xatolar — bolaning shu o'yindagi xato savollari
  function natija(state, meId, tugmalar, { ismlar, xatolar } = {}) {
    const el = box(false);
    togUi.natija(el, state, meId, ismlar);
    if (xatolar) xatolarBlok(el, xatolar);
    buttons(tugmalar);
    return el;
  }

  // Xato qilingan savollar va «shu bo'limni ko'proq o'qi» maslahati (mavzu → bosh sahifa bo'limi)
  const XATO_KORSAT = 8;
  function xatolarBlok(host, xatolar) {
    const el = h("div", { class: "tog-xatolar" });
    if (!xatolar.length) {
      el.append(h("p", { class: "tog-xatolar-yaxshi", text: "Bu oʻyinda birorta xato qilmading. Barakalla!" }));
      host.append(el);
      return el;
    }
    el.append(h("h2", { class: "tog-kichik-sarlavha", text: `Xato qilgan savollaring (${xatolar.length})` }));
    const royxat = h("div", { class: "tog-xato-royxat" });
    xatolar.slice(-XATO_KORSAT).forEach(({ q, sen }) => {
      const karta = h("div", { class: "tog-xato" }, h("div", { class: "tog-xato-mavzu", text: savollar.topicTitle(q.topic) || "" }),
        h("div", { class: "q-text", text: q.text }));
      (q.blocks || []).forEach((b) => { const n = savolUi.block(b); if (n) karta.append(n); });
      karta.append(h("div", { class: "tog-xato-javob" },
        h("span", { class: "sen", text: "Sen: " + String(sen) }),
        h("span", { class: "togri", text: "Toʻgʻri: " + String(q.answer) })));
      royxat.append(karta);
    });
    if (xatolar.length > XATO_KORSAT) royxat.append(h("p", { class: "tog-note", text: `Oxirgi ${XATO_KORSAT} tasi koʻrsatildi.` }));
    el.append(royxat);
    // Maslahat: ko'p xato qilingan mavzular bo'limlari
    const soni = {};
    xatolar.forEach(({ q }) => { soni[q.topic] = (soni[q.topic] || 0) + 1; });
    const bolimlar = [];
    Object.keys(soni).sort((a, b) => soni[b] - soni[a]).forEach((m) => {
      (M ? M.bolimlari(m) : []).forEach((id) => {
        if (bolimlar.some((x) => x.id === id)) return;
        const sec = QK.bosh && QK.bosh.SECTIONS.find((s) => s.id === id);
        if (sec) bolimlar.push({ id, title: sec.title, mavzu: m });
      });
    });
    if (bolimlar.length) {
      el.append(h("h2", { class: "tog-kichik-sarlavha", text: "Shu boʻlimlarni koʻproq oʻqi" }));
      el.append(h("div", { class: "tog-maslahat" }, ...bolimlar.map((b) => h("a", { class: "tog-maslahat-btn", href: `${SITE_HOME}#bolim-${b.id}` },
        h("b", { text: b.title }), h("span", { text: `${savollar.topicTitle(b.mavzu)}: ${soni[b.mavzu]} ta xato` })))));
    }
    host.append(el);
    return el;
  }

  QK.togEkran = { SITE_HOME, box, buttons, nextQ, qahramonlar, toglar, mavzular, oyin, natija, xatolarBlok, QIYINLIKLAR };
})(window);

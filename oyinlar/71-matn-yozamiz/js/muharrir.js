// 71-o'yin: o'yinchoq matn muharriri — «Matn» oynasi (umumiy/css/stol.css: .oyna, .oyna-sarlavha, .oyna-ichi).
// Ikki rejim: "oddiy" — <textarea> (haqiqiy kursor, belgilash, Backspace/Delete — brauzerniki);
// "bezak" — contenteditable (qalin/kursiv/rang — document.execCommand, <b>/<i>/<font> teglari).
// Sinov ilgagi: QK.muharrir.matn() / yoz() / tanla() / bezat() — oxirgi ochilgan oynaga.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, sound } = QK;
  const h = ui.h;
  const doc = root.document;

  const ASBOBLAR = [
    { nom: "qalin", yozuv: "Qalin", tezkor: "Ctrl+B" },
    { nom: "kursiv", yozuv: "Kursiv", tezkor: "Ctrl+I" },
    { nom: "kok", yozuv: "Koʻk", rang: true },
    { nom: "yashil", yozuv: "Yashil", rang: true },
    { nom: "binafsha", yozuv: "Binafsha", rang: true },
    { nom: "saqlash", yozuv: "Saqlash" },
  ];

  let joriy = null; // oxirgi ochilgan muharrir (sinov ilgagi uchun)

  // opts: rejim "oddiy" | "bezak"; matn — boshlang'ich matn; html — boshlang'ich HTML (bezak rejimi);
  //       asboblar — ko'rinadigan asboblar; onTayyor() — Ctrl+Enter; onSaqlash(nom) — nom tanlangach;
  //       nomsiz — «Saqlash» nom so'ramaydi (mavjud hujjat), onSaqlash(null) chaqiriladi.
  function yasa(host, opts) {
    const o = opts || {};
    const rejim = o.rejim === "bezak" ? "bezak" : "oddiy";
    let korinadigan = (o.asboblar || []).slice();
    let muz = false;
    let toxtagan = false;
    let tinglovchi = null;
    let nomRejim = false;
    const tugmalar = {};
    const tezkorli = !ui.touchOnly();

    // --- Asboblar qatori ---
    const asbobQator = h("div", { class: "my-asboblar", role: "toolbar", "aria-label": "Asboblar" });
    for (const a of ASBOBLAR) {
      const b = h("button", {
        class: "my-asbob" + (a.rang ? " rang" : ""), type: "button", "data-amal": a.rang ? "rang" : a.nom,
        "data-rang": a.rang ? a.nom : null, "aria-label": a.yozuv,
        html: QK.gameArt.asbob(a.nom),
      }, h("span", { class: "my-asbob-yozuv" },
        h("span", { text: a.yozuv }),
        tezkorli && a.tezkor ? h("small", { class: "my-tezkor", text: a.tezkor }) : null));
      // Tugma fokusni olmasin — matndagi belgilash (selection) joyida qoladi
      b.addEventListener("mousedown", (e) => e.preventDefault());
      b.addEventListener("click", () => {
        if (b.disabled || band()) return;
        sound.play("tap");
        if (a.nom === "saqlash") saqlashBosildi();
        else bezat(a.nom);
      });
      tugmalar[a.nom] = b;
      asbobQator.append(b);
    }

    // --- Nom chiplari (Saqlash bosilganda) ---
    const nomlarEl = h("div", { class: "my-nomlar", hidden: true });

    // --- Matn maydoni ---
    let maydon;
    if (rejim === "oddiy") {
      maydon = h("textarea", {
        class: "my-maydon", rows: "5", spellcheck: "false", autocapitalize: "off", autocorrect: "off",
        autocomplete: "off", "aria-label": "Matn maydoni",
      });
      maydon.value = o.matn == null ? "" : String(o.matn);
    } else {
      maydon = h("div", {
        class: "my-maydon my-bezak", contenteditable: "true", spellcheck: "false", autocapitalize: "off",
        autocorrect: "off", role: "textbox", "aria-multiline": "true", "aria-label": "Matn maydoni",
      });
      maydon.innerHTML = o.html != null ? L.tozaHtml(o.html) : L.matnHtml(o.matn == null ? "" : o.matn);
      // Qo'yilgan matn faqat oddiy matn bo'lib tushadi (boshqa joydan bezak kelmasin)
      maydon.addEventListener("paste", (e) => {
        e.preventDefault();
        const t = (e.clipboardData || root.clipboardData);
        const matn = t ? t.getData("text/plain") : "";
        if (matn) doc.execCommand("insertText", false, matn);
      });
    }
    maydon.addEventListener("input", () => xabar());
    maydon.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        if (o.onTayyor && !band()) { e.preventDefault(); o.onTayyor(); }
        else e.preventDefault(); // 1-bosqichda Ctrl+Enter hech narsa qilmaydi (matnga qator kirmaydi)
      }
    });

    const holatEl = h("div", { class: "my-holat", "aria-live": "polite", hidden: true });
    const ichi = h("div", { class: "oyna-ichi my-ichi" }, maydon);
    const el = h("div", { class: "oyna faol my-oyna" },
      h("div", { class: "oyna-sarlavha", html: QK.stolArt.icon("matn") }, h("span", { class: "oyna-nom", text: o.nom ? "Matn — " + o.nom : "Matn" })),
      asbobQator, nomlarEl, ichi, holatEl);
    host.append(el);

    const band = () => muz || toxtagan;
    const xabar = () => { if (tinglovchi) tinglovchi(); };

    function chizAsboblar() {
      asbobQator.hidden = !korinadigan.length;
      for (const a of ASBOBLAR) {
        const b = tugmalar[a.nom];
        b.hidden = !korinadigan.includes(a.nom);
        b.disabled = band() || (a.nom !== "saqlash" && rejim !== "bezak");
        b.classList.toggle("yoniq", a.nom === "saqlash" && nomRejim);
      }
    }

    function chizNomlar() {
      nomlarEl.hidden = !nomRejim;
      nomlarEl.textContent = "";
      if (!nomRejim) return;
      nomlarEl.append(h("div", { class: "my-nomlar-sarlavha", text: "Hujjatga nom tanla:" }));
      for (const nom of L.HUJJAT_NOMLARI) {
        nomlarEl.append(h("button", { class: "my-chip", type: "button", "data-nom": nom, text: nom, onClick: () => nomTanlandi(nom) }));
      }
      nomlarEl.append(h("button", { class: "my-chip bekor", type: "button", "data-nom": "", text: "Bekor", onClick: () => nomTanlandi(null) }));
    }

    function saqlashBosildi() {
      if (!o.onSaqlash) return;
      if (o.nomsiz) { o.onSaqlash(null); return; }
      nomRejim = !nomRejim;
      chizAsboblar();
      chizNomlar();
    }

    function nomTanlandi(nom) {
      if (band() || !nomRejim) return;
      sound.play("tap");
      nomRejim = false;
      chizAsboblar();
      chizNomlar();
      if (nom != null && o.onSaqlash) o.onSaqlash(nom);
    }

    // --- Matn ---
    const matn = () => (rejim === "oddiy" ? maydon.value : L.htmlMatn(maydon.innerHTML));
    const html = () => (rejim === "oddiy" ? L.matnHtml(maydon.value) : L.tozaHtml(maydon.innerHTML));
    function yoz(m) {
      if (rejim === "oddiy") maydon.value = m == null ? "" : String(m);
      else maydon.innerHTML = L.matnHtml(m == null ? "" : m);
      xabar();
    }
    function yozHtml(s) {
      if (rejim === "oddiy") maydon.value = L.htmlMatn(s);
      else maydon.innerHTML = L.tozaHtml(s);
      xabar();
    }
    function fokus() {
      if (band()) return;
      try { maydon.focus({ preventScroll: true }); } catch (e) { maydon.focus(); }
    }

    // So'z yoki iborani belgilash (bezak rejimida — matn tugunlari bo'ylab; oddiyda — setSelectionRange)
    function tanla(soz) {
      if (band() || !soz) return false;
      if (rejim === "oddiy") {
        const v = maydon.value;
        let i = v.indexOf(soz);
        if (i < 0) i = v.toLowerCase().indexOf(String(soz).toLowerCase());
        if (i < 0) return false;
        maydon.focus();
        maydon.setSelectionRange(i, i + soz.length);
        return true;
      }
      const walker = doc.createTreeWalker(maydon, 4 /* NodeFilter.SHOW_TEXT */);
      const parts = [];
      let full = "";
      let n;
      while ((n = walker.nextNode())) { parts.push({ n, bosh: full.length }); full += n.nodeValue; }
      let i = full.indexOf(soz);
      if (i < 0) i = full.toLowerCase().indexOf(String(soz).toLowerCase());
      if (i < 0) return false;
      const j = i + soz.length;
      // Umumiy matndagi o'rin → (tugun, tugun ichidagi o'rin); boshi — tugun boshida ham bo'ladi, oxiri — tugun oxirida
      const joy = (k, oxirmi) => {
        for (const p of parts) {
          const uz = p.n.nodeValue.length;
          if (oxirmi ? k > p.bosh && k <= p.bosh + uz : k >= p.bosh && k < p.bosh + uz) return { n: p.n, off: k - p.bosh };
        }
        const p = parts[parts.length - 1];
        return { n: p.n, off: p.n.nodeValue.length };
      };
      const a = joy(i, false);
      const b = joy(j, true);
      maydon.focus();
      const range = doc.createRange();
      range.setStart(a.n, a.off);
      range.setEnd(b.n, b.off);
      const sel = root.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      return true;
    }

    // Belgilangan joyga bezak: qalin | kursiv | rang nomi (kok/yashil/binafsha)
    function bezat(nom) {
      if (rejim !== "bezak" || band()) return false;
      fokus();
      try { doc.execCommand("styleWithCSS", false, "false"); } catch (e) { /* eski brauzer — teglar baribir chiqadi */ }
      const r = L.RANGLAR[nom];
      let ok = false;
      try {
        ok = nom === "qalin" ? doc.execCommand("bold", false, null)
          : nom === "kursiv" ? doc.execCommand("italic", false, null)
            : r ? doc.execCommand("foreColor", false, r.hex) : false;
      } catch (e) { ok = false; }
      xabar();
      return ok;
    }

    function holat(text) {
      holatEl.hidden = !text;
      holatEl.textContent = text || "";
    }

    const api = {
      el, maydon, rejim,
      matn, html, yoz, yozHtml, fokus, tanla, bezat, holat,
      tingla(fn) { tinglovchi = fn; },
      asboblar(list) {
        korinadigan = list.slice();
        chizAsboblar();
      },
      muzlat(on) {
        muz = !!on;
        if (muz) nomRejim = false;
        if (rejim === "oddiy") maydon.readOnly = muz || toxtagan;
        else maydon.setAttribute("contenteditable", muz || toxtagan ? "false" : "true");
        chizAsboblar();
        chizNomlar();
      },
      toxtat() {
        toxtagan = true;
        tinglovchi = null;
        api.muzlat(true);
        el.classList.add("my-toxtagan");
      },
    };
    joriy = api;
    chizAsboblar();
    chizNomlar();
    return api;
  }

  // Sinov ilgagi: oxirgi oynaga yo'naltiriladi
  QK.muharrir = {
    ASBOBLAR, yasa,
    joriy: () => joriy,
    matn: () => (joriy ? joriy.matn() : ""),
    html: () => (joriy ? joriy.html() : ""),
    yoz: (m) => { if (joriy) joriy.yoz(m); },
    tanla: (soz) => (joriy ? joriy.tanla(soz) : false),
    bezat: (nom) => (joriy ? joriy.bezat(nom) : false),
  };
})(window);

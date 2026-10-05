// Boshqaruv sahifalari (admin, o'qituvchi paneli) uchun umumiy qobiq: tepa panel, telefonda pastki tablar,
// foydalanuvchi menyusi, SVG ikonlar va kichik yordamchilar. Sahifalar # bilan yo'naltiriladi (orqaga tugmasi ishlaydi).
// Uslublar: umumiy/css/boshqaruv.css. Emoji emas — SVG: har platformada bir xil ko'rinadi.
(function (root) {
  "use strict";

  // ---------- Ikonlar (24×24, chiziqli) ----------
  const IKON = {
    umumiy: '<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>',
    sorov: '<path d="M4 13h4l2 3h4l2-3h4"/><path d="M5.5 5h13L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z"/>',
    oqituvchi: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M15 4.5h6v7h-4"/>',
    odamlar: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.5c2.3.2 4 1.8 4.5 4.5"/>',
    sinf: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/><path d="M9 8h7M9 11.5h5"/>',
    xona: '<path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/><path d="M12 13v4M8 21h8M9.5 17h5v4h-5z"/>',
    qidiruv: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    orqaga: '<path d="M15 5l-7 7 7 7"/>',
    keyingi: '<path d="M9 5l7 7-7 7"/>',
    ha: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    yoq: '<path d="M6 6l12 12M18 6 6 18"/>',
    qosh: '<path d="M12 5v14M5 12h14"/>',
    chop: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    kalit: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M16 7l3 3"/>',
    chiqish: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5M5 12h11"/>',
    oyinlar: '<rect x="3" y="7" width="18" height="12" rx="4"/><path d="M8 11v4M6 13h4"/><circle cx="15.5" cy="12" r="1"/><circle cx="17.5" cy="14.5" r="1"/>',
    akkaunt: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.2-6 8-6s7 2 8 6"/>',
    faol: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    diqqat: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17.5v.5"/>',
    ekran: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
    yulduz: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  };
  const ikon = (nom) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IKON[nom] || ""}</svg>`;

  // ---------- DOM yordamchilari ----------
  function h(tag, attrs, ...kids) {
    const el = root.document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "text") el.textContent = v;
      else if (k === "html") el.innerHTML = v;
      else if (k === "onClick") el.addEventListener("click", v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids) if (kid != null && kid !== false) el.append(kid);
    return el;
  }

  // Tugma: matn + ixtiyoriy ikon. cls: "secondary", "ok", "sm"...
  function tugma(matn, onClick, cls, ik) {
    const b = h("button", { class: "btn " + (cls || ""), type: "button", onClick });
    if (ik) b.insertAdjacentHTML("beforeend", ikon(ik));
    b.append(matn);
    return b;
  }

  // Ism bosh harflari va undan barqaror rang (avatar)
  const RANGLAR = ["#2F6FDE", "#1A9E77", "#8E5BD0", "#C2410C", "#0E7490", "#B4560C", "#6A3FA3", "#137A58"];
  function initsial(ism) {
    const s = String(ism || "?").replace(/[ʻʼ'‘’`]/g, "").trim().split(/\s+/);
    return ((s[0] || "?")[0] + (s[1] ? s[1][0] : "")).toUpperCase();
  }
  function avatar(ism, kichik) {
    let x = 0;
    for (const ch of String(ism || "")) x = (x * 31 + ch.codePointAt(0)) >>> 0;
    return h("span", { class: "bq-avatar" + (kichik ? " kichik" : ""), style: `--av:${RANGLAR[x % RANGLAR.length]}`, text: initsial(ism), "aria-hidden": "true" });
  }

  const OYLAR = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  function sana(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    const bugun = new Date();
    return `${d.getDate()}-${OYLAR[d.getMonth()]}` + (d.getFullYear() !== bugun.getFullYear() ? ` ${d.getFullYear()}` : "");
  }
  // "bugun", "kecha", "3 kun oldin", aks holda sana
  function qachon(iso, yoq) {
    if (!iso) return yoq || "hali kirmagan";
    const d = new Date(iso);
    const kun = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 864e5);
    if (kun <= 0) return "bugun";
    if (kun === 1) return "kecha";
    if (kun < 7) return `${kun} kun oldin`;
    return sana(iso);
  }

  const ROL_NOMI = { student: "Oʻquvchi", teacher: "Oʻqituvchi", admin: "Admin" };
  const rolBelgi = (rol, matn) => h("span", { class: "bq-rol " + rol, text: matn || ROL_NOMI[rol] || rol });

  function bosh(ik, matn, ...qoshimcha) {
    return h("div", { class: "bq-bosh" }, h("span", { html: ikon(ik) }), h("p", { text: matn }), ...qoshimcha);
  }

  // ---------- Qobiq ----------
  // opts: { bolim: "Admin" | "Oʻqituvchi", tablar: [{ id, nom, ikon }], user, havolalar: [{ nom, href, ikon }], chiqish() }
  // Qaytaradi: { asosiy, faol(id), nishon(id, n), sahifa(...kids) }
  function qobiq(opts) {
    const asosiy = h("main", { class: "bq-asosiy", id: "asosiy", tabindex: "-1" });
    const tabEl = {};
    const yasaTab = (t, joy) => {
      const a = h("a", { class: "bq-tab", href: "#" + t.id, html: ikon(t.ikon) });
      a.append(h("span", { text: t.nom }));
      (tabEl[t.id] = tabEl[t.id] || []).push(a);
      return a;
    };
    const yuqori = h("nav", { class: "bq-tablar", "aria-label": "Boʻlimlar" }, ...opts.tablar.map((t) => yasaTab(t)));
    const pastki = h("nav", { class: "bq-pastki", "aria-label": "Boʻlimlar" }, ...opts.tablar.map((t) => yasaTab(t)));

    // Foydalanuvchi menyusi
    const u = opts.user;
    const menyu = h("div", { class: "bq-menyu", role: "menu", hidden: true },
      h("div", { class: "bq-menyu-bosh" }, h("b", { text: u.ism || "—" }), h("span", { text: ROL_NOMI[u.rol] + (u.login ? " · " + u.login : u.email ? " · " + u.email : "") })),
      ...(opts.havolalar || []).map((x) => { const a = h("a", { href: x.href, role: "menuitem", html: ikon(x.ikon) }); a.append(x.nom); return a; }),
      (() => { const b = h("button", { type: "button", role: "menuitem", html: ikon("chiqish") }); b.append("Chiqish"); b.addEventListener("click", opts.chiqish); return b; })());
    const menBtn = h("button", { class: "bq-men-btn", type: "button", "aria-haspopup": "menu", "aria-expanded": "false", "aria-label": "Akkaunt menyusi" },
      avatar(u.ism, true), h("span", { class: "bq-men-nom", text: u.ism || "" }));
    const yop = () => { menyu.hidden = true; menBtn.setAttribute("aria-expanded", "false"); };
    menBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menyu.hidden = !menyu.hidden;
      menBtn.setAttribute("aria-expanded", String(!menyu.hidden));
    });
    root.document.addEventListener("click", (e) => { if (!menyu.contains(e.target)) yop(); });
    root.document.addEventListener("keydown", (e) => { if (e.key === "Escape") yop(); });

    const logo = h("a", { class: "bq-logo", href: opts.ildiz || "/", title: "Barcha oʻyinlar" },
      h("img", { src: (opts.ildiz || "/") + "bosh/icon.svg", alt: "" }),
      h("span", { class: "bq-logo-nom" }, h("b", { text: "Qabila maktabi" }), h("span", { text: opts.bolim })));

    const top = h("header", { class: "bq-top" }, logo, yuqori, h("div", { class: "bq-men" }, menBtn, menyu));
    const app = h("div", { class: "bq-app" }, top, asosiy, pastki);
    root.document.body.classList.add("bq");
    root.document.body.innerHTML = "";
    root.document.body.append(app);

    return {
      asosiy,
      faol(id) {
        for (const [k, els] of Object.entries(tabEl)) for (const a of els) {
          if (k === id) a.setAttribute("aria-current", "page");
          else a.removeAttribute("aria-current");
        }
      },
      nishon(id, n) {
        for (const a of tabEl[id] || []) {
          const eski = a.querySelector(".bq-nishon");
          if (eski) eski.remove();
          if (n > 0) a.append(h("span", { class: "bq-nishon", text: String(n) }));
        }
      },
      sahifa(...kids) {
        asosiy.innerHTML = "";
        asosiy.append(...kids);
        root.scrollTo({ top: 0 });
      },
    };
  }

  // Sahifa sarlavhasi: ixtiyoriy orqaga havolasi, h1, izoh va o'ngda amallar
  function sarlavha({ matn, izoh, orqaga, amallar }) {
    const chap = h("div", { class: "bq-sarlavha-matn" });
    if (orqaga) {
      const a = h("a", { class: "bq-orqaga", href: orqaga.href, html: ikon("orqaga") });
      a.append(orqaga.nom);
      chap.append(a);
    }
    chap.append(h("h1", { class: "bq-h1", text: matn }));
    if (izoh) chap.append(h("p", { class: "bq-izoh", text: izoh }));
    return h("div", { class: "bq-sarlavha" }, chap, amallar && amallar.length ? h("div", { class: "bq-amallar" }, ...amallar) : null);
  }

  function panel(nom, son, ...kids) {
    const bosh_ = h("div", { class: "bq-panel-bosh" }, h("h2", { text: nom }));
    if (son != null) bosh_.append(h("span", { class: "bq-nishon kulrang", text: String(son) }));
    return h("section", { class: "bq-panel" }, bosh_, ...kids);
  }

  function stat({ ikon: ik, son, nom, rang, och, diqqat, href }) {
    const el = h(href ? "a" : "div", { class: "bq-stat" + (diqqat ? " diqqat" : ""), href, style: rang ? `--rang:${rang};--och:${och}` : null },
      h("span", { class: "bq-stat-ikon", html: ikon(ik) }),
      h("div", {}, h("b", { text: String(son) }), h("span", { text: nom })));
    return el;
  }

  // Kirish talab qilinadi: rol mos kelmasa — tushunarli darvoza
  function darvoza(matn, ildiz) {
    root.document.body.classList.add("bq");
    root.document.body.innerHTML = "";
    root.document.body.append(h("div", { class: "bq-darvoza" },
      h("img", { src: ildiz + "bosh/icon.svg", alt: "", width: "64", height: "64" }),
      h("h1", { class: "bq-h1", text: "Kirish kerak" }),
      h("p", { class: "bq-izoh", text: matn }),
      h("a", { class: "btn big", href: ildiz + "kirish/", text: "Kirish" }),
      h("a", { class: "bq-orqaga", href: ildiz, text: "Barcha oʻyinlar" })));
  }

  const yol = () => decodeURIComponent((root.location.hash || "").replace(/^#\/?/, "")).split("/").filter(Boolean);

  root.QK = root.QK || {};
  root.QK.boshqaruv = { ikon, h, tugma, avatar, initsial, sana, qachon, rolBelgi, ROL_NOMI, bosh, qobiq, sarlavha, panel, stat, darvoza, yol };
})(window);

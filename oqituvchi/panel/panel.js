// O'qituvchi paneli: Sinflar (ro'yxat → sinf → o'quvchi) va Xonalar (onlayn o'yin natijalari).
// Yo'nalish: #sinflar, #sinf/<id>, #sinf/<id>/qoshish, #sinf/<id>/oquvchi/<uid>, #xonalar.
// Kirish kartochkalari (bir martalik parollar) manzilga yozilmaydi — faqat shu ekranda, bir marta.
(function (root) {
  "use strict";

  // ---------- Sof qism: bitta o'quvchining progressidan jadval qatori ----------
  function hisobla(kalitlar, GAMES, SECTIONS) {
    const bolimlar = [];
    let yulduz = 0, qiyin = 0, tugagan = 0, jami = 0;
    for (const s of SECTIONS) {
      const oyinlar = GAMES.filter((g) => g.topic === s.id);
      if (!oyinlar.length) continue;
      let t = 0, j = 0;
      for (const g of oyinlar) {
        j += g.stages;
        const q = kalitlar[g.key];
        if (!q || !Array.isArray(q.done)) continue;
        t += q.done.filter(Boolean).length;
        yulduz += (q.stars || []).reduce((a, b) => a + (Number(b) || 0), 0);
        qiyin += (q.hard || []).filter(Boolean).length;
      }
      bolimlar.push({ id: s.id, title: s.title, tugagan: t, jami: j });
      tugagan += t;
      jami += j;
    }
    const m = kalitlar["masalalar:holat:v1"];
    const masalalar = m && typeof m === "object" ? Object.values(m).filter((x) => x && x.yechilgan).length : 0;
    const rekord = Number(kalitlar["on-barmoq:rekord"]) || 0;
    return { bolimlar, yulduz, qiyin, rekord, masalalar, tugagan, foiz: jami ? Math.round((tugagan / jami) * 100) : 0 };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { hisobla };
    return;
  }

  const H = root.QK.hisob;
  const K = root.QK.bosh; // o'yinlar katalogi
  const B = root.QK.boshqaruv;
  const { h, ikon } = B;
  const ILDIZ = "../../";
  const TABLAR = [
    { id: "sinflar", nom: "Sinflar", ikon: "sinf" },
    { id: "xonalar", nom: "Xonalar", ikon: "xona" },
  ];
  const XATOLAR = {
    "nom-notogri": "Sinf nomi 1–40 belgi boʻlsin.",
    "sinf-kop": "Sinflar soni chegarasiga yetdingiz (30).",
    "sinf-toʻla": "Sinfda 60 tadan ortiq oʻquvchi boʻlmaydi.",
    "ismlar-notogri": "Har qatorda bitta ism boʻlsin, masalan «Ali K.» (2–40 harf).",
    "ruxsat-yoq": "Bu amalga ruxsat yoʻq.",
    topilmadi: "Topilmadi — sahifani yangilang.",
    tarmoq: "Server bilan aloqa yoʻq. Internetni tekshiring.",
  };
  const xabar = (kod) => XATOLAR[kod] || "Nimadir xato ketdi. Qayta urinib koʻring.";
  let Q = null;

  const yuklanmoqda = () => h("div", { class: "bq-yuklanmoqda", text: "Yuklanmoqda…" });
  const xatoBlok = (kod, qayta) => h("div", { class: "bq-bosh" }, h("span", { html: ikon("diqqat") }), h("p", { text: xabar(kod) }),
    qayta ? B.tugma("Qayta urinish", qayta, "secondary sm") : null);

  async function boshla() {
    const men = await H.men();
    if (!men.ok || !["teacher", "admin"].includes(men.user.rol) || men.user.parol_almashtirsin) {
      B.darvoza("Bu sahifa oʻqituvchilar uchun. Oʻqituvchi akkaunti bilan kiring.", ILDIZ);
      return;
    }
    const havolalar = [];
    if (men.user.rol === "admin") havolalar.push({ nom: "Admin paneli", href: ILDIZ + "admin/", ikon: "umumiy" });
    havolalar.push({ nom: "Mening akkauntim", href: ILDIZ + "kirish/", ikon: "akkaunt" }, { nom: "Barcha oʻyinlar", href: ILDIZ, ikon: "oyinlar" });
    Q = B.qobiq({
      bolim: "Oʻqituvchi", ildiz: ILDIZ, tablar: TABLAR, user: men.user, havolalar,
      chiqish: async () => { await H.chiqish(); root.location.href = ILDIZ + "kirish/"; },
    });
    root.addEventListener("hashchange", yonalish);
    yonalish();
  }

  function yonalish() {
    const [bolim, id, qism, uid] = B.yol();
    if (bolim === "xonalar") { Q.faol("xonalar"); return xonalar(); }
    Q.faol("sinflar");
    if (bolim === "sinf" && id) {
      if (qism === "qoshish") return qoshish(Number(id));
      if (qism === "oquvchi" && uid) return oquvchi(Number(id), Number(uid));
      return sinf(Number(id));
    }
    return sinflar();
  }

  // ---------- Sinflar ro'yxati ----------
  async function sinflar() {
    const sar = B.sarlavha({ matn: "Sinflar", izoh: "Sinf oching, oʻquvchilarga akkaunt yarating va natijalarini kuzating" });
    Q.sahifa(sar, yuklanmoqda());
    const r = await H.sinf.royxat();
    if (!r.ok) return Q.sahifa(sar, xatoBlok(r.xato, sinflar));

    const p = B.panel("Mening sinflarim", r.sinflar.length);
    if (!r.sinflar.length) p.append(B.bosh("sinf", "Hali sinf yoʻq. Pastda birinchi sinfingizni oching."));
    else {
      p.append(h("ul", { class: "bq-royxat" }, ...r.sinflar.map((s) => h("li", {},
        h("a", { class: "bq-qator", href: "#sinf/" + s.id },
          h("span", { class: "bq-stat-ikon", html: ikon("sinf") }),
          h("div", { class: "bq-qator-matn" },
            h("div", { class: "bq-qator-nom", text: s.nom }),
            h("div", { class: "bq-qator-izoh", text: `${s.soni} oʻquvchi · kod ${s.kod}` })),
          s.sorovlar ? h("span", { class: "bq-nishon", text: String(s.sorovlar), title: "Qoʻshilish soʻrovlari" }) : null,
          h("span", { class: "bq-oq", html: ikon("keyingi") }))))));
    }

    const nom = h("input", { class: "bq-input", maxlength: "40", placeholder: "Masalan: 5-A sinf", autocomplete: "off" });
    const xato = h("p", { class: "bq-xato", role: "alert" });
    const btn = h("button", { class: "btn", type: "submit", html: ikon("qosh") });
    btn.append("Sinf ochish");
    const f = h("form", { class: "bq-forma" }, h("div", { class: "bq-forma-qator" }, h("label", { class: "bq-maydon" }, h("span", { text: "Sinf nomi" }), nom), btn), xato);
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      btn.disabled = true;
      const y = await H.sinf.yarat(nom.value);
      btn.disabled = false;
      if (y.ok) root.location.hash = "sinf/" + y.sinf.id;
      else xato.textContent = xabar(y.xato);
    });
    Q.sahifa(sar, p, B.panel("Yangi sinf", null, h("div", { class: "bq-panel-tana" }, f)));
  }

  // ---------- Bitta sinf ----------
  const kesh = {}; // sinf id → { sinf, oquvchilar, progress } — o'quvchi sahifasi qayta so'ramasin
  async function sinfOl(id) {
    const [r, p] = await Promise.all([H.sinf.olish(id), H.sinf.progress(id)]);
    if (!r.ok || !p.ok) return { xato: (r.ok ? p : r).xato };
    kesh[id] = { ...r, progress: p.oquvchilar };
    return kesh[id];
  }

  function kodniKatta(kod) {
    const yop = () => { el.remove(); root.removeEventListener("keydown", tugmaYop); };
    const tugmaYop = (e) => { if (e.key === "Escape") yop(); };
    const el = h("div", { class: "bq-kod-katta", role: "dialog", "aria-label": "Sinf kodi" },
      h("p", { text: "kelajagim.uz → Kirish → Sinf kodi" }), h("b", { text: kod }), B.tugma("Yopish", yop, "secondary"));
    root.document.body.append(el);
    root.addEventListener("keydown", tugmaYop);
  }

  async function sinf(id) {
    Q.sahifa(B.sarlavha({ matn: "Sinf", orqaga: { nom: "Sinflar", href: "#sinflar" } }), yuklanmoqda());
    const d = await sinfOl(id);
    if (d.xato) return Q.sahifa(B.sarlavha({ matn: "Sinf", orqaga: { nom: "Sinflar", href: "#sinflar" } }), xatoBlok(d.xato, () => sinf(id)));

    const kod = h("div", { class: "bq-kod" }, h("span", { class: "bq-kod-yozuv", text: "Sinf kodi" }), h("b", { text: d.sinf.kod }));
    const ekranga = B.tugma("Doskaga", () => kodniKatta(d.sinf.kod), "secondary sm", "ekran");
    ekranga.title = "Kodni butun ekranga chiqarish (proyektor uchun)";
    const qosh = h("a", { class: "btn", href: `#sinf/${id}/qoshish`, html: ikon("qosh") });
    qosh.append("Oʻquvchi qoʻshish");
    const sar = B.sarlavha({
      matn: d.sinf.nom, orqaga: { nom: "Sinflar", href: "#sinflar" },
      izoh: `${d.oquvchilar.length} oʻquvchi · Oʻzi kirgan bolalar sinf kodi bilan qoʻshiladi`,
      amallar: [kod, ekranga, qosh],
    });
    const kids = [sar];

    if (d.sorovlar.length) {
      const sp = B.panel("Qoʻshilish soʻrovlari", d.sorovlar.length);
      sp.append(h("ul", { class: "bq-royxat" }, ...d.sorovlar.map((s) => {
        const ha = h("button", { class: "bq-ikon-btn ha", type: "button", html: ikon("ha") });
        ha.append("Qabul");
        ha.addEventListener("click", async () => { ha.disabled = true; await H.sinf.qaror(id, s.id, "qabul"); sinf(id); });
        const yoq = h("button", { class: "bq-ikon-btn yoq", type: "button", html: ikon("yoq"), "aria-label": "Rad etish", title: "Rad etish" });
        yoq.addEventListener("click", async () => { yoq.disabled = true; await H.sinf.qaror(id, s.id, "rad"); sinf(id); });
        return h("li", { class: "bq-qator" }, B.avatar(s.ism),
          h("div", { class: "bq-qator-matn" }, h("div", { class: "bq-qator-nom", text: s.ism || "—" }), h("div", { class: "bq-qator-izoh", text: s.email || "" })),
          h("div", { class: "bq-qator-amallar" }, ha, yoq));
      })));
      kids.push(sp);
    }

    const op = B.panel("Oʻquvchilar", d.oquvchilar.length);
    if (!d.oquvchilar.length) {
      op.append(B.bosh("odamlar", "Sinfda hali oʻquvchi yoʻq. «Oʻquvchi qoʻshish» tugmasi bilan akkaunt yarating yoki bolalarga sinf kodini bering."));
    } else {
      const qatorlar = d.oquvchilar.map((o) => ({ o, x: hisobla(d.progress[String(o.id)] || {}, K.GAMES, K.SECTIONS) }));
      const eng = Math.max(1, ...qatorlar.map((q) => q.x.tugagan)); // chiziq — sinfdagi eng ko'p bajarganga nisbatan
      const tb = h("tbody");
      for (const { o, x } of qatorlar) {
        const tr = h("tr", { class: "bosiladi", tabindex: "0" },
          h("td", { class: "asosiy" }, h("div", { class: "bq-kim" }, B.avatar(o.ism, true),
            h("div", { class: "bq-kim-matn" }, h("b", { text: o.ism || "—" }), h("span", { text: o.login || o.email || "" })))),
          h("td", { "data-nom": "Bosqichlar" }, h("div", { class: "bq-bar" },
            h("div", { class: "bq-bar-chiziq" }, h("span", { style: `width:${Math.round((x.tugagan / eng) * 100)}%` })),
            h("span", { class: "bq-bar-son", text: String(x.tugagan) }))),
          h("td", { class: "son", "data-nom": "Yulduz", text: "★ " + x.yulduz }),
          h("td", { class: "son ixtiyoriy", "data-nom": "Qiyin rejim", text: String(x.qiyin) }),
          h("td", { class: "son", "data-nom": "Oʻn barmoq", text: x.rekord ? x.rekord + " belgi/daq" : "—" }),
          h("td", { class: "son ixtiyoriy", "data-nom": "Masalalar", text: String(x.masalalar) }),
          h("td", { "data-nom": "Oxirgi kirish", text: B.qachon(o.oxirgi_kirish) }));
        const och = () => { root.location.hash = `sinf/${id}/oquvchi/${o.id}`; };
        tr.addEventListener("click", och);
        tr.addEventListener("keydown", (e) => { if (e.key === "Enter") och(); });
        tb.append(tr);
      }
      op.append(h("table", { class: "bq-jadval" },
        h("thead", {}, h("tr", {}, ...["Oʻquvchi", "Bosqichlar", "Yulduz", "Qiyin", "Oʻn barmoq", "Masalalar", "Oxirgi kirish"].map((t) => h("th", { text: t })))), tb));
    }
    kids.push(op);
    Q.sahifa(...kids);
  }

  // ---------- O'quvchi tafsiloti ----------
  async function oquvchi(id, uid) {
    const d = kesh[id] || (await sinfOl(id));
    const orqaga = { nom: d.sinf ? d.sinf.nom : "Sinf", href: "#sinf/" + id };
    if (d.xato) return Q.sahifa(B.sarlavha({ matn: "Oʻquvchi", orqaga }), xatoBlok(d.xato));
    const o = d.oquvchilar.find((x) => x.id === uid);
    if (!o) return Q.sahifa(B.sarlavha({ matn: "Oʻquvchi", orqaga }), xatoBlok("topilmadi"));
    const x = hisobla(d.progress[String(uid)] || {}, K.GAMES, K.SECTIONS);

    const statlar = h("div", { class: "bq-statlar" },
      B.stat({ ikon: "ha", son: x.tugagan, nom: "bosqich tugatgan", rang: "var(--togri-matn)", och: "var(--togri-och)" }),
      B.stat({ ikon: "yulduz", son: x.yulduz, nom: "yulduz", rang: "var(--yana-matn)", och: "var(--sariq-och)" }),
      B.stat({ ikon: "oyinlar", son: x.rekord || "—", nom: "Oʻn barmoq (belgi/daq)" }),
      B.stat({ ikon: "sinf", son: x.masalalar, nom: "masala yechgan", rang: "var(--c3-qora)", och: "#EFE5FA" }));
    const bolimlar = h("div", { class: "bq-bolimlar" }, ...x.bolimlar.map((b) => h("div", { class: "bq-bolim" },
      h("div", { class: "bq-bolim-nom" }, h("b", { text: b.title }), h("span", { text: `${b.tugagan} / ${b.jami}` })),
      h("div", { class: "bq-bar-chiziq" }, h("span", { style: `width:${b.jami ? Math.round((b.tugagan / b.jami) * 100) : 0}%` })))));

    const xato = h("p", { class: "bq-xato", role: "alert" });
    const amallar = [];
    if (o.meniki && o.login) {
      amallar.push(B.tugma("Yangi parol", async () => {
        const r = await H.sinf.parol(id, uid);
        if (r.ok) kartochkalar(id, d.sinf.nom, [r], "Yangi bir martalik parol");
        else xato.textContent = xabar(r.xato);
      }, "secondary sm", "kalit"));
    }
    amallar.push(B.tugma("Sinfdan chiqarish", async () => {
      if (!root.confirm(`${o.ism} sinfdan chiqarilsinmi? Akkaunti va yulduzlari saqlanib qoladi.`)) return;
      const r = await H.sinf.chiqar(id, uid);
      if (r.ok) { delete kesh[id]; root.location.hash = "sinf/" + id; }
      else xato.textContent = xabar(r.xato);
    }, "secondary sm", "yoq"));

    Q.sahifa(
      B.sarlavha({ matn: o.ism || "Oʻquvchi", orqaga, izoh: (o.login ? "login: " + o.login : o.email || "") + " · oxirgi kirish: " + B.qachon(o.oxirgi_kirish), amallar }),
      xato, statlar, B.panel("Boʻlimlar boʻyicha", null, h("div", { class: "bq-panel-tana" }, bolimlar)));
  }

  // ---------- O'quvchi qo'shish ----------
  async function qoshish(id) {
    const d = kesh[id] || (await sinfOl(id));
    const orqaga = { nom: d.sinf ? d.sinf.nom : "Sinf", href: "#sinf/" + id };
    if (d.xato) return Q.sahifa(B.sarlavha({ matn: "Oʻquvchi qoʻshish", orqaga }), xatoBlok(d.xato));
    const matn = h("textarea", { class: "bq-input", rows: "8", placeholder: "Ali K.\nOʻgʻiloy T.\nSardor M." });
    const xato = h("p", { class: "bq-xato", role: "alert" });
    const btn = h("button", { class: "btn big", type: "submit", text: "Akkauntlarni yaratish" });
    const sanoq = h("span", { class: "bq-qator-izoh", text: "0 ta oʻquvchi" });
    const ismlar = () => matn.value.split("\n").map((s) => s.trim()).filter(Boolean);
    matn.addEventListener("input", () => { sanoq.textContent = `${ismlar().length} ta oʻquvchi`; });
    const f = h("form", { class: "bq-forma" },
      h("label", { class: "bq-maydon" }, h("span", { text: "Har qatorda bitta oʻquvchi: ism va familiyaning birinchi harfi" }), matn),
      sanoq, xato, btn);
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!ismlar().length) { xato.textContent = xabar("ismlar-notogri"); return; }
      btn.disabled = true;
      const r = await H.sinf.qosh(id, ismlar());
      btn.disabled = false;
      if (r.ok) { delete kesh[id]; kartochkalar(id, d.sinf.nom, r.yangi, "Akkauntlar yaratildi"); }
      else xato.textContent = xabar(r.xato);
    });
    Q.sahifa(
      B.sarlavha({ matn: "Oʻquvchi qoʻshish", orqaga, izoh: "Har bir oʻquvchiga login va bir martalik parol beriladi. Birinchi kirishda oʻquvchi oʻz parolini qoʻyadi." }),
      B.panel(d.sinf.nom, null, h("div", { class: "bq-panel-tana" }, f)));
    matn.focus();
  }

  // ---------- Kirish kartochkalari (chop etish uchun) ----------
  function kartochkalar(id, sinfNom, royxat, matn) {
    const sayt = root.location.host + "/kirish";
    const varaq = h("div", { class: "bq-kartochkalar" }, ...royxat.map((y) => h("div", { class: "bq-kartochka" },
      h("div", { class: "bq-kartochka-sayt", text: "Qabila maktabi · " + sayt }),
      h("div", { class: "bq-kartochka-ism", text: y.ism }),
      h("div", { class: "bq-kartochka-qator" }, h("span", { text: "Login" }), h("b", { text: y.login })),
      h("div", { class: "bq-kartochka-qator" }, h("span", { text: "Parol" }), h("b", { text: y.parol })),
      h("div", { class: "bq-kartochka-izoh", text: `${sinfNom} · Birinchi kirishda oʻz parolingni qoʻyasan.` }))));
    Q.sahifa(
      B.sarlavha({ matn, orqaga: { nom: sinfNom, href: "#sinf/" + id }, amallar: [B.tugma("Chop etish", () => root.print(), "", "chop"), B.tugma("Tayyor", () => { root.location.hash = "sinf/" + id; }, "secondary")] }),
      h("div", { class: "bq-eslatma", html: ikon("diqqat") }, h("span", { text: "Parollar faqat hozir koʻrinadi. Chop eting yoki yozib oling — keyin ularni koʻrib boʻlmaydi, faqat yangisini berish mumkin." })),
      varaq);
  }

  // ---------- Xonalar (onlayn o'yin natijalari) ----------
  const TOGLAR = { chimyon: "Chimyon", hazrati: "Hazrati Sulton", pomir: "Pomir", himolay: "Himolay" };
  const MATNLAR = { home: "Asosiy qator", words: "Soʻzlar", proverb: "Maqol" };
  const oyinNomi = (n) => n.tur === "tog"
    ? "Togʻga chiqish" + (TOGLAR[n.meta.tog] ? " · " + TOGLAR[n.meta.tog] : "")
    : "Yozuv poygasi" + (MATNLAR[n.meta.tur] ? " · " + MATNLAR[n.meta.tur] : "");
  const vaqt = (iso) => { const d = new Date(iso); return B.qachon(iso) + ", " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };

  let xonaFiltr = 0; // 0 — hamma sinflar
  async function xonalar() {
    const [bolim, id] = B.yol();
    if (bolim === "xonalar" && id) return xonaNatija(Number(id));
    const sar = B.sarlavha({ matn: "Xonalar", izoh: "Sinf uchun ochilgan onlayn oʻyinlar natijalari — oxirgilari tepada" });
    Q.sahifa(sar, yuklanmoqda());
    const [s, r] = await Promise.all([H.sinf.royxat(), H.sinf.natijalar(xonaFiltr)]);
    if (!s.ok || !r.ok) return Q.sahifa(sar, xatoBlok((s.ok ? r : s).xato, xonalar));
    const kids = [sar];
    if (s.sinflar.length > 1) {
      const seg = h("div", { class: "bq-segment", role: "group", "aria-label": "Sinf" });
      for (const [sid, nom] of [[0, "Hammasi"], ...s.sinflar.map((x) => [x.id, x.nom])]) {
        const b = h("button", { type: "button", "aria-pressed": String(xonaFiltr === sid), text: nom });
        b.addEventListener("click", () => { xonaFiltr = sid; xonalar(); });
        seg.append(b);
      }
      kids.push(h("div", { class: "bq-asboblar" }, seg));
    }
    const p = B.panel("Oʻyinlar", r.natijalar.length);
    if (!r.natijalar.length) {
      p.append(B.bosh("xona", "Hali natija yoʻq. «Togʻga chiqish» yoki «Yozuv poygasi»da xona ochayotganda sinfni tanlang — oʻyin tugagach natija shu yerga yoziladi.",
        h("a", { class: "btn secondary sm", href: ILDIZ + "oyinlar/tog/", text: "Togʻga chiqish" })));
    } else {
      p.append(h("ul", { class: "bq-royxat" }, ...r.natijalar.map((n) => h("li", {},
        h("a", { class: "bq-qator", href: "#xonalar/" + n.id },
          h("span", { class: "bq-stat-ikon", html: ikon(n.tur === "tog" ? "xona" : "oyinlar") }),
          h("div", { class: "bq-qator-matn" },
            h("div", { class: "bq-qator-nom", text: oyinNomi(n) }),
            h("div", { class: "bq-qator-izoh", text: `${n.sinf_nom} · ${n.soni} oʻyinchi · ${vaqt(n.tugagan)}` })),
          n.golib ? h("span", { class: "bq-rol student", text: "🏆 " + n.golib }) : null,
          h("span", { class: "bq-oq", html: ikon("keyingi") }))))));
    }
    kids.push(p);
    Q.sahifa(...kids);
  }

  async function xonaNatija(id) {
    const orqaga = { nom: "Xonalar", href: "#xonalar" };
    Q.sahifa(B.sarlavha({ matn: "Natija", orqaga }), yuklanmoqda());
    const r = await H.sinf.natija(id);
    if (!r.ok) return Q.sahifa(B.sarlavha({ matn: "Natija", orqaga }), xatoBlok(r.xato));
    const n = r.natija;
    const tog = n.tur === "tog";
    const ustunlar = tog ? ["Oʻrin", "Oʻquvchi", "Pogʻona", "Toʻgʻri", "Xato"] : ["Oʻrin", "Oʻquvchi", "Tezlik", "Aniqlik", "Vaqt"];
    const MEDAL = ["🥇", "🥈", "🥉"];
    const tb = h("tbody");
    for (const o of n.oyinchilar) {
      const ism = o.ism || "Mehmon";
      const qiymatlar = tog
        ? [String(o.pogona) + (o.chiqdi ? " (chiqdi)" : ""), String(o.togri), String(o.xato)]
        : [o.cpm + " belgi/daq", o.aniq + "%", (o.ms / 1000).toFixed(1) + " s"];
      tb.append(h("tr", {},
        h("td", { class: "son", "data-nom": "Oʻrin", text: (MEDAL[o.orin - 1] || "") + " " + o.orin }),
        h("td", { class: "asosiy" }, h("div", { class: "bq-kim" }, B.avatar(ism, true),
          h("div", { class: "bq-kim-matn" }, h("b", { text: ism }), o.ism ? null : h("span", { text: "kirmagan yoki sinfda emas" })))),
        ...qiymatlar.map((v, i) => h("td", { class: "son", "data-nom": ustunlar[i + 2], text: v }))));
    }
    Q.sahifa(
      B.sarlavha({ matn: oyinNomi(n), orqaga, izoh: `${n.sinf_nom} · ${vaqt(n.tugagan)} · ${n.oyinchilar.length} oʻyinchi` }),
      B.panel("Reyting", null, h("table", { class: "bq-jadval" },
        h("thead", {}, h("tr", {}, ...ustunlar.map((t) => h("th", { text: t })))), tb)));
  }

  boshla();
})(typeof window !== "undefined" ? window : globalThis);

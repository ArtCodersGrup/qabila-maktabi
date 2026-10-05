// Admin paneli: Umumiy (raqamlar + kutayotgan so'rovlar + so'nggi kirganlar), So'rovlar, O'qituvchilar, Foydalanuvchilar.
// Qobiq va qismlar — umumiy/js/boshqaruv.js. Yo'nalish: #umumiy, #sorovlar, #oqituvchilar, #foydalanuvchilar.
(function (root) {
  "use strict";

  const H = root.QK.hisob;
  const B = root.QK.boshqaruv;
  const { h, ikon } = B;
  const ILDIZ = "../";
  const TABLAR = [
    { id: "umumiy", nom: "Umumiy", ikon: "umumiy" },
    { id: "sorovlar", nom: "Soʻrovlar", ikon: "sorov" },
    { id: "oqituvchilar", nom: "Oʻqituvchilar", ikon: "oqituvchi" },
    { id: "foydalanuvchilar", nom: "Foydalanuvchilar", ikon: "odamlar" },
  ];
  let Q = null; // qobiq

  const yuklanmoqda = () => h("div", { class: "bq-yuklanmoqda", text: "Yuklanmoqda…" });
  const xatoBlok = (qayta) => h("div", { class: "bq-bosh" }, h("span", { html: ikon("diqqat") }),
    h("p", { text: "Maʼlumotni olib boʻlmadi. Internetni tekshirib, qayta urinib koʻring." }), B.tugma("Qayta urinish", qayta, "secondary sm"));

  async function boshla() {
    const men = await H.men();
    if (!men.ok || men.user.rol !== "admin" || men.user.parol_almashtirsin) {
      B.darvoza("Bu sahifa faqat sayt admini uchun. Admin akkaunti bilan kiring.", ILDIZ);
      return;
    }
    Q = B.qobiq({
      bolim: "Admin", ildiz: ILDIZ, tablar: TABLAR, user: men.user,
      havolalar: [
        { nom: "Oʻqituvchi paneli", href: ILDIZ + "oqituvchi/panel/", ikon: "sinf" },
        { nom: "Mening akkauntim", href: ILDIZ + "kirish/", ikon: "akkaunt" },
        { nom: "Barcha oʻyinlar", href: ILDIZ, ikon: "oyinlar" },
      ],
      chiqish: async () => { await H.chiqish(); root.location.href = ILDIZ + "kirish/"; },
    });
    root.addEventListener("hashchange", yonalish);
    yonalish();
  }

  function yonalish() {
    const [bolim] = B.yol();
    const id = TABLAR.some((t) => t.id === bolim) ? bolim : "umumiy";
    Q.faol(id);
    ({ umumiy, sorovlar, oqituvchilar, foydalanuvchilar })[id]();
  }

  // So'rov qatori: avatar, ism, email · sana, ✓ / ✕
  function sorovQatori(s, keyin) {
    const xato = h("p", { class: "bq-xato", role: "alert" });
    const qaror = async (q, btn) => {
      btn.disabled = true;
      const r = await H.admin.qaror(s.id, q);
      if (r.ok) keyin();
      else { btn.disabled = false; xato.textContent = "Saqlab boʻlmadi. Qayta urinib koʻring."; }
    };
    const ha = h("button", { class: "bq-ikon-btn ha", type: "button", html: ikon("ha") });
    ha.append("Tasdiqlash");
    ha.addEventListener("click", () => qaror("tasdiq", ha));
    const yoq = h("button", { class: "bq-ikon-btn yoq", type: "button", html: ikon("yoq"), "aria-label": "Rad etish", title: "Rad etish" });
    yoq.addEventListener("click", () => qaror("rad", yoq));
    return h("li", { class: "bq-qator" }, B.avatar(s.ism),
      h("div", { class: "bq-qator-matn" },
        h("div", { class: "bq-qator-nom", text: s.ism || "(ism yoʻq)" }),
        h("div", { class: "bq-qator-izoh", text: (s.email || "") + " · " + B.qachon(s.yaratilgan, "—") }), xato),
      h("div", { class: "bq-qator-amallar" }, ha, yoq));
  }

  // ---------- Umumiy ----------
  async function umumiy() {
    Q.sahifa(B.sarlavha({ matn: "Umumiy", izoh: "Saytdagi akkauntlar va oʻqituvchi boʻlish soʻrovlari" }), yuklanmoqda());
    const [st, sr, fy] = await Promise.all([H.admin.statistika(), H.admin.sorovlar(), H.admin.foydalanuvchilar("", "", 0)]);
    if (!st.ok || !sr.ok || !fy.ok) return Q.sahifa(B.sarlavha({ matn: "Umumiy" }), xatoBlok(umumiy));
    Q.nishon("sorovlar", st.kutilmoqda);
    const statlar = h("div", { class: "bq-statlar" },
      B.stat({ ikon: "odamlar", son: st.oquvchilar, nom: "oʻquvchi", rang: "var(--togri-matn)", och: "var(--togri-och)", href: "#foydalanuvchilar" }),
      B.stat({ ikon: "oqituvchi", son: st.oqituvchilar, nom: "oʻqituvchi", href: "#oqituvchilar" }),
      B.stat({ ikon: "sinf", son: st.sinflar, nom: "sinf", rang: "var(--c3-qora)", och: "#EFE5FA" }),
      B.stat({ ikon: "faol", son: st.faol7, nom: "7 kunda kirgan", rang: "#0E7490", och: "#DDF1F5" }),
      B.stat({ ikon: "sorov", son: st.kutilmoqda, nom: "soʻrov kutmoqda", rang: "var(--yana-matn)", och: "var(--yana-och)", diqqat: st.kutilmoqda > 0, href: "#sorovlar" }));

    const sorovPanel = B.panel("Kutayotgan soʻrovlar", sr.sorovlar.length);
    if (!sr.sorovlar.length) sorovPanel.append(B.bosh("ha", "Hamma soʻrov koʻrib chiqilgan."));
    else {
      sorovPanel.append(h("ul", { class: "bq-royxat" }, ...sr.sorovlar.slice(0, 3).map((s) => sorovQatori(s, umumiy))));
      if (sr.sorovlar.length > 3) {
        const a = h("a", { class: "bq-qator", href: "#sorovlar" }, h("span", { class: "bq-qator-matn bq-qator-nom", text: `Yana ${sr.sorovlar.length - 3} ta soʻrov` }), h("span", { class: "bq-oq", html: ikon("keyingi") }));
        sorovPanel.append(a);
      }
    }
    const songgi = B.panel("Soʻnggi kirganlar", null,
      h("ul", { class: "bq-royxat" }, ...fy.foydalanuvchilar.slice(0, 6).map((u) =>
        h("li", { class: "bq-qator" }, B.avatar(u.ism),
          h("div", { class: "bq-qator-matn" }, h("div", { class: "bq-qator-nom", text: u.ism || "(ism yoʻq)" }), h("div", { class: "bq-qator-izoh", text: u.login || u.email || "" })),
          h("div", { class: "bq-qator-amallar" }, B.rolBelgi(u.rol), h("span", { class: "bq-qator-izoh", text: B.qachon(u.oxirgi_kirish) }))))));
    Q.sahifa(B.sarlavha({ matn: "Umumiy", izoh: "Saytdagi akkauntlar va oʻqituvchi boʻlish soʻrovlari" }), statlar, sorovPanel, songgi);
  }

  // ---------- So'rovlar ----------
  async function sorovlar() {
    const sar = B.sarlavha({ matn: "Soʻrovlar", izoh: "Google orqali kirib, «Men oʻqituvchiman» deb yozganlar. Tasdiqlasangiz — sinf ocha oladi." });
    Q.sahifa(sar, yuklanmoqda());
    const r = await H.admin.sorovlar();
    if (!r.ok) return Q.sahifa(sar, xatoBlok(sorovlar));
    Q.nishon("sorovlar", r.sorovlar.length);
    const p = B.panel("Kutayotganlar", r.sorovlar.length);
    if (!r.sorovlar.length) p.append(B.bosh("ha", "Yangi soʻrov yoʻq. Kimdir «Men oʻqituvchiman» desa, shu yerda paydo boʻladi."));
    else p.append(h("ul", { class: "bq-royxat" }, ...r.sorovlar.map((s) => sorovQatori(s, sorovlar))));
    Q.sahifa(sar, p);
  }

  // ---------- O'qituvchilar ----------
  async function oqituvchilar() {
    const sar = B.sarlavha({ matn: "Oʻqituvchilar", izoh: "Sinflari, oʻquvchilari va oxirgi kirgan vaqti" });
    Q.sahifa(sar, yuklanmoqda());
    const r = await H.admin.oqituvchilar();
    if (!r.ok) return Q.sahifa(sar, xatoBlok(oqituvchilar));
    const p = B.panel("Roʻyxat", r.oqituvchilar.length);
    if (!r.oqituvchilar.length) {
      p.append(B.bosh("oqituvchi", "Hali oʻqituvchi yoʻq. Soʻrovlarni tasdiqlasangiz, shu yerda koʻrinadi."));
      return Q.sahifa(sar, p);
    }
    const tb = h("tbody");
    for (const t of r.oqituvchilar) {
      const xato = h("p", { class: "bq-xato", role: "alert" });
      const ol = h("button", { class: "bq-ikon-btn yoq", type: "button", text: "Oʻqituvchilikdan olish" });
      ol.addEventListener("click", async () => {
        if (!root.confirm(`${t.ism || "Bu foydalanuvchi"} oddiy foydalanuvchiga aylansinmi? Sinflari saqlanib qoladi, lekin ularni boshqara olmaydi.`)) return;
        const x = await H.admin.rol(t.id, "student");
        if (x.ok) oqituvchilar();
        else xato.textContent = "Oʻzgartirib boʻlmadi.";
      });
      tb.append(h("tr", {},
        h("td", { class: "asosiy" }, h("div", { class: "bq-kim" }, B.avatar(t.ism, true),
          h("div", { class: "bq-kim-matn" }, h("b", { text: t.ism || "(ism yoʻq)" }), h("span", { text: t.email || t.login || "" })))),
        h("td", { class: "son", "data-nom": "Sinflar", text: String(t.sinflar) }),
        h("td", { class: "son", "data-nom": "Oʻquvchilar", text: String(t.oquvchilar) }),
        h("td", { "data-nom": "Oxirgi kirish", text: B.qachon(t.oxirgi_kirish) }),
        h("td", { "data-nom": "" }, ol, xato)));
    }
    p.append(h("table", { class: "bq-jadval" },
      h("thead", {}, h("tr", {}, ...["Oʻqituvchi", "Sinflar", "Oʻquvchilar", "Oxirgi kirish", ""].map((x) => h("th", { text: x })))), tb));
    Q.sahifa(sar, p);
  }

  // ---------- Foydalanuvchilar ----------
  const filtr = { q: "", rol: "", sahifa: 0 };
  function foydalanuvchilar() {
    const sar = B.sarlavha({ matn: "Foydalanuvchilar", izoh: "Ism, login yoki email boʻyicha qidiring" });
    const qidiruv = h("input", { class: "bq-input", type: "search", placeholder: "Qidirish…", value: filtr.q, "aria-label": "Qidirish", autocomplete: "off" });
    const seg = h("div", { class: "bq-segment", role: "group", "aria-label": "Rol" });
    for (const [rol, nom] of [["", "Hammasi"], ["student", "Oʻquvchi"], ["teacher", "Oʻqituvchi"], ["admin", "Admin"]]) {
      const b = h("button", { type: "button", "aria-pressed": String(filtr.rol === rol), text: nom });
      b.addEventListener("click", () => { filtr.rol = rol; filtr.sahifa = 0; for (const x of seg.children) x.setAttribute("aria-pressed", String(x === b)); yukla(); });
      seg.append(b);
    }
    const asboblar = h("div", { class: "bq-asboblar" }, h("label", { class: "bq-qidiruv", html: ikon("qidiruv") }, qidiruv), seg);
    const natija = h("div", {});
    let taymer = null;
    qidiruv.addEventListener("input", () => { clearTimeout(taymer); taymer = setTimeout(() => { filtr.q = qidiruv.value; filtr.sahifa = 0; yukla(); }, 250); });

    async function yukla() {
      natija.innerHTML = "";
      natija.append(yuklanmoqda());
      const r = await H.admin.foydalanuvchilar(filtr.q, filtr.rol, filtr.sahifa);
      natija.innerHTML = "";
      if (!r.ok) return natija.append(xatoBlok(yukla));
      const p = B.panel("Topildi", r.jami);
      if (!r.foydalanuvchilar.length) p.append(B.bosh("qidiruv", "Hech kim topilmadi."));
      else {
        const tb = h("tbody");
        for (const u of r.foydalanuvchilar) {
          tb.append(h("tr", {},
            h("td", { class: "asosiy" }, h("div", { class: "bq-kim" }, B.avatar(u.ism, true),
              h("div", { class: "bq-kim-matn" }, h("b", { text: u.ism || "(ism yoʻq)" }), h("span", { text: u.login || u.email || "" })))),
            h("td", { "data-nom": "Rol" }, B.rolBelgi(u.rol)),
            h("td", { "data-nom": "Oxirgi kirish", text: B.qachon(u.oxirgi_kirish) }),
            h("td", { "data-nom": "Roʻyxatdan oʻtgan", text: B.sana(u.yaratilgan) })));
        }
        p.append(h("table", { class: "bq-jadval" },
          h("thead", {}, h("tr", {}, ...["Foydalanuvchi", "Rol", "Oxirgi kirish", "Roʻyxatdan oʻtgan"].map((x) => h("th", { text: x })))), tb));
        const sahifalar = Math.ceil(r.jami / 50);
        if (sahifalar > 1) {
          p.append(h("div", { class: "bq-panel-tana" }, h("div", { class: "bq-amallar" },
            filtr.sahifa > 0 ? B.tugma("Oldingi", () => { filtr.sahifa--; yukla(); }, "secondary sm") : null,
            h("span", { class: "bq-qator-izoh", text: `${filtr.sahifa + 1} / ${sahifalar}` }),
            filtr.sahifa + 1 < sahifalar ? B.tugma("Keyingi", () => { filtr.sahifa++; yukla(); }, "secondary sm") : null)));
        }
      }
      natija.append(p);
    }
    Q.sahifa(sar, asboblar, natija);
    yukla();
  }

  boshla();
})(window);

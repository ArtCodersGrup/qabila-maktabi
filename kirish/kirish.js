// Kirish sahifasi: login+parol yoki Google → (bir martalik parol bo'lsa) yangi parol → (ism yo'q bo'lsa) ism → profil.
// Profilda: rol, "Men oʻqituvchiman" so'rovi (faqat Google bilan kirganlar), admin paneli havolasi, parol, chiqish.
(function (root) {
  "use strict";

  const H = root.QK.hisob;
  const box = root.document.getElementById("hisob");

  function h(tag, attrs, ...kids) {
    const el = root.document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === "text") el.textContent = v;
      else if (k === "onClick") el.addEventListener("click", v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (const kid of kids) if (kid) el.append(kid);
    return el;
  }

  const XATOLAR = {
    notogri: "Login yoki parol notoʻgʻri.",
    "kop-urinish": "Juda koʻp urinish. 15 daqiqadan keyin qayta urinib koʻring.",
    tarmoq: "Server bilan aloqa yoʻq. Internetni tekshiring.",
    "parol-qisqa": "Parol 6 tadan 72 tagacha belgi boʻlsin.",
    "parol-mos-emas": "Ikki parol bir xil emas.",
    "eski-notogri": "Hozirgi parol notoʻgʻri.",
    "ism-notogri": "Ism 2–40 harf boʻlsin, masalan: Ali K.",
    "ism-kerak": "Avval ismingizni yozing.",
    google: "Google orqali kirib boʻlmadi. Qayta urinib koʻring.",
    "kod-notogri": "Bunday sinf kodi yoʻq. Oʻqituvchidan qayta soʻrang.",
    allaqachon: "Bu sinfga soʻrov allaqachon yuborilgan.",
    "sinf-toʻla": "Sinf toʻla.",
    "email-notogri": "Email notoʻgʻri yozilgan. Masalan: ism@gmail.com",
    "email-band": "Bu email bilan akkaunt bor. «Kirish»ni yoki «Google bilan kirish»ni bosing.",
    tasdiqlanmagan: "Email hali tasdiqlanmagan. Pochtangizdagi xatdagi havolani bosing.",
    havola: "Havola eskirgan yoki allaqachon ishlatilgan. Qaytadan soʻrang.",
    "pochta-yoq": "Xat yuborish hozircha ishlamayapti. Keyinroq urinib koʻring.",
  };
  const xabar = (kod) => XATOLAR[kod] || "Nimadir xato ketdi. Qayta urinib koʻring.";

  const boshSahifa = () => h("a", { class: "hisob-bosh", href: "../", text: "◀︎ Barcha oʻyinlar" });
  const input = (attrs) => h("input", Object.assign({ class: "hisob-input" }, attrs));
  const maydon = (nom, el) => h("label", { class: "hisob-maydon" }, h("span", { text: nom }), el);
  const tugma = (text, onClick, cls) => h("button", { class: "btn " + (cls || ""), type: "button", text, onClick });

  function ekran(sarlavha, ...kids) {
    box.innerHTML = "";
    box.append(boshSahifa(), h("h1", { class: "hisob-h1", text: sarlavha }), ...kids.filter(Boolean));
  }

  // Forma: yuborilganda tugma o'chadi, xato pastda chiqadi
  function forma(maydonlar, yozuv, yubor) {
    const xato = h("p", { class: "hisob-xato", role: "alert" });
    const btn = h("button", { class: "btn big", type: "submit", text: yozuv });
    const f = h("form", { class: "hisob-form", novalidate: true }, ...maydonlar, xato, btn);
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      btn.disabled = true;
      xato.textContent = "";
      const kod = await yubor();
      btn.disabled = false;
      if (kod) xato.textContent = xabar(kod);
    });
    f.xato = xato;
    return f;
  }

  async function boshla() {
    if (!H.mumkin(root.location)) {
      ekran("Kirish", h("p", { class: "hisob-izoh", text: "Akkaunt faqat kelajagim.uz saytida ishlaydi. Oʻyinlar esa kirmasdan ham ishlayveradi." }));
      return;
    }
    // Xatdagi havolalar: ?tiklash=<token> — yangi parol; ?tasdiq=1 — email tasdiqlandi
    const qs = new URLSearchParams(root.location.search);
    const tiklashToken = qs.get("tiklash");
    if (tiklashToken) {
      root.history.replaceState(null, "", root.location.pathname); // token manzil satrida qolmasin
      return tiklashEkrani(tiklashToken);
    }
    if (qs.get("tasdiq")) {
      root.history.replaceState(null, "", root.location.pathname);
      eslatma = "✓ Email tasdiqlandi. Xush kelibsiz!";
    }
    ekran("Kirish", h("p", { class: "hisob-izoh", text: "Yuklanmoqda…" }));
    const r = await H.men();
    if (r.ok) return keyingi(r.user);
    if (r.xato === "tarmoq") {
      ekran("Kirish", h("p", { class: "hisob-xato", text: xabar("tarmoq") }), tugma("Qayta urinish", boshla));
      return;
    }
    kirishEkrani();
  }

  function keyingi(u) {
    if (u.parol_almashtirsin) return parolEkrani(true);
    if (!u.ism) return ismEkrani();
    sinxronQil(u);
  }

  // Qurilmada mehmon (kirmagan bola) yulduzlari bo'lsa — bir marta so'raymiz: umumiy kompyuterda
  // boshqa bolaning yulduzlari bu akkauntga o'tib ketmasin
  async function sinxronQil(u) {
    if (H.egasi() !== u.id && H.mehmonBor()) {
      ekran("Bu yulduzlar seniki?",
        h("p", { class: "hisob-izoh", text: "Bu qurilmada kirmasdan oʻynalgan oʻyinlar bor. Ularni oʻzing oʻynagan boʻlsang — akkauntingga qoʻshamiz." }),
        h("div", { class: "hisob-tugmalar" },
          tugma("Ha, meniki", async () => { await H.sinxron(u.id); profilEkrani(u); }),
          tugma("Yoʻq, boshqa bolaniki", async () => { H.tozala(); await H.sinxron(u.id); profilEkrani(u); }, "secondary")));
      return;
    }
    if (H.egasi() !== null && H.egasi() !== u.id) H.tozala(); // boshqa akkauntning qoldig'i
    await H.sinxron(u.id);
    profilEkrani(u);
  }

  let eslatma = ""; // profil tepasida bir marta ko'rinadigan xabar

  // Tablar: "Kirish" | "Ro'yxatdan o'tish" (xat yuborish sozlangan bo'lsa)
  function tablar(faol, s) {
    if (!(s.ok && s.email)) return null;
    const t = (nom, id, fn) => h("button", { type: "button", "aria-pressed": String(faol === id), text: nom, onClick: fn });
    return h("div", { class: "hisob-tablar", role: "group" }, t("Kirish", "kirish", () => kirishEkrani()), t("Roʻyxatdan oʻtish", "royxat", () => royxatEkrani()));
  }
  const googleTugma = (s, yozuv) => (s.ok && s.google
    ? [h("a", { class: "btn secondary big hisob-google", href: "/api/hisob/google", text: "Google bilan kirish" }), h("p", { class: "hisob-yoki", text: yozuv })]
    : []);
  let sozlama = null;
  const sozlamaOl = async () => sozlama || (sozlama = await H.sozlama());

  async function kirishEkrani() {
    const s = await sozlamaOl();
    const login = input({ name: "login", autocomplete: "username", autocapitalize: "none", spellcheck: "false", maxlength: "254" });
    const parol = input({ name: "parol", type: "password", autocomplete: "current-password", maxlength: "72" });
    const qayta = h("div", {});
    const f = forma([maydon("Login yoki email", login), maydon("Parol", parol)], "Kirish", async () => {
      qayta.innerHTML = "";
      const r = await H.kirish(login.value, parol.value);
      if (r.ok) { keyingi(r.user); return null; }
      if (r.xato === "tasdiqlanmagan") qayta.append(qaytaYuborish(login.value));
      else { parol.value = ""; parol.focus(); }
      return r.xato;
    });
    const xatoKod = new URLSearchParams(root.location.search).get("xato");
    if (xatoKod) f.xato.textContent = xabar(xatoKod);
    const unutdim = h("button", { class: "hisob-havola", type: "button", text: "Parolni unutdingizmi?", onClick: () => unutdimEkrani(login.value) });
    ekran("Kirish", tablar("kirish", s), ...googleTugma(s, "yoki login / email bilan"), f, qayta, unutdim,
      h("p", { class: "hisob-izoh", text: "Kirmasang ham hamma oʻyin ishlaydi. Kirsang — yulduzlaring boshqa qurilmada ham saqlanadi." }));
    login.focus();
  }

  function qaytaYuborish(email) {
    const izoh = h("p", { class: "hisob-izoh" });
    const b = tugma("Tasdiqlash xatini qayta yuborish", async () => {
      b.disabled = true;
      const r = await H.tasdiqQayta(email);
      izoh.textContent = r.ok ? "Xat yuborildi. Pochtangizni (va «Spam» papkasini) tekshiring." : xabar(r.xato);
    }, "secondary");
    return h("div", { class: "hisob-karta" }, b, izoh);
  }

  async function royxatEkrani() {
    const s = await sozlamaOl();
    const ism = input({ autocomplete: "name", maxlength: "40", placeholder: "Ali K." });
    const email = input({ type: "email", autocomplete: "email", autocapitalize: "none", spellcheck: "false", maxlength: "254", placeholder: "ism@gmail.com" });
    const parol = input({ type: "password", autocomplete: "new-password", maxlength: "72" });
    const takror = input({ type: "password", autocomplete: "new-password", maxlength: "72" });
    const f = forma([maydon("Ismingiz (ism va familiyaning bosh harfi)", ism), maydon("Email", email),
      maydon("Parol (kamida 6 belgi)", parol), maydon("Parol (yana bir marta)", takror)], "Roʻyxatdan oʻtish", async () => {
      if (parol.value.length < 6 || parol.value.length > 72) return "parol-qisqa";
      if (parol.value !== takror.value) return "parol-mos-emas";
      const r = await H.royxat(email.value, parol.value, ism.value);
      if (!r.ok) return r.xato;
      xatYuborildi(r.email);
      return null;
    });
    ekran("Roʻyxatdan oʻtish", tablar("royxat", s), ...googleTugma(s, "yoki email va parol bilan"), f,
      h("p", { class: "hisob-izoh", text: "Oʻquvchilarga akkauntni odatda oʻqituvchi ochib beradi — unda roʻyxatdan oʻtish shart emas." }));
    ism.focus();
  }

  function xatYuborildi(email) {
    ekran("Pochtangizni tekshiring",
      h("div", { class: "hisob-karta eslatma" },
        h("p", { class: "hisob-izoh", text: `${email} manziliga tasdiqlash xati yubordik. Xatdagi havolani bosing — shu bilan akkauntga kirasiz.` })),
      h("p", { class: "hisob-izoh", text: "Xat kelmadimi? 1–2 daqiqa kuting va «Spam» papkasini ham tekshiring." }),
      qaytaYuborish(email),
      tugma("Kirish sahifasiga", () => kirishEkrani(), "secondary"));
  }

  function unutdimEkrani(oldingi) {
    const email = input({ type: "email", autocomplete: "email", autocapitalize: "none", spellcheck: "false", maxlength: "254", value: oldingi && oldingi.includes("@") ? oldingi : "" });
    const f = forma([maydon("Akkauntingiz emaili", email)], "Havola yuborish", async () => {
      const r = await H.unutdim(email.value);
      if (!r.ok) return r.xato;
      ekran("Pochtangizni tekshiring",
        h("div", { class: "hisob-karta eslatma" }, h("p", { class: "hisob-izoh", text: "Agar bu email bilan akkaunt boʻlsa, unga parolni tiklash havolasi yuborildi. Havola 30 daqiqa amal qiladi." })),
        tugma("Kirish sahifasiga", () => kirishEkrani(), "secondary"));
      return null;
    });
    ekran("Parolni tiklash",
      h("div", { class: "hisob-karta" },
        h("p", { class: "hisob-qator-nom", text: "Oʻquvchimisan?" }),
        h("p", { class: "hisob-izoh", text: "Login va parolni oʻqituvching bergan boʻlsa — undan yangi parol soʻra. U senga bir martalik parol beradi, shu bilan kirib, oʻz parolingni qoʻyasan." })),
      h("div", { class: "hisob-karta" },
        h("p", { class: "hisob-qator-nom", text: "Google bilan kirganmisiz?" }),
        h("p", { class: "hisob-izoh", text: "Unda parol kerak emas — «Google bilan kirish» tugmasini bosing." })),
      h("p", { class: "hisob-qator-nom", text: "Email bilan roʻyxatdan oʻtgan boʻlsangiz:" }),
      f, tugma("Orqaga", () => kirishEkrani(), "secondary"));
    email.focus();
  }

  function tiklashEkrani(token) {
    const yangi = input({ type: "password", autocomplete: "new-password", maxlength: "72" });
    const takror = input({ type: "password", autocomplete: "new-password", maxlength: "72" });
    const f = forma([maydon("Yangi parol", yangi), maydon("Yangi parol (yana bir marta)", takror)], "Saqlash", async () => {
      if (yangi.value.length < 6 || yangi.value.length > 72) return "parol-qisqa";
      if (yangi.value !== takror.value) return "parol-mos-emas";
      const r = await H.tiklash(token, yangi.value);
      if (r.ok) { eslatma = "✓ Yangi parol saqlandi."; keyingi(r.user); return null; }
      return r.xato;
    });
    ekran("Yangi parol", h("p", { class: "hisob-izoh", text: "Yangi parol qoʻying. Boshqa qurilmalardagi kirishlar yopiladi." }), f,
      tugma("Kirish sahifasiga", () => kirishEkrani(), "secondary"));
    yangi.focus();
  }

  function parolEkrani(majburiy, u) {
    const eski = majburiy ? null : input({ type: "password", autocomplete: "current-password", maxlength: "72" });
    const yangi = input({ type: "password", autocomplete: "new-password", maxlength: "72" });
    const takror = input({ type: "password", autocomplete: "new-password", maxlength: "72" });
    const maydonlar = [eski && maydon("Hozirgi parol", eski), maydon("Yangi parol", yangi), maydon("Yangi parol (yana bir marta)", takror)].filter(Boolean);
    const f = forma(maydonlar, "Saqlash", async () => {
      if (yangi.value.length < 6 || yangi.value.length > 72) return "parol-qisqa";
      if (yangi.value !== takror.value) return "parol-mos-emas";
      const r = await H.parol(eski ? eski.value : "", yangi.value);
      if (r.ok) { keyingi(r.user); return null; }
      return r.xato;
    });
    ekran(majburiy ? "Oʻz parolingni qoʻy" : "Parolni almashtirish",
      h("p", { class: "hisob-izoh", text: majburiy
        ? "Oʻqituvchi bergan parol bir martalik edi. Endi oʻzing eslab qoladigan parol oʻyla va uni hech kimga aytma."
        : "Parol almashgach, boshqa qurilmalardagi kirishlar yopiladi." }),
      f,
      majburiy ? tugma("Chiqish", chiqish, "secondary") : tugma("Orqaga", () => profilEkrani(u), "secondary"));
    (eski || yangi).focus();
  }

  function ismEkrani() {
    const ism = input({ autocomplete: "nickname", maxlength: "40", placeholder: "Ali K." });
    const f = forma([maydon("Ismingiz", ism)], "Saqlash", async () => {
      const r = await H.profil(ism.value);
      if (r.ok) { keyingi(r.user); return null; }
      return r.xato;
    });
    ekran("Ismingiz", h("p", { class: "hisob-izoh", text: "Ism va familiyaning birinchi harfi, masalan «Ali K.». Uni faqat oʻqituvchingiz koʻradi." }), f);
    ism.focus();
  }

  function profilEkrani(u) {
    const kids = [
      eslatma ? h("div", { class: "hisob-karta eslatma" }, h("p", { class: "hisob-izoh", text: eslatma })) : null,
      h("p", { class: "hisob-salom", text: `Salom, ${u.ism}!` }),
      h("p", { class: "hisob-rol", text: H.ROLLAR[u.rol] + (u.login ? " · login: " + u.login : u.email ? " · " + u.email : "") }),
    ];
    // Har rolga bitta asosiy tugma, qolganlari ikkinchi darajali
    if (u.rol === "admin") {
      kids.push(h("div", { class: "hisob-tugmalar" },
        h("a", { class: "btn big", href: "../admin/", text: "Admin paneli" }),
        h("a", { class: "btn secondary big", href: "../oqituvchi/panel/", text: "Oʻqituvchi paneli" })));
    }
    if (u.rol === "teacher") kids.push(h("a", { class: "btn big", href: "../oqituvchi/panel/", text: "Oʻqituvchi paneli" }));
    if (u.rol === "student" && !u.login) {
      if (u.oqituvchi_sorov === "kutilmoqda") kids.push(h("div", { class: "hisob-karta eslatma" }, h("p", { class: "hisob-izoh", text: "Oʻqituvchi boʻlish soʻrovingizni admin koʻrib chiqyapti." })));
      else if (u.oqituvchi_sorov === "rad") kids.push(h("div", { class: "hisob-karta" }, h("p", { class: "hisob-izoh", text: "Oʻqituvchi boʻlish soʻrovi rad etildi. Savol boʻlsa, sayt muallifiga yozing." })));
      else kids.push(tugma("Men oʻqituvchiman", () => sorovEkrani(u), "secondary"));
    }
    if (u.rol === "student") kids.push(sinflarim());
    // O'quvchi uchun asosiy amal — o'ynash; boshqalarga — ikkinchi darajali
    const pastki = [tugma("Barcha oʻyinlar", () => { root.location.href = "../"; }, u.rol === "student" ? "" : "secondary")];
    if (u.parol_bor) pastki.push(tugma("Parolni almashtirish", () => parolEkrani(false, u), "secondary sm"));
    pastki.push(tugma("Chiqish", chiqish, "secondary sm"));
    eslatma = "";
    ekran("Mening akkauntim", ...kids.filter(Boolean), h("div", { class: "hisob-tugmalar" }, ...pastki));
  }

  // O'quvchining sinflari va sinf kodi bilan qo'shilish
  function sinflarim() {
    const karta = h("div", { class: "hisob-karta" }, h("p", { class: "hisob-qator-nom", text: "Sinfim" }));
    const royxat = h("div", {}, h("p", { class: "hisob-izoh", text: "Yuklanmoqda…" }));
    const kod = input({ maxlength: "6", autocapitalize: "characters", autocomplete: "off", spellcheck: "false", placeholder: "AB3K7Q" });
    const f = forma([maydon("Sinf kodi (oʻqituvchidan)", kod)], "Qoʻshilish", async () => {
      const r = await H.sinf.qoshil(kod.value);
      if (!r.ok) return r.xato;
      kod.value = "";
      yangila();
      return null;
    });
    async function yangila() {
      const r = await H.sinf.meniki();
      royxat.innerHTML = "";
      if (!r.ok) return;
      if (!r.sinflar.length) royxat.append(h("p", { class: "hisob-izoh", text: "Hali sinfga qoʻshilmagansan." }));
      for (const s of r.sinflar) {
        royxat.append(h("div", { class: "hisob-qator" },
          h("div", {}, h("div", { class: "hisob-qator-nom", text: s.nom }), h("div", { class: "hisob-qator-izoh", text: "Oʻqituvchi: " + (s.oqituvchi || "—") })),
          h("span", { class: "hisob-qator-izoh", text: s.holat === "qabul" ? "✓ aʼzo" : "⏳ kutilmoqda" })));
      }
    }
    yangila();
    karta.append(royxat, f);
    return karta;
  }

  function sorovEkrani(u) {
    const xato = h("p", { class: "hisob-xato", role: "alert" });
    ekran("Oʻqituvchi boʻlish",
      h("p", { class: "hisob-izoh", text: "Soʻrov sayt adminiga boradi. Tasdiqlansa, sinf ochib, oʻquvchilaringiz uchun akkaunt yarata olasiz." }),
      xato,
      h("div", { class: "hisob-tugmalar" },
        tugma("Soʻrov yuborish", async () => {
          const r = await H.oqituvchiman();
          if (r.ok) profilEkrani(r.user);
          else xato.textContent = xabar(r.xato);
        }),
        tugma("Bekor qilish", () => profilEkrani(u), "secondary")));
  }

  async function chiqish() {
    await H.chiqish();
    kirishEkrani();
  }

  boshla();
})(window);

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
  };
  const xabar = (kod) => XATOLAR[kod] || "Nimadir xato ketdi. Qayta urinib koʻring.";

  const boshSahifa = () => h("a", { class: "hisob-bosh", href: "../", text: "◀︎ Barcha oʻyinlar" });
  const input = (attrs) => h("input", Object.assign({ class: "hisob-input" }, attrs));
  const maydon = (nom, el) => h("label", { class: "hisob-maydon" }, h("span", { text: nom }), el);
  const tugma = (text, onClick, cls) => h("button", { class: "btn " + (cls || ""), type: "button", text, onClick });

  function ekran(sarlavha, ...kids) {
    box.innerHTML = "";
    box.append(boshSahifa(), h("h1", { class: "hisob-h1", text: sarlavha }), ...kids);
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

  async function kirishEkrani() {
    const s = await H.sozlama();
    const login = input({ name: "login", autocomplete: "username", autocapitalize: "none", spellcheck: "false", maxlength: "20" });
    const parol = input({ name: "parol", type: "password", autocomplete: "current-password", maxlength: "72" });
    const f = forma([maydon("Login", login), maydon("Parol", parol)], "Kirish", async () => {
      const r = await H.kirish(login.value, parol.value);
      if (r.ok) { keyingi(r.user); return null; }
      parol.value = "";
      parol.focus();
      return r.xato;
    });
    const xatoKod = new URLSearchParams(root.location.search).get("xato");
    if (xatoKod) f.xato.textContent = xabar(xatoKod);
    const google = s.ok && s.google
      ? [h("a", { class: "btn secondary big", href: "/api/hisob/google", text: "Google bilan kirish" }),
        h("p", { class: "hisob-yoki", text: "yoki oʻqituvchi bergan login bilan" })]
      : [];
    ekran("Kirish", ...google, f,
      h("p", { class: "hisob-izoh", text: "Kirmasang ham hamma oʻyin ishlaydi. Kirsang — yulduzlaring boshqa qurilmada ham saqlanadi." }));
    login.focus();
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
      h("p", { class: "hisob-salom", text: `Salom, ${u.ism}!` }),
      h("p", { class: "hisob-rol", text: H.ROLLAR[u.rol] + (u.login ? " · login: " + u.login : u.email ? " · " + u.email : "") }),
    ];
    if (u.rol === "admin") kids.push(h("a", { class: "btn big", href: "../admin/", text: "Admin paneli" }));
    if (u.rol === "teacher" || u.rol === "admin") kids.push(h("a", { class: "btn big", href: "../oqituvchi/panel/", text: "Oʻqituvchi paneli" }));
    if (u.rol === "student" && !u.login) {
      if (u.oqituvchi_sorov === "kutilmoqda") kids.push(h("div", { class: "hisob-karta eslatma" }, h("p", { class: "hisob-izoh", text: "Oʻqituvchi boʻlish soʻrovingizni admin koʻrib chiqyapti." })));
      else if (u.oqituvchi_sorov === "rad") kids.push(h("div", { class: "hisob-karta" }, h("p", { class: "hisob-izoh", text: "Oʻqituvchi boʻlish soʻrovi rad etildi. Savol boʻlsa, sayt muallifiga yozing." })));
      else kids.push(tugma("Men oʻqituvchiman", () => sorovEkrani(u), "secondary"));
    }
    if (u.rol === "student") kids.push(sinflarim());
    const pastki = [tugma("Barcha oʻyinlar", () => { root.location.href = "../"; })];
    if (u.parol_bor) pastki.push(tugma("Parolni almashtirish", () => parolEkrani(false, u), "secondary"));
    pastki.push(tugma("Chiqish", chiqish, "secondary"));
    ekran("Mening akkauntim", ...kids, h("div", { class: "hisob-tugmalar" }, ...pastki));
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

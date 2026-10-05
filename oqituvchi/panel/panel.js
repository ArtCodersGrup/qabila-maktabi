// O'qituvchi paneli: sinflar → sinf (kod, so'rovlar, o'quvchilar jadvali) → o'quvchi tafsiloti.
// O'quvchi qo'shish va parol tiklash — chop etiladigan kirish kartochkalari (parol faqat shu yerda bir marta ko'rinadi).
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
    return { bolimlar, yulduz, qiyin, rekord, masalalar, foiz: jami ? Math.round((tugagan / jami) * 100) : 0 };
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { hisobla };
    return;
  }

  const H = root.QK.hisob;
  const B = root.QK.bosh;
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
  const tugma = (text, onClick, cls) => h("button", { class: "btn " + (cls || ""), type: "button", text, onClick });
  const XATOLAR = {
    "nom-notogri": "Sinf nomi 1–40 belgi boʻlsin.",
    "sinf-kop": "Sinflar soni chegarasiga yetdingiz (30).",
    "sinf-toʻla": "Sinfda 60 tadan ortiq oʻquvchi boʻlmaydi.",
    "ismlar-notogri": "Har qatorda bitta ism boʻlsin, masalan «Ali K.» (2–40 harf).",
    "ruxsat-yoq": "Bu amalga ruxsat yoʻq.",
    tarmoq: "Server bilan aloqa yoʻq.",
  };
  const xabar = (kod) => XATOLAR[kod] || "Nimadir xato ketdi. Qayta urinib koʻring.";
  const OYLAR = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  const sana = (iso) => { if (!iso) return "hali kirmagan"; const d = new Date(iso); return `${d.getDate()}-${OYLAR[d.getMonth()]}`; };
  const SAYT = root.location.host + "/kirish";

  function ekran(orqaga, sarlavha, ...kids) {
    box.innerHTML = "";
    box.append(orqaga, h("h1", { class: "hisob-h1", text: sarlavha }), ...kids);
    root.scrollTo({ top: 0 });
  }
  const akkauntga = () => h("a", { class: "hisob-bosh", href: "../../kirish/", text: "◀︎ Akkaunt" });
  const orqagaTugma = (text, fn) => h("button", { class: "hisob-bosh hisob-bosh-btn", type: "button", text: "◀︎ " + text, onClick: fn });

  // ---------- Sinflar ro'yxati ----------
  async function sinflar() {
    const men = await H.men();
    if (!men.ok || !["teacher", "admin"].includes(men.user.rol) || men.user.parol_almashtirsin) {
      ekran(akkauntga(), "Oʻqituvchi paneli",
        h("p", { class: "hisob-izoh", text: "Bu sahifa oʻqituvchilar uchun. Avval oʻqituvchi akkaunti bilan kiring." }),
        h("a", { class: "btn", href: "../../kirish/", text: "Kirish" }));
      return;
    }
    const r = await H.sinf.royxat();
    if (!r.ok) return ekran(akkauntga(), "Oʻqituvchi paneli", h("p", { class: "hisob-xato", text: xabar(r.xato) }), tugma("Qayta urinish", sinflar));
    const royxat = h("div", { class: "hisob-karta" });
    if (!r.sinflar.length) royxat.append(h("p", { class: "hisob-izoh", text: "Hali sinf yoʻq. Birinchisini oching." }));
    for (const s of r.sinflar) {
      royxat.append(h("button", { class: "hisob-qator hisob-qator-btn", type: "button", onClick: () => sinf(s.id) },
        h("div", {}, h("div", { class: "hisob-qator-nom", text: s.nom }),
          h("div", { class: "hisob-qator-izoh", text: `${s.soni} oʻquvchi` + (s.sorovlar ? ` · ${s.sorovlar} ta soʻrov` : "") })),
        h("span", { class: "sinf-kod-kichik", text: s.kod })));
    }
    const nom = h("input", { class: "hisob-input", maxlength: "40", placeholder: "5-A sinf" });
    const xato = h("p", { class: "hisob-xato", role: "alert" });
    const f = h("form", { class: "hisob-form" }, h("label", { class: "hisob-maydon" }, h("span", { text: "Yangi sinf nomi" }), nom), xato,
      h("button", { class: "btn", type: "submit", text: "Sinf ochish" }));
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const y = await H.sinf.yarat(nom.value);
      if (y.ok) sinf(y.sinf.id);
      else xato.textContent = xabar(y.xato);
    });
    ekran(akkauntga(), "Oʻqituvchi paneli", royxat, f);
  }

  // ---------- Bitta sinf ----------
  async function sinf(id) {
    const [r, p] = await Promise.all([H.sinf.olish(id), H.sinf.progress(id)]);
    if (!r.ok || !p.ok) return ekran(orqagaTugma("Sinflar", sinflar), "Sinf", h("p", { class: "hisob-xato", text: xabar((r.ok ? p : r).xato) }));
    const kod = h("div", { class: "hisob-karta sinf-kod-karta" },
      h("span", { class: "hisob-qator-izoh", text: "Sinf kodi — oʻzi kirgan oʻquvchilar shu kod bilan qoʻshiladi:" }),
      h("span", { class: "sinf-kod", text: r.sinf.kod }));
    const kids = [kod, h("div", { class: "hisob-tugmalar" }, tugma("Oʻquvchi qoʻshish", () => qoshish(r.sinf)))];
    if (r.sorovlar.length) {
      const sk = h("div", { class: "hisob-karta eslatma" }, h("p", { class: "hisob-qator-nom", text: "Qoʻshilish soʻrovlari" }));
      for (const s of r.sorovlar) {
        sk.append(h("div", { class: "hisob-qator" },
          h("div", {}, h("div", { class: "hisob-qator-nom", text: s.ism || "—" }), h("div", { class: "hisob-qator-izoh", text: s.email || "" })),
          h("div", { class: "hisob-tugmalar" },
            tugma("Qabul", async () => { await H.sinf.qaror(id, s.id, "qabul"); sinf(id); }, "ok sm"),
            tugma("Rad", async () => { await H.sinf.qaror(id, s.id, "rad"); sinf(id); }, "secondary sm"))));
      }
      kids.push(sk);
    }
    if (!r.oquvchilar.length) {
      kids.push(h("p", { class: "hisob-izoh", text: "Sinfda hali oʻquvchi yoʻq. «Oʻquvchi qoʻshish» tugmasini bosing yoki sinf kodini bering." }));
    } else {
      const jadval = h("table", { class: "sinf-jadval" },
        h("thead", {}, h("tr", {}, ...["Oʻquvchi", "Bajargani", "★", "🔥", "Oʻn barmoq", "Masalalar", "Oxirgi kirish"].map((t) => h("th", { text: t })))));
      const tb = h("tbody");
      for (const o of r.oquvchilar) {
        const x = hisobla(p.oquvchilar[String(o.id)] || {}, B.GAMES, B.SECTIONS);
        tb.append(h("tr", { tabindex: "0", onClick: () => oquvchi(r.sinf, o, x) },
          h("td", {}, h("b", { text: o.ism || "—" }), h("div", { class: "hisob-qator-izoh", text: o.login || o.email || "" })),
          h("td", {}, h("div", { class: "sinf-bar" }, h("span", { style: `width:${x.foiz}%` })), h("div", { class: "hisob-qator-izoh", text: x.foiz + "%" })),
          h("td", { text: String(x.yulduz) }), h("td", { text: String(x.qiyin) }),
          h("td", { text: x.rekord ? x.rekord + " b/daq" : "—" }), h("td", { text: String(x.masalalar) }),
          h("td", { text: sana(o.oxirgi_kirish) })));
        tb.lastChild.addEventListener("keydown", (e) => { if (e.key === "Enter") oquvchi(r.sinf, o, x); });
      }
      jadval.append(tb);
      kids.push(h("div", { class: "sinf-jadval-oram" }, jadval));
    }
    ekran(orqagaTugma("Sinflar", sinflar), r.sinf.nom, ...kids);
  }

  // ---------- O'quvchi tafsiloti ----------
  function oquvchi(s, o, x) {
    const bolimlar = h("div", { class: "hisob-karta" });
    for (const b of x.bolimlar) {
      const f = b.jami ? Math.round((b.tugagan / b.jami) * 100) : 0;
      bolimlar.append(h("div", { class: "sinf-bolim" },
        h("span", { class: "hisob-qator-nom", text: b.title }),
        h("div", { class: "sinf-bar" }, h("span", { style: `width:${f}%` })),
        h("span", { class: "hisob-qator-izoh", text: `${b.tugagan} / ${b.jami}` })));
    }
    const xato = h("p", { class: "hisob-xato", role: "alert" });
    const amallar = h("div", { class: "hisob-tugmalar" });
    if (o.meniki && o.login) {
      amallar.append(tugma("Yangi bir martalik parol", async () => {
        const r = await H.sinf.parol(s.id, o.id);
        if (r.ok) kartochkalar(s, [r], "Parol yangilandi");
        else xato.textContent = xabar(r.xato);
      }, "secondary"));
    }
    amallar.append(tugma("Sinfdan chiqarish", async () => {
      if (!root.confirm(`${o.ism} sinfdan chiqarilsinmi? Akkaunti va yulduzlari saqlanib qoladi.`)) return;
      const r = await H.sinf.chiqar(s.id, o.id);
      if (r.ok) sinf(s.id);
      else xato.textContent = xabar(r.xato);
    }, "secondary"));
    ekran(orqagaTugma(s.nom, () => sinf(s.id)), o.ism || "Oʻquvchi",
      h("p", { class: "hisob-rol", text: (o.login ? "login: " + o.login : o.email || "") + ` · ★ ${x.yulduz} · 🔥 ${x.qiyin}` }),
      bolimlar, amallar, xato);
  }

  // ---------- O'quvchi qo'shish ----------
  function qoshish(s) {
    const matn = h("textarea", { class: "hisob-input sinf-ismlar", rows: "8", placeholder: "Ali K.\nOʻgʻiloy T.\nSardor M." });
    const xato = h("p", { class: "hisob-xato", role: "alert" });
    const btn = h("button", { class: "btn big", type: "submit", text: "Akkauntlarni yaratish" });
    const f = h("form", { class: "hisob-form" },
      h("label", { class: "hisob-maydon" }, h("span", { text: "Har qatorda bitta oʻquvchi: ism va familiyaning birinchi harfi" }), matn), xato, btn);
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      const ismlar = matn.value.split("\n").map((x) => x.trim()).filter(Boolean);
      if (!ismlar.length) { xato.textContent = xabar("ismlar-notogri"); return; }
      btn.disabled = true;
      const r = await H.sinf.qosh(s.id, ismlar);
      btn.disabled = false;
      if (r.ok) kartochkalar(s, r.yangi, "Akkauntlar yaratildi");
      else xato.textContent = xabar(r.xato);
    });
    ekran(orqagaTugma(s.nom, () => sinf(s.id)), "Oʻquvchi qoʻshish",
      h("p", { class: "hisob-izoh", text: "Har bir oʻquvchiga login va bir martalik parol beriladi. Birinchi kirishda oʻquvchi oʻz parolini qoʻyadi." }), f);
    matn.focus();
  }

  // ---------- Kirish kartochkalari (chop etish uchun) ----------
  function kartochkalar(s, royxat, sarlavha) {
    const varaq = h("div", { class: "kartochkalar" });
    for (const y of royxat) {
      varaq.append(h("div", { class: "kartochka" },
        h("div", { class: "kartochka-sayt", text: "Qabila maktabi · " + SAYT }),
        h("div", { class: "kartochka-ism", text: y.ism }),
        h("div", { class: "kartochka-qator" }, h("span", { text: "Login" }), h("b", { text: y.login })),
        h("div", { class: "kartochka-qator" }, h("span", { text: "Parol" }), h("b", { text: y.parol })),
        h("div", { class: "kartochka-izoh", text: "Birinchi kirishda oʻz parolingni qoʻyasan." })));
    }
    ekran(orqagaTugma(s.nom, () => sinf(s.id)), sarlavha,
      h("div", { class: "hisob-karta eslatma ekranda" }, h("p", { class: "hisob-izoh", text: "Parollar faqat hozir koʻrinadi. Chop eting yoki yozib oling — keyin ularni koʻrib boʻlmaydi (faqat yangisini berish mumkin)." })),
      h("div", { class: "hisob-tugmalar ekranda" }, tugma("Chop etish", () => root.print()), tugma("Tayyor", () => sinf(s.id), "secondary")),
      varaq);
  }

  sinflar();
})(typeof window !== "undefined" ? window : globalThis);

// Admin paneli: foydalanuvchilar soni va o'qituvchi bo'lish so'rovlari (tasdiqlash / rad etish).
(function (root) {
  "use strict";

  const H = root.QK.hisob;
  const box = root.document.getElementById("hisob");

  function h(tag, attrs, ...kids) {
    const el = root.document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null) continue;
      if (k === "text") el.textContent = v;
      else if (k === "onClick") el.addEventListener("click", v);
      else el.setAttribute(k, v);
    }
    for (const kid of kids) if (kid) el.append(kid);
    return el;
  }

  function ekran(...kids) {
    box.innerHTML = "";
    box.append(h("a", { class: "hisob-bosh", href: "../kirish/", text: "◀︎ Akkaunt" }), h("h1", { class: "hisob-h1", text: "Admin paneli" }), ...kids);
  }

  // Brauzerlar o'zbek oy nomlarini bilmaydi ("2026 M10 5") — o'zimiz yozamiz
  const OYLAR = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  const sana = (iso) => { const d = new Date(iso); return `${d.getDate()}-${OYLAR[d.getMonth()]}, ${d.getFullYear()}`; };

  async function yukla() {
    const men = await H.men();
    if (!men.ok || men.user.rol !== "admin" || men.user.parol_almashtirsin) {
      ekran(h("p", { class: "hisob-izoh", text: "Bu sahifa faqat admin uchun. Avval admin akkaunti bilan kiring." }),
        h("a", { class: "btn", href: "../kirish/", text: "Kirish" }));
      return;
    }
    const [st, sr] = await Promise.all([H.admin.statistika(), H.admin.sorovlar()]);
    if (!st.ok || !sr.ok) {
      ekran(h("p", { class: "hisob-xato", text: "Maʼlumotni olib boʻlmadi." }), h("button", { class: "btn", type: "button", text: "Qayta urinish", onClick: yukla }));
      return;
    }
    const raqam = (n, nom) => h("div", { class: "hisob-raqam" }, h("b", { text: String(n || 0) }), h("span", { text: nom }));
    const raqamlar = h("div", { class: "hisob-raqamlar" },
      raqam(st.rollar.student, "oʻquvchi"), raqam(st.rollar.teacher, "oʻqituvchi"), raqam(st.rollar.admin, "admin"), raqam(st.kutilmoqda, "soʻrov"));
    const royxat = h("div", { class: "hisob-karta" }, h("p", { class: "hisob-qator-nom", text: "Oʻqituvchi boʻlish soʻrovlari" }));
    if (!sr.sorovlar.length) royxat.append(h("p", { class: "hisob-izoh", text: "Hozircha soʻrov yoʻq." }));
    for (const s of sr.sorovlar) {
      const xato = h("p", { class: "hisob-xato", role: "alert" });
      const qaror = async (q) => {
        const r = await H.admin.qaror(s.id, q);
        if (r.ok) yukla();
        else xato.textContent = "Saqlab boʻlmadi. Qayta urinib koʻring.";
      };
      royxat.append(h("div", { class: "hisob-qator" },
        h("div", {}, h("div", { class: "hisob-qator-nom", text: s.ism || "(ism yoʻq)" }), h("div", { class: "hisob-qator-izoh", text: (s.email || "") + " · " + sana(s.yaratilgan) })),
        h("div", { class: "hisob-tugmalar" },
          h("button", { class: "btn ok sm", type: "button", text: "Tasdiqlash", onClick: () => qaror("tasdiq") }),
          h("button", { class: "btn secondary sm", type: "button", text: "Rad etish", onClick: () => qaror("rad") }))),
        xato);
    }
    ekran(raqamlar, royxat);
  }

  yukla();
})(window);

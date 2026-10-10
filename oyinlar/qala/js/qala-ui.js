// Qal'a — umumiy ekran yordamchilari: quti, tugmalar qatori, sarlavha, atama chipi (uz · en · ru).
// Darslar, lug'at, mashq va onlayn ekranlar shu yerdan foydalanadi. Holatni saqlamaydi.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, qala: Q } = QK;
  const h = ui.h;
  const SITE_HOME = "../../index.html";

  function box(compact, cls) {
    ui.setCompact(!!compact);
    ui.clearWork();
    ui.clearControl();
    document.getElementById("play").classList.toggle("qala-full", cls === "qala-oyin");
    const el = h("div", { class: "tbox" + (cls ? " " + cls : "") });
    ui.work().append(el);
    return el;
  }

  // [{ label, onClick, secondary, disabled }] — pastki qatorda
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

  // Sarlavha: nom, qisqa izoh, kerak bo'lsa "◀︎ Orqaga" havolasi (onOrqaga funksiya) yoki bosh sahifaga
  function sarlavha(el, { nom, izoh, orqaga, onOrqaga }) {
    if (onOrqaga) el.append(h("button", { class: "back-link", type: "button", text: "◀︎ Orqaga", onClick: onOrqaga }));
    else if (orqaga) el.append(h("a", { class: "back-link", href: SITE_HOME, text: "◀︎ Barcha oʻyinlar" }));
    el.append(h("h1", { class: "game-title", text: nom }));
    if (izoh) el.append(h("p", { class: "qala-note", text: izoh }));
  }

  // Atama chipi: «parol · password · пароль»; bosilsa ostida izoh ochiladi. Bir qatorda bir nechta chip — atamaQator.
  function atama(id) {
    const a = Q.atama(id);
    if (!a) return h("span", { text: id });
    const izoh = h("div", { class: "atama-izoh", text: a.izoh });
    izoh.hidden = true;
    const chip = h("button", { class: "atama", type: "button", "aria-expanded": "false",
      onClick: () => { izoh.hidden = !izoh.hidden; chip.setAttribute("aria-expanded", String(!izoh.hidden)); } },
      h("span", { class: "uz", text: a.uz }), h("span", { class: "nuqta", text: "·" }),
      h("span", { class: "en", text: a.en }), h("span", { class: "nuqta", text: "·" }),
      h("span", { class: "ru", text: a.ru }));
    const wrap = h("div", { class: "atama-wrap" }, chip, izoh);
    return wrap;
  }
  const atamaQator = (ids) => h("div", { class: "atama-qator" }, ...ids.map(atama));

  // Taymer: qolgan soniyani "4:59" ko'rinishida; yangilash — qaytgan funksiya
  function taymer(el) {
    const t = h("div", { class: "qala-taymer", text: "0:00" });
    el.append(t);
    return (soniya) => {
      const s = Math.max(0, Math.ceil(soniya));
      t.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
      t.classList.toggle("oz", s <= 30);
    };
  }

  const JAMOA = { oy: { nom: "Oy", belgi: "☾" }, quyosh: { nom: "Quyosh", belgi: "☀" } };
  const jamoaNomi = (id) => (JAMOA[id] ? JAMOA[id].nom : id);

  QK.qalaUi = { SITE_HOME, box, buttons, sarlavha, atama, atamaQator, taymer, JAMOA, jamoaNomi };
})(window);

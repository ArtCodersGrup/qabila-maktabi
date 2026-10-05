// 61-o'yin: shu o'yinga xos ekran qismlari (otkritka, qulfli quti, yo'l, manzil satri) va mashq ekranlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, practice } = QK;
  const h = ui.h;

  function box(compact) {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = h("div", { class: "pbox" });
    ui.work().append(el);
    return el;
  }
  const note = (text) => h("div", { class: "note", text });
  const answer = (text) => h("div", { class: "answer", text });

  // ---------- Qismlar ----------
  // Ochiq otkritka: maydonlar ko'rinib turadi
  const otkritka = (x) => h("div", { class: "qy-otkritka", "aria-label": "Ochiq xabar" },
    h("span", { class: "qy-belgi", html: QK.gameArt.ochiq() }),
    h("div", { class: "qy-maydonlar" }, ...x.maydonlar.map(([k, v]) => h("div", { class: "qy-maydon" }, h("span", { text: k + ":" }), h("b", { text: v })))));

  // Qulfli quti: ichida tushunarsiz belgilar
  const quti = (qulf) => h("div", { class: "qy-quti", "aria-label": "Qulflangan xabar" },
    h("span", { class: "qy-belgi", html: QK.gameArt.qulf() }),
    h("code", { class: "qy-shifr", text: qulf }));

  // Yo'l: sen → o'rtadagi tugunlar → sayt
  const yol = (m) => h("div", { class: "qy-yol" },
    h("span", { class: "qy-uch", text: "Sen" }),
    ...Array.from({ length: m }, () => h("span", { class: "qy-tugun", html: QK.gameArt.koz() })),
    h("span", { class: "qy-uch", text: "Sayt" }));

  // Manzil satri: qulf (https) yoki ogohlantirish (http) + manzil matni
  function satr(url, opts) {
    const o = opts || {};
    const qulfli = L.qulflimi(url);
    const el = h(o.tugma ? "button" : "div", { class: "qy-satr" + (qulfli ? " qulfli" : " ochiq"), type: o.tugma ? "button" : null,
      "aria-label": (qulfli ? "Qulfli manzil: " : "Qulfsiz manzil: ") + url },
      h("span", { class: "qy-satr-belgi", html: qulfli ? QK.gameArt.qulf() : QK.gameArt.ogoh() }),
      h("span", { class: "qy-url", text: url }));
    return el;
  }

  // ---------- Mashq ekranlari ----------
  function sonExercise(task, opts) {
    const o = opts || {};
    const host = box(true);
    if (o.oldin) o.oldin(host);
    host.append(h("div", { class: "qy-savol", text: task.matn }));
    const javob = Number(task.javob);
    return practice.numberTries({
      answer: javob,
      maxLen: String(javob).length + 1,
      hint() { host.append(note("↻ " + task.nega)); },
      solution() { host.append(answer(task.hisob)); },
    });
  }

  function tanlovExercise(task, opts) {
    const o = opts || {};
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        if (o.oldin) o.oldin(host);
        host.append(h("div", { class: "qy-savol", text: task.matn }));
        const tugmalar = task.variantlar.map((v) => {
          if (o.satrlar) {
            const b = satr(v, { tugma: true });
            b.addEventListener("click", () => submit(v));
            return b;
          }
          return ui.button(String(v), () => submit(v), "wide" + (o.kod ? " kod" : ""));
        });
        ui.control().append(h("div", { class: "qy-javoblar" }, ...tugmalar));
      },
      check: (value) => value === task.javob,
      hint() { host.append(note("↻ " + (task.ishora || task.nega))); },
      solution() {
        host.append(o.satrlar ? satr(task.javob) : answer(String(task.javob)));
        host.append(note(task.nega));
      },
    });
  }

  // ---------- Har bir savol turi ----------
  const EKRAN = {
    parol: (task) => tanlovExercise(task, { oldin: (host) => host.append(otkritka(task.xabar)), kod: true }),
    uzel: (task) => sonExercise(task, { oldin: (host) => host.append(yol(task.orta)) }),
    korish: (task) => tanlovExercise(task, { oldin: (host) => host.append(otkritka(task.xabar)), kod: true }),
    kafolat: (task) => tanlovExercise(task, {}),
    qulf: (task) => tanlovExercise(task, { satrlar: true }),
    ishonch: (task) => tanlovExercise(task, { satrlar: true }),
    "nima-xato": (task) => tanlovExercise(task, { oldin: (host) => host.append(satr(task.url)) }),
    egasi: (task) => tanlovExercise(task, { oldin: (host) => host.append(satr(task.url)), kod: true }),
  };
  const run = (task) => EKRAN[task.tur](task);

  function praise(task) {
    if (task.tur === "uzel") return task.hisob;
    return task.nega;
  }

  QK.common = { box, note, answer, otkritka, quti, yol, satr, sonExercise, tanlovExercise, run, praise };
})(window);

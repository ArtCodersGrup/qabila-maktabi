// 74-o‘yin: shu o‘yinga xos ekran qismlari (ishlar ro‘yxati, ish daftari, to‘plam ustunlari) va mashq ekranlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, practice } = QK;
  const h = ui.h;

  // ---------- Mashq qutisi ----------
  function box(compact) {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    const el = h("div", { class: "pbox" });
    ui.work().append(el);
    return el;
  }

  const note = (text) => h("div", { class: "note", text });
  const answer = (text) => h("div", { class: "answer", text });
  const savol = (text) => h("div", { class: "ls-savol", text });
  const matnKarta = (text) => h("div", { class: "ls-karta", text });

  // Ta‘riflar ro‘yxati (nomlash paneli)
  function formula(el, lines) {
    const f = h("div", { class: "ls-formula" });
    lines.forEach((line) => f.append(h("div", { text: line })));
    el.append(f);
    return f;
  }

  // Ishlar ro‘yxati: harf yoki raqam + matn. o.bosqich — har ish yoniga bosqich nomi (yechimda)
  function royxat(ishlar, opts) {
    const o = opts || {};
    return h("div", { class: "ls-royxat", role: "list" }, ...ishlar.map((x) => h("div", { class: "ls-ish", role: "listitem" },
      h("span", { class: "ls-harf", text: x.harf }),
      h("span", { class: "ls-ish-matn" }, h("span", { text: x.matn }), o.bosqich ? h("span", { class: "ls-ish-bosqich", text: L.nom(x.b) }) : null))));
  }

  // Ish daftari: ish + soat. o.bosqich — shu bosqich qatorlari belgilanadi (yechimda)
  function daftar(qatorlar, opts) {
    const o = opts || {};
    return h("div", { class: "ls-royxat", role: "list" }, ...qatorlar.map((x) => h("div", { class: "ls-ish" + (o.bosqich && x.b === o.bosqich ? " mos" : ""), role: "listitem" },
      h("span", { class: "ls-soat", text: `${x.soat} soat` }),
      h("span", { class: "ls-ish-matn" }, h("span", { text: x.matn }), o.bosqich ? h("span", { class: "ls-ish-bosqich", text: L.nom(x.b) }) : null))));
  }

  // To‘plam tarkibi: sinf nomi, soni va ulushiga mos chiziq
  function ustunlar(qatorlar) {
    const jami = qatorlar.reduce((s, q) => s + q.soni, 0);
    return h("div", { class: "ls-ustunlar" }, ...qatorlar.map((q, i) => h("div", { class: "ls-ustun" },
      h("span", { class: "ls-ustun-nom", text: `«${q.nom}» — ${q.soni} ta` }),
      h("span", { class: "ls-chiziq r" + i }, h("i", { style: `width:${Math.max(2, (q.soni / jami) * 100).toFixed(1)}%` })))));
  }

  // Besh bosqich tugmalari (2 ustun): onPick(kalit)
  function bosqichTugmalari(onPick) {
    return h("div", { class: "ls-bosqichlar" }, ...L.BOSQICHLAR.map((b, i) => ui.button(`${i + 1}. ${b.nom}`, () => onPick(b.k), "wide")));
  }

  // ---------- Mashq ekranlari ----------
  function sonExercise(task, opts) {
    const o = opts || {};
    const host = box(true);
    host.append(savol(task.matn));
    if (o.oldin) o.oldin(host);
    return practice.numberTries({
      answer: task.javob,
      maxLen: String(task.javob).length + 1,
      hint() { host.append(note("↻ " + task.nega)); },
      solution() {
        host.append(answer(task.hisob));
        if (o.yechim) o.yechim(host);
      },
    });
  }

  function tanlovExercise(task, opts) {
    const o = opts || {};
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(savol(task.matn));
        if (o.oldin) o.oldin(host);
        ui.control().append(h("div", { class: "ls-javoblar" + (o.qisqa ? " qisqa" : "") }, ...task.variantlar.map((v) => ui.button(String(v), () => submit(v), "wide"))));
      },
      check: (value) => value === task.javob,
      // Maslahat javobni aytmaydi — nimaga qarashni ko‘rsatadi
      hint() { host.append(note("↻ " + task.ishora)); },
      solution() {
        host.append(answer(String(task.javob)));
        if (o.yechim) o.yechim(host);
        host.append(note(task.nega));
      },
    });
  }

  // ---------- Har bir savol turi uchun ekran ----------
  // Ro‘yxatli savol: yechimda har ish yonida bosqichi ko‘rinadi
  const royxatli = (task) => {
    let el = null;
    return tanlovExercise(task, {
      qisqa: task.tur === "tartib",
      oldin: (host) => { el = royxat(task.ishlar); host.append(el); },
      yechim: () => el.replaceWith(royxat(task.ishlar, { bosqich: true })),
    });
  };

  const EKRAN = {
    natija: (task) => tanlovExercise(task, { oldin: (host) => host.append(matnKarta(task.natija)) }),
    keyingi: (task) => tanlovExercise(task),
    tartib: royxatli,
    etishmaydi: royxatli,
    ish: (task) => tanlovExercise(task, { oldin: (host) => host.append(matnKarta(task.ish)) }),
    bosqichIshi: (task) => tanlovExercise(task),
    soat: (task) => {
      let el = null;
      return sonExercise(task, {
        oldin: (host) => { el = daftar(task.qatorlar); host.append(el); },
        yechim: () => el.replaceWith(daftar(task.qatorlar, { bosqich: task.bosqich })),
      });
    },
    tashxis: (task) => tanlovExercise(task, { oldin: (host) => host.append(matnKarta(task.vaziyat)) }),
    test: (task) => sonExercise(task, {
      oldin: (host) => { if (task.guruhlar) host.append(ustunlar(task.guruhlar.map((g) => ({ nom: g.nom, soni: g.soni })))); },
    }),
    kam: (task) => sonExercise(task, { oldin: (host) => host.append(ustunlar(task.qatorlar)) }),
  };
  const run = (task) => EKRAN[task.tur](task);

  // To‘g‘ri javobdan keyingi qisqa izoh (✓ dan keyin chiqadi; pufak 1 soniyada almashadi)
  function praise(task) {
    if (task.hisob) return task.hisob.split(/ — |\. /)[0].replace(/\.$/, "") + ".";
    if (task.tur === "tartib") return "Har ish oldingisining natijasiga tayanadi.";
    if (task.tur === "keyingi") return task.javob + ".";
    if (task.tur === "bosqichIshi") return `Bu — «${L.nom(task.bosqich)}».`;
    return `«${task.javob}».`;
  }

  QK.common = { box, note, answer, savol, matnKarta, formula, royxat, daftar, ustunlar, bosqichTugmalari, sonExercise, tanlovExercise, run, praise };
})(window);

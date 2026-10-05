// 59-o'yin: shu o'yinga xos ekran qismlari (uy, konvert, daftar, javon) va mashq ekranlari.
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
  // Uy: rasm + eshik ustida manzil (manzil — HTML, rasm ichida emas)
  function uy(manzil, opts) {
    const o = opts || {};
    const el = h(o.tugma ? "button" : "div", { class: "qm-uy" + (o.holat ? " " + o.holat : ""), type: o.tugma ? "button" : null, "aria-label": "Uy: " + manzil },
      h("span", { class: "qm-uy-rasm", html: QK.gameArt.uy(o.rang || 0) }),
      h("span", { class: "qm-manzil", text: manzil }));
    return el;
  }
  const konvert = (manzil) => h("div", { class: "qm-konvert" }, h("span", { class: "qm-konvert-nom", text: "Kimga:" }), h("span", { class: "qm-manzil", text: manzil || "—" }));

  // Daftar jadvali: nom → manzil
  function daftar(jadval, sarlavha, opts) {
    const o = opts || {};
    return h("div", { class: "qm-daftar" + (o.holat ? " " + o.holat : "") },
      sarlavha ? h("div", { class: "qm-daftar-nom", text: sarlavha }) : null,
      ...jadval.map((q) => h("div", { class: "qm-qator" + (o.belgi === q.nom ? " belgi" : "") },
        h("span", { class: "qm-nom", text: q.nom }), h("span", { class: "qm-manzil", text: q.manzil }))));
  }

  // Uch daftar: mahalla → shahar → .uz
  const zanjir = (daftarlar, opts) => h("div", { class: "qm-zanjir" },
    ...daftarlar.map((d, i) => daftar(d, L.DAFTARLAR[i], { belgi: opts && opts.belgi })));

  // So'rovlar ketma-ketligi (nom chiplari) va javon
  const ketma = (list) => h("div", { class: "qm-ketma" }, ...list.map((nom, i) => h("span", { class: "qm-chip" }, h("b", { text: String(i + 1) }), nom)));
  const javon = (nomlar) => h("div", { class: "qm-javon" }, h("span", { class: "qm-javon-nom", text: "Javon:" }),
    ...(nomlar.length ? nomlar.map((n) => h("span", { class: "qm-chip", text: n })) : [h("span", { class: "qm-bosh", text: "boʻsh" })]));

  // ---------- Mashq ekranlari ----------
  function sonExercise(task, opts) {
    const o = opts || {};
    const host = box(true);
    if (o.oldin) o.oldin(host);
    host.append(h("div", { class: "qm-savol", text: task.matn }));
    const javob = Number(task.javob);
    return practice.numberTries({
      answer: javob,
      maxLen: String(javob).length + 1,
      hint() { host.append(note("↻ " + task.nega)); if (o.maslahat) o.maslahat(host); },
      solution() { host.append(answer(task.hisob)); if (o.yechim) o.yechim(host); },
    });
  }

  function tanlovExercise(task, opts) {
    const o = opts || {};
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        if (o.oldin) o.oldin(host);
        host.append(h("div", { class: "qm-savol", text: task.matn }));
        const tugmalar = task.variantlar.map((v) => (o.tugmaYasa ? o.tugmaYasa(v, submit) : ui.button(String(v), () => submit(v), "wide" + (o.kod ? " kod" : ""))));
        ui.control().append(h("div", { class: "qm-javoblar" + (o.tugmaYasa ? " uylar" : "") }, ...tugmalar));
      },
      check: (value) => value === task.javob,
      hint() { host.append(note("↻ " + (task.ishora || task.nega))); },
      solution() {
        host.append(answer(String(task.javob)));
        if (o.yechim) o.yechim(host);
        host.append(note(task.nega));
      },
    });
  }

  // ---------- Har bir savol turi ----------
  const xatoExercise = (task) => tanlovExercise(task, { kod: true });

  const uyExercise = (task) => tanlovExercise(task, {
    oldin: (host) => host.append(konvert(task.javob)),
    tugmaYasa: (m, submit) => {
      const b = uy(m, { tugma: true, rang: task.variantlar.indexOf(m) });
      b.addEventListener("click", () => submit(m));
      return b;
    },
  });

  const chegaraExercise = (task) => sonExercise(task, {});

  const topExercise = (task) => tanlovExercise(task, {
    oldin: (host) => host.append(daftar(task.jadval, "Daftar")),
    kod: true,
    yechim: (host) => host.append(daftar(task.jadval.filter((q) => q.nom === task.nom), null, { belgi: task.nom })),
  });

  const zanjirExercise = (task) => sonExercise(task, {
    oldin: (host) => host.append(zanjir(task.daftarlar)),
    yechim: (host) => host.append(zanjir(task.daftarlar, { belgi: task.nom })),
  });

  const keshExercise = (task) => sonExercise(task, {
    oldin: (host) => host.append(ketma(task.ketma), javon(task.javon)),
  });

  const eskiExercise = (task) => tanlovExercise(task, {
    oldin: (host) => host.append(h("div", { class: "qm-juft" },
      h("div", { class: "qm-blok" }, h("div", { class: "qm-daftar-nom", text: "Javonda" }), daftar([{ nom: task.nom, manzil: task.eski }])),
      h("div", { class: "qm-blok" }, h("div", { class: "qm-daftar-nom", text: "Aslida endi" }), daftar([{ nom: task.nom, manzil: task.yangi }])))),
  });

  const nimaExercise = (task) => tanlovExercise(task, {});

  const EKRAN = { xato: xatoExercise, uy: uyExercise, chegara: chegaraExercise, top: topExercise, zanjir: zanjirExercise, kesh: keshExercise, eski: eskiExercise, nima: nimaExercise };
  const run = (task) => EKRAN[task.tur](task);

  function praise(task) {
    if (task.tur === "chegara" || task.tur === "zanjir" || task.tur === "kesh") return task.hisob;
    return task.nega;
  }

  QK.common = { box, note, answer, uy, konvert, daftar, zanjir, ketma, javon, sonExercise, tanlovExercise, run, praise };
})(window);

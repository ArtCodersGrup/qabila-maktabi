// «Dipfeyk»: ekran qismlari (chizma yuz, lab-ovoz sxemasi, post kartasi, vaziyat kartasi) va mashq ekranlari.
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
  const savol = (text) => h("div", { class: "df-savol", text });

  // ---------- Qismlar ----------
  // Chizma yuz; o.yozuv — ostidagi yozuv (HTML), o.belgila — halqa bilan koʻrsatiladigan belgilar
  function yuz(y, o) {
    const q = o || {};
    const el = h("div", { class: "df-yuz" + (q.kichik ? " kichik" : "") },
      h("div", { class: "df-yuz-svg", html: QK.gameArt.yuz(y, { belgila: q.belgila, nom: q.nom }) }));
    if (q.yozuv) el.append(h("div", { class: "df-yozuv", text: q.yozuv }));
    return el;
  }

  const juft = (...kids) => h("div", { class: "df-juft" }, ...kids);

  // Lab-ovoz sxemasi: kadr raqamlari, ovoz qatori, lab qatori. belgila — mos kelmagan kadrlar (1 dan)
  function labSxema(ovoz, lab, belgila) {
    const b = belgila || [];
    const ustunlar = `grid-template-columns: repeat(${ovoz.length}, minmax(0, 1fr))`;
    const qator = (cls, kataklar) => h("div", { class: "df-lab-qator " + cls, style: ustunlar }, ...kataklar);
    return h("div", { class: "df-lab" },
      qator("raqam", ovoz.map((x, i) => h("span", { class: b.includes(i + 1) ? "belgi" : null, text: String(i + 1) }))),
      h("div", { class: "df-lab-nom", text: "Ovoz" }),
      qator("ikon", ovoz.map((x, i) => h("span", { class: b.includes(i + 1) ? "belgi" : null, html: QK.gameArt.ovozIkon(!!x) }))),
      h("div", { class: "df-lab-nom", text: "Lab" }),
      qator("ikon", lab.map((x, i) => h("span", { class: b.includes(i + 1) ? "belgi" : null, html: QK.gameArt.labIkon(!!x) }))));
  }

  // Satrli karta: sarlavha + satrlar ({ sarlavha, matn, yomon }). ochiq — shubhali satrlar belgilanadi
  function satrlar(qatorlar, ochiq) {
    return qatorlar.map((q) => h("div", { class: "df-satr" + (ochiq && q.yomon ? " yomon" : "") },
      h("span", { class: "df-yorliq", text: q.sarlavha }),
      h("span", { class: "df-matn", text: (ochiq && q.yomon ? "↻ " : "") + q.matn })));
  }

  const postKarta = (post, ochiq) => h("div", { class: "df-karta" },
    h("div", { class: "df-davo", text: `«${post.davo}» — video` }),
    ...satrlar(post.qatorlar, ochiq));

  const vaziyatKarta = (v, ochiq) => h("div", { class: "df-karta" },
    h("div", { class: "df-davo", text: v.kirish }),
    ...satrlar(v.qatorlar, ochiq));

  const sanaKarta = (task) => h("div", { class: "df-karta" },
    h("div", { class: "df-davo", text: `«${task.davo}. Bugun boʻldi!» — video` }),
    h("div", { class: "df-satr" }, h("span", { class: "df-yorliq", text: "Post sanasi" }), h("span", { class: "df-matn df-son", text: task.post })),
    h("div", { class: "df-satr" }, h("span", { class: "df-yorliq", text: "Eng eski nusxa" }), h("span", { class: "df-matn df-son", text: task.eski })));

  const zanjirKarta = (task) => h("div", { class: "df-karta" },
    ...task.boglar.map((b) => h("div", { class: "df-satr bog" },
      h("b", { text: b.kim }), h("span", { text: " — " }), h("span", { text: `${b.kimdan} kanalidan olgan` }))));

  const qoidaKarta = (nom, qatorlar) => h("div", { class: "df-qoida" },
    h("div", { class: "df-qoida-nom", text: nom }),
    ...qatorlar.map((q) => h("div", { text: q })));

  // ---------- Mashq ekranlari ----------
  function sonExercise(task, opts) {
    const o = opts || {};
    const host = box(true);
    if (o.oldin) o.oldin(host);
    host.append(savol(task.matn));
    const javob = Number(task.javob);
    return practice.numberTries({
      answer: javob,
      maxLen: String(javob).length + 1,
      hint() { host.append(note("↻ " + task.nega)); },
      solution() {
        if (o.yechim) o.yechim(host);
        host.append(answer(task.hisob));
      },
    });
  }

  // Variantlardan tanlash; o.sinf — tugmalar joylashuvi ("ikki" — ikki ustun)
  function tanlovExercise(task, opts) {
    const o = opts || {};
    let host = null;
    let joy = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        joy = h("div", { class: "df-joy" });
        host.append(joy);
        if (o.oldin) o.oldin(joy);
        host.append(savol(task.matn));
        ui.control().append(h("div", { class: "df-javoblar " + (o.sinf || "") },
          ...task.variantlar.map((v) => ui.button(String(v), () => submit(v), "wide"))));
      },
      check: (value) => value === task.javob,
      // Maslahat javobni aytmaydi — nimaga qarash kerakligini aytadi
      hint() { host.append(note("↻ " + task.ishora)); },
      solution() {
        if (o.yechim) {
          joy.innerHTML = "";
          o.yechim(joy);
        }
        host.append(answer("Toʻgʻri javob: " + task.javob));
        host.append(note(task.nega));
      },
    });
  }

  // ---------- Har bir savol turi uchun ekran ----------
  const belgiExercise = (task) => tanlovExercise(task, {
    sinf: "ikki",
    oldin: (joy) => joy.append(yuz(task.yuz)),
    yechim: (joy) => joy.append(yuz(task.yuz, { belgila: L.belgilari(task.yuz) })),
  });

  const belgiSoniExercise = (task) => sonExercise(task, {
    oldin: (host) => host.append(yuz(task.yuz)),
    yechim: (host) => host.append(yuz(task.yuz, { kichik: true, belgila: L.belgilari(task.yuz) })),
  });

  const juftExercise = (task) => tanlovExercise(task, {
    sinf: "ikki",
    oldin: (joy) => joy.append(juft(yuz(task.yuzlar.A, { kichik: true, yozuv: "A", nom: "A tasvir" }), yuz(task.yuzlar.B, { kichik: true, yozuv: "B", nom: "B tasvir" }))),
    yechim: (joy) => joy.append(juft(
      yuz(task.yuzlar.A, { kichik: true, yozuv: "A", nom: "A tasvir", belgila: task.harf === "A" ? [task.belgi] : [] }),
      yuz(task.yuzlar.B, { kichik: true, yozuv: "B", nom: "B tasvir", belgila: task.harf === "B" ? [task.belgi] : [] }))),
  });

  const labExercise = (task) => sonExercise(task, {
    oldin: (host) => host.append(labSxema(task.ovoz, task.lab)),
    yechim: (host) => host.append(labSxema(task.ovoz, task.lab, task.farqli)),
  });

  const shubhaExercise = (task) => tanlovExercise(task, {
    sinf: "ikki",
    oldin: (joy) => joy.append(postKarta(task.post, false)),
    yechim: (joy) => joy.append(postKarta(task.post, true)),
  });

  const sanaExercise = (task) => sonExercise(task, {
    oldin: (host) => host.append(sanaKarta(task)),
  });

  const zanjirExercise = (task) => tanlovExercise(task, {
    sinf: "ikki",
    oldin: (joy) => joy.append(zanjirKarta(task)),
  });

  const muammoExercise = (task) => tanlovExercise(task, {
    sinf: "ikki",
    oldin: (joy) => joy.append(vaziyatKarta(task.vaziyat, false)),
    yechim: (joy) => joy.append(vaziyatKarta(task.vaziyat, true)),
  });

  const harakatExercise = (task) => tanlovExercise(task, {
    oldin: (joy) => joy.append(h("div", { class: "df-karta" }, h("div", { class: "df-davo", text: task.vaziyat }))),
  });

  const tarqalishExercise = (task) => sonExercise(task);

  const EKRAN = {
    belgi: belgiExercise, belgiSoni: belgiSoniExercise, juft: juftExercise, lab: labExercise,
    shubha: shubhaExercise, shubhaSoni: shubhaExercise, sana: sanaExercise, zanjir: zanjirExercise,
    muammo: muammoExercise, muammoSoni: muammoExercise, harakat: harakatExercise, tarqalish: tarqalishExercise,
  };
  const run = (task) => EKRAN[task.tur](task);

  // Toʻgʻri javobdan keyingi qisqa tasdiq
  const praise = (task) => task.qisqa || task.hisob || "Toʻgʻri.";

  QK.common = { box, note, answer, savol, yuz, juft, labSxema, postKarta, vaziyatKarta, qoidaKarta, sonExercise, tanlovExercise, run, praise };
})(window);

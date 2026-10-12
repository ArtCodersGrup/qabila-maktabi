// «AI va harakat»: ekran qismlari (skelet rasmi, koordinatalar jadvali, kadrlar qatori) va mashq ekranlari.
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
  const savol = (text) => h("div", { class: "ah-savol", text });

  // ---------- Qismlar ----------
  // Skelet rasmi. o.setka — oʻqlardagi sonlar HTML da (SVG ichida matn yoʻq); qolgan sozlamalar — gameArt.skelet
  function rasm(p, o) {
    const q = o || {};
    const el = h("div", { class: "ah-rasm" + (q.setka ? " setkali" : "") + (q.kichik ? " kichik" : "") });
    if (q.setka) {
      el.append(h("div", { class: "ah-x", "aria-hidden": "true" },
        ...[0, 20, 40, 60, 80, 100].map((v) => h("span", { style: `left:${v}%`, text: String(v) }))));
      el.append(h("div", { class: "ah-y", "aria-hidden": "true" },
        ...[0, 20, 40, 60, 80, 100, 120].map((v) => h("span", { style: `top:${(v / 1.2).toFixed(2)}%`, text: String(v) }))));
    }
    el.append(h("div", { class: "ah-svg", html: QK.gameArt.skelet(p, q) }));
    return el;
  }

  // Ranglar izohi: chap — koʻk, oʻng — toʻq sariq (odam orqasidan koʻrinadi)
  const ranglar = () => h("div", { class: "ah-ranglar" },
    h("span", { class: "ah-dog chap" }), h("span", { text: "chap" }),
    h("span", { class: "ah-dog ong" }), h("span", { text: "oʻng" }),
    h("span", { class: "ah-oq", text: "x → oʻngga, y ↓ pastga" }));

  // Koordinatalar jadvali: nuqta, x, y
  function jadval(p, idlar, belgi) {
    const qator = (id) => {
      const n = L.NUQTALAR.find((x) => x.id === id);
      return h("tr", { class: belgi && belgi.includes(id) ? "belgi" : null },
        h("td", null, h("span", { class: "ah-dog " + n.tomon }), h("span", { text: L.bosh(n.nom) })),
        h("td", { class: "son", text: String(p[id][0]) }),
        h("td", { class: "son", text: String(p[id][1]) }));
    };
    return h("table", { class: "ah-jadval" },
      h("thead", null, h("tr", null, h("th", { text: "Nuqta" }), h("th", { text: "x" }), h("th", { text: "y" }))),
      h("tbody", null, ...idlar.map(qator)));
  }

  const yonma = (...kids) => h("div", { class: "ah-yonma" }, ...kids);

  const qoidaKarta = () => h("div", { class: "ah-qoida" },
    h("div", { class: "ah-qoida-nom", text: "Qoidalar" }),
    ...L.QOIDALAR.map((q) => h("div", { text: q })));

  // Kadrlar qatori: raqam, kichik skelet va ostida son (tizza y − son y yoki son y)
  function kadrlar(list, o) {
    const q = o || {};
    const belgi = q.belgi || [];
    return h("div", { class: "ah-kadrlar-ora" },
      h("div", { class: "ah-izoh", text: q.korsat === "farq" ? "Kadr ostida: tizza y − son y" : `Kadr ostida: son y. Tizza y = ${L.TIZZA_Y} (oʻzgarmaydi)` }),
      h("div", { class: "ah-kadrlar" }, ...list.map((d, i) => h("div", { class: "ah-kadr" + (belgi.includes(i + 1) ? " belgi" : "") + (q.joriy === i + 1 ? " joriy" : "") },
        h("span", { class: "ah-kadr-n", text: String(i + 1) }),
        h("div", { class: "ah-kadr-svg", html: QK.gameArt.skelet(L.poza({ otir: d }), { mini: true, nom: `${i + 1}-kadr` }) }),
        h("span", { class: "ah-kadr-son", text: String(q.korsat === "farq" ? L.farq(d) : L.sonY(d)) })))));
  }

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
        host.append(answer(task.hisob));
        if (o.yechim) o.yechim(host);
      },
    });
  }

  // Variantlardan tanlash; o.tugmaYasa(v, submit) — oʻz tugmasi (masalan, skelet kartasi); o.sinf — tugmalar joylashuvi
  function tanlovExercise(task, opts) {
    const o = opts || {};
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        if (o.oldin) o.oldin(host);
        host.append(savol(task.matn));
        const tugmalar = task.variantlar.map((v) => (o.tugmaYasa ? o.tugmaYasa(v, submit) : ui.button(String(v), () => submit(v), "wide")));
        ui.control().append(h("div", { class: "ah-javoblar " + (o.sinf || "") }, ...tugmalar));
      },
      check: (value) => value === task.javob,
      // Maslahat javobni aytmaydi — nimaga qarash kerakligini aytadi
      hint() {
        host.append(note("↻ " + task.ishora));
        if (o.maslahat) o.maslahat(host);
      },
      solution() {
        host.append(answer("Toʻgʻri javob: " + task.javob));
        if (o.yechim) o.yechim(host);
        host.append(note(task.nega));
      },
    });
  }

  // ---------- Har bir savol turi uchun ekran ----------
  const nuqtaExercise = (task) => tanlovExercise(task, {
    sinf: "ikki",
    oldin: (host) => host.append(rasm(task.poza, { setka: task.setka, belgi: task.belgi }), ranglar()),
    yechim: (host) => host.append(jadval(task.poza, [task.nuqta])),
  });

  const chekkaExercise = (task) => tanlovExercise(task, {
    oldin: (host) => { if (task.rasm) host.append(rasm(task.poza, { kichik: true }), ranglar()); },
    yechim: (host) => { if (!task.rasm) host.append(rasm(task.poza, { kichik: true, setka: true })); },
  });

  const farqExercise = (task) => sonExercise(task, {
    oldin: (host) => { if (task.rasm) host.append(rasm(task.poza, { kichik: true, setka: true })); },
    yechim: (host) => { if (!task.rasm) host.append(rasm(task.poza, { kichik: true, setka: true })); },
  });

  // Skelet (boʻlsa) + koordinatalar jadvali yonma-yon
  function holatKorinish(task) {
    const j = jadval(task.poza, task.qatorlar);
    return task.rasm ? yonma(rasm(task.poza, { kichik: true }), j) : j;
  }

  const holatExercise = (task) => tanlovExercise(task, {
    sinf: "ikki",
    oldin: (host) => {
      host.append(holatKorinish(task));
      if (task.qoidalar) host.append(qoidaKarta());
    },
    maslahat: (host) => { if (!task.qoidalar) host.append(qoidaKarta()); },
    yechim: (host) => { if (!task.rasm) host.append(rasm(task.poza, { kichik: true })); },
  });

  const qolExercise = (task) => tanlovExercise(task, {
    sinf: "ikki",
    oldin: (host) => host.append(holatKorinish(task)),
    yechim: (host) => { if (!task.rasm) host.append(rasm(task.poza, { kichik: true })); },
  });

  // Javob — skelet kartasining oʻzini bosish
  const qaysiExercise = (task) => tanlovExercise(task, {
    sinf: "kartalar",
    tugmaYasa: (harf, submit) => {
      const k = task.kartalar.find((x) => x.harf === harf);
      const b = h("button", { class: "ah-karta", type: "button", "aria-label": `${harf}: ${k.sonlar.join(", ")}` },
        h("span", { class: "ah-harf", text: harf }),
        h("div", { class: "ah-karta-svg", html: QK.gameArt.skelet(k.poza, { mini: true, nom: `${harf} skelet` }) }),
        h("span", { class: "ah-karta-son" }, ...k.sonlar.map((s) => h("span", { text: s }))));
      b.addEventListener("click", () => { QK.sound.play("tap"); submit(harf); });
      return b;
    },
  });

  const sanashExercise = (task) => sonExercise(task, {
    oldin: (host) => host.append(kadrlar(task.kadrlar, { korsat: task.korsat })),
    yechim: (host) => host.append(kadrlar(task.kadrlar, { korsat: task.korsat, belgi: L.oshishlar(task.kadrlar) })),
  });

  const kadrExercise = (task) => tanlovExercise(task, {
    sinf: "ikki",
    oldin: (host) => host.append(kadrlar(task.kadrlar, { korsat: task.korsat })),
    yechim: (host) => host.append(kadrlar(task.kadrlar, { korsat: task.korsat, belgi: [task.kadr] })),
  });

  const EKRAN = {
    nuqta: nuqtaExercise, koordinata: nuqtaExercise, qaysiNuqta: nuqtaExercise, chekka: chekkaExercise, farq: farqExercise,
    holat: holatExercise, qol: qolExercise, qaysi: qaysiExercise,
    sanash: sanashExercise, nechanchi: kadrExercise, shovqin: kadrExercise,
  };
  const run = (task) => EKRAN[task.tur](task);

  // Toʻgʻri javobdan keyingi qisqa tasdiq
  const praise = (task) => task.qisqa || task.hisob || "Toʻgʻri.";

  QK.common = { box, note, answer, savol, rasm, ranglar, jadval, yonma, qoidaKarta, kadrlar, sonExercise, tanlovExercise, run, praise };
})(window);

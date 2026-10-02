// 51-o'yin: shu o'yinga xos ekran qismlari va mashq ekranlari.
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
    ui.paper("");
    const el = h("div", { class: "pbox" });
    ui.work().append(el);
    return el;
  }

  const note = (text) => h("div", { class: "note", text });
  const answer = (text) => h("div", { class: "answer", text });

  // ---------- Qismlar ----------
  // Sonning raqamlari rangli kataklarda; opts.yigindi — tagida "3+7+9+1 = 20"
  function sonKarta(son, opts) {
    const o = opts || {};
    const el = h("div", { class: "bq-karta" + (o.kichik ? " kichik" : "") });
    el.append(h("div", { class: "bq-qator-belgi" },
      ...String(son).split("").map((ch, k) => h("span", { class: "bq-belgi r" + (k % 4), text: ch }))));
    if (o.yigindi) el.append(h("div", { class: "bq-hisob", text: L.yigindiHisob(son) }));
    return el;
  }

  // Parol kartasi: belgilar, har belgining soni va (so'ralsa) izi
  function parolKarta(parol, opts) {
    const o = opts || {};
    const el = h("div", { class: "bq-karta" + (o.kichik ? " kichik" : "") });
    if (o.nom) el.append(h("div", { class: "bq-nom", text: o.nom }));
    el.append(h("div", { class: "bq-qator-belgi" },
      ...[...parol].map((ch) => h("span", { class: "bq-belgi" + (o.qiymat === false ? "" : " bilan"), text: ch },
        o.qiymat === false ? null : h("span", { class: "bq-qiymat", text: String(L.belgiQiymat(ch)) })))));
    if (o.iz) el.append(izChip(L.iz(parol, o.tuz || 0), o.belgi));
    return el;
  }

  // Iz chipi: "iz 53" (yashil), xohlasa ✓ yoki ↻ belgisi bilan
  const izChip = (x, belgi) => h("div", { class: "bq-iz" + (belgi === "✓" ? " togri" : belgi === "↻" ? " yana" : "") },
    h("span", { class: "bq-iz-nom", text: "iz" }),
    h("span", { class: "bq-iz-son", text: String(x) }),
    belgi ? h("span", { class: "bq-iz-belgi", text: belgi }) : null);

  // Alifbo jadvali: a=1 … z=26 (qo'lda hisoblash uchun)
  const alifboJadval = () => h("div", { class: "bq-alifbo" },
    ...[...L.ALIFBO].map((ch, k) => h("span", { class: "bq-harf" },
      h("b", { text: ch }), h("i", { text: String(k + 1) }))));

  // Uch qadamli qoida
  const qoidaQuti = (tuz) => h("div", { class: "bq-qoida" },
    h("div", { class: "bq-qoida-qadam" }, h("span", { class: "bq-raqam", text: "1" }),
      h("span", { text: "Har belgini songa aylantir: harf — alifbodagi oʻrni, raqam — oʻzi." })),
    h("div", { class: "bq-qoida-qadam" }, h("span", { class: "bq-raqam", text: "2" }),
      h("span", { text: "Chapdan boshla: izni 3 ga koʻpaytir, belgining sonini qoʻsh." })),
    h("div", { class: "bq-qoida-qadam" }, h("span", { class: "bq-raqam", text: "3" }),
      h("span", { text: "Faqat oxirgi ikki raqamni qoldir: 184 → 84." })),
    h("div", { class: "bq-qoida-boshlanish", text: tuz ? "Boshlangʻich iz — saytning tuzi: " + tuz : "Boshlangʻich iz — 0." }));

  // Hisob jadvali: har qadam alohida qatorda
  function izJadval(qadamlar) {
    const el = h("div", { class: "bq-jadval" });
    for (const q of qadamlar) {
      el.append(h("div", { class: "bq-jadval-qator" },
        h("span", { class: "bq-belgi", text: q.belgi }),
        h("span", { class: "bq-hisob", text: q.oldin + " × 3 + " + q.qiymat + " = " + q.xom }),
        h("span", { class: "bq-iz-son", text: String(q.iz) })));
    }
    return el;
  }

  // Saytlar jadvali: bitta parol — har saytda boshqa iz
  function tuzJadval(parol) {
    const el = h("div", { class: "bq-jadval" });
    for (const qator of L.tuzJadval(parol)) {
      el.append(h("div", { class: "bq-jadval-qator" },
        h("span", { class: "bq-sayt", text: qator.sayt.nom }),
        h("span", { class: "bq-hisob", text: "tuz " + qator.sayt.tuz }),
        h("span", { class: "bq-iz-son", text: String(qator.iz) })));
    }
    return el;
  }

  // ---------- Mashq ekranlari ----------
  // Raqam klaviaturasi bilan javob
  function sonExercise(task, opts) {
    const o = opts || {};
    const host = box(true);
    if (o.oldin) o.oldin(host);
    host.append(h("div", { class: "bq-savol", text: task.matn }));
    if (o.keyin) o.keyin(host);
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

  // Variantlardan tanlash
  function tanlovExercise(task, opts) {
    const o = opts || {};
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        if (o.oldin) o.oldin(host);
        host.append(h("div", { class: "bq-savol", text: task.matn }));
        if (o.keyin) o.keyin(host);
        ui.control().append(h("div", { class: "bq-javoblar" + (o.qator ? " qator" : "") },
          ...task.variantlar.map((v) => ui.button(String(v), () => submit(v), o.qator ? "" : "wide"))));
      },
      check: (value) => value === task.javob,
      // Maslahat javobni aytmaydi: ishora (usul) bo'lsa — o'sha
      hint() { host.append(note("↻ " + (task.ishora || task.nega))); },
      solution() {
        host.append(answer(String(task.javob)));
        if (o.yechim) o.yechim(host);
        host.append(note(task.nega));
      },
    });
  }

  // ---------- Har bir savol turi uchun ekran ----------
  const yigindiExercise = (task) => sonExercise(task, {
    oldin: (host) => host.append(sonKarta(task.son)),
    yechim: (host) => host.append(note(task.nega)),
  });

  const toqnashExercise = (task) => tanlovExercise(task, {
    oldin: (host) => host.append(sonKarta(task.son, { yigindi: true })),
    qator: true,
    yechim: (host) => host.append(sonKarta(Number(task.javob), { yigindi: true })),
  });

  const qaytarExercise = (task) => tanlovExercise(task, {
    oldin: (host) => host.append(h("div", { class: "bq-juft" },
      sonKarta(task.son, { yigindi: true, kichik: true }),
      sonKarta(task.juft, { yigindi: true, kichik: true }))),
  });

  const izExercise = (task) => sonExercise(task, {
    oldin: (host) => host.append(parolKarta(task.parol)),
    keyin: (host) => host.append(alifboJadval(), qoidaQuti(0)),
    yechim: (host) => host.append(izJadval(task.qadamlar)),
  });

  // "Qaysi parolning izi ham shu?" — berilgan parolning izi ko'rinib turadi, nomzodlarnikini bola hisoblaydi
  const tengExercise = (task) => tanlovExercise(task, {
    oldin: (host) => host.append(parolKarta(task.parol, { qiymat: false, iz: true, kichik: true })),
    keyin: (host) => host.append(alifboJadval()),
    qator: true,
    yechim: (host) => host.append(h("div", { class: "bq-juft" },
      ...task.nomzodlar.map((p) => parolKarta(p, { iz: true, kichik: true, belgi: L.iz(p) === task.iz ? "✓" : null })))),
  });

  const holatExercise = (task) => tanlovExercise(task, {});

  const tuzExercise = (task) => sonExercise(task, {
    oldin: (host) => host.append(h("div", { class: "bq-sayt-karta" },
      h("span", { class: "bq-sayt", text: task.sayt.nom }),
      h("span", { class: "bq-tuz", text: "tuz " + task.sayt.tuz }))),
    keyin: (host) => host.append(parolKarta(task.parol), qoidaQuti(task.sayt.tuz)),
    yechim: (host) => host.append(izJadval(task.qadamlar)),
  });

  const EKRAN = {
    yigindi: yigindiExercise, toqnash: toqnashExercise, qaytar: qaytarExercise,
    iz: izExercise, teng: tengExercise, holat: holatExercise, tuz: tuzExercise,
  };

  const run = (task) => EKRAN[task.tur](task);

  // Mashq tugagach aytiladigan maqtov
  function praise(task) {
    if (task.tur === "yigindi") return task.hisob;
    if (task.tur === "toqnash") return task.hisob + " — bir xil yigʻindi.";
    if (task.tur === "iz" || task.tur === "tuz") return "Iz = " + task.javob;
    if (task.tur === "teng") return task.javob === L.HECH ? "Hech birining izi " + task.iz + " emas." : "«" + task.javob + "» ning izi ham " + task.iz + " — toʻqnashuv.";
    return task.nega;
  }

  QK.common = { box, note, answer, sonKarta, parolKarta, izChip, alifboJadval, qoidaQuti,
    izJadval, tuzJadval, sonExercise, tanlovExercise, run, praise };
})(window);

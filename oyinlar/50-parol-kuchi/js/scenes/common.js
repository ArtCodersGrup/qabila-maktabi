// 50-o'yin: ekran qismlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;
  const { ui, logic: L, sanash: S, practice } = QK;
  const h = ui.h;

  // Parol kartasi: belgilari, turlari, variantlar soni va vaqt
  function parolKarta(parol, opts) {
    const o = opts || {};
    const t = L.tahlil(parol);
    const el = h("div", { class: "pk-karta" });
    el.append(h("div", { class: "pk-parol" }, ...[...parol].map((ch) =>
      h("span", { class: "pk-belgi " + (L.TURLAR.find((x) => x.test(ch)) || { id: "boshqa" }).id, text: ch === " " ? "␣" : ch }))));
    el.append(h("div", { class: "pk-turlar" },
      h("span", { class: "pk-uzunlik", text: t.uzunlik + " ta belgi" }),
      ...t.turlar.map((x) => h("span", { class: "pk-tur " + x.id, text: x.nom }))));
    if (o.hisob !== false) {
      el.append(h("div", { class: "pk-hisob", text: t.alifbo + "^" + t.uzunlik + " = " + S.chiroyli(t.variant) + " variant" }));
    }
    if (o.vaqt) {
      const b = L.baho(parol);
      el.append(h("div", { class: "pk-vaqt " + b.daraja.replace("ʻ", "") },
        h("b", { text: b.sek !== undefined ? L.vaqtMatni(b.sek) : "darhol" }),
        h("span", { text: " — " + b.daraja })));
    }
    return el;
  }

  const darajaChip = (daraja) => h("span", { class: "pk-daraja " + daraja.replace("ʻ", ""), text: daraja });

  // Son bilan javob (variantlar soni)
  function variantExercise(task) {
    const host = M.box(true);
    host.append(h("div", { class: "pk-savol", text: task.matn }));
    host.append(h("div", { class: "pk-formula" },
      h("span", { class: "pk-alifbo", text: String(task.alifbo) }),
      h("sup", { text: String(task.uzunlik) }),
      h("span", { text: " = ?" })));
    const javob = Number(task.javob);
    return practice.numberTries({
      answer: javob,
      maxLen: String(javob).length + 1,
      hint() { host.append(M.note("↻ " + task.nega)); },
      solution() { host.append(M.answer(task.hisob)); },
    });
  }

  // Variantlardan tanlash (vaqt, qiyos, baho)
  function tanlovExercise(task, opts) {
    const o = opts || {};
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box(true);
        if (o.oldin) o.oldin(host);
        host.append(h("div", { class: "pk-savol", text: task.matn }));
        ui.control().append(...(o.variantlar || task.variantlar).map((v) =>
          ui.button(o.yorliq ? o.yorliq(v) : v, () => submit(v), o.cls || "big")));
      },
      check: (value) => value === task.javob,
      // Maslahat javobni aytmaydi: usul (ishora) bo'lsa — o'sha, bo'lmasa qoida
      hint() { host.append(M.note("↻ " + (task.ishora || task.nega))); },
      solution() {
        host.append(M.answer(o.javobMatni ? o.javobMatni(task) : String(task.javob)));
        if (o.keyin) o.keyin(host);
        host.append(M.note(task.nega));
      },
    });
  }

  const vaqtExercise = (task) => tanlovExercise(task, {
    oldin: (host) => {
      host.append(h("div", { class: "pk-hisob katta", text: task.alifbo + "^" + task.uzunlik + " = "
        + S.chiroyli(S.takrorli(task.alifbo, task.uzunlik)) + " variant" }));
    },
    keyin: (host) => host.append(M.note(task.hisob)),
  });

  // To'rt paroldan eng kuchlisi: parollar — tugmalarda; yechimda hammasining vaqti ko'rsatiladi
  const qiyosExercise = (task) => tanlovExercise(task, {
    cls: "pk-parol-btn",
    keyin: (host) => host.append(h("div", { class: "pk-ikki" }, ...task.variantlar.map((p) => parolKarta(p, { hisob: false, vaqt: true })))),
  });

  // Baho + sababi: 5 variant
  const bahoExercise = (task) => tanlovExercise(task, {
    cls: "pk-sabab-btn",
    oldin: (host) => host.append(parolKarta(task.parol, { hisob: false })),
    keyin: (host) => host.append(parolKarta(task.parol, { vaqt: true })),
  });

  // Parolni o'zing yasa: so'z kartalarini bosib ibora yig'iladi, "Tekshir" — vaqt ko'rsatiladi
  function yasaExercise(task) {
    let host = null;
    let joy = null;
    let malumot = null;
    const sozlar = [];
    let ochiq = true;
    const chiz = () => {
      joy.innerHTML = "";
      if (!sozlar.length) joy.append(h("span", { class: "pk-yasa-bosh", text: "soʻzlarni bos" }));
      sozlar.forEach((x) => joy.append(h("span", { class: "pk-soz", text: x })));
      const uzunlik = sozlar.join(" ").length;
      malumot.textContent = sozlar.length + " ta soʻz, " + uzunlik + " ta belgi";
    };
    return practice.tries({
      setup(submit) {
        host = M.box(true);
        host.append(h("div", { class: "pk-savol", text: task.matn }));
        joy = h("div", { class: "pk-yasa" });
        malumot = h("div", { class: "pk-uzunlik" });
        host.append(joy, malumot);
        chiz();
        const kartalar = h("div", { class: "pk-kartalar" }, ...task.kartalar.map((x) => {
          const b = h("button", { class: "pk-soz-btn", type: "button", text: x });
          b.addEventListener("click", () => {
            if (!ochiq || sozlar.length >= 6) return;
            sozlar.push(x);
            QK.sound.play("tap");
            chiz();
          });
          return b;
        }));
        ui.control().append(kartalar, h("div", { class: "choice-row" },
          ui.button("⌫", () => { if (ochiq) { sozlar.pop(); chiz(); } }, "secondary"),
          ui.button("Tekshir ✓", () => {
            if (!sozlar.length) { ui.toast("Avval soʻzlarni tanla."); return; }
            submit(sozlar.slice());
          })));
      },
      check(value) {
        const n = L.yasaTekshir(task, value);
        host.__natija = n;
        if (n.ok) { task.yasalgan = n.parol; task.vaqt = L.vaqtMatni(n.sek); }
        return n.ok;
      },
      hint() { host.append(M.note("↻ " + host.__natija.sabab + " " + task.ishora)); },
      solution() {
        ochiq = false;
        const namuna = task.kartalar.filter((x) => !L.TUZOQ.includes(x)).slice(0, task.maqsad.minSoz).join(" ");
        host.append(M.note(host.__natija.sabab), M.answer("Masalan:"), parolKarta(namuna, { hisob: false, vaqt: true }));
      },
    }).then((ok) => {
      ochiq = false;
      if (ok) host.append(parolKarta(task.yasalgan, { vaqt: true }));
      return ok;
    });
  }

  QK.common = Object.assign({}, M, { parolKarta, darajaChip, variantExercise, tanlovExercise, vaqtExercise, qiyosExercise, bahoExercise, yasaExercise });
})(window);

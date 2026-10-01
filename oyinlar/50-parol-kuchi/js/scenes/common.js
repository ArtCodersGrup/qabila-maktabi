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
          ui.button(o.yorliq ? o.yorliq(v) : v, () => submit(v), "big")));
      },
      check: (value) => value === task.javob,
      hint() { host.append(M.note("↻ " + task.nega)); },
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

  const qiyosExercise = (task) => tanlovExercise(task, {
    oldin: (host) => host.append(h("div", { class: "pk-ikki" }, ...task.variantlar.map((p) => parolKarta(p, { hisob: false })))),
    keyin: (host) => host.append(h("div", { class: "pk-ikki" }, ...task.variantlar.map((p) => parolKarta(p, { vaqt: true })))),
  });

  const bahoExercise = (task) => tanlovExercise(Object.assign({}, task, { variantlar: L.DARAJALAR }), {
    oldin: (host) => host.append(parolKarta(task.parol, { hisob: false })),
    keyin: (host) => host.append(parolKarta(task.parol, { vaqt: true })),
  });

  QK.common = Object.assign({}, M, { parolKarta, darajaChip, variantExercise, tanlovExercise, vaqtExercise, qiyosExercise, bahoExercise });
})(window);

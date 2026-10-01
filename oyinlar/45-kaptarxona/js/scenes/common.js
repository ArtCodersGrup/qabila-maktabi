// 45-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;
  const { ui, logic: L, sanash: S, practice } = QK;
  const h = ui.h;

  // Kaptarxona: har uya — bitta ustun; ichidagi kaptarlar doira bo'lib turadi.
  // onPick berilsa, uyalar bosiladigan tugmaga aylanadi (QOIDALAR §3: sudrash yo'q).
  function uyalar(qutilar, opts) {
    const o = opts || {};
    const el = h("div", { class: "kx-uyalar" });
    qutilar.forEach((soni, k) => {
      const tola = o.belgi && soni >= o.belgi;
      const ichi = h("span", { class: "kx-ichi" },
        ...Array.from({ length: soni }, () => h("span", { class: "kx-kaptar" })));
      const uya = o.onPick
        ? h("button", { class: "kx-uya bosiladi" + (tola ? " tola" : ""), type: "button" }, ichi, h("span", { class: "kx-raqam", text: String(k + 1) }))
        : h("div", { class: "kx-uya" + (tola ? " tola" : "") }, ichi, h("span", { class: "kx-raqam", text: String(k + 1) }));
      if (o.onPick) uya.addEventListener("click", () => o.onPick(k));
      el.append(uya);
    });
    return el;
  }

  const qolgan = (n) => h("div", { class: "kx-qolgan" },
    h("span", { text: "Qoʻlda: " }),
    ...Array.from({ length: n }, () => h("span", { class: "kx-kaptar" })));

  const hisobQator = (matn) => h("div", { class: "kx-hisob", text: matn });

  // "Eng yomon holat" chiplari: har turdan m−1 tadan
  const yomonHolat = (k, m) => h("div", { class: "kx-yomon" },
    ...Array.from({ length: k }, (_, i) => h("span", { class: "kx-tur rang" + (i % 5) },
      ...Array.from({ length: m - 1 }, () => h("span", { class: "kx-nuqta" })))));

  function sinovJadval(list) {
    const el = h("table", { class: "kx-jadval" });
    el.append(h("thead", {}, h("tr", {},
      h("th", { text: "Narsa" }), h("th", { text: "Quti" }), h("th", { text: "Nechta joylashuv bor" }))));
    const body = h("tbody");
    for (const s of list) {
      body.append(h("tr", {},
        h("td", { text: String(s.n) }),
        h("td", { text: String(s.k) }),
        h("td", { class: s.variant > 1000000n ? "katta" : "", text: S.chiroyli(s.variant) })));
    }
    el.append(body);
    return el;
  }

  function sonExercise(task, opts) {
    const o = opts || {};
    const host = M.box(true);
    if (o.oldin) o.oldin(host);
    host.append(h("div", { class: "kx-savol", text: task.matn }));
    const javob = Number(task.javob);
    return practice.numberTries({
      answer: javob,
      maxLen: String(javob).length + 1,
      hint() { host.append(M.note("↻ " + (o.ishora || task.nega))); },
      solution() {
        host.append(M.answer(task.hisob));
        host.append(M.note(task.nega));
      },
    });
  }

  const dirixleExercise = (task) => sonExercise(task, {
    ishora: "Eng tekis taqsimlansa nima boʻladi? Har qutiga tengdan boʻlib koʻr.",
  });

  const kerakExercise = (task) => sonExercise(task, {
    oldin: (host) => host.append(yomonHolat(task.k, task.m)),
    ishora: "Eng yomon holatni oʻyla: har turdan " + (task.m - 1) + " tadan chiqdi. Yana bittasi nima qiladi?",
  });

  const kodExercise = (task) => M.resultExercise(task);
  const yozishExercise = (task) => M.writeExercise(task);

  QK.common = Object.assign({}, M, { uyalar, qolgan, hisobQator, yomonHolat, sinovJadval, sonExercise, dirixleExercise, kerakExercise, kodExercise, yozishExercise });
})(window);

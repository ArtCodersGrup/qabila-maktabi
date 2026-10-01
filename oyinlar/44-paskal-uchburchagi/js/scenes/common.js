// 44-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;
  const { ui, logic: L, sanash: S, practice } = QK;
  const h = ui.h;

  // Uchburchak: qatorlar markazga tekislanadi. opts:
  //   chek — nechta qator ko'rinadi; belgi {n,k}; tepa {n,k} — tepasidagi ikkitasi;
  //   yashirin {n,k} — "?"; qator — butun qatorni belgilash; diagonal — qiyshiq qator
  function uchburchak(opts) {
    const o = opts || {};
    const chek = o.chek == null ? L.JADVAL.length - 1 : o.chek;
    const [tepaChap, tepaOng] = o.tepa ? [[o.tepa.n - 1, o.tepa.k - 1], [o.tepa.n - 1, o.tepa.k]] : [null, null];
    const el = h("div", { class: "ps-uchburchak" });
    for (let n = 0; n <= chek; n++) {
      const qator = h("div", { class: "ps-qator" + (o.qator === n ? " belgi" : "") });
      for (let k = 0; k <= n; k++) {
        const yashirin = o.yashirin && o.yashirin.n === n && o.yashirin.k === k;
        const belgi = o.belgi && o.belgi.n === n && o.belgi.k === k;
        const tepaBelgi = (tepaChap && tepaChap[0] === n && tepaChap[1] === k)
          || (tepaOng && tepaOng[0] === n && tepaOng[1] === k);
        const diagonal = o.diagonal != null && (k === o.diagonal || (o.simmetrik && k === n - o.diagonal));
        qator.append(h("span", {
          class: "ps-katak" + (belgi ? " belgi" : "") + (tepaBelgi ? " tepa" : "") + (yashirin ? " yashirin" : "") + (diagonal ? " diagonal" : ""),
          text: yashirin ? "?" : String(L.katak(n, k)),
        }));
      }
      el.append(qator);
    }
    return el;
  }

  const hisobQator = (matn) => h("div", { class: "ps-hisob", text: matn });

  const xossaRoyxat = () => h("div", { class: "ps-xossalar" },
    ...L.XOSSALAR.map((x) => h("div", { class: "ps-xossa" },
      h("b", { text: x.nom }),
      h("span", { text: x.izoh }))));

  function sonExercise(task, opts) {
    const o = opts || {};
    const host = M.box(true);
    if (o.oldin) o.oldin(host);
    if (task.matn) host.append(h("div", { class: "ps-savol", text: task.matn }));
    const javob = Number(task.javob);
    return practice.numberTries({
      answer: javob,
      maxLen: String(javob).length + 1,
      hint() { host.append(M.note("↻ " + (o.ishora || task.nega))); },
      solution() {
        host.append(M.answer(task.hisob));
        if (o.keyin) o.keyin(host);
      },
    });
  }

  const katakExercise = (task) => sonExercise(Object.assign({}, task, { matn: "Belgilangan katakda qaysi son turadi?" }), {
    oldin: (host) => host.append(uchburchak({ chek: task.n, yashirin: { n: task.n, k: task.k }, tepa: { n: task.n, k: task.k } })),
    ishora: task.nega,
  });

  const oqishExercise = (task) => sonExercise(task, {
    oldin: (host) => host.append(uchburchak({ chek: L.JADVAL.length - 1 })),
    ishora: task.nega,
  });

  const yigindiExercise = (task) => sonExercise(task, {
    oldin: (host) => host.append(uchburchak({ chek: L.JADVAL.length - 1, qator: task.n })),
    ishora: task.nega,
  });

  const kodExercise = (task) => M.resultExercise(task);
  const yozishExercise = (task) => M.writeExercise(task);

  QK.common = Object.assign({}, M, { uchburchak, hisobQator, xossaRoyxat, sonExercise, katakExercise, oqishExercise, yigindiExercise, kodExercise, yozishExercise });
})(window);

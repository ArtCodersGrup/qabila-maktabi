// 43-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;
  const { ui, logic: L, sanash: S, practice } = QK;
  const h = ui.h;

  const ismlar = (list, klass) => h("div", { class: "jt-ismlar" + (klass ? " " + klass : "") },
    ...list.map((ism) => h("span", { class: "jt-ism", text: ism })));

  // Tartiblar ro'yxati: bir xil jamoaning tartiblari yonma-yon turadi (takror ko'rinadi)
  function tartibRoyxat(list, belgilangan) {
    const el = h("div", { class: "jt-royxat" });
    list.forEach((t, k) => {
      const kalit = [...t].sort().join("|");
      const belgi = belgilangan && kalit === belgilangan;
      el.append(h("div", { class: "jt-qator" + (belgi ? " belgi" : "") },
        h("span", { class: "jt-raqam", text: String(k + 1) + "." }),
        ...t.map((ism) => h("span", { class: "jt-ism kichik", text: ism }))));
    });
    return el;
  }

  // Jamoalar (tartibsiz): har biri bitta karta
  const jamoaRoyxat = (list) => h("div", { class: "jt-jamoalar" },
    ...list.map((j, k) => h("div", { class: "jt-jamoa" },
      h("span", { class: "jt-raqam", text: String(k + 1) + "." }), ismlar(j))));

  const hisobQator = (matn) => h("div", { class: "jt-hisob", text: matn });

  // Bo'lish ko'rsatkichi: A ÷ k! = C
  const bolishQator = (n, k) => {
    const b = L.bolish(n, k);
    return h("div", { class: "jt-bolish" },
      h("span", { class: "jt-katak a" }, h("b", { text: String(b.a) }), h("span", { text: "tartib" })),
      h("span", { class: "jt-amal", text: "÷" }),
      h("span", { class: "jt-katak f" }, h("b", { text: String(b.kfakt) }), h("span", { text: k + "! takror" })),
      h("span", { class: "jt-amal", text: "=" }),
      h("span", { class: "jt-katak c" }, h("b", { text: String(b.c) }), h("span", { text: "jamoa" })));
  };

  function sonExercise(task, opts) {
    const o = opts || {};
    const host = M.box(true);
    if (o.oldin) o.oldin(host);
    host.append(h("div", { class: "jt-savol", text: task.matn || "" }));
    const javob = Number(task.javob);
    return practice.numberTries({
      answer: javob,
      maxLen: String(javob).length + 1,
      hint() { host.append(M.note("↻ " + (o.ishora || task.nega))); },
      solution() {
        host.append(M.answer(task.hisob));
        if (task.nega) host.append(M.note(task.nega));
      },
    });
  }

  const tartibExercise = (task) => sonExercise(task, {
    ishora: "Ikki bolaning oʻrni almashsa, bu boshqa javobmi? Boshqa boʻlsa — tartib muhim.",
  });

  const kodExercise = (task) => sonExercise(Object.assign({}, task, { matn: "Bu kod nima chiqaradi?" }), {
    oldin: (host) => host.append(QK.kodUI.codeBlock(task.code)),
    ishora: "j har doim i dan katta — demak har juftlik bir marta sanaladi.",
  });

  const yozishExercise = (task) => M.writeExercise(task);

  QK.common = Object.assign({}, M, { ismlar, tartibRoyxat, jamoaRoyxat, hisobQator, bolishQator, sonExercise, tartibExercise, kodExercise, yozishExercise });
})(window);

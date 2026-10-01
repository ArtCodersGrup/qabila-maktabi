// 41-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;
  const { ui, logic: L, sanash: S, practice } = QK;
  const h = ui.h;

  // Tanlov daraxti: har shox — 1-qadamning bitta elementi, barglari — 2-qadam.
  // SVG emas, HTML: QOIDALAR §6 (SVG ichida matn yo'q).
  function daraxt(holat, nechta) {
    const [birinchi, ikkinchi] = holat.qadamlar;
    const chek = nechta == null ? birinchi.elementlar.length : nechta;
    const el = h("div", { class: "dx-daraxt" });
    birinchi.elementlar.slice(0, chek).forEach((bosh) => {
      el.append(h("div", { class: "dx-shox" },
        h("span", { class: "dx-bosh", text: bosh }),
        h("span", { class: "dx-chiziq" }),
        h("span", { class: "dx-barglar" },
          ...ikkinchi.elementlar.map((barg) => h("span", { class: "dx-barg", text: barg })))));
    });
    return el;
  }

  const sarlavha = (holat) => h("div", { class: "dx-sarlavha" },
    ...holat.qadamlar.map((q) => h("span", { class: "dx-qadam", text: q.nom + ": " + q.elementlar.length + " ta" })));

  // Barglar ro'yxati — formulani ro'yxat tasdiqlaydi
  function royxat(holat, chek) {
    const list = L.barglar(holat);
    const el = h("div", { class: "dx-royxat" });
    list.slice(0, chek == null ? list.length : chek).forEach((barg, k) => {
      el.append(h("div", { class: "dx-qator" },
        h("span", { class: "dx-raqam", text: String(k + 1) + "." }),
        h("span", { text: barg.join(" + ") })));
    });
    return el;
  }

  const hisobQator = (matn) => h("div", { class: "dx-hisob", text: matn });

  // Son bilan javob beriladigan savol (ko'paytirish, VA/YOKI va kod natijasi uchun)
  function sonExercise(task, opts) {
    const o = opts || {};
    const host = M.box(true);
    if (o.oldin) o.oldin(host);
    host.append(h("div", { class: "dx-savol", text: task.matn || "" }));
    const javob = Number(task.javob);
    return practice.numberTries({
      answer: javob,
      maxLen: String(javob).length + 1,
      hint() { host.append(M.note("↻ " + (o.ishora || task.nega || "Qadamlarni ajrat: har qadamda nechta tanlov bor?"))); },
      solution() {
        host.append(M.answer(task.hisob || String(javob)));
        if (task.nega) host.append(M.note(task.nega));
      },
    });
  }

  const vaExercise = (task) => sonExercise(task, { ishora: "Har qadamda nechta tanlov bor? Hammasini koʻpaytir." });

  const qoidaExercise = (task) => sonExercise(task, {
    ishora: "Ikkala tanlov ham qilinadimi (VA → koʻpaytirish), yoki faqat bittasimi (YOKI → qoʻshish)?",
  });

  // Kod natijasi: sikl hamma juftlikni sanaydi
  const kodExercise = (task) => sonExercise(Object.assign({}, task, {
    matn: "Bu kod nima chiqaradi?",
    hisob: task.qiymat.join(" × ") + " = " + task.javob,
  }), {
    oldin: (host) => host.append(QK.kodUI.codeBlock(task.code)),
    ishora: "Ichki sikl tashqi siklning har aylanishida toʻliq aylanadi.",
  });

  const yozishExercise = (task) => M.writeExercise(task);

  QK.common = Object.assign({}, M, { daraxt, sarlavha, royxat, hisobQator, sonExercise, vaExercise, qoidaExercise, kodExercise, yozishExercise });
})(window);

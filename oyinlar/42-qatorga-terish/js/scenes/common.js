// 42-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;
  const { ui, logic: L, sanash: S, practice } = QK;
  const h = ui.h;

  // Tartiblar ro'yxati: har qator — bitta tartib (ismlar ketma-ketligi)
  function tartibRoyxat(list, chek) {
    const el = h("div", { class: "qt-royxat" });
    list.slice(0, chek == null ? list.length : chek).forEach((t, k) => {
      el.append(h("div", { class: "qt-qator" },
        h("span", { class: "qt-raqam", text: String(k + 1) + "." }),
        ...t.map((ism) => h("span", { class: "qt-ism", text: ism }))));
    });
    return el;
  }

  // Qadamlar: 1-o'ringa n xil, 2-o'ringa n−1 xil …
  function qadamChiplar(qadamlar, nomlar) {
    const el = h("div", { class: "qt-qadamlar" });
    qadamlar.forEach((v, k) => {
      if (k) el.append(h("span", { class: "qt-belgi", text: "×" }));
      el.append(h("span", { class: "qt-qadam" },
        h("b", { text: String(v) }),
        h("span", { class: "qt-qadam-nom", text: (nomlar && nomlar[k]) || (k + 1) + "-oʻrin" })));
    });
    return el;
  }

  // n! jadvali: son qancha tez o'sishini ko'rsatadi
  function osishJadval(qatorlar) {
    const el = h("table", { class: "qt-jadval" });
    el.append(h("thead", {}, h("tr", {}, h("th", { text: "n" }), h("th", { text: "n! — nechta tartib" }))));
    const body = h("tbody");
    for (const q of qatorlar) {
      body.append(h("tr", {},
        h("td", { class: "qt-n", text: String(q.n) }),
        h("td", { class: q.n >= 15 ? "katta" : "", text: S.chiroyli(q.qiymat) })));
    }
    el.append(body);
    return el;
  }

  const hisobQator = (matn) => h("div", { class: "qt-hisob", text: matn });

  // Son bilan javob
  function sonExercise(task, opts) {
    const o = opts || {};
    const host = M.box(true);
    if (o.oldin) o.oldin(host);
    host.append(h("div", { class: "qt-savol", text: task.matn || "" }));
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

  const faktExercise = (task) => sonExercise(task, {
    oldin: (host) => host.append(qadamChiplar(L.qadamlar(task.n))),
    ishora: task.nega,
  });

  const orinExercise = (task) => sonExercise(task, {
    ishora: "Nechta oʻrin bor? Har oʻringa nechta nomzod qoladi? Shularni koʻpaytir.",
  });

  const kodExercise = (task) => sonExercise(Object.assign({}, task, { matn: "Bu kod nima chiqaradi?" }), {
    oldin: (host) => host.append(QK.kodUI.codeBlock(task.code)),
    ishora: "Siklni qadam-baqadam kuzat: k har aylanishda nechaga koʻpayadi?",
  });

  const yozishExercise = (task) => M.writeExercise(task);

  QK.common = Object.assign({}, M, { tartibRoyxat, qadamChiplar, osishJadval, hisobQator, sonExercise, faktExercise, orinExercise, kodExercise, yozishExercise });
})(window);

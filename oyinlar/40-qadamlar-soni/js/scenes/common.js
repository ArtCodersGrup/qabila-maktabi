// 40-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;
  const { ui, logic: L, practice } = QK;
  const h = ui.h;

  const ENG_NISBAT = 4.4; // grafik shkalasi: O(n²) ham sig'adi
  const nis = (r) => "×" + (r < 1.05 ? "1" : r.toFixed(1));

  // O'sish grafigi: har usul uchun "n ikki barobar oshsa, qadam necha barobar".
  // Absolyut qadamlar emas — ular jadvalda; bu yerda faqat o'sish solishtiriladi.
  function osishGrafik(qatorlar) {
    const el = h("div", { class: "os-grafik" });
    for (const q of qatorlar) {
      const ulush = Math.max(6, Math.round((Math.min(q.nisbat, ENG_NISBAT) / ENG_NISBAT) * 100));
      el.append(h("div", { class: "os-qator" },
        h("div", { class: "os-nom", text: q.nom }),
        h("div", { class: "os-yol" },
          h("span", { class: "os-tayoq s-" + (q.sinf || "yangi"), style: "width:" + ulush + "%" }),
          h("b", { class: "os-nisbat", text: nis(q.nisbat) })),
        h("div", { class: "os-sinf", text: q.sinf ? L.sinfById(q.sinf).nom : "?" })));
    }
    el.append(h("div", { class: "os-izoh", text: "n ikki barobar oshganda qadam necha barobar oshadi" }));
    return el;
  }

  // O'lchov jadvali: n | qadam | nisbat. ochiq — nechta qator ko'rinadi.
  function olchovJadval(olchov, ochiq) {
    const el = h("table", { class: "os-jadval" });
    el.append(h("thead", {}, h("tr", {},
      h("th", { text: "n" }),
      h("th", { text: "Qadamlar" }),
      h("th", { text: "Oldingidan" }))));
    const body = h("tbody");
    const chek = ochiq == null ? olchov.length : ochiq;
    olchov.forEach((o, k) => {
      const yopiq = k >= chek;
      const oldin = k > 0 ? olchov[k - 1].qadam : 0;
      body.append(h("tr", { class: yopiq ? "yopiq" : "" },
        h("td", { class: "os-n", text: String(o.n) }),
        h("td", { text: yopiq ? "?" : String(o.qadam) }),
        h("td", { class: "os-nis", text: yopiq || !oldin ? "—" : nis(o.qadam / oldin) })));
    });
    el.append(body);
    return el;
  }

  const kodKorsat = (namuna) => h("div", { class: "os-kod" },
    h("div", { class: "os-kod-nom", text: namuna.nom }),
    QK.kodUI.codeBlock(namuna.korsat));

  // 1-bosqich: ikki o'lchov berilgan — uchinchisi qanday bo'ladi?
  function bashoratExercise(task) {
    let host = null;
    const hammasi = task.korinadigan.concat([task.yashirin]);
    const nomi = (id) => (L.BASHORAT.find((b) => b.id === id) || {}).nom;
    const koklash = () => {
      host.append(M.note("Oʻlchov: n = " + task.yashirin.n + " da " + task.yashirin.qadam + " qadam."));
      host.append(olchovJadval(hammasi));
    };
    return practice.tries({
      setup(submit) {
        host = M.box(true);
        host.append(kodKorsat(task.namuna));
        host.append(olchovJadval(hammasi, 2));
        host.append(M.note("n yana ikki barobar oshsa (" + task.yashirin.n + "), qadam nima boʻladi?"));
        ui.control().append(...L.BASHORAT.map((b) => ui.button(b.nom, () => submit(b.id), "big")));
      },
      check: (value) => value === task.javob,
      hint() {
        host.append(M.note("↻ Birinchi ikki qatorga qara: " + task.korinadigan[0].qadam + " → "
          + task.korinadigan[1].qadam + ". n ikki barobar oshganda qadam qanday oʻzgardi? Shu yana takrorlanadi."));
      },
      solution() {
        host.append(M.answer(nomi(task.javob)));
        koklash();
      },
    });
  }

  // 2-bosqich: o'lchovga qarab nom tanlash
  function sinfExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box(true);
        host.append(kodKorsat(task.namuna));
        host.append(olchovJadval(task.olchov));
        host.append(M.note("Bu kodning oʻsishi qaysi nom bilan ataladi?"));
        ui.control().append(...L.SINFLAR.map((s) => ui.button(s.nom, () => submit(s.id), "big")));
      },
      check: (value) => value === task.javob,
      hint() {
        host.append(M.note("↻ Oxirgi ustunga qara: n ikki barobar oshganda qadam " + nis(task.nisbat)
          + " boʻldi. Toʻrt nomdan qaysi biri shuni aytadi?"));
      },
      solution() {
        const s = L.sinfById(task.javob);
        host.append(M.answer(s.nom + " — " + s.izoh));
        host.append(osishGrafik([{ nom: task.namuna.nom, sinf: task.javob, nisbat: task.nisbat }]));
      },
    });
  }

  // 3-bosqich: katta n da amaliy tanlov
  function amaliyExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box(true);
        host.append(h("div", { class: "os-savol", text: task.savol }));
        ui.control().append(...task.tanlovlar.map((t) => ui.button(t.nom, () => submit(t.id), "big")));
      },
      check: (value) => value === task.javob,
      hint() {
        host.append(M.note("↻ Har usulning oʻsishini eslang: qadam n ga teng boʻlsa koʻpmi, n² boʻlsa koʻpmi?"));
      },
      solution() {
        const togri = task.tanlovlar.find((t) => t.id === task.javob);
        host.append(M.answer(togri.nom));
        host.append(M.note(task.nega));
      },
    });
  }

  QK.common = Object.assign({}, M, {
    osishGrafik, olchovJadval, kodKorsat, nis,
    bashoratExercise, sinfExercise, amaliyExercise,
  });
})(window);

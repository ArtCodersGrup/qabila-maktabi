// 38-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;
  const { ui, logic: L, practice } = QK;
  const h = ui.h;

  // Taxminlar tarixi: har qator — taxmin va javob
  function tarixEl(tarix) {
    const el = h("div", { class: "iz-tarix" });
    tarix.forEach((q, k) => {
      const belgi = q.javob === "topdi" ? "✓" : q.javob === "katta" ? "↑ kattaroq" : "↓ kichikroq";
      el.append(h("div", { class: "iz-qator" + (q.javob === "topdi" ? " topdi" : "") },
        h("span", { class: "iz-raqam", text: (k + 1) + "." }),
        h("span", { class: "iz-taxmin", text: String(q.taxmin) }),
        h("span", { class: "iz-javob", text: belgi })));
    });
    return el;
  }

  // n bo'yicha qadamlar jadvali: chiziqli va ikkilik yonma-yon
  function jadvalN(qatorlar) {
    const el = h("table", { class: "iz-jadval" });
    el.append(h("thead", {}, h("tr", {},
      h("th", { text: "Roʻyxat uzunligi" }),
      h("th", { text: "Chiziqli izlash" }),
      h("th", { text: "Ikkilik izlash" }))));
    const body = h("tbody");
    for (const q of qatorlar) {
      body.append(h("tr", {},
        h("td", { class: "iz-n", text: String(q.n) }),
        h("td", { class: "iz-chiziqli", text: String(q.chiziqli) }),
        h("td", { class: "iz-ikkilik" + (q.ikkilik < q.chiziqli ? " yaxshi" : ""), text: String(q.ikkilik) })));
    }
    el.append(body);
    return el;
  }

  // "Son o'yladim": bola taxmin qiladi. Eng ko'pi `chek` ta savolda topsa — yutuq.
  async function topish(son, chek) {
    const host = M.box(true);
    host.append(M.note("Men 1 dan " + L.CHEK + " gacha son oʻyladim. Topa olasanmi?"));
    const tarix = [];
    const joy = h("div", {});
    host.append(joy);
    for (;;) {
      const taxmin = await ui.askNumber(3);
      const javob = L.javob(son, taxmin);
      tarix.push({ taxmin, javob });
      joy.innerHTML = "";
      joy.append(tarixEl(tarix));
      if (javob === "topdi") break;
      if (tarix.length >= chek) {
        joy.append(M.note("↻ " + chek + " ta savol tugadi. Oʻylangan son: " + son));
        return { topdi: false, savol: tarix.length };
      }
    }
    return { topdi: true, savol: tarix.length };
  }

  // Mashq: bola o'ylangan sonni `chek` ta savolda topishi kerak
  function topishExercise(task) {
    return practice.tries({
      setup(submit) {
        topish(task.son, task.chek).then((r) => submit(r));
      },
      check: (r) => r.topdi,
      hint() { ui.toast("Har safar oraliqning oʻrtasini ayt — shunda yarmi tashlab yuboriladi."); },
      solution() { /* javob topish() ichida ko'rsatilgan */ },
    });
  }

  const oqishExercise = (task) => M.resultExercise(task);
  const yozishExercise = (task) => M.writeExercise(task);

  QK.common = Object.assign({}, M, { tarixEl, jadvalN, topish, topishExercise, oqishExercise, yozishExercise });
})(window);

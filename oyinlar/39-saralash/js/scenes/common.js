// 39-o'yin: shu o'yinga xos sahna qismlari. Umumiylari — umumiy/js/kod-mashq.js da.
(function (root) {
  "use strict";

  const QK = root.QK;
  const M = QK.kodMashq;
  const { ui, logic: L, practice } = QK;
  const h = ui.h;

  // Ustunlar: qiymat balandlik bilan ko'rsatiladi; belgilangan juftlik ajralib turadi
  function ustunlar(holat, opts) {
    const o = opts || {};
    const eng = Math.max(1, ...holat);
    const el = h("div", { class: "sr-ustunlar" });
    holat.forEach((v, k) => {
      // Diqqat: juft yoki tayyor 0 bo'lishi mumkin — shuning uchun != null bilan tekshiriladi
      const belgi = o.juft != null && (k === o.juft || k === o.juft + 1);
      const tayyor = o.tayyor != null && k >= o.tayyor;
      el.append(h("div", { class: "sr-ustun" + (belgi ? " belgi" : "") + (tayyor ? " tayyor" : "") + (o.eng === k ? " eng" : "") },
        h("span", { class: "sr-tayoq", style: "height:" + Math.round((v / eng) * 100) + "%" }),
        h("span", { class: "sr-son", text: String(v) })));
    });
    return el;
  }

  // 1-bosqich: shu juftlikni almashtirish kerakmi
  function almashExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box(true);
        host.append(M.note("Belgilangan ikki ustunni almashtirish kerakmi?"));
        host.append(ustunlar(task.holat, { juft: task.i }));
        ui.control().append(
          ui.button("Ha, almashtiramiz", () => submit(true), "big"),
          ui.button("Yoʻq, joyida", () => submit(false), "big"));
      },
      check: (value) => value === task.javob,
      hint() {
        host.append(M.note("↻ Chapdagisi oʻngdagisidan katta boʻlsa — almashtiriladi. Oʻsish tartibi kerak."));
      },
      solution() {
        host.append(M.answer(task.javob
          ? task.holat[task.i] + " > " + task.holat[task.i + 1] + " — almashtiriladi"
          : task.holat[task.i] + " < " + task.holat[task.i + 1] + " — joyida qoladi"));
      },
    });
  }

  // 2-bosqich: bir to'liq o'tishdan keyin ro'yxat qanday bo'ladi
  function otishExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = M.box(true);
        host.append(M.note("Bitta toʻliq oʻtishdan keyin roʻyxat qanday boʻladi? Sonlarni boʻsh joy bilan yoz."));
        host.append(ustunlar(task.holat));
        const area = h("input", {
          class: "kod-javob", type: "text", spellcheck: "false", autocomplete: "off",
          "aria-label": "Yangi roʻyxat",
        });
        area.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); submit(area.value); } });
        host.append(area);
        ui.control().append(ui.button("Tekshir", () => submit(area.value), "big"));
        setTimeout(() => area.focus(), 50);
      },
      check(value) {
        const bergan = String(value).trim().split(/[\s,]+/).filter(Boolean).map(Number);
        return bergan.length === task.javob.length && bergan.every((v, k) => v === task.javob[k]);
      },
      hint() {
        host.append(M.note("↻ Chapdan boshlab har juftlikni solishtir: kattasi oʻngga suriladi."));
      },
      solution() {
        host.append(M.answer(task.javob.join(" ")));
        host.append(ustunlar(task.javob, { tayyor: task.javob.length - 1 }));
      },
    });
  }

  // Qadamlar jadvali: n bo'yicha ikki usul
  function jadvalN(qatorlar) {
    const el = h("table", { class: "sr-jadval" });
    el.append(h("thead", {}, h("tr", {},
      h("th", { text: "Roʻyxat uzunligi" }),
      h("th", { text: "Pufakcha" }),
      h("th", { text: "Tanlash" }))));
    const body = h("tbody");
    for (const q of qatorlar) {
      body.append(h("tr", {},
        h("td", { class: "sr-n", text: String(q.n) }),
        h("td", { text: String(q.pufak) }),
        h("td", { class: q.tanlash < q.pufak ? "yaxshi" : "", text: String(q.tanlash) })));
    }
    el.append(body);
    return el;
  }

  const yozishExercise = (task) => M.writeExercise(task);

  QK.common = Object.assign({}, M, { ustunlar, almashExercise, otishExercise, jadvalN, yozishExercise });
})(window);

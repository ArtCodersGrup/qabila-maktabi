// 76-o'yin: shu o'yinga xos ekran qismlari (buyumlar jadvali, yorliq, chalkashlik jadvali) va mashq ekranlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, practice } = QK;
  const h = ui.h;

  // ---------- Mashq qutisi ----------
  function box(compact) {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    const el = h("div", { class: "pbox" });
    ui.work().append(el);
    return el;
  }

  const note = (text) => h("div", { class: "note", text });
  const answer = (text) => h("div", { class: "answer", text });
  const savol = (text) => h("div", { class: "at-savol", text });
  const sarlavha = (text) => h("div", { class: "at-sarlavha", text });

  // ---------- Qismlar ----------
  // Yorliq: rang + matn (faqat rang bilan emas)
  const RANG = { plastik: "p", "qogʻoz": "q", organik: "o" };
  const yorliq = (sinf, belgi) => h("span", { class: "at-yorliq " + (RANG[sinf] || "d"), text: sinf + (belgi || "") });

  // Buyumlar jadvali. qatorlar: [{ buyum, yorliq, model, farq, holat, guruh }]
  // o: { raqam, nom, joy, yorliq, yorliqNom, model, farq, guruh } — qaysi ustunlar ko'rinadi
  function jadval(qatorlar, o) {
    const opt = o || {};
    const bosh = [];
    if (opt.raqam) bosh.push("№");
    if (opt.nom) bosh.push("buyum");
    if (!opt.belgisiz) L.BELGILAR.forEach((b) => bosh.push(b.nom));
    if (opt.joy) bosh.push(L.JOY.nom);
    if (opt.yorliq) bosh.push(opt.yorliqNom || "yorliq");
    if (opt.model) bosh.push("model");
    if (opt.farq) bosh.push("farq");
    if (opt.guruh) bosh.push("toʻplam");
    const tana = qatorlar.map((q, k) => {
      const x = q.buyum;
      const tr = h("tr", { class: q.holat || null });
      if (opt.raqam) tr.append(h("td", { class: "raqam", text: String(k + 1) }));
      if (opt.nom) tr.append(h("td", { class: "nom", text: x.nom }));
      if (!opt.belgisiz) L.BELGI_ID.forEach((b) => tr.append(h("td", { text: x[b] })));
      if (opt.joy) tr.append(h("td", { text: x.joy }));
      if (opt.yorliq) tr.append(h("td", null, yorliq(q.yorliq || x.sinf)));
      if (opt.model) tr.append(h("td", null, q.model ? yorliq(q.model, q.model === (q.yorliq || x.sinf) ? " ✓" : " ✗") : h("span", { class: "at-kut", text: "—" })));
      if (opt.farq) tr.append(h("td", { class: "raqam", text: q.farq == null ? "" : String(q.farq) }));
      if (opt.guruh) tr.append(h("td", { class: "guruh", text: q.guruh || "" }));
      return tr;
    });
    return h("div", { class: "at-oram" }, h("table", { class: "at-jadval" },
      h("thead", null, h("tr", null, ...bosh.map((t) => h("th", { scope: "col", text: t })))),
      h("tbody", null, ...tana)));
  }

  // Yangi buyum: faqat belgilari (model nomni ko'rmaydi)
  const belgilar = (x) => h("div", { class: "at-belgilar" }, ...L.BELGILAR.map((b) => h("span", { class: "at-belgi" },
    h("span", { class: "kalit", text: b.nom + ": " }), h("span", { text: x[b.id] }))));

  // Aniqlik satri: "Aniqlik: 3 ÷ 4 = 75%" (yaxlitlangan bo'lsa — ≈)
  const aniqlikYoz = (b) => `Aniqlik: ${b.togri} ÷ ${b.jami} ${(b.togri * 100) % b.jami ? "≈" : "="} ${b.foiz}%`;

  // Chalkashlik jadvali: qator — asl yorliq, ustun — model javobi (oxirgi ustun — «ikkilanadi»)
  function matritsa(m) {
    const ustunlar = L.SINFLAR.concat(L.DURANG);
    return h("div", { class: "at-oram" }, h("table", { class: "at-jadval at-mat" },
      h("thead", null, h("tr", null, h("th", { class: "burchak", text: "asl ↓  model →" }), ...ustunlar.map((s) => h("th", { scope: "col" }, yorliq(s))))),
      h("tbody", null, ...L.SINFLAR.map((a) => h("tr", null, h("th", { scope: "row" }, yorliq(a)),
        ...ustunlar.map((b) => h("td", { class: "raqam " + (a === b ? "diag" : m[a][b] ? "" : "nol"), text: String(m[a][b]) })))))));
  }

  // ---------- Mashq ekranlari ----------
  // Xato yorliqli qatorni topish — qatorning o'zi bosiladi
  function yorliqExercise(task) {
    let host = null;
    let tugmalar = [];
    return practice.tries({
      setup(submit) {
        host = box(true);
        tugmalar = task.qatorlar.map((q, k) => {
          const b = h("button", { class: "at-qator", type: "button" },
            h("span", { class: "nom", text: q.buyum.nom }), yorliq(q.yorliq),
            h("span", { class: "tavsif", text: L.belgiYoz(q.buyum) }));
          b.addEventListener("click", () => { QK.sound.play("tap"); submit(k); });
          return b;
        });
        host.append(savol(task.matn), h("div", { class: "at-qatorlar" }, ...tugmalar));
      },
      check: (value) => value === task.javob,
      hint() { host.append(note("↻ " + task.ishora)); },
      solution() {
        tugmalar.forEach((b, k) => {
          b.disabled = true;
          if (k === task.javob) b.classList.add("xato");
        });
        host.append(note(task.nega));
      },
    });
  }

  // Variantli savol: oldin(host) — jadval va boshqalar; yozuv(v) — tugma matni
  function tanlov(task, oldin, yozuv, yechim) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(savol(task.matn));
        oldin(host);
        ui.control().append(h("div", { class: "at-javoblar" }, ...task.variantlar.map((v) => ui.button(yozuv(v), () => submit(v), "sm"))));
      },
      check: (value) => value === task.javob,
      hint() { host.append(note("↻ " + task.ishora)); },
      solution() {
        if (yechim) yechim(host);
        host.append(answer(yozuv(task.javob)), note(task.nega));
      },
    });
  }

  const ustunNomi = (id) => (id === L.JOY.id ? L.JOY.nom : L.BELGILAR.find((b) => b.id === id).nom);

  const belgiExercise = (task) => tanlov(task,
    (host) => host.append(jadval(task.qatorlar.map((x) => ({ buyum: x })), { joy: true, yorliq: true })),
    ustunNomi);

  function bashoratExercise(task) {
    const chiz = (host, yechim) => host.append(
      sarlavha("Oʻquv toʻplami"),
      jadval(task.oquv.map((x, k) => ({ buyum: x, farq: yechim ? task.farqlar[k] : null, holat: yechim && task.yaqinlar.includes(k) ? "yaqin" : "" })), { raqam: true, yorliq: true, farq: yechim }),
      sarlavha("Yangi buyum"), belgilar(task.yangi));
    return tanlov(task, (host) => chiz(host, false), (v) => v, (host) => {
      host.textContent = "";
      host.append(savol(task.matn));
      chiz(host, true);
    });
  }

  // Ro'yxatda model javobi ✓/✗ siz ko'rsatiladi — sanash o'quvchining ishi
  function aniqlikExercise(task) {
    const host = box(true);
    const royxat = task.korinish !== "jadval";
    const korinish = royxat ? natijaJadvali(task.natijalar, false) : matritsa(task.jadval);
    host.append(savol(task.matn), korinish);
    return practice.numberTries({
      answer: task.javob,
      maxLen: 3,
      hint() { host.append(note("↻ " + task.nega)); },
      solution() {
        if (royxat) korinish.replaceWith(natijaJadvali(task.natijalar, true));
        host.append(answer(task.hisob));
      },
    });
  }

  // Test natijalari: buyum, asl yorliq, model javobi; belgila — ✓/✗ ko'rsatiladi
  function natijaJadvali(natijalar, belgila) {
    return h("div", { class: "at-oram" }, h("table", { class: "at-jadval" },
      h("thead", null, h("tr", null, ...["buyum", "asl yorliq", "model javobi"].map((t) => h("th", { scope: "col", text: t })))),
      h("tbody", null, ...natijalar.map((n) => h("tr", { class: belgila ? (n.togri ? "ok" : "xato") : null },
        h("td", { class: "nom", text: n.buyum.nom }),
        h("td", null, yorliq(n.asl)),
        h("td", null, yorliq(n.model, belgila ? (n.togri ? " ✓" : " ✗") : "")))))));
  }

  // Shakl bo'yicha guruhlangan natijalar
  function guruhJadvali(guruhlar, belgila) {
    return h("div", { class: "at-oram" }, h("table", { class: "at-jadval" },
      h("thead", null, h("tr", null, ...["shakl", "jami", "toʻgʻri"].concat(belgila ? ["aniqlik"] : []).map((t) => h("th", { scope: "col", text: t })))),
      h("tbody", null, ...guruhlar.map((g) => h("tr", { class: belgila && g.qiymat === belgila ? "xato" : null },
        h("td", { text: g.qiymat }), h("td", { class: "raqam", text: String(g.jami) }), h("td", { class: "raqam", text: String(g.togri) }),
        belgila ? h("td", { class: "raqam", text: g.foiz + "%" }) : null)))));
  }

  function guruhExercise(task) {
    const host = box(true);
    const korinish = guruhJadvali(task.guruhlar, null);
    host.append(savol(task.matn), korinish);
    return practice.numberTries({
      answer: task.javob,
      maxLen: 3,
      hint() { host.append(note("↻ " + task.nega)); },
      solution() {
        korinish.replaceWith(guruhJadvali(task.guruhlar, task.zaif));
        host.append(answer(task.hisob), note(task.xulosa));
      },
    });
  }

  const nomzodYoz = (x) => `${x.nom} (${L.belgiYoz(x)}) — ${x.sinf}`;

  const tuzatExercise = (task) => tanlov(task,
    (host) => host.append(
      sarlavha("Oʻquv toʻplami"),
      jadval(task.oquv.map((x) => ({ buyum: x })), { yorliq: true }),
      sarlavha("Testdagi xatolar"),
      jadval(task.xatolar.map((n) => ({ buyum: n.buyum, yorliq: n.asl, model: n.model })), { yorliq: true, yorliqNom: "asl", model: true })),
    (k) => nomzodYoz(task.nomzodlar[k]));

  const EKRAN = { yorliq: yorliqExercise, belgi: belgiExercise, bashorat: bashoratExercise, aniqlik: aniqlikExercise, guruh: guruhExercise, tuzat: tuzatExercise };
  const run = (task) => EKRAN[task.tur](task);

  // To'g'ri javobdan keyingi qisqa izoh
  function praise(task) {
    if (task.tur === "yorliq") return "Xato yorliq topildi.";
    if (task.tur === "belgi") return `«${ustunNomi(task.javob)}» sinflarni eng yaxshi ajratadi.`;
    if (task.tur === "bashorat") return `Eng kam farq — ${task.masofa} ta belgi.`;
    if (task.tur === "tuzat") return `${task.asos}/${task.jami} → ${Math.max(...task.natijalar)}/${task.jami}.`;
    if (task.tur === "guruh") return task.hisob + ".";
    return task.hisob + ".";
  }

  QK.common = { box, note, answer, savol, sarlavha, yorliq, jadval, belgilar, aniqlikYoz, matritsa, natijaJadvali, guruhJadvali, nomzodYoz, run, praise };
})(window);

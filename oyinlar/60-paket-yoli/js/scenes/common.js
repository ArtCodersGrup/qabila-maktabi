// 60-o'yin: shu o'yinga xos ekran qismlari (tugunlar to'ri, fayllar, sahifa ko'rinishi, navbat) va mashq ekranlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, practice } = QK;
  const h = ui.h;

  function box(compact) {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = h("div", { class: "pbox" });
    ui.work().append(el);
    return el;
  }
  const note = (text) => h("div", { class: "note", text });
  const answer = (text) => h("div", { class: "answer", text });

  // ---------- To'r ----------
  // viewBox 400×300: tugun (c, r) markazi — (50 + 100c, 50 + 100r). Harflar — HTML (SVG ichida matn yo'q).
  const XY = (i) => { const { c, r } = L.joy(i); return [50 + 100 * c, 50 + 100 * r]; };

  // opts: { a, b, uzilgan: [sim], yol: [tugunlar], joriy, bosiladi(i), faol: Set }
  function tor(t, opts) {
    const o = opts || {};
    const uzilgan = new Set(o.uzilgan || []);
    const yolSimlari = new Set((o.yol || []).slice(1).map((x, i) => L.sim(o.yol[i], x)));
    const chiziqlar = t.simlar.concat([...uzilgan].filter((s) => !t.simlar.includes(s))).map((s) => {
      const [a, b] = s.split("-").map(Number);
      const [x1, y1] = XY(a);
      const [x2, y2] = XY(b);
      if (uzilgan.has(s)) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#F08A24" stroke-width="5" stroke-dasharray="10 9"/>` +
          `<path d="M${mx - 11} ${my - 11} l22 22 M${mx + 11} ${my - 11} l-22 22" stroke="#B4560C" stroke-width="6" stroke-linecap="round"/>`;
      }
      const yolda = yolSimlari.has(s);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${yolda ? "#1A9E77" : "#978B76"}" stroke-width="${yolda ? 9 : 5}" stroke-linecap="round"/>`;
    }).join("");
    const el = h("div", { class: "py-tor" }, h("div", { class: "py-simlar", html: `<svg viewBox="0 0 400 300" aria-hidden="true">${chiziqlar}</svg>` }));
    for (const i of t.tugunlar) {
      const [x, y] = XY(i);
      const sinf = ["py-tugun"];
      if (i === o.a) sinf.push("paket");
      if (i === o.b) sinf.push("manzil");
      if (i === o.joriy) sinf.push("joriy");
      if (o.yol && o.yol.includes(i)) sinf.push("yolda");
      const bosiladi = o.bosiladi && o.faol && o.faol.has(i);
      const tugun = h(bosiladi ? "button" : "span", {
        class: sinf.join(" ") + (bosiladi ? " faol" : ""), type: bosiladi ? "button" : null,
        style: `left:${x / 4}%;top:${y / 3}%`, text: L.harf(i),
        "aria-label": `${L.harf(i)} tugun` + (i === o.a ? ", paket shu yerda" : "") + (i === o.b ? ", manzil" : ""),
      });
      if (bosiladi) tugun.addEventListener("click", () => o.bosiladi(i));
      el.append(tugun);
    }
    return el;
  }

  // Belgilar izohi: paket va manzil
  const izoh = () => h("div", { class: "py-izoh" },
    h("span", {}, h("i", { class: "py-nuqta paket" }), "paket"), h("span", {}, h("i", { class: "py-nuqta manzil" }), "manzil"));

  // ---------- Fayllar, sahifa ko'rinishi, navbat ----------
  const fayllar = (list) => h("div", { class: "py-fayllar" }, ...list.map((f, i) => h("span", { class: "py-fayl" }, h("b", { text: String(i + 1) }), f.nom)));

  // Sahifa ko'rinishi: qaysi qismlar kelgan (matn, rasm, shrift, uslub)
  function sahifa(bor) {
    const s = new Set(bor);
    if (!s.has("sahifa")) return h("div", { class: "py-sahifa yoq", text: "Sahifa ochilmadi" });
    return h("div", { class: "py-sahifa" + (s.has("uslub") ? " uslub" : "") + (s.has("shrift") ? " shrift" : "") },
      h("div", { class: "py-s-sarlavha", text: "Qabila yangiliklari" }),
      h("div", { class: "py-s-rasm" + (s.has("rasm") ? " bor" : ""), html: s.has("rasm") ? QK.gameArt.rasm() : "" }),
      h("div", { class: "py-s-matn", text: "Bugun togʻga chiqish musobaqasi boʻladi. Hamma taklif qilinadi!" }));
  }

  const navbat = (n, k) => h("div", { class: "py-navbat" },
    h("span", { class: "py-server", html: QK.gameArt.server() }),
    ...Array.from({ length: n }, (_, i) => h("span", { class: "py-bola" + (i + 1 === k ? " belgi" : ""), text: String(i + 1) })));

  // ---------- Mashq ekranlari ----------
  function sonExercise(task, opts) {
    const o = opts || {};
    const host = box(true);
    if (o.oldin) o.oldin(host);
    host.append(h("div", { class: "py-savol", text: task.matn }));
    const javob = Number(task.javob);
    return practice.numberTries({
      answer: javob,
      maxLen: String(javob).length + 1,
      hint() { host.append(note("↻ " + task.nega)); },
      solution() { host.append(answer(task.hisob)); if (o.yechim) o.yechim(host); },
    });
  }

  function tanlovExercise(task, opts) {
    const o = opts || {};
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        if (o.oldin) o.oldin(host);
        host.append(h("div", { class: "py-savol", text: task.matn }));
        ui.control().append(h("div", { class: "py-javoblar" + (o.qator ? " qator" : "") },
          ...task.variantlar.map((v) => ui.button(String(v), () => submit(v), o.qator ? "" : "wide"))));
      },
      check: (value) => value === task.javob,
      hint() { host.append(note("↻ " + (task.ishora || task.nega))); },
      solution() {
        host.append(answer(String(task.javob)));
        if (o.yechim) o.yechim(host);
        host.append(note(task.nega));
      },
    });
  }

  // ---------- Har bir savol turi ----------
  const torBilan = (task, extra) => (host) => host.append(tor(task.tor, Object.assign({ a: task.a, b: task.b, uzilgan: task.uzilgan }, extra || {})), izoh());

  const EKRAN = {
    qadam: (task) => sonExercise(task, { oldin: torBilan(task), yechim: (host) => host.append(tor(task.tor, { a: task.a, b: task.b, yol: task.yol })) }),
    keyingi: (task) => tanlovExercise(task, { oldin: torBilan(task), qator: true }),
    uzildi: (task) => sonExercise(task, { oldin: torBilan(task), yechim: (host) => host.append(tor(task.tor, { a: task.a, b: task.b, uzilgan: task.uzilgan, yol: task.yol })) }),
    qaysi: (task) => tanlovExercise(task, { oldin: torBilan(task), qator: true }),
    yetadimi: (task) => tanlovExercise(task, { oldin: torBilan(task) }),
    sorov: (task) => sonExercise(task, { oldin: (host) => host.append(fayllar(task.fayllar)) }),
    kelmadi: (task) => tanlovExercise(task, {
      yechim: (host) => host.append(sahifa(["sahifa", "rasm", "shrift", "uslub"].filter((x) => x !== task.qaysi))),
    }),
    navbat: (task) => sonExercise(task, { oldin: (host) => host.append(navbat(task.n, task.k)) }),
  };
  const run = (task) => EKRAN[task.tur](task);

  function praise(task) {
    if (["qadam", "uzildi", "sorov", "navbat"].includes(task.tur)) return task.hisob;
    return task.nega;
  }

  QK.common = { box, note, answer, tor, izoh, fayllar, sahifa, navbat, sonExercise, tanlovExercise, run, praise };
})(window);

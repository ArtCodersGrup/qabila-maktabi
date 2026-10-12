// «Maʼlumot tahlili»: shu oʻyinga xos ekran qismlari (qiymatlar qatori, diagramma) va mashq ekranlari.
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
  const savol = (text) => h("div", { class: "mt-savol", text });
  const holat = (text) => h("div", { class: "mt-holat", text });
  const formula = (lines) => h("div", { class: "mt-formula" }, ...lines.map((t) => h("div", { text: t })));

  // ---------- Qiymatlar qatori ----------
  // belgi(v, k) → true boʻlsa, katak ajratib koʻrsatiladi; onBos(k, el) berilsa — kataklar tugma boʻladi
  function toplam(a, o) {
    const p = o || {};
    return h("div", { class: "mt-toplam", role: "group", "aria-label": "Qiymatlar: " + L.royxat(a) },
      ...a.map((v, k) => {
        const cls = "mt-son" + (p.belgi && p.belgi(v, k) ? " belgi" : "");
        if (!p.onBos) return h("span", { class: cls, text: L.son(v) });
        const b = h("button", { class: cls, type: "button", text: L.son(v), "aria-label": `${k + 1}-qiymat: ${L.son(v)}` });
        b.addEventListener("click", () => p.onBos(k, b));
        return b;
      }));
  }
  const toplamBlok = (nom, a, o) => h("div", { class: "mt-blok" }, h("div", { class: "mt-nom", text: nom }), toplam(a, o));

  // ---------- Diagramma ----------
  // SVG ichida matn yoʻq: oʻq sonlari, nomlar va sarlavhalar — yonidagi HTML (QOIDALAR §6).
  const W = 300, H = 180, TEPA = 10, BAZA = 172, CHAP = 12, ONG = 288;
  const yJoy = (v, d) => TEPA + (1 - L.ulush(v, d.y0, d.y1)) * (BAZA - TEPA);
  const xJoy = (v, d) => CHAP + L.ulush(v, d.x0, d.x1) * (ONG - CHAP);
  const f1 = (n) => Number(n.toFixed(1));

  function diagramma(d) {
    const qism = [];
    const yYozuv = [];
    const xYozuv = [];
    for (let v = d.y0; v <= d.y1; v += d.qadam) {
      const y = f1(yJoy(v, d));
      qism.push(`<line class="${v === d.y0 ? "mt-baza" : "mt-tor"}" x1="0" y1="${y}" x2="${W}" y2="${y}"/>`);
      yYozuv.push(h("span", { class: "mt-ylab", style: `top:${f1((y / H) * 100)}%`, text: L.son(v) }));
    }
    if (d.tur === "nuqta") {
      for (let v = d.x0; v <= d.x1; v += d.xQadam) {
        const x = f1(xJoy(v, d));
        qism.push(`<line class="mt-tor" x1="${x}" y1="${TEPA}" x2="${x}" y2="${BAZA}"/>`);
        xYozuv.push(h("span", { class: "mt-xlab", style: `left:${f1((x / W) * 100)}%`, text: L.son(v) }));
      }
      d.nuqtalar.forEach((p) => qism.push(`<circle class="mt-nuqta" cx="${f1(xJoy(p[0], d))}" cy="${f1(yJoy(p[1], d))}" r="5.5"/>`));
    } else {
      const n = d.qiymatlar.length;
      const joy = W / n;
      const markaz = (i) => f1((i + 0.5) * joy);
      d.nomlar.forEach((nom, i) => xYozuv.push(h("span", { class: "mt-xlab", style: `left:${f1(((i + 0.5) / n) * 100)}%`, text: nom })));
      if (d.tur === "ustun") {
        d.qiymatlar.forEach((v, i) => {
          const y = f1(yJoy(v, d));
          qism.push(`<rect class="mt-ustun${d.ikkiRang && i % 2 ? " b1" : ""}" x="${f1(i * joy + joy * 0.2)}" y="${y}" width="${f1(joy * 0.6)}" height="${f1(BAZA - y)}" rx="2"/>`);
        });
      } else {
        const yol = d.qiymatlar.map((v, i) => `${markaz(i)},${f1(yJoy(v, d))}`).join(" ");
        d.nomlar.forEach((_, i) => qism.push(`<line class="mt-tor" x1="${markaz(i)}" y1="${TEPA}" x2="${markaz(i)}" y2="${BAZA}"/>`));
        qism.push(`<polyline class="mt-chiziq" points="${yol}"/>`);
        d.qiymatlar.forEach((v, i) => qism.push(`<circle class="mt-nuqta" cx="${markaz(i)}" cy="${f1(yJoy(v, d))}" r="5"/>`));
      }
    }
    const NOM = { ustun: "Ustunli diagramma", chiziq: "Chiziqli diagramma", nuqta: "Nuqtali diagramma" }[d.tur];
    const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${NOM}">${qism.join("")}</svg>`;
    return h("div", { class: "mt-diag" },
      h("div", { class: "mt-oq", text: "↑ " + d.oq }),
      h("div", { class: "mt-maydon" }, h("div", { class: "mt-svg", html: svg }), ...yYozuv, ...xYozuv),
      d.xNomi ? h("div", { class: "mt-xnom", text: d.xNomi + " →" }) : null);
  }

  // ---------- Mashq ekranlari ----------
  function sonExercise(task, opts) {
    const o = opts || {};
    const host = box(true);
    if (o.oldin) o.oldin(host);
    host.append(savol(task.matn));
    const javob = Number(task.javob);
    return practice.numberTries({
      answer: javob,
      maxLen: String(javob).length + 1,
      hint() { host.append(note("↻ " + task.nega)); },
      solution() { host.append(answer(task.hisob)); },
    });
  }

  function tanlovExercise(task, opts) {
    const o = opts || {};
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        if (o.oldin) o.oldin(host);
        host.append(savol(task.matn));
        ui.control().append(h("div", { class: "mt-javoblar" + (o.qisqa ? " qisqa" : "") },
          ...task.variantlar.map((v) => ui.button(String(v), () => submit(v), "wide"))));
      },
      check: (value) => value === task.javob,
      // Maslahat javobni aytmaydi — nimaga qarashni koʻrsatadi
      hint() { host.append(note("↻ " + task.ishora)); },
      solution() {
        host.append(answer(String(task.javob)));
        host.append(note(task.nega));
      },
    });
  }

  // Vazifa oldidan koʻrsatiladigan narsa: qiymatlar qatori, holat matni, diagramma
  function oldin(task) {
    return (host) => {
      if (task.toplam) host.append(toplamBlok(task.nom, task.toplam));
      if (task.holat) host.append(holat(task.holat));
      if (task.diagramma) host.append(diagramma(task.diagramma));
    };
  }

  // Variantlari bor vazifa — tanlov, boʻlmasa — son kiritish
  const run = (task) => (task.variantlar
    ? tanlovExercise(task, { oldin: oldin(task), qisqa: task.tur === "chiziq" })
    : sonExercise(task, { oldin: oldin(task) }));

  // Toʻgʻri javobdan keyingi qisqa tasdiq (kattalar koʻrinishida ~1 soniya turadi)
  const praise = (task) => task.qisqa;

  QK.common = { box, note, answer, savol, holat, formula, toplam, toplamBlok, diagramma, sonExercise, tanlovExercise, run, praise };
})(window);

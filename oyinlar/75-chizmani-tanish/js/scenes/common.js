// 75-o'yin: shu o'yinga xos ekran qismlari (katakli chizma, sonlar jadvali, chizish maydoni, chalkashlik jadvali) va mashq ekranlari.
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, practice } = QK;
  const h = ui.h;
  const N = L.N;

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
  const savol = (text) => h("div", { class: "ct-savol", text });

  // ---------- Chizma (SVG, matnsiz) ----------
  // o.farq — halqa bilan belgilanadigan kataklar; o.qatorlar — belgilanadigan qatorlar (true/false ro'yxati)
  function rasmSvg(katak, o) {
    const opt = o || {};
    let ichi = `<rect class="ct-fon" x="0" y="0" width="80" height="80"/>`;
    (opt.qatorlar || []).forEach((bor, y) => {
      if (bor) ichi += `<rect class="ct-q" x="0" y="${y * 10}" width="80" height="10"/>`;
    });
    katak.forEach((v, i) => {
      if (v) ichi += `<rect class="ct-b" x="${(i % N) * 10 + 0.5}" y="${Math.floor(i / N) * 10 + 0.5}" width="9" height="9"/>`;
    });
    let tor = "";
    for (let k = 1; k < N; k++) tor += `M${k * 10} 0V80M0 ${k * 10}H80`;
    ichi += `<path class="ct-tor" d="${tor}"/>`;
    (opt.farq || []).forEach((i) => {
      ichi += `<rect class="ct-f" x="${(i % N) * 10 + 1.2}" y="${Math.floor(i / N) * 10 + 1.2}" width="7.6" height="7.6"/>`;
    });
    return `<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${opt.nom || "8×8 katakli chizma"}">${ichi}</svg>`;
  }

  // olcham: "katta" | "orta" | "kichik" | "mitti"
  const rasm = (katak, olcham, o) => h("div", { class: "ct-rasm " + (olcham || "orta"), html: rasmSvg(katak, o) });

  // Chizma ostida yozuvi bilan
  const yozuvli = (el, text) => h("div", { class: "ct-yozuvli" }, el, h("div", { class: "ct-yozuv", text }));

  // Sonlar jadvali: 64 ta 0/1
  function sonlar(katak, o) {
    const opt = o || {};
    const farq = new Set(opt.farq || []);
    return h("div", { class: "ct-sonlar" + (opt.kichik ? " kichik" : ""), role: "img", "aria-label": "8×8 sonlar jadvali: " + Array.from({ length: N }, (_, y) => L.qator(katak, y).join("")).join(", ") },
      ...katak.map((v, i) => h("span", {
        class: (v ? "bir" : "nol") + (farq.has(i) ? " f" : "") + (opt.qatorlar && opt.qatorlar[Math.floor(i / N)] ? " q" : ""),
        text: String(v),
      })));
  }

  // Bosiladigan 8×8 maydon. onTap(i, tugma) — har bosishda; render() — katak holatini qayta chizadi
  function maydon(katak, onTap) {
    const tugmalar = katak.map((v, i) => h("button", {
      class: "ct-katak" + (v ? " bor" : ""), type: "button",
      "aria-label": `${Math.floor(i / N) + 1}-qator, ${(i % N) + 1}-ustun`, "aria-pressed": v ? "true" : "false",
    }));
    tugmalar.forEach((b, i) => b.addEventListener("click", () => onTap(i, b)));
    const el = h("div", { class: "ct-maydon", role: "group", "aria-label": "8×8 chizish maydoni" }, ...tugmalar);
    function render() {
      tugmalar.forEach((b, i) => {
        b.classList.toggle("bor", !!katak[i]);
        b.setAttribute("aria-pressed", katak[i] ? "true" : "false");
      });
    }
    return { el, tugmalar, render };
  }

  // Namuna kartasi: chizma, sinfi, (bo'lsa) masofa. o.tugma — bosiladigan
  function karta(q, o) {
    const opt = o || {};
    const el = h(opt.tugma ? "button" : "div", { class: "ct-karta" + (opt.holat ? " " + opt.holat : ""), type: opt.tugma ? "button" : null },
      rasm(q.katak, opt.olcham || "kichik", { nom: `Namuna: ${q.sinf}` }),
      h("span", { class: "ct-sinf", text: q.sinf }));
    const m = h("span", { class: "ct-masofa", text: opt.masofa == null ? "masofa: ?" : `masofa: ${opt.masofa}` });
    if (opt.masofa !== undefined) el.append(m);
    el.masofaYoz = (n) => { m.textContent = `masofa: ${n}`; el.classList.add("olchandi"); };
    return el;
  }

  const kartalar = (...kids) => h("div", { class: "ct-kartalar" }, ...kids);

  // Sinf belgisi: birinchi namunaning mitti chizmasi
  const belgi = (sinf) => rasm(L.namuna(sinf + "-1").katak, "mitti", { nom: sinf });

  // Chalkashlik jadvali: qator — asl sinf, ustun — model javobi
  function matritsa(jadval, sinflar, o) {
    const opt = o || {};
    const bosh = h("tr", null, h("th", { class: "burchak", text: "asl ↓  model →" }),
      ...sinflar.map((s) => h("th", { scope: "col", "aria-label": s }, belgi(s))));
    const qatorlar = sinflar.map((a) => h("tr", null,
      h("th", { scope: "row" }, h("span", { class: "ct-mat-nom" }, belgi(a), h("span", { text: a }))),
      ...sinflar.map((b) => h("td", {
        class: (a === b ? "diag" : jadval[a][b] ? "xato" : "nol") + (opt.juft && opt.juft.includes(a) && opt.juft.includes(b) && a !== b ? " belgi" : ""),
        text: String(jadval[a][b]),
      }))));
    return h("div", { class: "ct-mat-oram" }, h("table", { class: "ct-mat" }, h("thead", null, bosh), h("tbody", null, ...qatorlar)));
  }

  // Natijalar ro'yxati: chizma, asl sinf, model javobi
  function royxat(natijalar, belgila) {
    return h("div", { class: "ct-royxat" }, ...natijalar.map((x) => h("div", { class: "ct-natija" + (belgila ? (x.asl === x.model ? " ok" : " xato") : "") },
      rasm(x.katak, "mitti"),
      h("span", { class: "asl", text: `asl: ${x.asl}` }),
      h("span", { class: "model", text: `model: ${x.model}` + (belgila ? (x.asl === x.model ? " ✓" : " ✗") : "") }))));
  }

  // ---------- Mashq ekranlari ----------
  // Sonlar jadvali → qaysi chizma (4 ta chizma-tugma)
  function jadvalExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(savol(task.matn), sonlar(task.jadval));
        const tugmalar = task.variantlar.map((v, k) => {
          const b = h("button", { class: "ct-variant", type: "button", "aria-label": `${k + 1}-variant` }, rasm(v, "kichik"));
          b.addEventListener("click", () => submit(k));
          return b;
        });
        ui.control().append(h("div", { class: "ct-variantlar" }, ...tugmalar));
      },
      check: (value) => value === task.javob,
      hint() { host.append(note("↻ " + task.ishora)); },
      solution() {
        host.append(h("div", { class: "ct-juft" }, yozuvli(rasm(task.variantlar[task.javob], "orta"), "toʻgʻri chizma")), note(task.nega));
      },
    });
  }

  // Ikki chizma (yoki ikki jadval) farqi — son kiritiladi
  function farqExercise(task) {
    const host = box(true);
    const juft = h("div", { class: "ct-juft" });
    function chiz(o) {
      juft.textContent = "";
      const yasa = (katak) => (task.korinish === "son" ? sonlar(katak, Object.assign({ kichik: true }, o)) : rasm(katak, "orta", o));
      juft.append(yozuvli(yasa(task.a), "A"), yozuvli(yasa(task.b), "B"));
    }
    chiz({});
    host.append(savol(task.matn), juft);
    return practice.numberTries({
      answer: task.javob,
      maxLen: 2,
      hint() {
        chiz({ qatorlar: task.satrlar.map((x) => x > 0) });
        host.append(note("↻ " + task.nega));
      },
      solution() {
        chiz({ farq: L.farqlar(task.a, task.b) });
        host.append(answer(task.hisob));
      },
    });
  }

  // Yangi chizma + masofasi yozilgan namunalar
  function savolKorinishi(host, task, belgila) {
    host.append(savol(task.matn),
      h("div", { class: "ct-juft" }, yozuvli(rasm(task.savol, "orta"), "yangi chizma")),
      kartalar(...task.qatorlar.map((q) => karta(q, { masofa: q.masofa, olcham: "mitti", holat: belgila && belgila(q) ? "yaqin" : "" }))));
  }

  function sinfExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        savolKorinishi(host, task);
        ui.control().append(h("div", { class: "ct-javoblar" }, ...task.variantlar.map((v) => ui.button(v, () => submit(v), "sm"))));
      },
      check: (value) => value === task.javob,
      hint() { host.append(note("↻ " + task.ishora)); },
      solution() {
        host.textContent = "";
        savolKorinishi(host, task, (q) => q.masofa === task.masofa && q.sinf === task.javob);
        host.append(answer(task.javob), note(task.nega));
      },
    });
  }

  function zaxiraExercise(task) {
    const host = box(true);
    savolKorinishi(host, task);
    return practice.numberTries({
      answer: task.javob,
      maxLen: 2,
      hint() { host.append(note("↻ " + task.nega)); },
      solution() { host.append(answer(task.hisob)); },
    });
  }

  function aniqlikExercise(task) {
    const host = box(true);
    const joy = h("div", { class: "ct-joy" });
    const chiz = (belgila) => {
      joy.textContent = "";
      joy.append(task.korinish === "jadval" ? matritsa(task.jadval, task.sinflar) : royxat(task.natijalar, belgila));
    };
    chiz(false);
    host.append(savol(task.matn), joy);
    return practice.numberTries({
      answer: task.javob,
      maxLen: 3,
      hint() { host.append(note("↻ " + task.nega)); },
      solution() {
        chiz(true);
        host.append(answer(task.hisob));
      },
    });
  }

  const juftYozuv = (kalit) => kalit.replace("|", " ↔ ");

  function chalkashExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(savol(task.matn), matritsa(task.jadval, task.sinflar));
        ui.control().append(h("div", { class: "ct-javoblar ustun" }, ...task.variantlar.map((v) => ui.button(juftYozuv(v), () => submit(v), "sm"))));
      },
      check: (value) => value === task.javob,
      hint() { host.append(note("↻ " + task.ishora)); },
      solution() {
        host.textContent = "";
        host.append(savol(task.matn), matritsa(task.jadval, task.sinflar, { juft: task.javob.split("|") }), answer(juftYozuv(task.javob)), note(task.nega));
      },
    });
  }

  const EKRAN = { jadval: jadvalExercise, farq: farqExercise, sinf: sinfExercise, zaxira: zaxiraExercise, aniqlik: aniqlikExercise, chalkash: chalkashExercise };
  const run = (task) => EKRAN[task.tur](task);

  // To'g'ri javobdan keyingi qisqa izoh
  function praise(task) {
    if (task.tur === "jadval") return "Jadval va chizma — bitta maʼlumot.";
    if (task.tur === "sinf") return `Eng kichik masofa — ${task.masofa}.`;
    if (task.tur === "chalkash") return task.nega;
    return task.hisob + ".";
  }

  QK.common = { box, note, answer, savol, rasm, yozuvli, sonlar, maydon, karta, kartalar, belgi, matritsa, royxat, run, praise };
})(window);

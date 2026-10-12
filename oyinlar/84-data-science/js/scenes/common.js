// «Data science»: shu oʻyinga xos ekran qismlari (jadval, ish kartasi) va mashq ekranlari.
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
  const savol = (text) => h("div", { class: "ds-savol", text });
  // Nomlash paneli: atama va qisqa taʼrif satrlari
  const formula = (lines) => h("div", { class: "ds-formula" }, ...lines.map((t) => h("div", { text: t })));

  // ---------- Jadval ----------
  // ustunlar: [{ nom }], qatorlar: [[qiymat…]]. raqam — chapda № ustuni.
  // onKatak(q, u, el), onQator(q, el), onUstun(u, el) berilsa — oʻsha joylar bosiladigan tugma boʻladi.
  // Jadval oʻz konteynerida gorizontal aylanadi (360 px da sahifa aylanmaydi).
  function jadval(o) {
    const kataklar = [];
    const qatorEl = [];
    const raqamEl = [];
    const sarlavhaEl = [];
    const tugma = (cls, text, label, onClick) => {
      const b = h("button", { class: cls, type: "button", text, "aria-label": label, "aria-pressed": "false" });
      b.addEventListener("click", () => { QK.sound.play("tap"); onClick(b); });
      return b;
    };
    const bosh = h("tr", null);
    if (o.raqam) bosh.append(h("th", { class: "ds-raqam", text: "№", scope: "col" }));
    o.ustunlar.forEach((u, k) => {
      const th = h("th", { scope: "col" });
      if (o.onUstun) th.append(tugma("ds-tugma ds-sarlavha", u.nom, `${u.nom} ustuni`, (b) => o.onUstun(k, b)));
      else th.textContent = u.nom;
      sarlavhaEl.push(th);
      bosh.append(th);
    });
    const tana = h("tbody", null);
    o.qatorlar.forEach((qator, q) => {
      const tr = h("tr", null);
      if (o.raqam) {
        const th = h("th", { class: "ds-raqam", scope: "row" });
        if (o.onQator) th.append(tugma("ds-tugma", String(q + 1), `${q + 1}-qator`, (b) => o.onQator(q, b)));
        else th.textContent = String(q + 1);
        raqamEl.push(th);
        tr.append(th);
      }
      const qk = qator.map((v, u) => {
        const matn = L.korsat(v);
        const td = h("td", { class: typeof v === "number" ? "son" : "" });
        if (o.onKatak) td.append(tugma("ds-tugma", matn, `${q + 1}-qator, ${o.ustunlar[u].nom}: ${matn || "boʻsh"}`, (b) => o.onKatak(q, u, b)));
        else td.textContent = matn;
        tr.append(td);
        return td;
      });
      kataklar.push(qk);
      qatorEl.push(tr);
      tana.append(tr);
    });
    const table = h("table", { class: "ds-jadval" }, h("thead", null, bosh), tana);
    const el = h("div", { class: "ds-jadval-quti" },
      o.nom ? h("div", { class: "ds-jadval-nom", text: o.nom }) : null,
      h("div", { class: "ds-jadval-wrap", tabindex: "0", role: "group", "aria-label": o.nom || "Jadval" }, table));
    return {
      el,
      katak: (q, u) => kataklar[q][u],
      qator: (q) => qatorEl[q],
      raqam: (q) => raqamEl[q],
      ustun: (u) => [sarlavhaEl[u], ...kataklar.map((qk) => qk[u])],
      // Hamma tugmani oʻchirish (yechim koʻrsatilganda)
      qulfla() { el.querySelectorAll("button").forEach((b) => { b.disabled = true; }); },
    };
  }

  // Xatoni jadvalda koʻrsatish: katak yoki butun qator
  function xatoBelgila(j, x, cls) {
    if (x.tur === "takror") j.qator(x.q).classList.add(cls || "xato");
    else j.katak(x.q, x.u).classList.add(cls || "xato");
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
        ui.control().append(h("div", { class: "ds-javoblar" + (o.qisqa ? " qisqa" : "") },
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

  const oddiyJadval = (task) => jadval({ nom: task.jadvalNomi, ustunlar: task.ustunlar, qatorlar: task.qatorlar });

  const qadamExercise = (task) => tanlovExercise(task, {
    qisqa: true,
    oldin: (host) => host.append(h("div", { class: "ds-ish" },
      h("div", { class: "ds-ish-mavzu", text: "Loyiha: " + task.loyiha }),
      h("div", { class: "ds-ish-matn", text: task.ish }))),
  });

  const savolExercise = (task) => tanlovExercise(task, {
    oldin: (host) => { if (task.savol) host.append(h("div", { class: "ds-ish" }, h("div", { class: "ds-ish-matn", text: task.savol }))); },
  });

  const turExercise = (task) => tanlovExercise(task, { qisqa: true, oldin: (host) => host.append(oddiyJadval(task).el) });

  const jadvalExercise = (task) => sonExercise(task, { oldin: (host) => host.append(oddiyJadval(task).el) });

  // Bitta xato belgilab qoʻyilgan jadval — turini yoki tuzatish usulini tanlash
  const turiExercise = (task) => tanlovExercise(task, {
    oldin: (host) => {
      const j = jadval({ nom: task.jadvalNomi, ustunlar: task.ustunlar, qatorlar: task.qatorlar, raqam: true });
      xatoBelgila(j, task.xato, "belgi");
      host.append(j.el);
    },
  });

  // Jadvaldagi hamma xatoni belgilash: katakni yoki qator raqamini bosish — belgilaydi, yana bosish — bekor qiladi
  function tozalashExercise(task) {
    const tanlov = new Set();
    let host = null;
    let j = null;
    let eslatma = null;
    const almash = (kalit, tugma, el) => {
      const bor = tanlov.has(kalit);
      if (bor) tanlov.delete(kalit); else tanlov.add(kalit);
      tugma.setAttribute("aria-pressed", bor ? "false" : "true");
      el.classList.toggle("tanlangan", !bor);
    };
    const yoz = (text) => {
      if (eslatma) eslatma.remove();
      eslatma = note(text);
      host.append(eslatma);
    };
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(savol(task.matn));
        j = jadval({
          nom: task.jadvalNomi, ustunlar: task.ustunlar, qatorlar: task.qatorlar, raqam: true,
          onKatak: (q, u, b) => almash(`k:${q}:${u}`, b, j.katak(q, u)),
          onQator: (q, b) => almash(`q:${q}`, b, j.qator(q)),
        });
        host.append(j.el);
        ui.control().append(ui.button("Tekshirish", () => {
          if (!tanlov.size) { ui.toast("Avval xato joyni belgila."); return; }
          submit([...tanlov]);
        }, "wide"));
      },
      check: (belgilar) => L.tekshir(task, belgilar).ok,
      hint(belgilar) {
        const n = L.tekshir(task, belgilar);
        const holat = `↻ ${n.jami} tadan ${n.topildi} tasi toʻgʻri belgilangan` + (n.ortiqcha ? `, ${n.ortiqcha} ta belgi ortiqcha. ` : ". ");
        yoz(holat + (n.ikkalasi ? "Takror qatorlardan faqat bittasi ortiqcha — ikkalasini oʻchirsang, obyekt yoʻqoladi." : task.ishora));
      },
      solution() {
        if (eslatma) eslatma.remove();
        j.qulfla();
        host.querySelectorAll(".tanlangan").forEach((el) => el.classList.remove("tanlangan"));
        task.xatolar.forEach((x) => xatoBelgila(j, x, "xato"));
        host.append(h("ul", { class: "ds-izohlar" }, ...task.izohlar.map((t) => h("li", { text: t }))));
      },
    });
  }

  const EKRAN = {
    qadam: qadamExercise, savol: savolExercise, tur: turExercise, jadval: jadvalExercise,
    tozalash: tozalashExercise, turi: turiExercise,
  };
  const run = (task) => EKRAN[task.tur](task);

  // Toʻgʻri javobdan keyingi qisqa tasdiq (kattalar koʻrinishida ~1 soniya turadi)
  const praise = (task) => task.qisqa;

  QK.common = { box, note, answer, savol, formula, jadval, xatoBelgila, sonExercise, tanlovExercise, run, praise };
})(window);

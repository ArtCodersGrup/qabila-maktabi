// 58-o'yin: shu o'yinga xos ekran qismlari (xabar qatori, konvert) va mashq ekranlari.
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
    ui.paper("");
    const el = h("div", { class: "pbox" });
    ui.work().append(el);
    return el;
  }

  const note = (text) => h("div", { class: "note", text });
  const answer = (text) => h("div", { class: "answer", text });

  // ---------- Qismlar ----------
  // Xabar: har belgi alohida katakda (bo'sh joy — ␣), ranglar navbat bilan
  function xabarQator(xabar, opts) {
    const o = opts || {};
    return h("div", { class: "xb-xabar" + (o.kichik ? " kichik" : "") },
      ...L.belgilar(xabar).map((ch, k) => h("span", { class: "xb-belgi r" + (Math.floor(k / (o.k || 99)) % 4) + (ch === " " ? " bosh" : ""), text: ch === " " ? "␣" : ch })));
  }

  // Konvert: burchakda "3/5", ichida bo'lakning belgilari (matn bo'lmasa — faqat raqam)
  function konvert(x, opts) {
    const o = opts || {};
    const el = h(o.tugma ? "button" : "div", {
      class: "xb-konvert" + (o.kichik ? " kichik" : "") + (o.holat ? " " + o.holat : ""),
      type: o.tugma ? "button" : null,
      "aria-label": `${x.raqam}-konvert, jami ${x.jami}` + (x.matn ? `: ${x.matn}` : ""),
    }, h("span", { class: "xb-raqam", text: `${x.raqam}/${x.jami}` }));
    if (x.matn != null) {
      el.append(h("span", { class: "xb-ichi" },
        ...L.belgilar(x.matn).map((ch) => h("span", { class: "xb-harf" + (ch === " " ? " bosh" : ""), text: ch === " " ? "␣" : ch }))));
    }
    if (o.manzil) el.append(h("span", { class: "xb-manzil", text: "Kimga: " + o.manzil }));
    return el;
  }

  // Yo'q konvert o'rni: uzuq chiziqli "?"
  const boshJoy = () => h("div", { class: "xb-konvert kichik yoq", "aria-label": "Yetib kelmagan konvert" }, h("span", { class: "xb-raqam", text: "?" }));

  const qator = (...kids) => h("div", { class: "xb-qator" }, ...kids);

  // Faqat raqamli konvertlar (3-bosqich): keldi — raqamlar ro'yxati
  const raqamlar = (keldi, jami) => qator(...keldi.map((raqam) => konvert({ raqam, jami }, { kichik: true })));

  // ---------- Mashq ekranlari ----------
  function sonExercise(task, opts) {
    const o = opts || {};
    const host = box(true);
    if (o.oldin) o.oldin(host);
    host.append(h("div", { class: "xb-savol", text: task.matn }));
    const javob = Number(task.javob);
    return practice.numberTries({
      answer: javob,
      maxLen: String(javob).length + 1,
      hint() { host.append(note("↻ " + task.nega)); },
      solution() {
        host.append(answer(task.hisob));
        if (o.yechim) o.yechim(host);
      },
    });
  }

  // Variantlardan tanlash; o.tugmaYasa(v, submit) — o'z tugmasi (masalan, konvert)
  function tanlovExercise(task, opts) {
    const o = opts || {};
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        if (o.oldin) o.oldin(host);
        host.append(h("div", { class: "xb-savol", text: task.matn }));
        const tugmalar = task.variantlar.map((v) => (o.tugmaYasa ? o.tugmaYasa(v, submit) : ui.button(String(v), () => submit(v), "wide")));
        ui.control().append(h("div", { class: "xb-javoblar" + (o.tugmaYasa ? " konvertlar" : "") }, ...tugmalar));
      },
      check: (value) => value === task.javob,
      // Maslahat javobni aytmaydi — usulni eslatadi
      hint() { host.append(note("↻ " + (task.ishora || task.nega))); },
      solution() {
        host.append(answer(String(task.javob)));
        if (o.yechim) o.yechim(host);
        host.append(note(task.nega));
      },
    });
  }

  // ---------- Har bir savol turi uchun ekran ----------
  const nechtaExercise = (task) => sonExercise(task, {
    oldin: (host) => host.append(xabarQator(task.xabar)),
    yechim: (host) => host.append(qator(...L.konvertlar(task.xabar, task.k).map((x) => konvert(x, { kichik: true })))),
  });

  const ichidaExercise = (task) => tanlovExercise(task, {
    oldin: (host) => host.append(xabarQator(task.xabar, { k: task.k })),
    yechim: (host) => host.append(qator(...L.konvertlar(task.xabar, task.k).map((x) => konvert(x, { kichik: true, holat: x.raqam === task.n ? "tanlangan" : "" })))),
  });

  const oqishExercise = (task) => tanlovExercise(task, {
    oldin: (host) => host.append(qator(...task.keldi.map((x) => konvert(x, { kichik: true })))),
    yechim: (host) => host.append(qator(...task.keldi.slice().sort((a, b) => a.raqam - b.raqam).map((x) => konvert(x, { kichik: true })))),
  });

  // Javob — konvertning o'zini bosish
  const nechanchiExercise = (task) => tanlovExercise(task, {
    tugmaYasa: (raqam, submit) => {
      const x = task.keldi.find((k) => k.raqam === raqam);
      const b = konvert(x, { tugma: true, kichik: true });
      b.addEventListener("click", () => submit(raqam));
      return b;
    },
  });

  const yoqExercise = (task) => sonExercise(task, {
    oldin: (host) => host.append(raqamlar(task.keldi, task.jami)),
  });

  const holatExercise = (task) => tanlovExercise(task, {
    oldin: (host) => host.append(raqamlar(task.keldi, task.jami)),
    yechim: (host) => host.append(raqamlar(task.keldi.slice().sort((a, b) => a - b), task.jami)),
  });

  const qaytaExercise = (task) => sonExercise(task, {
    oldin: (host) => host.append(raqamlar(task.keldi, task.jami)),
    yechim: (host) => host.append(note(task.nega)),
  });

  const EKRAN = {
    nechta: nechtaExercise, ichida: ichidaExercise, oqish: oqishExercise, nechanchi: nechanchiExercise,
    yoq: yoqExercise, holat: holatExercise, qayta: qaytaExercise,
  };
  const run = (task) => EKRAN[task.tur](task);

  // Mashq tugagach aytiladigan maqtov
  function praise(task) {
    if (task.tur === "nechta") return task.hisob + ".";
    if (task.tur === "oqish") return "Raqam boʻyicha yigʻding.";
    if (task.tur === "yoq" || task.tur === "qayta") return task.hisob;
    return task.nega;
  }

  QK.common = { box, note, answer, xabarQator, konvert, boshJoy, qator, raqamlar, sonExercise, tanlovExercise, run, praise };
})(window);

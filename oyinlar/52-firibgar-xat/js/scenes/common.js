// 52-o'yin: ekran qismlari (xat kartasi, belgi kartasi, manzil satri, uch xil mashq).
(function (root) {
  "use strict";

  const QK = root.QK;
  const { ui, logic: L, practice } = QK;
  const h = ui.h;

  // Ish maydonini tozalab, bitta ustun ochadi
  function box(compact) {
    ui.setCompact(compact !== false);
    ui.clearWork();
    ui.clearControl();
    ui.paper("");
    const el = h("div", { class: "fx-box" });
    ui.work().append(el);
    return el;
  }

  const note = (text) => h("div", { class: "fx-note", text });
  const answer = (text) => h("div", { class: "fx-answer", text });
  const savol = (text) => h("div", { class: "fx-savol", text });

  // Manzil: hal qiluvchi qism (zonadan oldingi nom va zona) ajratib koʻrsatiladi
  function manzilSatr(xom, cls) {
    const a = L.ajrat(xom);
    const kalit = a.nom && a.zona ? a.nom + "." + a.zona : "";
    const joy = kalit ? String(xom).lastIndexOf(kalit) : -1;
    if (joy < 0) return h("span", { class: "fx-manzil " + (cls || ""), text: String(xom) });
    return h("span", { class: "fx-manzil " + (cls || "") },
      h("span", { class: "fx-xira", text: String(xom).slice(0, joy) }),
      h("b", { class: "fx-nom", text: a.nom }),
      h("span", { class: "fx-zona", text: "." + a.zona }),
      h("span", { class: "fx-xira", text: String(xom).slice(joy + kalit.length) }));
  }

  // Xat kartasi: kimdan, manzil, sarlavha, matn, havola. Havola hech qachon bosiladigan emas.
  function xabarKarta(x) {
    const el = h("div", { class: "fx-xat" });
    el.append(h("div", { class: "fx-qator" },
      h("span", { class: "fx-yorliq", text: "Kimdan" }),
      h("span", { class: "fx-kimdan", text: x.kimdan })));
    el.append(h("div", { class: "fx-qator" },
      h("span", { class: "fx-yorliq", text: "Manzil" }),
      manzilSatr(x.manzil)));
    el.append(h("div", { class: "fx-sarlavha", text: x.sarlavha }));
    el.append(h("div", { class: "fx-matn", text: x.matn }));
    if (x.havola) {
      el.append(h("div", { class: "fx-qator" },
        h("span", { class: "fx-yorliq", text: "Havola" }),
        manzilSatr(x.havola)));
    }
    return el;
  }

  // Bitta belgi kartasi: nomi, izohi va misoli
  function belgiKarta(b, opts) {
    const o = opts || {};
    const el = h("div", { class: "fx-belgi" });
    el.append(h("div", { class: "fx-belgi-nom", text: b.nom }));
    el.append(h("div", { class: "fx-belgi-izoh", text: b.izoh }));
    if (o.misol !== false) el.append(h("div", { class: "fx-quote", text: "«" + b.misol + "»" }));
    return el;
  }

  const belgiTaxta = (idlar, opts) => h("div", { class: "fx-taxta" }, ...idlar.map((id) => belgiKarta(L.belgi(id), opts)));

  // Xatda topilgan belgilar roʻyxati
  const belgiRoyxat = (belgilar) => h("div", { class: "fx-topilgan" },
    ...belgilar.map((b) => h("span", { class: "fx-chip" }, h("b", { text: "• " }), h("span", { text: b.nom }))));

  // Uzun javob tugmalari — ustun boʻlib joylashadi
  const tanlovlar = (variantlar, submit) => variantlar.map((v) => ui.button(v, () => submit(v), "fx-wide"));

  // ---------- 1-bosqich: qaysi belgi ----------
  function belgiExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(h("div", { class: "fx-quote katta", text: "«" + task.misol + "»" }));
        host.append(savol(task.matn));
        ui.control().append(...tanlovlar(task.variantlar, submit));
      },
      check: (value) => value === task.javob,
      hint() { host.append(note("↻ Gap nimaga undayapti: shoshiltirishga, qoʻrqitishga, biror narsa soʻrashga yoki yashirishga?")); },
      solution() {
        host.append(answer("Toʻgʻri javob: " + task.javob));
        host.append(belgiKarta(task.belgi, { misol: false }));
      },
    });
  }

  // ---------- 2-bosqich: xatni tekshir ----------
  function xabarExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(xabarKarta(task.xabar));
        host.append(savol(task.matn));
        ui.control().append(h("div", { class: "choice-row" }, ...task.variantlar.map((v) =>
          ui.button(v, () => submit(v), "big"))));
      },
      check: (value) => value === task.javob,
      hint() {
        host.append(note("↻ Avval manzilni tekshir: zonadan oldingi nom toʻgʻrimi? Keyin matnni oʻqi: parol soʻralgan, shoshiltirgan yoki sir tutish talab qilingan joy bormi?"));
      },
      solution() {
        host.append(answer(task.javob === L.JAVOB.soxta ? "Toʻgʻri javob: firibgar xat" : "Toʻgʻri javob: haqiqiy xat"));
        if (task.belgilar.length) host.append(belgiRoyxat(task.belgilar));
        if (task.manzil.xil) {
          host.append(note(task.manzil.izoh + (task.manzil.kutilgan ? " Haqiqiy manzil: " + task.manzil.kutilgan : "")));
        } else if (task.xabar.soxta) {
          // Muhim holat: manzil toʻgʻri, lekin xat soxta — javobni matndan topish kerak
          host.append(note("Manzil toʻgʻri, lekin xat soxta. " + task.nega));
        } else {
          host.append(note(task.nega));
        }
      },
    });
  }

  // ---------- 3-bosqich: nima qilaman ----------
  function vaziyatExercise(task) {
    let host = null;
    return practice.tries({
      setup(submit) {
        host = box(true);
        host.append(h("div", { class: "fx-vaziyat", text: task.matn }));
        host.append(savol("Qaysi harakat toʻgʻri?"));
        ui.control().append(...tanlovlar(task.variantlar, submit));
      },
      check: (value) => value === task.javob,
      hint() { host.append(note("↻ Oʻyla: havolani bosmaslik, rasmiy ilovadan tekshirish, kattalarga aytish — shu uchtasidan qaysi biri mos?")); },
      solution() {
        host.append(answer("Toʻgʻri javob: " + task.javob));
        host.append(note(task.nega));
      },
    });
  }

  QK.common = { box, note, answer, savol, manzilSatr, xabarKarta, belgiKarta, belgiTaxta, belgiRoyxat,
    belgiExercise, xabarExercise, vaziyatExercise };
})(window);
